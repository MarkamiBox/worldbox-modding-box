---
title: Encantamientos de armas
group: Contenido del juego
subgroup: Objetos y equipamiento
icon: :wbmagehrm:
order: 122
---

# Encantamientos de armas :wbmagehrm:

Conoces esas pequeñas líneas verdes en una buena espada: *"+3 de daño"*, *"ardiente"*. Son **modificadores de objeto**, y son la forma más rápida de hacer que el botín sea emocionante, porque el juego los aplica automáticamente a las armas generadas.

## La forma sencilla: el creador de NML

Un modificador es un `ItemModAsset`, que es un `ItemAsset` con otro sombrero, y vive en `AssetManager.items_modifiers`:

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

> [!WARNING] Registrarlo no basta
> `add()` mete tu modificador en la `list` de la biblioteca, pero el generador no lee `list`, lee `pools`. Esos pools se llenan en `linkAssets()`, una sola vez, durante la carga. Un modificador que solo está en `list` existe, tiene nombre y nunca saldrá en nada :wbfacepalm:.

```json Mods/HelloBox/Locales/en.json
{
  "mod_hello_sharp": "Sharpened"
}
```

Añade `HelloModifiers.Initialize();` a `Main.cs`, y a partir de ahí el juego puede ponerlo en las armas generadas.

### Los argumentos que importan

| Argumento | Lo que hace |
| --- | --- |
| `id` | Nombre único |
| `mod_type` | La familia. Dos modificadores del mismo tipo nunca aparecen juntos: gana el de mayor `mod_rank` |
| `mod_rank` | Nivel dentro de la familia. También añade valor al arma |
| `translation_key` | Clave de idioma para la línea verde que lee el jugador |
| `rarity` | Frecuencia de aparición. Un número mayor es más común |
| `base_stats` | La bonificación de estadísticas |
| `quality` | Calidad mínima de arma en la que puede aparecer |
| `equipment_value` | Puntuación extra de "lo bueno que es este objeto" |

## Hacer que realmente haga algo

Las estadísticas están bien, pero un modificador también puede ejecutar código, y ahí es donde se pone divertido. `action_attack_target` se ejecuta cada vez que el arma conecta un golpe:

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

Ahora cualquier arma que reciba "hello_burning" prenderá fuego al suelo cuando golpee. Diez líneas, y funciona en cada arma del juego, incluidas las de otros mods :wbfireskull:.

## Los textos de localización

```json Locales/en.json
{
  "hello_sharp": "Sharpened",
  "hello_burning": "Burning"
}
```

El `translation_key` es lo que aparece en la descripción del arma, así que mantenlo breve; va en una sola línea junto a las estadísticas. Nadie lee un párrafo en una espada.

> [!TIP] Modificadores antes que armas
> Un arma nueva es mucho trabajo (sprites, animaciones, materiales). Un nuevo modificador son veinte líneas y se aplica a **todas** las armas que el mundo genera. Si quieres cambiar el juego rápido, empieza por aquí :PES_Stonks:.
