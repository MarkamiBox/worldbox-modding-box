---
title: Königreichs-Eigenschaften
group: Spielinhalte
subgroup: Eigenschaften & Genetik
icon: :wbcrown:
order: 114
---

# Königreichs-Eigenschaften :wbcrown:

Eine **Königreichs-Eigenschaft** ist Politik. Kein Glaube, keine Blutlinie: eine Entscheidung, die die Krone getroffen hat und die für das gesamte Reich gilt.

Vanilla nutzt dieses System für genau eine einzige Sache: Steuersätze. Das macht es zum kleinsten und leersten der sieben Eigenschaftssysteme – und damit zum spannendsten Ort für eigene Ideen. Niemand macht dir hier den Platz streitig :wbsmirk:.

| | |
| --- | --- |
| Bibliothek | `AssetManager.kingdoms_traits` |
| Klasse | `KingdomTrait` |
| Gruppen | `AssetManager.kingdoms_traits_groups`, Klasse `KingdomTraitGroupAsset` |
| Besitzer zur Laufzeit | `Kingdom`, in `World.world.kingdoms` |
| Lokalisierungs-Präfix | `kingdom_trait_` |
| Standard-Icon-Ordner | `ui/Icons/kingdom_traits/` |

> [!WARNING] Königreichs-Stats erreichen keine Einheiten
> Wie bei der Religion wird `kingdom.base_stats` niemals in einen `Actor` übertragen. Die Zahlen auf Königreichsebene, die du im Spiel siehst, stammen aus den **eigenen Stats des Königs** (`king.stats["cities"]` und Konsorten), nicht aus dem Eigenschaftsblock des Reiches.
>
> Eine Königreichs-Eigenschaft verändert das Reich daher durch ihre eigenen Felder und über Code, nicht über `base_stats`.

## Die Steuer-Felder

Die drei Felder, die nur Königreichs-Eigenschaften besitzen, und das Einzige, was Vanilla mit diesem System anstellt:

```csharp
KingdomTrait trait = new KingdomTrait
{
    id = "hello_tax_rate_local_brutal",
    group_id = "local_tax",
    is_local_tax_trait = true,
    tax_rate = 0.9f
};
AssetManager.kingdoms_traits.add(trait);
trait.addOpposite("tax_rate_local_low");
```

| Feld | Funktion |
| --- | --- |
| `is_local_tax_trait` | Diese Eigenschaft setzt den **lokalen** Steuersatz des Reiches |
| `is_tribute_tax_trait` | Diese Eigenschaft setzt den **Tribut**-Satz des Reiches |
| `tax_rate` | Der Steuersatz selbst, als Dezimalbruch |

Das Königreich berechnet beide Steuersätze von Grund auf neu, sobald sich seine Eigenschaften ändern: Es beginnt beim globalen Standardwert in `SimGlobals`, durchläuft seine Eigenschaften und lässt jede passende den Wert **überschreiben**.

> [!WARNING] Der Letzte gewinnt – deklariere daher Gegensätze
> Steuereigenschaften addieren sich nicht auf. Wenn ein Königreich zwei `is_local_tax_trait`-Eigenschaften besitzt, gewinnt stillschweigend jene, die in der Iteration später an die Reihe kommt.
>
> Jede Vanilla-Steuereigenschaft erklärt die jeweils andere genau aus diesem Grund zum gegenseitigen Gegensatz. Tu dasselbe auf beiden Seiten, sonst wird deine Steuerquote mal greifen und mal nicht :PES5_HmmmmNo:.

## Eine Eigenschaft ordnungsgemäß registrieren

```csharp Mods/HelloBox/Code/HelloKingdomTraits.cs
namespace HelloBox
{
    public static class HelloKingdomTraits
    {
        public const string LEVY = "hello_levy";

        public static void Initialize()
        {
            if (AssetManager.kingdoms_traits.has(LEVY)) return;

            KingdomTrait trait = new KingdomTrait
            {
                id = LEVY,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "miscellaneous",
                path_icon = "ui/Icons/iconHelloKingdom",
                spawn_random_trait_allowed = false,
                can_be_given = true,
                can_be_removed = true
            };

            AssetManager.kingdoms_traits.add(trait);
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed` wird nur einmal gelesen, beim Start
> Neue Königreiche würfeln ihre Startmerkmale aus einem Topf, den `BaseTraitLibrary.linkAssets()` beim Laden des Spiels baut, bevor deine Mod existiert. Den Schalter an deinem Merkmal zu setzen ändert allein nichts: Dein Merkmal ist nie in diesem Topf und taucht nie zufällig auf. Leg es selbst hinein, gewichtet wie in Vanilla:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.kingdoms_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` ist `protected`, also kompiliert das gegen die publizierte Assembly, mit der NML deine Mod ohnehin baut. `spawn_random_rate` ist standardmäßig `5`: Erhöhe es, und das Merkmal taucht öfter auf.

## Eine Politik erstellen, die tatsächlich etwas bewirkt

Da `base_stats` ausscheidet, rechtfertigt eine Königreichs-Eigenschaft ihre Existenz auf zwei Wegen. Beides ist mehr Arbeit als eine Zahl, und beides lohnt sich.

**Eine Entscheidung**, die saubere und unkomplizierte Variante:

```csharp
trait.addDecision("some_decision_id");
// ids are resolved at startup, before your mod: resolve yours
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("some_decision_id") };
```

**Ein Harmony-Patch, der die Eigenschaft abfragt**, womit du ein echtes Regierungssystem aufbaust. Patche die Methode, die das Verhalten der Krone steuert, und prüfe dort die Eigenschaften des Reiches:

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;
        if (!__instance.kingdom.hasTrait(HelloKingdomTraits.LEVY)) return;

        __result *= 1.35f;
    }
}
```

Das ist das Muster für jede Königreichspolitik, die kein Steuersatz ist: Die Eigenschaft fungiert als Schalter, und dein Patch liefert das Verhalten. Siehe **[Harmony-Patches](#/nml/harmony-patches)**.

## Die Vanilla-Gruppen

`tribute` · `local_tax` · `miscellaneous` · `fate`

Vier Gruppen, von denen zwei das Steuerpaar bilden. Wenn du mehr als ein oder zwei Richtlinien baust, erstelle einen eigenen Tab, siehe **[Eigenschafts-Gruppen & Tabs](#/nml/trait-groups)** mit `AssetManager.kingdoms_traits_groups` und `KingdomTraitGroupAsset`.

## Die Texte

```json Mods/HelloBox/Locales/en.json
{
  "kingdom_trait_hello_levy": "Levy",
  "kingdom_trait_hello_levy_info": "Everyone who can carry a spear, carries a spear."
}
```

## Die Eigenschaft verteilen

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addKingdomTrait(HelloKingdomTraits.LEVY);
```

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    kingdom.addTrait(HelloKingdomTraits.LEVY, pRemoveOpposites: true);
}
```

Das Königreichs-Asset, aus dem eine Fraktion hervorgeht, ist ein eigenständiges Objekt, siehe **[Königreiche & Fraktionen](#/nml/kingdoms)**.

> [!TIP] Der leere Raum
> Sechs der sieben Eigenschaftssysteme sind vollgestopft mit Vanilla-Inhalten, um die man mühsam herumbauen muss. Dieses hier enthält ganze fünf Eigenschaften. Wenn du eine Mod suchst, die sich nahtlos ins Spiel einfügt und mit nichts kollidiert, sind königliche Edikte der eleganteste Weg :PES2_Cash:.
