---
title: Eigene Gegenstände
group: Spielinhalte
subgroup: Gegenstände & Ausrüstung
icon: :wbcrystalsword:
order: 120
---

# Eigene Gegenstände :wbcrystalsword:

Waffen, Rüstungen, Ringe und Amulette leben alle in `AssetManager.items` als `EquipmentAsset`.

Das Erste, was man verstehen muss: **Es gibt keinen "Schwert"-Gegenstand mit einem Materialfeld, das man zur Laufzeit auswählt**. Es gibt `sword_wood`, `sword_stone`, `sword_copper`, `sword_bronze`, `sword_silver`, `sword_iron`, `sword_steel`, `sword_mythril`, `sword_adamantine`. Neun eigenständige Assets, jedes mit eigenen Kosten, Werten und eigenem `material`-String. Dasselbe gilt für jedes Rüstungsteil, jeden Bogen, jedes Amulett.

Deshalb ist Klonen hier nicht nur der bequeme Weg, sondern der einzig vernünftige.

## Die Vorlagen (Templates)

IDs, die mit `$` beginnen, sind Vorlagen und enthalten die Grundverdrahtung für eine ganze Waffengattung:

`$equipment` · `$weapon` · `$melee` · `$range` · `$sword` · `$axe` · `$hammer` · `$spear` · `$bow` · `$helmet` · `$armor` · `$boots` · `$ring` · `$amulet` · `$accessory`

`$sword` setzt bereits `equipment_subtype`, `is_pool_weapon`, `pool_rate`, die Hiebanimation, die Namensvorlagen und die `group_id`. All das möchtest du haben.

## Eine Waffe erstellen

