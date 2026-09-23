---
title: Kultur-Eigenschaften
group: Spielinhalte
subgroup: Eigenschaften & Genetik
icon: :wbtiphat:
order: 106
---

# Kultur-Eigenschaften :wbtiphat:

Eine **Kultur** repräsentiert die gemeinsamen Bräuche und Gewohnheiten einer Gruppe von Städten. Sie bestimmt, was die Bürger bauen, was sie schmieden, wie geerbt wird, was sie lesen und welche Werte sie pflegen. Eine Kultur-Eigenschaft ist eine dieser Gewohnheiten.

Von den sieben Eigenschaftssystemen hat die Kultur die größte Reichweite. Eine Kultur breitet sich mit den Städten aus, überlebt ihren Gründer und überträgt ihre Statuswerte auf ausnahmslos jede einzelne Einheit, die ihr angehört. Wenn du eine Mod suchst, deren Auswirkungen sich über eine Stunde Spielzeit sanft durch die ganze Welt ziehen, ist dies die richtige Bibliothek.

| | |
| --- | --- |
| Bibliothek | `AssetManager.culture_traits` |
| Klasse | `CultureTrait` |
| Gruppen | `AssetManager.culture_trait_groups`, Klasse `CultureTraitGroupAsset` |
| Besitzer zur Laufzeit | `Culture`, in `World.world.cultures` |
| Lokalisierungs-Präfix | `culture_trait_` |
| Standard-Icon-Ordner | `ui/Icons/culture_traits/` |

## Einen registrieren

```csharp Mods/HelloBox/Code/HelloCulture.cs
namespace HelloBox
{
    public static class HelloCulture
    {
        public const string DUELLISTS = "hello_duellists";

        public static void Initialize()
        {
            if (AssetManager.culture_traits.has(DUELLISTS)) return;

            CultureTrait trait = new CultureTrait
            {
                id = DUELLISTS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "warfare",
                path_icon = "ui/Icons/iconHelloCulture",
                priority = 10,                       // Ein höherer Wert sortiert nach oben in der Gruppe
                spawn_random_trait_allowed = false,  // Wird niemals zufällig vergeben
                can_be_given = true,                 // Spieler kann es im Editor zuweisen
                can_be_removed = true,
                rarity = Rarity.R2_Epic
            };

            AssetManager.culture_traits.add(trait);

            // Warnung unten: Dies betrifft Bauern genauso wie Soldaten.
            trait.base_stats["critical_chance"] = 0.05f;
        }
    }
}
```

