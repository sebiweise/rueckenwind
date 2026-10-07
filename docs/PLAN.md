# Rückenwind – Umsetzungsplan

Stand: 08.10.2026 · Name: **Rückenwind** (vorläufig festgelegt), Untertitel „Rückenwind – Therapieplatz finden“, Repo `rueckenwind`. Markenrecherche (DPMA/EUIPO, Klassen 9 und 44) vor dem ersten Release abschließen; den Namen im Code daher zentral in einer Konstante (`APP_NAME`) halten.

## Überblick

Rückenwind ist eine Open-Source-PWA, die gesetzlich Versicherte in Deutschland auf dem Weg zu einem Psychotherapieplatz begleitet: verständlich informieren, nächste Schritte vorschlagen und alle Kontaktversuche nebenbei so dokumentieren, dass daraus ein Nachweis für das Kostenerstattungsverfahren entsteht.

**Problem:** Wer keinen Kassenplatz findet, muss viele Praxen anrufen, oft nur in kurzen Telefonsprechzeiten. Für die Kostenerstattung nach § 13 Abs. 3 SGB V verlangen Kassen eine Liste erfolgloser Anfragen (Datum, Praxis, Wartezeit), je nach Kasse ab etwa fünf, teils deutlich mehr. Das trifft Menschen in einer psychisch belastenden Lage und führt häufig zum Abbruch der Suche.

**Ziel:** Die Suche fühlt sich nicht wie Bürokratie an. Jeder Anruf, auch eine Absage, zählt sichtbar als Fortschritt, und am Ende liegt ein fertiges PDF für den Antrag vor.

**Zielgruppe:** Erwachsene gesetzlich Versicherte, die eine ambulante Psychotherapie suchen. Kinder/Jugendliche und Privatversicherte sind im MVP ausdrücklich nicht abgedeckt.

**Kontext:** Persönliches Open-Source-Projekt zur Erweiterung des öffentlichen GitHub-Profils.

## Entscheidungen und Leitprinzipien

Diese Punkte sind gesetzt und gelten für jede Implementierungsentscheidung.

1. **Wegbegleiter statt Formular.** Keine Pflichtfelder, keine mehrseitigen Eingabemasken. Pro Etappe wird genau eine nächste kleine Aufgabe angeboten.
2. **Erfassen in einer Zeile.** Ein Kontaktversuch wird als Freitext erfasst (z. B. „Praxis Weber, AB, Warteliste 8 Monate“) und automatisch strukturiert. Ergänzend gibt es Schnellbuttons für typische Ergebnisse.
3. **Dokumentation entsteht nebenbei.** Alles, was erfasst wird, fließt automatisch in Zeitstrahl und Nachweis-PDF.
4. **Absagen sind Fortschritt.** Die Oberfläche zeigt Absagen als gesammelte Nachweise („4 von ca. 5–10“), nicht als Misserfolg.
5. **Lokal-first, ohne Account, ohne Server.** Gesundheitsdaten verlassen das Gerät nie. Sicherung nur per Datei-Export/-Import.
6. **Ungezwungen, aber klar.** Warmer, kurzer Ton. Details nur auf Wunsch aufklappbar.
7. **Krisenhilfe immer sichtbar.** Ein Krisen-Button ist auf jedem Screen erreichbar.
8. **Inhalte sind Community-pflegbar.** Alle Infotexte liegen als Markdown im Repo, damit Fachleute und Betroffene per Pull Request korrigieren können.
9. **Keine Rechts- oder Medizinberatung.** Die App informiert und organisiert, sie diagnostiziert nichts und gibt keine Erfolgsgarantie für Anträge.
10. **MVP zuerst.** Etappen 1–3 als Inhalt, Schnellerfassung, PDF-Export. Alles andere ist Backlog.

## Fachlicher Hintergrund (Kurzfassung)

Die App bildet den Weg in fünf Etappen ab. Ausführliches Fachwissen, Begriffe und Quellen stehen in `WISSEN.md`. Alle Inhalte müssen vor dem ersten Release von einer fachkundigen Person gegengelesen werden.