> [!WARNING] Eine Waffe ohne Sprite-Pfad killt den Loader
> Für jede Pool-Waffe setzt das Spiel `path_gameplay_sprite` auf `items/weapons/w_<id>` und `path_icon` auf `ui/Icons/items/icon_<id>`. Das passiert in `post_init()`, während des eigenen Ladens, also steht deine Waffe noch nicht in der Liste und beide Felder bleiben `null`. Der Preloader ruft dann `getSpriteList(null)` und der Ladevorgang stirbt mit `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:.
>
> Setz beide selbst. Zeig auf deine eigenen Dateien unter `GameResources/`, oder nimm erstmal ein Vanilla-Paar, solange du den Rest testest.

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

> [!WARNING] Registriert ist nicht gleich geschmiedet
> Eine Stadt wählt die zu schmiedenden Waffen aus `equipment_by_subtypes` (eine Liste pro Waffentyp) aus, und neue Zufallswaffen würfeln aus `pot_weapon_assets_all` und `pot_weapon_assets_unlocked`. `ItemLibrary.linkAssets()` befüllt alle drei beim Spielstart vor deiner Mod. Ohne die vier Zeilen am Ende existiert deine Waffe zwar und kann vergeben werden, aber kein Schmied der Welt wird sie jemals herstellen :PES5_Hmmmm:. Rüstungen und Zubehör nutzen `pot_equipment_by_groups_all` und `pot_equipment_by_groups_unlocked` (gruppiert nach `group_id`) anstelle der beiden Waffenpools.


## Die Asset-Felder

### Identity

| Feld | Was es bewirkt |
| --- | --- |
| `material` | Der Materialname. Teil des Anzeigenamens und vom Spiel für Upgrades verglichen |
| `equipment_type` | `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet`. Welchen Platz es belegt |
| `equipment_subtype` | `sword`, `axe`, `bow`, … Die Waffengattung. Kulturen bevorzugen Subtypen |
| `group_id` | Die Ausrüstungskategorie. Siehe **[Merkmalsgruppen & Reiter](#/nml/trait-groups)** |
| `attack_type` | Nahkampf- oder Fernkampf-Verhalten |
| `quality` | Die Mindestseltenheit, mit der es generiert werden kann |
| `rarity`, `pool_rate` | Wie oft der Generator diesen Gegenstand auswählt |
| `is_pool_weapon` | Ob es überhaupt im allgemeinen Waffenpool landet |

### Kosten und Wert

| Feld | Was es bewirkt |
| --- | --- |
| `setCost(gold, res1, amount1, res2, amount2)` | Setzt alle Kostenfelder auf einmal. Nutze dies statt einzelner Zuweisungen |
| `minimum_city_storage_resource_1` | Die Stadt schmiedet es nicht unter diesem Lagerbestand |
| `equipment_value` | Wie gut die KI den Gegenstand einschätzt. Steuert "Sollte dieser Soldat upgraden" |
| `durability`, `rigidity_rating` | Haltbarkeit |

### Aussehen und Grafik

| Feld | Was es bewirkt |
| --- | --- |
| `path_gameplay_sprite` | Das Sprite in der Hand der Einheit |
| `colored`, `animated` | Ob es eingefärbt ist, ob es animiert ist |
| `path_slash_animation` | Der Schwungeffekt |
| `projectile` | Für Fernkampfwaffen: welches Projektil abgefeuert wird. Siehe **[Projektile, Zauber & Effekte](#/nml/projectiles-spells)** |
| `name_class`, `name_templates` | Wie legendäre Versionen benannt werden |

### Behaviour

| Feld | Was es bewirkt |
| --- | --- |
| `action_attack_target` | Läuft bei jedem gelandeten Treffer |
| `action_special_effect` + `special_effect_interval` | Läuft periodisch, während ausgerüstet |
| `item_modifier_ids` | Verzauberungen, die darauf rollen können. Siehe **[Waffenverzauberungen](#/nml/item-modifiers)** |
| `addSpell(id)` | Ein Zauber, den der Träger wirken kann |
| `addCombatAction(id)` | Ein Kampfmanöver, das der Gegenstand verleiht |


## Ein Effekt, während der Gegenstand gehalten wird

"Wer die Glutklinge führt, wird Schnell" klingt wie ein Trait auf einem Gegenstand. Gegenstände tragen jedoch keine Traits, aber sie führen per Timer Code aus, solange sie ausgerüstet sind (`action_special_effect` aus der obigen Tabelle), und ein **Status** läuft von selbst ab. Der Gegenstand wendet also fortlaufend einen kurzen Status an, und sobald die Klinge abgelegt wird, läuft der Status einfach aus:

```csharp Mods/HelloBox/Code/HelloItems.cs
blade.special_effect_interval = 1f;
blade.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    StatusAsset status = AssetManager.status.get(HelloStatus.CURSED);
    if (status == null) return false;

    // 3 Sekunden, wird jede Sekunde erneuert, solange gehalten. Nach dem Loslassen verfliegt er
    World.world.statuses.newStatus(actor, status, 3f);
    return true;
};
```

Der Status benötigt `allow_timer_reset = true` (Standard bei neuen `StatusAsset`, aber nicht bei allen Vanilla-Statuseffekten, von denen du klonen könntest), sonst bewirkt das erneute Anwenden nichts und er läuft mitten im Kampf ab. In HelloBox verflucht die Klinge ihren eigenen Träger – genau das, was eine Glutklinge tun würde :wbfacepalm:.

Warum kein Trait: Ein Trait bleibt bestehen, bis ihn etwas aktiv entfernt. Du bräuchtest einen zweiten Timer, um zu bemerken, dass die Klinge weg ist, und ihn zu entfernen. Ein Status räumt sich selbst auf.

## Dein eigenes Sprite

Ein Gegenstand besitzt zwei Grafiken, und es sind getrennte Felder:

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

> [!NOTE] Waffen benötigen einen Ordner für LoadAll
> Der Waffen-Preloader des Spiels ruft `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)` auf, was intern `Resources.LoadAll<Sprite>` ausführt. In NeoModLoader sucht `LoadAll` nach Verzeichnisnamen. Wenn `path_gameplay_sprite` den Wert `"items/weapons/w_hello_sword"` hat, sucht NML nach einem Ordner unter `GameResources/items/weapons/w_hello_sword/`. Liegt dort nur eine lose Datei `w_hello_sword.png` ohne Ordner, findet `LoadAll` kein Verzeichnis, liefert 0 Sprites zurück und das Spiel protokolliert `Weapon Texture is Missing`. Das Platzieren des Sprites in einem gleichnamigen Ordner löst das Problem.

> [!NOTE] Waffen benötigen einen Ordner für LoadAll
> Der Waffen-Preloader des Spiels ruft `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)` auf, was intern `Resources.LoadAll<Sprite>` ausführt. In NeoModLoader sucht `LoadAll` nach Verzeichnisnamen. Wenn `path_gameplay_sprite` den Wert `"items/weapons/w_hello_sword"` hat, sucht NML nach einem Ordner unter `GameResources/items/weapons/w_hello_sword/`. Liegt dort nur eine lose Datei `w_hello_sword.png` ohne Ordner, findet `LoadAll` kein Verzeichnis, liefert 0 Sprites zurück und das Spiel protokolliert `Weapon Texture is Missing`. Das Platzieren des Sprites in einem gleichnamigen Ordner löst das Problem.

> [!NOTE] Waffen benötigen einen Ordner für LoadAll
> Der Waffen-Preloader des Spiels ruft `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)` auf, was wiederum `Resources.LoadAll<Sprite>` ausführt. In NeoModLoader sucht `LoadAll` nach Verzeichnisnamen. Wenn `path_gameplay_sprite` auf `"items/weapons/w_hello_sword"` gesetzt ist, erwartet NML einen Ordner unter `GameResources/items/weapons/w_hello_sword/`. Liegt dort nur eine einzelne Datei `w_hello_sword.png` ohne Ordner, findet `LoadAll` kein Verzeichnis, liefert 0 Sprites zurück und das Spiel protokolliert `Weapon Texture is Missing`. Ein Unterordner mit diesem Namen löst das Problem zuverlässig.

Ein Waffensprite wird im Maßstab der Einheit gezeichnet und verlangt einen Drehpunkt unten in der Mitte (`PivotX: 0.5, PivotY: 0.0` in `sprites.json`), sonst schwebt es neben der Hand (siehe **[Sprites & Ressourcen](#/nml/sprites-and-resources)**).

Lässt du eines der Felder auf dem Vanilla-Wert (wie `"items/weapons/w_sword_iron"`), nutzt das Spiel die Standardgrafik – ein völlig legitimer Weg für deine allererste Waffe :PESgn_Neat:.

## Eine vollständige Materialreihe

Dasselbe Problem wie bei Kreaturen: Ein einzelner Gegenstand ist selten das, was man will. Neun Materialien bedeuten neun Assets, und neun kopierte Codeblöcke bedeuten neun Orte für Bugs.

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

## Die Texte (Lokalisierung)

Gegenstände benennen sich anders als alles andere in diesem Leitfaden, was regelmäßig für Verwirrung sorgt. Der Anzeigename eines Gegenstands lautet:

```text
translation_key   ?? "item_" + (equipment_subtype ?? id)
```

Die oben aus `$sword` geklonte Klinge erbt `equipment_subtype = "sword"` und erscheint als **Schwert** (der Vanilla-Schlüssel), nicht mit deiner ID. Zwei Auswege:

```csharp
blade.translation_key = "hello_sword_ember";   // eigener Name, behält den Schwert-Subtyp
```

Oder du lässt den Namen des Subtyps unangetastet und überlässt dem **Material** das Reden (wie es Vanilla tut): Jedes Schwert heißt "Schwert", und `sword_iron` wird dank seines Material-Schlüssels zu "Eisenschwert".

```json Mods/HelloBox/Locales/en.json
{
  "hello_sword_ember": "Ember Blade",
  "hello_sword_ember_description": "Forged in something that is still angry about it.",

  "item_mat_ember": "Ember"
}
```

| Schlüssel | Woher er stammt |
| --- | --- |
| `item_<subtype>` oder dein `translation_key` | Der Name |
| `<id>_description` | Der Tooltip |
| `item_mat_<material>` | Das Materialwort im Namen |

Ein neues Material benötigt **immer** seinen `item_mat_`-Schlüssel, sonst klebt ein roher Schlüsselname vor dem Waffennamen.

## Eine Waffe in die Hand einer Einheit geben

Ein **Asset** ist das Rezept. Ein **Gegenstand** ist das tatsächliche Objekt, das eine konkrete Einheit in Händen hält, mit ausgewürfelter Qualität, Modifikatoren und Namen. Zwei Schritte:

```csharp
EquipmentAsset asset = AssetManager.items.get(HelloItems.EMBER_BLADE);
if (asset == null || actor == null) return;

