---
title: Logros
group: Contenido del juego
subgroup: Toques finales y logros
icon: :gold_star:
order: 220
---

# Logros :gold_star:

Sí, un mod puede añadir logros. Aparecen en la ventana de logros del juego, se desbloquean con su animación emergente como los oficiales y se guardan junto con el progreso del jugador. Lee la advertencia del final antes de publicar uno.

```csharp Mods/HelloBox/Code/HelloAchievements.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAchievements
    {
        public const string SWARM = "achievement_hello_wisp_swarm";
        private const string WATCH = "hello_achievement_watch";

        public static void Initialize()
        {
            if (AssetManager.achievements.has(SWARM)) return;

            Achievement swarm = new Achievement
            {
                id = SWARM,
                group = "creatures",
                icon = "ui/Icons/iconHelloWisp",
                locale_key = SWARM,      // post_init() derives it at startup; yours stays null without this
                action = (object pData) => CountWisps() >= 10
            };

            AssetManager.achievements.add(swarm);

            // the achievements window reads each group's list, filled by linkAssets() at startup
            AssetManager.achievement_groups.get(swarm.group).achievements_list.Add(swarm);

            // nothing in the game knows when to check yours: look every 30 seconds
            WorldBehaviourAsset watch = new WorldBehaviourAsset
            {
                id = WATCH,
                interval = 30f,
                interval_random = 0f,
                action = () =>
                {
                    if (!swarm.isUnlocked()) swarm.check();
                }
            };
            AssetManager.world_behaviours.add(watch);
            watch.manager = new WorldBehaviour(watch);
        }

        private static int CountWisps()
        {
            int count = 0;
            List<Actor> units = World.world.units.getSimpleList();
            for (int i = 0; i < units.Count; i++)
            {
                Actor unit = units[i];
                if (unit != null && unit.isAlive() && unit.asset.id == "hello_wisp") count++;
            }
            return count;
        }
    }
}
```

Diez fuegos fatuos vivos al mismo tiempo, y el logro se desbloqueará. Top 10 logros de todos los tiempos :trollface:.

## Lo que el juego no hace por ti

- **La clave de texto.** `post_init()` rellena `locale_key` a partir del ID para todos los logros originales. El tuyo se queda en `null` y la ventana no muestra nada, así que asígnalo tú mismo.
- **La ventana.** La ventana de logros lista el `achievements_list` de cada grupo, generado por `linkAssets()` al inicio. Añade el tuyo al grupo, o se desbloqueará sin que nadie pueda verlo.
- **La comprobación.** Nada en el juego sabe *cuándo* evaluar tu logro: el juego original llama a `check()` exactamente en los puntos del código donde sus condiciones pueden cambiar. HelloBox utiliza un **[comportamiento del mundo](#/nml/world-ages)** que comprueba cada treinta segundos, lo cual sobra para "existen diez criaturas de cierto tipo". Para un evento concreto, llama a `check()` justo donde ocurra la acción.

| Campo | Qué hace |
| --- | --- |
| `group` | La sección de la ventana: `creation`, `worlds`, `civilizations`, `creatures`, `destruction`, `nature`, `experiments`, `collection`, `exploration`, `forbidden`, `miscellaneous` |
| `icon` | Su imagen, como ruta completa de sprite |
| `action` | Tu condición. `check()` lo desbloquea si devuelve `true`; llamar a `check()` sin `action` lo desbloquea de inmediato |
| `hidden` | Muestra una línea de "oculto" en lugar de la descripción hasta desbloquearse |
| `locale_key` | La clave de texto. La descripción usa `<locale_key>_description` |

```json Mods/HelloBox/Locales/en.json
{
  "achievement_hello_wisp_swarm": "Wisp Swarm",
  "achievement_hello_wisp_swarm_description": "Have ten wisps alive at the same time."
}
```

> [!WARNING] Se guardan en el progreso real del jugador
> Al desbloquearse se ejecuta el código nativo del juego: escribe el ID en el archivo de progreso del jugador y solicita a Steam desbloquear un logro con ese ID. Steam no tiene ningún logro registrado con tu ID, por lo que en Steam no pasará nada, pero la llamada se realiza y el registro muestra `Unlocking in Steam: <id>`. El juego también envía el ID con sus eventos de analítica. Además, mientras la ley de "mundo maldito" esté activa, no se desbloquea absolutamente nada, incluidos los tuyos.

Nada de esto rompe el juego. Sin embargo, sigue siendo el archivo de progreso real del jugador: sé comedido y nunca desbloquees nada que el jugador no haya realizado :PESgn_ReadRules:.
