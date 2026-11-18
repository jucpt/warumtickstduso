import React from 'react';
import { FARBEN } from '../brand';

// Färbt `highlight` innerhalb von `text` gelb. Kommt es nicht vor, bleibt alles weiß.
// `puls` (0–1) lässt das Highlight kurz größer werden und leuchten – in dem Moment, in dem es gesprochen wird.
export const HighlightText: React.FC<{ text: string; highlight?: string; farbe?: string; puls?: number }> = ({
  text,
  highlight,
  farbe = FARBEN.highlight,
  puls = 0,
}) => {
  if (!highlight || !text.includes(highlight)) return <>{text}</>;
  const i = text.indexOf(highlight);
  const davor = text.slice(0, i);
  let danach = text.slice(i + highlight.length);
  // Satzzeichen direkt hinter dem Highlight bleiben am letzten Wort kleben (kein Umbruch vor dem Komma)
  const zeichen = danach.match(/^[.,!?:;…]+/)?.[0] ?? '';
  danach = danach.slice(zeichen.length);
  const woerter = highlight.split(/\s+/);
  const wort = (w: string, key: number) => (
    <span
      key={key}
      style={{
        color: farbe,
        display: 'inline-block',
        transform: `scale(${1 + 0.16 * puls})`,
        textShadow: puls > 0 ? `0 0 ${36 * puls}px rgba(250, 204, 21, ${0.75 * puls})` : undefined,
      }}
    >
      {w}
    </span>
  );
  return (
    <>
      {davor}
      {woerter.map((w, j) =>
        j < woerter.length - 1 ? (
          <React.Fragment key={j}>
            {wort(w, j)}{' '}
          </React.Fragment>
        ) : (
          <span key={j} style={{ whiteSpace: 'nowrap' }}>
            {wort(w, j)}
            {zeichen}
          </span>
        ),
      )}
      {danach}
    </>
  );
};
