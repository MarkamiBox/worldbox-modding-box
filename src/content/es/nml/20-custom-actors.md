---
title: Actores personalizados
group: Contenido del juego
subgroup: Actores, edificios e IA
icon: :wbhuman:
order: 140
---

# Actores personalizados :wbhuman:

> [!NOTE] Se llaman actores, no razas
> El juego llama a cada ser vivo un **actor**: un humano, un lobo, un dragón, un zombi, un cangrejo. Todos provienen de la misma clase, `ActorAsset`, y todos viven en `AssetManager.actor_library`. "Raza" es el término antiguo. El único lugar donde sobrevive es en una propiedad `race` marcada con `[Obsolete("use .original_actor_asset instead")]`, que solo existe para cargar partidas guardadas antiquísimas. Escribe `actor` en todas partes.

Una nueva criatura es el mod que todo el mundo quiere hacer y que casi nadie termina, porque un `ActorAsset` arrastra animaciones, texturas, sonidos, taxonomía, dieta, flags de IA, genoma, cultura y estadísticas. Equivocarte en uno solo de ellos te dará una unidad invisible de pie en medio del océano :PES4_Invisible:.

Buenas noticias: el juego tampoco construye criaturas desde cero. Esto es literalmente cómo el juego base crea un elfo:

```csharp
clone("elf", "$civ_advanced_unit$");
```

Así que nosotros hacemos exactamente lo mismo.

## Las plantillas

Los ids rodeados por `$` son **plantillas** (templates): actores a medio terminar que el juego guarda solo para que otros actores puedan clonarse a partir de ellos. Son el punto de partida adecuado para una criatura completamente nueva, ya que contienen toda la arquitectura interna sin cargar con los sprites de un humano.

| Plantilla | Clonar para |
| --- | --- |
| `$basic_unit$` | El ser vivo mínimo indispensable |
| `$animal$` | Un animal salvaje |
| `$mob$` | Un monstruo hostil |
| `$civ_unit$` | Una criatura civilizada básica |
| `$civ_advanced_unit$` | Una criatura de civilización completa: ciudades, reinos, cultura, religión. Lo que usan humanos, elfos, orcos y enanos |

También puedes clonar un actor terminado - `human`, `wolf`, `zombie` - y ese es el camino más fácil para tu primera criatura, porque los sprites del donante vienen incluidos y tu criatura será visible de inmediato.

## Un solo actor

```csharp Mods/HelloBox/Code/HelloActors.cs
namespace HelloBox
{
    public static class HelloActors
    {
        public const string SPRITE = "hello_sprite";

        public static void Initialize()
        {
            if (AssetManager.actor_library.has(SPRITE)) return;

            // clone() copies every field, gives the copy the new id, and registers it.
            // Do NOT call add() afterwards: that registers it a second time and the
            // library logs "duplicate asset - overwriting...".
            ActorAsset sprite = AssetManager.actor_library.clone(SPRITE, "human");

            sprite.name_locale = "Sprite";
            sprite.civ = true;                       // founds cities, joins kingdoms, goes to war
            sprite.can_have_subspecies = true;
            sprite.actor_size = ActorSize.S13_Human;
            sprite.color_hex = "#7FE7C4";
            sprite.icon = "iconHelloSprite";

            // visible immediately: no need to discover them first
            sprite.needs_to_be_explored = false;

            // Taxonomy: what the knowledge window shows.
            sprite.name_taxonomic_genus = "spiritus";
            sprite.name_taxonomic_species = "minor";

            // Stats. clone() already ran add(), so base_stats exists here.
            sprite.base_stats["health"] = 80;
            sprite.base_stats["damage"] = 12;
            sprite.base_stats["speed"] = 32f;

            // see the warning below: the shadow is not loaded for you
            sprite.texture_asset.loadShadow();
        }
    }
}
```
> [!WARNING] Carga la sombra tú, o el juego se queja de cada actor
> `ActorAssetLibrary` recorre su lista al arrancar y llama a `loadShadow()` en cada actor, que carga el sprite de `shadows/<shadow_texture>` y lo mide. Eso pasó antes de que tu mod registrara nada, así que la sombra de tu actor se queda en `(0.00, 0.00)` y el juego escribe un error de asset por ella, tres veces: adulto, huevo y bebé :wbfacepalm:.
>
> `loadShadow()` es `internal`, así que necesita una `Assembly-CSharp.dll` **publicized** como el resto de la guía. Si no tienes una, pon `asset.shadow = false;`: sin sombra, pero sin error.


