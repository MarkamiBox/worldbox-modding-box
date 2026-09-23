---
title: Disastri
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbmeteorite:
order: 184
---

# Disastri :wbmeteorite:

Un disastro è qualcosa che il mondo fa a se stesso: un tornado, un'ondata di calore, un meteorite. Il gioco esegue periodicamente dei tiri con il passare del tempo, quindi a differenza di un potere divino, **nessuno deve cliccare nulla**. Tu imposti le condizioni, il mondo fa il resto.

## Aggiungerne uno

```csharp Mods/HelloBox/Code/HelloDisasters.cs
namespace HelloBox
{
    public static class HelloDisasters
    {
        public const string EMBER_STORM = "hello_ember_storm";
        public const string EMBER_STORM_LOG = "disaster_hello_ember_storm";

        public static void Initialize()
        {
            if (AssetManager.disasters.has(EMBER_STORM)) return;

            // The line in the world log. world_log below is the id of this asset, not a text key.
            if (!AssetManager.world_log_library.has(EMBER_STORM_LOG))
            {
                WorldLogAsset log = AssetManager.world_log_library.clone(EMBER_STORM_LOG, "$basic_disaster$");
                log.locale_id = "worldlog_disaster_hello_ember_storm";
                log.path_icon = "ui/Icons/iconHelloDisaster";
            }

            DisasterAsset emberStorm = new DisasterAsset
            {
                id = EMBER_STORM,
                rate = 4,                      // weight: how often it is picked vs other disasters
                chance = 0.5f,                 // and then a coin flip on top
                min_world_population = 100,    // don't ruin an empty world
                min_world_cities = 1,
                world_log = EMBER_STORM_LOG,
                type = DisasterType.Nature
            };

            emberStorm.action = (DisasterAsset pAsset) =>
            {
                WorldTile first = null;

                // 40 embers on random tiles. tiles_list is every tile in the world.
                for (int i = 0; i < 40; i++)
                {
                    WorldTile tile = World.world.tiles_list[Randy.randomInt(0, World.world.tiles_list.Length)];
                    if (tile == null) continue;
                    if (first == null) first = tile;
                    World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                }

                // one line in the log, pointing at where it started
                if (first != null) WorldLog.logDisaster(pAsset, first);
            };

            AssetManager.disasters.add(emberStorm);
        }
    }
}
```

Registralo in `Main.cs` (vedi **[Il mod completo](#/nml/all-together)**), carica un mondo con almeno una città e cento unità, e aspetta. Alla fine il cielo inizierà a far piovere tizzoni da solo :wbfireskull:.

### I campi

| Campo | Cosa fa |
| --- | --- |
| `rate` | Peso: quanto spesso viene sorteggiato rispetto agli altri |
| `chance` | Un secondo tiro una volta sorteggiato |
| `min_world_population` / `min_world_cities` | Condizioni minime prima che possa verificarsi |
| `type` | `DisasterType.Nature`, `Other`, … |
| `world_log` | L'ID di un `WorldLogAsset`: la riga nel log del mondo. **Non** una chiave di testo, vedi sotto |
| `action` | Il tuo codice. Questo è il disastro vero e proprio |
| `spawn_asset_unit` + `units_min`/`units_max` | Scorciatoia per "genera N esemplari di questa creatura" |
| `max_existing_units` | Non generarne altri se ne esistono già così tanti |

## Generare creature senza codice

```csharp
DisasterAsset wolves = new DisasterAsset
{
    id = "hello_wolf_year",
    rate = 2,
    chance = 0.3f,
    min_world_cities = 2,
    world_log = "disaster_hello_wolf_year",
    type = DisasterType.Other,

    // spawn 4 to 8 wolves, but only if the world has fewer than 40
    spawn_asset_unit = "wolf",
    units_min = 4,
    units_max = 8,
    max_existing_units = 40
};

// the game calls action without checking it: point it at the vanilla spawner
wolves.action = AssetManager.disasters.simpleUnitAssetSpawnUsingIslands;

AssetManager.disasters.add(wolves);
```

"Senza codice" è quasi vero. Un disastro necessita **sempre** di un'`action`, perché il tiro di sorteggio la invoca senza alcun controllo sui nulli: lasciala vuota e la prima volta che viene sorteggiato otterrai una `NullReferenceException`. I disastri di creature vanilla puntano tutti a `simpleUnitAssetSpawnUsingIslands`, che legge `spawn_asset_unit`, `units_min`, `units_max` e `max_existing_units`, scrivendo la riga di log per te. Anche il tuo può farlo.

## La riga nel registro del mondo

`world_log` non è il testo diretto. È l'**ID di un `WorldLogAsset`** in `AssetManager.world_log_library`, e quell'asset punta alla chiave di testo. Se usi un ID inesistente, nel momento in cui il disastro prova a registrarsi, `WorldLog.logDisaster()` costruisce il messaggio attorno a `null` e lancia una `NullReferenceException` :wbfacepalm:.

I disastri vanilla clonano un modello standard, `$basic_disaster$`, che ha già il colore di avviso e il gruppo "disasters". `HelloDisasters` fa lo stesso:

```csharp
WorldLogAsset log = AssetManager.world_log_library.clone("disaster_hello_ember_storm", "$basic_disaster$");
log.locale_id = "worldlog_disaster_hello_ember_storm";   // the text key
log.path_icon = "ui/Icons/iconHelloDisaster";            // the icon next to the line
```

Poi qualcosa deve scrivere la riga nel log. Gli spawner vanilla invocano `WorldLog.logDisaster(pAsset, tile)` da soli. Un'`action` personalizzata non lo fa automaticamente, quindi la tua la chiama una volta con la casella su cui la tempesta è iniziata: è il punto su cui salta il pulsante "vai lì" del log.

| Campo di `WorldLogAsset` | Cosa fa |
| --- | --- |
| `locale_id` | La chiave del testo. Ricade sull'ID se lasciata vuota |
| `path_icon` | L'icona all'inizio della riga |
| `color` | Il colore della riga. Il template usa il colore di avviso |
| `group` | Il filtro del log del mondo a cui appartiene |
| `random_ids` | Sceglie a caso tra più testi: `<locale_id>_1`, `_2`... |

L'esempio dei lupi necessita delle stesse due cose: il proprio asset di log clonato con `disaster_hello_wolf_year` e il testo `worldlog_disaster_hello_wolf_year`. Lo spawner vanilla scriverà la riga automaticamente.

```json Mods/HelloBox/Locales/en.json
{
  "worldlog_disaster_hello_ember_storm": "Embers are falling from the sky!"
}
```

Scrivilo come un titolo di giornale, non come una descrizione tecnica. È la frase che il giocatore leggerà nel log del mondo.

> [!WARNING] Fai i test con numeri molto alti
> `rate = 4, chance = 0.5f` significa che potresti aspettare venti minuti prima di vedere il tuo disastro. Durante lo sviluppo aumenta molto il `rate` e azzera i requisiti minimi, poi ripristinali prima di pubblicare :PES2_EvilPlan:.
