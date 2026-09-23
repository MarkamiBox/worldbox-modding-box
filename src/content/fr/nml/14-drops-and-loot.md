---
title: Gouttes & objets qui tombent
group: Contenu du jeu
subgroup: Objets et équipement
icon: :wbloot:
order: 126
---

# Gouttes & objets qui tombent :wbloot:

Une **goutte** (drop) est un petit objet qui tombe du ciel, atterrit sur une case et fait quelque chose : pluie, sang, graines, feu, acide, pièces de monnaie. C'est le moyen le plus économique de tout le jeu pour faire *arriver* quelque chose sur la carte, et elle vient gratuitement avec sa propre animation et son propre son.

## En enregistrer une

Les gouttes vivent dans `AssetManager.drops`. Voici une goutte qui atterrit et met le feu à la case :

```csharp Mods/HelloBox/Code/HelloDrops.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public static class HelloDrops
    {
        public static void Initialize()
        {
            DropAsset ember = new DropAsset
            {
                id = "hello_ember",
                path_texture = "drops/hello_ember",   // sprite in GameResources/drops/
                type = DropType.DropMagic,
                animated = true,
                animation_speed = 0.03f,
                default_scale = 0.1f,
                falling_speed = 3.2f,
                sound_drop = "event:/SFX/DROPS/DropBlessing"
            };

            // ce qui se passe au moment où il touche le sol
            ember.action_landed = (WorldTile pTile, string pDropID) =>
            {
                if (pTile == null) return;
                World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
            };

            AssetManager.drops.add(ember);
        }
    }
}
```

Ensuite, dans `Main.cs`, ajoutez la ligne : `HelloDrops.Initialize();`

### Ce que font les champs

| Champ | Signification |
| --- | --- |
| `id` | Le nom que vous utilisez partout ailleurs |
| `path_texture` | Le sprite, mêmes règles de chemin que tout le reste |
| `type` | `DropType.DropMagic`, `DropGeneric`, … Décide d'une partie du comportement interne du jeu |
| `animated` + `animation_speed` | Joue la liste de sprites sous forme d'animation |
| `default_scale` | Sa taille. `0.1f` est la valeur habituelle pour les petites gouttes |
| `falling_speed` | Sa vitesse de chute |
| `sound_drop` / `sound_launch` | Événements sonores FMOD |
| `action_landed` | **Le plus intéressant** : votre code s'exécute à l'atterrissage |
| `action_launch` | S'exécute lorsqu'elle est projetée |

## Votre propre sprite

`path_texture` est chargé exactement tel qu'écrit, depuis l'intérieur de `GameResources/`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── drops/
        └── hello_ember/
            ├── hello_ember_0.png
            └── hello_ember_1.png
```

```csharp
ember.path_texture = "drops/hello_ember";   // a folder
```

Les drops sont chargés comme une **liste de sprites** : le jeu lit chaque PNG *dans* ce dossier, c'est ce qui fait marcher `animated`. Un drop immobile reste un dossier, avec une seule frame dedans. Un `drops/hello_ember.png` isolé revient comme une liste vide, et le drop tombe invisible.

## Faire tomber des gouttes

Deux méthodes, toutes deux sur `World.world.drop_manager` :

```csharp
// droit vers le bas sur une case : (tile, dropId, height, ?, ownerId)
World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);

// lancée en cloche, comme une explosion projetant des débris
World.world.drop_manager.spawnParabolicDrop(tile, "hello_ember", 0f, 0.1f, 5f, 0.5f, 4f, 0.15f);
```

`spawn` est ce que vous voulez 90 % du temps. Le `15f` est la hauteur de chute : plus il est grand, plus la goutte met de temps à atterrir.

## Un usage réel : faire pleuvoir des braises avec votre pouvoir divin

Si vous avez fait la page des **[Pouvoirs divins](#/nml/god-powers)**, voici la récompense : un pouvoir, une case entière en flammes.

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    // une au centre, une sur chaque case voisine
    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);
    foreach (WorldTile neighbour in pTile.neighboursAll)
    {
        World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
    }
    return true;
};
```

> [!TIP] Les gouttes sont l'effet spécial du paresseux
> Avant d'écrire un système de particules, demandez-vous si une goutte avec un sprite et un `action_landed` ne fait pas l'affaire. C'est généralement le cas, en dix lignes, avec le son inclus :PESgn_Noice:.
