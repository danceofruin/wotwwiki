import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const wiki=JSON.parse(read('index.html').match(/<script id="wiki-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const live=JSON.parse(read('data/live.json'));
const sheets=JSON.parse(read('data/sheets.json'));
const horn=JSON.parse(read('data/horn.json'));
const hud=JSON.parse(read('data/hud.json'));
assert.equal(wiki.meta.campaignDate,live.scene.date,'Archive and live date differ');
assert.equal(wiki.meta.sourceReadDate,live.meta.reviewedAt,'Archive and live review differ');
assert(hud.meta.updated>=live.meta.reviewedAt,'HUD review is older than published Live Play');
assert(/^\d{4}-\d{2}-\d{2}$/.test(hud.meta.campaignDate),'Missing dated HUD campaign snapshot');
assert(hud.meta.campaignDate>=live.scene.date,'HUD campaign edge predates published Live Play');
assert.equal(wiki.meta.publicArticleCount+wiki.meta.adultArticleCount,wiki.articles.length);
assert.equal(wiki.meta.publicEdgeCount+wiki.meta.adultEdgeCount,wiki.edges.length);
assert(wiki.plans.every(p=>p.date==='offen'||p.date>=live.scene.date),'Expired plan remains current');
for(const character of sheets.characters){
 const article=wiki.articles.find(a=>a.id==='bogen-'+character.id);
 assert(article.body.includes('#/sheet/'+character.id));
 assert(!article.body.includes('Normale Nacht'),'Party rest recap in individual article');
}
const valeria=sheets.characters.find(c=>c.id==='valeria');
const weapon=horn.inventory.find(i=>i.id==='valeria-sword');
if(weapon?.state.includes('Nicht verfügbar')){
 assert.equal(valeria.attack.hit,'—','Unavailable weapon shown as current attack');
 // Separately maintained HUD can use a later verified campaign edge than the older wiki inventory.
 if(hud.meta.campaignDate<=live.scene.date){
  assert(hud.characters.find(c=>c.id==='valeria').sections.find(s=>s.id==='combat-shortcuts').subtitle.includes('bedingte Referenzwerte'));
 }
}
assert.equal(horn.treasury.liquid,horn.treasury.free+horn.treasury.earmarked);
assert(!read('app.js').includes('14/666'),'Old current ritual counter in homepage code');
assert(read('app.js').includes("RAW_BYID['spielstand'].summary"),'Homepage duplicates current summary');
console.log('OK: archive/live consistency, newer independently dated HUD, expired plans and inventory safeguards.');
