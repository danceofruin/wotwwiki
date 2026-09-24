import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const NOTICE = 'GENERATED VIEW. DO NOT USE AS CAMPAIGN AUTHORITY.';
const ids = ['styke', 'vesper', 'valeria'];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const obj = (v, keys, label) => {
  assert(v && typeof v === 'object' && !Array.isArray(v), `${label}: object required`);
  assert.deepEqual(Object.keys(v).sort(), keys.split(' ').sort(), `${label}: unexpected/missing keys`);
};
const str = v => assert(typeof v === 'string' && v.length <= 30000 && !/[<>]|(?:https?:\/\/)|(?:quests\/)|(?:HIDDEN \/ OFFSCREEN)|(?:github_pat_)|(?:gh[pousr]_)/i.test(v), 'Unsafe or invalid text');
const list = v => assert(Array.isArray(v) && v.length <= 100, 'Invalid list');
const slug = v => assert(/^[a-z0-9-]+$/.test(v), 'Invalid ID');
const date = v => assert(/^\d{4}-\d{2}-\d{2}$/.test(v), 'Invalid date');
const texts = v => { list(v); v.forEach(str); };
const links = v => { list(v); v.forEach(slug); };
const resource = (v, nullable = false) => {
  obj(v, 'current max', 'resource');
  assert(Number.isInteger(v.max) && v.max > 0 && v.max < 10000, 'Invalid capacity');
  assert((nullable && v.current === null) || (Number.isInteger(v.current) && v.current >= 0 && v.current <= v.max), 'Invalid resource value');
};
function meta(m, live = false) {
  obj(m, 'schemaVersion authority generated playerSafe generatedAt sourceRevision reviewedAt' + (live ? ' sheetRevision' : ''), 'meta');
  assert.equal(m.schemaVersion, 1); assert.equal(m.authority, NOTICE);
  assert.equal(m.generated, true); assert.equal(m.playerSafe, true);
  assert(/^[a-f0-9]{64}$/.test(m.sourceRevision));
  if (live) assert(/^[a-f0-9]{64}$/.test(m.sheetRevision));
  assert(!Number.isNaN(Date.parse(m.generatedAt))); date(m.reviewedAt);
}
function unique(rows) { assert.equal(new Set(rows.map(x => x.id)).size, rows.length, 'Duplicate ID'); }

export function validate(live, sheets) {
  obj(live, 'meta scene quests appointments missions people party', 'live'); meta(live.meta, true);
  obj(live.scene, 'date dateLabel time location locationId detail summary rest', 'scene');
  date(live.scene.date); slug(live.scene.locationId); Object.values(live.scene).forEach(str);
  links(live.people);
  list(live.party); assert.deepEqual(live.party.map(p => p.id), ids);
  for (const p of live.party) {
    obj(p, 'id name class hp conditions state resourceNote gearNote' + (p.id === 'styke' ? ' pp focus' : p.id === 'vesper' ? ' slots essence verse' : ''), 'party');
    resource(p.hp); texts(p.conditions); [p.name,p.class,p.state,p.resourceNote,p.gearNote].forEach(str);
    if (p.id === 'styke') { resource(p.pp); assert([true,false,null].includes(p.focus)); }
    if (p.id === 'vesper') {
      list(p.slots); assert.equal(p.slots.length, 3);
      for (const [i,s] of p.slots.entries()) { obj(s, 'level current max', 'slot'); assert.equal(s.level, i+1); resource({current:s.current,max:s.max}, true); }
      obj(p.essence, 'total standard', 'essence'); assert(Number.isInteger(p.essence.total) && p.essence.total >= 0); str(p.essence.standard);
      obj(p.verse, 'present hpCurrent hpMax', 'verse'); assert.equal(typeof p.verse.present, 'boolean'); resource({current:p.verse.hpCurrent,max:p.verse.hpMax}, true);
    }
  }
  for (const key of ['quests','appointments','missions']) { list(live[key]); unique(live[key]); }
  for (const q of live.quests) {
    obj(q, 'id title status updated summary known next links', 'quest'); slug(q.id); date(q.updated);
    assert(['active','waiting','scheduled','completed'].includes(q.status)); [q.title,q.summary,q.next].forEach(str); texts(q.known); links(q.links);
  }
  for (const a of live.appointments) { obj(a, 'id date label time title note links', 'appointment'); slug(a.id); date(a.date); [a.label,a.time,a.title,a.note].forEach(str); links(a.links); }
  for (const m of live.missions) { obj(m, 'id label value note', 'mission'); slug(m.id); [m.label,m.value,m.note].forEach(str); }
  obj(sheets, 'meta characters', 'sheets'); meta(sheets.meta);
  assert.equal(sheets.meta.sourceRevision, live.meta.sheetRevision, 'Mixed sheet revisions');
  list(sheets.characters); assert.deepEqual(sheets.characters.map(c=>c.id), ids);
  for (const c of sheets.characters) {
    obj(c, 'id name class level ancestry source profile hpMax stats attack attributes tabs', 'sheet');
    assert.equal(c.level,6); assert.equal(c.hpMax,live.party.find(p=>p.id===c.id).hp.max);
    assert.equal(c.source, c.id==='valeria'?'mechanics/combat/valeria-level-6.md':'mechanics/combat/core-party-level-6.md');
    [c.name,c.class,c.ancestry,c.profile].forEach(str);
    obj(c.stats, 'ac touch flatFooted initiative speed bab cmb cmd fort ref will', 'stats'); Object.values(c.stats).forEach(str);
    obj(c.attack, 'name hit damage note', 'attack'); Object.values(c.attack).forEach(str);
    list(c.attributes); assert.equal(c.attributes.length,6);
    c.attributes.forEach(a=>{obj(a,'name value','attribute');str(a.name);str(a.value)});
    list(c.tabs); unique(c.tabs);
    for (const t of c.tabs) { obj(t, 'id label sections', 'tab'); slug(t.id); str(t.label); list(t.sections); for (const s of t.sections) { obj(s, 'title markdown', 'section'); str(s.title); str(s.markdown); } }
  }
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
  const wiki = JSON.parse(html.match(/<script id="wiki-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  const articles = new Set(wiki.articles.map(a=>a.id));
  for (const id of [...live.people, live.scene.locationId, ...live.quests.flatMap(q=>q.links), ...live.appointments.flatMap(a=>a.links)]) assert(articles.has(id), `Unknown wiki article: ${id}`);
  return true;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const data = process.argv.includes('--stdin') ? JSON.parse(fs.readFileSync(0,'utf8')) : {
    live: JSON.parse(fs.readFileSync(path.join(root,'data/live.json'),'utf8')),
    sheets: JSON.parse(fs.readFileSync(path.join(root,'data/sheets.json'),'utf8'))
  };
  validate(data.live, data.sheets);
  console.log('OK: player-view schema, resource ranges, snapshot revisions and wiki links.');
}
