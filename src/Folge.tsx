import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Branding, Hintergrund, SzenenRahmen } from './components/Rahmen';
import { Beispiel, Hook, Merke, Outro, Schritt } from './szenen/Szenen';
import { Folge, Szene } from './types';
import { FPS } from './brand';

// Das Outro (Logo + „Folge für mehr“) steht mindestens so lange nach, und wird bei kurzen Folgen
// so weit verlängert, dass das Video 61 s erreicht (TikTok vergütet nur Videos über 1 Minute).
const OUTRO_NACHLAUF_MIN = 1.5;
const MINDESTLAENGE = 61;

// Wusch-Sounds bei jedem Szenenwechsel (public/sounds/wusch-1…7.mp3, lizenzfrei)
const WUSCH_ANZAHL = 7;
const WUSCH_LAUTSTAERKE = 0.35;
const WUSCH_VORLAUF = 0.15; // Sekunden vor dem Schnitt starten, damit der Wusch auf dem Wechsel liegt

const szenenFramesRoh = (s: Szene) => Math.max(1, Math.round(s.dauer * FPS));
const inhaltFrames = (f: Folge) => f.szenen.reduce((summe, s) => summe + szenenFramesRoh(s), 0);
const nachlaufFrames = (f: Folge) =>
  Math.max(Math.round(OUTRO_NACHLAUF_MIN * FPS), MINDESTLAENGE * FPS - inhaltFrames(f));

const szenenFrames = (f: Folge, i: number) =>
  szenenFramesRoh(f.szenen[i]) + (i === f.szenen.length - 1 ? nachlaufFrames(f) : 0);
export const folgenFrames = (f: Folge) => inhaltFrames(f) + nachlaufFrames(f);

const SZENEN = { hook: Hook, schritt: Schritt, beispiel: Beispiel, merke: Merke, outro: Outro };

export const FolgeVideo: React.FC<{ folge: Folge }> = ({ folge }) => {
  const schritteGesamt = folge.szenen.filter((s) => s.typ === 'schritt').length;
  let start = 0;
  let schrittNr = 0;

  return (
    <AbsoluteFill>
      <Hintergrund />
      <Branding nummer={folge.nummer} />
      {folge.musik ? <Audio src={staticFile(folge.musik)} volume={0.08} loop /> : null}
      {folge.szenen.map((szene, i) => {
        const dauerFrames = szenenFrames(folge, i);
        const von = start;
        start += dauerFrames;
        if (szene.typ === 'schritt') schrittNr += 1;
        const Komponente = SZENEN[szene.typ];
        return (
          <React.Fragment key={i}>
            {i > 0 ? (
              <Sequence from={von - Math.round(WUSCH_VORLAUF * FPS)} durationInFrames={FPS} name={`Wusch ${i}`}>
                <Audio src={staticFile(`sounds/wusch-${((i - 1) % WUSCH_ANZAHL) + 1}.mp3`)} volume={WUSCH_LAUTSTAERKE} />
              </Sequence>
            ) : null}
            <Sequence from={von} durationInFrames={dauerFrames} name={`${i + 1} ${szene.typ}`}>
              {szene.audio ? <Audio src={staticFile(szene.audio)} /> : null}
              <SzenenRahmen dauerFrames={dauerFrames} sofort={i === 0}>
                <Komponente szene={szene} schrittNr={schrittNr} schritteGesamt={schritteGesamt} />
              </SzenenRahmen>
            </Sequence>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
