import React from 'react';

const styles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(4,8,12,0.96)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    backdropFilter: 'blur(16px)',
  },
  card: {
    width: 560,
    maxWidth: 'calc(100vw - 48px)',
    background: '#0e1520',
    border: '1px solid #1e2d42',
    borderTop: '3px solid #00e5ff',
    borderRadius: 8,
    padding: '40px 44px',
  },
  eyebrow: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: 4,
    color: '#00e5ff',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 32,
    color: '#e8f4f8',
    marginBottom: 28,
    lineHeight: 1.1,
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 24,
    marginBottom: 28,
    paddingBottom: 24,
    borderBottom: '1px solid #1e2d42',
  },
  scoreBlock: {
    textAlign: 'center',
  },
  scoreNum: (color) => ({
    fontFamily: "'Space Mono', monospace",
    fontWeight: 700,
    fontSize: 42,
    color: color,
    lineHeight: 1,
  }),
  scoreLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    letterSpacing: 2,
    color: '#455a64',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 56,
    background: '#1e2d42',
  },
  summaryLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    letterSpacing: 3,
    color: '#546e7a',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  summary: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 14,
    color: '#90a4ae',
    lineHeight: 1.7,
    marginBottom: 32,
  },
  actionRow: {
    display: 'flex',
    gap: 12,
  },
  btnPrimary: {
    flex: 1,
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#080c10',
    background: '#00e5ff',
    border: 'none',
    borderRadius: 4,
    padding: '14px 0',
    cursor: 'pointer',
    fontWeight: 700,
  },
  btnSecondary: {
    flex: 1,
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#00e5ff',
    background: 'transparent',
    border: '1px solid #00e5ff',
    borderRadius: 4,
    padding: '14px 0',
    cursor: 'pointer',
  },
  actionLog: {
    marginTop: 24,
    paddingTop: 20,
    borderTop: '1px solid #1e2d42',
  },
  logTitle: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    letterSpacing: 3,
    color: '#455a64',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  logItem: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: '#546e7a',
    padding: '4px 0',
    borderBottom: '1px solid #0e1520',
  }
};

function scoreColor(score) {
  if (score >= 80) return '#00e676';
  if (score >= 50) return '#ffb300';
  return '#ff1744';
}

export default function DebriefScreen({ debrief, onRetry }) {
  if (!debrief) return null;

  const { score, completed_steps, total_steps, mistakes, warnings, summary, actions } = debrief;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.eyebrow}>Session Complete</div>
        <div style={styles.title}>Lab Debrief</div>

        {/* Score row */}
        <div style={styles.scoreRow}>
          <div style={styles.scoreBlock}>
            <div style={styles.scoreNum(scoreColor(score))}>{score}</div>
            <div style={styles.scoreLabel}>Score</div>
          </div>
          <div style={styles.divider} />
          <div style={styles.scoreBlock}>
            <div style={styles.scoreNum('#e8f4f8')}>{completed_steps}/{total_steps}</div>
            <div style={styles.scoreLabel}>Steps</div>
          </div>
          <div style={styles.divider} />
          <div style={styles.scoreBlock}>
            <div style={styles.scoreNum('#ff1744')}>{mistakes}</div>
            <div style={styles.scoreLabel}>Mistakes</div>
          </div>
          <div style={styles.divider} />
          <div style={styles.scoreBlock}>
            <div style={styles.scoreNum('#ffb300')}>{warnings}</div>
            <div style={styles.scoreLabel}>Warnings</div>
          </div>
        </div>

        {/* AI summary */}
        <div style={styles.summaryLabel}>AI Coach Summary</div>
        <div style={styles.summary}>{summary}</div>

        {/* Buttons */}
        <div style={styles.actionRow}>
          <button style={styles.btnPrimary} onClick={onRetry}>
            Try Again
          </button>
          <button
            style={styles.btnSecondary}
            onClick={() => window.print()}
          >
            Save Report
          </button>
        </div>

        {/* Action log */}
        {actions && actions.length > 0 && (
          <div style={styles.actionLog}>
            <div style={styles.logTitle}>Action Log</div>
            {actions.map((a, i) => (
              <div key={i} style={styles.logItem}>
                {String(i + 1).padStart(2, '0')}. [{a.step}] → {a.action}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
