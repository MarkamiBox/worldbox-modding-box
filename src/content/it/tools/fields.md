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

- **Colonna sinistra**: è il tipo di dato. `int` indica un numero intero, quindi `rate_birth = 0.5f` non compilerà. `float` accetta numeri decimali con il suffisso `f`, come `0.5f`. `string` accetta testo tra virgolette.
- **Il `= valore`**: è il valore predefinito già assegnato dal gioco. Se il valore predefinito è quello desiderato, non occorre impostarlo. Meno codice, meno refusi.
- **"inherited from"**: indica che il campo proviene da una classe base padre. Funziona esattamente allo stesso modo, ma è dichiarato più in alto nella gerarchia. `id`, `base_stats` e `path_icon` sono tipicamente ereditati.
- **La catena sopra la tabella**: (es. `ActorTrait -> BaseTrait -> BaseAugmentationAsset -> Asset`) mostra l'albero di ereditarietà, dal tipo più specifico a quello base.

> [!WARNING] I campi non sono tutta la storia
> Questo tool ti dice che un campo **esiste** e qual è il suo tipo. Non garantisce che il gioco lo legga per il tuo caso specifico: alcuni campi hanno effetto solo per unità civilizzate o quando un altro flag è attivo. In caso di dubbio, trova un asset vanilla simile ed esamina i suoi valori, vedi **[Leggere il codice del gioco](#/toolbox/reading-the-game-code)**.
