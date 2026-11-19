import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { LAUTSTAERKE, SOUNDS, SoundName } from '../brand';

// Spielt einen Soundeffekt ab Frame `bei` (relativ zur umgebenden Sequence).
// Ist der Sound in brand.ts nicht eingetragen (null), passiert nichts.
export const Sound: React.FC<{ name: SoundName; bei?: number; lautstaerke?: number }> = ({
  name,
  bei = 0,
  lautstaerke,
}) => {
  const datei = SOUNDS[name];
  if (!datei) return null;
  return (
    <Sequence from={Math.max(0, Math.round(bei))} durationInFrames={90} layout="none" name={`sfx ${name}`}>
      <Audio src={staticFile(datei)} volume={lautstaerke ?? LAUTSTAERKE[name]} />
    </Sequence>
  );
};
