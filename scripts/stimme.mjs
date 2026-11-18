// Erzeugt die Sprachaufnahme jeder Szene mit ElevenLabs und trägt Dauer + Wort-Zeitstempel in die Folge ein.
// Aufruf: npm run stimme -- 1        (für Folge 1)
// Braucht in .env: ELEVENLABS_API_KEY und ELEVENLABS_VOICE_ID (optional ELEVENLABS_MODEL)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// .env ohne Zusatzpaket einlesen
const envDatei = path.join(wurzel, '.env');
if (fs.existsSync(envDatei)) {
  for (const zeile of fs.readFileSync(envDatei, 'utf8').split(/\r?\n/)) {
    const m = zeile.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } = process.env;
const MODELL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
  console.error('Fehlt: ELEVENLABS_API_KEY und/oder ELEVENLABS_VOICE_ID in der Datei .env');
  process.exit(1);
}

const nummer = Number(process.argv[2]);
if (!nummer) {
  console.error('Bitte Folgennummer angeben, z. B.: npm run stimme -- 1');
  process.exit(1);
}
const nr = String(nummer).padStart(2, '0');
const folgenDatei = path.join(wurzel, 'src', 'folgen', `folge-${nr}.json`);
const folge = JSON.parse(fs.readFileSync(folgenDatei, 'utf8'));
const audioOrdner = path.join(wurzel, 'public', 'audio', `folge-${nr}`);
fs.mkdirSync(audioOrdner, { recursive: true });

const zuWoertern = ({ characters, character_start_times_seconds: start, character_end_times_seconds: ende }) => {
  const woerter = [];
  let aktuell = null;
  characters.forEach((zeichen, i) => {
    if (/\s/.test(zeichen)) {
      if (aktuell) woerter.push(aktuell);
      aktuell = null;
      return;
    }
    if (!aktuell) aktuell = { wort: '', start: start[i], ende: ende[i] };
    aktuell.wort += zeichen;
    aktuell.ende = ende[i];
  });
  if (aktuell) woerter.push(aktuell);
  return woerter.map((w) => ({ ...w, start: +w.start.toFixed(2), ende: +w.ende.toFixed(2) }));
};

const PAUSE_DANACH = 0.5; // Sekunden Luft nach jedem Satzblock

for (const [i, szene] of folge.szenen.entries()) {
  process.stdout.write(`Szene ${i + 1}/${folge.szenen.length} (${szene.typ}) … `);
  const antwort = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/with-timestamps`, {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: szene.sprechtext,
      model_id: MODELL,
      voice_settings: { stability: 0.5, similarity_boost: 0.8 },
    }),
  });
  if (!antwort.ok) {
    console.error(`\nFehler ${antwort.status}: ${await antwort.text()}`);
    process.exit(1);
  }
  const daten = await antwort.json();
  const datei = `szene-${i + 1}.mp3`;
  fs.writeFileSync(path.join(audioOrdner, datei), Buffer.from(daten.audio_base64, 'base64'));
  const woerter = zuWoertern(daten.alignment);
  const sprechende = woerter.length ? woerter[woerter.length - 1].ende : 2;
  szene.audio = `audio/folge-${nr}/${datei}`;
  szene.woerter = woerter;
  szene.dauer = Math.round((sprechende + PAUSE_DANACH) * 10) / 10;
  console.log(`${szene.dauer} s`);
}

fs.writeFileSync(folgenDatei, JSON.stringify(folge, null, 2) + '\n');
const gesamt = folge.szenen.reduce((s, x) => s + x.dauer, 0);
console.log(`\nFertig. Gesamtlänge: ${gesamt.toFixed(1)} s${gesamt < 61 ? '  ⚠ unter 61 s – für TikTok-Vergütung Text etwas verlängern' : ''}`);
