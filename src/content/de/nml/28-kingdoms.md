---
title: Königreiche & Fraktionen
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbkingdoms:
order: 178
---

# Königreiche & Fraktionen :wbkingdoms:

Jede Einheit in WorldBox gehört zu einem Königreich. Nicht nur die zivilisierten: Wölfe gehören zu einem Wolfs-Königreich, Banditen zu einer Banditen-Fraktion, und ein neutrales Huhn gehört zu einem neutralen Königreich. Ein `KingdomAsset` ist der **Typ** der Fraktion, nicht ein einzelnes Königreich auf der Karte.

Das ist die entscheidende Unterscheidung:

| | |
| --- | --- |
| `KingdomAsset` in `AssetManager.kingdoms` | Die Vorlage. "Was ein Ork-Königreich ausmacht" |
| `Kingdom` in `World.world.kingdoms` | Ein konkretes Königreich in der laufenden Welt mit Name, Farbe und Städten |

Du registrierst das Erste. Das Spiel erschafft das Zweite.

## Eine Vorlage klonen

Wie Akteure besitzen auch Königreiche `$TEMPLATE$`-IDs genau für diesen Zweck:

| Vorlage | Verwendungszweck |
| --- | --- |
| `$TEMPLATE_CIV$` | Eine Zivilisationsfraktion |
| `$TEMPLATE_CIV_NEW$` | Der neuere Tierzivilisations-Stil |
| `$TEMPLATE_NOMAD$` | Die nomadische Phase, bevor Kreaturen sesshaft werden |
| `$TEMPLATE_MOB$` | Eine feindselige Monsterfraktion |
| `$TEMPLATE_MOB_GOOD$` / `$TEMPLATE_MOB_VERY_GOOD$` | Feindlich zu manchem, friedlich zu Zivilisationen |
| `$TEMPLATE_ANIMAL$` | Wildtiere |
| `$TEMPLATE_ANIMAL_NEUTRAL$` / `$TEMPLATE_ANIMAL_PEACEFUL$` | Wildtiere, die von sich aus keine Kämpfe beginnen |

```csharp Mods/HelloBox/Code/HelloKingdoms.cs
namespace HelloBox
{
    public static class HelloKingdoms
    {
        public const string CIV = "hello_sprites";
        public const string WILD = "hello_nomads_sprites";

        public static void Initialize()
        {
            if (AssetManager.kingdoms.has(CIV)) return;

            // Die sesshafte Zivilisationsfraktion.
            KingdomAsset civ = AssetManager.kingdoms.clone(CIV, "$TEMPLATE_CIV$");
            civ.addTag("civ");
            civ.addFriendlyTag("civ");
            civ.addEnemyTag("orc");
            civ.setIcon("ui/Icons/iconHelloCiv");

            // Die wilde Phase vor der Stadtgründung.
            KingdomAsset wild = AssetManager.kingdoms.clone(WILD, "$TEMPLATE_NOMAD$");
            wild.addTag("hello_sprite");
            wild.addFriendlyTag("hello_sprite");
            wild.setIcon("ui/Icons/iconHelloWild");
        }
    }
}
```

`$TEMPLATE_NOMAD$` setzt `nomads = true`, `civ = false` und `mobs = true` bereits automatisch für dich. Das sollte man laut betonen, weil viele darüber stolpern: **`civ`, `nomads`, `mobs` und Co. sind `bool`-Felder, keine Tags.** `wild.nomads = true` ist ein echtes Feld. `wild.addTag("nomads")` ist ein Tag, den absolut kein Code im Spiel abfragt - er schlägt völlig lautlos fehl :aPES_Liar:.