// 1. ein reales Item aus dem Rezept bauen
Item item = World.world.items.generateItem(asset, actor.kingdom, actor.getName(), 1, actor);

// 2. überreichen - setItem wählt anhand von equipment_type den richtigen Platz
actor.equipment.setItem(item, actor);
```

`generateItem` würfelt Qualität und Modifikatoren genau wie Beute aus, der Gegenstand einer Einheit ist also nie völlig identisch mit dem registrierten Roh-Asset.

## Werkzeuge in Händen

Der Hammer, den ein Bauarbeiter schwingt, und der Korb, den ein Sammler trägt, sind keine Ausrüstungsgegenstände. Sie sind **Handwerkzeuge**: reine visuelle Grafiken, die angezeigt werden, während eine Aufgabe aktiv ist, und danach wieder verschwinden.

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

Eine Aufgabe zeigt ihr Werkzeug über `force_hand_tool` an, sodass die Fackel immer dann sichtbar wird, wenn eine Kreatur die Wander-Aufgabe aus **[Eigene KI & Verhalten](#/nml/custom-ai)** ausführt.

> [!WARNING] Lade die Einzelbilder selbst
> `UnitHandToolLibrary.loadSprites()` füllt `gameplay_sprites` für jedes Werkzeug beim Spielstart. Ein nachträglich hinzugefügtes Werkzeug hat keine Sprites, und die Einheit hält eine leere Hand. Der Pfad wird mit `getSpriteList()` gelesen, es muss sich also selbst bei einem einzigen Frame um einen **Ordner** handeln: `items/tools/tool_hello_torch/`. Ohne einen Pivot in `sprites.json` sitzt das Werkzeug im Zentrum der Textur: Für eine Fackel in Ordnung, für einen langen Stiel ungeeignet.

| Feld | Was es bewirkt |
| --- | --- |
| `path_gameplay_sprite` | Der Ordner. Das Hauptspiel füllt ihn aus der ID: `items/tools/tool_<id>` |
| `animated` | Spielt die Einzelbilder in einer Schleife ab, wie bei der Kaffeetasse |
| `colored` | Färbt das Werkzeug in der Königreichsfarbe ein, wie bei der Flagge |

> [!TIP] Erst Verzauberung, dann Waffe
> Eine neue Waffe erfordert Sprites, eine Materialreihe, Kosten und Balancing. Ein neuer **Modifikator** benötigt zwanzig Zeilen und gilt sofort für jede Waffe im Spiel, auch für die anderer Mods. Wenn sich das Spiel schon heute Abend anders anfühlen soll, lies zuerst **[Waffenverzauberungen](#/nml/item-modifiers)** :PESgn_DoIt:.
