import React from 'react';
import { FARBEN } from '../brand';

// Das Gehirn aus dem Logo. `fortschritt` (0–1) zeichnet die Linien nach und nach.
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

export const Gehirn: React.FC<{
  groesse: number;
  fortschritt?: number;
  umriss?: string;
  akzent?: string;
  children?: React.ReactNode;
}> = ({ groesse, fortschritt = 1, umriss = FARBEN.neben, akzent = FARBEN.akzent, children }) => {
  const umrissP = Math.min(1, fortschritt * 1.4);
  const windungP = Math.max(0, Math.min(1, fortschritt * 1.6 - 0.6));
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 200 200" fill="none" strokeLinecap="round" strokeLinejoin="round">
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
    </svg>
  );
};
