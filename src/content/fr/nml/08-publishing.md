---
title: Publier votre mod
group: Modding NML
subgroup: Avancé et publication
icon: :wbfireworks:
order: 46
---

# Publier votre mod :wbfireworks:

Votre mod fonctionne. Laissez maintenant les autres le casser.

Il existe deux endroits où un mod WorldBox peut vivre, et ils ne sont pas fréquentés de la même façon :

| | |
| --- | --- |
| **[GameBanana](https://gamebanana.com/games/11196)** | Là où se trouve réellement la communauté de modding WorldBox. Tout le monde peut y télécharger, y compris les joueurs ayant acheté le jeu hors de Steam |
| **Steam Workshop** | Intégré à NML, mais avec bien moins de mods |

Publiez sur GameBanana. Dupliquez sur le Workshop ensuite si le cœur vous en dit.

## Empaqueter le mod

Un upload sur GameBanana est un simple **zip du dossier de votre mod**, rien de plus. Le dossier à l'intérieur du zip doit être celui qui contient `mod.json` :

```text HelloBox.zip
HelloBox/
├── mod.json
├── icon.png
├── default_config.json
├── Locales/
├── GameResources/
└── Code/
```

Pas un zip du *contenu*. Un zip du *dossier*. Quelqu'un qui décompresse l'archive dans son dossier `Mods/` doit obtenir `Mods/HelloBox/mod.json`. S'il se retrouve avec `Mods/mod.json`, il viendra se plaindre que votre mod ne se charge pas :PES_Facepalm:.

**Excluez** tout ce qui n'est pas requis pour l'exécution : `.git/`, `bin/`, `obj/`, `.vs/`, votre `.sln`, vos notes. Si vous fournissez une `.dll` précompilée, livrez-la *à la place* de `Code/`, pas à côté d'une version obsolète du code source.

## Mettre en ligne sur GameBanana

1. Créez un compte, puis rendez-vous sur la **[page de jeu WorldBox](https://gamebanana.com/games/11196)**.
2. **Add → Mod**.
3. Renseignez le nom, la description et la catégorie. La catégorie compte plus que vous ne le pensez : c'est ainsi que les joueurs vous trouvent.
4. Uploadez le zip et au moins une capture d'écran **du mod en pleine action dans le jeu**. Pas seulement votre icône ou la liste des mods.
5. Dans la description, dites clairement : ce qu'il ajoute, qu'il nécessite **NeoModLoader** et avec quels mods il est en conflit.

Mettre à jour plus tard se fait sur la même page via **Edit → Files**. Ajoutez le nouveau zip, écrivez une ligne de changelog et augmentez `version` dans `mod.json` pour qu'elle corresponde. Synchroniser la version GameBanana et celle de `mod.json` ne coûte rien et évite toute ambiguïté chez les joueurs.

> [!TIP] Une capture vaut mieux qu'un long discours
> Les gens choisissent sur la miniature. Une seule image nette en jeu montrant ce que votre mod apporte fera bien plus pour vous que la description la plus soignée du site :PES_Camera:.

## La méthode Steam Workshop

Mettre en ligne sur le Workshop se fait **dans le jeu**, et la façon d'ouvrir cette fenêtre est l'élément d'interface le plus maudit de tout cet univers :kekw:.

1. Ouvrez la fenêtre **Mods** en jeu.
2. Cliquez sur l'**icône** de votre mod exactement **huit fois**, avec moins d'une seconde d'intervalle entre chaque clic.
3. Attendez environ trois secondes.
4. La fenêtre d'upload apparaît.

S'il ne se passe rien, vous avez cliqué trop lentement ou vous avez cliqué sur la rangée au lieu de l'icône.

La nouvelle fenêtre de liste de mods NML propose également des boutons rapides sur les mods sélectionnés (ouvrir le dossier, l'activer/désactiver, recharger le code), mais le rite des huit clics sur l'icône reste le moyen d'invoquer l'uploader Steam :PES2_Shrug:.

| Champ | Ce qu'il faut renseigner |
| --- | --- |
| Champ du haut (`fileID`) | **Laissez vide** la première fois. Pour les mises à jour, collez l'id présent dans l'URL de votre article de workshop |
| Champ du bas | Le journal des modifications. Peut être vide, modifiable ultérieurement sur la page du workshop |

Voilà toute la différence entre publier et mettre à jour : un `fileID` vide crée un nouvel article, un `fileID` rempli remplace l'existant.

### Authentification, la première fois

Mettre en ligne un nouveau mod sur le Workshop vous demandera de vous authentifier. Trois méthodes :

- **Discord** : obtenez le rôle `Modder` sur le Discord officiel de WorldBox en demandant à un administrateur.
- **GitHub** : rejoignez l'organisation `WorldBoxOpenMods`. Envoyez-leur un e-mail avec pour sujet "WorldBoxOpenMods", votre pseudo GitHub et votre mod, puis patientez jusqu'à une semaine.
- **Ignorer** : votre mod sera mis en ligne avec le tag `Unverified Mods`. Il fonctionne, il est simplement moins mis en avant.

## Avant de cliquer sur téléverser, sur les deux sites

- **`mod.json` est votre vitrine.** `name`, `author`, `version`, `description` sont ce que les gens lisent. Augmentez la `version` à chaque release, et **ne changez jamais votre `GUID`** après la première mise en ligne : c'est l'identité de votre mod, les paramètres du joueur portent son nom, et d'autres mods peuvent en dépendre.
- **`icon.png` existe et a fière allure.** Sur le Workshop, c'est aussi ce sur quoi il faut cliquer huit fois, faites en sorte qu'elle soit agréable.
- **Votre mod doit fonctionner dans n'importe quel dossier.** Ne codez jamais de chemins absolus comme `C:\Users\VotreNom\...`. Utilisez `GetDeclaration().FolderPath`. C'est la raison numéro un pour laquelle un mod marche chez son auteur et nulle part ailleurs :PES2_Bruh:.
- **Lisez vos logs à tête reposée.** Lancez le jeu, chargez un monde, jouez deux minutes, cherchez votre préfixe et `Exception` dans `Player.log`. N'en tolérez aucune.
- **Testez après avoir effacé votre fichier de paramètres.** Supprimez `mods_config/<GUID>.config` pour vérifier les valeurs par défaut qu'un nouveau joueur reçoit réellement.
- **Testez avec d'autres mods activés.** Si vous patchez quelque chose, quelqu'un d'autre patche sans doute la même chose.
- **Testez sur une nouvelle sauvegarde.** Les assets que vous enregistrez doivent exister avant qu'une sauvegarde qui y fait référence ne soit chargée.

## Dependencies

Si votre mod dépend d'un autre, déclarez-le au lieu de crasher sur un type absent :

```json mod.json
{
  "Dependencies": ["com.otherperson.coolmod"],
  "OptionalDependencies": ["com.someone.niceextra"],
  "IncompatibleWith": ["com.someone.rivalmod"]
}
```

NML s'occupe de l'ordre de chargement et prévient le joueur, ce qui est infiniment plus élégant qu'une NullReferenceException dès la ligne un.

## Après la sortie

L'espace commentaires contiendra très exactement trois types de messages : "ça ne marche pas" sans aucun log, une idée réellement formidable à laquelle vous n'aviez pas pensé, et quelqu'un réclamant du multijoueur :PESgn_DidIAsk:.

Répondez à la deuxième. Pour la première, épinglez un message indiquant où trouver `Player.log` (voir **[Logs et débogage](#/nml/logs-and-debugging)**), car un rapport de bug sans log est un rapport sur lequel vous ne pouvez pas intervenir.

Et bienvenue. Chaque nouveau mod rend cette petite communauté un peu moins cimetière, et cinq en une semaine, c'est l'âge d'or du modding :PES5_CrazyPog:.
