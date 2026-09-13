# Der Nessische Knoten
## Das spielerbezogene Way-of-the-Wicked-Kampagnenwiki

**Kampagnenstand:** 1. Februar 4712 AR, früher Morgen in Aldencross.  
**Lesestand:** 10. September 2026.  
**Version:** 1.2, mit gesondertem Erwachsenenbereich und erzählerisch redigierten privaten Akten.
**Umfang:** 204 allgemeine Einträge plus 18 private Einträge; 67 allgemeine plus 10 private Beziehungsachsen. 18 allgemeine Chronikstationen plus eine private Chronikübersicht.
**Privater Nachtrag:** Körpermerkmale und intime Beziehungsgeschichte bis zum privaten Vormittag des 1. Februar 4712 AR. Kein vollständiger neuer Spielstands-Sync.

## Benutzen

`index.html` im Browser öffnen. Die Datei enthält Darstellung, Inhalte, Suchindex und Anwendungscode. Es sind kein Server, kein Benutzerkonto, kein Internetzugang und keine Installation erforderlich. JavaScript muss aktiviert sein. Ein eventuell eingeschränktes Datei-Vorschaufenster ist nicht dasselbe wie die vollständige Ansicht im Browser.

Die separat gelieferte Datei `WotW_Kampagnenwiki.html` ist dieselbe eigenständige Website unter einem beschreibenden Namen.

Navigation links beziehungsweise im mobilen Menü. `/` oder Strg+K fokussiert die globale Suche. Umlaute und normale Schreibweise werden tolerant durchsucht; alte belegte Namen sind als Aliase hinterlegt. Kategorien lassen sich filtern. Im Fähigkeitenregister kann zusätzlich nach Figur und Fähigkeitstyp gefiltert werden.

Die Beziehungskarte ist interaktiv: Eine Figur auswählen, ihre Verbindungen lesen und direkt zu ihrer Akte wechseln. Unter der Karte kann die Textliste auf alle aktuell freigegebenen Verbindungen (67 ohne, 77 mit Ab-18-Freigabe) umgestellt werden. Gestrichelte Linien stehen für Pläne beziehungsweise Hypothesen, nicht für bereits eingetretene Ergebnisse. Es gibt keine erfundenen Sympathie- oder Loyalitätspunkte.

Artikel besitzen Sprungnavigation, Quellennachweise, Verbindungen und Rückverweise. Charakterbögen enthalten die vollständigen verfügbaren Daten. Die Zusatzkarten übernehmen ausgeschriebene Regeln, wo sie im verwendeten Kampagnenmaterial stehen; fehlende Original-Zaubertexte sind deutlich gekennzeichnet.

## Erwachsenenbereich: Zugang und Inhalte

Über **Ab 18** in der Navigation oder die **18+**-Schaltfläche oben wird die Altersbestätigung geöffnet. Eine Checkbox und ein anschließender Bestätigungsklick sind erforderlich. Die Freigabe wird nur in der Tab-Sitzung gespeichert, nicht als dauerhafte Voreinstellung. Bei verweigertem Sitzungsspeicher gilt sie nur bis zum erneuten Laden. **Wieder sperren** oder die obere 18-Schaltfläche hebt die Freigabe auf.

Vor der Freigabe und nach dem Sperren werden private Artikel, Suchtreffer, Vorschauen, Quellenzusätze, Chronikzusätze und Beziehungsdetails nicht angezeigt. Direkte Artikel- und Kategorielinks führen zuerst zur Altersabfrage. Nach Bestätigung wird der angefragte Eintrag geöffnet.

Die private Übersicht bietet Filter nach Figur, Eintragstyp, Suchbegriff und Belegart. Enthalten sind Vorlieben- und Erfahrungsakten, die drei inneren Beziehungsachsen, wichtige Nebenfiguren, intime Chronik, Requisiten, ein noch nicht ausgeführtes privates Vorhaben und vier Körperakten.

**Körper & Anatomie:** Vespers belegte Anatomie ist aus ihrem Dossier und der NPC-Kernakte zusammengeführt. Valeria und Styke haben eigene Körperakten; weitere relevante Figuren ein gemeinsames Belegregister. Fehlende Angaben zu Größe, Form, Pigmentierung oder Maßen sind als offen benannt, nicht erfunden. Körpermerkmale, unwillkürliche Reaktionen, Vorlieben und vorübergehende Zustände bleiben getrennt.

