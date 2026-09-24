---
title: Edifici personalizzati
group: Contenuto di gioco
subgroup: Attori, edifici e IA
icon: :wbcities:
order: 142
---

# Edifici personalizzati :wbcities:

Gli edifici (building) sono il punto in cui il modding di WorldBox smette di essere "cambia un numero" e diventa "questo asset ha centoquaranta campi e la maggior parte non fa nulla nel mio caso" :PES2_Weary:.

Quindi non ne creiamo uno da zero. Cloniamo un edificio già funzionante.

## Prima clona, poi modifica

`clone(newId, sourceId)` copia ogni campo dell'originale, lo rinomina **e lo registra**. Quest'ultima parte conta:

```csharp Mods/HelloBox/Code/HelloBuildings.cs
namespace HelloBox
{
    public static class HelloBuildings
    {
        public const string SHRINE = "hello_shrine";

        public static void Initialize()
        {
            if (AssetManager.buildings.has(SHRINE)) return;

            BuildingAsset shrine = AssetManager.buildings.clone(SHRINE, "temple_human");

            shrine.sprite_path = "buildings/hello_shrine";   // a folder, used exactly as written

            // The game preloads every building's frames during its own startup, before your
            // mod existed. Load this one now, or placing it throws "Index was out of range".
            shrine.loadBuildingSprites();

            // Same story for the atlas that recolours it in the owner's colour: the library
            // links it in checkAtlasLink() at startup. Without it every frame throws.
            shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);
            shrine.building_type = BuildingType.Building_Civ;
            shrine.city_building = true;
            shrine.has_kingdom_color = true;
            shrine.max_houses = 0;                     // not housing, nobody lives here
            shrine.housing_slots = 0;
            shrine.draw_light_area = true;
            shrine.draw_light_size = 0.6f;
        }
    }
}
```

Tutto quello che non imposti resta esattamente com'era su `temple_human`, che è un edificio cittadino funzionante. Tutto il trucco è qui.

> [!WARNING] Non chiamare `add()` dopo `clone()`
> `clone()` ha già registrato la copia. Chiamare `AssetManager.buildings.add(shrine)` dopo la registra una seconda volta, e la libreria (library) scarta la prima copia scrivendo `duplicate asset - overwriting...` nel log. Funziona lo stesso, ma è rumore nel log ed è la prima cosa che farà notare chiunque riveda il tuo codice.

## Da cosa clonare

La libreria include sia template con prefisso `$…$` sia edifici completi:

| Origine | Scopo |
| --- | --- |
| `$building$` | La base essenziale |
| `$city_building$` | Qualsiasi cosa costruita da una città. Usato da `well` e `mine` |
| `$city_colored_building$` | Identico, ma tinto con il colore del regno (kingdom) |
| `$building_civ_human$` / `_elf$` / `_orc$` / `_dwarf$` | Edifici civili specifici per cultura (culture) |
| `$building_creep$` | Strutture di biomi (biome) infestanti (creep) |
| `$mineral$` | Rocce e minerali estraibili |
| `$resource$`, `$flora_small$` | Natura raccoglibile |
| `tree_green_1` | Ogni albero vanilla viene clonato da questo |

Edifici completi da cui vale la pena clonare: `house_human_0` … `house_human_5`, `barracks_human`, `temple_human`, `library_human`, `market_human`, `docks_human`, `well`, `mine`, `mineral_stone`, `mineral_gold`.

Clonare il parente più prossimo richiede dieci minuti di lettura e risparmia un'intera serata persa su campi privi di effetto.

## I campi, in base a ciò che ti serve

### Che tipo di edificio è

| Campo | Cosa fa |
| --- | --- |
| `building_type` | `Building_Civ`, `Building_Nature`, `Building_Tree`, `Building_Mineral`, `Building_Mob`, `Building_Creep`, `Building_Plant`, `Building_Fruits`, `Building_Hives`, `Building_Wheat` |
| `city_building` | Appartiene a una città, quindi riceve colori del regno, zone e posti di lavoro (job) |
| `type` | Un tag testuale libero usato per raggruppare gli elenchi interni del gioco |
| `kingdom`, `civ_kingdom` | Limita l'edificio a una fazione specifica |
| `ignored_by_cities` | Le città non lo costruiscono né lo conteggiano mai |

