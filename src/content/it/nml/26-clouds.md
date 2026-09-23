---
title: Nuvole e meteo
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbtornado:
order: 172
---

# Nuvole e meteo :wbtornado:

Una nuvola è uno sprite che si sposta sulla mappa facendo cadere oggetti su qualsiasi cosa si trovi al di sotto. Pioggia, acido, lava, neve, fuoco: sono tutti lo stesso identico asset con un colore diverso e un `drop_id` differente.

Le nuvole offrono il miglior rapporto risultato/sforzo di tutto il gioco per un modder. Un unico asset, nessun disegno necessario, e si muove, rilascia gocce, illumina il terreno e compare da sola nell'elenco dei disastri.

## Registrarne una

```csharp Mods/HelloBox/Code/HelloClouds.cs
using System.Collections.Generic;
using UnityEngine;

namespace HelloBox
{
    public static class HelloClouds
    {
        public const string EMBER = "hello_cloud_ember";

        // Your own art: GameResources/effects/clouds/hello_cloud.png
        private static readonly string[] Sprites = new string[]
        {
            "effects/clouds/hello_cloud"
        };

        public static void Initialize()
        {
            if (AssetManager.clouds.has(EMBER)) return;

            AssetManager.clouds.add(new CloudAsset
            {
                id = EMBER,
                color_hex = "#D14219",
                max_alpha = 0.8f,
                drop_id = "hello_ember",          // a drop id: see Drops & falling things
                cloud_action_1 = CloudLibrary.dropAction,
                interval_action_1 = 0.05f,
                speed_min = 1f,
                speed_max = 3f,
                considered_disaster = true,       // counts as a disaster in the game's own lists
                draw_light_area = true,
                draw_light_size = 4f,
                path_sprites = Sprites
            });

            // CloudLibrary turns path_sprites into sprites and color_hex into a colour during
            // the game's own startup, before your mod existed. Do both for yours.
            CloudAsset cloud = AssetManager.clouds.get(EMBER);
            List<Sprite> loaded = new List<Sprite>();
            foreach (string path in cloud.path_sprites)
            {
                Sprite sprite = SpriteTextureLoader.getSprite(path);
                if (sprite != null) loaded.Add(sprite);
            }
            cloud.cached_sprites = loaded.ToArray();
            cloud.color = Toolbox.makeColor(cloud.color_hex);
        }
    }
}
```

> [!WARNING] Una nuvola registrata tardi non ha sprite
> `CloudLibrary` costruisce `cached_sprites` da `path_sprites` e `color` da `color_hex` in un solo passaggio mentre il gioco carica. La tua nuvola non era ancora nella lista, quindi restano entrambi vuoti, e la prima volta che compare il gioco lancia `NullReferenceException` in `Cloud.prepare()` :wbfacepalm:. Le ultime sei righe di `Initialize` fanno quel passaggio per la tua.


### I campi

| Campo | Cosa fa |
| --- | --- |
| `color_hex` | La tinta. Costituisce quasi tutta l'identità visiva della nuvola |
| `max_alpha` | Quanto appare solida. `0.8` per impostazione predefinita |
| `drop_id` | La goccia che piove. Qualsiasi id in `AssetManager.drops`, vanilla o tuo |
| `cloud_action_1` / `cloud_action_2` | Due azioni indipendenti, ciascuna con il proprio intervallo di tempo |
| `interval_action_1` / `interval_action_2` | Secondi tra un'esecuzione e l'altra di ogni azione |
| `speed_min` / `speed_max` | Velocità di spostamento. Ogni nuvola estrae un valore casuale in questo intervallo |
| `path_sprites` | L'elenco degli sprite. Il gioco ne sceglie uno a caso per ogni nuvola |
| `considered_disaster` | Se il gioco la considera ufficialmente un disastro |
| `normal_cloud` | La contrassegna come meteo comune anziché come evento straordinario |
| `draw_light_area`, `draw_light_size`, `draw_light_area_offset_x/y` | Il bagliore a terra, per nuvole di fuoco e lava |

## Cos'è un'azione di nuvola

Una `CloudAction` riceve l'istanza della nuvola e non restituisce nulla:

```csharp
public delegate void CloudAction(Cloud pCloud);
```

`CloudLibrary.dropAction` è l'azione vanilla standard: sceglie una casella casuale sotto lo sprite della nuvola e vi genera un `drop_id`. Nel 90% dei casi è l'unica azione che desideri: la assegni a `cloud_action_1` e hai finito.

