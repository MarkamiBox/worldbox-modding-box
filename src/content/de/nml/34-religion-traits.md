---
title: Religions-Eigenschaften
group: Spielinhalte
subgroup: Eigenschaften & Genetik
icon: :wbpray:
order: 108
---

# Religions-Eigenschaften :wbpray:

Eine **Religion** gehört Städten und Königreichen, verbreitet sich durch Bekehrung, verfasst Bücher und kann **Riten** vollziehen: weltverändernde Komplotte, die ihre Anhänger auf eigene Faust anstreben. Eine Religions-Eigenschaft ist ein einzelner Glaubenssatz.

| | |
| --- | --- |
| Bibliothek | `AssetManager.religion_traits` |
| Klasse | `ReligionTrait` |
| Gruppen | `AssetManager.religion_trait_groups`, Klasse `ReligionTraitGroupAsset` |
| Besitzer zur Laufzeit | `Religion`, in `World.world.religions` |
| Lokalisierungs-Präfix | `religion_trait_` |
| Standard-Icon-Ordner | `ui/Icons/religion_traits/` |

> [!WARNING] Religions-Stats erreichen keine Einheiten
> Dies ist das einzige Eigenschaftssystem, dessen `base_stats` niemals bei einem `Actor` ankommen. `Actor.updateStats()` verschmilzt Unterarten, Clans, Sprachen und Kulturen. **Religion steht nicht auf dieser Liste.**
>
> Eine Religions-Eigenschaft verändert die Welt also durch das, was sie *tut* (ein Ritus, eine Transformation, ein Aktions-Hook), nicht durch Statuswerte. `base_stats["damage"] = 10` darauf zu schreiben, ist ein stiller No-Op und der häufigste verschwendete Nachmittag auf dieser Seite :PES4_BigSad:.

## Eine registrieren

```csharp Mods/HelloBox/Code/HelloReligion.cs
namespace HelloBox
{
    public static class HelloReligion
    {
        public const string ASHES = "hello_rite_of_ashes";

        public static void Initialize()
        {
            if (AssetManager.religion_traits.has(ASHES)) return;

            ReligionTrait trait = new ReligionTrait
            {
                id = ASHES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "destruction",
                path_icon = "ui/Icons/iconHelloReligion",
                plot_id = "summon_meteor_rain",      // Der Ritus, den Anhänger versuchen dürfen
                priority = -1,
                spawn_random_trait_allowed = false,
                rarity = Rarity.R2_Epic
            };

            AssetManager.religion_traits.add(trait);
        }
    }
}
```