Verknüpfe anschließend deinen Akteur damit, was beide Systeme zusammenführt:

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.kingdom_id_wild = HelloKingdoms.WILD;
asset.kingdom_id_civilization = HelloKingdoms.CIV;
```

Ohne das spawnt deine Kreatur in dem Königreich, das ihr Klon-Spender genutzt hat - meist Menschen, was für reichlich Verwirrung sorgt.

## Die Felder

### Welche Art von Fraktion es ist

| Feld | Was es tut |
| --- | --- |
| `civ` | Gründet Städte, führt Kriege, hat einen Herrscher |
| `nomads` | Wandernde Phase vor der Stadtgründung |
| `nature` | Wildtiere |
| `mobs` | Feindselige Monster |
| `neutral` | Greift niemanden unprovoziert an |
| `abandoned`, `concept` | Interne Verwaltungsfraktionen, keine echten Völker |
| `brain` | Die KI-gesteuerte Meta-Fraktion |
| `group_main`, `group_miniciv`, `group_minicivs_cool`, `group_creeps` | In welche Schublade die Spiellisten sie einsortieren |

### Wie sie sich verhält

| Feld | Was es tut |
| --- | --- |
| `always_attack_each_other` | Zwei Königreiche dieses Typs sind dauerhaft verfeindet |
| `units_always_looking_for_enemies` | Einheiten suchen ununterbrochen nach Feinden |
| `count_as_danger` | Ob andere Fraktionen sie als Bedrohung einstufen. Standardmäßig `true` |
| `friendship_for_everyone` | Zu allem und jedem friedlich |
| `force_look_all_chunks` | Einheiten scannen die ganze Karte, nicht nur die Umgebung. Teuer |
| `building_attractor_id` | Ein Gebäudetyp, der sie magisch anzieht |

### Tags: Wer gegen wen kämpft

Das ist das Herzstück, und es ist kein Zahlenwert, sondern drei Sammlungen von Strings:

```csharp
kingdom.addTag("civ");             // was ich bin
kingdom.addFriendlyTag("neutral"); // wen ich mag
kingdom.addEnemyTag("orc");        // wen ich hasse
```

Zwei Königreiche vergleichen Tags, um ihre Grundeinstellung zueinander festzulegen. Eine Fraktion ohne Tags mag niemanden, hasst niemanden und tut nichts Interessantes.

### Aussehen

| Feld | Was es tut |
| --- | --- |
| `path_icon`, `show_icon` | Das Fraktions-Icon. `setIcon(path)` setzt beides |
| `default_kingdom_color`, `default_civ_color_index` | Die Startfarbe |
| `color_building` | Farbton, der auf ihre Gebäude gelegt wird |

## Die restliche Fraktions-Verdrahtung

Ein Königreich-Asset allein ist nur ein Bezeichner. Das sind die weiteren Bibliotheken, die ein vollständiges Volk berührt:

| Was | Bibliothek | Verwendungszweck |
| --- | --- | --- |
| Banner | `AssetManager.kingdom_banners_library` | Die generierte Flagge |
| Farben | `AssetManager.kingdom_colors_library` | Farbpalette für die Königreiche |
| Königreich-Eigenschaften | `AssetManager.kingdoms_traits` | Richtlinien, meist Steuern. Siehe **[Königreicheigenschaften](#/nml/kingdom-traits)** |
| Königreich-Jobs | `AssetManager.job_kingdom` | Woran die Fraktions-KI gerade arbeitet |
| Königreich-Tasks | `AssetManager.tasks_kingdom` | Der Verhaltensbaum hinter diesen Jobs |
| Kriegstypen | `AssetManager.war_types_library` | Welche Arten von Krieg erklärt werden können |
| Architektur | `AssetManager.architecture_library` | Wie ihre Gebäude aussehen |
| Bauaufträge | `AssetManager.city_build_orders` | Was eine neue Stadt baut und in welcher Reihenfolge |
| Namensgeneratoren | `AssetManager.name_generator`, `AssetManager.name_sets` | Wie Reiche, Städte und Bürger benannt werden |

Verwende die Vanilla-Optionen wieder, bis du einen triftigen Grund dagegen hast. `banner_id = "human"` auf deinem Akteur gibt dir kostenlos einen funktionierenden Flaggengenerator.

## Königreiche zur Laufzeit manipulieren

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    // kingdom.name, kingdom.cities, kingdom.king, kingdom.getPopulationTotal()
}
```

`isRekt()` ist eine Erweiterungsmethode, die bedeutet: "Dieses Objekt wurde zerstört, aber irgendjemand hält noch eine Referenz darauf". Prüfe das in jeder Schleife über Königreiche, Städte, Armeen oder Einheiten. Es ist der Unterschied zwischen einer stabilen Mod und einer, die einmal pro Stunde abstürzt :aPES2_Sweat:.

