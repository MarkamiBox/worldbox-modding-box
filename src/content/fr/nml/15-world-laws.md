---
title: Lois du monde
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbworldlaws:
order: 176
---

# Lois du monde :wbworldlaws:

Les lois du monde sont les interrupteurs dans la fenêtre des **Lois du monde** : "vieillesse", "faim", "monstres pacifiques". C'est la chose la plus conviviale que vous puissiez ajouter pour les joueurs, car cela leur permet d'activer ou de désactiver le comportement de votre mod sans toucher au moindre fichier de configuration.

C'est aussi l'un des assets les plus simples de tout le jeu. Quatre champs.

## Ajouter un interrupteur

```csharp Mods/HelloBox/Code/HelloLaws.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloLaws
    {
        public const string CHAOS = "world_law_hello_chaos";

        public static void Initialize()
        {
            AssetManager.world_laws_library.add(new WorldLawAsset
            {
                id = CHAOS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "units",                                  // dans quel onglet il apparaît
                icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
                default_state = false                                // commence désactivé
            });
        }
    }
}
```

Ajoutez `HelloLaws.Initialize();` dans `Main.cs` et l'interrupteur est dans le jeu. C'est véritablement tout :poggers:.

| Champ | Signification |
| --- | --- |
| `id` | Le nom de votre loi. Sert aussi de clé de traduction |
| `group_id` | L'onglet dans lequel elle atterrit : `units`, `civilizations`, `spawn`, `diplomacy`, `nature`, … |
| `icon_path` | L'icône, mêmes règles de chemin que partout ailleurs |
| `default_state` | `true` = activé pour les nouveaux mondes, `false` = désactivé |
| `can_turn_off` | Par défaut à `true`. Mettez `false` pour une loi qui ne peut être qu'activée |

## Lire l'interrupteur dans votre code

C'est tout l'intérêt. N'importe où dans votre mod :

```csharp
WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);

if (law != null && law.isEnabled())
{
    // le joueur veut le chaos, donnez-lui le chaos
}
```

Un exemple concret, en ne faisant tomber vos braises que lorsque la loi est activée :

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
    bool chaos = law != null && law.isEnabled();

    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

    if (chaos)
    {
        foreach (WorldTile neighbour in pTile.neighboursAll)
        {
            World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
        }
    }
    return true;
};
```

## Réagir au moment où il est basculé

Si l'activation de la loi doit *faire* quelque chose immédiatement, plutôt que d'être simplement consultée plus tard :

```csharp
new WorldLawAsset
{
    id = CHAOS,
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
    default_state = false,
    on_state_enabled = (PlayerOptionData pOption) => { /* s'exécute lorsque le joueur l'active */ }
};
```

## Le texte

```json Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one."
}
```

> [!WARNING] Les lois du monde utilisent _title, pas l'id brut
> Presque tous les autres assets utilisent leur simple identifiant comme clé de nom. Les lois du monde exigent `<id>_title`. Trompez-vous et l'interrupteur apparaîtra sans aucun libellé :PESgn_Really:.

> [!TIP] Une loi vaut mieux qu'un paramètre
> Les paramètres de mod résident dans un menu que le joueur ouvre une fois. Une loi du monde est là, directement dans le jeu, à côté de celles de base, par monde, et peut être modifiée en pleine partie. Si votre mod propose un comportement commutable, c'est ici qu'il a sa place :wbblessed:.
