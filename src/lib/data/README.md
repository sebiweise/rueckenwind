# Datenhaltung

Lokale Speicherung in IndexedDB über Dexie.js. Nichts davon verlässt das Gerät.

| Datei           | Inhalt                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| `db.ts`         | Dexie-Datenbank `rueckenwind`, Schema-Version 1 (`practices`, `attempts`, `journey`)                   |
| `repository.ts` | CRUD für Praxen, Kontaktversuche und den Weg; `recordContact()` für die Schnellerfassung; `clearAll()` |
| `backup.ts`     | JSON-Export, Import mit zod-Validierung, Dateiname für die Sicherung                                   |

Alle Funktionen bekommen die Datenbank als ersten Parameter. In der App kommt sie aus `getDb()`, in Tests aus `createDb()` mit `fake-indexeddb`.

## Schema ändern

Jede Änderung bekommt einen neuen `db.version(n)`-Block mit Migration (`.upgrade()`), alte Blöcke bleiben stehen. `SCHEMA_VERSION` hochzählen und den Import so erweitern, dass ältere Sicherungen weiter lesbar sind.

## Export-Format

```json
{
	"app": "rueckenwind",
	"schemaVersion": 1,
	"exportedAt": "…",
	"practices": [],
	"attempts": [],
	"journey": {}
}
```

Der Import prüft das ganze Format und lehnt fremde, beschädigte oder neuere Dateien ab, ohne etwas zu verändern. Er ersetzt alle vorhandenen Daten; die Oberfläche fragt vorher nach.
