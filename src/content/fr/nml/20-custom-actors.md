---
title: Acteurs personnalisés
group: Contenu du jeu
subgroup: Acteurs, bâtiments et IA
icon: :wbhuman:
order: 140
---

# Acteurs personnalisés :wbhuman:

> [!NOTE] Ils s'appellent des acteurs, pas des races
> Le jeu désigne chaque être vivant sous le terme d'**acteur** (actor) : un humain, un loup, un dragon, un zombie, un crabe. Ils dérivent tous de la même classe, `ActorAsset`, et logent tous dans `AssetManager.actor_library`. "Race" est l'ancien vocable. Le seul endroit où il subsiste est une propriété `race` étiquetée `[Obsolete("use .original_actor_asset instead")]`, présente uniquement pour charger des sauvegardes antédiluviennes. Écrivez `actor` partout.

Créer une nouvelle créature est le mod dont tout le monde rêve et que presque personne ne termine, car un `ActorAsset` transporte avec lui animations, textures, sons, taxonomie, régime alimentaire, drapeaux d'IA, génome, culture et statistiques. En rater un seul vous garantit une unité invisible plantée au milieu de l'océan :PES4_Invisible:.

Bonne nouvelle : le jeu de base ne fabrique pas non plus ses créatures ex nihilo. Voici littéralement la manière dont vanilla conçoit un elfe :

```csharp
clone("elf", "$civ_advanced_unit$");
```

Nous allons donc faire exactement pareil.

## Les modèles

Les identifiants encadrés de `$` sont des **modèles** (templates) : des acteurs à moitié finalisés conservés par le jeu pour servir de base de clonage. Ils constituent le point de départ idéal pour une créature inédite, car ils intègrent toute la mécanique interne sans vous infliger les sprites d'un humain.

| Modèle | Cloner pour |
| --- | --- |
| `$basic_unit$` | Le strict minimum vital |
| `$animal$` | Un animal sauvage |
| `$mob$` | Un monstre hostile |
| `$civ_unit$` | Une créature civilisée de base |
| `$civ_advanced_unit$` | Une créature de civilisation complète : villes, royaumes, culture, religion. Ce que partagent humain, elfe, orque et nain |

Vous pouvez aussi cloner un acteur fini - `human`, `wolf`, `zombie` - ce qui reste le chemin le plus simple pour vos débuts, car les sprites du donneur sont inclus et votre créature devient visible sur-le-champ.

## Un seul acteur

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
> [!WARNING] Charge l'ombre toi-même, sinon le jeu râle sur chaque acteur
> `ActorAssetLibrary` parcourt sa liste au démarrage et appelle `loadShadow()` sur chaque acteur, ce qui charge le sprite dans `shadows/<shadow_texture>` et le mesure. C'est arrivé avant que ton mod n'enregistre quoi que ce soit, donc l'ombre de ton acteur reste à `(0.00, 0.00)` et le jeu logge une erreur d'asset pour elle, trois fois : adulte, œuf et bébé :wbfacepalm:.
>
> `loadShadow()` est `internal`, il faut donc une `Assembly-CSharp.dll` **publicized** comme pour le reste du guide. Si tu n'en as pas, mets plutôt `asset.shadow = false;` : pas d'ombre, mais pas d'erreur non plus.


