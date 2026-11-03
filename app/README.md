# Gielinor Guide – broncode

Nederlandse Old School RuneScape-gids als Electron-app voor Windows.

## Mappen
- `app/` – de app. Bijna alles staat in `index.html` (één groot bestand met losse `<script>`-blokken; nieuwe scripts en styles komen onderaan, het bestand heeft geen `</body>`). `main.js` en `preload.js` zijn het Electron-gedeelte; `discord.js`, `updater.js` en `logboek.js` doen inloggen, updates en het logboek.
- `build/companion.yml` – instellingen voor electron-builder (portable exe).
- `tests/` – Playwright-scripts. Ze bootsen `window.osrsWin` na en openen `app/index.html`. Draaien: `npm i -g playwright && npx playwright install chromium && node tests/t185.js`.

## Uitproberen
`cd app && npx electron@33.4.11 .`

## Exe bouwen (Windows)
`cd build && npx electron-builder@25 --win --config companion.yml` – de exe staat daarna in `build/uitcomp/`.

## Geheimen
`app/bug-config.js` (webhook voor #bugs) staat niet in de repo. Zie `app/bug-config.example.js`.

## Versie
Het nummer dat de app toont en waarmee de updater vergelijkt, staat in `app/package.json` bij `appVersie`. `version` blijft 0.5.17.
