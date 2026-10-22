// Self-contained: the private Worker serializes this function into a nonce script.
// The wiki imports the same source. Keep dependencies inside the function.
export function mountDiceLog(root, options = {}) {
  const state = options.state ?? {};
  let epoch = 0, busy = false, receipts = [], after = Number.MAX_SAFE_INTEGER, before = null;
  const privatePage = !options.needsKey;
  root.classList.add('dice-log');
  root.innerHTML = `
  <style>
  .dice-log{--dl-bg:var(--panel,#202621);--dl-ink:var(--ink,#e8e8dd);--dl-muted:var(--muted,#b4bbb0);--dl-line:var(--line,#344036);--dl-gold:var(--accent,#d4b67b);color:var(--dl-ink);font:16px/1.5 system-ui}
  .dice-log *{box-sizing:border-box}.dice-log [hidden]{display:none!important}.dice-log label{display:block;font-size:.85rem;color:var(--dl-muted)}
  .dice-log input,.dice-log select,.dice-log button{font:inherit;color:var(--dl-ink);border:1px solid var(--dl-line);border-radius:6px;background:var(--dl-bg);padding:10px 12px;min-width:0}
  .dice-log input,.dice-log select{width:100%;margin:6px 0}.dice-log button{cursor:pointer}.dice-log button:disabled{opacity:.5;cursor:default}.dice-log button.primary{background:var(--dl-gold);color:#171b17;border-color:var(--dl-gold);font-weight:600}
  .dice-log .dl-panel{padding:22px;border:1px solid var(--dl-line);border-radius:9px;background:var(--dl-bg);margin-bottom:18px}.dice-log .dl-row{display:flex;align-items:end;gap:12px;flex-wrap:wrap}.dice-log .dl-row label{flex:1;min-width:220px}.dice-log .dl-row button{margin-bottom:6px}.dice-log .dl-topline{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .dice-log .dl-note{font-size:.85rem;color:var(--dl-muted);margin:8px 0 16px}.dice-log #dl-status{min-height:24px;color:var(--dl-gold);overflow-wrap:anywhere}.dice-log .dl-card{padding:22px;border:1px solid var(--dl-line);border-radius:9px;margin:16px 0}.dice-log h2{font:1.3rem Georgia,serif;margin:0 0 8px;overflow-wrap:anywhere}.dice-log .dl-meta{font-size:.8rem;color:var(--dl-muted);overflow-wrap:anywhere;margin:6px 0}.dice-log table{border-collapse:collapse;width:100%;font-size:.9rem;margin:16px 0}.dice-log th,.dice-log td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--dl-line);overflow-wrap:anywhere}.dice-log th{color:var(--dl-muted);font-weight:500}.dice-log td:last-child{font-weight:700;color:var(--dl-gold)}.dice-log .dl-table{overflow:auto}.dice-log pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.8rem;padding:14px;background:#0002;border-radius:6px}.dice-log summary{cursor:pointer;color:var(--dl-muted);font-size:.85rem}.dice-log .dl-empty{padding:28px;text-align:center;border:1px dashed var(--dl-line);border-radius:8px;color:var(--dl-muted)}
  </style>
  <p class="dl-note">Neueste Belege zuerst. Das private Prüfprotokoll zeigt alle gespeicherten Würfe, einschließlich GM-Würfen und älteren Belegen.</p>
  <form id="dl-connect" class="dl-panel" ${privatePage ? 'hidden' : ''}>
    <div class="dl-row"><label>Privater Schlüssel <input id="dl-key" type="password" autocomplete="off" spellcheck="false" placeholder="MCP_KEY" aria-describedby="dl-key-note"></label><button class="primary" type="submit">Verbinden</button></div>
    <p class="dl-note" id="dl-key-note">Nur in diesem geöffneten Wiki-Tab. Keine Speicherung im Wiki oder Browser-Speicher. Nach Neuladen erneut eingeben.</p>
  </form>
  <section id="dl-browser" hidden>
    <div class="dl-topline"><span class="dl-meta" id="dl-connected"></span><button id="dl-disconnect" type="button" ${privatePage ? 'hidden' : ''}>Trennen</button></div>
    <div class="dl-panel"><div class="dl-row"><label>Sitzung <select id="dl-session" aria-label="Sitzung"></select></label><button id="dl-refresh" type="button">Aktualisieren</button></div><button id="dl-more-sessions" type="button" hidden>Weitere Sitzungen</button>
    <form id="dl-search"><div class="dl-row"><label>Oder direkt nach Beleg-ID suchen <input id="dl-id" autocomplete="off" spellcheck="false" placeholder="z. B. 16ce4c32-4f62-46db-8da4-9ec41d46852b"></label><button type="submit">Beleg öffnen</button></div></form></div>
  </section>
  <p id="dl-status" role="status" aria-live="polite"></p><div id="dl-results"></div>
  <div class="dl-row"><button id="dl-more" type="button" hidden>Weitere Belege</button><button id="dl-download" type="button" hidden>Geladene Belege als JSON</button></div>`;
  const $ = id => root.querySelector('#'+id);
  const select = $('dl-session'), rows = $('dl-results'), status = $('dl-status');
  function base() {
    if (privatePage) return new URL('.', location.href).href;
    return options.apiOrigin.replace(/\/$/, '')+'/'+state.key+'/';
  }
  function setBusy(on) {
    busy = on;
    root.querySelectorAll('button,select').forEach(el => { if (el.id !== 'dl-disconnect') el.disabled = on; });
  }
  async function api(route, query = {}) {
    const url = new URL(route, base()); url.search = new URLSearchParams(query).toString();
    let r;
    try { r = await fetch(url, { cache:'no-store', referrerPolicy:'no-referrer', credentials:'omit', signal:AbortSignal.timeout(15000) }); }
    catch (e) { if (e.name === 'TimeoutError') throw e; throw Error('Keine Verbindung zum Protokoll. Schlüssel prüfen; Server-Verbindung prüfen.'); }
    let data;
    try { data = await r.json(); } catch { throw Error('Server antwortet nicht mit einem lesbaren Protokoll.'); }
    if (!r.ok) throw Error(r.status === 404 ? 'Schlüssel oder Protokolladresse nicht gefunden.' : data.error || 'Protokoll nicht verfügbar.');
    return data;
  }
  function valid(version) { return version === epoch && root.isConnected; }
  async function run(fn) {
    if (busy) return;
    const version = epoch; setBusy(true); status.textContent = 'Lade …';
    try { await fn(version); }
    catch (e) { if (valid(version)) status.textContent = e.name === 'TimeoutError' ? 'Zeitüberschreitung beim Lesen. Erneut laden.' : e.message; }
    finally { if (valid(version)) setBusy(false); }
  }
  function date(value) { const d = new Date(value); return Number.isNaN(+d) ? value : d.toLocaleString('de-DE'); }
  function addSession(s) {
    let option = Array.from(select.options).find(o => o.value === s.session);
    if (!option) { option = document.createElement('option'); option.value = s.session; select.append(option); }
    option.textContent = s.session + (s.receipt_count ? ' · '+s.receipt_count+' Belege · '+date(s.last_roll_at) : '');
  }
  function clearResults() { receipts = []; after = Number.MAX_SAFE_INTEGER; rows.replaceChildren(); $('dl-more').hidden = true; $('dl-download').hidden = true; }
  function showReceipt(receipt) {
    receipts.push(receipt);
    const card = document.createElement('article'); card.className = 'dl-card';
    const heading = document.createElement('h2'); heading.textContent = receipt.action_id; card.append(heading);
    for (const text of [date(receipt.created_at)+' · '+receipt.session, 'Beleg '+receipt.receipt_id+' · Nr. '+receipt.seq]) {
      const p = document.createElement('p'); p.className = 'dl-meta'; p.textContent = text; card.append(p);
    }
    const wrap = document.createElement('div'); wrap.className = 'dl-table';
    const table = document.createElement('table'), head = document.createElement('thead'), tr = document.createElement('tr');
    for (const label of ['Wurf','Ausdruck','Einzelwürfel','Bonus','Gesamt']) { const th = document.createElement('th'); th.textContent = label; th.scope = 'col'; tr.append(th); }
    head.append(tr); table.append(head); const body = document.createElement('tbody');
    for (const roll of receipt.rolls) { const line = document.createElement('tr');
      for (const value of [roll.label, roll.expression, roll.dice.join(' + '), roll.modifier, roll.total]) {
        const td = document.createElement('td'); td.textContent = String(value); line.append(td);
      } body.append(line);
    }
    table.append(body); wrap.append(table); card.append(wrap);
    const details = document.createElement('details'), summary = document.createElement('summary'), pre = document.createElement('pre');
    summary.textContent = 'Spielerbeleg anzeigen'; pre.textContent = JSON.stringify(receipt,null,2); details.append(summary,pre); card.append(details); rows.append(card);
    $('dl-download').hidden = false;
  }
  async function loadReceipts(version, reset) {
    const session = select.value;
    if (reset) clearResults();
    if (!session) { status.textContent = 'Noch keine Sitzungen vorhanden.'; return; }
    const data = await api('receipts', {session, before:String(after)});
    if (!valid(version)) return;
    for (const receipt of data.receipts) showReceipt(receipt);
    after = data.next_before_seq; $('dl-more').hidden = data.receipts.length < 50 || after === null;
    if (!receipts.length) { const p = document.createElement('p'); p.className = 'dl-empty'; p.textContent = 'In dieser Sitzung sind noch keine Belege gespeichert.'; rows.append(p); }
    status.textContent = receipts.length+' Belege geladen.';
  }
  async function loadSessions(version, reset) {
    const previous = select.value;
    const data = await api('sessions', reset ? {} : {before:String(before)});
    if (!valid(version)) return;
    if (reset) select.replaceChildren();
    for (const session of data.sessions) addSession(session);
    if (reset && Array.from(select.options).some(o => o.value === previous)) select.value = previous;
    before = data.next_before_seq; $('dl-more-sessions').hidden = data.sessions.length < 50 || before === null;
    if (reset) await loadReceipts(version,true);
    else status.textContent = select.options.length+' Sitzungen zur Auswahl.';
  }
  function connected() { $('dl-connect').hidden = true; $('dl-browser').hidden = false; $('dl-connected').textContent = 'Privates Protokoll verbunden'; }
  $('dl-connect').onsubmit = event => {
    event.preventDefault(); if (busy) return;
    const key = $('dl-key').value.trim();
    if (!/^[A-Za-z0-9_-]{32,128}$/.test(key)) { status.textContent = 'MCP_KEY benötigt 32–128 Buchstaben, Zahlen, _ oder -.'; return; }
    state.key = key; $('dl-key').value = ''; connected(); run(v => loadSessions(v,true));
  };
  $('dl-disconnect').onclick = () => {
    epoch++; delete state.key; setBusy(false); clearResults(); select.replaceChildren();
    $('dl-key').value = ''; $('dl-browser').hidden = true; $('dl-connect').hidden = false;
    status.textContent = 'Verbindung getrennt. Schlüssel aus diesem Tab entfernt.';
  };
  select.onchange = () => run(v => loadReceipts(v,true));
  $('dl-refresh').onclick = () => run(v => loadSessions(v,true));
  $('dl-more-sessions').onclick = () => run(v => loadSessions(v,false));
  $('dl-more').onclick = () => run(v => loadReceipts(v,false));
  $('dl-search').onsubmit = event => {
    event.preventDefault(); const id = $('dl-id').value.trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) { status.textContent = 'Bitte die vollständige Beleg-ID aus dem Chat eingeben.'; return; }
    run(async version => { const receipt = await api('receipt',{id}); if (!valid(version)) return;
      clearResults(); addSession({session:receipt.session}); select.value = receipt.session;
      showReceipt(receipt); status.textContent = 'Beleg gefunden.';
    });
  };
  $('dl-download').onclick = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(receipts,null,2)],{type:'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = 'wotw-wuerfelprotokoll.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
  };
  if (privatePage || state.key) { connected(); run(v => loadSessions(v,true)); }
}

const wikiState = {};
export function mount(root) {
  return mountDiceLog(root, {needsKey:true, apiOrigin:'https://wotw-dice.danceofruin79.workers.dev', state:wikiState});
}

