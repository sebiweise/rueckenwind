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

| Bereich  | Wahl                                                                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App      | Next.js 16 (App Router) + React 19 + TypeScript                                                                                                                         |
| Hosting  | Statischer Export (`output: 'export'`) nach `out/`, ausgeliefert von Vercel über `vercel.json` (`@vercel/static-build`)                                                 |
| Speicher | IndexedDB über Dexie.js (Phase 2)                                                                                                                                       |
| Inhalte  | Markdown in `content/de/`, zur Build-Zeit gerendert (Phase 3)                                                                                                           |
| PDF      | pdfmake, clientseitig (Phase 5)                                                                                                                                         |
| PWA      | Serwist `@serwist/next` (Phase 6)                                                                                                                                       |
| Styling  | Plain CSS mit Custom Properties in `src/app/globals.css`, System-Font-Stack; Farbthemen per `data-palette` (`src/lib/theme`), Thema Himmel nutzt Nunito selbst gehostet |
| i18n     | JSON-Schlüssel in `src/lib/i18n/de.json`, Zugriff über `t()`                                                                                                            |
| Tests    | Vitest (Unit), Playwright + `@axe-core/playwright` (E2E)                                                                                                                |
| Qualität | ESLint (`eslint-config-next`), Prettier, `tsc --noEmit`                                                                                                                 |
| CI/CD    | GitHub Actions: `ci.yml` (Lint, Check, Test, Build, E2E, Lighthouse), `release.yml` (Release mit Zip)                                                                   |

Next.js 16 weicht in Teilen von älterem Wissen ab: vor neuem Code die passende Anleitung in `node_modules/next/dist/docs/` lesen (siehe `AGENTS.md`). Es gibt nur ein Build-Ziel: den statischen Export (`next.config.ts`). Deshalb: keine Route Handler, Server Actions, Middleware/Proxy, dynamischen Server-Funktionen (`cookies()`, `headers()`) und kein `next/image`-Optimizer. Es gibt keinen App-Server, Nutzerdaten bleiben im Browser. Keine `next/font/google` (lädt von Google); System-Fonts verwenden.

Die CSP kommt aus `src/lib/csp.ts`: als `<meta>` mit Skript-Hashes in jeder vorgerenderten Seite (von `scripts/postbuild.mjs` eingefügt, im Dev-Server vom Layout). Sie erlaubt nur `'self'`. Die übrigen Sicherheits-Header setzt Vercel aus `vercel.json`; `scripts/preview.mjs` sendet dieselben. `scripts/postbuild.mjs` fügt nach jedem Build den Meta-Tag ohne `'unsafe-inline'` für Skripte ein und baut den Service Worker (`src/sw.ts` → `sw.js`, Serwist). Deshalb immer `npm run build` nutzen, nie `next build` direkt. Auch Vercel baut deshalb über `vercel.json` mit `@vercel/static-build` (Skript `build`): Der Next.js-Builder von Vercel sammelt die Seiten schon während `next build` ein, also bevor `postbuild` die CSP einfügt. Imports aus `src/` laufen über `@/…`.

## Befehle

```sh
npm ci              # Abhängigkeiten installieren (Node ≥ 22.18, siehe .nvmrc)
npm run dev         # Entwicklungsserver
npm run lint        # Prettier --check + ESLint
npm run format      # Prettier --write
npm run check       # tsc --noEmit (Typen)
npm test            # Vitest einmalig
npm run test:coverage   # Vitest mit Abdeckung (Domäne ≥ 90 %, läuft in CI)
npm run test:unit   # Vitest im Watch-Modus
npm run build       # statischer Export nach out/, danach postbuild (CSP-Hashes, sw.js)
npm start           # out/ lokal ausliefern (scripts/preview.mjs, Port 4173 oder PORT), mit Headern aus vercel.json
npm run test:e2e    # Playwright gegen npm start (vorher: npx playwright install chromium)
node scripts/lighthouse.mjs     # Lighthouse ≥ 90 gegen laufenden Server (CHROME_PATH setzen)
node scripts/screenshots.mjs    # README-Screenshots gegen laufenden Server
```

## Struktur

```
content/de/          Infotexte (CC BY-SA 4.0), Frontmatter: title, stage, summary, lastReviewed, sources
docs/                PLAN.md, WISSEN.md
e2e/                 Playwright-Tests (*.e2e.ts)
public/              statische Dateien (Icons, robots.txt)
scripts/             Hilfsskripte (postbuild, Preview-Server, Icons, Screenshots, Lighthouse)
src/app/             Startseite (page.tsx), App-Routen in (app)/ (Weg unter /app/), Layout, globals.css
src/components/      UI-Komponenten
src/lib/config.ts    APP_NAME, APP_SUBTITLE, APP_TITLE – der Name ist vorläufig, nur hier pflegen
src/lib/domain/      reine Logik ohne Framework, voll getestet
src/lib/data/        Dexie, Repository-Funktionen, Export/Import, Hooks (hooks.ts nur im Client)
src/lib/content/     Markdown aus content/de laden und prüfen (nur zur Build-Zeit)
src/lib/pdf/         Nachweis-PDF (Definition testbar, pdfmake per dynamischem Import)
src/sw.ts            Service Worker
src/lib/i18n/        UI-Texte
```

