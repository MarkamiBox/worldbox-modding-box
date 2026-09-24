---
title: Waffenverzauberungen
group: Spielinhalte
subgroup: Gegenstände & Ausrüstung
icon: :wbmagehrm:
order: 122
---

# Waffenverzauberungen :wbmagehrm:

Du kennst die kleinen grünen Zeilen auf einem guten Schwert: *"+3 Schaden"*, *"brennend"*. Das sind **Gegenstands-Modifikatoren**, und sie sind der schnellste Weg, Beute aufregend zu machen, weil das Spiel sie automatisch auf gefundene Waffen würfelt.

## Der einfache Weg: Der NML-Creator

Ein Modifikator ist ein `ItemModAsset`, also ein `ItemAsset` mit anderem Hut, und er lebt in `AssetManager.items_modifiers`:

```csharp Mods/HelloBox/Code/HelloModifiers.cs
namespace HelloBox
{
    public static class HelloModifiers
    {
        public const string SHARP = "hello_sharp";

        public static void Initialize()
        {
            if (AssetManager.items_modifiers.has(SHARP)) return;

            ItemModAsset sharp = new ItemModAsset
            {
                id = SHARP,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                mod_type = "sharpness",          // same type: only the higher mod_rank shows up
                mod_rank = 2,
                translation_key = "mod_hello_sharp",
                rarity = 3,                      // bigger = rolled more often. Vanilla uses 1 and 3
                pool = ItemModifierLibrary.WEAPON
            };

            AssetManager.items_modifiers.add(sharp);   // add() first
            sharp.base_stats["damage"] = 8f;           // then the stats

            AddToPool(sharp);                          // and this is the part everybody forgets
        }

        /** The game built its pools while it loaded, which was before your mod existed. */
        private static void AddToPool(ItemModAsset pAsset)
        {
            foreach (string pool in new[] { "weapon", "armor", "accessory" })
            {
                if (!pAsset.pool.Contains(pool)) continue;
                if (!AssetManager.items_modifiers.pools.ContainsKey(pool)) continue;

                // vanilla adds each modifier `rarity` times over: that is the whole weighting system
                for (int i = 0; i < pAsset.rarity; i++)
                {
                    AssetManager.items_modifiers.pools[pool].Add(pAsset);
                }
            }
        }
    }
}
```

> [!WARNING] Registrieren reicht nicht
> `add()` legt deinen Modifikator in die `list` der Bibliothek, aber der Generator liest nicht `list`, sondern `pools`. Diese Pools werden in `linkAssets()` gefüllt, einmal, beim Laden. Ein Modifikator, der nur in `list` steht, existiert, hat einen Namen und wird nie auf irgendetwas gewürfelt :wbfacepalm:.

```json Mods/HelloBox/Locales/en.json
{
  "mod_hello_sharp": "Sharpened"
}
```

Füge `HelloModifiers.Initialize();` zu `Main.cs` hinzu, und ab dann kann das Spiel ihn auf generierte Waffen würfeln.

### Die entscheidenden Argumente

| Argument | Was es bewirkt |
| --- | --- |
| `id` | Eindeutiger Bezeichner |
| `mod_type` | Die Familie. Zwei Modifikatoren desselben Typs erscheinen nie zusammen: Der höhere `mod_rank` gewinnt |
| `mod_rank` | Stufe innerhalb der Familie. Erhöht auch den Ausrüstungswert der Waffe |
| `translation_key` | Der Lokalisierungsschlüssel für die grüne Textzeile |
| `rarity` | Würfelhäufigkeit. Größer bedeutet häufiger |
| `base_stats` | Der Wertebonus |
| `quality` | Mindestqualität der Waffe, auf der dieser Modifikator erscheinen kann |
| `equipment_value` | Zusätzlicher Bewertungswert für die KI |

## Dem Modifier echte Effekte verleihen

Werte sind schön, aber ein Modifikator kann auch echten Code ausführen, und da wird es spaßig. `action_attack_target` feuert jedes Mal, wenn die Waffe einen Treffer landet:

```csharp
ItemAssetCreator.CreateAndAddModifier(
    id: "hello_burning",
    mod_type: "elemental",
    mod_rank: 1,
    translation_key: "hello_burning",
    rarity: 1,
    action_attack_target: (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
    {
        if (pTarget == null || pTile == null) return false;
        World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
        return true;
    });
```

Jetzt setzt jede Waffe, die "hello_burning" auswürfelt, den Boden bei einem Treffer in Brand. Zehn Zeilen, und es wirkt auf jeder Waffe im Spiel, inklusive derer aus anderen Mods :wbfireskull:.

## Die Texte (Lokalisierung)

```json Locales/en.json
{
  "hello_sharp": "Sharpened",
  "hello_burning": "Burning"
}
```

Der `translation_key` ist das, was im Gegenstands-Tooltip angezeigt wird. Halte ihn kurz, er steht in einer Zeile neben den Werten. Niemand liest einen Absatz auf einem Schwert.

> [!TIP] Erst Modifikatoren, dann Waffen
> Eine neue Waffe ist viel Arbeit (Sprite, Animationen, Materialien). Ein neuer Modifikator braucht zwanzig Zeilen und gilt für **jede** Waffe, die die Welt erzeugt. Wenn du schnelle Ergebnisse willst, fange hier an :PES_Stonks:.
