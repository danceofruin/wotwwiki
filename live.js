/* Live Play presentation. Only public, reviewed projections are fetched. */
window.WotwLive = (() => {
  'use strict';
  const names = {active:'Aktiv', waiting:'Wartend', scheduled:'Terminiert', completed:'Abgeschlossen'};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let snapshot = null, failure = '', busy = false, onChange = () => {}, helpers = {};
  let filter = 'open', query = '';
  const tabs = {};
  const link = (id, label) => `<a href="#/artikel/${esc(id)}">${esc(label || helpers.title?.(id) || id)}</a>`;
  const links = ids => `<div class="lp-links">${ids.map(id=>link(id)).join('')}</div>`;
  const readingDate = date => date.split('-').reverse().join('.');
  const inline = text => esc(text).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>');

  // Deliberately small Markdown renderer: no HTML, images, URLs or embedded JS.
  function markdown(text) {
    const lines = text.split('\n'); let out = '', i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line || /^---+$/.test(line)) { i++; continue; }
      if (/^#{1,5} /.test(line)) { out += `<h3>${inline(line.replace(/^#+ /,''))}</h3>`; i++; continue; }
      if (line.startsWith('|')) {
        const rows = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          const cells = lines[i++].trim().replace(/^\||\|$/g,'').split('|').map(s=>s.trim());
          if (!cells.every(c=>/^:?-+:?$/.test(c))) rows.push(cells);
        }
        out += `<div class="lp-table" tabindex="0" role="region" aria-label="Wertetabelle, horizontal scrollbar"><table><thead><tr>${rows[0].map(c=>`<th scope="col">${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row=>`<tr>${row.map(c=>`<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
        continue;
      }
      if (/^(?:- |\d+\. )/.test(line)) {
        const ordered = /^\d/.test(line), tag = ordered ? 'ol' : 'ul'; out += `<${tag}>`;
        while (i < lines.length && /^(?:- |\d+\. )/.test(lines[i].trim())) out += `<li>${inline(lines[i++].trim().replace(/^(?:- |\d+\. )/,''))}</li>`;
        out += `</${tag}>`; continue;
      }
      let para = [];
      while (i < lines.length && lines[i].trim() && !/^(?:#{1,5} |\||- |\d+\. |---+$)/.test(lines[i].trim())) para.push(inline(lines[i++].trim()));
      out += `<p>${para.join('<br>')}</p>`;
    }
    return out;
  }
  function portrait(id, large=false) {
    const src = helpers.portrait?.(id);
    return src ? `<img class="lp-portrait ${large?'large':''}" src="${esc(src)}" alt="" loading="lazy">` : '';
  }
  function meter(label, resource, compact=false) {
    const known = resource.current !== null;
    const value = known ? `${resource.current} / ${resource.max}` : `? / ${resource.max}`;
    return `<div class="lp-resource ${compact?'compact':''} ${known?'':'unknown'}"><div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>${known?`<meter min="0" max="${resource.max}" value="${resource.current}" aria-label="${esc(label)}: ${esc(value)}">${esc(value)}</meter>`:'<span class="lp-unknown-line" aria-hidden="true"></span>'}</div>`;
  }
  function extraResources(p, compact=false) {
    if (p.id==='styke') return meter('PP',p.pp,compact)+`<div class="lp-resource-line"><span>Psionischer Fokus</span><strong>${p.focus===null?'? Unbestätigt':p.focus?'● Verfügbar':'○ Verbraucht'}</strong></div>`;
    if (p.id==='vesper') return p.slots.map(s=>meter(`Zauber Grad ${s.level}`,s,compact)).join('')+`<div class="lp-resource-line"><span>Essence-Pool</span><strong>${p.essence.total}</strong><span>Verse ${p.verse.present?'●':'○'}</span></div>`;
    return `<div class="lp-resource-line"><span>${esc(p.class)}</span><strong>${p.conditions.length?esc(p.conditions.join(', ')):'Keine Zustände'}</strong></div>`;
  }
  function party() {
    return `<div class="lp-party">${snapshot.live.party.map(p=>`<article class="lp-party-card" data-character="${p.id}"><a class="lp-party-name" href="#/sheet/${p.id}">${portrait(p.id)}<div><h2>${esc(p.name)}</h2><span>${esc(p.class)}</span></div><span class="lp-arrow" aria-hidden="true">↗</span></a>${meter('HP',p.hp)}${extraResources(p,true)}<div class="lp-card-foot"><span>${esc(p.state)}</span><a href="#/sheet/${p.id}">Charakterbogen →</a></div></article>`).join('')}</div>`;
  }
  function statusLine() {
    const meta=snapshot.live.meta;
    return `<div class="lp-sync"><span><span class="status-dot"></span>${esc(snapshot.live.scene.dateLabel)} · ${esc(snapshot.live.scene.time)}<br>Geprüft ${esc(readingDate(meta.reviewedAt))}</span><button class="button small" data-live-refresh ${busy?'disabled':''}>${busy?'Wird geladen …':'Stand neu laden'}</button></div>${failure?`<p class="lp-error" role="status">${esc(failure)} Der zuletzt geladene Stand bleibt sichtbar.</p>`:''}`;
  }
  function navigation(id) {
    return `<nav class="lp-party-switch" aria-label="Aktive Party"><a href="#/live" ${!id?'aria-current="page"':''}>Live Play</a>${snapshot.live.party.map(p=>`<a href="#/sheet/${p.id}" ${id===p.id?'aria-current="page"':''}>${esc(p.name)}</a>`).join('')}<a href="#/quests">Questlog</a></nav>`;
  }
  function questCards() {
    const all = snapshot.live.quests;
    const qs = all.filter(q=>(filter==='all'||filter==='open'&&q.status!=='completed'||q.status===filter)&&(!query||[q.title,q.summary,...q.known,q.next].join(' ').toLocaleLowerCase('de').includes(query)));
    return qs.length ? qs.map(q=>`<article class="lp-quest"><div class="lp-quest-top"><span class="lp-status ${q.status}">${esc(names[q.status])}</span><time datetime="${q.updated}">${esc(readingDate(q.updated))}</time></div><h3>${esc(q.title)}</h3><p>${esc(q.summary)}</p><details><summary>Bekanntes & nächster Schritt</summary><ul>${q.known.map(k=>`<li>${esc(k)}</li>`).join('')}</ul><p class="lp-next">${esc(q.next)}</p></details>${links(q.links)}</article>`).join('') : '<p class="lp-empty">Keine Fäden für diesen Filter.</p>';
  }
  function questLog(full=false) {
    const qs=snapshot.live.quests;
    const choices=[['open','Offen',qs.filter(q=>q.status!=='completed').length],...Object.entries(names).map(([key,label])=>[key,label,qs.filter(q=>q.status===key).length]),['all','Alle',qs.length]];
    return `<section class="lp-questlog"><div class="section-title"><h2>${full?'Alle Fäden':'Aktuelle Fäden'}</h2>${!full?'<a href="#/quests">Questlog öffnen ↗</a>':''}</div><div class="lp-filters" aria-label="Fäden filtern">${choices.map(([key,label,count])=>`<button type="button" data-quest-filter="${key}" aria-pressed="${filter===key}">${esc(label)} <span>${count}</span></button>`).join('')}</div>${full?`<label class="lp-search-label" for="quest-search">Im Questlog suchen</label><input id="quest-search" class="lp-search" type="search" placeholder="Person, Vorhaben oder Stichwort …" value="${esc(query)}">`:''}<div id="lp-quest-results" class="lp-quests" aria-live="polite">${questCards()}</div></section>`;
  }
  function appointments() {
    return `<section class="lp-agenda"><div class="section-title"><h2>Nächste Termine</h2></div><ol>${snapshot.live.appointments.map(a=>`<li><div class="lp-agenda-date"><time datetime="${a.date}">${esc(a.label)}</time><span>${esc(a.time)}</span></div><div><h3>${esc(a.title)}</h3><p>${esc(a.note)}</p>${links(a.links)}</div></li>`).join('')}</ol></section>`;
  }
  function missions() {
    return `<section><div class="section-title"><h2>Missionsressourcen</h2></div><div class="lp-missions">${snapshot.live.missions.map(m=>`<article><span>${esc(m.label)}</span><strong>${esc(m.value)}</strong><p>${esc(m.note)}</p></article>`).join('')}</div></section>`;
  }
  function dashboard() {
    const s=snapshot.live.scene;
    return `<div class="lp-dashboard">${statusLine()}<header class="lp-head"><div class="eyebrow">Live Play · Der Nessische Knoten</div><h1>${esc(s.dateLabel)}</h1><p>${link(s.locationId,s.location)} <span> / ${esc(s.time)}</span></p><div class="lp-location">${esc(s.detail)}</div></header>${party()}<div class="lp-scene"><strong>${esc(s.summary)}</strong><span>${esc(s.rest)}</span></div><div class="lp-columns"><div>${questLog()}${missions()}</div><aside>${appointments()}<section class="lp-relevant"><div class="section-title"><h2>Relevante Personen</h2></div>${links(snapshot.live.people)}<a class="lp-all-people" href="#/dossiers">Alle Dossiers ↗</a></section></aside></div><p class="lp-footnote">Werte und Wissen gelten für den angegebenen Spielstand. Ein neuer Chat wird erst nach einem bestätigten Abgleich sichtbar.</p></div>`;
  }
  function stats(c) {
    const labels={ac:'AC',touch:'Touch',flatFooted:'Flat-footed',initiative:'Initiative',speed:'Speed',bab:'BAB',cmb:'CMB',cmd:'CMD',fort:'Fort',ref:'Ref',will:'Will'};
    return `<div class="lp-stat-grid">${Object.entries(c.stats).map(([key,value])=>`<div><span>${labels[key]}</span><strong>${esc(value)}</strong></div>`).join('')}</div>`;
  }
  function sheet(id, requestedTab) {
    const c=snapshot.sheets.characters.find(c=>c.id===id), p=snapshot.live.party.find(p=>p.id===id);
    if(!c||!p) return '<div class="empty"><h1>Charakterbogen nicht gefunden</h1><a href="#/live">Zur Party</a></div>';
    let selected=requestedTab||tabs[id]||'combat'; if(!c.tabs.some(t=>t.id===selected))selected='combat'; tabs[id]=selected;
    const tab=c.tabs.find(t=>t.id===selected);
    return `<div class="lp-sheet">${navigation(id)}${statusLine()}<header class="lp-sheet-head">${portrait(id,true)}<div><div class="eyebrow">Aktive Party · Stufe ${c.level}</div><h1>${esc(c.name)}</h1><p>${esc(c.class)} <span>· ${esc(c.ancestry)}</span></p></div><a class="button small" href="#/artikel/${id}">Dossier ↗</a></header><div class="lp-sheet-top"><section class="lp-current"><h2>Aktuelle Ressourcen <span>${esc(p.state)}</span></h2>${meter('HP',p.hp)}${extraResources(p)}<p>${esc(p.resourceNote)}</p>${p.conditions.length?`<p>${esc(p.conditions.join(' · '))}</p>`:''}</section><section class="lp-profile"><div class="eyebrow">Kampfprofil · ausgerüstet</div>${stats(c)}<p>${esc(c.profile)}</p></section></div><div class="lp-weapon"><div><span class="eyebrow">Standardangriff</span><h2>${esc(c.attack.name)}</h2><span>${esc(c.attack.note)}</span></div><div><strong>${esc(c.attack.hit)}</strong><span>Angriff</span></div><div><strong>${esc(c.attack.damage)}</strong><span>Schaden</span></div></div><p class="lp-gear-note">${esc(p.gearNote)}</p><div class="lp-tabs" role="tablist" aria-label="Charakterbogen-Bereiche">${c.tabs.map(t=>`<button role="tab" id="tab-${t.id}" aria-controls="sheet-panel" aria-selected="${t.id===selected}" tabindex="${t.id===selected?'0':'-1'}" data-sheet-tab="${t.id}" data-sheet-id="${id}">${esc(t.label)}</button>`).join('')}</div><div class="lp-sheet-panel" id="sheet-panel" role="tabpanel" aria-labelledby="tab-${selected}">${tab.sections.map(s=>`<section><h2>${esc(s.title)}</h2>${markdown(s.markdown)}</section>`).join('')}</div><p class="lp-footnote">Manöver, Animus und Buff-Runden werden hier als Regeln dargestellt. Ihr laufender Kampfzustand bleibt im Chat.</p></div>`;
  }
  function render(view,id,params) {
    if(!snapshot)return `<section class="lp-loading" role="status"><div class="eyebrow">Live Play</div><h1>${failure?'Spielstand nicht erreichbar':'Spielstand wird geladen …'}</h1><p>${failure?esc(failure):'Party, Termine und Charakterbögen werden geladen.'}</p>${failure?'<button class="button" data-live-refresh>Erneut versuchen</button>':''}</section>`;
    if(view==='sheet')return sheet(id,params?.get('tab'));
    if(view==='quests')return `<div class="lp-dashboard">${navigation()}${statusLine()}<header class="lp-head"><div class="eyebrow">Spielerwissen · ${esc(snapshot.live.scene.dateLabel)}</div><h1>Questlog</h1><p>Was bekannt ist. Was noch offen bleibt.</p></header>${questLog(true)}</div>`;
    return dashboard();
  }
  function bind() {
    const activeTab=document.querySelector('.lp-tabs [aria-selected="true"]');
    if(activeTab){const bar=activeTab.parentElement;bar.scrollLeft=Math.max(0,activeTab.offsetLeft-bar.offsetLeft-(bar.clientWidth-activeTab.clientWidth)/2);}
    document.querySelectorAll('[data-live-refresh]').forEach(b=>b.onclick=()=>reload(true));
    document.querySelectorAll('[data-quest-filter]').forEach(b=>b.onclick=()=>{
      filter=b.dataset.questFilter;
      document.querySelectorAll('[data-quest-filter]').forEach(f=>f.setAttribute('aria-pressed',String(f.dataset.questFilter===filter)));
      document.getElementById('lp-quest-results').innerHTML=questCards();
    });
    const input=document.getElementById('quest-search'); if(input)input.oninput=()=>{query=input.value.toLocaleLowerCase('de').trim();document.getElementById('lp-quest-results').innerHTML=questCards();};
    document.querySelectorAll('[data-sheet-tab]').forEach(b=>{
      b.onclick=()=>{
        const id=b.dataset.sheetId, selected=b.dataset.sheetTab;
        tabs[id]=selected;
        history.replaceState(null,'',`#/sheet/${id}?tab=${selected}`);
        document.querySelectorAll('[data-sheet-tab]').forEach(t=>{t.setAttribute('aria-selected',String(t===b));t.tabIndex=t===b?0:-1;});
        const tab=snapshot.sheets.characters.find(c=>c.id===id).tabs.find(t=>t.id===selected);
        const panel=document.getElementById('sheet-panel');panel.setAttribute('aria-labelledby',`tab-${selected}`);panel.innerHTML=tab.sections.map(s=>`<section><h2>${esc(s.title)}</h2>${markdown(s.markdown)}</section>`).join('');
      };
      b.onkeydown=e=>{const all=[...document.querySelectorAll('[data-sheet-tab]')], i=all.indexOf(b);let next;
        if(e.key==='ArrowRight')next=(i+1)%all.length;if(e.key==='ArrowLeft')next=(i-1+all.length)%all.length;if(e.key==='Home')next=0;if(e.key==='End')next=all.length-1;
        if(next!==undefined){e.preventDefault();all[next].focus();all[next].click();}
      };
    });
  }
  async function read(url) {
    const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(12000)});
    if(!response.ok)throw Error('HTTP '+response.status);
    return response.json();
  }
  async function reload(manual=false) {
    if(busy)return;busy=true;
    if(manual)document.querySelectorAll('[data-live-refresh]').forEach(b=>{b.disabled=true;b.textContent='Wird geladen …';});
    try {
      const live=await read('data/live.json');
      let sheets=snapshot?.sheets;
      if(!sheets||sheets.meta.sourceRevision!==live.meta.sheetRevision)sheets=await read('data/sheets.json');
      if(live.meta?.schemaVersion!==1||sheets.meta?.schemaVersion!==1||live.meta.sheetRevision!==sheets.meta.sourceRevision||!live.meta.playerSafe||!sheets.meta.playerSafe)throw Error('Snapshot mismatch');
      const changed=!snapshot||JSON.stringify(snapshot.live)!==JSON.stringify(live)||!!failure;
      snapshot={live,sheets};failure='';busy=false;
      if(changed||manual)onChange();
    } catch(e) {
      failure=location.protocol==='file:'?'Live Play benötigt die veröffentlichte Wiki oder einen lokalen Webserver.':'Der veröffentlichte Spielstand konnte nicht vollständig geladen werden. Bitte erneut versuchen.';
      busy=false;onChange();
    }
  }
  function init(callback, options) {
    onChange=callback;helpers=options;reload();
    setInterval(()=>{if(!document.hidden&&/^#\/(live|sheet|quests)/.test(location.hash))reload();},60000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&/^#\/(live|sheet|quests)/.test(location.hash))reload();});
  }
  return {init,render,bind,party:()=>snapshot?party():'',current:()=>snapshot?.live||null};
})();
