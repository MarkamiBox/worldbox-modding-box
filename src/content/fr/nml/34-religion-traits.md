---
title: Traits de religion
group: Contenu du jeu
subgroup: Traits et génétique
icon: :wbpray:
order: 108
---

# Traits de religion :wbpray:

Une **religion** appartient à des cités et des royaumes, se diffuse par conversion, rédige des livres et peut accomplir des **rites** : des complots modifiant le monde que ses fidèles tentent d'exécuter de leur propre initiative. Un trait de religion est une croyance unique.

| | |
| --- | --- |
| Bibliothèque | `AssetManager.religion_traits` |
| Classe | `ReligionTrait` |
| Groupes | `AssetManager.religion_trait_groups`, classe `ReligionTraitGroupAsset` |
| Propriétaire à l'exécution | `Religion`, dans `World.world.religions` |
| Préfixe de localisation | `religion_trait_` |
| Dossier d'icônes par défaut | `ui/Icons/religion_traits/` |

> [!WARNING] Les stats de religion n'atteignent pas les unités
> C'est l'unique système de traits dont les `base_stats` n'atterrissent jamais sur un `Actor`. `Actor.updateStats()` fusionne les sous-espèces, clans, langues et cultures. **La religion ne figure pas sur cette liste.**
>
> Un trait de religion modifie donc le monde par ce qu'il *fait* (un rite, une transformation, un crochet d'action), et non par des chiffres. Écrire `base_stats["damage"] = 10` dessus est une opération strictement inutile sans effet, et c'est l'après-midi gâché le plus fréquent sur cette page :PES4_BigSad:.

## En enregistrer un

```csharp Mods/HelloBox/Code/HelloReligion.cs
namespace HelloBox
{
    public static class HelloReligion
    {
        public const string ASHES = "hello_rite_of_ashes";

        public static void Initialize()
        {
            if (AssetManager.religion_traits.has(ASHES)) return;

            ReligionTrait trait = new ReligionTrait
            {
                id = ASHES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "destruction",
                path_icon = "ui/Icons/iconHelloReligion",
                plot_id = "summon_meteor_rain",      // le rite que les fidèles peuvent tenter
                priority = -1,
                spawn_random_trait_allowed = false,
                rarity = Rarity.R2_Epic
            };

            AssetManager.religion_traits.add(trait);
        }
    }
}
```

## Rites : le champ `plot_id`

Un trait de religion muni d'un `plot_id` devient un **rite**. La religion rassemble ses rites dans `possible_rites`, et les dirigeants et prêtres tentent de les accomplir de leur propre chef dès lors que les conditions du complot sont satisfaites.

```csharp
trait.plot_id = "summon_meteor_rain";
```

L'identifiant pointe vers `AssetManager.plots_library`. Les rites du jeu de base réutilisent des complots existants - `summon_earthquake`, `summon_meteor_rain`, `summon_thunderstorm`, `summon_stormfront`, `summon_hellstorm`, `clan_ascension` - et vous pouvez faire de même, ou enregistrer au préalable votre propre `PlotAsset`.

Le complot détermine qui peut le déclencher et sa complexité :

| Champ PlotAsset | Rôle |
| --- | --- |
| `can_be_done_by_king`, `can_be_done_by_leader`, `can_be_done_by_clan_member` | Qui peut l'initier |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | Prérequis d'attributs |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | Prérequis de niveau et renommée |
| `progress_needed`, `money_cost` | Durée et coût financier |
| `pot_rate`, `rarity` | Fréquence de sélection par l'IA |
| `check_is_possible`, `check_should_continue` | Vos conditions personnalisées |

## Transformations : le champ `transformation_biome_id`

L'autre champ exclusif aux traits de religion. Il marque le trait comme une transformation et indique le biome que la foi répand sur le terrain :

```csharp
trait.transformation_biome_id = "biome_desert";
```

Le jeu de base s'en sert pour `sands_of_ruin` (désert), `shadowroot` (corrompu), `echo_of_the_void` (singularité), `infernal_rot` (infernal) et `cosmic_radiation` (terres désolées). Une religion dotée de l'un de ces traits transforme lentement le sol sur lequel vivent ses fidèles, ce qui constitue le plus grand effet visuel qu'un seul trait puisse produire en jeu.

## Faire en sorte qu'il *agisse*

Puisque les statistiques sont hors-jeu, les crochets d'action sont le moyen par excellence pour un trait de religion de faire ses preuves. Ce sont les mêmes que pour tous les autres traits :

```csharp
// toutes les quelques secondes, sur chaque fidèle
trait.special_effect_interval = 5f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreMana(2);
    return true;
};

// lorsqu'un fidèle meurt
trait.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };
```

Un trait de religion peut également accorder un sort ou une décision, ce qui est généralement bien plus adapté qu'un simple minuteur :

```csharp
trait.addSpell("hello_bolt");           // voir Projectiles, sorts et effets
trait.addDecision("burn_tumors");       // une décision d'IA que les fidèles peuvent prendre
```

## Les groupes vanilla

`harmony` · `creation` · `destruction` · `restoration` · `necromancy` · `protection` · `the_void` · `transformation` · `fate` · `special`

Pour concevoir votre propre onglet : voir **[Groupes de traits & onglets](#/nml/trait-groups)**, avec `AssetManager.religion_trait_groups` et `ReligionTraitGroupAsset`.

## Les textes

```json Mods/HelloBox/Locales/en.json
{
  "religion_trait_hello_rite_of_ashes": "Rite of Ashes",
  "religion_trait_hello_rite_of_ashes_info": "Somebody always volunteers."
}
```

## Distribuer le trait

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addReligionTrait(HelloReligion.ASHES);
```

```csharp
foreach (Religion religion in World.world.religions)
{
    if (religion == null || religion.isRekt()) continue;

    religion.addTrait(HelloReligion.ASHES, pRemoveOpposites: true);
}
```

Un objet `Religion` expose également `cities`, `kingdoms`, `books` et `possible_rites`, ce qui constitue généralement ce que vous voudrez inspecter lorsque votre code doit surveiller les agissements d'une foi.

> [!TIP] Tout l'intérêt réside dans les rites
> Une religion qui ne fait que modifier des chiffres est invisible. Une religion dont les prêtres invoquent occasionnellement une tempête de météores est le genre d'événement dont les joueurs partagent des vidéos. Investissez vos efforts dans `plot_id` :aPES_Flames:.
