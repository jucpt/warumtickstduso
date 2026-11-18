import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FARBEN } from '../brand';
import { GrafikName, Szene } from '../types';
import { Gehirn } from './Gehirn';
import { ab, ausschlag, betonungsZeit, wortStart, zucken } from './momente';

// Linien-Grafiken im Logo-Stil: runde Enden, einheitliche Strichstärke, zeichnen sich selbst.
// Nach dem Zeichnen bleiben sie in Bewegung und reagieren auf Schlüsselwörter im Sprechtext,
// damit in jeder Szene alle 2–3 Sekunden etwas passiert.
// Neue Grafiken hier ergänzen und in types.ts bei GrafikName eintragen.

type GrafikProps = { groesse: number; szene?: Szene; sofort?: boolean };

const useZeit = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: frame / fps };
};

const useZeichnen = (dauerSek = 1.2, sofort = false) => {
  const { frame, fps } = useZeit();
  if (sofort) return 1;
  return interpolate(frame, [0.15 * fps, (0.15 + dauerSek) * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

/**
 * Zeitpunkt des k-ten Ereignisses einer Grafik:
 * 1. Wort aus `szene.momente[k]` (in der Folgen-JSON festgelegt),
 * 2. sonst das erste gesprochene Wort aus `standard`,
 * 3. sonst für das erste Ereignis das Betonungswort der Szene.
 */
const ereignis = (szene: Szene | undefined, k: number, ...standard: string[]): number | null => {
  if (!szene) return null;
  const eigen = wortStart(szene, szene.momente?.[k]);
  if (eigen !== null) return eigen;
  for (const w of standard) {
    const z = wortStart(szene, w);
    if (z !== null) return z;
  }
  return k === 0 ? betonungsZeit(szene) : null;
};

const Svg: React.FC<{ groesse: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  groesse,
  children,
  style,
}) => (
  <svg
    width={groesse}
    height={groesse}
    viewBox="0 0 200 200"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ overflow: 'visible', ...style }}
  >
    {children}
  </svg>
);

// Gefühlswelle: fließt ständig weiter und schlägt beim Schlüsselwort hoch.
const Welle: React.FC<GrafikProps> = ({ groesse, szene, sofort }) => {
  const { t } = useZeit();
  const p = useZeichnen(1.6, sofort);
  const welle = ereignis(szene, 0, 'Hochtouren');
  const hoch = ab(t, welle, 0.5);
  const kick = ausschlag(t, welle, 0.9);
  const amp = 1 + 0.25 * hoch + 0.2 * kick;
  const phase = t * 2.2;
  const punkte: string[] = [];
  for (let x = 20; x <= 180; x += 2) {
    const a = (4 + ((x - 20) / 160) ** 1.6 * 52) * amp;
    const y = 110 - Math.min(95, a) * Math.sin((x - 20) / 9 - phase);
    punkte.push(`${x},${y.toFixed(1)}`);
  }
  return (
    <Svg groesse={groesse}>
      <line x1="20" y1="170" x2="180" y2="170" stroke={FARBEN.neben} strokeWidth={5} opacity={0.6} />
      <polyline
        points={punkte.join(' ')}
        stroke={FARBEN.akzent}
        strokeWidth={7}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
    </Svg>
  );
};