1. **Orientierung:** Was ist Psychotherapie, welche Richtlinienverfahren zahlt die Kasse, was passiert in Sprechstunde und probatorischen Sitzungen.
2. **Psychotherapeutische Sprechstunde:** Vor einer Therapie verpflichtend. Direkt in einer Praxis oder über die Terminservicestelle (116 117 oder online). Ergebnis ist das Formular PTV 11.
3. **Platzsuche:** Kassenpraxen anrufen, Telefonzeiten nutzen, Wartelisten notieren. Parallel Terminservicestelle für Akutbehandlung oder zeitnahe probatorische Sitzungen.
4. **Plan B:** Akutbehandlung, Ausbildungsinstitute, Kostenerstattungsverfahren bei Privatpraxen.
5. **Antrag Kostenerstattung:** Absagenliste, Nachweis TSS-Kontakt, PTV 11 bzw. Dringlichkeitsbescheinigung, Behandlungsbereitschaft einer Privatpraxis. Antrag vor Therapiebeginn, bei Ablehnung Widerspruch möglich.

## Funktionsumfang MVP

Das MVP besteht aus sieben Funktionen; alles Weitere steht im Backlog.

1. **Startseite „Dein Weg“:** Zeitleiste der fünf Etappen. Die aktuelle Etappe ist hervorgehoben und zeigt genau eine vorgeschlagene nächste Aufgabe. Etappen sind frei anwählbar, nicht gesperrt.
2. **Infoseiten pro Etappe:** Kurztext (max. ca. 5 Sätze) plus aufklappbare Details. Gerendert aus Markdown-Dateien in `content/`.
3. **Schnellerfassung:** Ein Eingabefeld, das immer erreichbar ist (Floating Button). Freitext wird lokal per Regeln geparst:
   - Praxisname (Text vor dem ersten Komma oder nach „Praxis“, „Dr.“, „Frau“, „Herr“)
   - Ergebnis über Schlüsselwörter (AB/Anrufbeantworter, nicht erreicht, Absage, Warteliste, Rückruf, Termin)
   - Wartezeit (z. B. „8 Monate“, „6 Wo“, „ein Jahr“)
   - Datum = jetzt, nachträglich änderbar

   Nach dem Parsen erscheint eine kompakte Vorschau mit Chips, die per Tipp korrigiert werden können. Speichern mit einem Tipp.
4. **Schnellbuttons:** „Nicht erreicht“, „Absage“, „Warteliste“, „Rückruf versprochen“, „Termin bekommen“ als Alternative zum Freitext.
5. **Kontaktliste & Zeitstrahl:** Alle Praxen mit ihren Kontaktversuchen, chronologisch. Praxen können mit Telefonnummer und Telefonzeiten (Freitext) angelegt werden. Fortschrittsanzeige „X Absagen gesammelt“.
6. **Nachweis-PDF:** Ein Knopf erzeugt ein sauberes PDF: Name (optional, nur im Export abgefragt), Zeitraum, Tabelle aller Kontaktversuche (Datum, Uhrzeit, Praxis, Ergebnis, Wartezeit), Hinweis auf Kontakt zur Terminservicestelle, Platz für Unterschrift. Komplett clientseitig erzeugt.
7. **Daten-Export/-Import und Löschen:** JSON-Export und -Import als Datei; „Alle Daten löschen“ mit Bestätigung.

**Immer vorhanden:** Krisen-Button in der Kopfzeile, Hinweis „Keine Rechts- oder Medizinberatung“ im Footer, Impressum/Über-Seite.

## UX, Ton und Wohlbefinden

Die App spricht wie eine ruhige, kompetente Begleitung: duzend, kurz, ohne Paragrafen im Fließtext.

- **Sprache:** Du-Form, Sätze unter 20 Wörtern, keine Fachbegriffe ohne Erklärung. Beispiel: „Absage notiert. Das zählt für deinen Nachweis.“ statt „Datensatz gespeichert.“
- **Kein Druck:** Keine Streaks, keine roten Warnungen, keine Push-Benachrichtigungen im MVP. Erinnerungen nur, wenn später aktiv eingeschaltet.
- **Nach schweren Momenten:** Nach drei Absagen am selben Tag erscheint ein dezenter, wegklickbarer Hinweis auf eine kurze Pause (Atemübung selbst ist Backlog; im MVP reicht ein freundlicher Satz).
- **Krisen-Button:** Öffnet eine Seite mit 112, Telefonseelsorge (0800 111 0 111 und 0800 111 0 222, auch Chat), Hinweis auf psychiatrische Notaufnahme. Keine Aussagen über Vertraulichkeit oder Polizeieinbindung.
- **Barrierefreiheit:** WCAG 2.2 AA als Ziel. Große Touch-Ziele (mind. 44 px), gute Kontraste, Screenreader-Labels, `prefers-reduced-motion` respektieren.
- **Gestaltung:** Mobile first. Ruhige, warme Farbpalette, Dark Mode, viel Weißraum. Keine Illustrationen, die Krankheit stereotyp darstellen.
- **Sprache der Oberfläche:** Deutsch. Texte trotzdem über i18n-Struktur, damit später weitere Sprachen ergänzt werden können.

