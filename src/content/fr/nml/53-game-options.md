---
title: Options de jeu
group: Contenu du jeu
subgroup: Pouvoirs divins et interface
icon: :wbsettingsgear:
order: 206
---

# Options de jeu :wbsettingsgear:

Dans **[Réglages du mod](#/nml/mod-config)**, vous avez vu la propre fenêtre de configuration de NML (`default_config.json`), qui donne à votre mod un onglet de réglages propre et séparé.

WorldBox possède aussi son propre système d'options natif : `AssetManager.options_library`, soutenu par `PlayerConfig`. C'est le système qui alimente la fenêtre de réglages vanilla, les interrupteurs développeur et les boutons de bascule des pouvoirs divins. À côté se trouve `AssetManager.time_scales`, qui contrôle la vitesse à laquelle le monde avance.

## Enregistrer une option native

Les options de `AssetManager.options_library` sont des instances d'`OptionAsset` :

```csharp Mods/HelloBox/Code/HelloOptions.cs
namespace HelloBox
{
    public static class HelloOptions
    {
        public const string TURBO_HARVEST = "hello_turbo_harvest";

        public static void Initialize()
        {
            if (AssetManager.options_library.has(TURBO_HARVEST)) return;

            OptionAsset option = new OptionAsset
            {
                id = TURBO_HARVEST,
                type = OptionType.Bool,
                default_bool = false,
                translation_key = "option_hello_turbo_harvest",
                translation_key_description = "option_desc_hello_turbo_harvest",
                action = (OptionAsset pAsset) =>
                {
                    bool active = IsTurboActive();
                    Main.Log("Turbo harvest is now: " + active);
                }
            };

            AssetManager.options_library.add(option);

            // Registering the asset does NOT automatically populate PlayerConfig.dict.
            // Ensure the value exists so your code can read it immediately:
            if (!PlayerConfig.dict.ContainsKey(TURBO_HARVEST))
            {
                PlayerConfig.dict.Add(TURBO_HARVEST, new PlayerOptionData
                {
                    name = TURBO_HARVEST,
                    boolVal = option.default_bool
                });
            }
        }

        public static bool IsTurboActive()
        {
            if (PlayerConfig.dict.TryGetValue(TURBO_HARVEST, out PlayerOptionData data))
            {
                return data.boolVal;
            }
            return false;
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "option_hello_turbo_harvest": "Turbo Harvest",
  "option_desc_hello_turbo_harvest": "Settlers gather crops at triple speed."
}
```

### Les champs sur OptionAsset

| Champ | Ce qu'il fait |
| --- | --- |
| `id` | Identifiant unique de l'option |
| `type` | `OptionType.Bool`, `OptionType.Int`, ou `OptionType.String` |
| `default_bool` / `default_int` / `default_string` | La valeur par défaut quand elle n'est pas définie |
| `translation_key` | Clé de localisation pour le titre de l'option |
| `translation_key_description` | Clé de localisation pour l'infobulle |
| `action` | Délégué de rappel (`ActionOptionAsset`) déclenché quand l'option change |
| `reset_to_default_on_launch` | Si cette option doit revenir à sa valeur par défaut au démarrage du jeu |
| `computer_only` | Si vrai, affichée seulement sur les versions PC |

> [!WARNING] OptionAsset n'est pas du stockage
> `OptionAsset` décrit seulement les métadonnées et le rappel de l'option. La valeur réelle que le joueur a basculée vit dans `PlayerConfig.dict[id]`. Si vous ajoutez un `OptionAsset` sans aussi insérer un `PlayerOptionData` correspondant dans `PlayerConfig.dict`, tout code qui tente d'indexer `PlayerConfig.dict[id]` lève une `KeyNotFoundException` jusqu'à ce que la fenêtre de réglages soit sauvegardée !

## Lier avec des boutons de bascule

Les options natives brillent quand elles sont associées à des boutons de bascule `GodPower` sur la barre de pouvoirs.

Comme expliqué dans **[Onglets et boutons de pouvoir](#/nml/power-buttons)**, définir `power.toggle_name = HelloOptions.TURBO_HARVEST` lie directement un bouton à l'état de votre option. Au clic, le jeu bascule `PlayerConfig.dict[toggle_name].boolVal`, met à jour la mise en surbrillance visuelle du bouton, et déclenche le rappel de votre option.

## Vitesse de simulation et échelles de temps

WorldBox contrôle la vitesse de simulation du jeu via `AssetManager.time_scales` (`WorldTimeScaleLibrary`). Chaque réglage de vitesse est un `WorldTimeScaleAsset` :

```csharp Mods/HelloBox/Code/HelloSpeed.cs
namespace HelloBox
{
    public static class HelloSpeed
    {
        public const string HYPER = "hello_hyper_speed";

        public static void Initialize()
        {
            if (AssetManager.time_scales.has(HYPER)) return;

            WorldTimeScaleAsset hyper = new WorldTimeScaleAsset
            {
                id = HYPER,
                locale_key = "speed_hello_hyper",
                multiplier = 10f,          // 10x world simulation speed
                ticks = 2,                 // Simulation sub-ticks per frame
                conway_ticks = 2,          // CA ticks per frame (fire, acid, temperature)
                path_icon = "ui/Icons/iconClockX5"
            };

            AssetManager.time_scales.add(hyper);
        }
    }
}
```

| Champ | Ce qu'il fait |
| --- | --- |
| `multiplier` | Multiplicateur de vitesse visuelle et de monde (`1f` = normal, `0.5f` = ralenti) |
| `ticks` | Combien de passes de simulation tournent à chaque frame |
| `conway_ticks` | Combien de passes d'automate cellulaire (propagation des tuiles, lave, glace) tournent par frame |
| `locale_key` | Clé de traduction affichée au survol du bouton horloge |
| `path_icon` | Chemin de la texture d'icône à l'intérieur de `ui/Icons/` |

Les vitesses vanilla sont `slow_mo` (0.5x), `x1` (1x), `x2` (2x), `x3` (3x), `x4` (4x), et `x5` (5x). La vitesse sonique (vitesse Greg dans les options de débogage) pousse les tics de simulation encore plus haut.

Pour activer une vitesse par code :

```csharp
// Smoothly switch world clock to your speed asset:
WorldTimeScaleAsset target = AssetManager.time_scales.get(HelloSpeed.HYPER);
if (target != null)
{
    Config.time_scale_asset = target;
}
```

## Quelle voie de réglages choisir ?

| Besoin | Voie recommandée |
| --- | --- |
| Configurations propres au mod (multiplicateurs de dégâts, nombres d'apparitions, fonctionnalités basculables) | **[Réglages du mod](#/nml/mod-config)** (`default_config.json`). Ça vit sur la carte de votre mod, gère proprement les nombres/chaînes, et ne pollue pas l'UI du jeu de base |
| Interrupteurs liés à des boutons de la barre d'outils | `OptionAsset` natif + `GodPower.toggle_name` |
| Vitesses de jeu ou cadences de simulation personnalisées | `AssetManager.time_scales` (`WorldTimeScaleAsset`) |

Suite : **[Messages et journal du monde](#/nml/messages-and-world-log)** pour afficher des indices et enregistrer l'histoire du monde.
