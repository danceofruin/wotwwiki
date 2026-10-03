import assert from 'node:assert/strict';
import fs from 'node:fs';
const hud = JSON.parse(fs.readFileSync(process.argv[2] || new URL('../data/hud.json', import.meta.url), 'utf8'));
assert.equal(hud.meta.schemaVersion, 1);
assert.deepEqual(hud.characters.map(c=>c.id), ['styke','vesper','valeria']);
for (const c of hud.characters) {
  assert.equal(new Set(c.sections.map(s=>s.id)).size,c.sections.length);
  for (const s of c.sections) {
    assert.ok(['list','maneuvers','mixed','spell-groups','note','resources','flow'].includes(s.type));
    for (const i of s.items || []) if(i.resource) assert.ok(i.resource.key in hud.resourceDefaults[i.resource.character]);
    for (const r of s.rows || []) if(r.resource) assert.ok(r.resource.key in hud.resourceDefaults[r.resource.character]);
    for (const g of s.groups || []) if(g.resource) assert.ok(hud.resourceDefaults[g.resource.character].slots[g.resource.level]);
  }
}
const section=(c,s)=>hud.characters.find(x=>x.id===c).sections.find(x=>x.id===s);
assert.equal(section('styke','readied').items.length,5);
assert.equal(section('styke','all-maneuvers').items.length,12);
assert.equal(hud.resourceDefaults.styke.pp.max,16);
assert.equal(hud.resourceDefaults.styke.hp.max,48);
assert.equal(hud.resourceDefaults.vesper.hp.max,38);
assert.equal(hud.resourceDefaults.valeria.hp.max,46);
assert.deepEqual(Object.values(hud.resourceDefaults.vesper.slots).map(s=>s.max),[8,7,5]);
assert.equal(hud.resourceDefaults.valeria.smite.max,3);
assert.ok(section('vesper','revelations').items.some(i=>i.name==='Mental Acuity'));
assert.ok(section('vesper','radiant-dawn').items.some(i=>i.name==='Radiant Dawn Style'));
assert.match(section('valeria','other-antipaladin').items.find(i=>i.name==='Channel Negative Energy').detail,/4d6/);
assert.equal(section('vesper','glyphs').items.length,11);
assert.match(section('vesper','glyphs').subtitle,/Virtual Animus Adept 3/);
assert.match(section('vesper','glyphs').items.find(i=>i.name==='Spirit Stride').detail,/Einmaliger 20-ft/);
assert.match(section('vesper','glyphs').items.find(i=>i.name==='Illusionary State').detail,/1d4\+2/);
assert.match(section('vesper','glyphs').items.find(i=>i.name==='Wind Speed').detail,/Full Attack/);
console.log('OK: level-7 HUD schema, options, resource capacities and regression checks.');
