const { app, BrowserWindow, Menu, shell, screen, net } = require("electron");
const path = require("path");
const fs = require("fs");

/* De app heet nu Gielinor Guide, maar je gegevens blijven in de oude map staan. Zo gaat er niets verloren. */
app.setPath("userData", path.join(app.getPath("appData"), "OSRS Companion"));

/* Venstergrootte en -plek onthouden, zodat de app terugkomt zoals je hem achterliet */
const stateFile = () => path.join(app.getPath("userData"), "venster.json");
function leesState() {
  try {
    const s = JSON.parse(fs.readFileSync(stateFile(), "utf8"));
    const ok = screen.getAllDisplays().some(d => { const b = d.bounds; return s.x >= b.x - 50 && s.y >= b.y - 50 && s.x < b.x + b.width - 100 && s.y < b.y + b.height - 100; });
    return { width: Math.max(480, s.width || 1240), height: Math.max(600, s.height || 860), ...(ok ? { x: s.x, y: s.y } : {}), max: !!s.max };
  } catch (e) { return { width: 1240, height: 860 }; }
}
function bewaarState(win) {
  try {
    if (win.isFullScreen() || win.isMinimized()) return;
    const b = win.getNormalBounds();
    fs.writeFileSync(stateFile(), JSON.stringify({ ...b, max: win.isMaximized() }));
  } catch (e) {}
}

/* De pagina meldt haar kleuren, zodat de titelbalk bij Nacht/Dag past */
const { ipcMain } = require("electron");

/* Logboek met fouten (alleen op deze pc) */
const logboek = require("./logboek").maak(app.getPath("userData"));
let appVersieTekst = "";
try { appVersieTekst = String(require("./package.json").appVersie || ""); } catch (e) {}
const logMain = (niveau, bron, tekst, plek) => logboek.schrijf({ niveau, bron, tekst, plek, versie: appVersieTekst });
ipcMain.handle("logSchrijf", (e, r) => { logboek.schrijf(Object.assign({}, r, { versie: appVersieTekst })); return true; });
ipcMain.handle("logLees", () => ({ regels: logboek.lees(), vastgelopen: logboek.leesVastgelopen(), versie: appVersieTekst, platform: process.platform + " " + require("os").release() }));
ipcMain.handle("logWis", () => logboek.wis());
process.on("uncaughtException", (err) => { logMain("fout", "hoofdproces", err && (err.stack || err.message) || String(err)); });
process.on("unhandledRejection", (err) => { logMain("fout", "hoofdproces", "Onafgehandelde belofte: " + (err && (err.stack || err.message) || String(err))); });
ipcMain.on("titel", (e, c) => {
  try {
    const w = BrowserWindow.fromWebContents(e.sender);
    if (w && typeof c.color === "string" && typeof c.symbol === "string" && /^#[0-9a-f]{6}$/i.test(c.color) && /^#[0-9a-f]{6}$/i.test(c.symbol)) w.setTitleBarOverlay({ color: c.color, symbolColor: c.symbol, height: 38 });
  } catch (err) {}
});

/* Levels ophalen van de officiële hiscores van Jagex. Gebeurt alleen als je zelf op de knop drukt. */
const HISCORES = "https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=";
ipcMain.handle("hiscores", async (e, naam) => {
  const n = typeof naam === "string" ? naam.trim() : "";
  if (!/^[A-Za-z0-9 _-]{1,12}$/.test(n)) return { error: "Dat is geen geldige spelersnaam: 1 tot 12 letters, cijfers, spaties, - of _." };
  const hoofd = { "User-Agent": "Gielinor Guide (persoonlijke app voor eigen gebruik)", "Accept": "text/plain, application/json" };
  async function hol(url) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    try { return await net.fetch(url, { signal: ctrl.signal, headers: hoofd }); } finally { clearTimeout(t); }
  }
  let code = 0, mislukt = false;
  try {
    const r = await hol(HISCORES + encodeURIComponent(n));
    if (r.status === 404) return { error: 'De naam "' + n + '" staat niet op de hiscores. Controleer de schrijfwijze; losse spaties tellen mee.' };
    if (r.ok) {
      const txt = await r.text();
      if (txt.length > 40000) return { error: "Het antwoord van de hiscores was onverwacht groot." };
      if (/^\s*-?\d+,-?\d+/.test(txt)) return { text: txt, name: n };
    }
    code = r.status;
  } catch (err) { mislukt = true; }
  /* Tweede poging via de JSON-versie van dezelfde hiscores. */
  try {
    const r = await hol(HISCORES.replace("index_lite.ws", "index_lite.json") + encodeURIComponent(n));
    if (r.status === 404) return { error: 'De naam "' + n + '" staat niet op de hiscores. Controleer de schrijfwijze; losse spaties tellen mee.' };
    if (r.ok) {
      const j = JSON.parse(await r.text());
      if (j && Array.isArray(j.skills) && j.skills.length) {
        const regels = j.skills.map((x) => (x.rank ?? -1) + "," + (x.level ?? -1) + "," + (x.xp ?? -1));
        return { text: regels.join("\n"), name: n };
      }
    }
    code = code || r.status;
  } catch (err) { mislukt = mislukt || true; }
  if (code) return { error: "De hiscores gaven geen bruikbaar antwoord (code " + code + "). Probeer het later nog eens." };
  return { error: "Geen verbinding met de hiscores. Staat je internet aan?" };
});

