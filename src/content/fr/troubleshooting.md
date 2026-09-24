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

**Utiliser des mods (pas en créer)**

| Symptôme | |
| --- | --- |
| Déluge de texte rouge, `Missing className: NeoModLoader (1).WorldBoxMod` | [aller](#inondation-de-texte-rouge-missing-classname) |
| NML marchait, le jeu s'est mis à jour, et maintenant les mods sont rouges ou "failed" | [aller](#les-mods-sont-en-rouge-ou-failed-après-une-mise-à-jour-du-jeu) |
| Le jeu est sur une ancienne version et NML ne se charge pas | [aller](#le-jeu-est-sur-une-ancienne-version) |
| Le jeu est devenu lent, ou se fige, avec des mods | [aller](#le-jeu-est-devenu-lent-ou-se-fige-avec-les-mods-actifs) |
| Un monde ne se charge plus | [aller](#un-monde-refuse-de-se-charger) |
| Un mod BepInEx est installé et n'affiche rien | [aller](#un-mod-bepinex-est-installé-et-n-affiche-rien) |
| Vous avez supprimé un mod et il est toujours là | [aller](#vous-avez-supprimé-un-mod-et-il-est-toujours-présent) |
| Le jeu ne démarre plus du tout | [aller](#le-jeu-ne-démarre-pas-du-tout) |

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
| Crash sur la ligne où vous définissez une statistique (stats) | [aller](#crash-sur-la-ligne-où-vous-définissez-une-statistique) |
| Même crash alors que l'ordre est déjà correct | [aller](#même-crash-alors-que-l-ordre-est-déjà-correct) |
| Votre bâtiment (building) meurt instantanément ou n'a pas de taille | [aller](#votre-bâtiment-meurt-instantanément-ou-n-a-pas-de-taille) |
| Enregistré, mais visible dans aucun onglet | [aller](#enregistré-mais-visible-dans-aucun-onglet) |
| Affiche `trait_hello_swift` au lieu d'un nom | [aller](#affiche-trait-hello-swift-au-lieu-d-un-nom) |
| Les noms fonctionnent pour les traits mais pas pour les objets/statuts (status)/pouvoirs | [aller](#les-noms-fonctionnent-pour-les-traits-mais-pas-pour-les-objets-statuts-pouvoirs) |
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
| Un nuage (cloud) plante dès qu'il apparaît | [aller](#un-nuage-plante-dès-qu-il-apparaît) |
| Poser votre bâtiment lance Index was out of range | [aller](#poser-votre-bâtiment-lance-index-was-out-of-range) |
| Votre bâtiment plante à chaque frame où il est visible | [aller](#votre-bâtiment-plante-à-chaque-frame-où-il-est-visible) |
| La minicarte plante dès que votre bâtiment existe | [aller](#la-minicarte-plante-dès-que-votre-bâtiment-existe) |
| Votre tile se peint, puis le rendu de la carte plante | [aller](#votre-tile-se-peint-puis-le-rendu-de-la-carte-plante) |
| Faire apparaître un animal sur votre tile plante | [aller](#faire-apparaître-un-animal-sur-votre-tile-plante) |
| Les drops tombent invisibles, ou un projectile plante | [aller](#les-drops-tombent-invisibles-ou-un-projectile-plante) |
| Le log se remplit d'ArgumentNullException venant des projectiles | [aller](#le-log-se-remplit-d-argumentnullexception-venant-des-projectiles) |
| Votre onglet de pouvoirs n'apparaît jamais | [aller](#votre-onglet-de-pouvoirs-n-apparaît-jamais) |
| La fenêtre des réglages affiche des ids bruts | [aller](#la-fenêtre-des-réglages-affiche-des-ids-bruts) |
| Le monde lève une erreur à chaque frame après l'ajout d'un comportement (behaviour) du monde | [aller](#le-monde-lève-une-erreur-à-chaque-frame-après-l-ajout-d-un-comportement-du-monde) |
| Une catastrophe plante lorsqu'elle écrit dans le journal du monde | [aller](#une-catastrophe-plante-lorsqu-elle-écrit-dans-le-journal-du-monde) |
| Une catastrophe sans action plante dès qu'elle est tirée au sort | [aller](#une-catastrophe-sans-action-plante-dès-qu-elle-est-tirée-au-sort) |
| Le premier dirigeant qui évalue votre complot (plot) plante | [aller](#le-premier-dirigeant-qui-évalue-votre-complot-plante) |
| Votre décision (decision), complot, gène ou arme existe mais rien ne l'utilise jamais | [aller](#votre-décision-complot-gène-ou-arme-existe-mais-rien-ne-l-utilise-jamais) |

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

Le jeu fait comme si votre mod n'existait pas. Ce n'est rien de personnel, c'est généralement un interrupteur ou un nom de fichier.

### Aucun bouton Mods dans le menu

- **Ce que vous voyez** : Le jeu démarre normalement, aucune erreur, aucun bouton Mods, et aucune ligne `[NML]` nulle part dans le log.
- **Pourquoi** : Deux dossiers s'appellent "Mods". La DLL du chargeur va dans le dossier de données du jeu ; `worldbox\Mods/` est pour *vos* mods.
- **Solution** : Mettez `NeoModLoader.dll` dans `worldbox\worldbox_Data\StreamingAssets\mods/`, redémarrez, et cherchez `[NML]: NeoModLoader Version:` dans le log. Chaque clic, Mac compris : **[Installer NML](#/install-nml)**.

### Fenêtre Mods vide, cela fonctionnait avant

- **Ce que vous voyez**: La fenêtre s'ouvre et n'affiche rien. Aucune erreur.
- **Pourquoi**: Le **Mode Expérimental est désactivé**, et le jeu le désactive de lui-même après chaque mise à jour de WorldBox.
- **Solution**: Paramètres → Mode Expérimental → activé → redémarrer.

### Le dossier du mod est présent mais le mod n'est pas listé

- **Ce que vous voyez** : Rien dans la liste, aucune ligne `Compile Mod <yours>`.
- **Pourquoi** : Par ordre de fréquence : le fichier s'appelle en réalité `mod.json.txt` ; le JSON est invalide (virgule après la dernière entrée, ou guillemets typographiques `"` collés depuis une appli de chat) ; le dossier n'est pas dans `worldbox\Mods/`.
- **Solution** : Explorateur → **Affichage → Afficher → Extensions de noms de fichiers**, puis vérifiez le vrai nom. Ouvrez `mod.json` dans VS Code, qui souligne les erreurs JSON pour vous.

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

- **Ce que vous voyez** : Vous redémarrez, le log dit `Compile Mod`, et le jeu fait toujours tourner votre ancien code. La compilation prend une fraction de seconde.
- **Pourquoi** : Deux dossiers dans `Mods/` ont le même `GUID` dans `mod.json`, typiquement une copie plus ancienne que l'installeur de NML a décompressée sous `COM_YOURNAME_HELLOBOX/`. NML charge **un mod par GUID** et ignore sans rien dire l'autre dossier, qui peut très bien être celui que vous modifiez.
- **Solution** : Cherchez votre GUID dans `Mods/` et gardez exactement un dossier. Si les comptes ne tombent pas juste, c'est la première chose à vérifier.

### Vos changements ne s'affichent jamais, même après redémarrage

- **Ce que vous voyez** : "Vous n'avez pas l'autorisation d'enregistrer à cet emplacement", avec la proposition d'enregistrer dans Documents.
- **Pourquoi** : Le jeu est installé sous `C:\Program Files (x86)/`, que Windows protège.
- **Solution** : Créez d'abord le fichier dans l'Explorateur (clic droit → Nouveau → Document texte, renommez-le), puis modifiez ce fichier existant.

---

## Le jeu se charge, mais rien n'apparaît

NML a trouvé votre mod et l'a exécuté. Quelque chose à l'intérieur n'est jamais arrivé à l'écran.

### Crash sur la ligne où vous définissez une statistique

- **Ce que vous voyez**: `NullReferenceException` dans votre `Initialize()`.
- **Pourquoi**: Un nouvel asset n'a **aucun bloc de statistiques**. La bibliothèque (library) le crée dans `add()`.
- **Solution**: D'abord `add()`, puis les statistiques. Même règle pour les traits, statuts, objets, bâtiments et créatures.

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };
AssetManager.traits.add(swift);      // alloue base_stats
swift.base_stats["speed"] = 20f;     // sûr à partir d'ici
```

`clone()` appelle déjà `add()`, donc après un clone le bloc existe déjà.

### Même crash alors que l'ordre est déjà correct

- **Ce que vous voyez** : La même `NullReferenceException`, sur une ligne de stat qui s'exécute après `add()`.
- **Pourquoi** : Vous avez inventé un nom de stat. Un id de stat inconnu, c'est un crash, pas une opération vide.
- **Solution** : Utilisez de vrais ids : `damage`, `health`, `speed`, `armor`, `attack_speed`, `stamina`, `mana`, `range`, `critical_chance`, `lifespan`, `warfare`. Les multiplicateurs sont à part : `multiplier_damage`, `multiplier_health`, `multiplier_speed`. Liste complète dans **[Référence des stats](#/nml/stats)**.

### Votre bâtiment meurt instantanément ou n'a pas de taille

- **Ce que vous voyez** : Le bâtiment apparaît, puis disparaît, ou ne peut pas être ciblé. Aucune erreur.
- **Pourquoi** : Les valeurs par défaut `health` et `size` d'un bâtiment ne sont définies que dans `add()`, et seulement quand `base_stats` est encore null. Créez le bloc vous-même avant et vous obtenez `health = 0`.
- **Solution** : Ne créez jamais `base_stats` à l'avance. Clonez ou faites `add()` d'abord, puis ne changez que ce qui doit différer.

### Enregistré, mais visible dans aucun onglet

- **Ce que vous voyez** : Votre ligne de log s'affiche, aucune exception, et la chose n'est dans aucune catégorie.
- **Pourquoi** : `group_id` pointe vers un groupe qui n'existe pas, donc il n'y a aucun onglet où la dessiner.
- **Solution** : Utilisez un vrai id de groupe. Traits d'acteur : `cognitive`, `mind`, `spirit`, `physique`, `health`, `body`, `appearance`, `protection`, `skills`, `merits`, `acquired`, `fun`, `fate`, `miscellaneous`, `special`. Votre propre onglet : **[Groupes et onglets de traits](#/nml/trait-groups)**.

### Affiche `trait_hello_swift` au lieu d'un nom

- **Ce que vous voyez** : La clé brute à l'écran, une infobulle vide, `missing text:` dans le log.
- **Pourquoi** : Aucune traduction enregistrée. Le jeu construit la clé lui-même : `trait_<id>` et `trait_<id>_info`.
- **Solution** : Ajoutez ces deux clés à `Locales/en.json`. Attention à `en.json.txt`.

### Les noms fonctionnent pour les traits mais pas pour les objets/statuts/pouvoirs

- **Ce que vous voyez** : Vous avez copié le modèle des traits et celui-ci affiche quand même une clé brute.
- **Pourquoi** : Quatre assets ne construisent **pas** la clé à partir de l'id :

| Asset | Clé du nom | Clé de la description |
| --- | --- | --- |
| `GodPower` | le **champ** `name`, en snake_case | `<name>_description` |
| `ItemAsset` | `translation_key`, sinon `item_<subtype or id>` | `<id>_description`, sans `item_` |
| `StatusAsset` | le **champ** `locale_id` | le **champ** `locale_description` |
| `WorldLawAsset` | `<id>_title` | `<id>_description` |

- **Solution** : Mettez `name` = id sur les pouvoirs, `translation_key` sur les objets, `locale_id` sur les statuts. Gardez les clés en snake_case minuscule : elles sont normalisées à l'enregistrement mais **pas** à la recherche, donc `MyKey` est enregistrée comme `my_key` et n'est plus jamais retrouvée :PESgn_SMH:.

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

- **Ce que vous voyez** : Le curseur ne change pas, cliquer sur la carte ne fait rien.
- **Pourquoi** : Le bouton est lié au pouvoir **par id, au moment de sa création**.
- **Solution** : Enregistrez d'abord le pouvoir, créez le bouton ensuite - dans le même utilitaire, pour que l'ordre ne puisse pas dériver. Et `click_action` est `(WorldTile, string)` ; la forme `(WorldTile, GodPower)` appartient à `click_power_action`.

### `addOpposite` / `addDecision` / `addSpell` ne font rien

- **Ce que vous voyez** : Le trait opposé n'est jamais retiré, la décision ne se déclenche jamais. En silence.
- **Pourquoi** : Ces appels ne font qu'ajouter un **id**. La transformation des ids en vrais objets a lieu une fois au démarrage, avant que votre mod ne charge.
- **Solution** : Remplissez vous-même les champs résolus après `add()` : `linkCombatActions()`, `linkSpells()`, `decisions_assets` (un tableau que vous construisez à partir de `AssetManager.decisions_library.get()`, il n'y a pas de méthode de liaison), et assignez `opposite_traits` directement. Si vous définissez `opposite_trait_mod` et laissez `opposite_traits` à null, le jeu plante plus tard dans son code social - un `HashSet` vide l'en empêche.

---

## Enregistré, puis cassé dans le monde

Chaque entrée de cette section a la même cause. Le jeu prépare une partie de chaque asset **une seule fois, pendant le chargement**, et votre mod enregistre ses assets après. Rien ne vous prévient : l'asset existe, il a un nom, et la première fois que le jeu s'en sert vraiment, ça plante. La solution a toujours la même forme aussi : faites cette étape vous-même, juste après avoir enregistré l'asset :wbfacepalm:. Le mot du jour : contournement.

### Votre créature déclenche une erreur d'ombre

- **Ce que vous voyez**: `ActorAssetLibrary: Shadow size is too small : (0.00, 0.00)`, trois fois par créature, et un popup d'erreur en jeu.
- **Pourquoi**: La bibliothèque mesure le sprite d'ombre de chaque acteur au démarrage. Une créature ajoutée après n'est jamais mesurée.
- **Solution**: `asset.texture_asset.loadShadow();` après le clone. Voir **[Acteurs personnalisés](#/nml/custom-actors)**.

### Votre trait, objet ou créature reste verrouillé

- **Ce que vous voyez**: Il existe, mais le livre (book) des connaissances l'affiche en gris et le joueur ne peut pas l'utiliser tant qu'il n'est pas apparu dans un monde.
- **Pourquoi**: `needs_to_be_explored` vaut `true` par défaut sur tout ce qui se débloque : acteurs, les sept types de traits, objets, modificateurs (modifier) et lois du monde (world law).
- **Solution**: `needs_to_be_explored = false` à la création. Voir **[Traits personnalisés](#/nml/custom-traits)**.

### Le jeu plante en chargeant votre arme ou votre nourriture

- **Ce que vous voyez**: `ArgumentNullException: Value cannot be null. Parameter name: key` dans `ItemLibrary.loadSprites()` ou `ResourceLibrary.loadSprites()`.
- **Pourquoi**: Les armes reçoivent `path_gameplay_sprite`, et les ressources (resource) `full_sprite_path`, déduits dans `post_init()` pendant le chargement du jeu. Les vôtres restent `null`.
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
- **Pourquoi**: Un projectile sans tireur n'a pas de royaume (kingdom), et le gestionnaire utilise le royaume comme clé de dictionnaire à chaque frame.
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

Le classique "ça marche chez moi". La différence vient généralement de votre configuration, pas de votre code :PES5_Hmmmm:.

### `CS0122: inaccessible due to its protection level`

- **Ce que vous voyez** : Du code copié d'un mod qui marche ne compile pas : `addStatusEffect`, `getHit`, `_localized_text`, `addBuilding`.
- **Pourquoi** : Ils sont `internal`. NML compile vos `Code/*.cs` contre sa propre copie **publicisée** (`StreamingAssets/Mods/NML/Assembly-CSharp-Publicized.dll`), donc dans un mod source normal ils marchent tout simplement. L'erreur apparaît quand vous compilez votre propre `.dll` dans Visual Studio contre le `Assembly-CSharp.dll` d'origine, qui les cache.
- **Solution** : Référencez cette copie publicisée dans votre projet, ou prenez la voie publique :

| Au lieu de | Utilisez |
| --- | --- |
| `actor.addStatusEffect("x", 20f)` | `World.world.statuses.newStatus(actor, AssetManager.status.get("x"), 20f)` |
| `actor.getHit(5f, ...)` | `actor.changeHealth(-5)` |
| `LocalizedTextManager.instance._localized_text[k] = v` | `LM.Add("en", k, v)` puis `LM.ApplyLocale(false)` |

### Fonctionne sur votre machine, ne fait rien chez eux

- **Ce que vous voyez** : Des retours disant que le mod se charge sans contenu, ou plante dès la première ligne.
- **Pourquoi** : Presque toujours l'une de quatre choses : un chemin écrit en dur avec votre nom d'utilisateur ; un zip du *contenu* du mod au lieu du *dossier* ; un `GUID` qui a changé entre deux versions ; `Code/` livré à côté d'une `.dll` périmée.
- **Solution** : Dérivez les chemins de `GetDeclaration().FolderPath`. Zippez le dossier. Définissez le `GUID` une fois et ne le changez jamais. Livrez `Code/` **ou** une `.dll`, jamais les deux.

---

## Fonctionne au début, puis plante plus tard

Les lents. Votre mod marchait très bien hier, et rien n'a changé :PES2_Shrug:.

### Un autre mod remplace silencieusement votre contenu

- **Ce que vous voyez** : Votre trait disparaît quand un certain autre mod est actif. Une ligne dans le log, défilée depuis longtemps : `duplicate asset - overwriting...`
- **Pourquoi** : Un seul espace d'ids par bibliothèque, partagé par le vanilla et tous les mods. Le dernier enregistrement gagne, et l'ordre de chargement ne vous appartient pas.
- **Solution** : Préfixez chaque id : `hello_swift`, jamais `swift`. Protégez-vous avec `if (AssetManager.traits.has(SWIFT)) return;`. Pour *modifier* du contenu vanilla, récupérez-le avec `get()` et modifiez-le sur place au lieu d'ajouter un remplaçant.

### Crash sur `World.world` pendant le chargement du mod

- **Ce que vous voyez** : Le crash se produit sur votre première ligne qui touche à la carte.
- **Pourquoi** : `OnModLoad` s'exécute avant qu'aucun monde n'existe. Les bibliothèques d'assets sont prêtes ; le monde, non.
- **Solution** : Enregistrez dans `OnModLoad`, touchez au monde depuis `Update()` derrière `if (!Config.game_loaded) return;` plus une vérification null sur `World.world`, `World.world.units` et `MapBox.instance`.

### Vos données prennent le contrôle des mauvaises créatures

- **Ce que vous voyez**: Après chargement de sauvegarde, des unités sans rapport agissent bizarrement.
- **Pourquoi**: Les IDs d'unités sont réattribués par monde et les objets `Actor` morts sont recyclés.
- **Solution**: Réinitialisez vos registres lors d'un changement de monde.

### Tout disparaît après sauvegarde / rechargement

- **Ce que vous voyez** : Vos unités se comportent de nouveau comme en vanilla, mais portent toujours votre trait.
- **Pourquoi** : Seules les classes de données du jeu sont sérialisées ; votre dictionnaire statique ne l'est pas. Les traits sont sauvegardés sous forme d'ids, et un id **absent de la bibliothèque au chargement est ignoré sans rien dire** - donc désactiver, charger, réactiver, et le trait est retiré de chaque unité.
- **Solution** : Faites du trait le drapeau qui survit et reconstruisez tout à partir de lui : `trait.action_on_augmentation_load = (pActor, pTrait) => MyRegister.Restore(pActor);`
- **Ou** : Gardez l'état dans l'unité elle-même. Son stockage de données personnalisé est sauvegardé avec elle : voir **[Se souvenir des choses](#/nml/saving-data)**.

### Les unités se figent par groupes

- **Ce que vous voyez** : Des groupes d'unités cessent de bouger ; le groupe change à chaque frame. Une exception par frame, pas des milliers.
- **Pourquoi** : Les boucles par unité n'ont pas de try/catch. Une exception sur l'unité *i* saute toutes les unités suivantes pour cette frame.
- **Solution** : Enveloppez le corps de chaque patch et de chaque `execute` de comportement personnalisé dans un try/catch, en renvoyant `BehResult.Stop` en cas d'échec.

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

- **Ce que vous voyez** : "Ton mod a cassé le mod X." Rien dans le log, et l'auteur de X n'arrive pas à le reproduire seul.
- **Pourquoi** : Renvoyer `false` saute l'original **et le patch de tous les autres mods après le vôtre**. Sur `updateStats`, ça laisse aussi pour toujours des drapeaux en cache périmés sur l'unité.
- **Solution** : Préférez un Postfix qui ajuste (`__result *= 0.5f`) à un Prefix qui annule. Quand vous devez annuler, annulez la méthode la plus étroite, et faites `return true` tôt pour tous les cas qui ne vous concernent pas.

### Une unité reste immobile pour toujours ou plante à chaque frame

- **Ce que vous voyez** : Une unité figée sans nom de tâche (task), ou une trace de pile à chaque tick.
- **Pourquoi** : Un id de **tâche** inconnu est une opération vide, silencieuse et permanente ; un id de **métier** (job) inconnu est un crash à chaque tick.
- **Solution** : Vérifiez vos ids une fois au chargement, enregistrez les tâches avant le métier qui les liste, et ne donnez jamais à `next_job_delegate` un id que vous n'avez pas vérifié.

### Votre comportement d'IA personnalisée se réinitialise discrètement

- **Ce que vous voyez** : Au bout d'un moment, certaines unités sont revenues à l'IA vanilla alors que votre registre les liste toujours.
- **Pourquoi** : Les acteurs sont mis en pool : une unité "nouvelle" est un objet recyclé dont le délégué de métier vient d'être réinitialisé. Le combat le réinitialise aussi.
- **Solution** : Réimposez-le selon votre propre horloge au lieu d'une seule fois : `if (pActor.ai.next_job_delegate != MyAI.NextJob) pActor.ai.next_job_delegate = MyAI.NextJob;`

### Le jeu saccade quatre fois par seconde

- **Ce que vous voyez** : Les FPS moyens semblent corrects, le jeu saccade en rythme, aucune fonction chaude en particulier.
- **Pourquoi** : Tout réfléchit au même tick, et les unités n'avancent que quand leur action actuelle se termine, donc elles finissent ensemble.
- **Solution** : Réfléchissez sur votre propre minuteur, pas dans `execute`. Découpez la population en tranches et traitez une tranche par passage. Préallouez les listes ; gardez LINQ, les lambdas et `Debug.Log` hors de ce chemin.

### Les clics touchent la carte derrière votre fenêtre

- **Ce que vous voyez** : Le joueur clique sur un contrôle de votre panneau et une unité apparaît en dessous.
- **Pourquoi** : Un canvas sans `GraphicRaycaster` est dessiné mais pas testé pour les clics. Et `unselect_when_window` ne connaît que les fenêtres du jeu, donc un panneau fait main ne désarme jamais le pouvoir actif.
- **Solution** : `Canvas` + `overrideSorting` + `sortingOrder` + `GraphicRaycaster` + une `Image` de fond, ensemble. `raycastTarget = false` sur les libellés. Désarmez vous-même le pouvoir quand la fenêtre s'ouvre.

### La mémoire augmente à chaque ouverture de panneau

- **Ce que vous voyez** : La mémoire grimpe par paliers à chaque ouverture du panneau ; les longues sessions se dégradent.
- **Pourquoi** : `Destroy(root)` libère l'arborescence de GameObject, mais une `Texture2D` ou un `Sprite` que **vous** avez créé est un objet séparé que personne ne récupère.
- **Solution** : Détruisez ce que vous avez créé et mettez les références à null. Ne détruisez **pas** les sprites qui viennent de `SpriteTextureLoader` - ils sont partagés.

### Une nouvelle valeur par défaut n'atteint pas les joueurs existants

- **Ce que vous voyez** : Vous changez une valeur par défaut dans `default_config.json` et les joueurs qui reviennent gardent l'ancienne. Les nouvelles installations vont bien.
- **Pourquoi** : Ce fichier n'est qu'un modèle. Les vraies valeurs vivent dans `mods_config\<UID>.config`, qui stocke **l'élément entier** - donc les bornes modifiées et les callbacks renommés sont masqués aussi.
- **Solution** : Testez avec ce fichier supprimé. Quand des bornes ou un callback doivent changer pour les utilisateurs existants, ajoutez un nouvel `Id` au lieu de modifier l'ancien.

### Un curseur de paramètres bouge, votre callback ne s'exécute jamais

- **Ce que vous voyez** : La ligne fonctionne, la valeur est enregistrée, votre méthode n'est jamais appelée.
- **Pourquoi** : Le callback est `Namespace.Type:MethodName`, la méthode doit être **static**, et son paramètre doit correspondre au type (`INT_SLIDER` → `int`, `SLIDER` → `float`, `SWITCH` → `bool`, `TEXT` → `string`).
- **Solution** : Incluez le namespace, rendez-la static, faites correspondre le type. Les changements s'appliquent quand la fenêtre se **ferme**, pas pendant le glissement.

---

## Toujours bloqué ?

Posez votre question dans **[Feedback et requêtes](#/feedback)** avec trois lignes courtes et la ligne du journal d'erreur :aPES4_Noted:.
