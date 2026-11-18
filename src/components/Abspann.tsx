import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { FARBEN, KANAL, SCHRIFT } from '../brand';
import { Gehirn } from './Gehirn';

// Logo-Abspann am Ende jeder Folge: Gehirn zeichnet sich, darunter der Kanalname.
export const Abspann: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fortschritt = interpolate(frame, [0, 1.2 * fps], [0, 1], { extrapolateRight: 'clamp' });
  const text = interpolate(frame, [0.6 * fps, 1.1 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ein = interpolate(frame, [0, 0.3 * fps], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        fontFamily: SCHRIFT,
        fontWeight: 800,
        opacity: ein,
      }}
    >
      <Gehirn groesse={380} fortschritt={fortschritt} />
      <div style={{ fontSize: 64, color: FARBEN.text, opacity: text, transform: `translateY(${(1 - text) * 20}px)` }}>
        @{KANAL}
      </div>
    </AbsoluteFill>
  );
};
