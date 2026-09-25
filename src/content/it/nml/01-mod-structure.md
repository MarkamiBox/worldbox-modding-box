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
HelloBox/
├── mod.json          <- La carta d'identità della tua mod (obbligatorio)
├── icon.png          <- L'icona di anteprima della mod
├── Code/             <- La cartella in cui metti tutto il tuo codice
├── Locales/          <- File di testo e traduzioni (en.json, it.json, ecc.)
└── GameResources/    <- Texture personalizzate, icone, pixel art e suoni
```

Ogni mod ha bisogno di `mod.json`. HelloBox ha bisogno anche del suo punto d'ingresso in C#. Crea le altre cartelle soltanto quando ne avrai davvero bisogno. Una mod con soltanto `mod.json` e `Code/` è a tutti gli effetti una mod completa e funzionante. Le cartelle vuote non impressionano nessuno.

#### A cosa serve ciascuna cartella

- **`mod.json`**: La carta d'identità. Senza questo file, NML farà finta che la tua mod non esista nemmeno.
- **`icon.png`**: L'immagine di anteprima mostrata nel menu delle mod all'interno del gioco.
- **`Code/`**: La cartella dove metti tutti i tuoi file sorgente `.cs` (come `Main.cs`). In realtà NML compila qualsiasi `.cs` che trova ovunque nella tua mod, sottocartelle incluse (saltando `bin/`, `obj/`, `Properties/`, `packages/` e qualsiasi cartella il cui nome inizi con un punto). Quindi anche file `.cs` messi liberi accanto a `mod.json` funzionano, e alcune mod lo fanno, ma metterli in `Code/` evita che il progetto diventi una discarica. **NML compila i sorgenti quando serve e può riusare la sua cache compilata.** Non ti serve un passaggio di build separato per questa guida.
- **`Locales/`**: Dove risiedono i tuoi file di traduzione (come `en.json`). Senza questi, tutti i tuoi oggetti e tratti (trait) appariranno in gioco come chiavi di testo grezze.
- **`GameResources/`**: Tutte le tue texture personalizzate, pixel art, icone di tratti, sprite di armi ed effetti sonori. Il nome deve essere esattamente questo, poiché è quello cercato da NML. Consulta **[Sprite e risorse](#/nml/sprites-and-resources)**.

> [!WARNING] I nomi delle cartelle distinguono maiuscole e minuscole, solo non sul tuo PC
> A Windows non importa se hai scritto `Locales` o `locales`. A Linux sì. NML cerca `Locales` e `GameResources` scritti esattamente così, quindi una mod che funziona per te può non avere né testo né sprite per qualcun altro. Rispetta le maiuscole indicate sopra e il problema non esiste proprio.

#### Cartelle che incontrerai nelle mod altrui

Non ti servono per iniziare. Le vedrai quando aprirai la mod di qualcun altro, quindi ecco cosa sono.

| Cartella | Cosa fa |
| --- | --- |
| `Assemblies/` | Librerie gestite di terze parti per mod a sorgenti. NML raccoglie i file `.dll` direttamente dentro questa cartella come riferimenti per il compilatore e prova a caricarli. Non è un posto per le DLL del gioco o di NML |
| `GameResourcesReplace/` | NML la carica esattamente come `GameResources/`, subito dopo. NML classifica questo nome sotto la compatibilità con NCMS. In una mod nuova, usa semplicemente `GameResources/` |
| `EmbededResources/` | Sì, scritto male, e deve esserlo. I file lì dentro vengono impacchettati nel codice compilato di una mod **in stile NCMS**. Il compilatore dei sorgenti verificato la legge solo nel suo ramo di compatibilità NCMS. Non è un incapsulamento automatico per il codice `BasicMod` di HelloBox. `EmbeddedResources/` non è il nome di cartella usato da quel ramo |

#### Distribuire una `.dll` invece dei sorgenti

Nel loader verificato, un file che finisce in `.dll` **direttamente accanto a `mod.json`** seleziona il percorso precompilato. NML salta la compilazione dei sorgenti e carica le DLL nella radice. Metti lì la tua DLL compilata di HelloBox e lascia `Code/` fuori dalla release. Vedi **[Pubblicare la tua mod](#/nml/publishing)** per i controlli di build e impacchettamento.

> [!WARNING] Una singola .dll fuori posto spegne il tuo codice
> È anche il motivo per cui una libreria lasciata accanto a `mod.json` "rompe" una mod a sorgenti: NML vede la `.dll`, salta `Code/`, e nessuna delle tue modifiche si carica mai. Le librerie vanno in `Assemblies/`, mai nella radice della mod.


### Il manifesto

Il file `mod.json` è richiesto da NeoModLoader per identificare la tua mod :pepeOK:. Si trova esattamente nella radice della cartella della mod.

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.hellobox",
  "RepoUrl": "https://github.com/yourName/hellobox",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### Cosa significano questi campi?

| Campo | Cosa fa |
| --- | --- |
| `name` | Nome visualizzato, qui `HelloBox` |
| `author` | Il tuo nome |
| `version` | Versione della release. Incrementala quando pubblichi |
| `description` | Breve descrizione |
| `iconPath` | Percorso dell'icona relativo alla cartella della mod |
| `GUID` | Identità stabile. NML lo normalizza in `UID`; per questo esempio, `COM_YOURNAME_HELLOBOX`. Non cambiarlo dopo la release |
| `RepoUrl` | Metadato URL di repository o supporto. Controlla come viene mostrato nella versione di NML contro cui distribuisci |
| `Dependencies` | ID delle mod richieste. Il flusso di lavoro a sorgenti documentato richiede che compilino correttamente |
| `OptionalDependencies` | ID delle mod opzionali. NML può fornire i loro riferimenti e simboli del compilatore durante la compilazione dei sorgenti |
| `IncompatibleWith` | Dichiarazioni di conflitto. Non dare per scontato che l'applicazione sia identica tra versioni del loader |
| `UsePublicizedAssembly` | Predefinito a `true` nel loader verificato. Aggiunge il riferimento all'assembly di gioco pubblicizzato da NML durante la compilazione dei sorgenti |

> [!WARNING] Controlla la gestione dei conflitti prima di riempire la lista
> La documentazione inclusa descrive `IncompatibleWith` come incompleto. Il loader installato ha un passaggio di rimozione che elimina una mod con una lista non vuota prima ancora di cercare gli ID elencati. Lascia l'esempio vuoto. Testa il tuo loader esatto con la mod in conflitto sia presente che assente prima di distribuire una dichiarazione.

#### ModType e targetGameBuild

L'enum verificato contiene `NEOMOD`, `COMPILED_NEOMOD`, `BEPINEX` e `RESOURCE_PACK`. Il predefinito è `NEOMOD`; il rilevamento di una DLL nella radice seleziona `COMPILED_NEOMOD`.

Il nome di un valore enum non è una ricetta funzionante. Il metodo `LoadMod` verificato gestisce i due tipi NeoMod e rifiuta gli altri valori su quel percorso. Lascia `ModType` fuori dal manifesto di HelloBox. Questa guida non afferma che impostare `RESOURCE_PACK` da solo crei un pacchetto texture funzionante.

`targetGameBuild` ha una mappatura JSON nell'assembly, ma il costruttore basato su file verificato non lo copia nella dichiarazione attiva. Non usarlo come controllo di compatibilità. Indica nelle note di rilascio la build di gioco e la versione di NML che hai testato.

#### Le chiavi del manifesto non sono intercambiabili

La dichiarazione verificata mappa `GUID` sul suo `UID` a runtime. Non ha mappature per `id`, `mainClass`, `modLoader`, `gameVersion` o `homepage`, e il suo costruttore basato su file non consuma quelle chiavi. Non sono sostituti dei campi indicati sopra.

NML trova da solo un tipo adatto come punto d'ingresso nell'assembly. Una stringa `mainClass` non lo seleziona. Tieni il manifesto snello invece di importare lo schema di un altro loader.

#### Simboli di dipendenza

Per gli **ID ASCII usati qui**, NML converte le lettere in maiuscolo e sostituisce la punteggiatura con underscore: `com.yourname.hellobox-extra` diventa `COM_YOURNAME_HELLOBOX_EXTRA`. Non estendere questa regola a ogni carattere Unicode; il normalizzatore verificato ne preserva alcuni.

Durante la compilazione dei sorgenti, NML definisce il simbolo di una dipendenza opzionale quando quell'ID ha una voce nella sua mappa dei riferimenti del compilatore. La sola installazione non è il test. Può anche ritentare una compilazione fallita senza le dipendenze opzionali.

> [!WARNING] Un simbolo scritto male rimuove il codice in silenzio
> Un simbolo `#if` sconosciuto vale falso. Controlla l'ID della dipendenza, la lista `OptionalDependencies` e il simbolo normalizzato. Una compilazione riuscita non dimostra che la tua integrazione sia stata inclusa.

