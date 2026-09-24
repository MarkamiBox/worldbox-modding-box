---
title: Subspecies traits
group: Game Content
subgroup: Traits & Genetics
icon: :wbelf:
order: 104
---

# Subspecies traits :wbelf:

A **subspecies** is a branch of a species that has drifted: longer lived, scaled, egg-laying, glowing. It spreads by **breeding**, not by teaching, and it is the only trait system that carries its own sprites, which is why a subspecies can look different from its parent species without being a separate actor.

| | |
| --- | --- |
| Library | `AssetManager.subspecies_traits` |
| Class | `SubspeciesTrait` |
| Groups | `AssetManager.subspecies_trait_groups`, class `SubspeciesTraitGroupAsset` |
| Owner at runtime | `Subspecies`, in `World.world.subspecies` |
| Locale prefix | `subspecies_trait_` |
| Default icon folder | `ui/Icons/subspecies_traits/` |

> [!WARNING] A subspecies **replaces** the actor asset's stats
> In `Actor.updateStats()`, a unit with a subspecies merges `subspecies.base_stats` and *skips* `asset.base_stats` entirely. It is an either/or, not a stack.
>
> So a number you put on `human` is invisible to any human with a subspecies, which, in a world that has been running for a while, is most of them :PES4_IDunnoMan:.