// Sprechblase: Punkte tippen wie im Chat. Beim Schlüsselwort wackelt sie und zeigt „!!!“.
const Sprechblase: React.FC<GrafikProps> = ({ groesse, szene, sofort }) => {
  const { frame, fps, t } = useZeit();
  const p = useZeichnen(1, sofort);
  const ausbruch = ereignis(szene, 0, 'Schreien');
  const wechsel = ab(t, ausbruch, 0.3);
  const wackeln = zucken(t, ausbruch, 7);
  const punkt = (i: number) => spring({ frame: frame - (1.1 + i * 0.25) * fps, fps, config: { damping: 12 } });
  const tippen = (i: number) => Math.max(0, Math.sin(t * 7 - i * 0.9)) * 8;
  return (
    <Svg groesse={groesse} style={{ transform: `rotate(${wackeln}deg)` }}>
      <path
        d="M40 50 H160 Q176 50 176 66 V122 Q176 138 160 138 H92 L64 164 L70 138 H40 Q24 138 24 122 V66 Q24 50 40 50 Z"
        stroke={wechsel > 0 && t - (ausbruch ?? 0) < 0.6 ? FARBEN.akzent : FARBEN.neben}
        strokeWidth={7}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={70 + i * 30}
          cy={94 - (t > 1.8 ? tippen(i) : 0)}
          r={9 * (sofort ? 1 : punkt(i)) * (1 - wechsel)}
          fill={FARBEN.akzent}
        />
      ))}
      {wechsel > 0
        ? [0, 1, 2].map((i) => {
            const s = ab(t, (ausbruch ?? 0) + i * 0.08, 0.25);
            return (
              <g key={i} transform={`translate(${70 + i * 30} 94) scale(${s}) translate(0 -4)`}>
                <line x1="0" y1="-20" x2="0" y2="4" stroke={FARBEN.akzent} strokeWidth={8} />
                <circle cx="0" cy="20" r="5" fill={FARBEN.akzent} />
              </g>
            );
          })
        : null}
    </Svg>
  );
};

const HERZ_PFAD =
  'M100 160 C60 130 36 106 36 80 C36 60 52 46 70 46 C84 46 94 54 100 64 C106 54 116 46 130 46 C148 46 164 60 164 80 C164 106 140 130 100 160 Z';

const Herz: React.FC<GrafikProps> = ({ groesse, sofort }) => {
  const { t } = useZeit();
  const p = useZeichnen(1.2, sofort);
  const puls = 1 + 0.05 * Math.max(0, Math.sin(t * Math.PI * 1.6)) * (p >= 1 ? 1 : 0);
  return (
    <Svg groesse={groesse}>
      <g transform={`translate(100 105) scale(${puls}) translate(-100 -105)`}>
        <path d={HERZ_PFAD} stroke={FARBEN.akzent} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      </g>
    </Svg>
  );
};

