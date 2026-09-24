---
title: Logs et débogage
group: Modding NML
subgroup: Flux de travail de base
icon: :wbdebugburger:
order: 24
---

# Logs et débogage :wbdebugburger:

Le journal (log) est la seule chose dans le modding qui vous dit toujours la vérité. Il répond à la question que vous vous poserez un millier de fois : **mon code a-t-il vraiment tourné ?**

## Afficher une ligne

Il existe deux manières, et toutes deux aboutissent dans le même fichier.

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");      // NML : ajoute le nom de votre mod en préfixe automatiquement
            LogWarning("something smells");
            LogError("something exploded");

            Debug.Log("[HelloBox] plain Unity");  // Unity : vous devez ajouter le préfixe vous-même
        }
    }
}
```

Vous n'utilisez pas `BasicMod` ? `NeoModLoader.services.LogService` propose les mêmes méthodes `LogInfo`, `LogWarning`, `LogError`, ainsi que `LogStackTraceAsError` pour obtenir la trace complète.

## À quoi ressemble un log sain

Lancez le jeu avec le mod ci-dessus et cherchez `HelloBox` dans `Player.log`. Vous devriez voir quelque chose comme ceci :

```text Player.log
005: Compile Mod HelloBox                = 2,2480
006: Load Resources From Mod HelloBox    = 0,0012
[NML]: [HelloBox]: OnLoad
[NML]: [HelloBox]: HelloBox is alive!
[NML]: [HelloBox]: Loaded
008: Init Mod HelloBox                   = 0,0014
```

Ligne par ligne : NML a compilé les fichiers de `Code/`, chargé vos ressources (resource), puis appelé `OnModLoad` qui a affiché votre ligne. Les lignes numérotées indiquent le temps mis par NML pour chaque étape : le chiffre après `=` représente les secondes, et certaines lignes apparaissent en rouge. **Le rouge ici ne signifie pas une erreur**, simplement que cette étape a été la plus lente :hmm:.

La ligne qui compte est la vôtre. Si `[HelloBox]: HelloBox is alive!` manque à l'appel, continuez votre lecture.

## Quand votre code ne compile pas

Avant que votre mod ne puisse démarrer, NML doit le compiler. Une simple faute de frappe arrête tout net, et NML vous indique précisément où :

```text Player.log
[NML]: Code\Main.cs(9,42): error CS1002: ; expected
[NML]: Failed to compile mod HelloBox
```

Lisez de droite à gauche : **`; expected`** est le problème, **`(9,42)`** indique la ligne 9, caractère 42, et **`Code\Main.cs`** est le fichier en cause. Ouvrez ce fichier, rendez-vous à cette ligne et insérez le point-virgule manquant.

L'information utile se trouve sur la **première** ligne. La ligne `Failed to compile mod HelloBox` en dessous n'est que le résumé. Beaucoup de gens paniquent en lisant cette dernière sans voir la solution juste au-dessus :PES4_1IQ:.

## À quoi ressemble un log en erreur

Une fois que le code compile, voici l'autre problème très fréquent :PES2_F: :

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
NullReferenceException: Object reference not set to an instance of an object
  at HelloBox.HelloTraits.Initialize () [0x00021] in HelloTraits.cs:24
  at HelloBox.Main.OnModLoad () [0x0000c] in Main.cs:12
```

C'est impressionnant, mais c'est une simple phrase :

- **`NullReferenceException`** : vous avez tenté d'accéder à un objet vide (`null`). 95 % des erreurs de votre vie de moddeur.
- **`at HelloBox.HelloTraits.Initialize ()`** : la méthode dans laquelle l'incident s'est produit.
- **`in HelloTraits.cs:24`** : **ligne 24 de votre propre fichier**. Regardez cette ligne : un élément y vaut `null`.
- Les lignes du dessous représentent la pile d'appels, de la plus récente à la plus ancienne. Ce sont vos propres fichiers qu'il faut examiner en priorité.

