---
title: El mod terminado
group: Contenido del juego
subgroup: Toques finales y logros
icon: :wbpeak:
order: 222
---

# El mod terminado :wbpeak:

Si has seguido las páginas en orden, has estado añadiendo un archivo cada vez al mismo mod desde **[Tu primer mod](#/nml/your-first-mod)**. Esta página es el ensamblaje: cómo queda HelloBox cuando todas las piezas están en su sitio y cómo se comunican entre sí.

## Lo que has construido

Unos veinte archivos, y esto es en lo que se convierten dentro del juego. Cada fila es una página de esta guía  :wbpeak:.

| Qué | Dónde lo ves |
| --- | --- |
| Un rasgo de actor, y una pestaña propia para guardarlo | El inspector de la unidad, lista de rasgos |
| Rasgos de cultura, religión, subespecie, clan, idioma y reino | Sus propias ventanas, una por sistema |
| Un arma, su encantamiento y una categoría para ambos | Las manos de una unidad, las pestañas de equipo |
| Un efecto de estado | Sobre la cabeza de la criatura, con su icono |
| Drops, una nube que los llueve y un proyectil | El mapa, en el aire, en plena pelea |
| Un tile | El terreno, debajo de todo |
| Una receta de comida | Los almacenes de una ciudad |
| Una ley del mundo | La ventana de Leyes del Mundo |
| Un poder divino, su pestaña y su botón | La barra de poderes de abajo |
| Una ventana | Donde tú decidas |
| Un edificio | Una ciudad, en cuanto alguien lo construya |
| Un reino y una criatura que le pertenece | El mapa, apareciendo y peleando |
| Un desastre | El menú de desastres |
| Su propio trabajo de IA | La criatura, caminando a algún sitio a propósito |
| Una decisión, un empleo urbano y una herramienta en mano | Fuego fatuo deambulando con antorchas, un guardián por ciudad |
| Una acción de combate | Unidades veloces lanzando ascuas antes de trabar combate |
| Un gen, una personalidad, un tipo de libro, una pieza de estandarte | El genoma, gobernantes, bibliotecas, banderas |
| Opinión, lealtad y un evento de felicidad | Desglose diplomático y de ciudades |
| Un complot | La lista de complots, cuando un líder organiza un festival de ascuas |
| Una era del mundo y un comportamiento del mundo | La rueda de eras y el temporizador del mundo |
| Un logro | La ventana de logros, al alcanzar diez fuegos fatuos |
| Un pincel, un tooltip y un atajo de teclado | Rotación de pinceles, tooltip al pasar el ratón, F6 |
| Un parche de Harmony | En ninguna parte, y de eso se trata: cambia una regla en silencio |

## Llévatela

<a class="dl" href="hellobox.zip" download>
  <span class="dl-icon">📦</span>
  <span class="dl-text">
    <span class="dl-title">Descargar HelloBox</span>
    <span class="dl-sub">El mod terminado, todos los archivos de esta página. Descomprímelo en <code>worldbox\Mods\</code> y arranca el juego.</span>
  </span>
</a>

Se genera a partir de los bloques de código de esta guía, así que es el mismo código que has estado copiando, no una copia aparte que se desvía con el tiempo. Léelo, rómpelo, borra los dos tercios que no querías.

> [!WARNING] Es una demo, no un producto
> Publicar HelloBox tal cual no ayuda a nadie: son veinte funciones que hacen cada una una cosita mal a propósito. Cambia los ids, cambia el nombre, quédate con las partes que de verdad querías  :wbbru:.

## La carpeta

```text Mods/HelloBox/
HelloBox/
├── mod.json                         the ID card
├── icon.png                         what players see in the mod list
├── default_config.json              the settings window
├── Locales/
│   └── en.json                      every piece of text
├── GameResources/
│   ├── iconHelloCake.png            the food inventory icon
│   ├── actors/species/other/
│   │   ├── hello_wisp/              main/ and child/: walk_0..3, swim_0..3, sprites.json
│   │   └── hello_golem/             the same shape
│   ├── buildings/hello_shrine/      main_0, construction_0, ruin_0, mini_0, sprites.json
│   ├── cultures/
│   │   └── hello_culture_element.png    a culture banner part
│   ├── drops/hello_ember/           hello_ember_0..1, the falling drop
│   ├── effects/
│   │   ├── clouds/hello_cloud.png   the cloud sprite
│   │   ├── fx_hello_status/         fx_hello_status_0..2, the status overhead
│   │   └── projectiles/hello_bolt/  hello_bolt_0..1, the flying ember
│   ├── items/
│   │   ├── resources/hello_cake/    hello_cake_0..1, cake in hand
│   │   ├── tools/tool_hello_torch/  tool_hello_torch_0, the torch in hand
│   │   └── weapons/
│   │       ├── sprites.json         pivot for held weapons
│   │       ├── w_hello_sword.png    weapon sprite
│   │       └── w_hello_sword/       the in-hand sprite list, with its own sprites.json
│   ├── tiles/hello_moss/            moss_1, a tile variation
│   └── ui/Icons/
│       ├── sprites.json             default icon slicing
│       ├── iconHello*.png           traits, powers, tabs, the age, the gene, the grudge...
│       ├── items/icon_hello_sword.png       weapon inventory icon
│       └── worldrules/icon_hello_law.png    world law switch
└── Code/
    ├── Main.cs                      the door NML knocks on
    ├── HelloSettings.cs             what the settings window writes to
    ├── HelloGroups.cs               your own trait tab and item category
    ├── HelloTraits.cs               an actor trait
    ├── HelloMemory.cs               a trait that remembers, in the save file
    ├── HelloCulture.cs              a culture trait
    ├── HelloReligion.cs             a religion trait
    ├── HelloSubspecies.cs           a subspecies trait
    ├── HelloClan.cs                 a clan trait
    ├── HelloLanguage.cs             a language trait
    ├── HelloGenes.cs                a gene
    ├── HelloKingdomTraits.cs        a kingdom trait
    ├── HelloItems.cs                a weapon cities actually forge
    ├── HelloModifiers.cs            an enchantment
    ├── HelloStatus.cs               a status effect
    ├── HelloDrops.cs                falling embers
    ├── HelloClouds.cs               an ember cloud
    ├── HelloTiles.cs                a top tile
    ├── HelloResources.cs            a food recipe
    ├── HelloProjectiles.cs          a flying ember
    ├── HelloLaws.cs                 a world law switch
    ├── HelloBuildings.cs            a building
    ├── HelloKingdoms.cs             their faction
    ├── HelloActors.cs               your creatures
    ├── HelloAI.cs                   its own behaviour
    ├── HelloDecisions.cs            the wisps choosing it on their own
    ├── HelloCityJobs.cs             a job cities hand out
    ├── HelloTools.cs                a torch in hand
    ├── HelloCombat.cs               a combat move
    ├── HelloPolitics.cs             opinion, loyalty, a happiness event
    ├── HelloPlots.cs                a festival leaders can plot
    ├── HelloAges.cs                 a world age and a world behaviour
    ├── HelloAchievements.cs         an achievement
    ├── HelloPersonality.cs          a ruler personality
    ├── HelloBooks.cs                a kind of book
    ├── HelloBanners.cs              a culture banner part
    ├── HelloBrushes.cs              a brush shape
    ├── HelloTooltips.cs             the panel's tooltip
    ├── HelloHotkeys.cs              F6 opens the panel
    ├── HelloDisasters.cs            an ember storm, with its log line
    ├── HelloPowers.cs               a god power + its tab and buttons
    ├── HelloWindow.cs               a panel
    └── HelloPatches.cs              your Harmony patches
```

## Main.cs, al completo

```csharp Mods/HelloBox/Code/Main.cs
using System;
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>, IReloadable
    {
        // Development only: turns on NML's reload button. Never ship it on. See Logs & debugging.
        private static bool DevReload = false;

        protected override void OnModLoad()
        {
            if (DevReload) Config.isEditor = true;

            // Order matters: things that are referenced must exist first.
            Stage("groups", HelloGroups.Initialize);        // tabs before the things that sit in them
            Stage("traits", HelloTraits.Initialize);
            Stage("memory", HelloMemory.Initialize);
            Stage("culture", HelloCulture.Initialize);
            Stage("religion", HelloReligion.Initialize);
            Stage("subspecies", HelloSubspecies.Initialize);
            Stage("clan", HelloClan.Initialize);
            Stage("language", HelloLanguage.Initialize);
            Stage("genes", HelloGenes.Initialize);
            Stage("status", HelloStatus.Initialize);
            Stage("drops", HelloDrops.Initialize);          // clouds rain drops, so drops go first
            Stage("clouds", HelloClouds.Initialize);
            Stage("tiles", HelloTiles.Initialize);
            Stage("biomes", HelloBiomes.Initialize);       // after the tiles, before anything spawns in it
            Stage("resources", HelloResources.Initialize);  // items and buildings cost resources
            Stage("projectiles", HelloProjectiles.Initialize);
            Stage("modifiers", HelloModifiers.Initialize);
            Stage("items", HelloItems.Initialize);          // items can roll the modifiers above
            Stage("buildings", HelloBuildings.Initialize);
            Stage("kingdoms", HelloKingdoms.Initialize);    // actors point at kingdoms
            Stage("kingdom_traits", HelloKingdomTraits.Initialize);
            Stage("names", HelloNames.Initialize);         // before the actors, so they can use its name set
            Stage("actors", HelloActors.Initialize);
            Stage("laws", HelloLaws.Initialize);
            Stage("ai", HelloAI.Initialize);
            Stage("decisions", HelloDecisions.Initialize);  // after the actors and the task they use
            Stage("city_jobs", HelloCityJobs.Initialize);
            Stage("tools", HelloTools.Initialize);
            Stage("combat", HelloCombat.Initialize);        // after the trait that carries it
            Stage("politics", HelloPolitics.Initialize);
            Stage("wars", HelloWars.Initialize);
            Stage("plots", HelloPlots.Initialize);
            Stage("ages", HelloAges.Initialize);            // after the cloud, the law and the status it uses
            Stage("achievements", HelloAchievements.Initialize);
            Stage("personality", HelloPersonality.Initialize);
            Stage("books", HelloBooks.Initialize);
            Stage("banners", HelloBanners.Initialize);
            Stage("brushes", HelloBrushes.Initialize);
            Stage("tooltips", HelloTooltips.Initialize);
            Stage("hotkeys", HelloHotkeys.Initialize);
            Stage("disasters", HelloDisasters.Initialize);
            Stage("powers", HelloPowers.Initialize);        // last: the buttons need the powers

            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
            LogInfo("HelloBox ready");
        }

        private static void Stage(string pName, Action pAction)
        {
            try { pAction(); }
            catch (Exception e) { LogError($"stage '{pName}' failed: {e}"); }
        }

        // NML calls this after it recompiled your code, when you press the reload button
        public void Reload()
        {
            LogInfo("HelloBox reloaded");
        }

        public void Update()
        {
            if (!Config.game_loaded) return;
            if (World.world == null || World.world.units == null || MapBox.instance == null) return;

            // the power tab can only be laid out once its own Start() has run
            HelloPowers.LayoutWhenReady();
        }
    }
}
```

### Por qué ese orden

Tres archivos de esa carpeta nunca aparecen en la lista anterior, y eso es completamente correcto:

| Archivo | Quién lo llama |
| --- | --- |
| `HelloPatches.cs` | `PatchAll()` lo encuentra por sus atributos. Nunca llamas a un parche directamente |
| `HelloSettings.cs` | El cargador de configuración escribe en él cuando el jugador mueve un control |
| `HelloWindow.cs` | Su propio botón lo construye la primera vez que alguien lo abre |

Tus textos tampoco necesitan una etapa: NML carga `Locales/en.json` antes de llamar a `OnModLoad`, por lo que cada clave ya está disponible. Todo lo demás son dependencias directas, y el orden no es un capricho:

1. **Grupos antes de lo que va dentro**, porque un asset cuyo `group_id` no apunta a nada no tiene pestaña en la que mostrarse.
2. **Gotas antes que nubes**, porque una nube nombra la gota que hace llover.
3. **Recursos antes que objetos y edificios**, porque ambos consumen recursos.
4. **Modificadores antes que objetos**, porque un arma lista los modificadores que puede obtener.
5. **Reinos antes que actores**, porque un actor define sus reinos salvajes y civilizados.
6. **Poderes antes que sus botones**: `PowerButtonCreator` busca el poder por id, y un botón atado a un poder inexistente es un botón inservible.
7. **Todo lo que use la IA antes que la IA**, dado que una tarea hace referencia a rasgos y estados por id.
8. **Actores y la IA antes de decisiones, empleos urbanos y herramientas**, porque estos apuntan a una criatura y una tarea que ya deben existir.
9. **La era del mundo tras la nube, la ley y el estado** que usan sus efectos. Los complots, la política y los logros solo consultan datos mientras el juego se ejecuta, por lo que pueden ir en cualquier lugar tras sus propias dependencias.

Cuando algo no aparece en el juego, preguntarse "¿lo registré después de lo que lo necesitaba?" es la segunda cuestión obligada, justo después de "¿aparece en el log?" :PES2_HmmmmNoted:.

## La lista de comprobación antes de darlo por terminado

| | |
| --- | --- |
| Log | Arranca el juego, busca `HelloBox`. Quieres ver "ready" y **ninguna** `Exception` |
| Textos | Nada en el juego debe mostrar claves crudas como `trait_hello_x` |
| Iconos | Ningún hueco invisible en la barra de poderes |
| Ajustes | Borra `mods_config/<GUID>.config`, reinicia y confirma que los valores por defecto sean coherentes |
| Mundo limpio | Carga un mapa nuevo, déjalo correr a máxima velocidad cinco minutos y relee el log |
| Otros mods | Activa un par de ellos. Si parcheas algo, seguro que alguien más también lo está parcheando |

Luego ve a **[Publicar tu mod](#/nml/publishing)** y deja que los demás se encarguen de romperlo :aPES3_VictoryPog:.

## Hacia dónde ir ahora

- Elimina las partes de HelloBox que no vayas a usar. Era una demo, no un mod real.
- Elige **una** sola área y perfecciónala. Un mod que hace una cosa excelentemente supera a uno que hace doce cosas a medias.
- Lee el código vainilla de lo que hayas elegido (**[Leer el código del juego](#/toolbox/reading-the-game-code)**). Todo lo que aún no sabes ya está escrito allí :PESgn_ReadRules:.
