// Rendert Video und Cover einer Folge nach ./out
// Aufruf: npm run render -- 1        (für Folge 1)

import { spawnSync } from 'node:child_process';

const nummer = Number(process.argv[2]);
if (!nummer) {
  console.error('Bitte Folgennummer angeben, z. B.: npm run render -- 1');
  process.exit(1);
}
const nr = String(nummer).padStart(2, '0');

const lauf = (befehl) => {
  console.log(`\n> ${befehl}`);
  const r = spawnSync(befehl, { stdio: 'inherit', shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

lauf(`npx remotion render src/index.ts Folge-${nr} out/folge-${nr}.mp4`);
lauf(`npx remotion still src/index.ts Cover-${nr} out/folge-${nr}-cover.png`);
console.log(`\nFertig: out/folge-${nr}.mp4 und out/folge-${nr}-cover.png`);
