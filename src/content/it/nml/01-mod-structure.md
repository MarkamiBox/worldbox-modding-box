---
title: Struttura di una mod
group: NML Modding
subgroup: Flusso di sviluppo base
icon: :wbsavebuttonbox:
order: 20
---

# Struttura di una mod :wbsavebuttonbox:

## Dove risiedono le mod

Ogni mod corrisponde a **una singola cartella** dentro `Mods/`, nella tua directory principale di WorldBox:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\Mods\
```

Se quella cartella `Mods` non esiste ancora, creala tu stesso: tasto destro → Nuovo → Cartella, e chiamala esattamente `Mods`. Creerai poi la cartella della tua mod lì dentro, dandole il nome che preferisci.

## Come è organizzata una mod

```text
MyCoolMod/
├── mod.json          <- La carta d'identità della tua mod (obbligatorio)
├── icon.png          <- L'icona di anteprima della mod
├── Code/             <- La cartella in cui metti tutto il tuo codice
├── Locales/          <- File di testo e traduzioni (en.json, it.json, ecc.)
└── GameResources/    <- Texture personalizzate, icone, pixel art e suoni
```

Solo `mod.json` è obbligatorio. Crea le altre cartelle soltanto quando ne avrai davvero bisogno. Una mod con soltanto `mod.json` e `Code/` è a tutti gli effetti una mod completa e funzionante. Le cartelle vuote non impressionano nessuno.

#### A cosa serve ciascuna cartella

- **`mod.json`**: La carta d'identità. Senza questo file, NML farà finta che la tua mod non esista nemmeno.
- **`icon.png`**: L'immagine di anteprima mostrata nel menu delle mod all'interno del gioco.
- **`Code/`**: La cartella dove metti tutti i tuoi file sorgente `.cs` (come `Main.cs`). In realtà NML compila qualsiasi `.cs` che trova nella tua mod (saltando `bin/`, `obj/` e compagnia), ma metterli in `Code/` evita che il progetto diventi una discarica. **NML li compila a ogni avvio del gioco**, quindi non dovrai mai compilare una `.dll` a mano e non ti servirà mai Visual Studio.
- **`Locales/`**: Dove risiedono i tuoi file di traduzione (come `en.json`). Senza questi, tutti i tuoi oggetti e tratti appariranno in gioco come chiavi di testo grezze.
- **`GameResources/`**: Tutte le tue texture personalizzate, pixel art, icone di tratti, sprite di armi ed effetti sonori. Il nome deve essere esattamente questo, poiché è quello cercato da NML. Consulta **[Sprite e risorse](#/nml/sprites-and-resources)**.

### Il manifesto

Il file `mod.json` è richiesto da NeoModLoader per identificare la tua mod :pepeOK:. Si trova esattamente nella radice della cartella della mod.

```json mod.json
{
  "name": "My-First-Mod",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.my-first-mod",
  "RepoUrl": "https://github.com/yourName/my-first-mod",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### Cosa significano questi campi?

- **`name`**: Il nome visualizzato della tua mod nell'elenco mod in-game.
- **`author`**: Il tuo username o nickname. Prenditi il merito del tuo lavoro!
- **`version`**: Il numero di versione della tua mod (es. `"0.1.0"`). Incrementalo a ogni aggiornamento rilasciato.
- **`description`**: Un breve riassunto di cosa fa la mod. Compare nella finestra dei dettagli.
- **`iconPath`**: Il percorso relativo all'icona di anteprima (di solito `"icon.png"` nella radice della mod).
- **`GUID`**: Un ID univoco per la tua mod, per convenzione `com.tuonome.nomemod`. NML lo ripulisce internamente in maiuscolo con underscore (`COM_YOURNAME_MY_FIRST_MOD`), e quella diventa la sua vera identità. Se lo ometti, NML incolla comunque insieme autore e nome. **Sceglilo una volta e non cambiarlo mai**: il file delle impostazioni del giocatore porta il suo nome.
- **`RepoUrl`**: Link opzionale al tuo repository GitHub, al Discord o al sito. NML mette un pulsante direttamente sulla scheda della tua mod, così i giocatori ci arrivano con un clic.
- **`Dependencies`**: GUID di altre mod che DEVONO essere installate obbligatoriamente per far funzionare la tua mod. Se la mod è autonoma, lascialo vuoto: `[]`.
- **`OptionalDependencies`**: Mod che supporti se presenti, ma di cui non hai strettamente bisogno. Quando una è attiva, NML dà persino al tuo codice una costante di compilazione `#if OTHER_MOD_GUID` in cui racchiudere il codice di integrazione.
- **`IncompatibleWith`**: Un elenco di GUID di mod che rompono la tua se attive insieme. NML lo controlla e impedisce che le mod in conflitto vengano caricate contemporaneamente.

Puoi anche impostare `"ModType": "RESOURCE_PACK"` se la tua mod non ha codice e vuole solo sostituire texture, oppure `"UsePublicizedAssembly": false` se ti piace soffrire contro i campi privati per sport :PES5_Hmmmm:.


## Un po' di cose tecniche :elpepehacker:

Ogni mod necessita di un file C# che dica "ciao, sono una mod". Questo è tutto il codice necessario:

```csharp Code/Main.cs
using NeoModLoader.api;

namespace MyCoolMod
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("Mod loaded successfully!");
        }
    }
}
```

Non è una versione semplificata per la guida: è esattamente la base da cui parte la maggior parte delle mod pubblicate.

#### Analisi del codice

- **`using NeoModLoader.api;`**: Pensa a questa istruzione come all'aprire la tua cassetta degli attrezzi prima di iniziare a lavorare. Invece di scrivere `NeoModLoader.api.BasicMod` ogni volta, `using` dice al computer: *"tieni pronti sul banco gli strumenti di NML"*.
- **`namespace MyCoolMod`**: Un cognome per il tuo codice. La mod di qualcun altro può benissimo avere una classe chiamata `Main`, e il namespace evita che le due entrino in conflitto.
- **`public class Main`**: In C#, tutto il codice risiede all'interno di "classi". Una classe è semplicemente un progetto o uno schema con un nome.
- **`: BasicMod<Main>`**: il distintivo ufficiale della tua mod. Dice a NML *"sono una mod legittima"*, e in cambio NML ti dà gratis logging, impostazioni, caricamento a fasi e traduzioni. La parte `<Main>` ripete solo il nome della tua classe. Sì, sembra strano, e sì, si scrive sempre così.
- **`protected override void OnModLoad()`**: Il momento cruciale. All'avvio di WorldBox, NML bussa a questa porta una volta sola. Tutto ciò che la mod registra (tratti, oggetti, poteri) va inserito dentro queste parentesi graffe `{ }`.
- **`LogInfo(...)`**: Stampa una riga nel log con il nome della tua mod già prefissato. È il modo più rapido per scoprire se il codice è stato eseguito. Vedi **[Log e debugging](#/nml/logs-and-debugging)**.

> [!TIP] La strada più lunga
> Troverai mod più vecchie scritte in questo modo. Sì, sono abbastanza vecchio da ricordare quando era la norma:
> ```csharp
> public class MyMod : MonoBehaviour, IMod
> {
>     private ModDeclare _declare;
>
>     public void OnLoad(ModDeclare pModDecl, GameObject pGameObject)
>     {
>         _declare = pModDecl;
>     }
>
>     public ModDeclare GetDeclaration() => _declare;
>     public GameObject GetGameObject() => gameObject;
>     public string GetUrl() => _declare.RepoUrl;
> }
> ```
> `IMod` è l'interfaccia pura, mentre `BasicMod<T>` è una classe pronta all'uso che la implementa e aggiunge comodità utilissime. Entrambe funzionano. Usa `BasicMod` a meno di motivi particolari :PES5_Noted:.

## Prossimo passo

Hai visto come è fatta. Adesso costruiamone una vera: **[La tua prima mod](#/nml/your-first-mod)**.
