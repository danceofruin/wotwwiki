# Der Nessische Knoten

## HUD 2 · direkt in ChatGPT

- Installation: das bisherige Violentmonkey-HUD deaktivieren, damit nicht zwei Overlays gleichzeitig laufen.
- Neuen [WotW HUD 2 Userscript-Installer](https://danceofruin.github.io/wotwwiki/userscripts/wotw-hud.user.js) öffnen und in Violentmonkey bestätigen. Alternativ [Quelltext als .txt](https://danceofruin.github.io/wotwwiki/userscripts/wotw-hud.txt) speichern und als neues Skript einfügen.
- Der feste Button **↓ Export** oben neben **↻ Daten** lädt auf Wunsch die **gesamte aktive Chat-Unterhaltung** als Markdown-Datei für `@WotW Session Capture` herunter. Er lädt **alle** Seiten der aktuellen ChatGPT-Verlaufs-API in Reihenfolge, unterstützt den älteren `current_node`/`mapping`-Baum mit Branch-Auswahl, bewahrt User-/Assistant-Nachrichten und nennt angehängte Dateien. Bilder/Audio werden als Platzhalter markiert, nicht als Binärdateien gespeichert. Sind ältere Seiten nicht abrufbar oder die Kette widersprüchlich, bricht er **ohne Teil-Export** ab.
- Der Export greift **ausschließlich beim Klick** über dieselbe ChatGPT-Domain auf `/api/auth/session` und ChatGPTs eigene Conversation-API zu. Sitzungs-Token und vollständige Chats gehen **nicht** zu GitHub oder externen Diensten und werden nicht im HUD gespeichert. Die API ist intern und kann sich ändern; der Export-Dialog meldet Fehler statt einen unvollständigen Erfolg vorzutäuschen.
- ChatGPT neu laden. Das HUD erscheint mit fünf Seiten: **Styke**, **Vesper**, **Valeria**, **Notes** und **Treasury**. Oben stehen aktuelle Kampfwerte und Saves; darunter die aus `data/hud.json` geladenen Regelreferenzen. Es gibt keinen manuellen HP/PP/Slot-Tracker und keinen DOM-Observer.
- **Quellen:** `data/sheets.json` (aktive Kampfprofile), `data/live.json` (HP im geprüften Snapshot, Quests, Termine), `data/hud.json` (Manöver, Spells, Glyphen und Kurzwerte) und `data/horn.json` (Kasse, Inventar, Handwerksprojekte). Das Skript prüft die zusammengehörigen Snapshot-Revisionen.
- Beim Öffnen und bei Rückkehr in den Tab nach fünf Minuten fragt es statische GitHub-Pages-Dateien ab; die Schaltfläche **↻** aktualisiert sofort. Es pollt keine ChatGPT-Antworten und schreibt keine Kampagnenwerte zurück. Persönliche Kurznotizen bleiben ausschließlich im lokalen Userscript-Speicher.
- **Wichtig:** Der private Kampagnen-Kanon wird nicht automatisch aus dem Browser exportiert. Die hier angezeigten Daten aktualisieren sich, sobald die **spielerbereinigten Wiki-Snapshots** aus dem privaten Repository nachgeführt und veröffentlicht sind. Das Datum des überprüften Spielstandes steht sichtbar im HUD; ungeprüfte laufende Kampfressourcen werden nicht geraten.


Spielerbezogenes Kampagnenwiki für *Way of the Wicked*.

- Live: https://danceofruin.github.io/wotwwiki/
- Live-Play-Stand: siehe `data/live.json` (26. April 4712 AR, später Nachmittag; Farholder Versteck am Calliver Green)
- Artikelarchiv: zuletzt einzeln redaktionell bis 30. März 4712 AR geprüft; ältere Artikel und Archivchronik sind historisch datiert, nicht der Live-Spielstand
- Technischer Stand: 22. Oktober 2026
- Version 4.5.0

## 4.5.0 · 26. April 4712 AR

- Spieleransichten von Live Play, Charakterbögen, Horn-Tracker und Inventar sind anhand des bestätigten 26-April-LIVE_STATE und der aktiven Stufe-7-Kampfbögen synchronisiert.
- Styke: DEX +4, CHA +2, Cloak +3, 18 PP, neue Angriffs- und Rettungswerte. Vesper: CHA +4, Cloak +3, 8/8/5 Zauberslots, IL 9, sechs aktuelle Arcane-Enlightenment-Optionen. Valeria: Cloak +3, Shadow-Platte, seit 31. März zurückgegebenes +1-Cruel-Großschwert.
- Ritual 164/666, drei Augen installiert, zwei Fallgitter und Befehlssteine, Grumblejack-Platte 1.424/3.150, Kasse 7.710/4.600/3.110 GM. Bereits eingerechnete Silber- und Wertstücke nicht erneut als verfügbares Vermögen zählen.
- Sichtbare Questlage folgt dem unterschriebenen Schreiben aus Farholde; keine geheimen Aufenthaltsorte oder GM-Prozesse publiziert.
- Das umfangreiche eingebettete Artikel- und Chronikarchiv bleibt ausdrücklich beim früheren überprüften 30-März-Stand, bis ein separater redaktioneller Artikelabgleich erfolgt. Der aktuelle Spielstand ist über Live Play und die genannten aktuellen Ansichten erreichbar.

## Live Play

- `#/live`: Party-Ressourcen, spielerbekannte Fäden, Termine und Missionsbestand.
- `#/sheet/styke`, `#/sheet/vesper`, `#/sheet/valeria`: vollständige mechanische Bögen mit Tabs, Ausrüstungsprofil und aktuellen Ressourcen. Die bisherigen Dossiers bleiben separat zugänglich.
- `#/quests`: Filter für aktive, wartende, terminierte und abgeschlossene Fäden, Suche und NPC-Links.
- Unbestätigte verbleibende Zauberplätze erscheinen als `?`, niemals automatisch als voll. Essence ist ein Investitionspool. Rundentaktische Zustände werden nicht gespeichert.
- Automatischer Abruf des veröffentlichten Snapshots alle 60 Sekunden, solange Live Play geöffnet ist; zusätzlich manueller Reload. Kein automatischer Zugriff auf private Kampagnenakten oder laufende Chats.

Das private Kampagnenrepository enthält den Exporter `tools/export_wiki.py` und den Wartungsablauf `tools/WIKI_SYNC.md`. Er liest nur ausdrücklich ausgewählte Mechanikabschnitte und einen gegen exakte Quelldateien geprüften Spielerexport. Veränderte Quellen machen die Prüfung ungültig und stoppen den Export. Die beiden JSON-Dateien sind generierte Ansichten, **niemals Kanon**. Die semantische Spoilerprüfung erfolgt vor dem Export; ein Schema allein kann sie nicht ersetzen.

Die Ressourcensynchronisation aktualisiert die kleinen Live-Datenobjekte. Dossiers und Chronik werden zusätzlich redaktionell gegen den akzeptierten Kampagnenstand geprüft. GitHub Pages kann den statischen Auftritt bei einem Datencommit erneut deployen; das ist keine vollständige inhaltliche Wiki-Neugenerierung.

## Benutzung

Die veröffentlichte Fassung läuft über GitHub Pages. Ein Push auf `main` löst ein neues Deployment aus. Das Artikelarchiv kann lokal direkt geöffnet werden. Live Play lädt JSON-Dateien und benötigt einen Webserver, zum Beispiel `python3 -m http.server 8000` im Wiki-Verzeichnis.

Die Navigation trennt Kampagne, Kernfiguren, weitere Dossiers, Weltwissen, Nachschlagewerk und das persönliche Browserarchiv. `/` oder `Strg+K` setzt den Fokus in die Suche. Umlaute, Aliase und ältere belegte Namen werden berücksichtigt.

## Dossiers und Altersfreigabe

Biografie, Beziehungen, Erscheinung, Sexualität und vorhandene Spielwerte einer Figur werden in einer gemeinsamen Akte dargestellt. Die früheren Einzelartikel bleiben im eingebetteten Quelldatensatz erhalten, erscheinen aber nicht mehr als doppelte Navigationseinträge oder Suchtreffer.

Beim ersten Besuch wird das vollständige Wiki einmalig für Volljährige freigegeben. Die Bestätigung wird nur im lokalen Browser gespeichert. Sie ist kein Passwortschutz und keine Verschlüsselung; der ausgelieferte HTML-Datensatz enthält sämtliche Artikel im Klartext.

## Technische Struktur

- `index.html`: Dokumentstruktur und vollständiger, spoilerfreier Wiki-Datensatz
- `app.js`: eine Anwendungs-, Navigations- und Routerlogik
- `live.js`: Live-Play-Ansichten, sichere Markdown-Darstellung, Datenabruf und Interaktion
- `data/live.json`, `data/sheets.json`: geprüfte generierte Spieleransichten mit Quellenfingerabdruck
- `scripts/validate-live.mjs`, `scripts/test-live.mjs`: striktes Datenschema, Ressourcen- und Exportgrenzen
- `styles.css`: gesamtes Layout einschließlich Dossiers und Altersfreigabe
- `assets/`: lokale Illustrationen
- `template.html`: kleine Weiterleitung für alte gespeicherte Links
- `verify.mjs`: Integritätsprüfung für Daten, Links, Skripte und Bilddateien

Es gibt keine nachträglich injizierten Hotfix-Skripte, keine Base64-Bildteile und keinen Laufzeitabruf einer zweiten HTML-Datei.

## Bilder

Illustrationen werden als normale PNG- oder WebP-Dateien eingecheckt. Unvollständige Dateien werden von der Integritätsprüfung abgewiesen. Die Charaktergalerien verwenden nach Möglichkeit ein normales und ein privates Motiv. Neue Bilder werden aus den Originaldateien in hoher Qualität erzeugt und erst nach Prüfung von Abmessungen, Dateivollständigkeit und sichtbarer Qualität eingebunden. Das aktuelle Motiv des roten Buches liegt als 1448 × 1086 WebP in unveränderter Auflösung vor.

## Notizen

Lesezeichen und eigene Notizen werden nur im lokalen Browserspeicher abgelegt. Sie gelangen nicht zu GitHub und können durch Browserbereinigung, Gerätewechsel oder einen anderen Speicherort verloren gehen. Für eine Sicherung steht der JSON-Export im Wiki bereit.

## Datenpflege

Das Wiki lädt keine Inhalte aus dem privaten Kampagnenrepository. Neue Kampagnenereignisse müssen zuerst gegen den gültigen Live-State und die betroffenen Akten geprüft und anschließend in die öffentliche, spielerbekannte Fassung übernommen werden.

Vor einem Push lokal ausführen:

```bash
node verify.mjs
node scripts/test-live.mjs
```

Die gleiche Prüfung läuft bei Pushes und Pull Requests automatisch über GitHub Actions.

## Rechte

*Way of the Wicked*: Gary McBride / Fire Mountain Games. Pathfinder und die genannten Zusatzsysteme bleiben den jeweiligen Rechteinhabern zugeordnet. Dieses Repository ist eine private Kampagnenhilfe, keine offizielle Publikation und kein Ersatz für die Originalregelbücher.


## Stand 3.5.0 · 24. September 2026

- beide Spieltagsexporte gegen den neuen Handoff geprüft
- Balentyne als gefallen und Buch Eins als abgeschlossen markiert
- Styke, Vesper und Valeria auf die aktiven Stufe-6-Bögen gehoben
- Tacitus als gebundene Magierin und Gelehrte eingetragen; Jacobian als freigelassen
- Dalliance, Grumblejack, sechs Pferde, Zwergencrew und aktuelle Hausrollen nachgezogen
- Spielerwissen-Firewall erhalten: der noch nicht ausgespielte Fensterblick enthält keine vorweggenommenen Straßendetails

## Stand 3.6.0 · 26. September 2026

- Tiadoras Ankunft, Erfolgszahlung und die gemeinsame Abreise aus Aldencross ergänzt
- Halstyn’s Folly als neuer Reiseort samt Passagieren, sechs Pferden und Schlaf-/Arbeitsbereichen angelegt
- erste und zweite Requisitionsnacht als spielerbekannte Chronik aufgenommen
- Tacitus’ Familiar-Projekt bis zum laufenden dritten vollen Arbeitstag nachgezogen
- Knotenkasse auf 17.271 gp aktualisiert; gewöhnliche Requisitionserlöse als separater Betriebsfonds geführt
- Tamsins Sicherheitsbereich, Kaitlyns Menschen-Lane, Mirelles Rüstungsarbeit und Hakons offene Zukunft aktualisiert
- Nellas Logistikrolle und ihr Gespräch am 12. Februar ergänzt; vorhandene Nella-Bilder unverändert gelassen

## 4.0.0 · Farholde und Buch Zwei

- Handoff bis 21. Februar vollständig übernommen; Session-Capture war vor dem Sync leer/abgeschlossen
- Horn-Auftrag, Farholde, Kaels Karte, Vandermir, Rubal Thraam, Knittel und aktueller Crafting-/Kassenstand ergänzt
- Reise, Requisitionsphase und Familiar-Projekt als abgeschlossen markiert
- Live-Dashboard, Chronik, Beziehungen, Dossiers und Quellenregister nachgezogen
- alle bestehenden Bilddateien und Bildzuweisungen unverändert gelassen, einschließlich Nella

## 4.1.0 · Siebter Knoten und Hornvorstoß

- abgeschlossenen Handoff bis 24. Februar geprüft; Session-Capture war leer
- Ankunft der White Ravens, Graue Möwe und Kaitlyns Verbindungslane ergänzt
- externe +1-Aufwertungen, beide Gürtel und aktuelle Tacitus-Fertigung nachgezogen
- Caer-Bryr-Route, Jurak und die aktuelle untere Höhlenlage spielersicher eingetragen
- Live-Dashboard, Bögen, Chronik, Dossiers und Quellenregister aktualisiert
- sämtliche bestehenden Bilder und Bildzuweisungen unverändert gelassen

## 4.2.0 · Horn-Ebenen Zwei und Drei

- vollständigen Handoff mit 102 dispositionierten Capture-Punkten geprüft; Session-Capture ist leer
- Horn-Ebenen Zwei/Drei, Ezra, gebundene Wächter, Sanctum und Nachtlager spielersicher eingetragen
- Level-7-Bögen, HUD, Ressourcenrand und neue Fähigkeiten aktiviert
- Knotenkasse, zwölf Heiltränke, vier tragbare Magiefunde und ungezählten Tresorbestand getrennt geführt
- unbekannte Farholde-Ergebnisse und nur vermutete Rotbuch-Veränderungen bewusst ausgespart
- sämtliche bestehenden Bilder und Bildzuweisungen unverändert gelassen


## 4.4.0 · Vor dem ersten Hornumzug

- abgeschlossenen Handoff bis 27. Februar vor Morgengrauen gegen alle 96 Capture-Punkte geprüft
- Einweihungen, Treffpunkt, Mirelles Anprobe, Stykes +2-Umhang und Tacitus’ neue Bindungen/Forschungsfragen spielersicher nachgezogen
- noch nicht übermittelte Offscreen-Ergebnisse von Beschaffung, Vandermir-Anfrage, Rekrutierung und Wächtererholung bewusst ausgespart
- Live-Daten, Charakterbögen, HUD, Chronik, Beziehungen und Quellenregister aktualisiert
- sämtliche bestehenden Bilddateien und Bildzuordnungen unverändert gelassen



## Privates Würfelprotokoll

Unter [Würfelprotokoll](https://danceofruin.github.io/wotwwiki/#/wuerfel) wird das
Protokoll direkt vom WotW-Worker gelesen. Den bestehenden MCP_KEY nur in das
Passwortfeld im Browser eingeben; Schlüssel und Würfeldaten werden nicht im
öffentlichen Wiki gespeichert. Der Schlüssel bleibt im Arbeitsspeicher des
geöffneten Tabs und verschwindet nach Neuladen oder **Trennen**.

Sitzungen werden automatisch angeboten, zuletzt benutzte zuerst. Alternativ
eine Beleg-ID aus dem Chat einfügen, ohne die Sitzung kennen zu müssen. Die
Ansicht zeigt die Einzelwürfel, Modifikatoren und Summen sowie auf Wunsch den
vollständigen Originalbeleg. Voraussetzung: Worker-Version 0.2.3 oder neuer. Bei getrennten
Deployments können Wiki und Worker kurzzeitig unterschiedlich aktuell sein.

Belege erscheinen neueste zuerst. Das private Prüfprotokoll zeigt alle Würfe einschließlich GM- und ungekennzeichneter Altbelege, auch im JSON-Export.

