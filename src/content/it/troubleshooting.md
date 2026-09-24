---
title: Risoluzione problemi
group: Panoramica
icon: :wbfractured:
order: 4
---

# Risoluzione problemi :wbfractured:

Trova il tuo sintomo nella tabella, cliccalo, leggi tre righe. Questa è l'intera pagina :aPES2_ThumbsUp:.

> [!TIP] Il log risponde alla maggior parte di questi dubbi più velocemente di me
> Nove volte su dieci la risposta si trova già in `Player.log`. **[Log e debug](#/nml/logs-and-debugging)** ti mostra dove si trova e come leggere un crash.

## Trova il tuo sintomo

**Usare le mod (non crearle)**

| Sintomo | |
| --- | --- |
| Testo rosso a fiumi, `Missing className: NeoModLoader (1).WorldBoxMod` | [salta](#testo-rosso-a-fiumi-missing-classname) |
| NML funzionava, il gioco si è aggiornato, ora le mod sono rosse o "failed" | [salta](#le-mod-sono-rosse-o-failed-dopo-un-aggiornamento-del-gioco) |
| Il gioco è su una versione vecchia e NML non si carica | [salta](#il-gioco-è-su-una-versione-vecchia) |
| Il gioco è diventato lento o si blocca con le mod attive | [salta](#il-gioco-è-diventato-lento-o-si-blocca-con-le-mod-attive) |
| Un mondo non si carica più | [salta](#un-mondo-non-si-carica-più) |
| Una mod BepInEx è installata e non mostra nulla | [salta](#una-mod-bepinex-è-installata-e-non-mostra-nulla) |
| Hai cancellato una mod ed è ancora lì | [salta](#hai-cancellato-una-mod-ed-è-ancora-lì) |
| Il gioco non parte proprio | [salta](#il-gioco-non-parte-proprio) |

**Non si carica nulla**

| Sintomo | |
| --- | --- |
| Nessun pulsante Mods nel menu | [vai](#nessun-pulsante-mods-nel-menu) |
| Finestra Mods vuota, prima funzionava | [vai](#finestra-mods-vuota-prima-funzionava) |
| La cartella del mod c'è, ma il mod non compare nell'elenco | [vai](#la-cartella-del-mod-c-è-ma-il-mod-non-compare-nell-elenco) |
| Il mod è oscurato in grigio | [vai](#il-mod-è-oscurato-in-grigio) |
| "Compile failed" e l'errore sembra privo di senso | [vai](#compile-failed-e-l-errore-sembra-privo-di-senso) |
| Errore alla riga 1 di un file appena incollato | [vai](#errore-alla-riga-1-di-un-file-appena-incollato) |
| Hai modificato il codice ma non cambia nulla | [vai](#hai-modificato-il-codice-ma-non-cambia-nulla) |
| Il Blocco Note non salva nella cartella del gioco | [vai](#il-blocco-note-non-salva-nella-cartella-del-gioco) |
| Le tue modifiche non compaiono mai, neanche dopo il riavvio | [vai](#le-tue-modifiche-non-compaiono-mai-neanche-dopo-il-riavvio) |

**Si carica, ma non compare nulla**

| Sintomo | |
| --- | --- |
| Crash sulla riga in cui assegni una statistica | [vai](#crash-sulla-riga-in-cui-assegni-una-statistica) |
| Stesso crash, anche se l'ordine è già corretto | [vai](#stesso-crash-anche-se-l-ordine-è-già-corretto) |
| Il tuo edificio muore istantaneamente o non ha dimensione | [vai](#il-tuo-edificio-muore-istantaneamente-o-non-ha-dimensione) |
| Registrato, ma non compare in nessuna scheda | [vai](#registrato-ma-non-compare-in-nessuna-scheda) |
| Mostra `trait_hello_swift` invece del nome | [vai](#mostra-trait-hello-swift-invece-del-nome) |
| I nomi funzionano per i tratti ma non per oggetti, status o poteri | [vai](#i-nomi-funzionano-per-i-tratti-ma-non-per-oggetti-status-o-poteri) |
| L'icona è un riquadro vuoto | [vai](#l-icona-è-un-riquadro-vuoto) |
| Un pulsante occupa spazio ma non disegna nulla | [vai](#un-pulsante-occupa-spazio-ma-non-disegna-nulla) |
| L'effetto di stato non disegna nessuno sprite sull'unità | [vai](#l-effetto-di-stato-non-disegna-nessuno-sprite-sull-unità) |
| Pulsanti sovrapposti l'uno sull'altro | [vai](#pulsanti-sovrapposti-l-uno-sull-altro) |
| Il pulsante c'è, ma cliccarlo non attiva il potere | [vai](#il-pulsante-c-è-ma-cliccarlo-non-attiva-il-potere) |
| `addOpposite` / `addDecision` / `addSpell` non fanno nulla | [vai](#addopposite-adddecision-addspell-non-fanno-nulla) |

**Registrato, poi rotto nel mondo**

| Sintomo | |
| --- | --- |
| La tua creatura dà un errore d'ombra | [vai](#la-tua-creatura-dà-un-errore-d-ombra) |
| Il tuo tratto, oggetto o creatura resta bloccato | [vai](#il-tuo-tratto-oggetto-o-creatura-resta-bloccato) |
| Il gioco crasha caricando la tua arma o il tuo cibo | [vai](#il-gioco-crasha-caricando-la-tua-arma-o-il-tuo-cibo) |
| Una nuvola crasha appena compare | [vai](#una-nuvola-crasha-appena-compare) |
| Piazzare il tuo edificio dà Index was out of range | [vai](#piazzare-il-tuo-edificio-dà-index-was-out-of-range) |
| Il tuo edificio lancia errori a ogni frame in cui si vede | [vai](#il-tuo-edificio-lancia-errori-a-ogni-frame-in-cui-si-vede) |
| La minimappa lancia errori appena esiste il tuo edificio | [vai](#la-minimappa-lancia-errori-appena-esiste-il-tuo-edificio) |
| Il tuo tile si dipinge, poi il renderer della mappa esplode | [vai](#il-tuo-tile-si-dipinge-poi-il-renderer-della-mappa-esplode) |
| Far nascere un animale sul tuo tile crasha | [vai](#far-nascere-un-animale-sul-tuo-tile-crasha) |
| I drop cadono invisibili, o un proiettile esplode | [vai](#i-drop-cadono-invisibili-o-un-proiettile-esplode) |
| Il log si riempie di ArgumentNullException dai proiettili | [vai](#il-log-si-riempie-di-argumentnullexception-dai-proiettili) |
| La tua scheda dei poteri non compare mai | [vai](#la-tua-scheda-dei-poteri-non-compare-mai) |
| La finestra delle impostazioni mostra id grezzi | [vai](#la-finestra-delle-impostazioni-mostra-id-grezzi) |
| Il mondo lancia errori a ogni frame dopo aver aggiunto un comportamento del mondo | [salta](#il-mondo-lancia-errori-a-ogni-frame-dopo-aver-aggiunto-un-comportamento-del-mondo) |
| Un disastro va in crash quando scrive nel log del mondo | [salta](#un-disastro-va-in-crash-quando-scrive-nel-log-del-mondo) |
| Un disastro senza action va in crash non appena viene sorteggiato | [salta](#un-disastro-senza-action-va-in-crash-non-appena-viene-sorteggiato) |
| Il primo governante che prende in considerazione il tuo complotto va in crash | [salta](#il-primo-governante-che-prende-in-considerazione-il-tuo-complotto-va-in-crash) |
| La tua decisione, complotto, gene o arma esiste ma nulla lo usa mai | [salta](#la-tua-decisione-complotto-gene-o-arma-esiste-ma-nulla-lo-usa-mai) |

**Compila a te, ma non agli altri**

| Sintomo | |
| --- | --- |
| `CS0122: inaccessible due to its protection level` | [vai](#cs0122-inaccessible-due-to-its-protection-level) |
| Funziona sul tuo computer, non fa nulla sul loro | [vai](#funziona-sul-tuo-computer-non-fa-nulla-sul-loro) |

**Funziona all'inizio, poi si rompe dopo**

| Sintomo | |
| --- | --- |
| Un altro mod sovrascrive silenziosamente i tuoi contenuti | [vai](#un-altro-mod-sovrascrive-silenziosamente-i-tuoi-contenuti) |
| Crash su `World.world` durante il caricamento del mod | [vai](#crash-su-world-world-durante-il-caricamento-del-mod) |
| I tuoi dati iniziano a controllare le creature sbagliate | [vai](#i-tuoi-dati-iniziano-a-controllare-le-creature-sbagliate) |
| Tutto scompare dopo un salvataggio o caricamento | [vai](#tutto-scompare-dopo-un-salvataggio-o-caricamento) |
| Le unità si bloccano a gruppi | [vai](#le-unità-si-bloccano-a-gruppi) |
| Metà delle tue patch Harmony non sono mai state applicate | [vai](#metà-delle-tue-patch-harmony-non-sono-mai-state-applicate) |
| La tua patch su `updateStats` va in crash per altri utenti | [vai](#la-tua-patch-su-updatestats-va-in-crash-per-altri-utenti) |
| Hai applicato la patch a `getHit` ma gli edifici subiscono comunque danno | [vai](#hai-applicato-la-patch-a-gethit-ma-gli-edifici-subiscono-comunque-danno) |
| Il tuo Prefix ha rotto altri tre mod | [vai](#il-tuo-prefix-ha-rotto-altri-tre-mod) |
| Un'unità rimane immobile per sempre o va in crash a ogni frame | [vai](#un-unità-rimane-immobile-per-sempre-o-va-in-crash-a-ogni-frame) |
| La tua logica IA personalizzata viene ripristinata silenziosamente | [vai](#la-tua-logica-ia-personalizzata-viene-ripristinata-silenziosamente) |
| Il gioco scatta quattro volte al secondo | [vai](#il-gioco-scatta-quattro-volte-al-secondo) |
| I clic finiscono sulla mappa dietro alla tua finestra | [vai](#i-clic-finiscono-sulla-mappa-dietro-alla-tua-finestra) |
| L'uso della memoria sale a ogni apertura del pannello | [vai](#l-uso-della-memoria-sale-a-ogni-apertura-del-pannello) |
| Un nuovo valore predefinito non raggiunge i giocatori esistenti | [vai](#un-nuovo-valore-predefinito-non-raggiunge-i-giocatori-esistenti) |
| Uno slider si muove ma la tua funzione di callback non viene eseguita | [vai](#uno-slider-si-muove-ma-la-tua-funzione-di-callback-non-viene-eseguita) |

## Usare le mod

Questo gruppo è per chi gioca con le mod, non per chi le crea. Tutto ciò che segue presuppone che sia tu a scrivere il codice.

### Testo rosso a fiumi, missing className

- **Cosa vedi**: Testo rosso che scorre sopra il gioco, `previous errors repeated`, `YOU SHOULD RESTART THE GAME`, e nel log `Missing className: NeoModLoader (1).WorldBoxMod`.
- **Perché**: Il file non si chiama `NeoModLoader.dll`. Un browser che lo scarica una seconda volta aggiunge ` (1)`, e NML legge il proprio nome di file.
- **Come risolvere**: Chiudi il gioco, cancella qualsiasi copia precedente, rinomina il file esattamente in `NeoModLoader.dll` e riavvia. Guida passo dopo passo su **[Installare NML](#/install-nml)**.

### Le mod sono rosse o failed dopo un aggiornamento del gioco

- **Cosa vedi**: La lista delle mod mostra una mod in rosso, "failed", `current failed, will load`, o `<Mod> has been disabled due to an error`. Prima dell'aggiornamento funzionava.
- **Perché**: Le mod chiamano il codice del gioco. Quando WorldBox modifica quel codice, una mod creata per la versione precedente smette di compilare. NML non è il problema, è solo il messaggero.
- **Come risolvere**: Cerca una versione più recente della mod (su GameBanana, ordina per **Updated**). Se non c'è una versione più recente, aspetta l'autore o gioca sulla vecchia versione del gioco, vedi **[le FAQ](#/install-nml)**. Non tenere due versioni della stessa mod in `Mods` "per sicurezza": entrano in conflitto.

### Il gioco è su una versione vecchia

- **Cosa vedi**: NML non si carica mai, oppure il log dice `MissingFieldException: Field not found: bool .Config.gameLoaded`. Il numero di versione nel menu principale è più vecchio di quello di cui parlano tutti.
- **Perché**: Il gioco si trova su un **ramo beta** di Steam, di solito uno scelto tempo fa per provare un aggiornamento in anticipo, e l'NML che hai scaricato è creato per la versione attuale.
- **Come risolvere**: Steam → clic destro su WorldBox → **Proprietà → Beta** → **Nessuna**. Lascia che Steam si aggiorni e riattiva la modalità sperimentale :PES2_Shrug:.

### Il gioco è diventato lento o si blocca con le mod attive

- **Cosa vedi**: FPS bassi, scatti o il mondo bloccato mentre i pulsanti rispondono ancora. Senza mod funziona benissimo.
- **Perché**: Quasi sempre è una mod che esegue calcoli pesanti a ogni tick, solitamente una grossa mod di contenuti. Due mod che modificano la stessa cosa possono anche bloccarsi a vicenda.
- **Come risolvere**: Disattiva metà delle tue mod, riavvia e prova. Se è ancora rotto: il colpevole è nella metà rimasta attiva. Continua a dimezzare finché non ne rimane una sola. Disattivarle è sufficiente, non serve cancellarle. Leggi la descrizione di quella mod per incompatibilità note e non eseguire mai due versioni della stessa mod (una completa e una "lite") insieme.

### Un mondo non si carica più

- **Cosa vedi**: Il salvataggio apre un mondo diverso, si blocca durante il caricamento o genera `NullReferenceException` durante il salvataggio o il caricamento.
- **Perché**: Il mondo contiene creature, edifici o tratti di una mod che ora è disattivata, rimossa o non aggiornata. Il gioco trova identificatori che non conosce.
- **Come risolvere**: Riattiva quella mod (o torna alla versione con cui è stato fatto il salvataggio), carica il mondo e rimuovi i contenuti moddati in gioco prima di togliere la mod. Tieni una copia dei mondi a cui tieni prima di provare una nuova mod di contenuti :PES_MonkaSweat:.

### Una mod BepInEx è installata e non mostra nulla

- **Cosa vedi**: La mod si trova in `BepInEx/plugins`, non compare nulla nel gioco e nessun file di configurazione appare in `BepInEx/config`.
- **Perché**: O il file zip è stato inserito in `plugins` come zip, oppure l'oggetto manager di BepInEx viene distrutto dal gioco, cosa per cui alcune macchine richiedono un'impostazione specifica.
- **Come risolvere**: Inserisci la **cartella all'interno** dello zip in `BepInEx/plugins`, non il file zip. Poi apri `BepInEx/config/BepInEx.cfg`, cerca `HideManagerGameObject = false`, modificalo in `true`, salva e riavvia. Configurazione di BepInEx: **[La console dal vivo](#/toolbox/bepinex-console)**.

### Hai cancellato una mod ed è ancora lì

- **Cosa vedi**: La cartella non c'è più in `Mods`, ma la mod si carica ancora.
- **Perché**: Eri iscritto su Steam Workshop, e le mod dello Workshop risiedono nella cartella di Steam, non nella tua.
- **Come risolvere**: Disiscriviti dalla sua pagina dello Workshop. Togliere la spunta non equivale a disiscriversi.

### Il gioco non parte proprio

- **Cosa vedi**: WorldBox si chiude o si blocca prima del menu principale, anche dopo aver rimosso le mod.
- **Perché**: Un file del gioco stesso è stato danneggiato, spesso copiando qualcosa nella cartella sbagliata.
- **Come risolvere**: Steam → clic destro su WorldBox → **Proprietà → File installati → Verifica integrità dei file di gioco**. Poi reinserisci NML e le tue mod una alla volta.

---

## Non si carica nulla

Il gioco si comporta come se la tua mod non esistesse. Non è niente di personale, di solito è un interruttore o il nome di un file.

### Nessun pulsante Mods nel menu

- **Cosa vedi**: Il gioco si avvia normalmente, nessun errore, nessun pulsante Mods e nessuna riga `[NML]` nel log.
- **Perché**: Due cartelle si chiamano "Mods". La DLL del loader va nella cartella dei dati del gioco; `worldbox\Mods/` è solo per i *tuoi* mod.
- **Risoluzione**: Posiziona `NeoModLoader.dll` in `worldbox\worldbox_Data\StreamingAssets\mods/`, riavvia e cerca `[NML]: NeoModLoader Version:` nel log.

### Finestra Mods vuota, prima funzionava

- **Cosa vedi**: La finestra si apre ma è vuota. Nessun errore.
- **Perché**: La **Modalità Sperimentale è disattivata**, e il gioco la disattiva automaticamente dopo ogni aggiornamento di WorldBox.
- **Risoluzione**: Impostazioni → Modalità Sperimentale → attiva → riavvia. Controlla prima questo ogni volta che "funzionava ieri e non ho toccato niente".

### La cartella del mod c'è, ma il mod non compare nell'elenco

- **Cosa vedi**: Nulla nell'elenco, nessuna riga `Compile Mod <tuomod>`.
- **Perché**: In ordine di frequenza: il file si chiama in realtà `mod.json.txt`; il JSON non è valido (virgola dopo l'ultimo elemento, o virgolette curve `"` incollate da chat); la cartella non è dentro `worldbox\Mods/`.
- **Risoluzione**: Esplora file → **Visualizza → Mostra → Estensioni nomi file**, poi controlla il nome reale. Apri `mod.json` in VS Code, che evidenzia gli errori di sintassi.

### Il mod è oscurato in grigio

- **Cosa vedi**: Compare in grigio nell'elenco, nessuno dei tuoi codici viene eseguito.
- **Perché**: È disabilitato, e questa preferenza è salvata su disco in `StreamingAssets\mods\NML\mod_compile_records.json`.
- **Risoluzione**: Fai clic sull'icona del mod nella finestra Mods, quindi riavvia il gioco.

### "Compile failed" e l'errore sembra privo di senso

- **Cosa vedi**: `Code\Main.cs(9,42): error CS1002: ; expected`, seguito da una riga di riepilogo.
- **Perché**: Il riepilogo non è il vero errore. La riga sopra specifica file, numero di riga e colonna esatta.
- **Risoluzione**: Correggi **solo il primo** errore, poi riavvia e ricontrolla: gli errori si propagano a cascata.

| Codice | Significato |
| --- | --- |
| `CS1002` | Manca un punto e virgola `;` |
| `CS0246` | Nome di tipo o classe non riconosciuto, solitamente manca un `using` |
| `CS0266` | Assegnato un decimale dove serve un intero (`0.5f` in un `int`) |
| `CS0122` | Il membro è `internal`, consulta [la sezione dedicata](#cs0122-inaccessible-due-to-its-protection-level) |

### Errore alla riga 1 di un file appena incollato

- **Cosa vedi**: Un errore di compilazione alla riga 1 apparentemente assurdo.
- **Perché**: I blocchi di codice nella guida indicano il percorso del file. Selezionando troppo in alto, l'etichetta del percorso finisce dentro il tuo file `.cs`.
- **Risoluzione**: Cancella la riga 1. Un file `.cs` inizia con `using`, un `namespace` o una classe; `mod.json` inizia con `{`.

### Hai modificato il codice ma non cambia nulla

- **Cosa vedi**: Il vecchio comportamento rimane invariato, nessun errore.
- **Perché**: NML compila `Code\*.cs` **una sola volta all'avvio**. Un gioco già aperto non rilegge i file modificati.
- **Risoluzione**: Salva, chiudi completamente il gioco e riaprilo. Una modifica per riavvio, così c'è sempre un solo indiziato se qualcosa si rompe.

### Il Blocco Note non salva nella cartella del gioco

- **Cosa vedi**: "Non hai le autorizzazioni per salvare in questa posizione", suggerendo Documenti.
- **Perché**: Il gioco si trova in `C:\Program Files (x86)/`, cartella protetta da Windows.
- **Risoluzione**: Crea prima il file da Esplora file (tasto destro → Nuovo → Documento di testo, poi rinominalo), quindi modifica quel file esistente.

### Le tue modifiche non compaiono mai, neanche dopo il riavvio

- **Cosa vedi**: Riavvii, il log dice `Compile Mod`, e il gioco esegue ancora il codice vecchio. La compilazione dura una frazione di secondo.
- **Perché**: Due cartelle in `Mods/` hanno lo stesso `GUID` in `mod.json`, di solito una copia vecchia che l'installer di NML ha scompattato come `COM_YOURNAME_HELLOBOX/`. NML carica **una mod per GUID** e ignora l'altra cartella in silenzio, che può benissimo essere quella che stai modificando.
- **Risoluzione**: Cerca il tuo GUID in `Mods/` e tieni esattamente una cartella. Se i conti non tornano, è la prima cosa da controllare.

---

## Si carica, ma non compare nulla

NML ha trovato la tua mod e l'ha eseguita. Qualcosa al suo interno non è mai arrivato sullo schermo.

### Crash sulla riga in cui assegni una statistica

- **Cosa vedi**: `NullReferenceException` nel tuo `Initialize()`, e tutto il codice successivo non parte.
- **Perché**: Un asset appena creato non possiede **alcun blocco di statistiche**. La libreria lo alloca dentro `add()`.
- **Risoluzione**: Prima `add()`, poi le statistiche. Stessa regola per tratti, status, oggetti, edifici e creature.

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };
AssetManager.traits.add(swift);      // questo metodo alloca base_stats
swift.base_stats["speed"] = 20f;     // sicuro da qui in avanti
```

`clone()` richiama già `add()`, quindi dopo un clone il blocco esiste già.

### Stesso crash, anche se l'ordine è già corretto

- **Cosa vedi**: La stessa `NullReferenceException`, su una riga di statistiche successiva a `add()`.
- **Perché**: Hai inventato il nome di una statistica. Un ID sconosciuto genera un crash, non viene ignorato.
- **Risoluzione**: Usa ID reali: `damage`, `health`, `speed`, `armor`, `attack_speed`, `stamina`, `mana`, `range`, `critical_chance`, `lifespan`, `warfare`. I moltiplicatori sono separati: `multiplier_damage`, `multiplier_health`, `multiplier_speed`. Elenco completo nel **[Riferimento statistiche](#/nml/stats)**.

### Il tuo edificio muore istantaneamente o non ha dimensione

- **Cosa vedi**: L'edificio compare e poi sparisce subito, oppure non può essere selezionato. Nessun errore.
- **Perché**: I valori predefiniti di `health` e `size` vengono impostati solo dentro `add()`, e solo se `base_stats` è ancora null. Se crei il blocco manualmente prima ottieni `health = 0`.
- **Risoluzione**: Non pre-allocare mai `base_stats`. Esegui prima il clone o `add()`, poi modifica solo i campi desiderati.

### Registrato, ma non compare in nessuna scheda

- **Cosa vedi**: La riga di log viene stampata, nessuna eccezione, ma l'elemento non è presente in nessuna categoria.
- **Perché**: `group_id` punta a un gruppo inesistente, quindi non c'è alcuna scheda in cui disegnarlo.
- **Risoluzione**: Usa un ID gruppo valido. Per i tratti: `cognitive`, `mind`, `spirit`, `physique`, `health`, `body`, `appearance`, `protection`, `skills`, `merits`, `acquired`, `fun`, `fate`, `miscellaneous`, `special`. Per creare una nuova scheda: **[Gruppi e schede tratti](#/nml/trait-groups)**.

### Mostra `trait_hello_swift` invece del nome

- **Cosa vedi**: La chiave grezza sullo schermo, tooltip vuoto, `missing text:` nel log.
- **Perché**: Nessuna traduzione registrata. Il gioco costruisce la chiave automaticamente: `trait_<id>` e `trait_<id>_info`.
- **Risoluzione**: Aggiungi queste due chiavi in `Locales/en.json` (e `it.json`). Attenzione a non salvarlo come `en.json.txt`.

### I nomi funzionano per i tratti ma non per oggetti, status o poteri

- **Cosa vedi**: Hai copiato il pattern dei tratti ma questo elemento mostra ancora la chiave grezza.
- **Perché**: Quattro tipi di asset **non** costruiscono la chiave dall'ID:

| Asset | Chiave nome | Chiave descrizione |
| --- | --- | --- |
| `GodPower` | campo **`name`**, snake_case | `<name>_description` |
| `ItemAsset` | `translation_key`, altrimenti `item_<subtype o id>` | `<id>_description`, senza `item_` |
| `StatusAsset` | campo **`locale_id`** | campo **`locale_description`** |
| `WorldLawAsset` | `<id>_title` | `<id>_description` |

- **Risoluzione**: Imposta `name` = id sui poteri, `translation_key` sugli oggetti, `locale_id` sugli status. Mantieni le chiavi in snake_case minuscolo: vengono normalizzate al salvataggio ma **non** in fase di ricerca, quindi `MyKey` viene salvata come `my_key` e non trovata mai più :PESgn_SMH:.

### L'icona è un riquadro vuoto

- **Cosa vedi**: Un quadrato trasparente dove dovrebbe esserci l'icona. Nessun errore.
- **Perché**: Il riempimento automatico delle icone avviene prima del caricamento del mod. E un percorso errato restituisce `null` **che viene memorizzato nella cache per l'intera sessione**, quindi correggere il percorso senza riavviare non risolve nulla.
- **Risoluzione**: Imposta sempre `path_icon` esplicitamente, senza estensione del file, usando barre diagonali (`/`), poi riavvia. Verifica al caricamento:

```csharp
if (SpriteTextureLoader.getSprite(swift.path_icon) == null)
    LogError("icon path is wrong: " + swift.path_icon);
```

### Un pulsante occupa spazio ma non disegna nulla

- **Cosa vedi**: Uno spazio vuoto nella tua scheda che nessuno potrà mai cliccare.
- **Perché**: Uno sprite `null` non è un segnaposto, è semplicemente invisibile :PES4_Invisible:.
- **Risoluzione**: Non passare mai uno sprite senza controllo: usa come fallback `ui/Icons/iconQuestionMark`, che segnala subito l'errore visivamente. Guida in **[Schede e pulsanti potere](#/nml/power-buttons)**.

### L'effetto di stato non disegna nessuno sprite sull'unità

- **Cosa vedi**: O sulla creatura non viene disegnato niente, oppure `NullReferenceException` in `Status.updateAnimationFrame()` a **ogni frame** finché lo status dura.
- **Perché**: `StatusLibrary` riempie `sprite_list` da `"effects/" + texture` e imposta `need_visual_render` in un solo passaggio mentre il gioco carica, prima che la tua mod esistesse. E `texture` è il nome di una **cartella** di frame, non di un PNG.
- **Risoluzione**: Frame in `GameResources/effects/fx_hello_status/`, poi dopo `add()`:

```csharp
cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
cursed.need_visual_render = true;
```

### Pulsanti sovrapposti l'uno sull'altro

- **Cosa vedi**: La scheda sembra vuota, oppure un solo pulsante è posizionato sopra tutti gli altri.
- **Perché**: `recalc()` ricalcola solo la larghezza; disporre i pulsanti richiede una seconda chiamata, che salta i componenti inattivi.
- **Risoluzione**: Richiama entrambi in ordine dopo aver aggiunto i pulsanti: `tab.recalc();` poi `tab.sortButtons();`. Solo non durante `OnModLoad`: lì `recalc()` crasha, vedi **[La tua scheda dei poteri non compare mai](#la-tua-scheda-dei-poteri-non-compare-mai)**.

### Il pulsante c'è, ma cliccarlo non attiva il potere

- **Cosa vedi**: Il cursore non cambia, cliccare sulla mappa non produce alcun effetto.
- **Perché**: Il pulsante viene associato al potere **tramite ID al momento della creazione**.
- **Risoluzione**: Registra prima il potere, poi crea il pulsante nello stesso blocco. E `click_action` riceve `(WorldTile, string)`; la firma `(WorldTile, GodPower)` appartiene invece a `click_power_action`.

### `addOpposite` / `addDecision` / `addSpell` non fanno nulla

- **Cosa vedi**: Il tratto opposto non viene rimosso, la decisione non scatta mai. Nessun errore.
- **Perché**: Questi metodi aggiungono semplicemente un **ID**. Il collegamento tra ID e oggetti reali avviene solo all'avvio del gioco prima del caricamento dei mod.
- **Risoluzione**: Popola direttamente i campi risolti dopo `add()`: `linkCombatActions()`, `linkSpells()`, e assegna `opposite_traits` direttamente. Se imposti `opposite_trait_mod` lasciando `opposite_traits` nullo, il gioco andrà in crash nel codice sociale: un `HashSet` vuoto evita il problema.

---

## Registrato, poi rotto nel mondo

Ogni voce di questa sezione ha la stessa causa. Il gioco prepara una parte di ogni asset **una volta sola, mentre carica**, e la tua mod registra i suoi asset dopo. Niente te lo dice: l'asset esiste, ha un nome, e la prima volta che il gioco lo usa davvero, esplode. Anche la soluzione ha sempre la stessa forma: fai quel passaggio tu, subito dopo aver registrato l'asset :wbfacepalm:. Parola del giorno: work around.

### La tua creatura dà un errore d'ombra

- **Cosa vedi**: `ActorAssetLibrary: Shadow size is too small : (0.00, 0.00)`, tre volte per creatura, e un popup d'errore in gioco.
- **Perché**: La libreria misura lo sprite d'ombra di ogni attore all'avvio. Una creatura aggiunta dopo non viene mai misurata.
- **Risoluzione**: `asset.texture_asset.loadShadow();` dopo il clone. Vedi **[Attori personalizzati](#/nml/custom-actors)**.

### Il tuo tratto, oggetto o creatura resta bloccato

- **Cosa vedi**: Esiste, ma il libro della conoscenza lo mostra grigio e il giocatore non può usarlo finché non salta fuori in un mondo.
- **Perché**: `needs_to_be_explored` è `true` di default su tutto ciò che si sblocca: attori, i sette tipi di tratto, oggetti, modificatori e leggi del mondo.
- **Risoluzione**: `needs_to_be_explored = false` quando lo crei. Vedi **[Tratti personalizzati](#/nml/custom-traits)**.

### Il gioco crasha caricando la tua arma o il tuo cibo

- **Cosa vedi**: `ArgumentNullException: Value cannot be null. Parameter name: key` in `ItemLibrary.loadSprites()` o `ResourceLibrary.loadSprites()`.
- **Perché**: Le armi ricevono `path_gameplay_sprite`, e le risorse `full_sprite_path`, ricavati in `post_init()` durante il caricamento del gioco. I tuoi restano `null`.
- **Risoluzione**: Impostali tu. Vedi **[Oggetti personalizzati](#/nml/custom-items)** e **[Risorse e cibo](#/nml/resources)**.

### Una nuvola crasha appena compare

- **Cosa vedi**: `NullReferenceException` in `Cloud.prepare()` la prima volta che la tua nuvola appare.
- **Perché**: `CloudLibrary` trasforma `path_sprites` in `cached_sprites` e `color_hex` in `color` in un solo passaggio all'avvio.
- **Risoluzione**: Fai entrambe le cose tu dopo `add()`. Vedi **[Nuvole e meteo](#/nml/clouds)**.

### Piazzare il tuo edificio dà Index was out of range

- **Cosa vedi**: `ArgumentOutOfRangeException: Index was out of range` in `Building.setAnimData()` nel momento in cui ne piazzi uno.
- **Perché**: I frame degli edifici vengono precaricati per tutti all'avvio. Il tuo ha la lista dei frame vuota, oppure la sua cartella non ha `main_0.png`.
- **Risoluzione**: `shrine.loadBuildingSprites();` appena `sprite_path` è impostato, e frame chiamati `main_0`, `construction_0`, `ruin_0`, `mini_0`. Vedi **[Edifici personalizzati](#/nml/custom-buildings)**.

### Il tuo edificio lancia errori a ogni frame in cui si vede

- **Cosa vedi**: Centinaia di `NullReferenceException` in `DynamicSprites.getRecoloredBuilding()`, uno per frame finché è a schermo.
- **Perché**: L'atlante che colora un edificio col colore del proprietario, `atlas_asset`, viene collegato in `checkAtlasLink()` all'avvio. Un clone non se lo porta dietro.
- **Risoluzione**: `shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);`

### La minimappa lancia errori appena esiste il tuo edificio

- **Cosa vedi**: `NullReferenceException` in `Building.getColorForMinimap()` ogni volta che la minimappa si ridisegna.
- **Perché**: Il puntino sulla minimappa viene da `mini_0.png` nella cartella dell'edificio, e non c'è.
- **Risoluzione**: Aggiungi `mini_0.png`, un pixel per ogni tile che l'edificio copre: 5x4 per qualsiasi cosa clonata da `temple_human`.

### Il tuo tile si dipinge, poi il renderer della mappa esplode

- **Cosa vedi**: `NullReferenceException` in `WorldTilemap.getVariation()` per ogni tuo tile a schermo.
- **Perché**: `TopTileLibrary` carica i PNG di `tiles/<id>/` in `sprites` all'avvio.
- **Risoluzione**: Caricali tu con `addVariation()`. Vedi **[Tile e terreno](#/nml/tiles)**.

### Far nascere un animale sul tuo tile crasha

- **Cosa vedi**: `NullReferenceException` in `Subspecies.generateName()`, solo sul tuo tile e solo per gli animali.
- **Perché**: Un clone di un tile d'erba tiene `is_biome = true` ma non `biome_asset`, che viene collegato in `linkAssets()` all'avvio. Gli animali aggiungono il bioma al nome della specie.
- **Risoluzione**: `moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);`

### I drop cadono invisibili, o un proiettile esplode

- **Cosa vedi**: I tuoi drop cadono senza niente disegnato, oppure `ArgumentOutOfRangeException` in `QuantumSpriteLibrary.drawProjectiles()`.
- **Perché**: Drop, proiettili, status, edifici e risorse in mano leggono la grafica con `getSpriteList()`, che restituisce i frame *dentro* una cartella. Un PNG singolo torna come lista vuota.
- **Risoluzione**: Una cartella per animazione, anche con un frame solo: `drops/hello_ember/hello_ember_0.png`. Vedi **[Sprite e risorse](#/nml/sprites-and-resources)**.

### Il log si riempie di ArgumentNullException dai proiettili

- **Cosa vedi**: Migliaia di `ArgumentNullException: Value cannot be null` in `ProjectileManager.updateProjectiles()` mentre un proiettile è in aria.
- **Perché**: Un proiettile senza tiratore non ha regno, e il gestore usa il regno come chiave di dizionario a ogni frame.
- **Risoluzione**: Dagliene uno: `pForcedKingdom: World.world.kingdoms_wild.get("nature")`, il proprietario neutro del gioco stesso.

### La tua scheda dei poteri non compare mai

- **Cosa vedi**: `NullReferenceException` in `PowersTab.setNewWidth()`, la scheda non c'è e i tuoi poteri nemmeno.
- **Perché**: `recalc()` è stato chiamato durante `OnModLoad`. Lo `Start()` della scheda non è ancora girato, quindi il suo parent è ancora `null`, e l'eccezione ammazza l'intera fase.
- **Risoluzione**: Crea la scheda al caricamento, impaginala da `Update()`. Vedi **[Schede e bottoni dei poteri](#/nml/power-buttons)**.

### La finestra delle impostazioni mostra id grezzi

- **Cosa vedi**: `LocalizedTextManager: missing text: strike_radius Description` nel log.
- **Perché**: NML chiede a ogni riga delle impostazioni due chiavi: `<id>` per l'etichetta e `<id> Description`, con lo spazio e la D maiuscola, per il tooltip.
- **Risoluzione**: Aggiungile entrambe a `Locales/en.json`. Vedi **[Impostazioni della mod](#/nml/mod-config)**.

### Il mondo lancia errori a ogni frame dopo aver aggiunto un comportamento del mondo

- **Sintomo**: `NullReferenceException` in `MapBox.updateWorldBehaviours()`, a ogni frame a partire dal caricamento del tuo mod.
- **Causa**: Il mondo mantiene un timer per ciascun comportamento, creato all'avvio iniziale della mappa prima del tuo mod. Il tuo non ne ha alcuno e il ciclo di aggiornamento tenta di eseguirlo lo stesso.
- **Soluzione**: `behaviour.manager = new WorldBehaviour(behaviour);` subito dopo `add()`. Vedi **[Ere del mondo e comportamenti](#/nml/world-ages)**.

### Un disastro va in crash quando scrive nel log del mondo

- **Sintomo**: `NullReferenceException` nel costruttore di `WorldLogMessage`, chiamato da `WorldLog.logDisaster()`.
- **Causa**: `world_log` è l'ID di un `WorldLogAsset`, non una chiave di testo. Un ID non registrato restituisce `null`, e il messaggio viene costruito attorno a esso.
- **Soluzione**: Clona `$basic_disaster$` con quell'ID e imposta il suo `locale_id`. Vedi **[Disastri](#/nml/disasters)**.

### Un disastro senza action va in crash non appena viene sorteggiato

- **Sintomo**: `NullReferenceException` in `WorldBehaviourActions.updateDisasters()`, la prima volta che il sorteggio sceglie il tuo.
- **Causa**: Il sorteggio invoca `action` senza controllare se sia nullo. `spawn_asset_unit` da solo non fa nulla.
- **Soluzione**: Punta `action` su `AssetManager.disasters.simpleUnitAssetSpawnUsingIslands` oppure scrivi una tua action personalizzata.

### Il primo governante che prende in considerazione il tuo complotto va in crash

- **Sintomo**: `NullReferenceException` in `PlotAsset.checkIsPossible()`.
- **Causa**: `check_is_possible` viene chiamato senza alcun controllo sui nulli ogni volta che un leader esamina il complotto.
- **Soluzione**: Impostalo sempre. Se non hai condizioni, restituisci semplicemente `true`. Vedi **[Complotti](#/nml/plots)**.

### La tua decisione, complotto, gene o arma esiste ma nulla lo usa mai

- **Sintomo**: Nessun errore. L'asset è registrato nella sua libreria, ma il gioco non lo sceglie mai.
- **Causa**: Il gioco sceglie da elenchi costruiti all'avvio: `basic_plots`, gli elenchi delle decisioni, il pool di mutazione dei geni, i pool delle armi, i pool degli slot delle ere. Il tuo è stato aggiunto dopo.
- **Soluzione**: Aggiungilo alla lista da cui il gioco legge effettivamente. Ogni pagina spiega quale: **[IA e comportamenti personalizzati](#/nml/custom-ai)**, **[Complotti](#/nml/plots)**, **[Tratti delle sottospecie](#/nml/subspecies-traits)**, **[Oggetti personalizzati](#/nml/custom-items)**, **[Ere del mondo e comportamenti](#/nml/world-ages)**.

---
## Compila a te, ma non agli altri

Il classico "sul mio PC funziona". Di solito la differenza è la tua configurazione, non il tuo codice :PES5_Hmmmm:.

### `CS0122: inaccessible due to its protection level`

- **Cosa vedi**: Codice copiato da un mod funzionante non compila: `addStatusEffect`, `getHit`, `_localized_text`, `addBuilding`.
- **Perché**: Sono `internal`. NML compila il tuo `Code/*.cs` contro la sua copia **publicized** (`StreamingAssets/Mods/NML/Assembly-CSharp-Publicized.dll`), quindi in una normale mod sorgente funzionano e basta. L'errore compare quando compili una `.dll` tua in Visual Studio contro l'`Assembly-CSharp.dll` originale, che li nasconde.
- **Risoluzione**: Riferisci quella copia publicized nel tuo progetto, oppure usa la strada pubblica:

| Invece di | Usa |
| --- | --- |
| `actor.addStatusEffect("x", 20f)` | `World.world.statuses.newStatus(actor, AssetManager.status.get("x"), 20f)` |
| `actor.getHit(5f, ...)` | `actor.changeHealth(-5)` |
| `LocalizedTextManager.instance._localized_text[k] = v` | `LM.Add("en", k, v)` poi `LM.ApplyLocale(false)` |

### Funziona sul tuo computer, non fa nulla sul loro

- **Cosa vedi**: Segnalazioni che il mod si carica senza contenuti, o lancia un errore alla prima riga.
- **Perché**: Quasi sempre uno di questi quattro motivi: un percorso assoluto con il tuo nome utente; uno zip dei *file interni* invece della *cartella principale*; un `GUID` modificato tra le versioni; la presenza simultanea di `Code/` e di una vecchia `.dll`.
- **Risoluzione**: Ottieni i percorsi con `GetDeclaration().FolderPath`. Comprimi l'intera cartella. Definisci il `GUID` una sola volta. Distribuisci **solo** `Code/` oppure solo la `.dll`, mai entrambi.

---

## Funziona all'inizio, poi si rompe dopo

Quelli lenti. Ieri la tua mod andava benissimo, e non è cambiato niente :PES2_Shrug:.

### Un altro mod sovrascrive silenziosamente i tuoi contenuti

- **Cosa vedi**: Il tuo tratto scompare se è attivo un altro mod specifico. Nel log compare una riga passata inosservata: `duplicate asset - overwriting...`.
- **Perché**: Esiste un unico spazio dei nomi condiviso tra gioco base e tutti i mod. L'ultima registrazione vince, e l'ordine di caricamento non è sotto il tuo controllo.
- **Risoluzione**: Prefissa sempre gli ID: `hello_swift`, mai `swift`. Proteggi con `if (AssetManager.traits.has(SWIFT)) return;`. Per *modificare* contenuti base, recuperali con `get()` e modificali sul posto senza registrare un duplicato.

### Crash su `World.world` durante il caricamento del mod

- **Cosa vedi**: Il crash si verifica sulla prima riga che interagisce con la mappa di gioco.
- **Perché**: `OnModLoad` viene eseguito prima che qualsiasi mondo venga generato. Le librerie di asset sono pronte; il mondo no.
- **Risoluzione**: Registra gli asset in `OnModLoad`, e interagisci con il mondo dentro `Update()` dietro `if (!Config.game_loaded) return;` con controlli null su `World.world`, `World.world.units` e `MapBox.instance`.

### I tuoi dati iniziano a controllare le creature sbagliate

- **Cosa vedi**: Dopo aver caricato una partita o creato un nuovo mondo, creature non correlate si comportano in modo anomalo.
- **Perché**: Gli ID delle unità sono validi solo **all'interno del singolo mondo** e vengono riassegnati da zero. Mantenere il riferimento all'oggetto `Actor` è ancora peggio: le unità morte vengono riutilizzate dal pool, quindi il riferimento non è null ma appartiene a un'altra creatura.
- **Risoluzione**: Rileva il cambio di mondo e svuota le strutture dati. Il tempo di gioco che scorre all'indietro è il segnale più semplice:

```csharp
double now = World.world.getCurWorldTime();
if (_lastWorldTime >= 0.0 && now < _lastWorldTime - 1.0) MyRegister.Clear();
_lastWorldTime = now;
```

### Tutto scompare dopo un salvataggio o caricamento

- **Cosa vedi**: Le tue unità tornano al comportamento vanilla, pur mantenendo visivamente il tuo tratto.
- **Perché**: Solo i dati nativi del gioco vengono serializzati; il tuo dizionario statico no. I tratti sono salvati come ID, e un ID **non presente nella libreria al caricamento viene scartato silenziosamente** (quindi disattivare, caricare e riattivare rimuove il tratto da ogni unità).
- **Risoluzione**: Usa il tratto come flag persistente e ricostruisci i dati da esso: `trait.action_on_augmentation_load = (pActor, pTrait) => MyRegister.Restore(pActor);`
- **Oppure**: mantieni lo stato nell'unità stessa. Il suo archivio di dati personalizzati viene salvato con essa: vedi **[Ricordare le cose](#/nml/saving-data)**..

### Le unità si bloccano a gruppi

- **Cosa vedi**: Gruppi di unità smettono di muoversi contemporaneamente; il gruppo cambia a ogni frame. Un'eccezione a frame nel log.
- **Perché**: I cicli di aggiornamento delle unità non hanno un blocco try/catch. Un errore sull'unità *i* interrompe l'aggiornamento di tutte le unità successive per quel frame.
- **Risoluzione**: Racchiudi il corpo di ogni patch e dell'esecuzione di comportamenti custom (`execute`) in un blocco try/catch, restituendo `BehResult.Stop` in caso di errore.

### Metà delle tue patch Harmony non sono mai state applicate

- **Cosa vedi**: Solo due patch su nove funzionano. Un singolo errore nel log e poi più nulla.
- **Perché**: `PatchAll` si arresta alla prima classe che non riesce a risolvere e scarta tutte le successive.
- **Risoluzione**: Applica le patch classe per classe, così un eventuale errore isola una singola patch. Codice completo in **[Patch Harmony](#/nml/harmony-patches)**.

### La tua patch su `updateStats` va in crash per altri utenti

- **Cosa vedi**: Funziona perfettamente sul tuo PC per ore, ma genera eccezioni di concorrenza/threading sui PC dei tester.
- **Perché**: Il gioco esegue `updateStats` come job **parallelo**: il tuo Postfix gira su thread di lavoro contemporaneamente su più unità.
- **Risoluzione**: In quella patch modifica solo i valori numerici dell'unità stessa. Accoda qualsiasi altra operazione (chiamate Unity, liste condivise, generatori random) per il tuo metodo `Update()`.

### Hai applicato la patch a `getHit` ma gli edifici subiscono comunque danno

- **Cosa vedi**: La tua regola di danno si applica alle unità ma non agli edifici, oppure scatta due volte.
- **Perché**: `getHit` esiste tre volte: sulla classe base e come override sia su `Actor` **sia** su `Building`. Harmony applica la patch al corpo del metodo specifico, non al meccanismo polimorfico.
- **Risoluzione**: Applica la patch a ciascun override concreto necessario, prevenendo doppi conteggi.

### Il tuo Prefix ha rotto altri tre mod

- **Cosa vedi**: Segnalazioni del tipo "il tuo mod rompe il mod X". Nulla nel log, e l'autore di X non riesce a riprodurlo da solo.
- **Perché**: Restituire `false` da un Prefix salta il metodo originale **e le patch di tutti gli altri mod registrate dopo la tua**. Su `updateStats`, questo lascia anche flag di cache non aggiornati per sempre sull'unità.
- **Risoluzione**: Preferisci i Postfix modificando il risultato (`__result *= 0.5f`) anziché bloccare con i Prefix. Quando devi per forza cancellare, fallo sul metodo più circoscritto possibile e restituisci `true` subito per tutti i casi che non ti interessano.

### Un'unità rimane immobile per sempre o va in crash a ogni frame

- **Cosa vedi**: Un'unità bloccata senza nome di attività (task), oppure una sequenza ininterrotta di errori a ogni tick.
- **Perché**: Un ID **task** inesistente viene ignorato silenziosamente e non fa nulla; un ID **job** inesistente genera un crash a ogni singolo tick.
- **Risoluzione**: Valida gli ID all'avvio, registra i task prima dei job che li utilizzano, e non passare mai a `next_job_delegate` un ID non verificato.

### La tua logica IA personalizzata viene ripristinata silenziosamente

- **Cosa vedi**: Dopo un po' di tempo alcune unità tornano all'IA standard del gioco mentre il tuo registro le elenca ancora.
- **Perché**: Gli attori sono riutilizzati dal pool di memoria: una "nuova" unità è un vecchio oggetto il cui delegato di lavoro è appena stato azzerato. Anche entrare in combattimento lo azzera.
- **Risoluzione**: Riapplica il delegato periodicamente: `if (pActor.ai.next_job_delegate != MyAI.NextJob) pActor.ai.next_job_delegate = MyAI.NextJob;`.

### Il gioco scatta quattro volte al secondo

- **Cosa vedi**: Gli FPS medi sembrano buoni, ma il gioco ha micro-scatti regolari senza una singola funzione pesante evidente.
- **Perché**: Tutte le unità elaborano la logica nello stesso tick e avanzano solo al termine dell'azione corrente, completandola nello stesso istante.
- **Risoluzione**: Esegui la logica con un timer autonomo e non in `execute`. Suddividi la popolazione ed elaborane una porzione per ciclo. Pre-alloca le liste ed evita LINQ, espressioni lambda e `Debug.Log` in quel percorso critico.

### I clic finiscono sulla mappa dietro alla tua finestra

- **Cosa vedi**: Il giocatore clicca su un comando nel tuo pannello e un'unità compare sul terreno sottostante.
- **Perché**: Un canvas sprovvisto di `GraphicRaycaster` viene disegnato ma non intercetta i clic. Inoltre `unselect_when_window` riconosce solo le finestre native del gioco, quindi un pannello personalizzato non disattiva il potere attivo.
- **Risoluzione**: Usa `Canvas` + `overrideSorting` + `sortingOrder` + `GraphicRaycaster` assieme a un'immagine di sfondo. Imposta `raycastTarget = false` sulle etichette di testo. Disarma manualmente il potere attivo quando la finestra viene aperta.

### L'uso della memoria sale a ogni apertura del pannello

- **Cosa vedi**: La memoria occupata cresce a ogni apertura della finestra; sessioni di gioco lunghe subiscono rallentamenti.
- **Perché**: `Destroy(root)` distrugge la gerarchia GameObject, ma le istanze di `Texture2D` o `Sprite` create da **te** sono oggetti separati che il Garbage Collector non libera in automatico.
- **Risoluzione**: Distruggi esplicitamente gli asset creati e azzera i riferimenti. **Non** distruggere gli sprite ottenuti da `SpriteTextureLoader`, poiché sono condivisi dal gioco.

### Un nuovo valore predefinito non raggiunge i giocatori esistenti

- **Cosa vedi**: Modifichi un default in `default_config.json` e i giocatori esistenti mantengono il vecchio valore. Nuove installazioni funzionano regolarmente.
- **Perché**: Quel file è solo un template iniziale. I valori effettivi risiedono in `mods_config\<UID>.config`, che memorizza l'intero oggetto (quindi limiti modificati e callback rinominati vengono oscurati).
- **Risoluzione**: Fai i test cancellando quel file di configurazione locale. Se i limiti o una callback devono cambiare per gli utenti esistenti, aggiungi un nuovo `Id` anziché modificare quello vecchio.

### Uno slider si muove ma la tua funzione di callback non viene eseguita

- **Cosa vedi**: La riga funziona, il valore viene salvato, ma il tuo metodo non viene mai richiamato.
- **Perché**: Il formato della callback è `Namespace.Type:MethodName`, il metodo deve essere **statico**, e il parametro deve corrispondere al tipo esatto (`INT_SLIDER` → `int`, `SLIDER` → `float`, `SWITCH` → `bool`, `TEXT` → `string`).
- **Risoluzione**: Includi il namespace completo, rendi il metodo statico e fai combaciare il tipo. Le modifiche vengono applicate quando la finestra si **chiude**, non durante il trascinamento dello slider.

---

## Ancora bloccato?

Scrivi in **[Feedback e richieste](#/feedback)** con tre righe sintetiche (cosa hai fatto, cosa ti aspettavi, cosa è successo) e la riga del log. Le nuove casistiche vengono aggiunte regolarmente a questa pagina :aPES4_Noted:.
