---
title: Traits de sous-espèce
group: Contenu du jeu
subgroup: Traits et génétique
icon: :wbelf:
order: 104
---

# Traits de sous-espèce :wbelf:

Une **sous-espèce** est une branche d'une espèce qui a divergé génétiquement : espérance de vie accrue, écailles, ponte d'œufs ou bioluminescence. Elle se propage par la **reproduction** et non par l'apprentissage, et constitue l'unique système de traits transportant ses propres sprites. C'est pourquoi une sous-espèce peut arborer une apparence radicalement différente de son espèce d'origine sans constituer un actor distinct.

| | |
| --- | --- |
| Bibliothèque | `AssetManager.subspecies_traits` |
| Classe | `SubspeciesTrait` |
| Groupes | `AssetManager.subspecies_trait_groups`, classe `SubspeciesTraitGroupAsset` |
| Propriétaire à l'exécution | `Subspecies`, dans `World.world.subspecies` |
| Préfixe de localisation | `subspecies_trait_` |
| Dossier d'icônes par défaut | `ui/Icons/subspecies_traits/` |

> [!WARNING] Une sous-espèce **remplace** les stats de l'asset d'actor
> Dans `Actor.updateStats()`, une unité rattachée à une sous-espèce fusionne `subspecies.base_stats` et *ignore* intégralement `asset.base_stats`. C'est une substitution pure, pas un empilement cumulatif.
>
> Par conséquent, toute valeur définie sur `human` sera invisible pour n'importe quel humain porteur d'une sous-espèce, ce qui correspond à l'immense majorité dans un monde ayant tourné un certain temps :PES4_IDunnoMan:.

