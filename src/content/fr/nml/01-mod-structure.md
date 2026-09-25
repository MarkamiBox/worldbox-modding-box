---
title: Structure d'un mod
group: Modding NML
subgroup: Flux de travail de base
icon: :wbsavebuttonbox:
order: 20
---

# Structure d'un mod :wbsavebuttonbox:

## Où vivent les mods

Chaque mod est **un dossier unique** à l'intérieur de `Mods/`, dans votre dossier WorldBox :

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\Mods\
```

Si ce dossier `Mods` n'existe pas encore, créez-le vous-même : clic droit → Nouveau → Dossier, et nommez-le exactement `Mods`. Vous créerez ensuite votre propre dossier de mod à l'intérieur, avec le nom de votre choix.

## Comment un mod est organisé

```text
HelloBox/
├── mod.json          <- La carte d'identité de votre mod (obligatoire)
├── icon.png          <- L'icône d'aperçu du mod
├── Code/             <- Le dossier où vous rangez tout votre code
├── Locales/          <- Fichiers de texte et traductions (en.json, etc.)
└── GameResources/    <- Textures personnalisées, icônes, pixel art et sons
```

Chaque mod a besoin de `mod.json`. HelloBox a aussi besoin de son point d'entrée C#. Vous créerez les autres dossiers lorsque vous en aurez réellement besoin. Un mod contenant seulement `mod.json` et `Code/` est déjà un véritable mod. Les dossiers vides n'impressionnent personne.

#### Le rôle de chaque dossier

- **`mod.json`** : La carte d'identité. Sans cela, NML fera comme si votre mod n'existait même pas.
- **`icon.png`** : L'image d'aperçu affichée dans le menu des mods en jeu.
- **`Code/`**: Le dossier où vous mettez tous vos fichiers source `.cs` (comme `Main.cs`). NML compile en fait n'importe quel `.cs` qu'il trouve où que ce soit dans votre mod, sous-dossiers compris (en ignorant `bin/`, `obj/`, `Properties/`, `packages/` et tout dossier dont le nom commence par un point). Des fichiers `.cs` posés en vrac à côté de `mod.json` fonctionnent donc aussi, et certains mods font ça, mais les ranger dans `Code/` évite que votre projet ne devienne une décharge. **NML compile les sources quand c'est nécessaire et peut réutiliser son cache compilé.** Vous n'avez pas besoin d'une étape de build séparée pour suivre ce guide.
- **`Locales/`** : Où logent vos fichiers de traduction (comme `en.json`). Sans cela, tous vos objets et traits apparaîtront en jeu sous forme d'identifiants bruts non traduits.
- **`GameResources/`** : Toutes vos textures personnalisées, pixel art, icônes de traits, sprites d'armes et sons. Le nom doit être exactement celui-ci, car c'est celui que NML recherche. Voir **[Sprites et ressources](#/nml/sprites-and-resources)**.

> [!WARNING] Les noms de dossiers sont sensibles à la casse, juste pas sur votre PC
> Windows se moque que vous ayez écrit `Locales` ou `locales`. Linux, non. NML cherche `Locales` et `GameResources` orthographiés exactement ainsi, donc un mod qui fonctionne chez vous peut n'avoir ni texte ni sprites chez quelqu'un d'autre. Respectez les majuscules ci-dessus et le problème n'existe jamais.

#### Des dossiers que vous croiserez dans les mods des autres

Vous n'avez besoin d'aucun d'eux pour commencer. Vous les verrez en ouvrant le mod de quelqu'un d'autre, alors voici ce qu'ils sont.

| Dossier | Ce qu'il fait |
| --- | --- |
| `Assemblies/` | Des bibliothèques managées tierces pour les mods source. NML récupère les fichiers `.dll` directement à l'intérieur de ce dossier comme références de compilation et tente de les charger. Ce n'est pas un endroit pour les DLL du jeu ou de NML |
| `GameResourcesReplace/` | NML le charge exactement comme `GameResources/`, juste après. NML range ce nom sous la compatibilité NCMS. Dans un nouveau mod, utilisez simplement `GameResources/` |
| `EmbededResources/` | Oui, mal orthographié, et ça doit l'être. Les fichiers qui s'y trouvent sont empaquetés dans le code compilé d'un mod **de style NCMS**. Le compilateur source vérifié ne les lit que sur sa branche de compatibilité NCMS. Ce n'est pas un embarquement automatique pour le code `BasicMod` de HelloBox. `EmbeddedResources/` n'est pas le nom de dossier utilisé par cette branche |

#### Distribuer une `.dll` au lieu des sources

Dans le loader vérifié, un fichier se terminant par `.dll` **directement à côté de `mod.json`** sélectionne la voie précompilée. NML saute la compilation source et charge les DLL à la racine. Placez votre DLL HelloBox compilée là, et laissez `Code/` hors de la version publiée. Voir **[Publier votre mod](#/nml/publishing)** pour les vérifications de build et d'empaquetage.

> [!WARNING] Une .dll égarée désactive votre code
> C'est aussi pourquoi une bibliothèque déposée à côté de `mod.json` "casse" un mod source : NML voit la `.dll`, saute `Code/`, et aucune de vos modifications ne se charge jamais. Les bibliothèques vont dans `Assemblies/`, jamais à la racine du mod.


### Le manifeste

Le fichier `mod.json` est requis par NeoModLoader pour identifier votre mod :pepeOK:. Il se place directement à la racine du dossier de votre mod.

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.hellobox",
  "RepoUrl": "https://github.com/yourName/hellobox",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### Que signifient ces champs ?

| Champ | Ce qu'il fait |
| --- | --- |
| `name` | Nom affiché, ici `HelloBox` |
| `author` | Votre nom |
| `version` | Version de la release. Augmentez-la à chaque publication |
| `description` | Courte description |
| `iconPath` | Chemin de l'icône, relatif au dossier du mod |
| `GUID` | Identité stable. NML la normalise en `UID` ; pour cet exemple, `COM_YOURNAME_HELLOBOX`. Ne la changez plus après la sortie |
| `RepoUrl` | Métadonnée d'URL de dépôt ou de support. Vérifiez son affichage dans la version de NML que vous ciblez |
| `Dependencies` | Les identifiants de mods requis. Le flux de compilation source documenté exige qu'ils compilent avec succès |
| `OptionalDependencies` | Les identifiants de mods optionnels. NML peut fournir leurs références et symboles de compilation pendant la compilation source |
| `IncompatibleWith` | Les déclarations de conflit. Ne présumez pas d'une application identique selon les versions du loader |
| `UsePublicizedAssembly` | Vaut `true` par défaut dans le loader vérifié. Ajoute la référence à l'assembly publicisée du jeu par NML pendant la compilation source |

> [!WARNING] Vérifiez la gestion des conflits avant de remplir la liste
> La documentation fournie décrit `IncompatibleWith` comme inachevé. Le loader installé possède une passe de suppression qui retire un mod avec une liste non vide avant même de chercher les identifiants listés. Laissez l'exemple vide. Testez votre loader exact avec le mod en conflit présent puis absent avant de publier une déclaration.

#### ModType et targetGameBuild

L'énumération vérifiée contient `NEOMOD`, `COMPILED_NEOMOD`, `BEPINEX` et `RESOURCE_PACK`. La valeur par défaut est `NEOMOD` ; la détection d'une DLL à la racine sélectionne `COMPILED_NEOMOD`.

Un nom d'énumération n'est pas une recette qui fonctionne. La méthode `LoadMod` vérifiée gère les deux types NeoMod et rejette les autres valeurs sur cette voie. Laissez `ModType` hors du manifeste de HelloBox. Ce guide n'affirme pas que définir `RESOURCE_PACK` seul crée un pack de textures fonctionnel.

`targetGameBuild` a une correspondance JSON dans l'assembly, mais le constructeur basé sur fichier vérifié ne le copie pas dans la déclaration active. Ne l'utilisez pas comme verrou de compatibilité. Indiquez la version du jeu et de NML que vous avez testées dans vos notes de version.

#### Les clés du manifeste ne sont pas interchangeables

La déclaration vérifiée associe `GUID` à son `UID` d'exécution. Elle n'a aucune correspondance pour `id`, `mainClass`, `modLoader`, `gameVersion` ou `homepage`, et son constructeur basé sur fichier ne consomme pas ces clés. Elles ne remplacent pas les champs ci-dessus.

NML trouve lui-même un type de point d'entrée adapté dans l'assembly. Une chaîne `mainClass` ne le sélectionne pas. Gardez le manifeste minimal plutôt que d'importer le schéma d'un autre loader.

#### Les symboles de dépendance

Pour les **identifiants ASCII utilisés ici**, NML met les lettres en majuscules et remplace la ponctuation par des underscores : `com.yourname.hellobox-extra` devient `COM_YOURNAME_HELLOBOX_EXTRA`. N'étendez pas cette règle à tous les caractères Unicode ; le normaliseur vérifié en préserve certains.

Pendant la compilation source, NML définit le symbole d'une dépendance optionnelle quand cet identifiant a une entrée dans sa table de références de compilation. L'installation seule n'est pas le test. NML peut aussi retenter une compilation échouée sans les dépendances optionnelles.

> [!WARNING] Un symbole mal orthographié retire silencieusement du code
> Un symbole `#if` inconnu vaut faux. Vérifiez l'identifiant de la dépendance, la liste `OptionalDependencies` et le symbole normalisé. Une compilation réussie ne prouve pas que votre intégration a été incluse.

