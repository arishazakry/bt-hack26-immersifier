import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import LabScene      from './components/LabScene';
import StepPanel     from './components/StepPanel';
import CoachPanel    from './components/CoachPanel';
import DebriefScreen from './components/DebriefScreen';
import IntroScreen   from './components/IntroScreen';
import { useLabAPI } from './hooks/useLabAPI';

// App phases
const PHASE = { INTRO: 'intro', LAB: 'lab', DEBRIEF: 'debrief' };

const STEP_ORDER = ['start', 'fill_burette', 'add_indicator', 'titrate', 'record'];

export default function App() {
  const sessionId = useRef(uuidv4()).current;

  const [phase,          setPhase]         = useState(PHASE.INTRO);
  const [scenario,       setScenario]      = useState(null);
  const [currentStep,    setCurrentStep]   = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [feedback,       setFeedback]      = useState(null);
  const [debrief,        setDebrief]       = useState(null);

  const { fetchScenario, sendAction, fetchDebrief, loading, error } = useLabAPI(sessionId);

  // Load scenario on mount
  useEffect(() => {
    fetchScenario().then(data => {
      if (data) {
        setScenario(data);
        setCurrentStep(data.first_step);
      }
    });
  }, [fetchScenario]);

  const handleStart = useCallback(() => {
    setPhase(PHASE.LAB);
    setFeedback(null);
  }, []);

  const handleAction = useCallback(async (action) => {
    if (!currentStep) return;

    const result = await sendAction(currentStep.id, action);
    if (!result) return;

    if (result.correct) {
      if (result.complete) {
        // All steps done — fetch debrief
        setFeedback({ correct: true, message: result.message, severity: 'success' });
        setTimeout(async () => {
          const d = await fetchDebrief();
          setDebrief(d);
          setPhase(PHASE.DEBRIEF);
        }, 1200);
      } else {
        setFeedback({ correct: true, message: result.message, severity: 'success' });
        setCurrentStep(result.next_step);
        setCompletedCount(c => c + 1);
        // Auto-dismiss success after 1.5s
        setTimeout(() => setFeedback(null), 1500);
      }
    } else {
      // Wrong choice
      setFeedback({
        consequence:  result.consequence,
        hint:         result.hint,
        hint_reason:  result.hint_reason,
        severity:     result.severity,
        correct:      false
      });
      // Step stays the same
    }
  }, [currentStep, sendAction, fetchDebrief]);

  const handleRetry = useCallback(() => {
    setPhase(PHASE.INTRO);
    setCompletedCount(0);
    setFeedback(null);
    setDebrief(null);
    fetchScenario().then(data => {
      if (data) {
        setScenario(data);
        setCurrentStep(data.first_step);
      }
    });
    // Note: session ID stays the same — cumulative debrief across retries
    // For a truly fresh session you'd regenerate sessionId here
  }, [fetchScenario]);

  // Determine which action to highlight (the correct one for current step)
  const highlightAction = currentStep?.required_action || null;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* A-Frame scene always rendered in background */}
      {phase === PHASE.LAB && (
        <LabScene
          currentStep={currentStep}
          onAction={handleAction}
          highlightAction={highlightAction}
        />
      )}

      {/* React UI overlay */}
      <div id="ui-overlay">
        {phase === PHASE.INTRO && (
          <IntroScreen
            scenario={scenario}
            onStart={handleStart}
            error={error}
            loading={loading}
          />
        )}

        {phase === PHASE.LAB && (
          <>
            <StepPanel
              currentStep={currentStep}
              totalSteps={scenario?.total_steps || 5}
              completedCount={completedCount}
            />
            <CoachPanel
              feedback={feedback}
              onDismiss={() => setFeedback(null)}
            />
          </>
        )}

        {phase === PHASE.DEBRIEF && (
          <DebriefScreen
            debrief={debrief}
            onRetry={handleRetry}
          />
        )}
      </div>
    </div>
  );
}
