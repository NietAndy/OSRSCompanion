# OSRS Companion – roadmap (voor ons)

Bijgewerkt 2026-10-25. Werkdocument voor de gebruiker en Claude. Een bewerkbare kopie staat als Claude Doc; deze file is wat Claude aan het begin van een sessie leest.

## 1. Werkafspraken
- Eén release per vrijdag, kleine versiestappen (0.5.x). Extra cijfer = hotfix (0.5.16.1). Middelgrote stap (0.6, 0.7) alleen als opslag of naam verandert.
- Elke wijziging: aanpassen, testen in Linux-Chromium met mocks, exe bouwen, sturen, `RELEASE-NOTES-x.y.z.md` in de repo.
- Claude test niet op Windows; de gebruiker wel. Dat bepaalt de bufferweken.
- Releasetag `vX.Y.Z`, titel "Weekly update <dag> <datum> (X.Y.Z)", bijvoorbeeld "Weekly update zaterdag 25 oktober (0.5.16.3)". De tag bepaalt de versie, de titel is voor mensen en voor Discord. Het bestand moet op .exe eindigen.
- Release notes bevatten alleen wat er gewijzigd is (Nieuw, Opgelost, Verbeterd). Geen kopje "Let op" met beperkingen of "niet getest"; die melding gaat alleen in het gesprek.
- Alleen Windows. Niets betaalds. Geen automatisering of uitlezen van het spel (Jagex).
- Gegevens van OSRS Wiki, Shortest Path (BSD) en RuneLite (BSD), met bron.
- `package.json`: driedelig `version` plus eigen `appVersie`; de updater leest `appVersie`.

### Wekelijkse controle op nieuwe OSRS-inhoud (elke vrijdag, vóór het bouwen)
Doel: alles wat Jagex uitbrengt komt ook in de app. Elke vrijdag loop ik de lijst hieronder langs en zet wat nieuw is in de release van die week. Is er niets nieuw, dan staat dat in de releasenotities.
1. **Nieuws:** de laatste OSRS-nieuwsberichten en de updatepost van de week (nieuwe content, aanpassingen aan bestaande content, balanswijzigingen).
2. **Quests en miniquests:** nieuwe quests en wijzigingen in eisen of beloningen. Aantal in de app vergelijken met de wiki (nu 184 quests).
3. **Items:** nieuwe handelbare items voor de Grand Exchange-lijst en de prijzen, plus nieuwe uitrusting voor Gear en Schade.
4. **Skills en bronnen:** nieuwe trainingsmethoden, vispotten, ertsen, bomen, patches en altaren; wijzigingen in levelsvereisten.
5. **Monsters en drops:** nieuwe bazen en vijanden, aangepaste drops en drop-kansen, nieuwe pets.
6. **Kaart en vervoer:** nieuwe gebieden, teleports, shortcuts en banken.
7. **Achievement Diaries, clues en geld verdienen:** nieuwe taken, nieuwe cluestappen, aangepaste winstschattingen.
8. **Prijzen:** de momentopname van de Grand Exchange vernieuwen.
Regels: alleen wat ik op de wiki of bij de officiële nieuwsberichten kan nalezen; wat ik niet kan controleren, markeer ik als "niet gecontroleerd". Nieuwe plekken en levels komen met bron in de releasenotities. Wat te groot is voor één week gaat als eigen punt op de lijst.

