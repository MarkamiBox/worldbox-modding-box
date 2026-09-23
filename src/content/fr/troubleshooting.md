---
title: Dépannage
group: Vue d'ensemble
icon: :wbfractured:
order: 4
---

# Dépannage :wbfractured:

Trouvez votre symptôme dans le tableau, cliquez dessus, lisez trois lignes. C'est toute la page :aPES2_ThumbsUp:.

> [!TIP] Le journal répond à la plupart des questions plus vite que moi
> Neuf fois sur dix, la réponse est déjà dans `Player.log`. **[Journaux et débogage](#/nml/logs-and-debugging)** vous montre où il se trouve et comment lire un crash.

## Trouver votre symptôme

**Rien ne se charge**

| Symptôme | |
| --- | --- |
| Aucun bouton Mods dans le menu | [aller](#aucun-bouton-mods-dans-le-menu) |
| Fenêtre Mods vide, cela fonctionnait avant | [aller](#fenêtre-mods-vide-cela-fonctionnait-avant) |
| Le dossier du mod est présent mais le mod n'est pas listé | [aller](#le-dossier-du-mod-est-présent-mais-le-mod-n-est-pas-listé) |
| Le mod est grisé | [aller](#le-mod-est-grisé) |
| "Compile failed" et l'erreur n'a aucun sens | [aller](#compile-failed-et-l-erreur-n-a-aucun-sens) |
| Erreur à la ligne 1 d'un fichier fraîchement collé | [aller](#erreur-à-la-ligne-1-d-un-fichier-fraîchement-collé) |
| Vous avez modifié le code et rien n'a changé | [aller](#vous-avez-modifié-le-code-et-rien-n-a-changé) |
| Le Bloc-notes refuse d'enregistrer dans le dossier du jeu | [aller](#le-bloc-notes-refuse-d-enregistrer-dans-le-dossier-du-jeu) |
| Vos changements ne s'affichent jamais, même après redémarrage | [aller](#vos-changements-ne-s-affichent-jamais-même-après-redémarrage) |

**Le jeu se charge, mais rien n'apparaît**

| Symptôme | |
| --- | --- |
| Crash sur la ligne où vous définissez une statistique | [aller](#crash-sur-la-ligne-où-vous-définissez-une-statistique) |
| Même crash alors que l'ordre est déjà correct | [aller](#même-crash-alors-que-l-ordre-est-déjà-correct) |
| Votre bâtiment meurt instantanément ou n'a pas de taille | [aller](#votre-bâtiment-meurt-instantanément-ou-n-a-pas-de-taille) |
| Enregistré, mais visible dans aucun onglet | [aller](#enregistré-mais-visible-dans-aucun-onglet) |
| Affiche `trait_hello_swift` au lieu d'un nom | [aller](#affiche-trait-hello-swift-au-lieu-d-un-nom) |
| Les noms fonctionnent pour les traits mais pas pour les objets/statuts/pouvoirs | [aller](#les-noms-fonctionnent-pour-les-traits-mais-pas-pour-les-objets-statuts-pouvoirs) |
| L'icône est un carré transparent vide | [aller](#l-icône-est-un-carré-transparent-vide) |
| Un bouton prend de la place et ne dessine rien | [aller](#un-bouton-prend-de-la-place-et-ne-dessine-rien) |
| L'effet de statut n'affiche aucun sprite sur l'unité | [aller](#l-effet-de-statut-n-affiche-aucun-sprite-sur-l-unité) |
| Boutons empilés les uns sur les autres | [aller](#boutons-empilés-les-uns-sur-les-autres) |
| Le bouton est là, mais cliquer dessus n'arme rien | [aller](#le-bouton-est-là-mais-cliquer-dessus-n-arme-rien) |
| `addOpposite` / `addDecision` / `addSpell` ne font rien | [aller](#addopposite-adddecision-addspell-ne-font-rien) |

**Enregistré, puis cassé dans le monde**

| Symptôme | |
| --- | --- |
| Votre créature déclenche une erreur d'ombre | [aller](#votre-créature-déclenche-une-erreur-d-ombre) |
| Votre trait, objet ou créature reste verrouillé | [aller](#votre-trait-objet-ou-créature-reste-verrouillé) |
| Le jeu plante en chargeant votre arme ou votre nourriture | [aller](#le-jeu-plante-en-chargeant-votre-arme-ou-votre-nourriture) |
| Un nuage plante dès qu'il apparaît | [aller](#un-nuage-plante-dès-qu-il-apparaît) |
| Poser votre bâtiment lance Index was out of range | [aller](#poser-votre-bâtiment-lance-index-was-out-of-range) |
| Votre bâtiment plante à chaque frame où il est visible | [aller](#votre-bâtiment-plante-à-chaque-frame-où-il-est-visible) |
| La minicarte plante dès que votre bâtiment existe | [aller](#la-minicarte-plante-dès-que-votre-bâtiment-existe) |
| Votre tile se peint, puis le rendu de la carte plante | [aller](#votre-tile-se-peint-puis-le-rendu-de-la-carte-plante) |
| Faire apparaître un animal sur votre tile plante | [aller](#faire-apparaître-un-animal-sur-votre-tile-plante) |
| Les drops tombent invisibles, ou un projectile plante | [aller](#les-drops-tombent-invisibles-ou-un-projectile-plante) |
| Le log se remplit d'ArgumentNullException venant des projectiles | [aller](#le-log-se-remplit-d-argumentnullexception-venant-des-projectiles) |
| Votre onglet de pouvoirs n'apparaît jamais | [aller](#votre-onglet-de-pouvoirs-n-apparaît-jamais) |
| La fenêtre des réglages affiche des ids bruts | [aller](#la-fenêtre-des-réglages-affiche-des-ids-bruts) |
| Le monde lève une erreur à chaque frame après l'ajout d'un comportement du monde | [aller](#le-monde-lève-une-erreur-à-chaque-frame-après-l-ajout-d-un-comportement-du-monde) |
| Une catastrophe plante lorsqu'elle écrit dans le journal du monde | [aller](#une-catastrophe-plante-lorsqu-elle-écrit-dans-le-journal-du-monde) |
| Une catastrophe sans action plante dès qu'elle est tirée au sort | [aller](#une-catastrophe-sans-action-plante-dès-qu-elle-est-tirée-au-sort) |
| Le premier dirigeant qui évalue votre complot plante | [aller](#le-premier-dirigeant-qui-évalue-votre-complot-plante) |
| Votre décision, complot, gène ou arme existe mais rien ne l'utilise jamais | [aller](#votre-décision-complot-gène-ou-arme-existe-mais-rien-ne-l-utilise-jamais) |

**Compile chez vous, mais pas chez les autres**

| Symptôme | |
| --- | --- |
| `CS0122: inaccessible due to its protection level` | [aller](#cs0122-inaccessible-due-to-its-protection-level) |
| Fonctionne sur votre machine, ne fait rien chez eux | [aller](#fonctionne-sur-votre-machine-ne-fait-rien-chez-eux) |

**Fonctionne au début, puis plante plus tard**

| Symptôme | |
| --- | --- |
| Un autre mod remplace silencieusement votre contenu | [aller](#un-autre-mod-remplace-silencieusement-votre-contenu) |
| Crash sur `World.world` pendant le chargement du mod | [aller](#crash-sur-world-world-pendant-le-chargement-du-mod) |
| Vos données prennent le contrôle des mauvaises créatures | [aller](#vos-données-prennent-le-contrôle-des-mauvaises-créatures) |
| Tout disparaît après sauvegarde / rechargement | [aller](#tout-disparaît-après-sauvegarde-rechargement) |
| Les unités se figent par groupes | [aller](#les-unités-se-figent-par-groupes) |
| La moitié de vos patchs Harmony n'ont jamais été appliqués | [aller](#la-moitié-de-vos-patchs-harmony-n-ont-jamais-été-appliqués) |
| Votre patch `updateStats` plante chez d'autres joueurs | [aller](#votre-patch-updatestats-plante-chez-d-autres-joueurs) |
| Vous avez patché `getHit` et les bâtiments subissent toujours des dégâts | [aller](#vous-avez-patché-gethit-et-les-bâtiments-subissent-toujours-des-dégâts) |
| Votre Prefix a cassé trois autres mods | [aller](#votre-prefix-a-cassé-trois-autres-mods) |
| Une unité reste immobile pour toujours ou plante à chaque frame | [aller](#une-unité-reste-immobile-pour-toujours-ou-plante-à-chaque-frame) |
| Votre comportement d'IA personnalisée se réinitialise discrètement | [aller](#votre-comportement-d-ia-personnalisée-se-réinitialise-discrètement) |
| Le jeu saccade quatre fois par seconde | [aller](#le-jeu-saccade-quatre-fois-par-seconde) |
| Les clics touchent la carte derrière votre fenêtre | [aller](#les-clics-touchent-la-carte-derrière-votre-fenêtre) |
| La mémoire augmente à chaque ouverture de panneau | [aller](#la-mémoire-augmente-à-chaque-ouverture-de-panneau) |
| Une nouvelle valeur par défaut n'atteint pas les joueurs existants | [aller](#une-nouvelle-valeur-par-défaut-n-atteint-pas-les-joueurs-existants) |
| Un curseur de paramètres bouge, votre callback ne s'exécute jamais | [aller](#un-curseur-de-paramètres-bouge-votre-callback-ne-s-exécute-jamais) |

## Utiliser des mods

Ce groupe s'adresse aux personnes qui jouent avec des mods, pas à celles qui les conçoivent. Tout ce qui suit suppose que vous êtes celui qui écrit le code.

### Inondation de texte rouge, missing className

- **Ce que vous voyez** : Du texte rouge qui défile sur le jeu, `previous errors repeated`, `YOU SHOULD RESTART THE GAME`, et dans le log `Missing className: NeoModLoader (1).WorldBoxMod`.
- **Pourquoi cela arrive** : Le fichier ne s'appelle pas `NeoModLoader.dll`. Un navigateur qui le télécharge une deuxième fois ajoute ` (1)`, et NML lit son propre nom de fichier.
- **Comment réparer** : Fermez le jeu, supprimez toute ancienne copie, renommez le fichier en exactement `NeoModLoader.dll`, puis relancez. Guide complet sur **[Installer NML](#/install-nml)**.

### Les mods sont en rouge ou failed après une mise à jour du jeu

- **Ce que vous voyez** : La liste des mods affiche un mod en rouge, "failed", `current failed, will load`, ou `<Mod> has been disabled due to an error`. Il fonctionnait avant la mise à jour.
- **Pourquoi cela arrive** : Les mods font appel au code du jeu. Lorsque WorldBox modifie ce code, un mod conçu pour l'ancienne version cesse de compiler. NML n'est pas le problème, il n'est que le messager.
- **Comment réparer** : Cherchez une version plus récente du mod (sur GameBanana, triez par **Updated**). S'il n'y a pas de nouvelle version, attendez l'auteur ou jouez sur l'ancienne version du jeu, voir **[la FAQ](#/install-nml)**. Ne conservez pas deux versions du même mod dans `Mods` "au cas où" : elles entrent en conflit.

### Le jeu est sur une ancienne version

- **Ce que vous voyez** : NML ne se charge jamais, ou le journal indique `MissingFieldException: Field not found: bool .Config.gameLoaded`. Le numéro de version sur le menu principal est plus ancien que celui dont tout le monde parle.
- **Pourquoi cela arrive** : Le jeu se trouve sur une **branche bêta** de Steam, généralement choisie il y a longtemps pour tester une mise à jour en avance, et le NML que vous avez téléchargé est conçu pour la version actuelle.
- **Comment réparer** : Steam → clic droit sur WorldBox → **Propriétés → Bêtas** → **Aucune**. Laissez Steam se mettre à jour, réactivez le mode expérimental :PES2_Shrug:.

### Le jeu est devenu lent ou se fige avec les mods actifs

- **Ce que vous voyez** : Des chutes de FPS, des saccades ou le monde qui se fige alors que les boutons fonctionnent toujours. Tout va bien sans les mods.
- **Pourquoi cela arrive** : C'est presque toujours un mod qui effectue des calculs lourds à chaque tick, généralement un gros mod de contenu. Deux mods qui modifient la même chose peuvent également se bloquer mutuellement.
- **Comment réparer** : Désactivez la moitié de vos mods, redémarrez, testez. Si le problème persiste, le coupable se trouve dans la moitié active. Continuez à diviser par deux jusqu'à ce qu'il n'en reste qu'un. La désactivation suffit, pas besoin de supprimer. Lisez la description de ce mod pour connaître les incompatibilités et n'exécutez jamais deux versions d'un même mod (une complète et une "lite") en même temps.

### Un monde refuse de se charger

- **Ce que vous voyez** : La sauvegarde ouvre un monde différent, s'arrête pendant le chargement, ou lève une `NullReferenceException` lors de la sauvegarde ou du chargement.
- **Pourquoi cela arrive** : Le monde contient des créatures, des bâtiments ou des traits issus d'un mod désormais désactivé, supprimé ou obsolète. Le jeu trouve des identifiants qu'il ne connaît pas.
- **Comment réparer** : Réactivez ce mod (ou revenez à la version avec laquelle la sauvegarde a été faite), chargez le monde et supprimez le contenu moddé en jeu avant de retirer le mod. Gardez une copie des mondes qui vous tiennent à cœur avant d'essayer un nouveau mod de contenu :PES_MonkaSweat:.

### Un mod BepInEx est installé et n'affiche rien

- **Ce que vous voyez** : Le mod se trouve dans `BepInEx/plugins`, rien n'apparaît en jeu et aucun fichier de configuration propre n'apparaît dans `BepInEx/config`.
- **Pourquoi cela arrive** : Soit l'archive zip a été déposée dans `plugins` sous forme de zip, soit l'objet gestionnaire de BepInEx est détruit par le jeu, ce qui nécessite un paramètre particulier sur certaines machines.
- **Comment réparer** : Placez le **dossier situé à l'intérieur** du zip dans `BepInEx/plugins`, pas le zip lui-même. Ouvrez ensuite `BepInEx/config/BepInEx.cfg`, trouvez `HideManagerGameObject = false`, changez-le en `true`, sauvegardez et redémarrez. Configuration de BepInEx : **[La console en direct](#/toolbox/bepinex-console)**.

### Vous avez supprimé un mod et il est toujours présent

- **Ce que vous voyez** : Le dossier a disparu de `Mods`, mais le mod se charge toujours.
- **Pourquoi cela arrive** : Vous y étiez abonné sur le Steam Workshop, et les mods du Workshop vivent dans le dossier propre de Steam, pas dans le vôtre.
- **Comment réparer** : Désabonnez-vous sur sa page du Workshop. Décocher la case n'équivaut pas à vous désabonner.

### Le jeu ne démarre pas du tout

- **Ce que vous voyez** : WorldBox se ferme ou se bloque avant le menu principal, même après avoir retiré vos mods.
- **Pourquoi cela arrive** : Un fichier du jeu lui-même a été endommagé, souvent en copiant quelque chose dans le mauvais dossier.
- **Comment réparer** : Steam → clic droit sur WorldBox → **Propriétés → Fichiers installés → Vérifier l'intégrité des fichiers du jeu**. Remettez ensuite NML et vos mods un par un.

---

## Rien ne se charge

### Aucun bouton Mods dans le menu

- **Ce que vous voyez**: Le jeu démarre normalement, aucune erreur, aucun bouton Mods et aucune ligne `[NML]` dans le journal.
- **Pourquoi**: Deux dossiers s'appellent "Mods". La DLL du chargeur va dans le dossier de données du jeu; `worldbox\Mods/` est réservé à *vos* mods.
- **Solution**: Placez `NeoModLoader.dll` dans `worldbox\worldbox_Data\StreamingAssets\mods/`, redémarrez et cherchez `[NML]: NeoModLoader Version:` dans le journal.

### Fenêtre Mods vide, cela fonctionnait avant

- **Ce que vous voyez**: La fenêtre s'ouvre et n'affiche rien. Aucune erreur.
- **Pourquoi**: Le **Mode Expérimental est désactivé**, et le jeu le désactive de lui-même après chaque mise à jour de WorldBox.
- **Solution**: Paramètres → Mode Expérimental → activé → redémarrer.

### Le dossier du mod est présent mais le mod n'est pas listé

- **Ce que vous voyez**: Rien dans la liste, aucune ligne `Compile Mod <votre_mod>`.
- **Pourquoi**: Dans l'ordre : le fichier s'appelle en fait `mod.json.txt`; le JSON est invalide; le dossier n'est pas dans `worldbox\Mods/`.
- **Solution**: Explorateur de fichiers → **Affichage → Afficher → Extensions de noms de fichiers**. Ouvrez `mod.json` dans VS Code pour corriger la syntaxe.

### Le mod est grisé

- **Ce que vous voyez**: Listé en gris, aucun code ne s'exécute.
- **Pourquoi**: Il est désactivé (enregistré dans `StreamingAssets\mods\NML\mod_compile_records.json`).
- **Solution**: Cliquez sur l'icône du mod dans la fenêtre Mods, puis redémarrez le jeu.

### "Compile failed" et l'erreur n'a aucun sens

- **Ce que vous voyez**: `Code\Main.cs(9,42): error CS1002: ; expected`, puis une ligne de résumé.
- **Pourquoi**: Le résumé n'est pas l'erreur. La ligne au-dessus indique le fichier, la ligne et la colonne exacts.
- **Solution**: Corrigez **uniquement la première** erreur, puis redémarrez : les erreurs suivantes sont souvent des conséquences.

| Code | Signification |
| --- | --- |
| `CS1002` | Point-virgule manquant `;` |
| `CS0246` | Type ou classe inconnu, généralement un `using` manquant |
| `CS0266` | Nombre décimal passé là où un entier est attendu (`0.5f` dans un `int`) |
| `CS0122` | Le membre est `internal`, voir [cette section](#cs0122-inaccessible-due-to-its-protection-level) |

### Erreur à la ligne 1 d'un fichier fraîchement collé

- **Ce que vous voyez**: Une erreur de compilation absurde à la ligne 1.
- **Pourquoi**: Les blocs de code indiquent le chemin du fichier. Si vous sélectionnez trop haut, l'étiquette atterrit dans votre `.cs`.
- **Solution**: Supprimez la ligne 1. Un `.cs` commence par `using`, `namespace` ou `class`; `mod.json` commence par `{`.

### Vous avez modifié le code et rien n'a changé

- **Ce que vous voyez**: Ancien comportement, aucune erreur.
- **Pourquoi**: NML compile `Code\*.cs` **une seule fois au lancement**. Un jeu en cours d'exécution ne relit jamais vos fichiers.
- **Solution**: Enregistrez, quittez complètement et relancez.

### Le Bloc-notes refuse d'enregistrer dans le dossier du jeu

- **Ce que vous voyez**: "Vous n'avez pas l'autorisation d'enregistrer à cet emplacement".
- **Pourquoi**: Le jeu se trouve dans `C:\Program Files (x86)/`, protégé par Windows.
- **Solution**: Créez d'abord le fichier dans l'Explorateur (clic droit → Nouveau → Document texte), puis modifiez-le.

### Vos changements ne s'affichent jamais, même après redémarrage

- **Ce que vous voyez**: Vous redémarrez, le log dit `Compile Mod`, et le jeu exécute toujours votre ancien code. La compilation prend une fraction de seconde.
- **Pourquoi**: Deux dossiers dans `Mods/` ont le même `GUID` dans `mod.json`, souvent une vieille copie que l'installeur de NML a décompressée en `COM_YOURNAME_HELLOBOX/`. NML charge **un mod par GUID** et ignore l'autre dossier sans rien dire, et ça peut très bien être celui que vous modifiez.
- **Solution**: Cherchez votre GUID dans `Mods/` et gardez exactement un dossier. Si les chiffres ne collent pas, c'est la première chose à vérifier.

---

## Le jeu se charge, mais rien n'apparaît

### Crash sur la ligne où vous définissez une statistique

- **Ce que vous voyez**: `NullReferenceException` dans votre `Initialize()`.
- **Pourquoi**: Un nouvel asset n'a **aucun bloc de statistiques**. La bibliothèque le crée dans `add()`.
- **Solution**: D'abord `add()`, puis les statistiques. Même règle pour les traits, statuts, objets, bâtiments et créatures.

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };
AssetManager.traits.add(swift);      // alloue base_stats
swift.base_stats["speed"] = 20f;     // sûr à partir d'ici
```

`clone()` appelle déjà `add()`, donc après un clone le bloc existe déjà.

### Même crash alors que l'ordre est déjà correct

- **Ce que vous voyez**: Même `NullReferenceException` sur une ligne de statistique après `add()`.
- **Pourquoi**: Vous avez inventé un nom de stat. Un ID inconnu provoque un crash immédiat.
- **Solution**: Utilisez de vrais identifiants (`damage`, `health`, `speed`, etc.). Liste complète dans la **[Référence des statistiques](#/nml/stats)**.

### Votre bâtiment meurt instantanément ou n'a pas de taille

- **Ce que vous voyez**: Le bâtiment apparaît puis disparaît immédiatement, ou ne peut être ciblé.
- **Pourquoi**: `health` et `size` par défaut ne sont configurés dans `add()` que si `base_stats` est null.
- **Solution**: Ne pré-allouez jamais `base_stats`. Clonez ou appelez `add()` d'abord.

### Enregistré, mais visible dans aucun onglet

- **Ce que vous voyez**: Le log s'affiche, aucune exception, mais l'élément est introuvable.
- **Pourquoi**: `group_id` pointe vers un groupe inexistant.
- **Solution**: Utilisez un identifiant de groupe valide. Onglets personnalisés dans **[Groupes et onglets de traits](#/nml/trait-groups)**.

### Affiche `trait_hello_swift` au lieu d'un nom

- **Ce que vous voyez**: Clé brute à l'écran, infobulle vide, `missing text:` dans le log.
- **Pourquoi**: Aucune traduction enregistrée (`trait_<id>` et `trait_<id>_info`).
- **Solution**: Ajoutez ces deux clés dans `Locales/en.json` (et `fr.json`).

### Les noms fonctionnent pour les traits mais pas pour les objets/statuts/pouvoirs

- **Ce que vous voyez**: Vous avez copié le modèle des traits mais cet élément affiche toujours la clé brute.
- **Pourquoi**: Quatre types d'assets construisent leurs clés différemment :

| Asset | Clé de nom | Clé de description |
| --- | --- | --- |
| `GodPower` | champ **`name`**, snake_case | `<name>_description` |
| `ItemAsset` | `translation_key`, sinon `item_<id>` | `<id>_description` |
| `StatusAsset` | champ **`locale_id`** | champ **`locale_description`** |
| `WorldLawAsset` | `<id>_title` | `<id>_description` |

- **Solution**: Utilisez du snake_case en minuscules :PESgn_SMH:.

### L'icône est un carré transparent vide

- **Ce que vous voyez**: Un carré vide là où l'icône devrait être.
- **Pourquoi**: Un mauvais chemin renvoie `null` qui est mis en cache pour toute la session.
- **Solution**: Définissez toujours `path_icon` sans extension avec des slashes (`/`), puis redémarrez.

### Un bouton prend de la place et ne dessine rien

- **Ce que vous voyez**: Un trou invisible dans votre onglet.
- **Pourquoi**: Un sprite `null` est totalement invisible :PES4_Invisible:.
- **Solution**: Utilisez `ui/Icons/iconQuestionMark` comme secours. Guide dans **[Onglets et boutons de pouvoirs](#/nml/power-buttons)**.

### L'effet de statut n'affiche aucun sprite sur l'unité

- **Ce que vous voyez**: Soit rien n'est dessiné sur la créature, soit `NullReferenceException` dans `Status.updateAnimationFrame()` à **chaque frame** tant que le statut dure.
- **Pourquoi**: `StatusLibrary` remplit `sprite_list` depuis `"effects/" + texture` et active `need_visual_render` en une passe pendant le chargement du jeu, avant que votre mod existe. Et `texture` est le nom d'un **dossier** de frames, pas d'un PNG.
- **Solution**: Frames dans `GameResources/effects/fx_hello_status/`, puis après `add()` :

```csharp
cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
cursed.need_visual_render = true;
```

### Boutons empilés les uns sur les autres

- **Ce que vous voyez**: L'onglet semble vide ou les boutons se superposent tous.
- **Pourquoi**: `recalc()` recalcule seulement la largeur ; le placement nécessite `tab.sortButtons()`.
- **Solution**: Appelez les deux dans l'ordre : `tab.recalc();` puis `tab.sortButtons();`. Mais pas pendant `OnModLoad` : là, `recalc()` plante, voir **[Votre onglet de pouvoirs n'apparaît jamais](#votre-onglet-de-pouvoirs-n-apparaît-jamais)**.

### Le bouton est là, mais cliquer dessus n'arme rien

- **Ce que vous voyez**: Le curseur ne change pas, cliquer sur la carte ne fait rien.
- **Pourquoi**: Le bouton est lié au pouvoir par son ID à la création.
- **Solution**: Enregistrez d'abord le pouvoir, puis créez le bouton. `click_action` reçoit `(WorldTile, string)`.

### `addOpposite` / `addDecision` / `addSpell` ne font rien

- **Ce que vous voyez**: Le trait opposé n'est jamais retiré, la décision ne se déclenche pas.
- **Pourquoi**: Ces appels n'ajoutent qu'un ID. La résolution se fait avant le chargement des mods.
- **Solution**: Remplissez les champs vous-même après `add()` (`linkCombatActions()`, `linkSpells()`, `opposite_traits`).

---

## Enregistré, puis cassé dans le monde

Chaque entrée de cette section a la même cause. Le jeu prépare une partie de chaque asset **une seule fois, pendant le chargement**, et votre mod enregistre ses assets après. Rien ne vous prévient : l'asset existe, il a un nom, et la première fois que le jeu s'en sert vraiment, ça plante. La solution a toujours la même forme aussi : faites cette étape vous-même, juste après avoir enregistré l'asset :wbfacepalm:.

### Votre créature déclenche une erreur d'ombre

- **Ce que vous voyez**: `ActorAssetLibrary: Shadow size is too small : (0.00, 0.00)`, trois fois par créature, et un popup d'erreur en jeu.
- **Pourquoi**: La bibliothèque mesure le sprite d'ombre de chaque acteur au démarrage. Une créature ajoutée après n'est jamais mesurée.
- **Solution**: `asset.texture_asset.loadShadow();` après le clone. Voir **[Acteurs personnalisés](#/nml/custom-actors)**.

### Votre trait, objet ou créature reste verrouillé

- **Ce que vous voyez**: Il existe, mais le livre des connaissances l'affiche en gris et le joueur ne peut pas l'utiliser tant qu'il n'est pas apparu dans un monde.
- **Pourquoi**: `needs_to_be_explored` vaut `true` par défaut sur tout ce qui se débloque : acteurs, les sept types de traits, objets, modificateurs et lois du monde.
- **Solution**: `needs_to_be_explored = false` à la création. Voir **[Traits personnalisés](#/nml/custom-traits)**.

### Le jeu plante en chargeant votre arme ou votre nourriture

- **Ce que vous voyez**: `ArgumentNullException: Value cannot be null. Parameter name: key` dans `ItemLibrary.loadSprites()` ou `ResourceLibrary.loadSprites()`.
- **Pourquoi**: Les armes reçoivent `path_gameplay_sprite`, et les ressources `full_sprite_path`, déduits dans `post_init()` pendant le chargement du jeu. Les vôtres restent `null`.
- **Solution**: Définissez-les vous-même. Voir **[Objets personnalisés](#/nml/custom-items)** et **[Ressources et nourriture](#/nml/resources)**.

### Un nuage plante dès qu'il apparaît

- **Ce que vous voyez**: `NullReferenceException` dans `Cloud.prepare()` la première fois que votre nuage apparaît.
- **Pourquoi**: `CloudLibrary` transforme `path_sprites` en `cached_sprites` et `color_hex` en `color` en une passe au démarrage.
- **Solution**: Faites les deux vous-même après `add()`. Voir **[Nuages et météo](#/nml/clouds)**.

### Poser votre bâtiment lance Index was out of range

- **Ce que vous voyez**: `ArgumentOutOfRangeException: Index was out of range` dans `Building.setAnimData()` au moment où on en pose un.
- **Pourquoi**: Les frames des bâtiments sont préchargés pour tous au démarrage. Le vôtre a une liste de frames vide, ou son dossier n'a pas de `main_0.png`.
- **Solution**: `shrine.loadBuildingSprites();` dès que `sprite_path` est défini, et des frames nommés `main_0`, `construction_0`, `ruin_0`, `mini_0`. Voir **[Bâtiments personnalisés](#/nml/custom-buildings)**.

### Votre bâtiment plante à chaque frame où il est visible

- **Ce que vous voyez**: Des centaines de `NullReferenceException` dans `DynamicSprites.getRecoloredBuilding()`, une par frame tant qu'il est à l'écran.
- **Pourquoi**: L'atlas qui peint un bâtiment aux couleurs de son propriétaire, `atlas_asset`, est relié dans `checkAtlasLink()` au démarrage. Un clone ne le garde pas.
- **Solution**: `shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);`

### La minicarte plante dès que votre bâtiment existe

- **Ce que vous voyez**: `NullReferenceException` dans `Building.getColorForMinimap()` à chaque redessin de la minicarte.
- **Pourquoi**: Le point de la minicarte vient de `mini_0.png` dans le dossier du bâtiment, et il n'y en a pas.
- **Solution**: Ajoutez `mini_0.png`, un pixel par tile couvert par le bâtiment : 5x4 pour tout ce qui est cloné de `temple_human`.

### Votre tile se peint, puis le rendu de la carte plante

- **Ce que vous voyez**: `NullReferenceException` dans `WorldTilemap.getVariation()` pour chacun de vos tiles à l'écran.
- **Pourquoi**: `TopTileLibrary` charge les PNG de `tiles/<id>/` dans `sprites` au démarrage.
- **Solution**: Chargez-les vous-même avec `addVariation()`. Voir **[Tiles et terrain](#/nml/tiles)**.

### Faire apparaître un animal sur votre tile plante

- **Ce que vous voyez**: `NullReferenceException` dans `Subspecies.generateName()`, seulement sur votre tile et seulement pour les animaux.
- **Pourquoi**: Un clone d'un tile d'herbe garde `is_biome = true` mais pas `biome_asset`, relié dans `linkAssets()` au démarrage. Les animaux ajoutent le biome au nom de leur espèce.
- **Solution**: `moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);`

### Les drops tombent invisibles, ou un projectile plante

- **Ce que vous voyez**: Vos drops tombent sans rien dessiner, ou `ArgumentOutOfRangeException` dans `QuantumSpriteLibrary.drawProjectiles()`.
- **Pourquoi**: Drops, projectiles, statuts, bâtiments et ressources en main lisent leur art avec `getSpriteList()`, qui renvoie les frames *dans* un dossier. Un PNG seul revient en liste vide.
- **Solution**: Un dossier par animation, même pour un seul frame : `drops/hello_ember/hello_ember_0.png`. Voir **[Sprites et ressources](#/nml/sprites-and-resources)**.

### Le log se remplit d'ArgumentNullException venant des projectiles

- **Ce que vous voyez**: Des milliers d'`ArgumentNullException: Value cannot be null` dans `ProjectileManager.updateProjectiles()` tant qu'un projectile est en l'air.
- **Pourquoi**: Un projectile sans tireur n'a pas de royaume, et le gestionnaire utilise le royaume comme clé de dictionnaire à chaque frame.
- **Solution**: Donnez-lui-en un : `pForcedKingdom: World.world.kingdoms_wild.get("nature")`, le propriétaire neutre du jeu lui-même.

### Votre onglet de pouvoirs n'apparaît jamais

- **Ce que vous voyez**: `NullReferenceException` dans `PowersTab.setNewWidth()`, l'onglet manque et vos pouvoirs aussi.
- **Pourquoi**: `recalc()` a été appelé pendant `OnModLoad`. Le `Start()` de l'onglet n'a pas encore tourné, son parent est encore `null`, et l'exception tue toute l'étape.
- **Solution**: Créez l'onglet au chargement, disposez-le depuis `Update()`. Voir **[Onglets et boutons de pouvoirs](#/nml/power-buttons)**.

### La fenêtre des réglages affiche des ids bruts

- **Ce que vous voyez**: `LocalizedTextManager: missing text: strike_radius Description` dans le log.
- **Pourquoi**: NML demande deux clés à chaque ligne de réglage : `<id>` pour le libellé et `<id> Description`, avec une espace et un D majuscule, pour l'infobulle.
- **Solution**: Ajoutez les deux à `Locales/en.json`. Voir **[Réglages du mod](#/nml/mod-config)**.

### Le monde lève une erreur à chaque frame après l'ajout d'un comportement du monde

- **Constat**: `NullReferenceException` dans `MapBox.updateWorldBehaviours()`, à chaque frame dès le chargement de votre mod.
- **Cause**: Le monde conserve un minuteur par comportement, créé lors du démarrage initial de la carte avant votre mod. Le vôtre n'en a pas, et la boucle tente de l'appeler quand même.
- **Solution**: `behaviour.manager = new WorldBehaviour(behaviour);` juste après `add()`. Voir **[Âges du monde et comportements](#/nml/world-ages)**.

### Une catastrophe plante lorsqu'elle écrit dans le journal du monde

- **Constat**: `NullReferenceException` dans le constructeur de `WorldLogMessage`, appelé depuis `WorldLog.logDisaster()`.
- **Cause**: `world_log` est l'identifiant d'un `WorldLogAsset`, pas une clé de texte. Un ID non enregistré renvoie `null`, et le message est construit autour de cette valeur nulle.
- **Solution**: Clonez `$basic_disaster$` sous cet ID et définissez son `locale_id`. Voir **[Catastrophes](#/nml/disasters)**.

### Une catastrophe sans action plante dès qu'elle est tirée au sort

- **Constat**: `NullReferenceException` dans `WorldBehaviourActions.updateDisasters()`, la première fois que le tirage tombe dessus.
- **Cause**: Le tirage appelle `action` sans vérification préalable de nullité. `spawn_asset_unit` seul ne fait rien.
- **Solution**: Pointez `action` vers `AssetManager.disasters.simpleUnitAssetSpawnUsingIslands` ou écrivez votre propre méthode.

### Le premier dirigeant qui évalue votre complot plante

- **Constat**: `NullReferenceException` dans `PlotAsset.checkIsPossible()`.
- **Cause**: `check_is_possible` est appelé sans vérification de nullité chaque fois qu'un dirigeant examine le complot.
- **Solution**: Définissez-le systématiquement. Sans condition particulière, renvoyez `true`. Voir **[Complots](#/nml/plots)**.

### Votre décision, complot, gène ou arme existe mais rien ne l'utilise jamais

- **Constat**: Aucune erreur. L'asset est bien présent dans sa bibliothèque, mais le jeu ne le sélectionne jamais.
- **Cause**: Le jeu pioche dans des listes construites au démarrage : `basic_plots`, les listes de décisions, le pool de mutation des gènes, les pools d'armes, les pools de créneaux d'âges. Le vôtre a été ajouté après coup.
- **Solution**: Ajoutez-le à la liste que le jeu consulte réellement. Chaque page indique laquelle : **[IA et comportements personnalisés](#/nml/custom-ai)**, **[Complots](#/nml/plots)**, **[Traits de sous-espèce](#/nml/subspecies-traits)**, **[Objets personnalisés](#/nml/custom-items)**, **[Âges du monde et comportements](#/nml/world-ages)**.

---
## Compile chez vous, mais pas chez les autres

### `CS0122: inaccessible due to its protection level`

- **Ce que vous voyez**: Le code ne compile pas : `addStatusEffect`, `getHit`, `_localized_text`.
- **Pourquoi**: Ils sont `internal`. NML compile votre `Code/*.cs` contre sa propre copie **publicized** (`StreamingAssets/Mods/NML/Assembly-CSharp-Publicized.dll`), donc dans un mod source normal ils marchent, point. L'erreur apparaît quand vous compilez votre propre `.dll` dans Visual Studio contre l'`Assembly-CSharp.dll` d'origine, qui les cache.
- **Solution**: Référencez cette copie publicized dans votre projet, ou prenez la voie publique :

| Au lieu de | Utilisez |
| --- | --- |
| `actor.addStatusEffect("x", 20f)` | `World.world.statuses.newStatus(actor, AssetManager.status.get("x"), 20f)` |
| `actor.getHit(5f, ...)` | `actor.changeHealth(-5)` |
| `LocalizedTextManager.instance._localized_text[k] = v` | `LM.Add("en", k, v)` puis `LM.ApplyLocale(false)` |

### Fonctionne sur votre machine, ne fait rien chez eux

- **Ce que vous voyez**: Le mod se charge sans contenu ou plante dès la première ligne.
- **Pourquoi**: Chemins absolus avec votre nom d'utilisateur, zip mal structuré, GUID modifié ou présence simultanée de `Code/` et d'une `.dll`.
- **Solution**: Utilisez `GetDeclaration().FolderPath`, compressez tout le dossier, fixez le GUID de façon définitive.

---

## Fonctionne au début, puis plante plus tard

### Un autre mod remplace silencieusement votre contenu

- **Ce que vous voyez**: Votre trait disparaît lorsqu'un autre mod spécifique est actif (`duplicate asset - overwriting...`).
- **Pourquoi**: Espace de noms unique partagé par tous les mods. Le dernier enregistré écrase les autres.
- **Solution**: Préfixez tous les IDs : `hello_swift`. Protégez avec `if (AssetManager.traits.has(SWIFT)) return;`.

### Crash sur `World.world` pendant le chargement du mod

- **Ce que vous voyez**: Crash dès la première ligne touchant la carte.
- **Pourquoi**: `OnModLoad` s'exécute avant la création du monde.
- **Solution**: Enregistrez dans `OnModLoad`, touchez au monde dans `Update()` sous `if (!Config.game_loaded) return;`.

### Vos données prennent le contrôle des mauvaises créatures

- **Ce que vous voyez**: Après chargement de sauvegarde, des unités sans rapport agissent bizarrement.
- **Pourquoi**: Les IDs d'unités sont réattribués par monde et les objets `Actor` morts sont recyclés.
- **Solution**: Réinitialisez vos registres lors d'un changement de monde.

### Tout disparaît après sauvegarde / rechargement

- **Ce que vous voyez**: Les unités reprennent leur comportement par défaut malgré le trait.
- **Pourquoi**: Les dictionnaires statiques ne sont pas sauvegardés dans la sauvegarde du jeu.
- **Solution**: Utilisez le trait comme point d'ancrage et restaurez via `trait.action_on_augmentation_load`.

### Les unités se figent par groupes

- **Ce que vous voyez**: Des groupes d'unités s'arrêtent ; une exception par frame dans le log.
- **Pourquoi**: Les boucles d'unités n'ont pas de try/catch ; une erreur bloque toutes les unités suivantes du frame.
- **Solution**: Enveloppez vos patchs et méthodes `execute` dans des blocs try/catch.

### La moitié de vos patchs Harmony n'ont jamais été appliqués

- **Ce que vous voyez**: Seuls deux patchs sur neuf fonctionnent.
- **Pourquoi**: `PatchAll` s'arrête à la première classe de patch invalide.
- **Solution**: Appliquez les patchs classe par classe (voir **[Patchs Harmony](#/nml/harmony-patches)**).

### Votre patch `updateStats` plante chez d'autres joueurs

- **Ce que vous voyez**: Erreurs de concurrence ou de threads chez les testeurs.
- **Pourquoi**: `updateStats` s'exécute en parallèle sur plusieurs threads de travail.
- **Solution**: Ne modifiez que les statistiques locales de l'unité ; différez le reste dans `Update()`.

### Vous avez patché `getHit` et les bâtiments subissent toujours des dégâts

- **Ce que vous voyez**: La règle de dégâts fonctionne sur les unités mais pas sur les bâtiments.
- **Pourquoi**: `getHit` existe séparément sur `Actor` et `Building`.
- **Solution**: Patchez chaque override concret nécessaire.

### Votre Prefix a cassé trois autres mods

- **Ce que vous voyez**: Conflits inexplicables avec d'autres mods.
- **Pourquoi**: Renvoyer `false` annule la méthode originale et tous les patchs suivants d'autres mods.
- **Solution**: Préférez Postfix (`__result *= 0.5f`) plutôt que bloquer avec Prefix.

### Une unité reste immobile pour toujours ou plante à chaque frame

- **Ce que vous voyez**: Unité bloquée sans tâche ou erreurs répétées à chaque tick.
- **Pourquoi**: Un ID de job inconnu provoque un crash à chaque tick.
- **Solution**: Vérifiez rigoureusement vos IDs de tâches et de jobs.

### Votre comportement d'IA personnalisée se réinitialise discrètement

- **Ce que vous voyez**: Les unités reviennent à l'IA de base après un combat ou un respawn.
- **Pourquoi**: Les acteurs recyclés réinitialisent leur délégué de tâche.
- **Solution**: Réassignez périodiquement le délégué d'IA.

### Le jeu saccade quatre fois par seconde

- **Ce que vous voyez**: Micro-saccades régulières malgré de bons FPS.
- **Pourquoi**: Toutes les unités terminent leurs actions en même temps sur le même tick.
- **Solution**: Échelonnez les calculs dans le temps et évitez LINQ / Debug.Log dans les boucles critiques.

### Les clics touchent la carte derrière votre fenêtre

- **Ce que vous voyez**: Un clic dans l'interface fait apparaître une unité sur le terrain.
- **Pourquoi**: Le canvas n'a pas de `GraphicRaycaster` ou d'image d'arrière-plan.
- **Solution**: Associez Canvas, Raycaster et Image de fond, et désarmez le pouvoir actif à l'ouverture.

### La mémoire augmente à chaque ouverture de panneau

- **Ce que vous voyez**: La RAM augmente continuellement.
- **Pourquoi**: Les textures créées dynamiquement doivent être libérées avec `Destroy()`.
- **Solution**: Détruisez vos propres textures à la fermeture (ne détruisez pas celles de `SpriteTextureLoader`).

### Une nouvelle valeur par défaut n'atteint pas les joueurs existants

- **Ce que vous voyez**: Les modifications de `default_config.json` ne s'appliquent pas aux joueurs existants.
- **Pourquoi**: Les valeurs sont enregistrées dans `mods_config\<UID>.config`.
- **Solution**: Utilisez un nouvel identifiant de paramètre pour forcer la mise à jour.

### Un curseur de paramètres bouge, votre callback ne s'exécute jamais

- **Ce que vous voyez**: La valeur est enregistrée mais la méthode n'est jamais appelée.
- **Pourquoi**: La méthode doit être statique avec la signature de type exacte.
- **Solution**: Précisez le namespace, rendez la méthode statique et ajustez le type de paramètre.

---

## Toujours bloqué ?

Posez votre question dans **[Feedback et requêtes](#/feedback)** avec trois lignes courtes et la ligne du journal d'erreur :aPES4_Noted:.