## Persönlichkeiten

Ein König und ein Stadtoberhaupt erhalten eine **Persönlichkeit**: ein Label und eine Handvoll `personality_*`-Werte, die steuern, wie aggressiv oder diplomatisch das Königreich agiert. Das Registrieren erfordert drei Zeilen. Schwieriger ist es, jemanden dazu zu bringen, sie zu *besitzen*: `Actor.updateStats()` wählt bei jeder Werteänderung eine von vier vanilla IDs namentlich aus.

```csharp Mods/HelloBox/Code/HelloPersonality.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPersonality
    {
        public const string RESTLESS = "hello_restless";

        public static void Initialize()
        {
            if (AssetManager.personalities.has(RESTLESS)) return;

            PersonalityAsset restless = new PersonalityAsset { id = RESTLESS, icon = "iconHelloSwift" };
            AssetManager.personalities.add(restless);
            restless.base_stats["personality_aggression"] = 0.4f;
            restless.base_stats["personality_diplomatic"] = 0.05f;
            restless.base_stats["personality_administration"] = 0.05f;
        }

        // updateStats() picks a ruler's personality by name, out of four, every time stats change.
        // A new one is never picked unless you swap it in afterwards.
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Personality
        {
            public static void Postfix(Actor __instance)
            {
                PersonalityAsset current = __instance.s_personality;
                if (current == null) return;                               // not a ruler
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                PersonalityAsset mine = AssetManager.personalities.get(RESTLESS);
                if (mine == null || current == mine) return;

                // take the vanilla one's numbers back out, put yours in
                __instance.stats.mergeStats(current.base_stats, -1f);
                __instance.stats.mergeStats(mine.base_stats);
                __instance.s_personality = mine;
            }
        }
    }
}
```

Der Postfix läuft nach jeder Werteaktualisierung, sodass der Tausch dauerhaft bestehen bleibt. Er zieht die Werte der vanilla Persönlichkeit wieder ab, bevor er deine hinzufügt, damit der Herrscher nicht beide trägt. `s_personality` und `mergeStats()` sind `internal`: Dies kompiliert gegen die **publicized** Assembly von NML.

## Meinung, Loyalität und Zufriedenheit

Drei kleine Bibliotheken bestimmen die politische Dynamik, und alle drei sind Listen kleiner Rechenfunktionen:

| Bibliothek | Aufgerufen für | Rückgabe |
| --- | --- | --- |
| `AssetManager.opinion_library` | Jedes Königreichs-Paar | Meinungspunkte, die das eine über das andere hat |
| `AssetManager.loyalty_library` | Jede Stadt | Loyalitätspunkte gegenüber ihrem Königreich |
| `AssetManager.happiness_library` | Ereignisse bei einer Einheit | Feste Änderung der Zufriedenheit |

```csharp Mods/HelloBox/Code/HelloPolitics.cs
namespace HelloBox
{
    public static class HelloPolitics
    {
        public const string WARM = "hello_warm_embers";            // happiness event
        public const string DISTRUST = "hello_opinion_swift_king";  // kingdom to kingdom
        public const string EMBER_AGE = "hello_loyalty_ember_age";  // city to kingdom

        public static void Initialize()
        {
            if (!AssetManager.happiness_library.has(WARM))
            {
                HappinessAsset warm = new HappinessAsset
                {
                    id = WARM,
                    value = 10,
                    path_icon = "ui/Icons/iconHelloDrop",
                    dialogs_amount = 2     // happiness_dialog_hello_warm_embers_0 and _1
                };
                AssetManager.happiness_library.add(warm);

                // post_init() numbers every entry at startup, and the unit's happiness
                // history stores that number, not the id. Yours would show up as entry 0.
                warm.index = AssetManager.happiness_library.list.IndexOf(warm);
            }

            // Opinion and loyalty are summed from the whole list every time: add() is enough.
            if (!AssetManager.opinion_library.has(DISTRUST))
            {
                AssetManager.opinion_library.add(new OpinionAsset
                {
                    id = DISTRUST,
                    translation_key = DISTRUST,
                    calc = (Kingdom pMain, Kingdom pTarget) =>
                    {
                        if (pTarget == null || !pTarget.hasKing()) return 0;
                        return pTarget.king.hasTrait(HelloTraits.SWIFT) ? -10 : 0;
                    }
                });
            }

            if (!AssetManager.loyalty_library.has(EMBER_AGE))
            {
                AssetManager.loyalty_library.add(new LoyaltyAsset
                {
                    id = EMBER_AGE,
                    translation_key = EMBER_AGE,
                    calc = (City pCity) =>
                    {
                        WorldAgeAsset age = AssetManager.era_library.get(HelloAges.EMBERS);
                        if (age == null) return 0;
                        return World.world.era_manager.isCurrentAge(age) ? 5 : 0;
                    }
                });
            }
        }
    }
}
```

