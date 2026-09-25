---
title: Caselle e terreno
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbrockies:
order: 170
---

# Caselle e terreno :wbrockies:

La mappa è una griglia di `WorldTile`, e ogni casella (tile) contiene **due** tipologie sovrapposte:

| Livello | Campo sulla casella | Libreria (library) | Classe | Esempi |
| --- | --- | --- | --- | --- |
| Terreno | `main_type` | `AssetManager.tiles` | `TileType` | terra, sabbia, rocce, oceano profondo, lava |
| Superficie | `top_type` | `AssetManager.top_tiles` | `TopTileType` | `grass_low`, `grass_high`, `road`, `field`, `frozen_low`, mura |

Entrambe derivano dalla stessa classe di base (`TileTypeBase`), perciò tutto ciò che è descritto in questa pagina funziona per l'una o per l'altra. L'unica differenza è il livello su cui poggiano, stabilito da `layer_type`.

Se vuoi aggiungere un nuovo tipo di *terreno*, parliamo di un `TileType`. Se desideri qualcosa che poggi **sopra** al terreno (una strada, un muro, una coltivazione, del muschio), parliamo di un `TopTileType`, ed è solitamente ciò che intendi davvero realizzare.

## Clona, non costruire da zero

Un tipo di casella possiede circa cento campi, la maggior parte dei quali conta solo per una specifica casella vanilla. Non ho intenzione di elencarli tutti e cento. Clona la variante più affine:

```csharp Mods/HelloBox/Code/HelloTiles.cs
using UnityEngine;

namespace HelloBox
{
    public static class HelloTiles
    {
        public const string MOSS = "hello_moss";

        public static void Initialize()
        {
            if (AssetManager.top_tiles.has(MOSS)) return;

            // clone(newId, sourceId) copies every field AND registers the copy.
            TopTileType moss = AssetManager.top_tiles.clone(MOSS, "grass_low");

            moss.color_hex = "#2E6B3F";
            moss.can_be_set_on_fire = true;
            moss.burnable = true;
            moss.burn_rate = 6;
            moss.walk_multiplier = 0.8f;             // slows units down
            moss.can_be_removed_with_sickle = true;
            moss.can_be_removed_with_spade = true;
            moss.strength = 2;

            // grass_low is a biome tile, so the clone says is_biome = true. The library links
            // biome_id to its BiomeAsset during startup, before your mod existed: link yours.
            moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);

            // color and has_biome_tags are [NonSerialized], so clone() skips them, and linkAssets()
            // worked them out at startup. Without this the minimap draws your tile see-through.
            moss.color = Toolbox.makeColor(moss.color_hex);
            moss.has_biome_tags = moss.biome_tags != null && moss.biome_tags.Count > 0;

            // Inherit source tile sprites so rendering never encounters a null TileSprites
            TopTileType source = AssetManager.top_tiles.get("grass_low");
            if (source != null) moss.sprites = source.sprites;

            // The variations in GameResources/tiles/hello_moss/ are loaded at startup too.
            Sprite[] variations = SpriteTextureLoader.getSpriteList("tiles/" + moss.id);
            if (variations != null && variations.Length > 0)
            {
                moss.sprites = new TileSprites();
                foreach (Sprite variation in variations)
                {
                    moss.sprites.addVariation(variation, moss.id);
                }
            }
        }
    }
}
```

> [!WARNING] Un tile di bioma (biome) ha bisogno del suo bioma collegato
> Clonare un tile d'erba copia `is_biome = true` e il `biome_id`, ma il `BiomeAsset` vero e proprio viene cercato solo in `TopTileLibrary.linkAssets()`, una volta, mentre il gioco carica. Salta quella riga e tutto funziona finché un animale non spawna sul tuo tile: il nome della specie prende il suffisso del bioma, il bioma è `null`, e lo spawn muore con `NullReferenceException` in `Subspecies.generateName()` :wbfacepalm:.
>
> Le immagini hanno lo stesso problema. `TopTileLibrary` trasforma i PNG in `tiles/<id>/` in `sprites` all'avvio, quindi senza l'ultimo blocco il tile si dipinge bene e poi il renderer della mappa lancia in `WorldTilemap.getVariation()` per ogni suo tile a schermo.


