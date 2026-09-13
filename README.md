# Der Nessische Knoten

Spielerbezogenes Kampagnenwiki für *Way of the Wicked*.

- Live: https://danceofruin.github.io/wotwwiki/
- Kampagnenstand: 1. Februar 4712 AR, später am Tag
- Quellenstand: 10. September 2026
- Redaktionsstand: 13. September 2026
- Version: 1.4

## Benutzung

Die veröffentlichte Fassung läuft über GitHub Pages. Ein Push auf `main` löst ein neues Deployment aus. Lokal genügt es ebenfalls, `index.html` mit aktiviertem JavaScript im Browser zu öffnen; Server, Konto und Installation sind nicht erforderlich.

Die linke Navigation erschließt 227 Artikel, Suche, Kategorien, Chronik, Beziehungsachsen, Charakterbögen und eigene Browsernotizen. `/` oder `Strg+K` setzt den Fokus in die Suche. Umlaute, Aliase und ältere belegte Namen werden berücksichtigt.

## Private Akten (18+)

Die 22 privaten Einträge werden erst nach einer Altersbestätigung in Navigation, Suche, Chronik und Beziehungskarte eingeblendet. Die Sperre ist eine Anzeigeeinstellung der laufenden Browsersitzung. Sie ist kein Passwortschutz und keine Verschlüsselung; die ausgelieferten HTML-Daten enthalten diese Artikel im Klartext.

Die privaten Akten behandeln Körpermerkmale, Begehren, Scham, Macht, intime Beziehungsgeschichte und einige Requisiten. Die Fassung 1.4 ersetzt die frühere abstrakte Absicherungs- und Metasprache durch konkrete Szenen, Handlungen, Erinnerungen und Wissensstände. Negative Aussagen bleiben dort erhalten, wo sie einen tatsächlichen Zustand festhalten, etwa bei ungesandten Nachrichten, unmontierter Ausrüstung oder unbekannten Aufenthaltsorten.

## Artwork

Lokale Illustrationen zeigen Styke, Vesper, Valeria, Kaitlyn, Tacitus, Thorn, Tiadora, Grumblejack, Sakkarot, Balentyne und den gemeinsamen Kriegsrat. Vesper, Valeria und Tiadora erhielten in Version 1.4 getrennte Physiognomien und Kompositionen:

- Vesper liest seitlich am Fenster in ihrem roten Buch.
- Valeria legt im verschneiten Hof ihre Beinschiene an.
- Tiadora steigt in schwarzer Trauerkleidung eine Treppe hinab und blickt über die Schulter zurück.

Die Bilder sind atmosphärische Charaktervisualisierungen und keine maßstabgetreuen Karten oder neuen Kampagnenereignisse.

## Notizen

Lesezeichen und eigene Notizen werden nur im lokalen Browserspeicher abgelegt. Sie gelangen nicht zu GitHub und können durch Browserbereinigung, Gerätewechsel oder einen anderen Speicherort verloren gehen. Für eine Sicherung steht der JSON-Export im Wiki bereit.

## Datenpflege

`index.html` und `template.html` enthalten derzeit denselben vollständigen Datenstand und Anwendungscode. Das Wiki lädt beim Öffnen keine Inhalte aus dem privaten Kampagnenrepository. Neue Kampagnenereignisse müssen zuerst gegen den gültigen Live-State und die betroffenen Akten geprüft und anschließend in die öffentliche, spielerbekannte Fassung übernommen werden.

Vor einem Push mindestens prüfen:

1. Eingebettetes `wiki-data`-JSON lässt sich parsen.
2. Artikelkennungen sind eindeutig und alle internen Links vorhanden.
3. `index.html` und `template.html` sind identisch.
4. Alle referenzierten lokalen Bilder existieren.
5. Inline-JavaScript lässt sich syntaktisch kompilieren.

## Rechte

*Way of the Wicked*: Gary McBride / Fire Mountain Games. Pathfinder und die genannten Zusatzsysteme bleiben den jeweiligen Rechteinhabern zugeordnet. Dieses Repository ist eine private Kampagnenhilfe, keine offizielle Publikation und kein Ersatz für die Originalregelbücher.