### Abitazione e utilizzo

| Campo | Cosa fa |
| --- | --- |
| `max_houses`, `housing_slots`, `can_units_live_here` | Se e quanti cittadini possono viverci |
| `housing_happiness` | Bonus di felicità derivante dall'abitarvi |
| `storage`, `storage_only_food`, `is_stockpile` | Se funge da deposito risorse (resource) |
| `book_slots` | Capacità di libri nelle biblioteche |
| `docks`, `boat_types`, `boat_type_fishing`, `boat_type_trading`, `boat_type_transport` | Produzione navale |
| `spawn_units`, `spawn_units_asset` | Genera creature |
| `tower`, `tower_projectile`, `tower_projectile_reload`, `tower_projectile_amount`, `tower_attack_buildings` | Funzionalità di attacco e torretta |

### Costruzione e posizionamento

| Campo | Cosa fa |
| --- | --- |
| `cost`, `construction_progress_needed` | Costo per la città e tempo richiesto per la costruzione |
| `can_be_upgraded`, `upgrade_to`, `upgraded_from`, `upgrade_level` | Catene di potenziamento, come `house_human_0` fino a `_5` |
| `build_place_borders`, `build_place_center`, `build_place_single`, `build_place_batch` | Posizionamento all'interno del borgo |
| `build_prefer_replace_house`, `check_for_close_building`, `ignore_same_building_id` | Regole di collocazione |
| `limit_per_zone`, `limit_in_radius`, `limit_global` | Quanti ne possono esistere |
| `can_be_placed_on_liquid`, `can_be_placed_on_blocks`, `needs_farms_ground`, `only_build_tiles` | Regole relative al terreno |
| `build_road_to` | La città traccia una strada fino a esso |

### Natura e crescita

| Campo | Cosa fa |
| --- | --- |
| `can_be_grown`, `vegetation_random_chance`, `is_vegetation` | Compare spontaneamente con il passare del tempo |
| `growth_time`, `has_resources_grown_to_collect` | Cicli di crescita di frutti e coltivazioni |
| `biome_tags_growth`, `has_biome_tags` | In quali biomi può crescere |
| `resources_given`, `addResource(id, amount, pNewList)` | Risorse conferite alla raccolta |
| `can_be_chopped_down`, `gatherable` | Se le unità possono abbatterlo o raccoglierlo |
| `grow_creep` e le varianti `grow_creep_*` | Meccaniche di propagazione infestante |

### Danni e distruzione

| Campo | Cosa fa |
| --- | --- |
| `burnable`, `affected_by_lava`, `affected_by_acid`, `damaged_by_rain`, `can_be_damaged_by_tornado` | Quali elementi possono danneggiarlo |
| `has_ruins_graphics`, `has_ruin_state`, `auto_remove_ruin`, `remove_ruins` | Cosa lascia dietro di sé una volta distrutto |
| `can_be_demolished`, `can_be_abandoned`, `destroy_on_liquid` | Come viene rimosso o abbandonato |
| `loot_generation` | Bottino rilasciato alla distruzione |

### Aspetto visivo

| Campo | Cosa fa |
| --- | --- |
| `sprite_path` + `main_path` | Percorso in cui risiede lo sprite |
| `atlas_id`, `atlas_id_fallback_when_not_wobbly` | Quale atlas di sprite viene impiegato |
| `scale_base`, `bonus_z`, `random_flip` | Dimensioni, ordine di disegno e specchiatura |
| `shadow`, `shadow_bound`, `shadow_distortion` | Gestione dell'ombra |
| `has_kingdom_color` | Tinto con il colore del regno proprietario |
| `draw_light_area`, `draw_light_size` | Alone luminoso |
| `has_special_animation_state`, `animation_speed`, `sparkle_effect` | Animazioni |

### Comportamento

