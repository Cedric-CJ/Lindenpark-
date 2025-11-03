<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View app in AI Studio: https://ai.studio/apps/drive/1jN8AGEySGsfBDqE5EV3t2N12S28UMurM

View in Mendix: https://sprintr.home.mendix.com/link/team/375cb9d9-e1fc-43a7-a744-6bf10b84aad6

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


# Einsatzplanung Lindenpark

## Use Case: Digitale Einsatzplanung für ein Bürgerzentrum

Das Bürgerzentrum Lindenpark ist eine kommunale Einrichtung, die verschiedene Dienstleistungen für die Stadtverwaltung und die Bürgerinnen und Bürger anbietet – darunter Veranstaltungsorganisation, Informationsdienste, Bürgerberatung und technische Unterstützung bei öffentlichen Events. Bisher wurden die Einsätze der Mitarbeitenden in diesen Bereichen manuell in Excel-Listen geführt. Dadurch kam es regelmäßig zu Überschneidungen, Fehlplanungen und unklaren Vertretungsregelungen.

Ziel des Projekts ist die Entwicklung einer zentralen, webbasierten Anwendung, mit der das Bürgerzentrum seine Personaleinsätze planen, dokumentieren und auswerten kann. Über die Anwendung sollen die Teams, Mitarbeitenden und Aufgabenbereiche verwaltet werden. Jeder Mitarbeitende gehört einem bestimmten Team an (z. B. Veranstaltungsservice, IT-Support, Bürgerberatung) und kann für einzelne Dienste oder Veranstaltungen eingeteilt werden.

Die App soll es ermöglichen, Dienste und Aufgaben als Zeitblöcke zu erstellen, Mitarbeitende diesen zuzuordnen und gleichzeitig offene Aufgaben sichtbar zu machen. Leitende Mitarbeitende (Teamleitungen) sollen schnell erkennen können, wo noch Personal fehlt, und entsprechende Einteilungen vornehmen. Zudem sollen Mitarbeitende ihre geplanten Einsätze selbst einsehen und bei Bedarf Änderungswünsche oder Vertretungsvorschläge einreichen können.

Zur Steuerung der Zugriffsrechte gibt es drei Rollen:
- **Administrator:innen** verwalten Stammdaten, Teams und Benutzerkonten.
- **Teamleitungen** planen und bearbeiten Einsätze innerhalb ihres Verantwortungsbereichs.
- **Mitarbeitende** können ihre Einsätze und den jeweiligen Status (geplant, bestätigt, abgeschlossen) einsehen.

Am Ende entsteht ein digitales Einsatzplanungssystem, das die organisatorischen Abläufe des Bürgerzentrums effizienter macht, die Zusammenarbeit zwischen den Teams stärkt und den Verwaltungsaufwand deutlich reduziert.

## Kernobjekte (mit beispielhaften Attributen)

- **Team**: TeamID, Name, Beschreibung, …
- **Mitarbeitende**: MitarbeiterID, Vorname, Nachname, E-Mail, Telefon, …
- **Rolle**: RollenID, Bezeichnung (Administrator, Teamleitung, Mitarbeitende), Beschreibung.
- **Standort/Ort**: OrtID, Bezeichnung, Adresse, Raum/Halle, …
- **Veranstaltung/Serviceobjekt (optional)**: EventID, Titel, Datum(e), Ort, Beschreibung.
- **Einsatz (Zeitblock)**: EinsatzID, Start, Ende, Team, Ort (oder Event), Einsatzart (Beratung, IT-Support, Veranstaltung), Soll-Besetzung (Zahl je Qualifikation), Status (geplant, offen, bestätigt, abgeschlossen), …
- **Zuweisung (Einsatz ↔ Mitarbeitende)**: ZuweisungsID, Einsatz, Mitarbeitende/r, Rolle im Einsatz (z. B. Teamlead, Support), Status (vorgeschlagen, bestätigt, abgesagt), Kommentar.

### Beziehungen (fachlich)

- **Team 1—n Mitarbeitende**: Jede/r Mitarbeitende gehört genau einem Haupt-Team an.
- **Team 1—n Einsatz**: Einsätze werden von einem Team verantwortet.
- **Einsatz 1—n Zuweisung n—1 Mitarbeitende**: Ein Einsatz kann mehrere Personen brauchen; Personen können mehrere Einsätze haben (Überlappungen sind fachlich zu prüfen).
- **Einsatz n—1 Ort**: räumlicher Bezug, wichtig für parallele Belegung.
- **Mitarbeitende n—m Rolle**: systemisch/fachlich zur Rechte- und Aufgabensteuerung.