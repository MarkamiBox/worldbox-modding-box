---
title: Risorse e cibo
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbtomato:
order: 182
---

# Risorse e cibo :wbtomato:

Una risorsa è qualsiasi cosa una città immagazzini, commerci, mangi o forgi: grano, pane, pietra, mithril, ossa, gemme. Risiedono in `AssetManager.resources` e costituiscono lo strato fondante dell'intera economia: ciò che producono le fattorie, ciò che cuociono i fornai, ciò di cui hanno bisogno i fabbri e ciò che mangia un cittadino affamato.

## Clonare da un modello

> [!WARNING] Imposta `full_sprite_path` o il loader esplode
> `path_gameplay_sprite` è solo metà del lavoro. La libreria ci costruisce sopra `full_sprite_path` in `post_init()`, una volta sola, durante il caricamento del gioco, quindi una risorsa registrata da una mod si tiene un `null` lì. Il preloader degli sprite chiama `getSpriteList(null)` e tutto il caricamento muore con `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:.

```csharp Mods/HelloBox/Code/HelloResources.cs
namespace HelloBox
{
    public static class HelloResources
    {
        public const string CAKE = "hello_cake";

        public static void Initialize()
        {
            if (AssetManager.resources.has(CAKE)) return;

            // $TEMPLATE_FOOD$ e $TEMPLATE_STRATEGIC_MINERAL$ sono i due punti di partenza perfetti.
            ResourceAsset cake = AssetManager.resources.clone(CAKE, "$TEMPLATE_FOOD$");

            cake.path_icon = "iconHelloCake";       // inventory icon in GameResources/
            cake.path_gameplay_sprite = "hello_cake";   // in-hand sprite in GameResources/

            // La libreria lo ricava in post_init(), che e gia girato. Impostalo a mano.
            cake.full_sprite_path = "items/resources/" + cake.path_gameplay_sprite;   // cosa tiene in mano l'unità

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

## I campi

### Cos'è

| Campo | Cosa fa |
| --- | --- |
| `type` | `ResType.Food`, `Ingredient_Food`, `Ingredient`, `Strategic`, `Currency` |
| `food` | Se un'unità può mangiarlo come pasto |
| `wood`, `mineral` | Quali strumenti di raccolta e professioni vi si applicano |
| `path_icon` | L'icona mostrata negli inventari e negli elenchi |
| `path_gameplay_sprite` | Lo sprite che l'unità stringe tra le mani mentre lo trasporta |

### Mangiarlo

| Campo | Cosa fa |
| --- | --- |
| `restore_nutrition` | Punti fame ripristinati |
| `restore_health` | Salute ripristinata, come percentuale/frazione |
| `restore_stamina`, `restore_mana`, `restore_happiness` | Le altre barre di stato |
| `give_experience` | Esperienza ottenuta mangiandolo |
| `tastiness`, `favorite_food_chance` | Probabilità che diventi il cibo preferito di un'unità |
| `diet` | Quali diete biologiche possono consumarlo |
| `eat_action` | Il tuo codice personalizzato quando qualcuno lo mangia |
| `give_trait_id`, `give_status_id`, `give_chance` | Tratti o status conferiti all'ingestione |

### Produzione e trasporto

| Campo | Cosa fa |
| --- | --- |
| `ingredients`, `ingredients_amount` | Con quali ingredienti viene cucinato o forgiato |
| `produce_min` | Quanto rende un singolo ciclo produttivo |
| `mine_rate` | Velocità con cui viene estratto o raccolto |
| `drop_max`, `drop_per_mass` | Quanto ne cade alla distruzione della sorgente |
| `stack_size`, `storage_max`, `maximum` | Limiti di trasporto e stoccaggio |
| `supply_give`, `supply_bound_give`, `supply_bound_take` | Gestione del rifornimento degli eserciti |
| `trade_cost`, `trade_give`, `trade_bound` | Comportamento nelle rotte commerciali |
| `money_cost`, `loot_value` | Valore economico e valore come bottino |

## Le risorse vanilla

Vale la pena conoscerle, perché riutilizzarne una esistente è quasi sempre preferibile all'aggiungerne una nuova:

**Cibo e ingredienti:** `wheat` `bread` `berries` `bananas` `coconut` `mushrooms` `peppers` `herbs` `fish` `meat` `honey` `lemons` `worms` `pine_cones` `candy` `sushi` `jam` `cider` `ale` `burger` `pie` `tea` `crystal_salt` `desert_berries` `evil_beets` `snow_cucumbers` `celestial_avocado`

**Strategiche e varie:** `wood` `stone` `common_metals` `silver` `mythril` `adamantine` `gems` `bones` `leather` `dragon_scales` `fertilizer` `gold`

## I tuoi sprite personali

Una risorsa ha due illustrazioni differenti, e vengono risolte in modo **completamente diverso**. Questo è l'inghippo classico:

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── iconHelloCake.png              <- l'icona dell'inventario, alla radice
    └── items/resources/
        └── hello_cake/hello_cake_0.png             <- ciò che l'unità tiene in mano
```

```csharp
cake.path_icon = "iconHelloCake";        // caricato esattamente così com'è scritto
cake.path_gameplay_sprite = "hello_cake";   // caricato automaticamente come items/resources/hello_cake
```

`path_icon` è un percorso diretto, e vanilla usa nomi semplici, quindi il file risiede alla radice di `GameResources/`. Per `path_gameplay_sprite`, il gioco aggiunge automaticamente `items/resources/` all'inizio. Se inserisci tu stesso la cartella, il gioco cercherà `items/resources/items/resources/...` e non troverà nulla.

## Collegare una risorsa al mondo

Una risorsa resta inerte finché qualcosa non la produce. I tre punti chiave:

```csharp
// 1. Una creatura la rilascia se macellata o alla morte.
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// 2. Un edificio la fornisce al momento del raccolto.
BuildingAsset tree = AssetManager.buildings.get("hello_tree");
tree.addResource("wood", 3, pNewList: true);

// 3. Una cultura la produce nelle sue città.
asset.production = new string[] { "bread", "jam", "hello_cake" };
```

`pNewList: true` nella prima chiamata significa: "inizia una nuova lista anziché accodarla a quella ereditata dal donatore". Se lo dimentichi dopo un clone, la tua creatura rilascerà sia le risorse del donatore che le tue.

## I materiali non sono risorse

Il **materiale** di un equipaggiamento (ferro, acciaio, mithril) è un `ItemAsset` in una libreria di materiali, non un `ResourceAsset`, anche se usare un materiale costa risorse. È uno dei punti in cui la nomenclatura del gioco genera autentica confusione. Vedi **[Oggetti personalizzati](#/nml/custom-items)**.

Il ponte tra i due è `cost_resources` presente sul materiale, che elenca gli id delle risorse e le relative quantità.

> [!TIP] Aggiungi la ricetta, non l'ingrediente
> Un nuovo *ingrediente* richiede una fonte: qualcosa che lo coltivi, un bioma che lo generi, una mansione che lo raccolga. Una nuova *ricetta* necessita solo di ingredienti già esistenti e si inserisce all'istante nei forni e nelle rotte commerciali esistenti. Una strada richiede un pomeriggio, l'altra una settimana :PES_ChillPill:.
