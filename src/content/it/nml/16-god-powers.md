---
title: Poteri divini
group: Contenuto di gioco
subgroup: Poteri divini e UI
icon: :wbgodfinger:
order: 200
---

# Poteri divini :wbgodfinger:

Un potere divino (GodPower) è ciò che accade quando il giocatore seleziona il tuo strumento e fa clic sul mondo. Generare qualcosa, benedire qualcosa, far esplodere qualcosa.

Sono coinvolti due elementi distinti, e confonderli è il classico errore dei principianti:

| | |
| --- | --- |
| Il **potere** (`GodPower`) | I dati: un id, un'icona e il codice eseguito al clic |
| Il **pulsante** (`PowerButton`) | L'elemento nella barra che il giocatore può effettivamente premere |

Questa pagina crea il potere. La pagina **[Schede e pulsanti di potere](#/nml/power-buttons)** lo visualizza a schermo.

## Creare il potere

```csharp Mods/HelloBox/Code/HelloPowers.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloPowers
    {
        public const string STRIKE = "hello_strike";

        public static void Initialize()
        {
            // Evita di sostituire un asset già registrato con questo id.
            if (AssetManager.powers.get(STRIKE) != null) return;

            GodPower strike = new GodPower
            {
                id = STRIKE,
                name = STRIKE,
                rank = PowerRank.Rank0_free,        // nessuno sblocco richiesto
                path_icon = "ui/Icons/iconFire",
                unselect_when_window = true,        // rilascia lo strumento se si apre una finestra
                show_tool_sizes = false,            // niente pennelli di dimensione piccola/media/grande

                // Cosa succede quando il giocatore fa clic su una tessera con questo strumento in mano.
                click_action = (WorldTile pTile, string pPowerID) =>
                {
                    if (pTile == null) return false;

                    EffectsLibrary.spawnExplosionWave(pTile.posV3, 3f, 0.5f);
                    Earthquake.startQuake(pTile);
                    return true;   // true = il clic è stato utilizzato
                }
            };

            AssetManager.powers.add(strike);
        }
    }
}
```

Aggiungi `HelloPowers.Initialize();` a `Main.cs`.

### Cosa fa ciascuna parte

- **`id`**: il nome a cui si riferisce tutto il resto. Il pulsante, la traduzione, le altre mod.
- **`name`**: usato dalle ricerche dell'interfaccia del gioco. Tenerlo uguale all'id ti risparmia un mal di testa.
- **`rank = PowerRank.Rank0_free`**: disponibile da subito, niente da sbloccare.
- **`path_icon`**: l'icona del cursore/strumento.
- **`unselect_when_window`**: quando il giocatore apre una finestra, lo strumento si disarma da solo, così non fulmina per sbaglio la mappa dietro al pannello.
- **`click_action`**: il tuo codice. Riceve la **casella (tile) cliccata** e l'**id del potere**, e restituisce `true` se ha fatto qualcosa.

> [!WARNING] La firma del clic è `(WorldTile, string)`
> `click_action` è un `PowerActionWithID`, quindi il secondo argomento è l'**id del potere come stringa**, non un `GodPower`. Esiste un secondo campo, `click_power_action`, che prende `(WorldTile, GodPower)`. Usare la forma sbagliata ti dà un errore di compilazione che sembra senza senso :PES_DaFuq:.

## Cose utili da fare al clic

```csharp
// l'unità che si trova sopra (o accanto a) la tessera, se presente
Actor actor = null;
foreach (Actor found in Finder.getUnitsFromChunk(pTile, 1, 2.5f))
{
    if (found != null && found.isAlive()) { actor = found; break; }
}

// generare una creatura
World.world.units.spawnNewUnit("wolf", pTile);

// un effetto visivo sulla tessera
EffectsLibrary.spawnAt("fx_lightning_small", pTile.posV3, 0.25f);

// far cadere qualcosa dal cielo (vedi Gocce & oggetti che cadono)
World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

// mostrare un messaggio al giocatore
WorldTip.showNow("The gods are displeased.", false, "top", 3f);
```

## Tenere premuto per dipingere

Impostare `hold_action = true` e un `click_interval` fa sì che il potere si ripeta mentre si tiene premuto il mouse, proprio come i pennelli vanilla:

```csharp
strike.hold_action = true;
strike.click_interval = 0.15f;   // secondi tra ogni ripetizione
```

## Quale delegato disegna il pennello?

| Campo | Cosa fa |
| --- | --- |
| `click_action` | `bool (WorldTile pTile, string pPowerID)` per una singola casella |
| `click_brush_action` | Stessa firma, chiamato al posto di `click_action` quando assegnato |
| `click_power_action` | `bool (WorldTile pTile, GodPower pPower)` per una singola casella |
| `click_power_brush_action` | Stessa firma basata sull'asset, chiamato al posto di `click_power_action` quando assegnato |

Il percorso del clic del giocatore preferisce la coppia basata sull'asset quando uno dei due campi è impostato. Un delegato di pennello riceve la casella centrale. Non gira magicamente una volta per ogni pixel del pennello. Questa sostituzione opzionale va dentro la configurazione del potere, dopo che `click_action` è stato assegnato:

```csharp
strike.show_tool_sizes = true;
strike.click_brush_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null || World.world == null) return false;
    GodPower power = AssetManager.powers.get(pPowerID);
    if (power == null || power.click_action == null) return false;
    World.world.loopWithBrush(pTile, Config.current_brush_data,
        power.click_action, pPowerID);
    return true;
};
```

> [!WARNING] Un cursore più grande non è un effetto più grande
> `show_tool_sizes` espone la selezione del pennello. Il tuo callback del pennello deve comunque scorrere le caselle. L'helper vanilla `PowerLibrary.loopWithCurrentBrush` è privato; l'esempio usa invece il metodo pubblico del mondo. Per la coppia `(WorldTile, GodPower)`, `loopWithBrush` ha un overload corrispondente che prende `PowerAction` e l'asset del potere.

Per il riscontro dopo un clic, vedi **[Messaggi e registro del mondo](#/nml/messages-and-world-log)**.

## La tua icona personale

`path_icon` fa sia da cursore dello strumento sia da facciata del pulsante. Viene caricato esattamente come scritto, dall'interno di `GameResources/`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloStrike.png
```

```csharp
strike.path_icon = "ui/Icons/iconHelloStrike";
```

> [!WARNING] Un'icona mancante equivale a un pulsante invisibile
> Se il percorso è errato lo sprite restituito è `null`, e uno sprite `null` non è un pulsante con un'immagine mancante: è un buco nella barra che il giocatore non troverà mai. Guarda la funzione di ripiego in **[Schede e pulsanti di potere](#/nml/power-buttons)** :aPES_Hide:.

## I testi

```json Locales/en.json
{
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess. Mostly a mess."
}
```

## Pennelli

Un potere agisce attraverso un **pennello**: la forma delle caselle coperte da un singolo clic. Il gioco calcola l'elenco dei pixel e l'immagine di anteprima di ciascun pennello tramite codice, quindi una nuova forma non richiede alcuna grafica.

```csharp Mods/HelloBox/Code/HelloBrushes.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloBrushes
    {
        public const string TARGET = "hello_target";

        public static void Initialize()
        {
            if (AssetManager.brush_library.has(TARGET)) return;

            BrushData target = new BrushData
            {
                id = TARGET,
                size = 6,
                group = BrushGroup.Special,
                show_in_brush_window = true,
                localized_key = "brush_hello_target",
                continuous = true,
                fast_spawn = true
            };

            // post_init() runs generate_action and measures every brush, at startup.
            // Do both yourself: a centre dot and a ring around it.
            List<BrushPixelData> pixels = new List<BrushPixelData>();
            for (int x = -6; x <= 6; x++)
            {
                for (int y = -6; y <= 6; y++)
                {
                    int dist = x * x + y * y;
                    if (dist == 0 || (dist >= 16 && dist <= 36)) pixels.Add(new BrushPixelData(x, y, dist));
                }
            }
            target.pos = pixels.ToArray();
            target.width = 13;
            target.height = 13;
            target.sqr_size = target.width * target.height;

            AssetManager.brush_library.add(target);

            // linkAssets() shuffled every brush, and post_init() listed the ones the
            // brush hotkeys cycle through. Both at startup.
            BrushLibrary.shuffleBrush(target);
            BrushLibrary._available_brushes.Add(TARGET);
        }
    }
}
```

Un potere può forzare l'uso di un pennello specifico con `force_brush = "hello_target"`, esattamente come i poteri a singola casella vanilla si agganciano a `sqr_0`. Le scorciatoie dei pennelli scorrono l'elenco `_available_brushes`, quindi il tuo sarà presente in quella rotazione. La finestra dei pennelli è un'altra questione: genera i pulsanti quando viene visualizzata; se il tuo pennello non compare nell'elenco visivo, `force_brush` e le scorciatoie lo useranno comunque.

> [!WARNING] I pennelli vengono misurati all'avvio del gioco
> `BrushLibrary.post_init()` esegue la `generate_action` di ciascun pennello e calcola `width`, `height` e `sqr_size`, mentre `linkAssets()` mescola i pixel. Un pennello registrato dopo il caricamento non riceve questi calcoli: assegna `pos` e le dimensioni manualmente come mostrato sopra. L'anteprima viene disegnata a partire da `pos`, quindi il pennello non richiede alcuna icona.

```json Mods/HelloBox/Locales/en.json
{
  "brush_hello_target": "Target"
}
```

## Non è ancora nel gioco

Esatto: hai creato un potere, ma nulla lo visualizza. Vai a **[Schede e pulsanti di potere](#/nml/power-buttons)**, quella è l'altra metà, e sono solo dieci righe :pepeOK:.
