---
title: Nuages et météo
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbtornado:
order: 172
---

# Nuages et météo :wbtornado:

Un nuage est un sprite qui dérive sur la carte en lâchant des projectiles sur ce qui se trouve en dessous. Pluie, acide, lave, neige, feu : ils sont tous le même asset avec une couleur différente et un `drop_id` distinct.

Les nuages représentent le meilleur investissement de tout le jeu pour un moddeur. Un seul asset, aucun dessin requis, et il se déplace, lâche des gouttes, éclaire le sol et apparaît de lui-même dans la liste des catastrophes.

## En enregistrer un

```csharp Mods/HelloBox/Code/HelloClouds.cs
using System.Collections.Generic;
using UnityEngine;

namespace HelloBox
{
    public static class HelloClouds
    {
        public const string EMBER = "hello_cloud_ember";

        // Your own art: GameResources/effects/clouds/hello_cloud.png
        private static readonly string[] Sprites = new string[]
        {
            "effects/clouds/hello_cloud"
        };

        public static void Initialize()
        {
            if (AssetManager.clouds.has(EMBER)) return;

            AssetManager.clouds.add(new CloudAsset
            {
                id = EMBER,
                color_hex = "#D14219",
                max_alpha = 0.8f,
                drop_id = "hello_ember",          // a drop id: see Drops & falling things
                cloud_action_1 = CloudLibrary.dropAction,
                interval_action_1 = 0.05f,
                speed_min = 1f,
                speed_max = 3f,
                considered_disaster = true,       // counts as a disaster in the game's own lists
                draw_light_area = true,
                draw_light_size = 4f,
                path_sprites = Sprites
            });

            // CloudLibrary turns path_sprites into sprites and color_hex into a colour during
            // the game's own startup, before your mod existed. Do both for yours.
            CloudAsset cloud = AssetManager.clouds.get(EMBER);
            List<Sprite> loaded = new List<Sprite>();
            foreach (string path in cloud.path_sprites)
            {
                Sprite sprite = SpriteTextureLoader.getSprite(path);
                if (sprite != null) loaded.Add(sprite);
            }
            cloud.cached_sprites = loaded.ToArray();
            cloud.color = Toolbox.makeColor(cloud.color_hex);
        }
    }
}
```

> [!WARNING] Un nuage enregistré tard n'a pas de sprites
> `CloudLibrary` construit `cached_sprites` depuis `path_sprites` et `color` depuis `color_hex` en une passe pendant le chargement. Ton nuage n'était pas encore dans la liste, les deux restent vides, et la première fois qu'il apparaît le jeu lance `NullReferenceException` dans `Cloud.prepare()` :wbfacepalm:. Les six dernières lignes d'`Initialize` font cette passe pour le tien.


### Les champs

Clonez un nuage vanilla, puis changez `drop_id` et `color_hex`. Beaucoup de nuages n'ont besoin de rien d'autre.

| Champ | Ce qu'il fait |
| --- | --- |
| `color_hex` | La teinte. C'est l'essentiel de ce qui donne son identité au nuage |
| `max_alpha` | Son opacité maximale. `0.8` par défaut |
| `drop_id` | La goutte qu'il pleut. Tout id dans `AssetManager.drops`, vanilla ou le vôtre |
| `cloud_action_1` / `cloud_action_2` | Deux actions indépendantes, chacune sur son propre intervalle de temps |
| `interval_action_1` / `interval_action_2` | Secondes entre chaque exécution de l'action correspondante |
| `speed_min` / `speed_max` | Vitesse de dérive. Chaque nuage tire sa vitesse dans cette plage |
| `path_sprites` | La liste des sprites. Le jeu en choisit un au hasard par nuage |
| `considered_disaster` | Indique si le jeu le classe comme une catastrophe officielle |
| `normal_cloud` | Le marque comme météo standard plutôt que comme événement |
| `draw_light_area`, `draw_light_size`, `draw_light_area_offset_x/y` | La lueur projetée au sol, pour les nuages de feu ou de lave |

## Ce qu'est une action de nuage

Une `CloudAction` prend le nuage en cours et ne renvoie rien :

```csharp
public delegate void CloudAction(Cloud pCloud);
```

`CloudLibrary.dropAction` est l'action vanilla standard : elle sélectionne une tuile aléatoire sous le sprite du nuage et y fait apparaître un `drop_id`. Dans 90 % des cas, c'est la seule action dont vous avez besoin : vous la définissez sur `cloud_action_1` et c'est tout. Paresseux et correct, ma combinaison préférée :pepeOK:.

