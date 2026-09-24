---
title: Reinos y facciones
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbkingdoms:
order: 178
---

# Reinos y facciones :wbkingdoms:

Cada unidad en WorldBox pertenece a un reino (kingdom). No solo las civilizadas: los lobos pertenecen a un reino de lobos, los bandidos a una facción de bandidos y un pollo neutral pertenece a uno neutral. Un `KingdomAsset` es el **tipo** de facción, no un reino concreto en el mapa.

Esa es la distinción clave:

| | |
| --- | --- |
| `KingdomAsset` en `AssetManager.kingdoms` | La plantilla. "Qué define a un reino orco" |
| `Kingdom` en `World.world.kingdoms` | Un reino real en el mundo en ejecución, con nombre, color y ciudades |

Tú registras el primero. El juego se encarga de instanciar el segundo.

## Clonar una plantilla

Al igual que los actores, los reinos cuentan con identificadores `$TEMPLATE$` expresamente pensados para esto:

| Plantilla | Para qué sirve |
| --- | --- |
| `$TEMPLATE_CIV$` | Una facción civilizada |
| `$TEMPLATE_CIV_NEW$` | El estilo más nuevo de civilizaciones animales |
| `$TEMPLATE_NOMAD$` | La etapa salvaje antes de asentarse |
| `$TEMPLATE_MOB$` | Una facción hostil de monstruos |
| `$TEMPLATE_MOB_GOOD$` / `$TEMPLATE_MOB_VERY_GOOD$` | Hostil ante ciertas cosas, amistosa con civilizaciones |
| `$TEMPLATE_ANIMAL$` | Fauna salvaje |
| `$TEMPLATE_ANIMAL_NEUTRAL$` / `$TEMPLATE_ANIMAL_PEACEFUL$` | Fauna pacífica que nunca inicia combates |

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

            // La facción civilizada asentada.
            KingdomAsset civ = AssetManager.kingdoms.clone(CIV, "$TEMPLATE_CIV$");
            civ.addTag("civ");
            civ.addFriendlyTag("civ");
            civ.addEnemyTag("orc");
            civ.setIcon("ui/Icons/iconHelloCiv");

            // La etapa nómada antes de fundar una ciudad.
            KingdomAsset wild = AssetManager.kingdoms.clone(WILD, "$TEMPLATE_NOMAD$");
            wild.addTag("hello_sprite");
            wild.addFriendlyTag("hello_sprite");
            wild.setIcon("ui/Icons/iconHelloWild");
        }
    }
}
```

`$TEMPLATE_NOMAD$` ya configura `nomads = true`, `civ = false` y `mobs = true` por ti. Vale la pena recalcarlo porque es un error común: **`civ`, `nomads`, `mobs` y compañía son campos `bool`, no etiquetas.** `wild.nomads = true` es un campo real. `wild.addTag("nomads")` es una etiqueta que nada en el juego lee, fallando silenciosamente :aPES_Liar:.

Luego vincula tu actor a ellas, que es el paso que une ambos extremos:

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.kingdom_id_wild = HelloKingdoms.WILD;
asset.kingdom_id_civilization = HelloKingdoms.CIV;
```

Sin eso, tu criatura aparecerá en el reino que utilizaba el donante de su clon, normalmente humanos, causando no poca confusión :PES5_Hmmmm:.

## Los campos

### Qué clase de facción es

| Campo | Qué hace |
| --- | --- |
| `civ` | Funda ciudades, libra guerras (war), tiene un rey |
| `nomads` | La etapa errante antes de fundar asentamientos |
| `nature` | Vida silvestre |
| `mobs` | Monstruos hostiles |
| `neutral` | No ataca a nadie sin provocación previa |
| `abandoned`, `concept` | Facciones internas de gestión, no facciones reales |
| `brain` | La metafacción controlada por la IA |
| `group_main`, `group_miniciv`, `group_minicivs_cool`, `group_creeps` | En qué sección la clasifican las listas internas del juego |

### Cómo se comporta

| Campo | Qué hace |
| --- | --- |
| `always_attack_each_other` | Dos reinos de este tipo son permanentemente hostiles entre sí |
| `units_always_looking_for_enemies` | Las unidades patrullan buscando enemigos sin cesar |
| `count_as_danger` | Si las demás facciones la consideran una amenaza. `true` por defecto |
| `friendship_for_everyone` | Amistosa con todo el mundo |
| `force_look_all_chunks` | Las unidades escanean el mapa entero, no solo su entorno. Costoso |
| `building_attractor_id` | Tipo de edificio (building) que las atrae |

### Etiquetas: quién lucha contra quién

Esta es la parte vital, y no es un atributo numérico sino tres colecciones de strings:

```csharp
kingdom.addTag("civ");             // qué soy
kingdom.addFriendlyTag("neutral"); // a quién aprecio
kingdom.addEnemyTag("orc");        // a quién detesto
```

Dos reinos comparan sus etiquetas para decidir su postura diplomática predeterminada. Una facción sin etiquetas no quiere a nadie, no odia a nadie y no hace nada interesante.

### Aspecto visual

| Campo | Qué hace |
| --- | --- |
| `path_icon`, `show_icon` | El icono de la facción. `setIcon(path)` configura ambos |
| `default_kingdom_color`, `default_civ_color_index` | El color inicial |
| `color_building` | Tinte aplicado a sus edificios |

