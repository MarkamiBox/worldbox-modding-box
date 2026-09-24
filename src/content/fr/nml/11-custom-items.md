---
title: Objets personnalisés
group: Contenu du jeu
subgroup: Objets et équipement
icon: :wbcrystalsword:
order: 120
---

# Objets personnalisés :wbcrystalsword:

Armes, armures, anneaux et amulettes résident tous dans `AssetManager.items` sous la classe `EquipmentAsset`.

La première chose à comprendre est qu'**il n'existe aucun objet "épée" générique doté d'un champ matériau que l'on choisirait dynamiquement**. Il existe `sword_wood`, `sword_stone`, `sword_copper`, `sword_bronze`, `sword_silver`, `sword_iron`, `sword_steel`, `sword_mythril`, `sword_adamantine`. Neuf assets distincts, chacun avec ses coûts, ses statistiques et sa chaîne `material`. Même topo pour chaque pièce d'armure, chaque arc et chaque amulette.

Voilà pourquoi le clonage n'est pas seulement le chemin facile ici : c'est le seul qui soit sensé.

## Les modèles (templates)

Les identifiants commençant par `$` sont des modèles qui contiennent tout le câblage d'une famille d'armes complète :

`$equipment` · `$weapon` · `$melee` · `$range` · `$sword` · `$axe` · `$hammer` · `$spear` · `$bow` · `$helmet` · `$armor` · `$boots` · `$ring` · `$amulet` · `$accessory`

`$sword` définit déjà `equipment_subtype`, `is_pool_weapon`, `pool_rate`, l'animation de taillade, les modèles de noms et le `group_id`. Vous voulez tout cela.

## Créer une arme

> [!WARNING] Une arme sans chemin de sprite tue le chargeur
> Pour chaque arme de pool, le jeu met `path_gameplay_sprite` à `items/weapons/w_<id>` et `path_icon` à `ui/Icons/items/icon_<id>`. Il le fait dans `post_init()`, pendant son propre chargement, donc ton arme n'est pas encore dans la liste et les deux champs restent `null`. Le préchargeur appelle alors `getSpriteList(null)` et le chargement meurt sur `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:.
>
> Mets-les toi-même. Pointe vers tes fichiers dans `GameResources/`, ou réutilise une paire vanilla le temps de tester le reste.

```csharp Mods/HelloBox/Code/HelloItems.cs
namespace HelloBox
{
    public static class HelloItems
    {
        public const string EMBER_BLADE = "hello_sword_ember";

        public static void Initialize()
        {
            if (AssetManager.items.has(EMBER_BLADE)) return;

            // clone() copies every field, renames it, and registers it. No add() afterwards.
            EquipmentAsset blade = AssetManager.items.clone(EMBER_BLADE, "$sword");

            blade.material = "ember";              // the material name used in its display name
            blade.metallic = true;                 // decides hit and clash sounds
            blade.equipment_value = 45;            // "how good is this" score the AI compares
            blade.rigidity_rating = 5;
            blade.quality = Rarity.R2_Epic;        // minimum quality it can roll at

            // What a city needs to forge it.
            blade.setCost(0, "common_metals", 4);
            blade.minimum_city_storage_resource_1 = 10;

            // Stats. clone() already ran add(), so base_stats exists.
            blade.base_stats["damage"] = 9f;
            blade.base_stats["critical_chance"] = 0.08f;
            blade.base_stats["attack_speed"] = 2f;

            blade.path_slash_animation = "effects/slashes/slash_fire";

            // The game derives these two in post_init(), which ran before your mod existed.
            // Set them yourself or the sprite preloader throws on a null path.
            blade.path_gameplay_sprite = "items/weapons/w_hello_sword";   // in-hand sprite in GameResources/
            blade.path_icon = "ui/Icons/items/icon_hello_sword";

            // visible immediately: no need to discover them first
            blade.needs_to_be_explored = false;

            // linkAssets() sorted every item into these lists at startup. Cities forge from
            // the subtype list, and new weapons roll from the pools: skip this and nobody
            // ever makes yours.
            AssetManager.items.equipment_by_subtypes[blade.equipment_subtype].Add(blade);
            if (blade.is_pool_weapon)
            {
                AssetManager.items.pot_weapon_assets_all.Add(blade);
                AssetManager.items.pot_weapon_assets_unlocked.Add(blade);
            }

            // Optional: code that runs on every hit landed with it.
            blade.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                if (pTile == null) return false;

                World.world.drop_manager.spawn(pTile, "fire", 10f, -1f, -1L);
                return true;
            };
        }
    }
}
```

