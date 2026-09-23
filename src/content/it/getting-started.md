---
title: Da dove iniziare
group: Panoramica
icon: :wbsalut:
order: 3
---

# Da dove iniziare :wbsalut:

Tutto quello che ti serve prima di scrivere la tua prima riga di codice. Segui questi passaggi nell'ordine, ci vorranno circa quindici minuti.

> [!NOTE] Non serve saper programmare, per ora
> E **non** ti serve Visual Studio, un compilatore o roba del genere. NML legge i file di testo `.cs` nella cartella della tua mod e li compila al posto tuo a ogni avvio del gioco. **Il Blocco note è uno strumento perfettamente valido per scrivere la tua prima mod** :PES_OkHand:. Potrai passare a strumenti migliori più avanti, quando ne sentirai davvero la mancanza.

## 1. Trova la cartella di WorldBox

In questa guida ti verrà detto di mettere file "nella cartella di WorldBox" circa quaranta volte, quindi trovala bene adesso:

**Steam → clic destro su WorldBox → Gestisci → Sfoglia i file locali.**

Si aprirà Esplora file sulla cartella che contiene `worldbox.exe`. Sulla maggior parte dei PC il percorso è:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Lascia quella finestra aperta, oppure fissala da qualche parte comoda. Ogni volta che questa guida dice *la cartella di WorldBox*, intende proprio quella :gatoxd:.

## 2. Attiva la Modalità Sperimentale

Senza di questa le mod non si caricano. Non è che "funzionano male". Non si caricano proprio: nessun errore, il nulla assoluto.

Nel gioco: apri **Impostazioni**, cerca **Modalità Sperimentale**, attivala. Dopo ogni aggiornamento del gioco, ricontrollala: il gioco la disattiva automaticamente al cambio di versione.

## 3. Installa NeoModLoader

**NML** è ciò che trova la tua mod, la compila e la esegue. Senza NML non esiste modding. Non l'hai mai fatto prima? **[Installare NML](#/install-nml)** descrive ogni singolo clic, Mac incluso.

1. Scarica l'ultima versione di `NeoModLoader.dll` dalla [pagina delle release di NML](https://github.com/WorldBoxOpenMods/ModLoader/releases). Un singolo file, basta quello.
2. Nella cartella di WorldBox, entra in `worldbox_Data\StreamingAssets\Mods/`.
3. Incolla lì dentro `NeoModLoader.dll`.

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            └── NeoModLoader.dll   <- qui
```

Avvia il gioco. Se ha funzionato, vedrai un nuovo pulsante con il logo NML tra le schede in basso, e una cartella `Mods` vuota accanto a `worldbox.exe`. Se non c'è, ricontrolla il passaggio 2 :PES5_Hmmmm:.

> [!TIP] Lascia che Steam lo tenga aggiornato
> C'è anche una [voce per NML nel Workshop di Steam](https://steamcommunity.com/sharedfiles/filedetails/?id=3080294469). Iscriversi non installa NML da solo, ma mantiene aggiornata la tua copia dopo aver fatto l'installazione manuale descritta sopra.

## 4. Un editor di testo

| | |
| --- | --- |
| **Blocco note** | Già sul tuo PC. Davvero sufficiente per la tua prima mod |
| **[VS Code](https://code.visualstudio.com/)** | Gratuito, leggero, colora il codice, ti segnala i refusi. La scelta perfetta per la maggior parte delle persone |
| **Visual Studio** | Quello pesante. Autocompleta i metodi del gioco se lo colleghi alla `.dll` di WorldBox. Esagerato finché non scrivi una gran quantità di codice |

Qualunque cosa tu scelga: quando salvi un file `.cs`, assicurati che sia salvato come `.cs` e **non** come `.cs.txt`. Il Blocco note ama fare brutti scherzi :PESgn_SMH:.

## 5. Tutto qui, vai a creare qualcosa

Vai a **[Struttura di una mod](#/nml/mod-structure)** nella sezione NML Modding, poi a **[La tua prima mod](#/nml/your-first-mod)** :gatoxd: !

---

## Cose da installare dopo, non adesso

Queste cose **non** ti servono per scrivere una mod. Torna qui quando una pagina te lo dirà esplicitamente.

- **[La console dal vivo (BepInEx)](#/toolbox/bepinex-console)**: una finestra nera che stampa i log mentre giochi, invece di farti aprire un file di log dopo ogni test. Installala abbastanza presto, fa risparmiare un sacco di tempo.
- **[UnityExplorer](#/toolbox/unity-explorer)**: fai clic su qualsiasi cosa nel gioco per vedere com'è fatta dentro.
- **[dnSpy o ILSpy](#/toolbox/reading-the-game-code)**: apre il codice originale del gioco così puoi leggere come gli sviluppatori hanno fatto qualcosa.
- **[AssetRipper](#/toolbox/getting-the-sprites)**: estrae sprite e suoni del gioco per permetterti di adattare il tuo stile grafico.

> [!WARNING] NCMS è deprecato :sadcat:
> NCMS non riceve più aggiornamenti. Ogni guida qui fa riferimento a NML. Tecnicamente puoi ancora scrivere una mod per NCMS, ma ormai non lo fa più nessuno :PES2_Shrug:.
