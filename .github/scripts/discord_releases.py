"""Stuurt het verhaaltje van een release (RELEASE-STORY-x.y.z.md) naar een Discord-webhook (#releases)."""
import json, os, re, sys, urllib.request, urllib.error

def lees_verhaal(versie):
    pad = "RELEASE-STORY-" + versie + ".md"
    if not os.path.isfile(pad):
        return None
    with open(pad, encoding="utf-8") as f:
        return f.read().replace("\r\n", "\n").strip()

def bouw(versie, repo, tekst):
    titel = "Gielinor Guide " + versie + " is uit!"
    m = re.match(r"#\s+(.+?)\s*\n", tekst + "\n")
    if m:
        titel = m.group(1)
        tekst = tekst[m.end():].strip()
    if len(tekst) > 3800:
        tekst = tekst[:3800].rsplit("\n", 1)[0] + "\n…"
    return {
        "username": "Release Bot",
        "embeds": [{
            "title": titel[:250],
            "url": "https://github.com/" + repo + "/releases/tag/v" + versie if repo else None,
            "description": tekst,
            "color": 0xF2C14E,
            "footer": {"text": "Weekly release · Gielinor Guide " + versie},
        }],
        "allowed_mentions": {"parse": []},
    }

ROL_STANDAARD = "1563825748366852096"   # rol die bij elk verhaaltje in #releases wordt getagd

def met_rol(payload, rol):
    rol = (rol or "").strip() or ROL_STANDAARD
    if rol.isdigit() and 15 <= len(rol) <= 22:
        payload["content"] = "<@&" + rol + ">"
        payload["allowed_mentions"] = {"parse": [], "roles": [rol]}
    return payload

def main():
    versie = os.environ.get("VERSIE", "").strip().lstrip("vV")
    repo = os.environ.get("REPO", "").strip()
    hook = os.environ.get("WEBHOOK", "").strip().strip("'\"").strip()
    if not versie:
        print("Geen versie opgegeven. Niets verstuurd."); return 1
    tekst = lees_verhaal(versie)
    if not tekst:
        print("Geen RELEASE-STORY-" + versie + ".md gevonden. Niets verstuurd."); return 0
    payload = met_rol(bouw(versie, repo, tekst), os.environ.get("ROL"))
    if "--dry" in sys.argv:
        print(json.dumps(payload, ensure_ascii=False, indent=2)); return 0
    if not hook:
        print("De secret DISCORD_RELEASES_WEBHOOK is leeg of bestaat niet. Zet hem bij Settings > Secrets and variables > Actions > Repository secrets (niet bij Variables of Environment secrets). Niets verstuurd."); return 1
    if not (hook.startswith("https://discord.com/api/webhooks/") or hook.startswith("https://discordapp.com/api/webhooks/")):
        print("De secret DISCORD_RELEASES_WEBHOOK bevat geen Discord-webhook-URL. Hij moet beginnen met https://discord.com/api/webhooks/ . Kopieer hem opnieuw uit Discord. Niets verstuurd."); return 1
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
