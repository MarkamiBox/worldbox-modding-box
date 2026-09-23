---
title: Ressourcen & Nahrung
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbtomato:
order: 182
---

# Ressourcen & Nahrung :wbtomato:

Eine Ressource ist alles, was eine Stadt lagert, handelt, isst oder verarbeitet: Weizen, Brot, Stein, Mithril, Knochen, Edelsteine. Sie leben in `AssetManager.resources` und bilden das Fundament der gesamten Wirtschaft: Was Bauernhöfe anbauen, was Bäcker backen, was Schmiede brauchen und was ein hungriger Bürger isst.

## Von einer Vorlage klonen

> [!WARNING] Setz `full_sprite_path`, sonst wirft der Loader
> `path_gameplay_sprite` ist nur die Hälfte. Die Library baut daraus `full_sprite_path` in `post_init()`, einmal, während das Spiel lädt, also behält eine von einer Mod registrierte Ressource dort ein `null`. Der Sprite-Preloader ruft dann `getSpriteList(null)` und der ganze Ladevorgang stirbt mit `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:.

```csharp Mods/HelloBox/Code/HelloResources.cs
namespace HelloBox
{
    public static class HelloResources
    {
        public const string CAKE = "hello_cake";

        public static void Initialize()
        {
            if (AssetManager.resources.has(CAKE)) return;

            // $TEMPLATE_FOOD$ und $TEMPLATE_STRATEGIC_MINERAL$ sind die zwei besten Startpunkte.
            ResourceAsset cake = AssetManager.resources.clone(CAKE, "$TEMPLATE_FOOD$");

            cake.path_icon = "iconHelloCake";       // inventory icon in GameResources/
            cake.path_gameplay_sprite = "hello_cake";   // in-hand sprite in GameResources/

            // Die Library leitet das in post_init() ab, das schon lief. Setz es selbst.
            cake.full_sprite_path = "items/resources/" + cake.path_gameplay_sprite;   // was eine Einheit in den Händen trägt

            cake.ingredients = new string[] { "wheat", "honey" };
            cake.ingredients_amount = 1;

            cake.restore_nutrition = 140;
            cake.restore_happiness = 25;
            cake.restore_stamina = 15;
            cake.give_experience = 10;

            cake.produce_min = 40;
            cake.maximum = 999;
            cake.trade_bound = 50;
            cake.trade_give = 5;
        }
    }
}
```

## Die Felder

### Was es ist

| Feld | Was es tut |
| --- | --- |
| `type` | `ResType.Food`, `Ingredient_Food`, `Ingredient`, `Strategic`, `Currency` |
| `food` | Ob Einheiten es als Mahlzeit essen |
| `wood`, `mineral` | Welche Erntewerkzeuge und Berufe dafür zuständig sind |
| `path_icon` | Das Icon in Inventaren und Listen |
| `path_gameplay_sprite` | Die Grafik, die eine Einheit beim Tragen in Händen hält |

### Verzehr & Ernährung

| Feld | Was es tut |
| --- | --- |
| `restore_nutrition` | Wiederhergestellter Hungerwert |
| `restore_health` | Wiederhergestellte Gesundheit, als Anteil |
| `restore_stamina`, `restore_mana`, `restore_happiness` | Die restlichen Bedürfnisleisten |
| `give_experience` | Erfahrungspunkte beim Verzehr |
| `tastiness`, `favorite_food_chance` | Wie wahrscheinlich Einheiten es als Lieblingsessen wählen |
| `diet` | Welche Ernährungsformen es essen können |
| `eat_action` | Eigener Code, wenn eine Einheit es isst |
| `give_trait_id`, `give_status_id`, `give_chance` | Eigenschaften oder Status-Effekte, die beim Essen verliehen werden |

### Herstellung und Transport

| Feld | Was es tut |
| --- | --- |
| `ingredients`, `ingredients_amount` | Woraus es gekocht oder geschmiedet wird |
| `produce_min` | Wie viel ein einzelner Produktionszyklus herstellt |
| `mine_rate` | Wie schnell es abgebaut wird |
| `drop_max`, `drop_per_mass` | Wie viel Beute beim Zerstören der Quelle abfällt |
| `stack_size`, `storage_max`, `maximum` | Trage- und Lagerkapazitäten |
| `supply_give`, `supply_bound_give`, `supply_bound_take` | Verhalten bei der Heeresversorgung |
| `trade_cost`, `trade_give`, `trade_bound` | Handelsverhalten zwischen Städten |
| `money_cost`, `loot_value` | Geldwert und Beutewert |

## Die Vanilla-Ressourcen

Gut zu wissen, denn eine vorhandene Ressource zu nutzen ist fast immer besser als eine neue hinzuzufügen:

**Nahrung und Zutaten:** `wheat` `bread` `berries` `bananas` `coconut` `mushrooms` `peppers` `herbs` `fish` `meat` `honey` `lemons` `worms` `pine_cones` `candy` `sushi` `jam` `cider` `ale` `burger` `pie` `tea` `crystal_salt` `desert_berries` `evil_beets` `snow_cucumbers` `celestial_avocado`

**Strategische und sonstige Güter:** `wood` `stone` `common_metals` `silver` `mythril` `adamantine` `gems` `bones` `leather` `dragon_scales` `fertilizer` `gold`

## Eigene Sprites

Eine Ressource besitzt zwei Grafiken, und sie lösen sich **völlig unterschiedlich** auf. Hier stolpern fast alle Modder:

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── iconHelloCake.png              <- das Inventar-Icon, direkt an der Wurzel
    └── items/resources/
        └── hello_cake/hello_cake_0.png             <- was Einheiten in den Händen tragen
```

