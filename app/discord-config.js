/* Instellingen voor inloggen met Discord.
   clientId: het Application ID uit https://discord.com/developers/applications (geen geheim, mag in de app staan).
   In de Developer Portal bij OAuth2 > Redirects moet precies dit adres staan: http://127.0.0.1:53682/callback */
module.exports = {
  clientId: "1565697309394608210",
  uitnodiging: "wbzVKyDaS",
  uitnodigingUrl: "https://discord.gg/wbzVKyDaS",
  poort: 53682,
  /* true: de app is alleen te gebruiken als je met Discord bent ingelogd en in de server zit (alleen actief zodra clientId is ingevuld) */
  verplicht: true,
  /* na zoveel dagen moet je opnieuw inloggen, zodat de controle op serverlidmaatschap vers blijft */
  geldigDagen: 7,
  /* Het ID van de rol "Beta" op de server (geen geheim). Leeg: de app zoekt niet naar beta-updates.
     Te vinden in Discord: Ontwikkelaarsmodus aan, rechtsklik op de rol, Rol-ID kopiëren. */
  betaRolId: "1567484253640331264"
};
