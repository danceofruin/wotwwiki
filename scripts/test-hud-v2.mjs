import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p,root),'utf8');
const parse = p => JSON.parse(read(p));
const script = read('userscripts/wotw-hud.user.js');
const txt = read('userscripts/wotw-hud.txt');
new vm.Script(script, {filename:'wotw-hud.user.js'});
assert.equal(script,txt,'Text-file import and installer must contain identical code');
for (const directive of ['@name','@version','@match','@grant        GM_xmlhttpRequest','@connect      danceofruin.github.io','@updateURL','@downloadURL']) {
  assert(script.includes(directive), 'Missing userscript directive: '+directive);
}
for(const source of ['hud','sheets','live','horn']){
  assert(script.includes('"'+source+'"'), 'Missing reviewed datasource '+source);
}
for(const tab of ['styke','vesper','valeria','notes','treasury']){
  assert(script.includes(tab), 'Missing tab '+tab);
}
for(const key of ['data-tab','data-filter','questList','projectList','treasuryPage','characterPage','requestJson','validateBundle']){
  assert(script.includes(key), 'Missing screen or handler '+key);
}
assert(!/MutationObserver|setInterval|observe\s*\(/.test(script),'HUD 2 must not poll chat DOM');
assert(!/https?:\/\/(?:api\.github\.com|raw\.githubusercontent\.com)\/.*(?:wotwGPT)/.test(script),'Private campaign GitHub API must not be accessed from browser');
const live=parse('data/live.json'), sheets=parse('data/sheets.json'), horn=parse('data/horn.json'), hud=parse('data/hud.json');
assert.equal(live.meta.playerSafe,true);
assert.equal(sheets.meta.playerSafe,true);
assert.equal(horn.meta.playerSafe,true);
assert.equal(hud.meta.playerSafe,true);
assert.equal(live.meta.sheetRevision,sheets.meta.sourceRevision,'Mixed live/sheet revisions');
assert.equal(live.meta.sourceRevision,horn.meta.sourceRevision,'Mixed live/Horn revisions');
assert.equal(live.scene.date,horn.meta.campaignDate,'Different campaign date');
assert.equal(horn.treasury.liquid,horn.treasury.earmarked+horn.treasury.free,'Double-counted treasury');
assert.equal(horn.inventory.find(x=>x.id==='cash').amount,'7.710 GM','Stale cash inventory caption');
assert.deepEqual(sheets.characters.map(c=>c.id),['styke','vesper','valeria']);
for(const id of ['styke','vesper','valeria']){
 const sheet=sheets.characters.find(c=>c.id===id);
 const short=hud.characters.find(c=>c.id===id);
 const liveChar=live.party.find(c=>c.id===id);
 assert(sheet && short && liveChar,'Missing character: '+id);
 for(const key of ['ac','touch','flatFooted','initiative','fort','ref','will','cmd','cmb']){
   assert(typeof sheet.stats[key]==='string' && sheet.stats[key].length>0,id+': missing '+key);
 }
 assert(liveChar.hp.max===sheet.hpMax,id+': HP pool mismatch');
 assert(short.sections.some(s=>s.id==='combat-shortcuts'),id+': no combat reference');
}
assert(Array.isArray(live.quests)&&live.quests.length>0,'Quest tracking source missing');
assert(Array.isArray(live.appointments),'Appointments missing');
assert(Array.isArray(horn.projects)&&horn.projects.length>0,'Activities tracking source missing');
console.log('OK: HUD v2 userscript compiles; static data sources, pages, money and safe updates are consistent.');
