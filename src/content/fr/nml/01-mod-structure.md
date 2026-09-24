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
MyCoolMod/
├── mod.json          <- La carte d'identité de votre mod (obligatoire)
├── icon.png          <- L'icône d'aperçu du mod
├── Code/             <- Le dossier où vous rangez tout votre code
├── Locales/          <- Fichiers de texte et traductions (en.json, etc.)
└── GameResources/    <- Textures personnalisées, pixel art et sons
```

Seul `mod.json` est obligatoire. Vous créerez les autres dossiers lorsque vous en aurez réellement besoin. Un mod contenant seulement `mod.json` et `Code/` est déjà un véritable mod fonctionnel. Les dossiers vides n'impressionnent personne.

#### Le rôle de chaque dossier

- **`mod.json`** : La carte d'identité. Sans cela, NML fera comme si votre mod n'existait même pas.
- **`icon.png`** : L'image d'aperçu affichée dans le menu des mods en jeu.
- **`Code/`**: Le dossier où vous mettez tous vos fichiers source `.cs` (comme `Main.cs`). NML compile en fait n'importe quel `.cs` qu'il trouve dans votre mod (en ignorant `bin/`, `obj/` et compagnie), mais les ranger dans `Code/` évite que votre projet ne devienne une décharge. **NML les compile à chaque lancement du jeu**, vous n'avez donc jamais à compiler une `.dll` vous-même ni besoin de Visual Studio.
- **`Locales/`** : Où logent vos fichiers de traduction (comme `en.json`). Sans cela, tous vos objets et traits apparaîtront en jeu sous forme d'identifiants bruts non traduits.
- **`GameResources/`** : Toutes vos textures personnalisées, pixel art, icônes de traits, sprites d'armes et sons. Le nom doit être exactement celui-ci, car c'est celui que NML recherche. Voir **[Sprites et ressources](#/nml/sprites-and-resources)**.

### Le manifeste

Le fichier `mod.json` est requis par NeoModLoader pour identifier votre mod :pepeOK:. Il se place directement à la racine du dossier de votre mod.

```json mod.json
{
  "name": "My-First-Mod",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.my-first-mod",
  "RepoUrl": "https://github.com/yourName/my-first-mod",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### Que signifient ces champs ?

- **`name`** : Le nom convivial de votre mod affiché dans la liste des mods en jeu.
- **`author`** : Votre pseudo ou nom d'auteur. Revendiquez fièrement votre travail !
- **`version`** : Le numéro de version de votre mod (ex. `"0.1.0"`). Incrémentez-le à chaque mise à jour.
- **`description`** : Un court résumé de ce que fait votre mod. S'affiche dans la fenêtre de détails.
- **`iconPath`** : Le chemin relatif vers votre icône d'aperçu (généralement `"icon.png"` à la racine du mod).
- **`GUID`**: Un identifiant unique pour votre mod, par convention `com.votrenom.nommod`. NML le nettoie en interne en majuscules avec des underscores (`COM_YOURNAME_MY_FIRST_MOD`), et c'est sa vraie identité. Si vous l'omettez, NML colle quand même votre auteur et votre nom ensemble. **Choisissez-le une fois et ne le changez jamais** : le fichier de réglages du joueur porte son nom.
- **`RepoUrl`**: Lien optionnel vers votre dépôt GitHub, votre Discord ou votre site. NML ajoute un bouton directement sur la carte de votre mod pour que les joueurs puissent y aller en un clic.
- **`Dependencies`** : Les GUID d'autres mods qui DOIVENT impérativement être installés pour que votre mod fonctionne. Si votre mod est autonome, laissez `[]`.
- **`OptionalDependencies`**: Des mods que vous prenez en charge s'ils sont présents, sans en avoir strictement besoin. Quand l'un d'eux est actif, NML donne même à votre code une constante de compilation `#if OTHER_MOD_GUID` pour y envelopper le code d'intégration.
- **`IncompatibleWith`**: Une liste de GUID de mods qui cassent le vôtre s'ils sont activés ensemble. NML le vérifie et empêche les mods en conflit de se charger en même temps.

Vous pouvez aussi mettre `"ModType": "RESOURCE_PACK"` si votre mod n'a aucun code et veut juste remplacer des textures, ou `"UsePublicizedAssembly": false` si vous aimez souffrir contre les champs privés pour le sport :PES5_Hmmmm:.


## Un peu de théorie :elpepehacker:

Chaque mod a besoin d'un fichier C# disant "bonjour, je suis un mod". Voici le code au complet :

```csharp Code/Main.cs
using NeoModLoader.api;

namespace MyCoolMod
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
- **`namespace MyCoolMod`** : Un nom de famille pour votre code. Le mod de quelqu'un d'autre peut aussi contenir une classe `Main` ; l'espace de noms évite que les deux n'entrent en collision.
- **`public class Main`** : En C#, tout le code réside dans des "classes". Une classe est simplement un plan ou une recette avec un nom.
- **`: BasicMod<Main>`**: le badge officiel de votre mod. Il dit à NML *"je suis un vrai mod"*, et en échange NML vous offre les logs, les réglages, le chargement par étapes et les traductions. La partie `<Main>` répète simplement le nom de votre propre classe. Oui, ça a l'air bizarre, et oui, on l'écrit toujours comme ça.
- **`protected override void OnModLoad()`** : Le grand moment. Quand WorldBox démarre, NML frappe une fois à cette porte. Tout ce que votre mod initialise (traits, objets, pouvoirs) se place à l'intérieur de ces `{ }`.
- **`LogInfo(...)`** : Écrit une ligne dans le journal avec le nom de votre mod déjà attaché. C'est ainsi que vous vérifiez si votre code s'exécute. Voir **[Logs et débogage](#/nml/logs-and-debugging)**.

> [!TIP] La méthode manuelle
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
> `IMod` est l'interface brute, tandis que `BasicMod<T>` est une classe prête à l'emploi qui l'implémente tout en ajoutant des facilités bienvenues. Les deux approches fonctionnent. Utilisez `BasicMod` à moins d'avoir une excellente raison :PES5_Noted:.

## Étape suivante

Vous avez vu la structure. Maintenant, créons un vrai mod : **[Votre premier mod](#/nml/your-first-mod)**.
