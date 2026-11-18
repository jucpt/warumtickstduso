import { Szene, Wort } from '../types';

// Zeitpunkte innerhalb einer Szene: Wann wird welches Wort gesprochen?
// Damit reagieren Grafiken und Highlights genau auf die Stimme.

/** Wort-Zeiten der Szene. Ohne Zeitstempel werden die Wörter gleichmäßig verteilt. */
export const wortZeiten = (szene: Szene): Wort[] => {
  if (szene.woerter && szene.woerter.length) return szene.woerter;
  const teile = szene.sprechtext.split(/\s+/).filter(Boolean);
  const proWort = Math.max(0.5, szene.dauer - 0.6) / teile.length;
  return teile.map((wort, i) => ({ wort, start: 0.2 + i * proWort, ende: 0.2 + (i + 1) * proWort }));
};

const norm = (w: string) => w.toLowerCase().replace(/[^a-zäöüß0-9]/g, '');

/** Sekunde (ab Szenenbeginn), in der `suche` gesprochen wird – oder null. */
export const wortStart = (szene: Szene, suche?: string): number | null => {
  if (!suche) return null;
  const ziel = suche.split(/\s+/).map(norm).filter(Boolean);
  if (!ziel.length) return null;
  const zeiten = wortZeiten(szene);
  const woerter = zeiten.map((w) => norm(w.wort));
  for (let i = 0; i + ziel.length <= woerter.length; i++) {
    if (ziel.every((z, j) => woerter[i + j].startsWith(z))) return zeiten[i].start;
  }
  return null;
};

/** Zeitpunkt, an dem das gelbe Wort im Titel aufleuchtet. */
export const betonungsZeit = (szene: Szene): number =>
  wortStart(szene, szene.betonung) ?? wortStart(szene, szene.highlight) ?? 0.8;

/** Kurzer Ausschlag 0 → 1 → 0 ab Sekunde `t0` (schnell hoch, weich wieder runter). */
export const ausschlag = (t: number, t0: number | null, dauer = 0.7): number => {
  if (t0 === null || t < t0) return 0;
  const x = t - t0;
  if (x < 0.12) return x / 0.12;
  const r = 1 - (x - 0.12) / (dauer - 0.12);
  return r > 0 ? r * r : 0;
};

/** Weicher Übergang 0 → 1 ab Sekunde `t0`. */
export const ab = (t: number, t0: number | null, dauer = 0.4): number => {
  if (t0 === null || t < t0) return 0;
  const x = Math.min(1, (t - t0) / dauer);
  return 1 - (1 - x) ** 3;
};

/** Zucken (Grad), das schnell abklingt – z. B. für „Ausrasten“ oder „Bremse“. */
export const zucken = (t: number, t0: number | null, staerke = 6): number => {
  if (t0 === null || t < t0) return 0;
  const x = t - t0;
  return Math.sin(x * 38) * Math.exp(-x * 6) * staerke;
};
