import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const horn=JSON.parse(fs.readFileSync(new URL('data/horn.json',root),'utf8'));
const live=JSON.parse(fs.readFileSync(new URL('data/live.json',root),'utf8'));
const sheets=JSON.parse(fs.readFileSync(new URL('data/sheets.json',root),'utf8'));
assert.equal(horn.meta.playerSafe,true);assert.equal(horn.meta.sourceRevision,live.meta.sourceRevision);
assert.equal(horn.meta.campaignDate,live.scene.date);
assert.equal(horn.treasury.liquid,horn.treasury.earmarked+horn.treasury.free);
for(const key of ['projects','security','inventory'])assert.equal(new Set(horn[key].map(x=>x.id)).size,horn[key].length);
const levels=new Set(horn.levels.map(x=>x.id));horn.projects.forEach(p=>{assert(levels.has(p.level));assert(p.total===null||(Number.isInteger(p.done)&&p.done>=0&&p.done<=p.total));});
assert(!JSON.stringify(horn).includes('30bullionbars'),'Unreported gold batch leaked');
assert(!JSON.stringify(horn).includes('RECOVERY_READY'));
const ctx=vm.createContext({window:{},Intl});vm.runInContext(fs.readFileSync(new URL('horn.js',root),'utf8'),ctx);
const f=ctx.window.WotwHorn.filterProjects;
assert(f(horn.projects,{level:'two',kind:'all',query:''}).every(x=>x.level==='two'));
assert(f(horn.projects,{level:'all',kind:'completed',query:''}).every(x=>x.status==='completed'));
assert(f(horn.projects,{level:'all',kind:'all',query:'Tacitus'}).length>0);
for(const c of sheets.characters){
 const skills=c.tabs.find(t=>t.id==='skills');assert(skills.sections[0].markdown.includes('| Ränge |'));
 assert(c.attributes.length===6);assert(c.tabs.every(t=>t.sections.length>0));
}
const powers=sheets.characters[0].tabs.find(t=>t.id==='psionics');assert(powers.sections.some(x=>/Grad 0/.test(x.title)));assert(powers.sections.some(x=>/Grad 1/.test(x.title)));
assert(!live.party[0].resourceNote.includes('Vesper'),'Party recap in individual sheet');
console.log('OK: Horn filters, source revisions, progress, custody/value boundaries and structured sheets.');
const ui=vm.createContext({window:{},Intl,URLSearchParams,AbortSignal,setInterval:()=>{},location:{hash:'#/sheet/styke',protocol:'https:'},document:{hidden:false,addEventListener:()=>{},querySelectorAll:()=>[]},fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL(url,root),'utf8'))})});
vm.runInContext(fs.readFileSync(new URL('live.js',root),'utf8'),ui);
await new Promise(resolve=>ui.window.WotwLive.init(resolve,{}));
for(const c of sheets.characters){for(const t of c.tabs){const html=ui.window.WotwLive.render('sheet',c.id,new URLSearchParams('tab='+t.id));assert(html.includes('lp-attributes'));assert(html.includes('<table>')||html.includes('<ol>'));assert(!html.match(/<section class="lp-current">[\s\S]*?<\/section>/)[0].includes('Normale Nacht'));}}
vm.runInContext(fs.readFileSync(new URL('horn.js',root),'utf8'),ui);
await new Promise(resolve=>ui.window.WotwHorn.init(resolve));
assert(ui.window.WotwHorn.render('horn').includes('ht-map-levels'));
assert(ui.window.WotwHorn.render('inventar').includes('Nicht taxiert'));
console.log('OK: every sheet tab, attribute cards and both tracker routes render with reviewed data.');
