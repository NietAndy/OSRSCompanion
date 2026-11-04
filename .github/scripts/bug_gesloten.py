"""Zet in de Discord-thread van een bugmelding dat het issue gesloten (of heropend) is.

De thread onder een melding heeft hetzelfde ID als het bericht; dat ID staat in het issue
als <!-- discord-bericht: ID -->. Bij sluiten: bericht met tag van de melder, daarna de thread
archiveren en vergrendelen. Bij heropenen: thread weer openen met een bericht.
Benodigde rechten voor de bot in #bugs: Berichten sturen in threads en Threads beheren.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request

DC = "https://discord.com/api/v10"
BOT = os.environ.get("DISCORD_BOT_TOKEN", "").strip()
REPO = os.environ.get("GITHUB_REPOSITORY", "")


def dc(method, pad, data=None):
    h = {"Authorization": "Bot " + BOT, "User-Agent": "DiscordBot (https://github.com/" + REPO + ", 1.0)"}
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(DC + pad, data=body, method=method, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            b = r.read()
            try:
                return r.status, json.loads(b) if b else None
            except ValueError:
                return r.status, b[:300]
    except urllib.error.HTTPError as e:
        return e.code, e.read()[:300]


def oplossing_versie(nummer):
    """Zoekt de nieuwste versie waarvan de releasenotities naar dit issue verwijzen, bijvoorbeeld (#5). Geen gevonden: None."""
    import glob
    gevonden = []
    for pad in glob.glob("RELEASE-NOTES-*.md"):
        v = re.match(r"RELEASE-NOTES-(\d+(?:\.\d+)*)\.md$", os.path.basename(pad))
        if not v:
            continue
        try:
            with open(pad, encoding="utf-8") as f:
                tekst = f.read()
        except OSError:
            continue
        if re.search(r"(?<![\w#])#" + str(nummer) + r"(?!\d)", tekst):
            gevonden.append((tuple(int(x) for x in v.group(1).split(".")), v.group(1)))
    return max(gevonden)[1] if gevonden else None


def main():
    if not BOT:
        print("DISCORD_BOT_TOKEN ontbreekt.")
        return 0
    with open(os.environ["GITHUB_EVENT_PATH"], encoding="utf-8") as f:
        ev = json.load(f)
    actie = ev.get("action")
    iss = ev.get("issue") or {}
    m = re.search(r"discord-bericht: (\d+)", iss.get("body") or "")
    if not m:
        print("Geen Discord-bericht in dit issue.")
        return 0
    thread = m.group(1)
    url = iss.get("html_url", "")
    # De melder taggen: zijn ID staat in het eerste bericht van de bot in de thread
    tag, users = "", []
    st, msgs = dc("GET", "/channels/" + thread + "/messages?limit=20")
    if st == 200 and isinstance(msgs, list):
        for x in reversed(msgs):
            t = re.search(r"<@(\d{15,25})>", x.get("content") or "")
            if t:
                tag, users = "<@" + t.group(1) + "> ", [t.group(1)]
                break
    if actie == "closed":
        reden = iss.get("state_reason")
        if reden == "not_planned":
            tekst = (tag + "Update over je melding: we hebben deze afgesloten zonder de app aan te passen. Dat kan zijn omdat het geen bug is, het al bekend was of de app bewust zo werkt. Je melding is wel gelezen en bijgehouden.\n\n"
                     "Denk je dat dit niet klopt, of heb je meer informatie? Reageer dan in deze thread, dan kijken we er opnieuw naar.")
        else:
            versie = oplossing_versie(iss.get("number"))
            waar = ("in versie " + versie) if versie else "in een volgende versie"
            tekst = (tag + "✅ Goed nieuws: je melding is opgelost! De oplossing zit " + waar + " van de app. Zodra die uit is, zie je dat via **Controleer op updates** linksonder in de app.\n\n"
                     "Werkt het bij jou na de update toch nog niet goed, laat het ons dan weten via een nieuwe melding.")
        if dc("PATCH", "/channels/" + thread, {"archived": False})[0] not in (200, 201):
            pass
        st, r = dc("POST", "/channels/" + thread + "/messages", {"content": tekst, "allowed_mentions": {"parse": [], "users": users}})
        print("Bericht:", st)
        st, r = dc("PATCH", "/channels/" + thread, {"archived": True, "locked": True})
        if st not in (200, 201):
            print("Vergrendelen lukte niet (geef de bot het recht Threads beheren):", st, r)
            st, r = dc("PATCH", "/channels/" + thread, {"archived": True})
            print("Archiveren:", st)
    elif actie == "reopened":
        dc("PATCH", "/channels/" + thread, {"archived": False, "locked": False})
        st, r = dc("POST", "/channels/" + thread + "/messages", {"content": (tag + "Update over je melding: we hebben deze weer geopend, omdat er nog werk aan is of er nieuwe informatie is bijgekomen. Zodra er nieuws is, laten we het je hier weten."), "allowed_mentions": {"parse": [], "users": users}})
        print("Heropend, bericht:", st)
    return 0


if __name__ == "__main__":
    sys.exit(main())
