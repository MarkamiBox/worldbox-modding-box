---
title: Pubblicare il tuo mod
group: NML Modding
subgroup: Funzionalità avanzate e rilascio
icon: :wbfireworks:
order: 46
---

# Pubblicare il tuo mod :wbfireworks:

Il tuo mod funziona. Ora lascia che siano gli altri a romperlo.

Ci sono due posti in cui un mod di WorldBox può vivere, e non sono usati allo stesso modo:

| | |
| --- | --- |
| **[GameBanana](https://gamebanana.com/games/11196)** | Dove si trova davvero la scena modding di WorldBox. Chiunque può scaricare da lì, inclusi i giocatori che hanno comprato il gioco altrove rispetto a Steam |
| **Steam Workshop** | Integrato in NML, ma con molti meno mod |

Pubblica su GameBanana. Fai un mirror sul Workshop dopo, se ne hai voglia.

## Pacchettizzare la mod

Un caricamento su GameBanana è un **zip della cartella del tuo mod**, niente di più. La cartella dentro lo zip deve essere quella con `mod.json` al suo interno:

```text HelloBox.zip
HelloBox/
├── mod.json
├── icon.png
├── default_config.json
├── Locales/
├── GameResources/
└── Code/
```

Non uno zip del *contenuto*. Uno zip della *cartella*. Qualcuno che estrae nella propria directory `Mods/` dovrebbe ritrovarsi con `Mods/HelloBox/mod.json`. Se si ritrova con `Mods/mod.json`, scriverà che il tuo mod non si carica :PES_Facepalm:.

**Lascia fuori** tutto ciò che non serve per l'esecuzione: `.git/`, `bin/`, `obj/`, `.vs/`, il tuo `.sln`, i tuoi appunti. Se distribuisci una `.dll` precompilata, distribuiscila *al posto di* `Code/`, non accanto a una copia stantia del sorgente.

## Caricare su GameBanana

1. Crea un account, poi vai sulla **[pagina del gioco WorldBox](https://gamebanana.com/games/11196)**.
2. **Add → Mod**.
3. Compila nome, descrizione e categoria. La categoria conta più di quanto credi: è il modo in cui le persone ti trovano.
4. Carica lo zip e carica almeno uno screenshot **del mod che fa qualcosa nel gioco**. Non la tua icona, non l'elenco dei mod.
5. Nella descrizione, spiega chiaramente: cosa aggiunge, che richiede **NeoModLoader** e qualsiasi mod con cui entra in conflitto.

Aggiornare in seguito si fa sulla stessa pagina con **Edit → Files**. Aggiungi il nuovo zip, scrivi una riga di changelog e incrementa la `version` in `mod.json` per farla corrispondere. Mantenere sincronizzata la versione di GameBanana e quella di `mod.json` non costa nulla ed evita ogni dubbio su quale versione si abbia installata.

> [!TIP] Uno screenshot vale più di un paragrafo
> Le persone decidono dall'anteprima. Una singola schermata chiara in gioco della novità aggiunta dal tuo mod farà per te molto più della migliore descrizione del sito :PES_Camera:.

## La strada dello Steam Workshop

Il caricamento sul Workshop avviene **all'interno del gioco**, e il modo in cui apri la finestra di upload è la parte di interfaccia più maledetta di questo hobby :kekw:.

1. Apri la finestra **Mods** nel gioco.
2. Clicca sull'**icona** del tuo mod esattamente **otto volte**, con meno di un secondo tra un clic e l'altro.
3. Aspetta circa tre secondi.
4. Appare la finestra di caricamento.

Se non succede nulla hai cliccato troppo lentamente, o hai cliccato sulla riga invece che sull'icona.

La nuova finestra dell'elenco mod di NML mette anche pulsanti rapidi sulle mod selezionate (per aprire la cartella su disco, attivarla/disattivarla o ricaricare il codice), ma il rito segreto degli otto clic sull'icona resta il modo per invocare l'uploader di Steam :PES2_Shrug:.

| Campo | Cosa inserire |
| --- | --- |
| Campo superiore (`fileID`) | **Lascia vuoto** la prima volta. Per gli aggiornamenti, incolla l'id dall'URL del tuo oggetto del workshop |
| Campo inferiore | Il changelog. Può essere vuoto, modificabile sulla pagina del workshop in seguito |

Questa è tutta la differenza tra pubblicare e aggiornare: un `fileID` vuoto crea un nuovo oggetto, uno compilato sostituisce quello esistente.

### Autenticazione, la prima volta

Caricare un nuovo mod sul Workshop richiede un'autenticazione. Ci sono tre modi:

- **Discord**: ottieni il ruolo `Modder` sul Discord ufficiale di WorldBox chiedendo a un admin.
- **GitHub**: unisciti all'organizzazione `WorldBoxOpenMods`. Invia loro un'email con oggetto "WorldBoxOpenMods", il tuo username GitHub e il tuo mod, e aspetta fino a una settimana.
- **Salta**: il tuo mod viene caricato con il tag `Unverified Mods`. Funziona, è solo meno visibile.

## Prima di premere carica, su qualunque piattaforma

- **`mod.json` è la tua vetrina.** `name`, `author`, `version`, `description` sono ciò che la gente legge. Incrementa la `version` a ogni rilascio e **non cambiare mai il tuo `GUID`** dopo il primo caricamento: è l'identità del tuo mod, il file delle impostazioni del giocatore prende il nome da esso e altri mod potrebbero dipenderne.
- **`icon.png` esiste e ha un senso.** Sul Workshop è anche la cosa su cui bisogna cliccare otto volte, quindi rendila almeno piacevole.
- **Il tuo mod deve funzionare in qualsiasi cartella.** Non scrivere mai percorsi fissi come `C:\Users\TuoNome\...`. Usa `GetDeclaration().FolderPath`. Questo è il motivo principale per cui un mod funziona per il suo autore e per nessun altro :PES2_Bruh:.
- **Leggi il tuo log a mente lucida almeno una volta.** Avvia il gioco, carica un mondo, gioca due minuti, cerca in `Player.log` il tuo prefisso e cerca `Exception`. Rilascia con zero eccezioni.
- **Testa eliminando il file delle impostazioni.** Cancella `mods_config/<GUID>.config` in modo da testare i valori predefiniti che riceve effettivamente un nuovo giocatore.
- **Testa con altri mod attivi.** Se patchi qualcosa, probabilmente qualcun altro sta patchando la stessa cosa.
- **Testa su un salvataggio pulito.** Gli asset che registri devono esistere prima che venga caricato un salvataggio che li referenzia.

## Dependencies

Se il tuo mod ha bisogno di un altro, dichiaralo invece di crashare per un tipo mancante:

```json mod.json
{
  "Dependencies": ["com.otherperson.coolmod"],
  "OptionalDependencies": ["com.someone.niceextra"],
  "IncompatibleWith": ["com.someone.rivalmod"]
}
```

NML gestisce l'ordine di caricamento e avverte il giocatore, il che è infinitamente più educato di una NullReferenceException alla prima riga.

## Dopo il rilascio

I commenti conterranno esattamente tre tipi di messaggi: "non funziona" senza alcun log allegato, un'idea davvero fantastica a cui non avevi pensato e qualcuno che chiede il multiplayer :PESgn_DidIAsk:.

Rispondi al secondo. Per il primo, fissa in alto un messaggio che spieghi dove trovare `Player.log` (vedi **[Log e debug](#/nml/logs-and-debugging)**), perché una segnalazione di bug senza log è una segnalazione su cui non puoi fare nulla.

E benvenuto. Ogni nuova mod rende questa piccola community un po' meno un cimitero, e cinque in una settimana sono l'età d'oro del modding :PES5_CrazyPog:.
