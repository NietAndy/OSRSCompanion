/* Inloggen met Discord: de Beta-rol wordt gelezen, en de updater kiest de juiste release. Alles met nagemaakte antwoorden. */
const d = require("../app/discord.js");
const u = require("../app/updater.js");
const http = require("http");
let fouten = 0;
const eis = (naam, ok, extra) => { console.log((ok ? "OK    " : "FOUT  ") + naam + (extra ? " " + extra : "")); if (!ok) fouten++; };

function nepFetch(rollen, memberFout) {
  return async (url) => {
    const ok = (o) => ({ ok: true, status: 200, text: async () => JSON.stringify(o), arrayBuffer: async () => new ArrayBuffer(0) });
    if (/\/users\/@me\/guilds\/G1\/member$/.test(url)) { if (memberFout) return { ok: false, status: 403, text: async () => "{}" }; return ok({ roles: rollen }); }
    if (/\/users\/@me\/guilds$/.test(url)) return ok([{ id: "G1" }]);
    if (/\/users\/@me$/.test(url)) return ok({ id: "123456789012345678", username: "tester", global_name: "Tester" });
    if (/\/invites\//.test(url)) return ok({ guild: { id: "G1" } });
    return { ok: false, status: 404, text: async () => "{}", arrayBuffer: async () => new ArrayBuffer(0) };
  };
}
function opener(poort, scopes) {
  return (url) => {
    const q = new URL(url).searchParams; scopes.push(q.get("scope"));
    const body = JSON.stringify({ t: "tokentoken1234567890", s: q.get("state") });
    const req = http.request({ host: "127.0.0.1", port: poort, path: "/token", method: "POST", headers: { "Content-Type": "application/json" } }); req.on("error", () => {}); req.end(body);
  };
}
(async () => {
  const basis = { clientId: "111111111111111111", uitnodiging: "x", poort: 53699 };
  const scopes = [];
  let r = await d.login(Object.assign({}, basis, { betaRolId: "222222222222222222" }), opener(53699, scopes), nepFetch(["999999999999999999", "222222222222222222"]), { api: "https://x/api", timeout: 5000 });
  eis("met de Beta-rol: beta = true", r.beta === true && r.inServer === true);
  eis("de toestemming bevat guilds.members.read", /guilds\.members\.read/.test(scopes[0] || ""), scopes[0]);
  r = await d.login(Object.assign({}, basis, { betaRolId: "222222222222222222" }), opener(53699, scopes), nepFetch(["999999999999999999"]), { api: "https://x/api", timeout: 5000 });
  eis("zonder de Beta-rol: beta = false", r.beta === false);
  r = await d.login(Object.assign({}, basis, { betaRolId: "222222222222222222" }), opener(53699, scopes), nepFetch([], true), { api: "https://x/api", timeout: 5000 });
  eis("Discord weigert de rollen (403): inloggen lukt, beta = false", r.beta === false && r.inServer === true);
  r = await d.login(Object.assign({}, basis, { betaRolId: "" }), opener(53699, scopes), nepFetch(["222222222222222222"]), { api: "https://x/api", timeout: 5000 });
  eis("geen rol-ID ingesteld: beta = false, ook al staat de rol erbij", r.beta === false);

  const L = [{ tag_name: "v0.5.22.2" }, { tag_name: "v0.5.22.92", prerelease: true }, { tag_name: "v0.5.22.91", prerelease: true }, { tag_name: "v0.5.23", draft: true }, { tag_name: "Versie 0.5.22.10" }];
  eis("gewone gebruiker krijgt de hoogste gewone release, nooit een pre-release", u.kiesRelease(L, false).tag_name === "Versie 0.5.22.10", u.kiesRelease(L, false).tag_name);
  eis("beta-tester krijgt de hoogste, ook een pre-release", u.kiesRelease(L, true).tag_name === "v0.5.22.92", "(en 0.5.22.10 is lager dan 0.5.22.92: " + (u.kiesRelease(L, true).tag_name) + ")");
  eis("een concept telt nooit mee", u.kiesRelease([{ tag_name: "v9.0.0", draft: true }], true) === null);
  const na = L.filter((x) => !x.draft).concat([{ tag_name: "v0.5.23" }]);
  eis("na de gewone release 0.5.23 wint die van de betas", u.kiesRelease(na, true).tag_name === "v0.5.23" && u.kiesRelease(na, false).tag_name === "v0.5.23");
  eis("een lijst zonder bruikbare releases geeft niets", u.kiesRelease([], true) === null && u.kiesRelease(null, false) === null);
  console.log(fouten ? "\n" + fouten + " test(s) mislukt" : "\nAlles gelukt");
  process.exit(fouten ? 1 : 0);
})();
