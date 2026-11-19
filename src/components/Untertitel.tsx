import React, { useMemo } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FARBEN, RAND, SCHRIFT, INHALT_BREITE } from '../brand';
import { Wort } from '../types';

// Untertitel: 1–3 Wörter gleichzeitig. Jede neue Gruppe springt ins Bild,
// das gerade gesprochene Wort leuchtet lila und ist etwas größer.
// Mit Zeitstempeln aus `npm run stimme` laufen sie synchron zur Stimme,
// ohne werden die Wörter gleichmäßig über die Szene verteilt.

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
  oben = 1290,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const zeiten = useMemo<Wort[]>(() => {
    if (woerter && woerter.length) return woerter;
    const teile = text.split(/\s+/).filter(Boolean);
    const sprechzeit = Math.max(0.5, dauer - 0.6);
    const proWort = sprechzeit / teile.length;
    return teile.map((wort, i) => ({ wort, start: 0.2 + i * proWort, ende: 0.2 + (i + 1) * proWort }));
  }, [text, woerter, dauer]);

  const gruppen = useMemo(() => gruppiere(zeiten), [zeiten]);
  const gruppe = [...gruppen].reverse().find((g) => g[0].start <= t);
  if (!gruppe) return null;
  // Nach dem letzten Wort kurz stehen lassen, dann ausblenden (Outro bleibt sonst mit altem Untertitel stehen)
  if (t > zeiten[zeiten.length - 1].ende + 1) return null;
  const aktiv = [...gruppe].reverse().find((w) => w.start <= t);
  const pop = spring({ frame: frame - Math.round(gruppe[0].start * fps), fps, config: { damping: 11, mass: 0.5 } });

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
        transform: `scale(${0.75 + 0.25 * pop}) translateY(${(1 - pop) * 20}px)`,
      }}
    >
      {gruppe.map((w, i) => (
        <React.Fragment key={i}>
          <span
            style={{
              display: 'inline-block',
              margin: '0 0.22em',
              color: w === aktiv ? FARBEN.akzent : FARBEN.text,
              transform: `scale(${w === aktiv ? 1.05 : 1})`,
            }}
          >
            {w.wort}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};
