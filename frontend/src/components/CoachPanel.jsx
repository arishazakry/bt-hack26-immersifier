import React, { useState, useEffect } from 'react';

const styles = {
  container: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 480,
    maxWidth: 'calc(100vw - 48px)',
    pointerEvents: 'auto',
  },
  card: (severity) => ({
    background: severity === 'success'
      ? 'rgba(0,230,118,0.08)'
      : severity === 'warning'
      ? 'rgba(255,179,0,0.08)'
      : severity === 'mistake'
      ? 'rgba(255,23,68,0.08)'
      : 'rgba(0,229,255,0.08)',
    border: `1px solid ${
      severity === 'success' ? '#00e676'
      : severity === 'warning' ? '#ffb300'
      : severity === 'mistake' ? '#ff1744'
      : '#00e5ff'}`,
    borderRadius: 6,
    padding: '14px 16px',
    backdropFilter: 'blur(12px)',
    animation: 'slideUp 0.25s ease-out',
  }),
  consequence: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 13,
    color: '#e8f4f8',
    lineHeight: 1.55,
    marginBottom: 10,
  },
  hintBox: {
    background: 'rgba(0,229,255,0.05)',
    border: '1px solid #1e2d42',
    borderRadius: 4,
    padding: '10px 12px',
    marginBottom: 8,
  },
  hintLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    letterSpacing: 2,
    color: '#00e5ff',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  hintText: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 14,
    color: '#b2ebf2',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
  reasonBox: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid #1e2d42',
    borderRadius: 4,
    padding: '8px 12px',
    marginBottom: 8,
    animation: 'fadeIn 0.2s ease-out',
  },
  reasonText: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: '#546e7a',
    lineHeight: 1.5,
  },
  buttonRow: {
    display: 'flex',
    gap: 8,
    marginTop: 4,
  },
  whyBtn: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: 1,
    color: '#00e5ff',
    background: 'transparent',
    border: '1px solid #00e5ff',
    borderRadius: 3,
    padding: '5px 10px',
    cursor: 'pointer',
    textTransform: 'uppercase',
  },
  dismissBtn: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: 1,
    color: '#455a64',
    background: 'transparent',
    border: '1px solid #1e2d42',
    borderRadius: 3,
    padding: '5px 10px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    marginLeft: 'auto',
  }
};

export default function CoachPanel({ feedback, onDismiss }) {
  const [showReason, setShowReason] = useState(false);

  // Reset reason visibility when new feedback arrives
  useEffect(() => setShowReason(false), [feedback]);

  if (!feedback) return null;

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div style={styles.card(feedback.severity)}>
        {/* Consequence */}
        {feedback.consequence && (
          <div style={styles.consequence}>{feedback.consequence}</div>
        )}

        {/* Success message */}
        {feedback.correct && (
          <div style={{ ...styles.consequence, color: '#00e676' }}>
            ✓ {feedback.message}
          </div>
        )}

        {/* AI hint */}
        {feedback.hint && (
          <div style={styles.hintBox}>
            <div style={styles.hintLabel}>🤖 Lab Coach</div>
            <div style={styles.hintText}>{feedback.hint}</div>
          </div>
        )}

        {/* Why this hint */}
        {feedback.hint_reason && (
          <>
            {showReason && (
              <div style={styles.reasonBox}>
                <div style={styles.reasonText}>{feedback.hint_reason}</div>
              </div>
            )}
            <div style={styles.buttonRow}>
              <button
                style={styles.whyBtn}
                onClick={() => setShowReason(v => !v)}
              >
                {showReason ? 'Hide reason' : 'Why this hint?'}
              </button>
              <button style={styles.dismissBtn} onClick={onDismiss}>
                Dismiss
              </button>
            </div>
          </>
        )}

        {/* No hint (success) */}
        {!feedback.hint_reason && (
          <div style={styles.buttonRow}>
            <button style={styles.dismissBtn} onClick={onDismiss}>
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
