---
title: Installer NML
group: Modding NML
icon: :wbhammer:
order: 1
---

# Installer NML :wbhammer:

**NML** (NeoModLoader) est le programme qui fait marcher les mods de WorldBox. Le jeu ne sait pas charger un mod tout seul, NML le fait à sa place. Vous installez NML une fois, et ensuite installer un mod revient à copier un dossier.

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

1. Ouvrez ce lien : **[github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest)**. Il pointe toujours vers le NML le plus récent, vous pouvez le mettre en favori.
2. Descendez jusqu'à la section **Assets**. Si elle est repliée, cliquez dessus pour l'ouvrir.
3. Cliquez sur **NeoModLoader.dll**. Il se télécharge comme n'importe quel fichier, en général dans votre dossier **Téléchargements**.

Vous n'avez besoin que de ce fichier. La page liste aussi des fichiers en `.pdb`, `.xml` et "Source code" : ignorez-les.

> [!WARNING] Uniquement depuis ce lien
> Un `.dll` est un programme. Téléchargez NML **uniquement** depuis la page GitHub ci-dessus, jamais depuis un site quelconque ou un fichier que quelqu'un vous a envoyé dans un chat. Si votre navigateur demande "conserver ce fichier ?", c'est parce que c'est un `.dll`, et depuis cette page la réponse est conserver.

### Étape 3. Ouvrir le dossier WorldBox

C'est le dossier où Steam a installé le jeu. Vous n'avez jamais à le chercher :

1. Ouvrez **Steam** et allez dans votre **Bibliothèque**.
2. **Clic droit** sur WorldBox dans la liste à gauche.
3. Cliquez sur **Gérer**, puis sur **Parcourir les fichiers locaux**.

Une fenêtre s'ouvre avec les fichiers du jeu. Vous êtes au bon endroit si vous voyez un fichier `worldbox` (ou `worldbox.exe`) et un dossier `worldbox_Data`. Sur la plupart des PC, c'est :

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Gardez cette fenêtre ouverte. À partir de maintenant, "le dossier WorldBox" désigne celui-ci.

> [!TIP] Faites afficher les extensions à Windows
> Par défaut, Windows cache la fin des noms de fichiers, donc `NeoModLoader.dll` apparaît juste comme `NeoModLoader`. Ça complique n'importe quel guide. Dans la fenêtre du dossier, cliquez sur **Affichage** en haut, puis cochez **Extensions de noms de fichiers** (sous Windows 11 : **Afficher → Afficher → Extensions de noms de fichiers**). Rien ne casse, vous voyez juste les noms complets.

### Étape 4. Mettre NML au bon endroit

1. Dans le dossier WorldBox, double-cliquez sur **worldbox_Data**.
2. Double-cliquez sur **StreamingAssets**.
3. Double-cliquez sur **Mods**.
4. Ouvrez maintenant votre dossier **Téléchargements** dans une deuxième fenêtre, et faites glisser **NeoModLoader.dll** dans cette fenêtre `Mods`.

Il doit finir ici :

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            ├── test_asset_load/     appartient au jeu, n'y touchez pas
            └── NeoModLoader.dll     <- celui que vous venez d'ajouter