## I campi da conoscere

### Di che tipo di elemento si tratta

| Campo | Cosa fa |
| --- | --- |
| `layer_type` | `TileLayerType.Ground` o strato superiore. Decide la libreria di appartenenza |
| `ground`, `liquid`, `ocean`, `lava` | Flag di categoria generale su cui si ramifica l'intero gioco |
| `grass`, `sand`, `rocks`, `mountains`, `summit`, `soil` | Flag di famiglia del terreno |
| `road`, `wall`, `farm_field` | Flag di struttura. L'IA delle città li legge |
| `block`, `block_height` | Se blocca il movimento e altezza di rendering |
| `is_biome`, `can_be_biome`, `biome_id` | Collega la casella a un bioma |
| `biome_tags`, `has_biome_tags` | Quali biomi faranno crescere questa casella |

### Come si comporta

Parti da qui se la tua casella è un'idea di gameplay e non solo un nuovo colore.

| Campo | Cosa fa |
| --- | --- |
| `walk_multiplier` | Velocità di camminata sopra di essa. `1.0` è normale, inferiore rallenta |
| `damage_units`, `damage` | Se camminarvi sopra ferisce, e di quanto |
| `damaged_when_walked` | La casella stessa si consuma quando viene calpestata |
| `step_action`, `step_action_chance` | Il tuo codice a ogni singolo passo compiuto su di essa |
| `unit_death_action` | Il tuo codice quando un'entità muore su di essa |
| `can_be_set_on_fire`, `burnable`, `burn_rate` | Comportamento (behaviour) col fuoco |
| `can_be_frozen`, `forever_frozen`, `fast_freeze`, `remove_on_freeze` | Comportamento col gelo |
| `remove_on_heat`, `terraform_after_fire` | Cosa lasciano il calore e il fuoco |
| `explodable`, `explodable_delayed`, `explodable_timed`, `explode_range` | Detonazione |
| `strength` | Resistenza complessiva. Usato dalle mod di mura per la durevolezza |
| `cost` | Costo per il pathfinding |

### Cosa può farci il giocatore

| Campo | Cosa fa |
| --- | --- |
| `can_be_removed_with_spade` / `_bucket` / `_demolish` / `_pickaxe` / `_axe` / `_sickle` | Quale strumento la rimuove |
| `allowed_to_be_finger_copied` | Se lo strumento dito può copiarla |
| `can_build_on`, `can_be_farm` | Se una città può edificarvi o coltivarvi |
| `only_allowed_to_build_with_tag` | Limita l'edificazione a un tag specifico |

### Transizioni

| Campo | Cosa fa |
| --- | --- |
| `increase_to_id` / `decrease_to_id` | Cosa diventa crescendo o erodendosi |
| `freeze_to_id` | Cosa diventa congelandosi |
| `fill_to_ocean`, `can_be_filled_with_ocean` | Cosa diventa sott'acqua |
| `lava_increase` / `lava_decrease` / `lava_level` | Catena di progressione specifica della lava |

### Aspetto estetico

| Campo | Cosa fa |
| --- | --- |
| `color_hex` | Colore per la minimappa e tinta |
| `edge_color_hex` | Colore del bordo all'incontro con un'altra casella |
| `render_z`, `draw_layer_name` | Ordine di rendering. `setDrawLayer(...)` è il metodo di supporto |
| `force_edge_variation`, `force_edge_variation_frame` | Blocca la variante dello sprite del bordo |

## Eseguire codice quando qualcosa ci cammina sopra

```csharp
moss.step_action_chance = 0.05f;   // 5% dei passi
moss.step_action = (WorldTile pTile, Actor pActor) =>
{
    if (pActor == null || !pActor.isAlive()) return false;

    pActor.restoreStamina(2);
    return true;
};
```

