# Domäne

Reine Logik ohne Framework-Abhängigkeit. Kein Import aus `react`, `next` oder `../data`. Wird vollständig mit Vitest getestet (CI prüft ≥ 90 % Abdeckung mit `npm run test:coverage`).

| Datei         | Inhalt                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------- |
| `types.ts`    | Datenmodell aus PLAN.md: `Practice`, `ContactAttempt`, `JourneyState`, `ContactResult`        |
| `parser.ts`   | `parseContactInput(text)`: Freitext → Praxis, Ergebnis, Wartezeit, Kanal, Datum mit Konfidenz |
| `progress.ts` | Zählregel für den Nachweis, Fortschritt, Pausen-Hinweis, Export-Erinnerung                    |
| `stages.ts`   | Etappenlogik: nächste Aufgabe, Vorschlag für die Etappe                                       |
| `text.ts`     | Normalisierung (Umlaute, Groß-/Kleinschreibung) und Tippfehler-Toleranz                       |

## Freitext-Parser

Der Parser arbeitet nur mit Regeln, lokal und ohne Netz. Er wirft nie und gibt für jedes Feld eine Konfidenz zwischen 0 und 1 zurück, damit die Oberfläche unsichere Felder zur Korrektur anbieten kann.

- **Praxisname:** ab einem Signalwort („Praxis“, „Dr.“, „Frau“, „Herr“, „Institut“ …) bis zum ersten Schlüsselwort, sonst der Text vor dem ersten Komma.
- **Ergebnis:** Schlüsselwörter, die spezifischsten zuerst. „keine Warteliste“ ist eine Absage, „AB voll“ heißt nicht erreicht. Bei Gleichstand gewinnt das konkretere Ergebnis (Termin vor Warteliste vor Rückruf vor Absage vor AB vor nicht erreicht).
- **Wartezeit:** „8 Monate“, „6 Wo“, „ein Jahr“, „1,5 Jahre“, „halbes Jahr“, „3–4 Monate“ (obere Grenze). Normalisiert auf Wochen.
- **Tippfehler:** Schlüsselwörter werden bis zu einem Fehler erkannt („Wartelsite“, „abasge“, „ruckruf“).

Neue Formulierungen? Bitte als Testfall in `parser.spec.ts` ergänzen.

## Zählregel

Für den Nachweis zählen `rejected`, `waitlist` und `not_reached` bei Kassenpraxen. Jede Praxis zählt einmal, egal wie oft sie angerufen wurde; eine Praxis, die später einen Termin gegeben hat, zählt nicht. Das PDF listet trotzdem alle Versuche. Die Orientierung „häufig 5–10“ ist kein Ziel und kein Versprechen.
