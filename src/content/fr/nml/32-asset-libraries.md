---
title: Bibliothèques d'assets
group: Contenu du jeu
subgroup: Architecture et statistiques
icon: :wbbrain:
order: 90
---

# Bibliothèques d'assets :wbbrain:

Avant que les pages suivantes ne prennent tout leur sens, vous devez assimiler celle-ci. Absolument chaque élément dans WorldBox (un trait, une arme, un bâtiment (building), une tuile (tile), un nuage (cloud), un royaume (kingdom)) est un **asset** résidant dans une **bibliothèque** (library), et chaque bibliothèque du jeu partage la même classe et les quatre mêmes méthodes.

Apprenez-les une bonne fois ici, et les trente pages suivantes se résumeront à : « quelle bibliothèque, quels champs ».

## Ce qu'est une bibliothèque

```csharp
public abstract class AssetLibrary<T> : BaseAssetLibrary where T : Asset
{
    public List<T> list;                 // tout le contenu, dans l'ordre
    public Dictionary<string, T> dict;   // tout le contenu, indexé par id
}
```

C'est tout. Une liste et un dictionnaire, tous deux publics, prêts à être consultés et modifiés par votre mod. `AssetManager` en gère 129. Consultez **[Toutes les bibliothèques d'assets](#/nml/asset-index)** pour l'inventaire complet.

## Les quatre méthodes

```csharp
AssetManager.traits.has("hello_swift");            // cet id est-il déjà pris ?
AssetManager.traits.get("hello_swift");            // le récupérer, ou null
AssetManager.traits.add(myTrait);                  // enregistrer un nouvel asset
AssetManager.traits.clone("hello_new", "strong");   // copier un existant et enregistrer la copie
```

### `has(id)`

Renvoie `true` si l'id est déjà enregistré. **La première ligne de chaque méthode `Initialize()` que vous écrirez doit être formulée ainsi** :

```csharp
if (AssetManager.traits.has(SWIFT)) return;
```

Sans cela, tout rechargement de mod enregistrera tout en double.

### `get(id)`

Renvoie l'asset actif en mémoire, ou `null` s'il n'existe pas. Cette méthode ne lève **aucune** exception, de sorte que l'erreur de référence nulle se manifestera bien plus loin :

```csharp
ActorTrait strong = AssetManager.traits.get("strong");
if (strong == null) return;   // toujours. absolument à chaque fois.
```

Le fait que `get` renvoie l'objet *vivant* est l'élément le plus puissant de cette page. Cela signifie que vous pouvez modifier le contenu vanilla sans avoir à le remplacer :

```csharp
// Rendre les dragons vanilla plus résistants, sans toucher au reste de leurs paramètres.
ActorAsset dragon = AssetManager.actor_library.get("dragon");
if (dragon != null) dragon.base_stats["health"] += 500;
```

### `add(asset)`

Enregistre un nouvel asset. Trois opérations internes essentielles s'y produisent :

1. **Si l'id est déjà pris, l'ancien asset est évincé et le vôtre prend sa place**, avec cette mention dans les logs :
   ```text
   <e>AssetLibrary<ActorTrait></e>: duplicate asset - overwriting...
   ```
   C'est ainsi qu'un mod en écrase silencieusement un autre. Préfixez toujours vos ids.
2. La méthode `create()` est exécutée sur l'asset.
3. **La bibliothèque alloue le dictionnaire `base_stats`** (et `base_stats_meta` le cas échéant). Voilà pourquoi la consigne absolue de ce guide est « les statistiques (stats) après `add()` ».

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };

