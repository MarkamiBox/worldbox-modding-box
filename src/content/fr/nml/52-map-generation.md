---
title: Génération de carte
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbworld:
order: 169
---

# Génération de carte :wbworld:

La fenêtre de nouveau monde lit trois bibliothèques. `map_sizes` est le sélecteur de taille, `map_gen_templates` est la rangée de cartes de formes (`continent`, `islands`, `donut`...), et `map_gen_settings` regroupe les curseurs et interrupteurs que vous obtenez après avoir choisi une carte. Toutes les trois sont des bibliothèques d'assets ordinaires. Une seule est plug and play, et je vais vous dire lesquelles ont besoin de travail sur l'UI avant que vous ne le découvriez à la dure.

## Une carte plus grande

Une taille est un `MapSizeAsset`, et c'est quatre champs :

| Champ | Ce qu'il fait |
| --- | --- |
| `id` | Aussi la clé de traduction, avec un préfixe : `map_size_<id>` |
| `size` | Le côté de la carte en blocs de 64 tuiles. `iceberg` vaut `9`, soit 576 x 576 |
| `path_icon` | L'icône à côté du nom de la taille, relative à `ui/Icons/` |
| `show_warning` | Remplace le message d'accueil de la fenêtre par l'avertissement "cette carte est grande" |

Les tailles vanilla : `tiny` 2 · `small` 3 · `standard` 4 · `large` 5 · `huge` 6 · `gigantic` 7 · `titanic` 8 · `iceberg` 9.

```csharp Mods/HelloBox/Code/HelloMapGen.cs
namespace HelloBox
{
    public static class HelloMapGen
    {
        public const string COLOSSAL = "hello_colossal";

        public static void Initialize()
        {
            AddColossal();
            AddRing();
        }

        public const string RING = "hello_ring";

        private static void AddRing()
        {
            if (AssetManager.map_gen_templates.has(RING)) return;

            MapGenTemplate ring = AssetManager.map_gen_templates.clone(RING, "donut");

            // values is a plain object, so the clone shares donut's. give it its own before touching it
            ring.values = new MapGenValues
            {
                gradient_round_edges = true,
                add_center_gradient_land = true,
                add_center_lake = true,
                ring_effect = true,
                perlin_noise_stage_2 = true,
                random_shapes_amount = 3
            };

            // reset copies from a backup table filled at startup, and your id is not in it
            ring.show_reset_button = false;
        }

        public static void OpenRing()
        {
            if (!AssetManager.map_gen_templates.has(RING)) return;

            Config.current_map_template = RING;
            ScrollWindow.showWindow("new_world_templates_2");
        }

        private static void AddColossal()
        {
            if (AssetManager.map_sizes.has(COLOSSAL)) return;

            AssetManager.map_sizes.add(new MapSizeAsset
            {
                id = COLOSSAL,
                size = 10,                   // 10 x 64 = 640 tiles a side
                path_icon = "iconIceberg",   // ui/Icons/ is added for you
                show_warning = true
            });

            // the size switcher reads an array built in linkAssets(), which ran before your mod
            AssetManager.map_sizes.linkAssets();
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "map_size_hello_colossal": "Colossal"
}
```

> [!WARNING] Sans `linkAssets()`, la taille est inatteignable
> Les flèches de la fenêtre ne parcourent pas la bibliothèque. Elles parcourent un simple `string[]` que `MapSizeLibrary.linkAssets()` construit une fois au démarrage, avant que NML ne vous charge. Votre taille est enregistrée, et les flèches passent devant elle pour toujours. Rappeler `linkAssets()` ne fait que reconstruire ce tableau, c'est donc sans danger.

Les flèches suivent l'ordre de `list`, donc une taille ajoutée à la fin se place après `iceberg`, ce qui est la bonne place pour une carte plus grande. Une plus petite veut un `list.Remove` et un `list.Insert(0, ...)` avant l'appel à `linkAssets()`.

Ce que je peux vous dire sur les limites, d'après le code :

