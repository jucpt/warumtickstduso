import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { FARBEN, RAND, SCHRIFT, INHALT_BREITE } from '../brand';
import { Szene, Wort } from '../types';
import { wortZeiten } from './momente';

// Untertitel: 1–3 Wörter gleichzeitig, das gerade gesprochene Wort leuchtet lila.
// Mit Zeitstempeln aus `npm run stimme` laufen sie synchron zur Stimme,
// ohne werden die Wörter gleichmäßig über die Szene verteilt (siehe momente.ts).

const MAX_WOERTER = 3;

const gruppiere = (woerter: Wort[]): Wort[][] => {
  const gruppen: Wort[][] = [];
  let aktuell: Wort[] = [];
  for (const w of woerter) {
    aktuell.push(w);
    const satzende = /[.,!?:;–]$/.test(w.wort);
    if (aktuell.length >= MAX_WOERTER || satzende) {
      gruppen.push(aktuell);
      aktuell = [];
    }
  }
  if (aktuell.length) gruppen.push(aktuell);
  return gruppen;
};

export const Untertitel: React.FC<{ text: string; woerter?: Wort[]; dauer: number; oben?: number }> = ({
  text,
  woerter,
  dauer,
  oben = 1330,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const zeiten = useMemo<Wort[]>(() => wortZeiten({ sprechtext: text, woerter, dauer } as Szene), [text, woerter, dauer]);

  const gruppen = useMemo(() => gruppiere(zeiten), [zeiten]);
  const gruppe = [...gruppen].reverse().find((g) => g[0].start <= t);
  if (!gruppe) return null;
  // Nach dem letzten Wort kurz stehen lassen, dann ausblenden (wichtig für lange Outros)
  if (t > zeiten[zeiten.length - 1].ende + 1) return null;
  const aktiv = [...gruppe].reverse().find((w) => w.start <= t);

  return (
    <div
      style={{
        position: 'absolute',
        top: oben,
        left: RAND.links,
        width: INHALT_BREITE,
        textAlign: 'center',
        fontFamily: SCHRIFT,
        fontWeight: 800,
        fontSize: 72,
        lineHeight: 1.15,
        color: FARBEN.text,
      }}
    >
      {gruppe.map((w, i) => (
        <span key={i} style={{ color: w === aktiv ? FARBEN.akzent : FARBEN.text }}>
          {w.wort}
          {i < gruppe.length - 1 ? ' ' : ''}
        </span>
      ))}
    </div>
  );
};
