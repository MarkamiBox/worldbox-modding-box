---
title: Generatore di contenuti
group: Modding Tools
icon: :wbhammer:
order: 405
---

# Generatore di contenuti :wbhammer:

Scegli cosa vuoi creare, riempi le caselle e ottieni tutto: il file di codice, il testo per il tuo file `Locales` e dove mettere esattamente la grafica. Scrive lo stesso codice che insegnano le pagine della guida, compresi i passaggi che tutti dimenticano, come i pool, i campi del post-init e le chiavi di testo che non corrispondono all'id.

::tool:builder::

## Come usare quello che ti dà

1. **Il codice** va nella cartella `Code/` della tua mod, in un file con il nome scritto sopra il blocco.
2. **Il testo** va in `Locales/<lingua>.json`. Se hai già quel file, copia solo le righe dentro le `{ }`, e occhio alle virgole.
3. **La grafica** va esattamente dove dice la lista. Leggi la parola accanto a ognuna: **cartella** vuol dire una cartella di PNG, anche se hai un solo frame. Un PNG singolo dove serve una cartella è il motivo numero uno per cui la grafica non si vede :wbfacepalm:.
4. **La riga di Main.cs** va dentro `OnModLoad()`. L'ordine conta: un tratto che sta nella tua scheda ha bisogno prima della scheda, un oggetto che costa una tua risorsa ha bisogno prima della risorsa.

Avvia il gioco e controlla il log. Se qualcosa non va, il link **Spiegazione completa** sotto il selettore ti porta alla pagina che spiega quel contenuto nel dettaglio.

> [!TIP] Cambia i valori predefiniti
> Ogni id nel generatore inizia con `my_`. Cambialo con qualcosa di tuo, come `hello_` per HelloBox. Due mod che aggiungono entrambe un `my_trait` se lo contendono, e ne vince solo una :PESgn_Stop:.

## Cosa non fa

Il generatore ti dà contenuti che **funzionano**. Quello che non può fare è inventare la tua idea al posto tuo. Dove una funzione ha bisogno della tua logica, come un tratto che fa qualcosa di speciale o un potere che fa qualcosa di nuovo, lascia uno spazio ben segnato `// your code here`. La pagina dietro il link **Spiegazione completa** mostra cosa puoi metterci.
