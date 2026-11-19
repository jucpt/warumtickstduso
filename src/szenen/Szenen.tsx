import React from 'react';
import { AbsoluteFill, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FARBEN, INHALT_BREITE, KANAL, RAND, SCHRIFT } from '../brand';
import { Grafik } from '../components/Grafik';
import { Gehirn } from '../components/Gehirn';
import { KinetikText, markerFrame } from '../components/HighlightText';
import { Sound } from '../components/Sound';
import { Untertitel } from '../components/Untertitel';
import { Szene } from '../types';

type Props = { szene: Szene; schrittNr?: number; schritteGesamt?: number };

const useFeder = (verzoegerungFrames = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - verzoegerungFrames, fps, config: { damping, mass: 0.7 } });
};

const Block: React.FC<{ oben: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ oben, children, style }) => (
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

const Etikett: React.FC<{ text: string; hell?: boolean; verzoegerung?: number }> = ({ text, hell, verzoegerung = 0 }) => {
  const s = useFeder(verzoegerung, 9);
  return (
    <div
      style={{
        fontFamily: SCHRIFT,
        fontWeight: 800,
        fontSize: 34,
        padding: '10px 28px',
        borderRadius: 999,
        backgroundColor: hell ? FARBEN.highlight : FARBEN.akzent,
        color: FARBEN.hintergrund,
        transform: `scale(${s}) rotate(${(1 - s) * -8}deg)`,
      }}
    >
      {text}
    </div>
  );
};

const Titel: React.FC<{ szene: Szene; groesse: number; start?: number; abstand?: number }> = ({ szene, groesse, start = 0, abstand = 3 }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      <div style={{ fontSize: groesse, lineHeight: 1.12, letterSpacing: -1, textWrap: 'balance' }}>
        <KinetikText text={szene.titel} highlight={szene.highlight} startFrame={start} abstand={abstand} />
      </div>
      {szene.highlight ? <Sound name="pop" bei={markerFrame(szene.titel, szene.highlight, start, abstand, fps)} /> : null}
    </>
  );
};