- **L'upload Workshop la refuse.** L'upload compare la taille à `Config.maxMapSize`, qui vaut `iceberg`, et rejette tout ce qui est plus grand avec "Not a valid world size!".
- **Sans votre mod, la liste des sauvegardes affiche des chiffres bruts.** Le navigateur de sauvegardes cherche la taille par son numéro et retombe sur "largeur x hauteur" quand rien ne correspond. Si une telle sauvegarde se charge proprement sans votre mod, je ne l'ai pas testé.
- **Je n'ai pas testé jusqu'où ça va.** `10` fait 23% de tuiles en plus qu'`iceberg`, et chaque palier suivant coûte plus cher. Quelque part au-dessus se trouve un chiffre que les ordinateurs de vos joueurs n'aimeront pas :PES5_Hmmmm:.

## Une nouvelle forme de monde

Un template est un `MapGenTemplate`. La recette elle-même vit dans son `values`, le reste décide comment il est présenté :

| Champ | Ce qu'il fait |
| --- | --- |
| `values` | Un `MapGenValues` : les drapeaux et nombres que lit le générateur. Voir plus bas |
| `path_icon` | L'image d'aperçu, chemin complet : `ui/new_world_templates_icons/template_donut` |
| `force_height_to` | Fixe chaque tuile à cette hauteur après la première passe de bruit, avant que le reste ne la façonne. `0` la désactive |
| `freeze_mountains` | Gèle les sommets des montagnes une fois la terre terminée |
| `perlin_replace` | Des échanges de tuiles basés sur la hauteur, comme "au-dessus de 170, `soil_high` devient `soil_low`" |
| `special_anthill`, `special_checkerboard`, `special_cubicles` | Active l'un des trois générateurs codés en dur |
| `allow_edit_*` | Quelles lignes de réglages le joueur voit pour ce template. Voir la section suivante |
| `show_reset_button` | Si la fenêtre a un bouton "réinitialiser" |

Les id vanilla, tous des sources valides pour `clone()` : `continent` · `box_world` · `islands` · `toast` · `pancake` · `boring_plains` · `checkerboard` · `cubicles` · `dormant_volcano` · `cheese` · `bad_apple` · `donut` · `lasagna` · `chaos_pearl` · `anthill` · `empty`.

Et les champs de `MapGenValues` qu'il vaut la peine de connaître :

| Champ | Ce qu'il fait |
| --- | --- |
| `main_perlin_noise_stage`, `perlin_noise_stage_2`, `perlin_noise_stage_3` | Les trois passes de bruit qui créent la terre |
| `perlin_scale_stage_1` / `_2` / `_3` | À quel point chaque passe est zoomée. `5` par défaut |
| `gradient_round_edges` / `square_edges` | Fait baisser la hauteur vers le bord de la carte, en cercle ou en carré |
| `add_center_gradient_land`, `add_center_lake`, `center_gradient_mountains` | Pousse de la terre, un lac ou des montagnes vers le centre |
| `ring_effect` | Une passe de bruit supplémentaire en forme d'anneau |
| `add_mountain_edges` / `remove_mountains` | Une bordure de montagnes autour de la carte / aplatit les montagnes en terrain normal |
| `low_ground` / `high_ground` | Abaisse ou relève le sol après les passes de bruit |
| `random_shapes_amount` | Combien de blobs aléatoires sont tamponnés par-dessus |
| `random_biomes`, `add_vegetation`, `add_resources` | Les trois derniers sont `true` par défaut |

`AddRing()` ci-dessus clone un template vanilla et lui donne sa propre recette. Gardez les trois méthodes dans la même classe `HelloMapGen`.

```json Mods/HelloBox/Locales/en.json
{
  "template_hello_ring": "Ember Ring",
  "template_hello_ring_info": "A lake in the middle, land around it, and nobody asked for it."
}
```

> [!WARNING] Cachez le bouton de réinitialisation sur vos propres templates
> "Réinitialiser" appelle `resetTemplateValues()`, qui lit les valeurs par défaut du template dans un dictionnaire rempli une seule fois au démarrage avec les id vanilla. Le vôtre n'y est pas, donc le bouton lève une `KeyNotFoundException`. `show_reset_button = false` et le problème n'existe plus.

