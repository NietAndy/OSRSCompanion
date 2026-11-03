/* Voorbeeld. Kopieer naar bug-config.js en zet daar het webhook-adres van #bugs in.
   bug-config.js staat in .gitignore en komt dus nooit in de repo. Bij het bouwen op GitHub
   wordt het bestand gemaakt uit de secret DISCORD_BUG_WEBHOOK. Zonder dit bestand werkt de app,
   maar zegt Meld een probleem dat melden niet is ingesteld. */
module.exports = {
  webhook: ""
};
