import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
const hud=read('data/hud.json'),sheets=read('data/sheets.json'),live=read('data/live.json');
assert.equal(hud.meta.schemaVersion,1);
assert.equal(hud.meta.playerSafe,true);
assert.deepEqual(hud.characters.map(c=>c.id),['styke','vesper','valeria']);
for(const c of hud.characters){
 assert.equal(new Set(c.sections.map(s=>s.id)).size,c.sections.length);
 for(const s of c.sections)assert(['list','maneuvers','mixed','spell-groups','note','resources','flow'].includes(s.type));
 const sheet=sheets.characters.find(x=>x.id===c.id),p=live.party.find(x=>x.id===c.id);
 assert.equal(sheet.level,8);assert.equal(sheet.hpMax,p.hp.max);assert.equal(hud.resourceDefaults[c.id].hp.max,p.hp.max);
 const saves=c.sections.find(s=>s.id==='saves').items.map(x=>x.tag);
 assert.deepEqual(saves,[sheet.stats.fort,sheet.stats.ref,sheet.stats.will]);
}
const styke=hud.characters[0],ready=styke.sections.find(s=>s.id==='readied').items;
assert.equal(ready.length,6);assert.equal(new Set(ready.map(x=>x.name)).size,6);
assert(ready.some(x=>x.name==='Bilious Strike'&&x.tag.includes('SG 21')));
assert(ready.some(x=>x.name==='Circle of Razor Feathers'&&x.tag.includes('SG 21')&&x.detail.includes('4 Runden')));
assert(!ready.some(x=>/Riposte|Lifeburst|Chains/.test(x.name)));
assert.equal(hud.resourceDefaults.styke.pp.max,26);assert.equal(hud.resourceDefaults.styke.pp.current,26);
assert.deepEqual(Object.values(hud.resourceDefaults.vesper.slots).map(s=>s.max),[8,8,7,4]);
assert(Object.values(hud.resourceDefaults.vesper.slots).every(s=>s.current===null));
assert.equal(sheets.characters[1].stats.ac,'25');assert.equal(sheets.characters[1].stats.touch,'16');
assert.equal(hud.resourceDefaults.valeria.corruption.max,11);
assert.equal(hud.resourceDefaults.valeria.corruption.current,null);
assert.equal(sheets.characters[0].stats.speed,'40 ft');
assert.equal(sheets.characters[2].stats.initiative,'+8 (Prism orbiting)');
assert(!JSON.stringify(hud).includes('Boots-Tragen nicht bestätigt'));
console.log('OK: current level8 HUD/schema, known-vs-readied, weapon DCs, resource preservation and actual equipment.');


// The HUD is a compact reference, with sources merged by spell level.
for(const c of hud.characters)for(const s of c.sections)for(const i of s.items||[])assert((i.detail||'').length<=180);
const vesper=hud.characters[1], fixed=vesper.sections.find(s=>s.id==='spells'),flex=vesper.sections.find(s=>s.id==='arcane-enlightenment');
assert.equal(fixed.groups.length,4);assert.equal(flex.groups.flatMap(g=>g.items).length,7);
assert(JSON.stringify(flex).includes('Heroism'));assert(!JSON.stringify(flex).includes('Euphoric Cloud'));
assert(sheets.characters[0].attributes.find(a=>a.name==='CON').value.startsWith('11'));
