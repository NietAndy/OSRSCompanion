"""Kondigt een nieuwe beta aan in het testkanaal van Discord, met een ping voor de rol Beta.

Wordt gestart door de workflow "Beta publiceren". Post via een webhook van het testkanaal, net als #releases en #changelog.
Om de rol te kunnen pingen moet bij die rol "Iedereen mag deze rol vermelden" aan staan.

Benodigd (omgevingsvariabelen): DISCORD_BETA_WEBHOOK (secret), BETA_ROL, VERSIE, RELEASE_URL, NOTITIES_BESTAND.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

import discord_opmaak as o

DC = "https://discord.com/api/v10"
MAX_NOTITIES = 1100


def bouw_bericht(versie, url, notities, rol):
    """De aankondiging van een testversie: BETA-label, wat er nieuw is, wat je kunt testen, hoe je hem krijgt en waar je feedback geeft."""
    intro, onderdelen = o.secties(notities)
    velden = o.velden(onderdelen, hernoem={"Nieuw": "Nieuw in deze testversie"})
    velden = velden[:4]
    velden.append({"name": "Zo krijg je hem", "inline": False, "value":
                   "Open Gielinor Guide. Binnen ongeveer 10 minuten staat er een melding bij Controleer op updates linksonder, met het label BETA. Klik op Nu bijwerken."})
    velden.append({"name": "Iets gevonden?", "inline": False, "value":
                   "Gebruik Meld een probleem linksonder in de app, of schrijf het hier."})
    beschrijving = intro or "Dit is een testversie. De gewone release volgt en vervangt deze versie vanzelf."
    return {
        "username": "Beta Bot",
        "content": ("<@&" + rol + ">") if rol else "",
        "embeds": [{
            "author": {"name": "BETA"},
            "title": ("Testversie " + versie)[:250],
            "description": o.kort(beschrijving, 3000),
            "color": o.KLEUR["beta"],
            "fields": velden,
            "footer": {"text": "Beta · alleen voor testers · versie " + versie + " · " + o.datum_nl()},
        }],
        "allowed_mentions": {"parse": [], "roles": [rol] if rol else []},
    }


def verstuur(hook, payload):
    body = json.dumps(payload).encode("utf-8")
    for poging in range(3):
        req = urllib.request.Request(
            hook, data=body, method="POST",
            headers={"Content-Type": "application/json", "User-Agent": "OSRSCompanion-beta-bot (GitHub Actions)"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.status, r.read()[:200]
        except urllib.error.HTTPError as e:
            uit = e.read()[:300]
            if e.code in (429, 500, 502, 503, 504) and poging < 2:
                time.sleep(3 * (poging + 1))
                continue
            return e.code, uit
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            if poging < 2:
                time.sleep(3 * (poging + 1))
                continue
            return 599, str(e).encode("utf-8")[:200]
    return 599, b""


def main():
    hook = os.environ.get("DISCORD_BETA_WEBHOOK", "").strip().strip("'\"").strip()
    rol = os.environ.get("BETA_ROL", "").strip()
    versie = os.environ.get("VERSIE", "").strip()
    url = os.environ.get("RELEASE_URL", "").strip()
    if not hook:
        print("De secret DISCORD_BETA_WEBHOOK is leeg of bestaat niet. Zet hem bij Settings > Secrets and variables > Actions > Repository secrets (niet bij Variables of Environment secrets). Niets aangekondigd.")
        return 1
    if not hook.startswith(("https://discord.com/api/webhooks/", "https://discordapp.com/api/webhooks/")):
        print("De secret DISCORD_BETA_WEBHOOK bevat geen Discord-webhook-URL. Hij moet beginnen met https://discord.com/api/webhooks/ . Kopieer hem opnieuw uit Discord. Niets aangekondigd.")
        return 1
    if not versie:
        print("Geen versie opgegeven. Niets aangekondigd.")
        return 1
    notities = ""
    pad = os.environ.get("NOTITIES_BESTAND", "")
    if pad and os.path.isfile(pad):
        with open(pad, encoding="utf-8") as f:
            notities = f.read()
    st, uit = verstuur(hook, bouw_bericht(versie, url, notities, rol if rol.isdigit() else ""))
    if st in (200, 201, 204):
        print("Beta aangekondigd in het testkanaal.")
        return 0
    print("Aankondigen mislukt:", st, uit.decode("utf-8", "replace"))
    return 1


if __name__ == "__main__":
    sys.exit(main())
