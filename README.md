# Der Nessische Knoten

Spielerbezogenes Kampagnenwiki für *Way of the Wicked*.

- Live: https://danceofruin.github.io/wotwwiki/
- Kampagnenstand: 2. Februar 4712 AR, späte Nacht
- Quellenstand: 14. September 2026
- Technischer Stand: 14. September 2026
- Version: 2.1.0

## Benutzung

Die veröffentlichte Fassung läuft über GitHub Pages. Ein Push auf `main` löst ein neues Deployment aus. Lokal kann `index.html` direkt im Browser geöffnet werden; ein Server und eine Installation sind nicht erforderlich.

Die Navigation trennt Kampagne, Kernfiguren, weitere Dossiers, Weltwissen, Nachschlagewerk und das persönliche Browserarchiv. `/` oder `Strg+K` setzt den Fokus in die Suche. Umlaute, Aliase und ältere belegte Namen werden berücksichtigt.

## Dossiers und Altersfreigabe

Biografie, Beziehungen, Erscheinung, Sexualität und vorhandene Spielwerte einer Figur werden in einer gemeinsamen Akte dargestellt. Die früheren Einzelartikel bleiben im eingebetteten Quelldatensatz erhalten, erscheinen aber nicht mehr als doppelte Navigationseinträge oder Suchtreffer.

Beim ersten Besuch wird das vollständige Wiki einmalig für Volljährige freigegeben. Die Bestätigung wird nur im lokalen Browser gespeichert. Sie ist kein Passwortschutz und keine Verschlüsselung; der ausgelieferte HTML-Datensatz enthält sämtliche Artikel im Klartext.

## Technische Struktur

- `index.html`: Dokumentstruktur und vollständiger, spoilerfreier Wiki-Datensatz
- `app.js`: eine Anwendungs-, Navigations- und Routerlogik
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
```

Die gleiche Prüfung läuft bei Pushes und Pull Requests automatisch über GitHub Actions.

## Rechte

*Way of the Wicked*: Gary McBride / Fire Mountain Games. Pathfinder und die genannten Zusatzsysteme bleiben den jeweiligen Rechteinhabern zugeordnet. Dieses Repository ist eine private Kampagnenhilfe, keine offizielle Publikation und kein Ersatz für die Originalregelbücher.