// Gehirn mit markiertem Stirnbereich („Bremse“). Beim Schlüsselwort zuckt es und die Markierung blitzt,
// danach füllt sich eine Zeitleiste („reift über viele Jahre“).
const GehirnVorne: React.FC<GrafikProps> = ({ groesse, szene, sofort }) => {
  const { frame, fps, t } = useZeit();
  const p = useZeichnen(1.4, sofort);
  const leuchten = interpolate(frame, [1.4 * fps, 1.9 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const puls = 0.5 + 0.5 * Math.sin(t * Math.PI * 1.4);
  const bremse = ereignis(szene, 0, 'Bremse');
  const blitz = ausschlag(t, bremse, 0.8);
  const reifen = ereignis(szene, 1, 'reift');
  const leiste = ab(t, reifen, 0.4);
  const fuellung = reifen === null ? 0 : interpolate(t, [reifen, reifen + 3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ transform: `rotate(${zucken(t, bremse, 5)}deg) scale(${1 + 0.06 * blitz})` }}>
      <Gehirn groesse={groesse} fortschritt={p}>
        <ellipse
          cx="100"
          cy="60"
          rx={54 + puls * 10 + blitz * 8}
          ry={26 + puls * 5 + blitz * 4}
          stroke={FARBEN.highlight}
          strokeWidth={5 + blitz * 3}
          strokeDasharray="10 12"
          strokeDashoffset={-t * 20}
          opacity={leuchten}
        />
        <g opacity={leiste}>
          <line x1="40" y1="184" x2="160" y2="184" stroke={FARBEN.neben} strokeWidth={6} opacity={0.35} />
          <line x1="40" y1="184" x2={40 + 120 * fuellung} y2="184" stroke={FARBEN.akzent} strokeWidth={6} />
          <circle cx={40 + 120 * fuellung} cy="184" r={7} fill={FARBEN.akzent} />
        </g>
      </Gehirn>
    </div>
  );
};

// Großes Gehirn: atmet leicht, damit es nie ganz stillsteht.
const GehirnGross: React.FC<GrafikProps> = ({ groesse, szene, sofort }) => {
  const { t } = useZeit();
  const p = useZeichnen(1.4, sofort);
  // Beim Ereignis (Standard: Betonungswort) leuchtet das Gehirn kurz auf
  const puls = szene?.typ === 'hook' ? 0 : ausschlag(t, ereignis(szene, 0), 0.8);
  return (
    <div
      style={{
        transform: `scale(${1 + 0.025 * Math.sin(t * 2.4) + 0.1 * puls})`,
        filter: puls > 0 ? `drop-shadow(0 0 ${30 * puls}px ${FARBEN.akzent})` : undefined,
      }}
    >
      <Gehirn groesse={groesse} fortschritt={p} />
    </div>
  );
};

// Keks: zeichnet sich, zerbricht beim Schlüsselwort in zwei Hälften, Krümel fallen.
const KEKS_LINKS = 'M100 40 A60 60 0 0 0 102 160 L96 140 L108 120 L94 100 L106 80 L92 62 Z';
const KEKS_RECHTS = 'M100 40 A60 60 0 0 1 102 160 L96 140 L108 120 L94 100 L106 80 L92 62 Z';
const STUECKE_LINKS: [number, number][] = [[72, 82], [66, 112], [82, 136]];
const STUECKE_RECHTS: [number, number][] = [[128, 76], [134, 108], [118, 138]];
const KRUEMEL: [number, number, number][] = [[-14, 0, 4], [10, 0.08, 5], [-4, 0.15, 3.5], [18, 0.05, 3], [-22, 0.12, 3]];

const Keks: React.FC<GrafikProps> = ({ groesse, szene, sofort }) => {
  const { t } = useZeit();
  const p = useZeichnen(1, sofort);
  const bruch = ereignis(szene, 0, 'zerbrochen') ?? 1.2;
  const unter = ereignis(szene, 1, 'Welt');
  const auf = ab(t, bruch, 0.35);
  const sinken = ab(t, unter, 0.6);
  const wackeln = Math.sin(t * 3) * 1.5;
  const stuecke = (liste: [number, number][]) =>
    liste.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={6} fill={FARBEN.akzent} />);
  if (t < bruch) {
    return (
      <Svg groesse={groesse} style={{ transform: `rotate(${wackeln}deg)` }}>
        <circle cx="100" cy="100" r="60" stroke={FARBEN.neben} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        <g opacity={p}>{stuecke([...STUECKE_LINKS, ...STUECKE_RECHTS])}</g>
      </Svg>
    );
  }
  const dx = 16 * auf + 6 * sinken;
  const dy = 14 * sinken;
  const dreh = 9 * auf + 8 * sinken;
  return (
    <Svg groesse={groesse} style={{ transform: `rotate(${zucken(t, bruch, 4)}deg)` }}>
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
    </Svg>
  );
};

