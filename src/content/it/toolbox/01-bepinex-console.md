---
title: La console dal vivo (BepInEx)
group: Panoramica
subgroup: Strumenti esterni e setup
icon: :wbvideo:
order: 5
---

# La console dal vivo :wbvideo:

Aprire `Player.log` nel Blocco note dopo ogni singolo test è una tortura. (Eppure lo faccio ancora, non vi mentirò :23062-durrr:). **BepInEx** ti apre una finestra di console nera che stampa i log mentre il gioco è in esecuzione, così la tua riga di log compare nello stesso istante in cui il codice la esegue.

È una configurazione da dieci minuti che fai una volta sola e ti tieni stretta per tutta la tua carriera da modder.

## Cos'è BepInEx

È un mod loader che si aggancia ai giochi Unity prima ancora che si avviino. I modder di WorldBox lo usano essenzialmente per due motivi: la console dal vivo e **UnityExplorer** (a cui abbiamo dedicato una pagina intera). NML può installarlo al posto tuo quando una mod lo richiede, ma configurarlo da soli ti dà pieno controllo sulle impostazioni.

## Come installarlo

1. Nella [pagina ufficiale delle release di BepInEx](https://github.com/BepInEx/BepInEx/releases), scorri fino ad **Assets** e scarica il file chiamato `BepInEx_win_x64_5.4.x.x.zip`. Quella versione esatta: **win**, **x64**, **5**. I pacchetti `x86`, `unix`, `macos` e `BepInEx 6 / IL2CPP` sembrano tutti allettanti, ma nessuno di loro funziona qui :PES5_Dumb:.
2. Fai clic destro sullo zip → **Proprietà** → metti la spunta su **Annulla blocco** se presente, poi estrailo **direttamente nella cartella di WorldBox**, quella con `worldbox.exe` (percorso Steam predefinito: `C:\Program Files (x86)\Steam\steamapps\common\worldbox`, oppure fai clic destro su WorldBox in Steam → **Gestisci** → **Sfoglia i file locali**). Dovresti ottenere questa struttura:

```text
worldbox/
├── worldbox.exe
├── BepInEx/
├── doorstop_config.ini
└── winhttp.dll
```

3. **Avvia il gioco una volta e chiudilo.** Questo primo avvio serve a generare i file di configurazione. Non vedrai accadere nulla a schermo, ed è del tutto normale :hmm:.

## Attivare la console

Apri `BepInEx/config/BepInEx.cfg` con qualsiasi editor di testo, trova la sezione `[Logging.Console]` e imposta:

```text BepInEx/config/BepInEx.cfg
[Logging.Console]

## Enables showing a console for log output.
# Setting type: Boolean
# Default value: false
Enabled = true
```

Avvia di nuovo il gioco. Si aprirà una seconda finestra accanto ad esso, che starà già stampando a raffica.

## Leggere l'output

In questo momento, anche senza aver ancora creato mezza mod, avviando il gioco vedrai BepInEx e NeoModLoader che si inizializzano:

```text BepInEx console
[Info   :   BepInEx] Loading [NeoModLoader 1.x.x]
[Info   :Application] Initializing WorldBox...
[Info   :Application] [NML]: NeoModLoader initialized!
```

Se vedi comparire queste righe, congratulazioni: la tua console dal vivo è attiva e vegeta!

Più avanti, quando scriverai la tua prima mod nella guida **[La tua prima mod](#/nml/your-first-mod)**, vedrai la tua mod compilarsi e salutarti direttamente in mezzo al flusso:

```text BepInEx console
[Info   :Application] 005: Compile Mod HelloBox                = 2,2480
[Info   :Application] [NML]: [HelloBox]: HelloBox is alive!
```

Tre buone abitudini che rendono la console davvero indispensabile:

- **Metti un prefisso a ogni log** con il nome della tua mod, tipo `[MiaMod]`, così ritrovi subito le tue righe.
- **Logga all'inizio e alla fine** di ogni passaggio di setup. Se vedi "registrazione tratti..." ma mai "tratti registrati", sai al millimetro dove si è piantato tutto.
- **Tieni la console su un secondo monitor** (o su metà schermo). Vedere comparire una riga nello stesso microsecondo in cui premi un pulsante è il debugging più veloce che esista :memes:.

## Come la userai (Piccola anteprima)

Una volta impostati i file della mod nella guida **[La tua prima mod](#/nml/your-first-mod)**, puoi aggiungere log in tempo reale per testare gli eventi di gioco:

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;

    // Tasto sinistro del mouse, una volta per clic
    if (Input.GetMouseButtonDown(0))
    {
        LogInfo("click!");
    }
}
```

Ogni clic stamperà una riga nella console non appena avviene. Questo ciclo di feedback istantaneo è il motivo per cui BepInEx è fondamentale!