Une sous-espèce applique bien des blocs de stats distincts pour les mâles et les femelles, mais ceux-ci ne proviennent **pas** de ses traits. Ils proviennent de son génome dans `AssetManager.gene_library`. Un trait de sous-espèce dispose d'un `base_stats` unique pour tous. Si vous souhaitez une différenciation sexuelle issue d'un trait, il vous faut un trait de clan, voir **[Traits de clan](#/nml/clan-traits)**.

## En enregistrer un

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
                in_mutation_pot_add = true,       // la mutation peut l'octroyer
                in_mutation_pot_remove = false,   // la mutation ne peut pas le retirer
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

C'est ainsi qu'un trait de sous-espèce fait son entrée dans le monde sans que vous n'ayez à le distribuer manuellement, et c'est la manière amusante. La bibliothèque maintient deux réserves, et ces deux champs déterminent les réserves que votre trait intègre :

| Champ | Rôle |
| --- | --- |
| `in_mutation_pot_add` | Un événement de mutation peut conférer ce trait |
| `in_mutation_pot_remove` | Un événement de mutation peut le supprimer |
| `spawn_random_trait_allowed` | S'il peut être tiré aléatoirement |
| `rarity` | Probabilité qu'il soit sélectionné |

La statistique `mutation` d'une unité régit la chance que de tels événements surviennent. Voir **[Référence des stats](#/nml/stats)**.

> [!WARNING] La réserve n'est lue qu'une fois, au démarrage
> Mettre `spawn_random_trait_allowed = true` ne suffit pas à lui seul. `BaseTraitLibrary.linkAssets()` construit la vraie réserve, `_pot_allowed_to_be_given_randomly`, pendant le chargement du jeu, avant que votre mod n'existe. Un trait enregistré après n'y est jamais, et aucune mutation ne le tire jamais. Ajoutez-le vous-même, pondéré comme le fait le vanilla :
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.subspecies_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` est `protected`, donc ceci compile contre l'assembly publicisé avec lequel NML compile déjà votre mod. `spawn_random_rate` vaut `5` par défaut : augmentez-le et le trait apparaît plus souvent.

## Graphismes : ce qu'aucun autre système de traits ne possède

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

// La bibliothèque construit ceci pour ses propres skins dans une méthode privée.
// Un mod effectue la même opération manuellement :
trait.texture_asset = new ActorTextureSubAsset(trait.sprite_path + "/", pHasAdvancedTextures: true);
trait.texture_asset.prevent_unconscious_rotation = trait.prevent_unconscious_rotation;
trait.texture_asset.render_heads_for_children = trait.render_heads_for_children;
trait.texture_asset.shadow = trait.shadow;
```

| Champ | Rôle |
| --- | --- |
| `is_mutation_skin` | Marque le trait comme un remplacement d'apparence et non un simple trait |
| `sprite_path` | Dossier de ses textures. Notez le slash `/` final requis par le texture asset |
| `texture_asset` | L'ensemble texturé compilé. À assigner soi-même comme ci-dessus |
| `skin_citizen_male` / `_female` / `skin_warrior` | Variantes d'apparence par rôle, choisies aléatoirement par individu |
| `animation_walk` / `animation_idle` / `animation_swim` | Remplace les animations de l'espèce parente |
| `shadow`, `shadow_texture`, `shadow_texture_egg`, `shadow_texture_baby` | Ombres selon le stade de développement |
| `render_heads_for_children` | Si une tête distincte est affichée pour les enfants |
| `prevent_unconscious_rotation` | Conserver la posture droite en cas d'évanouissement (orbes et masses gélatineuses) |
| `remove_for_zombies` | Retirer l'apparence lorsque l'unité devient un zombie |
| `priority` | Quelle apparence l'emporte si une unité en cumule deux |

Les mutations d'apparence vanilla (burger, roche vivante, horreur tentaculaire, orbe de lumière, fractale) sont des clones de `$skin_mutation$`, et cloner ce modèle constitue de loin la méthode la plus rapide pour obtenir une apparence fonctionnelle. Oui, burger est une vraie mutation. Les voies de Maxim sont impénétrables :wbpray:.

## Phénotypes, régime alimentaire et œufs

Trois systèmes complémentaires auxquels se rattachent les traits de sous-espèce :

| Champ | Rôle |
| --- | --- |
| `phenotype_skin`, `id_phenotype` | Associe le trait à un phénotype dans `AssetManager.phenotype_library` |
| `is_diet_related` | L'associe au système de régime. À coupler avec une balise `diet_*` |
| `id_egg`, `phenotype_egg` | Modèle de l'œuf pour les sous-espèces ovipares |
| `after_hatch_from_egg_action`, `has_after_hatch_from_egg_action` | Code déclenché lors de l'éclosion |

## Gènes

Un gène est la façon dont un trait de sous-espèce mute en un autre trait. Le jeu parcourt `AssetManager.genes` pendant la reproduction pour décider de ce qui est transmis : Des devoirs de biologie, en gros.

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

Deux champs :

- `gene.id_trait` le lie au trait de sous-espèce que vous avez enregistré.
- `gene.rate` est la chance de mutation, de 0.0 à 1.0.

Sans l'appel à `_gene_assets_mutations.Add(gene)`, le gène est enregistré mais n'entre jamais dans le tirage de mutation.

## Balises meta

Plusieurs traits de sous-espèce de vanilla ne comportent rien d'autre qu'une balise meta, car c'est sur cette balise que le moteur du jeu opère ses embranchements :

```csharp
trait.base_stats_meta.addTag("can_build_in_biome_permafrost");   // la sous-espèce peut coloniser ce biome
trait.base_stats.addTag("walk_adaptation_snow");                 // ses unités progressent aisément sur la neige
```

`base_stats_meta` reste attaché à la sous-espèce. `base_stats` s'applique à ses unités. La liste complète des balises figure dans la **[Référence des stats](#/nml/stats)**.

## Les groupes vanilla

`harmony` · `advanced_brain` · `mind` · `body` · `diet` · `rebirth` · `growth` · `bioproducts` · `chaos` · `talents` · `sleep_cycles` · `hibernation` · `reproduction_strategy` · `reproductive_methods` · `gestation` · `eggs` · `mutations` · `adaptations` · `fate` · `phenotypes` · `special`

Pour créer votre propre onglet : voir **[Groupes de traits & onglets](#/nml/trait-groups)**, avec `AssetManager.subspecies_trait_groups` et `SubspeciesTraitGroupAsset`.

## Les textes

```json Mods/HelloBox/Locales/en.json
{
  "subspecies_trait_hello_scales": "Scaled",
  "subspecies_trait_hello_scales_info": "Thick, overlapping, and quietly smug about it."
}
```

## Distribuer le trait

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
if (asset != null) asset.addSubspeciesTrait(HelloSubspecies.SCALES);
```

Cela permet à chaque nouvelle sous-espèce de cette créature de naître avec le trait. Si vous omettez cette ligne et vous en remettez à `in_mutation_pot_add`, il se manifestera de lui-même avec le temps, ce qui est généralement bien plus captivant.

> [!TIP] Les sorts s'y épanouissent parfaitement
> Les lignées magiques du jeu de base sont des traits de sous-espèce qui accordent un sort et rien d'autre : `trait.addSpell("summon_lightning")`. Une seule ligne de code, transmise aux descendants, et vous donnez naissance à une authentique dynastie d'invocateurs d'éclairs à l'échelle d'un continent entier :PES5_CrazyPog:.
