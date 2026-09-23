---
title: Log e debugging
group: NML Modding
subgroup: Flusso di sviluppo base
icon: :wbdebugburger:
order: 24
---

# Log e debugging :wbdebugburger:

Il log è l'unica cosa nel mondo del modding che ti dice sempre la verità. Risponde all'unica domanda che ti farai migliaia di volte: **il mio codice è stato davvero eseguito?**

## Stampare una riga

Ci sono due modi, ed entrambi finiscono nello stesso identico file.

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");      // NML: mette automaticamente il nome della tua mod come prefisso
            LogWarning("something smells");
            LogError("something exploded");

            Debug.Log("[HelloBox] plain Unity");  // Unity: devi inserire tu stesso il prefisso
        }
    }
}
```

Non usi `BasicMod`? `NeoModLoader.services.LogService` contiene le stesse funzioni `LogInfo`, `LogWarning`, `LogError`, oltre a `LogStackTraceAsError` per avere l'intero stack trace.

## Che aspetto ha un log pulito

Avvia il gioco con la mod vista sopra e cerca `HelloBox` in `Player.log`. Dovresti trovare qualcosa di simile:

```text Player.log
005: Compile Mod HelloBox                = 2,2480
006: Load Resources From Mod HelloBox    = 0,0012
[NML]: [HelloBox]: OnLoad
[NML]: [HelloBox]: HelloBox is alive!
[NML]: [HelloBox]: Loaded
008: Init Mod HelloBox                   = 0,0014
```

Riga per riga: NML ha compilato i file in `Code/`, ha caricato le tue risorse e ha chiamato `OnModLoad`, che ha stampato la tua riga. Le righe numerate indicano i tempi impiegati da NML per ogni fase: il numero dopo `=` rappresenta i secondi, e alcune righe appaiono in rosso nel log. **Il colore rosso qui non significa errore**, indica soltanto quale passaggio è stato più lento :hmm:.

La riga fondamentale è la tua. Se `[HelloBox]: HelloBox is alive!` manca, continua a leggere.

## Quando il codice non compila

Prima che la tua mod possa anche solo avviarsi, NML deve compilarla. Un refuso blocca tutto subito e ti dice esattamente dove si trova:

```text Player.log
[NML]: Code\Main.cs(9,42): error CS1002: ; expected
[NML]: Failed to compile mod HelloBox
```

Leggilo da destra verso sinistra: **`; expected`** è il problema, **`(9,42)`** indica la riga 9 al carattere 42, e **`Code\Main.cs`** è il file interessato. Apri quel file, vai a quella riga e inserisci il punto e virgola mancante.

La riga utile è la **prima**. `Failed to compile mod HelloBox` sotto è solo un messaggio riassuntivo. Molti leggono soltanto quello, vanno nel panico e non vedono la soluzione scritta chiaramente subito sopra :PES4_1IQ:.

## Che aspetto ha un log con errori a runtime

Una volta compilato, questo è l'altro errore che vedrai spessissimo :PES2_F::

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
NullReferenceException: Object reference not set to an instance of an object
  at HelloBox.HelloTraits.Initialize () [0x00021] in HelloTraits.cs:24
  at HelloBox.Main.OnModLoad () [0x0000c] in Main.cs:12
```

Sembra spaventoso, ma è una frase chiarissima:

- **`NullReferenceException`**: hai tentato di usare qualcosa che era vuoto (`null`). Il 95% di tutti gli errori che riceverai mai.
- **`at HelloBox.HelloTraits.Initialize ()`**: il metodo esatto in cui è successo.
- **`in HelloTraits.cs:24`**: **riga 24 del tuo stesso file**. Leggi quella riga: qualcosa lì dentro vale `null`.
- Le righe sotto indicano la sequenza di chiamate, dalla più recente alla più vecchia. Concentrati sui nomi dei file appartenenti alla tua mod.

