---
title: Traits de royaume
group: Contenu du jeu
subgroup: Traits et génétique
icon: :wbcrown:
order: 114
---

# Traits de royaume :wbcrown:

Un **trait de royaume (kingdom)** relève de la politique. Ni une croyance, ni une lignée : un décret promulgué par la couronne qui s'applique à l'ensemble du royaume.

Le jeu de base n'en use que pour une seule mécanique : les taux d'imposition. C'est donc le plus modeste et le plus désert des sept systèmes de traits, et par conséquent le terrain le plus propice pour implémenter du contenu inédit. Personne ne vous y conteste l'espace :wbsmirk:.

| | |
| --- | --- |
| Bibliothèque (library) | `AssetManager.kingdoms_traits` |
| Classe | `KingdomTrait` |
| Groupes | `AssetManager.kingdoms_traits_groups`, classe `KingdomTraitGroupAsset` |
| Propriétaire à l'exécution | `Kingdom`, dans `World.world.kingdoms` |
| Préfixe de localisation | `kingdom_trait_` |
| Dossier d'icônes par défaut | `ui/Icons/kingdom_traits/` |

> [!WARNING] Les stats de royaume n'atteignent pas les unités
> À l'instar de la religion, `kingdom.base_stats` n'est jamais fusionné dans un `Actor`. Les chiffres du royaume visibles en jeu découlent des **statistiques (stats) propres au roi** (`king.stats["cities"]` et similaires), non du bloc de traits du royaume.
>
> Un trait de royaume transforme donc l'État par ses champs dédiés et par le code, jamais via `base_stats`.

## Les champs de fiscalité

Les trois champs spécifiques aux traits de royaume, constituant l'intégralité de ce que le jeu de base réalise avec ce système :

```csharp
KingdomTrait trait = new KingdomTrait
{
    id = "hello_tax_rate_local_brutal",
    group_id = "local_tax",
    is_local_tax_trait = true,
    tax_rate = 0.9f
};
AssetManager.kingdoms_traits.add(trait);
trait.addOpposite("tax_rate_local_low");
```

| Champ | Rôle |
| --- | --- |
| `is_local_tax_trait` | Définit le taux d'imposition **local** du royaume |
| `is_tribute_tax_trait` | Définit le taux de **tribut** du royaume |
| `tax_rate` | Le taux en lui-même, sous forme de fraction décimale |

Le royaume recalcule les deux taux à partir de zéro dès que ses traits changent : il part de la valeur globale de `SimGlobals`, passe en revue ses traits et laisse chaque trait correspondant **écraser** la valeur.

> [!WARNING] Le dernier l'emporte : déclarez vos opposés
> Les traits fiscaux ne s'additionnent pas. Si un royaume cumule deux traits `is_local_tax_trait`, celui qui arrive en dernier dans l'itération écrasera silencieusement l'autre.
>
> Tous les traits fiscaux du jeu de base se déclarent mutuellement opposés pour cette exacte raison. Faites de même des deux côtés, sous peine de voir votre taux fiscal s'appliquer de façon aléatoire :PES5_HmmmmNo:.

## En enregistrer un proprement

```csharp Mods/HelloBox/Code/HelloKingdomTraits.cs
namespace HelloBox
{
    public static class HelloKingdomTraits
    {
        public const string LEVY = "hello_levy";

        public static void Initialize()
        {
            if (AssetManager.kingdoms_traits.has(LEVY)) return;

            KingdomTrait trait = new KingdomTrait
            {
                id = LEVY,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "miscellaneous",
                path_icon = "ui/Icons/iconHelloKingdom",
                spawn_random_trait_allowed = false,
                can_be_given = true,
                can_be_removed = true
            };

            AssetManager.kingdoms_traits.add(trait);
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed` n'est lu qu'une fois, au démarrage
> Les nouveaux royaumes tirent leurs traits de départ dans une réserve que `BaseTraitLibrary.linkAssets()` construit pendant le chargement du jeu, avant que votre mod n'existe. Activer l'option sur votre trait ne change rien à lui seul : votre trait n'est jamais dans cette réserve et n'apparaît jamais par hasard. Ajoutez-le vous-même, pondéré comme le fait le vanilla :
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.kingdoms_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` est `protected`, donc ceci compile contre l'assembly publicisé avec lequel NML compile déjà votre mod. `spawn_random_rate` vaut `5` par défaut : augmentez-le et le trait apparaît plus souvent.

## Créer une politique qui agit concrètement

Puisque `base_stats` est hors de cause, un trait de royaume fait ses preuves de deux manières. Les deux demandent plus de travail qu'un nombre, et les deux en valent la peine.

**Une décision (decision)**, la démarche élégante :

```csharp
trait.addDecision("some_decision_id");
// ids are resolved at startup, before your mod: resolve yours
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("some_decision_id") };
```

**Un patch Harmony consultant le trait**, la méthode privilégiée pour bâtir un véritable système législatif. Patchez la méthode consultée par la couronne et vérifiez-y les traits du royaume :

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;
        if (!__instance.kingdom.hasTrait(HelloKingdomTraits.LEVY)) return;

        __result *= 1.35f;
    }
}
```

C'est la structure universelle pour tout décret de royaume non fiscal : le trait fait office d'interrupteur, et votre patch prend en charge la mécanique. Voir **[Patchs Harmony](#/nml/harmony-patches)**.

## Les groupes vanilla

`tribute` · `local_tax` · `miscellaneous` · `fate`

Quatre groupes au total, dont deux forment la paire fiscale. Si vous concevez plusieurs décrets, créez-leur un onglet dédié, voir **[Groupes de traits & onglets](#/nml/trait-groups)**, avec `AssetManager.kingdoms_traits_groups` et `KingdomTraitGroupAsset`.

## Les textes

```json Mods/HelloBox/Locales/en.json
{
  "kingdom_trait_hello_levy": "Levy",
  "kingdom_trait_hello_levy_info": "Everyone who can carry a spear, carries a spear."
}
```

## Distribuer le trait

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addKingdomTrait(HelloKingdomTraits.LEVY);
```

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    kingdom.addTrait(HelloKingdomTraits.LEVY, pRemoveOpposites: true);
}
```

L'asset de royaume ayant servi à générer une faction constitue une entité distincte, voir **[Royaumes & factions](#/nml/kingdoms)**.

> [!TIP] La pièce vide
> Six des sept systèmes de traits débordent de contenu vanilla autour duquel vous devez slalomer. Celui-ci ne compte que cinq traits. Si vous souhaitez un mod qui semble natif sans risquer le moindre conflit, une série d'édits royaux est la voie royale :PES2_Cash:.