La cause classique de cette erreur : toucher à `base_stats` d'un asset avant de l'avoir ajouté à sa bibliothèque (library). Détails sur la page **[Traits personnalisés](#/nml/custom-traits)**.

## Où se trouvent les logs

| Fichier | Emplacement | Utilité |
| --- | --- | --- |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | La session en cours |
| `Player-prev.log` | même dossier | La session **précédente**, celle qui vient de planter :aPES_Flatline: |
| `logs/error_*.log` | même dossier, sous `logs/` | Un fichier par erreur interceptée par le jeu |
| `mods_config/<GUID>.config` | même dossier | Les réglages enregistrés pour votre mod |

Collez `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` dans la barre d'adresse de l'Explorateur Windows pour y accéder directement.

## Une console en direct plutôt qu'un fichier

Consulter un fichier texte après coup est fastidieux. Avec **BepInEx**, vous profitez d'une console noire qui affiche les logs en temps réel pendant que vous jouez. Vous voyez ainsi votre ligne apparaître à la seconde où vous cliquez sur un bouton. Cela prend deux minutes à installer : **[Console BepInEx](#/toolbox/bepinex-console)**.

Vous voulez cliquer sur les fenêtres du jeu et lire leurs valeurs en direct ? Utilisez **[UnityExplorer](#/toolbox/unity-explorer)**.

## Ne laissez pas une erreur détruire tout le mod

`OnModLoad` s'exécute de haut en bas. Si la ligne 3 plante, les lignes 4 à 20 ne s'exécutent jamais, et la moitié de votre mod n'existera pas en silence. Donnez à chaque bloc son propre filet de sécurité :

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    Stage("traits", HelloTraits.Initialize);
    Stage("items", HelloItems.Initialize);
    Stage("powers", HelloPowers.Initialize);
    LogInfo("HelloBox ready");
}

// Exécute une étape et, en cas de crash, consigne son nom et poursuit l'exécution.
private static void Stage(string pName, System.Action pAction)
{
    try { pAction(); }
    catch (System.Exception e) { LogError($"stage '{pName}' failed: {e}"); }
}
```

Désormais, un trait mal configuré ne vous coûte que ce trait, pas le mod entier, et le journal indique précisément quelle étape a posé problème :

```text Player.log
[NML]: [HelloBox]: stage 'items' failed: NullReferenceException ...
[NML]: [HelloBox]: HelloBox ready
```

## Ne touchez pas au monde avant qu'il n'existe

`OnModLoad` s'exécute **avant** que le monde ne soit créé. Pas de carte, pas d'unités, rien du tout. Touchez-y à ce moment-là et le jeu plantera avant même d'atteindre le menu principal :surprised_pikachu:. Tout ce qui tourne à chaque frame requiert un garde-fou :

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;                        // encore dans le menu
    if (World.world == null || World.world.units == null) return;  // pas encore de monde
    if (MapBox.instance == null) return;

    // à partir d'ici, il est sans danger de manipuler le monde
}
```

## Recharger le code sans redémarrer

Redémarrer WorldBox pour tester une seule ligne modifiée représente l'essentiel du temps passé à modder. Demandez à quiconque l'a fait quarante fois dans la même soirée. NML peut recompiler votre mod pendant que le jeu tourne et remplacer à chaud les méthodes que vous avez marquées.

1. Votre classe principale implémente `IReloadable`, ce qui correspond à une méthode unique : `Reload()`. Celle de HelloBox le fait dans **[Le mod complet](#/nml/all-together)**.
2. Dans le menu des mods actifs de NML, le bouton de rechargement apparaît automatiquement pour tout mod qui implémente `IReloadable`. (L'ancienne liste de mods exigeait `Config.isEditor = true` pour afficher son bouton, mais le menu principal ne vous impose plus ce détour.)
3. Marquez les méthodes à remplacer avec l'attribut `[Hotfixable]`, issu de `NeoModLoader.api.attributes` :

```csharp
using NeoModLoader.api.attributes;

[Hotfixable]
public static WorldTile PickTile(Actor pActor)
{
    // modifiez ceci pendant que le jeu tourne, cliquez sur recharger et observez la créature
}
```

Modifiez ensuite la méthode, enregistrez et appuyez sur le bouton de rechargement de votre mod dans la liste NML. NML recompile, patche les méthodes marquées et appelle `Reload()`. Tout ce qui n'est pas marqué continue d'exécuter l'ancien code.

> [!NOTE] Si jamais vous activez `Config.isEditor`
> `Config.isEditor` est l'interrupteur Unity interne du jeu. Si vous l'activez à la main, WorldBox se croit dans l'éditeur Unity et une partie de l'interface passe en disposition mobile. Avec `IReloadable` sur un NML récent, vous n'en avez pas besoin, alors laissez-le tranquille.

Ce qu'il ne peut pas faire : les callbacks Unity comme `Awake` ou `Update`, les constructeurs, et tout ce que le jeu a déjà construit à partir de votre ancien code. Un asset enregistré au chargement conserve les délégués qui lui ont été fournis à ce moment-là : `Reload()` est l'endroit où les réassigner manuellement.

## Les erreurs classiques de tout débutant

| Ce que vous observez | Ce que cela signifie |
| --- | --- |
| Le mod n'apparaît pas dans la liste | Pas de `mod.json`, ou JSON invalide (une virgule en trop :pepeclown:) |
| Le mod est listé, mais rien ne se passe | `OnModLoad` a planté. Cherchez votre préfixe et le mot `Exception` dans le log |
| `Failed to compile mod ...` | Une faute de frappe en C#. La vraie erreur est indiquée sur la ligne **au-dessus** |
| `NullReferenceException` sur un nouvel asset | Vous avez modifié `base_stats` avant `add()` : c'est la bibliothèque qui l'alloue |
| Le texte apparaît sous la forme `trait_whatever` | Traduction manquante, voir **[Localisation](#/nml/localization)** |
| Votre bouton est un trou invisible | Le chemin du sprite est faux, l'icône a retourné `null` |
| Fonctionne chez vous, chez personne d'autre | Vous avez codé en dur un chemin absolu contenant votre nom d'utilisateur Windows :homerhide: |
