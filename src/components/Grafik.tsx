import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FARBEN } from '../brand';
import { GrafikName } from '../types';
import { Gehirn } from './Gehirn';

// Linien-Grafiken im Logo-Stil: runde Enden, einheitliche Strichstärke, zeichnen sich selbst.
// Neue Grafiken hier ergänzen und in types.ts bei GrafikName eintragen.

const useZeichnen = (dauerSek = 1.2) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(frame, [0.15 * fps, (0.15 + dauerSek) * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

const Welle: React.FC<{ groesse: number }> = ({ groesse }) => {
  const p = useZeichnen(1.6);
  const punkte: string[] = [];
  for (let x = 20; x <= 180; x += 2) {
    const amp = 4 + ((x - 20) / 160) ** 1.6 * 52;
    const y = 110 - amp * Math.sin((x - 20) / 9);
    punkte.push(`${x},${y.toFixed(1)}`);
  }
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 200 200" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="20" y1="170" x2="180" y2="170" stroke={FARBEN.neben} strokeWidth={5} opacity={0.6} />
      <polyline
        points={punkte.join(' ')}
        stroke={FARBEN.akzent}
        strokeWidth={7}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
    </svg>
  );
};

const Sprechblase: React.FC<{ groesse: number }> = ({ groesse }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = useZeichnen(1);
  const punkt = (i: number) =>
    spring({ frame: frame - (1.1 + i * 0.25) * fps, fps, config: { damping: 12 } });
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 200 200" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M40 50 H160 Q176 50 176 66 V122 Q176 138 160 138 H92 L64 164 L70 138 H40 Q24 138 24 122 V66 Q24 50 40 50 Z"
        stroke={FARBEN.neben}
        strokeWidth={7}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={70 + i * 30} cy={94} r={9 * punkt(i)} fill={FARBEN.akzent} />
      ))}
    </svg>
  );
};

const Herz: React.FC<{ groesse: number }> = ({ groesse }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = useZeichnen(1.2);
  const puls = 1 + 0.05 * Math.max(0, Math.sin((frame / fps) * Math.PI * 1.6)) * (p >= 1 ? 1 : 0);
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 200 200" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <g transform={`translate(100 105) scale(${puls}) translate(-100 -105)`}>
        <path
          d="M100 160 C60 130 36 106 36 80 C36 60 52 46 70 46 C84 46 94 54 100 64 C106 54 116 46 130 46 C148 46 164 60 164 80 C164 106 140 130 100 160 Z"
          stroke={FARBEN.akzent}
          strokeWidth={7}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - p}
        />
      </g>
    </svg>
  );
};

const GehirnVorne: React.FC<{ groesse: number }> = ({ groesse }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = useZeichnen(1.4);
  const leuchten = interpolate(frame, [1.4 * fps, 1.9 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const puls = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 1.4);
  return (
    <Gehirn groesse={groesse} fortschritt={p}>
      <ellipse
        cx="100"
        cy="60"
        rx={54 + puls * 10}
        ry={26 + puls * 5}
        stroke={FARBEN.highlight}
        strokeWidth={5}
        strokeDasharray="10 12"
        opacity={leuchten}
      />
    </Gehirn>
  );
};

const GehirnGross: React.FC<{ groesse: number }> = ({ groesse }) => {
  const p = useZeichnen(1.4);
  return <Gehirn groesse={groesse} fortschritt={p} />;
};

export const Grafik: React.FC<{ name?: GrafikName; groesse?: number }> = ({ name = 'keine', groesse = 520 }) => {
  switch (name) {
    case 'gehirn':
      return <GehirnGross groesse={groesse} />;
    case 'gehirn-vorne':
      return <GehirnVorne groesse={groesse} />;
    case 'welle':
      return <Welle groesse={groesse} />;
    case 'sprechblase':
      return <Sprechblase groesse={groesse} />;
    case 'herz':
      return <Herz groesse={groesse} />;
    default:
      return null;
  }
};
