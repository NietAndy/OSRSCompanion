/* Bijwerken vanaf GitHub: downloadt het nieuwe bestand van de eigen releasepagina en, op Windows, vervangt het
   bestand waarmee je de app start. Alleen adressen van github.com/NietAndy/OSRSCompanion/releases/download worden gebruikt. */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const OK_URL = /^https:\/\/github\.com\/(?:NietAndy|OSRS-HeroKoen)\/(?:OSRSCompanion|GielinorGuide)\/releases\/download\/[^\s"'<>]+$/;
const UA = "Gielinor Guide (persoonlijke app voor eigen gebruik)";

function kiesAsset(assets, platform, okUrl) {
  const re = platform === "win32" ? /\.exe$/i : platform === "darwin" ? /mac.*\.zip$/i : null;
  if (!re || !Array.isArray(assets)) return null;
  const ok = okUrl || OK_URL;
  const a = assets.find((x) => x && re.test(String(x.name || "")) && ok.test(String(x.browser_download_url || "")));
  if (!a) return null;
  return { name: String(a.name), url: String(a.browser_download_url), size: Number(a.size) || 0, digest: typeof a.digest === "string" ? a.digest : "" };
}

async function haalOp(fetchFn, asset, dest, onProgress) {
  const r = await fetchFn(asset.url, { headers: { "User-Agent": UA, "Accept": "application/octet-stream" } });
  if (!r.ok) throw new Error("De download gaf code " + r.status + ".");
  const total = Number(r.headers.get("content-length")) || asset.size || 0;
  const tmp = dest + ".deel";
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const out = fs.createWriteStream(tmp);
  const h = crypto.createHash("sha256");
  let got = 0, fout = null;
  out.on("error", (e) => { fout = e; });
  const reader = r.body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (fout) throw fout;
      got += value.length; h.update(value);
      if (!out.write(value)) await new Promise((res) => out.once("drain", res));
      if (onProgress) onProgress(got, total);
    }
  } catch (e) { try { out.destroy(); fs.rmSync(tmp, { force: true }); } catch (x) {} throw e; }
  await new Promise((res) => out.end(res));
  if (fout) { try { fs.rmSync(tmp, { force: true }); } catch (x) {} throw fout; }
  const fail = (m) => { try { fs.rmSync(tmp, { force: true }); } catch (x) {} throw new Error(m); };
  if (asset.size && got !== asset.size) fail("De download is niet compleet (" + got + " van " + asset.size + " bytes).");
  if (!got) fail("De download is leeg.");
  const hex = h.digest("hex");
  if (/^sha256:/i.test(asset.digest) && asset.digest.slice(7).toLowerCase() !== hex) fail("De controlesom klopt niet, dus het bestand wordt niet gebruikt.");
  fs.renameSync(tmp, dest);
  return dest;
}

function isExe(p) { try { const fd = fs.openSync(p, "r"), b = Buffer.alloc(2); fs.readSync(fd, b, 0, 2, 0); fs.closeSync(fd); return b[0] === 0x4d && b[1] === 0x5a; } catch (e) { return false; } }

function cmdTekst(oud, nieuw, log) {
  const q = (s) => String(s).replace(/%/g, "%%").replace(/"/g, "");
  return [
    "@echo off",
    "chcp 65001 >nul",
    'set "OUD=' + q(oud) + '"',
    'set "NIEUW=' + q(nieuw) + '"',
    'set "LOG=' + q(log || "") + '"',
    "set /a n=0",
    'if defined LOG echo %date% %time% Wacht tot de app is afgesloten >> "%LOG%"',
    ":probeer",
    'move /y "%NIEUW%" "%OUD%" >nul 2>&1',
    "if not errorlevel 1 goto klaar",
    "set /a n+=1",
    "if %n% geq 90 goto mislukt",
    "ping -n 2 127.0.0.1 >nul",
    "goto probeer",
    ":klaar",
    'if defined LOG echo %date% %time% Bestand vervangen, app start opnieuw >> "%LOG%"',
    'start "" "%OUD%"',
    "exit /b 0",
    ":mislukt",
    'if defined LOG echo %date% %time% Vervangen mislukt na 90 pogingen >> "%LOG%"',
    'start "" explorer.exe /select,"%NIEUW%"',
    "exit /b 1",
    ""
  ].join("\r\n");
}

/* Schrijft het hulpscript en start het los van de app. De app moet daarna zelf afsluiten. */
function vervangWin(oud, nieuw, scriptDir, spawnFn) {
  fs.mkdirSync(scriptDir, { recursive: true });
  const script = path.join(scriptDir, "bijwerken.cmd");
  fs.writeFileSync(script, cmdTekst(oud, nieuw, path.join(scriptDir, "bijwerken.log")), "utf8");
  const sp = (spawnFn || spawn)("cmd.exe", ["/d", "/s", "/c", '""' + script + '""'], { detached: true, stdio: "ignore", windowsHide: true, windowsVerbatimArguments: true });
  if (sp && sp.unref) sp.unref();
  return script;
}

module.exports = { OK_URL, kiesAsset, haalOp, isExe, cmdTekst, vervangWin };
