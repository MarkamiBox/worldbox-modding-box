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
            if (AssetManager.world_laws_library.has(CHAOS)) return;

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
| `group_id` | Der Tab, in dem es landet. Die vollständige Liste steht unten unter **Die Tabs**, oder erstelle deinen eigenen |
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

Oder der kurze Weg, direkt aus der Welt, ohne das Asset zu holen:

```csharp
bool chaos = World.world.world_laws.isEnabled(HelloLaws.CHAOS);
```

`isEnabled(string)` gibt für eine unbekannte ID `false` zurück statt zu werfen, ein Tippfehler liest sich also als "aus" statt als Absturz. Nett, und gleichzeitig fies, weil dir nichts Bescheid sagt :PES5_Hmmmm:. `World.world.world_laws` ist `internal`, das kompiliert also gegen die publizierte Assembly, mit der NML deine Mod baut (siehe die Anmerkung in **[Statuseffekte](#/nml/status-effects)**). Der Asset-Weg oben funktioniert überall.

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

## Die Tabs

Das Fenster ist in Tabs aufgeteilt, und `group_id` wählt einen davon. Das sind alle Vanilla-Gruppen, in der Reihenfolge, in der das Fenster sie zeichnet:

`harmony` · `diplomacy` · `civilizations` · `units` · `mobs` · `spawn` · `nature` · `trees` · `plants` · `fungi` · `biomes` · `weather` · `disasters` · `other`

### Ein eigener Tab

Ersetze das `Initialize()` des ersten Beispiels durch die Version unten, und füge `GROUP` neben `CHAOS` hinzu.

Eine Gruppe ist ein `WorldLawGroupAsset` in `AssetManager.world_law_groups`. Es ist dasselbe winzige `BaseCategoryAsset`, das auch die Merkmals-Tabs nutzen, siehe **[Eigenschafts-Gruppen & Tabs](#/nml/trait-groups)**:

| Feld | Bedeutung |
| --- | --- |
| `id` | Worauf das `group_id` eines Gesetzes zeigt |
| `name` | Der **Lokalisierungsschlüssel** für den Tab-Titel. Nicht der Titel selbst |
| `color` | Hex-String. Färbt den Tab-Titel |

```csharp Mods/HelloBox/Code/HelloLaws.cs
public const string GROUP = "hello_laws";

public static void Initialize()
{
    // the group first: the laws below point at it
    if (!AssetManager.world_law_groups.has(GROUP))
    {
        AssetManager.world_law_groups.add(new WorldLawGroupAsset
        {
            id = GROUP,
            name = "world_laws_tab_" + GROUP,   // the locale key, not the text
            color = "#FF9A3C"
        });
    }

    if (AssetManager.world_laws_library.has(CHAOS)) return;

    AssetManager.world_laws_library.add(new WorldLawAsset
    {
        id = CHAOS,
        needs_to_be_explored = false,
        group_id = GROUP,
        icon_path = "ui/Icons/worldrules/icon_hello_law",
        default_state = false
    });
}
```

Keine UI-Arbeit nötig: Das Weltgesetze-Fenster baut einen Tab pro Eintrag in `world_law_groups.list` und legt danach jedes Gesetz in den Tab, den sein `group_id` nennt. Das passiert einmal, wenn das Fenster zum ersten Mal erstellt wird, und deine Mod hat da längst geladen. Dein Tab landet am Ende, nach `other`.

> [!WARNING] Ein `group_id`, das nicht existiert, zerstört das ganze Fenster
> Das Fenster schlägt den Tab über eine schlichte Dictionary-Indizierung nach. Ein Gesetz, das auf eine nirgendwo registrierte Gruppe zeigt, wirft `KeyNotFoundException`, während das Fenster gebaut wird, und jedes danach registrierte Gesetz, deins wie das anderer Mods, schafft es nie ins Fenster. Registriere die Gruppe vor den Gesetzen, und schreib sie beide Male gleich :PESgn_ToughLuck:.

## Die Texte

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one.",
  "world_laws_tab_hello_laws": "HelloBox"
}
```

> [!WARNING] Weltgesetze nutzen `_title`, nicht die bloße ID
> Fast jedes andere Asset nutzt seine bloße ID als Namensschlüssel. Weltgesetze wollen `<id>_title`. Machst du es falsch, erscheint der Schalter ganz ohne Beschriftung :PESgn_Really:.

> [!TIP] Ein Gesetz schlägt eine Einstellung
> Mod-Einstellungen leben in einem Menü, das der Spieler einmal öffnet. Ein Weltgesetz ist direkt im Spiel, neben den Vanilla-Gesetzen, pro Welt, und lässt sich mitten im Spiel umlegen. Wenn deine Mod ein An/Aus-Verhalten hat, gehört es hierher :wbblessed:.