## Arbeitsweise

- **Pro Phase** ein eigener Branch und ein PR mit Zusammenfassung und erfüllten Akzeptanzkriterien. Kleine Commits nach Conventional Commits.
- **Keine `Co-Authored-By`-Zeilen** in Commit-Nachrichten.
- **Tests zuerst** für Parser und Datenlogik. Keine Phase ist fertig, solange Tests fehlschlagen.
- **Nachfragen statt raten** bei Lizenzwahl, Farbpalette, Abweichungen vom Tech-Stack und allem, was Daten nach außen senden würde.
- **Inhalte nicht erfinden.** Infotexte nur aus `docs/WISSEN.md` ableiten, Quellen ins Frontmatter, unsichere Aussagen mit `<!-- TODO: fachlich prüfen -->` markieren.
- **Keine externen Laufzeit-Abhängigkeiten:** keine CDNs, Fonts, Analytics oder APIs. Die CSP erlaubt nur `'self'`; E2E-Tests prüfen, dass keine fremden Origins angefragt werden und die CSP fremde Anfragen blockiert.
- **UI-Texte** nur in `src/lib/i18n/de.json`, nie hart im Komponentencode. Ton: Du-Form, Sätze unter 20 Wörtern, kein Druck, keine roten Warnungen, keine Streaks.
- **Barrierefreiheit:** WCAG 2.2 AA, Touch-Ziele ≥ 44 px (`--touch-target`), `prefers-reduced-motion`, Hell- und Dunkelmodus. axe-core in E2E muss fehlerfrei sein.
- **Am Ende jeder Phase:** README aktualisieren, offene Punkte als GitHub-Issues formulieren, Einsteigeraufgaben mit `good first issue` markieren.

## graphify

[Graphify](https://github.com/Graphify-Labs/graphify) (PyPI `graphifyy`) hält einen Wissensgraphen des Codes in `graphify-out/`: Module, Funktionen, Aufrufe und Importe über Dateigrenzen hinweg. Er erspart das erneute Erkunden der App in jeder Sitzung.

`graphify-out/` ist gitignored und wird nicht committet. Der Graph ist ein Build-Produkt, das bei jedem Bau komplett neu geschrieben wird. `.claude/hooks/graphify-session-start.sh` baut ihn zu Beginn jeder Sitzung aus dem aktuellen Checkout: nur AST (`--code-only`, lokales tree-sitter, offline, kein API-Key). In Cloud-Sitzungen installiert der Hook die gepinnte Version selbst (nur fertige Wheels). Lokal läuft er nur, wenn `graphify` schon installiert ist, und installiert nie etwas. `graphify hook install` hält den Graphen per Git-Hooks auch zwischen Sitzungen aktuell.

Regeln:

- Wenn `graphify-out/graph.json` existiert: vor dem ersten Grep, der ersten Suche oder dem ersten Lesen von Quelldateien zu einer Codefrage `graphify query "<Frage>"` ausführen. Diese Regel in jeden Subagent-Prompt übernehmen, der Code erkundet. Rohdateien nur für Stellen lesen, die der Graph oder ein früherer Read schon gefunden hat.
- Abfragen treffen Bezeichner aus dem Code, keine deutschen Sätze: `graphify query "contact repository save"` statt „Wie wird ein Kontakt gespeichert?“.
- `graphify path "<A>" "<B>"` für Beziehungen, `graphify explain "<Name>"` für einzelne Dateien oder Funktionen. Beide liefern einen kleinen Teilgraphen statt ganzer Dateien.
- `graphify-out/GRAPH_REPORT.md` nur für einen breiten Architekturüberblick lesen. Die Bereiche darin sind unbenannt (`--no-label`, Benennen bräuchte ein LLM-Backend).
- Nach Codeänderungen `graphify update .` ausführen, damit spätere Abfragen derselben Sitzung die Änderung sehen (nur AST, offline, keine API-Kosten). `graphify-out/` nie committen.
- Installation: `uv tool install graphifyy` (oder `pipx install graphifyy`). Die Hooks in `.claude/settings.json` tun nichts und enden still, solange `graphify` fehlt. Die `PreToolUse`-Hooks (`.claude/hooks/graphify-guard.sh`) ergänzen nur einen Hinweis, sie blockieren nie.
