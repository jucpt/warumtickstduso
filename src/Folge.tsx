import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Abspann } from './components/Abspann';
import { Branding, Hintergrund, SzenenRahmen } from './components/Rahmen';
import { Beispiel, Hook, Merke, Outro, Schritt } from './szenen/Szenen';
import { Folge, Szene } from './types';
import { FPS } from './brand';

export const szenenFrames = (s: Szene) => Math.max(1, Math.round(s.dauer * FPS));
const inhaltFrames = (f: Folge) => f.szenen.reduce((summe, s) => summe + szenenFrames(s), 0);

// Logo-Abspann: mindestens 3 s, bei kurzen Folgen länger, damit das Video auf 61 s kommt
// (TikTok vergütet nur Videos über 1 Minute).
const ABSPANN_MIN = 3;
const MINDESTLAENGE = 61;
export const abspannFrames = (f: Folge) => Math.max(ABSPANN_MIN * FPS, MINDESTLAENGE * FPS - inhaltFrames(f));
export const folgenFrames = (f: Folge) => inhaltFrames(f) + abspannFrames(f);

const SZENEN = { hook: Hook, schritt: Schritt, beispiel: Beispiel, merke: Merke, outro: Outro };

export const FolgeVideo: React.FC<{ folge: Folge }> = ({ folge }) => {
  const schritteGesamt = folge.szenen.filter((s) => s.typ === 'schritt').length;
  let start = 0;
  let schrittNr = 0;

  return (
    <AbsoluteFill>
      <Hintergrund />
      <Sequence durationInFrames={inhaltFrames(folge)} name="Branding">
        <Branding nummer={folge.nummer} />
      </Sequence>
      {folge.musik ? <Audio src={staticFile(folge.musik)} volume={0.08} loop /> : null}
      {folge.szenen.map((szene, i) => {
        const dauerFrames = szenenFrames(szene);
        const von = start;
        start += dauerFrames;
        if (szene.typ === 'schritt') schrittNr += 1;
        const Komponente = SZENEN[szene.typ];
        return (
          <Sequence key={i} from={von} durationInFrames={dauerFrames} name={`${i + 1} ${szene.typ}`}>
            {szene.audio ? <Audio src={staticFile(szene.audio)} /> : null}
            <SzenenRahmen dauerFrames={dauerFrames}>
              <Komponente szene={szene} schrittNr={schrittNr} schritteGesamt={schritteGesamt} />
            </SzenenRahmen>
          </Sequence>
        );
      })}
      <Sequence from={inhaltFrames(folge)} durationInFrames={abspannFrames(folge)} name="Abspann">
        <Abspann />
      </Sequence>
    </AbsoluteFill>
  );
};
