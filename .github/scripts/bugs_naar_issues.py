"""Zet nieuwe bugmeldingen uit het Discord-kanaal #bugs om in GitHub-issues.

Werking (draait elke 15 minuten via .github/workflows/bugs-naar-issues.yml):
1. Leest de laatste berichten in #bugs met een Discord-bot.
2. Neemt alleen meldingen van de app (webhookberichten met een kaart) die nog geen vinkje van de bot hebben.
3. Laat GitHub Models (gratis) een uitgebreidere uitwerking schrijven. Lukt dat niet, dan komt het issue er zonder.
4. Maakt een issue met het label "bug", zet een vinkje bij de melding en antwoordt met de link.

Benodigde secrets: DISCORD_BOT_TOKEN, DISCORD_BUGS_KANAAL. GITHUB_TOKEN komt van GitHub zelf.
Optionele variabele: TOON_MELDER=1 zet de Discord-naam van de melder in het issue (alleen doen bij een privé-repo).
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

DC = "https://discord.com/api/v10"
GH = "https://api.github.com"
AI_URL = "https://models.github.ai/inference/chat/completions"
AI_MODEL = os.environ.get("AI_MODEL", "openai/gpt-4.1-mini")
VINK = "✅"
MAX_PER_RUN = 5

BOT = os.environ.get("DISCORD_BOT_TOKEN", "").strip()
KANAAL = os.environ.get("DISCORD_BUGS_KANAAL", "").strip()
GHTOKEN = os.environ.get("GITHUB_TOKEN", "").strip()
REPO = os.environ.get("GITHUB_REPOSITORY", "").strip()
TOON_MELDER = os.environ.get("TOON_MELDER", "") == "1"
DROOG = os.environ.get("DROOG", "") == "1"  # alleen tonen wat er zou gebeuren


def http(method, url, headers=None, data=None, raw=False, timeout=30, tries=1):
    """Doet een aanvraag. Bij een serverfout (5xx) of een netwerkfout probeert hij het tot `tries` keer, met een pauze ertussen."""
    for poging in range(tries):
        st, uit = _http_een(method, url, headers, data, raw, timeout)
        if (st is not None and st < 500) or poging == tries - 1:
            return st, uit
        print("Tijdelijke fout", st, "bij", method, url.split("?")[0], "- nog een poging.")
        time.sleep(3 * (poging + 1))


def _http_een(method, url, headers=None, data=None, raw=False, timeout=30):
    body = None
    h = dict(headers or {})
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, method=method, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            b = r.read()
            if raw:
                return r.status, b
            if not b:
                return r.status, None
            try:
                return r.status, json.loads(b)
            except ValueError:
                return r.status, b.decode("utf-8", "replace")[:500]
    except urllib.error.HTTPError as e:
        try:
            txt = e.read().decode("utf-8", "replace")[:500]
        except Exception:
            txt = ""
        return e.code, txt
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        return 599, str(e)[:200]


def dc(method, pad, data=None):
    return http(method, DC + pad, {"Authorization": "Bot " + BOT, "User-Agent": "DiscordBot (https://github.com/" + REPO + ", 1.0)"}, data, tries=herhaal(method))


def herhaal(method):
    """Alleen opvragen en vinkjes zetten mogen we veilig herhalen; iets aanmaken niet, anders komt het dubbel."""
    return 3 if method in ("GET", "PUT") else 1


def gh(method, pad, data=None):
    return http(method, GH + pad, {"Authorization": "Bearer " + GHTOKEN, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "gielinor-guide-bugs"}, data, tries=herhaal(method))


def heeft_vink(m):
    for r in m.get("reactions") or []:
        if (r.get("emoji") or {}).get("name") == VINK and r.get("me"):
            return True
    return False


def is_melding(m):
    e = (m.get("embeds") or [None])[0]
    return bool(m.get("webhook_id") and e and e.get("title"))


def velden(e):
    return {f.get("name", ""): f.get("value", "") for f in e.get("fields") or []}


def anoniem(t):
    t = re.sub(r"([A-Za-z]:[\\/]+Users[\\/]+)[^\\/|\n]+", r"\1<naam>", t)
    t = re.sub(r"(/(?:home|Users)/)[^/|\n]+", r"\1<naam>", t)
    return t


def logboek(m):
    for a in m.get("attachments") or []:
        if a.get("filename") == "logboek.txt" and a.get("url"):
            st, b = http("GET", a["url"], {"User-Agent": "gielinor-guide-bugs"}, raw=True)
            if st == 200 and isinstance(b, (bytes, bytearray)):
                regels = b[:60000].decode("utf-8", "replace").splitlines()
                return anoniem("\n".join(regels[-40:]))
    return ""


def ai_uitwerking(titel, tekst, v, log):
    prompt = (
        "Je helpt de ontwikkelaar van Gielinor Guide, een Nederlandse Windows-app (Electron) voor Old School RuneScape-spelers. "
        "Een gebruiker heeft een bug gemeld. Schrijf in het Nederlands een uitwerking voor een GitHub-issue met precies deze kopjes in Markdown:\n"
        "### Samenvatting\n### Stappen om het na te doen\n### Verwacht\n### Wat er gebeurde\n### Opvallend in het logboek\n### Waar in de app zoeken\n"
        "Regels: verzin geen feiten. Als iets niet uit de melding of het logboek blijkt, schrijf dan 'Onbekend' of formuleer het als vraag aan de melder. "
        "Houd het kort en concreet. Geen begroeting, geen afsluiting.\n\n"
        "Titel: " + titel + "\nBeschrijving: " + tekst + "\nWat deed de melder vlak daarvoor: " + v.get("Wat deed je vlak daarvoor?", "(leeg)") +
        "\nVersie: " + v.get("Versie", "?") + "\nPagina: " + v.get("Pagina", "?") + "\nSysteem: " + v.get("Systeem", "?") +
        "\nLogboek (laatste regels):\n" + (log[-6000:] if log else "(geen logboek meegestuurd)")
    )
    st, r = http("POST", AI_URL, {"Authorization": "Bearer " + GHTOKEN, "Accept": "application/json"}, {
        "model": AI_MODEL, "temperature": 0.2, "max_tokens": 900,
        "messages": [{"role": "system", "content": "Je bent een zorgvuldige assistent die bugmeldingen uitwerkt. Je antwoordt alleen met de gevraagde Markdown."},
                     {"role": "user", "content": prompt}]}, timeout=60)
    if st != 200 or not isinstance(r, dict):
        print("AI niet gelukt (het issue komt er zonder uitwerking):", st, str(r)[:300])
        return ""
    try:
        return r["choices"][0]["message"]["content"].strip()
    except Exception:
        return ""


def citaat(t):
    return "\n".join("> " + r for r in (t or "").splitlines()) or "> (leeg)"


def issue_tekst(m, e, v, uitw, log):
    rijen = [("Versie", v.get("Versie", "?")), ("Pagina", v.get("Pagina", "?")), ("Systeem", v.get("Systeem", "?"))]
    if TOON_MELDER:
        rijen.append(("Melder", re.sub(r"\s*\(<@\d+>\)", "", v.get("Melder", "?"))))
    tabel = "| | |\n|---|---|\n" + "\n".join("| " + a + " | " + str(b).replace("|", "/") + " |" for a, b in rijen)
    delen = []
    if uitw:
        delen.append("## Uitwerking door AI (controleer dit)\n\n" + uitw)
    delen.append("## Originele melding\n\n**" + e.get("title", "") + "**\n\n" + citaat(e.get("description", "")))
    if v.get("Wat deed je vlak daarvoor?"):
        delen.append("**Wat deed de melder vlak daarvoor?**\n\n" + citaat(v["Wat deed je vlak daarvoor?"]))
    delen.append("## Gegevens\n\n" + tabel)
    if log:
        delen.append("<details><summary>Logboek (laatste regels)</summary>\n\n```\n" + log.replace("```", "'''") + "\n```\n</details>")
    link = "https://discord.com/channels/" + str(m.get("guild_id") or "@me") + "/" + KANAAL + "/" + m["id"]
    delen.append("Gemeld via de app op " + m.get("timestamp", "")[:16].replace("T", " ") + " UTC. [Melding in Discord](" + link + ")\n\n<!-- discord-bericht: " + m["id"] + " -->")
    return "\n\n".join(delen)


def antwoord(m, v, url):
    """Maakt een thread onder de melding en tagt de melder daarin. Lukt de thread niet, dan een gewoon antwoord."""
    mid = re.search(r"<@(\d{15,25})>", v.get("Melder", ""))
    tag = ("<@" + mid.group(1) + "> ") if mid else ""
    tekst = (tag + "Bedankt voor je melding! We hebben hem vastgelegd op GitHub, zodat hij niet verloren gaat: <" + url + ">\n\n"
             "**Wat er nu gebeurt**\n"
             "- We bekijken je melding en proberen het probleem na te bootsen.\n"
             "- Zodra er nieuws is, zoals een vraag, een oplossing of een besluit, laten we het je hier weten.\n\n"
             "**Kun je helpen?**\n"
             "Zet in deze thread alles wat je nog weet: de stappen waarmee het probleem terugkomt, wat je had verwacht en eventueel een screenshot. Hoe meer we weten, hoe sneller we het kunnen oplossen.")
    mentions = {"parse": [], "users": [mid.group(1)] if mid else []}
    naam = ("Bug: " + ((m.get("embeds") or [{}])[0].get("title") or "melding"))[:95]
    st, th = dc("POST", "/channels/" + KANAAL + "/messages/" + m["id"] + "/threads", {"name": naam, "auto_archive_duration": 10080})
    if st in (200, 201) and isinstance(th, dict) and th.get("id"):
        st2, r2 = dc("POST", "/channels/" + th["id"] + "/messages", {"content": tekst, "allowed_mentions": mentions})
        if st2 in (200, 201):
            return
        print("Bericht in thread mislukt:", st2, str(r2)[:200])
    else:
        print("Thread maken mislukt (geeft de bot het recht Openbare threads creeren?):", st, str(th)[:200])
    dc("POST", "/channels/" + KANAAL + "/messages", {"content": tekst, "message_reference": {"message_id": m["id"]}, "allowed_mentions": mentions})


def zorg_labels():
    for naam, kleur, uitleg in (("bug", "d73a4a", "Iets werkt niet zoals het hoort"), ("uit-de-app", "f2c14e", "Gemeld via Meld een probleem in de app")):
        st, _ = gh("GET", "/repos/" + REPO + "/labels/" + urllib.parse.quote(naam))
        if st == 404:
            gh("POST", "/repos/" + REPO + "/labels", {"name": naam, "color": kleur, "description": uitleg})


def al_gedaan():
    ids = {}
    st, r = gh("GET", "/repos/" + REPO + "/issues?state=all&labels=uit-de-app&per_page=100")
    if st == 200 and isinstance(r, list):
        for i in r:
            for x in re.findall(r"discord-bericht: (\d+)", i.get("body") or ""):
                ids[x] = i.get("html_url", "")
    return ids


def main():
    if not BOT or not KANAAL:
        print("DISCORD_BOT_TOKEN of DISCORD_BUGS_KANAAL ontbreekt. Zie de uitleg bovenaan dit script.")
        return 0
    st, msgs = dc("GET", "/channels/" + KANAAL + "/messages?limit=50")
    if st != 200 or not isinstance(msgs, list):
        print("Kan #bugs niet lezen:", st, msgs)
        return 1
    nieuw = [m for m in reversed(msgs) if is_melding(m) and not heeft_vink(m)]
    if not nieuw:
        print("Geen nieuwe meldingen.")
        return 0
    if not DROOG:
        zorg_labels()
    gedaan = al_gedaan()
    for m in nieuw[:MAX_PER_RUN]:
        e = m["embeds"][0]
        v = velden(e)
        if m["id"] in gedaan:
            print("Al een issue voor", m["id"])
            if not DROOG:
                dc("PUT", "/channels/" + KANAAL + "/messages/" + m["id"] + "/reactions/" + urllib.parse.quote(VINK) + "/@me")
            continue
        if not (e.get("description") or "").strip():
            print("Lege beschrijving bij", m["id"], "- de bot heeft waarschijnlijk geen Message Content Intent.")
        log = logboek(m)
        try:
            uitw = ai_uitwerking(e.get("title", ""), e.get("description", ""), v, log)
        except Exception as x:
            print("AI niet gelukt (het issue komt er zonder uitwerking):", x)
            uitw = ""
        titel = "[Bug] " + e.get("title", "Melding uit de app")[:110]
        body = issue_tekst(m, e, v, uitw, log)
        if DROOG:
            print("=== zou aanmaken:", titel, "\n", body[:1500])
            continue
        url = None
        for poging in range(3):
            st, r = gh("POST", "/repos/" + REPO + "/issues", {"title": titel, "body": body[:60000], "labels": ["bug", "uit-de-app"]})
            if st == 201:
                url = r.get("html_url", "")
                print("Issue gemaakt:", url)
                break
            print("Issue maken mislukt:", st, r)
            if st < 500 and st != 599:
                break
            # Bij een serverfout kan het issue toch zijn aangemaakt: eerst kijken, dan pas opnieuw proberen.
            time.sleep(5 * (poging + 1))
            bestaand = al_gedaan().get(m["id"])
            if bestaand:
                url = bestaand
                print("Het issue bestond al:", url)
                break
        if not url:
            continue
        dc("PUT", "/channels/" + KANAAL + "/messages/" + m["id"] + "/reactions/" + urllib.parse.quote(VINK) + "/@me")
        antwoord(m, v, url)
    return 0


if __name__ == "__main__":
    sys.exit(main())
