---
title: Référence des statistiques
group: Contenu du jeu
subgroup: Architecture et statistiques
icon: :wbstonks:
order: 92
---

# Référence des statistiques :wbstonks:

Presque tous les assets que vous enregistrerez possèdent un bloc `base_stats`, et presque chaque page après celle-ci y configure quelque chose. Voici la liste de tout ce que vous avez le droit d'y mettre.

## Comment fonctionne base_stats

`base_stats` est un dictionnaire associant des clés `string` à des valeurs `float`. La clé doit obligatoirement être l'un des identifiants listés ci-dessous. Écrire une clé inconnue n'est **pas** anodin : le setter cherche l'identifiant dans la `base_stats_library`, récupère `null` et lève immédiatement une `NullReferenceException` en plein milieu de votre `Initialize()`.

Une faute de frappe sur une stat ne se contente donc pas d'être ignorée en silence. Elle fait planter toute votre phase d'initialisation, et rien de ce qui suit cette ligne ne s'exécutera. Stockez vos noms de statistiques dans des champs `const string` si vous les utilisez à plusieurs endroits.

```csharp
trait.base_stats["damage"] = 15;
trait.base_stats["multiplier_health"] = 0.25f;   // +25%, pas x0.25
```

## D'où viennent les chiffres d'une unité

`Actor.updateStats()` réinitialise le bloc de stats de l'unité et le reconstruit intégralement, dans cet ordre précis :

| # | Source | Note |
| --- | --- | --- |
| 1 | **Sous-espèce**, plus son bloc masculin ou féminin | Si l'unité en possède une |
| 1b | **Actor asset** | Uniquement s'il n'y a **pas** de sous-espèce. La sous-espèce la *remplace*, elle ne s'ajoute pas par-dessus |
| 2 | **Clan**, plus son bloc masculin ou féminin | |
| 3 | **Langue** | |
| 4 | **Culture** | |
| 5 | Attributs de dirigeant issus des données propres de l'unité | `diplomacy`, `stewardship`, `intelligence`, `warfare` |
| 6 | Chaque **effet de statut** actif | |
| 7 | L'objet d'**attaque par défaut** | Uniquement si l'unité est désarmée |
| 8 | Chaque **trait d'acteur** | Les traits liés à une ère sont ignorés si cette ère n'est pas active |
| 9 | Sa **personnalité** | |
| 10 | Chaque **objet équipé**, avec ses modificateurs | |

Deux erreurs classiques ici :

