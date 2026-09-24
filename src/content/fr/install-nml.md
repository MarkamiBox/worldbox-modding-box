---
title: Installer NML
group: Modding NML
icon: :wbhammer:
order: 1
---

# Installer NML :wbhammer:

**NML** (NeoModLoader) est le programme qui fait marcher les mods de WorldBox. Vous installez NML une fois, et ensuite installer un mod revient à copier un dossier.

Cette page part du principe que vous n'avez jamais fait ça. Si vous savez ce qu'est un `.dll`, passez directement à **[la version courte](#la-version-courte)** :PES_OkHand:.

> [!NOTE] Windows, Mac et Linux (Steam Deck)
> Les mods fonctionnent sur la **version Steam pour Windows, Mac et Linux** (y compris le Steam Deck / SteamOS). Pas sur téléphones, tablettes ou consoles.

## La version courte

1. En jeu : **Paramètres → Experimental Mode → activé**.
2. Téléchargez `NeoModLoader.dll` depuis la [page officielle des versions](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest).
3. Mettez-le dans `worldbox_Data/StreamingAssets/Mods/`, dans votre dossier WorldBox.
4. Supprimez de ce même dossier tout ce qui a `NCMS` dans le nom.
5. Lancez le jeu. Les mods vont maintenant dans le dossier `Mods` à côté de `worldbox.exe`.

C'est tout. Le reste de la page, ce sont les mêmes cinq étapes, avec chaque clic écrit.

---

## Windows

### Étape 1. Activer Experimental Mode

1. Lancez WorldBox normalement, depuis Steam.
2. Ouvrez la fenêtre **Paramètres** du jeu.
3. Cherchez **Experimental Mode** dans la liste et activez-le. Le libellé exact suit la langue du jeu.
4. Fermez le jeu.

Sans cet interrupteur, le jeu ne cherche même pas les mods. Pas d'erreur, pas de message, juste rien :PES5_Hmmmm:.

> [!WARNING] Il y a deux dossiers appelés Mods
> Celui-ci, dans `worldbox_Data\StreamingAssets\Mods/`, est réservé à **NML lui-même** (spécifiquement `NeoModLoader.dll`) et à rien d'autre. Le dossier où vous placerez vos **mods** est un dossier distinct, situé directement à la racine du jeu à côté de `worldbox.exe` (`worldbox\Mods/`). Il n'existe pas encore ; NML le créera automatiquement au premier lancement. Mettre un mod dans `StreamingAssets\Mods/` ou NML dans `worldbox\Mods/` est l'erreur la plus fréquente sur cette page.

### Étape 2. Télécharger NML

1. Ouvrez ce lien : **[github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest)**. Il pointe toujours vers le NML le plus récent, vous pouvez donc le mettre en favori.
2. Descendez jusqu'à la section **Assets**. Si elle est repliée, cliquez dessus pour l'ouvrir.
3. Cliquez sur **NeoModLoader.dll**. Il se télécharge comme n'importe quel fichier, généralement dans votre dossier **Téléchargements**.

Vous n'avez besoin que de ce fichier. La page liste aussi `nml-setup-win.exe` et des fichiers en `.pdb`, `.xml` et "Source code" : ignorez-les tous. Ils sont pour les développeurs de NML, pas pour vous.

> [!WARNING] Uniquement depuis ce lien
> Un `.dll` est un programme. Téléchargez NML **uniquement** depuis la page GitHub ci-dessus, jamais depuis CurseForge, un autre site ou un fichier que quelqu'un vous a envoyé dans un chat. Une vieille copie venue d'ailleurs s'efface d'elle-même au premier lancement du jeu, ne laissant qu'un dossier `NML` et `NeoModLoader.AutoUpdate_memload.dll` - si ça arrive, revenez ici et téléchargez le vrai fichier. Le bouton "installation en 1 clic" de GameBanana n'installe pas NML non plus ; téléchargez le `.dll` à la main.
>
> Si votre navigateur demande "conserver ce fichier ?", ou si Chrome le marque comme **Non confirmé**, c'est parce qu'un `.dll` est un programme et que peu de gens téléchargent celui-ci. Depuis cette page GitHub, la réponse est conserver (dans Chrome : ouvrez la liste des téléchargements, puis **Conserver quand même**).

### Étape 3. Ouvrir le dossier WorldBox

C'est le dossier où Steam a installé le jeu. Vous n'avez jamais à le chercher :

1. Ouvrez **Steam** et allez dans votre **Bibliothèque** (library).
2. **Clic droit** sur WorldBox dans la liste à gauche.
3. Cliquez sur **Gérer**, puis sur **Parcourir les fichiers locaux**.

Une fenêtre s'ouvre avec les fichiers du jeu. Vous êtes au bon endroit si vous voyez un fichier `worldbox` (ou `worldbox.exe`) et un dossier `worldbox_Data`. Sur la plupart des PC, c'est :

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Gardez cette fenêtre ouverte. À partir de maintenant, "le dossier WorldBox" désigne celui-ci. Vous y reviendrez plus souvent que vous ne le pensez.

> [!TIP] Faites afficher les extensions à Windows
> Par défaut, Windows cache la fin des noms de fichiers, donc `NeoModLoader.dll` apparaît juste comme `NeoModLoader`. Ça complique n'importe quel guide. Dans la fenêtre du dossier, cliquez sur **Affichage** en haut, puis cochez **Extensions de noms de fichiers** (sous Windows 11 : **Afficher → Afficher → Extensions de noms de fichiers**). Rien ne casse, vous voyez juste les noms complets.

### Étape 4. Mettre NML au bon endroit

1. Dans le dossier de WorldBox, double-cliquez sur **worldbox_Data**.
2. Double-cliquez sur **StreamingAssets**.
3. Double-cliquez sur **Mods**.
4. Ouvrez maintenant votre dossier **Téléchargements** dans une deuxième fenêtre, et glissez **NeoModLoader.dll** dans cette fenêtre `Mods`.

Il doit se retrouver ici :

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            ├── test_asset_load/     the game's own, leave it
            └── NeoModLoader.dll     <- the one you just added
```

Si vous ne voyez pas `test_asset_load` dedans, vous êtes dans le mauvais dossier. Retournez au dossier de WorldBox et réessayez.

**Pendant que vous êtes dans ce dossier :** s'il y a quoi que ce soit avec **NCMS** dans le nom (par exemple `NCMS_memload.dll`, ou un dossier appelé `NCMS`), supprimez-le. NCMS est l'ancien chargeur de mods, il est mort, et NML sait déjà faire tourner les vieux mods NCMS :PES2_Shrug:.

> [!WARNING] `NeoModLoader (1).dll` n'est pas `NeoModLoader.dll`
> Vous avez téléchargé NML deux fois, ou une vieille copie était déjà dans ce dossier ? Windows nomme la nouvelle `NeoModLoader (1).dll` au lieu de l'écraser, et NML refuse de démarrer : du texte rouge inonde l'écran en vous disant de redémarrer le jeu, et le log dit `Missing className: NeoModLoader (1).WorldBoxMod`. Fermez le jeu, supprimez l'ancien fichier, renommez le nouveau exactement en `NeoModLoader.dll` - sans espace, sans numéro - et relancez. Ce seul caractère est la raison la plus fréquente pour laquelle NML "ne marche pas" :PESgn_SMH:.
>
> Si Windows refuse de supprimer l'ancien fichier parce qu'il est "en cours d'utilisation", c'est que le jeu tourne encore. Fermez-le d'abord.

> [!WARNING] Il y a deux dossiers appelés Mods
> Celui-ci, dans `worldbox_Data\StreamingAssets\Mods/`, est pour **NML lui-même** (précisément `NeoModLoader.dll`) et rien d'autre. Celui où vous mettez vos **mods** est un dossier séparé, situé directement à la racine du jeu à côté de `worldbox.exe` (`worldbox\Mods/`). Il n'existe pas encore ; NML le crée automatiquement au premier lancement du jeu. Mettre un mod dans `StreamingAssets\Mods/`, ou NML dans `worldbox\Mods/`, est l'erreur la plus courante de cette page.

### Étape 5. Lancer le jeu et vérifier

Lancez WorldBox depuis Steam et, la première fois, laissez-lui un peu plus de temps que d'habitude.

Vous avez tout bon si :

- Pendant le chargement du monde, le jeu affiche le message **Experimental mode is enabled**.
- Il y a un nouveau bouton avec le **logo de NML** parmi les boutons d'onglets en bas de l'écran. Cliquez dessus : c'est là que vit votre liste de mods.
- De retour dans le dossier WorldBox, il y a un nouveau dossier vide nommé **Mods**, juste à côté de `worldbox.exe`.
- Dans `worldbox_Data\StreamingAssets\Mods/`, NML a créé un dossier **NML** pour ses propres affaires. N'y touchez pas.

Si rien de tout ça ne s'est produit, passez à **[Ça n'a pas marché](#ça-n-a-pas-marché)**.

---

## Mac

Les mêmes cinq étapes. Seul l'endroit où se cache le dossier change, parce que sur Mac tout le jeu est emballé dans une seule icône d'application. Des trucs d'Apple :wbbre:.

1. **Experimental Mode** : exactement comme sous Windows, **[Étape 1](#étape-1-activer-experimental-mode)**. L'avertissement sur les mises à jour vaut aussi pour vous.
2. **Téléchargez** `NeoModLoader.dll` depuis la [même page des versions](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest). C'est le même fichier pour Windows et Mac.
3. **Ouvrez le dossier WorldBox** : Steam → Bibliothèque → clic droit sur WorldBox → **Gérer → Parcourir les fichiers locaux**. Une fenêtre du Finder s'ouvre.
4. **Entrez dans l'application** : clic droit sur l'icône de l'application **worldbox**, puis **Afficher le contenu du paquet**. Ouvrez ensuite **Contents → Resources → Data → StreamingAssets → Mods** et faites-y glisser `NeoModLoader.dll`. Supprimez au passage tout ce qui a `NCMS` dans le nom.
5. **Lancez le jeu** et vérifiez les mêmes choses qu'à l'**[Étape 5](#étape-5-lancer-le-jeu-et-vérifier)**. Le nouveau dossier `Mods` pour vos mods apparaît dans le dossier WorldBox, à côté de l'application, pas dedans.

```text
worldbox/
├── worldbox.app/
│   └── Contents/Resources/Data/StreamingAssets/Mods/
│       └── NeoModLoader.dll     <- NML va ici
└── Mods/                        <- vos mods vont ici
```

---

## Linux & Steam Deck

La logique est exactement la même. Steam sur Linux installe le jeu dans votre dossier utilisateur, et sur Steam Deck il suffit de passer en mode Bureau au préalable. Les manchots sont les bienvenus :wbpenguin:.

1. **Mode expérimental** : exactement comme sur Windows, **[Étape 1](#étape-1-activer-experimental-mode)**.
2. **Téléchargez** `NeoModLoader.dll` depuis la [page officielle des releases](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest). C'est le même fichier pour toutes les plateformes.
3. **Ouvrez le dossier WorldBox** :
   - **Linux de bureau** : Steam → Bibliothèque → clic droit sur WorldBox → **Gérer → Parcourir les fichiers locaux**.
   - **Steam Deck** : Appuyez sur le bouton **STEAM → Marche/Arrêt → Basculer vers le bureau**. Ouvrez Steam en mode Bureau → Bibliothèque → clic droit sur WorldBox → **Gérer → Parcourir les fichiers locaux**.
   Le chemin est généralement :
   ```text
   ~/.local/share/Steam/steamapps/common/worldbox/
   ```
4. **Placez NML au bon endroit** : Ouvrez `worldbox_Data → StreamingAssets → Mods` et glissez-y `NeoModLoader.dll`. Supprimez tout ce qui contient `NCMS` dans le nom.
5. **Lancez le jeu** (sur Steam Deck, vous pouvez revenir en mode Jeu) et vérifiez les mêmes points qu'à l'**[Étape 5](#étape-5-lancer-le-jeu-et-vérifier)**. Le nouveau dossier `Mods` apparaît à la racine de WorldBox.

```text
worldbox/
├── worldbox_Data/
│   └── StreamingAssets/
│       └── Mods/
│           └── NeoModLoader.dll     <- NML
└── Mods/                            <- mods
```

---

## Installer un mod

Maintenant la partie facile, et celle que vous referez encore et encore.

1. Téléchargez le mod. Lisez d'abord sa description : certains mods ont besoin de quelque chose en plus, et l'auteur le dit généralement.
2. Mettez le `.zip` directement dans **`worldbox\Mods/`**, celui à côté de `worldbox.exe`. Ne l'extrayez pas : NML décompresse ses propres zips au prochain lancement du jeu.
3. Lancez le jeu.

Vous l'avez déjà extrait par habitude ? Ça marche aussi, tant que le dossier qui contient `mod.json` se retrouve directement dans `Mods/`. Un dossier de mod contient toujours un fichier `mod.json` quelque part, c'est comme ça que NML le reconnaît. L'erreur à éviter, c'est un dossier dans un dossier dans `Mods/`, ou les fichiers du mod en vrac dans `Mods/` sans aucun dossier autour.

```text
worldbox/
├── worldbox.exe
└── Mods/
    ├── SomeMod/
    │   └── mod.json
    └── AnotherMod/
        └── mod.json
```

> [!TIP] Essayez avec HelloBox
> Pas sûr que ça marche ? Le mod que construit ce guide est un test tout prêt. Téléchargez-le depuis **[Le mod terminé](#/nml/all-together)**, décompressez-le dans `Mods`, lancez le jeu. Si un nouvel onglet de pouvoirs rempli de boutons idiots apparaît, tout est bien installé :wbpeak:.

**Pour retirer un mod**, fermez le jeu et supprimez son dossier de `Mods`. **Pour en désactiver un sans le supprimer**, utilisez la liste des mods de NML en jeu.

**Les mods du Workshop** marchent aussi : abonnez-vous sur le Steam Workshop et NML les prend en charge, sans rien copier.

---

## Ça n'a pas marché

Suivez ces points dans l'ordre. Le premier règle le problème de la plupart des gens.

| Ce que vous voyez | Ce qu'il faut faire |
| --- | --- |
| Pas de bouton NML, pas de dossier `Mods` à côté de `worldbox.exe` | Le mode expérimental est désactivé. Activez-le, redémarrez. Et aussi après chaque mise à jour du jeu |
| Toujours rien, le mode expérimental est activé | `NeoModLoader.dll` est dans le mauvais dossier. Il doit être dans `worldbox_Data\StreamingAssets\Mods/`, à côté de `test_asset_load` |
| Le fichier s'appelle `NeoModLoader.dll.dll` ou `NeoModLoader (1).dll` | Renommez-le exactement en `NeoModLoader.dll` |
| NML est là, mais un mod n'apparaît pas | Le mod est dans le mauvais `Mods`. Il va dans celui à côté de `worldbox.exe`, en tant que `.zip` à part ou en dossier contenant `mod.json` |
| Du texte rouge inonde l'écran et dit `YOU SHOULD RESTART THE GAME` | NML s'appelle `NeoModLoader (1).dll` ou quelque chose d'approchant. Voir l'**[Étape 4](#étape-4-mettre-nml-au-bon-endroit)** |
| NML dit qu'un mod "has been disabled due to an error" | Le mod est cassé ou trop vieux pour votre version du jeu. Cherchez une mise à jour de ce mod, ou demandez à son auteur |
| La version dans le coin du menu principal ne change jamais | Votre jeu est sur une branche bêta de Steam. Voir **[Dépannage](#/troubleshooting)** |
| Tout a cassé juste après une mise à jour de WorldBox | Réactivez le mode expérimental. Puis attendez que vos mods se mettent à jour : une mise à jour du jeu casse souvent les vieux mods pendant quelques jours |

Toujours bloqué ? **[Dépannage](#/troubleshooting)** a la longue liste, et **[Logs et débogage](#/nml/logs-and-debugging)** montre où le jeu note ce qui a mal tourné. Quand vous demandez de l'aide, dites quels mods vous utilisez, ce que vous avez fait juste avant que ça casse, et joignez le texte de l'erreur. "Ça ne marche pas", personne ne peut le réparer, moi y compris :PESgn_ReadRules:.

---

## Les questions qu'on pose toujours

**Puis-je utiliser NML et BepInEx ensemble ?**
Oui. Ils ne se gênent pas. Deux *mods* précis peuvent quand même entrer en conflit, mais ça, ce sont les mods, pas les chargeurs.

**Le mod dit qu'il a besoin de BepInEx, pas de NML.**
Alors il ne va pas dans `Mods`. Installez BepInEx comme montré dans **[La console en direct (BepInEx)](#/toolbox/bepinex-console)** (Windows), lancez le jeu une fois, et mettez ce mod dans `BepInEx\plugins/`. La description du mod dit quel chargeur il veut.

**NML ou NCMS ?**
NML. NCMS n'est plus mis à jour et ne fonctionne pas sur les versions actuelles du jeu. NML fait de toute façon tourner les vieux mods NCMS, donc vous ne perdez rien.

**NML est-il un virus ?**
Non. Les navigateurs préviennent parce qu'un `.dll` est un programme et que peu de gens téléchargent celui-ci. Prenez-le uniquement depuis le lien GitHub ci-dessus : les mods sur GameBanana sont vérifiés par ses modérateurs, et un fichier que quelqu'un vous envoie dans un chat n'est vérifié par personne :PESgn_ReadRules:.

**Dois-je réinstaller NML pour chaque mod ?**
Non. Une fois suffit. Ensuite, chaque mod est juste un dossier dans `Mods`.

**Dois-je mettre NML à jour ?**
Normalement non. NML cherche une nouvelle version à chaque lancement du jeu et se remplace lui-même (c'est le `NeoModLoader.AutoUpdate_memload.dll` qui apparaît à côté). Si ça échoue un jour, téléchargez le nouveau `NeoModLoader.dll` depuis le même lien et remplacez l'ancien à la main.

**Les mods vont-ils casser mes sauvegardes ?**
C'est possible. Une sauvegarde faite avec un mod peut mal se charger une fois ce mod retiré. Gardez une copie des mondes auxquels vous tenez avant d'essayer quelque chose de nouveau :PES_MonkaSweat:.

**Mon mod préféré est obsolète. Puis-je encore y jouer ?**
Soit vous attendez son auteur, soit vous jouez à la version du jeu pour laquelle il a été fait : dans Steam, clic droit sur WorldBox → **Propriétés → Bêtas**, et choisissez cette branche. Il vous faut aussi la version de NML correspondante, liée dans les messages épinglés du salon modding sur le Discord de WorldBox. Tant que vous y êtes, tous les mods faits pour la version actuelle cessent de fonctionner. Pour revenir, choisissez **Aucune** dans le même menu.

**Comment mettre à jour un mod ?**
Les mods du Workshop se mettent à jour tout seuls. Pour le reste : fermez le jeu, supprimez l'ancien dossier du mod (et son ancien `.zip`) de `Mods`, et mettez le nouveau `.zip`.

**J'ai supprimé un mod et il est toujours dans le jeu.**
Il venait du Steam Workshop. Le décocher dans la liste des mods ne suffit pas : désabonnez-vous depuis sa page du Workshop.

**Puis-je modifier un mod pour moi ?**
S'il a un dossier `Code` rempli de fichiers `.cs`, oui : c'est du texte brut, NML le compile à chaque lancement du jeu, et ses images sont dans `GameResources`. Gardez d'abord une copie de l'original. Partager votre version modifiée est une autre question, demandez à l'auteur. Un mod livré uniquement sous forme de `.dll` ne peut pas être modifié, seulement recompilé depuis ses sources.

**Quelqu'un qui m'aide m'a demandé mon log.**
Collez `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` dans la barre d'adresse de l'Explorateur et envoyez `Player.log`, le fichier lui-même, pas une capture d'écran. Si le jeu vient de planter, envoyez plutôt `Player-prev.log` : relancer le jeu écrase `Player.log`.

Vous voulez créer des mods plutôt que seulement les utiliser ? Ça commence à **[Pour commencer](#/getting-started)**.
