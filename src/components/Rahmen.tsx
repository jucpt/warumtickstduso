import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { FARBEN, KANAL, SCHRIFT } from '../brand';
import { Gehirn } from './Gehirn';

// Hintergrund mit dezenter Kreis-Deko – wie im YouTube-Banner.
export const Hintergrund: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 12;
  const kreis = (s: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    borderRadius: '50%',
    boxSizing: 'border-box',
    ...s,
  });
  return (
    <AbsoluteFill style={{ backgroundColor: FARBEN.hintergrund, overflow: 'hidden' }}>
      <div style={kreis({ left: -380, top: 520 + drift, width: 760, height: 760, border: `4px solid ${FARBEN.linie}` })} />
      <div style={kreis({ right: -300, top: -220 - drift, width: 700, height: 700, border: `4px solid ${FARBEN.linie}` })} />
      <div style={kreis({ right: -160, bottom: -260 + drift, width: 620, height: 620, backgroundColor: FARBEN.flaeche })} />
    </AbsoluteFill>
  );
};

// Kleines Logo + Kanalname oben links, in jedem Video gleich.
export const Branding: React.FC<{ nummer: number }> = ({ nummer }) => (
  <div
    style={{
      position: 'absolute',
      top: 170,
      left: 80,
      right: 150,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: SCHRIFT,
      fontWeight: 800,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <Gehirn groesse={64} />
      <span style={{ fontSize: 32, color: FARBEN.neben }}>{KANAL}</span>
    </div>
    <span style={{ fontSize: 30, color: FARBEN.neben, opacity: 0.8 }}>#{String(nummer).padStart(2, '0')}</span>
  </div>
);

// Sanftes Ein- und Ausblenden jeder Szene.
export const SzenenRahmen: React.FC<{ dauerFrames: number; children: React.ReactNode }> = ({ dauerFrames, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ein = interpolate(frame, [0, 0.3 * fps], [0, 1], { extrapolateRight: 'clamp' });
  const aus = interpolate(frame, [dauerFrames - 0.25 * fps, dauerFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const y = interpolate(ein, [0, 1], [30, 0]);
  return <AbsoluteFill style={{ opacity: Math.min(ein, aus), transform: `translateY(${y}px)` }}>{children}</AbsoluteFill>;
};
