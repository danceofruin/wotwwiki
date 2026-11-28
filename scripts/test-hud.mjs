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
 assert.equal(sheet.level,10);assert.equal(sheet.hpMax,p.hp.max);assert.equal(hud.resourceDefaults[c.id].hp.max,p.hp.max);
 const saves=c.sections.find(s=>s.id==='saves').items.map(x=>x.tag);
 assert.deepEqual(saves,[sheet.stats.fort,sheet.stats.ref,sheet.stats.will]);
}
const styke=hud.characters[0],ready=styke.sections.find(s=>s.id==='readied').items;
assert.equal(ready.length,7);assert.equal(new Set(ready.map(x=>x.name)).size,7);
assert(ready.some(x=>x.name==='Bilious Strike'&&x.tag.includes('SG 21')));
assert(ready.some(x=>x.name==='Circle of Razor Feathers'&&x.tag.includes('SG 21')&&x.detail.includes('5 Runden')));
assert(ready.some(x=>x.name==='Abyssal Lance'&&x.tag.includes('SG 20')));
assert(!ready.some(x=>/Riposte|Lifeburst|Chains/.test(x.name)));
assert.equal(hud.resourceDefaults.styke.pp.max,44);assert.equal(hud.resourceDefaults.styke.pp.current,44);
assert.deepEqual(Object.values(hud.resourceDefaults.vesper.slots).map(s=>s.max),[8,8,8,6,4]);
assert.deepEqual(Object.values(hud.resourceDefaults.vesper.slots).map(s=>s.current),[8,6,5,6,3]);
assert.equal(sheets.characters[1].stats.ac,'25');assert.equal(sheets.characters[1].stats.touch,'16');
assert.equal(hud.resourceDefaults.valeria.corruption.max,12);
assert.equal(hud.resourceDefaults.valeria.corruption.current,12);
assert.equal(sheets.characters[0].stats.speed,'40 ft');
assert.equal(sheets.characters[2].stats.initiative,'+8 (Prism orbiting)');
assert(!JSON.stringify(hud).includes('Boots-Tragen nicht bestätigt'));
assert.equal(hud.meta.campaignDate,'4712-10-29');
assert.equal(hud.resourceDefaults.styke.hp.current,66);
assert.equal(hud.resourceDefaults.styke.hp.max,66);
assert.equal(hud.resourceDefaults.vesper.hp.max,53);
assert.equal(hud.resourceDefaults.valeria.hp.max,64);
console.log('OK: current level10 HUD/schema, readied maneuvers, weapon DCs and preserved resource pools.');


// The HUD is a compact reference, with sources merged by spell level.
for(const c of hud.characters)for(const s of c.sections)for(const i of s.items||[])assert((i.detail||'').length<=180);
const vesper=hud.characters[1], fixed=vesper.sections.find(s=>s.id==='spells'),flex=vesper.sections.find(s=>s.id==='arcane-enlightenment');
assert.equal(fixed.groups.length,5);assert.equal(flex.groups.flatMap(g=>g.items).length,7);
assert(JSON.stringify(flex).includes('Heroism'));
assert.equal(vesper.sections.find(s=>s.id==='glyphs').items.length,17);
assert(vesper.sections.find(s=>s.id==='radiant-dawn').items.some(x=>x.name==='Decree of Silence'));
assert(vesper.sections.find(s=>s.id==='glyphs').items.some(x=>x.name==='Dispelling Burn'));assert(!JSON.stringify(flex).includes('Euphoric Cloud'));
assert(sheets.characters[0].attributes.find(a=>a.name==='CON').value.startsWith('11'));

assert.equal(hud.resourceDefaults.valeria.smite.max,4);
assert(hud.characters[0].sections.find(s=>s.id==='specials').items.some(i=>i.name==='Collective'));
assert(hud.characters[2].sections.find(s=>s.id==='gear').items.some(i=>i.detail?.includes('beide Ioun Stones verborgen')));
