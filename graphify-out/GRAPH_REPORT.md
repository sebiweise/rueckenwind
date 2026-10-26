# Graph Report - rueckenwind  (2026-10-26)

## Corpus Check
- 136 files · ~37,142 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 8, .properties 1, .css 1)

## Summary
- 885 nodes · 1891 edges · 55 communities (49 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9773cf93`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- JourneyView.tsx
- t
- Icons.tsx
- parser.ts
- with
- @playwright/test
- app/layout.tsx
- with
- install/hooks.ts
- pages.yml
- ContactsView.tsx
- ProofExport.tsx
- progress.ts
- backup.ts
- steps
- devDependencies
- compilerOptions
- dependencies
- repository.ts
- inhalt-korrigieren.yml
- scripts
- getDb
- body
- package.json
- QuickCapture.tsx
- Rückenwind – Wissensstand
- body
- README.md
- Rückenwind – Umsetzungsplan
- Rückenwind – Therapieplatz finden
- rueckenwind
- react
- Umsetzungsschritte
- eslint.config.mjs
- @serwist/next
- CLAUDE.md
- Verhaltenskodex
- contact_links
- Changelog
- etappe-1-orientierung.md
- etappe-3-platzsuche.md
- etappe-5-antrag.md
- hinweis.md
- ueber.md
- Mitmachen bei Rückenwind
- etappe-2-sprechstunde.md
- etappe-4-plan-b.md
- krise.md
- vitest
- pull_request_template.md
- repository
- prettier.config.js
- AGENTS.md
- hilfen.md
- components/README.md

## God Nodes (most connected - your core abstractions)
1. `t()` - 76 edges
2. `Svg()` - 27 edges
3. `getDb()` - 26 edges
4. `next` - 25 edges
5. `QuickCapture()` - 20 edges
6. `vitest` - 18 edges
7. `ContentView()` - 18 edges
8. `PracticeCard()` - 17 edges
9. `APP_NAME` - 17 edges
10. `DataSettings()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Tech-Stack` --references--> `t()`  [INFERRED]
  CLAUDE.md → src/lib/i18n/index.ts
- `Datenhaltung` --references--> `recordContact()`  [INFERRED]
  src/lib/data/README.md → src/lib/data/repository.ts
- `Domäne` --references--> `ContactResult`  [INFERRED]
  src/lib/domain/README.md → src/lib/domain/types.ts
- `addCsp()` --calls--> `contentSecurityPolicy()`  [EXTRACTED]
  scripts/postbuild.mjs → src/lib/csp.ts
- `Datenhaltung` --references--> `createDb()`  [INFERRED]
  src/lib/data/README.md → src/lib/data/db.ts

## Import Cycles
- None detected.

## Communities (55 total, 6 thin omitted)

### Community 0 - "JourneyView.tsx"
Cohesion: 0.08
Nodes (53): dynamicParams, generateMetadata(), Props, StagePage(), Props, CheckIcon(), PhoneIcon(), JourneyView() (+45 more)

### Community 1 - "t"
Cohesion: 0.10
Nodes (39): next, JourneyPage(), metadata, DataPage(), metadata, GUIDES, InstallPage(), metadata (+31 more)

### Community 2 - "Icons.tsx"
Cohesion: 0.08
Nodes (43): metadata, Page, metadata, Page, metadata, Page, AppLayout(), HELP (+35 more)

### Community 3 - "parser.ts"
Cohesion: 0.08
Nodes (38): correctTypos(), DURATION, durationConfidence(), findTime(), foldToken(), isStopToken(), KEYWORDS, NAME_MARKERS (+30 more)

### Community 4 - "with"
Cohesion: 0.06
Nodes (40): name, runs-on, steps, concurrency, cancel-in-progress, group, name, runs-on (+32 more)

### Community 5 - "@playwright/test"
Cohesion: 0.07
Nodes (12): PAGES, @axe-core/playwright@^4.13.0, @playwright/test@^1.64.0, @axe-core/playwright, @playwright/test, icons, categories, dir (+4 more)

### Community 6 - "app/layout.tsx"
Cohesion: 0.10
Nodes (22): nextConfig, securityHeaders, addCsp(), htmlFiles(), pages, metadata, RootLayout(), viewport (+14 more)

### Community 7 - "with"
Cohesion: 0.06
Nodes (34): concurrency, cancel-in-progress, group, name, runs-on, steps, jobs, image (+26 more)

### Community 8 - "install/hooks.ts"
Cohesion: 0.15
Nodes (26): ShareIcon(), InstallBanner(), later(), InstallStatus(), readStandalone(), readStorage(), serverFalse(), serverNull() (+18 more)

### Community 9 - "pages.yml"
Cohesion: 0.06
Nodes (32): runs-on, steps, concurrency, cancel-in-progress, group, environment, needs, runs-on (+24 more)

### Community 10 - "ContactsView.tsx"
Cohesion: 0.19
Nodes (20): AttemptRow(), PracticeCard(), PracticeMenu(), PracticeValues, ClockIcon(), PracticeAvatar(), practiceInitials(), deleteAttempt() (+12 more)

### Community 11 - "ProofExport.tsx"
Cohesion: 0.18
Nodes (16): pdfmake, ProofExport(), create(), listAttempts(), listPractices(), attemptPeriod(), formatDate(), createPdfBlob() (+8 more)

### Community 12 - "progress.ts"
Cohesion: 0.15
Nodes (18): Overrides, ContactRecord, ParsedContact, COUNTED_RESULTS, EXPORT_REMINDER_AFTER, MAX_PEBBLES, OPEN_PEBBLES, PAUSE_AFTER_REJECTIONS (+10 more)

### Community 13 - "backup.ts"
Cohesion: 0.13
Nodes (20): attemptSchema, createExport(), EXPORT_APP_ID, ExportFile, exportFileName(), exportSchema, hasData(), importData() (+12 more)

### Community 14 - "steps"
Cohesion: 0.11
Nodes (18): GH_TOKEN, jobs, release, name, permissions, contents, tags, runs-on (+10 more)

### Community 15 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, esbuild@^0.28.2, pdfjs-dist@^6.4.299, prettier@^3.9.9, @serwist/cli@^9.5.13, @types/node@^22.20.5, @types/pdfmake@^0.3.3, @types/react@^19.3.0 (+11 more)

### Community 16 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 17 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, dexie@^4.4.6, dexie-react-hooks@^4.4.0, @fontsource-variable/nunito@^5.3.0, marked@^18.1.0, next@^16.4.0, pdfmake@^0.3.11, react-dom@^19.3.0 (+9 more)

### Community 18 - "repository.ts"
Cohesion: 0.21
Nodes (12): DB_NAME, RueckenwindDb, SCHEMA_VERSION, AttemptInput, PracticeInput, Domäne, Freitext-Parser, Zählregel (+4 more)

### Community 19 - "inhalt-korrigieren.yml"
Cohesion: 0.13
Nodes (14): description, label, placeholder, value, body, attributes, id, type (+6 more)

### Community 20 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, build:static, check, dev, format, lint, postbuild (+7 more)

### Community 21 - "getDb"
Cohesion: 0.25
Nodes (13): DataSettings(), deleteAll(), exportFile(), importFile(), loadBackup(), TrashIcon(), UploadIcon(), createDb() (+5 more)

### Community 22 - "body"
Cohesion: 0.15
Nodes (12): label, placeholder, value, body, attributes, id, type, validations (+4 more)

### Community 23 - "package.json"
Cohesion: 0.15
Nodes (12): description, fake-indexeddb@^6.2.5, @types/react-dom@^19.3.0, engines, node, license, name, private (+4 more)

### Community 24 - "QuickCapture.tsx"
Cohesion: 0.23
Nodes (10): Chip(), ChipProps, Editor, QUICK_RESULTS, QuickCapture(), close(), save(), findPracticeByName() (+2 more)

### Community 25 - "Rückenwind – Wissensstand"
Cohesion: 0.17
Nodes (12): 1. Projektkontext, 2. Der Weg zur ambulanten Psychotherapie (GKV), 3. Getroffene Entscheidungen, 4. Offene Entscheidungen, 5. Name, 6. Quellen, Aktuelle Entwicklungen (beobachten), Begriffe (+4 more)

### Community 26 - "body"
Cohesion: 0.17
Nodes (11): label, value, body, attributes, id, type, validations, description (+3 more)

### Community 27 - "README.md"
Cohesion: 0.22
Nodes (3): Aufbau einer Datei, Infotexte (Deutsch), Regeln

### Community 28 - "Rückenwind – Umsetzungsplan"
Cohesion: 0.18
Nodes (11): Arbeitsanweisungen für Claude Code, Backlog nach dem MVP, Datenmodell, Datenschutz, Recht, Risiken, Entscheidungen und Leitprinzipien, Fachlicher Hintergrund (Kurzfassung), Funktionsumfang MVP, Rückenwind – Umsetzungsplan (+3 more)

### Community 29 - "Rückenwind – Therapieplatz finden"
Cohesion: 0.18
Nodes (11): Datenschutz-Versprechen, Entwicklung, Hinweis, Hosting, Lizenz, Mitmachen, Projektstruktur, Rückenwind – Therapieplatz finden (+3 more)

### Community 30 - "rueckenwind"
Cohesion: 0.22
Nodes (8): build, image, ports, read_only, restart, tmpfs, services, rueckenwind

### Community 31 - "react"
Cohesion: 0.31
Nodes (6): react@^19.3.0, react, noSubscription(), ReviewNotice(), isReviewOverdue(), REVIEW_INTERVAL_MONTHS

### Community 32 - "Umsetzungsschritte"
Cohesion: 0.25
Nodes (8): Phase 0 – Repo-Fundament, Phase 1 – Domänenlogik, Phase 2 – Datenhaltung, Phase 3 – Inhalte, Phase 4 – Kern-UI, Phase 5 – Nachweis-PDF, Phase 6 – PWA, Feinschliff, Release, Umsetzungsschritte

### Community 33 - "eslint.config.mjs"
Cohesion: 0.29
Nodes (6): eslint@^9.39.5, eslint-config-next@^16.4.0, eslint-config-prettier@^10.1.8, eslint, eslint-config-next, eslint-config-prettier

### Community 34 - "@serwist/next"
Cohesion: 0.29
Nodes (6): serwist@^9.5.13, @serwist/next@^9.5.13, serwist, @serwist/next, serwist, WorkerGlobalScope

### Community 35 - "CLAUDE.md"
Cohesion: 0.33
Nodes (5): Arbeitsweise, Befehle, Leitprinzipien, Struktur, Tech-Stack

### Community 36 - "Verhaltenskodex"
Cohesion: 0.33
Nodes (6): Durchsetzung, Erwünschtes Verhalten, Krisen, Nicht akzeptiert, Unser Versprechen, Verhaltenskodex

### Community 37 - "contact_links"
Cohesion: 0.33
Nodes (5): blank_issues_enabled, contact_links, about, name, url

### Community 38 - "Changelog"
Cohesion: 0.40
Nodes (5): [0.1.0] – noch offen, Changelog, Neu, [Unveröffentlicht], Verbessert

### Community 39 - "etappe-1-orientierung.md"
Cohesion: 0.40
Nodes (4): Gut zu wissen, Was sind probatorische Sitzungen?, Welche Verfahren zahlt die Kasse?, Wie läuft der Weg ab?

### Community 40 - "etappe-3-platzsuche.md"
Cohesion: 0.40
Nodes (4): Telefonzeiten nutzen, Terminservicestelle parallel nutzen, Was du notieren solltest, Wie viele Anfragen brauche ich?

### Community 41 - "etappe-5-antrag.md"
Cohesion: 0.40
Nodes (4): Keine Garantie, So gibst du den Antrag ab, Typische Unterlagen, Wenn der Antrag abgelehnt wird

### Community 42 - "hinweis.md"
Cohesion: 0.40
Nodes (4): Fehler gefunden?, Was Rückenwind ist, Was Rückenwind nicht ist, Wie aktuell sind die Infos?

### Community 43 - "ueber.md"
Cohesion: 0.40
Nodes (4): Deine Daten, Für wen ist Rückenwind?, Geteiltes Gerät, Mitmachen

### Community 44 - "Mitmachen bei Rückenwind"
Cohesion: 0.40
Nodes (5): Bitte keine persönlichen Daten, Code beitragen, Einsteigeraufgaben, Infotexte korrigieren, Mitmachen bei Rückenwind

### Community 45 - "etappe-2-sprechstunde.md"
Cohesion: 0.50
Nodes (3): Was macht die Terminservicestelle?, Was passiert in der Sprechstunde?, Was steht auf dem PTV 11?

### Community 46 - "etappe-4-plan-b.md"
Cohesion: 0.50
Nodes (3): Akutbehandlung, Ausbildungsinstitute, Kostenerstattung bei einer Privatpraxis

### Community 47 - "krise.md"
Cohesion: 0.50
Nodes (3): Notruf, Psychiatrische Notaufnahme, Telefonseelsorge

### Community 50 - "repository"
Cohesion: 0.67
Nodes (3): repository, type, url

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `t` to `JourneyView.tsx`, `Icons.tsx`, `CLAUDE.md`, `app/layout.tsx`, `install/hooks.ts`, `ContactsView.tsx`, `ProofExport.tsx`, `getDb`, `QuickCapture.tsx`, `react`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **Should `JourneyView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07869742198100407 - nodes in this community are weakly interconnected._
- **Why does `Tech-Stack` connect `CLAUDE.md` to `t`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.09962406015037593 - nodes in this community are weakly interconnected._
- **Why does `next` connect `t` to `JourneyView.tsx`, `Icons.tsx`, `app/layout.tsx`, `install/hooks.ts`, `dependencies`, `package.json`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Should `Icons.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07727272727272727 - nodes in this community are weakly interconnected._
- **Should `parser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08478513356562137 - nodes in this community are weakly interconnected._