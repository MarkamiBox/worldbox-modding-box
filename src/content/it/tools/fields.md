---
title: Navigatore campi asset
group: Modding Tools
icon: :wbwise:
order: 430
---

# Navigatore campi asset :wbwise:

Ogni asset che puoi creare possiede un insieme fisso di campi: un campo che non esiste produce un errore di compilazione o, peggio, una riga che non fa silenziosamente nulla. Questo è l'elenco reale, estratto direttamente dal gioco decompilato.

Scegli il tipo di asset, filtra e clicca su un nome per copiarlo.

::tool:fields::

## Come leggerlo

- **La colonna di sinistra** è il tipo. `int` significa un numero intero, quindi `rate_birth = 0.5f` non compila. `float` accetta un decimale e vuole il suffisso `f`, come `0.5f`. `string` accetta testo tra virgolette.
- **Il `= value`** è il valore predefinito che il gioco dà già a quel campo. Se il predefinito ti va bene, non impostarlo. Meno codice, meno refusi.
- **"inherited from"** significa che il campo arriva da una classe genitore. Funziona esattamente allo stesso modo; è solo dichiarato più in alto. `id`, `base_stats` e `path_icon` di solito sono ereditati.
- **La catena sopra la tabella** (es. `ActorTrait -> BaseTrait -> BaseAugmentationAsset -> Asset`) indica da dove vengono i campi, dal più specifico in giù.

> [!WARNING] I campi non sono tutta la storia
> Questo strumento ti dice che un campo **esiste** e di che tipo è. Non ti dice se il gioco lo legge davvero nel tuo caso: alcuni campi contano solo per le unità civilizzate, o solo quando un altro flag è attivo. Nel dubbio, trova un asset vanilla che fa quello che vuoi e copia i suoi valori, vedi **[Leggere il codice del gioco](#/toolbox/reading-the-game-code)**.
