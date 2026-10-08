# Rückenwind – Therapieplatz finden

[![CI](https://github.com/sebiweise/rueckenwind/actions/workflows/ci.yml/badge.svg)](https://github.com/sebiweise/rueckenwind/actions/workflows/ci.yml)
[![Lizenz: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](LICENSE)
[![Inhalte: CC BY-SA 4.0](https://img.shields.io/badge/Inhalte-CC%20BY--SA%204.0-lightgrey.svg)](content/LICENSE)

Rückenwind ist eine Open-Source-Web-App (PWA), die gesetzlich Versicherte in Deutschland auf dem Weg zu einem ambulanten Psychotherapieplatz begleitet. Sie erklärt die Schritte verständlich, schlägt immer genau eine nächste kleine Aufgabe vor und dokumentiert jeden Kontaktversuch nebenbei. Am Ende entsteht daraus ein Nachweis-PDF für das Kostenerstattungsverfahren.

> **Status:** Im Aufbau (Phase 4 von 6: Startseite, Schnellerfassung, Kontaktliste). Noch nicht für den Einsatz gedacht.

> **Akute Krise?** Warte nicht auf einen Therapieplatz. Notruf **112**, Telefonseelsorge **0800 111 0 111** oder **0800 111 0 222** (kostenfrei, rund um die Uhr, auch Chat auf [telefonseelsorge.de](https://www.telefonseelsorge.de)) oder die psychiatrische Notaufnahme einer Klinik in deiner Nähe.

## Warum

Wer keinen Kassenplatz findet, ruft viele Praxen an, oft nur in kurzen Telefonsprechzeiten. Für die Kostenerstattung verlangen Kassen eine Liste erfolgloser Anfragen. Das ist anstrengend, gerade in einer belastenden Lage. Rückenwind soll die Suche leichter machen: Jeder Anruf, auch eine Absage, zählt sichtbar als Fortschritt.

## Screenshots

_Folgen, sobald die Oberfläche steht._

## Datenschutz-Versprechen

- **Deine Daten bleiben auf deinem Gerät.** Alles wird nur im Browser gespeichert (IndexedDB).
- **Kein Konto, kein Server, kein Tracking.** Keine Analytics, keine externen Fonts, keine CDNs.
- **Keine Verbindungen nach außen.** Eine Content-Security-Policy erlaubt nur Anfragen an die eigene Seite. Ein automatischer Test prüft das.
- **Sicherung nur per Datei.** Du kannst deine Daten als JSON exportieren, wieder importieren und jederzeit vollständig löschen.

## Hinweis

Rückenwind informiert und hilft beim Organisieren. Die App ist **keine Rechts- oder Medizinberatung**, stellt keine Diagnosen und gibt keine Garantie, dass ein Antrag bewilligt wird. Die Infotexte werden vor dem ersten Release fachkundig geprüft.

## Entwicklung

Voraussetzung: Node.js 22 oder neuer (siehe `.nvmrc`).

```sh
npm ci              # Abhängigkeiten installieren
npm run dev         # Entwicklungsserver
npm run lint        # Prettier + ESLint
npm run check       # Typprüfung (tsc)
npm test            # Unit-Tests (Vitest)
npm run test:coverage   # Unit-Tests mit Abdeckung (Domäne ≥ 90 %)
npm run test:e2e    # E2E-Tests (Playwright + axe-core); vorher einmal: npx playwright install chromium
                    # oder vorhandenes Chromium nutzen: PLAYWRIGHT_CHROMIUM_PATH=/pfad/zu/chrome
npm run build       # Produktions-Build (Standalone-Server)
npm start           # Produktions-Build starten (http://localhost:3000)
```

Tech-Stack: Next.js + React + TypeScript, Plain CSS, Vitest, Playwright. Details, Datenmodell und Phasen stehen im [Umsetzungsplan](docs/PLAN.md), das Fachwissen in [docs/WISSEN.md](docs/WISSEN.md).

### Projektstruktur

```
content/de/          Infotexte als Markdown (CC BY-SA 4.0)
docs/                Plan und Wissensstand
e2e/                 End-to-End-Tests
src/app/             Seiten und Layout
src/components/      UI-Komponenten
src/lib/domain/      reine Logik ohne Framework (Parser, Etappen, Fortschritt)
src/lib/data/        lokale Datenhaltung, Export/Import
src/lib/i18n/        UI-Texte
```

## Hosting

Rückenwind braucht kein Backend. Der Server liefert nur die App aus, deine Daten bleiben im Browser. Du hast vier Möglichkeiten:

**1. Docker** (Next.js-Standalone-Server)

```sh
docker run -p 3000:3000 ghcr.io/sebiweise/rueckenwind:latest
# oder selbst bauen:
docker build -t rueckenwind . && docker run -p 3000:3000 rueckenwind
# oder mit Compose:
docker compose up -d
```

Das Image läuft als unprivilegierter Nutzer, verträgt ein schreibgeschütztes Dateisystem und hat einen Healthcheck. Port und Adresse lassen sich über `PORT` und `HOSTNAME` ändern.

**2. Beliebiger Node-Host** (Node 22 oder neuer)

```sh
npm ci && npm run build && npm start
```

**3. Vercel oder ein anderer Next.js-Hoster**

Repository importieren, fertig. Es ist keine weitere Konfiguration nötig; Vercel erkennt Next.js selbst. Bitte Vercel Analytics und Speed Insights ausgeschaltet lassen, die App verzichtet bewusst auf Tracking.

**4. Statischer Export** (GitHub Pages, Netlify, ein einfacher Webserver)

```sh
npm run build:static            # schreibt die Seite nach out/
BASE_PATH=/rueckenwind npm run build:static   # wenn die App unter einem Unterpfad liegt
```

Die GitHub-Pages-Variante baut und veröffentlicht der Workflow `pages.yml` bei jedem Push auf `master`. Ein statischer Host kann keine HTTP-Header setzen; die Content-Security-Policy steckt deshalb zusätzlich als Meta-Tag in jeder Seite.

## Mitmachen

Die Infotexte liegen als Markdown in [`content/de/`](content/de/README.md). Korrekturen daran sind besonders willkommen, auch ohne Programmierkenntnisse. Wie das geht, steht in [CONTRIBUTING.md](CONTRIBUTING.md). Bitte beachte den [Verhaltenskodex](CODE_OF_CONDUCT.md).

## Lizenz

- Code: [MIT](LICENSE)
- Inhalte in `content/`: [CC BY-SA 4.0](content/LICENSE)
