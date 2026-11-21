# warum tickst du so? – Kurzvideo-Studio

Remotion-Projekt für den Kanal **@warumtickstduso** (TikTok, YouTube Shorts, Instagram Reels): Psychologie einfach erklärt.
Juli ist angehender Erzieher und hat Erfahrung in der Kinder- und Jugendpsychiatrie. Antworte auf Deutsch, kurz und direkt.

## Stand der Folgen

| Folge | Thema | Stand |
|---|---|---|
| #1 | Warum rastet DEIN Kind sofort aus? (Wutanfälle) | fertig (Julis Stimme, Adobe-verbessert, 61,9 s) |
| #2 | Warum kannst DU nicht aufhören zu scrollen? | fertig (Julis Stimme, 69,8 s) |
| #3 | Sagst DU auch „Hör auf zu weinen“? (Ko-Regulation) | fertig (Julis Stimme, 63,1 s) |
| #4 | Denkst DU, alle schauen dich an? (Spotlight-Effekt) | fertig (Julis Stimme, 63,0 s) |
| #5 | Ist DEIN Kind morgens nur faul? (Teenager-Schlaf) | fertig (Julis Stimme, 65,1 s) |
| #6 | Schaust DU schlechte Filme zu Ende? (Sunk Cost) | fertig (Julis Stimme, 65,3 s) |

Diese Tabelle nach jeder fertigen Folge aktualisieren. Themen im Wechsel: Kinder-Themen und Themen für alle (z. B. Spotlight-Effekt, Sunk Cost, Prokrastination, Teenager-Schlaf).

## Grundregeln

- **Stil nie neu erfinden.** Farben, Schrift, Sounds und Abstände stehen in `src/brand.ts`, die Szenen-Layouts in `src/szenen/Szenen.tsx`. Neue Folgen ändern nur Inhalte (JSON). Ausnahme: neue Grafiken (siehe unten).
- **Juli ist der Autor.** Skripte schreibt Juli selbst oder du lieferst einen Entwurf, den er prüft. Nichts ohne sein OK rendern.
- **Fakten:** nur gesicherte Psychologie, keine Mythen, keine Diagnosen, kein Wort „Sucht“ ohne Grundlage. Zahlen (Alter, Prozent) nur mit seriöser Quelle. Bei Unsicherheit im Entwurf markieren: `[PRÜFEN: …]`.
- **Niemals echte Fälle** aus Kita oder Klinik erzählen, auch nicht anonymisiert (Schweigepflicht).
- **Keine Stockfotos, keine KI-Bilder.** Nur Linien-Grafiken im Logo-Stil aus `src/components/Grafik.tsx`.
- API-Schlüssel nur in `.env`, nie im Code oder Chat.

## Aufmerksamkeit: Es muss IMMER etwas passieren

Ziel: Niemand wischt weg. Deshalb gilt in jedem Video:

- **Kein Stillstand:** Jede Grafik zeichnet sich erst selbst und bewegt sich danach dauerhaft weiter (Impulse, Pulsieren, Fließen, Schweben). Spätestens alle 2–3 Sekunden passiert etwas Neues im Bild (neue Untertitel-Gruppe, Marker, Grafik-Punch, Szenenwechsel).
- **Schon eingebaut (nicht entfernen):** kinetischer Titel Wort für Wort, gelber Marker über dem Highlight, springende Untertitel, Lichtpunkte im Hintergrund, leichter Kamera-Zoom, Zoom-Punch der Grafik zur Szenenmitte, drei abwechselnde Übergänge, Fortschrittsbalken direkt unter den Untertiteln (knapp über dem sicheren Bereich unten).
- **Szenen kurz halten:** eine Szene höchstens ca. 15 Sekunden. Ist ein Sprechtext länger, auf zwei Szenen aufteilen.
- **Jeder Schritt bekommt eine passende Grafik.** Passt keine der vorhandenen (`gehirn`, `gehirn-vorne`, `welle`, `sprechblase`, `herz`, `handy`, `keks`, `zusammen`, `spielautomat`, `stoppuhr`, `turm`, `scheinwerfer`, `torte`, `stolpern`, `uhr`, `akku`, `bett`, `sonne`, `fernseher`, `muenzen`, `waage`, `teller`, `wegweiser`), baue eine neue in `Grafik.tsx` nach dem gleichen Muster: Linien-Stil (runde Enden, Strichstärke 5–7, Farben aus `FARBEN`), erst selbst zeichnen, dann Dauerbewegung, gerne mit gelbem Lichtpunkt als Blickfang. Vorbilder: `Herz`, `Welle`, `Handy`. Neue Namen in `types.ts` bei `GrafikName` eintragen und hier in der Liste ergänzen.
- **Grafiken, die auf Wörter reagieren:** `keks`, `zusammen`, `spielautomat`, `stoppuhr`, `turm`, `scheinwerfer`, `torte`, `stolpern`, `uhr`, `akku`, `bett`, `sonne`, `fernseher`, `muenzen`, `waage`, `teller` und `wegweiser` lösen Ereignisse bei gesprochenen Wörtern aus (Zeiten aus `src/components/momente.ts`). Welche Wörter, steht optional in der Szene bei `momente` (sonst Standardwörter bzw. das Highlight):
  `keks` [bricht, Hälften kippen] · `zusammen` [Herz erscheint, Schlag 1–3] · `spielautomat` [Hebel ziehen, Gewinn mit drei Herzen, zweiter Zug] · `stoppuhr` [startet, stoppt] · `turm` [kippt um, Herz erscheint] · `scheinwerfer` [Kegel blitzt auf] · `torte` [füllt 50 %, schrumpft auf 25 %] · `stolpern` [stolpert, Gedankenwolke zerplatzt] · `uhr` [Zeiger springen vor, Sonne wird Mond] · `akku` [fällt auf Rest und blinkt] · `bett` [Augen weit auf, Wecker klingelt und Morgen] · `sonne` [geht auf, geht unter mit Mond und dunklem Handy] · `fernseher` [gelangweiltes Gesicht] · `muenzen` [Schwall Münzen] · `waage` [links Verlust kippt stark, rechts Gewinn hebt nur halb] · `teller` [Nachschlag stapelt sich, Bauchweh] · `wegweiser` [Pfeil zurück durchgestrichen, Pfeil nach vorne leuchtet]
