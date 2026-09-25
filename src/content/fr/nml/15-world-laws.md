---
title: Lois du monde
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbworldlaws:
order: 176
---

# Lois du monde :wbworldlaws:

Les lois du monde (world law) sont les interrupteurs dans la fenêtre des **Lois du monde** : "vieillesse", "faim", "monstres pacifiques". C'est la chose la plus conviviale que vous puissiez ajouter pour les joueurs, car cela leur permet d'activer ou de désactiver le comportement (behaviour) de votre mod sans toucher au moindre fichier de configuration.

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
            if (AssetManager.world_laws_library.has(CHAOS)) return;

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
| `group_id` | L'onglet dans lequel elle atterrit. La liste complète se trouve sous **Les onglets** plus bas, ou créez le vôtre |
| `icon_path` | L'icône, mêmes règles de chemin que partout ailleurs |
| `default_state` | `true` = activé pour les nouveaux mondes, `false` = désactivé |
| `can_turn_off` | Par défaut à `true`. Mettez `false` pour une loi qui ne peut être qu'activée |

## Lire l'interrupteur dans votre code

C'est tout l'intérêt. Un interrupteur que personne ne lit, c'est de la décoration. N'importe où dans votre mod :

```csharp
WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);

if (law != null && law.isEnabled())
{
    // le joueur veut le chaos, donnez-lui le chaos
}
```

Ou la voie courte, directement depuis le monde, sans récupérer l'asset :

```csharp
bool chaos = World.world.world_laws.isEnabled(HelloLaws.CHAOS);
```

`isEnabled(string)` renvoie `false` pour un id inconnu au lieu de lever une exception, donc une faute de frappe se lit comme "désactivé" plutôt que comme un crash. Gentil, et aussi terrible, parce que rien ne vous prévient :PES5_Hmmmm:. `World.world.world_laws` est `internal`, donc ceci compile contre l'assembly publicisée avec laquelle NML compile votre mod (voir la note dans **[Effets de statut](#/nml/status-effects)**). La voie de l'asset ci-dessus fonctionne partout.

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

## Les onglets

La fenêtre est divisée en onglets, et `group_id` en choisit un. Voici tous les groupes vanilla, dans l'ordre où la fenêtre les dessine :

`harmony` · `diplomacy` · `civilizations` · `units` · `mobs` · `spawn` · `nature` · `trees` · `plants` · `fungi` · `biomes` · `weather` · `disasters` · `other`

### Un onglet à vous

Remplacez le `Initialize()` du premier exemple par la version ci-dessous, et ajoutez `GROUP` à côté de `CHAOS`.

Un groupe est un `WorldLawGroupAsset` dans `AssetManager.world_law_groups`. C'est le même petit `BaseCategoryAsset` que les onglets de traits utilisent, voir **[Groupes de traits et onglets](#/nml/trait-groups)** :

| Champ | Ce qu'il fait |
| --- | --- |
| `id` | Ce vers quoi le `group_id` d'une loi pointe |
| `name` | La **clé de locale** pour le titre de l'onglet. Pas le titre lui-même |
| `color` | Chaîne hexadécimale. Teinte le titre de l'onglet |

```csharp Mods/HelloBox/Code/HelloLaws.cs
public const string GROUP = "hello_laws";

public static void Initialize()
{
    // the group first: the laws below point at it
    if (!AssetManager.world_law_groups.has(GROUP))
    {
        AssetManager.world_law_groups.add(new WorldLawGroupAsset
        {
            id = GROUP,
            name = "world_laws_tab_" + GROUP,   // the locale key, not the text
            color = "#FF9A3C"
        });
    }

    if (AssetManager.world_laws_library.has(CHAOS)) return;

    AssetManager.world_laws_library.add(new WorldLawAsset
    {
        id = CHAOS,
        needs_to_be_explored = false,
        group_id = GROUP,
        icon_path = "ui/Icons/worldrules/icon_hello_law",
        default_state = false
    });
}
```

Aucun travail d'UI : la fenêtre des Lois du monde construit un onglet par entrée dans `world_law_groups.list`, puis dépose chaque loi dans l'onglet que nomme son `group_id`. Elle fait ça une seule fois, à la première création de la fenêtre, et votre mod est déjà chargé depuis longtemps quand le joueur y arrive. Votre onglet se place à la fin, après `other`.

> [!WARNING] Un `group_id` inexistant casse toute la fenêtre
> La fenêtre cherche l'onglet avec un simple index de dictionnaire. Une loi pointant vers un groupe que personne n'a enregistré lève une `KeyNotFoundException` pendant la construction de la fenêtre, et chaque loi enregistrée après elle, la vôtre comme celles des autres mods, n'arrive jamais dans la fenêtre. Enregistrez le groupe avant les lois, et orthographiez-le de la même façon les deux fois :PESgn_ToughLuck:.

## Le texte

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one.",
  "world_laws_tab_hello_laws": "HelloBox"
}
```

> [!WARNING] Les lois du monde utilisent `_title`, pas l'id seul
> Presque tous les autres assets utilisent leur id seul comme clé du nom. Les lois du monde demandent `<id>_title`. Trompez-vous et l'interrupteur apparaît sans aucune étiquette :PESgn_Really:.

> [!TIP] Une loi vaut mieux qu'un réglage
> Les réglages du mod vivent dans un menu que le joueur ouvre une fois. Une loi du monde est là, dans le jeu, à côté des lois vanilla, par monde, et elle se bascule en pleine partie. Si votre mod a un comportement activable, c'est ici qu'il doit être :wbblessed:.
