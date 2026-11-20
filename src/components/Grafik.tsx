import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FARBEN } from '../brand';
import { GrafikName, Szene } from '../types';
import { Gehirn } from './Gehirn';
import { ab, ausschlag, betonungsZeit, wortStart, zucken } from './momente';

// Linien-Grafiken im Logo-Stil: runde Enden, einheitliche Strichstärke.
// Regel: Jede Grafik zeichnet sich erst selbst und bewegt sich danach DAUERHAFT weiter
// (Impulse, Pulsieren, Fließen) – es gibt keinen Moment, in dem das Bild still steht.
// Neue Grafiken hier ergänzen und in types.ts bei GrafikName eintragen.

const useZeit = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: frame / fps };
};

const useZeichnen = (dauerSek = 1.2, startSek = 0.1) => {
  const { frame, fps } = useZeit();
  return interpolate(frame, [startSek * fps, (startSek + dauerSek) * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

const SVG: React.FC<{ groesse: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ groesse, children, style }) => (
  <svg width={groesse} height={groesse} viewBox="0 0 200 200" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible', ...style }}>
    {children}
  </svg>
);

const HERZ = 'M100 160 C60 130 36 106 36 80 C36 60 52 46 70 46 C84 46 94 54 100 64 C106 54 116 46 130 46 C148 46 164 60 164 80 C164 106 140 130 100 160 Z';

// Gefühl, das ansteigt und weiterfließt
const Welle: React.FC<{ groesse: number }> = ({ groesse }) => {
  const { t } = useZeit();
  const p = useZeichnen(1.2);
  const anstieg = interpolate(t, [0, 3], [0.55, 1], { extrapolateRight: 'clamp' });
  const punkte: [number, number][] = [];
  for (let x = 20; x <= 180; x += 2) {
    const amp = (4 + ((x - 20) / 160) ** 1.6 * 52) * anstieg;
    const y = 110 - amp * Math.sin((x - 20) / 9 - t * 4);
    punkte.push([x, y]);
  }
  const ende = punkte[punkte.length - 1];
  return (
    <SVG groesse={groesse}>
      <line x1="20" y1="172" x2="180" y2="172" stroke={FARBEN.neben} strokeWidth={5} opacity={0.5} />
      <polyline
        points={punkte.map(([x, y]) => `${x},${y.toFixed(1)}`).join(' ')}
        stroke={FARBEN.akzent}
        strokeWidth={7}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
      <g opacity={p >= 1 ? 1 : 0}>
        <circle cx={ende[0]} cy={ende[1]} r={14} fill={FARBEN.highlight} opacity={0.25} />
        <circle cx={ende[0]} cy={ende[1]} r={7} fill={FARBEN.highlight} />
      </g>
    </SVG>
  );
};

// Sprechblase, in der die Worte „hängen“
const Sprechblase: React.FC<{ groesse: number }> = ({ groesse }) => {
  const { t, frame, fps } = useZeit();
  const p = useZeichnen(0.9);
  const schweben = Math.sin(t * 2) * 4;
  return (
    <SVG groesse={groesse}>
      <g transform={`translate(0 ${schweben})`}>
        <path
          d="M40 50 H160 Q176 50 176 66 V122 Q176 138 160 138 H92 L64 164 L70 138 H40 Q24 138 24 122 V66 Q24 50 40 50 Z"
          stroke={FARBEN.neben}
          strokeWidth={7}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - p}
        />
        {[0, 1, 2].map((i) => {
          const da = spring({ frame: frame - (0.9 + i * 0.15) * fps, fps, config: { damping: 12 } });
          const huepfen = Math.max(0, Math.sin(2 * Math.PI * (t * 1.4 - i * 0.18))) * 12;
          return <circle key={i} cx={70 + i * 30} cy={94 - huepfen * da} r={9 * da} fill={FARBEN.akzent} />;
        })}
      </g>
    </SVG>
  );
};

// Herz mit Doppelschlag und Ringen, die nach außen laufen
const Herz: React.FC<{ groesse: number }> = ({ groesse }) => {
  const { t } = useZeit();
  const p = useZeichnen(1.1);
  const takt = t % 1;
  const schlag = Math.exp(-((takt - 0.05) ** 2) / 0.002) + 0.7 * Math.exp(-((takt - 0.3) ** 2) / 0.002);
  const fertig = p >= 1 ? 1 : 0;
  const skala = 1 + 0.08 * schlag * fertig;
  const ringe = [0, 0.5].map((v) => ((t + v) % 1));
  return (
    <SVG groesse={groesse}>
      {fertig
        ? ringe.map((r, i) => (
            <path
              key={i}
              d={HERZ}
              stroke={FARBEN.akzent}
              strokeWidth={4}
              opacity={(1 - r) * 0.5}
              transform={`translate(100 105) scale(${1 + r * 0.6}) translate(-100 -105)`}
            />
          ))
        : null}
      <g transform={`translate(100 105) scale(${skala}) translate(-100 -105)`}>
        <path d={HERZ} stroke={FARBEN.akzent} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      </g>
    </SVG>
  );
};

// Gehirn mit markiertem Stirnhirn (der „Bremse“)
const GehirnVorne: React.FC<{ groesse: number }> = ({ groesse }) => {
  const { t, frame, fps } = useZeit();
  const p = useZeichnen(1.3);
  const leuchten = interpolate(frame, [1.3 * fps, 1.8 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const puls = 0.5 + 0.5 * Math.sin(t * Math.PI * 1.4);
  return (
    <Gehirn groesse={groesse} fortschritt={p} impulse anzahlImpulse={4}>
      <ellipse
        cx="100"
        cy="60"
        rx={54 + puls * 8}
        ry={26 + puls * 4}
        stroke={FARBEN.highlight}
        strokeWidth={5}
        strokeDasharray="10 12"
        strokeDashoffset={-t * 30}
        opacity={leuchten}
      />
    </Gehirn>
  );
};

const GehirnGross: React.FC<{ groesse: number }> = ({ groesse }) => {
  const p = useZeichnen(1.3);
  return <Gehirn groesse={groesse} fortschritt={p} impulse />;
};

// Handy mit endlosem Feed und wischendem Daumen
const Handy: React.FC<{ groesse: number }> = ({ groesse }) => {
  const { t } = useZeit();
  const p = useZeichnen(0.9);
  const da = p >= 1 ? 1 : 0;
  const versatz = (t * 46) % 42;
  const wisch = (t % 0.9) / 0.9;
  return (
    <SVG groesse={groesse}>
      <defs>
        <clipPath id="bildschirm">
          <rect x="70" y="34" width="60" height="132" rx="6" />
        </clipPath>
      </defs>
      <g clipPath="url(#bildschirm)" opacity={da}>
        {Array.from({ length: 5 }).map((_, i) => {
          const y = 36 + i * 42 - versatz;
          return (
            <g key={i}>
              <rect x="74" y={y} width="52" height="34" rx="6" stroke={FARBEN.akzent} strokeWidth={4} />
              <line x1="82" y1={y + 24} x2={i % 2 ? 104 : 114} y2={y + 24} stroke={FARBEN.neben} strokeWidth={4} opacity={0.7} />
            </g>
          );
        })}
      </g>
      <rect x="62" y="20" width="76" height="160" rx="16" stroke={FARBEN.neben} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <line x1="90" y1="27" x2="110" y2="27" stroke={FARBEN.neben} strokeWidth={4} opacity={p} />
      <g opacity={da * Math.sin(Math.PI * wisch)}>
        <circle cx={156} cy={150 - wisch * 80} r={14} fill={FARBEN.highlight} opacity={0.25} />
        <circle cx={156} cy={150 - wisch * 80} r={7} fill={FARBEN.highlight} />
      </g>
    </SVG>
  );
};


// ---------------------------------------------------------------------------
// Grafiken, die auf gesprochene Wörter reagieren (Zeitpunkte aus momente.ts).
// Welches Wort welche Reaktion auslöst, steht optional in der Folgen-JSON bei `momente`.

type GrafikProps = { groesse: number; szene?: Szene; versatz?: number };

/**
 * Zeitpunkt (Sekunden ab Start der Grafik) des k-ten Ereignisses:
 * 1. Wort aus `szene.momente[k]`, 2. sonst das erste gesprochene Wort aus `standard`,
 * 3. sonst für das erste Ereignis das Highlight bzw. `betonung` der Szene.
 * `versatz`: um so viele Sekunden startet die Grafik nach dem Szenenbeginn.
 */
const ereignis = (szene: Szene | undefined, versatz: number, k: number, ...standard: string[]): number | null => {
  if (!szene) return null;
  const roh = (() => {
    const eigen = wortStart(szene, szene.momente?.[k]);
    if (eigen !== null) return eigen;
    for (const w of standard) {
      const z = wortStart(szene, w);
      if (z !== null) return z;
    }
    return k === 0 ? betonungsZeit(szene) : null;
  })();
  return roh === null ? null : roh - versatz;
};

// Keks: zeichnet sich, zerbricht beim Schlüsselwort in zwei Hälften, Krümel fallen.
const KEKS_LINKS = 'M100 40 A60 60 0 0 0 102 160 L96 140 L108 120 L94 100 L106 80 L92 62 Z';
const KEKS_RECHTS = 'M100 40 A60 60 0 0 1 102 160 L96 140 L108 120 L94 100 L106 80 L92 62 Z';
const STUECKE_LINKS: [number, number][] = [[72, 82], [66, 112], [82, 136]];
const STUECKE_RECHTS: [number, number][] = [[128, 76], [134, 108], [118, 138]];
const KRUEMEL: [number, number, number][] = [[-14, 0, 4], [10, 0.08, 5], [-4, 0.15, 3.5], [18, 0.05, 3], [-22, 0.12, 3]];

const Keks: React.FC<GrafikProps> = ({ groesse, szene, versatz = 0 }) => {
  const { t } = useZeit();
  const p = useZeichnen(1);
  const bruch = ereignis(szene, versatz, 0, 'zerbrochen') ?? 1.2;
  const unter = ereignis(szene, versatz, 1, 'Welt');
  const auf = ab(t, bruch, 0.35);
  const sinken = ab(t, unter, 0.6);
  const wackeln = Math.sin(t * 3) * 1.5;
  const stuecke = (liste: [number, number][]) =>
    liste.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={6} fill={FARBEN.akzent} />);
  if (t < bruch) {
    return (
      <SVG groesse={groesse} style={{ transform: `rotate(${wackeln}deg)` }}>
        <circle cx="100" cy="100" r="60" stroke={FARBEN.neben} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        <g opacity={p}>{stuecke([...STUECKE_LINKS, ...STUECKE_RECHTS])}</g>
      </SVG>
    );
  }
  const dx = 16 * auf + 6 * sinken;
  const dy = 14 * sinken;
  const dreh = 9 * auf + 8 * sinken;
  return (
    <SVG groesse={groesse} style={{ transform: `rotate(${zucken(t, bruch, 4)}deg)` }}>
      <g transform={`translate(${-dx} ${dy}) rotate(${-dreh} 100 160)`}>
        <path d={KEKS_LINKS} stroke={FARBEN.neben} strokeWidth={7} />
        {stuecke(STUECKE_LINKS)}
      </g>
      <g transform={`translate(${dx} ${dy}) rotate(${dreh} 102 160)`}>
        <path d={KEKS_RECHTS} stroke={FARBEN.neben} strokeWidth={7} />
        {stuecke(STUECKE_RECHTS)}
      </g>
      {KRUEMEL.map(([x, verz, r], i) => {
        const z = Math.max(0, t - bruch - verz);
        const y = 120 + 90 * z * z + 25 * z;
        return y < 196 ? <circle key={i} cx={100 + x * (1 + z)} cy={y} r={r} fill={FARBEN.akzent} /> : null;
      })}
    </SVG>
  );
};

// Zwei Figuren: Erwachsener legt den Arm um ein Kind. Über ihnen erscheint ein Herz,
// das bei jedem Schlüsselwort schlägt (z. B. „ruhig bleiben“, „benennen“, „da sein“).
const Zusammen: React.FC<GrafikProps> = ({ groesse, szene, versatz = 0 }) => {
  const { t } = useZeit();
  const p = useZeichnen(1.4);
  const arm = interpolate(t, [1.2, 1.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const herzAuf = ereignis(szene, versatz, 0, 'an uns') ?? 1.8;
  const herz = ab(t, herzAuf, 0.4);
  const schlaege = [ereignis(szene, versatz, 1, 'ruhig'), ereignis(szene, versatz, 2, 'benennen'), ereignis(szene, versatz, 3, 'da sein')];
  const schlag = Math.max(ausschlag(t, herzAuf, 0.6), ...schlaege.map((s) => ausschlag(t, s, 0.6)));
  const atmen = Math.sin(t * 2) * 1.5;
  const strich = (farbe: string, d: string) => (
    <path d={d} stroke={farbe} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  );
  return (
    <SVG groesse={groesse}>
      <g transform={`translate(0 ${atmen * 0.5})`}>
        <circle cx="76" cy="70" r="17" stroke={FARBEN.neben} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        {strich(FARBEN.neben, 'M46 178 C46 128 56 102 76 102 C96 102 106 128 106 178')}
      </g>
      <g transform={`translate(0 ${atmen})`}>
        <circle cx="140" cy="112" r="13" stroke={FARBEN.akzent} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        {strich(FARBEN.akzent, 'M118 178 C118 150 126 134 140 134 C154 134 162 150 162 178')}
      </g>
      <path
        d="M98 122 C112 112 128 116 134 136"
        stroke={FARBEN.neben}
        strokeWidth={7}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - arm}
      />
      <g transform={`translate(110 34) scale(${0.28 * herz * (1 + 0.25 * schlag)}) translate(-100 -105)`} opacity={herz}>
        <path d={HERZ} stroke={FARBEN.akzent} strokeWidth={22} fill={schlag > 0.3 ? FARBEN.akzent : 'none'} />
      </g>
    </SVG>
  );
};

// Spielautomat: Beim ersten Ereignis wird der Hebel gezogen und die Walzen drehen.
// Sie halten nacheinander an, die letzte genau beim zweiten Ereignis – drei Herzen, Gewinn, es blinkt.
// Beim dritten Ereignis wird der Hebel erneut gezogen (das Spiel geht immer weiter).
const ZELLE = 40;
const WALZEN_X = [62, 90, 118];
const SYMBOLE = ['kreis', 'raute', 'herz', 'balken'] as const;

const Symbol: React.FC<{ art: (typeof SYMBOLE)[number]; x: number; y: number }> = ({ art, x, y }) => {
  const farbe = FARBEN.akzent;
  switch (art) {
    case 'kreis':
      return <circle cx={x} cy={y} r={8} stroke={farbe} strokeWidth={5} />;
    case 'raute':
      return <path d={`M${x} ${y - 10} L${x + 9} ${y} L${x} ${y + 10} L${x - 9} ${y} Z`} stroke={farbe} strokeWidth={5} />;
    case 'herz':
      return (
        <g transform={`translate(${x} ${y + 1}) scale(0.16) translate(-100 -105)`}>
          <path d={HERZ} stroke={farbe} strokeWidth={30} fill={farbe} />
        </g>
      );
    default:
      return <line x1={x - 9} y1={y} x2={x + 9} y2={y} stroke={farbe} strokeWidth={6} />;
  }
};

const Spielautomat: React.FC<GrafikProps> = ({ groesse, szene, versatz = 0 }) => {
  const { t } = useZeit();
  const p = useZeichnen(1.1);
  const inhalt = ab(t, 1.0, 0.4);
  const clipId = `walzen-${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const zug1 = ereignis(szene, versatz, 0, 'Hebel') ?? 1.5;
  const gewinn = Math.max(zug1 + 1.2, ereignis(szene, versatz, 1, 'gewinnen') ?? zug1 + 2);
  const zug2 = ereignis(szene, versatz, 2, 'Daumen');

  // Walzen-Stellung als Index in SYMBOLE: [Start, Ziel 1 (Gewinn = 3× herz), Ziel 2 (nach dem zweiten Zug)]
  const ziele = [
    [0, 2, 3],
    [2, 2, 0],
    [1, 2, 1],
  ];
  const position = (r: number) => {
    const stopp1 = gewinn - (2 - r) * 0.35;
    let pos = ziele[r][0];
    const lauf = (von: number, bis: number, start: number, stopp: number) => {
      if (t < start) return null;
      const x = Math.min(1, (t - start) / (stopp - start));
      const runden = 3 + r;
      const weg = ((bis - von + SYMBOLE.length) % SYMBOLE.length) + runden * SYMBOLE.length;
      return von + weg * (1 - (1 - x) ** 3);
    };
    const l1 = lauf(ziele[r][0], ziele[r][1], zug1 + 0.15, stopp1);
    if (l1 !== null) pos = l1;
    if (zug2 !== null) {
      const l2 = lauf(ziele[r][1], ziele[r][2], zug2 + 0.15, zug2 + 1.2 + r * 0.3);
      if (l2 !== null) pos = l2;
    }
    return pos;
  };
  const hebel = Math.max(ausschlag(t, zug1, 0.8), ausschlag(t, zug2, 0.8));
  const blinken = ausschlag(t, gewinn, 1.2);
  const funkeln = ab(t, gewinn, 0.3) * (1 - ab(t, gewinn + 0.9, 0.3));
  const knaufY = 62 + 70 * hebel;

  return (
    <SVG groesse={groesse} style={{ transform: `rotate(${zucken(t, gewinn, 3)}deg)` }}>
      <defs>
        <clipPath id={clipId}>
          <rect x="44" y="80" width="92" height="44" />
        </clipPath>
      </defs>
      <rect x="30" y="50" width="120" height="122" rx="18" stroke={FARBEN.neben} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <rect
        x="44"
        y="78"
        width="92"
        height="48"
        rx="10"
        stroke={blinken > 0 ? FARBEN.akzent : FARBEN.neben}
        strokeWidth={5 + 3 * blinken}
        opacity={p}
        style={{ filter: blinken > 0 ? `drop-shadow(0 0 ${14 * blinken}px ${FARBEN.akzent})` : undefined }}
      />
      <line x1="60" y1="150" x2="120" y2="150" stroke={FARBEN.neben} strokeWidth={5} opacity={0.5 * p} />
      <g clipPath={`url(#${clipId})`} opacity={inhalt}>
        {WALZEN_X.map((x, r) => {
          const pos = position(r);
          const basis = Math.floor(pos);
          const rest = pos - basis;
          return [-1, 0, 1, 2].map((k) => {
            const index = (((basis + k) % SYMBOLE.length) + SYMBOLE.length) % SYMBOLE.length;
            return <Symbol key={`${r}-${k}`} art={SYMBOLE[index]} x={x} y={102 + (k - rest) * ZELLE} />;
          });
        })}
      </g>
      {/* Hebel */}
      <g opacity={p}>
        <line x1="150" y1="122" x2="166" y2="122" stroke={FARBEN.neben} strokeWidth={7} />
        <line x1="166" y1="122" x2="166" y2={knaufY} stroke={FARBEN.neben} strokeWidth={7} />
        <circle cx="166" cy={knaufY} r="10" fill={FARBEN.akzent} />
      </g>
      {/* Funkeln beim Gewinn */}
      <g opacity={funkeln} stroke={FARBEN.akzent} strokeWidth={5}>
        {[
          [90, 40, 90, 26],
          [56, 46, 46, 36],
          [124, 46, 134, 36],
        ].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
    </SVG>
  );
};

// Stoppuhr: läuft ab dem ersten Ereignis (z. B. „Timer“), ein Bogen füllt sich mit.
// Beim zweiten Ereignis (z. B. „Ende“) wird der Knopf gedrückt, sie stoppt und zuckt.
const Stoppuhr: React.FC<GrafikProps> = ({ groesse, szene, versatz = 0 }) => {
  const { t } = useZeit();
  const p = useZeichnen(1.1);
  const start = ereignis(szene, versatz, 0, 'Timer') ?? 1.2;
  const stopp = ereignis(szene, versatz, 1, 'Ende');
  const laufzeit = Math.max(0, Math.min(t, stopp ?? Infinity) - start);
  const winkel = laufzeit * 120; // eine Umdrehung in 3 s
  const fuellung = Math.min(0.999, laufzeit / 9);
  const druck = Math.max(ausschlag(t, start, 0.4), ausschlag(t, stopp, 0.5));
  const gestoppt = ausschlag(t, stopp, 1);
  const r = 58;
  const cx = 100;
  const cy = 112;
  const bogenEnde = (f: number) => {
    const a = f * 2 * Math.PI - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const [bx, by] = bogenEnde(fuellung);
  const zeiger = (winkel - 90) * (Math.PI / 180);
  return (
    <SVG
      groesse={groesse}
      style={{ transform: `rotate(${zucken(t, stopp, 5)}deg) scale(${1 + 0.06 * gestoppt + 0.02 * Math.sin(t * 2.4)})` }}
    >
      <line x1={cx} y1={52 + 6 * druck} x2={cx} y2={40 + 6 * druck} stroke={FARBEN.neben} strokeWidth={7} opacity={p} />
      <line x1={cx - 12} y1={36 + 6 * druck} x2={cx + 12} y2={36 + 6 * druck} stroke={FARBEN.neben} strokeWidth={7} opacity={p} />
      <line x1="143" y1="70" x2="151" y2="62" stroke={FARBEN.neben} strokeWidth={7} opacity={p} />
      <circle cx={cx} cy={cy} r={r} stroke={FARBEN.neben} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      {fuellung > 0 ? (
        <path
          d={`M${cx} ${cy - r} A${r} ${r} 0 ${fuellung > 0.5 ? 1 : 0} 1 ${bx.toFixed(2)} ${by.toFixed(2)}`}
          stroke={FARBEN.akzent}
          strokeWidth={7 + 3 * gestoppt}
        />
      ) : null}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * 2 * Math.PI;
        return (
          <line
            key={i}
            x1={cx + 44 * Math.sin(a)}
            y1={cy - 44 * Math.cos(a)}
            x2={cx + 49 * Math.sin(a)}
            y2={cy - 49 * Math.cos(a)}
            stroke={FARBEN.neben}
            strokeWidth={4}
            opacity={0.5 * p}
          />
        );
      })}
      <g opacity={p}>
        <line x1={cx} y1={cy} x2={cx + 38 * Math.cos(zeiger)} y2={cy + 38 * Math.sin(zeiger)} stroke={FARBEN.akzent} strokeWidth={7} />
        <circle cx={cx} cy={cy} r={7} fill={FARBEN.akzent} />
      </g>
    </SVG>
  );
};

// Turm aus Bauklötzen: Klötze fallen nacheinander ins Bild, der Turm wackelt (gelber Lichtpunkt oben).
// Ereignis 1 (z. B. „umgefallen“): der Turm kippt, die Klötze fallen auseinander.
// Ereignis 2 (z. B. „Ich bin da“): über den Klötzen erscheint ein pulsierendes Herz.
const KLOETZE = [
  // Start (links oben), Ziel nach dem Umfallen, Drehung
  { x: 85, y: 146, zx: 85, zy: 146, dreh: 0 },
  { x: 85, y: 116, zx: 128, zy: 146, dreh: 90 },
  { x: 85, y: 86, zx: 36, zy: 147, dreh: -98 },
  { x: 85, y: 56, zx: 142, zy: 118, dreh: 205 },
];

const Turm: React.FC<GrafikProps> = ({ groesse, szene, versatz = 0 }) => {
  const { t } = useZeit();
  const boden = useZeichnen(0.6);
  const fall = ereignis(szene, versatz, 0, 'umgefallen') ?? 2.5;
  const herzZeit = ereignis(szene, versatz, 1, 'Ich bin da');
  const wackeln = t < fall ? Math.sin(t * 3.2) * (1.2 + Math.min(2.5, t * 0.6)) : 0;
  const herz = ab(t, herzZeit, 0.35);
  const herzPuls = 1 + 0.08 * Math.max(0, Math.sin(t * 6));
  const staub = ausschlag(t, fall + 0.5, 0.5);
  return (
    <SVG groesse={groesse}>
      <line x1="24" y1="178" x2="184" y2="178" stroke={FARBEN.neben} strokeWidth={5} opacity={0.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - boden} />
      <g transform={`rotate(${wackeln} 100 178)`}>
        {KLOETZE.map((k, i) => {
          const da = ab(t, 0.25 + i * 0.25, 0.3);
          // Fallen: oberster Klotz zuerst, waagerecht gleichmäßig, senkrecht beschleunigt (Schwerkraft)
          const roh = Math.max(0, Math.min(1, (t - fall - (KLOETZE.length - 1 - i) * 0.06) / 0.5));
          const aufprall = roh >= 1 ? Math.abs(Math.sin((t - fall - 0.5) * 18)) * Math.exp(-(t - fall - 0.5) * 8) * 6 : 0;
          const x = k.x + (k.zx - k.x) * roh;
          const y = k.y + (k.zy - k.y) * roh * roh - aufprall - (1 - da) * 50;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width="30"
              height="30"
              rx="5"
              stroke={i % 2 ? FARBEN.akzent : FARBEN.neben}
              strokeWidth={6}
              opacity={da}
              transform={`rotate(${k.dreh * roh} ${x + 15} ${y + 15})`}
            />
          );
        })}
        {t < fall ? (
          <g opacity={ab(t, 1.2, 0.3)}>
            <circle cx="100" cy="44" r={12} fill={FARBEN.highlight} opacity={0.25 + 0.1 * Math.sin(t * 5)} />
            <circle cx="100" cy="44" r="6" fill={FARBEN.highlight} />
          </g>
        ) : null}
      </g>
      <g opacity={staub} stroke={FARBEN.neben} strokeWidth={4}>
        <line x1="34" y1="170" x2="22" y2="162" />
        <line x1="166" y1="170" x2="180" y2="160" />
        <line x1="100" y1="168" x2="100" y2="156" />
      </g>
      {herz > 0 ? (
        <g transform={`translate(100 74) scale(${0.3 * herz * herzPuls}) translate(-100 -105)`} opacity={herz}>
          <path d={HERZ} stroke={FARBEN.akzent} strokeWidth={20} fill={FARBEN.akzent} />
          <circle cx="152" cy="52" r="16" fill={FARBEN.highlight} />
        </g>
      ) : null}
    </SVG>
  );
};

// Scheinwerfer: Lampe mit gelbem Lichtpunkt, Lichtkegel schwenkt leicht und flackert, mittendrin eine Figur.
// Ereignis 1 (Standard „Scheinwerfer“ bzw. Highlight): der Kegel blitzt hell auf.
const Scheinwerfer: React.FC<GrafikProps> = ({ groesse, szene, versatz = 0 }) => {
  const { t } = useZeit();
  const p = useZeichnen(0.9);
  const an = ab(t, 0.7, 0.25);
  const blitz = ausschlag(t, ereignis(szene, versatz, 0, 'Scheinwerfer'), 0.7);
  const schwenk = Math.sin(t * 1.2) * 5;
  const flackern = 0.1 + 0.04 * Math.sin(t * 9) + 0.03 * Math.sin(t * 23) + 0.2 * blitz;
  return (
    <SVG groesse={groesse}>
      <ellipse cx={100 + schwenk * 2.2} cy="174" rx={44} ry={8} stroke={FARBEN.akzent} strokeWidth={5} opacity={0.6 * an} />
      <g transform={`rotate(${schwenk} 100 44)`}>
        <path d="M86 46 L48 172 L152 172 L114 46 Z" fill={FARBEN.akzent} opacity={flackern * an} />
        <line x1="86" y1="46" x2="48" y2="172" stroke={FARBEN.akzent} strokeWidth={5} opacity={0.8 * an} />
        <line x1="114" y1="46" x2="152" y2="172" stroke={FARBEN.akzent} strokeWidth={5} opacity={0.8 * an} />
      </g>
      {/* Figur im Licht */}
      <g opacity={an} transform={`translate(${schwenk * 1.6} ${Math.sin(t * 2.4) * 1.5})`}>
        <circle cx="100" cy="122" r="11" stroke={FARBEN.neben} strokeWidth={6} />
        <path d="M80 170 C80 148 88 138 100 138 C112 138 120 148 120 170" stroke={FARBEN.neben} strokeWidth={6} />
      </g>
      {/* Lampe */}
      <path d="M80 18 H120 L114 44 H86 Z" stroke={FARBEN.neben} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <line x1="100" y1="18" x2="100" y2="6" stroke={FARBEN.neben} strokeWidth={6} opacity={p} />
      <circle cx="100" cy="46" r={13 + 6 * blitz} fill={FARBEN.highlight} opacity={(0.25 + 0.3 * blitz) * an} />
      <circle cx="100" cy="46" r="6" fill={FARBEN.highlight} opacity={an} />
    </SVG>
  );
};

// Kreisdiagramm: Ereignis 1 (z. B. „Hälfte“) füllt 50 %, Ereignis 2 (z. B. „Viertel“) schrumpft auf 25 %.
// Die Schätzung bleibt danach gestrichelt sichtbar, damit man den Unterschied sieht.
const Torte: React.FC<GrafikProps> = ({ groesse, szene, versatz = 0 }) => {
  const { t } = useZeit();
  const p = useZeichnen(1);
  const e1 = ereignis(szene, versatz, 0, 'Hälfte');
  const e2 = ereignis(szene, versatz, 1, 'Viertel');
  const anteil = 0.5 * ab(t, e1, 0.5) - 0.25 * ab(t, e2, 0.6);
  const cx = 100;
  const cy = 98;
  const r = 62;
  const punkt = (f: number, rr = r) => {
    const a = f * 2 * Math.PI - Math.PI / 2;
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  };
  const sektor = (f: number) => {
    if (f <= 0.001) return '';
    const [x, y] = punkt(f);
    return `M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${f > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
  };
  const [lx, ly] = punkt(anteil, r);
  const puls = 1 + 0.03 * Math.sin(t * 3);
  const zahl = e2 !== null && t >= e2 ? '25 %' : e1 !== null && t >= e1 ? '50 %' : '';
  const zahlPop = Math.max(ausschlag(t, e1, 0.5), ausschlag(t, e2, 0.5));
  return (
    <SVG groesse={groesse}>
      <g transform={`translate(${cx} ${cy}) scale(${puls}) translate(${-cx} ${-cy})`}>
        <circle cx={cx} cy={cy} r={r} stroke={FARBEN.neben} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        {e2 !== null && t >= e2 ? <path d={sektor(0.5)} stroke={FARBEN.neben} strokeWidth={4} strokeDasharray="8 10" opacity={0.6} /> : null}
        {anteil > 0.001 ? <path d={sektor(anteil)} fill={FARBEN.akzent} stroke={FARBEN.akzent} strokeWidth={5} /> : null}
        {anteil > 0.001 ? (
          <>
            <circle cx={lx} cy={ly} r="13" fill={FARBEN.highlight} opacity={0.25} />
            <circle cx={lx} cy={ly} r="6" fill={FARBEN.highlight} />
          </>
        ) : null}
      </g>
      {zahl ? (
        <text x={cx} y="192" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={30 * (1 + 0.25 * zahlPop)} fill={FARBEN.text}>
          {zahl}
        </text>
      ) : null}
    </SVG>
  );
};

// Figur läuft auf der Stelle, vor ihr ein Stein (gelber Lichtpunkt). Ereignis 1 (z. B. „stolperst“): sie stolpert.
// Danach schwebt eine Gedankenwolke mit dem Stein über ihr. Ereignis 2 (z. B. „vergessen“): die Wolke zerplatzt.
const Stolpern: React.FC<GrafikProps> = ({ groesse, szene, versatz = 0 }) => {
  const { t } = useZeit();
  const p = useZeichnen(0.9);
  const stolper = ereignis(szene, versatz, 0, 'stolperst') ?? 1.5;
  const weg = ereignis(szene, versatz, 1, 'vergessen');
  const kipp = ausschlag(t, stolper, 1.1);
  const schritt = Math.sin(t * 7) * 20 * (1 - kipp);
  const dreh = 38 * kipp + zucken(t, stolper, 4);
  const wolke = ab(t, stolper + 0.7, 0.4) * (1 - ab(t, weg, 0.25));
  const puff = ausschlag(t, weg, 0.6);
  const staub = ausschlag(t, stolper + 0.15, 0.6);
  const bein = (w: number) => {
    const a = (w * Math.PI) / 180;
    return { x2: 82 + Math.sin(a) * 44, y2: 126 + Math.cos(a) * 44 };
  };
  const arm = (w: number) => {
    const a = ((w + 30) * Math.PI) / 180;
    return { x2: 82 + Math.sin(a) * 26, y2: 96 + Math.cos(a) * 26 - 30 * kipp };
  };
  return (
    <SVG groesse={groesse}>
      <line x1="24" y1="172" x2="180" y2="172" stroke={FARBEN.neben} strokeWidth={5} opacity={0.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <rect x="112" y="162" width="18" height="10" rx="4" stroke={FARBEN.akzent} strokeWidth={5} opacity={p} />
      {t < stolper ? <circle cx="121" cy="152" r={4 + Math.sin(t * 5)} fill={FARBEN.highlight} opacity={p} /> : null}
      <g transform={`rotate(${dreh} 90 170) translate(82 170) scale(1.3) translate(-82 -170)`} opacity={p}>
        <circle cx="82" cy="70" r="12" stroke={FARBEN.neben} strokeWidth={6} />
        <line x1="82" y1="82" x2="82" y2="126" stroke={FARBEN.neben} strokeWidth={6} />
        <line x1="82" y1="96" {...arm(schritt)} stroke={FARBEN.neben} strokeWidth={6} />
        <line x1="82" y1="96" {...arm(-schritt)} stroke={FARBEN.neben} strokeWidth={6} />
        <line x1="82" y1="126" {...bein(schritt)} stroke={FARBEN.neben} strokeWidth={6} />
        <line x1="82" y1="126" {...bein(-schritt)} stroke={FARBEN.neben} strokeWidth={6} />
      </g>
      <g opacity={staub} stroke={FARBEN.neben} strokeWidth={4}>
        <line x1="104" y1="166" x2="96" y2="156" />
        <line x1="138" y1="166" x2="148" y2="156" />
      </g>
      {wolke > 0.01 ? (
        <g transform={`translate(146 46) scale(${1.35 * wolke * (1 + 0.04 * Math.sin(t * 3))}) translate(-146 -46)`}>
          <circle cx="112" cy="80" r="4" fill={FARBEN.neben} />
          <circle cx="122" cy="68" r="6" fill={FARBEN.neben} />
          <path d="M126 52 C122 38 138 30 146 38 C152 26 172 30 170 44 C182 46 182 64 168 64 L132 64 C120 64 118 52 126 52 Z" stroke={FARBEN.neben} strokeWidth={5} />
          <rect x="140" y="46" width="14" height="8" rx="3" stroke={FARBEN.akzent} strokeWidth={4} />
        </g>
      ) : null}
      <g opacity={puff} stroke={FARBEN.akzent} strokeWidth={4}>
        <line x1="146" y1="30" x2="146" y2="18" />
        <line x1="170" y1="38" x2="180" y2="30" />
        <line x1="122" y1="38" x2="112" y2="30" />
        <line x1="176" y1="60" x2="188" y2="62" />
      </g>
    </SVG>
  );
};

export const Grafik: React.FC<{ name?: GrafikName; groesse?: number; szene?: Szene; versatz?: number }> = ({
  name = 'keine',
  groesse = 520,
  szene,
  versatz = 0,
}) => {
  const { frame, fps, t } = useZeit();
  if (!name || name === 'keine') return null;
  const auftritt = spring({ frame, fps, config: { damping: 13, mass: 0.7 } });
  const schweben = Math.sin(t * 1.3) * 6;
  const inhalt = (() => {
    switch (name) {
      case 'gehirn':
        return <GehirnGross groesse={groesse} />;
      case 'gehirn-vorne':
        return <GehirnVorne groesse={groesse} />;
      case 'welle':
        return <Welle groesse={groesse} />;
      case 'sprechblase':
        return <Sprechblase groesse={groesse} />;
      case 'herz':
        return <Herz groesse={groesse} />;
      case 'handy':
        return <Handy groesse={groesse} />;
      case 'keks':
        return <Keks groesse={groesse} szene={szene} versatz={versatz} />;
      case 'zusammen':
        return <Zusammen groesse={groesse} szene={szene} versatz={versatz} />;
      case 'spielautomat':
        return <Spielautomat groesse={groesse} szene={szene} versatz={versatz} />;
      case 'stoppuhr':
        return <Stoppuhr groesse={groesse} szene={szene} versatz={versatz} />;
      case 'turm':
        return <Turm groesse={groesse} szene={szene} versatz={versatz} />;
      case 'scheinwerfer':
        return <Scheinwerfer groesse={groesse} szene={szene} versatz={versatz} />;
      case 'torte':
        return <Torte groesse={groesse} szene={szene} versatz={versatz} />;
      case 'stolpern':
        return <Stolpern groesse={groesse} szene={szene} versatz={versatz} />;
      default:
        return null;
    }
  })();
  return <div style={{ transform: `translateY(${schweben}px) scale(${0.6 + 0.4 * auftritt})` }}>{inhalt}</div>;
};