/* Updatecontrole: kijkt op GitHub of er een nieuwere release staat. Bijwerken gebeurt pas als je op de knop drukt. */
const upd = require("./updater");
let laatsteAsset = null, laatsteTag = "", bezigUpdate = false;
const UPDATE_API = "https://api.github.com/repos/NietAndy/OSRSCompanion/releases/latest";
ipcMain.handle("updateCheck", async () => {
  let huidig = app.getVersion();
  let bouwTekst = ""; try { bouwTekst = String(require("./package.json").appBouw || "").slice(0, 30); } catch (e) {}
  try { const pv = require("./package.json").appVersie; if (/^\d+(\.\d+){1,3}$/.test(String(pv))) huidig = String(pv); } catch (e) {}
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    const r = await net.fetch(UPDATE_API, { signal: ctrl.signal, headers: { "User-Agent": "Gielinor Guide (persoonlijke app voor eigen gebruik)", "Accept": "application/vnd.github+json" } });
    if (r.status === 404) return { bouw: bouwTekst, huidig, geen: true };
    if (!r.ok) return { bouw: bouwTekst, huidig, error: "GitHub reageerde niet (code " + r.status + ")." };
    const j = JSON.parse(await r.text());
    const tag = String(j.tag_name || "").trim().replace(/^(versie|version|v)[\s.]*/i, "");
    if (!/^\d+(\.\d+){0,3}$/.test(tag)) return { bouw: bouwTekst, huidig, error: "De nieuwste release heeft geen leesbaar versienummer." };
    const url = /^https:\/\/github\.com\/(?:NietAndy|OSRS-HeroKoen)\/(?:OSRSCompanion|GielinorGuide)\//.test(j.html_url || "") ? j.html_url : "https://github.com/NietAndy/OSRSCompanion/releases/latest";
    laatsteAsset = upd.kiesAsset(j.assets, process.platform); laatsteTag = tag;
    return { bouw: bouwTekst, huidig, nieuwste: tag, url, naam: String(j.name || "").slice(0, 120), notities: String(j.body || "").slice(0, 1500), platform: process.platform, install: !!laatsteAsset, grootte: laatsteAsset ? laatsteAsset.size : 0 };
  } catch (err) {
    return { bouw: bouwTekst, huidig, error: "Geen verbinding met GitHub. Staat je internet aan?" };
  } finally {
    clearTimeout(t);
  }
});
ipcMain.handle("updateInstall", async (e) => {
  if (bezigUpdate) return { error: "Er wordt al bijgewerkt." };
  if (!laatsteAsset) return { error: "Er staat geen bestand voor jouw systeem bij deze release. Open de releasepagina." };
  bezigUpdate = true;
  const asset = laatsteAsset, tag = laatsteTag;
  let laatsteMelding = 0;
  const voortgang = (got, total) => { const nu = Date.now(); if (nu - laatsteMelding > 120 || got === total) { laatsteMelding = nu; try { e.sender.send("updateVoortgang", { got, total }); } catch (x) {} } };
  try {
    if (process.platform === "win32") {
      const oud = process.env.PORTABLE_EXECUTABLE_FILE || "";
      let dir = oud ? path.dirname(oud) : "";
      let dest = dir ? path.join(dir, "Gielinor Guide.nieuw.exe") : "";
      let ruimte = false;
      if (dest) { try { fs.accessSync(dir, fs.constants.W_OK); ruimte = true; } catch (x) {} }
      if (!ruimte) dest = path.join(app.getPath("downloads"), "Gielinor Guide " + tag + ".exe");
      await upd.haalOp((u, o) => net.fetch(u, o), asset, dest, voortgang);
      if (!upd.isExe(dest)) { try { fs.rmSync(dest, { force: true }); } catch (x) {} throw new Error("Het gedownloade bestand is geen programma."); }
      if (!ruimte || !oud) { shell.showItemInFolder(dest); return { ok: true, mode: "map", pad: dest }; }
      upd.vervangWin(oud, dest, path.join(app.getPath("userData"), "bijwerken"));
      setTimeout(() => app.quit(), 1200);
      return { ok: true, mode: "herstart", pad: oud };
    }
    if (process.platform === "darwin") {
      const dl = app.getPath("downloads");
      const zip = path.join(dl, "Gielinor-Guide-" + tag + "-Mac-arm64.zip");
      await upd.haalOp((u, o) => net.fetch(u, o), asset, zip, voortgang);
      const map = path.join(dl, "Gielinor Guide " + tag);
      fs.rmSync(map, { recursive: true, force: true });
      await new Promise((res, rej) => require("child_process").execFile("/usr/bin/ditto", ["-x", "-k", zip, map], (err) => err ? rej(new Error("Uitpakken lukte niet. Het zipbestand staat in Downloads.")) : res()));
      const nieuwApp = path.join(map, "Gielinor Guide.app");
      shell.showItemInFolder(fs.existsSync(nieuwApp) ? nieuwApp : map);
      return { ok: true, mode: "uitgepakt", pad: map };
    }
    return { error: "Bijwerken in de app kan alleen op Windows en Mac." };
  } catch (err) {
    return { error: String((err && err.message) || err).slice(0, 200) };
  } finally { bezigUpdate = false; }
});
/* Inloggen met Discord: zie discord.js. Het token blijft niet bewaard. Het resultaat (naam, avatar, in de server of niet) staat in een ondertekend bestand in de gebruikersmap, zodat de pagina het niet zelf kan aanpassen. */
let discordBezig = false;
const dcBestand = () => path.join(app.getPath("userData"), "discord.json");
const dcSleutel = () => require("crypto").createHash("sha256").update("gielinor-guide|" + app.getPath("userData") + "|" + (app.getName() || "")).digest();
const dcSig = (t) => require("crypto").createHmac("sha256", dcSleutel()).update(t).digest("hex");
function dcLees() {
  try {
    const j = JSON.parse(fs.readFileSync(dcBestand(), "utf8"));
    if (!j || typeof j.data !== "string" || j.sig !== dcSig(j.data)) return null;
    const u = JSON.parse(j.data);
    return u && u.id && u.naam ? u : null;
  } catch (e) { return null; }
}
ipcMain.handle("discordLogin", async () => {
  if (discordBezig) return { error: "Er wordt al ingelogd." };
  discordBezig = true;
  try {
    const cfg = require("./discord-config");
    const r = await require("./discord").login(cfg, (u) => shell.openExternal(u), (u, o) => net.fetch(u, o));
    const data = JSON.stringify(r);
    fs.writeFileSync(dcBestand(), JSON.stringify({ data, sig: dcSig(data) }));
    return { ok: true, user: r };
  } catch (err) { return { error: String((err && err.message) || err).slice(0, 200) }; }
  finally { discordBezig = false; }
});
ipcMain.handle("discordStatus", () => dcLees());
/* Meld een probleem: stuurt de melding naar het kanaal #bugs via een Discord-webhook. Alleen het hoofdprogramma kent het adres. */
let laatsteBug = 0;
ipcMain.handle("bugMeld", async (e, m) => {
  let hook = "";
  try { hook = String(require("./bug-config").webhook || ""); } catch (x) {}
  if (!/^https:\/\/discord\.com\/api\/webhooks\/\d{15,25}\/[\w-]{20,100}$/.test(hook)) return { error: "Melden is niet ingesteld in deze versie." };
  if (Date.now() - laatsteBug < 120000) return { error: "Je hebt net een melding gestuurd. Wacht twee minuten voor de volgende." };
  m = m && typeof m === "object" ? m : {};
  const kort = (s, n) => String(s == null ? "" : s).replace(/@/g, "@​").trim().slice(0, n);
  const titel = kort(m.titel, 100), tekst = kort(m.tekst, 1500), stappen = kort(m.stappen, 800), pagina = kort(m.pagina, 40);
  if (titel.length < 3 || tekst.length < 5) return { error: "Vul een titel en een korte beschrijving in." };
  const u = dcLees();
  const fields = [
    { name: "Versie", value: appVersieTekst || app.getVersion(), inline: true },
    { name: "Systeem", value: (process.platform + " " + require("os").release()).slice(0, 60), inline: true },
    { name: "Melder", value: u ? kort(u.naam, 60) + (/^\d{15,25}$/.test(String(u.id)) ? " (<@" + u.id + ">)" : "") : "Niet ingelogd", inline: true }
  ];
  if (pagina) fields.push({ name: "Pagina", value: pagina, inline: true });
  if (stappen) fields.push({ name: "Wat deed je vlak daarvoor?", value: stappen.slice(0, 1000) });
  const payload = { username: "Gielinor Guide", allowed_mentions: { parse: [] }, embeds: [{ title: titel, description: tekst, color: 0xf2c14e, fields, timestamp: new Date().toISOString() }] };
  const fd = new FormData();
  fd.append("payload_json", JSON.stringify(payload));
  if (m.log) {
    let regels = [];
    try { regels = logboek.lees().slice(-60); } catch (x) {}
    const txt = regels.map((r) => "[" + new Date(r.t).toISOString() + "] " + r.niveau + " | " + r.bron + (r.pagina ? " | pagina " + r.pagina : "") + " | " + String(r.tekst || "").slice(0, 400)).join("\n") || "(leeg)";
    fd.append("files[0]", new Blob([txt], { type: "text/plain" }), "logboek.txt");
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await net.fetch(hook, { method: "POST", body: fd, signal: ctrl.signal });
    if (r.status === 429) return { error: "Discord krijgt even te veel meldingen. Probeer het over een paar minuten opnieuw." };
    if (!r.ok) return { error: "Discord nam de melding niet aan (code " + r.status + ")." };
    laatsteBug = Date.now();
    return { ok: true };
  } catch (err) {
    return { error: "Geen verbinding met Discord. Staat je internet aan?" };
  } finally { clearTimeout(t); }
});