Meinung und Loyalität werden jedes Mal aus der gesamten Liste aufsummiert, sodass `add()` genügt. Jeder Eintrag erscheint als eigene Zeile in der Aufschlüsselung des Spiels über `translation_key` (oder `translation_key_negative` bei negativen Zahlen). Zufriedenheitsereignisse feuern, wenn dein Code `actor.changeHappiness("hello_warm_embers")` aufruft, wie es das Festival in **[Pläne & Intrigen](#/nml/plots)** tut.

> [!WARNING] Zufriedenheitseinträge werden beim Spielstart nummeriert
> Der Zufriedenheitsverlauf einer Einheit speichert die *Indexnummer* des Eintrags, nicht seine ID, und `HappinessLibrary.post_init()` vergibt diese Nummern einmalig. Dein Eintrag bliebe bei 0 und würde als erster vanilla Eintrag angezeigt. Setze `index` daher selbst.

## Banner für andere Systeme

Königreiche sind nicht die einzigen Systeme mit Bannern: Kulturen, Religionen, Clans, Sprachen, Unterarten und Familien besitzen jeweils eigene Bibliotheken für Bannerkomponenten (`AssetManager.culture_banners_library` usw.). Jede enthält ein `main`-Asset mit Pfadlisten, und eine neue Kultur würfelt einen Index daraus aus.

```csharp Mods/HelloBox/Code/HelloBanners.cs
namespace HelloBox
{
    public static class HelloBanners
    {
        public const string CULTURE_ICON = "cultures/hello_culture_element";

        public static void Initialize()
        {
            BannerAsset culture = AssetManager.culture_banners_library.main;
            if (culture == null || culture.icons.Contains(CULTURE_ICON)) return;

            // A culture stores the index it rolled, not the path. Append, never insert,
            // or every existing culture's banner shifts by one.
            culture.icons.Add(CULTURE_ICON);
        }
    }
}
```

Pfade werden beim Zeichnen des Banners einzeln geladen, es muss also nichts aktualisiert werden. Ein Index jenseits des Listenendes fällt auf 0 zurück, weshalb ein mit deiner Mod erstellter Spielstand auch ohne sie geöffnet werden kann. Passe die Maße an die vanilla Vorlagen an: Lies eine in **[UnityExplorer](#/toolbox/unity-explorer)** ab, bevor du deine zeichnest.

```json Mods/HelloBox/Locales/en.json
{
  "personality_hello_restless": "Restless",
  "happiness_hello_warm_embers": "Warmed by embers",
  "happiness_dialog_hello_warm_embers_0": "The embers are nice this time of year.",
  "happiness_dialog_hello_warm_embers_1": "Nothing like a little fire from the sky.",
  "hello_opinion_swift_king": "Their king is too fast to trust",
  "hello_loyalty_ember_age": "Loves the Age of Embers"
}
```

> [!TIP] Du brauchst wahrscheinlich kein neues Königreichs-Asset
> Eine neue Kreatur benötigt eines. Ein neues *Verhalten* dagegen nicht: Die meisten "Fraktions"-Mods lassen sich besser über Königreichs-Merkmale, eine Kultur oder einen Harmony-Patch auf Diplomatieprüfungen umsetzen. Füge ein Königreichs-Asset hinzu, wenn deine Kreatur ihren eigenen Platz in der Welt braucht, nicht wenn bestehende Königreiche anders handeln sollen.