A subspecies *does* apply a separate male and female stat block on top, but those do **not** come from its traits. They come from its genome, in `AssetManager.gene_library`. A subspecies trait has one `base_stats` for everybody. If you want a sex split from a trait, that is a clan trait, see **[Clan traits](#/nml/clan-traits)**.

## Registering one

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
                in_mutation_pot_add = true,       // mutation can grant it
                in_mutation_pot_remove = false,   // mutation cannot take it away
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

## Mutation

This is how a subspecies trait gets into a world without you handing it out, which is the fun way. The library keeps two pots, and these two fields decide which pots your trait joins:

| Field | What it does |
| --- | --- |
| `in_mutation_pot_add` | A mutation event can grant this trait |
| `in_mutation_pot_remove` | A mutation event can strip it |
| `spawn_random_trait_allowed` | Whether it can be rolled at all |
| `rarity` | How likely it is to be picked |

A unit's `mutation` stat is the chance of any of this happening. See **[Stats reference](#/nml/stats)**.

> [!WARNING] The pot is read once, at startup
> Setting `spawn_random_trait_allowed = true` is not enough on its own. `BaseTraitLibrary.linkAssets()` builds the actual pot, `_pot_allowed_to_be_given_randomly`, while the game loads, before your mod exists. A trait registered afterwards is never in it, and no mutation ever rolls it. Put it in yourself, weighted the way vanilla does it:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.subspecies_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` is `protected`, so this compiles against the publicized assembly NML already builds your mod with. `spawn_random_rate` defaults to `5`: raise it and the trait turns up more often.

## Art: the part no other trait system has

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

// The library builds this for its own skins in a private helper.
// A mod does the same thing by hand:
trait.texture_asset = new ActorTextureSubAsset(trait.sprite_path + "/", pHasAdvancedTextures: true);
trait.texture_asset.prevent_unconscious_rotation = trait.prevent_unconscious_rotation;
trait.texture_asset.render_heads_for_children = trait.render_heads_for_children;
trait.texture_asset.shadow = trait.shadow;
```

| Field | What it does |
| --- | --- |
| `is_mutation_skin` | Marks it as a skin replacement rather than a plain trait |
| `sprite_path` | The folder its textures live in. Note the trailing `/` the texture asset needs |
| `texture_asset` | The built texture set. Set it yourself, as above |
| `skin_citizen_male` / `_female` / `skin_warrior` | Skin variants per role, picked at random per unit |
| `animation_walk` / `animation_idle` / `animation_swim` | Override the parent species' animations |
| `shadow`, `shadow_texture`, `shadow_texture_egg`, `shadow_texture_baby` | Shadows, per life stage |
| `render_heads_for_children` | Whether children get a head drawn |
| `prevent_unconscious_rotation` | Keep it upright when knocked out. For orbs and blobs |
| `remove_for_zombies` | Strip the skin when the unit turns |
| `priority` | Which skin wins when a unit has two |

Vanilla skin mutations (burger, living rock, tentacle horror, light orb, fractal) are all clones of `$skin_mutation$`, and cloning that template is by far the shortest route to a working one. Yes, burger is a real mutation. Maxim works in mysterious ways :wbpray:.

## Phenotypes, diet and eggs

Three smaller systems subspecies traits plug into:

| Field | What it does |
| --- | --- |
| `phenotype_skin`, `id_phenotype` | Ties the trait to a phenotype in `AssetManager.phenotype_library` |
| `is_diet_related` | Marks it as part of the diet system. Pair with a `diet_*` stat tag |
| `id_egg`, `phenotype_egg` | The egg form, for egg-laying subspecies |
| `after_hatch_from_egg_action`, `has_after_hatch_from_egg_action` | Code that runs when one hatches |

## Genes

The male and female stat blocks mentioned at the top come from the subspecies' **genome**: chromosomes with slots, and a gene in each. A gene is a `BaseTrait`, so it registers like every other trait on this site, with two extra chores. Biology homework, basically.

```csharp Mods/HelloBox/Code/HelloGenes.cs
namespace HelloBox
{
    public static class HelloGenes
    {
        public const string EMBER_BLOOD = "hello_ember_blood";

        public static void Initialize()
        {
            if (AssetManager.gene_library.has(EMBER_BLOOD)) return;

            GeneAsset gene = new GeneAsset
            {
                id = EMBER_BLOOD,
                path_icon = "ui/Icons/iconHelloGene",
                needs_to_be_explored = false
            };

            AssetManager.gene_library.add(gene);
            gene.base_stats["damage"] = 2f;

            // Each world rolls every gene's DNA letters from its life seed when it loads.
            // A world may already be open, so roll yours now the same way.
            if (World.world != null && World.world.map_stats != null)
            {
                gene.generateDNA(World.world.map_stats.life_dna + gene.getIndexID());
            }

            // linkAssets() filled the mutation pool at startup. Without this, only the
            // player's gene editor can ever place it.
            AssetManager.gene_library._gene_assets_mutations.Add(gene);
        }
    }
}
```

- **The DNA letters.** Every gene shows a short `ACGT` code, rolled per world from its life seed when the world loads. Your gene was not there for that roll, so it rolls its own the same way.
- **The mutation pool.** Mutations pick from `_gene_assets_mutations`, a private list `linkAssets()` filled at startup. A **publicized** assembly lets you add to it, and NML compiles against one. Skip it, and the gene only appears where the player puts it by hand.

A gene's text key is `gene_<id>`. Genes have no description line: `GeneLibrary.add()` switches it off.

```json Mods/HelloBox/Locales/en.json
{
  "gene_hello_ember_blood": "Ember Blood"
}
```

## Meta tags

Several vanilla subspecies traits carry nothing but a tag, because that tag is what the game branches on:

```csharp
trait.base_stats_meta.addTag("can_build_in_biome_permafrost");   // the subspecies can settle there
trait.base_stats.addTag("walk_adaptation_snow");                 // its units walk well on snow
```

`base_stats_meta` stays on the subspecies. `base_stats` reaches its units. The tag list is on **[Stats reference](#/nml/stats)**.

## The vanilla groups

`harmony` · `advanced_brain` · `mind` · `body` · `diet` · `rebirth` · `growth` · `bioproducts` · `chaos` · `talents` · `sleep_cycles` · `hibernation` · `reproduction_strategy` · `reproductive_methods` · `gestation` · `eggs` · `mutations` · `adaptations` · `fate` · `phenotypes` · `special`

Your own tab: see **[Trait groups & tabs](#/nml/trait-groups)**, with `AssetManager.subspecies_trait_groups` and `SubspeciesTraitGroupAsset`.

## The text

```json Mods/HelloBox/Locales/en.json
{
  "subspecies_trait_hello_scales": "Scaled",
  "subspecies_trait_hello_scales_info": "Thick, overlapping, and quietly smug about it."
}
```

## Handing it out

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
if (asset != null) asset.addSubspeciesTrait(HelloSubspecies.SCALES);
```

That makes every new subspecies of that creature start with it. Leaving it out and relying on `in_mutation_pot_add` instead means it appears on its own, somewhere, eventually, which is usually the more interesting version.

> [!TIP] Spells live well here
> Vanilla's magic bloodlines are subspecies traits that grant a spell and nothing else: `trait.addSpell("summon_lightning")`, then `trait.linkSpells()` because the library resolved spell ids at startup. Two lines, inherited by children, and it produces a visible lineage of storm-callers across a continent :PES5_CrazyPog:.
