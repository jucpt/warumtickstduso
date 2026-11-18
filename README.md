# warum tickst du so? – Kurzvideo-Studio

Hier entstehen die Videos für @warumtickstduso. Design, Farben und Aufbau sind fest eingebaut. Für jede neue Folge änderst du nur Text und Stimme.

## Einmalig einrichten (ca. 15 Minuten)

1. **Node.js installieren:** die LTS-Version von https://nodejs.org herunterladen und installieren.
2. **Claude Code installieren:**
   - Windows (PowerShell): `irm https://claude.ai/install.ps1 | iex`
   - Mac (Terminal): `curl -fsSL https://claude.ai/install.sh | bash`
   - Danach das Fenster schließen, neu öffnen und mit `claude --version` prüfen.
3. **Diesen Ordner entpacken**, z. B. nach `Dokumente/warumtickstduso`.
4. **Terminal im Ordner öffnen:**
   - Windows: Rechtsklick in den Ordner, dann „Im Terminal öffnen“.
   - Mac: Terminal öffnen, `cd ` tippen und den Ordner ins Fenster ziehen.
5. **Pakete installieren:** `npm install`
6. **Vorschau testen:** `npm start`. Im Browser öffnet sich Remotion Studio mit „Folge-01“.
7. **ElevenLabs verbinden (optional):** `.env.example` zu `.env` kopieren und API-Key und Voice-ID eintragen. Beides findest du in deinem ElevenLabs-Konto.

## Jede neue Folge

Im Ordner `claude` starten und z. B. schreiben:

> Neue Folge #2 zum Thema „Warum du einen schlechten Film trotzdem zu Ende schaust“. Hier mein Skript: …

Claude Code kennt die Regeln aus `CLAUDE.md`. Es zeigt dir erst das Storyboard und baut die Folge nach deinem OK.

Danach:

1. `npm run stimme -- 2` erzeugt die Stimme und stimmt die Untertitel darauf ab.
2. `npm start` zum Anschauen.
3. `npm run render -- 2` legt Video und Cover in `out/`.