## El resto de conexiones de una facción

Un asset de reino por sí solo es solo una etiqueta. Una etiqueta muy oficial, pero una etiqueta. Estas son las otras bibliotecas con las que interactúa una facción completa:

| Qué | Biblioteca | Uso principal |
| --- | --- | --- |
| Estandartes | `AssetManager.kingdom_banners_library` | La bandera generada |
| Colores | `AssetManager.kingdom_colors_library` | La paleta de colores asignada a los reinos |
| Rasgos (trait) de reino | `AssetManager.kingdoms_traits` | Políticas, principalmente impuestos. Consulta **[Rasgos de reinos](#/nml/kingdom-traits)** |
| Trabajos (job) de reino | `AssetManager.job_kingdom` | En qué objetivo trabaja la IA de la facción |
| Tareas (task) de reino | `AssetManager.tasks_kingdom` | El árbol de comportamiento (behaviour) tras esos trabajos |
| Tipos de guerra | `AssetManager.war_types_library` | Las clases de guerra que pueden declararse |
| Arquitectura | `AssetManager.architecture_library` | Cómo lucen sus edificios |
| Órdenes de construcción | `AssetManager.city_build_orders` | Qué construye una ciudad nueva y en qué orden |
| Generadores de nombres | `AssetManager.name_generator`, `AssetManager.name_sets` | Cómo se nombran reinos, ciudades y ciudadanos |

Reutiliza los elementos vanilla hasta que tengas un motivo de peso para cambiarlos. Asignar `banner_id = "human"` a tu actor te otorga un generador de banderas funcional gratis.

## Interactuar con reinos en tiempo de ejecución

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    // kingdom.name, kingdom.cities, kingdom.king, kingdom.getPopulationTotal()
}
```

`isRekt()` es un método de extensión que indica: "este objeto ha sido destruido pero algo aún retiene una referencia a él". Compruébalo siempre en cada bucle sobre reinos, ciudades, ejércitos o unidades. Es la diferencia entre un mod estable y uno que explota una vez por hora :aPES2_Sweat:.

## Personalidades

Un rey y el líder de una ciudad reciben una **personalidad**: una etiqueta y varias estadísticas (stats) `personality_*` que orientan si el reino juega de forma agresiva o diplomática. Registrar una son tres líneas. Que alguien la *tenga* es el verdadero reto: `Actor.updateStats()` elige una de las cuatro opciones vanilla por nombre cada vez que cambian las estadísticas.

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

El postfix se ejecuta tras cada actualización de estadísticas, manteniendo el cambio. Resta las cifras de la personalidad vanilla antes de sumar las tuyas para evitar que el gobernante acumule ambas. `s_personality` y `mergeStats()` son miembros `internal`: compila contra la biblioteca **publicized** de NML.

## Opinión, lealtad y felicidad

Tres pequeñas librerías definen la sensación política del mundo, y las tres son listas de pequeñas funciones de cálculo. Sin sentimientos, solo números:

| Librería | Evaluada para | Devuelve |
| --- | --- | --- |
| `AssetManager.opinion_library` | Cada pareja de reinos | Puntos de opinión que uno tiene del otro |
| `AssetManager.loyalty_library` | Cada ciudad | Puntos de lealtad hacia su reino |
| `AssetManager.happiness_library` | Eventos que le ocurren a una unidad | Un cambio fijo de felicidad |

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

La opinión y la lealtad se suman de la lista completa en cada evaluación, por lo que `add()` es suficiente, y cada una aparece como su propia línea en el desglose del juego usando `translation_key` (o `translation_key_negative` si el valor es negativo). Los eventos de felicidad se disparan cuando tu código invoca `actor.changeHappiness("hello_warm_embers")`, como hace el festival en **[Complots](#/nml/plots)**.

> [!WARNING] Las entradas de felicidad se numeran al inicio
> El historial de felicidad de una unidad guarda el *número* de la entrada, no su ID, y `HappinessLibrary.post_init()` reparte esos números una sola vez. La tuya quedaría en 0 y se mostraría como la primera entrada vanilla. Asigna `index` manualmente.

## Estandartes para otros sistemas

Los reinos no son los únicos con estandartes: culturas (culture), religiones (religion), clanes, idiomas, subespecies (subspecies) y familias tienen sus propias librerías de piezas (`AssetManager.culture_banners_library` y afines). Cada una tiene un asset `main` con listas de rutas, y una nueva cultura elige un índice al azar.

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

Las rutas se cargan individualmente al dibujar el estandarte, por lo que no hay nada que recargar. Un índice fuera de rango recurre al 0, por lo que un guardado hecho con tu mod seguirá abriéndose sin él. Respeta las dimensiones originales: inspecciona una en **[UnityExplorer](#/toolbox/unity-explorer)** antes de dibujar la tuya. Adivina el tamaño y tendrás una bandera más grande que la ciudad que la iza :wbfacepalm:.

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

> [!TIP] Probablemente no necesitas un nuevo asset de reino
> Una nueva criatura lo necesita. Un nuevo *comportamiento* no: la mayoría de mods de "facciones" se logran mejor mediante rasgos de reino, una cultura o un parche Harmony en la diplomacia. Añade un asset de reino cuando tu criatura necesite su propio lugar en el mundo, no para que los reinos existentes actúen diferente.
