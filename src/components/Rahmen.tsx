import React from 'react';
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FARBEN, HOEHE, INHALT_BREITE, KANAL, RAND, SCHRIFT } from '../brand';
import { Gehirn } from './Gehirn';

// Hintergrund: Kreis-Deko wie im Banner plus aufsteigende Lichtpunkte – ständig leichte Bewegung.
const PUNKTE = Array.from({ length: 18 }).map((_, i) => ({
  x: random(`x${i}`) * 1080,
  y: random(`y${i}`) * HOEHE,
  tempo: 18 + random(`v${i}`) * 40,
  r: 3 + random(`r${i}`) * 5,
  deckkraft: 0.12 + random(`o${i}`) * 0.25,
}));

export const Hintergrund: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const drift = Math.sin(frame / 90) * 14;
  const kreis = (s: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', borderRadius: '50%', boxSizing: 'border-box', ...s });
  return (
    <AbsoluteFill style={{ backgroundColor: FARBEN.hintergrund, overflow: 'hidden' }}>
      <div style={kreis({ left: -380, top: 520 + drift, width: 760, height: 760, border: `4px solid ${FARBEN.linie}` })} />
      <div style={kreis({ right: -300, top: -220 - drift, width: 700, height: 700, border: `4px solid ${FARBEN.linie}` })} />
      <div style={kreis({ right: -160, bottom: -260 + drift, width: 620, height: 620, backgroundColor: FARBEN.flaeche })} />
      {PUNKTE.map((p, i) => {
        const y = (((p.y - t * p.tempo) % HOEHE) + HOEHE) % HOEHE;
        const x = p.x + Math.sin(t * 0.8 + i) * 12;
        return <div key={i} style={kreis({ left: x, top: y, width: p.r * 2, height: p.r * 2, backgroundColor: FARBEN.neben, opacity: p.deckkraft })} />;
      })}
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

// Fortschrittsbalken unter dem Branding: zeigt, dass es weitergeht – hält Zuschauer bis zum Ende.
export const Fortschritt: React.FC<{ gesamtFrames: number }> = ({ gesamtFrames }) => {
  const frame = useCurrentFrame();
  const anteil = Math.min(1, frame / Math.max(1, gesamtFrames - 1));
  return (
    <div style={{ position: 'absolute', top: 256, left: RAND.links, width: INHALT_BREITE, height: 8, borderRadius: 99, backgroundColor: FARBEN.linie, overflow: 'hidden' }}>
      <div style={{ width: `${anteil * 100}%`, height: '100%', borderRadius: 99, backgroundColor: FARBEN.akzent }} />
    </div>
  );
};

// Übergang jeder Szene. Die erste Szene startet OHNE Einblenden – Frame 0 muss sofort fesseln.
// Danach wechseln sich drei Übergänge ab, und während der Szene zoomt die „Kamera“ leicht heran.
export const SzenenRahmen: React.FC<{ dauerFrames: number; index: number; children: React.ReactNode }> = ({ dauerFrames, index, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ein = index === 0 ? 1 : spring({ frame: frame + 2, fps, config: { damping: 15, mass: 0.5 } });
  const aus = interpolate(frame, [dauerFrames - 4, dauerFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const kamera = interpolate(frame, [0, dauerFrames], [1, 1.04]);

  let transform = '';
  const art = index === 0 ? -1 : index % 3;
  if (art === 0) transform = `translateY(${(1 - ein) * 160}px)`;
  if (art === 1) transform = `translateX(${(1 - ein) * 420}px) rotate(${(1 - ein) * 3}deg)`;
  if (art === 2) transform = `scale(${1.25 - 0.25 * ein})`;
  const raus = `scale(${1 - (1 - aus) * 0.08})`;

  return (
    <AbsoluteFill style={{ opacity: Math.min(index === 0 ? 1 : Math.min(1, 0.3 + ein * 1.5), aus), transform: `${transform} ${raus} scale(${kamera})` }}>
      {children}
    </AbsoluteFill>
  );
};
