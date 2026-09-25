---
title: Débogage et publication
group: BepInEx Modding
icon: :wbfireworks:
order: 3
---

# Débogage et publication :wbfireworks:

Votre plugin compile. Maintenant il doit se charger, marcher et arriver chez les autres. Cette page, ce sont les erreurs que vous rencontrerez vraiment, dans l'ordre où elles arrivent, puis comment publier le tout.

## Où regarder

| Fichier | Où | Ce que c'est |
| --- | --- | --- |
| La fenêtre de console | S'ouvre avec le jeu, si vous l'avez activée | Tout, en direct. Voir **[La console en direct (BepInEx)](#/toolbox/bepinex-console)** |
| `LogOutput.log` | `worldbox/BepInEx/` | La même chose, enregistrée. C'est celui qu'on vous demandera |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | Le log de Unity lui-même, pour les plantages que BepInEx n'a pas attrapés |

Cherchez d'abord le nom de votre plugin dans `LogOutput.log`. La première erreur qui le mentionne est celle qui compte, même règle que dans **[Logs et débogage](#/nml/logs-and-debugging)**.

## Quand ça ne compile pas

| Erreur | Ce que ça veut dire | Solution |
| --- | --- | --- |
| `The reference assemblies for .NETFramework,Version=v4.7.2 were not found` | Votre PC n'a pas le pack développeur .NET Framework 4.7.2 | Le paquet `Microsoft.NETFramework.ReferenceAssemblies` de la **[préparation du projet](#/toolbox/bepinex-modding)** |
| `CS0246: The type or namespace name 'Input' could not be found` | Un module Unity n'est pas référencé | Référencez `UnityEngine*.dll`, pas seulement `UnityEngine.dll` |
| `CS0122: '...' is inaccessible due to its protection level` | Vous avez utilisé un membre `internal` du jeu | `Publicize="true"` sur la référence à `Assembly-CSharp` |
| `The process cannot access the file ... because it is being used by another process` | Le jeu tourne et garde votre `.dll` | Fermez WorldBox, recompilez |
| `Could not find a part of the path` à l'étape de copie | `GameDir` dans votre `.csproj` est faux | Faites-le pointer vers le dossier qui contient `worldbox.exe` |

## Quand ça compile mais ne se charge pas

Lancez le jeu et cherchez une ligne `Loading [YourPlugin 1.0.0]`. Pas de ligne, c'est que BepInEx n'a jamais pris votre plugin :

| Ce que vous voyez | Pourquoi |
| --- | --- |
| Aucune ligne | La `.dll` n'est pas dans `BepInEx/plugins/`, ou BepInEx lui-même ne tourne pas (ni console, ni `LogOutput.log`) |
| Aucune ligne, et la `.dll` est au bon endroit | Le projet vise le mauvais framework. Ça doit être `net472`, pas `net8.0` ni `netstandard2.1` |
| La ligne est là, puis `Could not load file or assembly 'Something'` | Vous utilisez une bibliothèque qui n'est pas livrée avec votre plugin. Mettez sa `.dll` à côté de la vôtre dans le dossier du plugin |
| Deux plugins avec le même GUID | BepInEx n'en charge qu'un. Souvent une vieille copie de votre propre plugin dans un autre dossier |

## Quand ça se charge mais casse

| Erreur | Ce que c'est en général |
| --- | --- |
| `NullReferenceException` sur `AssetManager...` | Vous avez touché les bibliothèques (library) du jeu trop tôt. Utilisez le Postfix sur `AssetManager.init()` de **[Ajouter du contenu avec BepInEx](#/toolbox/bepinex-content)** |
| `HarmonyException` / `Ambiguous match found` | Un patch vise une méthode qui n'existe pas ou qui a des jumelles. Mêmes solutions que dans **[Patchs Harmony](#/nml/harmony-patches)** |
| `MissingMethodException` / `TypeLoadException` après une mise à jour du jeu | Le jeu a changé sous vos pieds. Suivez **[Mettre à jour après une mise à jour du jeu](#/nml/game-updates)**, puis recompilez |
| Votre texte affiche des clés brutes après un changement de langue | Le Postfix sur `LocalizedTextManager.setLanguage` manque |
| Votre icône est invisible | Le sprite a été enregistré après que quelque chose a déjà demandé son chemin, ou il pointe vers un dossier |
| Tout marche, puis le plugin s'arrête en pleine partie | `HideManagerGameObject = true` dans `BepInEx/config/BepInEx.cfg` |

## Une boucle plus rapide

Fermer et rouvrir WorldBox à chaque changement, c'est le pire de BepInEx. Le plugin **ScriptEngine** de la collection BepInEx.Debug adoucit ça : les plugins placés dans `BepInEx/scripts/` au lieu de `plugins/` peuvent être rechargés avec une touche pendant que le jeu tourne (voir son readme pour la touche actuelle).

C'est génial pour les outils, les fenêtres et les overlays. Pour le contenu, ça aide moins : le jeu n'oublie pas un trait que vous avez déjà enregistré, et chaque patch Harmony appliqué reste en place sauf si votre plugin le retire au déchargement (`harmony.UnpatchSelf()` dans `OnDestroy()`). Utilisez-le quand vous construisez une interface, pas quand vous réglez un trait :PES2_Shrug:.

## Publier

### Ce qui va dans le zip

Compilez le plugin en mode Release, puis zippez-le pour que les joueurs puissent l'extraire directement dans leur dossier de jeu :

```text HelloBepInEx.zip
HelloBepInEx.zip
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

Ce qui ne va **pas** dedans :

- **BepInEx lui-même.** Les joueurs l'installent une fois, comme vous. Envoyez-les vers la **[page de la console](#/toolbox/bepinex-console)** et dites quelle version : BepInEx 5, Mono, x64.
- **Les fichiers du jeu.** `Assembly-CSharp.dll`, les modules Unity, et surtout la copie publicisée que la compilation a faite. C'est le code du jeu, pas le vôtre à partager. `Private="false"` dans le `.csproj` les garde déjà hors de votre dossier de compilation, alors ne les ajoutez simplement pas à la main.
- **`BepInEx.dll` et `0Harmony.dll`.** BepInEx les a déjà.

### Le numéro de version

Augmentez-le à deux endroits, et gardez-les identiques : la `version` dans `[BepInPlugin]` (ce que voient le log et les autres plugins) et `<Version>` dans le `.csproj` (ce que dit le fichier `.dll`). Un plugin qui affiche `1.0.0` à sa troisième version complique chaque rapport de bug.

### Dépendre d'un autre plugin

Si votre plugin a besoin qu'un autre plugin BepInEx soit chargé avant, dites-le, et BepInEx trie l'ordre de chargement et refuse de charger le vôtre sans lui :

```csharp
[BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
[BepInDependency("com.other.author.library")]
public class HelloPlugin : BaseUnityPlugin
```

Ajoutez `BepInDependency.DependencyFlags.SoftDependency` en deuxième argument quand l'autre plugin est facultatif et que vous voulez seulement charger après lui s'il est là.

### Où le mettre en ligne

Aux mêmes endroits que n'importe quel autre mod WorldBox, avec les mêmes conseils : voir **[Publier](#/nml/publishing)**. La seule ligne en plus dont votre description a besoin, c'est « Requires BepInEx 5 (Mono x64) », tout en haut. Elle vous épargne les commentaires « ça marche pas » des gens qui l'ont installé dans un jeu avec seulement NML :wbsalut:.
