import React from 'react';
import { getLength, getPointAtLength } from '@remotion/paths';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { FARBEN } from '../brand';

// Das Gehirn aus dem Logo.
// `fortschritt` (0–1) zeichnet die Linien nach und nach.
// `impulse` lässt danach Lichtpunkte durch die Windungen wandern und das Gehirn leicht „atmen“.
const UMRISS = [
  'M96 50 C86 40 66 40 60 54 C44 52 34 66 40 80 C28 88 28 106 40 114 C34 128 44 144 60 142 C66 156 86 160 96 150 Z',
  'M104 50 C114 40 134 40 140 54 C156 52 166 66 160 80 C172 88 172 106 160 114 C166 128 156 144 140 142 C134 156 114 160 104 150 Z',
];

const WINDUNGEN = [
  'M60 54 C64 64 74 68 82 64',
  'M40 80 C52 80 62 86 62 98',
  'M40 114 C50 110 62 114 66 126',
  'M60 142 C64 132 74 128 84 130',
  'M96 80 C84 80 80 92 88 98',
  'M140 54 C136 64 126 68 118 64',
  'M160 80 C148 80 138 86 138 98',
  'M160 114 C150 110 138 114 134 126',
  'M140 142 C136 132 126 128 116 130',
  'M104 80 C116 80 120 92 112 98',
];

const BAHNEN = [...UMRISS, ...WINDUNGEN].map((d) => ({ d, laenge: getLength(d) }));

const Impulse: React.FC<{ staerke: number; anzahl: number }> = ({ staerke, anzahl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <g>
      {Array.from({ length: anzahl }).map((_, i) => {
        const bahn = BAHNEN[(i * 5 + 1) % BAHNEN.length];
        const periode = 1.3 + (i % 3) * 0.35;
        const phase = ((t + i * 0.41) % periode) / periode;
        const p = getPointAtLength(bahn.d, phase * bahn.laenge);
        if (!p) return null;
        const sichtbar = Math.sin(Math.PI * phase) * staerke;
        return (
          <g key={i} opacity={sichtbar}>
            <circle cx={p.x} cy={p.y} r={9} fill={FARBEN.highlight} opacity={0.25} />
            <circle cx={p.x} cy={p.y} r={4} fill={FARBEN.highlight} />
          </g>
        );
      })}
    </g>
  );
};

export const Gehirn: React.FC<{
  groesse: number;
  fortschritt?: number;
  umriss?: string;
  akzent?: string;
  impulse?: boolean;
  anzahlImpulse?: number;
  children?: React.ReactNode;
}> = ({ groesse, fortschritt = 1, umriss = FARBEN.neben, akzent = FARBEN.akzent, impulse = false, anzahlImpulse = 6, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const umrissP = Math.min(1, fortschritt * 1.4);
  const windungP = Math.max(0, Math.min(1, fortschritt * 1.6 - 0.6));
  const fertig = Math.max(0, Math.min(1, (fortschritt - 0.85) / 0.15));
  const atmen = impulse ? 1 + 0.025 * Math.sin((frame / fps) * Math.PI * 0.9) * fertig : 1;
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 200 200" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <g transform={`translate(100 100) scale(${atmen}) translate(-100 -100)`}>
        {children}
        <g stroke={umriss} strokeWidth={7}>
          {UMRISS.map((d) => (
            <path key={d} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - umrissP} />
          ))}
        </g>
        <g stroke={akzent} strokeWidth={5}>
          {WINDUNGEN.map((d) => (
            <path key={d} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - windungP} />
          ))}
        </g>
        {impulse ? <Impulse staerke={fertig} anzahl={anzahlImpulse} /> : null}
      </g>
    </svg>
  );
};