> [!WARNING] Enregistré ne signifie pas forgé
> Une ville choisit ce qu'elle forge dans `equipment_by_subtypes` (une liste par sous-type d'arme), et les nouvelles armes piochées au hasard proviennent de `pot_weapon_assets_all` et `pot_weapon_assets_unlocked`. `ItemLibrary.linkAssets()` remplit ces trois listes au démarrage avant votre mod. Sans les quatre lignes vers la fin, votre arme existe et peut être donnée par code, mais aucun forgeron du monde n'en fabriquera jamais :PES5_Hmmmm:. Les armures et accessoires utilisent `pot_equipment_by_groups_all` et `pot_equipment_by_groups_unlocked` (indexées par `group_id`) au lieu des deux pools d'armes.


## Les champs de l'asset

### Identity

| Champ | Ce qu'il fait |
| --- | --- |
| `material` | Le nom du matériau. Composant du nom affiché et critère de mise à niveau pour l'IA |
| `equipment_type` | `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet`. L'emplacement d'équipement |
| `equipment_subtype` | `sword`, `axe`, `bow`, … La classe d'arme. Les cultures ont des préférences par sous-type |
| `group_id` | L'onglet d'équipement. Voir **[Groupes de traits et onglets](#/nml/trait-groups)** |
| `attack_type` | Comportement en mêlée ou à distance |
| `quality` | La qualité minimale lors de la génération |
| `rarity`, `pool_rate` | Fréquence de tirage par le générateur |
| `is_pool_weapon` | Détermine si l'objet entre dans la réserve générale des armes |

### Coût et valeur

Gardez des prix raisonnables. Une épée en fer à 43 millions de pièces, ce n'est pas de l'équilibrage, c'est une arnaque :trollface:.

| Champ | Ce qu'il fait |
| --- | --- |
| `setCost(gold, res1, amount1, res2, amount2)` | L'unique méthode qui configure tous les coûts ensemble. À préférer aux champs séparés |
| `minimum_city_storage_resource_1` | La ville refusera de la forger si ses réserves passent sous ce seuil |
| `equipment_value` | Puissance estimée par l'IA. Guide le choix "ce guerrier doit-il changer d'équipement" |
| `durability`, `rigidity_rating` | Durabilité et solidité |

### Apparence visuelle et rendu

| Champ | Ce qu'il fait |
| --- | --- |
| `path_gameplay_sprite` | Le sprite tenu en main par l'unité |
| `colored`, `animated` | Teinté dynamiquement ou animé |
| `path_slash_animation` | L'effet visuel de frappe |
| `projectile` | Pour les armes à distance, quel projectile est tiré. Voir **[Projectiles, sorts et effets](#/nml/projectiles-spells)** |
| `name_class`, `name_templates` | Règles de nommage des versions légendaires |

### Behaviour

C'est ici qu'un objet cesse d'être un tas de nombres.

| Champ | Ce qu'il fait |
| --- | --- |
| `action_attack_target` | S'exécute à chaque coup porté |
| `action_special_effect` + `special_effect_interval` | S'exécute périodiquement tant que l'objet est équipé |
| `item_modifier_ids` | Enchantements pouvant apparaître dessus. Voir **[Enchantements d'armes](#/nml/item-modifiers)** |
| `addSpell(id)` | Sort accordé au porteur |
| `addCombatAction(id)` | Technique de combat accordée |


## Un effet lorsqu'il est tenu en main

"Quiconque tient la Lame de braise devient Rapide" ressemble à un trait attaché à un objet. Les objets ne portent pas de traits, mais ils exécutent du code sur un minuteur lorsqu'ils sont équipés (`action_special_effect` du tableau ci-dessus), et un **statut** expire de lui-même. L'objet réapplique donc en continu un statut court, et lorsque l'objet disparaît, le statut expire simplement :

```csharp Mods/HelloBox/Code/HelloItems.cs
blade.special_effect_interval = 1f;
blade.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    StatusAsset status = AssetManager.status.get(HelloStatus.CURSED);
    if (status == null) return false;

    // 3 secondes, rafraîchi chaque seconde tant qu'il est tenu. Lâchez la lame et il s'estompe
    World.world.statuses.newStatus(actor, status, 3f);
    return true;
};
```

Le statut nécessite `allow_timer_reset = true` (la valeur par défaut pour un nouveau `StatusAsset`, mais pas pour tous les statuts vanilla dont vous pourriez vous inspirer), sinon le réappliquer avant l'expiration ne fait rien et il s'éteindra en plein combat. Dans HelloBox, la lame maudit son propre porteur, ce qui est exactement ce que ferait une lame de braise :wbfacepalm:.

Pourquoi pas un trait : un trait reste jusqu'à ce que quelque chose le retire, vous auriez donc besoin d'un second minuteur pour détecter que la lame a disparu et l'enlever. Un statut se nettoie tout seul.

## Ton propre sprite

Un objet possède deux éléments graphiques, gérés par deux champs séparés :

```text
HelloBox/
└── GameResources/
    ├── items/
    │   └── weapons/
    │       ├── sprites.json                 <- bottom-center pivot
    │       └── w_hello_sword/
    │           └── w_hello_sword.png        <- what the unit holds
    └── effects/slashes/
        └── slash_fire.png                   <- the swing
```

```csharp
blade.path_gameplay_sprite = "items/weapons/w_hello_sword";
blade.path_slash_animation = "effects/slashes/slash_fire";
```

> [!NOTE] Les armes nécessitent un dossier pour LoadAll
> Le préchargeur d'armes du jeu appelle `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, qui exécute `Resources.LoadAll<Sprite>`. Dans NeoModLoader, `LoadAll` effectue sa recherche par nom de dossier. Si `path_gameplay_sprite` vaut `"items/weapons/w_hello_sword"`, NML cherche un dossier dans `GameResources/items/weapons/w_hello_sword/`. Si vous ne placez qu'un fichier isolé `w_hello_sword.png` sans le dossier, `LoadAll` ne trouve aucun répertoire, renvoie 0 sprite et le jeu consigne `Weapon Texture is Missing`. Placer le sprite dans un dossier portant ce nom résout le problème.

> [!NOTE] Les armes nécessitent un dossier pour LoadAll
> Le préchargeur d'armes du jeu appelle `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, qui exécute `Resources.LoadAll<Sprite>`. Dans NeoModLoader, `LoadAll` effectue sa recherche par nom de dossier. Si `path_gameplay_sprite` vaut `"items/weapons/w_hello_sword"`, NML cherche un dossier dans `GameResources/items/weapons/w_hello_sword/`. Si vous ne placez qu'un fichier isolé `w_hello_sword.png` sans le dossier, `LoadAll` ne trouve aucun répertoire, renvoie 0 sprite et le jeu consigne `Weapon Texture is Missing`. Placer le sprite dans un dossier portant ce nom résout le problème.

> [!NOTE] Les armes nécessitent un dossier pour LoadAll
> Le préchargeur d'armes du jeu appelle `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, qui exécute `Resources.LoadAll<Sprite>`. Dans NeoModLoader, `LoadAll` recherche par nom de dossier. Si `path_gameplay_sprite` vaut `"items/weapons/w_hello_sword"`, NML recherche un répertoire `GameResources/items/weapons/w_hello_sword/`. Si vous placez uniquement un fichier isolé `w_hello_sword.png` sans dossier, `LoadAll` ne trouve rien, renvoie 0 sprite et le jeu inscrit `Weapon Texture is Missing`. Placer le sprite dans un sous-dossier portant ce nom règle le souci.

Un sprite d'arme est affiché à l'échelle de l'unité et réclame un point de pivot en bas au centre (`PivotX: 0.5, PivotY: 0.0` dans `sprites.json`), sous peine de flotter à côté de la main (voir **[Sprites et ressources](#/nml/sprites-and-resources)**).

Laisser l'un ou l'autre champ pointer sur la valeur vanilla (comme `"items/weapons/w_sword_iron"`) utilisera le visuel officiel du jeu, ce qui est une très bonne façon de sortir une première arme :PESgn_Neat:.

## Une gamme complète de matériaux

Même souci qu'avec les créatures : un seul objet comble rarement le besoin. Neuf matériaux imposent neuf assets, et neuf copier-coller imposent neuf endroits où corriger un bug.

```csharp
private struct Mat
{
    public string Suffix;
    public int Value;
    public float Damage;
    public int Cost;
}

private static readonly Mat[] Mats = new Mat[]
{
    new Mat { Suffix = "copper", Value = 15, Damage = 4f, Cost = 2 },
    new Mat { Suffix = "iron",   Value = 30, Damage = 6f, Cost = 3 },
    new Mat { Suffix = "steel",  Value = 40, Damage = 7f, Cost = 4 },
};

private static void RegisterLine(string pPrefix, string pTemplate)
{
    for (int i = 0; i < Mats.Length; i++)
    {
        string id = pPrefix + "_" + Mats[i].Suffix;
        if (AssetManager.items.has(id)) continue;

        EquipmentAsset item = AssetManager.items.clone(id, pTemplate);
        item.material = Mats[i].Suffix;
        item.metallic = true;
        item.equipment_value = Mats[i].Value;
        item.setCost(0, "common_metals", Mats[i].Cost);
        item.base_stats["damage"] = Mats[i].Damage;
    }
}

// RegisterLine("hello_glaive", "$spear");
```

## Les textes et la localisation

Les objets se nomment différemment de tout le reste dans ce guide, ce qui surprend tout le monde, moi compris :PESgn_Oops:. Le nom affiché d'un objet se déduit ainsi :

```text
translation_key   ?? "item_" + (equipment_subtype ?? id)
```

L'épée ci-dessus, clonée depuis `$sword`, hérite de `equipment_subtype = "sword"` et s'affiche sous le nom **Épée** (la clé vanilla), et non avec votre identifiant. Deux solutions :

```csharp
blade.translation_key = "hello_sword_ember";   // nom personnalisé, tout en restant un sous-type épée
```

Ou laisser le sous-type tel quel et laisser le **matériau** faire le travail, comme le jeu de base : chaque épée s'appelle "Épée", et `sword_iron` devient "Épée de fer" grâce à sa clé de matériau.

```json Mods/HelloBox/Locales/en.json
{
  "hello_sword_ember": "Ember Blade",
  "hello_sword_ember_description": "Forged in something that is still angry about it.",

  "item_mat_ember": "Ember"
}
```

| Clé | D'où elle provient |
| --- | --- |
| `item_<subtype>` ou votre `translation_key` | Le nom |
| `<id>_description` | L'infobulle |
| `item_mat_<material>` | Le terme désignant le matériau |

Un nouveau matériau nécessite **toujours** sa clé `item_mat_`, sinon votre arme affichera une clé brute en préfixe de son nom.

## Mettre l'objet entre les mains d'une unité

Un **asset** est la recette. Un **item** est l'instance concrète tenue par une créature donnée, avec sa qualité tirée au sort, ses modificateurs et son nom. Deux étapes :

```csharp
EquipmentAsset asset = AssetManager.items.get(HelloItems.EMBER_BLADE);
if (asset == null || actor == null) return;

// 1. instancier un véritable objet d'après la recette
Item item = World.world.items.generateItem(asset, actor.kingdom, actor.getName(), 1, actor);

// 2. l'équiper - setItem choisit l'emplacement adéquat selon equipment_type
actor.equipment.setItem(item, actor);
```

`generateItem` détermine la qualité et les enchantements comme le ferait le butin généré naturellement, donc l'objet remis à l'unité n'est jamais rigoureusement identique à l'asset enregistré.

## Outils en main

Le marteau qu'un bâtisseur manie et le panier qu'un cueilleur transporte ne sont pas des objets d'équipement. Ce sont des **outils de main** : de simples visuels affichés tant qu'une tâche l'exige, et masqués dès qu'elle prend fin.

```csharp Mods/HelloBox/Code/HelloTools.cs
using ai.behaviours;   // BehaviourTaskActor

namespace HelloBox
{
    public static class HelloTools
    {
        public const string TORCH = "hello_torch";

        public static void Initialize()
        {
            if (AssetManager.unit_hand_tools.has(TORCH)) return;

            UnitHandToolAsset torch = new UnitHandToolAsset
            {
                id = TORCH,
                path_gameplay_sprite = "items/tools/tool_hello_torch"   // a folder of frames
            };

            AssetManager.unit_hand_tools.add(torch);

            // loadSprites() ran at startup. An empty list here is a hand holding nothing.
            torch.gameplay_sprites = SpriteTextureLoader.getSpriteList(torch.path_gameplay_sprite);

            // A tool shows up while a task forces it. Give it to the task from the AI page.
            BehaviourTaskActor drive = AssetManager.tasks_actor.get(HelloAI.TASK);
            if (drive != null) drive.force_hand_tool = TORCH;
        }
    }
}
```

Une tâche affiche son outil via `force_hand_tool`, donc la torche apparaîtra dès qu'une créature exécutera la tâche d'errance issue de **[IA et comportements personnalisés](#/nml/custom-ai)**.

> [!WARNING] Chargez les images vous-même
> `UnitHandToolLibrary.loadSprites()` remplit `gameplay_sprites` pour chaque outil au démarrage. Un outil ajouté après coup n'en possède aucun et l'unité tiendra du vide. Le chemin étant lu avec `getSpriteList()`, il doit s'agir d'un **dossier** d'images (`items/tools/tool_hello_torch/`), même pour une image unique. Sans pivot dans `sprites.json`, l'outil se positionnera au centre du sprite : parfait pour une torche, mais inadapté pour un manche long.

| Champ | Ce qu'il fait |
| --- | --- |
| `path_gameplay_sprite` | Le dossier. Le jeu le renseigne à partir de l'ID : `items/tools/tool_<id>` |
| `animated` | Joue les images en boucle, comme la tasse de café |
| `colored` | Teinte l'outil avec la couleur du royaume, comme le drapeau |

> [!TIP] Enchantements d'abord, armes ensuite
> Une nouvelle arme nécessite des sprites, une lignée de matériaux, des coûts et de l'équilibrage. Un nouveau **modificateur** ne demande que vingt lignes et s'applique à toutes les armes du jeu, y compris celles d'autres mods. Si vous voulez transformer le jeu dès ce soir, lisez d'abord **[Enchantements d'armes](#/nml/item-modifiers)** :PESgn_DoIt:.
