import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FARBEN, INHALT_BREITE, KANAL, RAND, SCHRIFT } from '../brand';
import { Grafik } from '../components/Grafik';
import { Gehirn } from '../components/Gehirn';
import { HighlightText } from '../components/HighlightText';
import { Untertitel } from '../components/Untertitel';
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

const Titel: React.FC<{ szene: Szene; groesse: number; verzoegerung?: number }> = ({ szene, groesse, verzoegerung = 0 }) => {
  const s = useAuftauchen(verzoegerung);
  return (
    <div style={{ fontSize: groesse, lineHeight: 1.08, letterSpacing: -1, textWrap: 'balance', transform: `scale(${0.85 + 0.15 * s})`, opacity: s }}>
      <HighlightText text={szene.titel} highlight={szene.highlight} />
    </div>
  );
};

export const Hook: React.FC<Props> = ({ szene }) => (
  <>
    <Block oben={330}>
      <Grafik name={szene.grafik ?? 'gehirn'} groesse={400} />
    </Block>
    <Block oben={780}>
      <Titel szene={szene} groesse={88} verzoegerung={0.1} />
    </Block>
    <Untertitel text={szene.sprechtext} woerter={szene.woerter} dauer={szene.dauer} />
  </>
);

export const Schritt: React.FC<Props> = ({ szene, schrittNr = 1, schritteGesamt = 1 }) => (
  <>
    <Block oben={320} style={{ gap: 36 }}>
      <Etikett text={`${schrittNr} / ${schritteGesamt}`} />
      <Titel szene={szene} groesse={78} />
    </Block>
    <Block oben={620}>
      <Grafik name={szene.grafik} groesse={540} />
    </Block>
    <Untertitel text={szene.sprechtext} woerter={szene.woerter} dauer={szene.dauer} />
  </>
);

export const Beispiel: React.FC<Props> = ({ szene }) => (
  <>
    <Block oben={szene.grafik && szene.grafik !== 'keine' ? 320 : 560} style={{ gap: 48 }}>
      <Etikett text="Im Alltag" />
      <Titel szene={szene} groesse={84} verzoegerung={0.15} />
    </Block>
    {szene.grafik && szene.grafik !== 'keine' ? (
      <Block oben={780}>
        <Grafik name={szene.grafik} groesse={400} />
      </Block>
    ) : null}
    <Untertitel text={szene.sprechtext} woerter={szene.woerter} dauer={szene.dauer} />
  </>
);

export const Merke: React.FC<Props> = ({ szene }) => {
  const s = useAuftauchen(0.1);
  return (
    <>
      <Block oben={480}>
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
            <HighlightText text={szene.titel} highlight={szene.highlight} />
          </div>
        </div>
      </Block>
      <Untertitel text={szene.sprechtext} woerter={szene.woerter} dauer={szene.dauer} />
    </>
  );
};

export const Outro: React.FC<Props> = ({ szene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = Math.min(1, frame / (1.2 * fps));
  const knopf = useAuftauchen(0.8);
  return (
    <>
      <Block oben={340}>
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
          }}
        >
          Folge für mehr
        </div>
        <div style={{ fontSize: 36, color: FARBEN.neben }}>@{KANAL}</div>
      </Block>
    </>
  );
};
