---
title: Rasgos de subespecies
group: Contenido del juego
subgroup: Rasgos y genética
icon: :wbelf:
order: 104
---

# Rasgos de subespecies :wbelf:

Una **subespecie** es una rama de una especie que ha divergido genéticamente: más longeva, con escamas, ovípara o bioluminiscente. Se propaga mediante la **reproducción**, no a través de la educación, y es el único sistema de rasgos que cuenta con sus propios sprites; por eso una subespecie puede lucir completamente distinta a su especie matriz sin necesidad de ser un actor independiente.

| | |
| --- | --- |
| Biblioteca | `AssetManager.subspecies_traits` |
| Clase | `SubspeciesTrait` |
| Grupos | `AssetManager.subspecies_trait_groups`, clase `SubspeciesTraitGroupAsset` |
| Propietario en ejecución | `Subspecies`, en `World.world.subspecies` |
| Prefijo de traducción | `subspecies_trait_` |
| Carpeta de iconos por defecto | `ui/Icons/subspecies_traits/` |

> [!WARNING] Una subespecie **reemplaza** las estadísticas del asset del actor
> En `Actor.updateStats()`, una unidad con subespecie fusiona `subspecies.base_stats` y *omite* por completo `asset.base_stats`. Es una disyuntiva excluyente, no una suma acumulativa.
>
> Por tanto, un valor que configures en `human` será invisible para cualquier humano con subespecie, que en un mundo con algo de rodaje serán casi todos :PES4_IDunnoMan:.