- `beispiel` und `merke` dürfen ebenfalls eine Grafik haben (bei `merke` erscheint sie unter der Karte).

## Hook-Regeln (die ersten 2 Sekunden entscheiden alles)

- **Immer direkte Du-Ansprache.** Das Du-Wort ist das Highlight und steht im Titel in Großbuchstaben: „DU“ oder „DEIN Kind“. „DEIN Kind“ nur bei Kinderthemen, sonst schließen wir Leute ohne Kinder aus.
- Der erste gesprochene Satz hat **höchstens 8 Wörter** und funktioniert ohne Vorwissen. Der Titel im Bild hat höchstens ca. 6 Wörter.
- **Keine Begrüßung**, kein „Heute erkläre ich euch …“, kein Kanal-Intro.
- Bewährte Muster (eins pro Folge):
  1. **Frage an dich:** „Warum rastet dein Kind bei Kleinigkeiten sofort aus?“
  2. **Ertappt:** „Du hast heute schon zehnmal dein Handy entsperrt.“
  3. **Widerspruch:** „Dein Kind ist nicht frech. Sein Gehirn ist nur noch nicht fertig.“
  4. **Mythos knacken:** „Du nutzt nur 10 % deines Gehirns? Falsch.“
  5. **Warnung:** „Sagst du auch ‚Hör auf zu weinen‘? Das macht es oft schlimmer.“
- Optional ein offenes Versprechen, das erst am Ende eingelöst wird: „Der dritte Grund überrascht die meisten.“
- Technik (schon eingebaut): Frame 0 ist sofort gefüllt, Einschlag mit Zoom und Wackeln, Boom-Sound, Marker nach ca. 0,3 s.

## Eine neue Folge bauen – immer dieser Ablauf

1. **Skript:** Juli gibt Thema und Skript, oder du schreibst einen Entwurf nach den Regeln hier.
2. **Datei:** `src/folgen/folge-XX.json` anlegen (Vorlage: `folge-01.json`) und in `src/folgen/index.ts` eintragen.
3. **Aufbau**, immer in dieser Reihenfolge:
   - `hook` – nach den Hook-Regeln
   - `schritt` × 2–3 – je ein Gedanke mit eigener Grafik
   - `beispiel` – Alltagssituation, gerne mit „du“
   - `merke` – der eine Satz, der hängen bleibt
   - `outro` – Frage an die Zuschauer mit „du“, damit kommentiert wird
