import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = file => fs.readFileSync(path.join(root, file));
const text = file => read(file).toString('utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const html = text('index.html');
const app = text('app.js');
const css = text('styles.css');
const dataMatch = html.match(/<script id="wiki-data" type="application\/json">([\s\S]*?)<\/script>/);

check(Boolean(dataMatch), 'index.html enthält keinen wiki-data-Datensatz');

let data;
if (dataMatch) {
  try {
    data = JSON.parse(dataMatch[1]);
  } catch (error) {
    failures.push(`wiki-data ist kein gültiges JSON: ${error.message}`);
  }
}

if (data) {
  const ids = data.articles.map(article => article.id);
  const known = new Set(ids);
  check(known.size === ids.length, 'Artikelkennungen sind nicht eindeutig');
  check(data.meta.articleCount === data.articles.length, 'articleCount stimmt nicht mit dem Datensatz überein');
  check(data.meta.edgeCount === data.edges.length, 'edgeCount stimmt nicht mit dem Datensatz überein');

  for (const article of data.articles) {
    for (const target of [...(article.links || []), ...(article.backlinks || [])]) {
      check(known.has(target), `Fehlender Artikellink: ${article.id} -> ${target}`);
    }
  }
  for (const edge of data.edges || []) {
    check(known.has(edge.a), `Beziehungsachse verweist auf unbekannte Figur: ${edge.a}`);
    check(known.has(edge.b), `Beziehungsachse verweist auf unbekannte Figur: ${edge.b}`);
  }
  for (const event of data.events || []) {
    for (const target of event.links || []) {
      check(known.has(target), `Chronikeintrag ${event.id} verweist auf ${target}`);
    }
  }
}

try {
  new Function(app);
} catch (error) {
  failures.push(`app.js enthält einen Syntaxfehler: ${error.message}`);
}

check(!/document\.write|fetch\(['"]template\.html/.test(app + html), 'Legacy-Loader oder document.write ist wieder aktiv');
check((html.match(/<script src="app\.js/g) || []).length === 1, 'index.html muss genau app.js laden');
check((html.match(/<link rel="stylesheet" href="styles\.css/g) || []).length === 1, 'index.html muss genau styles.css laden');

for (const obsolete of ['dossier-v3.js', 'dossier-v4.js', 'dossier-hotfix-v1.js', 'core-ui-v1.js', 'dossier-v3.css']) {
  check(!fs.existsSync(path.join(root, obsolete)), `Veraltete Patch-Datei ist wieder vorhanden: ${obsolete}`);
}

const assetRefs = new Set((`${html}\n${app}\n${css}`.match(/assets\/[A-Za-z0-9._-]+/g) || []));
for (const relative of assetRefs) {
  const absolute = path.join(root, relative);
  check(fs.existsSync(absolute), `Referenzierte Bilddatei fehlt: ${relative}`);
  if (!fs.existsSync(absolute)) continue;
  const file = fs.readFileSync(absolute);
  if (relative.endsWith('.webp')) {
    const riff = file.length >= 12 && file.toString('ascii', 0, 4) === 'RIFF' && file.toString('ascii', 8, 12) === 'WEBP';
    check(riff, `Ungültiger WebP-Header: ${relative}`);
    if (riff) check(file.readUInt32LE(4) + 8 === file.length, `Unvollständige WebP-Datei: ${relative}`);
  }
  if (relative.endsWith('.png')) {
    const signature = file.length >= 20 && file.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    check(signature, `Ungültiger PNG-Header: ${relative}`);
    if (signature) check(file.toString('ascii', file.length - 8, file.length - 4) === 'IEND', `Unvollständige PNG-Datei: ${relative}`);
  }
}

if (failures.length) {
  console.error(`Integritätsprüfung fehlgeschlagen (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`OK: ${data.articles.length} Artikel, ${data.edges.length} Beziehungsachsen, ${assetRefs.size} referenzierte Bilddateien.`);
