import React, { useEffect, useState } from 'react';

const styles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    background: '#080c10',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    gap: 0,
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  eyebrow: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    letterSpacing: 6,
    color: '#00e5ff',
    textTransform: 'uppercase',
    marginBottom: 16,
    opacity: 0.7,
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 52,
    color: '#e8f4f8',
    textAlign: 'center',
    lineHeight: 1.1,
    marginBottom: 8,
    maxWidth: 560,
  },
  subtitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 16,
    color: '#00e5ff',
    marginBottom: 40,
    opacity: 0.8,
  },
  desc: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    color: '#546e7a',
    textAlign: 'center',
    lineHeight: 1.8,
    maxWidth: 400,
    marginBottom: 48,
  },
  btn: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: '#080c10',
    background: '#00e5ff',
    border: 'none',
    borderRadius: 4,
    padding: '16px 48px',
    cursor: 'pointer',
    fontWeight: 700,
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  errorBox: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    color: '#ff1744',
    background: 'rgba(255,23,68,0.08)',
    border: '1px solid rgba(255,23,68,0.3)',
    borderRadius: 4,
    padding: '10px 16px',
    marginBottom: 24,
    maxWidth: 400,
    textAlign: 'center',
  }
};

export default function IntroScreen({ onStart, scenario, error, loading }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={styles.overlay}>
      <div style={styles.grid} />
      <div style={styles.eyebrow}>XR Learning Sandbox</div>
      <div style={styles.title}>
        {scenario?.title || 'Chemistry Lab'}
      </div>
      <div style={styles.subtitle}>Risk-Free Simulation</div>
      <div style={styles.desc}>
        {scenario?.description ||
          'Step inside a virtual chemistry lab. Make decisions, see real consequences, and learn from every mistake — safely.'}
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <button
        style={{
          ...styles.btn,
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
          boxShadow: hovered ? '0 0 24px rgba(0,229,255,0.4)' : 'none',
          opacity: loading ? 0.5 : 1,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onStart}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Enter Lab →'}
      </button>
    </div>
  );
}
