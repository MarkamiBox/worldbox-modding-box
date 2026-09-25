---
title: Debug e pubblicazione
group: BepInEx Modding
icon: :wbfireworks:
order: 3
---

# Debug e pubblicazione :wbfireworks:

Il tuo plugin compila. Adesso deve caricarsi, funzionare e arrivare agli altri. Questa pagina sono gli errori che incontrerai davvero, nell'ordine in cui arrivano, e poi come pubblicare il tutto.

## Dove guardare

| File | Dove | Cos'è |
| --- | --- | --- |
| La finestra della console | Si apre col gioco, se l'hai attivata | Tutto, dal vivo. Vedi **[La console dal vivo (BepInEx)](#/toolbox/bepinex-console)** |
| `LogOutput.log` | `worldbox/BepInEx/` | La stessa cosa, salvata. È quello che la gente ti chiede |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | Il log di Unity, per i crash che BepInEx non ha intercettato |

Cerca prima il nome del tuo plugin in `LogOutput.log`. Il primo errore che lo nomina è quello che conta, stessa regola di **[Log e debug](#/nml/logs-and-debugging)**.

## Quando non compila

| Errore | Cosa vuol dire | Soluzione |
| --- | --- | --- |
| `The reference assemblies for .NETFramework,Version=v4.7.2 were not found` | Il tuo PC non ha il developer pack di .NET Framework 4.7.2 | Il pacchetto `Microsoft.NETFramework.ReferenceAssemblies` della **[preparazione del progetto](#/toolbox/bepinex-modding)** |
| `CS0246: The type or namespace name 'Input' could not be found` | Un modulo di Unity non è referenziato | Referenzia `UnityEngine*.dll`, non solo `UnityEngine.dll` |
| `CS0122: '...' is inaccessible due to its protection level` | Hai usato un membro `internal` del gioco | `Publicize="true"` sul riferimento a `Assembly-CSharp` |
| `The process cannot access the file ... because it is being used by another process` | Il gioco è aperto e tiene la tua `.dll` | Chiudi WorldBox, ricompila |
| `Could not find a part of the path` nel passo di copia | `GameDir` nel tuo `.csproj` è sbagliato | Puntalo alla cartella che contiene `worldbox.exe` |

## Quando compila ma non si carica

Avvia il gioco e cerca una riga `Loading [YourPlugin 1.0.0]`. Se non c'è, BepInEx non ha mai preso il tuo plugin:

| Cosa vedi | Perché |
| --- | --- |
| Nessuna riga | La `.dll` non è dentro `BepInEx/plugins/`, oppure BepInEx stesso non gira (niente console, niente `LogOutput.log`) |
| Nessuna riga, e la `.dll` è al posto giusto | Il progetto punta al framework sbagliato. Deve essere `net472`, non `net8.0` né `netstandard2.1` |
| La riga c'è, poi `Could not load file or assembly 'Something'` | Usi una libreria che non viene distribuita col plugin. Metti la sua `.dll` accanto alla tua nella cartella del plugin |
| Due plugin con lo stesso GUID | BepInEx ne carica solo uno. Di solito una vecchia copia del tuo stesso plugin in un'altra cartella |

## Quando si carica ma si rompe

| Errore | Cosa di solito è |
| --- | --- |
| `NullReferenceException` su `AssetManager...` | Hai toccato le librerie (library) del gioco troppo presto. Usa il Postfix su `AssetManager.init()` di **[Aggiungere contenuti con BepInEx](#/toolbox/bepinex-content)** |
| `HarmonyException` / `Ambiguous match found` | Una patch punta a un metodo che non esiste o che ha dei gemelli. Stesse soluzioni di **[Patch di Harmony](#/nml/harmony-patches)** |
| `MissingMethodException` / `TypeLoadException` dopo un update del gioco | Il gioco è cambiato sotto di te. Segui **[Aggiornare dopo un update del gioco](#/nml/game-updates)**, poi ricompila |
| Dopo un cambio di lingua il tuo testo mostra chiavi grezze | Manca il Postfix su `LocalizedTextManager.setLanguage` |
| La tua icona è invisibile | Lo sprite è stato registrato dopo che qualcosa aveva già chiesto il suo percorso, oppure punta a una cartella |
| Tutto funziona, poi il plugin si ferma a metà partita | `HideManagerGameObject = true` in `BepInEx/config/BepInEx.cfg` |

## Un ciclo più veloce

Chiudere e riaprire WorldBox a ogni modifica è la parte peggiore di BepInEx. Il plugin **ScriptEngine** della raccolta BepInEx.Debug la rende più sopportabile: i plugin messi in `BepInEx/scripts/` invece che in `plugins/` si possono ricaricare con un tasto mentre il gioco gira (il tasto attuale è nel suo readme).

È ottimo per strumenti, finestre e overlay. Per i contenuti aiuta meno: il gioco non dimentica un tratto (trait) che hai già registrato, e ogni patch di Harmony applicata resta attiva a meno che il tuo plugin non la tolga quando viene scaricato (`harmony.UnpatchSelf()` in `OnDestroy()`). Usalo mentre costruisci un'interfaccia, non mentre bilanci un tratto :PES2_Shrug:.

## Pubblicare

### Cosa va nello zip

Compila il plugin in modalità Release, poi zippalo in modo che i giocatori possano estrarlo direttamente nella cartella del gioco:

```text HelloBepInEx.zip
HelloBepInEx.zip
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

Cosa **non** ci va:

- **BepInEx stesso.** I giocatori lo installano una volta, come hai fatto tu. Mandali alla **[pagina della console](#/toolbox/bepinex-console)** e di' quale versione: BepInEx 5, Mono, x64.
- **I file del gioco.** `Assembly-CSharp.dll`, i moduli di Unity, e soprattutto la copia publicizzata che ha creato la build. Sono il codice del gioco, non tuo da condividere. `Private="false"` nel `.csproj` li tiene già fuori dalla cartella di build, quindi basta non aggiungerli a mano.
- **`BepInEx.dll` e `0Harmony.dll`.** BepInEx li ha già.

### Il numero di versione

Aumentalo in due posti e tienili uguali: la `version` in `[BepInPlugin]` (quello che vedono il log e gli altri plugin) e `<Version>` nel `.csproj` (quello che dice il file `.dll`). Un plugin che scrive `1.0.0` alla sua terza uscita rende più difficile ogni segnalazione di bug.

### Dipendere da un altro plugin

Se il tuo plugin ha bisogno che un altro plugin BepInEx sia caricato prima, dillo, e BepInEx sistema l'ordine di caricamento e si rifiuta di caricare il tuo senza l'altro:

```csharp
[BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
[BepInDependency("com.other.author.library")]
public class HelloPlugin : BaseUnityPlugin
```

Aggiungi `BepInDependency.DependencyFlags.SoftDependency` come secondo argomento quando l'altro plugin è facoltativo e vuoi solo caricarti dopo di lui se c'è.

### Dove caricarlo

Negli stessi posti di qualsiasi altra mod di WorldBox, con gli stessi consigli: vedi **[Pubblicare](#/nml/publishing)**. L'unica riga in più che serve alla tua descrizione è "Requires BepInEx 5 (Mono x64)", in cima. Ti risparmia i commenti "non funziona" di chi l'ha installato in un gioco con solo NML :wbsalut:.
