import React from 'react';
import { FARBEN } from '../brand';

// Färbt `highlight` innerhalb von `text` gelb. Kommt es nicht vor, bleibt alles weiß.
export const HighlightText: React.FC<{ text: string; highlight?: string; farbe?: string }> = ({
  text,
  highlight,
  farbe = FARBEN.highlight,
}) => {
  if (!highlight || !text.includes(highlight)) return <>{text}</>;
  const i = text.indexOf(highlight);
  return (
    <>
      {text.slice(0, i)}
      <span style={{ color: farbe }}>{highlight}</span>
      {text.slice(i + highlight.length)}
    </>
  );
};
