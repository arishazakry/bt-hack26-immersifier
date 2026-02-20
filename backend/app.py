from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from openai import OpenAI

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "your-api-key-here"))

# ---------------------------------------------------------------------------
# SCENARIO GRAPH
# ---------------------------------------------------------------------------
# Each step has: id, description, required_action, correct_next,
#   wrong_choices (list of {action, consequence, hint_tag})
# ---------------------------------------------------------------------------
SCENARIO = {
    "title": "Acid-Base Titration",
    "description": "Determine the concentration of an unknown base using hydrochloric acid.",
    "steps": [
        {
            "id": "start",
            "description": "You are at the lab bench. Begin by putting on your personal protective equipment.",
            "required_action": "wear_ppe",
            "correct_next": "fill_burette",
            "wrong_choices": [
                {
                    "action": "skip_ppe",
                    "consequence": "⚠️ Acid splashes on your hand — always wear gloves and goggles first!",
                    "hint_tag": "safety_ppe",
                    "severity": "warning"
                }
            ]
        },
        {
            "id": "fill_burette",
            "description": "PPE on ✓. Now fill the burette with the HCl solution (0.1 M).",
            "required_action": "fill_burette_hcl",
            "correct_next": "add_indicator",
            "wrong_choices": [
                {
                    "action": "fill_burette_naoh",
                    "consequence": "❌ You filled the burette with NaOH — the titrant should be the acid (HCl).",
                    "hint_tag": "wrong_reagent",
                    "severity": "mistake"
                },
                {
                    "action": "skip_fill",
                    "consequence": "❌ The burette is empty. You can't titrate without a titrant!",
                    "hint_tag": "missing_step",
                    "severity": "mistake"
                }
            ]
        },
        {
            "id": "add_indicator",
            "description": "Burette filled ✓. Add 3 drops of phenolphthalein indicator to the flask of NaOH.",
            "required_action": "add_phenolphthalein",
            "correct_next": "titrate",
            "wrong_choices": [
                {
                    "action": "add_litmus",
                    "consequence": "⚠️ Litmus works, but phenolphthalein gives a sharper endpoint for this titration.",
                    "hint_tag": "suboptimal_indicator",
                    "severity": "warning"
                },
                {
                    "action": "skip_indicator",
                    "consequence": "❌ Without an indicator you won't see the endpoint. Add indicator first.",
                    "hint_tag": "missing_indicator",
                    "severity": "mistake"
                }
            ]
        },
        {
            "id": "titrate",
            "description": "Flask is pink ✓. Slowly add HCl from the burette until the pink colour just disappears (endpoint).",
            "required_action": "titrate_correct",
            "correct_next": "record",
            "wrong_choices": [
                {
                    "action": "overtitrate",
                    "consequence": "❌ You went past the endpoint — the solution is now colourless AND acidic. Start over.",
                    "hint_tag": "overtitration",
                    "severity": "mistake"
                },
                {
                    "action": "titrate_fast",
                    "consequence": "⚠️ Adding too fast makes it hard to catch the exact endpoint. Slow down near the end.",
                    "hint_tag": "titration_speed",
                    "severity": "warning"
                }
            ]
        },
        {
            "id": "record",
            "description": "Endpoint reached ✓. Record the final burette reading.",
            "required_action": "record_reading",
            "correct_next": "complete",
            "wrong_choices": [
                {
                    "action": "skip_record",
                    "consequence": "❌ You forgot to record the burette reading — your result is lost!",
                    "hint_tag": "missing_record",
                    "severity": "mistake"
                }
            ]
        }
    ]
}

# In-memory session log (resets on server restart — fine for hackathon)
sessions = {}


@app.route("/api/scenario", methods=["GET"])
def get_scenario():
    """Return scenario metadata and first step."""
    first_step = SCENARIO["steps"][0]
    return jsonify({
        "title": SCENARIO["title"],
        "description": SCENARIO["description"],
        "total_steps": len(SCENARIO["steps"]),
        "first_step": first_step
    })


@app.route("/api/action", methods=["POST"])
def handle_action():
    """
    Receive a student action and return the consequence + next step.
    Body: { session_id, step_id, action }
    """
    data = request.json
    session_id = data.get("session_id", "default")
    step_id = data.get("step_id")
    action = data.get("action")

    # Find current step
    step = next((s for s in SCENARIO["steps"] if s["id"] == step_id), None)
    if not step:
        return jsonify({"error": "Unknown step"}), 400

    # Init session
    if session_id not in sessions:
        sessions[session_id] = {"actions": [], "mistakes": 0, "warnings": 0}

    sessions[session_id]["actions"].append({"step": step_id, "action": action})

    # Check if correct
    if action == step["required_action"]:
        next_step_id = step["correct_next"]
        next_step = next((s for s in SCENARIO["steps"] if s["id"] == next_step_id), None)
        return jsonify({
            "correct": True,
            "message": "✓ Good work! Move to the next step.",
            "next_step": next_step,
            "complete": next_step_id == "complete"
        })

    # Check wrong choices
    wrong = next((w for w in step["wrong_choices"] if w["action"] == action), None)
    if wrong:
        if wrong["severity"] == "mistake":
            sessions[session_id]["mistakes"] += 1
        else:
            sessions[session_id]["warnings"] += 1

        hint = get_hint(wrong["hint_tag"], step["description"], wrong["consequence"], sessions[session_id])
        return jsonify({
            "correct": False,
            "consequence": wrong["consequence"],
            "severity": wrong["severity"],
            "hint": hint["text"],
            "hint_reason": hint["reason"],
            "stay_on_step": True,
            "current_step": step
        })

    return jsonify({"error": "Unknown action"}), 400


