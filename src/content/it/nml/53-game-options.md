---
title: Opzioni di gioco
group: Contenuto di gioco
subgroup: Poteri divini e UI
icon: :wbsettingsgear:
order: 206
---

# Opzioni di gioco :wbsettingsgear:

In **[Impostazioni della mod](#/nml/mod-config)** hai visto la finestra di configurazione propria di NML (`default_config.json`), che dà alla tua mod una scheda di impostazioni pulita e separata.

WorldBox ha anche un proprio sistema nativo di opzioni: `AssetManager.options_library`, sostenuto da `PlayerConfig`. È il sistema che alimenta la finestra delle impostazioni vanilla, gli interruttori per sviluppatori e i pulsanti a interruttore dei poteri divini. Accanto ad esso c'è `AssetManager.time_scales`, che controlla quanto velocemente scorre il mondo.

## Registrare un'opzione nativa

Le opzioni in `AssetManager.options_library` sono istanze di `OptionAsset`:

```csharp Mods/HelloBox/Code/HelloOptions.cs
namespace HelloBox
{
    public static class HelloOptions
    {
        public const string TURBO_HARVEST = "hello_turbo_harvest";

        public static void Initialize()
        {
            if (AssetManager.options_library.has(TURBO_HARVEST)) return;

            OptionAsset option = new OptionAsset
            {
                id = TURBO_HARVEST,
                type = OptionType.Bool,
                default_bool = false,
                translation_key = "option_hello_turbo_harvest",
                translation_key_description = "option_desc_hello_turbo_harvest",
                action = (OptionAsset pAsset) =>
                {
                    bool active = IsTurboActive();
                    Main.Log("Turbo harvest is now: " + active);
                }
            };

            AssetManager.options_library.add(option);

            // Registrare l'asset NON popola automaticamente PlayerConfig.dict.
            // Assicurati che il valore esista così il tuo codice può leggerlo subito:
            if (!PlayerConfig.dict.ContainsKey(TURBO_HARVEST))
            {
                PlayerConfig.dict.Add(TURBO_HARVEST, new PlayerOptionData
                {
                    name = TURBO_HARVEST,
                    boolVal = option.default_bool
                });
            }
        }

        public static bool IsTurboActive()
        {
            if (PlayerConfig.dict.TryGetValue(TURBO_HARVEST, out PlayerOptionData data))
            {
                return data.boolVal;
            }
            return false;
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "option_hello_turbo_harvest": "Turbo Harvest",
  "option_desc_hello_turbo_harvest": "Settlers gather crops at triple speed."
}
```

### I campi su OptionAsset

| Campo | Cosa fa |
| --- | --- |
| `id` | Identificatore univoco dell'opzione |
| `type` | `OptionType.Bool`, `OptionType.Int`, o `OptionType.String` |
| `default_bool` / `default_int` / `default_string` | Il valore predefinito quando non è impostato |
| `translation_key` | Chiave di localizzazione per il titolo dell'opzione |
| `translation_key_description` | Chiave di localizzazione per il tooltip |
| `action` | Delegato di callback (`ActionOptionAsset`) attivato quando l'opzione cambia |
| `reset_to_default_on_launch` | Se ripristinare questa opzione al valore predefinito all'avvio del gioco |
| `computer_only` | Se vero, mostrata solo nelle build PC |

> [!WARNING] OptionAsset non è memorizzazione
> `OptionAsset` descrive solo i metadati e il callback dell'opzione. Il valore vero e proprio che il giocatore ha impostato vive in `PlayerConfig.dict[id]`. Se aggiungi un `OptionAsset` senza inserire anche un `PlayerOptionData` corrispondente in `PlayerConfig.dict`, qualsiasi codice che prova a indicizzare `PlayerConfig.dict[id]` lancia una `KeyNotFoundException` finché la finestra delle impostazioni non viene salvata!

## Collegarsi ai pulsanti a interruttore

Le opzioni native danno il meglio se abbinate ai pulsanti a interruttore `GodPower` sulla barra dei poteri.

Come spiegato in **[Schede e pulsanti di potere](#/nml/power-buttons)**, impostare `power.toggle_name = HelloOptions.TURBO_HARVEST` collega direttamente un pulsante allo stato della tua opzione. Al clic, il gioco commuta `PlayerConfig.dict[toggle_name].boolVal`, aggiorna l'evidenziazione visiva del pulsante e attiva il callback della tua opzione.

## Velocità di simulazione e scale temporali

WorldBox controlla la velocità di simulazione del gioco tramite `AssetManager.time_scales` (`WorldTimeScaleLibrary`). Ogni impostazione di velocità è un `WorldTimeScaleAsset`:

```csharp Mods/HelloBox/Code/HelloSpeed.cs
namespace HelloBox
{
    public static class HelloSpeed
    {
        public const string HYPER = "hello_hyper_speed";

        public static void Initialize()
        {
            if (AssetManager.time_scales.has(HYPER)) return;

            WorldTimeScaleAsset hyper = new WorldTimeScaleAsset
            {
                id = HYPER,
                locale_key = "speed_hello_hyper",
                multiplier = 10f,          // velocità di simulazione del mondo x10
                ticks = 2,                 // sotto-tick di simulazione per frame
                conway_ticks = 2,          // tick di CA per frame (fuoco, acido, temperatura)
                path_icon = "ui/Icons/iconClockX5"
            };

            AssetManager.time_scales.add(hyper);
        }
    }
}
```

| Campo | Cosa fa |
| --- | --- |
| `multiplier` | Moltiplicatore di velocità visiva e di mondo (`1f` = normale, `0.5f` = rallentatore) |
| `ticks` | Quanti passaggi di simulazione girano ad ogni frame |
| `conway_ticks` | Quanti passaggi dell'automa cellulare (diffusione dei tile, lava, ghiaccio) girano per frame |
| `locale_key` | Chiave di traduzione mostrata al passaggio del mouse sul pulsante dell'orologio |
| `path_icon` | Percorso della texture dell'icona dentro `ui/Icons/` |

Le velocità vanilla sono `slow_mo` (0.5x), `x1` (1x), `x2` (2x), `x3` (3x), `x4` (4x) e `x5` (5x). La velocità sonica (velocità Greg nelle opzioni di debug) spinge i tick di simulazione ancora più in alto.

Per attivare una velocità via codice:

```csharp
// Passa dolcemente l'orologio del mondo al tuo asset di velocità:
WorldTimeScaleAsset target = AssetManager.time_scales.get(HelloSpeed.HYPER);
if (target != null)
{
    Config.time_scale_asset = target;
}
```

## Quale via seguire per le impostazioni?

| Necessità | Via consigliata |
| --- | --- |
| Configurazioni specifiche della mod (moltiplicatori di danno, conteggi di spawn, funzionalità attivabili) | **[Impostazioni della mod](#/nml/mod-config)** (`default_config.json`). Vive sulla scheda della tua mod, gestisce numeri/stringhe in modo pulito e non inquina l'UI del gioco base |
| Interruttori collegati ai pulsanti della barra degli strumenti | `OptionAsset` nativo + `GodPower.toggle_name` |
| Velocità di gioco personalizzate o ritmo di simulazione | `AssetManager.time_scales` (`WorldTimeScaleAsset`) |

Prossima pagina: **[Messaggi e registro del mondo](#/nml/messages-and-world-log)** per mostrare suggerimenti e registrare la storia del mondo.
