---
title: Custom items
group: Game Content
subgroup: Items & Equipment
icon: :wbcrystalsword:
order: 120
---

# Custom items :wbcrystalsword:

Weapons, armour, rings and amulets all live in `AssetManager.items` as `EquipmentAsset`.

The first thing to understand is that **there is no "sword" item with a material field you pick at runtime**. There is `sword_wood`, `sword_stone`, `sword_copper`, `sword_bronze`, `sword_silver`, `sword_iron`, `sword_steel`, `sword_mythril`, `sword_adamantine`. Nine separate assets, each with its own cost, stats and `material` string. Same for every armour piece, every bow, every amulet.

That is why cloning is not just the easy path here, it is the only sane one.

## The templates

Ids starting with `$` are templates, and they carry the wiring for a whole weapon class:

`$equipment` · `$weapon` · `$melee` · `$range` · `$sword` · `$axe` · `$hammer` · `$spear` · `$bow` · `$helmet` · `$armor` · `$boots` · `$ring` · `$amulet` · `$accessory`

`$sword` already sets `equipment_subtype`, `is_pool_weapon`, `pool_rate`, the slash animation, the name templates and `group_id`. You want all of that.

## A weapon

> [!WARNING] A weapon without a sprite path crashes the loader
> For every pool weapon the game sets `path_gameplay_sprite` to `items/weapons/w_<id>` and `path_icon` to `ui/Icons/items/icon_<id>`. It does that in `post_init()`, during its own load, so your weapon is not in the list yet and both fields stay `null`. The preloader then calls `getSpriteList(null)` and the load throws `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:.
>
> Set both yourself. Point them at your own files under `GameResources/`, or reuse a vanilla pair while you are still testing the rest.

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

> [!WARNING] Registered is not the same as forged
> A city picks what to forge from `equipment_by_subtypes`, one list per weapon kind, and new pool weapons roll from `pot_weapon_assets_all` and `pot_weapon_assets_unlocked`. `ItemLibrary.linkAssets()` fills all three at startup, before your mod. Without the four lines near the end, your weapon exists, spawns when you give it to someone, and no smith in the world ever makes one :PES5_Hmmmm:. Armour and accessories use `pot_equipment_by_groups_all` and `pot_equipment_by_groups_unlocked`, keyed by `group_id`, instead of the two weapon pools.

## The fields

### Identity

| Field | What it does |
| --- | --- |
| `material` | The material name. Part of the display name, and what the game compares for upgrades |
| `equipment_type` | `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet`. Which slot it fills |
| `equipment_subtype` | `sword`, `axe`, `bow`, … The weapon class. Cultures prefer by subtype |
| `group_id` | The equipment category tab. See **[Trait groups & tabs](#/nml/trait-groups)** |
| `attack_type` | Melee or ranged behaviour |
| `quality` | The minimum rarity it can appear at |
| `rarity`, `pool_rate` | How often the generator picks it |
| `is_pool_weapon` | Whether it goes in the general weapon pool at all |

### Cost and value

| Field | What it does |
| --- | --- |
| `setCost(gold, res1, amount1, res2, amount2)` | The one call that sets every cost field. Use it instead of setting them individually |
| `minimum_city_storage_resource_1` | The city will not forge it below this stock |
| `equipment_value` | How good the AI thinks it is. Drives "should this soldier upgrade" |
| `durability`, `rigidity_rating` | How long it lasts |

### Look and feel

| Field | What it does |
| --- | --- |
| `path_gameplay_sprite` | The sprite in a unit's hand |
| `colored`, `animated` | Whether it is tinted, whether it animates |
| `path_slash_animation` | The swing effect |
| `projectile` | For ranged weapons, which projectile it fires. See **[Projectiles, spells & effects](#/nml/projectiles-spells)** |
| `name_class`, `name_templates` | How legendary versions of it get named |

### Behaviour

| Field | What it does |
| --- | --- |
| `action_attack_target` | Runs on every hit landed |
| `action_special_effect` + `special_effect_interval` | Runs on a timer while equipped |
| `item_modifier_ids` | Enchantments it can roll. See **[Weapon enchantments](#/nml/item-modifiers)** |
| `addSpell(id)` + `linkSpells()` | A spell the wearer can cast. The link is yours to call, see below |
| `addCombatAction(id)` | Compiles, and does nothing on an item: a unit collects combat actions from its traits (and subspecies, clan, religion), never from its equipment. Put it on a trait, see **[Projectiles, spells & effects](#/nml/projectiles-spells)** |

The game turns those ids into objects once, at startup, before your mod loads. On an item you registered yourself, finish with `linkSpells()`, and set `decisions_assets` by hand (there is no link method for it), or the grant does nothing. See **[Custom AI](#/nml/custom-ai)**.

## Your own sprite

An item has two pieces of art, and they are separate fields:

```text Mods/HelloBox/
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

