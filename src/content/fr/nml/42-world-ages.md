---
title: Âges du monde et comportements
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbsunblessed:
order: 174
---

# Âges du monde et comportements :wbsunblessed:

Deux concepts appartiennent au monde lui-même plutôt qu'à ses habitants. Un **âge du monde** (world age) est l'ère sur la roue des âges : l'Âge de l'Espoir, l'Âge des Cendres, avec leur météo, leur éclairage et leurs règles. Un **comportement du monde** (world behaviour) est un bloc de code que le monde exécute en boucle sur un minuteur : c'est ainsi que le jeu gère les catastrophes, les migrants et l'usure des routes.

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

## Âges du monde

L'Âge des Braises fait pleuvoir des braises toutes les huit secondes, assombrit l'écran avec de la cendre, propage le feu deux fois plus vite et maintient les villes un peu plus loyales. Un nouveau monde peut le placer sur le slot 4 de sa roue, et le bouton aléatoire de la roue peut l'assigner n'importe où.

> [!WARNING] Trois opérations effectuées par la bibliothèque au démarrage
> `post_init()` définit l'arrière-plan de chaque âge à partir de son ID, et `linkAssets()` construit `list_only_normal` (la sélection pour l'âge aléatoire inconnu) et `pool_by_slots` (les sélections avec lesquelles un nouveau monde remplit sa roue). Un nouvel âge ne figure dans aucune d'elles. Si vous oubliez l'arrière-plan, la roue affichera un quartier vide ; si vous oubliez les sélections, l'âge existera mais aucun monde ne le tirera jamais au sort.

> [!NOTE] La liste des âges sélectionnables
> La fenêtre des âges crée un bouton par âge lorsqu'elle s'initialise, et le jeu précharge cette fenêtre. Je n'ai pas vérifié si elle s'initialise avant ou après le chargement des mods, donc l'apparition d'un bouton pour le vôtre est à vérifier en jeu plutôt qu'une certitude. La roue, les sélections aléatoires et les effets spéciaux n'en dépendent pas.

| Champ | Ce qu'il fait |
| --- | --- |
| `rate` | Poids lorsqu'un âge est choisi aléatoirement |
| `default_slots` | Emplacements de la roue (1 à 8) où un nouveau monde peut l'assigner |
| `clouds` + `cloud_interval` | Les nuages générés et leur fréquence |
| `special_effect_action` + `special_effect_interval` | Votre code périodique tant que l'âge est actif |
| `overlay_*`, `particles_*`, `era_effect_overlay_alpha` | Le rendu visuel : obscurité, pluie, neige, cendre, soleil |
| `title_color`, `light_color` | Couleur du titre et de la lumière ambiante |
| `bonus_loyalty`, `bonus_opinion`, `bonus_biomes_growth` | Bonus appliqués à la politique et à la pousse des biomes |
| `fire_spread_rate_bonus`, `temperature_damage_bonus`, `range_weapons_multiplier` | Règles du jeu modifiées |
| `flag_night`, `flag_winter`, `flag_chaos`, `flag_light_age`, `flag_crops_grow` | Interrupteurs consultés par d'autres systèmes. Les cultures ne poussent que si `flag_crops_grow` est true |

Les clés de texte sont `<id>_title` et `<id>_description`.

## Comportements du monde

Un comportement se résume à deux nombres et un délégué : exécuter `action` toutes les `interval` secondes, plus jusqu'à `interval_random` secondes supplémentaires aléatoires. Il se met en pause avec le monde sauf si vous indiquez `stop_when_world_on_pause = false`, et `action_world_clear` s'exécute lors du chargement d'un nouveau monde.

> [!WARNING] Le gestionnaire est créé au démarrage
> Le monde conserve un minuteur `WorldBehaviour` par asset, créé par `createManagers()` lorsque la carte s'initialise pour la première fois, avant votre mod. Le vôtre a `manager == null`, et la boucle du monde tente de l'appeler quand même : `NullReferenceException`, à chaque frame, tant que le jeu tourne :wbfacepalm:. La ligne située juste après `add()` règle ce problème.

Le comportement de HelloBox ne fait rien tant que sa loi mondiale est désactivée. C'est le modèle à reproduire : la vérification est très légère, alors laissez le minuteur tourner et décidez à l'intérieur de l'action.

```json Mods/HelloBox/Locales/en.json
{
  "age_hello_embers_title": "Age of Embers",
  "age_hello_embers_description": "The sky is on fire, a little. Cities like it."
}
```

Pour du code devant s'exécuter selon son propre rythme sans être rattaché au monde (comme l'interface utilisateur), la méthode `Update()` de NML sur votre classe principale reste l'option la plus simple : voir **[Le mod terminé](#/nml/all-together)** :PES_OkHand:.
