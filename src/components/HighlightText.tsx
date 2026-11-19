import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FARBEN } from '../brand';

// Färbt `highlight` innerhalb von `text` ein (statisch, z. B. fürs Cover).
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

type Token = { wort: string; hl: boolean; leerDanach: boolean; vorsatz?: string; nachsatz?: string };

// Zerlegt den Text in Wörter. Das Highlight bleibt EIN Stück (auch über mehrere Wörter),
// Satzzeichen direkt dahinter gehören nicht zum Marker.
const zerlege = (text: string, highlight?: string): Token[] => {
  const woerter = (teil: string, leerAmEnde: boolean): Token[] => {
    const out: Token[] = [];
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(teil))) {
      const ende = m.index + m[0].length;
      out.push({ wort: m[0], hl: false, leerDanach: ende < teil.length ? /\s/.test(teil[ende]) : leerAmEnde });
    }
    return out;
  };
  if (!highlight || !text.includes(highlight)) return woerter(text, false);
  const hs = text.indexOf(highlight);
  const vor = text.slice(0, hs);
  const nach = text.slice(hs + highlight.length);
  const vorTokens = woerter(vor, /\s$/.test(vor));
  const nachTokens = woerter(nach, false);
  const hl: Token = { wort: highlight, hl: true, leerDanach: /^\s/.test(nach) };
  // Direkt angeklebte Zeichen (z. B. Komma, Fragezeichen, Anführungszeichen) bleiben mit dem Highlight in einer Zeile
  if (vor && !/\s$/.test(vor) && vorTokens.length) hl.vorsatz = vorTokens.pop()!.wort;
  if (nach && !/^\s/.test(nach) && nachTokens.length) {
    const n = nachTokens.shift()!;
    hl.nachsatz = n.wort;
    hl.leerDanach = n.leerDanach;
  }
  return [...vorTokens, hl, ...nachTokens];
};

/** Frame (relativ zur Szene), in dem der gelbe Marker über das Highlight wischt – für den Pop-Sound. */
export const markerFrame = (text: string, highlight: string | undefined, startFrame: number, abstand: number, fps: number) =>
  startFrame + zerlege(text, highlight).length * abstand + Math.round(0.15 * fps);

// Kinetischer Text: Wörter springen nacheinander ins Bild,
// danach wischt ein gelber Marker über das Highlight.
export const KinetikText: React.FC<{
  text: string;
  highlight?: string;
  startFrame?: number;
  abstand?: number;
}> = ({ text, highlight, startFrame = 0, abstand = 3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokens = zerlege(text, highlight);
  const mStart = markerFrame(text, highlight, startFrame, abstand, fps);
  const marker = interpolate(frame, [mStart, mStart + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const markerPop = spring({ frame: frame - mStart - 4, fps, config: { damping: 8, mass: 0.4 } });
  const popSkala = 1 + 0.1 * Math.sin(Math.PI * Math.min(1, markerPop));

  return (
    <>
      {tokens.map((tok, i) => {
        const s = spring({ frame: frame - (startFrame + i * abstand), fps, config: { damping: 12, mass: 0.6 } });
        const basis: React.CSSProperties = {
          display: 'inline-block',
          transform: `translateY(${(1 - s) * 50}px) scale(${(0.6 + 0.4 * s) * (tok.hl ? popSkala : 1)})`,
          opacity: Math.min(1, s * 1.6),
        };
        return (
          <React.Fragment key={i}>
            {tok.hl ? (
              <span style={{ ...basis, whiteSpace: 'nowrap' }}>
                {tok.vorsatz}
                <span style={{ position: 'relative', zIndex: 0, padding: '0 10px', margin: '0 -2px', color: marker > 0.5 ? FARBEN.hintergrund : FARBEN.highlight }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '10%',
                    bottom: '2%',
                    backgroundColor: FARBEN.highlight,
                    borderRadius: 14,
                    transformOrigin: 'left center',
                    transform: `scaleX(${marker})`,
                    zIndex: -1,
                  }}
                />
                {tok.wort}
                </span>
                {tok.nachsatz}
              </span>
            ) : (
              <span style={basis}>{tok.wort}</span>
            )}
            {tok.leerDanach ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </>
  );
};