La causa tipica di questo errore: modificare `base_stats` su un asset prima di averlo aggiunto alla sua libreria. Dettagli completi nella pagina **[Tratti personalizzati](#/nml/custom-traits)**.

## Dove si trovano i log

| File | Percorso | Cosa rappresenta |
| --- | --- | --- |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | La sessione corrente |
| `Player-prev.log` | stessa cartella | La sessione **precedente**, quella appena crashata :aPES_Flatline: |
| `logs/error_*.log` | stessa cartella, sotto `logs/` | Un file per ogni errore intercettato dal gioco |
| `mods_config/<GUID>.config` | stessa cartella | I salvataggi delle impostazioni utente per la tua mod |

Incolla `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` nella barra degli indirizzi di Esplora file di Windows per arrivarci al volo.

## Una console live invece del file di log

Leggere un file di testo dopo che il gioco si è chiuso è lento. Con **BepInEx** hai una finestra nera di console che stampa i log in diretta mentre giochi: vedi la tua riga comparire nell'istante esatto in cui premi un tasto. Si imposta in due minuti: **[Console BepInEx](#/toolbox/bepinex-console)**.

Vuoi fare clic sugli elementi del gioco e ispezionarne le proprietà a runtime? Usa **[UnityExplorer](#/toolbox/unity-explorer)**.

## Non lasciare che un singolo errore blocchi tutta la mod

`OnModLoad` viene eseguito dall'alto verso il basso. Se la riga 3 genera un errore, le righe dalla 4 alla 20 non verranno mai eseguite e metà della tua mod scomparirà silenziosamente. Dai a ogni parte la propria rete di protezione:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    Stage("traits", HelloTraits.Initialize);
    Stage("items", HelloItems.Initialize);
    Stage("powers", HelloPowers.Initialize);
    LogInfo("HelloBox ready");
}

// Esegue un passaggio e, se fallisce, annota quale fosse e continua con i successivi.
private static void Stage(string pName, System.Action pAction)
{
    try { pAction(); }
    catch (System.Exception e) { LogError($"stage '{pName}' failed: {e}"); }
}
```

Ora un tratto configurato male ti farà perdere soltanto quel tratto, non tutta la mod, e il log ti dirà subito qual è il passaggio colpevole:

```text Player.log
[NML]: [HelloBox]: stage 'items' failed: NullReferenceException ...
[NML]: [HelloBox]: HelloBox ready
```

## Non toccare il mondo prima che esista

`OnModLoad` viene eseguito **prima** che esista una mappa o una partita in corso. Non c'è mondo, non ci sono unità, niente di niente. Se provi a toccarli lì dentro, il gioco crasherà prima del menu principale :surprised_pikachu:. Qualsiasi codice che gira a ogni frame necessita di una guardia:

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;                        // ancora nel menu
    if (World.world == null || World.world.units == null) return;  // nessun mondo attivo
    if (MapBox.instance == null) return;

    // da qui in avanti è sicuro interagire con il mondo di gioco
}
```

## Ricaricare il codice senza riavviare

Riavviare WorldBox per testare una sola riga modificata è la parte più lenta del modding. NML può ricompilare il tuo mod a gioco aperto e sostituire a caldo i metodi contrassegnati.

1. La tua classe principale implementa `IReloadable`, che consiste in un unico metodo, `Reload()`. Quella di HelloBox lo fa in **[Il mod completo](#/nml/all-together)**.
2. Il pulsante di ricarica compare solo quando `Config.isEditor` è `true`. HelloBox lo abilita tramite un interruttore `DevReload` impostato di default su `false`.
3. Contrassegna i metodi da sostituire con `[Hotfixable]`, da `NeoModLoader.api.attributes`:

```csharp
using NeoModLoader.api.attributes;

[Hotfixable]
public static WorldTile PickTile(Actor pActor)
{
    // modifica questo a gioco aperto, premi ricarica e osserva la prossima creatura usarlo
}
```

Quindi modifica il metodo, salva e premi il pulsante di ricarica del tuo mod nella lista dei mod di NML. NML ricompila, applica le patch ai metodi contrassegnati e chiama `Reload()`. Tutto ciò che non è contrassegnato continuerà a eseguire il vecchio codice.

> [!WARNING] `Config.isEditor` è l'interruttore interno del gioco
> Dice a WorldBox che sta girando all'interno dell'editor Unity, e alcuni sistemi si comportano di conseguenza: alcune UI adottano il layout per smartphone, alcuni oggetti si autodistruggono all'avvio. Attivalo solo per i tuoi test e mai in un mod rilasciato pubblicamente.

Ciò che non può fare: callback di Unity come `Awake` e `Update`, costruttori e qualsiasi cosa il gioco abbia già istanziato con il vecchio codice. Un asset registrato al caricamento conserva i delegate assegnati all'inizio: `Reload()` è il punto in cui reimpostarli manualmente.

## Gli errori in cui cadono tutti

| Cosa vedi a schermo | Cosa significa davvero |
| --- | --- |
| La mod non compare nell'elenco | Manca `mod.json`, o contiene JSON non valido (una virgola di troppo :pepeclown:) |
| La mod c'è, ma non fa nulla | `OnModLoad` ha lanciato un'eccezione. Cerca nel log il tuo prefisso e la parola `Exception` |
| `Failed to compile mod ...` | Un errore di sintassi nel C#. Il vero errore sta nella riga **subito sopra** |
| `NullReferenceException` su un nuovo asset | Hai toccato `base_stats` prima di chiamare `add()`: è la libreria che lo alloca |
| Il testo appare come `trait_whatever` | Manca la localizzazione, vedi **[Localizzazione](#/nml/localization)** |
| Il pulsante è un buco trasparente | Il percorso dello sprite è errato, l'icona ha restituito `null` |
| Funziona solo sul tuo PC e a nessun altro | Hai inserito un percorso assoluto con il tuo nome utente di Windows :homerhide: |
