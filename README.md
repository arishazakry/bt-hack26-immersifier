# XR Learning Sandbox — MVP

A browser-based WebXR chemistry lab with an AI coach powered by OpenAI.

---

## Project Structure

```
xr-learning-sandbox/
├── backend/          # Python Flask API
│   ├── app.py        # Main server — scenario logic + OpenAI coach
│   ├── requirements.txt
│   └── .env.example  # Copy to .env and add your API key
└── frontend/         # React + A-Frame WebXR
    ├── src/
    │   ├── App.js              # Main orchestrator
    │   ├── hooks/useLabAPI.js  # API communication
    │   └── components/
    │       ├── LabScene.jsx    # A-Frame 3D lab
    │       ├── StepPanel.jsx   # Current task UI
    │       ├── CoachPanel.jsx  # AI hints + "Why?" button
    │       ├── DebriefScreen.jsx # End-of-session report
    │       └── IntroScreen.jsx # Landing screen
    └── public/index.html       # A-Frame CDN loaded here
```

---

## Prerequisites

- **Node.js** 18+ — [nodejs.org](https://nodejs.org)
- **Python** 3.10+ — comes with macOS, or use `brew install python`
- **OpenAI API key** — [platform.openai.com](https://platform.openai.com)

---

## 1. Get an OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / log in
3. Navigate to **API Keys** → **Create new secret key**
4. Copy the key (you only see it once)

---

## 2. Backend Setup

```bash
cd backend

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and replace "sk-your-key-here" with your real key

# Start the Flask server
python app.py
```

Flask will run at **http://localhost:5001**

---

## 3. Frontend Setup

Open a **new terminal tab**:

```bash
cd frontend

# Install dependencies
npm install

# Start the React dev server
npm start
```

React will open at **http://localhost:3000**

---

## 4. Using the App

1. Open **http://localhost:3000** in Chrome (best WebXR support)
2. Click **Enter Lab →**
3. Look around the lab bench and **click objects** to interact
4. The AI coach will appear when you make mistakes
5. Click **"Why this hint?"** to see the reasoning behind each hint
6. Complete all 5 steps to reach the debrief screen

### VR Mode
- Connect a Meta Quest via Link cable, or open in Quest Browser
- Click the VR headset icon in the bottom-right corner of the scene

---

## Scenario: Acid-Base Titration

| Step | Correct Action | Key Wrong Choices |
|------|---------------|-------------------|
| 1    | Wear PPE (goggles + gloves) | Skip PPE → acid splash warning |
| 2    | Fill burette with HCl | Fill with NaOH → wrong reagent error |
| 3    | Add phenolphthalein indicator | Skip indicator → can't see endpoint |
| 4    | Titrate slowly to endpoint | Over-titrate → start over; go too fast → warning |
| 5    | Record burette reading | Skip record → data lost |

---

## Architecture

```
React Frontend (port 3000)
    │
    ├── A-Frame Scene    → 3D lab, click interactions
    ├── StepPanel        → Current task display
    ├── CoachPanel       → AI hints with "Why?" button
    └── DebriefScreen    → Score + AI-generated summary
         │
         │  HTTP (via proxy)
         ▼
Flask Backend (port 5001)
    │
    ├── /api/scenario    → Returns scenario + first step
    ├── /api/action      → Validates action, returns hint via OpenAI
    └── /api/debrief     → Generates personalised debrief via OpenAI
         │
         ▼
    OpenAI gpt-4o-mini
    (coaching + debrief generation)
```

### Key design decisions

- **Rule-based simulation**: Consequences are deterministic, not AI-generated. This ensures demo reliability.
- **AI for coaching only**: OpenAI generates hints and debrief text, not game logic. If the API is down, rule-based fallback hints activate automatically.
- **Adaptive hints**: The coach adjusts hint style based on how many mistakes the student has made (Socratic → procedural → direct).
- **Transparent AI**: Every hint includes a "Why this hint?" explanation so students understand the coaching reasoning.

---

## For the Hackathon Demo

Run the experiment **twice**:

**Run 1 — Correct path:**
PPE → HCl → Phenolphthalein → Titrate slowly → Record

**Run 2 — Wrong path (to show AI coach):**
Skip PPE → try to fill with NaOH → skip indicator → over-titrate

Point out the **"Why this hint?"** button during the demo — judges evaluating AI transparency will appreciate it.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI secret key |
| `REACT_APP_API_URL` | Backend URL (default: http://localhost:5001) |

---

## Deployment (post-hackathon)

- **Backend**: Deploy to [Render](https://render.com) or [Railway](https://railway.app) (free tier available)
- **Frontend**: Deploy to [Vercel](https://vercel.com) — set `REACT_APP_API_URL` env var to your backend URL
