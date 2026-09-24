---
title: Edades del mundo y comportamientos
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbsunblessed:
order: 174
---

# Edades del mundo y comportamientos :wbsunblessed:

Dos elementos pertenecen al mundo en sí mismo más que a los seres que habitan en él. Una **edad del mundo** (world age) es la era en la rueda de edades: la Edad de la Esperanza, la Edad de la Ceniza, con su clima, su iluminación y sus reglas. Un **comportamiento (behaviour) del mundo** (world behaviour) es código que el mundo ejecuta mediante un temporizador continuo: es así como el juego programa desastres (disaster), migraciones y el desgaste de caminos.

```csharp Mods/HelloBox/Code/HelloAges.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAges
    {
        public const string EMBERS = "age_hello_embers";
        public const string SPARKS = "hello_sparks";

        public static void Initialize()
        {
            RegisterAge();
            RegisterBehaviour();
        }

        private static void RegisterAge()
        {
            if (AssetManager.era_library.has(EMBERS)) return;

            WorldAgeAsset age = new WorldAgeAsset
            {
                id = EMBERS,
                path_icon = "ui/Icons/iconHelloAge",
                rate = 2,
                particles_ash = true,
                overlay_ash = true,
                era_effect_overlay_alpha = 0.2f,
                title_color = Toolbox.makeColor("#D14219"),
                bonus_loyalty = 5,
                fire_spread_rate_bonus = 2f,
                cloud_interval = 20f,
                special_effect_interval = 8f
            };
            age.clouds = new List<string> { HelloClouds.EMBER };
            age.biomes = new HashSet<string> { "biome_savanna" };
            age.default_slots = new List<int> { 4 };
            age.special_effect_action = RainEmbers;

            AssetManager.era_library.add(age);

            // post_init() builds this path from the id, at startup. Borrow a vanilla background.
            age.path_background = "ui/AgeWheel/backgrounds/age_sun_background";

            // linkAssets() built both pools at startup: the random pick, and the wheel's default slots
            AssetManager.era_library.list_only_normal.Add(age);
            foreach (int slot in age.default_slots)
            {
                if (AssetManager.era_library.pool_by_slots.TryGetValue(slot, out List<WorldAgeAsset> pool)) pool.Add(age);
            }
        }

        /** Every special_effect_interval seconds while the age lasts. */
        private static void RainEmbers()
        {
            WorldTile[] tiles = World.world.tiles_list;
            if (tiles == null || tiles.Length == 0) return;

            for (int i = 0; i < 5; i++)
            {
                WorldTile tile = tiles[Randy.randomInt(0, tiles.Length)];
                if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
            }
        }

        private static void RegisterBehaviour()
        {
            if (AssetManager.world_behaviours.has(SPARKS)) return;

            WorldBehaviourAsset sparks = new WorldBehaviourAsset
            {
                id = SPARKS,
                interval = 30f,          // seconds between runs
                interval_random = 15f,   // plus up to this much, so it does not tick like a metronome
                action = CurseSomebody
            };

            AssetManager.world_behaviours.add(sparks);

            // MapBox creates one manager per behaviour when it wakes up, before your mod.
            // Without this the world loop calls update() on null, every frame.
            sparks.manager = new WorldBehaviour(sparks);
        }

        /** While the chaos law is on, a random creature catches the curse. */
        private static void CurseSomebody()
        {
            WorldLawAsset chaos = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
            if (chaos == null || !chaos.isEnabled()) return;

            List<Actor> units = World.world.units.getSimpleList();
            if (units.Count == 0) return;

            Actor victim = units[Randy.randomInt(0, units.Count)];
            if (victim != null && victim.isAlive()) victim.addStatusEffect(HelloStatus.CURSED);
        }
    }
}
```

## Edades del mundo

La Edad de las Ascuas hace llover ascuas cada ocho segundos, oscurece la pantalla con ceniza, propaga el fuego el doble de rápido y mantiene a las ciudades algo más leales. Un mundo nuevo puede colocarla en la casilla (tile) 4 de su rueda, y el botón de aleatorizar de la rueda puede asignarla en cualquier parte. La sutileza nunca fue el objetivo de HelloBox :wbfireskull:.

> [!WARNING] Tres cosas que la librería realizó al inicio
> `post_init()` establece el fondo de cada era a partir de su ID, y `linkAssets()` construye `list_only_normal` (la reserva para la era aleatoria desconocida) y `pool_by_slots` (las reservas con las que un mundo nuevo llena su rueda). Una era nueva no está en ninguna de ellas. Si omites el fondo, la rueda mostrará un hueco vacío; si omites las reservas, la era existirá pero ningún mundo la elegirá jamás.

> [!NOTE] La lista de eras elegibles
> La ventana de eras crea un botón por cada era cuando se inicializa, y el juego precarga esa ventana. No he comprobado si se inicializa antes o después de cargar los mods, así que si la tuya tiene botón allí es algo para mirar en el juego, no algo que vaya a prometer. La rueda, las reservas aleatorias y los efectos especiales no dependen de ello.

| Campo | Qué hace |
| --- | --- |
| `rate` | Peso cuando una era se elige al azar |
| `default_slots` | En qué casillas de la rueda (1 a 8) puede colocarla un mundo nuevo |
| `clouds` + `cloud_interval` | Las nubes (cloud) que genera y con qué frecuencia |
| `special_effect_action` + `special_effect_interval` | Tu código periódico mientras dure la era |
| `overlay_*`, `particles_*`, `era_effect_overlay_alpha` | El aspecto: oscuridad, lluvia, nieve, ceniza, sol |
| `title_color`, `light_color` | El color de su nombre y el de la luz ambiental |
| `bonus_loyalty`, `bonus_opinion`, `bonus_biomes_growth` | Modificadores a la política y al crecimiento vegetal |
| `fire_spread_rate_bonus`, `temperature_damage_bonus`, `range_weapons_multiplier` | Reglas del juego que modifica |
| `flag_night`, `flag_winter`, `flag_chaos`, `flag_light_age`, `flag_crops_grow` | Interruptores que otros sistemas consultan. Los cultivos solo crecen si `flag_crops_grow` es true |

Las claves de texto son `<id>_title` e `<id>_description`.

## Comportamientos del mundo

Un comportamiento son dos números y un delegado: ejecuta `action` cada `interval` segundos, más hasta `interval_random` de variación aleatoria. Se pausa junto con el mundo salvo que indiques `stop_when_world_on_pause = false`, y `action_world_clear` se ejecuta al cargar un mundo nuevo.

> [!WARNING] El gestor se crea al iniciar el juego
> El mundo mantiene un temporizador `WorldBehaviour` por cada asset, creado por `createManagers()` cuando el mapa se despierta por primera vez, antes de tu mod. El tuyo tiene `manager == null`, y el bucle del mundo lo invoca de todos modos: `NullReferenceException`, en cada frame, mientras el juego esté abierto :wbfacepalm:. La línea posterior a `add()` lo soluciona.

El comportamiento de HelloBox no hace nada mientras su ley mundial esté desactivada. Ese es el patrón que conviene copiar: la comprobación es baratísima, así que deja correr el temporizador y decide dentro de la acción.

```json Mods/HelloBox/Locales/en.json
{
  "age_hello_embers_title": "Age of Embers",
  "age_hello_embers_description": "The sky is on fire, a little. Cities like it."
}
```

Para código que deba ejecutarse con su propia cadencia sin formar parte del mundo (como la interfaz de usuario), el método `Update()` de NML en tu clase principal sigue siendo la opción más sencilla: consulta **[El mod terminado](#/nml/all-together)** :PES_OkHand:.