Alles aus **[Eigene Eigenschaften](#/nml/custom-traits)** gilt auch hier: `add()` vor den Stats aufrufen, `path_icon` wird dir nicht automatisch generiert, IDs gehören mit Präfix versehen. Was nun folgt, ist das, was Kultur-Eigenschaften besonders macht.

> [!WARNING] `base_stats` bei einer Kultur-Eigenschaft erreicht jeden
> `Actor.updateStats()` verschmilzt `culture.base_stats` in jede Einheit dieser Kultur. Jede einzelne Einheit. Eine "+5 Schaden"-Doktrin bewaffnet auch die Bäcker.
>
> Wenn der Bonus nur für bestimmte Mitglieder gelten soll, lass `base_stats` leer und begrenze es selbst in einem Harmony-Postfix auf `Actor.updateStats`, siehe **[Harmony-Patches](#/nml/harmony-patches)**. Wenn es für die Kultur als Gemeinschaft statt für die Menschen gelten soll, verwende stattdessen `base_stats_meta`, siehe **[Stats-Referenz](#/nml/stats)**.

## Steuern, was eine Kultur schmiedet

Dies ist das Feld, das Kultur-Eigenschaften besitzen und sonst niemand – und es ist der eleganteste Weg, einer Kultur eine völlig eigene *Persönlichkeit* zu verleihen, ohne eine einzige Waffe anfassen zu müssen:

```csharp
trait.value = 10f;                       // Wie stark die Vorliebe wiegt
trait.addWeaponSubtype("sword");         // Bevorzuge eine ganze Waffenklasse
trait.addWeaponSpecial("hello_relic");   // Oder eine konkrete Item-ID
```

Beide Hilfsmethoden setzen automatisch `is_weapon_trait = true`. Der Handwerkscode liest die bevorzugten Waffen der Kultur ab, wenn eine Stadt entscheidet, was geschmiedet werden soll; dadurch ändert sich die Waffe in der Hand des Soldaten, anstatt nur ein Attributwert. `bow_lovers` und `spear_lovers` in Vanilla funktionieren exakt so.

| Feld | Funktion |
| --- | --- |
| `is_weapon_trait` | Markiert die Eigenschaft als Waffenvorliebe |
| `related_weapon_subtype_ids` | Bevorzugte Waffenklassen. `addWeaponSubtype` fügt hier an |
| `related_weapons_ids` | Bevorzugte konkrete Item-IDs. `addWeaponSpecial` fügt hier an |
| `value` | Wie stark die Vorliebe gewichtet wird |

## Steuern, wie eine Kultur baut

```csharp
trait.setTownLayoutPlan(pZoneCheckerDelegate);
```

Erwartet einen `PassableZoneChecker` und setzt `town_layout_plan = true`. So funktionieren die Stadtplanungs-Eigenschaften von Vanilla: säulengestützte Städte, straßenlastige Metropolen.

Dies ist der tiefste Hook auf dieser Seite und jener, der sich am ehesten mit einer anderen Mod beißt, da eine Kultur immer nur einem Layout-Plan gleichzeitig folgen kann. Prüfe `town_layout_plan` auf den bereits vorhandenen Eigenschaften der Kultur, bevor du annimmst, deine wäre die einzige.

## Die Vanilla-Gruppen

`harmony` · `architecture` · `town_plan` · `kingdom` · `buildings` · `succession` · `knowledge` · `warfare` · `weapons` · `craft` · `happiness` · `worldview` · `miscellaneous` · `fate` · `special`

Dein eigener Tab: siehe **[Eigenschafts-Gruppen & Tabs](#/nml/trait-groups)** mit `AssetManager.culture_trait_groups` und `CultureTraitGroupAsset`.

## Die Texte

```json Mods/HelloBox/Locales/en.json
{
  "culture_trait_hello_duellists": "Duellists",
  "culture_trait_hello_duellists_info": "They settle it one at a time, and they practise."
}
```

## Die Eigenschaft verteilen

```csharp
// Jedes Lebewesen dieser Art startet damit
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addCultureTrait(HelloCulture.DUELLISTS);
```

```csharp
// Oder zur Laufzeit bei bereits existierenden Kulturen
foreach (Culture culture in World.world.cultures)
{
    if (culture == null || culture.isRekt()) continue;
    if (culture.hasTrait("hello_duellists")) continue;

    culture.addTrait("hello_duellists", pRemoveOpposites: true);
}
```

`hasTrait` und `addTrait` akzeptieren entweder den ID-String oder das Asset direkt.

## Kultur-Eigenschaften einer Einheit abfragen

`Actor` bietet dafür eine direkte Abkürzung, weil diese Frage so häufig vorkommt:

```csharp
if (actor.hasCultureTrait("hello_duellists")) { }
```

> [!TIP] Kultur oder Unterart?
> Beide verbreiten sich, aber auf völlig unterschiedliche Weise. Eine **Kultur**-Eigenschaft breitet sich mit Städten aus und kann von jedem übernommen werden, der beitritt. Eine **Unterart**-Eigenschaft verbreitet sich nur über Vererbung. "Elfen schießen besser, weil sie so erzogen wurden" ist Kultur; "Elfen schießen besser wegen ihrer Augen" ist Unterart. Siehe **[Unterarten-Eigenschaften](#/nml/subspecies-traits)** :catnoted:.
