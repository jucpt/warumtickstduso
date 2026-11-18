import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FARBEN, INHALT_BREITE, KANAL, RAND, SCHRIFT } from '../brand';
import { Grafik } from '../components/Grafik';
import { Gehirn } from '../components/Gehirn';
import { HighlightText } from '../components/HighlightText';
import { Untertitel } from '../components/Untertitel';
import { ausschlag, betonungsZeit, wortStart, zucken } from '../components/momente';
import { Szene } from '../types';

type Props = { szene: Szene; schrittNr?: number; schritteGesamt?: number };

const useAuftauchen = (verzoegerungSek = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - verzoegerungSek * fps, fps, config: { damping: 14, mass: 0.8 } });
};

const Block: React.FC<{ oben: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  oben,
  children,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      top: oben,
      left: RAND.links,
      width: INHALT_BREITE,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      fontFamily: SCHRIFT,
      fontWeight: 800,
      color: FARBEN.text,
      ...style,
    }}
  >
    {children}
  </div>
);

const Etikett: React.FC<{ text: string; hell?: boolean }> = ({ text, hell }) => (
  <div
    style={{
      fontFamily: SCHRIFT,
      fontWeight: 800,
      fontSize: 34,
      padding: '10px 28px',
      borderRadius: 999,
      backgroundColor: hell ? FARBEN.highlight : FARBEN.akzent,
      color: FARBEN.hintergrund,
    }}
  >
    {text}
  </div>
);

/** 0–1: das gelbe Wort leuchtet auf, wenn es gesprochen wird. */
const useBetonung = (szene: Szene) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return ausschlag(frame / fps, betonungsZeit(szene), 0.8);
};

const Titel: React.FC<{ szene: Szene; groesse: number; verzoegerung?: number; sofort?: boolean }> = ({
  szene,
  groesse,
  verzoegerung = 0,
  sofort,
}) => {
  const s = useAuftauchen(verzoegerung);
  const puls = useBetonung(szene);
  // sofort: ab dem ersten Bild voll sichtbar, nur ein kleiner „Punch“ (für den Hook)
  const skala = sofort ? 1.06 - 0.06 * s : 0.85 + 0.15 * s;
  return (
    <div style={{ fontSize: groesse, lineHeight: 1.08, letterSpacing: -1, textWrap: 'balance', transform: `scale(${skala})`, opacity: sofort ? 1 : s }}>
      <HighlightText text={szene.titel} highlight={szene.highlight} puls={puls} />
    </div>
  );
};

const hatGrafik = (szene: Szene) => !!szene.grafik && szene.grafik !== 'keine';

export const Hook: React.FC<Props> = ({ szene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Gehirn zuckt sofort und noch einmal beim Ausrasten
  const ausraster = wortStart(szene, szene.betonung) ?? wortStart(szene, 'komplett');
  const dreh = zucken(t, 0, 7) + zucken(t, ausraster, 6);
  return (
    <>
      <Block oben={330} style={{ transform: `rotate(${dreh}deg)` }}>
        <Grafik name={szene.grafik ?? 'gehirn'} groesse={400} szene={szene} sofort />
      </Block>
      <Block oben={780}>
        <Titel szene={szene} groesse={88} sofort />
      </Block>
      <Untertitel text={szene.sprechtext} woerter={szene.woerter} dauer={szene.dauer} />
    </>
  );
};

export const Schritt: React.FC<Props> = ({ szene, schrittNr = 1, schritteGesamt = 1 }) => (
  <>
    <Block oben={320} style={{ gap: 36 }}>
      <Etikett text={`${schrittNr} / ${schritteGesamt}`} />
      <Titel szene={szene} groesse={78} />
    </Block>
    <Block oben={620}>
      <Grafik name={szene.grafik} groesse={540} szene={szene} />
    </Block>
    <Untertitel text={szene.sprechtext} woerter={szene.woerter} dauer={szene.dauer} />
  </>
);

export const Beispiel: React.FC<Props> = ({ szene }) => (
  <>
    <Block oben={hatGrafik(szene) ? 320 : 560} style={{ gap: 48 }}>
      <Etikett text="Im Alltag" />
      <Titel szene={szene} groesse={84} verzoegerung={0.15} />
    </Block>
    {hatGrafik(szene) ? (
      <Block oben={790}>
        <Grafik name={szene.grafik} groesse={420} szene={szene} />
      </Block>
    ) : null}
    <Untertitel text={szene.sprechtext} woerter={szene.woerter} dauer={szene.dauer} />
  </>
);

export const Merke: React.FC<Props> = ({ szene }) => {
  const s = useAuftauchen(0.1);
  const puls = useBetonung(szene);
  const mitGrafik = hatGrafik(szene);
  return (
    <>
      <Block oben={mitGrafik ? 330 : 480}>
        <div
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '64px 56px',
            borderRadius: 44,
            backgroundColor: FARBEN.flaeche,
            border: `5px solid ${FARBEN.akzent}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 40,
            transform: `scale(${0.9 + 0.1 * s})`,
            opacity: s,
          }}
        >
          <Etikett text="Merke" hell />
          <div style={{ fontSize: 76, lineHeight: 1.12, letterSpacing: -1, textWrap: 'balance' }}>
            <HighlightText text={szene.titel} highlight={szene.highlight} puls={puls} />
          </div>
        </div>
      </Block>
      {mitGrafik ? (
        <Block oben={860}>
          <Grafik name={szene.grafik} groesse={400} szene={szene} />
        </Block>
      ) : null}
      <Untertitel text={szene.sprechtext} woerter={szene.woerter} dauer={szene.dauer} />
    </>
  );
};

export const Outro: React.FC<Props> = ({ szene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const logo = Math.min(1, frame / (1.2 * fps));
  const knopf = useAuftauchen(0.8);
  // Logo schwebt leicht, der Knopf pulsiert – das Outro bleibt lebendig, auch wenn es länger steht
  const schweben = Math.sin(t * 2.2) * 10;
  const knopfPuls = t > 1.5 ? 1 + 0.05 * Math.max(0, Math.sin((t - 1.5) * 4)) : 1;
  return (
    <>
      <Block oben={340} style={{ transform: `translateY(${schweben}px)` }}>
        <Gehirn groesse={340} fortschritt={logo} />
      </Block>
      <Block oben={760}>
        <Titel szene={szene} groesse={80} />
      </Block>
      <Untertitel text={szene.sprechtext} woerter={szene.woerter} dauer={szene.dauer} oben={1110} />
      <Block oben={1300} style={{ gap: 20, opacity: knopf, transform: `scale(${0.8 + 0.2 * knopf})` }}>
        <div
          style={{
            fontSize: 48,
            padding: '20px 48px',
            borderRadius: 999,
            backgroundColor: FARBEN.akzent,
            color: FARBEN.hintergrund,
            transform: `scale(${knopfPuls})`,
          }}
        >
          Folge für mehr
        </div>
        <div style={{ fontSize: 36, color: FARBEN.neben }}>@{KANAL}</div>
      </Block>
    </>
  );
};