// Zwei Figuren: Erwachsener legt den Arm um ein Kind. Über ihnen erscheint ein Herz,
// das bei jedem Schlüsselwort schlägt (z. B. „ruhig bleiben“, „benennen“, „da sein“).
const Zusammen: React.FC<GrafikProps> = ({ groesse, szene, sofort }) => {
  const { t } = useZeit();
  const p = useZeichnen(1.4, sofort);
  const arm = sofort ? 1 : interpolate(t, [1.2, 1.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const herzAuf = ereignis(szene, 0, 'an uns') ?? 1.8;
  const herz = ab(t, herzAuf, 0.4);
  const schlaege = [ereignis(szene, 1, 'ruhig'), ereignis(szene, 2, 'benennen'), ereignis(szene, 3, 'da sein')];
  const schlag = Math.max(ausschlag(t, herzAuf, 0.6), ...schlaege.map((s) => ausschlag(t, s, 0.6)));
  const atmen = Math.sin(t * 2) * 1.5;
  const strich = (farbe: string, d: string) => (
    <path d={d} stroke={farbe} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  );
  return (
    <Svg groesse={groesse}>
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
        <path d={HERZ_PFAD} stroke={FARBEN.akzent} strokeWidth={22} fill={schlag > 0.3 ? FARBEN.akzent : 'none'} />
      </g>
    </Svg>
  );
};

// Smartphone mit endlosem Feed: Umriss zeichnet sich zuerst, dann wandern Inhaltsbalken langsam nach oben.
// Bei den Ereignissen (Standard: Betonungswort) rast der Feed kurz los, wie ein schneller Wisch.
const FEED_ABSTAND = 46;
const FEED_OBEN = 44;
const FEED_UNTEN = 158;

const Handy: React.FC<GrafikProps> = ({ groesse, szene, sofort }) => {
  const { t } = useZeit();
  const p = useZeichnen(1, sofort);
  const inhalt = sofort ? 1 : ab(t, 1.05, 0.4);
  const clipId = `handy-${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const wische = [ereignis(szene, 0), ereignis(szene, 1), ereignis(szene, 2)];
  // Weg des Feeds: gleichmäßiges Wandern plus ein Sprung um ein Element pro Wisch
  const weg = 14 * t + wische.reduce<number>((summe, w) => summe + FEED_ABSTAND * 2 * ab(t, w, 0.45), 0);
  const wackeln = Math.max(...wische.map((w) => ausschlag(t, w, 0.5)));
  const elemente = [];
  for (let i = -1; i < 5; i++) {
    const y = FEED_OBEN + 6 + i * FEED_ABSTAND - (weg % FEED_ABSTAND);
    elemente.push(
      <g key={i}>
        <line x1="80" y1={y + 10} x2="120" y2={y + 10} stroke={FARBEN.akzent} strokeWidth={16} />
        <line x1="80" y1={y + 30} x2="104" y2={y + 30} stroke={FARBEN.akzent} strokeWidth={6} opacity={0.7} />
      </g>,
    );
  }
  return (
    <Svg groesse={groesse} style={{ transform: `translateY(${-6 * wackeln}px)` }}>
      <defs>
        <clipPath id={clipId}>
          <rect x="68" y={FEED_OBEN} width="64" height={FEED_UNTEN - FEED_OBEN} />
        </clipPath>
      </defs>
      <rect
        x="58"
        y="20"
        width="84"
        height="160"
        rx="18"
        stroke={FARBEN.neben}
        strokeWidth={7}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
      <line x1="90" y1="32" x2="110" y2="32" stroke={FARBEN.neben} strokeWidth={5} opacity={p} />
      <line x1="92" y1="168" x2="108" y2="168" stroke={FARBEN.neben} strokeWidth={5} opacity={p} />
      <g clipPath={`url(#${clipId})`} opacity={inhalt}>
        {elemente}
      </g>
    </Svg>
  );
};

export const Grafik: React.FC<{ name?: GrafikName; groesse?: number; szene?: Szene; sofort?: boolean }> = ({
  name = 'keine',
  groesse = 520,
  ...rest
}) => {
  const props = { groesse, ...rest };
  switch (name) {
    case 'gehirn':
      return <GehirnGross {...props} />;
    case 'gehirn-vorne':
      return <GehirnVorne {...props} />;
    case 'welle':
      return <Welle {...props} />;
    case 'sprechblase':
      return <Sprechblase {...props} />;
    case 'herz':
      return <Herz {...props} />;
    case 'keks':
      return <Keks {...props} />;
    case 'zusammen':
      return <Zusammen {...props} />;
    case 'handy':
      return <Handy {...props} />;
    default:
      return null;
  }
};
