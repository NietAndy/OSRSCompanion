"""Stuurt de releasenotities van een GitHub-release naar een Discord-webhook (#changelog)."""
import glob, json, os, re, sys, urllib.request, urllib.error
import discord_opmaak as o

def versie_van(pad):
    m = re.search(r"RELEASE-NOTES-([\d.]+)\.md$", pad)
    return m.group(1) if m else ""

def sleutel(v):
    return tuple(int(x) for x in v.split(".") if x.isdigit())

def notities(versie):
    """Zoekt de releasenotities in de repo: de gevraagde versie, anders de nieuwste."""
    bestanden = glob.glob("RELEASE-NOTES-*.md")
    if not bestanden:
        return "", ""
    kies = None
    if versie:
        for b in bestanden:
            if versie_van(b) == versie.lstrip("vV"):
                kies = b
    if not kies:
        kies = max(bestanden, key=lambda b: sleutel(versie_van(b)))
    with open(kies, encoding="utf-8") as f:
        return versie_van(kies), f.read()

def bouw(naam, tag, url, body):
    """Het changelog-bericht: kop "Versie x" of "Hotfix x", een regel met soort en datum, en de velden Nieuw, Verbeterd en Opgelost."""
    versie = o.versie_uit(tag, naam)
    hotfix = o.is_hotfix(versie)
    intro, onderdelen = o.secties(body)
    regel = ("Hotfix" if hotfix else "Weekly release") + " · " + o.dag_datum_nl()
    velden = o.velden(onderdelen)
    beschrijving = regel + (("\n\n" + intro) if intro else "")
    if not velden and not intro:
        beschrijving += "\n\nEr staat een nieuwe versie klaar. " + o.ROUTE
    titel = (("Hotfix " if hotfix else "Versie ") + versie) if versie else (naam or "Nieuwe versie")
    return {
        "username": "Changelog Bot",
        "embeds": [{
            "title": titel[:250],
            "description": o.kort(beschrijving, 3500),
            "color": o.KLEUR["hotfix" if hotfix else "release"],
            "fields": velden,
            "footer": {"text": o.ROUTE},
        }],
        "allowed_mentions": {"parse": []},
    }

ROL_STANDAARD = "1563825662836473936"   # rol die bij elke changelog wordt getagd

def met_rol(payload, rol):
    """Zet een @rol-vermelding boven het bericht, als er een geldig rol-ID is ingesteld."""
    rol = (rol or "").strip() or ROL_STANDAARD
    if rol.isdigit() and 15 <= len(rol) <= 22:
        payload["content"] = "<@&" + rol + ">"
        payload["allowed_mentions"] = {"parse": [], "roles": [rol]}
    return payload

def main():
    hook = os.environ.get("WEBHOOK", "").strip()
    naam, tag, url, body = os.environ.get("NAME"), os.environ.get("TAG"), os.environ.get("URL"), os.environ.get("BODY")
    if not (body or "").strip():
        # Handmatige run: neem de releasenotities uit de repo
        v, body = notities(os.environ.get("VERSIE", ""))
        if v:
            naam, tag = "Versie " + v, "v" + v
            url = (url or "").rstrip("/") + "/tag/v" + v if url else None
    payload = met_rol(bouw(naam, tag, url, body), os.environ.get("ROL"))
    if "--dry" in sys.argv:
        print(json.dumps(payload, ensure_ascii=False, indent=2)); return 0
    if not hook.startswith("https://discord.com/api/webhooks/") and not hook.startswith("https://discordapp.com/api/webhooks/"):
        print("Geen geldige DISCORD_CHANGELOG_WEBHOOK secret ingesteld. Niets verstuurd.")
        return 1
    req = urllib.request.Request(hook, data=json.dumps(payload).encode("utf-8"),
                                 headers={"Content-Type": "application/json", "User-Agent": "OSRSCompanion-release-bot (GitHub Actions)"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            print("Verstuurd naar Discord, status", r.status)
    except urllib.error.HTTPError as e:
        print("Discord gaf een fout:", e.code, e.read().decode("utf-8", "replace")[:300]); return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
