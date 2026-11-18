// Markenregeln von „warum tickst du so?“ – hier zentral ändern, nie in den Szenen.
import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

export const FARBEN = {
  hintergrund: '#2E1065', // Dunkellila
  flaeche: '#3B0764', // etwas heller, für Karten und Deko
  linie: '#4C1D95', // dezente Deko-Linien
  text: '#FFFFFF',
  neben: '#E9D5FF', // Hellflieder für Nebentext und Logo-Umriss
  akzent: '#C084FC', // Lila: gesprochenes Wort, Grafiken
  highlight: '#FACC15', // Gelb: nur EIN Schlüsselwort pro Szene
};

export const FPS = 30;
export const BREITE = 1080;
export const HOEHE = 1920;

// Sicherer Bereich: oben die Tabs der Apps, rechts die Buttons, unten Beschreibung und Musikzeile.
export const RAND = { links: 80, rechts: 150, oben: 300, unten: 420 };
export const INHALT_BREITE = BREITE - RAND.links - RAND.rechts;

export const SCHRIFT = "'Nunito', sans-serif";

export const ladeSchrift = () =>
  Promise.all([
    loadFont({ family: 'Nunito', url: staticFile('fonts/nunito-latin-700-normal.woff2'), weight: '700' }),
    loadFont({ family: 'Nunito', url: staticFile('fonts/nunito-latin-800-normal.woff2'), weight: '800' }),
  ]);

export const KANAL = 'warumtickstduso';
