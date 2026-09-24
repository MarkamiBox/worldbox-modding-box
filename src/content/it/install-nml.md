---
title: Installare NML
group: NML Modding
icon: :wbhammer:
order: 1
---

# Installare NML :wbhammer:

**NML** (NeoModLoader) è il programma che fa funzionare le mod di WorldBox. Installi NML una volta sola, e da lì in poi installare una mod vuol dire copiare una cartella.

Questa pagina parte dal presupposto che tu non abbia mai fatto niente del genere. Se sai cos'è un `.dll`, salta alla **[versione corta](#la-versione-corta)** :PES_OkHand:.

> [!NOTE] Windows, Mac e Linux (Steam Deck)
> Le mod funzionano sulla **versione Steam per Windows, Mac e Linux** (incluso Steam Deck / SteamOS). Non su telefono, non su tablet, non su console.

## La versione corta

1. In gioco: **Impostazioni → Experimental Mode → attivo**.
2. Scarica `NeoModLoader.dll` dalla [pagina ufficiale delle release](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest).
3. Mettilo in `worldbox_Data/StreamingAssets/Mods/` dentro la cartella di WorldBox.
4. Da quella stessa cartella cancella tutto quello che ha `NCMS` nel nome.
5. Avvia il gioco. Le mod ora vanno nella cartella `Mods` accanto a `worldbox.exe`.

Tutto qui. Il resto della pagina sono gli stessi cinque passi, con ogni clic scritto.

---

## Windows

### Passo 1. Attiva Experimental Mode

1. Avvia WorldBox normalmente, da Steam.
2. Apri la finestra **Impostazioni** del gioco.
3. Cerca nella lista **Experimental Mode** (con il gioco in italiano: **Modalità sperimentale**) e attivala.
4. Chiudi il gioco.

Senza questo interruttore il gioco non cerca nemmeno le mod. Nessun errore, nessun messaggio, semplicemente niente :PES5_Hmmmm:.

> [!WARNING] Ci sono due cartelle che si chiamano Mods
> Questa, dentro `worldbox_Data\StreamingAssets\Mods/`, è solo per **NML stesso** (nello specifico `NeoModLoader.dll`) e nient'altro. Quella in cui metterai le tue **mod** è una cartella separata, posizionata direttamente nella radice del gioco accanto a `worldbox.exe` (`worldbox\Mods/`). Non esiste ancora; NML la crea automaticamente al primo avvio del gioco. Mettere una mod dentro `StreamingAssets\Mods/`, o NML dentro `worldbox\Mods/`, è l'errore più comune su questa pagina.

### Passo 2. Scarica NML

1. Apri questo link: **[github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest)**. Punta sempre all'NML più recente, quindi puoi salvarlo nei preferiti.
2. Scorri fino alla sezione **Assets**. Se è chiusa, cliccala per aprirla.
3. Clicca **NeoModLoader.dll**. Si scarica come qualsiasi altro file, di solito nella cartella **Download**.

Ti serve solo quel file. La pagina elenca anche `nml-setup-win.exe` e file che finiscono in `.pdb`, `.xml` e "Source code": ignorali tutti. Servono agli sviluppatori di NML, non a te.