ipcMain.handle("discordLogout", () => { try { fs.rmSync(dcBestand(), { force: true }); } catch (e) {} return true; });
ipcMain.handle("discordInfo", () => { const c = require("./discord-config"); return { ingesteld: /^\d{15,25}$/.test(c.clientId || ""), url: c.uitnodigingUrl, verplicht: !!c.verplicht, dagen: Number(c.geldigDagen) || 7 }; });
ipcMain.handle("discordOpen", () => { const c = require("./discord-config"); shell.openExternal(c.uitnodigingUrl); });
ipcMain.handle("updateOpen", async (e, url) => {
  if (typeof url === "string" && /^https:\/\/github\.com\/(?:NietAndy|OSRS-HeroKoen)\/(?:OSRSCompanion|GielinorGuide)\//.test(url)) shell.openExternal(url);
});

/* Prijzen en prijsgeschiedenis van de OSRS Wiki. Gebeurt alleen als je zelf op de knop drukt of een grafiek opent. */
const PRIJS_API = "https://prices.runescape.wiki/api/v1/osrs/";
const PRIJS_UA = "Gielinor Guide (persoonlijke app voor eigen gebruik)";
ipcMain.handle("prijzen", async (e, soort, arg) => {
  let url;
  if (soort === "latest") url = PRIJS_API + "latest";
  else if (soort === "reeks" && arg && Number.isInteger(arg.id) && arg.id > 0 && arg.id < 100000 && ["5m", "1h", "6h", "24h"].includes(arg.stap)) url = PRIJS_API + "timeseries?timestep=" + arg.stap + "&id=" + arg.id;
  else return { error: "Ongeldig verzoek." };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await net.fetch(url, { signal: ctrl.signal, headers: { "User-Agent": PRIJS_UA } });
    if (!r.ok) return { error: "De prijs-API reageerde niet (code " + r.status + "). Probeer het later nog eens." };
    const txt = await r.text();
    if (txt.length > 4000000) return { error: "Het antwoord was onverwacht groot." };
    return { text: txt };
  } catch (err) {
    return { error: "Geen verbinding met de prijs-API. Staat je internet aan?" };
  } finally {
    clearTimeout(t);
  }
});