// Grafik mit verzögertem Start und einem „Zoom-Punch“ zur Szenenmitte, der die Aufmerksamkeit zurückholt.
const GrafikMitPunch: React.FC<{ szene: Szene; groesse: number; startFrames: number }> = ({ szene, groesse, startFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mitte = Math.round((szene.dauer * fps) / 2);
  const punch = 1 + 0.08 * Math.exp(-(((frame - mitte) / 5) ** 2));
  return (
    <div style={{ transform: `scale(${punch})` }}>
      <Sequence from={startFrames} layout="none">
        <Grafik name={szene.grafik} groesse={groesse} szene={szene} versatz={startFrames / fps} />
      </Sequence>
    </div>
  );
};

// HOOK: Frame 0 ist schon voll. Einschlag mit Zoom, kurzem Wackeln und Lichtblitz, Wörter knallen im Takt rein.
export const Hook: React.FC<Props> = ({ szene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const einschlag = spring({ frame: frame + 2, fps, config: { damping: 10, mass: 0.6 } });
  const zoom = 1.22 - 0.22 * einschlag;
  const wackeln = frame < 10 ? (1 - frame / 10) * 14 : 0;
  const dx = (random(`dx${frame}`) - 0.5) * wackeln;
  const dy = (random(`dy${frame}`) - 0.5) * wackeln;
  const blitz = interpolate(frame, [0, 4], [0.15, 0], { extrapolateRight: 'clamp' });
  return (
    <>
      <Sound name="boom" bei={0} />
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${zoom})` }}>
        <Block oben={330}>
          <Sequence from={8} layout="none">
            <Grafik name={szene.grafik ?? 'gehirn'} groesse={400} szene={szene} versatz={8 / fps} />
          </Sequence>
        </Block>
        <Block oben={780}>
          <Titel szene={szene} groesse={92} start={-14} abstand={2} />
        </Block>
      </AbsoluteFill>
      <Untertitel text={szene.sprechtext} woerter={szene.woerter} dauer={szene.dauer} />
      <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity: blitz }} />
    </>
  );
};

export const Schritt: React.FC<Props> = ({ szene, schrittNr = 1, schritteGesamt = 1 }) => (
  <>
    <Sound name="klick" bei={3} />
    <Block oben={320} style={{ gap: 36 }}>
      <Etikett text={`${schrittNr} / ${schritteGesamt}`} verzoegerung={1} />
      <Titel szene={szene} groesse={78} start={3} />
    </Block>
    <Block oben={620}>
      <GrafikMitPunch szene={szene} groesse={540} startFrames={5} />
    </Block>
    <Untertitel text={szene.sprechtext} woerter={szene.woerter} dauer={szene.dauer} />
  </>
);

export const Beispiel: React.FC<Props> = ({ szene }) => {
  const mitGrafik = szene.grafik && szene.grafik !== 'keine';
  return (
    <>
      <Block oben={mitGrafik ? 320 : 560} style={{ gap: 48 }}>
        <Etikett text="Im Alltag" verzoegerung={1} />
        <Titel szene={szene} groesse={84} start={3} />
      </Block>
      {mitGrafik ? (
        <Block oben={800}>
          <GrafikMitPunch szene={szene} groesse={400} startFrames={10} />
        </Block>
      ) : null}
      <Untertitel text={szene.sprechtext} woerter={szene.woerter} dauer={szene.dauer} />
    </>
  );
};

export const Merke: React.FC<Props> = ({ szene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useFeder(2, 11);
  const glow = 0.35 + 0.25 * Math.sin((frame / fps) * Math.PI * 1.2);
  // Optional mit Grafik unter der Karte (z. B. Stoppuhr in Folge 2): Karte rutscht dann nach oben
  const mitGrafik = szene.grafik && szene.grafik !== 'keine';
  return (
    <>
      <Sound name="ding" bei={4} />
      <Block oben={mitGrafik ? 330 : 480}>
        <div
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '64px 56px',
            borderRadius: 44,
            backgroundColor: FARBEN.flaeche,
            border: `5px solid ${FARBEN.akzent}`,
            boxShadow: `0 0 60px rgba(192, 132, 252, ${glow})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 40,
            transform: `scale(${0.7 + 0.3 * s}) rotate(${(1 - s) * 3}deg)`,
            opacity: Math.min(1, s * 1.5),
          }}
        >
          <Etikett text="Merke" hell verzoegerung={8} />
          <div style={{ fontSize: 76, lineHeight: 1.14, letterSpacing: -1, textWrap: 'balance' }}>
            <KinetikText text={szene.titel} highlight={szene.highlight} startFrame={12} abstand={3} />
          </div>
        </div>
      </Block>
      {mitGrafik ? (
        <Block oben={870}>
          <GrafikMitPunch szene={szene} groesse={380} startFrames={14} />
        </Block>
      ) : null}
      {szene.highlight ? <Sound name="pop" bei={markerFrame(szene.titel, szene.highlight, 12, 3, fps)} /> : null}
      <Untertitel text={szene.sprechtext} woerter={szene.woerter} dauer={szene.dauer} />
    </>
  );
};

export const Outro: React.FC<Props> = ({ szene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = Math.min(1, frame / (1.1 * fps));
  const knopf = useFeder(Math.round(0.8 * fps), 9);
  const puls = 1 + 0.04 * Math.sin((frame / fps) * Math.PI * 2.4) * knopf;
  return (
    <>
      <Block oben={340}>
        <Gehirn groesse={340} fortschritt={logo} impulse />
      </Block>
      <Block oben={760}>
        <Titel szene={szene} groesse={80} start={4} />
      </Block>
      <Untertitel text={szene.sprechtext} woerter={szene.woerter} dauer={szene.dauer} oben={1110} />
      <Sound name="pop" bei={Math.round(0.8 * fps)} />
      <Block oben={1300} style={{ gap: 20, opacity: Math.min(1, knopf * 1.5), transform: `scale(${(0.6 + 0.4 * knopf) * puls})` }}>
        <div style={{ fontSize: 48, padding: '20px 48px', borderRadius: 999, backgroundColor: FARBEN.akzent, color: FARBEN.hintergrund }}>
          Folge für mehr
        </div>
        <div style={{ fontSize: 36, color: FARBEN.neben }}>@{KANAL}</div>
      </Block>
    </>
  );
};