AssetManager.traits.add(swift);        // <- alloue le bloc de stats
swift.base_stats["speed"] = 20f;       // <- sécurisé uniquement après cette ligne
```

Inversez cet ordre et vous obtiendrez le crash le plus fréquent du modding WorldBox :

```text
NullReferenceException: Object reference not set to an instance of an object
```

### `clone(newId, sourceId)`

Copie chaque champ sérialisable de `sourceId` dans un objet flambant neuf, lui attribue `newId` **et appelle `add()` dessus**. Renvoie la copie créée.

```csharp
BuildingAsset shrine = AssetManager.buildings.clone("hello_shrine", "temple_human");
shrine.max_houses = 0;                     // modifiez ce qui vous intéresse
shrine.base_stats["health"] = 200;         // déjà alloué, car add() s'est exécuté
```

> [!WARNING] N'appelez jamais `add()` après `clone()`
> Un second `add()` supprime la première copie, génère un message `duplicate asset overwriting...` et la rajoute. Cela fonctionne, mais pollue inutilement les logs et masque les véritables erreurs.

Le clonage est l'approche par défaut recommandée pour tout ce qui dépasse une dizaine de champs : bâtiments, créatures, équipements, tuiles. Vous héritez d'une base fonctionnelle éprouvée et n'avez à comprendre que les champs que vous retouchez.

## Modèles

Les bibliothèques conservent des assets semi-finis dont l'id débute par `$` ou `_`. Ils sont enregistrés dans `dict` mais exclus de `list`, n'apparaissant ainsi jamais directement en jeu : ils n'existent que pour être clonés.

```csharp
AssetManager.actor_library.clone("hello_sprite", "$civ_advanced_unit$");
AssetManager.items.clone("hello_sword_ember", "$sword");
AssetManager.buildings.clone("hello_shrine", "$city_building$");
AssetManager.resources.clone("hello_cake", "$TEMPLATE_FOOD$");
AssetManager.kingdoms.clone("hello_sprites", "$TEMPLATE_CIV$");
```

Un modèle constitue presque toujours une bien meilleure base de clonage qu'un asset fini, car vous n'héritez pas de l'identité du donateur avec sa logique interne. L'exception concerne les graphismes : cloner `human` vous fournit des sprites humains, et une créature visible surpasse toujours une créature parfaite mais invisible :PES4_AlrightThen:.

## Lister le contenu existant

La manière la plus rapide d'identifier les ids disponibles pour un clonage est de les afficher dans la console :

```csharp
foreach (BuildingAsset asset in AssetManager.buildings.list)
{
    LogInfo(asset.id);
}
```

Deux lignes, et vous n'aurez plus jamais à deviner un id au hasard. `list` ignore les modèles ; `dict.Keys` les inclut tous.

## Réordonner les éléments

`list` est une `List<T>` ordinaire, et le jeu affiche les groupes et catégories dans l'ordre de cette liste. Vous pouvez donc positionner votre asset précisément là où vous le désirez :

```csharp
ItemGroupAsset group = AssetManager.item_groups.get("hello_relics");
int index = AssetManager.item_groups.list.FindIndex(g => g.id == "amulet");

