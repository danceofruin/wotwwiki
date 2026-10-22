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
const item=(c,s,name)=>section(c,s).items.find(i=>i.name===name);
assert.equal(hud.meta.kind,'wotw-hud-party');
assert.equal(hud.meta.sourceCampaignEdge,'26. April 4712 AR (letzter bestätigter Repo-Live-Stand)');

// Styke: equipped DEX +4 belt, cloak +3, +2 Charisma headband.
assert.equal(hud.resourceDefaults.styke.hp.max,48);
assert.equal(hud.resourceDefaults.styke.pp.max,18);
assert.equal(hud.resourceDefaults.styke.pp.current,18);
assert.deepEqual(section('styke','saves').items.map(i=>i.tag),['+10','+13','+12']);
assert.equal(item('styke','skills','Acrobatics').tag,'+14');
assert.equal(item('styke','skills','Stealth').tag,'+16');
assert.equal(section('styke','readied').items.length,5);
assert.equal(section('styke','all-maneuvers').items.length,12);
assert.match(item('styke','specials','Compartmentalized Aid').detail,/bis zu 4/);
assert.match(item('styke','readied','Circle of Razor Feathers').detail,/DC 18/);
assert.match(item('styke','stances','The Caged Sun').detail,/CMD 26/);
assert.match(item('styke','combat-shortcuts','Inner Eye + Power Attack').detail,/\+13\/\+8, 2d6\+18/);

// Vesper: CHA +4 headband, cloak +3 and current IL9/IM6 glyph values.
assert.equal(hud.resourceDefaults.vesper.hp.max,38);
assert.deepEqual(Object.values(hud.resourceDefaults.vesper.slots).map(s=>s.max),[8,8,5]);
assert.deepEqual(section('vesper','saves').items.map(i=>i.tag),['+5','+12','+12']);
assert.equal(item('vesper','skills','Disable Device').tag,'+16');
assert.deepEqual(section('vesper','arcane-enlightenment').items.map(i=>i.name),[
  'Alarm','Glitterdust','Silent Image','Euphoric Cloud','Ashen Path','Stinking Cloud'
]);
assert.ok(section('vesper','revelations').items.some(i=>i.name==='Mental Acuity'));
assert.match(item('vesper','revelations','Mental Acuity').detail,/→ 14/);
assert.ok(section('vesper','radiant-dawn').items.some(i=>i.name==='Radiant Dawn Style'));
assert.match(item('vesper','radiant-dawn','Witness to Glory').detail,/\+8 Initiative und 13/);
assert.match(item('vesper','radiant-dawn','Disrupt Essence').detail,/DC 24/);
assert.equal(section('vesper','glyphs').items.length,11);
assert.match(section('vesper','glyphs').subtitle,/Virtual Animus Adept 3/);
assert.match(section('vesper','glyphs').subtitle,/IL 9/);
assert.match(section('vesper','glyphs').subtitle,/DC 20/);
assert.match(item('vesper','glyphs','Spirit Stride').detail,/20-ft-Teleport/);
assert.match(item('vesper','glyphs','Illusionary State').detail,/1d4\+3/);
assert.match(item('vesper','glyphs','Wind Speed').detail,/Full Attack/);
assert.match(item('vesper','animus','Startpool').detail,/7 Animus/);

// Valeria: equipped sword, cloak +3 and Shadow on actual full plate.
assert.equal(hud.resourceDefaults.valeria.hp.max,46);
assert.equal(hud.resourceDefaults.valeria.smite.max,3);
assert.deepEqual(section('valeria','saves').items.map(i=>i.tag),['+14','+12','+14']);
assert.equal(item('valeria','skills','Stealth').tag,'+11');
assert.match(section('valeria','fiendish-boon').subtitle,/zurückgegeben\/getragen/);
assert.match(item('valeria','other-antipaladin','Channel Negative Energy').detail,/4d6/);
assert.match(section('valeria','prepared-spells').text,/heutige Auswahl nicht bestätigt/);
assert.match(item('valeria','combat-shortcuts','Rüstung und Bewegung').detail,/Tragen nicht bestätigt/);

const allText=JSON.stringify(hud);
assert.ok(!allText.includes('weiterhin bei Tacitus'),'outdated Valeria weapon');
assert.ok(!allText.includes('Dancing Darkness'),'obsolete Enlightenment selection');
assert.ok(!allText.includes('1d4+2 Bilder'),'obsolete Illusionary State');
console.log('OK: level-7 HUD schema, April-26 equipment, daily resource capacities and combat regression checks.');
