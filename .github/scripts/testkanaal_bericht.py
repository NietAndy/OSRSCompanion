"""Plaatst een mededeling in het testkanaal van Discord, met een ping voor de rol Beta.

De tekst staat in een bestand in .github/discord-berichten/ (eerste regel: de titel, daarna een inleiding en onderdelen met ##).
Wordt gestart door de workflow "Testkanaal bericht". Post via dezelfde webhook als de beta-aankondigingen.

Benodigd (omgevingsvariabelen): DISCORD_BETA_WEBHOOK (secret), BETA_ROL, BERICHT_BESTAND, VOETTEKST (optioneel).
Met DRY_RUN=1 wordt alleen getoond wat er gepost zou worden.
"""
import json
import os
import re
import sys

import discord_opmaak as o
from beta_aankondiging import verstuur


def bouw_bericht(md, rol, voettekst):
    titel = re.match(r"\s*#\s+(.+)", md or "")
    intro, onderdelen = o.secties(md)
    return {
        "username": "Beta Bot",
        "content": ("<@&" + rol + ">") if rol else "",
        "embeds": [{
            "author": {"name": "BETA"},
            "title": (titel.group(1).strip() if titel else "Mededeling")[:250],
            "description": o.kort(intro, 3000),
            "color": o.KLEUR["beta"],
            "fields": o.velden(onderdelen),
            "footer": {"text": voettekst},
        }],
        "allowed_mentions": {"parse": [], "roles": [rol] if rol else []},
    }


def main():
    pad = os.environ.get("BERICHT_BESTAND", "").strip()
    if not pad or not os.path.isfile(pad) or not pad.startswith(".github/discord-berichten/"):
        print("Geen geldig berichtbestand opgegeven (het moet in .github/discord-berichten/ staan). Niets geplaatst.")
        return 1
    with open(pad, encoding="utf-8") as f:
        md = f.read()
    rol = os.environ.get("BETA_ROL", "").strip()
    voet = os.environ.get("VOETTEKST", "").strip() or ("Beta · " + o.dag_datum_nl())
    payload = bouw_bericht(md, rol if rol.isdigit() else "", voet)
    if os.environ.get("DRY_RUN") == "1":
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0
    hook = os.environ.get("DISCORD_BETA_WEBHOOK", "").strip().strip("'\"").strip()
    if not hook.startswith(("https://discord.com/api/webhooks/", "https://discordapp.com/api/webhooks/")):
        print("De secret DISCORD_BETA_WEBHOOK is leeg of geen Discord-webhook. Niets geplaatst.")
        return 1
    st, uit = verstuur(hook, payload)
    if st in (200, 201, 204):
        print("Bericht geplaatst in het testkanaal.")
        return 0
    print("Plaatsen mislukt:", st, uit.decode("utf-8", "replace"))
    return 1


if __name__ == "__main__":
    sys.exit(main())