## Tech-Stack und Architektur

Entschieden (07.10.2026): eine statisch exportierte Next.js-PWA ohne Backend, gehostet auf GitHub Pages.

| Bereich | Wahl | Grund |
| --- | --- | --- |
| Framework | Next.js (App Router) + React + TypeScript, `output: 'export'` | Verbreitet, statisch exportierbar, ohne Server hostbar |
| PWA | Serwist (`@serwist/next`) | Offline-Fähigkeit, installierbar |
| Speicher | IndexedDB über Dexie.js | Strukturierte lokale Daten, Migrationen |
| Inhalte | Markdown in `content/`, zur Build-Zeit gerendert (MDX bzw. remark) | Pflege per Pull Request ohne Code |
| PDF | pdfmake (clientseitig) | Tabellen ohne Server |
| Styling | Plain CSS mit Custom Properties (global bzw. CSS Modules) | Kein Framework-Overhead |
| i18n | Einfache JSON-Schlüssel | Spätere Übersetzungen |
| Tests | Vitest (Parser, Datenlogik), Playwright (E2E) | Parser muss robust sein |
| Qualität | ESLint, Prettier, axe-core in E2E | Barrierefreiheit prüfbar |
| CI/CD | GitHub Actions: Lint, Test, Build, Deploy auf GitHub Pages | Sichtbar im Profil |
| Lizenz | Code MIT, Inhalte CC BY-SA 4.0 | Offen, Inhalte bleiben frei |

**Architektur:** Drei Schichten ohne Netzwerkzugriff zur Laufzeit.

- `src/lib/domain/` – reine Logik: Typen, Freitext-Parser, Etappenlogik, Fortschritt. Ohne Framework-Abhängigkeit, voll getestet.
- `src/lib/data/` – Dexie-Datenbank, Repository-Funktionen, Export/Import.
- `src/app/` (Routen) + `src/components/` – UI.
- `content/de/` – Markdown pro Etappe und Infoseite mit Frontmatter (`title`, `stage`, `summary`, `lastReviewed`, `sources`).

**Keine** Analytics, Tracker, externen Fonts oder CDN-Aufrufe. Eine Content-Security-Policy verbietet Verbindungen nach außen.

## Datenmodell

Drei Tabellen in IndexedDB reichen für das MVP; jede Änderung am Schema bekommt eine Dexie-Migration.

```typescript
type ContactResult =
  | 'not_reached'      // nicht erreicht / AB ohne Rückruf
  | 'voicemail'        // Nachricht auf AB hinterlassen
  | 'rejected'         // Absage, keine Kapazität
  | 'waitlist'         // auf Warteliste gesetzt
  | 'callback_pending' // Rückruf versprochen
  | 'appointment'      // Termin bekommen
  | 'other';

interface Practice {
  id: string;              // UUID
  name: string;
  phone?: string;
  phoneHours?: string;     // Freitext, z. B. "Mo/Mi 8–9 Uhr"
  address?: string;
  kind: 'kassenpraxis' | 'privatpraxis' | 'institut' | 'tss' | 'other';
  notes?: string;
  createdAt: string;       // ISO 8601
}

interface ContactAttempt {
  id: string;
  practiceId: string;
  at: string;              // ISO 8601, editierbar
  channel: 'phone' | 'email' | 'online' | 'in_person';
  result: ContactResult;
  waitTimeWeeks?: number;  // normalisiert aus Freitext
  rawInput?: string;       // Originaleingabe, für Nachvollziehbarkeit
  notes?: string;
}

interface JourneyState {
  id: 'singleton';
  currentStage: 1 | 2 | 3 | 4 | 5;
  completedSteps: string[];  // IDs aus content-Frontmatter
  displayName?: string;      // nur für PDF, optional
  schemaVersion: number;
}
```

**Export-Format:** Eine JSON-Datei `{ app: "rueckenwind", schemaVersion, exportedAt, practices, attempts, journey }`. Der Import validiert das Schema (z. B. mit zod) und fragt bei vorhandenen Daten: ersetzen oder abbrechen.