| Campo | Cosa fa |
| --- | --- |
| `step_action`, `has_step_action` | Codice personalizzato eseguito a ogni tick dell'edificio |
| `base_stats` | Statistiche (stats) conferite dall'edificio |
| `priority` | Priorità nella coda di costruzione cittadina |

## Sprite

Gli edifici caricano la grafica da `sprite_path`, usato **esattamente come è scritto**. Solo se lasci `sprite_path` vuoto il gioco ripiega su `main_path + id`. Metti la tua grafica in `GameResources/buildings/hello_shrine/` e dalle un pivot in basso al centro nel tuo `sprites.json`, altrimenti il tuo santuario fluttua sopra il terreno come un fantasma :aPES_GhostDance:. Vedi **[Sprite e risorse](#/nml/sprites-and-resources)**.

## Il tuo sprite personale

Scegli una delle due forme qui sotto e non mescolarle. Il loader fa letteralmente questo: usa `sprite_path` se contiene qualcosa, altrimenti `main_path + id`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── buildings/
        └── hello_shrine/
            ├── main_0.png           the building itself
            ├── construction_0.png   while a city is still building it
            ├── ruin_0.png           what is left after it is destroyed
            ├── mini_0.png           the minimap dot, one pixel per tile it covers
            └── sprites.json         bottom-centre pivot
```

I **nomi dei file sono il formato**. Il loader divide ogni nome sul `_`: la parte prima è il tipo (`main`, `construction`, `ruin`, `disabled`, `spawn`, `special`, e `mini` per la minimappa), il numero dopo è il frame dell'animazione. `mini_0` deve avere esattamente tanti pixel quante sono le caselle (tile) occupate dall'edificio, 5x4 per qualsiasi cosa clonata da `temple_human`; se lo ometti, la minimappa lancia `NullReferenceException` in `Building.getColorForMinimap()` a ogni ridisegno. `main_0`, `main_1`, `main_2` è un'animazione di tre frame. Un file con qualsiasi altro nome non è un frame, e una cartella senza `main_0` non dà all'edificio niente da disegnare.

```csharp
// A: full path in sprite_path. main_path is then ignored.
shrine.sprite_path = "buildings/hello_shrine";

// B: leave sprite_path empty and let main_path + id decide.
shrine.sprite_path = string.Empty;
shrine.main_path = "buildings/";       // -> buildings/hello_shrine
```

Se le mescoli, cartella in `main_path` e `sprite_path` vuoto, il gioco cerca `buildings/hello_shrine/hello_shrine` :aPES_BrainScratch:.

> [!WARNING] Carica tu i frame, dopo aver impostato il percorso
> Il gioco riempie `building_sprites` per ogni edificio nel suo precaricamento, che gira prima della tua mod. Un edificio che registri dopo ha la lista dei frame vuota, e la prima volta che ne piazzi uno il gioco muore in `Building.setAnimData()` con `ArgumentOutOfRangeException: Index was out of range` :wbfacepalm:. Chiama `shrine.loadBuildingSprites();` non appena `sprite_path` è impostato.
>
> Suo fratello è `atlas_asset`, l'atlante di sprite che colora l'edificio con il colore del proprietario. La libreria lo collega in `checkAtlasLink()`, anche questo all'avvio. Saltalo e l'edificio si piazza senza problemi, ma poi lancia `NullReferenceException` in `DynamicSprites.getRecoloredBuilding()` in **ogni frame in cui è sullo schermo**.

Dagli un **pivot in basso al centro** nel tuo `sprites.json`, altrimenti il tuo santuario fluttua sopra il terreno come un fantasma (vedi **[Sprite e risorse](#/nml/sprites-and-resources)**).

## Posizionarne uno sulla mappa

`World.world.buildings.addBuilding(...)` è contrassegnato come `internal`, quindi compila solo facendo riferimento a una `Assembly-CSharp.dll` **pubblicizzata**; vedi la nota in **[Effetti di stato](#/nml/status-effects)**:

```csharp
BuildingAsset asset = AssetManager.buildings.get(HelloBuildings.SHRINE);
if (asset == null || tile == null) return;

if (World.world.buildings.canBuildFrom(tile, asset, null, BuildPlacingType.New))
{
    World.world.buildings.addBuilding(asset, tile);
}
```

Verifica sempre con `canBuildFrom` prima di procedere. Posizionare un edificio sull'acqua, su un'altra costruzione o su una tessera riservata dalla città produrrà un mondo apparentemente integro che crasherà tre minuti più tardi :PES_OhShit:.


## Far costruire l'edificio alle città

Un potere divino (GodPower) che fa comparire il tuo santuario è divertente per un'ora. Un santuario che le città costruiscono da sole, quando sono abbastanza grandi, è una mod. Le città scelgono cosa costruire da due elementi, e il tuo edificio non è ancora in nessuno dei due:

| | Cosa contiene |
| --- | --- |
| Un **ordine di costruzione** (`AssetManager.city_build_orders`) | Un elenco di chiavi d'ordine come `order_temple`, con la popolazione e il numero di edifici richiesti per ciascuna |
| Un'**architettura** (`AssetManager.architecture_library`) | Quale edificio indica una chiave d'ordine per quel tipo di creatura: `order_temple` è `temple_human` per gli umani, un'altra cosa per gli orchi |

Quindi inventi una chiave d'ordine, insegni a ogni architettura cosa significa e la aggiungi agli ordini di costruzione:

```csharp Mods/HelloBox/Code/HelloBuildings.cs
public const string ORDER = "order_hello_shrine";

private static void AddToCities()
{
    BuildingAsset shrine = AssetManager.buildings.get(SHRINE);
    if (shrine == null) return;

    // Un tipo proprio, così la città conta i santuari rispetto al proprio limite, non ai templi
    shrine.type = "type_hello_shrine";

    // La ricerca dell'architettura è un semplice dizionario: una chiave sconosciuta genera un errore per ogni città
    // di quella creatura. Insegnala a tutte, anche a quelle che non la raggiungeranno mai.
    foreach (ArchitectureAsset architecture in AssetManager.architecture_library.list)
    {
        architecture.addBuildingOrderKey(ORDER, SHRINE);
    }

    foreach (CityBuildOrderAsset orders in AssetManager.city_build_orders.list)
    {
        if (orders.list.Exists(pOrder => pOrder.id == ORDER)) continue;

        // stesso limite usato dal tempio: 1, 50 abitanti, 15 edifici in città
        orders.addBuilding(ORDER, 1, 50, 15);
    }
}
```

Chiama `AddToCities()` alla fine di `Initialize()`, dopo il clone.

A differenza della maggior parte di questa guida, qui non c'è nessuna trappola all'avvio: `CityBehBuild.calcPossibleBuildings()` legge l'elenco degli ordini di costruzione di ogni città ogni volta che valuta di costruire, quindi un ordine aggiunto al caricamento è visibile dalla prima città che controlla. La città deve comunque poter pagare il `cost` dell'edificio e soddisfare ogni parametro dell'ordine; quando non può, salta il tuo santuario senza dire nulla :PES5_Hmmmm:.

| Argomento di `addBuilding(...)` | Cosa fa |
| --- | --- |
| `pID` | La chiave d'ordine, non l'id dell'edificio |
| `pLimitType` | Quanti ne può possedere la città. Il tempio usa `1` |
| `pPop` | Popolazione minima |
| `pBuildings` | Numero minimo di edifici già presenti in città |
| `pCheckFullVillage` | Solo quando ogni casa è occupata |
| `pCheckHouseLimit` | Per le case: ignora finché l'alloggio non scarseggia, fermati al limite di case della città |
| `pMinZones` | Dimensione minima della città, in zone |

## I testi

```json Mods/HelloBox/Locales/en.json
{
  "hello_shrine": "Shrine",
  "hello_shrine_description": "Nobody remembers who built it. Everybody agrees it should not be touched."
}
```

> [!TIP] Studia l'originale prima di clonarlo
> Apri `BuildingLibrary` in **dnSpy** e guarda in cosa differiscono `house_human_0`, `tree_green_1` e `mineral_stone`. Ogni edificio vanilla è costruito lì in C# elementare, costituendo la migliore documentazione campo per campo disponibile :PES_Smart:.
