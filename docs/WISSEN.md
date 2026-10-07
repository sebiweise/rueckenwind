# Rückenwind – Wissensstand

Stand: 08.10.2026. Dieses Dokument sammelt Fachwissen, Projektkontext und offene Entscheidungen. Es ist die einzige Quelle für Infotexte in der App. Alles Fachliche muss vor einem Release fachkundig geprüft werden; Regeln können sich ändern.

## 1. Projektkontext

- Persönliches Open-Source-Projekt, Ziel: das öffentliche GitHub-Profil erweitern und etwas Nützliches für psychisch belastete Menschen bauen.
- Idee entstand aus einer Sammlung von Projektideen (Home Assistant, mentale Gesundheit, Feuerwehr/Zivilschutz). Gewählt wurde die Therapieplatzsuche.
- Kernidee: Ein Tool, das Betroffene ungezwungen, aber klar begleitet, mit Informationen versorgt und Organisation, Planung und den gesamten Weg sauber dokumentiert – ohne Formulare abzufragen.
- Umsetzung: mit Claude Code, nach `PLAN.md`.

## 2. Der Weg zur ambulanten Psychotherapie (GKV)

### Begriffe

| Begriff | Bedeutung |
| --- | --- |
| Psychotherapeutische Sprechstunde | Erstes Gespräch zur Abklärung. Vor einer Richtlinientherapie verpflichtend. Kassenpraxen müssen Sprechstunden anbieten. |
| Terminservicestelle (TSS) | Vermittelt über 116 117 (Telefon oder online) Termine für Sprechstunde, Akutbehandlung und zeitnah erforderliche probatorische Sitzungen. Keine Vermittlung eines festen Langzeit-Therapieplatzes. |
| PTV 11 | Formular, das nach der Sprechstunde ausgehändigt wird. Enthält die Empfehlung, z. B. „ambulante Psychotherapie“ und „zeitnah erforderlich“. Wichtig für TSS und Kostenerstattung. |
| Akutbehandlung | Kurzfristige Behandlung zur Stabilisierung in akuten Krisen, über TSS vermittelbar. |
| Probatorische Sitzungen | Probesitzungen vor Beginn der eigentlichen Therapie, um zu prüfen, ob es passt. |
| Richtlinienverfahren | Von der GKV bezahlte Verfahren: Verhaltenstherapie, tiefenpsychologisch fundierte Psychotherapie, analytische Psychotherapie, systemische Therapie (Erwachsene). |
| Ausbildungsinstitute | Ambulanzen von Ausbildungsinstituten behandeln GKV-Versicherte oft mit kürzerer Wartezeit (Therapeut:innen in Ausbildung unter Supervision). |
| Kostenerstattungsverfahren | Nach § 13 Abs. 3 SGB V: Wenn die Kasse keine zeitnahe Behandlung sicherstellen kann („Systemversagen“), kann sie die Kosten einer Privatpraxis (approbiert, Richtlinienverfahren) übernehmen. |

### Etappen in der App

1. **Orientierung** – Was ist Psychotherapie, was zahlt die Kasse, wie läuft der Weg ab.
2. **Sprechstunde** – selbst bei einer Praxis buchen oder über 116 117; PTV 11 aufbewahren.
3. **Platzsuche** – Kassenpraxen anrufen, Telefonzeiten nutzen, Wartelisten eintragen, alles notieren. Parallel TSS nutzen.
4. **Plan B** – Akutbehandlung, Ausbildungsinstitute, Kostenerstattung bei Privatpraxen.
5. **Antrag Kostenerstattung** – Unterlagen sammeln, Antrag vor Therapiebeginn stellen.

### Kostenerstattung: typische Unterlagen

Die Anforderungen sind nicht bundesweit einheitlich geregelt und unterscheiden sich je nach Kasse. Typisch sind:

- Liste erfolgloser Anfragen bei Kassenpraxen mit Datum, Name der Praxis und voraussichtlicher Wartezeit. Je nach Kasse ab etwa 5, teils deutlich mehr (häufig genannt: 5–10).
- Nachweis, dass die Terminservicestelle kontaktiert wurde. Manche Kassen verweisen für den Nachweis ausdrücklich auf die TSS.
- PTV 11 mit Empfehlung „zeitnah erforderlich“ und/oder Dringlichkeits-/Notwendigkeitsbescheinigung (Hausarzt oder Psychiater).
- Eine approbierte Privatpraxis, die ein Richtlinienverfahren anbietet und zur Behandlung bereit ist (oft mit eigenem Antrag/Bericht).
- Antrag vor Beginn der Therapie stellen, Unterlagen am besten per Einschreiben oder persönlich abgeben.
- Bei Ablehnung ist ein schriftlicher Widerspruch möglich und lohnt sich laut Berufsverbänden oft.

**Für die App gilt:** Keine feste Zahl versprechen, nur Orientierung („häufig 5–10, frag am besten bei deiner Kasse nach“). Keine Erfolgsgarantie.

