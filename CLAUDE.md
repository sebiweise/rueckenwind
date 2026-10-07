# CLAUDE.md

Rückenwind ist eine Open-Source-PWA, die gesetzlich Versicherte in Deutschland auf dem Weg zu einem ambulanten Psychotherapieplatz begleitet. Umsetzungsplan: [docs/PLAN.md](docs/PLAN.md). Fachwissen und offene Entscheidungen: [docs/WISSEN.md](docs/WISSEN.md). Beide vor jeder Phase lesen.

## Leitprinzipien

Bei Zielkonflikten gewinnen Datenschutz und Einfachheit.

1. **Wegbegleiter statt Formular.** Keine Pflichtfelder, keine mehrseitigen Masken. Pro Etappe genau eine nächste kleine Aufgabe.
2. **Erfassen in einer Zeile.** Kontaktversuch als Freitext, lokal geparst, plus Schnellbuttons.
3. **Dokumentation entsteht nebenbei.** Alles Erfasste fließt in Zeitstrahl und Nachweis-PDF.
4. **Absagen sind Fortschritt.** Als gesammelte Nachweise zeigen, nie als Misserfolg.
5. **Lokal-first, ohne Account, ohne Server.** Gesundheitsdaten verlassen das Gerät nie. Sicherung nur per Datei-Export/-Import.
6. **Ungezwungen, aber klar.** Warmer, kurzer Ton. Details nur auf Wunsch aufklappbar.
7. **Krisenhilfe immer sichtbar.** Krisen-Button auf jedem Screen.
8. **Inhalte sind Community-pflegbar.** Infotexte als Markdown in `content/`.
9. **Keine Rechts- oder Medizinberatung.** Nichts diagnostizieren, keine Erfolgsgarantie, keine feste Absagenzahl (MDR-Abgrenzung).
10. **MVP zuerst.** Alles außerhalb von PLAN.md „Funktionsumfang MVP“ ist Backlog.

## Tech-Stack

| Bereich  | Wahl                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| App      | Next.js 16 (App Router) + React 19 + TypeScript, statischer Export (`output: 'export'`) |
| Speicher | IndexedDB über Dexie.js (Phase 2)                                                       |
| Inhalte  | Markdown in `content/de/`, zur Build-Zeit gerendert (Phase 3)                           |
| PDF      | pdfmake, clientseitig (Phase 5)                                                         |
| PWA      | Serwist `@serwist/next` (Phase 6)                                                       |
| Styling  | Plain CSS mit Custom Properties in `src/app/globals.css`, System-Font-Stack             |
| i18n     | JSON-Schlüssel in `src/lib/i18n/de.json`, Zugriff über `t()`                            |
| Tests    | Vitest (Unit), Playwright + `@axe-core/playwright` (E2E)                                |
| Qualität | ESLint (`eslint-config-next`), Prettier, `tsc --noEmit`                                 |
| CI/CD    | GitHub Actions: `ci.yml` (Lint, Check, Test, Build, E2E), `deploy.yml` (GitHub Pages)   |

Next.js 16 weicht in Teilen von älterem Wissen ab: vor neuem Code die passende Anleitung in `node_modules/next/dist/docs/` lesen (siehe `AGENTS.md`). Wegen des statischen Exports gibt es keine Server-Funktionen, keine Route Handler mit Laufzeit, kein `next/image`-Optimizer und keine Middleware. Keine `next/font/google` (lädt von Google); System-Fonts verwenden.

Die CSP steht als `<meta>` in `src/app/layout.tsx` (Quelle: `src/lib/csp.ts`), weil GitHub Pages keine Header setzen kann. Sie erlaubt nur `'self'`; `script-src` braucht wegen der Next.js-Hydration `'unsafe-inline'`, Härtung per Hashes ist für Phase 6 vorgesehen. Imports aus `src/` laufen über `@/…`.

## Befehle

```sh
npm ci              # Abhängigkeiten installieren (Node 22, siehe .nvmrc)
npm run dev         # Entwicklungsserver
npm run lint        # Prettier --check + ESLint
npm run format      # Prettier --write
npm run check       # tsc --noEmit (Typen)
npm test            # Vitest einmalig
npm run test:unit   # Vitest im Watch-Modus
npm run test:e2e    # Playwright gegen den statischen Export (vorher: npx playwright install chromium)
npm run build       # statischer Export nach out/
npm run preview     # out/ lokal auf Port 4173 ausliefern (scripts/preview.mjs)
BASE_PATH=/rueckenwind npm run build   # wie auf GitHub Pages
```

## Struktur

```
content/de/          Infotexte (CC BY-SA 4.0), Frontmatter: title, stage, summary, lastReviewed, sources
docs/                PLAN.md, WISSEN.md
e2e/                 Playwright-Tests (*.e2e.ts)
public/              statische Dateien (u. a. .nojekyll für GitHub Pages)
scripts/             Hilfsskripte (Preview-Server)
src/app/             Routen, Layout, globals.css
src/components/      UI-Komponenten
src/lib/config.ts    APP_NAME, APP_SUBTITLE, APP_TITLE – der Name ist vorläufig, nur hier pflegen
src/lib/domain/      reine Logik ohne Framework, voll getestet
src/lib/data/        Dexie, Repository-Funktionen, Export/Import
src/lib/i18n/        UI-Texte
```

## Arbeitsweise

- **Pro Phase** ein eigener Branch und ein PR mit Zusammenfassung und erfüllten Akzeptanzkriterien. Kleine Commits nach Conventional Commits.
- **Tests zuerst** für Parser und Datenlogik. Keine Phase ist fertig, solange Tests fehlschlagen.
- **Nachfragen statt raten** bei Lizenzwahl, Farbpalette, Abweichungen vom Tech-Stack und allem, was Daten nach außen senden würde.
- **Inhalte nicht erfinden.** Infotexte nur aus `docs/WISSEN.md` ableiten, Quellen ins Frontmatter, unsichere Aussagen mit `<!-- TODO: fachlich prüfen -->` markieren.
- **Keine externen Laufzeit-Abhängigkeiten:** keine CDNs, Fonts, Analytics oder APIs. Die CSP erlaubt nur `'self'`; E2E-Tests prüfen, dass keine fremden Origins angefragt werden und die CSP fremde Anfragen blockiert.
- **UI-Texte** nur in `src/lib/i18n/de.json`, nie hart im Komponentencode. Ton: Du-Form, Sätze unter 20 Wörtern, kein Druck, keine roten Warnungen, keine Streaks.
- **Barrierefreiheit:** WCAG 2.2 AA, Touch-Ziele ≥ 44 px (`--touch-target`), `prefers-reduced-motion`, Hell- und Dunkelmodus. axe-core in E2E muss fehlerfrei sein.
- **Am Ende jeder Phase:** README aktualisieren, offene Punkte als GitHub-Issues formulieren, Einsteigeraufgaben mit `good first issue` markieren.