Una subespecie sí aplica adicionalmente bloques de estadísticas específicos para machos y hembras, pero estos **no** provienen de sus rasgos. Proceden de su genoma en `AssetManager.gene_library`. Un rasgo de subespecie tiene un único `base_stats` universal. Si buscas una diferenciación por sexos a través de un rasgo, necesitas un rasgo de clan; consulta **[Rasgos de clan](#/nml/clan-traits)**.

## Registrar uno

```csharp Mods/HelloBox/Code/HelloSubspecies.cs
namespace HelloBox
{
    public static class HelloSubspecies
    {
        public const string SCALES = "hello_scales";

        public static void Initialize()
        {
            if (AssetManager.subspecies_traits.has(SCALES)) return;

            SubspeciesTrait trait = new SubspeciesTrait
            {
                id = SCALES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloSubspecies",
                in_mutation_pot_add = true,       // las mutaciones pueden otorgarlo
                in_mutation_pot_remove = false,   // las mutaciones no pueden despojarlo
                spawn_random_trait_allowed = true,
                rarity = Rarity.R1_Rare
            };

            AssetManager.subspecies_traits.add(trait);

            trait.base_stats["armor"] = 5;
            trait.base_stats.addTag("immunity_fire");
        }
    }
}
```

## Mutación

Así es como un rasgo de subespecie aparece en el mundo sin necesidad de asignarlo manualmente, que es la forma divertida. La biblioteca mantiene dos bolsas de probabilidad, y estos dos campos dictan en cuáles participa tu rasgo:

| Campo | Qué hace |
| --- | --- |
| `in_mutation_pot_add` | Un evento de mutación puede otorgar este rasgo |
| `in_mutation_pot_remove` | Un evento de mutación puede eliminarlo |
| `spawn_random_trait_allowed` | Si puede obtenerse en tiradas aleatorias |
| `rarity` | Probabilidad de ser seleccionado |

La estadística `mutation` de la unidad determina la probabilidad de que esto ocurra. Consulta **[Referencia de estadísticas](#/nml/stats)**.

## Arte gráfico: lo que ningún otro sistema de rasgos posee

```csharp
trait.is_mutation_skin = true;
trait.sprite_path = "actors/species/mutations/hello_scales";
trait.animation_walk = ActorAnimationSequences.walk_0_3;
trait.animation_idle = ActorAnimationSequences.walk_0_3;
trait.animation_swim = ActorAnimationSequences.swim_0_3;
trait.skin_citizen_male = new List<string> { "male_1" };
trait.skin_citizen_female = new List<string> { "female_1" };
trait.skin_warrior = new List<string> { "warrior_1" };
trait.render_heads_for_children = true;

// La biblioteca construye esto para sus propias apariencias mediante un método privado.
// Un mod realiza lo mismo manualmente:
trait.texture_asset = new ActorTextureSubAsset(trait.sprite_path + "/", pHasAdvancedTextures: true);
trait.texture_asset.prevent_unconscious_rotation = trait.prevent_unconscious_rotation;
trait.texture_asset.render_heads_for_children = trait.render_heads_for_children;
trait.texture_asset.shadow = trait.shadow;
```

| Campo | Qué hace |
| --- | --- |
| `is_mutation_skin` | Lo cataloga como reemplazo de apariencia en vez de rasgo convencional |
| `sprite_path` | Carpeta de sus texturas. Atención a la barra `/` final que requiere el texture asset |
| `texture_asset` | El conjunto de texturas generado. Configúralo tú mismo como en el ejemplo |
| `skin_citizen_male` / `_female` / `skin_warrior` | Variantes de aspecto por rol, elegidas al azar para cada individuo |
| `animation_walk` / `animation_idle` / `animation_swim` | Sobrescriben las animaciones de la especie base |
| `shadow`, `shadow_texture`, `shadow_texture_egg`, `shadow_texture_baby` | Sombras para cada etapa biológica |
| `render_heads_for_children` | Si los niños renderizan cabeza |
| `prevent_unconscious_rotation` | Mantiene la orientación vertical al quedar inconsciente (para orbes y masas) |
| `remove_for_zombies` | Retira la apariencia si la unidad se convierte en zombi |
| `priority` | Cuál apariencia prevalece si una unidad reúne dos |

Las mutaciones de apariencia de vanilla (hamburguesa, roca viva, horror con tentáculos, orbe de luz, fractal) son clones de `$skin_mutation$`, y clonar esa plantilla es sin duda el camino más veloz para lograr una apariencia operativa. Sí, burger es una mutación real. Los caminos de Maxim son inescrutables :wbpray:.

## Fenotipos, dieta y huevos

Tres subsistemas adicionales a los que se integran los rasgos de subespecie:

| Campo | Qué hace |
| --- | --- |
| `phenotype_skin`, `id_phenotype` | Vincula el rasgo a un fenotipo de `AssetManager.phenotype_library` |
| `is_diet_related` | Lo vincula al sistema dietético. Combínalo con una etiqueta `diet_*` |
| `id_egg`, `phenotype_egg` | Modelo del huevo para subespecies ovíparas |
| `after_hatch_from_egg_action`, `has_after_hatch_from_egg_action` | Código ejecutado al eclosionar del huevo |

## Genes

Un gen es la forma en que un rasgo de subespecie muta en otro rasgo. El juego recorre `AssetManager.genes` durante la reproducción para decidir qué se transmite: Deberes de biología, básicamente.

```csharp Mods/HelloBox/Code/HelloGenes.cs
namespace HelloBox
{
    public static class HelloGenes
    {
        public static void Initialize()
        {
            GeneAsset gene = new GeneAsset
            {
                id = "hello_swift_gene",
                id_trait = HelloSubspecies.SWIFT,
                rate = 0.05f
            };
            AssetManager.genes.add(gene);
            AssetManager.genes._gene_assets_mutations.Add(gene);
        }
    }
}
```

Dos campos:

- `gene.id_trait` lo vincula al rasgo de subespecie que registraste.
- `gene.rate` es la probabilidad de mutación, de 0.0 a 1.0.

Sin la llamada a `_gene_assets_mutations.Add(gene)`, el gen se registra pero nunca entra en la tirada de mutación.

## Etiquetas meta

Varios rasgos de subespecies de vanilla no contienen más que una etiqueta meta, pues es a partir de ella que el juego ramifica su comportamiento:

```csharp
trait.base_stats_meta.addTag("can_build_in_biome_permafrost");   // la subespecie puede poblar ese bioma
trait.base_stats.addTag("walk_adaptation_snow");                 // sus unidades caminan sin penalización sobre nieve
```

`base_stats_meta` pertenece a la subespecie. `base_stats` se transmite a sus unidades. La lista completa de etiquetas figura en **[Referencia de estadísticas](#/nml/stats)**.

## Los grupos de vanilla

`harmony` · `advanced_brain` · `mind` · `body` · `diet` · `rebirth` · `growth` · `bioproducts` · `chaos` · `talents` · `sleep_cycles` · `hibernation` · `reproduction_strategy` · `reproductive_methods` · `gestation` · `eggs` · `mutations` · `adaptations` · `fate` · `phenotypes` · `special`

Tu propia pestaña: consulta **[Grupos de rasgos y pestañas](#/nml/trait-groups)**, con `AssetManager.subspecies_trait_groups` y `SubspeciesTraitGroupAsset`.

## Los textos

```json Mods/HelloBox/Locales/en.json
{
  "subspecies_trait_hello_scales": "Scaled",
  "subspecies_trait_hello_scales_info": "Thick, overlapping, and quietly smug about it."
}
```

## Asignar el rasgo

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
if (asset != null) asset.addSubspeciesTrait(HelloSubspecies.SCALES);
```

Eso hace que cada nueva subespecie surgida de esa criatura nazca con él. Si lo omites y confías en `in_mutation_pot_add`, surgirá por sí solo en algún rincón tarde o temprano, lo que habitualmente resulta mucho más fascinante.

> [!TIP] Los hechizos encajan de maravilla aquí
> Los linajes mágicos de vanilla son rasgos de subespecie que únicamente conceden un hechizo: `trait.addSpell("summon_lightning")`. Una sola línea de código, heredada de padres a hijos, y tienes ante ti una dinastía de invocadores de tormentas cruzando continentes enteros :PES5_CrazyPog:.