Pour un effet supplémentaire, écrivez votre propre méthode et attribuez-la à `cloud_action_2` :

```csharp
private static void SparkAction(Cloud pCloud)
{
    // S'exécute toutes les interval_action_2 secondes pour chaque nuage de ce type sur la carte.
    // Gardez cela très léger et lancez une probabilité pour éviter que cela n'explose constamment.
    if (!Randy.randomChance(0.02f)) return;

    int x = (int)pCloud.transform.localPosition.x;
    int y = (int)pCloud.transform.localPosition.y;

    WorldTile tile = World.world.GetTile(x, y);
    if (tile == null) return;

    MapBox.spawnLightningSmall(tile, 0.15f);
}
```

Puis assignez `cloud_action_2 = SparkAction; interval_action_2 = 0.1f;`.

## Vos propres sprites

`path_sprites` est une liste de chemins, et chaque entrée est chargée telle quelle depuis `GameResources/`. Le jeu choisit une texture par nuage, d'où les trois variantes fournies par le jeu de base.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/clouds/
        ├── cloud_hello_1.png
        ├── cloud_hello_2.png
        └── cloud_hello_3.png
```

```csharp
path_sprites = new string[]
{
    "effects/clouds/cloud_hello_1",
    "effects/clouds/cloud_hello_2",
    "effects/clouds/cloud_hello_3"
}
```

Un sprite de nuage est une grosse tache floue en niveaux de gris. `color_hex` fait tout le travail esthétique : ne le peignez donc pas de la couleur finale voulue, dessinez-le en blanc et laissez la teinte opérer :wbsmirk:.

## Faire apparaître un nuage dans le ciel

Les nuages apparaissent via le système d'effets visuels, et non par un gestionnaire de nuages :

```csharp
EffectsLibrary.spawn("fx_cloud", tile, HelloClouds.EMBER);
```

C'est exactement ce que fait chaque pouvoir divin de nuage dans le jeu. Enveloppez cela dans un pouvoir et le joueur disposera d'un outil d'invocation :

```csharp
GodPower power = new GodPower
{
    id = "hello_cloud_power",
    name = "hello_cloud_power",
    rank = PowerRank.Rank0_free,
    path_icon = "ui/Icons/iconFire",
    click_action = (WorldTile pTile, string pPowerID) =>
    {
        if (pTile == null) return false;

        EffectsLibrary.spawn("fx_cloud", pTile, HelloClouds.EMBER);
        MusicBox.playSound("event:/SFX/UNIQUE/SpawnCloud", pTile.pos.x, pTile.pos.y);
        return true;
    }
};
AssetManager.powers.add(power);
```

Voir **[Pouvoirs divins](#/nml/god-powers)** et **[Onglets et boutons de pouvoirs](#/nml/power-buttons)** pour le bouton d'interface.

## Les nuages vanilla

Pratiques comme bases de clonage et pour se rappeler ce qui existe déjà :

`cloud_rain` · `cloud_lightning` · `cloud_snow` · `cloud_fire` · `cloud_lava` · `cloud_acid` · `cloud_ash` · `cloud_rage`

```csharp
// Partez d'un nuage fonctionnel et modifiez simplement la couleur et la goutte.
CloudAsset mine = AssetManager.clouds.clone("hello_cloud_blood", "cloud_rain");
mine.color_hex = "#8B1A1A";
mine.drop_id = "blood";
```

Rappelez-vous que `clone()` enregistre déjà l'asset pour vous : n'appelez surtout pas `add()` ensuite.

## Dessiner vos propres sprites

`path_sprites` est une liste de chemins sous votre dossier `GameResources/`, selon les mêmes règles habituelles. Voir **[Sprites et ressources](#/nml/sprites-and-resources)**. Un sprite de nuage est une forme cotonneuse ; `color_hex` fait tout le travail, donc un dessin en nuances de gris suffit amplement.

> [!TIP] Des nuages avant de coder des catastrophes
> Une "catastrophe" dans les listes internes du jeu n'est souvent rien d'autre qu'un nuage avec `considered_disaster = true`. Avant de coder une catastrophe complexe avec déclencheur et durée, vérifiez si un nuage faisant pleuvoir votre goutte ne fait pas déjà exactement ce que vous vouliez :PES2_HmmmmThumbsUp:.
