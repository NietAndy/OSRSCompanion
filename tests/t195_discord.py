"""De Discord-berichten: opbouw volgens het ontwerp, grenzen van Discord, geen links. Alles met nagemaakte gegevens."""
import importlib.util, json, os, sys, tempfile
os.environ.update(DISCORD_BOT_TOKEN="x", DISCORD_BUGS_KANAAL="1", GITHUB_TOKEN="t", GITHUB_REPOSITORY="o/r")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.path.insert(0, os.path.join(ROOT, ".github", "scripts"))
import discord_opmaak as o, discord as dc_log, discord_releases as rel, beta_aankondiging as beta

fouten = 0
def eis(naam, ok, extra=""):
    global fouten
    print(("OK    " if ok else "FOUT  ") + naam + ((" " + str(extra)) if extra else ""))
    fouten += 0 if ok else 1

def totaal(e):
    n = len(e.get("title", "")) + len(e.get("description", "")) + len(e.get("footer", {}).get("text", "")) + len(e.get("author", {}).get("name", ""))
    for v in e.get("fields", []): n += len(v["name"]) + len(v["value"])
    return n

def geldig(naam, payload):
    e = payload["embeds"][0]
    ok = (len(e.get("title", "")) <= 256 and len(e.get("description", "")) <= 4096 and len(e.get("fields", [])) <= 25
          and all(len(v["value"]) <= 1024 and len(v["name"]) <= 256 for v in e.get("fields", [])) and totaal(e) <= 6000)
    eis(naam + ": binnen de grenzen van Discord", ok, "(" + str(totaal(e)) + " tekens)")
    eis(naam + ": geen link en geen github-adres", "http" not in json.dumps(payload) and "github.com" not in json.dumps(payload).lower())

notes = open("RELEASE-NOTES-0.5.23.md", encoding="utf-8").read()
# changelog
p = dc_log.bouw("Versie 0.5.23", "v0.5.23", "", notes); e = p["embeds"][0]
geldig("changelog weekly", p)
eis("changelog: kop is 'Versie 0.5.23'", e["title"] == "Versie 0.5.23", e["title"])
eis("changelog: velden Nieuw, Verbeterd, Opgelost in die volgorde", [v["name"] for v in e["fields"]] == ["Nieuw", "Verbeterd", "Opgelost"], [v["name"] for v in e["fields"]])
eis("changelog: regel met soort en datum", e["description"].startswith("Weekly release · "), e["description"][:40])
eis("changelog: bolletjes in plaats van streepjes", "• " in e["fields"][0]["value"] and "\n- " not in e["fields"][0]["value"])
eis("changelog: goud", e["color"] == o.KLEUR["release"])
p = dc_log.bouw("Versie 0.5.22.3", "v0.5.22.3", "", open("RELEASE-NOTES-0.5.22.3.md", encoding="utf-8").read()); e = p["embeds"][0]
geldig("changelog hotfix", p)
eis("changelog hotfix: kop 'Hotfix 0.5.22.3', oranje, regel 'Hotfix'", e["title"] == "Hotfix 0.5.22.3" and e["color"] == o.KLEUR["hotfix"] and e["description"].startswith("Hotfix · "))
lang = "## Nieuw\n" + "\n".join("- regel " + str(i) + " " + "x" * 80 for i in range(40))
p = dc_log.bouw("Versie 1.0.0", "v1.0.0", "", lang)
geldig("changelog met een heel lange lijst", p)
p = dc_log.bouw("Versie 1.0.1", "v1.0.1", "", "")
eis("changelog zonder notities: reservetekst met de route", "Controleer op updates" in p["embeds"][0]["description"])
# verhaaltje
p = rel.bouw("0.5.23", "o/r", open("RELEASE-STORY-0.5.23.md", encoding="utf-8").read()); e = p["embeds"][0]
geldig("verhaaltje", p)
eis("verhaaltje: kop 'Gielinor Guide 0.5.23 is uit'", e["title"] == "Gielinor Guide 0.5.23 is uit", e["title"])
eis("verhaaltje: geen aanhef en geen emoji, wel de eerste regel vet", "Beste avonturiers" not in e["description"] and e["description"].startswith("**Hoe snel ga jij?**"), e["description"][:30])
eis("verhaaltje: voettekst met soort, versie en datum", e["footer"]["text"].startswith("Weekly release · versie 0.5.23 · "), e["footer"]["text"])
p = rel.bouw("0.5.22.3", "o/r", open("RELEASE-STORY-0.5.22.3.md", encoding="utf-8").read())
eis("verhaaltje hotfix: kop 'Hotfix 0.5.22.3' en oranje", p["embeds"][0]["title"] == "Hotfix 0.5.22.3" and p["embeds"][0]["color"] == o.KLEUR["hotfix"])
# testversie
beta_notes = open("RELEASE-NOTES-0.5.22.91.md", encoding="utf-8").read() if os.path.exists("RELEASE-NOTES-0.5.22.91.md") else "Dit is een testversie.\n\n## Nieuw\n- iets nieuws\n\n## Wat je kunt testen\n- haal je levels twee keer op\n"
p = beta.bouw_bericht("0.5.22.91", "https://github.com/x", beta_notes, "123456789012345678"); e = p["embeds"][0]
geldig("testversie", p)
eis("testversie: BETA, paars, kop 'Testversie 0.5.22.91'", e["author"]["name"] == "BETA" and e["color"] == o.KLEUR["beta"] and e["title"] == "Testversie 0.5.22.91")
namen = [v["name"] for v in e["fields"]]
eis("testversie: velden in de afgesproken volgorde", namen[-2:] == ["Zo krijg je hem", "Iets gevonden?"] and "Nieuw in deze testversie" in namen, namen)
eis("testversie: ping voor de rol in de tekst erboven", p["content"] == "<@&123456789012345678>" and p["allowed_mentions"]["roles"] == ["123456789012345678"])
eis("testversie zonder rol: geen ping", beta.bouw_bericht("0.5.22.91", "", beta_notes, "")["content"] == "")

