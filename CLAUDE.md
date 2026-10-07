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

| Bereich  | Wahl                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| App      | SvelteKit 3 + Svelte 5 (Runes) + TypeScript, `adapter-static`, Vite 8                 |
| Speicher | IndexedDB über Dexie.js (Phase 2)                                                     |
| Inhalte  | Markdown in `content/de/`, gerendert mit mdsvex (Phase 3)                             |
| PDF      | pdfmake, clientseitig (Phase 5)                                                       |
| PWA      | `@vite-pwa/sveltekit` (Phase 6)                                                       |
| Styling  | Plain CSS mit Custom Properties in `src/app.css`, System-Font-Stack                   |
| i18n     | JSON-Schlüssel in `src/lib/i18n/de.json`, Zugriff über `t()`                          |
| Tests    | Vitest (Unit), Playwright + `@axe-core/playwright` (E2E)                              |
| Qualität | ESLint, Prettier, svelte-check                                                        |
| CI/CD    | GitHub Actions: `ci.yml` (Lint, Check, Test, Build, E2E), `deploy.yml` (GitHub Pages) |

Die SvelteKit-Konfiguration (Adapter, `paths.base`, CSP) steht in `vite.config.ts`, es gibt keine `svelte.config.js`. Imports aus `src/lib` laufen über `#lib/…` mit Dateiendung, z. B. `#lib/config.js`.

## Befehle

```sh
npm ci              # Abhängigkeiten installieren (Node 22, siehe .nvmrc)
npm run dev         # Entwicklungsserver
npm run lint        # Prettier --check + ESLint
npm run format      # Prettier --write
npm run check       # svelte-check (Typen)
npm test            # Vitest einmalig
npm run test:unit   # Vitest im Watch-Modus
npm run test:e2e    # Playwright gegen den Produktions-Build (vorher: npx playwright install chromium)
npm run build       # statische Seite nach build/
BASE_PATH=/rueckenwind npm run build   # wie auf GitHub Pages
```

Hinweis: `npm install` mit npm 10.9 bricht bei diesem Abhängigkeitsbaum mit „Cannot read properties of null (reading 'edgesOut')“ ab. Zum Hinzufügen von Paketen `npx npm@11 install …` verwenden; `npm ci` mit vorhandenem Lockfile funktioniert auch mit npm 10.

## Struktur

```
content/de/          Infotexte (CC BY-SA 4.0), Frontmatter: title, stage, summary, lastReviewed, sources
docs/                PLAN.md, WISSEN.md
e2e/                 Playwright-Tests (*.e2e.ts)
src/lib/config.ts    APP_NAME, APP_SUBTITLE, APP_TITLE – der Name ist vorläufig, nur hier pflegen
src/lib/domain/      reine Logik ohne Framework, voll getestet
src/lib/data/        Dexie, Repository-Funktionen, Export/Import
src/lib/components/  UI-Komponenten
src/lib/i18n/        UI-Texte
src/routes/          Seiten (alle prerendered)
```

## Arbeitsweise

- **Pro Phase** ein eigener Branch und ein PR mit Zusammenfassung und erfüllten Akzeptanzkriterien. Kleine Commits nach Conventional Commits.
- **Tests zuerst** für Parser und Datenlogik. Keine Phase ist fertig, solange Tests fehlschlagen.
- **Nachfragen statt raten** bei Lizenzwahl, Farbpalette, Abweichungen vom Tech-Stack und allem, was Daten nach außen senden würde.
- **Inhalte nicht erfinden.** Infotexte nur aus `docs/WISSEN.md` ableiten, Quellen ins Frontmatter, unsichere Aussagen mit `<!-- TODO: fachlich prüfen -->` markieren.
- **Keine externen Laufzeit-Abhängigkeiten:** keine CDNs, Fonts, Analytics oder APIs. Die CSP in `vite.config.ts` erlaubt nur `'self'`; ein E2E-Test prüft, dass keine fremden Origins angefragt werden.
- **UI-Texte** nur in `src/lib/i18n/de.json`, nie hart im Komponentencode. Ton: Du-Form, Sätze unter 20 Wörtern, kein Druck, keine roten Warnungen, keine Streaks.
- **Barrierefreiheit:** WCAG 2.2 AA, Touch-Ziele ≥ 44 px (`--touch-target`), `prefers-reduced-motion`, Hell- und Dunkelmodus. axe-core in E2E muss fehlerfrei sein.
- **Am Ende jeder Phase:** README aktualisieren, offene Punkte als GitHub-Issues formulieren, Einsteigeraufgaben mit `good first issue` markieren.