> [!WARNING] clone() ya registra
> `AssetManager.<library>.clone(newId, sourceId)` llama a `add()` internamente. Cada librería funciona así. Llamar a `add()` tú mismo después es un registro duplicado: la librería elimina la primera copia, registra un error y la vuelve a añadir. Es inofensivo, pero ensucia el log dificultando encontrar errores reales, y es lo primero que un revisor notará.
>
> La contrapartida es la buena noticia: **tras un clone, `base_stats` ya existe**, por lo que la regla de "estadísticas después de add" de **[Rasgos personalizados](#/nml/custom-traits)** ya queda cumplida.

## Varios actores a la vez

La mayoría de los mods de criaturas no incluyen una sola criatura. Tres espíritus significan tres assets, y en el momento en que copias y pegas el bloque anterior tres veces, tienes tres lugares en los que arreglar cada error.

Pon las diferencias en una tabla y el código en un bucle:

```csharp Mods/HelloBox/Code/HelloActors.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloActors
    {
        // Everything that actually differs between the three, in one place.
        private struct Def
        {
            public string Id;
            public string From;      // which actor or template to clone
            public string Color;
            public string Icon;
            public float Health;
            public float Damage;
            public float Speed;
            public bool OwnArt;      // true: sprites come from GameResources/actors/species/other/<id>/
        }

        private static readonly Def[] Defs = new Def[]
        {
            new Def { Id = "hello_sprite", From = "human", Color = "#7FE7C4", Icon = "iconHelloSprite", Health = 80,  Damage = 12, Speed = 32f },
            new Def { Id = "hello_wisp",   From = "wolf",  Color = "#C49BFF", Icon = "iconHelloWisp",   Health = 60,  Damage = 20, Speed = 40f, OwnArt = true },
            new Def { Id = "hello_golem",  From = "wolf",  Color = "#8C8C8C", Icon = "iconHelloGolem",  Health = 240, Damage = 30, Speed = 18f, OwnArt = true },
        };

        public static void Initialize()
        {
            for (int i = 0; i < Defs.Length; i++)
            {
                Register(Defs[i]);
            }
        }

        private static void Register(Def pDef)
        {
            if (AssetManager.actor_library.has(pDef.Id)) return;
            if (!AssetManager.actor_library.has(pDef.From)) return;   // donor missing, skip quietly

            ActorAsset asset = AssetManager.actor_library.clone(pDef.Id, pDef.From);

            asset.civ = !pDef.OwnArt;                // a civ needs heads, male and female sheets
            asset.can_have_subspecies = true;
            asset.actor_size = ActorSize.S13_Human;
            asset.color_hex = pDef.Color;
            asset.icon = pDef.Icon;

            if (pDef.OwnArt)
            {
                // clone() copied the donor's texture paths, so point this one at its own folder.
                // The folder holds main/ and child/, one PNG per frame: walk_0..3, swim_0..3.
                asset.texture_asset = new ActorTextureSubAsset("actors/species/other/" + pDef.Id + "/", false);
                asset.has_advanced_textures = false;
                asset.animation_walk = ActorAnimationSequences.walk_0_3;
                asset.animation_swim = ActorAnimationSequences.swim_0_3;
                asset.animation_idle = ActorAnimationSequences.walk_0;
            }

            // visible immediately: no need to discover them first
            asset.needs_to_be_explored = false;

            asset.base_stats["health"] = pDef.Health;
            asset.base_stats["damage"] = pDef.Damage;
            asset.base_stats["speed"] = pDef.Speed;

            // The library loads every actor's shadow during its own startup, which was before
            // your mod existed. Without this the game logs "Shadow size is too small (0.00, 0.00)".
            asset.texture_asset.loadShadow();
        }
    }
}
```

Añadir una cuarta criatura ahora cuesta una sola línea en la tabla. Esta es la estructura que adopta casi cualquier mod de criaturas publicado, y vale la pena escribirlo así a partir de la segunda criatura :PESgn_ThisTBH:.

## Los campos que deciden qué *es* tu criatura

El primer día solo importan tres: `civ`, `actor_size` y `name_locale`. El resto puede esperar hasta que tu criatura sea visible y camine.

| Campo | Qué hace |
| --- | --- |
| `civ` | Criatura de civilización: ciudades, reinos, oficios, guerra. `false` = animal |
| `auto_civ` | Si el juego empieza a civilizarlos por su cuenta |
| `default_animal` | Lo marca como fauna silvestre para las comprobaciones internas del juego |
| `unit_other` | Ni civilización ni animal: un monstruo, un constructo o algo especial |
| `actor_size` | `S0_Bug` … `S13_Human` … `S17_Dragon`. Controla el renderizado y algunos cálculos de combate |
| `name_locale` | Clave del nombre para mostrar |
| `icon` | El icono usado en listas y botones de generación |
| `color_hex` | El tinte aplicado a unidades coloreables |
| `can_have_subspecies` | Si mutan en subespecies a lo largo de las generaciones |
| `has_ai_system` | Si ejecutan el sistema de comportamiento |
| `flying` / `hovering` | Si despegan del suelo y a qué altura |
| `force_ocean_creature` / `force_land_creature` | Bloquea estrictamente el terreno en el que viven |
| `can_attack_buildings` | Si atacan y destruyen edificios |
| `has_soul`, `can_receive_traits`, `can_be_cloned` | Qué pueden hacerles los poderes divinos |
| `kingdom_id_wild` / `kingdom_id_civilization` | En qué reino aparecen (salvajes o asentados) |
| `texture_atlas` | `UnitTextureAtlasID.Units`, `Boats`, `Zombies` … de qué atlas provienen los sprites |
| `animation_walk` / `animation_idle` / `animation_swim` | Secuencias de fotogramas, cada una con su campo `_speed` |
| `sound_idle`, `sound_spawn`, `sound_death`, `sound_attack`, `sound_hit` | Rutas de eventos de sonido FMOD |
| `name_taxonomic_*` | Reino, filo, clase, orden, familia, género y especie para la ventana de conocimiento |
| `collective_term` | Término colectivo ("una **manada** de lobos") |
| `allowed_status_tiers` | Qué niveles de efectos de estado pueden aplicárseles |
| `production` | Qué fabrican sus ciudades |
| `zombie_id_internal`, `skeleton_id`, `mush_id`, `tumor_id` | En qué se transforman al morir |

## Integrar una criatura de civilización en el mundo

Un actor `civ` no está terminado solo con definir sus estadísticas. Estas son las piezas que el juego base rellena para cada criatura jugable, y omitirlas es la razón por la que una civilización personalizada "no hace nada":

```csharp
asset.kingdom_id_wild = "nomads_human";          // antes de asentarse
asset.kingdom_id_civilization = "human";         // su tipo de reino
asset.banner_id = "human";                       // generador de estandartes
asset.architecture_id = "human";                 // aspecto de sus edificios
asset.build_order_template_id = "build_order_advanced";
asset.name_template_sets = new string[] { "human_default_set" };   // cómo se generan los nombres
asset.civ_base_cities = 3;
asset.family_limit = 20;

asset.addPreferredColors("teal", "lime");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// Genoma: distribución de atributos heredables para reproducción y mutación.
asset.addGenome(
    ("health", 70f), ("stamina", 200f), ("lifespan", 500f),
    ("damage", 10f), ("speed", 20f), ("offspring", 2f),
    ("intelligence", 6f), ("diplomacy", 5f), ("warfare", 2f), ("stewardship", 2f));

// Rasgos iniciales por sistema de rasgos.
asset.addCultureTrait("bow_lovers");
asset.addReligionTrait("rite_of_change");
asset.addSubspeciesTrait("long_lifespan");
asset.addClanTrait("blood_pact");
asset.addLanguageTrait("melodic");
asset.addKingdomTrait("tax_rate_local_low");
```

Reutiliza un `banner_id` y `architecture_id` del juego base hasta que tengas arte propio. Una criatura sin arquitectura no construye nada.

## Generar uno

```csharp
Actor actor = World.world.units.spawnNewUnit("hello_sprite", tile, pSpawnSound: true, pAdultAge: true);
```

`spawnNewUnit` es público y admite argumentos opcionales para el sonido de aparición, milagro, altura de generación, una subespecie concreta y si la unidad recibe objetos iniciales.

Crea un botón de poder divino para invocarla y ya tendrás un generador funcional. Consulta **[Pestañas y botones de poder](#/nml/power-buttons)**.

## Subespecies

Las subespecies son las variantes en las que un actor deriva a lo largo de las generaciones. Tienen su propia librería de rasgos, separada de los rasgos de actor, y su propia lista de grupos:

```csharp
SubspeciesTrait scales = new SubspeciesTrait
{
    id = "hello_scales",
    group_id = "body",
    spawn_random_trait_allowed = true
};
AssetManager.subspecies_traits.add(scales);
scales.base_stats["armor"] = 5;

// hacer que tu actor empiece con él
asset.addSubspeciesTrait("hello_scales");
```

Los rasgos de subespecie también pueden portar **arte visual**: `sprite_path`, `animation_walk`, `skin_citizen_male`, `skin_warrior` y similares, que es como una subespecie luce diferente de su especie progenitora sin constituir un actor independiente. Consulta **[Rasgos de subespecie](#/nml/subspecies-traits)**.

## Tu propio icono

Antes del trabajo de animación que explicamos abajo, la parte sencilla: el icono en las listas y en los botones de invocación.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSprites.png
```

```csharp
sprite.icon = "iconHelloSprites";
```

El arte del **cuerpo** de la criatura es un desafío completamente diferente, y abarca el resto de este apartado.

## Los sprites son la parte difícil

Todo lo anterior es una página de código. El verdadero trabajo es el arte, y aquí es donde la mayoría de los mods de criaturas mueren en silencio: una criatura necesita un conjunto completo de animaciones, en el atlas adecuado, al tamaño correcto y con los pivotes exactos. Hay dos opciones realistas:

1. **Conservar los sprites del donante.** Una criatura que reutiliza las animaciones humanas con diferentes estadísticas y un tinte de color distinto es un primer mod perfectamente válido, y *funciona*.
2. **Exportar con AssetRipper**, localizar el atlas de la criatura clonada y calcar su disposición con exactitud milimétrica antes de dibujar nada. Consulta **[Obtener los recursos del juego](#/toolbox/getting-the-sprites)**.

> [!WARNING] Prueba en un mundo real, no en un mapa en blanco
> Una criatura civilizada que no puede trazar rutas, no puede construir o se ahoga al aparecer se ve perfectamente bien durante los primeros treinta segundos. Genera veinte, deja el mundo corriendo a máxima velocidad durante cinco minutos y lee el log :PES_MonkaSweat:.
