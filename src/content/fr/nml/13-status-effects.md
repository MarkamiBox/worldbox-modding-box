---
title: Effets de statut
group: Contenu du jeu
subgroup: Acteurs, bâtiments et IA
icon: :wbcursed:
order: 146
---

# Effets de statut :wbcursed:

Un trait définit ce qu'une créature **est**. Un effet de statut définit ce qui lui arrive **en ce moment même** : en feu, gelée, empoisonnée, bénie. Ils disparaissent d'eux-mêmes avec le temps, affichent leur propre sprite sur l'unité et peuvent exécuter une action cadencée par minuteur.

## En enregistrer un

Les statuts vivent dans `AssetManager.status`. Même logique que pour les traits : construire l'asset, renseigner les champs, l'ajouter.

```csharp Mods/HelloBox/Code/HelloStatus.cs
namespace HelloBox
{
    public static class HelloStatus
    {
        public const string CURSED = "hello_cursed";

        public static void Initialize()
        {
            if (AssetManager.status.has(CURSED)) return;

            StatusAsset cursed = new StatusAsset
            {
                id = CURSED,

                // Statuses do NOT derive their locale keys from the id.
                // Set both, or the unit shows a blank tooltip.
                locale_id = "status_title_hello_cursed",
                locale_description = "status_description_hello_cursed",

                texture = "fx_hello_status",          // a folder of frames in GameResources/effects/
                path_icon = "ui/Icons/iconHelloStatus",       // icon in GameResources/ui/Icons/
                duration = 20f,                           // seconds, then it removes itself
                tier = StatusTier.Advanced,               // None, Basic or Advanced
                can_be_cured = true,
                allow_timer_reset = true,                 // re-applying refreshes the timer
                animated = true,
                animation_speed = 0.15f,
                loop = true,
                scale = 1f,
                offset_y = 0.2f,
                affects_mind = false,
                removed_on_damage = false,
                opposite_status = new string[] { "blessed" },
                remove_status = new string[] { "shield" }
            };

            // StatusAsset allocates its own base_stats, so unlike traits you can set
            // these before add(). Doing it after works too, and is the safer habit.
            cursed.base_stats["damage"] = -5;
            cursed.base_stats["speed"] = -10f;

            AssetManager.status.add(cursed);

            // StatusLibrary turns texture into frames, and flags the status as drawable, in its
            // own post-init: before your mod existed. Without these two the first unit that gets
            // the status throws NullReferenceException every frame.
            cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
            cursed.need_visual_render = true;
        }
    }
}
```

> [!WARNING] Les frames ne sont chargés que pour les statuts vanilla
> `StatusLibrary` remplit `sprite_list` depuis `"effects/" + texture` et active `need_visual_render`, une fois, au chargement. Un statut ajouté après a `sprite_list = null`, et dès qu'une créature le reçoit, `Status.updateAnimationFrame()` lance `NullReferenceException` à chaque frame tant qu'il dure :wbfacepalm:. Les deux dernières lignes d'`Initialize` font ça pour le tien.
>
> `texture` désigne un **dossier** : `GameResources/effects/fx_hello_status/` avec un PNG par frame d'animation.


### Les champs indispensables

| Champ | Ce qu'il fait |
| --- | --- |
| `duration` | Durée de vie en secondes. Le statut se retire tout seul à la fin |
| `allow_timer_reset` | Réappliquer le statut relance le décompte au lieu de ne rien faire |
| `tier` | `StatusTier.None`, `Basic` ou `Advanced`. Les `allowed_status_tiers` de l'acteur décident s'il l'accepte |
| `can_be_cured` | Si un soin ou un pouvoir de guérison peut le purifier |
| `removed_on_damage` | Se dissipe dès que l'unité subit un coup |
| `cancel_actor_job` | Interrompt l'action en cours de l'unité lors de l'application |
| `affects_mind` | Marque l'effet comme altération mentale |
| `opposite_status` | Statuts mutuellement exclusifs |
| `remove_status` | Statuts purgés lors de l'application de celui-ci |
| `base_stats` | Modificateurs de statistiques pendant la durée |
| `locale_id` / `locale_description` | Clés de nom et d'infobulle. **Indispensables** |
| `path_icon` | Icône dans la liste des statuts |
| `texture`, `sprite_list`, `animated`, `loop`, `animation_speed` | Le sprite affiché sur l'unité. `texture` est un nom brut cherché dans `effects/` |
| `offset_x`, `offset_y`, `scale`, `rotation_z`, `render_priority` | Positionnement et rendu |
| `opposite_traits`, `opposite_tags` | Traits et tags empêchant l'application |
| `action_on_receive`, `action_get_hit` | Callbacks à l'application et à la réception d'un coup |
| `sound_idle` | Événement sonore FMOD joué en boucle |

## Ton propre sprite

Attention au piège : `texture` n'est **pas** un chemin complet. La bibliothèque des statuts préfixe automatiquement par `effects/`, il ne faut donc fournir que le nom du fichier.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/
        └── fx_hello_status/
            ├── fx_hello_status_0.png
            ├── fx_hello_status_1.png
            └── fx_hello_status_2.png
```

```csharp
cursed.texture = "fx_hello_status";   // PAS "effects/fx_hello_status"
```

Si vous écrivez le dossier, le jeu cherchera `effects/effects/fx_hello_status`, ne trouvera rien et n'affichera aucun visuel.

`path_icon` sur le même asset est un champ différent et lui *est* un chemin complet : c'est la petite icône d'interface, pas le sprite collé sur l'unité.

## Faire en sorte qu'il *fasse* quelque chose

`action` s'exécute toutes les `action_interval` secondes tant que le statut dure. `action_finish` s'exécute à l'expiration, et `action_death` si l'unité meurt avec.

```csharp
cursed.action_interval = 1f;
cursed.action = (BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.changeHealth(-2);   // méthode publique parfaite pour des dégâts sur la durée
    return true;
};
```

## L'appliquer à une unité

La méthode évidente, `actor.addStatusEffect("hello_cursed")`, est déclarée `internal` dans l'assembly du jeu. Elle compile sans souci contre une `Assembly-CSharp.dll` **publicisée**, et un mod NML normal en a déjà une : NML compile votre `Code/*.cs` contre sa propre copie publicisée, c'est pourquoi chaque membre `internal` de ce guide compile chez vous. Vous ne la perdez que si vous compilez votre propre `.dll` dans Visual Studio contre l'assembly d'origine. Dans ce cas, la voie publique marche toujours :

```csharp
StatusAsset asset = AssetManager.status.get(HelloStatus.CURSED);
World.world.statuses.newStatus(actor, asset, 20f);   // 20s, ou 0 pour la durée de base de l'asset
```

Dans les arbres de comportement, des nœuds tout prêts existent : `new BehActorAddStatus("hello_cursed", 20f)` et `new BehActorRemoveStatus("hello_cursed")`.

## N'oublie pas les textes

```json Mods/HelloBox/Locales/en.json
{
  "status_title_hello_cursed": "Cursed",
  "status_description_hello_cursed": "Something very old is very annoyed at this creature."
}
```

Les clés correspondent à ce que vous avez configuré dans `locale_id` et `locale_description`. Respecter le format classique `status_title_<id>` / `status_description_<id>` garde vos fichiers clairs.

> [!TIP] Les statuts sont la solution pour les effets temporaires
> Tout ce qui est voué à s'estomper (un bonus de pouvoir divin, un débuff d'arme, un marqueur de cible) est un statut, pas un trait. Les traits sont permanents et se transmettent aux enfants, ce qui est rarement le but recherché :PES2_Uhm:.
