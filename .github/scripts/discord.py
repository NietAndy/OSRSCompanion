"""Stuurt de releasenotities van een GitHub-release naar een Discord-webhook (#changelog)."""
import glob, json, os, re, sys, urllib.request, urllib.error

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
    tekst = (body or "").replace("\r\n", "\n").strip()
    # De eerste kop (de versietitel) staat al als titel van het bericht
    tekst = re.sub(r"\A#\s+.*\n+", "", tekst)
    # Koppen worden vet, dat leest in Discord overal goed
    tekst = re.sub(r"^#{1,6}\s*(.+?)\s*$", r"**\1**", tekst, flags=re.M)
    if not tekst:
        tekst = "Er staat een nieuwe versie klaar. Zie de release voor de details."
    if len(tekst) > 3800:
        tekst = tekst[:3800].rsplit("\n", 1)[0] + "\n…"
    titel = ("🚀 " + (naam or tag or "Nieuwe versie"))[:250]
    return {
        "username": "Changelog Bot",
        "embeds": [{
            "title": titel,
            "url": url or None,
            "description": tekst,
            "color": 0xF2C14E,
            "footer": {"text": "Download de nieuwste versie via de release, of laat de app zichzelf bijwerken."},
        }],
        "allowed_mentions": {"parse": []},
    }

def met_rol(payload, rol):
    """Zet een @rol-vermelding boven het bericht, als er een geldig rol-ID is ingesteld."""
    rol = (rol or "").strip()
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