**Zählregel für den Nachweis:** Als erfolgloser Versuch zählen `rejected`, `waitlist` und `not_reached` bei Kassenpraxen; die PDF-Tabelle listet trotzdem alle Versuche vollständig.

## Umsetzungsschritte

Sieben Phasen, jede endet mit einem lauffähigen Stand und einem eigenen Pull Request. Erst wenn die Akzeptanzkriterien erfüllt sind, beginnt die nächste Phase.

### Phase 0 – Repo-Fundament

- [ ] Next.js + TypeScript mit statischem Export (`output: 'export'`) aufsetzen, ESLint, Prettier, Vitest, Playwright
- [ ] Ordnerstruktur wie in „Architektur“ anlegen
- [ ] README (Ziel, Screenshots-Platzhalter, Datenschutz-Versprechen, Disclaimer), LICENSE (MIT), `content/LICENSE` (CC BY-SA 4.0), CONTRIBUTING.md, CODE_OF_CONDUCT.md, Issue- und PR-Templates
- [ ] GitHub Actions: Lint, Test, Build, Deploy auf GitHub Pages

*Akzeptanz:* `npm run build` erzeugt eine statische Seite, die per Action auf GitHub Pages erreichbar ist.

### Phase 1 – Domänenlogik

- [ ] Typen aus „Datenmodell“ umsetzen
- [ ] Freitext-Parser `parseContactInput(text): ParsedContact` mit Konfidenz pro Feld
- [ ] Mindestens 40 Testfälle mit realistischen Eingaben (Tippfehler, Kleinschreibung, „AB“, „Warteliste ca. 1 Jahr“, „rückruf mittwoch“)
- [ ] Fortschrittsberechnung nach Zählregel

*Akzeptanz:* Parser erkennt das Ergebnis in ≥ 90 % der Testfälle korrekt; Domänencode hat ≥ 90 % Testabdeckung.

### Phase 2 – Datenhaltung

- [ ] Dexie-Datenbank mit Schema-Version 1
- [ ] Repository-Funktionen (CRUD für Practice, ContactAttempt, JourneyState)
- [ ] JSON-Export, Import mit zod-Validierung, „Alle Daten löschen“

*Akzeptanz:* Export → Löschen → Import ergibt identische Daten (automatisierter Test).

### Phase 3 – Inhalte

- [ ] Markdown-Dateien für Etappen 1–5 in `content/de/` mit Frontmatter
- [ ] Krisenseite und Disclaimer-Seite
- [ ] Rendering mit Kurztext + aufklappbaren Details

*Akzeptanz:* Alle Etappenseiten erreichbar; jede Seite zeigt `lastReviewed` und Quellen.

### Phase 4 – Kern-UI

- [ ] Startseite „Dein Weg“ mit Zeitleiste und nächster Aufgabe
- [ ] Schnellerfassung (Floating Button, Freitext, Chip-Vorschau, Korrektur per Tipp)
- [ ] Schnellbuttons
- [ ] Kontaktliste und Zeitstrahl, Fortschrittsanzeige
- [ ] Krisen-Button in der Kopfzeile auf jeder Seite

*Akzeptanz:* Ein Kontaktversuch lässt sich in höchstens drei Taps nach dem Tippen speichern (E2E-Test). axe-core meldet keine Fehler.

### Phase 5 – Nachweis-PDF

- [ ] PDF-Erzeugung mit pdfmake: Kopf, Zeitraum, Tabelle aller Versuche, Zählung, TSS-Hinweis, Unterschriftsfeld
- [ ] Optionaler Name nur im Export-Dialog

*Akzeptanz:* PDF mit 0, 1 und 50 Einträgen sieht korrekt aus (Snapshot- oder visueller Test); Umlaute korrekt.

### Phase 6 – PWA, Feinschliff, Release

- [ ] Offline-Fähigkeit, Manifest, Icons, Dark Mode
- [ ] Lighthouse: Performance, Accessibility, Best Practices jeweils ≥ 90
- [ ] CSP ohne externe Verbindungen
- [ ] Echte Screenshots im README, CHANGELOG, Release v0.1.0 mit Tag
- [ ] Inhaltliche Prüfung durch eine fachkundige Person organisieren (manuell, nicht Teil des Codes)

*Akzeptanz:* App funktioniert im Flugmodus nach dem ersten Laden; Release ist auf GitHub veröffentlicht.

## Datenschutz, Recht, Risiken

Das größte Risiko ist nicht technisch, sondern inhaltlich: veraltete oder falsche Informationen in einer belastenden Situation.

