import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('../',import.meta.url);
const read = path => fs.readFileSync(new URL(path,root),'utf8');
const code = read('userscripts/wotw-hud.user.js');
const txt = read('userscripts/wotw-hud.txt');
assert.equal(code,txt,'HUD .user.js and TXT must always match');
assert(code.includes('@version      2.1.0'),'Userscript version not bumped');
new vm.Script(code,{filename:'wotw-hud.user.js'});
assert(code.includes('id="export"') && code.includes('↓ Export'),'Missing visible Export button');
assert(code.includes('$("#export").addEventListener("click", exportCurrentChat)'),'Export button has no handler');
assert(code.includes('fetch(target.href'),'Export lacks same-origin API call');
assert(code.includes('target.origin !== location.origin'),'Export must not fetch an external origin');
assert(!/MutationObserver|setInterval|\.observe\(/.test(code),'Export must not reintroduce live DOM tracking');
const begin = '// BEGIN WOTW CHAT EXPORT CORE';
const end = '// END WOTW CHAT EXPORT CORE';
assert.equal(code.split(begin).length,2,'Missing export helper marker');
assert.equal(code.split(end).length,2,'Missing export helper end marker');
const helpers = code.split(begin)[1].split(end)[0];
const context = vm.createContext({});
vm.runInContext(helpers,context,{filename:'wotw-hud-export-core.js'});
const {exportConversationId,exportLoadHistory,exportMarkdown,exportSafeFilename,exportMessageText} = context;
function record(i){
  return {id:'m'+i,author:{role:i%2?'user':'assistant'},recipient:'all',content:{content_type:'text',parts:['Nachricht '+i]},metadata:{}};
}
function page(messages,prev,next,before,after){
  return {conversation_id:'abc123-test',title:'23. April',messages,page_info:{
    has_previous_page:prev,has_next_page:next,start_cursor:before,end_cursor:after}};
}
function badStatus(status){const error=new Error('HTTP '+status);error.httpStatus=status;return error;}
assert.equal(exportConversationId('/c/abc123-test'),'abc123-test');
assert.equal(exportConversationId('/g/g-p-project/c/abc123-test'),'abc123-test');
assert.throws(()=>exportConversationId('/'),'Unidentified unsaved chat must refuse');
assert.equal(exportSafeFilename('A/B: C*?'),'A_B_ C__.md');
assert.equal(exportSafeFilename('CON'),'Chat-CON.md');
// Current API: 2+ pages, strict chronological order, no repeated boundary node.
const older = Array.from({length:100},(_,i)=>record(i+1));
const latest = Array.from({length:100},(_,i)=>record(i+101));
const first=page(latest,true,false,'m101','m200');
const before=page(older,false,true,'m1','m100');
const requests=[];
const data=await exportLoadHistory('abc123-test', async path=>{
 requests.push(path);
 if(path==='/backend-api/conversations/abc123-test?include_has_versions=true&num_turns=100') return first;
 if(path==='/backend-api/conversations/abc123-test?include_has_versions=true&num_turns=100&before=m101') return before;
 throw Error('Unexpected request: '+path);
});
assert.equal(data.pages,2);
assert.equal(data.messages.length,200);
assert.equal(data.messages[0].id,'m1');
assert.equal(data.messages[199].id,'m200');
assert.equal(requests.length,2);
const md=exportMarkdown(data,'2026-10-26T19:00:00.000Z');
assert.equal(md.count,200);
assert.equal(md.filename,'23. April.md');
assert(md.markdown.startsWith('# 23. April\n\nExportiert: 2026-10-26T19:00:00.000Z\nConversation: abc123-test'));
assert(md.markdown.indexOf('Nachricht 1')<md.markdown.indexOf('Nachricht 100'));
assert(md.markdown.indexOf('Nachricht 100')<md.markdown.indexOf('Nachricht 200'));
assert.equal((md.markdown.match(/^## User$/gm)||[]).length,100);
assert.equal((md.markdown.match(/^## Assistant$/gm)||[]).length,100);
// Metadata-only newer API: subsequent /messages endpoint with after and before.
const metadataOnly = {conversation_id:'abc123-test',title:'Server Metadaten'};
const metadataRequests=[];
const metaData=await exportLoadHistory('abc123-test',async path=>{
 metadataRequests.push(path);
 if(path==='/backend-api/conversations/abc123-test?include_has_versions=true&num_turns=100')return metadataOnly;
 if(path==='/backend-api/conversations/abc123-test/messages?include_has_versions=true&num_turns=100')
   return page([record(20)],true,true,'m20','m20');
 if(path==='/backend-api/conversations/abc123-test/messages?include_has_versions=true&num_turns=100&before=m20')
   return page([record(10)],false,true,'m10','m10');
 if(path==='/backend-api/conversations/abc123-test/messages?include_has_versions=true&num_turns=100&after=m20')
   return page([record(30)],true,false,'m30','m30');
 throw Error('Unexpected metadata request: '+path);
});
assert.equal(metaData.messages.map(m=>m.id).join(','),'m10,m20,m30');
assert.equal(metaData.title,'Server Metadaten');
assert.equal(metaData.pages,3);
// Old mapping tree: exclude abandoned/superseded sibling, walk parents all the way to root.
const legacy = {conversation_id:'abc123-test',title:'Alt',
  current_node:'final',mapping:{
    root:{parent:null,message:null},
    user:{parent:'root',message:record(1)},
    replaced:{parent:'user',message:{...record(2),id:'abandoned',content:{parts:['Verworfen']}}},
    assistant:{parent:'user',message:record(2)},
    final:{parent:'assistant',message:record(3)}
  }};
const old=await exportLoadHistory('abc123-test',async path=>{
 if(path.startsWith('/backend-api/conversations/'))throw badStatus(404);
 if(path==='/backend-api/conversation/abc123-test')return legacy;
 throw Error('Unexpected old-API request '+path);
});
assert.equal(old.kind,'branch');
assert.equal(old.messages.length,3);
const oldMd=exportMarkdown(old,'2026-10-26T19:00:00.000Z').markdown;
assert(!oldMd.includes('Verworfen'),'Abandoned alternative leaked');
assert(oldMd.includes('Nachricht 3'),'Active branch truncated');
// No silent partial file under missing cursors, cycles, no completeness flags, or request errors.
await assert.rejects(()=>exportLoadHistory('abc123-test',async path=>{
 return page([record(10)],true,false,'','m10');
}),/Seitenzeiger/);
await assert.rejects(()=>exportLoadHistory('abc123-test',async path=>{
 return {conversation_id:'abc123-test',messages:[record(1)]};
}),/Vollständigkeit/);
await assert.rejects(()=>exportLoadHistory('abc123-test',async path=>{
 if(path.includes('before='))throw badStatus(429);
 return first;
}),/429/);
await assert.rejects(()=>exportLoadHistory('abc123-test',async path=>{
 if(path.startsWith('/backend-api/conversations/'))throw badStatus(404);
 return {conversation_id:'abc123-test',mapping:{root:{parent:null,message:null},x:{parent:'missing',message:record(1)}},current_node:'x'};
}),/Elternkette/);
await assert.rejects(()=>exportLoadHistory('abc123-test',async path=>{
 if(path.startsWith('/backend-api/conversations/'))throw badStatus(404);
 return {conversation_id:'abc123-test',mapping:{x:{parent:'y',message:record(1)},y:{parent:'x',message:record(2)}},current_node:'x'};
}),/Zyklus/);
// Attachments/media: retain text and filenames, mark non-text but never promise binary export.
const user={id:'attached',author:{role:'user'},content:{content_type:'multimodal_text',
  parts:['Siehe Bild',{content_type:'image_asset_pointer'}]},
  metadata:{attachments:[{name:'Session.md',mime_type:'text/markdown'}]}};
assert(exportMessageText(user).includes('[Bild:'));
assert(exportMessageText(user).includes('Session.md'));
const noTool=exportMarkdown({title:'Hidden',id:'abc123-test',pages:1,messages:[
 record(1),{...record(2),metadata:{channel:'analysis'}},
 {...record(4),recipient:'python'},record(6)]},'2026-10-26T19:00:00.000Z');
assert.equal(noTool.count,2,'Private/tool messages leaked into readable player export');
console.log('OK: 2.1 Markdown export: 200-message pagination, metadata endpoint, legacy branch, completeness failures, media/attachments, role filtering.');