Beim Vesper/Valeria-Eintrag ist das ausdrückliche Trinken als Spielerpräzisierung in dieser Unterhaltung markiert. Die geprüften Git-Zusammenfassungen dokumentieren die Situation und die positive Reaktion, verwenden jedoch nicht ausdrücklich diese genauere Angabe. Das ist keine behauptete nachträgliche Git-Änderung.

### Private Notizen

Notizen an privaten Artikeln sowie das separate private Notizbuch werden beim Sperren ausgeblendet, nicht gelöscht. Lesezeichen bleiben ebenfalls gespeichert. Ein Export im gesperrten Zustand enthält nur freigegebene allgemeine Notizen und Lesezeichen. Für eine vollständige Sicherung zuerst den Erwachsenenbereich freigeben und dann **Alle Notizen einschließlich Ab 18 exportieren** verwenden. Der Import ist weiter über die normale Notizenseite möglich; private importierte Inhalte bleiben bis zur Freigabe unsichtbar.

### Technische Grenze

**Die Altersabfrage ist eine lokale Selbstauskunft und Anzeige-Sperre. Sie ist keine verifizierte Altersprüfung, kein Passwortschutz und keine Verschlüsselung.** HTML, JSON und lokale Notizspeicher enthalten Klartext. Die ZIP-Datei enthält ebenfalls die privaten Inhalte. Wer die Datei erhält oder den Quelltext untersucht, kann die Anzeige-Sperre umgehen. Dieses Paket ist nicht als abgesicherter öffentlicher Dienst konzipiert.

### Pflege privater Einträge

Private Artikel tragen `adult: true` und die Kategorie `intimitaet`. Private Beziehungsachsen, Quellenzusätze und Chronikzusätze müssen ebenfalls ausdrücklich `adult: true` tragen. Die Renderer arbeiten mit einer gefilterten Ansicht des Datenbestands. Allgemeine Artikel dürfen nur neutrale Links auf den Erwachsenenbereich erhalten; private Vorschautexte gehören nicht in allgemeine Zusammenfassungen.

`rebuild.py` prüft diese Zuordnungen zusätzlich zu Links und Quellenkennungen. Es kann weder den Inhalt automatisch altersklassifizieren noch neuen Text auf Spoiler prüfen. Die redaktionelle Kontrolle bleibt erforderlich.

## Eigene Notizen und Lesezeichen

Stern im Artikel anklicken, um ein Lesezeichen anzulegen. Jeder Artikel besitzt ein eigenes Notizfeld; unter "Eigene Notizen" liegt zusätzlich ein freies Kampagnenbuch. Diese Angaben sind persönliche Notizen, kein angenommener Kanon.

Speicherung ausschließlich im lokalen Browserspeicher. Es gibt keine Übermittlung an GitHub oder einen anderen Server. Der Speicher kann vom Browser, Dateinamen und Speicherort abhängen. Browserbereinigung, ein Gerätewechsel oder das Umbenennen beziehungsweise Verschieben der Datei können den bisherigen Speicher unzugänglich machen. Deshalb vorher unter "Eigene Notizen" eine JSON-Sicherung exportieren. Der Import führt Einträge zusammen und bewahrt unterschiedliche Texte.

Falls der Browser lokalen Speicher verweigert, bleibt das Wiki lesbar und weist beim Notieren auf die Einschränkung hin. In diesem Fall vor dem Schließen exportieren. Die Notizen sind keine verschlüsselte Dateiablage und sollten auf gemeinsam benutzten Geräten entsprechend behandelt werden.

## Dateien im Paket

- `index.html`: sofort benutzbare eigenständige Website.
- `wiki-data.json`: ausschließlich der kuratierte, spielerbezogene Datenbestand dieser Ausgabe.
- `template.html`: Layout und Anwendungscode mit einem Daten-Platzhalter.
- `rebuild.py`: lokales Neuaufbauen nach bewusster Bearbeitung der kuratierten Daten.
- `README.md`: diese Hinweise.

Zum bloßen Lesen ist nur die HTML-Datei erforderlich.

## Datenpflege