@app.route("/api/debrief", methods=["POST"])
def get_debrief():
    """Generate a personalised debrief using OpenAI."""
    data = request.json
    session_id = data.get("session_id", "default")
    session = sessions.get(session_id, {"actions": [], "mistakes": 0, "warnings": 0})

    debrief = generate_debrief(session)
    return jsonify(debrief)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


# ---------------------------------------------------------------------------
# AI HELPERS
# ---------------------------------------------------------------------------

HINT_PROMPTS = {
    "safety_ppe": "The student skipped putting on PPE before handling acid.",
    "wrong_reagent": "The student put the wrong reagent (NaOH) in the burette instead of HCl.",
    "missing_step": "The student tried to proceed without filling the burette.",
    "suboptimal_indicator": "The student chose litmus instead of phenolphthalein for an acid-base titration.",
    "missing_indicator": "The student skipped adding an indicator to the flask.",
    "overtitration": "The student added too much HCl and went past the endpoint.",
    "titration_speed": "The student added the titrant too quickly near the endpoint.",
    "missing_record": "The student forgot to record the burette reading after reaching the endpoint."
}


def get_hint(hint_tag, step_description, consequence, session):
    """Call OpenAI to generate an adaptive Socratic hint."""
    mistake_count = session.get("mistakes", 0)
    context = HINT_PROMPTS.get(hint_tag, "The student made an error.")

    # Adapt hint style based on how many mistakes they've made
    if mistake_count <= 1:
        style = "Ask a single Socratic question that guides them to discover the issue themselves. Do not reveal the answer."
    elif mistake_count <= 3:
        style = "Give a brief procedural hint that points toward the correct action without fully revealing it."
    else:
        style = "Give a clear, direct explanation of what they should do and why, since they have struggled multiple times."

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a supportive chemistry lab coach for students learning titration. "
                        "You are encouraging, never condescending. Keep responses under 2 sentences. "
                        "Never repeat the consequence they already saw."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"Situation: {context}\n"
                        f"Current step: {step_description}\n"
                        f"Mistakes so far this session: {mistake_count}\n"
                        f"Style instruction: {style}\n\n"
                        f"Give the hint text only, no preamble."
                    )
                }
            ],
            max_tokens=120,
            temperature=0.7
        )
        hint_text = response.choices[0].message.content.strip()
    except Exception as e:
        # Fallback hints if API is unavailable
        fallback_hints = {
            "safety_ppe": "What should you always do before handling any chemical?",
            "wrong_reagent": "Which chemical should go in the burette — the one with known or unknown concentration?",
            "missing_step": "What needs to be in the burette before you can start adding to the flask?",
            "suboptimal_indicator": "What colour change would tell you most clearly that you've reached the endpoint?",
            "missing_indicator": "How will you know when to stop adding acid if you can't see a colour change?",
            "overtitration": "Try adding drops one at a time and swirling — what are you looking for to stop?",
            "titration_speed": "Near the endpoint, why might it help to add the titrant drop by drop?",
            "missing_record": "What data do you need to calculate the concentration of the unknown solution?"
        }
        hint_text = fallback_hints.get(hint_tag, "Think carefully about the correct procedure for this step.")

    reason = f"This hint was given because: {context.lower()}"
    return {"text": hint_text, "reason": reason}


def generate_debrief(session):
    """Generate a personalised end-of-session debrief."""
    actions = session.get("actions", [])
    mistakes = session.get("mistakes", 0)
    warnings = session.get("warnings", 0)
    total_steps = len(SCENARIO["steps"])
    completed = len([a for a in actions if a["action"] in
                     [s["required_action"] for s in SCENARIO["steps"]]])

    score = max(0, 100 - (mistakes * 15) - (warnings * 5))
    action_summary = json.dumps(actions, indent=2)

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a chemistry lab instructor writing a personalised end-of-session debrief. "
                        "Be encouraging but honest. Focus on process, not just outcome. "
                        "Keep the total response under 4 sentences."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"Student completed an acid-base titration simulation.\n"
                        f"Steps completed correctly: {completed}/{total_steps}\n"
                        f"Critical mistakes: {mistakes}\n"
                        f"Minor warnings: {warnings}\n"
                        f"Action log: {action_summary}\n\n"
                        f"Write a personalised debrief that acknowledges what they did well, "
                        f"identifies the main area to improve, and ends with encouragement."
                    )
                }
            ],
            max_tokens=200,
            temperature=0.7
        )
        summary = response.choices[0].message.content.strip()
    except Exception:
        summary = (
            f"You completed {completed} of {total_steps} steps correctly. "
            f"You made {mistakes} critical mistake(s) and received {warnings} warning(s). "
            "Review the safety and measurement steps and try again — you're making progress!"
        )

    return {
        "score": score,
        "completed_steps": completed,
        "total_steps": total_steps,
        "mistakes": mistakes,
        "warnings": warnings,
        "summary": summary,
        "actions": actions
    }


if __name__ == "__main__":
    app.run(debug=True, port=5001)
