---
title: Guardare dentro il gioco (UnityExplorer)
group: Panoramica
subgroup: Strumenti esterni e setup
icon: :wbeyeball:
order: 6
---

# Guardare dentro il gioco :wbeyeball:

**UnityExplorer** è un inspector in-game. Ti permette di mettere in pausa su qualsiasi schermata, cliccare su qualsiasi finestra, pulsante o unità, e leggerne al volo ogni singolo valore.

Perché ti serve: invece di tirare a indovinare da cosa sia formata una finestra vanilla, la apri e la *guardi*. Qualsiasi domanda del tipo "ma come hanno fatto?" riceve risposta in due minuti.

## Come installarlo

1. Fai funzionare prima **BepInEx**, vedi **[La console dal vivo](#/toolbox/bepinex-console)**.
2. Scarica [**UnityExplorer per BepInEx 5 (Mono)**](https://github.com/sinai-dev/UnityExplorer/releases) (prendi il file `UnityExplorer.BepInEx5.Mono.zip` dalla pagina delle release).
3. Estrai lo zip in `C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\plugins/`. Assicurati che siano presenti sia `UnityExplorer.BIE5.Mono.dll` sia la sua dipendenza compagna `UniverseLib.Mono.dll`!
4. Avvia il gioco e premi **F7** (il tasto predefinito per aprirlo).

```text
worldbox/ (C:\Program Files (x86)\Steam\steamapps\common\worldbox\)
└── BepInEx/
    └── plugins/
        └── sinai-dev-UnityExplorer/ (or directly in plugins/)
            ├── UnityExplorer.BIE5.Mono.dll
            └── UniverseLib.Mono.dll
```

## I tre pannelli che userai davvero

| Pannello | A cosa serve |
| --- | --- |
| **Object Explorer → Scene Explorer** | L'albero live di tutto ciò che compare a schermo. La tua finestra è nascosta da qualche parte qui dentro |
| **Inspector** | Clicca su un qualsiasi oggetto nell'albero per vederne ogni componente e ogni campo, con i valori correnti |
| **C# Console** | Scrivi una riga di C# ed eseguila al volo nel gioco avviato. Senza riavviare nulla |

## Esempio 1: scoprire com'è costruita una finestra vanilla

Vuoi che la tua finestra abbia lo stesso stile di quelle del gioco. Quindi:

1. Nel gioco, apri la finestra che ti interessa (per esempio Leggi del mondo).
2. Premi F7, vai su **Object Explorer → Scene Explorer**, ed espandi `CanvasMain` → `canvas_ui`.
3. Clicca sui nodi figli finché l'oggetto evidenziato non coincide con la finestra aperta.
4. Nell'Inspector, esamina i suoi componenti: l'`Image` con il suo sprite 9-slice, le dimensioni in `RectTransform`, la `ScrollRect`.

Ora conosci le dimensioni esatte, il percorso dello sprite e la struttura da copiare nella pagina delle **[Finestre personalizzate](#/nml/custom-windows)**. È così che eviti di tirare a indovinare gli ancoraggi per tre ore :PES5_Peek:.

## Esempio 2: leggere i valori reali dei campi di un asset

Apri la **C# Console** ed esegui:

```csharp UnityExplorer C# console
var t = AssetManager.traits.get("strong");
UnityExplorer.ExplorerCore.Log(t.path_icon);
UnityExplorer.ExplorerCore.Log(t.group_id);
```

Nel log di UnityExplorer vedrai subito comparire:

```text
[Message:UnityExplorer] ui/Icons/actor_traits/iconStrong
[Message:UnityExplorer] physique
[Message:UnityExplorer] Invoked REPL (no return value)
```

Hai appena letto il percorso dell'icona e il gruppo di un tratto vanilla, pescati direttamente dal gioco in esecuzione. Copiali nel tuo tratto personalizzato e comparirà nello stesso identico punto della UI, con un'icona che esiste davvero.

## Esempio 3: testare un'idea prima di scriverci una mod sopra

Sempre nella console C#:

```csharp UnityExplorer C# console
// spawna un lupo sulla tessera a coordinate x=100, y=100
var tile = World.world.GetTile(100, 100);
World.world.units.spawnNewUnit("wolf", tile);
```

Se funziona qui dentro, funzionerà anche nella tua mod. Se lancia un'eccezione qui, ti sei appena risparmiato un intero ciclo di ricompila-e-riavvia :aPES2_ThumbsUp:.

> [!TIP] Usalo insieme alla console
> UnityExplorer risponde a "da cosa è composto questo oggetto?". La console di BepInEx risponde a "il mio codice è stato eseguito?". Quasi ogni singolo problema di modding si riduce a una di queste due domande.
