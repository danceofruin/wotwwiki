(function(){
'use strict';
try{
  const coreIds=['styke','vesper','valeria'];
  const isDossier=a=>!!a&&!a.adult&&['charaktere','personen'].includes(a.category);

  partyCard=function(p){
    return `<article class="card party-card"><div class="party-top"><div class="portrait-letter" aria-hidden="true">${p.letter}</div><div><h3><a href="#/artikel/${p.id}">${esc(BYID[p.id]?.title||p.id)}</a></h3><small>${esc(p.sub)}</small></div></div><div class="quickstats"><div><strong>${p.hp}</strong><span>HP im Snapshot</span></div><div><strong>${p.ac}</strong><span>AC mit Ausrüstung</span></div><div><strong>${p.third}</strong><span>${esc(p.thirdLabel)}</span></div></div><div class="actions"><a class="button small" href="#/artikel/${p.id}">Akte öffnen</a></div></article>`;
  };

  navigation=function(){
    let out='<div class="nav-label">Die Kampagne</div>'+navItem('start','Am Spieltisch')+navItem('artikel/story-so-far','Die Geschichte bisher')+navItem('chronik','Chronik & Kalender',DATA.events.length);
    out+='<div class="nav-label">Kernfiguren</div>'+navItem('artikel/styke','Styke')+navItem('artikel/vesper','Vesper')+navItem('artikel/valeria','Valeria');
    out+='<div class="nav-label">Figuren</div>'+navItem('dossiers','Alle Dossiers',ARTICLES.filter(isDossier).length)+navItem('beziehungen','Beziehungsatlas',DATA.edges.length);
    out+='<div class="nav-label">Welt</div>'+navItem('kategorie/orte','Orte & Wege',ARTICLES.filter(a=>a.category==='orte').length)+navItem('kategorie/gruppen','Gruppen & Institutionen',ARTICLES.filter(a=>a.category==='gruppen').length)+navItem('kategorie/gegenstaende','Gegenstände',ARTICLES.filter(a=>a.category==='gegenstaende').length)+navItem('kategorie/welt','Setting & Weltwissen',ARTICLES.filter(a=>a.category==='welt').length);
    out+='<div class="nav-label">Nachschlagen</div>'+navItem('kategorie/vorhaben','Pläne & offene Fäden',ARTICLES.filter(a=>a.category==='vorhaben').length)+navItem('kategorie/faehigkeiten','Zauber & Fähigkeiten',ARTICLES.filter(a=>a.category==='faehigkeiten').length)+navItem('kategorie/regeln','Regeln',ARTICLES.filter(a=>a.category==='regeln').length);
    out+='<div class="nav-label">Mein Archiv</div>'+navItem('favoriten','Lesezeichen')+navItem('notizen','Eigene Notizen')+navItem('quellen','Quellen & Stand');
    $('#navigation').innerHTML=out;
  };

  function dossiersGrouped(){
    const core=coreIds.map(id=>BYID[id]).filter(Boolean);
    const rest=ARTICLES.filter(a=>isDossier(a)&&!coreIds.includes(a.id)).sort((a,b)=>a.title.localeCompare(b.title,'de'));
    let out=pageHead('Figuren','Dossiers','Eine Figur, eine Akte. Die drei Kernfiguren stehen separat oben; alle weiteren Personen folgen darunter.');
    out+=section('Kernfiguren')+`<div class="grid party-grid">${PARTY.map(partyCard).join('')}</div>`;
    out+=section('Weitere Personen & Gefährten')+`<div class="dossier-index">${rest.map(a=>`<article class="card"><span class="eyebrow">${esc(CATS[a.category]?.title||'Dossier')}</span><h3><a href="#/artikel/${a.id}">${esc(a.title)}</a></h3><p>${esc(a.summary||'')}</p><div class="card-bottom"><span>${a.aliases?.length?esc(a.aliases[0]):'Kampagnenakte'}</span><a href="#/artikel/${a.id}">Akte öffnen →</a></div></article>`).join('')}</div>`;
    return out;
  }

  const previousRoute=route;
  try{window.removeEventListener('hashchange',previousRoute);}catch(e){}
  route=function(){
    const raw=location.hash.startsWith('#/')?location.hash.slice(2):'start';
    const view=raw.split('?')[0].split('/')[0]||'start';
    if(view==='dossiers'){
      $('#main').innerHTML=dossiersGrouped();
      document.title='Dossiers | Der Nessische Knoten';
      document.querySelectorAll('.nav-link').forEach(a=>a.classList.toggle('active',a.dataset.nav==='dossiers'));
      window.scrollTo({top:0,left:0,behavior:'instant'});
      return;
    }
    previousRoute();
    const id=raw.split('?')[0].split('/')[1];
    if(view==='artikel'&&coreIds.includes(id)){
      document.querySelectorAll('.nav-link').forEach(a=>a.classList.toggle('active',a.dataset.nav==='artikel/'+id));
    }
  };
  window.addEventListener('hashchange',route);

  navigation();
  setTimeout(function(){try{route();}catch(e){console.error(e);}},0);
}catch(e){console.error(e);}
})();
