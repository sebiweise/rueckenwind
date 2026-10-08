# Changelog

Alle wichtigen Änderungen an Rückenwind. Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [Semantic Versioning](https://semver.org/lang/de/).

## [Unveröffentlicht]

### Verbessert

- **Schnellerfassung:** Uhrzeiten wie „8:30“, „8.30 Uhr“ oder „gestern 12 Uhr“ werden als Zeitpunkt des Kontaktversuchs übernommen (#13).
- **Parser:** versteht mehr Alltagsformulierungen, etwa „ned erreicht“, „keine Kapa“, „nimmt grad niemand auf“ oder „Rückruf zugesagt“ (#14).

## [0.1.0] – noch offen

Erste Version mit dem vollen MVP-Umfang aus [docs/PLAN.md](docs/PLAN.md). Vor der Veröffentlichung stehen noch die fachliche Prüfung der Infotexte (#11) und die Markenrecherche (#4) aus. Zum Ausprobieren gibt es vorher Testversionen (`v0.1.0-beta.1`, 2026-10-08).

### Neu

- **Dein Weg:** Startseite mit den fünf Etappen und genau einer nächsten kleinen Aufgabe; Etappen frei wählbar.
- **Infoseiten** für alle Etappen aus Markdown (`content/de/`) mit Kurztext, aufklappbaren Details, Prüfdatum und Quellen; Hinweis nach 12 Monaten ohne Prüfung.
- **Schnellerfassung:** Kontaktversuch als eine Zeile Freitext, lokal geparst (Praxis, Ergebnis, Wartezeit, Datum, Kanal) mit Konfidenz, Chip-Vorschau und Korrektur per Tipp; Schnellbuttons.
- **Kontakte und Zeitstrahl:** Praxen mit Telefon und Telefonzeiten, alle Versuche chronologisch und nachträglich änderbar; Fortschritt „X Nachweise gesammelt“.
- **Nachweis-PDF** mit Zeitraum, Tabelle aller Versuche, Zählung, Hinweis auf die Terminservicestelle und Unterschriftsfeld, erzeugt im Browser.
- **Daten:** JSON-Export, Import mit Prüfung, alles löschen.
- **Wohlbefinden:** Pausen-Hinweis nach drei Absagen am Tag, Erinnerung an eine Sicherung nach zehn Einträgen.
- **Krisenseite** und Krisen-Button auf jeder Seite; Hinweis- und Über-Seite, optionales Impressum.
- **PWA:** offline nutzbar nach dem ersten Besuch (Serwist), installierbar, Manifest und Platzhalter-Icons, Hell- und Dunkelmodus.
- **Sicherheit:** CSP nur mit `'self'`, Inline-Skripte per Hash statt `'unsafe-inline'`.
- **Hosting:** Docker-Image (GHCR), Node-Host oder statischer Export (GitHub Pages).
- **Qualität:** Unit-Tests mit Abdeckungsgrenze für die Domäne, E2E-Tests mit axe-core für beide Build-Ziele, Lighthouse-Prüfung (≥ 90) in CI.

[Unveröffentlicht]: https://github.com/sebiweise/rueckenwind/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sebiweise/rueckenwind/releases/tag/v0.1.0
