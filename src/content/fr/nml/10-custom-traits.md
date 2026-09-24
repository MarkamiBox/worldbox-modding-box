---
title: Traits personnalisés
group: Contenu du jeu
subgroup: Traits et génétique
icon: :wbstrongminded:
order: 100
---

# Traits personnalisés :wbstrongminded:

Un trait est une étiquette permanente apposée sur une créature : *brave*, *rapide*, *immortel*. Il s'affiche dans l'inspecteur, peut modifier les statistiques de l'unité, exécuter du code à sa naissance, lors d'un coup reçu ou à sa mort, et les enfants peuvent en hériter.

C'est aussi l'élément le plus simple et accessible à créer dans tout le jeu, c'est pourquoi c'est le premier mod de tout le monde. Pas le mien : mon premier mod était une surcouche autour du mod de quelqu'un d'autre, ce qui est une forme de triche à part entière :trollface:.

## Préfixe toujours tes identifiants

Chaque asset dans WorldBox vit dans une liste unique indexée par son `id`. Si vous enregistrez `fast` et qu'un autre mod enregistre aussi `fast`, le second **écrase** le premier et le log se contente d'une ligne d'avertissement que personne ne lit jamais.

Donc : `hello_swift`, pas `swift`. Nom court du mod, tiret du bas, nom de l'élément. Faites cela pour les traits, objets, bâtiments, pouvoirs, statuts, pour absolument tout :aPES4_Noted:.

## Le trait

```csharp Mods/HelloBox/Code/HelloTraits.cs
namespace HelloBox
{
    public static class HelloTraits
    {
        // L'identifiant écrit une fois pour toutes. Tous les autres fichiers feront référence
        // à HelloTraits.SWIFT, transformant une faute de frappe en erreur de compilation.
        public const string SWIFT = "hello_swift";

        public static void Initialize()
        {
            // Ne jamais enregistrer deux fois le même id. La bibliothèque enregistre une erreur et l'écrase.
            if (AssetManager.traits.has(SWIFT)) return;

            ActorTrait swift = new ActorTrait
            {
                id = SWIFT,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                path_icon = "ui/Icons/iconSpeed",   // une icône vanilla, remplacez-la plus tard par la vôtre
                group_id = "physique",              // dans quel onglet du livre des traits il se range
                rate_birth = 0,                     // 0 = n'apparaît jamais spontanément à la naissance
                can_be_given = true,                // le joueur peut l'attribuer dans l'éditeur
                can_be_removed = true,
                can_be_cured = false
            };

            // add() enregistre le trait ET alloue son bloc de statistiques. Les deux, dans cet ordre.
            AssetManager.traits.add(swift);

            swift.base_stats["speed"] = 20f;
            swift.base_stats["attack_speed"] = 10f;
            swift.base_stats["damage"] = 5;
        }
    }
}
```

