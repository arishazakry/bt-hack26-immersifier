import React, { useEffect, useRef } from 'react';

/**
 * LabScene — A-Frame WebXR chemistry lab.
 *
 * Objects are identified by data-action attributes.
 * Clicks bubble up via CustomEvent 'lab-action' so the parent
 * React component can call the API without coupling to A-Frame internals.
 */
export default function LabScene({ currentStep, onAction, highlightAction }) {
  const sceneRef = useRef(null);

  // Register A-Frame click-to-action component once
  useEffect(() => {
    if (!window.AFRAME) return;
    if (window.AFRAME.components['lab-clickable']) return;

    window.AFRAME.registerComponent('lab-clickable', {
      schema: { action: { type: 'string' } },
      init() {
        this.onClick = () => {
          const action = this.data.action;
          const event  = new CustomEvent('lab-action', { detail: { action }, bubbles: true });
          this.el.dispatchEvent(event);
        };
        this.el.addEventListener('click', this.onClick);
      },
      remove() {
        this.el.removeEventListener('click', this.onClick);
      }
    });
  }, []);

  // Listen for lab-action events from A-Frame and forward to React
  useEffect(() => {
    const handler = (e) => onAction && onAction(e.detail.action);
    document.addEventListener('lab-action', handler);
    return () => document.removeEventListener('lab-action', handler);
  }, [onAction]);

  // Pulse the highlight object
  const glowColor = highlightAction ? '#00e5ff' : '#1e2d42';

  return (
    <a-scene
      ref={sceneRef}
      embedded
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      renderer="antialias: true; colorManagement: true;"
      vr-mode-ui="enabled: true"
      cursor="rayOrigin: mouse"
      raycaster="objects: [lab-clickable]"
    >
      {/* ── ASSETS ─────────────────────────────────────────────────── */}
      <a-assets>
        <a-mixin
          id="hover-scale"
          animation__mouseenter="property: scale; to: 1.08 1.08 1.08; dur: 150; startEvents: mouseenter"
          animation__mouseleave="property: scale; to: 1 1 1; dur: 150; startEvents: mouseleave"
        />
      </a-assets>

      {/* ── ENVIRONMENT ────────────────────────────────────────────── */}
      <a-sky color="#060a0f" />

      {/* Floor */}
      <a-plane
        position="0 0 -4"
        rotation="-90 0 0"
        width="12" height="10"
        color="#0a1520"
        roughness="0.9"
        metalness="0.1"
      />

      {/* Back wall */}
      <a-plane
        position="0 2.5 -7"
        width="12" height="6"
        color="#0b1826"
        roughness="0.8"
      />

      {/* Ambient + directional light */}
      <a-light type="ambient" color="#1a2a3a" intensity="1.5" />
      <a-light type="directional" position="2 4 -2" intensity="1.2" color="#d0eeff" />
      <a-light type="point" position="-1 2.2 -3" intensity="0.6" color="#00e5ff" distance="5" />

      {/* ── LAB BENCH ──────────────────────────────────────────────── */}
      {/* Bench surface */}
      <a-box position="0 0.75 -3.5" width="4" height="0.1" depth="1.2"
             color="#162130" roughness="0.5" metalness="0.3" />
      {/* Bench legs */}
      <a-box position="-1.8 0.35 -3.5" width="0.1" height="0.8" depth="1.1" color="#0e1a26" />
      <a-box position=" 1.8 0.35 -3.5" width="0.1" height="0.8" depth="1.1" color="#0e1a26" />

      {/* ── INTERACTIVE OBJECTS ────────────────────────────────────── */}

      {/* 1. PPE — goggles + gloves */}
      <a-entity position="-1.6 1.05 -3.5">
        {/* Goggles frame */}
        <a-torus
          lab-clickable={`action: wear_ppe`}
          mixin="hover-scale"
          radius="0.13" radius-tubular="0.025"
          color={highlightAction === 'wear_ppe' ? '#00e5ff' : '#ffd740'}
          position="0 0 0"
          cursor-listener
        />
        {/* Gloves */}
        <a-box
          lab-clickable={`action: wear_ppe`}
          mixin="hover-scale"
          width="0.14" height="0.08" depth="0.06"
          color={highlightAction === 'wear_ppe' ? '#00e5ff' : '#4db6ac'}
          position="0.2 -0.12 0"
        />
        <a-text value="PPE" align="center" position="0 0.28 0"
                color="#ffd740" width="1.2" font="monoid" />
      </a-entity>

      {/* 2. HCl bottle (correct burette fill) */}
      <a-entity position="-0.7 1.15 -3.5">
        <a-cylinder
          lab-clickable="action: fill_burette_hcl"
          mixin="hover-scale"
          radius="0.08" height="0.35"
          color={highlightAction === 'fill_burette_hcl' ? '#00e5ff' : '#e53935'}
          open-ended="false"
        />
        <a-text value="HCl" align="center" position="0 0.28 0"
                color="#ef9a9a" width="1.0" />
      </a-entity>

      {/* 3. NaOH bottle (wrong burette fill) */}
      <a-entity position="-0.1 1.15 -3.5">
        <a-cylinder
          lab-clickable="action: fill_burette_naoh"
          mixin="hover-scale"
          radius="0.08" height="0.35"
          color="#1565c0"
          open-ended="false"
        />
        <a-text value="NaOH" align="center" position="0 0.28 0"
                color="#90caf9" width="1.0" />
      </a-entity>

      {/* 4. Burette */}
      <a-entity position="0.6 1.3 -3.5">
        <a-cylinder
          radius="0.04" height="0.6"
          color="#b0bec5"
          metalness="0.6" roughness="0.2"
          open-ended="false"
        />
        {/* Burette label */}
        <a-text value="BURETTE" align="center" position="0 0.42 0"
                color="#78909c" width="0.9" />
      </a-entity>

      {/* 5. Phenolphthalein indicator bottle */}
      <a-entity position="1.2 1.1 -3.5">
        <a-cylinder
          lab-clickable="action: add_phenolphthalein"
          mixin="hover-scale"
          radius="0.06" height="0.25"
          color={highlightAction === 'add_phenolphthalein' ? '#00e5ff' : '#ce93d8'}
          open-ended="false"
        />
        <a-text value="Indicator" align="center" position="0 0.22 0"
                color="#ce93d8" width="0.85" />
      </a-entity>

      {/* 6. Litmus indicator (wrong choice) */}
      <a-entity position="1.6 1.1 -3.5">
        <a-cylinder
          lab-clickable="action: add_litmus"
          mixin="hover-scale"
          radius="0.05" height="0.2"
          color="#ef9a9a"
          open-ended="false"
        />
        <a-text value="Litmus" align="center" position="0 0.18 0"
                color="#ef9a9a" width="0.75" />
      </a-entity>

      {/* 7. Conical flask (titration target) */}
      <a-entity position="0 1.05 -3.3">
        {/* Flask body approximation */}
        <a-cone
          lab-clickable="action: titrate_correct"
          mixin="hover-scale"
          radius-bottom="0.14" radius-top="0.05" height="0.25"
          color={currentStep?.id === 'titrate' ? '#f48fb1' : '#b2dfdb'}
          opacity="0.75"
          open-ended="false"
        />
        <a-text value="Flask" align="center" position="0 0.22 0"
                color="#80cbc4" width="0.9" />
      </a-entity>

      {/* 8. Notebook — record reading */}
      <a-entity position="-1.0 1.0 -3.8">
        <a-box
          lab-clickable="action: record_reading"
          mixin="hover-scale"
          width="0.22" height="0.28" depth="0.03"
          color={highlightAction === 'record_reading' ? '#00e5ff' : '#fff9c4'}
        />
        <a-text value="Record" align="center" position="0 0.22 0"
                color="#fff9c4" width="0.9" />
      </a-entity>

      {/* ── WALL SHELF DECORATIONS ─────────────────────────────────── */}
      <a-box position="-3.5 1.8 -6.5" width="1.2" height="0.06" depth="0.3"
             color="#0e1a26" />
      <a-cylinder position="-3.5 2.2 -6.5" radius="0.05" height="0.4"
                  color="#4fc3f7" opacity="0.6" />
      <a-cylinder position="-3.2 2.1 -6.5" radius="0.04" height="0.3"
                  color="#80cbc4" opacity="0.6" />

      {/* ── OVERHEAD LABEL ─────────────────────────────────────────── */}
      <a-text
        value="XR LEARNING SANDBOX — CHEMISTRY LAB"
        align="center"
        position="0 3.5 -5"
        color="#00e5ff"
        width="6"
        font="monoid"
        letter-spacing="4"
      />

      {/* ── SKIP PPE ZONE (invisible click target on floor area) ─── */}
      <a-plane
        lab-clickable="action: skip_ppe"
        position="0 0.01 -2"
        rotation="-90 0 0"
        width="3" height="1"
        color="#ff1744"
        opacity="0.0"
      />

      {/* ── CAMERA ─────────────────────────────────────────────────── */}
      <a-entity position="0 1.6 0">
        <a-camera look-controls wasd-controls>
          <a-cursor
            color="#00e5ff"
            fuse="false"
            animation__click="property: scale; startEvents: click; easing: easeInCubic; dur: 150; from: 0.1 0.1 0.1; to: 1 1 1"
          />
        </a-camera>
      </a-entity>
    </a-scene>
  );
}