Diese Website ist **kein Live-Spiegel des privaten Git-Repositories**. Sie lädt beim Öffnen keine Kampagnendateien und schreibt keine Änderungen zurück. Das Repository bleibt die dauerhafte Kampagnenquelle.

Für eine neue Ausgabe zuerst neue angenommene Ereignisse, aktuelle Live-State-Angaben und betroffene dauerhafte Akten abgleichen. Danach nur spielerbekannte Inhalte in `wiki-data.json` aktualisieren. Datumsangaben, Quellenkennungen und Offen-/Plan-Status entsprechend pflegen. Das ungefilterte Importieren von GM-Dateien ist ungeeignet: Dort stehen auch verborgene Zustände.

Optional mit Python 3.9 oder neuer im Paketordner ausführen:

```text
python rebuild.py
```

Das Skript benötigt keine Zusatzbibliotheken. Es aktualisiert Suchfelder und Rückverweise, prüft Artikel- und Beziehungslinks und schreibt `index.html`. Es ermittelt **keine** neuen Git-Daten, adjudiziert **keine** Kampagnenhandlung und kann die Spielerbekanntheit neuer Texte nicht selbst prüfen. Die Spoilerprüfung bleibt eine redaktionelle Aufgabe.

## Quellen und Grenzen

Grundlage sind die abgerufenen Akten von `danceofruin/wotwGPT`, die verfügbaren Charakterunterlagen und das öffentliche Talingarde-Spielerwissen. Pro Artikel sind die benutzten Quellen angegeben. Blob-Kennungen im Quellenregister identifizieren einzelne abgerufene Dateien; sie sind keine globale Commit-ID.

Der neueste Live-State hat bei der Gegenwart Vorrang vor veralteten Zeitstempeln in Ortsakten und Chronik-Zusammenfassungen. Unterschiedliche Schreibweisen oder nicht geklärte mechanische Angaben werden nicht eigenmächtig neu erfunden. Bekannte Abweichungen stehen unter "Redaktion, Quellen und offene Unterschiede".

Die psychologischen Profile sind quellengestützte Spielinterpretationen, keine klinischen Diagnosen. Gegenwärtige Beziehungen, alte Gewaltgeschichte und spätere eigene Entscheidungen bleiben unterscheidbar. Geplante Builds stehen getrennt als bereits besprochenes OOC-Wissen und verleihen keine aktiven Fähigkeiten.

Nicht enthalten sind verborgene GM-Rohakten, nicht entdeckte Gegnerwerte, geheime NPC-Absichten und zukünftige Abenteuerereignisse. Das gilt auch für den Suchindex und den bearbeitbaren Datenbestand. Davon zu unterscheiden sind die zugeordneten Ab-18-Inhalte: Diese sind im HTML und im JSON enthalten und werden nur in der Oberfläche gesperrt.

Way of the Wicked: Gary McBride / Fire Mountain Games. Pathfinder und die genannten Zusatzsysteme bleiben den jeweiligen Rechteinhabern zugeordnet. Private, redaktionelle Kampagnenhilfe; keine offizielle Publikation und kein Ersatz für die Original-Regelbücher.


## Version 1.2

- Allgemeiner Spielstand auf den späteren 1. Februar 4712 AR synchronisiert.
- Kaitlyn auf das kanonische veröffentlichte Erscheinungsbild mit rotem Haar und grünen Augen korrigiert.
- Kaitlyns vollständige Fantasie aus der wiederhergestellten 31.-Januar-Sitzung übernommen; ihre nachfolgende Entwicklung hat mit **„Die offene Tür“** eine eigene private Charakterakte erhalten.
- Körperkontinuität für Valeria und Tamsin ergänzt; eigene Körperakten für Kaitlyn, Tamsin und Tacitus angelegt.
- Die privaten Texte wurden von auditartiger Dokumentation zu einem erwachsenen Dark-Fantasy-Codex umgeschrieben. Quellenstatus und Wissensgrenzen bleiben erhalten, stehen aber nicht mehr wie eine Betriebsanleitung im Vordergrund.


## Artwork-Update

Diese Fassung bindet lokale Illustrationen für Styke, Vesper, Valeria, Kaitlyn, Tacitus und den gemeinsamen Kriegsrat ein.
