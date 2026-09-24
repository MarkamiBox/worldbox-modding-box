---
title: Aggiornare dopo un update del gioco
group: NML Modding
subgroup: Funzionalità avanzate e rilascio
icon: :wbsettingsgear:
order: 47
---

# Aggiornare dopo un update del gioco :wbsettingsgear:

WorldBox si è aggiornato, e la tua mod è rossa nella lista. Benvenuto nel modding, succede a tutti e succederà ancora :PES2_Shrug:.

La tua mod chiama il codice del gioco stesso. Quando gli sviluppatori rinominano un metodo, spostano un campo o cambiano cosa riceve un metodo, il tuo codice punta a qualcosa che non c'è più. Non è rotto per sempre, è solo vecchio. Questa pagina è l'ordine in cui controllo tutto, ogni volta.

## 1. Aggiorna prima NML

Prima di toccare il tuo codice, prendi il **`NeoModLoader.dll`** più recente dalla pagina **[Installare NML](#/install-nml)**. Un update grosso del gioco di solito porta anche un NML nuovo, e un loader vecchio su un gioco nuovo si rompe in modi che sembrano proprio colpa tua.

Se NML stesso non si carica, non sei ancora arrivato alla tua mod. Guarda **[il gioco è su una versione vecchia](#/troubleshooting)** nella risoluzione dei problemi, poi torna qui.

## 2. Leggi il primo errore

Avvia il gioco, poi apri `Player.log` (dove si trova: **[Log e debug](#/nml/logs-and-debugging)**). Trova il primo errore della tua mod e per ora ignora tutto quello che c'è sotto. Gli errori si trascinano a catena, e sistemare il primo spesso ne fa sparire altri cinque.

Dopo un update vedrai soprattutto questi:

| Errore | Cosa è cambiato nel gioco |
| --- | --- |
| `CS0117: 'X' does not contain a definition for 'Y'` | Un campo o un metodo statico è stato rinominato o rimosso |
| `CS1061: 'X' does not contain a definition for 'Y'` | Uguale, ma su un oggetto: `actor.someMethod()` non esiste più |
| `CS0246: The type or namespace name 'X' could not be found` | Un'intera classe è stata rinominata o spostata |
| `CS7036` / `CS1501` | Il metodo esiste ancora, ma adesso prende argomenti diversi |
| `CS0122: 'X' is inaccessible due to its protection level` | Qualcosa che usavi è diventato `internal`, vedi **[quella voce](#/troubleshooting)** |
| `CS0029` / `CS0266` | Un campo ha cambiato tipo, per esempio da `int` a `float`, o da una stringa a un asset |
| `HarmonyException` / `MissingMethodException` all'avvio | Un metodo che **patchi** è stato rinominato. Il tuo codice compila, la patch non ha niente a cui attaccarsi |

L'ultimo è quello subdolo. Una patch che scrive il nome del metodo come semplice stringa, tipo `"updateStats"`, viene controllata solo all'avvio del gioco. Quindi un cambio di nome non impedisce alla mod di compilare, le impedisce di funzionare. Le patch scritte con `nameof` danno invece un normale errore di compilazione, un motivo in più per usarlo quando puoi (**[due modi per scrivere il nome del metodo](#/nml/harmony-patches)**).

## 3. Trova il nome nuovo

Il nome vecchio non c'è più, quindi cerca il suo sostituto:

- **[Ricerca metodi](#/tools/methods)** su questo sito. Scrivi cosa *faceva* il metodo, non come si chiamava: "add trait to unit" lo trova anche se il nome è cambiato.
- **[Campi degli asset](#/tools/fields)** per i campi degli asset. Cerca la parte del nome che ti ricordi.
- **dnSpy**, che ha sempre ragione, perché legge il gioco che hai davvero. Gli strumenti di ricerca qui vengono rigenerati dopo gli update, ma possono restare indietro di qualche giorno su uno appena uscito. Come usarlo: **[Leggere il codice del gioco](#/toolbox/reading-the-game-code)**.

Il trucco che uso di più: apri l'asset o il metodo vanilla che fa lo stesso lavoro del tuo e guarda come lo scrive **il gioco stesso** adesso. Se il gioco ha cambiato il modo di creare i tratti, i suoi tratti usano già il modo nuovo :PESgn_Noice:.

## 4. Controlla le patch di Harmony a mano

Una patch può anche andare storta senza nessun errore. Passale una per una e controlla il metodo in dnSpy:

- **Nomi dei parametri.** Harmony riempie i parametri **per nome**. Se il gioco ha rinominato `pDamage` in `pAmount`, il tuo `float pDamage` non riceve niente, in silenzio. Vedi **[i nomi di parametro magici](#/nml/harmony-patches)**.
- **Overload.** Un metodo che prima era unico adesso può avere un gemello, e la tua patch fallisce con `Ambiguous match found`.
- **Cosa fa il metodo.** A volte il nome resta ma la logica si sposta da un'altra parte. La patch gira e non cambia niente. Metti una riga `LogInfo` nella patch: se non compare mai, il gioco non chiama più quel metodo.

## 5. Cerca le cose che hanno smesso di fare qualcosa

Tornare a compilare non è il traguardo. Carica un mondo e controlla che ogni pezzo funzioni ancora: il tratto mostra la sua icona, l'oggetto cade, il potere fa apparire quello che deve.

Un update nuovo può aggiungere un campo che gli asset vanilla adesso riempiono e i tuoi no. L'asset si carica, nessun errore, e semplicemente non fa niente. Confronta il tuo asset campo per campo con quello vanilla più simile nell'`init()` della sua libreria. Quello che il gioco adesso imposta e tu no è il tuo sospettato.

## 6. Prova anche un salvataggio vecchio

Carica un mondo salvato **prima** dell'update, con la mod attiva. I dati tuoi salvati sulle unità (**[Salvare i dati](#/nml/saving-data)**) dovrebbero tornare com'erano. Se hai rinominato un id mentre sistemavi le cose, i salvataggi vecchi usano ancora quello vecchio, quindi rinomina solo se serve davvero.

## 7. Pubblicala

- Aumenta `version` in `mod.json`.
- Scrivi con quale versione del gioco funziona nella descrizione e nel changelog, così i giocatori sanno quale prendere.
- Carica lo zip nuovo come la volta prima: **[Pubblicare](#/nml/publishing)**.

Poi rispondi ai commenti "è aggiornata??", te lo sei guadagnato :wbsalut:.

## Per far male di meno al prossimo update

- **Patcha di meno.** Ogni patch di Harmony è un punto che si può rompere. Se un campo di un asset o una funzione di NML può fare il lavoro, usa quello.
- **Metti il codice dentro try/catch.** Una funzione rotta scrive un errore nel log, il resto della mod continua a funzionare. Vedi **[Log e debug](#/nml/logs-and-debugging)**.
- **Una classe di patch per compito.** Quando una patch si rompe, cade solo quella funzione, non tutte.
- **Tieni gli id in un posto solo.** Costanti come `HelloTraits.SWIFT` vogliono dire che rinominare è una modifica, non venti.
