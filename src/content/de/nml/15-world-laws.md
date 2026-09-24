---
title: Weltgesetze
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbworldlaws:
order: 176
---

# Weltgesetze :wbworldlaws:

Weltgesetze (world law) sind die Schalter im Fenster **Weltgesetze**: "Altersschwäche", "Hunger", "Friedliche Monster". Sie sind das spielerfreundlichste Feature, das du hinzufügen kannst, weil die Spieler das Verhalten (behaviour) deiner Mod ein- und ausschalten können, ohne jemals eine Konfigurationsdatei anfassen zu müssen.

Sie gehören außerdem zu den einfachsten Assets im gesamten Spiel. Ganze vier Felder.

## Einen Schalter hinzufügen

```csharp Mods/HelloBox/Code/HelloLaws.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloLaws
    {
        public const string CHAOS = "world_law_hello_chaos";

        public static void Initialize()
        {
            AssetManager.world_laws_library.add(new WorldLawAsset
            {
                id = CHAOS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "units",                                  // in welchem Tab es erscheint
                icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
                default_state = false                                // startet deaktiviert
            });
        }
    }
}
```

Füge `HelloLaws.Initialize();` zu `Main.cs` hinzu und der Schalter ist im Spiel. Das ist wirklich schon alles :poggers:.

| Feld | Bedeutung |
| --- | --- |
| `id` | Name deines Gesetzes. Auch der Übersetzungsschlüssel |
| `group_id` | Der Tab, in dem es landet: `units`, `civilizations`, `spawn`, `diplomacy`, `nature`, … |
| `icon_path` | Das Icon, dieselben Pfadregeln wie überall |
| `default_state` | `true` = aktiv bei neuen Welten, `false` = aus |
| `can_turn_off` | Standardmäßig `true`. Setze `false` für ein Gesetz, das nur eingeschaltet werden kann |

## Den Schalter in deinem Code abfragen

Darum geht es schließlich. Ein Schalter, den niemand abfragt, ist Deko. Überall in deiner Mod:

```csharp
WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);

if (law != null && law.isEnabled())
{
    // der Spieler will Chaos, gib ihm Chaos
}
```

Ein praktisches Beispiel: Spawne deine Funken nur, wenn das Gesetz aktiv ist:

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
    bool chaos = law != null && law.isEnabled();

    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

    if (chaos)
    {
        foreach (WorldTile neighbour in pTile.neighboursAll)
        {
            World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
        }
    }
    return true;
};
```

## Sofort reagieren, wenn er umgelegt wird

Falls das Aktivieren des Gesetzes sofort etwas *auslösen* soll, anstatt nur später abgefragt zu werden:

```csharp
new WorldLawAsset
{
    id = CHAOS,
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
    default_state = false,
    on_state_enabled = (PlayerOptionData pOption) => { /* wird ausgeführt, wenn der Spieler es einschaltet */ }
};
```

## Die Texte

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one."
}
```

> [!WARNING] Weltgesetze nutzen `_title`, nicht die bloße ID
> Fast jedes andere Asset nutzt seine bloße ID als Namensschlüssel. Weltgesetze wollen `<id>_title`. Machst du es falsch, erscheint der Schalter ganz ohne Beschriftung :PESgn_Really:.

> [!TIP] Ein Gesetz schlägt eine Einstellung
> Mod-Einstellungen leben in einem Menü, das der Spieler einmal öffnet. Ein Weltgesetz ist direkt im Spiel, neben den Vanilla-Gesetzen, pro Welt, und lässt sich mitten im Spiel umlegen. Wenn deine Mod ein An/Aus-Verhalten hat, gehört es hierher :wbblessed:.