```csharp
cake.path_icon = "iconHelloCake";        // wird exakt wie geschrieben geladen
cake.path_gameplay_sprite = "hello_cake";   // wird als items/resources/hello_cake geladen
```

`path_icon` ist ein normaler Pfad, und Vanilla schreibt nur einen einfachen Namen, weshalb die Datei direkt an der Wurzel von `GameResources/` landet. Für `path_gameplay_sprite` stellt das Spiel automatisch `items/resources/` voran. Schreibst du den Ordnerpfad selbst hinein, sucht das Spiel nach `items/resources/items/resources/...` und findet nichts.

## Eine Ressource in die Welt einbinden

Eine Ressource bleibt ungenutzt, bis etwas sie produziert. Die drei wichtigsten Stellen:

```csharp
// 1. Eine Kreatur liefert sie beim Schlachten oder bei ihrem Tod.
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// 2. Ein Gebäude liefert sie bei der Ernte.
BuildingAsset tree = AssetManager.buildings.get("hello_tree");
tree.addResource("wood", 3, pNewList: true);

// 3. Eine Kultur produziert sie in ihren Städten.
asset.production = new string[] { "bread", "jam", "hello_cake" };
```

`pNewList: true` beim ersten Aufruf bedeutet: "Erstelle eine neue Liste, statt an die Ressourcen des Vorlagen-Spenders anzuhängen". Vergisst du das nach einem Klon, liefert deine Kreatur sowohl die Beute des Spenders als auch deine eigenen Ressourcen.

## Materialien sind keine Ressourcen

Das **Material** eines Gegenstands (Eisen, Stahl, Mithril) ist ein `ItemAsset` in einer Materialbibliothek und kein `ResourceAsset` - auch wenn die Verwendung eines Materials Ressourcen kostet. Das ist eine der Stellen im Spiel, an denen die Namensgebung wirklich verwirrend ist. Siehe **[Eigene Gegenstände](#/nml/custom-items)**.

Die Verknüpfung erfolgt über `cost_resources` auf dem Material, das Ressourcen-IDs und Mengen auflistet.

> [!TIP] Füge das Rezept hinzu, nicht die Zutat
> Eine neue *Zutat* braucht eine Quelle: etwas, das sie anbaut, ein Biom, das sie hervorbringt, einen Beruf, der sie erntet. Ein neues *Rezept* braucht nur Zutaten, die es bereits gibt, und fügt sich sofort nahtlos in bestehende Bäckereien und Handelsrouten ein. Das eine dauert einen Nachmittag, das andere eine Woche :PES_ChillPill:.