## 2. Stand
Klaar: 0.5.19 (begrippen, automatische prijzen, grote prijsmelding, slepen, quest-volgorde, rondleiding, meld een probleem). Online op GitHub: controleer welke versie de gebruiker als laatste heeft gepubliceerd.
Gedaan sinds 0.5.7: Sailing-stappen, Achievement Diaries, Prijsmeldingen (#39), Skilling-planner (#38), nieuws als krant, kaart met producten en Runecraft-altaren, kaartopties als dropdowns, skill-icoontjes, Discord-setup en changelog-workflow, nieuwe naam Gielinor Guide (0.5.15), verkoopcalculator met slim zoeken (0.5.17 en 0.5.17.1), menu bovenin met uitklapmenu's en nieuw logo (0.5.17.1), kleinere kaart met positiebalk (0.5.17.2), nieuw startscherm met sleepbare blokken en verplicht inloggen met Discord (0.5.17.3 t/m 0.5.17.6). `handleiding/Mac.txt` is uit de repo.

## 3. Planning
| Vrijdag | Versie | Inhoud |
|---|---|---|
| 20 nov | 0.5.20 | Officiële icoontjes bij alle items, ook capes en uitrusting (zie 4c); zoeken met item-kaarten (4.129 GE-items); snellere opstart |
| 27 nov | 0.5.21 | Hunter-locaties; hiscores met "opgehaald om"; meer blokken voor het startscherm (Checklist, Nieuws, Live positie, Pets, Diaries) |
| 4 dec | 0.5.22 | Bufferweek |
| 18 dec | 0.6.2 | Buffer en opruimen; feestdagenrust |
| half jan | 0.7.1 | Vergelijken met spelers (#36) |
| eind jan | 0.8.0 | Over-pagina uitbreiden (rondleiding staat al in 0.5.19) |
| begin feb | 0.9.0 | Thema's en compacte modus |
| half feb | 0.9.5 | Bufferweek en opruimen |
| eind feb | 0.9.8 | Behaalde doelen verdwijnen vanzelf van het startscherm, met terughalen en een Afgerond-lijst (zie 4b) |
| begin mrt | 0.9.9-rc1 | Test op schone pc, updatetest |
| half mrt | 1.0.0 | Release met checksums |

Data na eind november zijn een schatting. Schuift iets, dan schuift het laatste item door; de afwerking blijft.

## 4. Na 1.0 (prioriteit A/B/C, moeite S/M/L)
- Verdere interface-uitbreidingen (meer thema's, de vier cijfers en de banner van het startscherm sleepbaar) – A, M
- Sneltoetsen en slimmer zoekveld – A, M
- Timers voor farm runs en birdhouses – A, M
- Collection log en Combat Achievements – A, M
- Ironman-modus – A, M
- Money-making vergelijker met live prijzen – A, M
- Code opdelen en automatische tests – A, L
- DPS-calculator met sets – B, M
- Slayer-hulp en boss-gids – B, L
- Clue-gids – B, M
- Quest-routes op de kaart – B, M
- Plannen delen – B, S
- Offline kopie van wiki-gegevens – B, M
- Engelse taal – B, M
- RuneLite-koppeling (officiële plugins) – C, L
- Synchronisatie tussen computers (alleen als er vraag naar is; vraagt een databasedienst, zie 4f) – C, L

## 4b. Startscherm: wat nog moet
Gedaan: banner met naam en volgende stap, blokken Mijn doel, Quests, Prijsmelding, Train hierna en Snel naar, slepen, pijltjes, verbergen en terugzetten (0.5.17.4). Nog te doen (0.9.8): een behaald doel verdwijnt vanzelf van het startscherm, met een felicitatie, een Afgerond-lijst, een schakelaar per blok (Verbergen als klaar / Laten staan) en Ongedaan maken. Ontwerpregels: de app kent alleen wat de gebruiker invult; "gehaald" is een afvinkmoment plus automatische controle; verdwijnen mag nooit verrassen en moet altijd terug te halen zijn. Het ontwerp met doel gehaald staat nog niet in Claude Design.

## 4c. Officiële item-icoontjes overal (0.5.20, wens van de gebruiker)
Doel: overal waar een item, cape of stuk uitrusting staat, het officiële icoontje uit het spel tonen (GE-lijst, recepten, drops, Gear, Schade, Geld verdienen, Quests, Skilling-planner, nieuws).
Aanpak (nog te bevestigen bij het bouwen):
- De prijs-API van de OSRS Wiki (`prices.runescape.wiki/api/v2/osrs/mapping`) geeft per verhandelbaar item de bestandsnaam van het icoon. Het plaatje komt dan van de wiki-afbeeldingenserver.
- Niet-verhandelbare items (capes zoals de max cape en skill capes, quest-beloningen, Diary-items): bestandsnaam afleiden van de itemnaam; waar dat niet lukt, valt de app terug op het huidige plaatje of een neutraal icoon.
- Plaatjes eenmalig ophalen en op schijf bewaren (cache), zodat de app daarna ook offline werkt en de wiki niet steeds wordt belast. Vooraf in de exe stoppen kan ik niet: mijn werkomgeving komt niet bij de wiki.
- Altijd een herkenbare User-Agent meesturen (de wiki vraagt dat). Eén aanvraag voor alle prijzen, nooit per item in een lus.
- Alleen de icoontjes van wat de gebruiker echt ziet laden (lui laden), anders wordt de opstart trager.
Aandachtspunten:
- Rechten: de icoontjes zijn kunst van Jagex. Het beleid voor fan-inhoud van Jagex vraagt een zichtbare vermelding ("Created using intellectual property belonging to Jagex Limited under the terms of Jagex's Fan Content Policy", met de mededeling dat het niet door Jagex is goedgekeurd). Volgens mijn samenvatting van dat beleid staan "companion- of gids-apps" ook in de lijst met dingen die niet mogen onder die licentie. Dat is niet door mij in de volledige tekst nagelezen. Eerst nalezen of Jagex mailen (IP@Jagex.com) voordat de app breder wordt gedeeld. Dit geldt nu extra, omdat de app via Discord met anderen gedeeld wordt.
- Zonder internet en zonder cache: terugvallen op het huidige plaatje.

## 4f. Inloggen met Discord (gebouwd in 0.5.17.3 t/m 0.5.17.6): zo werkt het
OAuth2 implicit grant met een localhost-terugkeer (`http://127.0.0.1:53682/callback`), scopes `identify` en `guilds`, geen client secret. De app haalt naam, avatar en serverlijst op, vergelijkt met de server van de uitnodiging (discord.gg/wbzVKyDaS, de server-ID wordt via de uitnodiging opgezocht) en gooit het token weg. Het resultaat staat ondertekend in `discord.json` in de gebruikersmap. Verplicht, opnieuw inloggen na 7 dagen. Instellingen in `discord-config.js`. Bewust niet: voortgang synchroniseren (blijft lokaal; back-up is de weg naar een andere pc), ranglijsten, rollen. De controle zit in de app en is door een bekwaam iemand te omzeilen; echt afdwingen kan alleen met een eigen server.

## 4d. Onderzoek 25 okt: wat bestaat er al en wat kan beter
Bekeken: de OSRS Wiki, RuneLite, Wise Old Man, TempleOSRS, GE Tracker, OSRS Toolkit, Theoatrix, OldSchool.tools. Bruikbare ideeën voor ons, met prioriteit en moeite:
- **Prijsgrafieken per item** (uur, dag, maand, jaar) via de prijs-API van de wiki; past bij de item-kaarten in 0.5.20 – A, M
- **Buy limits en high alch-winst** in de item-kaart (komt uit dezelfde mapping) – A, S
- **Buy limits-teller:** wanneer je weer mag kopen – B, M
- **Best in Slot en Gear-kiezer** per activiteit – B, L
- **Quest-helper-achtig overzicht:** volgorde voor de quest cape en wat je nog mist – A, M (eerste versie staat in 0.5.19)
- **Accountvoortgang** met doelen en XP-winst per dag, week, maand (eerst eigen momentopnames; Wise Old Man later) – A, M
- **Ironman-hulp** (Herblore, Farming, Hunter), **House planner** – C, L
- **Handmatige import van je bank** (csv uit RuneLite) om te zien wat je al hebt voor een recept – B, M
Wat we zelf nog moeten verbeteren: snellere opstart; Windows-testlijst na elke release; automatische tests; uiterlijke punten uit de review van 24 okt; quest-eisen van alle recepten aanvullen; coördinaten van een paar altaren controleren.

## 5. Open beslissingen
- Snellere opstart (grote data apart laden, laadscherm) en de uiterlijke punten uit de review van 24 okt. Voorstel: opstart in 0.5.20.
- Hoeveel tijd heeft de gebruiker per week om te testen?
- Repo publiek maken (gratis ondertekenen via SignPath)?
- Discord-login: wat moet er gebeuren als iemand offline is na 7 dagen (nu: de app blijft op het inlogscherm)? Voorstel: een extra respijtperiode van enkele dagen zonder internet.
- Mogen de vier cijfers en de banner op het startscherm ook verplaatst worden?

## 6. Bekende gaten
- Altaren: de coördinaten van Death, Blood (Morytania), Soul, Astral, Blood (Kourend) en de Wrath-ruine zijn niet of alleen bij benadering gecontroleerd.
- Sea turtle (79) en manta ray (81) staan bij Vis als Fishing Trawler (Port Khazard); de plek is bij benadering.
- Quest-eisen van recepten onvolledig (waar ze ontbreken blijft het recept beschikbaar).
- Nieuwsafbeeldingen, toasts, het menu bovenin en het inloggen met Discord zijn niet op Windows getest.
- Farming-patches: Prifddinas, onderwaterpatches en Hespori ontbreken nog.
- De lijst met GE-belastingvrijstellingen is niet volledig nagelezen.

## 7. Risico's
- Zonder ondertekening: SmartScreen-waarschuwing; uitleg in de notities.
- Alles is getest in Linux-Chromium; Windows-fouten komen pas bij de gebruiker boven.
- Wiki-pagina's wijzigen; gegevens kunnen verouderen.
- Discord-login: poort 53682 moet vrij zijn en het redirectadres in de Developer Portal moet precies kloppen; zonder internet kom je na 7 dagen niet meer in de app.
- Fan-inhoud en rechten van Jagex (zie 4c), nu de app met een groep wordt gedeeld.
