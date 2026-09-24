---
title: Traits de clan
group: Contenu du jeu
subgroup: Traits et génétique
icon: :wbclanroses:
order: 110
---

# Traits de clan :wbclanroses:

Un **clan** est une lignée : une famille devenue suffisamment puissante pour constituer une entité propre, avec sa bannière, sa couleur et sa renommée. Un trait de clan est ce que cette lignée transporte en héritage.

Les traits de clan sont ce qui se rapproche le plus d'un super-pouvoir héréditaire dans le jeu, et ils représentent l'unique système de traits doté d'une **différenciation mâle / femelle** intégrée.

| | |
| --- | --- |
| Bibliothèque | `AssetManager.clan_traits` |
| Classe | `ClanTrait` |
| Groupes | `AssetManager.clan_trait_groups`, classe `ClanTraitGroupAsset` |
| Propriétaire à l'exécution | `Clan`, dans `World.world.clans` |
| Préfixe de localisation | `clan_trait_` |
| Dossier d'icônes par défaut | `ui/Icons/clan_traits/` |

## En enregistrer un

```csharp Mods/HelloBox/Code/HelloClan.cs
namespace HelloBox
{
    public static class HelloClan
    {
        public const string OLD_BLOOD = "hello_old_blood";

        public static void Initialize()
        {
            if (AssetManager.clan_traits.has(OLD_BLOOD)) return;

            ClanTrait trait = new ClanTrait
            {
                id = OLD_BLOOD,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloClan",
                rarity = Rarity.R1_Rare
            };

            AssetManager.clan_traits.add(trait);

            trait.base_stats["multiplier_health"] = 0.15f;
            trait.base_stats["armor"] = 4;
            trait.base_stats.addTag("immunity_cold");
        }
    }
}
```

Les `base_stats` de clan sont fusionnées dans chaque membre du clan. Contrairement à la religion, il s'agit donc d'un véritable système de statistiques. Consultez l'ordre de fusion dans la **[Référence des stats](#/nml/stats)**.

## La différenciation mâle / femelle

Les deux champs exclusifs que ne possède aucune autre classe de trait :

```csharp
trait.base_stats["health"] = 20;           // chaque membre
trait.base_stats_male["damage"] = 6;       // mâles uniquement
trait.base_stats_female["intelligence"] = 4;   // femelles uniquement
```

`Actor.updateStats()` fusionne `clan.base_stats`, puis `clan.base_stats_male` **ou** `clan.base_stats_female` selon le sexe de l'unité. Les deux blocs additionnels existent dès l'instanciation sans être alloués dans `add()` ; vous pouvez donc y écrire à n'importe quel moment.

## Décisions : ce qu'un clan *fait*

Les traits de clan du jeu de base reposent principalement sur des décisions plutôt que sur des actions, car un clan est avant tout une structure sociale :

```csharp
trait.addDecision("banish_unruly_clan_members");
trait.addOpposite("hello_new_blood");
```

Une décision est un choix d'IA dans `AssetManager.decisions_library`. Deux traits de clan vanilla, `blood_pact` et `deathbound`, sont en réalité le même trait pourvu d'une décision différente et sont déclarés opposés l'un à l'autre. C'est un schéma très pertinent à reproduire : deux traits, un axe unique, mutuellement exclusifs.

## Crochets de combat et d'effets

```csharp
// à chaque coup porté par un membre du clan
trait.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null) return false;
    return true;
};

// sur minuterie, pour chaque membre du clan
trait.special_effect_interval = 2f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreHealth(1);
    return true;
};
```

Protégez systématiquement vos références contre les valeurs nulles et retournez `false` si aucune action n'a été exécutée. Ces méthodes s'exécutent pour chaque membre de chaque clan détenteur du trait.

## Verrouillé derrière un succès

Plusieurs traits de clan de vanilla constituent des récompenses plutôt que des options par défaut :

```csharp
trait.setUnlockedWithAchievement("achievementSegregator");
```

Un trait verrouillé existe et fonctionne normalement ; le joueur ne peut simplement pas le sélectionner dans l'éditeur avant d'avoir validé le succès. Notez que `BaseTraitLibrary` applique également automatiquement `rarity = R3_Legendary` à tout élément verrouillé de la sorte, pour que votre récompense ait fière allure :gold_star:.

## Les groupes vanilla

`spirit` · `mind` · `body` · `chaos` · `harmony` · `fate` · `special`

Pour créer votre propre onglet : voir **[Groupes de traits & onglets](#/nml/trait-groups)**, avec `AssetManager.clan_trait_groups` et `ClanTraitGroupAsset`.

## Les textes

```json Mods/HelloBox/Locales/en.json
{
  "clan_trait_hello_old_blood": "Old Blood",
  "clan_trait_hello_old_blood_info": "Their great-grandparents were also difficult to kill."
}
```

## Distribuer le trait

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addClanTrait(HelloClan.OLD_BLOOD);
```

```csharp
foreach (Clan clan in World.world.clans)
{
    if (clan == null || clan.isRekt()) continue;

    clan.addTrait(HelloClan.OLD_BLOOD, pRemoveOpposites: true);
}
```

Le clan d'une unité se trouve dans `actor.clan`, et `actor.hasClan()` indique si l'unité en possède un ; bon nombre d'unités n'en rejoignent jamais.

> [!TIP] Les clans sont restreints, faites-vous plaisir
> Une culture recouvre un continent entier ; un clan se résume à une famille, et `limit_clan_members` plafonne son effectif. Un trait de clan peut être bien plus puissant qu'un trait culturel sans pour autant briser l'équilibre du monde, ce qui fait des clans le terrain de jeu idéal pour des mécaniques spectaculaires :PES5_Menace:.

## Nouveaux clans obtenant un trait d'eux-mêmes

En plus de l'attribuer vous-même, un trait de clan peut définir `spawn_random_trait_allowed` pour être tiré au sort lors de la formation d'un nouveau clan, de la même manière qu'une culture tire ses traits de départ. Le même piège que sur toutes les autres pages de traits :

> [!WARNING] `spawn_random_trait_allowed` n'est lu qu'une seule fois, au démarrage
> Les nouveaux clans tirent leurs traits de départ d'un pool que `BaseTraitLibrary.linkAssets()` construit pendant le chargement du jeu, avant que votre mod n'existe. Définir le drapeau sur votre trait ne change rien en soi : votre trait n'est jamais dans ce pool et n'apparaît jamais par hasard sur un nouveau clan. Ajoutez-le vous-même, pondéré comme le fait le jeu vanilla :
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.clan_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` est `protected`, donc cela compile contre l'assembly rendue publique avec laquelle NML compile déjà votre mod. `spawn_random_rate` vaut `5` par défaut : augmentez-le et le trait apparaîtra plus souvent.