/* Itemiconen van de OSRS Wiki: wordt alleen gevraagd als het plaatje in de pagina zelf niet laadde. Het icoon wordt bewaard in de gebruikersmap, dus de volgende keer is het meteen er. */
const ICOON_NAAM = /^[A-Za-z0-9 ,'()+.&:!-]{1,80}$/;
const icoonMis = new Map();
ipcMain.handle("icoon", async (e, naam) => {
  naam = String(naam == null ? "" : naam).trim();
  if (!ICOON_NAAM.test(naam)) return { error: "Ongeldige naam." };
  const map = path.join(app.getPath("userData"), "icons");
  const bestand = path.join(map, require("crypto").createHash("sha1").update(naam.toLowerCase()).digest("hex") + ".png");
  try { const b = fs.readFileSync(bestand); if (b.length > 8) return { url: "data:image/png;base64," + b.toString("base64") }; } catch (x) {}
  if (icoonMis.has(naam) && Date.now() - icoonMis.get(naam) < 600000) return { error: "Niet gevonden." };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    let f = naam.charAt(0).toUpperCase() + naam.slice(1);
    if (/^coins?$/i.test(f)) f = "Coins_10000";
    const url = "https://oldschool.runescape.wiki/images/" + encodeURIComponent(f.replace(/ /g, "_")).replace(/%28/g, "(").replace(/%29/g, ")").replace(/%27/g, "'") + ".png";
    const r = await net.fetch(url, { signal: ctrl.signal, headers: { "User-Agent": PRIJS_UA } });
    if (!r.ok) { icoonMis.set(naam, Date.now()); return { error: "Niet gevonden." }; }
    const b = Buffer.from(await r.arrayBuffer());
    if (b.length < 16 || b.length > 300000 || b[0] !== 0x89 || b[1] !== 0x50 || b[2] !== 0x4e || b[3] !== 0x47) { icoonMis.set(naam, Date.now()); return { error: "Geen plaatje." }; }
    try { fs.mkdirSync(map, { recursive: true }); fs.writeFileSync(bestand, b); } catch (x) {}
    return { url: "data:image/png;base64," + b.toString("base64") };
  } catch (err) {
    return { error: "Geen verbinding." };
  } finally { clearTimeout(t); }
});