Stesse regole di qualunque altra azione in questa guida: verifica prima i null, restituisci `false` se non hai fatto nulla, e ricorda che questo codice viene eseguito per ogni unità che cammina su ogni casella di questo tipo.

## Le tue grafiche personalizzate

Le caselle sono l'eccezione alla regola: **non esiste alcun campo di percorso**. Il gioco cerca una cartella con lo stesso identico **id** della casella e ne carica tutto il contenuto come varianti.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── tiles/
        └── hello_moss/          <- esattamente l'id della casella
            ├── moss_1.png
            ├── moss_2.png
            └── moss_3.png
```

Nulla da impostare via codice. Chiama la cartella con l'id registrato e la casella la troverà da sola.

I diversi file in quella cartella diventano varianti casuali, evitando che una distesa della tua casella assomigli a una monotona carta da parati. Funziona anche con un solo file. Le caselle di terra e quelle superiori si caricano entrambe così.

`color_hex` è separato e rimane indispensabile: è ciò che disegna la minimappa e ciò che tinge la casella quando il gioco ne ha bisogno.

## Cambiare le caselle a runtime

```csharp
WorldTile tile = World.world.GetTile(x, y);
if (tile == null) return;

tile.setTopTileType(AssetManager.top_tiles.get("hello_moss"));   // modifica lo strato superiore
tile.setTileType(AssetManager.tiles.get("sand"));                // modifica il terreno
tile.setTileTypes("sand", null);                                 // terreno, e svuota la superficie
```

Tutti e tre i metodi sono pubblici. Modificare una casella contrassegna il suo chunk come modificato e il renderer se ne occupa in autonomia.

### Leggere cosa c'è sulla casella

```csharp
if (tile.main_type != null && tile.main_type.ground) { }
if (tile.top_type != null && tile.top_type.road) { }
if (tile.isOnFire()) { }
if (tile.hasBuilding()) { }
```

Sia `main_type` che `top_type` possono essere `null`. Controllali prima di accedervi. Questo è il crash in assoluto più comune in qualunque mod che scandisce la mappa :PES2_F:.

## Opzioni di terraformazione

Un `TerraformOptions` in `AssetManager.terraform` è un pacchetto di pulizia della casella con un nome assegnato, usato da poteri divini (GodPower) e proiettili (projectile):

| Campo | Cosa fa |
| --- | --- |
| `remove_top_tile`, `remove_roads`, `remove_borders` | Rimuove strutture |
| `remove_trees_fully`, `remove_burned`, `remove_ruins` | Rimuove resti |
| `destroy_buildings`, `make_ruins` | Cosa accade agli edifici (building) |
| `remove_water`, `remove_fire`, `remove_frozen`, `remove_tornado` | Rimuove stati |
| `add_burned`, `add_heat`, `flash` | Aggiunge stati |

Un `ProjectileAsset` ne cita uno in `terraform_option` con un relativo `terraform_range`, che è il modo in cui una freccia esplosiva ripulisce il terreno su cui impatta.

## Biomi

Un `BiomeAsset` in `AssetManager.biome_library` stabilisce quali caselle compaiono dove. Una casella si unisce a un bioma tramite `setBiome("biome_forest")` o includendo i corretti `biome_tags`. Clonare un bioma esistente scambiando gli id delle caselle è una strada molto più rapida rispetto a crearne uno da zero, e la regola del "clone che registra da solo" vale anche in questo caso.

> [!TIP] Le caselle superiori sono il vero cuore del modding
> Quasi tutto ciò che i modder creano realmente (mura, strade, coltivazioni, corruzioni che invadono un continente) è una casella superiore con una `step_action` e un pizzico di logica che decide dove posizionarla. Nuovi tipi di terreno di fondo sono più rari, più difficili da armonizzare e interagiscono con il generatore del mondo in modi che non avevi previsto :PES3_Yikes:.