> [!WARNING] clone() enregistre déjà
> `AssetManager.<library>.clone(newId, sourceId)` appelle `add()` en interne. Chaque bibliothèque procède ainsi. Appeler vous-même `add()` ensuite constitue un enregistrement en double : la bibliothèque éjecte la première copie, consigne une erreur et la réinsère. C'est inoffensif, mais cela pollue vos logs au détriment des vrais problèmes et sautera aux yeux de n'importe quel relecteur.
>
> Le corollaire constitue une excellente nouvelle : **après un clone, `base_stats` existe déjà**, si bien que la règle "les stats après add" expliquée dans **[Traits personnalisés](#/nml/custom-traits)** est d'ores et déjà respectée.

## Plusieurs acteurs à la fois

La plupart des mods n'ajoutent pas une seule créature isolée. Trois esprits signifient trois assets, et dès lors que vous copiez-collez le bloc ci-dessus trois fois, vous vous retrouvez avec trois endroits à maintenir pour chaque correction.

Regroupez les variations dans un tableau et le code dans une boucle :

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

Ajouter une quatrième créature ne demande désormais plus qu'une simple ligne dans le tableau. C'est sous cette forme que se présentent la quasi-totalité des mods de créatures sérieux, et il est vivement conseillé de l'adopter dès la deuxième créature :PESgn_ThisTBH:.

## Les champs qui définissent ce qu'*est* votre créature

Le premier jour, seuls trois comptent : `civ`, `actor_size` et `name_locale`. Le reste peut attendre que votre créature soit visible et marche.

| Champ | Ce qu'il fait |
| --- | --- |
| `civ` | Créature de civilisation : cités, royaumes, métiers, guerre. `false` = animal |
| `auto_civ` | Si le jeu commence à les civiliser de manière autonome |
| `default_animal` | L'identifie comme faune sauvage pour les vérifications internes |
| `unit_other` | Ni civ ni animal : créature hostile, automate, entité spéciale |
| `actor_size` | `S0_Bug` … `S13_Human` … `S17_Dragon`. Pilote le rendu et certains calculs de combat |
| `name_locale` | Clé du nom d'affichage |
| `icon` | Icône utilisée dans les listes et boutons d'apparition |
| `color_hex` | Teinte appliquée aux unités colorables |
| `can_have_subspecies` | Si elles mutent en sous-espèces au fil des générations |
| `has_ai_system` | Si elles exécutent le système de comportement général |
| `flying` / `hovering` | Si elles quittent le sol et à quelle altitude |
| `force_ocean_creature` / `force_land_creature` | Verrouille le type de milieu où elles peuvent vivre |
| `can_attack_buildings` | Si elles attaquent et démolissent les structures |
| `has_soul`, `can_receive_traits`, `can_be_cloned` | Ce que les pouvoirs divins ont le droit de leur faire subir |
| `kingdom_id_wild` / `kingdom_id_civilization` | Dans quel royaume elles apparaissent (sauvages ou établies) |
| `texture_atlas` | `UnitTextureAtlasID.Units`, `Boats`, `Zombies` … atlas d'origine des sprites |
| `animation_walk` / `animation_idle` / `animation_swim` | Séquences de frames, chacune accompagnée d'un champ `_speed` |
| `sound_idle`, `sound_spawn`, `sound_death` … | Chemins d'événements sonores FMOD |
| `name_taxonomic_*` | Règne, embranchement, classe, ordre, famille, genre, espèce pour l'encyclopédie |
| `collective_term` | Nom de groupe ("une **meute** de loups") |
| `allowed_status_tiers` | Niveaux d'effets de statut autorisés à s'appliquer |
| `production` | Ce que produisent leurs cités |
| `zombie_id_internal`, `skeleton_id`, `mush_id` … | Ce en quoi elles se métamorphosent |

## Intégrer une créature de civilisation dans le monde

Un acteur `civ` n'est pas achevé une fois ses statistiques posées. Voici l'ensemble des éléments que vanilla renseigne pour toute race jouable, et les omettre explique pourquoi une civilisation sur mesure "ne fait strictement rien" :

```csharp
asset.kingdom_id_wild = "nomads_human";          // avant leur sédentarisation
asset.kingdom_id_civilization = "human";         // leur type de royaume
asset.banner_id = "human";                       // générateur de bannières
asset.architecture_id = "human";                 // style architectural de leurs cités
asset.build_order_template_id = "build_order_advanced";
asset.name_template_sets = new string[] { "human_default_set" };   // génération des noms
asset.civ_base_cities = 3;
asset.family_limit = 20;

asset.addPreferredColors("teal", "lime");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// Génome : répartition héréditaire des attributs pour la reproduction et les mutations.
asset.addGenome(
    ("health", 70f), ("stamina", 200f), ("lifespan", 500f),
    ("damage", 10f), ("speed", 20f), ("offspring", 2f),
    ("intelligence", 6f), ("diplomacy", 5f), ("warfare", 2f), ("stewardship", 2f));

// Traits initiaux selon chaque système.
asset.addCultureTrait("bow_lovers");
asset.addReligionTrait("rite_of_change");
asset.addSubspeciesTrait("long_lifespan");
asset.addClanTrait("blood_pact");
asset.addLanguageTrait("melodic");
asset.addKingdomTrait("tax_rate_local_low");
```

Réutilisez les `banner_id` et `architecture_id` de vanilla en attendant de concevoir vos propres graphismes. Une créature dépourvue d'architecture ne construira rien du tout.

## En faire apparaître un

```csharp
Actor actor = World.world.units.spawnNewUnit("hello_sprite", tile, pSpawnSound: true, pAdultAge: true);
```

`spawnNewUnit` est une méthode publique acceptant des paramètres facultatifs pour le bruitage, l'apparition miraculeuse, la hauteur, une sous-espèce spécifique et l'attribution ou non d'objets de départ.

Ajoutez un bouton de pouvoir divin pour le joueur et vous obtiendrez un outil de génération complet. Voir **[Onglets et boutons de pouvoir](#/nml/power-buttons)**.

## Sous-espèces

Les sous-espèces constituent les ramifications génétiques vers lesquelles un acteur dérive au fil des générations. Elles possèdent leur propre bibliothèque de traits, distincte des traits d'acteurs, et leur propre classification :

```csharp
SubspeciesTrait scales = new SubspeciesTrait
{
    id = "hello_scales",
    group_id = "body",
    spawn_random_trait_allowed = true
};
AssetManager.subspecies_traits.add(scales);
scales.base_stats["armor"] = 5;

// attribuez-le dès le départ à votre acteur
asset.addSubspeciesTrait("hello_scales");
```

Les traits de sous-espèces peuvent également intégrer des **graphismes** : `sprite_path`, `animation_walk`, `skin_citizen_male`, `skin_warrior` et compagnie, permettant à une sous-espèce de se distinguer visuellement de sa souche parente sans nécessiter un acteur distinct. Voir **[Traits de sous-espèces](#/nml/subspecies-traits)**.

## Votre propre icône

Avant d'aborder les animations ci-dessous, la partie la plus facile : l'icône dans les listes et les boutons de génération.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSprites.png
```

```csharp
sprite.icon = "iconHelloSprites";
```

L'aspect visuel du **corps** de la créature représente un défi d'un tout autre calibre, auquel est consacrée la fin de cette page.

## Les sprites sont la partie difficile

Tout ce qui précède se résume à une page de code. Le véritable labeur réside dans le dessin, et c'est là que la plupart des mods de créatures meurent en silence : une créature exige un cycle d'animation complet, dans le bon atlas, aux dimensions adéquates et avec les bons pivots. Deux choix honnêtes s'offrent à vous :

1. **Garder les sprites du donneur.** Une créature réutilisant les animations humaines avec des statistiques révisées et une teinte différente constitue un excellent premier mod, parfaitement *fonctionnel*.
2. **Exporter via AssetRipper**, étudier minutieusement l'atlas de la créature clonée et calquer sa disposition au pixel près avant de commencer à dessiner. Voir **[Récupérer les ressources graphiques](#/toolbox/getting-the-sprites)**.

> [!WARNING] Testez dans un vrai monde, pas sur une carte vierge
> Une créature civilisée incapable de naviguer, incapable de bâtir ou se noyant dès sa naissance semblera irréprochable pendant trente secondes. Faites-en apparaître vingt, laissez le monde tourner à vitesse maximale pendant cinq minutes et lisez attentivement les logs :PES_MonkaSweat:.
