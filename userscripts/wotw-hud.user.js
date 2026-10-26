// ==UserScript==
// @name         Way of the Wicked HUD 2
// @namespace    https://danceofruin.github.io/wotwwiki/
// @version      2.0.0
// @description  Read-only character combat sheets, player-known quests, activity and treasury from curated GitHub Pages snapshots.
// @author       WotW Main
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @noframes
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      danceofruin.github.io
// @updateURL    https://danceofruin.github.io/wotwwiki/userscripts/wotw-hud.user.js
// @downloadURL  https://danceofruin.github.io/wotwwiki/userscripts/wotw-hud.user.js
// ==/UserScript==

(function () {
  "use strict";

  const BASE = "https://danceofruin.github.io/wotwwiki/";
  const PREFIX = "wotw-hud-v2:";
  const TAB_IDS = ["styke", "vesper", "valeria", "notes", "treasury"];
  const TAB_TITLES = { styke:"STYKE", vesper:"VESPER", valeria:"VALERIA", notes:"NOTES", treasury:"TREASURY" };
  const HOST_ID = "wotw-hud-v2-host";
  const MIN_WIDTH = 390;
  const MIN_HEIGHT = 310;
  const REFRESH_ON_FOCUS_MS = 5 * 60 * 1000;
  if (window.top !== window.self || document.getElementById(HOST_ID)) return;

  function getStored(key, fallback) {
    try { const value = GM_getValue(PREFIX + key); return value === undefined ? fallback : value; }
    catch (_) { return fallback; }
  }
  function store(key, value) {
    try { GM_setValue(PREFIX + key, value); } catch (_) { /* private UI still works */ }
  }
  function esc(value) {
    return String(value === null || value === undefined ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch];
    });
  }
  function number(value) {
    return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("de-DE") : "nicht bekannt";
  }
  function firstDefined(value, fallback) {
    return value === 0 || value === false || (value !== null && value !== undefined && value !== "") ? value : fallback;
  }
  function dateLabel(date) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ""));
    return match ? match[3] + "." + match[2] + "." + match[1] + " AR" : String(date || "unbekannt");
  }
  function urlFor(route) { return BASE + "#/" + route; }
  function link(url, label) {
    return '<a target="_blank" rel="noopener noreferrer" href="' + esc(url) + '">' + esc(label) + '</a>';
  }
  function statusName(status) {
    return { active:"Aktiv", waiting:"Wartet", scheduled:"Terminiert", completed:"Erledigt",
      blocked:"Blockiert", planned:"Geplant", ready:"Bereit", handoff:"Übergabe" }[status] || String(status || "offen");
  }
  function tag(status) {
    const safe = /^(active|waiting|scheduled|completed|blocked|planned|ready|handoff)$/.test(status || "") ? status : "unknown";
    return '<span class="state-tag state-' + safe + '">' + esc(statusName(status)) + '</span>';
  }

  const savedTab = getStored("tab", "styke");
  const state = {
    tab:TAB_IDS.includes(savedTab) ? savedTab : "styke",
    data:null, error:"", warning:"", checkedAt:0, loading:false,
    openSections:new Set(), questFilter:"open", query:"",
    collapsed:Boolean(getStored("collapsed", false)), scratch:String(getStored("scratch", ""))
  };

  const host = document.createElement("div");
  host.id = HOST_ID;
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode:"open" });

  const css = [
    ":host{all:initial;color-scheme:dark;font:13px/1.45 system-ui,-apple-system,Segoe UI,Arial,sans-serif;}",
    "*{box-sizing:border-box}button,input,textarea{font:inherit}",
    "#panel{position:fixed;top:65px;right:17px;width:580px;height:min(800px,calc(100vh - 84px));min-width:390px;min-height:310px;max-width:calc(100vw - 8px);max-height:calc(100vh - 8px);z-index:2147483645;display:flex;flex-direction:column;background:#111214;color:#e8e9ec;border:1px solid #393b42;border-radius:12px;box-shadow:0 18px 55px #0009;overflow:hidden;}",
    "#panel[hidden],#launcher[hidden]{display:none!important}",
    "#launcher{position:fixed;right:17px;top:75px;z-index:2147483645;cursor:pointer;color:#fff;background:#15161b;border:1px solid #575b67;border-radius:10px;padding:10px 15px;box-shadow:0 8px 25px #0008;font-weight:750;letter-spacing:.08em}",
    "header{padding:11px 13px 7px;background:#0e0f11;flex:none}",
    ".heading{display:flex;align-items:center;gap:8px}",
    ".drag{flex:1;min-width:0;cursor:move;user-select:none;touch-action:none}",
    ".brand{font-size:17px;font-weight:900;letter-spacing:.11em;white-space:nowrap}",
    ".status{font-size:10px;color:#9ca3b3;min-height:18px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".status.ok{color:#8bd2a1}.status.bad{color:#f5b5a2}",
    ".tools{display:flex;gap:5px;flex:none}",
    ".tool{background:#22242a;border:1px solid #393d47;border-radius:6px;color:#ddd;min-width:31px;height:29px;padding:0 7px;cursor:pointer;font-size:14px}",
    ".tool:hover,.tool:focus-visible{background:#363942;outline:1px solid #7086ae}",
    ".tabs{flex:none;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));background:#111217;border-top:1px solid #2a2b30;border-bottom:1px solid #37393f}",
    ".tab{color:#b5b9c6;padding:13px 4px 11px;border:0;border-bottom:2px solid transparent;background:transparent;cursor:pointer;font-size:10px;font-weight:800;letter-spacing:.04em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".tab:hover{background:#25272d}.tab[aria-selected=true]{background:#25262d;color:#fff;border-bottom-color:#c4b48a}",
    "#scroll{flex:1;min-height:0;overflow:auto;scrollbar-color:#555 #17181b;scrollbar-width:thin;padding:12px;}",
    ".page-head{margin:0 0 12px;padding:2px 1px 11px;border-bottom:1px solid #2a2d33}",
    ".eyebrow{font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:#a4acc0}",
    "h2,h3,h4,p{margin:0}h2{font-size:19px;line-height:1.3;margin:4px 0 5px}h3{font-size:13px;margin-bottom:7px}",
    ".sub{color:#aab0bc;font-size:12px;line-height:1.45}",
    ".stats-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-bottom:10px}",
    ".stat-box{background:#191a1f;border:1px solid #373941;border-radius:8px;padding:10px 10px 8px;min-width:0}",
    ".stat-box h3{font-size:10px;color:#abb3c3;letter-spacing:.1em;text-transform:uppercase;margin:0 0 7px}",
    ".stat-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:baseline;gap:5px;border-top:1px solid #2d3038;padding:6px 0}",
    ".stat-row:first-of-type{border-top:0}.stat-row span{color:#bfc5d1;font-size:11px}.stat-row b{font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap;color:#fff}",
    ".weapon{border:1px solid #3d4148;border-radius:8px;padding:10px;margin:0 0 12px;background:#1b1d23}",
    ".weapon strong{display:block;font-size:13px}.weapon b{display:block;margin:2px 0;font-size:14px;color:#e6d29a;font-variant-numeric:tabular-nums}",
    ".tip{font-size:11px;color:#a7aeba;line-height:1.5;margin:5px 0}.empty{padding:24px 16px;text-align:center;color:#b4bdc9}",
    ".warn{font-size:11px;color:#f5c6a2;background:#34251f;border:1px solid #6e5142;border-radius:7px;padding:9px 11px;margin:0 0 10px}",
    ".section-label{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#aeb6c5;margin:18px 0 7px}",
    "details.accordion,details.quest,details.project{border:1px solid #34363c;border-radius:8px;margin:7px 0;overflow:hidden;background:#17181b}",
    "details.accordion[open],details.quest[open],details.project[open]{border-color:#555a65}",
    "details summary{list-style:none;cursor:pointer;user-select:none;display:flex;align-items:center;gap:8px;padding:10px 11px;font-weight:700;color:#f0f1f2}",
    "details summary::-webkit-details-marker{display:none}details summary:after{content:'+';margin-left:auto;color:#9a9fad;font-size:18px;line-height:1}",
    "details[open] summary:after{content:'−'}details[open] summary{background:#22242a;border-bottom:1px solid #353840}",
    "details summary:hover{background:#292b31}.inside{padding:10px 11px 12px}",
    ".item{padding:8px 2px;border-bottom:1px solid #2c2e35;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 9px}",
    ".item:last-child{border-bottom:0}.item-name{font-size:12px;font-weight:650}.item-tag{font-size:12px;color:#ebd18e;white-space:nowrap;font-variant-numeric:tabular-nums}",
    ".item-detail{grid-column:1/-1;color:#b3b9c5;font-size:11px;line-height:1.52;overflow-wrap:anywhere}",
    ".group{border-bottom:1px solid #383a40;padding:10px 0}.group:last-child{border-bottom:0}.group h4{font-size:11px;color:#cfd4df;margin:0 0 5px}",
    ".chips{display:flex;gap:5px;flex-wrap:wrap}.chip{border:1px solid #383b44;background:#22252b;border-radius:5px;padding:4px 6px;color:#ddd;font-size:11px}",
    ".steps{margin:0 0 0 20px;padding:0;color:#ddd}.steps li{padding:3px 0}",
    ".summary-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:12px 0}",
    ".money-card{background:#1d2025;border:1px solid #45464d;border-radius:8px;padding:9px 6px;text-align:center;min-width:0}",
    ".money-card small{display:block;font-size:10px;color:#a6adb9}.money-card strong{display:block;font-size:18px;font-variant-numeric:tabular-nums;white-space:nowrap}",
    ".money-card.highlight{border-color:#978459;background:#25251f}.money-card.highlight strong{color:#e9d29d}",
    ".state-tag{display:inline-block;border:1px solid #474b54;border-radius:5px;padding:2px 5px;color:#cbd0d9;font-size:10px;font-weight:650;white-space:nowrap}",
    ".state-active,.state-ready{border-color:#47745c;color:#9fdeb5}.state-waiting,.state-planned,.state-scheduled{border-color:#6f684a;color:#d9c88e}.state-blocked{border-color:#914a49;color:#eca29f}.state-completed{color:#8f949f}",
    ".small-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px}.small-row .state-tag{margin-left:auto}",
    ".kv{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px;border-bottom:1px solid #30333a;padding:7px 0}.kv strong{text-align:right;font-variant-numeric:tabular-nums}",
    ".filterbar{display:flex;gap:5px;flex-wrap:wrap;margin:12px 0 8px}.filter{background:#25272c;color:#c9ccd2;border:1px solid #3b3d44;border-radius:6px;padding:5px 9px;cursor:pointer;font-size:11px}",
    ".filter[aria-pressed=true]{border-color:#bbac87;color:#fff;background:#403b30}.search{display:block;background:#181a20;color:#eee;border:1px solid #4c4e57;border-radius:6px;padding:9px;width:100%;outline:none}",
    ".quest-desc{color:#c8ccd4;font-size:12px;line-height:1.55}.next{padding:8px 9px;margin:9px 0;background:#22262e;border-left:3px solid #c3ad78;font-size:11px;color:#dfe1e6}",
    ".bullet{margin:8px 0 0;padding-left:18px;color:#b9bfca;font-size:11px}.bullet li{margin:5px 0}",
    ".notes{border:1px solid #353740;border-radius:8px;background:#191b20;padding:10px 11px;margin:8px 0;color:#c4c8d2;font-size:11px;line-height:1.55}",
    ".scratch{resize:vertical;width:100%;min-height:85px;border-radius:7px;border:1px solid #41444c;background:#17191e;color:#eceef2;padding:10px;font-size:12px}",
    ".bottom-links{display:flex;gap:13px;flex-wrap:wrap;padding:13px 0;font-size:11px}.bottom-links a{color:#d1c08e;text-decoration:none}.bottom-links a:hover{text-decoration:underline}",
    ".footer{flex:none;padding:7px 13px;display:flex;justify-content:space-between;gap:8px;border-top:1px solid #30333a;color:#8d96a7;font-size:10px;background:#121317}",
    ".resize{position:absolute;bottom:0;left:0;width:18px;height:18px;cursor:nesw-resize;touch-action:none;z-index:2}",
    ".resize:after{content:'◢';position:absolute;bottom:0;left:3px;transform:rotate(90deg);color:#6b6f7b;font-size:15px}",
    "a{color:#dfc993}a:focus-visible,button:focus-visible,summary:focus-visible,textarea:focus-visible{outline:2px solid #c4b48a;outline-offset:1px}",
    "@media(max-width:600px){#panel{width:calc(100vw - 8px);right:4px;top:4px;max-height:calc(100dvh - 8px)}.stats-grid{gap:6px}.stat-box{padding:8px 7px}.brand{font-size:14px}.tab{font-size:9px;padding:12px 2px}.money-card strong{font-size:15px}}"
  ].join("");

  shadow.innerHTML = '<style>' + css + '</style>' +
    '<button id="launcher" aria-label="Way of the Wicked HUD öffnen" hidden>WOTW HUD</button>' +
    '<section id="panel" role="complementary" aria-label="Way of the Wicked HUD">' +
      '<header><div class="heading"><div class="drag" id="drag" title="HUD verschieben">' +
        '<div class="brand">WAY OF THE WICKED</div><div class="status" id="status">Spieler-Snapshots laden …</div></div>' +
        '<div class="tools"><button class="tool" id="refresh" title="GitHub-Pages-Daten aktualisieren" aria-label="Daten aktualisieren">↻</button>' +
        '<button class="tool" id="collapse" title="HUD einklappen" aria-label="HUD einklappen">−</button>' +
        '<button class="tool" id="close" title="HUD verbergen" aria-label="HUD verbergen">×</button></div></div></header>' +
      '<nav class="tabs" id="tabs" role="tablist" aria-label="WotW Bereiche"></nav>' +
      '<main id="scroll" role="tabpanel" tabindex="0"></main>' +
      '<div class="footer"><span>Player-safe · GitHub Pages</span><span id="footer-date">Kein Chat-Tracking</span></div>' +
      '<div class="resize" id="resize" title="HUD-Größe ändern" aria-label="HUD-Größe ändern"></div>' +
    '</section>';

  const $ = function (selector) { return shadow.querySelector(selector); };
  const panel = $("#panel");
  const scroll = $("#scroll");
  const geom = getStored("geometry", null);
  function clamp(value, low, high) { return Math.max(low, Math.min(high, value)); }
  function applyGeometry() {
    const w = clamp(Number(geom && geom.w) || 580, Math.min(MIN_WIDTH, window.innerWidth - 8), Math.max(MIN_WIDTH, window.innerWidth - 8));
    const h = clamp(Number(geom && geom.h) || 800, Math.min(MIN_HEIGHT, window.innerHeight - 8), Math.max(MIN_HEIGHT, window.innerHeight - 8));
    const left = clamp(Number(geom && geom.x) || Math.max(4, window.innerWidth - w - 17), 4, Math.max(4, window.innerWidth - w - 4));
    const top = clamp(Number(geom && geom.y) || 65, 4, Math.max(4, window.innerHeight - h - 4));
    panel.style.cssText = "left:" + left + "px;top:" + top + "px;right:auto;width:" + w + "px;height:" + h + "px;";
  }
  function saveGeometry() {
    const box = panel.getBoundingClientRect();
    store("geometry", { x:Math.round(box.left), y:Math.round(box.top), w:Math.round(box.width), h:Math.round(box.height) });
  }
  applyGeometry();
  function dragResize(el, isResize) {
    let start = null;
    el.addEventListener("pointerdown", function (event) {
      if (event.button !== 0 || (!isResize && event.target.closest("button"))) return;
      const rect = panel.getBoundingClientRect();
      start = { x:event.clientX, y:event.clientY, left:rect.left, top:rect.top, width:rect.width, height:rect.height };
      el.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    el.addEventListener("pointermove", function (event) {
      if (!start) return;
      if (isResize) {
        const right = start.left + start.width;
        const width = clamp(start.width + start.x - event.clientX, Math.min(MIN_WIDTH, window.innerWidth - 8), window.innerWidth - 8);
        const height = clamp(start.height + event.clientY - start.y, Math.min(MIN_HEIGHT, window.innerHeight - 8), window.innerHeight - start.top - 4);
        panel.style.width = width + "px";
        panel.style.left = clamp(right - width, 4, window.innerWidth - width - 4) + "px";
        panel.style.height = height + "px";
      } else {
        panel.style.left = clamp(start.left + event.clientX - start.x, 4, window.innerWidth - start.width - 4) + "px";
        panel.style.top = clamp(start.top + event.clientY - start.y, 4, window.innerHeight - start.height - 4) + "px";
      }
    });
    function end() { if (start) { start = null; saveGeometry(); } }
    el.addEventListener("pointerup", end);
    el.addEventListener("lostpointercapture", end);
    el.addEventListener("pointercancel", end);
  }
  dragResize($("#drag"), false);
  dragResize($("#resize"), true);

  function setVisible(visible) {
    state.collapsed = !visible;
    panel.hidden = !visible;
    $("#launcher").hidden = visible;
    store("collapsed", !visible);
  }
  setVisible(!state.collapsed);

  function requestJson(name) {
    return new Promise(function (resolve, reject) {
      const url = BASE + "data/" + name + ".json?_=" + Date.now();
      if (typeof GM_xmlhttpRequest !== "function") { reject(new Error("GM_xmlhttpRequest fehlt")); return; }
      GM_xmlhttpRequest({
        method:"GET", url:url, timeout:15000, responseType:"json",
        headers:{ Accept:"application/json" },
        onload:function (response) {
          if (response.status !== 200) { reject(new Error(name + ": HTTP " + response.status)); return; }
          try {
            const object = response.response && typeof response.response === "object" ? response.response : JSON.parse(response.responseText);
            if (!object || !object.meta || object.meta.playerSafe !== true) throw new Error("Keine geprüfte Spieleransicht");
            resolve(object);
          } catch (error) { reject(new Error(name + ": " + error.message)); }
        },
        onerror:function () { reject(new Error(name + ": Netzwerkfehler")); },
        ontimeout:function () { reject(new Error(name + ": Zeitüberschreitung")); }
      });
    });
  }

  function validateBundle(data) {
    const live = data.live, sheets = data.sheets, horn = data.horn, hud = data.hud;
    if (!Array.isArray(live.party) || !Array.isArray(live.quests) || !Array.isArray(horn.projects) ||
        !Array.isArray(sheets.characters) || !Array.isArray(hud.characters) || !horn.treasury) {
      throw new Error("Ein GitHub-Datensatz hat nicht das erwartete Format.");
    }
    if (live.meta.sheetRevision !== sheets.meta.sourceRevision) {
      throw new Error("Live Play und Charakterbögen stammen aus unterschiedlichen Reviews.");
    }
    if (live.meta.sourceRevision !== horn.meta.sourceRevision || live.scene.date !== horn.meta.campaignDate) {
      throw new Error("Queststand und Horn-Kasse stammen aus unterschiedlichen Reviews.");
    }
    const warnings = [];
    if (hud.meta.campaignDate !== live.scene.date) {
      warnings.push("Kampfdetails: " + dateLabel(hud.meta.campaignDate) + "; Live Play: " + dateLabel(live.scene.date) + ".");
    }
    return warnings.join(" ");
  }
  function refresh(force) {
    if (state.loading || (!force && Date.now() - state.checkedAt < REFRESH_ON_FOCUS_MS)) return;
    state.loading = true;
    setStatus("GitHub-Pages-Daten werden geprüft …", "neutral");
    const files = ["hud","sheets","live","horn"];
    Promise.all(files.map(requestJson)).then(function (results) {
      const bundle = Object.fromEntries(files.map(function (file, i) { return [file, results[i]]; }));
      const warning = validateBundle(bundle);
      state.data = bundle;
      state.warning = warning;
      state.error = "";
      state.checkedAt = Date.now();
      store("cache", JSON.stringify(bundle));
      render(true);
    }).catch(function (error) {
      state.error = String(error.message || error);
      const cached = getStored("cache", "");
      if (!state.data && cached) {
        try { const old = JSON.parse(cached); validateBundle(old); state.data = old; }
        catch (_) { state.data = null; }
      }
      render(true);
    }).finally(function () { state.loading = false; });
  }

  function setStatus(message, kind) {
    const node = $("#status");
    node.textContent = message;
    node.className = "status" + (kind === "ok" ? " ok" : kind === "bad" ? " bad" : "");
  }
  function renderTabs() {
    $("#tabs").innerHTML = TAB_IDS.map(function (id) {
      return '<button role="tab" class="tab" data-tab="' + id + '" aria-selected="' + (state.tab === id ? "true" : "false") +
        '" tabindex="' + (state.tab === id ? "0" : "-1") + '">' + TAB_TITLES[id] + '</button>';
    }).join("");
  }
  function statRow(name, value) {
    return '<div class="stat-row"><span>' + esc(name) + '</span><b>' + esc(firstDefined(value,"?")) + '</b></div>';
  }
  function sectionItems(items) {
    return (items || []).map(function (item) {
      const name = item.name || item.label || "";
      const value = item.tag || "";
      const detail = item.detail || "";
      return '<div class="item"><span class="item-name">' + esc(name) + '</span>' +
        (value ? '<span class="item-tag">' + esc(value) + '</span>' : "") +
        (detail ? '<div class="item-detail">' + esc(detail) + '</div>' : "") + '</div>';
    }).join("");
  }
  function sectionContent(section) {
    const parts = [];
    if (section.subtitle && !/klick.*(ready|expended)/i.test(section.subtitle)) {
      parts.push('<p class="tip">' + esc(section.subtitle) + '</p>');
    }
    if (section.type === "spell-groups") {
      (section.groups || []).forEach(function (group) {
        parts.push('<div class="group"><h4>' + esc(group.label) + '</h4><div class="chips">' +
          (group.items || []).map(function (item) { return '<span class="chip">' + esc(item) + '</span>'; }).join("") +
          '</div></div>');
      });
    } else if (section.type === "note") {
      parts.push('<h4>' + esc(section.title || "") + '</h4><p class="tip">' + esc(section.text || "") + '</p>');
    } else if (section.type === "flow") {
      parts.push('<ol class="steps">' + (section.steps || []).map(function (step) {
        return '<li>' + esc(step) + '</li>';
      }).join("") + '</ol>');
    } else {
      // A HUD v2 displays information, never expenditure buttons or "ready/expended" toggles.
      parts.push(sectionItems(section.items));
    }
    return parts.join("") || '<p class="tip">Noch keine geprüften Einträge.</p>';
  }
  function sectionAccordion(character, section) {
    if (section.id === "saves") return "";
    const key = character + "|" + section.id;
    return '<details class="accordion" data-section="' + esc(key) + '"' +
      (state.openSections.has(key) ? ' open' : '') + '><summary>' + esc(section.label || section.id) + '</summary>' +
      '<div class="inside">' + sectionContent(section) + '</div></details>';
  }
  function characterPage(id) {
    const d = state.data;
    const sheet = d.sheets.characters.find(function (c) { return c.id === id; });
    const sectionSource = d.hud.characters.find(function (c) { return c.id === id; });
    const liveChar = d.live.party.find(function (c) { return c.id === id; });
    if (!sheet || !sectionSource || !liveChar) return '<div class="empty">Unvollständiger Charakterdatensatz.</div>';
    const s = sheet.stats;
    const hp = liveChar.hp && liveChar.hp.current !== null ?
      liveChar.hp.current + "/" + liveChar.hp.max : "?/" + firstDefined(sheet.hpMax,"?");
    const left = [
      ["HP",hp],["AC",s.ac],["Touch AC",s.touch],["Flat-Footed",s.flatFooted],["Initiative",s.initiative]
    ].map(function (a) { return statRow(a[0],a[1]); }).join("");
    const right = [
      ["Fortitude",s.fort],["Reflex",s.ref],["Will",s.will],["CMB",s.cmb],["CMD",s.cmd]
    ].map(function (a) { return statRow(a[0],a[1]); }).join("");
    const attack = sheet.attack || {};
    return '<div class="page-head"><div class="eyebrow">Charakterbogen · Stufe ' + esc(sheet.level) + '</div>' +
      '<h2>' + esc(sheet.name) + '</h2><p class="sub">' + esc(sheet.class) + '</p></div>' +
      '<div class="stats-grid">' +
        '<div class="stat-box"><h3>Verteidigung</h3>' + left + '</div>' +
        '<div class="stat-box"><h3>Rettung & Manöver</h3>' + right + '</div></div>' +
      '<div class="weapon"><div class="eyebrow">Standard-Angriffsprofil</div><strong>' + esc(attack.name || "") +
        '</strong><b>' + esc(attack.hit || "?") + ' · ' + esc(attack.damage || "") + '</b>' +
        '<p class="tip">' + esc(attack.note || "") + '</p>' +
        '<p class="tip">BAB ' + esc(s.bab || "?") + ' · Bewegung ' + esc(s.speed || "?") + '</p></div>' +
      (liveChar.conditions && liveChar.conditions.length ? '<div class="warn">Zustände im Snapshot: ' +
        esc(liveChar.conditions.join(", ")) + '</div>' : "") +
      '<div class="section-label">Kampf- & Klassenwerkzeuge</div>' +
      sectionSource.sections.map(function (section) { return sectionAccordion(id,section); }).join("") +
      '<div class="bottom-links">' + link(urlFor("sheet/" + id), "Vollständiger Wikibogen") + '</div>';
  }

  function questList() {
    const quests = state.data.live.quests || [];
    const selected = quests.filter(function (q) {
      if (state.questFilter === "open" && q.status === "completed") return false;
      if (state.questFilter === "completed" && q.status !== "completed") return false;
      if (state.query && !(q.title + " " + q.summary + " " + q.next).toLowerCase().includes(state.query.toLowerCase())) return false;
      return true;
    });
    const priority = { active:0, blocked:1, scheduled:2, waiting:3, completed:4 };
    selected.sort(function (a,b) { return (priority[a.status] ?? 5) - (priority[b.status] ?? 5); });
    return selected.map(function (q) {
      return '<details class="quest"><summary><span>' + esc(q.title) + '</span>' + tag(q.status) + '</summary>' +
        '<div class="inside"><p class="quest-desc">' + esc(q.summary) + '</p>' +
        (q.next ? '<div class="next"><b>Nächster Schritt:</b> ' + esc(q.next) + '</div>' : "") +
        (q.known && q.known.length ? '<ul class="bullet">' + q.known.map(function (k) {
          return '<li>' + esc(k) + '</li>';
        }).join("") + '</ul>' : "") +
        '<p class="tip">Letzter Queststand: ' + esc(dateLabel(q.updated)) + '</p></div></details>';
    }).join("") || '<p class="empty">Keine passenden Quests.</p>';
  }
  function projectList(projects) {
    const priority = { blocked:0, active:1, ready:2, handoff:3, planned:4, completed:5 };
    const sorted = projects.slice().sort(function (a,b) { return (priority[a.status] ?? 6) - (priority[b.status] ?? 6); });
    return sorted.map(function (p) {
      return '<details class="project"><summary><span>' + esc(p.title) + '</span>' + tag(p.status) + '</summary>' +
        '<div class="inside"><p class="quest-desc">' + esc(p.progress || "") + '</p>' +
        (Number.isFinite(p.done) && Number.isFinite(p.total) && p.total > 0 ?
          '<div class="kv"><span>Fortschritt</span><strong>' + esc(p.done) + ' / ' + esc(p.total) + '</strong></div>' : "") +
        (p.next ? '<div class="next"><b>Nächster Schritt:</b> ' + esc(p.next) + '</div>' : "") +
        '<p class="tip">Zuständig: ' + esc((p.owners || []).join(", ") || "nicht zugeteilt") + '</p></div></details>';
    }).join("") || '<p class="tip">Keine laufenden Arbeiten im geprüften Snapshot.</p>';
  }
  function notesPage() {
    const d = state.data;
    const scene = d.live.scene;
    const open = (d.live.quests || []).filter(function (q) { return q.status !== "completed"; }).length;
    const works = (d.horn.projects || []).filter(function (p) { return p.status !== "completed"; });
    const filter = [["open","Offen"],["all","Alle"],["completed","Erledigt"]].map(function (a) {
      return '<button class="filter" data-filter="' + a[0] + '" aria-pressed="' +
        (state.questFilter === a[0] ? "true" : "false") + '">' + a[1] + '</button>';
    }).join("");
    const appointments = (d.live.appointments || []).filter(function (a) { return a.date >= scene.date; })
      .sort(function (a,b) { return a.date.localeCompare(b.date); });
    return '<div class="page-head"><div class="eyebrow">Automatisch aus Live Play & Horn</div><h2>Quests & Aktivitäten</h2>' +
      '<p class="sub">' + esc(scene.dateLabel) + ' · ' + esc(scene.time) + '<br>' + esc(scene.location) + '</p></div>' +
      '<div class="notes">' + esc(scene.summary) + '</div>' +
      '<div class="section-label">Questlog · ' + open + ' offen</div>' +
      '<div class="filterbar">' + filter + '</div>' +
      '<input class="search" id="quest-search" type="search" value="' + esc(state.query) + '" placeholder="Quests suchen …" aria-label="Quests suchen">' +
      '<div id="quest-list">' + questList() + '</div>' +
      '<div class="section-label">Nächste Termine · ' + appointments.length + '</div>' +
      appointments.map(function (a) {
        return '<div class="notes"><div class="small-row"><strong>' + esc(a.title) + '</strong>' +
          '<span class="state-tag">' + esc(dateLabel(a.date)) + '</span></div><div class="tip">' +
          esc(a.time) + '</div>' + esc(a.note) + '</div>';
      }).join("") +
      '<div class="section-label">Laufende Arbeiten · ' + works.length + '</div>' +
      projectList(works) +
      '<div class="section-label">Eigene Kurznotizen (nur lokal)</div>' +
      '<textarea class="scratch" id="scratch" placeholder="Optional: eigene Notizen. Werden nicht an GitHub oder ChatGPT übertragen.">' +
      esc(state.scratch) + '</textarea><p class="tip">Das Questlog wird vom veröffentlichten, redaktionell geprüften Git-Snapshot übernommen. Es liest nicht den laufenden Chat aus.</p>' +
      '<div class="bottom-links">' + link(urlFor("quests"), "Questlog im Wiki") + link(urlFor("horn"), "Horn-Projekte") + '</div>';
  }
  function treasuryPage() {
    const d = state.data;
    const t = d.horn.treasury;
    const income = [
      ["Gesamtbestand",t.liquid],
      ["Zweckgebunden",t.earmarked],
      ["Frei verfügbar",t.free]
    ];
    const cards = income.map(function (a,i) {
      return '<div class="money-card' + (i===2 ? ' highlight' : '') + '"><small>' +
        esc(a[0]) + '</small><strong>' + number(a[1]) + '</strong><small>GM</small></div>';
    }).join("");
    const assets = (d.horn.inventory || []).filter(function (i) {
      return i.id !== "cash" && (i.group === "Sachwerte" || i.group === "Geld");
    });
    const pending = (d.horn.projects || []).filter(function (p) {
      return ["blocked","planned","handoff"].includes(p.status) && /(?:\bGM\b|\bgp\b|Material|finanzi)/i.test(p.progress + " " + p.next);
    });
    return '<div class="page-head"><div class="eyebrow">Knoten · bestätigte Schatzkammer</div><h2>Treasury</h2>' +
      '<p class="sub">Quelle: Horn- und Kassen-Snapshot ' + esc(dateLabel(d.horn.meta.campaignDate)) +
      '. Keine automatische Verbuchung aus Chatnachrichten.</p></div>' +
      '<div class="summary-cards">' + cards + '</div>' +
      '<div class="notes">Die bereits wirtschaftlich bewerteten Silberobjekte (10.000 GM) und kleineren Wertstücke (920 GM) sind <b>im Bruttosaldo enthalten</b>. Kein zweites Mal addieren.</div>' +
      '<div class="section-label">Bekannte Werte / Verwahrung</div>' +
      assets.map(function (item) {
        return '<details class="project"><summary>' + esc(item.name) + '</summary>' +
          '<div class="inside"><div class="kv"><span>Bekannter Wert</span><strong>' +
          (typeof item.value === "number" ? number(item.value) + " GM" : "Nicht beziffert") + '</strong></div>' +
          '<p class="tip">' + esc(item.state || "") + '</p>' +
          (item.note ? '<p class="tip">' + esc(item.note) + '</p>' : "") + '</div></details>';
      }).join("") +
      '<div class="section-label">Offene / geplante Ausgaben · ' + pending.length + '</div>' +
      projectList(pending) +
      '<div class="section-label">Buchungsregeln</div>' +
      (d.horn.notes || []).filter(function (note) { return /GM|wert|material|kasse|finanz|valet|abrechn/i.test(note); })
        .map(function (note) { return '<div class="notes">' + esc(note) + '</div>'; }).join("") +
      '<div class="bottom-links">' + link(urlFor("inventar"), "Inventar & Kasse im Wiki") + '</div>';
  }

  function render(keepScroll) {
    renderTabs();
    const d = state.data;
    if (state.error) setStatus("Datenabruf fehlgeschlagen · " + state.error, "bad");
    else if (d) setStatus("Kampagnenstand " + dateLabel(d.live.scene.date) + " · Wiki geprüft " + d.live.meta.reviewedAt, "ok");
    else setStatus("Keine Daten geladen", "bad");

    $("#footer-date").textContent = d ? "Spielstand " + dateLabel(d.live.scene.date) : "Kein Chat-Tracking";
    if (!d) {
      scroll.innerHTML = '<div class="empty">GitHub-Snapshot derzeit nicht erreichbar. Mit ↻ erneut versuchen.</div>';
      return;
    }
    const currentScroll = keepScroll ? scroll.scrollTop : 0;
    let output = state.tab === "notes" ? notesPage() : state.tab === "treasury" ? treasuryPage() : characterPage(state.tab);
    if (state.warning) output = '<div class="warn">Achtung: ' + esc(state.warning) + '</div>' + output;
    if (state.error) output = '<div class="warn">Offline-Kopie: ' + esc(state.error) + '. Der letzte gespeicherte Stand kann veraltet sein.</div>' + output;
    scroll.innerHTML = output;
    scroll.scrollTop = currentScroll;
  }

  $("#tabs").addEventListener("click", function (event) {
    const button = event.target.closest("button[data-tab]");
    if (!button) return;
    const id = button.getAttribute("data-tab");
    if (!TAB_IDS.includes(id)) return;
    state.tab = id;
    store("tab", id);
    render(false);
  });
  $("#refresh").addEventListener("click", function () { refresh(true); });
  $("#close").addEventListener("click", function () { setVisible(false); });
  $("#collapse").addEventListener("click", function () { setVisible(false); });
  $("#launcher").addEventListener("click", function () { setVisible(true); if (!state.data) refresh(true); });
  scroll.addEventListener("toggle", function (event) {
    const details = event.target;
    if (details instanceof HTMLDetailsElement && details.dataset.section) {
      if (details.open) state.openSections.add(details.dataset.section);
      else state.openSections.delete(details.dataset.section);
    }
  }, true);
  scroll.addEventListener("click", function (event) {
    const filter = event.target.closest("button[data-filter]");
    if (!filter) return;
    state.questFilter = filter.getAttribute("data-filter");
    render(true);
  });
  scroll.addEventListener("input", function (event) {
    if (event.target.id === "scratch") {
      state.scratch = event.target.value;
      store("scratch", state.scratch);
    }
    if (event.target.id === "quest-search") {
      state.query = event.target.value;
      const list = $("#quest-list");
      if (list) list.innerHTML = questList();
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.altKey && event.shiftKey && event.code === "KeyW") {
      setVisible(state.collapsed);
      event.preventDefault();
    }
  });
  window.addEventListener("focus", function () {
    if (document.visibilityState !== "hidden" && !state.collapsed) refresh(false);
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && !state.collapsed) refresh(false);
  });
  window.addEventListener("resize", function () {
    const rect = panel.getBoundingClientRect();
    if (rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
      panel.style.left = clamp(rect.left,4,Math.max(4,window.innerWidth-rect.width-4))+"px";
      panel.style.top = clamp(rect.top,4,Math.max(4,window.innerHeight-rect.height-4))+"px";
    }
  });

  render(false);
  refresh(true);
})();