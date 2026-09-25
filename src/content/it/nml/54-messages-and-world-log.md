---
title: Messaggi e registro del mondo
group: Contenuto di gioco
subgroup: Poteri divini e UI
icon: :wbscroll:
order: 207
---

# Messaggi e registro del mondo :wbscroll:

Stampare sulla console con `Main.Log()` è ottimo mentre scrivi codice. Ma quando il tuo potere divino fa cadere un meteorite, un boss personalizzato si risveglia, o un regno firma un trattato, il giocatore non sta leggendo il tuo log di debug.

Ha bisogno di un riscontro a schermo: suggerimenti popup che scorrono sullo schermo e voci nel registro storico del mondo.

## Banner a schermo con WorldTip

Il modo più rapido per mettere del testo davanti al giocatore è `WorldTip.showNow`:

```csharp
WorldTip.showNow(string pText, bool pTranslate = true, string pPosition = "center", float pTime = 3f, string pColor = "#F3961F");
```

| Parametro | Cosa fa | Predefinito |
| --- | --- | --- |
| `pText` | Una stringa grezza oppure una chiave di localizzazione | Obbligatorio |
| `pTranslate` | Se far passare `pText` attraverso `LocalizedTextManager.getText()` | `true` |
| `pPosition` | Ancoraggio sullo schermo: `"center"`, `"top"`, `"bottom"` | `"center"` |
| `pTime` | Durata in secondi prima della dissolvenza | `3f` |
| `pColor` | Codice colore esadecimale per il testo | `"#F3961F"` (arancione) |

> [!WARNING] WorldTip traduce di default
> Siccome `pTranslate` è `true` di default, scrivere `WorldTip.showNow("Something happened!")` fa cercare al gioco una chiave di localizzazione chiamata `"Something happened!"`. Non la trova, registra un errore di traduzione mancante e mostra testo segnaposto grezzo :PESgn_Oops:.
>
> Se stai passando testo inglese letterale, imposta **sempre** `pTranslate: false`:
> ```csharp
> WorldTip.showNow("The Ancient Titan has awakened!", pTranslate: false, pColor: "#FF5555");
> ```
> Per testo localizzato, passa la tua chiave di traduzione e lascia `pTranslate: true`:
> ```csharp
> WorldTip.showNow("hello_titan_awakened", pTranslate: true);
> ```

### Testo nella barra degli strumenti in basso

Se vuoi un messaggio più discreto proprio sopra la barra dei poteri divini - come il testo del tooltip mostrato selezionando un pennello - usa `showToolbarText`:

```csharp
if (WorldTip.instance != null)
{
    WorldTip.instance.showToolbarText("Right-click to cancel");
}
```

Questo disegna un piccolo suggerimento fluttuante direttamente sopra la barra dei poteri attiva.

## Registrare eventi di mondo in WorldLog

Il registro del mondo è la cronaca persistente che i giocatori aprono nella finestra Storia. Le voci sopravvivono al salvataggio e al caricamento e sono legate alla cronologia del mondo.

Il gioco fornisce diversi helper statici già pronti su `WorldLog`:

```csharp
// Registra una successione imperiale:
WorldLog.logNewKing(kingdom);

// Registra la fondazione di un nuovo regno:
WorldLog.logNewKingdom(kingdom);

// Registra un evento di disastro su un tile specifico:
DisasterAsset earthquake = AssetManager.disasters.get("earthquake");
WorldTile centerTile = World.world.GetTile(100, 100);
WorldLog.logDisaster(earthquake, centerTile);
```

### Voci storiche personalizzate

Per aggiungere un tuo evento storico personalizzato, costruisci un `WorldLogMessage` con un `WorldLogAsset` preso da `AssetManager.world_log`:

```csharp Mods/HelloBox/Code/HelloHistory.cs
namespace HelloBox
{
    public static class HelloHistory
    {
        public static void RecordTitanEvent(Kingdom pKingdom)
        {
            if (pKingdom == null || World.world == null) return;

            WorldLogAsset logAsset = AssetManager.world_log.get("king_new");
            if (logAsset == null) return;

            WorldLogMessage entry = new WorldLogMessage(logAsset, pKingdom.name, "Awakened the Titan")
            {
                timestamp = (int)World.world.getCurWorldTime()
            };

            // add() registra la voce presso HistoryHud e la scrive nel database del registro del mondo:
            entry.add();
        }
    }
}
```

`entry.add()` aggiunge la voce all'HUD della storia della partita corrente e la rende persistente nel database SQLite del mondo tramite `DBInserter.insertLog`.

## Cartigli sulla mappa (nameplates_library)

Quando i livelli della mappa sono attivati, sopra città, regni e religioni compaiono dei banner. Sono gestiti da `AssetManager.nameplates_library` (`NameplateAsset`).

| Campo | Cosa fa |
| --- | --- |
| `id` | Identificatore che corrisponde a un `MetaType` |
| `path_sprite` | Percorso dello sprite per la cornice del banner |
| `padding_left` / `padding_right` / `padding_top` | Margini di scostamento del testo |
| `map_mode` | Su quale `MetaType` viene disegnato questo cartiglio |

> [!WARNING] Non chiamare add() per le modalità mappa vanilla
> La libreria permette **un solo** cartiglio per `MetaType`. Se chiami `AssetManager.nameplates_library.add(...)` per un `MetaType` che esiste già (come regni o città), lancia un'eccezione :wbfacepalm:.
>
> Se vuoi ridisegnare o restilizzare i cartigli vanilla, cerca quello esistente con `get()` e modificane i campi:
> ```csharp
> NameplateAsset kingdomPlate = AssetManager.nameplates_library.get("kingdom");
> if (kingdomPlate != null)
> {
>     kingdomPlate.padding_left = 16;
> }
> ```

Prossima pagina: **[Opzioni di gioco e scale temporali](#/nml/game-options)** per le opzioni del giocatore, oppure **[Ogni frame](#/nml/update-loops)** per eseguire logica su un orologio.