- **Une sous-espèce remplace les statistiques de l'actor asset.** Mettez un bonus sur `human` et une unité dotée d'une sous-espèce ne le verra jamais.
- **La religion ne figure pas sur cette liste.** Les `base_stats` d'un trait de religion n'atteignent jamais une unité. Voir **[Traits de religion](#/nml/religion-traits)**.

Deux conséquences supplémentaires :

- Une stat brute comme `damage` est un **bonus**, pas une valeur finale. `damage = 15` sur un trait signifie "+15 par-dessus tout le reste".
- Une stat `multiplier_*` est une **fraction ajoutée à 1.0**. `multiplier_health = 0.5` équivaut à +50%. `multiplier_health = -0.5` divise la vie par deux.

> [!WARNING] `base_stats` n'existe pas tant que l'asset n'est pas enregistré
> Sur un asset construit manuellement, le bloc de stats est alloué au sein de `add()`. Modifiez `base_stats` avant cette ligne et vous obtiendrez le plantage le plus récurrent du modding WorldBox : une `NullReferenceException`. `clone()` appelle `add()` pour vous, donc après un clone vous êtes déjà en sécurité.

## Combat

| Statistique | Ce qu'elle fait |
| --- | --- |
| `damage` | Dégâts bruts par coup |
| `damage_range` | Variation aléatoire ajoutée aux dégâts |
| `attack_speed` | Vitesse d'enchaînement des attaques |
| `accuracy` | Précision du coup |
| `critical_chance` | Chance de coup critique |
| `critical_damage_multiplier` | Multiplicateur de dégâts critiques |
| `armor` | Réduction brute des dégâts subis |
| `range` | Portée d'attaque |
| `throwing_range` | Portée des armes de jet |
| `targets` | Nombre de cibles touchées par une attaque |
| `projectiles` | Nombre de projectiles tirés simultanément |
| `knockback` | Recul infligé à la cible |
| `recoil` | Recul subi par l'attaquant |
| `skill_combat` | Compétence martiale |
| `skill_spell` | Compétence d'incantation |
| `status_chance` | Chance d'appliquer un statut associé |
| `area_of_effect` | Rayon de zone d'effet |

## Body

| Statistique | Ce qu'elle fait |
| --- | --- |
| `health` | Vie maximale |
| `stamina` | Endurance maximale |
| `mana` | Mana maximal |
| `speed` | Vitesse de déplacement |
| `mass`, `mass_2` | Masse physique pour le recul et la physique |
| `size` | Taille de la hitbox |
| `scale` | Échelle visuelle affichée |
| `max_nutrition` | Capacité stomacale de l'unité |
| `metabolic_rate` | Vitesse de consommation de la nourriture |
| `construction_speed` | Vitesse de construction |
| `experience` | Gain d'expérience |

## Cycle de vie

| Statistique | Ce qu'elle fait |
| --- | --- |
| `lifespan` | Espérance de vie |
| `maturation` | Vitesse de croissance |
| `age_adult` | Âge adulte |
| `age_breeding` | Âge de reproduction |
| `birth_rate` | Fréquence des naissances |
| `offspring` | Nombre d'enfants par portée |
| `multiplier_offspring` | Modification en pourcentage de ce nombre |
| `mutation` | Chance de mutation de sous-espèce |
| `happiness` | Humeur de base |

## Civilisation uniquement

Celles-ci n'ont aucun effet sur un animal. Le jeu les marque `used_only_for_civs`.

| Statistique | Ce qu'elle fait |
| --- | --- |
| `diplomacy` | Attribut de chef : négociation |
| `warfare` | Attribut de chef : guerre |
| `stewardship` | Attribut de chef : gestion |
| `intelligence` | Attribut de chef : savoir |
| `army` | Contribution à la taille de l'armée |
| `cities` | Nombre de villes visé par le royaume |
| `bonus_towers` | Tours supplémentaires constructibles par la ville |
| `limit_population` | Plafond démographique |
| `limit_clan_members` | Taille maximale du clan |
| `loyalty_traits` | Loyauté issue des traits |
| `loyalty_mood` | Loyauté issue du moral |
| `opinion` | Opinion de base envers autrui |
| `multiplier_diplomacy` | Pourcentage de modification diplomatique |
| `multiplier_supply_timer` | Durée de conservation des vivres de l'armée |
| `personality_aggression` | Poids d'agressivité de l'IA |
| `personality_administration` | Poids d'administration de l'IA |
| `personality_diplomatic` | Poids de diplomatie de l'IA |
| `personality_rationality` | Poids de rationalité de l'IA |

## Multipliers

Toutes ces valeurs sont des fractions ajoutées à 1.0, ainsi `0.25` signifie +25%.

`multiplier_health` · `multiplier_lifespan` · `multiplier_stamina` · `multiplier_mana` · `multiplier_damage` · `multiplier_crit` · `multiplier_speed` · `multiplier_attack_speed` · `multiplier_mass` · `multiplier_offspring` · `multiplier_diplomacy` · `multiplier_supply_timer`

## base_stats vs base_stats_meta

Chaque trait transporte **deux** blocs de stats, et se tromper de bloc est le bug d'équilibrage le plus fréquent des mods de méta-traits :

| Bloc | Où il aboutit |
| --- | --- |
| `base_stats` | Fusionné dans le porteur, et de là dans **chaque créature** qui en fait partie |
| `base_stats_meta` | Reste sur l'entité globale. Lu par la culture, le clan ou la sous-espèce, jamais par une unité |

```csharp
trait.base_stats["damage"] = 5;             // chaque membre de cette culture frappe plus fort. Même les fermiers
trait.base_stats_meta["construction_speed"] = 10;   // le groupe bâtit plus vite. Les dégâts individuels ne bougent pas
```

Si un bonus ne doit toucher que certains individus (les soldats, les adultes), aucun des deux blocs ne permet de l'exprimer. Utilisez un Postfix Harmony sur `Actor.updateStats` pour filtrer vous-même. Voir **[Patchs Harmony](#/nml/harmony-patches)**.

## Tags : les stats qui ne sont pas des nombres

Un bloc `base_stats` gère également un ensemble de **tags**, qui sont des drapeaux booléens plutôt que des nombres. Ils se fusionnent de la même façon, de sorte qu'un trait peut accorder une immunité au feu tout comme il accorde des dégâts :

```csharp
trait.base_stats.addTag("immunity_fire");
trait.base_stats.addTag("fast_swimming");

if (actor.stats.hasTag("immunity_fire")) { }
```

Ceux reconnus par le jeu de base :

| Groupe | Tags |
| --- | --- |
| Immunité | `immunity_fire` · `immunity_cold` · `building_immunity_fire` · `damaged_by_water` |
| Déplacement | `fast_swimming` · `water_creature` · `immovable` · `walk_adaptation_sand` · `walk_adaptation_snow` · `walk_adaptation_swamp` |
| Esprit | `strong_mind` · `has_sapience` · `has_emotions` · `has_advanced_memory` · `has_advanced_communication` · `can_read_any_book` · `mad` · `moody` · `unconscious` · `frozen_ai` |
| Comportement | `ignore_fights` · `love_peace` · `steal_items` · `needs_food` · `needs_mate` · `always_idle_animation` · `stop_idle_animation` · `generate_light` |
| Régime | `diet_meat` · `diet_meat_insect` · `diet_fish` · `diet_blood` · `diet_grass` · `diet_crops` · `diet_fruits` · `diet_flowers` · `diet_nectar` · `diet_algae` · `diet_vegetation` · `diet_wood` · `diet_minerals` · `diet_tiles` · `diet_same_species` |
| Reproduction | `reproduction_sexual` · `reproduction_asexual` · `oviparity` · `viviparity` |
| Nature | `civ` · `human` · `elf` · `orc` · `dwarf` · `demon` · `undead` · `magic` · `good` · `evil` · `neutral` · `nature_creature` · `neutral_animals` · `everyone` · `small` · `sliceable` |
| Bâtiment | `can_build_in_biome_corruption` · `can_build_in_biome_desert` · `can_build_in_biome_infernal` · `can_build_in_biome_permafrost` · `can_build_in_biome_swamp` · `can_build_in_biome_wasteland` |

Contrairement aux statistiques, un tag inconnu est inoffensif : il ne correspondra simplement à rien. Cela signifie aussi qu'une faute de frappe passera totalement inaperçue, alors copiez-les scrupuleusement.

## Lire les valeurs en direct d'une unité

`base_stats` est la *recette*. `stats` sur un `Actor` vivant est le *résultat*, une fois toutes les sources additionnées :

```csharp
float finalDamage = actor.stats["damage"];
```

C'est aussi cette valeur que vous modifiez depuis un Postfix Harmony sur `Actor.updateStats` (voir **[Patchs Harmony](#/nml/harmony-patches)**).

## Ajouter ta propre stat

Vous pouvez déclarer un nouveau `BaseStatAsset` dans `AssetManager.base_stats_library`. Il apparaîtra dans l'inspecteur et sera calculé comme les autres. Ce qu'il **ne fera pas**, en revanche, c'est avoir le moindre effet automatique : le jeu ne lit aucune stat qu'il ne connaît pas. Une statistique personnalisée n'est utile que si vous la lisez vous-même dans vos propres patchs ou comportements.

La plupart du temps, la réponse est "utilisez une stat existante", et la seconde est "gérez votre propre dictionnaire".