> [!WARNING] Solo da quel link
> Una `.dll` è un programma. Scarica NML **solo** dalla pagina GitHub qui sopra, mai da CurseForge, da un altro sito o da un file che qualcuno ti ha mandato in chat. Una vecchia copia presa altrove si cancella da sola al primo avvio del gioco, lasciando solo una cartella `NML` e `NeoModLoader.AutoUpdate_memload.dll` - se succede, torna qui e scarica il file vero. Nemmeno il pulsante "installazione in 1 clic" di GameBanana installa NML; scarica la `.dll` a mano.
>
> Se il browser chiede "mantenere questo file?", o Chrome lo segna come **Non confermato**, è perché una `.dll` è un programma e non molte persone scaricano proprio questa. Da quella pagina GitHub la risposta è mantienilo (in Chrome: apri l'elenco dei download, poi **Mantieni comunque**).

### Passo 3. Apri la cartella di WorldBox

È la cartella dove Steam ha installato il gioco. Non devi mai cercarla:

1. Apri **Steam** e vai nella **Libreria** (library).
2. **Clic destro** su WorldBox nella lista a sinistra.
3. Clicca **Gestisci**, poi **Sfoglia file locali**.

Si apre una finestra con i file del gioco. Sei nel posto giusto se vedi un file chiamato `worldbox` (o `worldbox.exe`) e una cartella chiamata `worldbox_Data`. Sulla maggior parte dei PC questa finestra è:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Tieni aperta questa finestra. Da qui in avanti, "la cartella di WorldBox" è questa. Ci tornerai più spesso di quanto pensi.

> [!TIP] Fai vedere a Windows le estensioni dei file
> Di base Windows nasconde la fine dei nomi dei file, quindi `NeoModLoader.dll` appare solo come `NeoModLoader`. Così ogni guida diventa più difficile da seguire. Nella finestra della cartella clicca **Visualizza** in alto, poi spunta **Estensioni nomi file** (su Windows 11: **Visualizza → Mostra → Estensioni nomi file**). Non si rompe niente, vedi solo i nomi completi.

### Passo 4. Metti NML nel posto giusto

1. Nella cartella di WorldBox, doppio clic su **worldbox_Data**.
2. Doppio clic su **StreamingAssets**.
3. Doppio clic su **Mods**.
4. Ora apri la cartella **Download** in una seconda finestra, e trascina **NeoModLoader.dll** in questa finestra `Mods`.

Deve finire qui:

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            ├── test_asset_load/     è del gioco, lasciala stare
            └── NeoModLoader.dll     <- quello che hai appena aggiunto
```

Se lì dentro non vedi `test_asset_load`, sei nella cartella sbagliata. Torna alla cartella di WorldBox e riprova.

**Già che sei in questa cartella:** se c'è qualcosa con **NCMS** nel nome (per esempio `NCMS_memload.dll`, o una cartella chiamata `NCMS`), cancellalo. NCMS è il vecchio mod loader, è morto, e NML sa già far girare le vecchie mod NCMS :PES2_Shrug:.

> [!WARNING] `NeoModLoader (1).dll` non è `NeoModLoader.dll`
> Hai scaricato NML due volte o c'era già una vecchia copia in quella cartella? Windows rinomina il nuovo file in `NeoModLoader (1).dll` invece di sovrascriverlo, e NML rifiuterà di avviarsi: del testo rosso inonderà lo schermo chiedendoti di riavviare il gioco, e il log dirà `Missing className: NeoModLoader (1).WorldBoxMod`. Chiudi il gioco, cancella il vecchio file, rinomina il nuovo esattamente in `NeoModLoader.dll` - senza spazi né numeri - e ricomincia. Questo singolo carattere è la causa più comune per cui NML "non funziona" :PESgn_SMH:.
>
> Se Windows rifiuta di eliminare il vecchio file perché "è in uso", significa che il gioco è ancora in esecuzione. Chiudilo prima.

> [!WARNING] Ci sono due cartelle che si chiamano Mods
> Questa, dentro `worldbox_Data\StreamingAssets\Mods/`, è solo per **NML stesso** (nello specifico `NeoModLoader.dll`) e nient'altro. Quella in cui metterai le tue **mod** è una cartella separata, posizionata direttamente nella radice del gioco accanto a `worldbox.exe` (`worldbox\Mods/`). Non esiste ancora; NML la crea automaticamente al primo avvio del gioco. Mettere una mod dentro `StreamingAssets\Mods/`, o NML dentro `worldbox\Mods/`, è l'errore più comune su questa pagina.

### Passo 5. Avvia il gioco e controlla

Avvia WorldBox da Steam, e la prima volta dagli un po' più di tempo del solito.

Hai fatto tutto giusto se:

- Mentre il mondo carica, il gioco mostra il messaggio **Experimental mode is enabled**.
- C'è un bottone nuovo con il **logo di NML** tra i bottoni delle schede in basso sullo schermo. Cliccalo: lì vive la lista delle tue mod.
- Tornando nella cartella di WorldBox, c'è una nuova cartella vuota chiamata **Mods**, proprio accanto a `worldbox.exe`.
- In `worldbox_Data\StreamingAssets\Mods/` NML ha creato una cartella **NML** per le sue cose. Non toccarla.

Se non è successo niente di tutto questo, vai a **[Non ha funzionato](#non-ha-funzionato)**.

---

## Mac

Gli stessi cinque passi. Cambia solo dove è nascosta la cartella, perché su Mac l'intero gioco è impacchettato in un'unica icona. Cose da Apple :wbbre:.

1. **Experimental Mode**: esattamente come su Windows, **[Passo 1](#passo-1-attiva-experimental-mode)**. L'avviso sugli aggiornamenti vale anche per te.
2. **Scarica** `NeoModLoader.dll` dalla [stessa pagina delle release](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest). È lo stesso file per Windows e Mac.
3. **Apri la cartella di WorldBox**: Steam → Libreria → clic destro su WorldBox → **Gestisci → Sfoglia file locali**. Si apre una finestra del Finder.
4. **Entra nell'app**: clic destro sull'icona dell'app **worldbox** e scegli **Mostra contenuto pacchetto**. Poi apri **Contents → Resources → Data → StreamingAssets → Mods**, e trascinaci dentro `NeoModLoader.dll`. Già che ci sei, cancella tutto quello che ha `NCMS` nel nome.
5. **Avvia il gioco** e controlla le stesse cose del **[Passo 5](#passo-5-avvia-il-gioco-e-controlla)**. La nuova cartella `Mods` per le tue mod compare nella cartella di WorldBox, accanto all'app, non dentro.

```text
worldbox/
├── worldbox.app/
│   └── Contents/Resources/Data/StreamingAssets/Mods/
│       └── NeoModLoader.dll     <- NML va qui
└── Mods/                        <- le tue mod vanno qui
```

---

## Linux & Steam Deck

La logica è identica. Steam su Linux installa il gioco nella cartella utente, e su Steam Deck basta passare prima alla modalità Desktop. Pinguini benvenuti :wbpenguin:.

1. **Experimental Mode**: esattamente come su Windows, **[Passo 1](#passo-1-attiva-experimental-mode)**.
2. **Scarica** `NeoModLoader.dll` dalla [pagina ufficiale delle release](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest). È lo stesso file per tutte le piattaforme.
3. **Apri la cartella di WorldBox**:
   - **Desktop Linux**: Steam → Libreria → clic destro su WorldBox → **Gestisci → Sfoglia file locali**.
   - **Steam Deck**: Premi il tasto **STEAM → Spegni/Alimentazione → Passa a Desktop**. Apri Steam in modalità Desktop, vai nella Libreria → clic destro su WorldBox (o trackpad sinistro / grilletto) → **Gestisci → Sfoglia file locali**.
   Di solito il percorso è:
   ```text
   ~/.local/share/Steam/steamapps/common/worldbox/
   ```
4. **Metti NML al suo posto**: Apri `worldbox_Data → StreamingAssets → Mods`, e trascinaci dentro `NeoModLoader.dll`. Se c'è qualcosa con `NCMS` nel nome, cancellalo.
5. **Avvia il gioco** (su Steam Deck puoi tornare alla modalità Gioco) e controlla le stesse cose del **[Passo 5](#passo-5-avvia-il-gioco-e-controlla)**. La nuova cartella `Mods` per le tue mod compare nella cartella principale di WorldBox, accanto all'eseguibile.

```text
worldbox/
├── worldbox_Data/
│   └── StreamingAssets/
│       └── Mods/
│           └── NeoModLoader.dll     <- NML
└── Mods/                            <- mods
```

---

## Installare una mod

Ora la parte facile, e quella che farai ancora e ancora.

1. Scarica la mod. Leggi prima la descrizione: alcune mod hanno bisogno di qualcosa in più, e di solito l'autore lo dice.
2. Metti lo `.zip` direttamente in **`worldbox\Mods/`**, quella accanto a `worldbox.exe`. Non estrarlo: NML scompatta i suoi zip da solo al prossimo avvio del gioco.
3. Avvia il gioco.

L'hai già estratto per abitudine? Funziona lo stesso, purché la cartella che contiene `mod.json` finisca direttamente dentro `Mods/`. Una cartella di mod ha sempre da qualche parte un file chiamato `mod.json`, ed è così che NML la riconosce. L'errore da evitare è una cartella dentro una cartella dentro `Mods/`, oppure i file della mod sparsi in `Mods/` senza nessuna cartella intorno.

```text
worldbox/
├── worldbox.exe
└── Mods/
    ├── SomeMod/
    │   └── mod.json
    └── AnotherMod/
        └── mod.json
```

> [!TIP] Provalo con HelloBox
> Non sei sicuro che funzioni? La mod che costruisce questa guida è un test già pronto. Scaricala da **[La mod completa](#/nml/all-together)**, estraila in `Mods`, avvia il gioco. Se compare una nuova scheda dei poteri piena di pulsanti sciocchi, è tutto installato bene :wbpeak:.

**Per rimuovere una mod**, chiudi il gioco e cancella la sua cartella da `Mods`. **Per disattivarla senza cancellarla**, usa la lista delle mod di NML nel gioco.

**Le mod del Workshop** funzionano anche loro: iscriviti sullo Steam Workshop e NML le prende da solo, senza copiare nulla.

---

## Non ha funzionato

Controllale in ordine. La prima risolve quasi tutti.

| Cosa vedi | Cosa fare |
| --- | --- |
| Nessun bottone NML, nessuna cartella `Mods` accanto a `worldbox.exe` | Experimental Mode è spenta. Attivala, riavvia. Anche dopo ogni aggiornamento del gioco |
| Ancora niente, Experimental Mode è attiva | `NeoModLoader.dll` è nella cartella sbagliata. Deve stare in `worldbox_Data\StreamingAssets\Mods/`, accanto a `test_asset_load` |
| Il file si chiama `NeoModLoader.dll.dll` o `NeoModLoader (1).dll` | Rinominalo esattamente `NeoModLoader.dll` |
| NML c'è, ma una mod non compare | La mod è nella `Mods` sbagliata. Va in quella accanto a `worldbox.exe`, come proprio archivio `.zip` o come cartella con dentro `mod.json` |
| Testo rosso a fiumi che dice `YOU SHOULD RESTART THE GAME` | NML si chiama `NeoModLoader (1).dll` o simile. Vedi **[Passo 4](#passo-4-metti-nml-nel-posto-giusto)** |
| NML dice che una mod "has been disabled due to an error" | La mod è rotta o troppo vecchia per la tua versione del gioco. Cerca un aggiornamento di quella mod, o chiedi al suo autore |
| La versione nell'angolo del menu principale non cambia mai | Il tuo gioco è su un ramo beta di Steam. Vedi **[Risoluzione problemi](#/troubleshooting)** |
| NML dice che una mod "has been disabled due to an error" | La mod è rotta o troppo vecchia per la tua versione del gioco. Cerca un aggiornamento di quella mod, o chiedi al suo autore |
| Si è rotto tutto subito dopo un aggiornamento di WorldBox | Riattiva Experimental Mode. Poi aspetta che le mod si aggiornino: un aggiornamento del gioco spesso rompe le mod vecchie per qualche giorno |

Ancora bloccato? **[Risoluzione problemi](#/troubleshooting)** ha la lista lunga, e **[Log e debugging](#/nml/logs-and-debugging)** mostra dove il gioco scrive cosa è andato storto. Quando chiedi aiuto, di' quali mod usi, cosa hai fatto subito prima che si rompesse, e incolla il testo dell'errore. "Non funziona" non è una cosa che qualcuno possa sistemare, me compreso :PESgn_ReadRules:.

---

## Le domande che fanno tutti

**Posso usare NML e BepInEx insieme?**
Sì. Non si danno fastidio. Due singole *mod* possono comunque litigare, ma è colpa delle mod, non dei loader.

**La mod dice che vuole BepInEx, non NML.**
Allora non va in `Mods`. Installa BepInEx come spiegato in **[La console dal vivo (BepInEx)](#/toolbox/bepinex-console)** (Windows), avvia il gioco una volta, e metti quella mod in `BepInEx\plugins/`. La descrizione della mod dice quale loader vuole.

**NML o NCMS?**
NML. NCMS non viene più aggiornato e non funziona sulle versioni attuali del gioco. NML fa girare comunque le vecchie mod NCMS, quindi non perdi niente.

**NML è un virus?**
No. I browser avvisano perché un `.dll` è un programma e non molte persone scaricano questo file specifico. Scaricalo solo dal link GitHub sopra: le mod su GameBanana vengono controllate dai moderatori, mentre un file che qualcuno ti invia in chat non è controllato da nessuno :PESgn_ReadRules:.

**Devo reinstallare NML per ogni mod?**
No. Una volta basta. Dopo, ogni mod è solo una cartella in `Mods`.

**Devo aggiornare NML?**
Di solito no. NML controlla se c'è una versione nuova ogni volta che il gioco parte e si sostituisce da solo (è il `NeoModLoader.AutoUpdate_memload.dll` che compare accanto a lui). Se mai non ci riesce, scarica il nuovo `NeoModLoader.dll` dallo stesso link e sostituisci quello vecchio a mano.

**Le mod mi rovinano i salvataggi?**
Possono farlo. Un salvataggio fatto con una mod potrebbe non caricarsi bene dopo che l'hai tolta. Tieni una copia dei mondi a cui tieni prima di provare qualcosa di nuovo :PES_MonkaSweat:.

**La mia mod preferita è obsoleta. Posso giocarci ancora?**
Puoi aspettare il suo autore, oppure giocare sulla versione del gioco per cui è stata creata: su Steam, fai clic destro su WorldBox → **Proprietà → Beta**, e seleziona quel ramo. Avrai anche bisogno della versione corrispondente di NML, linkata nei messaggi fissati del canale di modding sul Discord di WorldBox. Mentre sei su un ramo beta, ogni mod creata per la versione attuale smetterà di funzionare. Per tornare indietro, seleziona **Nessuna** nello stesso menu.

**Come aggiorno una mod?**
Le mod dello Workshop si aggiornano da sole. Per tutto il resto: chiudi il gioco, cancella la vecchia cartella della mod (e il suo vecchio file `.zip`) da `Mods`, e inserisci il nuovo `.zip`.

**Ho eliminato una mod ed è ancora nel gioco.**
Proveniva dallo Steam Workshop. Togliere la spunta nella lista delle mod non è sufficiente: disiscriviti dalla sua pagina dello Workshop.

**Posso modificare una mod per conto mio?**
Se contiene una cartella `Code` piena di file `.cs`, sì: sono testo semplice, NML li compila ogni volta che il gioco si avvia, e le risorse (resource) grafiche risiedono in `GameResources`. Salva prima una copia dell'originale. Condividere la tua versione modificata è un'altra questione, chiedi all'autore. Una mod che include solo un `.dll` non può essere modificata direttamente, solo ricompilata dai suoi sorgenti.

**Qualcuno che mi sta aiutando mi ha chiesto il log.**
Incolla `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` nella barra degli indirizzi di Esplora file e inviagli `Player.log`, il file vero e proprio, non uno screenshot. Se il gioco è appena crashato, invia invece `Player-prev.log`: riavviare il gioco sovrascrive `Player.log`.

Vuoi fare mod invece di usarle soltanto? Si comincia da **[Da dove iniziare](#/getting-started)**.
