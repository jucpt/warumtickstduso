export type GrafikName =
  | 'gehirn'
  | 'gehirn-vorne'
  | 'welle'
  | 'sprechblase'
  | 'herz'
  | 'keks'
  | 'zusammen'
  | 'handy'
  | 'keine';

export type SzenenTyp = 'hook' | 'schritt' | 'beispiel' | 'merke' | 'outro';

export type Wort = { wort: string; start: number; ende: number };

export type Szene = {
  typ: SzenenTyp;
  /** Text, der groß im Bild steht */
  titel: string;
  /** Teil des Titels, der gelb hervorgehoben wird (genau so geschrieben wie im Titel) */
  highlight?: string;
  grafik?: GrafikName;
  /** Gesprochenes Wort, bei dem das Highlight aufleuchtet (Standard: das Highlight selbst, falls gesprochen) */
  betonung?: string;
  /** Gesprochene Wörter, bei denen die Grafik reagiert (Reihenfolge je Grafik, siehe CLAUDE.md) */
  momente?: string[];
  /** Was gesprochen wird – daraus entstehen die Untertitel */
  sprechtext: string;
  /** Länge in Sekunden (wird von `npm run stimme` automatisch gesetzt) */
  dauer: number;
  /** Pfad unter public/, z. B. audio/folge-01/szene-1.mp3 */
  audio?: string;
  /** Wort-Zeitstempel in Sekunden ab Szenenbeginn (von `npm run stimme`) */
  woerter?: Wort[];
};

export type Folge = {
  nummer: number;
  thema: string;
  /** Optionale Hintergrundmusik unter public/, z. B. musik/ruhig.mp3 */
  musik?: string;
  szenen: Szene[];
};
