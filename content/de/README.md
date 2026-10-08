# Infotexte (Deutsch)

Hier liegen die Infotexte als Markdown. Sie werden beim Build in die App gerendert. Ein Test prüft jede Datei.

| Datei                     | Seite                                             |
| ------------------------- | ------------------------------------------------- |
| `etappe-<n>-<name>.md`    | Etappe 1–5 unter `/etappe/<n>/`                   |
| `krise.md`                | Krisenhilfe (`/krise/`)                           |
| `hinweis.md`              | Disclaimer (`/hinweis/`)                          |
| `ueber.md`                | Über die App (`/ueber/`)                          |
| `hilfen.md`               | Nützliche Hilfen, externe Angebote (`/hilfen/`)   |
| `impressum.md` (optional) | wird auf der Über-Seite angehängt, wenn vorhanden |

## Aufbau einer Datei

```yaml
---
title: Sprechstunde
stage: 2 # nur bei Etappen
summary: Kurztext, höchstens etwa fünf Sätze. Immer sichtbar.
lastReviewed: 2026-10-08
sources:
  - https://…
steps: # nur bei Etappen: kleine Aufgaben, die die Startseite vorschlägt
  - id: sprechstunde-termin # stabil halten, gespeicherte Fortschritte hängen daran
    title: Vereinbare einen Termin für eine Sprechstunde.
---
## Überschrift

Jeder Abschnitt mit `##` wird bei Etappen zu einem aufklappbaren Detail.
```

## Regeln

- Inhalte stammen nur aus [docs/WISSEN.md](../../docs/WISSEN.md) oder seriösen Quellen; Quellen ins Frontmatter.
- Du-Form, Sätze unter 20 Wörtern, keine Paragrafen im Fließtext ohne Erklärung, keine festen Absagenzahlen.
- Unsichere Aussagen mit `<!-- TODO: fachlich prüfen -->` markieren. Kommentare erscheinen nicht in der App.
- Nach einer inhaltlichen Prüfung `lastReviewed` aktualisieren. Nach 12 Monaten ohne Prüfung zeigt die App einen Hinweis.

Lizenz: [CC BY-SA 4.0](../LICENSE).
