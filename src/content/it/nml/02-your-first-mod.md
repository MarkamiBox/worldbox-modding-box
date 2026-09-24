---
title: La tua prima mod
group: NML Modding
subgroup: Flusso di sviluppo base
icon: :wbchosen:
order: 22
---

# La tua prima mod :wbchosen:

Tutto ciò che trovi in questa guida è costruito attorno a **un'unica mod di esempio**. La iniziamo qui, e ogni pagina successiva le aggiungerà un singolo file.

Alla fine HelloBox conterrà una quarantina di file e avrai scritto ogni singola riga tu stesso: un tratto per le unità e uno per le culture con tanto di scheda personalizzata, un'arma con un suo incantesimo, un effetto di stato, dei drop, una nuvola, una tile di terreno, una ricetta di cibo, un proiettile, una legge del mondo, un potere divino con pulsante dedicato, una finestra, un pannello delle impostazioni, un edificio, una fazione, una creatura, un disastro, una IA su misura e persino una patch Harmony per piegare una regola che il gioco considerava intoccabile.

È molto più di quanto servirà mai a una mod reale, ed è proprio questo il punto. Prenderai i due o tre pezzi che ti interessano davvero e cancellerai il resto :PES4_DeleteThis:.

La mod si chiama **HelloBox**. Facciamola esistere.

> [!NOTE] Non hai mai scritto mezza riga di codice prima d'ora?
> Nessun problema. Leggi i punti "cosa fa ciascuna riga" sotto ogni blocco e copia il codice esattamente come sta scritto. Programmare è per il 90% copiare qualcosa che funziona e cambiare una cosa alla volta :PES2_Legit:.

> [!TIP] Oppure parti dal template
> Se preferisci non creare i file a mano, prenditi lo scheletro vuoto e salta al punto 4. Leggere i tre passi qui sotto conviene lo stesso: spiegano cosa c'è dentro.
>
> <a class="dl" href="hellobox-template.zip" download>
>   <span class="dl-icon">📄</span>
>   <span class="dl-text">
>     <span class="dl-title">Scarica il template vuoto</span>
>     <span class="dl-sub"><code>mod.json</code>, <code>Code/Main.cs</code> e le cartelle che NML cerca. Nient'altro.</span>
>   </span>
> </a>

## 1. Crea la cartella

Vai nella cartella di WorldBox (quella con `worldbox.exe`), apri `Mods/` e crea una cartella chiamata `HelloBox`. All'interno di essa, crea una cartella chiamata `Code`.

```text Where it goes
worldbox/
└── Mods/
    └── HelloBox/          <- la tua mod
        ├── mod.json       <- la carta d'identità (prossimo passaggio)
        └── Code/          <- qui vivranno i tuoi file .cs
```

## 2. La carta d'identità: mod.json

Crea un file chiamato `mod.json` dentro `HelloBox/` e incolla questo contenuto. Cambia `author` con il tuo nome:

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My first WorldBox mod, built while following the guide.",
  "GUID": "com.yourName.hellobox"
}
```

- **`name`** è il nome che i giocatori vedranno nella lista mod.
- **`GUID`** è un ID univoco. Usa `com.tuonome.hellobox` e non cambiarlo mai più.

Senza questo file, NML si comporterà come se la tua mod non esistesse affatto :pepeno:.

> [!WARNING] Il Blocco note proverà a chiamarlo `mod.json.txt`
> Nella finestra di salvataggio, imposta **Salva come** su **Tutti i file (*.*)** prima di digitare il nome. Poi controlla in Esplora file: se non vedi l'estensione `.json`, attiva **Visualizza → Estensioni nomi file** così Windows smetterà di nasconderle. Un file chiamato `mod.json.txt` è invisibile a NML, e questo tranello coglie impreparati quasi tutti all'inizio :PESgn_Oops:.

## 3. Il codice: Main.cs

Crea `Code/Main.cs` e incolla questo codice:

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");
        }
    }
}
```

### Cosa fa ciascuna riga

- **`using NeoModLoader.api;`**: "In questo file voglio usare gli strumenti messi a disposizione da NML". Senza questa riga il computer non sa cosa sia `BasicMod`.
- **`namespace HelloBox`**: un cognome per il tuo codice, così la tua classe `Main` non si scontrerà mai con la classe `Main` scritta da un altro modder.
- **`public class Main : BasicMod<Main>`**: la tua mod. La parte `: BasicMod<Main>` significa "sono una mod NML, dammi tutte le utilità gratuite" (logging, impostazioni, traduzioni).
- **`protected override void OnModLoad()`**: la porta a cui bussa NML all'avvio del gioco. Tutto ciò che la mod registra o inizializza va messo dentro queste parentesi graffe `{ }`.
- **`LogInfo(...)`**: stampa una riga nel log con il nome della tua mod già allegato. È così che capisci se qualcosa ha davvero funzionato.

## 4. Avvia il gioco

Avvia WorldBox e apri la finestra **Mods** dal menu principale. **HelloBox** dovrebbe essere nella lista, già attiva. Una mod che metti tu stesso in `Mods/` viene attivata la prima volta che NML la trova.

Da quella stessa finestra potrai anche **disattivare** una mod in futuro. Cliccando sull'icona ne cambi lo stato, e la maggior parte delle mod se ne accorge solo dopo un riavvio :PES4_AlrightThen:.

> [!WARNING] Nessuna finestra Mods? La modalità sperimentale è spenta
> NML carica le mod solo quando **Impostazioni -> Experimental Mode** è attiva, e il gioco **la spegne da solo dopo ogni aggiornamento di WorldBox**: confronta la `last_used_version` salvata con la versione appena avviata e, se sono diverse, rimette l'opzione a `false`. Quindi "la mia mod ieri funzionava e non ho cambiato niente" è quasi sempre questo. Riattivala e riavvia.

> [!TIP] Non è proprio nella lista?
> Allora NML non l'ha mai vista. Nove volte su dieci è `mod.json.txt` invece di `mod.json`, oppure la cartella si trova altrove rispetto a `worldbox\Mods/`. L'elenco completo è in **[Risoluzione dei problemi](#/troubleshooting)**.

## 5. Controlla il file di log

La tua riga dovrebbe essere comparsa nel log:

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
```

Per trovare quel file, incolla questo percorso nella barra degli indirizzi di Esplora file di Windows:

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox
```

Apri `Player.log` nel Blocco note e premi **Ctrl+F** per cercare la parola `HelloBox`.

Se vedi comparire quella riga, ora sei ufficialmente un modder :PESgn_Congrats:. Se non la vedi, consulta **[Log e debugging](#/nml/logs-and-debugging)**, quella pagina esiste apposta per questo momento.

## 6. Come si collegano tutte le pagine successive

D'ora in avanti, ogni capitolo della guida ti fornirà **un nuovo file** in `Code/` e **una nuova riga** dentro `OnModLoad`. La struttura sarà sempre identica:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");

    HelloTraits.Initialize();   // aggiunto dalla pagina Tratti personalizzati
    HelloItems.Initialize();    // aggiunto dalla pagina Oggetti personalizzati
    // ...e così via
}
```

Ogni nuovo file avrà sempre questo scheletro:

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public static void Initialize()
        {
            // il codice di quella pagina andrà qui
        }
    }
}
```

> [!TIP] Un passo alla volta
> Aggiungi un file, avvia il gioco, controlla il log e solo dopo vai avanti. Se aggiungi cinque cose insieme e il gioco si rompe, hai cinque indiziati. Se ne aggiungi una sola, hai un colpevole certo :aPES_Detect:.
