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
Klaar: 0.5.17.5 (verplicht inloggen met Discord en in de server zitten, startscherm met sleepbare blokken, prijsmelding makkelijker). Online: 0.5.17.2 (kleinere kaart, positiebalk). Gedaan sinds 0.5.7: Sailing-stappen, Achievement Diaries, Prijsmeldingen (#39), Skilling-planner (#38) met quest-eisen, nieuws als krant, kaart met producten en Runecraft-altaren, kaartopties als dropdowns, zijbalk met klapbare groepen, skill-icoontjes, Discord-setup en changelog-workflow.

## 3. Planning
| Vrijdag | Versie | Inhoud |
|---|---|---|
| 24 okt (klaar) | 0.5.15 | Nieuwe naam: Gielinor Guide; gegevens blijven in dezelfde map |
| 30 okt | 0.5.17 | Verkoopcalculator op de Prijzen-pagina (zie 4e) |
| 29 okt (online) | 0.5.17.1 | Menu bovenin met uitklapmenu's (Mijn speler, Opzoeken, Vechten, Geld en verzamelen, Info) in plaats van de zijbalk, ontwerp in het Claude Design-canvas "zo kan het eruitzien"; verkoopcalculator zoekt slimmer ("Bedoelde je Coal?", Enter kiest het eerste resultaat); logo "RuneScape Helper" wordt Gielinor Guide; `handleiding/Mac.txt` uit de repo |
| 29 okt (online) | 0.5.17.2 | Kaart wat kleiner dan in 0.5.17.1; positiebalk onder de kaart ("In Motherlode Mine", x, y, vlak) |
| 30 okt (klaar) | 0.5.17.3 t/m 0.5.17.5 | Nieuw startscherm (volgende stap, Mijn doel, Prijsmelding, blokken kiezen) en verplicht inloggen met Discord met controle of je in de server zit (opnieuw inloggen na 7 dagen; de controle zit in de app, dus een geoefend iemand kan hem omzeilen) (vervroegd uit 0.9.8 en 0.8.1; blokken verslepen en verbergen zit er in 0.5.17.4 al in; in 0.9.8 komt nog het automatisch verdwijnen van behaalde doelen met een Afgerond-lijst) |
| 6 nov | 0.5.18 | Officiële icoontjes bij alle items, ook capes en uitrusting (zie 4c); zoeken met item-kaarten (4.129 GE-items); snellere opstart |
| 13 nov | 0.5.19 | Uitleg bij begrippen (#35); prijzen automatisch vernieuwen op Prijzen (schakelaar, standaard elke minuut) en interval kiezen bij prijsmeldingen (1, 5 of 10 min); grote prijsmelding in de app (venster midden in de app met item, prijs, verschil en knoppen; ontwerp in het Claude Design-canvas, rij "Prijsmelding") |
| 20 nov | 0.5.20 | Hunter-locaties; hiscores met "opgehaald om" |
| 27 nov | 0.5.21 | Bufferweek |
| 11 dec | 0.6.1 | Quest-volgorde (#37) |
| 18 dec | 0.6.2 | Buffer en opruimen; feestdagenrust |
| begin jan | 0.7.0 | Installer voorbereiden |
| half jan | 0.7.1 | Vergelijken met spelers (#36) |
| eind jan | 0.8.0 | Eerste-start-uitleg, privacytekst, Over-pagina |
| begin feb | 0.8.1 | Inloggen met Discord (naam, avatar, optioneel serverrol), zonder eigen database (zie 4f) |
| begin feb | 0.9.0 | Thema's en compacte modus |
| half feb | 0.9.5 | Bufferweek en opruimen |
| eind feb | 0.9.8 | Eigen startscherm: blokken kiezen, verslepen en verbergen; blokken verdwijnen als een doel is gehaald (met terughalen en een Afgerond-lijst) |
| begin mrt | 0.9.9-rc1 | Test op schone pc, updatetest |
| half mrt | 1.0.0 | Release met checksums |

Data na eind november zijn een schatting. Schuift iets, dan schuift het laatste item door; de afwerking blijft.

## 4. Na 1.0 (prioriteit A/B/C, moeite S/M/L)
- Verdere interface-uitbreidingen (meer thema's, startscherm met meer blokken) – A, M
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
- Installer, winget of Microsoft Store – B, M
- RuneLite-koppeling (officiële plugins) – C, L
- Discord-bot – C, L
- Synchronisatie tussen computers – C, L
- Mobiele of browserversie – C, L
- Mac en Linux – C, M

## 4b. Ontwerp van het startscherm
Visueel ontwerp staat als Claude Design-canvas "OSRS Companion – eigen startscherm" (drie schermen: Levelaar, Farmer en flipper, Aanpassen). Nog toe te voegen: een vierde scherm met "doel gehaald" (felicitatie, Afgerond-lijst, schakelaar per blok: Verbergen als klaar / Laten staan, met Ongedaan maken). Ontwerpregels: de app kent alleen wat de gebruiker invult; "gehaald" is dus een afvinkmoment plus automatische controle; verdwijnen moet nooit verrassen en altijd terug te halen zijn.

## 4c. Officiële item-icoontjes overal (0.5.18, wens van de gebruiker)
Doel: overal waar een item, cape of stuk uitrusting staat, het officiële icoontje uit het spel tonen (GE-lijst, recepten, drops, Gear, Schade, Geld verdienen, Quests, Skilling-planner, nieuws).
Aanpak (nog te bevestigen bij het bouwen):
- De prijs-API van de OSRS Wiki (`prices.runescape.wiki/api/v2/osrs/mapping`) geeft per verhandelbaar item de bestandsnaam van het icoon. Het plaatje komt dan van de wiki-afbeeldingenserver.
- Niet-verhandelbare items (capes zoals de max cape en skill capes, quest-beloningen, Diary-items): bestandsnaam afleiden van de itemnaam; waar dat niet lukt, valt de app terug op het huidige plaatje of een neutraal icoon.
- Plaatjes eenmalig ophalen en op schijf bewaren (cache), zodat de app daarna ook offline werkt en de wiki niet steeds wordt belast. Vooraf in de exe stoppen kan ik niet: mijn werkomgeving komt niet bij de wiki.
- Altijd een herkenbare User-Agent meesturen (de wiki vraagt dat). Eén aanvraag voor alle prijzen, nooit per item in een lus.
- Alleen de icoontjes van wat de gebruiker echt ziet laden (lui laden), anders wordt de opstart trager.
Aandachtspunten:
- Rechten: de icoontjes zijn kunst van Jagex. Het beleid voor fan-inhoud van Jagex vraagt een zichtbare vermelding ("Created using intellectual property belonging to Jagex Limited under the terms of Jagex's Fan Content Policy", met de mededeling dat het niet door Jagex is goedgekeurd). Volgens mijn samenvatting van dat beleid staan "companion- of gids-apps" ook in de lijst met dingen die niet mogen onder die licentie. Dat is niet door mij in de volledige tekst nagelezen. Eerst nalezen of Jagex mailen (IP@Jagex.com) voordat de app breder wordt gedeeld.
- Zonder internet en zonder cache: terugvallen op het huidige plaatje.

## 4e. Verkoopcalculator (0.5.17, vrijdag 30 okt, wens van de gebruiker)
Doel: zien wat je verdient als je een aantal items verkoopt, bijvoorbeeld 1500 Coal ore en 2 Gold pickaxe.
- Blok "Verkoopcalculator" bovenaan de Prijzen-pagina. Tot 5 regels; per regel een item (zoeken) en een aantal. Aantallen als 1,5k of 2m werken ook.
- Prijs per regel: standaard de **laagste prijs** (wat je krijgt als je meteen verkoopt). Daarnaast staat ook wat je **gemiddeld** kunt krijgen (gemiddelde van hoog en laag). Per regel is een eigen prijs in te vullen.
- Uitkomst: per regel prijs, bruto, belasting en netto; onderaan het totaal bruto, belasting en wat je overhoudt, voor zowel de lage als de gemiddelde prijs.
- GE-belasting (schakelaar, standaard aan): 2% sinds 29 mei 2025, per stuk naar beneden afgerond, maximaal 5 miljoen per item, geen belasting onder 50 coins. Vrijgesteld zijn onder meer bonds, energy potions, laagwaardig eten, enkele teleport-tablets en gereedschap zoals een hamer. De vrijstellingenlijst is niet volledig nagelezen (de wiki-pagina is deels niet gelezen).
- Werkt ook offline met de laatste momentopname; met de knop Prijzen vernieuwen zijn de prijzen actueel. De laatste regels worden onthouden.
- Niet in deze versie: geschiedenis, winst op kopen en verkopen, koppeling met je bank.
- Gevolg voor de planning: alles wat daarna kwam schuift één versie op (de icoontjes zijn nu 0.5.18, 6 nov).

## 4f. Inloggen met Discord (0.8.1, wens van de gebruiker)
Doel: mensen koppelen hun Discord aan de app, zonder eigen database. Aanpak: OAuth met PKCE en een localhost-terugkeer (geen client secret in de app). De app krijgt naam, avatar en Discord-ID, en met `guilds.members.read` ook of iemand in de server zit en welke rol hij heeft. Bewust niet: voortgang synchroniseren (blijft lokaal, back-up blijft de weg naar een andere pc) en ranglijsten. Een rolcontrole in de app is een gemak, geen beveiliging. Pas bij vraag naar sync over meerdere pc's een gratis databasedienst met Discord-login toevoegen. Volgt op 0.8.0 omdat de privacytekst dan al klaarstaat: die moet vermelden wat Discord deelt.

## 4d. Onderzoek 25 okt: wat bestaat er al en wat kan beter
Bekeken: de OSRS Wiki, RuneLite, Wise Old Man, TempleOSRS, GE Tracker, OSRS Toolkit, Theoatrix, OldSchool.tools. Bruikbare ideeën voor ons, met prioriteit en moeite:
- **Prijsgrafieken per item** (uur, dag, maand, jaar) via de prijs-API van de wiki; past bij het zoeken met item-kaarten in 0.5.18/0.5.19 – A, M
- **Buy limits en high alch-winst** in de item-kaart (komt uit dezelfde mapping) – A, S
- **Buy limits-teller:** wanneer je weer mag kopen – B, M
- **Best in Slot en Gear-kiezer** per activiteit – B, L
- **DPS-calculator met sets** (al in de lijst na 1.0) – B, M
- **Quest-helper-achtig overzicht:** volgorde voor de quest cape en wat je nog mist – A, M (past bij 0.6.1)
- **Accountvoortgang** met doelen en XP-winst per dag, week, maand (eerst eigen momentopnames; Wise Old Man later) – A, M
- **Collection log en Combat Achievements** (al in de lijst) – B, M
- **Ironman-hulp** (Herblore, Farming, Hunter), **House planner**, **Slayer-hulp** – C, L
- **Gebruik zonder internet** met alle gegevens lokaal – A, M (de app doet dit voor de meeste dingen al)
- **Handmatige import van je bank** (csv uit RuneLite) om te zien wat je al hebt voor een recept – B, M
Wat we zelf nog moeten verbeteren: snellere opstart; Windows-testlijst na elke release; automatische tests; uiterlijke punten uit de review van 24 okt; quest-eisen van alle recepten aanvullen; coördinaten van een paar altaren controleren.

## 5. Open beslissingen
- Naam: besloten, Gielinor Guide (0.5.15). Hernoem de GitHub-repository pas als alle apps op 0.5.15 of nieuwer staan.
- Nog te beslissen: snellere opstart (grote data apart laden, laadscherm) en de uiterlijke punten uit de review van 24 okt. Voorstel: opstart als eerstvolgende stap.
- Hoeveel tijd heeft de gebruiker per week om te testen?
- Repo publiek maken (gratis ondertekenen via SignPath)?
- Kloppen de Discord-kanaalnamen (#ideeën, #bugs)?
- Workflow voor geplande publicatie bouwen, met Discord-melding in dezelfde workflow?

## 6. Bekende gaten
- Altaren: Wrath en Astral zijn in 0.5.16 toegevoegd, plus het Blood-altaar van Kourend. Levels en quests zijn bevestigd met de wiki. Coördinaten van Death, Blood (Morytania), Soul, Astral, Blood (Kourend) en de Wrath-ruine zijn niet of alleen bij benadering gecontroleerd.
- Sea turtle (79) en manta ray (81) staan sinds 0.5.16 bij Vis als Fishing Trawler (Port Khazard); de plek is bij benadering.
- Quest-eisen van recepten onvolledig (waar ze ontbreken blijft het recept beschikbaar).
- Bronze spear: bevestigd met de wiki, 1 bronze bar + 1 logs. Klopt dus.
- Nieuwsafbeeldingen en toasts niet op Windows getest.
- Farming-patches: sinds 0.5.16 exact; Prifddinas, onderwaterpatches en Hespori ontbreken nog.

## 7. Risico's
- Hernoeming en migratie kunnen data kosten: eerst back-up laten maken, rc laten testen.
- Zonder ondertekening: SmartScreen-waarschuwing; uitleg in de notities.
- Alles is getest in Linux-Chromium; Windows-fouten komen pas bij de gebruiker boven.
- Wiki-pagina's wijzigen; gegevens kunnen verouderen.
