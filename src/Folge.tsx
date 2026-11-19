import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Branding, Fortschritt, Hintergrund, SzenenRahmen } from './components/Rahmen';
import { Sound } from './components/Sound';
import { Beispiel, Hook, Merke, Outro, Schritt } from './szenen/Szenen';
import { Folge, Szene } from './types';
import { FPS } from './brand';

export const szenenFrames = (s: Szene) => Math.max(1, Math.round(s.dauer * FPS));
export const folgenFrames = (f: Folge) => f.szenen.reduce((summe, s) => summe + szenenFrames(s), 0);

const SZENEN = { hook: Hook, schritt: Schritt, beispiel: Beispiel, merke: Merke, outro: Outro };

export const FolgeVideo: React.FC<{ folge: Folge }> = ({ folge }) => {
  const schritteGesamt = folge.szenen.filter((s) => s.typ === 'schritt').length;
  const gesamt = folgenFrames(folge);
  let start = 0;
  let schrittNr = 0;

  return (
    <AbsoluteFill>
      <Hintergrund />
      <Branding nummer={folge.nummer} />
      <Fortschritt gesamtFrames={gesamt} />
      {folge.musik ? <Audio src={staticFile(folge.musik)} volume={0.08} loop /> : null}
      {folge.szenen.map((szene, i) => {
        const dauerFrames = szenenFrames(szene);
        const von = start;
        start += dauerFrames;
        if (szene.typ === 'schritt') schrittNr += 1;
        const Komponente = SZENEN[szene.typ];
        return (
          <React.Fragment key={i}>
            {/* Wusch kurz VOR dem Schnitt, damit der Übergang auf dem Sound landet */}
            {i > 0 ? <Sound name="wusch" bei={von - 4} /> : null}
            <Sequence from={von} durationInFrames={dauerFrames} name={`${i + 1} ${szene.typ}`}>
              {szene.audio ? <Audio src={staticFile(szene.audio)} /> : null}
              <SzenenRahmen dauerFrames={dauerFrames} index={i}>
                <Komponente szene={szene} schrittNr={schrittNr} schritteGesamt={schritteGesamt} />
              </SzenenRahmen>
            </Sequence>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