### Aktuelle Entwicklungen (beobachten)

- Ab 2027 ändern sich die Vergütungsregeln für ambulante Psychotherapie; Psychotherapie soll wieder budgetiert werden. Der Leistungsanspruch der Versicherten bleibt laut aktuellem Stand bestehen.
- Eine 2026 beschlossene Honorarkürzung ist gerichtlich vorläufig ausgesetzt. Mögliche Folgen für Wartezeiten sind offen.
- Konsequenz: Inhalte mit `lastReviewed` versehen und regelmäßig prüfen.

### Krisenhilfe (für Krisenseite)

- Notruf: 112
- Telefonseelsorge: 0800 111 0 111 und 0800 111 0 222, kostenfrei, rund um die Uhr; auch Chat und Mail über telefonseelsorge.de
- Psychiatrische Notaufnahme / Klinik in der Nähe
- Grundsatz: Bei akuter Selbst- oder Fremdgefährdung nicht auf Sprechstunde oder Kostenerstattung warten, sondern sofort Hilfe holen.
- Keine Aussagen über Vertraulichkeit oder Einbindung von Behörden machen.

## 3. Getroffene Entscheidungen

- Wegbegleiter statt Formular; Erfassung in einer Zeile, Freitext-Parser plus Schnellbuttons.
- Absagen werden als Fortschritt dargestellt.
- Lokal-first: kein Account, kein Server, keine Analytics; Export/Import als Datei.
- Krisen-Button auf jedem Screen.
- Infotexte als Markdown im Repo, Community-pflegbar per Pull Request.
- Keine Rechts- oder Medizinberatung, keine Diagnosefunktionen (MDR-Abgrenzung).
- MVP: Etappen-Inhalte, Schnellerfassung, Kontaktliste, Nachweis-PDF, Export/Import.
- Zielgruppe MVP: erwachsene gesetzlich Versicherte.
- Name: **Rückenwind** (vorläufig), Untertitel „Rückenwind – Therapieplatz finden“, Repo `rueckenwind`.
- Framework: Next.js + TypeScript mit statischem Export (entschieden am 07.10.2026).

## 4. Offene Entscheidungen

| Thema | Stand |
| --- | --- |
| Markenrecherche „Rückenwind“ | Offen. Bisher nur eine Radreisen-App gleichen Namens bekannt. DPMA und EUIPO (TMview) für Klassen 9 und 44 prüfen, vor dem ersten Release. |
| Farbpalette / Logo | Offen. Richtung: ruhig, warm, freundlich. |
| Impressum / Hosting-Domain | Offen, klärt der Projektinhaber. |
| Fachliche Prüfung | Ansprechperson (Psychotherapeut:in, Beratungsstelle) noch zu finden. |

## 5. Name

Entscheidung: **Rückenwind** – etwas, das dich unterstützt, ohne dich zu schieben. „Therapieweg“ wurde verworfen, weil es kalt und abschreckend wirkt. Die übrigen Kandidaten bleiben als Ausweichoptionen, falls die Markenrecherche ein Problem zeigt.

| Name | Idee dahinter |
| --- | --- |
| **Anlauf** | Jeder Anruf ist ein Anlauf und zählt. „Nimm Anlauf“ – Mut ohne Druck. Passt genau zum Kernmechanismus. |
| **Rückenwind** | Etwas, das dich unterstützt, ohne dich zu schieben. Sehr positiv. |
| **Schrittweise** | Betont das Tempo: ein kleiner Schritt nach dem anderen. |
| **Andocken** | Bild vom Ankommen an einem sicheren Ort. |
| **Brückenzeit** | Begleitet durch die Wartezeit bis zur Therapie. |
| **Wegbegleiter** | Warm und klar, aber eher generisch. |

Erste Ausweichoption: Anlauf.

## 6. Quellen

- [biallo.de – Psychotherapie: Kostenerstattung für Privatpraxen](https://www.biallo.de/soziales/ratgeber/psychotherapie-kostenerstattung-krankenkasse/)
- [therapie.de – Psychotherapie per Kostenerstattung](https://www.therapie.de/psyche/info/fragen/wichtigste-fragen/psychotherapie-kostenerstattung/)
- [krankenkasseninfo.de – Kein Therapieplatz in Sicht?](https://www.krankenkasseninfo.de/ratgeber/62714/kein-therapieplatz-in-sicht-diese-moeglichkeiten-sind-oft-nicht-bekannt.html)
- [betanet.de – Fallbeispiel Kostenerstattung](https://www.betanet.de/kostenerstattung-psychotherapie-privatpraxis.html)
- [DPtV – Patienteninformation Kostenerstattung (PDF)](https://kjp-dauch.de/portfolio/kosten/DPtV-Faltblatt_Kosten.pdf)
- [Psychotherapeutenkammer Berlin – Außervertragliche Psychotherapie](https://psychotherapeutenkammer-berlin.de/media/1923)