# bugs: ontvangen
sp = importlib.util.spec_from_file_location("bn", ".github/scripts/bugs_naar_issues.py"); bn = importlib.util.module_from_spec(sp); sp.loader.exec_module(bn)
gepl = []
def dcn(method, pad, data=None):
    if method == "POST" and data and "embeds" in data: gepl.append(data)
    return 201, {"id": "t"}
bn.dc = dcn
bn.antwoord({"id": "9", "embeds": [{"title": "Test"}]}, {"Melder": "naam (<@123456789012345678>)"}, "https://github.com/o/r/issues/5")
geldig("bug ontvangen", gepl[0])
e = gepl[0]["embeds"][0]
eis("bug ontvangen: label, blauw en melder getagd in de tekst erboven", e["author"]["name"] == "ONTVANGEN" and e["color"] == o.KLEUR["ontvangen"] and gepl[0]["content"] == "<@123456789012345678>" and gepl[0]["allowed_mentions"]["users"] == ["123456789012345678"])
bn.dc = lambda method, pad, data=None: (gepl.append(data), (500 if "threads" in pad else 201, {}))[1] if method == "POST" else (200, {})
gepl.clear(); bn.antwoord({"id": "9", "embeds": [{"title": "Test"}]}, {"Melder": "x"}, "")
eis("bug ontvangen: lukt de thread niet, dan een gewoon antwoord op de melding", gepl and gepl[-1].get("message_reference") == {"message_id": "9"} and "embeds" in gepl[-1])
# bugs: gesloten, opgelost, heropend
sp = importlib.util.spec_from_file_location("bg", ".github/scripts/bug_gesloten.py"); bg = importlib.util.module_from_spec(sp); sp.loader.exec_module(bg)
def run(actie, reden=None, nummer=5):
    ev = {"action": actie, "issue": {"number": nummer, "html_url": "https://github.com/o/r/issues/5", "state_reason": reden, "body": "<!-- discord-bericht: 123 -->"}}
    f = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False); json.dump(ev, f); f.close(); os.environ["GITHUB_EVENT_PATH"] = f.name
    uit = []
    def d2(method, pad, data=None):
        if method == "GET": return 200, [{"content": "<@123456789012345678>"}]
        if method == "POST": uit.append(data)
        return 200, {}
    bg.dc = d2; bg.main(); return uit[0]