> [!WARNING] Un template cloné partage son `values`
> `clone()` copie les listes dans de nouvelles listes, mais `values` est une classe simple, donc elle est copiée par référence (voir **[Bibliothèques d'assets](#/nml/asset-libraries)**). Modifiez `ring.values.ring_effect` sans la ligne `new MapGenValues` et chaque donut vanilla change avec lui. Les entrées dans `perlin_replace` sont partagées de la même façon : construisez-en de nouvelles plutôt que de les modifier.

### Le piège : il n'y a pas de carte

Le sélecteur de templates est un prefab. Il a un bouton par template vanilla, et chaque bouton trouve son template par son propre nom de GameObject. Un nouveau template n'obtient aucun bouton, et rien dans la bibliothèque ne change cela.

Ce qui fonctionne, c'est de faire vous-même le travail du bouton : définir le template, puis ouvrir la deuxième fenêtre, exactement comme le fait une carte vanilla.

Appelez `HelloMapGen.OpenRing()` depuis votre bouton.

Accrochez ça à un bouton simple, voir **[Onglets et boutons de pouvoir](#/nml/power-buttons)**, et le joueur obtient votre aperçu, vos lignes de réglages, les flèches de taille et le bouton de génération, comme n'importe quel template vanilla. Mettre une vraie carte dans le sélecteur signifie cloner un de ses boutons et renommer le clone avant que son `Awake()` ne s'exécute, car c'est le moment où il lit son nom. C'est de la chirurgie d'UI que je n'ai pas vérifiée, donc ce n'est pas sur cette page.

> [!NOTE] Modifier un template vanilla à la place
> `AssetManager.map_gen_templates.get("islands").values.random_shapes_amount = 10;` fonctionne, et ne nécessite aucun bouton du tout. Sachez juste que "réinitialiser" restaure la copie prise au démarrage, avant le chargement de votre mod. Un clic et votre modification disparaît jusqu'au prochain redémarrage.

## Les lignes sous un template

Chaque curseur et interrupteur de la deuxième fenêtre est un `MapGenSettingsAsset` :

| Champ | Ce qu'il fait |
| --- | --- |
| `is_switch` | On/off au lieu d'un nombre |
| `min_value` / `max_value` | La plage, pour un nombre |
| `allowed_check` | Étant donné le template actuel, si cette ligne est affichée |
| `action_get` / `action_set` | Lit et écrit la valeur, généralement dans le `values` du template actuel |
| `increase` / `decrease` / `action_switch` | Ce que font les flèches et l'interrupteur |

Les lignes vanilla : `gen_perlin_scale_stage_1` · `gen_perlin_scale_stage_2` · `gen_perlin_scale_stage_3` · `gen_random_shapes` · `gen_cubicles_sizes` · `gen_random_biomes` · `gen_mountain_edges` · `gen_add_vegetation` · `gen_add_resources` · `gen_add_center_lake` · `gen_add_center_land` · `gen_round_edges` · `gen_square_edges` · `gen_ring_effect` · `gen_low_ground` · `gen_high_ground` · `gen_remove_mountains` · `gen_forbidden_knowledge`.

La partie qu'un mod utilise réellement : le `allowed_check` de chaque ligne vanilla lit l'un des drapeaux `allow_edit_*` de votre template. Vous n'ajoutez donc pas de lignes, vous choisissez lesquelles de celles-ci le joueur obtient :

```csharp
// in AddRing(), after the clone: hide everything, then give back the rows that make sense for a ring
AssetManager.map_gen_templates.disableNormalSettings(ring);
ring.allow_edit_random_biomes = true;
ring.allow_edit_random_vegetation = true;
```

Détail amusant : les trois curseurs perlin vérifient tous `allow_edit_perlin_scale_stage_1`. Les drapeaux `_2` et `_3` existent et rien ne les lit :PES2_Shrug:.

Un nouveau `MapGenSettingsAsset` à lui seul n'affiche rien. Les lignes sont intégrées en dur dans le prefab de la fenêtre et trouvent leur asset par nom de GameObject, la même astuce que les cartes de templates. Une ligne à vous signifie cloner une ligne existante à l'intérieur de la fenêtre, et ce que vous enregistrez doit avoir `allowed_check` défini, car la fenêtre l'appelle sur chaque ligne sans vérification de nullité.

> [!TIP] Partez de la forme, pas des réglages
> Neuf fois sur dix, ce que vous voulez, c'est un template avec un `values` différent et un bouton qui l'ouvre. Cela ne nécessite aucune modification de prefab. Revérifiez les champs après une mise à jour du jeu. Une fois que le terrain a la bonne tête, **[Biomes](#/nml/biomes)** décide de ce qui y pousse :PES2_Wise:.