| Risiko | Gegenmaßnahme |
| --- | --- |
| Falsche oder veraltete Infos (z. B. Änderungen ab 2027) | `lastReviewed` pro Seite, Quellen sichtbar, Hinweis nach 12 Monaten ohne Review, Fachprüfung vor Release |
| Einstufung als Medizinprodukt (MDR) | Keine Diagnose, keine Symptomauswertung, keine Therapieempfehlung; nur Information und Organisation |
| Wirkt wie Rechtsberatung | Disclaimer, keine Erfolgsversprechen, keine feste Absagenzahl |
| Gesundheitsdaten (Art. 9 DSGVO) | Keine Übertragung, kein Server, keine Analytics; Daten nur im Browser |
| Datenverlust (Browser-Daten gelöscht) | Deutlicher Hinweis auf Export, Erinnerung nach z. B. 10 Einträgen ohne Export |
| Geteiltes Gerät | Hinweis auf der „Über“-Seite; App-PIN als Backlog-Option |
| Person in akuter Krise | Krisen-Button überall, klarer Hinweis, nicht auf das Verfahren zu warten |

**Impressum:** Für eine öffentlich gehostete Seite in Deutschland ist ggf. ein Impressum nötig. Das klärt der Projektinhaber selbst; der Code sieht dafür eine konfigurierbare Seite vor.

## Backlog nach dem MVP

- **Telefonzeiten-Planer:** Aus den erfassten Telefonzeiten einen Tagesplan erzeugen („heute 3 Praxen zwischen 8 und 9 Uhr“), optional lokale Benachrichtigungen.
- **Rückruf-Erinnerungen:** Bei „Rückruf versprochen“ nach X Tagen nachfragen.
- **Mini-Pause:** Kurze Atemübung (z. B. 4-7-8) nach schweren Anrufen, offline, mit `prefers-reduced-motion`.
- **Antragsmappe:** Checkliste der Unterlagen für die Kostenerstattung plus Vorlage für Anschreiben und Widerspruch (als Textbaustein, keine Rechtsberatung).
- **Kassen-spezifische Hinweise:** Community-gepflegte Infos, was einzelne Kassen verlangen.
- **Übersetzungen:** Englisch, Türkisch, Arabisch, Ukrainisch, Leichte Sprache.
- **App-PIN** für geteilte Geräte.
- **Kalenderexport (.ics)** für Termine und Telefonzeiten.
- **Optionale Sprachnotiz-Erfassung** nur mit rein lokaler Spracherkennung (die Web Speech API schickt Audio in manchen Browsern an Server und scheidet dann aus).
- **Spätere Verwandte im Portfolio:** Offline-Notfallkoffer bei Angst, Stimmungstagebuch mit Export für die Therapie.

## Arbeitsanweisungen für Claude Code

Arbeite dieses Dokument Phase für Phase ab und halte dich an die Leitprinzipien; bei Zielkonflikten gewinnen Datenschutz und Einfachheit.

1. **Vor dem Start:** Lies `PLAN.md` und `WISSEN.md` vollständig. Lege `docs/PLAN.md` und `docs/WISSEN.md` im Repo ab und erstelle `CLAUDE.md` mit den Leitprinzipien, dem Tech-Stack und den Befehlen (`dev`, `test`, `build`).
2. **Pro Phase:** Eigener Branch (`phase-0-fundament` usw.), kleine Commits nach Conventional Commits, am Ende ein PR mit Zusammenfassung und erfüllten Akzeptanzkriterien.
3. **Tests zuerst** für Parser und Datenlogik. Keine Phase gilt als fertig, wenn Tests fehlschlagen.
4. **Nachfragen statt raten** bei: Lizenzwahl, Farbpalette, Abweichungen vom Tech-Stack, allem, was Daten nach außen senden würde.
5. **Inhalte nicht erfinden.** Infotexte nur aus `WISSEN.md` ableiten, Quellen im Frontmatter angeben, unsichere Aussagen mit `<!-- TODO: fachlich prüfen -->` markieren.
6. **Keine externen Laufzeit-Abhängigkeiten:** keine CDNs, Fonts, Analytics oder APIs. Fonts als System-Font-Stack.
7. **Ton der UI-Texte** nach Abschnitt „UX, Ton und Wohlbefinden“; Texte in i18n-Dateien, nie hart im Komponentencode.
8. **Am Ende jeder Phase:** README aktualisieren und offene Punkte als GitHub-Issues formulieren, Einsteigeraufgaben mit `good first issue` markieren.
