/* Logboek: foutmeldingen en belangrijke gebeurtenissen, alleen op deze pc bewaard (als regels JSON in een bestand). */
const fs = require("fs");
const path = require("path");

const MAX_REGELS = 200;
const MAX_BYTES = 300 * 1024;

function maak(dir) {
  const bestand = path.join(dir, "logboek.jsonl");
  const vlag = path.join(dir, "vastgelopen.vlag");
  const kort = (s, n) => String(s == null ? "" : s).slice(0, n);

  function schoon(e) {
    e = e && typeof e === "object" ? e : {};
    return {
      t: Number(e.t) > 0 ? Number(e.t) : Date.now(),
      niveau: ["fout", "waarschuwing", "info"].indexOf(e.niveau) >= 0 ? e.niveau : "fout",
      bron: kort(e.bron, 60),
      tekst: kort(e.tekst, 1500),
      plek: kort(e.plek, 300),
      pagina: kort(e.pagina, 40),
      versie: kort(e.versie, 20)
    };
  }

  function lees() {
    let tekst = "";
    try { tekst = fs.readFileSync(bestand, "utf8"); } catch (x) { return []; }
    const uit = [];
    tekst.split("\n").forEach((r) => { if (!r) return; try { uit.push(schoon(JSON.parse(r))); } catch (x) {} });
    return uit.slice(-MAX_REGELS);
  }

  function schrijf(e) {
    const r = schoon(e);
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.appendFileSync(bestand, JSON.stringify(r) + "\n", "utf8");
      let groot = false;
      try { groot = fs.statSync(bestand).size > MAX_BYTES; } catch (x) {}
      if (groot) fs.writeFileSync(bestand, lees().slice(-Math.floor(MAX_REGELS / 2)).map((q) => JSON.stringify(q)).join("\n") + "\n", "utf8");
    } catch (x) {}
    return r;
  }

  function wis() { try { fs.rmSync(bestand, { force: true }); } catch (x) {} return true; }
  function markeerVastgelopen() { try { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(vlag, String(Date.now()), "utf8"); } catch (x) {} }
  function leesVastgelopen() { let ja = false; try { ja = fs.existsSync(vlag); if (ja) fs.rmSync(vlag, { force: true }); } catch (x) {} return ja; }

  return { schrijf, lees, wis, markeerVastgelopen, leesVastgelopen };
}

module.exports = { maak, MAX_REGELS };
