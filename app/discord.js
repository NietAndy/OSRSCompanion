/* Inloggen met Discord (OAuth2, implicit grant, geen client secret en geen eigen server).
   De app ontvangt het toegangstoken op 127.0.0.1, vraagt je naam, avatar en serverlijst op, en gooit het token weg.
   Alleen scopes "identify" en "guilds": geen berichten, geen e-mail, geen vrienden. */
const http = require("http");
const crypto = require("crypto");

const API = "https://discord.com/api/v10";
const AUTH = "https://discord.com/oauth2/authorize";

function authUrl(cfg, state, auth) {
  const redirect = "http://127.0.0.1:" + cfg.poort + "/callback";
  return (auth || AUTH) + "?" + new URLSearchParams({ client_id: cfg.clientId, response_type: "token", redirect_uri: redirect, scope: "identify guilds", state, prompt: "consent" }).toString();
}

const PAGINA = '<!doctype html><meta charset="utf-8"><title>Gielinor Guide</title><body style="font:16px system-ui;background:#0b121b;color:#e8eef6;display:grid;place-items:center;height:100vh;margin:0"><p id="t">Even geduld...</p><script>' +
  'var h=new URLSearchParams(location.hash.slice(1)),q=new URLSearchParams(location.search);' +
  'fetch("/token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({t:h.get("access_token"),s:h.get("state"),e:q.get("error")})})' +
  '.then(function(r){document.getElementById("t").textContent=r.ok?"Klaar! Je kunt dit venster sluiten en terug naar Gielinor Guide.":"Het inloggen is mislukt. Probeer het opnieuw in de app."})' +
  '.catch(function(){document.getElementById("t").textContent="Het inloggen is mislukt."});</script>';

/* Wacht op het token. Geeft een belofte met het token, of een fout bij annuleren, een verkeerde state of een time-out. */
function wachtOpToken(cfg, state, ms) {
  return new Promise((resolve, reject) => {
    let klaar = false;
    const srv = http.createServer((req, res) => {
      const u = new URL(req.url, "http://127.0.0.1");
      if (req.method === "GET" && u.pathname === "/callback") { res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }); res.end(PAGINA); return; }
      if (req.method === "POST" && u.pathname === "/token") {
        let b = ""; req.on("data", (c) => { b += c; if (b.length > 5000) req.destroy(); });
        req.on("end", () => {
          let j = {}; try { j = JSON.parse(b); } catch (e) {}
          const ok = j && j.s === state && typeof j.t === "string" && /^[\w.~+\/-]{10,200}$/.test(j.t);
          res.writeHead(ok ? 200 : 400); res.end(ok ? "ok" : "nee");
          if (klaar) return; klaar = true;
          fin(); if (ok) resolve(j.t); else reject(new Error(j && j.e === "access_denied" ? "Je hebt het inloggen geannuleerd." : "Het inloggen is niet gelukt."));
        });
        return;
      }
      res.writeHead(404); res.end();
    });
    const timer = setTimeout(() => { if (klaar) return; klaar = true; fin(); reject(new Error("Het inloggen duurde te lang. Probeer het opnieuw.")); }, ms || 180000);
    function fin() { clearTimeout(timer); try { srv.close(); } catch (e) {} }
    srv.on("error", (e) => { if (klaar) return; klaar = true; clearTimeout(timer); reject(new Error(e && e.code === "EADDRINUSE" ? "De poort " + cfg.poort + " is bezig. Sluit andere programma's en probeer opnieuw." : "Kon de inlog niet starten.")); });
    srv.listen(cfg.poort, "127.0.0.1", () => { if (cfg._klaar) cfg._klaar(); });
  });
}

async function json(fetchFn, url, token) {
  const r = await fetchFn(url, { headers: Object.assign({ "User-Agent": "Gielinor Guide (persoonlijke app voor eigen gebruik)" }, token ? { Authorization: "Bearer " + token } : {}) });
  if (!r.ok) throw new Error("Discord gaf code " + r.status + ".");
  return JSON.parse(await r.text());
}

async function avatarData(fetchFn, id, hash, api) {
  if (!hash || !/^[\w]+$/.test(hash)) return "";
  try {
    const r = await fetchFn((api || "https://cdn.discordapp.com") + "/avatars/" + id + "/" + hash + ".png?size=64");
    if (!r.ok) return "";
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 200000) return "";
    return "data:image/png;base64," + buf.toString("base64");
  } catch (e) { return ""; }
}

/* Het hele inlogproces. open(url) opent de browser, fetchFn is net.fetch. */
async function login(cfg, open, fetchFn, opt) {
  opt = opt || {};
  if (!cfg.clientId || !/^\d{15,25}$/.test(cfg.clientId)) throw new Error("Inloggen met Discord is nog niet ingesteld in deze versie.");
  const state = crypto.randomBytes(16).toString("hex");
  const api = opt.api || API;
  const wacht = wachtOpToken(Object.assign({}, cfg, { _klaar: () => open(authUrl(cfg, state, opt.auth)) }), state, opt.timeout);
  const token = await wacht;
  const me = await json(fetchFn, api + "/users/@me", token);
  const guilds = await json(fetchFn, api + "/users/@me/guilds", token);
  let guildId = "";
  try { const inv = await json(fetchFn, api + "/invites/" + encodeURIComponent(cfg.uitnodiging)); guildId = String((inv.guild && inv.guild.id) || (inv.guild_id) || ""); } catch (e) {}
  if (!guildId) throw new Error("Kon de Discord-server van de uitnodiging niet vinden.");
  const inServer = Array.isArray(guilds) && guilds.some((g) => g && String(g.id) === guildId);
  const naam = String(me.global_name || me.username || "Onbekend").slice(0, 40);
  const avatar = await avatarData(fetchFn, me.id, me.avatar, opt.cdn);
  return { id: String(me.id), naam, avatar, inServer, ts: Date.now() };
}

module.exports = { authUrl, wachtOpToken, login, avatarData };
