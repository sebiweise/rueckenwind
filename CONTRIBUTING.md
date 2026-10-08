# Mitmachen bei Rückenwind

Schön, dass du helfen willst. Rückenwind richtet sich an Menschen in einer belastenden Lage. Deshalb zählen hier zwei Dinge besonders: richtige Informationen und ein ruhiger, freundlicher Ton.

## Bitte keine persönlichen Daten

Schreib in Issues und Pull Requests keine eigenen Gesundheitsdaten, Diagnosen oder Namen von Praxen, bei denen du angefragt hast. Alles hier ist öffentlich.

## Infotexte korrigieren

Die Infotexte liegen als Markdown in [`content/de/`](content/de/). Du brauchst dafür keine Programmierkenntnisse.

1. Öffne die Datei auf GitHub und klicke auf den Stift („Edit this file“).
2. Ändere den Text und nenne im Frontmatter unter `sources` eine seriöse Quelle (Gesetz, Kasse, Kammer, Berufsverband, KBV).
3. Erstelle einen Pull Request und beschreib kurz, was sich geändert hat.

Wenn du dir unsicher bist, eröffne lieber ein Issue mit der Vorlage „Inhalt korrigieren“.

Für Texte gilt:

- Du-Form, kurze Sätze (unter 20 Wörtern), Fachbegriffe erklären.
- Kein Druck, keine Versprechen. Keine feste Zahl an Absagen nennen, keine Erfolgsgarantie.
- Keine Rechts- oder Medizinberatung, keine Diagnosen, keine Therapieempfehlungen.
- Unsichere Aussagen mit `<!-- TODO: fachlich prüfen -->` markieren.

## Code beitragen

```sh
npm ci
npm run dev
```

Vor einem Pull Request bitte ausführen:

```sh
npm run lint
npm run check
npm test
npm run test:e2e   # einmalig vorher: npx playwright install chromium
E2E_TARGET=static npm run test:e2e
```

Regeln für den Code:

- **Lokal-first:** Keine Netzwerkanfragen zur Laufzeit, keine CDNs, externen Fonts, Analytics oder APIs. Keine Route Handler oder Server Actions: Die App muss auch als statischer Export funktionieren.
- **Barrierefreiheit:** Ziel ist WCAG 2.2 AA. Touch-Ziele mindestens 44 px, `prefers-reduced-motion` beachten. Die E2E-Tests prüfen mit axe-core.
- **UI-Texte** gehören in `src/lib/i18n/`, nie direkt in Komponenten.
- **Den App-Namen** nur über `APP_NAME` aus `src/lib/config.ts` verwenden.
- **Tests zuerst** für Parser und Datenlogik in `src/lib/domain/` und `src/lib/data/`.
- **Commits** nach [Conventional Commits](https://www.conventionalcommits.org/de/), zum Beispiel `feat: Schnellbutton „Absage“` oder `fix(parser): Wartezeit in Wochen`.

## Einsteigeraufgaben

Issues mit dem Label `good first issue` eignen sich für den Anfang.