> [!WARNING] `spawn_random_trait_allowed` wird nur einmal beim Start gelesen
> Neue Religionen ziehen ihre Start-Traits aus einem Pool, den `BaseTraitLibrary.linkAssets()` während des Ladens aufbaut, bevor deine Mod existiert. Das Flag an deinem Trait zu setzen ändert für sich genommen nichts: Dein Trait landet nie in diesem Pool und wird einem Gründer nie zufällig verliehen. Füge ihn selbst hinzu, gewichtet nach Vanilla-Vorbild:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.religion_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` ist `protected`, kompiliert also gegen das publicized Assembly, mit dem NML deine Mod baut. `spawn_random_rate` steht standardmäßig auf `5`: Erhöhe den Wert, damit der Trait häufiger erscheint.

## Riten: das Feld `plot_id`

Eine Religions-Eigenschaft mit einer `plot_id` wird zu einem **Ritus**. Die Religion sammelt ihre Riten in `possible_rites`, und Anführer sowie Priester versuchen sie eigenständig auszuführen, sobald die Bedingungen des Komplotts erfüllt sind.

```csharp
trait.plot_id = "summon_meteor_rain";
```

Die ID verweist auf `AssetManager.plots_library`. Vanilla-Riten greifen auf bestehende Plots zurück - `summon_earthquake`, `summon_meteor_rain`, `summon_thunderstorm`, `summon_stormfront`, `summon_hellstorm`, `clan_ascension` - und du kannst dasselbe tun oder zuvor dein eigenes `PlotAsset` registrieren.

Der Plot bestimmt, wer ihn versuchen darf und wie anspruchsvoll er ist:

| PlotAsset-Feld | Funktion |
| --- | --- |
| `can_be_done_by_king`, `can_be_done_by_leader`, `can_be_done_by_clan_member` | Wer den Plot starten darf |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | Attribut-Voraussetzungen |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | Rang- und Ruhm-Voraussetzungen |
| `progress_needed`, `money_cost` | Dauer und finanzielle Kosten |
| `pot_rate`, `rarity` | Wie häufig die KI ihn auswählt |
| `check_is_possible`, `check_should_continue` | Deine eigenen individuellen Bedingungen |

## Transformationen: das Feld `transformation_biome_id`

Das andere Feld, das exklusiv für Religions-Eigenschaften existiert. Es markiert die Eigenschaft als Transformation und benennt das Biom, das der Glaube im Umfeld verbreitet:

```csharp
trait.transformation_biome_id = "biome_desert";
```

Vanilla nutzt dies für `sands_of_ruin` (Wüste), `shadowroot` (Verdorben), `echo_of_the_void` (Singularität), `infernal_rot` (Infernalisch) und `cosmic_radiation` (Ödland). Eine Religion mit einer solchen Eigenschaft schreibt langsam das Terrain um, auf dem ihre Anhänger leben – der größte sichtbare Effekt, den eine einzelne Eigenschaft im Spiel überhaupt haben kann.

## Etwas *bewirken* lassen

Da Statuswerte nicht greifen, verdienen sich Religions-Eigenschaften ihre Berechtigung durch Aktions-Hooks. Es sind dieselben, die jede Eigenschaft besitzt:

```csharp
// Alle paar Sekunden bei jedem Gläubigen
trait.special_effect_interval = 5f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreMana(2);
    return true;
};

// Wenn ein Gläubiger stirbt
trait.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };
```

Eine Religions-Eigenschaft kann auch einen Zauber oder eine Entscheidung gewähren, was meist passender ist als ein einfacher Timer:

```csharp
trait.addSpell("hello_bolt");           // siehe Projektile, Zauber & Effekte
trait.addDecision("burn_tumors");       // eine KI-Entscheidung, die Gläubige treffen dürfen
```

## Die Vanilla-Gruppen

`harmony` · `creation` · `destruction` · `restoration` · `necromancy` · `protection` · `the_void` · `transformation` · `fate` · `special`

Dein eigener Tab: siehe **[Eigenschafts-Gruppen & Tabs](#/nml/trait-groups)** mit `AssetManager.religion_trait_groups` und `ReligionTraitGroupAsset`.

## Die Texte

```json Mods/HelloBox/Locales/en.json
{
  "religion_trait_hello_rite_of_ashes": "Rite of Ashes",
  "religion_trait_hello_rite_of_ashes_info": "Somebody always volunteers."
}
```

## Die Eigenschaft verteilen

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addReligionTrait(HelloReligion.ASHES);
```

```csharp
foreach (Religion religion in World.world.religions)
{
    if (religion == null || religion.isRekt()) continue;

    religion.addTrait(HelloReligion.ASHES, pRemoveOpposites: true);
}
```

Eine `Religion` stellt außerdem `cities`, `kingdoms`, `books` und `possible_rites` bereit – genau das, was eigener Code meistens abfragen möchte, um festzustellen, was ein Glaube gerade treibt.

> [!TIP] Riten sind der eigentliche Kern
> Eine Religion, die nur Zahlenwerte ändert, bleibt unsichtbar. Eine Religion, deren Priester gelegentlich einen Meteoritenschauer heraufbeschwören, ist das, wovon Spieler Screenshots teilen. Stecke deine Energie in `plot_id` :aPES_Flames:.