Et une ligne dans `Main.cs` :

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");
    HelloTraits.Initialize();
}
```

### Ce que fait chaque partie

- **`AssetManager.traits`** : La bibliothèque regroupant tous les traits de créature du jeu, vanilla comme moddés. `has`, `get`, `add` et `clone` sont les quatre méthodes que vous manipulerez sur toutes les bibliothèques du jeu.
- **`path_icon`** : La petite image dans l'inspecteur. Un *chemin*, pas un fichier avec extension. Voir **[Sprites et ressources](#/nml/sprites-and-resources)**. Le jeu ne renseigne ceci automatiquement que pendant la création de ses propres bibliothèques de base, votre trait sera donc invisible si vous ne le définissez pas.
- **`needs_to_be_explored`** : `true` par défaut, donc le trait reste verrouillé dans le livre des connaissances jusqu'à ce que le joueur le trouve dans un monde. `false` le rend disponible dès la première seconde. HelloBox le met partout, pour que tu voies ce que tu as construit sans le chercher.
- **`group_id`** : L'onglet sous lequel il apparaît dans le livre des traits. La liste complète est donnée plus bas.
- **`rate_birth`** : La probabilité qu'un nouveau-né l'obtienne naturellement. `0` signifie "uniquement si accordé explicitement".
- **`can_be_given` / `can_be_removed`** : Détermine si le joueur peut l'ajouter ou le retirer dans l'éditeur de traits. Les deux valent `true` par défaut ; passez-en un à `false` pour un trait permanent ou réservé à votre propre code.
- **`base_stats[...]`** : Les bonus de statistiques. La liste complète est disponible sur la page **[Référence des statistiques](#/nml/stats)**.

> [!WARNING] Les statistiques se placent **après** `add()`, toujours
> Un `ActorTrait` fraîchement instancié n'a pas de bloc de stats. La bibliothèque l'alloue à l'intérieur de `add()`. Si vous touchez à `base_stats` avant cette ligne, vous récolterez le crash le plus fréquent du modding WorldBox :
> `NullReferenceException: Object reference not set to an instance of an object`
>
> Même règle pour les statuts, objets, bâtiments et créatures. La seule exception est `clone()`, qui appelle `add()` pour vous.

> [!TIP] Le même interrupteur existe sur presque tout ce que tu crées
> `needs_to_be_explored` vit dans la classe de base que partagent tous les assets déblocables, donc il marche sur les acteurs, les sept types de traits, les objets, les modificateurs et les lois du monde. Pouvoirs divins, statuts, bâtiments, drops, nuages, tiles et projectiles n'ont aucune étape de découverte :wbsmirk:.

### Les groupes de traits vanilla

`group_id` doit obligatoirement être un groupe existant, sans quoi votre trait ne s'affichera nulle part :

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

Vous préférez créer votre propre onglet ? Consultez **[Groupes de traits et onglets](#/nml/trait-groups)**.

## Les textes et la localisation

Sans traductions, votre trait apparaîtra en jeu sous la forme de sa clé brute `trait_hello_swift`, ce qui a exactement l'air aussi professionnel que ça en a l'air :pepeclown:. Créez `Locales/fr.json` :

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money."
}
```

La clé ne correspond **pas** à l'identifiant nu. Chaque type de trait le préfixe par son propre mot-clé :

| Type de trait | Clé de nom | Clé d'infobulle |
| --- | --- | --- |
| Actor trait | `trait_<id>` | `trait_<id>_info` |
| Culture trait | `culture_trait_<id>` | `culture_trait_<id>_info` |
| Religion trait | `religion_trait_<id>` | `religion_trait_<id>_info` |
| Subspecies trait | `subspecies_trait_<id>` | `subspecies_trait_<id>_info` |
| Clan trait | `clan_trait_<id>` | `clan_trait_<id>_info` |
| Language trait | `language_trait_<id>` | `language_trait_<id>_info` |
| Kingdom trait | `kingdom_trait_<id>` | `kingdom_trait_<id>_info` |

Il existe également une deuxième ligne de description, `<prefix>_<id>_info_2`, pour les traits qui en ont besoin.

## Ta propre icône

`path_icon` est un chemin relatif, et votre fichier PNG se place exactement à cet endroit dans le dossier `GameResources/` de votre mod. Aucune extension dans la chaîne de caractères.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSwift.png
```

```csharp
swift.path_icon = "ui/Icons/iconHelloSwift";
```

Les icônes de traits sont petites et dessinées en 32x32. Placez vos PNG dans un sous-dossier à votre nom si vous préférez : `ui/Icons/hellobox/iconSwift` fonctionne tout aussi bien, il suffit que la chaîne corresponde.

Les six autres systèmes de traits possèdent chacun leur dossier vanilla respectif (`ui/Icons/culture_traits/`, `religion_traits/`, `clan_traits/`, etc.). Vous n'êtes pas obligés de les utiliser, mais ranger vos fichiers aux côtés des originaux simplifie leur gestion. Voir **[Sprites et ressources](#/nml/sprites-and-resources)**.

## Faire en sorte qu'un trait *fasse* quelque chose

Les statistiques sont statiques. Un trait peut également exécuter votre code à quatre moments précis :

```csharp
// toutes les quelques secondes, tant que l'unité est en vie
swift.special_effect_interval = 3f;
swift.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreStamina(5);
    return true;
};

