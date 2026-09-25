---
title: Mettre à jour après une mise à jour du jeu
group: Modding NML
subgroup: Avancé et publication
icon: :wbsettingsgear:
order: 47
---

# Mettre à jour après une mise à jour du jeu :wbsettingsgear:

WorldBox a reçu une mise à jour, et votre mod est en rouge dans la liste. Bienvenue dans le modding, ça arrive à tout le monde et ça arrivera encore :PES2_Shrug:.

Votre mod appelle le code du jeu lui-même. Quand les développeurs renomment une méthode, déplacent un champ ou changent ce qu'une méthode reçoit, votre code pointe vers quelque chose qui n'existe plus. Ce n'est pas cassé pour de bon, c'est juste périmé. Cette page, c'est l'ordre dans lequel je vérifie tout, à chaque fois.

## 1. Mettez d'abord NML à jour

Avant de toucher à votre propre code, récupérez le **`NeoModLoader.dll`** le plus récent sur la page **[Installer NML](#/install-nml)**. Une grosse mise à jour du jeu apporte souvent un nouveau NML, et un vieux chargeur sur un nouveau jeu échoue d'une façon qui ressemble exactement à votre faute.

Si NML lui-même ne se charge pas, vous n'en êtes pas encore à votre mod. Regardez **[le jeu est sur une ancienne version](#/troubleshooting)** dans le dépannage, puis revenez.

## 2. Lisez la première erreur

Lancez le jeu, puis ouvrez `Player.log` (où il se trouve : **[Logs et débogage](#/nml/logs-and-debugging)**). Trouvez la première erreur de votre mod et ignorez tout ce qui est en dessous pour l'instant. Les erreurs s'enchaînent, et corriger la première en fait souvent disparaître cinq autres.

Après une mise à jour, vous verrez surtout celles-ci :

| Erreur | Ce qui a changé dans le jeu |
| --- | --- |
| `CS0117: 'X' does not contain a definition for 'Y'` | Un champ ou une méthode statique a été renommé ou supprimé |
| `CS1061: 'X' does not contain a definition for 'Y'` | Pareil, mais sur un objet : `actor.someMethod()` n'existe plus |
| `CS0246: The type or namespace name 'X' could not be found` | Une classe entière a été renommée ou déplacée |
| `CS7036` / `CS1501` | La méthode existe encore, mais elle prend d'autres arguments maintenant |
| `CS0122: 'X' is inaccessible due to its protection level` | Quelque chose que vous utilisiez est devenu `internal`, voir **[cette entrée](#/troubleshooting)** |
| `CS0029` / `CS0266` | Un champ a changé de type, par exemple de `int` à `float`, ou d'un texte à un asset |
| `HarmonyException` / `MissingMethodException` au démarrage | Une méthode que vous **patchez** a été renommée. Votre code compile, le patch n'a rien où s'accrocher |

La dernière est la plus sournoise. Un patch qui nomme sa méthode avec un simple texte, comme `"updateStats"`, n'est vérifié qu'au lancement du jeu. Un renommage n'empêche donc pas votre mod de compiler, il l'empêche de fonctionner. Les patchs écrits avec `nameof` donnent une erreur de compilation normale à la place, une raison de plus de l'utiliser quand vous pouvez (**[deux façons d'écrire le nom de la méthode](#/nml/harmony-patches)**).

## 3. Trouvez le nouveau nom

L'ancien nom a disparu, cherchez donc son remplaçant :

- **[Recherche de méthodes](#/tools/methods)** sur ce site. Tapez ce que la méthode *faisait*, pas son nom : "add trait to unit" la trouve même si le nom a changé.
- **[Champs des assets](#/tools/fields)** pour les champs des assets. Cherchez la partie du nom dont vous vous souvenez.
- **dnSpy**, qui a toujours raison, parce qu'il lit le jeu que vous avez vraiment. Les outils de recherche d'ici sont régénérés après les mises à jour, mais ils peuvent avoir quelques jours de retard sur une toute nouvelle. Comment s'en servir : **[Lire le code du jeu](#/toolbox/reading-the-game-code)**.

L'astuce que j'utilise le plus : ouvrez l'asset ou la méthode vanilla qui fait le même travail que le vôtre, et regardez comment **le jeu lui-même** l'écrit maintenant. Si le jeu a changé la façon de créer les traits, ses propres traits utilisent déjà la nouvelle :PESgn_Noice:.

### Des noms qui n'existent plus

Les vieux mods, les vieux tutoriels et les vieux posts de forum en sont pleins. Aucun n'existe dans le jeu actuel, donc chacun devient une erreur de compilation, ou, pour les ids de templates, un `clone()` qui lève une `KeyNotFoundException` au démarrage :

| Ancien nom | À utiliser maintenant |
| --- | --- |
| `AssetManager.unitStats` | `AssetManager.actor_library`. Les créatures sont des `ActorAsset`, voir **[Acteurs personnalisés](#/nml/custom-actors)** |
| `AssetManager.raceLibrary` | Pas de remplacement direct. Ce qu'une race contenait autrefois vit maintenant sur `ActorAsset` lui-même |
| `AssetManager.nameGenerator` | `AssetManager.name_generator`, voir **[Générateurs de noms](#/nml/name-generators)** |
| `AssetManager.items_material_weapon`, `items_material_accessory` | Pas de bibliothèque de remplacement. Chaque matériau est son propre objet dans `AssetManager.items` (`sword_iron`, `sword_steel`), voir **[Objets personnalisés](#/nml/custom-items)** |
| `"!building"` (template de bâtiment) | `"$building$"` dans `AssetManager.buildings` |
| `"_spawn_building"` (template de drop) | `"$spawn_building$"` dans `AssetManager.drops` |
| `"_dropBuilding"` (template de pouvoir divin) | `"$template_drop_building$"` dans `AssetManager.powers` |

Le motif des trois derniers est celui à retenir : les templates sont maintenant enveloppés dans des `$`. Si un vieux `clone()` utilise un id commençant par `_` ou `!`, cherchez dans le `init()` de la même bibliothèque la version `$...$`.

## 4. Vérifiez vos patchs Harmony à la main

Un patch peut aussi mal tourner sans la moindre erreur. Passez-les un par un et vérifiez la méthode dans dnSpy :

- **Noms des paramètres.** Harmony remplit les paramètres **par leur nom**. Si le jeu a renommé `pDamage` en `pAmount`, votre `float pDamage` ne se lie plus et Harmony échoue en appliquant le patch. Voir **[les noms de paramètres magiques](#/nml/harmony-patches)**.
- **Surcharges.** Une méthode qui était unique a peut-être maintenant une jumelle, et votre patch échoue avec `Ambiguous match found`.
- **Ce que fait la méthode.** Parfois le nom reste mais la logique part ailleurs. Votre patch s'exécute et rien ne change. Mettez une ligne `LogInfo` dans le patch : si elle n'apparaît jamais, le jeu n'appelle plus cette méthode.

## 5. Cherchez ce qui ne fait plus rien

Recompiler n'est pas la ligne d'arrivée. Chargez un monde et vérifiez que chaque morceau marche encore : le trait affiche son icône, l'objet tombe, le pouvoir fait apparaître ce qu'il doit.

Une mise à jour peut ajouter un champ que les assets vanilla remplissent maintenant et pas les vôtres. L'asset se charge, aucune erreur, et il ne fait simplement rien. Comparez votre asset champ par champ avec le vanilla le plus proche dans le `init()` de sa bibliothèque (library). Ce que le jeu définit maintenant et pas vous, c'est votre suspect.

## 6. Testez aussi une ancienne sauvegarde

Chargez un monde sauvegardé **avant** la mise à jour, avec votre mod activé. Les données perso stockées sur les unités (**[Sauvegarder des données](#/nml/saving-data)**) doivent revenir telles quelles. Si vous avez renommé un id en réparant, les anciennes sauvegardes utilisent encore l'ancien, alors ne renommez que si c'est vraiment nécessaire.

## 7. Publiez-le

- Augmentez `version` dans `mod.json`.
- Indiquez avec quelle version du jeu il fonctionne dans la description et le changelog, pour que les joueurs sachent laquelle prendre.
- Envoyez le nouveau zip comme avant : **[Publier](#/nml/publishing)**.

Ensuite, répondez aux commentaires "c'est à jour ??", vous l'avez bien mérité :wbsalut:.

## Pour que la prochaine mise à jour fasse moins mal

- **Patchez moins.** Chaque patch Harmony est un endroit qui peut casser. Si un champ d'asset ou une fonction de NML peut faire le travail, utilisez-la.
- **Entourez votre code de try/catch.** Une fonction cassée écrit une erreur dans le log, le reste de votre mod continue de marcher. Voir **[Logs et débogage](#/nml/logs-and-debugging)**.
- **Une classe de patch par tâche.** Ça facilite l'isolation des pannes. Ça n'isole pas les échecs de `PatchAll` : une cible manquante peut arrêter le scan avant que les patchs suivants ne soient appliqués. Utilisez le patch manuel protégé pour les cibles optionnelles.
- **Gardez vos ids au même endroit.** Des constantes comme `HelloTraits.SWIFT` font d'un renommage une seule modification, pas vingt.
