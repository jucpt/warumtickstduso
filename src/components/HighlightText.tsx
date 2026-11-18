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
  // Jedes Wort einzeln, damit der Zeilenumbruch gleich bleibt
  const teile = highlight.split(/(\s+)/);
  return (
    <>
      {text.slice(0, i)}
      {teile.map((teil, j) =>
        /^\s+$/.test(teil) ? (
          <span key={j}>{teil}</span>
        ) : (
          <span
            key={j}
            style={{
              color: farbe,
              display: 'inline-block',
              transform: `scale(${1 + 0.16 * puls})`,
              textShadow: puls > 0 ? `0 0 ${36 * puls}px rgba(250, 204, 21, ${0.75 * puls})` : undefined,
            }}
          >
            {teil}
          </span>
        ),
      )}
      {text.slice(i + highlight.length)}
    </>
  );
};
