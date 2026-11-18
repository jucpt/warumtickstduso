import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FARBEN, INHALT_BREITE, KANAL, SCHRIFT } from './brand';
import { Gehirn } from './components/Gehirn';
import { HighlightText } from './components/HighlightText';
import { Hintergrund } from './components/Rahmen';
import { Folge } from './types';

// Titelbild jeder Folge. Alles Wichtige liegt mittig, weil das Profilraster der Apps oben und unten abschneidet.
export const Cover: React.FC<{ folge: Folge }> = ({ folge }) => {
  const hook = folge.szenen.find((s) => s.typ === 'hook') ?? folge.szenen[0];
  return (
    <AbsoluteFill>
      <Hintergrund />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: SCHRIFT,
          fontWeight: 800,
          textAlign: 'center',
          gap: 56,
          padding: '0 80px',
        }}
      >
        <div
          style={{
            fontSize: 44,
            padding: '12px 36px',
            borderRadius: 999,
            backgroundColor: FARBEN.akzent,
            color: FARBEN.hintergrund,
          }}
        >
          #{String(folge.nummer).padStart(2, '0')}
        </div>
        <Gehirn groesse={300} />
        <div style={{ width: INHALT_BREITE + 70, fontSize: 104, lineHeight: 1.06, letterSpacing: -2, color: FARBEN.text }}>
          <HighlightText text={hook.titel} highlight={hook.highlight} farbe={FARBEN.akzent} />
        </div>
        <div style={{ fontSize: 38, color: FARBEN.neben }}>@{KANAL}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
