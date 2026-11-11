# Werkafspraken voor Claude

- Antwoord in het Nederlands, kort en in gewone taal. De gebruiker is geen programmeur.
- De app staat in `app/`. Bijna alles zit in `app/index.html`; nieuwe scripts en styles komen onderaan het bestand.
- Elke exe die je naar de gebruiker stuurt, krijgt een eigen versienummer (`appVersie` in `app/package.json`). Na het versturen nooit dezelfde versie opnieuw bouwen met andere inhoud: gebruik dan x.y.z.1, x.y.z.2, enzovoort.
- Per versie: `RELEASE-NOTES-x.y.z.md` (alleen Nieuw, Verbeterd, Opgelost) en `RELEASE-STORY-x.y.z.md` in de hoofdmap, `ROADMAP.md` bijwerken, en een krant-editie bovenaan `LOG` in `index.html`. Een nieuwe RELEASE-NOTES op main maakt vanzelf een draft-release (workflow draft-release.yml).
- Testen met de Playwright-scripts in `tests/`. Windows en echte Discord-login kan alleen de gebruiker testen; zeg dat erbij.
- Geen geheimen in de repo: de repo is openbaar. Het webhook-adres staat in `app/bug-config.js` (genegeerd door git).
- Niets betaalds, alleen Windows, geen automatisering of uitlezen van het spel (regels van Jagex).
- Bugs komen binnen als issue met het label `uit-de-app`. Verwijs in releasenotities naar het nummer, bijvoorbeeld (#2).
- Bij elke release (ook beta en hotfix met nieuwe inhoud) eerst de wekelijkse controle uit `ROADMAP.md` doen: nieuws, nieuwe quests en miniquests, items, drops en monsters, kaart en vervoer, diaries en clues. Wat nieuw is komt in die versie; is er niets nieuw, dan staat dat in de releasenotities. Wat niet te controleren is, markeren als "niet gecontroleerd".
- Gegevens met een datum in de app (zoals de drops van januari 2024 en de Grand Exchange-momentopname) horen bij die controle: noem in de releasenotities wat ververst is en wat nog oud is.
- Bij elke release rekening houden met "wanneer koop of verkoop je een item het beste": het blok "Beste moment om te kopen en te verkopen" (Prijzen, Overzicht en de prijsmeldingen) moet blijven werken en klopt met de nieuwste prijsgegevens. Draai bij elke wijziging aan Prijzen, grafieken of items de tests `tests/t181.js` en `tests/t183.js`, en laat nieuwe prijsfuncties dit moment erbij tonen waar dat past.
