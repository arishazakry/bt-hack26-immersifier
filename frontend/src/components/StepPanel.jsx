import React from 'react';

const styles = {
  panel: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 320,
    background: 'rgba(8,12,16,0.92)',
    border: '1px solid #1e2d42',
    borderLeft: '3px solid #00e5ff',
    borderRadius: 4,
    padding: '18px 20px',
    pointerEvents: 'auto',
    backdropFilter: 'blur(8px)',
  },
  label: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: 3,
    color: '#00e5ff',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 18,
    color: '#e8f4f8',
    marginBottom: 10,
    lineHeight: 1.3,
  },
  description: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    color: '#90a4ae',
    lineHeight: 1.6,
    marginBottom: 14,
  },
  progressRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 14,
  },
  pip: (filled) => ({
    flex: 1,
    height: 3,
    borderRadius: 2,
    background: filled ? '#00e5ff' : '#1e2d42',
    transition: 'background 0.3s',
  }),
  actionHint: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: '#455a64',
    borderTop: '1px solid #1e2d42',
    paddingTop: 10,
  }
};

const STEP_ORDER = ['start', 'fill_burette', 'add_indicator', 'titrate', 'record'];

export default function StepPanel({ currentStep, totalSteps, completedCount }) {
  if (!currentStep) return null;

  const stepIndex = STEP_ORDER.indexOf(currentStep.id);

  return (
    <div style={styles.panel}>
      <div style={styles.label}>
        Step {completedCount + 1} of {totalSteps}
      </div>
      <div style={styles.title}>{currentStep.description}</div>

      {/* Progress pips */}
      <div style={styles.progressRow}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={styles.pip(i < completedCount)} />
        ))}
      </div>

      <div style={styles.actionHint}>
        CLICK objects on the bench to interact
      </div>
    </div>
  );
}
