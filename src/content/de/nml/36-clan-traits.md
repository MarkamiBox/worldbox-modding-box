---
title: Clan-Eigenschaften
group: Spielinhalte
subgroup: Eigenschaften & Genetik
icon: :wbclanroses:
order: 110
---

# Clan-Eigenschaften :wbclanroses:

Ein **Clan** ist eine Blutlinie: eine Familie, die groß genug geworden ist, um ein eigenes Gebilde zu sein – mit eigenem Banner, eigener Farbe und eigenem Ruf. Eine Clan-Eigenschaft ist das, was diese Blutlinie in sich trägt.

Clan-Eigenschaften kommen einer vererbbaren Superkraft im Spiel am nächsten, und sie sind das einzige Eigenschaftssystem mit einer integrierten **Männlich-/Weiblich-Aufteilung**.

| | |
| --- | --- |
| Bibliothek (library) | `AssetManager.clan_traits` |
| Klasse | `ClanTrait` |
| Gruppen | `AssetManager.clan_trait_groups`, Klasse `ClanTraitGroupAsset` |
| Besitzer zur Laufzeit | `Clan`, in `World.world.clans` |
| Lokalisierungs-Präfix | `clan_trait_` |
| Standard-Icon-Ordner | `ui/Icons/clan_traits/` |

## Eine registrieren

```csharp Mods/HelloBox/Code/HelloClan.cs
namespace HelloBox
{
    public static class HelloClan
    {
        public const string OLD_BLOOD = "hello_old_blood";

        public static void Initialize()
        {
            if (AssetManager.clan_traits.has(OLD_BLOOD)) return;

            ClanTrait trait = new ClanTrait
            {
                id = OLD_BLOOD,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloClan",
                rarity = Rarity.R1_Rare
            };

            AssetManager.clan_traits.add(trait);

            trait.base_stats["multiplier_health"] = 0.15f;
            trait.base_stats["armor"] = 4;
            trait.base_stats.addTag("immunity_cold");
        }
    }
}
```

Clan-`base_stats` verschmelzen mit jedem Mitglied des Clans – anders als bei Religionen handelt es sich hierbei also um ein echtes Stat-System. Siehe die Fusions-Reihenfolge in der **[Stats-Referenz](#/nml/stats)**.

## Die Männlich-/Weiblich-Aufteilung

Die zwei Felder, die keine andere Eigenschaftsklasse besitzt:

```csharp
trait.base_stats["health"] = 20;           // Jedes Mitglied
trait.base_stats_male["damage"] = 6;       // Nur Männer
trait.base_stats_female["intelligence"] = 4;   // Nur Frauen
```

`Actor.updateStats()` verschmilzt zuerst `clan.base_stats` und anschließend je nach Geschlecht der Einheit `clan.base_stats_male` **oder** `clan.base_stats_female`. Beide zusätzlichen Blöcke existieren von Beginn an, sie werden nicht erst in `add()` allokiert – du kannst also jederzeit hineinschreiben.

## Entscheidungen: Was ein Clan *tut*

Vanilla-Clan-Eigenschaften stützen sich vor allem auf Entscheidungen (decision) statt auf Aktionen, denn ein Clan ist ein soziales Konstrukt:

```csharp
trait.addDecision("banish_unruly_clan_members");
trait.addOpposite("hello_new_blood");
```

Eine Entscheidung ist eine KI-Option in `AssetManager.decisions_library`. Zwei Vanilla-Clan-Eigenschaften, `blood_pact` und `deathbound`, sind im Grunde dieselbe Eigenschaft (trait) mit unterschiedlicher Entscheidung und als gegenseitige Gegensätze deklariert. Dieses Muster lohnt sich zu kopieren: zwei Eigenschaften, eine Achse, gegenseitig ausschließend.

## Kampf- und Effekt-Hooks

```csharp
// Bei jedem Treffer, den ein Clanmitglied landet
trait.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null) return false;
    return true;
};

// Über einen Timer, bei jedem Clanmitglied
trait.special_effect_interval = 2f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreHealth(1);
    return true;
};
```

Denke an Null-Prüfungen und gib `false` zurück, wenn du nichts getan hast. Diese Hooks laufen für jedes einzelne Mitglied jedes Clans, der diese Eigenschaft besitzt.

## Hinter einem Erfolg gesperrt

Mehrere Clan-Eigenschaften von Vanilla sind Belohnungen statt Standard-Optionen:

```csharp
trait.setUnlockedWithAchievement("achievementSegregator");
```

Eine gesperrte Eigenschaft existiert und funktioniert weiterhin völlig normal; der Spieler kann sie lediglich im Editor erst dann auswählen, wenn der Erfolg (achievement) abgeschlossen ist. Beachte, dass `BaseTraitLibrary` bei allem, was so gesperrt wird, automatisch auch `rarity = R3_Legendary` setzt, damit deine Belohnung auch danach aussieht :gold_star:.

## Die Vanilla-Gruppen

`spirit` · `mind` · `body` · `chaos` · `harmony` · `fate` · `special`

Dein eigener Tab: siehe **[Eigenschafts-Gruppen & Tabs](#/nml/trait-groups)** mit `AssetManager.clan_trait_groups` und `ClanTraitGroupAsset`.

## Die Texte

```json Mods/HelloBox/Locales/en.json
{
  "clan_trait_hello_old_blood": "Old Blood",
  "clan_trait_hello_old_blood_info": "Their great-grandparents were also difficult to kill."
}
```

## Die Eigenschaft verteilen

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addClanTrait(HelloClan.OLD_BLOOD);
```

```csharp
foreach (Clan clan in World.world.clans)
{
    if (clan == null || clan.isRekt()) continue;

    clan.addTrait(HelloClan.OLD_BLOOD, pRemoveOpposites: true);
}
```

Der Clan einer Einheit liegt auf `actor.clan`, und `actor.hasClan()` verrät dir, ob die Einheit überhaupt einem angehört – etliche Einheiten treten niemals einem Clan bei.

> [!TIP] Clans sind klein, sei also ruhig großzügig
> Eine Kultur (culture) erstreckt sich über einen ganzen Kontinent; ein Clan umfasst eine Familie, und `limit_clan_members` deckelt seine Größe. Eine Clan-Eigenschaft darf bei gleicher Welten-Balance wesentlich stärker sein als eine Kultur-Eigenschaft. Das macht Clans zum perfekten Zuhause für dramatische Effekte :PES5_Menace:.

## Neue Clans, die selbstständig Traits auswürfeln

Abgesehen von der manuellen Vergabe kann ein Clan-Trait `spawn_random_trait_allowed` setzen, um bei der Gründung eines neuen Clans ausgewürfelt zu werden – genau so, wie eine Kultur ihre Start-Traits wählt. Dieselbe Falle wie auf jeder anderen Merkmalsseite:

> [!WARNING] `spawn_random_trait_allowed` wird nur einmal beim Start gelesen
> Neue Clans ziehen ihre Start-Traits aus einem Pool, den `BaseTraitLibrary.linkAssets()` während des Ladens aufbaut, bevor deine Mod existiert. Das Flag an deinem Trait zu setzen ändert für sich genommen nichts: Dein Trait landet nie in diesem Pool und wird einem neuen Clan nie zufällig verliehen. Füge ihn selbst hinzu, gewichtet nach Vanilla-Vorbild:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.clan_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` ist `protected`, kompiliert also gegen das publicized Assembly, mit dem NML deine Mod baut. `spawn_random_rate` steht standardmäßig auf `5`: Erhöhe den Wert, damit der Trait häufiger erscheint.
