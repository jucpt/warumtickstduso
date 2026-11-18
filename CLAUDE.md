# warum tickst du so? – Kurzvideo-Studio

Remotion-Projekt für den Kanal **@warumtickstduso** (TikTok, YouTube Shorts, Instagram Reels): Psychologie einfach erklärt.
Juli ist angehender Erzieher und hat Erfahrung in der Kinder- und Jugendpsychiatrie. Antworte auf Deutsch, kurz und direkt.

## Grundregeln

- **Stil nie neu erfinden.** Farben, Schrift und Abstände stehen in `src/brand.ts`, die Szenen-Layouts in `src/szenen/Szenen.tsx`. Neue Folgen ändern nur Inhalte (JSON), nicht das Design.
- **Juli ist der Autor.** Skripte schreibt Juli selbst oder du lieferst einen Entwurf, den er prüft. Nichts ohne sein OK rendern.
- **Fakten:** nur gesicherte Psychologie, keine Mythen. Bei Unsicherheit im Entwurf markieren: `[PRÜFEN: …]`.
- **Niemals echte Fälle** aus Kita oder Klinik erzählen, auch nicht anonymisiert (Schweigepflicht).
- **Keine Stockfotos, keine KI-Bilder.** Nur die Linien-Grafiken aus `src/components/Grafik.tsx` (runde Linienenden, einheitliche Strichstärke). Neue Grafiken im gleichen Stil dort ergänzen.
- API-Schlüssel nur in `.env`, nie im Code.

## Eine neue Folge anlegen

1. Datei `src/folgen/folge-XX.json` anlegen (Vorlage: `folge-01.json`) und in `src/folgen/index.ts` eintragen.
2. Aufbau, immer in dieser Reihenfolge:
   - `hook` – Frage groß im Bild, Sprechtext packt in 2 Sekunden
   - `schritt` × 2–3 – je ein Gedanke mit eigener Grafik
   - `beispiel` – Alltagssituation
   - `merke` – der eine Satz, der hängen bleibt
   - `outro` – Frage an die Zuschauer
3. Felder pro Szene: `typ`, `titel` (kurz, steht im Bild), `highlight` (genau so geschrieben wie im Titel, max. 1–3 Wörter), `grafik` (`gehirn`, `gehirn-vorne`, `welle`, `sprechblase`, `herz`, `keine`), `sprechtext`, `dauer` (Sekunden, grob schätzen: Wörter ÷ 2,3).
4. Gesamtlänge 61–90 Sekunden (TikTok vergütet nur Videos über 1 Minute). Sprechtext gesamt ca. 150–200 Wörter.
   - Am Ende hängt automatisch ein Logo-Abspann (`src/components/Abspann.tsx`, mind. 3 s). Ist die Folge kürzer, wird er so verlängert, dass das Video 61 s erreicht. Das ist nur die Notlösung: lieber genug Sprechtext schreiben.
5. Zuerst das **Storyboard** als Tabelle zeigen (Szene, Titel, Highlight, Grafik, Sprechtext) und auf Julis OK warten.
6. **ElevenLabs-Fassung immer mitliefern:** nach dem OK zusätzlich `skripte/folge-XX-elevenlabs.txt` anlegen und den Text im Chat als Codeblock zeigen.
   - Nur reiner Sprechtext, keine Szenennamen, Überschriften oder Dateinamen (ElevenLabs liest alles vor).
   - Ein Absatz pro Szene, Absätze durch eine Leerzeile getrennt.
   - Sprechweise als englische Audio-Tags in eckigen Klammern vor dem Satz, z. B. `[curious]`, `[surprised]`, `[excited]`, `[calm]`, `[warm]`, `[serious]`, `[thoughtful]`, `[short pause]`. Sparsam, 1–2 pro Absatz.
   - Hinweis an Juli: Modell „Eleven v3“ wählen, sonst werden die Tags mitgelesen. Absätze einzeln als `szene-N.mp3` nach `public/audio/folge-XX/` speichern.

## Befehle

| Was | Befehl |
|---|---|
| Vorschau im Browser | `npm start` |
| Stimme per ElevenLabs erzeugen (setzt Dauer + Untertitel-Timing) | `npm run stimme -- 2` |
| Video + Cover rendern nach `out/` | `npm run render -- 2` |
| Typen prüfen | `npm run typecheck` |

- Eigene Sprachaufnahme statt ElevenLabs: MP3s nach `public/audio/folge-XX/szene-N.mp3` legen und bei jeder Szene `"audio"` eintragen; `dauer` an die Aufnahme anpassen.
- Hintergrundmusik (optional, lizenzfrei, z. B. YouTube Audio Library): nach `public/musik/` legen und in der Folge `"musik": "musik/datei.mp3"` setzen. Lautstärke steht in `src/Folge.tsx`.

## Sicherer Bereich (nicht ändern)

Oben ca. 300 px (App-Tabs), rechts ca. 150 px (Buttons), unten ca. 420 px (Beschreibung, Musikzeile) bleiben frei. Siehe `RAND` in `src/brand.ts`.
