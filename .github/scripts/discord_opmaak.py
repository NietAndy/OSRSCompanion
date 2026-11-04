"""Gedeelde opmaak voor de Discord-berichten van Gielinor Guide (releases, changelog, testversies en bugmeldingen).

De afspraken staan in het ontwerp "Discord-berichten, professioneel":
- Eén kop die zegt wat het is ("Versie 0.5.23", "Hotfix 0.5.22.3", of een status), nooit een zin.
- Altijd dezelfde volgorde: Nieuw, Verbeterd, Opgelost. Een onderdeel zonder inhoud valt weg.
- Versie en datum in de voettekst. Geen links, wel een route ("Controleer op updates linksonder in de app").
- Eén kleur en één label per soort bericht. De kleur is een hulp; het label staat altijd ook in tekst.
"""
import datetime
import re

MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"]
DAGEN = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"]

KLEUR = {
    "release": 0xF2C14E,    # goud
    "hotfix": 0xE8743B,     # oranje
    "beta": 0x9B84EE,       # paars
    "melding": 0xED4245,    # rood
    "ontvangen": 0x5B8DEF,  # blauw
    "opgelost": 0x3BA55D,   # groen
    "afgesloten": 0x8E9297, # grijs
    "heropend": 0xE8743B,   # oranje
}
VOLGORDE = ["Nieuw", "Verbeterd", "Opgelost"]
ROUTE = "Werk bij via Controleer op updates linksonder in de app."
MAX_VELDEN = 6


def vandaag():
    """De datum van nu in Nederland. Zonder tijdzonegegevens wordt het UTC."""
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo("Europe/Amsterdam"))
    except Exception:
        return datetime.datetime.utcnow()


def datum_nl(d=None):
    d = d or vandaag()
    return str(d.day) + " " + MAANDEN[d.month - 1] + " " + str(d.year)


def dag_datum_nl(d=None):
    d = d or vandaag()
    return DAGEN[d.weekday()] + " " + datum_nl(d)


def versie_uit(*teksten):
    for t in teksten:
        m = re.search(r"\d+(?:\.\d+)+", t or "")
        if m:
            return m.group(0)
    return ""


def is_hotfix(versie):
    """Vier of meer cijfers (zoals 0.5.22.3) is een hotfix."""
    return len((versie or "").split(".")) >= 4


def schoon(tekst):
    """Haalt links weg: [tekst](adres) wordt tekst, en losse adressen verdwijnen."""
    t = re.sub(r"\[([^\]]+)\]\((?:https?://)[^)]+\)", r"\1", tekst or "")
    t = re.sub(r"<?https?://\S+>?", "", t)
    return re.sub(r"[ \t]+\n", "\n", t).strip()


def secties(md):
    """Splitst markdown in een inleiding en onderdelen met een kop (## Nieuw). De eerste kop met # (de titel) valt weg."""
    t = (md or "").replace("\r\n", "\n").strip()
    t = re.sub(r"\A#\s+[^\n]*\n+", "", t)
    delen = re.split(r"^##\s+(.+?)\s*$", t, flags=re.M)
    intro = schoon(delen[0])
    onderdelen = []
    for i in range(1, len(delen) - 1, 2):
        tekst = schoon(delen[i + 1])
        if tekst:
            onderdelen.append((delen[i].strip(), tekst))
    return intro, onderdelen


def opsomming(tekst, maximum=1000):
    """Streepjes worden bolletjes en te lange tekst wordt netjes afgekapt (een veld mag 1024 tekens zijn)."""
    regels = []
    for r in (tekst or "").splitlines():
        r = r.rstrip()
        if not r.strip():
            continue
        r = re.sub(r"^\s*[-*]\s+", "• ", r)
        regels.append(r)
    uit = "\n".join(regels)
    if len(uit) > maximum:
        uit = uit[:maximum].rsplit("\n", 1)[0] + "\n…"
    return uit


def sorteer(onderdelen):
    """Nieuw, Verbeterd, Opgelost eerst, de rest daarna in de oorspronkelijke volgorde."""
    def sl(x):
        return VOLGORDE.index(x[0]) if x[0] in VOLGORDE else len(VOLGORDE)
    return sorted(onderdelen, key=sl)


def velden(onderdelen, hernoem=None):
    uit = []
    for titel, tekst in sorteer(onderdelen)[:MAX_VELDEN]:
        waarde = opsomming(tekst)
        if waarde:
            uit.append({"name": (hernoem or {}).get(titel, titel)[:250], "value": waarde, "inline": False})
    return uit


def kort(tekst, maximum=3800):
    t = tekst or ""
    return t if len(t) <= maximum else t[:maximum].rsplit("\n", 1)[0] + "\n…"


def status_bericht(label, kleur, titel, tekst, tag="", users=None):
    """Een statusbericht in een bugthread: de melder staat in de tekst erboven (zodat hij een melding krijgt), daaronder het blok."""
    return {
        "content": tag.strip(),
        "embeds": [{"author": {"name": label}, "title": titel[:250], "description": kort(tekst, 3500), "color": kleur}],
        "allowed_mentions": {"parse": [], "users": users or []},
    }