// à la mort de l'unité
swift.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };

// à la naissance de l'unité
swift.action_birth = (BaseSimObject pSelf, WorldTile pTile) => { return true; };

// quand l'unité reçoit un coup
swift.action_get_hit = (BaseSimObject pSelf, BaseSimObject pAttacker, WorldTile pTile) => { return true; };
```

Deux règles d'or : **vérifiez le null et vérifiez que l'unité est bien vivante en tout premier lieu**, puis retournez `false` si vous n'avez rien fait. Ces délégués tournent en boucle sur chaque créature porteuse du trait.

## Opposés et exclusions mutuelles

```csharp
swift.addOpposite("slow");                            // les deux ne peuvent jamais coexister
swift.traits_to_remove_ids = new string[] { "fat" };  // obtenir ce trait retire automatiquement celui-ci
```

## Donner le trait à une unité

```csharp
actor.addTrait(HelloTraits.SWIFT);

if (actor.hasTrait(HelloTraits.SWIFT))
{
    // ...
}
```

> [!WARNING] `spawn_random_trait_allowed` n'est lu qu'une fois, au démarrage
> Les nouvelles unités tirent leurs traits de départ dans une réserve que `BaseTraitLibrary.linkAssets()` construit pendant le chargement du jeu, avant que votre mod n'existe. Activer l'option sur votre trait ne change rien à lui seul : votre trait n'est jamais dans cette réserve et n'apparaît jamais par hasard. Ajoutez-le vous-même, pondéré comme le fait le vanilla :
>
> ```csharp
> swift.spawn_random_trait_allowed = true;
> AssetManager.traits._pot_allowed_to_be_given_randomly.AddTimes(swift.spawn_random_rate, swift);
> ```
>
> `_pot_allowed_to_be_given_randomly` est `protected`, donc ceci compile contre l'assembly publicisé avec lequel NML compile déjà votre mod. `spawn_random_rate` vaut `5` par défaut : augmentez-le et le trait apparaît plus souvent.

## Vérifier que cela fonctionne

Lancez le jeu, inspectez une créature, ouvrez l'éditeur de traits et consultez l'onglet `physique`. Il n'y est pas ? Les logs savent pourquoi, et l'explication est quasi systématiquement l'une de ces trois : `can_be_given` est à false, `group_id` n'existe pas, ou `path_icon` pointe dans le vide :wbreally:.

## Les six autres types de traits

Les traits d'acteur ne sont que l'un des **sept** systèmes de traits. Chacun dispose de sa propre bibliothèque, de ses propres groupes et de sa propre entité d'ancrage, et tous calquent exactement le schéma présenté ici. Seuls le nom de la classe, la bibliothèque et le préfixe de localisation changent.

| Système | Appartient à | Page |
| --- | --- | --- |
| Actor | une créature unique | cette page |
| Culture | une culture, partagée par ses villes | **[Traits de culture](#/nml/culture-traits)** |
| Religion | une religion et ses fidèles | **[Traits de religion](#/nml/religion-traits)** |
| Subspecies | une branche d'une espèce | **[Traits de sous-espèce](#/nml/subspecies-traits)** |
| Clan | une lignée généalogique | **[Traits de clan](#/nml/clan-traits)** |
| Language | une langue et ses locuteurs | **[Traits de langue](#/nml/language-traits)** |
| Kingdom | la politique d'un royaume | **[Traits de royaume](#/nml/kingdom-traits)** |

Choisissez le porteur avant d'écrire le trait. "Les elfes tirent mieux à l'arc" est un trait de culture s'il doit essaimer avec leurs villes, un trait de sous-espèce s'il doit se transmettre par hérédité, et un trait d'acteur s'il appartient à une créature en particulier. Se tromper là-dessus, c'est la différence entre un mod qui transforme un monde en une heure et un mod qui ne fait strictement rien :PES_ThinkAboutIt:.
