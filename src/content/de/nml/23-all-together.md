---
title: Die fertige Mod
group: Spielinhalte
subgroup: Abschluss & Feinschliff
icon: :wbpeak:
order: 222
---

# Die fertige Mod :wbpeak:

Wenn du die Seiten der Reihe nach befolgt hast, hast du seit **[Deine erste Mod](#/nml/your-first-mod)** Datei für Datei zu derselben Mod hinzugefügt. Diese Seite ist der Zusammenbau: wie HelloBox aussieht, wenn jedes Puzzleteil an seinem Platz ist, und wie die Teile sich gegenseitig aufrufen.

## Was du gebaut hast

Gut zwanzig Dateien, und das kommt im Spiel dabei heraus. Jede Zeile ist eine Seite dieses Guides  :wbpeak:.

| Was | Wo du es siehst |
| --- | --- |
| Ein Actor-Trait, und ein eigener Tab dafür | Der Einheiten-Inspektor, Trait-Liste |
| Kultur-, Religions-, Unterarten-, Clan-, Sprach- und Königreichs-Traits | Ihre eigenen Fenster, eins pro System |
| Eine Waffe, ihre Verzauberung (modifier) und eine Kategorie für beide | Die Hände einer Einheit, die Ausrüstungs-Tabs |
| Ein Status-Effekt | Über dem Kopf der Kreatur, mit eigenem Icon |
| Drops, eine Wolke (cloud) die sie regnet, und ein Projektil (projectile) | Die Karte, in der Luft, mitten im Kampf |
| Ein Tile | Das Gelände, unter allem anderen |
| Ein Nahrungsrezept | Die Lager einer Stadt |
| Ein Weltgesetz (world law) | Das Weltgesetze-Fenster |
| Eine Gottkraft, ihr Tab und ihr Button | Die Kraftleiste unten |
| Ein Fenster | Wohin du es setzt |
| Ein Gebäude (building) | Eine Stadt, sobald es jemand baut |
| Ein Königreich (kingdom) und eine Kreatur, die dazugehört | Die Karte, beim Spawnen und Kämpfen |
| Eine Katastrophe (disaster) | Das Katastrophen-Menü |
| Ein eigener KI-Job | Die Kreatur, die absichtlich irgendwohin läuft |
| Eine Entscheidung (decision), ein Stadtberuf und ein Werkzeug in der Hand | Umherwandernde Irrlichter mit Fackeln, ein Wächter pro Stadt |
| Eine Kampfaktion | Einheiten mit dem Schnelligkeits-Merkmal werfen Funken vor dem Angriff |
| Ein Gen, eine Persönlichkeit, ein Buchtyp, ein Banner-Element | Das Genom, Herrscher, Bibliotheken (library), Flaggen |
| Meinung, Loyalität und ein Zufriedenheitsereignis | Diplomatie- und Stadt-Aufschlüsselungen |
| Ein Plan (plot) | Die Planliste, wenn ein Anführer ein Funkenfestival plant |
| Ein Weltzeitalter und ein Weltverhalten | Das Zeitalter-Rad und der weltweite Timer |
| Eine Errungenschaft | Das Errungenschaftsfenster, bei zehn Irrlichtern |
| Ein Pinsel, ein Tooltip und ein Hotkey | Die Pinselrotation, der Tooltip beim Hovern, F6 |
| Ein Harmony-Patch | Nirgends, und das ist der Punkt: er ändert eine Regel leise |

## Nimm sie mit

<a class="dl" href="hellobox.zip" download>
  <span class="dl-icon">📦</span>
  <span class="dl-text">
    <span class="dl-title">HelloBox herunterladen</span>
    <span class="dl-sub">Die fertige Mod, jede Datei dieser Seite. Nach <code>worldbox\Mods\</code> entpacken und das Spiel starten.</span>
  </span>
</a>

Sie wird aus den Codeblöcken dieses Guides erzeugt, ist also derselbe Code, den du kopiert hast, und keine separate Kopie, die irgendwann abweicht. Lies sie, mach sie kaputt, lösch die zwei Drittel, die du nicht willst.

> [!WARNING] Eine Demo, kein Produkt
> HelloBox so zu veröffentlichen hilft niemandem: das sind zwanzig Funktionen, die absichtlich je eine Kleinigkeit schlecht machen. Ändere die Ids, ändere den Namen, behalte die Teile, die du wirklich wolltest  :wbbru:.

## Die Ordnerstruktur

```text Mods/HelloBox/
HelloBox/
├── mod.json                         the ID card
├── icon.png                         what players see in the mod list
├── default_config.json              the settings window
├── Locales/
│   └── en.json                      every piece of text
├── GameResources/
│   ├── iconHelloCake.png            the food inventory icon
│   ├── actors/species/other/
│   │   ├── hello_wisp/              main/ and child/: walk_0..3, swim_0..3, sprites.json
│   │   └── hello_golem/             the same shape
│   ├── buildings/hello_shrine/      main_0, construction_0, ruin_0, mini_0, sprites.json
│   ├── cultures/
│   │   └── hello_culture_element.png    a culture banner part
│   ├── drops/hello_ember/           hello_ember_0..1, the falling drop
│   ├── effects/
│   │   ├── clouds/hello_cloud.png   the cloud sprite
│   │   ├── fx_hello_status/         fx_hello_status_0..2, the status overhead
│   │   └── projectiles/hello_bolt/  hello_bolt_0..1, the flying ember
│   ├── items/
│   │   ├── resources/hello_cake/    hello_cake_0..1, cake in hand
│   │   ├── tools/tool_hello_torch/  tool_hello_torch_0, the torch in hand
│   │   └── weapons/
│   │       ├── sprites.json         pivot for held weapons
│   │       ├── w_hello_sword.png    weapon sprite
│   │       └── w_hello_sword/       the in-hand sprite list, with its own sprites.json
│   ├── tiles/hello_moss/            moss_1, a tile variation
│   └── ui/Icons/
│       ├── sprites.json             default icon slicing
│       ├── iconHello*.png           traits, powers, tabs, the age, the gene, the grudge...
│       ├── items/icon_hello_sword.png       weapon inventory icon
│       └── worldrules/icon_hello_law.png    world law switch
└── Code/
    ├── Main.cs                      the door NML knocks on
    ├── HelloSettings.cs             what the settings window writes to
    ├── HelloGroups.cs               your own trait tab and item category
    ├── HelloTraits.cs               an actor trait
    ├── HelloMemory.cs               a trait that remembers, in the save file
    ├── HelloCulture.cs              a culture trait
    ├── HelloReligion.cs             a religion trait
    ├── HelloSubspecies.cs           a subspecies trait
    ├── HelloClan.cs                 a clan trait
    ├── HelloLanguage.cs             a language trait
    ├── HelloGenes.cs                a gene
    ├── HelloKingdomTraits.cs        a kingdom trait
    ├── HelloItems.cs                a weapon cities actually forge
    ├── HelloModifiers.cs            an enchantment
    ├── HelloStatus.cs               a status effect
    ├── HelloDrops.cs                falling embers
    ├── HelloClouds.cs               an ember cloud
    ├── HelloTiles.cs                a top tile
    ├── HelloResources.cs            a food recipe
    ├── HelloProjectiles.cs          a flying ember
    ├── HelloLaws.cs                 a world law switch
    ├── HelloBuildings.cs            a building
    ├── HelloKingdoms.cs             their faction
    ├── HelloActors.cs               your creatures
    ├── HelloAI.cs                   its own behaviour
    ├── HelloDecisions.cs            the wisps choosing it on their own
    ├── HelloCityJobs.cs             a job cities hand out
    ├── HelloTools.cs                a torch in hand
    ├── HelloCombat.cs               a combat move
    ├── HelloPolitics.cs             opinion, loyalty, a happiness event
    ├── HelloPlots.cs                a festival leaders can plot
    ├── HelloAges.cs                 a world age and a world behaviour
    ├── HelloAchievements.cs         an achievement
    ├── HelloPersonality.cs          a ruler personality
    ├── HelloBooks.cs                a kind of book
    ├── HelloBanners.cs              a culture banner part
    ├── HelloBrushes.cs              a brush shape
    ├── HelloTooltips.cs             the panel's tooltip
    ├── HelloHotkeys.cs              F6 opens the panel
    ├── HelloDisasters.cs            an ember storm, with its log line
    ├── HelloPowers.cs               a god power + its tab and buttons
    ├── HelloWindow.cs               a panel
    └── HelloPatches.cs              your Harmony patches
```

## Main.cs, das komplette Ding

```csharp Mods/HelloBox/Code/Main.cs
using System;
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>, IReloadable
    {
        // Development only: turns on NML's reload button. Never ship it on. See Logs & debugging.
        private static bool DevReload = false;

        protected override void OnModLoad()
        {
            if (DevReload) Config.isEditor = true;

            // Order matters: things that are referenced must exist first.
            Stage("groups", HelloGroups.Initialize);        // tabs before the things that sit in them
            Stage("traits", HelloTraits.Initialize);
            Stage("memory", HelloMemory.Initialize);
            Stage("culture", HelloCulture.Initialize);
            Stage("religion", HelloReligion.Initialize);
            Stage("subspecies", HelloSubspecies.Initialize);
            Stage("clan", HelloClan.Initialize);
            Stage("language", HelloLanguage.Initialize);
            Stage("genes", HelloGenes.Initialize);
            Stage("status", HelloStatus.Initialize);
            Stage("drops", HelloDrops.Initialize);          // clouds rain drops, so drops go first
            Stage("clouds", HelloClouds.Initialize);
            Stage("tiles", HelloTiles.Initialize);
            Stage("biomes", HelloBiomes.Initialize);       // after the tiles, before anything spawns in it
            Stage("resources", HelloResources.Initialize);  // items and buildings cost resources
            Stage("projectiles", HelloProjectiles.Initialize);
            Stage("modifiers", HelloModifiers.Initialize);
            Stage("items", HelloItems.Initialize);          // items can roll the modifiers above
            Stage("buildings", HelloBuildings.Initialize);
            Stage("kingdoms", HelloKingdoms.Initialize);    // actors point at kingdoms
            Stage("kingdom_traits", HelloKingdomTraits.Initialize);
            Stage("names", HelloNames.Initialize);         // before the actors, so they can use its name set
            Stage("actors", HelloActors.Initialize);
            Stage("laws", HelloLaws.Initialize);
            Stage("ai", HelloAI.Initialize);
            Stage("decisions", HelloDecisions.Initialize);  // after the actors and the task they use
            Stage("city_jobs", HelloCityJobs.Initialize);
            Stage("tools", HelloTools.Initialize);
            Stage("combat", HelloCombat.Initialize);        // after the trait that carries it
            Stage("politics", HelloPolitics.Initialize);
            Stage("wars", HelloWars.Initialize);
            Stage("plots", HelloPlots.Initialize);
            Stage("ages", HelloAges.Initialize);            // after the cloud, the law and the status it uses
            Stage("achievements", HelloAchievements.Initialize);
            Stage("personality", HelloPersonality.Initialize);
            Stage("books", HelloBooks.Initialize);
            Stage("banners", HelloBanners.Initialize);
            Stage("brushes", HelloBrushes.Initialize);
            Stage("tooltips", HelloTooltips.Initialize);
            Stage("hotkeys", HelloHotkeys.Initialize);
            Stage("disasters", HelloDisasters.Initialize);
            Stage("powers", HelloPowers.Initialize);        // last: the buttons need the powers

            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
            LogInfo("HelloBox ready");
        }

        private static void Stage(string pName, Action pAction)
        {
            try { pAction(); }
            catch (Exception e) { LogError($"stage '{pName}' failed: {e}"); }
        }

        // NML calls this after it recompiled your code, when you press the reload button
        public void Reload()
        {
            LogInfo("HelloBox reloaded");
        }

        public void Update()
        {
            if (!Config.game_loaded) return;
            if (World.world == null || World.world.units == null || MapBox.instance == null) return;

            // the power tab can only be laid out once its own Start() has run
            HelloPowers.LayoutWhenReady();
        }
    }
}
```

### Warum diese Reihenfolge

Drei Dateien in diesem Ordner tauchen in der obigen Liste niemals auf, und das ist völlig korrekt:

| Datei | Wer sie aufruft |
| --- | --- |
| `HelloPatches.cs` | `PatchAll()` findet sie anhand ihrer Attribute. Du rufst einen Patch niemals selbst auf |
| `HelloSettings.cs` | Der Config-Loader schreibt hinein, wenn der Spieler einen Schieberegler bewegt |
| `HelloWindow.cs` | Ihr eigener Button baut sie beim allerersten Öffnen auf |

Auch deine Texte brauchen keine eigene Stufe: NML lädt `Locales/en.json` bereits, bevor es an `OnModLoad` anklopft, daher ist jeder Schlüssel längst vorhanden. Alles andere sind harte Abhängigkeiten, und die Reihenfolge ist keine Dekoration:

1. **Gruppen vor den Dingen darin**, denn ein Asset, dessen `group_id` ins Leere zeigt, hat keinen Tab, in dem es gezeichnet werden kann.
2. **Drops vor Wolken**, weil eine Wolke den Drop benennt, den sie regnet.
3. **Ressourcen (resource) vor Gegenständen (item) und Gebäuden**, weil beides Ressourcen kostet.
4. **Modifikatoren vor Gegenständen**, weil eine Waffe die Modifikatoren auflistet, die sie würfeln kann.
5. **Königreiche vor Akteuren**, weil ein Akteur seine wilden und zivilisierten Königreiche benennt.
6. **Kräfte vor ihren Buttons**: `PowerButtonCreator` sucht die Kraft anhand ihrer ID, und ein Button ohne registrierte Kraft ist ein toter Button.
7. **Alles, was die KI nutzt, vor der KI**, da ein Task Merkmale (trait) und Statusse per ID referenziert.
8. **Akteure und die KI vor Entscheidungen, Stadtberufen und Werkzeugen**, da diese auf eine Kreatur und eine Aufgabe (task) verweisen, die bereits existieren müssen.
9. **Das Weltzeitalter nach der Wolke, dem Gesetz und dem Status**, die seine Effekte nutzen. Pläne, Politik und Errungenschaften greifen erst bei laufendem Spiel auf Dinge zu und können daher an beliebiger Stelle nach ihren Abhängigkeiten stehen.

Wenn etwas im Spiel nicht auftaucht, ist "Habe ich es erst nach dem registriert, was es gebraucht hat?" die zweite Frage, direkt nach "Steht es im Log?" :PES2_HmmmmNoted:.

## Die Checkliste, bevor du es als fertig bezeichnest

| | |
| --- | --- |
| Log | Starte das Spiel, suche nach `HelloBox`. Du willst ein "ready" sehen und **keine** `Exception` |
| Text | Nichts im Spiel zeigt einen nackten Schlüssel wie `trait_hello_x` |
| Icons | Keine unsichtbaren Löcher in der Power-Leiste |
| Einstellungen | Lösche `mods_config/<GUID>.config`, starte neu, prüfe, ob die Standardwerte stimmen |
| Saubere Welt | Lade eine frische Karte und lass sie fünf Minuten auf Höchstgeschwindigkeit laufen, lies dann das Log erneut |
| Andere Mods | Schalte ein paar andere Mods ein. Wenn du etwas patchst, patcht es jemand anderes mit Sicherheit auch |

Gehe danach zu **[Deine Mod veröffentlichen](#/nml/publishing)** und lass andere Leute deine Mod kaputtmachen :aPES3_VictoryPog:.

## Wohin als Nächstes

- Lösche die Teile von HelloBox, die du nicht brauchst. Es war eine Demo, keine echte Mod.
- Wähle **einen** Bereich aus und mach ihn richtig gut. Eine Mod, die eine Sache perfekt macht, schlägt jede Mod, die zwölf Dinge schlecht macht.
- Lies den Vanilla-Code für das, was du dir ausgesucht hast (**[Den Spielcode lesen](#/toolbox/reading-the-game-code)**). Alles, was du noch nicht weißt, steht genau dort geschrieben :PESgn_ReadRules:.