/* Het nieuws van Old School RuneScape (RSS van de officiële site). Alleen na een klik op de knop. */
ipcMain.handle("nieuws", async () => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await net.fetch("https://secure.runescape.com/m=news/latest_news.rss?oldschool=true", { signal: ctrl.signal, headers: { "User-Agent": "Gielinor Guide (persoonlijke app voor eigen gebruik)" } });
    if (!r.ok) return { error: "De nieuwssite reageerde niet (code " + r.status + "). Probeer het later nog eens." };
    const txt = await r.text();
    if (txt.length > 2000000) return { error: "Het antwoord was onverwacht groot." };
    return { text: txt };
  } catch (err) {
    return { error: "Geen verbinding met de nieuwssite. Staat je internet aan?" };
  } finally {
    clearTimeout(t);
  }
});

/* Maar één venster tegelijk: een tweede start haalt het eerste naar voren */
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); }

function maakVenster() {
  const st = leesState();
  const win = new BrowserWindow({
    width: st.width, height: st.height, x: st.x, y: st.y, minWidth: 480, minHeight: 600,
    title: "Gielinor Guide", backgroundColor: "#080e15", show: false, autoHideMenuBar: true,
    icon: path.join(__dirname, "icon.ico"),
    titleBarStyle: "hidden", titleBarOverlay: { color: "#111a26", symbolColor: "#e8eef6", height: 38 },
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false, backgroundThrottling: true }
  });
  win.once("ready-to-show", () => { if (st.max) win.maximize(); win.show(); });
  win.webContents.on("render-process-gone", (e, d) => { logMain("fout", "venster", "Het venster is vastgelopen (" + (d && d.reason) + ")."); logboek.markeerVastgelopen(); });
  win.webContents.on("did-fail-load", (e, code, desc, url) => { if (code !== -3) logMain("fout", "venster", "Pagina laden mislukt: " + desc + " (" + code + ")", url); });
  win.webContents.on("unresponsive", () => { logMain("waarschuwing", "venster", "Het venster reageert niet meer."); });
  win.loadFile(path.join(__dirname, "index.html"));
  let t = null;
  const later = () => { clearTimeout(t); t = setTimeout(() => bewaarState(win), 400); };
  win.on("resize", later); win.on("move", later); win.on("close", () => bewaarState(win));
  /* Externe links (de wiki) openen in je gewone browser, nooit in de app zelf */
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith("file:")) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
  return win;
}

/* Live positie: de RuneLite-plugin "Live Location Sharing" (Plugin Hub) stuurt je positie naar een adres dat jij instelt.
   Dat adres is deze app, alleen op deze computer (127.0.0.1), en alleen met jouw eigen sleutel. */