> [!NOTE] Weapons need a folder for LoadAll
> The game's weapon preloader calls `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, which runs `Resources.LoadAll<Sprite>`. In NeoModLoader, `LoadAll` searches by folder name. If `path_gameplay_sprite` is `"items/weapons/w_hello_sword"`, NML looks for a directory at `GameResources/items/weapons/w_hello_sword/`. If you only place a loose file `w_hello_sword.png` without the folder, `LoadAll` finds no directory, returns 0 sprites, and the game logs `Weapon Texture is Missing`. Putting the sprite inside a folder with that name makes the preloader happy.

A weapon sprite is drawn at the unit's scale and wants a bottom-centre pivot (`PivotX: 0.5, PivotY: 0.0` in `sprites.json`), or it will float out of the hand (see **[Sprites & resources](#/nml/sprites-and-resources)**).

Leave either field pointing at the vanilla value (such as `"items/weapons/w_sword_iron"`) and you get the vanilla art, which is a perfectly good way to ship a first weapon :PESgn_Neat:.

## A whole material line

Same problem as creatures: one item is rarely what you want. Nine materials means nine assets, and nine copy-pasted blocks means nine places to fix a bug.

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

## The text

Items name themselves differently from everything else in this guide, and it catches everybody out. An item's display name is:

```text
translation_key   ?? "item_" + (equipment_subtype ?? id)
```

So the blade above, cloned from `$sword`, inherits `equipment_subtype = "sword"` and shows as **Sword**, the vanilla key, not as your id. Two ways out:

```csharp
blade.translation_key = "hello_sword_ember";   // your own name, keeps the sword subtype
```

or leave the subtype's name alone and let the **material** do the talking, which is what vanilla does: every sword is called "Sword", and `sword_iron` reads as "Iron Sword" because of its material key.

```json Mods/HelloBox/Locales/en.json
{
  "hello_sword_ember": "Ember Blade",
  "hello_sword_ember_description": "Forged in something that is still angry about it.",

  "item_mat_ember": "Ember"
}
```

| Key | Where it comes from |
| --- | --- |
| `item_<subtype>` or your `translation_key` | The name |
| `<id>_description` | The tooltip |
| `item_mat_<material>` | The material word in the name |

A new material **always** needs its `item_mat_` key, or your weapon shows up with a raw key stuck to the front of its name.

## Putting one in a unit's hands

An **asset** is the recipe. An **item** is the actual object a specific unit holds, with its rolled quality, modifiers and name. Two steps:

```csharp
EquipmentAsset asset = AssetManager.items.get(HelloItems.EMBER_BLADE);
if (asset == null || actor == null) return;

// 1. build a real item from the recipe
Item item = World.world.items.generateItem(asset, actor.kingdom, actor.getName(), 1, actor);

// 2. hand it over - setItem picks the right slot from the item's equipment_type
actor.equipment.setItem(item, actor);
```

`generateItem` rolls quality and modifiers the same way loot does, so the item a unit ends up with is never identical to the asset you registered.

## Tools in hands

The hammer a builder swings and the basket a gatherer carries are not items. They are **hand tools**: pure art, shown while a task says so, gone when it ends.

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

A task shows its tool through `force_hand_tool`, so the torch appears whenever a creature runs the wandering task from **[Custom AI](#/nml/custom-ai)**.

> [!WARNING] Load the frames yourself
> `UnitHandToolLibrary.loadSprites()` fills `gameplay_sprites` for every tool at startup. A tool you add later has none, and a unit holding it holds nothing. The path is read with `getSpriteList()`, so it is a **folder** of frames, `items/tools/tool_hello_torch/`, even for one frame. Without a `sprites.json` pivot the tool sits on the sprite's centre: fine for a torch, wrong for a long handle.

| Field | What it does |
| --- | --- |
| `path_gameplay_sprite` | The folder. Vanilla fills it from the id, `items/tools/tool_<id>` |
| `animated` | Play the frames in a loop, like the coffee cup |
| `colored` | Tint it with the kingdom colour, like the flag |

> [!TIP] Enchantment first, weapon second
> A new weapon is sprites, a material line, costs and balance. A new **modifier** is twenty lines and applies to every weapon in the game, including other mods'. If you want the game to feel different this evening, read **[Weapon enchantments](#/nml/item-modifiers)** first :PESgn_DoIt:. 