Voir **[Coopérer avec d'autres mods](#/nml/other-mods)** pour un exemple complet et la vérification à l'exécution correspondante.

#### Ce qui casse un dossier de mod

- **Distribuer des DLL du jeu ou du loader.** N'incluez pas `Assembly-CSharp.dll`, sa copie publicisée, `NeoModLoader.dll`, les DLL Unity ou d'autres DLL copiées du dossier `Managed/` du jeu. Référencez des copies locales pour la compilation ; gardez-les hors du zip. Le chargeur de bibliothèques additionnelles de NML a des cas particuliers et une déduplication, donc copier une DLL n'est pas un moyen fiable de remplacer la version chargée.
- **Des manifestes imbriqués.** NML vérifie d'abord le `mod.json` propre au dossier du mod. C'est seulement s'il est absent qu'il cherche plus bas dans ce dossier. Avec plusieurs correspondances imbriquées, le loader vérifié avertit et utilise le premier résultat. Ne comptez pas sur cet ordre. Distribuez un seul manifeste, à `HelloBox/mod.json`.
- **Des sauvegardes de sources à l'intérieur du mod.** Un dossier `dist/`, `backup/` ou `old/` peut apporter des classes C# en double à la compilation source. Gardez la préparation des releases et les sauvegardes hors du mod installé.
- **Des chemins codés en dur.** Dans votre classe `BasicMod`, utilisez `GetDeclaration().FolderPath` et `Path.Combine` pour les fichiers embarqués. Le dossier `StreamingAssets/mods` du jeu est l'emplacement natif du loader, pas celui de votre dossier HelloBox.
- **Des chemins qui s'échappent du package.** Utilisez des chemins d'icône et de ressources relatifs, avec la casse correspondante. Ne distribuez pas de chemins absolus ni de segments `..`. `Path.Combine` assemble des chemins ; il ne vérifie pas qu'une entrée fournie par le joueur reste à l'intérieur de votre dossier.

> [!NOTE] Ce qui a été vérifié
> Le comportement des dossiers et du compilateur décrit ici a été tracé dans l'assembly NML installée, version de fichier `1.2.0.1`, commit informatif `cd47a1a6c437718d38e8f29240bdb761d543e09a`, en complément de la documentation NML fournie. Ce n'est pas une promesse valable pour toutes les versions.


## Un peu de théorie :elpepehacker:

Chaque mod a besoin d'un fichier C# disant "bonjour, je suis un mod". Voici le code au complet :

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("Mod loaded successfully!");
        }
    }
}
```

Ce n'est pas une version simplifiée pour le guide : c'est exactement la base de départ de la majorité des mods publiés.

#### Analyse du code

- **`using NeoModLoader.api;`** : Voyez cela comme ouvrir votre boîte à outils avant d'entamer un chantier. Au lieu de taper `NeoModLoader.api.BasicMod` à chaque fois, `using` indique à l'ordinateur : *"garde les outils de NML prêts sur l'établi"*.
- **`namespace HelloBox`** : Un nom de famille pour votre code. Le mod de quelqu'un d'autre peut aussi contenir une classe `Main` ; l'espace de noms évite que les deux n'entrent en collision.
- **`public class Main`** : En C#, tout le code réside dans des "classes". Une classe est simplement un plan ou une recette avec un nom.
- **`: BasicMod<Main>`**: le badge officiel de votre mod. Il dit à NML *"je suis un vrai mod"*, et en échange NML vous offre les logs, les réglages, le chargement par étapes et les traductions. La partie `<Main>` répète simplement le nom de votre propre classe. Oui, ça a l'air bizarre, et oui, on l'écrit toujours comme ça.
- **`protected override void OnModLoad()`** : Le grand moment. Quand WorldBox démarre, NML frappe une fois à cette porte. Tout ce que votre mod initialise (traits, objets, pouvoirs) se place à l'intérieur de ces `{ }`.
- **`LogInfo(...)`** : Écrit une ligne dans le journal avec le nom de votre mod déjà attaché. C'est ainsi que vous vérifiez si votre code s'exécute. Voir **[Logs et débogage](#/nml/logs-and-debugging)**.

> [!TIP] La méthode d'antan
> Vous verrez parfois des mods plus anciens écrits ainsi. Oui, je suis assez vieux pour me souvenir de l'époque où c'était normal :
> ```csharp
> public class MyMod : MonoBehaviour, IMod
> {
>     private ModDeclare _declare;
>
>     public void OnLoad(ModDeclare pModDecl, GameObject pGameObject)
>     {
>         _declare = pModDecl;
>     }
>
>     public ModDeclare GetDeclaration() => _declare;
>     public GameObject GetGameObject() => gameObject;
>     public string GetUrl() => _declare.RepoUrl;
> }
> ```
> `IMod` est l'interface brute, tandis que `BasicMod<T>` est une classe prête à l'emploi qui l'implémente tout en ajoutant des facilités bienvenues. Les deux approches fonctionnent. Utilisez `BasicMod` à moins d'avoir une bonne raison de faire autrement, et maintenant vous savez ce qu'est l'autre méthode quand vous la croisez dans le code de quelqu'un :PES5_Noted:.

## Étape suivante

Vous avez vu la structure. Maintenant, créons un vrai mod : **[Votre premier mod](#/nml/your-first-mod)**.