for naam, (a, rr, nr, label, kleur) in {"bug afgesloten": ("closed", "not_planned", 5, "AFGESLOTEN", "afgesloten"), "bug opgelost zonder versie": ("closed", "completed", 5, "OPGELOST", "opgelost"), "bug opgelost in een versie": ("closed", "completed", 2, "OPGELOST", "opgelost"), "bug weer open": ("reopened", None, 5, "WEER OPEN", "heropend")}.items():
    b = run(a, rr, nr); geldig(naam, b); e = b["embeds"][0]
    eis(naam + ": label en kleur, melder getagd", e["author"]["name"] == label and e["color"] == o.KLEUR[kleur] and b["content"] == "<@123456789012345678>", e["title"])
b = run("closed", "completed", 2)
eis("bug opgelost met een versie in de releasenotes: kop noemt de versie", b["embeds"][0]["title"].startswith("Opgelost in versie "), b["embeds"][0]["title"])

# roadmap-datums en de geplande versie
import datetime
nu = datetime.datetime(2026, 11, 4, 12, 0)
eis("roadmap: 0.5.23 komt vrijdag 6 november", o.release_datum("0.5.23", nu=nu) == ("vrijdag 6 november", False), o.release_datum("0.5.23", nu=nu))
eis("roadmap: 0.5.24 komt vrijdag 13 november", o.release_datum("0.5.24", nu=nu) == ("vrijdag 13 november", False))
eis("roadmap: een eerdere versie is verleden tijd", o.release_datum("0.5.22.1", nu=nu)[1] is True)
eis("roadmap: een onbekende versie geeft geen datum", o.release_datum("9.9.9", nu=nu) == (None, False))
b = run("closed", "completed", 17)
eis("opgelost (issue 17): noemt versie 0.5.23 en de datum", b["embeds"][0]["title"] == "Opgelost in versie 0.5.23" and "vrijdag 6 november" in b["embeds"][0]["description"], b["embeds"][0]["description"][:90])
# handmatig: een thread afsluiten met een geplande versie, zonder het issue te sluiten
def handm(issue, versie="", datum="", body="<!-- discord-bericht: 123 -->"):
    os.environ.update(GITHUB_EVENT_NAME="workflow_dispatch", INPUT_ISSUE=str(issue), INPUT_VERSIE=versie, INPUT_DATUM=datum)
    uit = []
    def d3(method, pad, data=None):
        if method == "GET": return 200, [{"content": "<@123456789012345678>"}]
        uit.append((method, pad, data)); return 200, {}
    bg.dc = d3; bg.gh_issue = lambda n: {"body": body}
    rc = bg.main(); os.environ.pop("GITHUB_EVENT_NAME"); return rc, uit
rc, uit = handm(9, "0.5.24")
post = [u for u in uit if u[0] == "POST"][0][2]; patch = [u for u in uit if u[0] == "PATCH"][0][2]
geldig("gepland (issue 9, versie 0.5.24)", post)
e = post["embeds"][0]
eis("gepland: label GEPLAND, kop met versie, datum uit de roadmap", e["author"]["name"] == "GEPLAND" and e["title"] == "Komt in versie 0.5.24" and "gepland voor vrijdag 13 november" in e["description"], e["description"][:80])
eis("gepland: de melder wordt getagd", post["content"] == "<@123456789012345678>")
eis("gepland: de thread wordt gearchiveerd maar niet vergrendeld", patch == {"archived": True})
rc, uit = handm(9, "0.5.24", "maandag 16 november")
eis("gepland: een zelf ingevulde datum wint van de roadmap", "gepland voor maandag 16 november" in [u for u in uit if u[0] == "POST"][0][2]["embeds"][0]["description"])
rc, uit = handm(9)
eis("gepland zonder versie en zonder verwijzing in de notes: geen bericht, duidelijke fout", rc == 1 and not [u for u in uit if u[0] == "POST"])
rc, uit = handm(17)
eis("gepland: de versie komt uit de releasenotities als je hem niet invult", rc == 0 and "versie 0.5.23" in [u for u in uit if u[0] == "POST"][0][2]["embeds"][0]["description"])
print("\n" + (str(fouten) + " test(s) mislukt" if fouten else "Alles gelukt")); sys.exit(1 if fouten else 0)
