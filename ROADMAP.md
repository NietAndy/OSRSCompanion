# OSRS Companion – roadmap (voor ons)

Bijgewerkt 2026-10-23. Werkdocument voor de gebruiker en Claude. Een bewerkbare kopie staat als Claude Doc; deze file is wat Claude aan het begin van een sessie leest.

## 1. Werkafspraken
- Eén release per vrijdag, kleine versiestappen (0.5.x). Extra cijfer = hotfix (0.5.16.1). Middelgrote stap (0.6, 0.7) alleen als opslag of naam verandert.
- Elke wijziging: aanpassen, testen in Linux-Chromium met mocks, exe bouwen, sturen, `RELEASE-NOTES-x.y.z.md` in de repo.
- Claude test niet op Windows; de gebruiker wel. Dat bepaalt de bufferweken.
- Releasetag `vX.Y.Z`, titel "Versie X.Y.Z". Het bestand moet op .exe eindigen.
- Alleen Windows. Niets betaalds. Geen automatisering of uitlezen van het spel (Jagex).
- Gegevens van OSRS Wiki, Shortest Path (BSD) en RuneLite (BSD), met bron.
- `package.json`: driedelig `version` plus eigen `appVersie`; de updater leest `appVersie`.

## 2. Stand
Online: 0.5.14. Gedaan sinds 0.5.7: Sailing-stappen, Achievement Diaries, Prijsmeldingen (#39), Skilling-planner (#38) met quest-eisen, nieuws als krant, kaart met producten en Runecraft-altaren, kaartopties als dropdowns, zijbalk met klapbare groepen, skill-icoontjes, Discord-setup en changelog-workflow.

## 3. Planning
| Vrijdag | Versie | Inhoud |
|---|---|---|
| 30 okt | 0.5.15 | Farming-patches op de kaart; geplande publicatie + Discord-melding |
| 6 nov | 0.5.16 | Zoeken met item-kaarten (4.129 GE-items) |
| 13 nov | 0.5.17 | Uitleg bij begrippen (#35); foutlogboek |
| 20 nov | 0.5.18 | Hunter-locaties; hiscores met "opgehaald om" |
| 27 nov | 0.5.19 | Bufferweek |
| 4 dec | 0.6.0 | Eigen voortgang (#34); versie in opslagformaat; sterkere back-up |
| 11 dec | 0.6.1 | Quest-volgorde (#37) |
| 18 dec | 0.6.2 | Buffer en opruimen; feestdagenrust |
| begin jan | 0.7.0 | Nieuwe naam met datamigratie; installer voorbereiden |
| half jan | 0.7.1 | Vergelijken met spelers (#36) |
| eind jan | 0.8.0 | Eerste-start-uitleg, privacytekst, Over-pagina |
| begin feb | 0.9.0-rc1 | Test op schone pc, updatetest |
| half feb | 1.0.0 | Release met checksums |

Data na eind november zijn een schatting. Schuift iets, dan schuift het laatste item door; de afwerking blijft.

## 4. Na 1.0 (prioriteit A/B/C, moeite S/M/L)
- Nieuwe interface (thema's, eigen startscherm, compacte modus) – A, L
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

## 5. Open beslissingen
- Nieuwe naam voor of na 1.0? Favoriet: Gielinor Gids; migratie nodig.
- Hoeveel tijd heeft de gebruiker per week om te testen?
- Repo publiek maken (gratis ondertekenen via SignPath)?
- Kloppen de Discord-kanaalnamen (#ideeën, #bugs)?
- Workflow voor geplande publicatie bouwen, met Discord-melding in dezelfde workflow?

## 6. Bekende gaten
- Wrath- en Astral-altaar ontbreken; coördinaten Death-, Blood- en Soul-altaar niet gecontroleerd.
- Sea turtle en manta ray ontbreken bij Vis.
- Quest-eisen van recepten onvolledig (waar ze ontbreken blijft het recept beschikbaar).
- Bronze spear: niet bevestigd of er logs voor nodig zijn.
- Nieuwsafbeeldingen en toasts niet op Windows getest.
- Farming-patches komen per gebied van 64×64 tegels, niet exact.

## 7. Risico's
- Hernoeming en migratie kunnen data kosten: eerst back-up laten maken, rc laten testen.
- Zonder ondertekening: SmartScreen-waarschuwing; uitleg in de notities.
- Alles is getest in Linux-Chromium; Windows-fouten komen pas bij de gebruiker boven.
- Wiki-pagina's wijzigen; gegevens kunnen verouderen.