Vedi **[Lavorare accanto ad altre mod](#/nml/other-mods)** per un esempio completo e il controllo separato a runtime.

#### Cose che rompono una cartella di mod

- **Distribuire DLL del gioco o del loader.** Non includere `Assembly-CSharp.dll`, la sua copia pubblicizzata, `NeoModLoader.dll`, DLL di Unity o altre DLL copiate dalla cartella `Managed/` del gioco. Fai riferimento a copie locali durante la build; tienile fuori dallo zip. Il caricatore di librerie aggiuntive di NML ha casi speciali e deduplica, quindi copiare una DLL non è un modo affidabile per sostituire la versione caricata.
- **Manifesti annidati.** NML controlla prima il `mod.json` della cartella della mod stessa. Solo se è assente cerca sotto quella cartella. Con più corrispondenze annidate, il loader verificato avvisa e usa il primo risultato. Non fare affidamento su quell'ordine. Distribuisci un solo manifesto in `HelloBox/mod.json`.
- **Backup dei sorgenti dentro la mod.** Una cartella `dist/`, `backup/` o `old/` può contribuire classi C# duplicate alla compilazione dei sorgenti. Tieni lo staging di release e i backup fuori dalla mod installata.
- **Percorsi cablati a mano.** Dentro la tua classe `BasicMod`, usa `GetDeclaration().FolderPath` e `Path.Combine` per i file impacchettati. La directory `StreamingAssets/mods` del gioco è la posizione nativa del loader, non la cartella di HelloBox.
- **Percorsi che scappano dal pacchetto.** Usa percorsi relativi per icone e risorse con le maiuscole corrispondenti. Non distribuire percorsi assoluti o segmenti `..`. `Path.Combine` unisce i percorsi; non controlla che l'input fornito dal giocatore resti dentro la tua cartella.

> [!NOTE] Cosa è stato verificato
> Il comportamento di cartelle e compilatore qui descritto è stato tracciato attraverso l'assembly NML installato, versione file `1.2.0.1`, commit informativo `cd47a1a6c437718d38e8f29240bdb761d543e09a`, insieme alla documentazione NML inclusa. Non è una promessa valida per ogni release.


## Un po' di cose tecniche :elpepehacker:

Ogni mod necessita di un file C# che dica "ciao, sono una mod". Questo è tutto il codice necessario:

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
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
- **`namespace HelloBox`**: Un cognome per il tuo codice. La mod di qualcun altro può benissimo avere una classe chiamata `Main`, e il namespace evita che le due entrino in conflitto.
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
> `IMod` è l'interfaccia pura, mentre `BasicMod<T>` è una classe pronta all'uso che la implementa e aggiunge comodità utilissime. Entrambe funzionano. Usa `BasicMod` a meno di motivi particolari, e adesso sai cos'è l'altra quando la vedi nel sorgente di qualcuno :PES5_Noted:.

## Prossimo passo

Hai visto come è fatta. Adesso costruiamone una vera: **[La tua prima mod](#/nml/your-first-mod)**.
