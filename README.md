# Der Nessische Knoten

Spielerbezogenes Kampagnenwiki für *Way of the Wicked*.

- Live: https://danceofruin.github.io/wotwwiki/
- Live-Play-Stand: siehe `data/live.json` (initial: 6. Februar 4712 AR, vor Morgengrauen)
- Artikelarchiv: Nacht 3./4. Februar 4712 AR; behält seinen eigenen älteren Stand
- Technischer Stand: 18. September 2026
- Version: 3.0.0

## Live Play

- `#/live`: Party-Ressourcen, spielerbekannte Fäden, Termine und Missionsbestand.
- `#/sheet/styke`, `#/sheet/vesper`, `#/sheet/valeria`: vollständige mechanische Bögen mit Tabs, Ausrüstungsprofil und aktuellen Ressourcen. Die bisherigen Dossiers bleiben separat zugänglich.
- `#/quests`: Filter für aktive, wartende, terminierte und abgeschlossene Fäden, Suche und NPC-Links.
- Unbestätigte verbleibende Zauberplätze erscheinen als `?`, niemals automatisch als voll. Essence ist ein Investitionspool. Rundentaktische Zustände werden nicht gespeichert.
- Automatischer Abruf des veröffentlichten Snapshots alle 60 Sekunden, solange Live Play geöffnet ist; zusätzlich manueller Reload. Kein automatischer Zugriff auf private Kampagnenakten oder laufende Chats.

Das private Kampagnenrepository enthält den Exporter `tools/export_wiki.py` und den Wartungsablauf `tools/WIKI_SYNC.md`. Er liest nur ausdrücklich ausgewählte Mechanikabschnitte und einen gegen exakte Quelldateien geprüften Spielerexport. Veränderte Quellen machen die Prüfung ungültig und stoppen den Export. Die beiden JSON-Dateien sind generierte Ansichten, **niemals Kanon**. Die semantische Spoilerprüfung erfolgt vor dem Export; ein Schema allein kann sie nicht ersetzen.

Die Ressourcensynchronisation ändert nur kleine Datenobjekte, nicht die Wiki-Artikel oder Oberfläche. GitHub Pages kann den statischen Auftritt bei einem Datencommit erneut deployen; das ist keine vollständige inhaltliche Wiki-Neugenerierung.

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

Illustrationen werden als normale PNG- oder WebP-Dateien eingecheckt. Unvollständige Dateien werden von der Integritätsprüfung abgewiesen. Die Charaktergalerien verwenden nach Möglichkeit ein normales und ein privates Motiv. Neue Bilder werden aus den Originaldateien in hoher Qualität erzeugt und erst nach Prüfung von Abmessungen, Dateivollständigkeit und sichtbarer Qualität eingebunden.

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