Per qualcosa in più, scrivi un tuo metodo e assegnalo a `cloud_action_2`:

```csharp
private static void SparkAction(Cloud pCloud)
{
    // Viene eseguito ogni interval_action_2 secondi per ciascuna nuvola di questo tipo sulla mappa.
    // Mantienilo leggero e tira un controllo di probabilità affinché non si attivi all'infinito.
    if (!Randy.randomChance(0.02f)) return;

    int x = (int)pCloud.transform.localPosition.x;
    int y = (int)pCloud.transform.localPosition.y;

    WorldTile tile = World.world.GetTile(x, y);
    if (tile == null) return;

    MapBox.spawnLightningSmall(tile, 0.15f);
}
```

Poi imposti `cloud_action_2 = SparkAction; interval_action_2 = 0.1f;`.

## I tuoi sprite personali

`path_sprites` è una lista, e ogni voce viene caricata esattamente come scritta da dentro `GameResources/`. Il gioco seleziona una texture per nuvola, ed è per questo che vanilla ne passa tre.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/clouds/
        ├── cloud_hello_1.png
        ├── cloud_hello_2.png
        └── cloud_hello_3.png
```

```csharp
path_sprites = new string[]
{
    "effects/clouds/cloud_hello_1",
    "effects/clouds/cloud_hello_2",
    "effects/clouds/cloud_hello_3"
}
```

Lo sprite di una nuvola è una macchia sfumata in scala di grigi. `color_hex` compie tutto il lavoro visivo, quindi non dipingerla del colore finale desiderato: lasciala bianca e lascia che la tinta se ne occupi :wbsmirk:.

## Metterne una nel cielo

Le nuvole vengono generate attraverso il sistema degli effetti, non tramite un ipotetico gestore delle nuvole:

```csharp
EffectsLibrary.spawn("fx_cloud", tile, HelloClouds.EMBER);
```

Questo è esattamente ciò che fa ogni potere vanilla legato alle nuvole. Racchiudilo in un potere divino e il giocatore otterrà uno strumento di invocazione:

```csharp
GodPower power = new GodPower
{
    id = "hello_cloud_power",
    name = "hello_cloud_power",
    rank = PowerRank.Rank0_free,
    path_icon = "ui/Icons/iconFire",
    click_action = (WorldTile pTile, string pPowerID) =>
    {
        if (pTile == null) return false;

        EffectsLibrary.spawn("fx_cloud", pTile, HelloClouds.EMBER);
        MusicBox.playSound("event:/SFX/UNIQUE/SpawnCloud", pTile.pos.x, pTile.pos.y);
        return true;
    }
};
AssetManager.powers.add(power);
```

Vedi **[Poteri divini](#/nml/god-powers)** e **[Schede e pulsanti dei poteri](#/nml/power-buttons)** per il pulsante d'interfaccia.

## Le nuvole vanilla

Utili come sorgenti di clonazione e come promemoria di ciò che già esiste nel gioco:

`cloud_rain` · `cloud_lightning` · `cloud_snow` · `cloud_fire` · `cloud_lava` · `cloud_acid` · `cloud_ash` · `cloud_rage`

```csharp
// Parti da una già funzionante e cambia il colore e la goccia rilasciata.
CloudAsset mine = AssetManager.clouds.clone("hello_cloud_blood", "cloud_rain");
mine.color_hex = "#8B1A1A";
mine.drop_id = "blood";
```

Ricorda che `clone()` registra l'asset per te: non chiamare `add()` subito dopo.

## Sprite disegnati da te

`path_sprites` è un elenco di percorsi all'interno della cartella `GameResources/`, con le stesse regole usate per tutto il resto. Vedi **[Sprite e risorse](#/nml/sprites-and-resources)**. Lo sprite di una nuvola è una macchia soffice; `color_hex` fa tutto il lavoro, quindi una sagoma in scala di grigi è solitamente più che sufficiente.

> [!TIP] Nuvole prima dei disastri veri e propri
> Un "disastro" nelle liste interne del gioco è spesso solo una nuvola con `considered_disaster = true`. Prima di scrivere un intero disastro con condizioni di spawn e timer, controlla se una nuvola che fa piovere il tuo drop non faccia già esattamente al caso tuo :PES2_HmmmmThumbsUp:.