```

Si vous ne voyez pas `test_asset_load` là-dedans, vous êtes dans le mauvais dossier. Revenez au dossier WorldBox et réessayez.

**Tant que vous êtes dans ce dossier :** s'il y a quoi que ce soit avec **NCMS** dans le nom (par exemple `NCMS_memload.dll`, ou un dossier `NCMS`), supprimez-le. NCMS est l'ancien chargeur de mods, il est mort, et NML sait déjà faire tourner les vieux mods NCMS :PES2_Shrug:.

> [!WARNING] Il y a deux dossiers qui s'appellent Mods
> Celui-ci, dans `worldbox_Data\StreamingAssets/`, est pour **NML lui-même** et rien d'autre. Celui où vous mettez les **mods** est un autre dossier, à côté de `worldbox.exe`. Il n'existe pas encore, NML le crée à l'étape suivante. Mettre un mod ici, ou NML là-bas, est l'erreur la plus courante de cette page.

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

Les mêmes cinq étapes. Seul l'endroit où se cache le dossier change, parce que sur Mac tout le jeu est emballé dans une seule icône d'application.

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

La logique est exactement la même. Steam sur Linux installe le jeu dans votre dossier utilisateur, et sur Steam Deck il suffit de passer en mode Bureau au préalable.

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

Maintenant la partie facile, celle que vous referez encore et encore.

1. Téléchargez le mod. Lisez d'abord sa description : certains mods ont besoin d'autre chose, et l'auteur le dit en général.
2. S'il est arrivé en fichier **.zip**, décompressez-le. Sous Windows : clic droit → **Extraire tout**. Sur Mac : double-clic.
3. Faites glisser le dossier obtenu dans **`worldbox\Mods/`**, celui à côté de `worldbox.exe`.
4. Lancez le jeu.

Un dossier de mod contient toujours un fichier `mod.json` quelque part. C'est comme ça que NML le reconnaît. Si le zip vous a donné un dossier dans un dossier, ce n'est pas grave, NML regarde à l'intérieur.

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
> Pas sûr que ça marche ? Le mod que ce guide construit est un test tout prêt. Téléchargez-le depuis **[Le mod terminé](#/nml/all-together)**, décompressez-le dans `Mods`, lancez le jeu. Si un nouvel onglet de pouvoirs plein de boutons idiots apparaît, tout est bien installé :wbpeak:.

**Pour retirer un mod**, fermez le jeu et supprimez son dossier dans `Mods`. **Pour le désactiver sans le supprimer**, utilisez la liste des mods de NML en jeu.

**Les mods du Workshop** marchent aussi : abonnez-vous sur le Steam Workshop et NML les trouve tout seul, sans rien copier.

---

## Ça n'a pas marché

Vérifiez dans l'ordre. Le premier point règle le problème de presque tout le monde.

| Ce que vous voyez | Quoi faire |
| --- | --- |
| Pas de bouton NML, pas de dossier `Mods` à côté de `worldbox.exe` | Experimental Mode est désactivé. Activez-le, relancez. Et après chaque mise à jour du jeu |
| Toujours rien, Experimental Mode est activé | `NeoModLoader.dll` est dans le mauvais dossier. Il doit être dans `worldbox_Data\StreamingAssets\Mods/`, à côté de `test_asset_load` |
| Le fichier s'appelle `NeoModLoader.dll.dll` ou `NeoModLoader (1).dll` | Renommez-le exactement en `NeoModLoader.dll` |
| NML est là, mais un mod n'apparaît pas | Le mod est dans le mauvais `Mods`. Il va dans celui à côté de `worldbox.exe`, en dossier avec `mod.json` dedans, pas en `.zip` |
| NML dit qu'un mod "has been disabled due to an error" | Le mod est cassé ou trop vieux pour votre version du jeu. Cherchez une mise à jour de ce mod, ou demandez à son auteur |
| Tout a cassé juste après une mise à jour de WorldBox | Réactivez Experimental Mode. Puis attendez que vos mods se mettent à jour : une mise à jour du jeu casse souvent les vieux mods pendant quelques jours |

Toujours bloqué ? **[Dépannage](#/troubleshooting)** a la longue liste, et **[Logs et débogage](#/nml/logs-and-debugging)** montre où le jeu note ce qui s'est mal passé. Quand vous demandez de l'aide, dites quels mods vous utilisez, ce que vous avez fait juste avant que ça casse, et joignez le texte de l'erreur. "Ça ne marche pas", personne ne peut le réparer, moi compris :PESgn_ReadRules:.

---

## Les questions qu'on pose toujours

**Est-ce que je peux utiliser NML et BepInEx ensemble ?**
Oui. Ils ne se gênent pas. Deux *mods* précis peuvent quand même se disputer, mais ce sont les mods, pas les chargeurs.

**Le mod dit qu'il lui faut BepInEx, pas NML.**
Alors il ne va pas dans `Mods`. Installez BepInEx comme expliqué dans **[La console en direct (BepInEx)](#/toolbox/bepinex-console)** (Windows), lancez le jeu une fois, et mettez ce mod dans `BepInEx\plugins/`. La description du mod dit quel chargeur il veut.

**NML ou NCMS ?**
NML. NCMS n'est plus mis à jour et ne marche pas sur les versions actuelles du jeu. NML fait de toute façon tourner les vieux mods NCMS, vous ne perdez rien.

**Faut-il réinstaller NML pour chaque mod ?**
Non. Une fois suffit. Ensuite, chaque mod n'est qu'un dossier dans `Mods`.

**Faut-il mettre NML à jour ?**
Normalement non. NML cherche une nouvelle version à chaque lancement du jeu et se remplace tout seul (c'est le rôle du `NeoModLoader.AutoUpdate_memload.dll` qui apparaît à côté). Si ça échoue un jour, téléchargez le nouveau `NeoModLoader.dll` depuis le même lien et remplacez l'ancien à la main.

**Les mods vont-ils casser mes sauvegardes ?**
Ça peut arriver. Une sauvegarde faite avec un mod peut mal se charger une fois ce mod retiré. Gardez une copie des mondes qui comptent pour vous avant d'essayer quelque chose de nouveau :PES_MonkaSweat:.

Vous voulez faire des mods plutôt que seulement les utiliser ? Ça commence à **[Pour commencer](#/getting-started)**.