4. **Felder pro Szene:** `typ`, `titel` (kurz, steht im Bild), `highlight` (genau so geschrieben wie im Titel, 1–3 Wörter), `grafik`, `sprechtext`, `dauer` (Sekunden, grob: Wörter ÷ 2,3 + 0,5).
5. **Länge:** 61–90 Sekunden gesamt (TikTok vergütet nur Videos über 1 Minute), Sprechtext ca. 150–200 Wörter.
6. **Storyboard** als Tabelle zeigen (Szene, Titel, Highlight, Grafik, Sprechtext, Dauer) und auf Julis OK warten.
7. **Stimme:**
   - ElevenLabs: `npm run stimme -- XX` (erzeugt pro Szene eine MP3, setzt Dauer und Wort-Zeitstempel für die Untertitel).
   - Oder Julis eigene Aufnahme: MP3s nach `public/audio/folge-XX/szene-N.mp3`, bei jeder Szene `"audio"` eintragen und `dauer` an die Länge anpassen (mit ffprobe messen, sonst Juli fragen). Hat Juli alles in einer Datei mit Pausen aufgenommen, die Datei an den Pausen schneiden (ffmpeg `silencedetect`).
   - Danach prüfen: Gesamtlänge über 61 Sekunden? Sonst Ergänzungen vorschlagen.
   - **Adobe-verbesserte Stimme nachträglich einsetzen** (Folge 1 erledigt, 2–6 folgen): Juli legt die verbesserten WAVs nach `public/audio/folge-XX/`. Sie sind sampelgenau gleich lang wie `original/szene-N.m4a`. Die aktuellen `szene-N.mp3` sind nur ein Ausschnitt daraus (kein Tempo, keine Schnitte innen). Startversatz per Kreuzkorrelation Original ↔ aktuelle MP3 bestimmen, WAV mit gleichem Start und gleicher Länge schneiden (20 ms Fade-in, 30 ms Fade-out), dann bleiben `dauer` und `woerter` unverändert gültig. Lautheit: **-19,3 LUFS** pro Szene, True Peak unter -1,5 dBTP (Gain + `alimiter`), MP3 44,1 kHz mono 160 kbit/s. Ablage: WAVs nach `adobe-verbessert/szene-N.wav`, alte MP3s nach `vor-adobe/`. Danach Versatz neu ↔ alt prüfen (Folge 1: unter 16 ms) und neu rendern.
   - Rendern in der Cloud: Chrome-Download ist blockiert, deshalb `--browser-executable=/opt/pw-browsers/chromium_headless_shell` an `npx remotion render`/`still` anhängen.
8. **Vorschau:** `npm start`, Juli schaut sie an.
9. **Rendern** nach seinem OK: `npm run render -- XX` → `out/folge-XX.mp4` und `out/folge-XX-cover.png`.
10. **Stand-Tabelle** oben aktualisieren.

## Sounds

- Liegen in `public/sfx/`, eingetragen in `SOUNDS` in `src/brand.ts`, Lautstärken in `LAUTSTAERKE`. Automatisch gesetzt: `wusch` bei jedem Szenenwechsel, `boom` im ersten Frame, `pop` beim Highlight-Marker und beim Folgen-Button, `ding` bei der Merke-Karte, `klick` beim Schritt-Etikett.
- Eigener Sound: Datei nach `public/sfx/` legen und den Pfad in `SOUNDS` eintragen. `null` schaltet einen Sound ab.
- Nur lizenzfreie Soundeffekte (z. B. Pixabay, Mixkit; YouTube Audio Library nur für YouTube).
- **Niemals Songs oder Trend-Sounds in die Videodatei einbauen.** Musik fügt Juli beim Hochladen direkt in der jeweiligen App hinzu.

## Beim Hochladen (Erinnerung für Juli)

- Mit ElevenLabs-Stimme beim Hochladen das KI-Label setzen (YouTube: „Altered content“, TikTok: KI-Kennzeichnung).
- Cover aus `out/` als Titelbild wählen.
- Musik nur aus der App-Bibliothek, bei Werbe- oder Kooperations-Posts nur kommerziell freigegebene Musik.

## Befehle

| Was | Befehl |
|---|---|
| Vorschau im Browser | `npm start` |
| Stimme per ElevenLabs erzeugen | `npm run stimme -- 3` |
| Video + Cover rendern nach `out/` | `npm run render -- 3` |
| Typen prüfen | `npm run typecheck` |

## Wo was liegt

| Datei | Inhalt |
|---|---|
| `src/brand.ts` | Farben, Schrift, sicherer Bereich, Sounds |
| `src/folgen/` | eine JSON pro Folge + `index.ts` |
| `src/szenen/Szenen.tsx` | Layout von Hook, Schritt, Beispiel, Merke, Outro |
| `src/components/Grafik.tsx` | alle animierten Grafiken |
| `src/components/Gehirn.tsx` | das Logo-Gehirn mit Lichtimpulsen |
| `src/components/HighlightText.tsx` | kinetischer Text mit Marker |
| `src/components/Untertitel.tsx` | Untertitel |
| `src/components/Rahmen.tsx` | Hintergrund, Branding, Fortschrittsbalken (unter den Untertiteln), Übergänge |
| `src/components/Sound.tsx` | Soundeffekte |
| `src/Cover.tsx` | Titelbild |
| `scripts/stimme.mjs`, `scripts/render.mjs` | Stimme und Rendern |

## Sicherer Bereich (nicht ändern)

Oben ca. 300 px (App-Tabs), rechts ca. 150 px (Buttons), unten ca. 420 px (Beschreibung, Musikzeile) bleiben frei. Siehe `RAND` in `src/brand.ts`.
