---
title: Pour commencer
group: Vue d'ensemble
icon: :wbsalut:
order: 3
---

# Pour commencer :wbsalut:

Tout ce dont vous avez besoin avant d'écrire votre première ligne de code. Suivez ces étapes dans l'ordre, cela prend environ quinze minutes.

> [!NOTE] Pas besoin de savoir programmer pour l'instant
> Et vous n'avez **pas** besoin de Visual Studio, d'un compilateur ou de quoi que ce soit de ce genre. NML lit les fichiers texte `.cs` dans le dossier de votre mod et les compile pour vous à chaque lancement du jeu. **Le Bloc-notes est un moyen parfaitement valable d'écrire votre premier mod** :PES_OkHand:. Vous pourrez perfectionner vos outils plus tard, lorsque vous en ressentirez vraiment le besoin.

## 1. Trouvez votre dossier WorldBox

On vous demandera de placer des fichiers "dans le dossier WorldBox" une quarantaine de fois dans ce guide, alors repérez-le bien dès maintenant :

**Steam → clic droit sur WorldBox → Gérer → Parcourir les fichiers locaux.**

Une fenêtre de l'Explorateur s'ouvre sur le dossier contenant `worldbox.exe`. Sur la plupart des PC, il s'agit de :

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Laissez cette fenêtre ouverte ou épinglez-la quelque part. Chaque fois que ce guide mentionne *le dossier WorldBox*, c'est de celui-ci qu'il s'agit :gatoxd:.

## 2. Activez le Mode Expérimental

Sans lui, les mods ne se chargent pas. Pas "fonctionnent mal", ils ne se chargent pas du tout : aucune erreur, rien.

En jeu : ouvrez les **Paramètres**, trouvez le **Mode Expérimental** et activez-le. Après chaque mise à jour du jeu, vérifiez-le à nouveau : le jeu le désactive de lui-même lors d'un changement de version.

## 3. Installez NeoModLoader

**NML** est l'outil qui détecte votre mod, le compile et l'exécute. Sans NML, pas de modding. Vous ne l'avez jamais fait ? La page **[Installer NML](#/install-nml)** détaille chaque clic, Mac compris.

1. Téléchargez la dernière version de `NeoModLoader.dll` depuis la [page des versions NML](https://github.com/WorldBoxOpenMods/ModLoader/releases). Un seul fichier suffit.
2. Dans votre dossier WorldBox, rendez-vous dans `worldbox_Data\StreamingAssets\Mods/`.
3. Déposez `NeoModLoader.dll` à cet endroit.

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            └── NeoModLoader.dll   <- ici
```

Lancez le jeu. Si l'opération a réussi, vous verrez un nouveau bouton avec le logo NML parmi les onglets du bas, et un dossier `Mods` vide à côté de `worldbox.exe`. Si ce n'est pas le cas, revérifiez l'étape 2 :PES5_Hmmmm:.

> [!TIP] Laissez Steam s'occuper des mises à jour
> Il existe également un [élément NML sur le Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3080294469). S'y abonner n'installe pas NML tout seul, mais maintient votre copie à jour après avoir effectué l'installation manuelle ci-dessus.

## 4. Un éditeur de texte

| | |
| --- | --- |
| **Bloc-notes** | Déjà présent sur votre PC. Largement suffisant pour votre premier mod |
| **[VS Code](https://code.visualstudio.com/)** | Gratuit, léger, colore votre code et signale les fautes de frappe. Le choix idéal pour la plupart des gens |
| **Visual Studio** | Le poids lourd. Autocomplète les méthodes du jeu si vous le liez à la `.dll` de WorldBox. Démesuré tant que vous n'écrivez pas d'immenses projets |

Quel que soit votre choix : lorsque vous enregistrez un fichier `.cs`, veillez à ce qu'il soit enregistré sous l'extension `.cs` et **non** `.cs.txt`. Le Bloc-notes adore jouer ce genre de tour :PESgn_SMH:.

## 5. C'est tout, lancez-vous !

Rendez-vous sur **[Structure d'un mod](#/nml/mod-structure)** dans la section Modding NML, puis sur **[Votre premier mod](#/nml/your-first-mod)** :gatoxd: !

---

## Outils à installer plus tard, pas maintenant

Vous n'en avez **pas** besoin pour créer un mod basique. Revenez ici lorsqu'une page vous le recommandera.

- **[La console en direct (BepInEx)](#/toolbox/bepinex-console)** : une fenêtre noire qui affiche vos journaux pendant que vous jouez, vous évitant d'ouvrir un fichier texte après coup. Installez-la assez tôt, elle fait gagner un temps précieux.
- **[UnityExplorer](#/toolbox/unity-explorer)** : cliquez sur n'importe quel élément en jeu pour voir sa structure interne.
- **[dnSpy ou ILSpy](#/toolbox/reading-the-game-code)** : ouvre le code source original du jeu pour découvrir comment les développeurs ont conçu les fonctionnalités.
- **[AssetRipper](#/toolbox/getting-the-sprites)** : extrait les sprites et les sons du jeu afin que vous puissiez adapter votre style graphique.

> [!WARNING] NCMS est obsolète :sadcat:
> NCMS n'est plus maintenu. Tous les guides de ce site ciblent NML. Vous pouvez toujours techniquement créer un mod pour NCMS, mais plus personne ne fait cela aujourd'hui :PES2_Shrug:.
