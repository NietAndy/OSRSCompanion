"""Kondigt een nieuwe beta aan in het testkanaal van Discord, met een ping voor de rol Beta.

Wordt gestart door de workflow "Beta publiceren". Gebruikt dezelfde bot als de bugmeldingen (DISCORD_BOT_TOKEN).
De bot heeft in het testkanaal de rechten Kanaal bekijken en Berichten versturen nodig. Om de rol te kunnen pingen
moet bij die rol "Iedereen mag deze rol vermelden" aan staan.

Benodigd (omgevingsvariabelen): DISCORD_BOT_TOKEN, BETA_KANAAL, BETA_ROL, VERSIE, RELEASE_URL, NOTITIES_BESTAND, GITHUB_REPOSITORY.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

DC = "https://discord.com/api/v10"
MAX_NOTITIES = 1100


def bouw_bericht(versie, url, notities, rol):
    tekst = (notities or "").replace("\r\n", "\n").strip()
    if len(tekst) > MAX_NOTITIES:
        tekst = tekst[:MAX_NOTITIES].rsplit("\n", 1)[0] + "\n…"
    delen = []
    if rol:
        delen.append("<@&" + rol + "> **Nieuwe beta: versie " + versie + "**")
    else:
        delen.append("**Nieuwe beta: versie " + versie + "**")
    if tekst:
        delen.append(tekst)
    delen.append(
        "**Zo krijg je hem:** open Gielinor Guide. Binnen ongeveer 10 minuten staat er een melding bij Controleer op updates "
        "linksonder, met een BETA-label. Klik op Nu bijwerken, meer hoef je niet te doen.\n"
        "Iets gevonden? Gebruik Meld een probleem linksonder in de app, of reageer hier. Details: <" + url + ">"
    )
    return {
        "content": "\n\n".join(delen)[:1990],
        "allowed_mentions": {"parse": [], "roles": [rol] if rol else []},
    }


def verstuur(token, kanaal, payload, repo):
    body = json.dumps(payload).encode("utf-8")
    for poging in range(3):
        req = urllib.request.Request(
            DC + "/channels/" + kanaal + "/messages", data=body, method="POST",
            headers={"Authorization": "Bot " + token, "Content-Type": "application/json",
                     "User-Agent": "DiscordBot (https://github.com/" + repo + ", 1.0)"})
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
    token = os.environ.get("DISCORD_BOT_TOKEN", "").strip()
    kanaal = os.environ.get("BETA_KANAAL", "").strip()
    rol = os.environ.get("BETA_ROL", "").strip()
    versie = os.environ.get("VERSIE", "").strip()
    url = os.environ.get("RELEASE_URL", "").strip()
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    if not token or not kanaal.isdigit() or not versie:
        print("DISCORD_BOT_TOKEN, BETA_KANAAL of VERSIE ontbreekt. Er is niets aangekondigd.")
        return 1
    notities = ""
    pad = os.environ.get("NOTITIES_BESTAND", "")
    if pad and os.path.isfile(pad):
        with open(pad, encoding="utf-8") as f:
            notities = f.read()
    st, uit = verstuur(token, kanaal, bouw_bericht(versie, url, notities, rol if rol.isdigit() else ""), repo)
    if st in (200, 201):
        print("Beta aangekondigd in het testkanaal.")
        return 0
    print("Aankondigen mislukt:", st, uit.decode("utf-8", "replace"))
    if st in (401, 403):
        print("Geef de bot in het testkanaal de rechten Kanaal bekijken en Berichten versturen.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