const http = require("http");
const crypto = require("crypto");
const positieInfo = { url: "", key: "", error: "" };
function positieSleutel() {
  const f = path.join(app.getPath("userData"), "positie-sleutel.txt");
  try { const k = fs.readFileSync(f, "utf8").trim(); if (/^[0-9a-f]{24}$/.test(k)) return k; } catch (e) {}
  const k = crypto.randomBytes(12).toString("hex");
  try { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, k); } catch (e) {}
  return k;
}
function startPositie() {
  const key = positieSleutel(); positieInfo.key = key;
  const server = http.createServer((req, res) => {
    const klaar = (c, t) => { res.writeHead(c, { "Content-Type": "application/json", "Cache-Control": "no-store" }); res.end(t || "[]"); };
    const host = String(req.headers.host || "").replace(/:\d+$/, "").toLowerCase();
    if (req.headers.origin || (host !== "127.0.0.1" && host !== "localhost")) return klaar(403, "{}");
    const a = String(req.headers.authorization || "");
    if (a.length !== key.length || !crypto.timingSafeEqual(Buffer.from(a), Buffer.from(key))) return klaar(401, "{}");
    if (req.method === "GET") return klaar(200);
    if (req.method !== "POST") return klaar(405, "{}");
    let n = 0; const parts = [];
    req.on("data", (c) => { n += c.length; if (n > 8192) req.destroy(); else parts.push(c); });
    req.on("end", () => {
      try {
        const d = JSON.parse(Buffer.concat(parts).toString("utf8")), w = (d && d.waypoint) || {};
        const x = Number(w.x), y = Number(w.y), p = Number(w.plane), wd = Number(d && d.world);
        if (Number.isFinite(x) && Number.isFinite(y) && x >= 0 && y >= 0 && x < 20000 && y < 20000) {
          const m = { x: x, y: y, plane: Number.isFinite(p) ? Math.max(0, Math.min(3, p)) : 0, world: Number.isFinite(wd) ? wd : 0 };
          BrowserWindow.getAllWindows().forEach((win) => { try { win.webContents.send("positie", m); } catch (e) {} });
        }
      } catch (e) {}
      klaar(200);
    });
  });
  let poort = 37780;
  server.on("error", (e) => { if (e.code === "EADDRINUSE" && poort < 37790) { poort++; server.listen(poort, "127.0.0.1"); } else positieInfo.error = "Er is geen vrije poort."; });
  server.on("listening", () => { positieInfo.url = "http://127.0.0.1:" + poort; });
  server.listen(poort, "127.0.0.1");
}
ipcMain.handle("positieInfo", () => positieInfo);
app.whenReady().then(startPositie);

app.whenReady().then(() => {
  if (!gotLock) return;
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: "Bewerken", submenu: [{ role: "undo", label: "Ongedaan maken" }, { role: "redo", label: "Opnieuw" }, { type: "separator" }, { role: "cut", label: "Knip" }, { role: "copy", label: "Kopieer" }, { role: "paste", label: "Plak" }, { role: "selectAll", label: "Selecteer alles" }] },
    { label: "Weergave", submenu: [{ role: "reload", label: "Vernieuwen" }, { type: "separator" }, { role: "resetZoom", label: "Normale grootte" }, { role: "zoomIn", label: "Inzoomen" }, { role: "zoomOut", label: "Uitzoomen" }, { type: "separator" }, { role: "togglefullscreen", label: "Volledig scherm" }] },
    { label: "Venster", submenu: [{ role: "minimize", label: "Minimaliseren" }, { role: "close", label: "Sluiten" }] }
  ]));
  /* De wiki vraagt om een herkenbare User-Agent. Zonder die kunnen plaatjes (icoontjes, nieuws) wegvallen. */
  try {
    require("electron").session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ["https://oldschool.runescape.wiki/*", "https://prices.runescape.wiki/*"] }, (details, cb) => {
      const h = Object.assign({}, details.requestHeaders);
      h["User-Agent"] = "Gielinor Guide/" + appVersieTekst + " (persoonlijke app voor eigen gebruik; github.com/NietAndy/OSRSCompanion)";
      cb({ requestHeaders: h });
    });
  } catch (e) { logMain("fout", "main", "UA-instelling mislukt: " + (e && e.message), ""); }
  maakVenster();
  app.on("second-instance", () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) maakVenster(); });
});
app.on("window-all-closed", () => app.quit());