if (group != null && index != -1)
{
    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## Quand votre code s'exécute-t-il

Le jeu construit les 129 bibliothèques au démarrage, puis exécute `post_init()` dessus, **puis** NML charge votre mod. Deux conséquences sur lesquelles on trébuche sans arrêt, moi compris :

- **Tout ce qu'une bibliothèque fait automatiquement dans `post_init` a déjà eu lieu.** Les traits d'acteur, par exemple, y reçoivent un `path_icon` par défaut. Pas le vôtre, parce que votre trait n'existait pas encore. Définissez-le vous-même.
- **Chaque asset vanilla existe déjà quand votre `OnModLoad` s'exécute.** Donc `get("human")` marche, `clone(..., "human")` marche, et modifier le contenu vanilla sur place marche. Vous n'êtes jamais trop tôt.

> [!NOTE] Patcher ces méthodes ne touche pas au contenu vanilla
> `has`, `get`, `add`, `clone` et `post_init` tournent tous sur les 129 bibliothèques pendant le démarrage du jeu, avant que NML ne charge le moindre mod. Un patch Harmony sur l'une d'elles n'affecte que les appels faits *après* le chargement de votre mod. Il ne touche jamais l'enregistrement vanilla déjà effectué à ce moment-là. Vous voulez un contenu vanilla différent ? Changez-le après coup avec `get()`, comme le fait le reste de cette page.

## Trois façons de se planter

Les trois compilent, les trois ont l'air raisonnables, et je les ai toutes faites.

### Supprimer un asset vanilla pour ajouter votre propre version

```csharp
// don't
AssetManager.traits.list.RemoveAll(a => a.id == "strong");
AssetManager.traits.add(myStrong);
```

`RemoveAll` ne touche que `list`. `dict` contient toujours l'ancien `strong`, donc `add()` voit un doublon, enregistre `duplicate asset - overwriting...` et le remplace quand même, ce qui veut dire que la première ligne n'a servi à rien. Le vrai problème, c'est tout ce qui a récupéré l'ancien objet au démarrage : des champs statiques comme `WorldLawLibrary.world_law_hunger`, et chaque asset qui s'y est lié dans `linkAssets()`, avant même que votre mod n'existe. Ils gardent l'ancien. Maintenant il existe deux assets avec le même id, et lequel le jeu utilise dépend de qui a mis quoi en cache :PESgn_Really:.

Pour changer du contenu vanilla, modifiez l'objet déjà présent :

```csharp
ActorTrait strong = AssetManager.traits.get("strong");
if (strong == null) return;
strong.base_stats["damage"] = 10f;   // same object, every cached reference sees it
```

### Modifier un clone et changer l'original aussi

`clone()` copie les listes dans de nouvelles listes et clone tout ce qui est `ICloneable` (comme `base_stats`). Tout autre objet est copié **par référence**. `MapGenTemplate.values`, par exemple, est une classe simple : clonez `continent`, changez un drapeau sur le `values` de votre copie, et les continents vanilla changent avec lui. Quand un champ contient un objet, donnez à votre clone un nouvel objet avant de le modifier. **[Génération de carte](#/nml/map-generation)** a le cas concret.

### Cloner un asset ajouté par un autre mod

`clone("hello_new", "their_id")` fait `dict[pFrom]` sans aucune vérification. Si l'autre mod n'a pas encore exécuté son `Initialize()`, ou n'est pas installé, c'est une `KeyNotFoundException` et tout votre `OnModLoad` s'arrête à cette ligne. Ne comptez pas sur l'ordre des dossiers. Déclarez la dépendance et vérifiez quand même que l'asset existe avant de le cloner ; l'autre mod a pu changer ses ids.

```csharp
if (!AssetManager.buildings.has("their_id")) return;   // not there (yet): skip, don't crash
AssetManager.buildings.clone("hello_new", "their_id");
```

Détecter les autres mods et gérer correctement l'ordre de chargement, c'est dans **[Coopérer avec d'autres mods](#/nml/other-mods)**.

## Le modèle commun à toutes les pages suivantes

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public const string ID = "hello_something";

        public static void Initialize()
        {
            // 1. ne jamais enregistrer en double
            if (AssetManager.<library>.has(ID)) return;

            // 2. cloner si un élément similaire existe, construire sinon
            SomeAsset asset = AssetManager.<library>.clone(ID, "$template$");

            // 3. ajuster les champs souhaités
            asset.some_field = true;

            // 4. les statistiques toujours en dernier
            asset.base_stats["damage"] = 10;
        }
    }
}
```

Chaque page d'asset de ce guide applique rigoureusement ce canevas. En cas de doute, revenez toujours à cette référence :PESgn_GoOn:.

## Quatre règles fondamentales à garder en vue

1. **`has()` d'abord.** N'enregistrez jamais deux fois le même id.
2. **`clone()` appelle déjà `add()`.** N'appelez jamais les deux successivement.
3. **`base_stats` n'existe qu'après `add()`.** Renseignez les statistiques en dernier.
4. **Préfixez tous vos ids.** `hello_swift`, jamais `swift`. L'espace de noms est partagé avec tous les autres mods.
