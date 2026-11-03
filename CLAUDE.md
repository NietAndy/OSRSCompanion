# Werkafspraken voor Claude

- Antwoord in het Nederlands, kort en in gewone taal. De gebruiker is geen programmeur.
- De app staat in `app/`. Bijna alles zit in `app/index.html`; nieuwe scripts en styles komen onderaan het bestand.
- Elke exe die je naar de gebruiker stuurt, krijgt een eigen versienummer (`appVersie` in `app/package.json`). Na het versturen nooit dezelfde versie opnieuw bouwen met andere inhoud: gebruik dan x.y.z.1, x.y.z.2, enzovoort.
- Per versie: `RELEASE-NOTES-x.y.z.md` (alleen Nieuw, Verbeterd, Opgelost) en `RELEASE-STORY-x.y.z.md` in de hoofdmap, `ROADMAP.md` bijwerken, en een krant-editie bovenaan `LOG` in `index.html`. Een nieuwe RELEASE-NOTES op main maakt vanzelf een draft-release (workflow draft-release.yml).
- Testen met de Playwright-scripts in `tests/`. Windows en echte Discord-login kan alleen de gebruiker testen; zeg dat erbij.
- Geen geheimen in de repo: de repo is openbaar. Het webhook-adres staat in `app/bug-config.js` (genegeerd door git).
- Niets betaalds, alleen Windows, geen automatisering of uitlezen van het spel (regels van Jagex).
- Bugs komen binnen als issue met het label `uit-de-app`. Verwijs in releasenotities naar het nummer, bijvoorbeeld (#2).
