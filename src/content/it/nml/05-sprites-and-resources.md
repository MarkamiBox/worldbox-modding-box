---
title: Sprite e risorse
group: NML Modding
subgroup: Flusso di sviluppo base
icon: :wbfanartist:
order: 28
---

# Sprite e risorse :wbfanartist:

Il tuo tratto ha un nome, statistiche e una splendida descrizione. Ma ha anche un grosso e orribile punto interrogativo come icona. È ora di rimediare.

## Usare un'icona già presente nel gioco

La soluzione più veloce, e quella che userai più spesso: puntare direttamente al percorso di uno sprite vanilla.

```csharp
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
Sprite[] frames = SpriteTextureLoader.getSpriteList("effects/projectiles/arrow");
```

`getSprite` equivale a `Resources.Load` con cache, mentre `getSpriteList` corrisponde a `Resources.LoadAll` con cache. I percorsi non includono l'estensione del file: è sempre `ui/Icons/iconFly`, mai `ui/Icons/iconFly.png`.

La maggior parte dei campi negli asset richiede il **percorso come stringa** piuttosto che l'oggetto Sprite già caricato:

```csharp
trait.path_icon = "ui/Icons/iconHelloSwift";
power.path_icon = "ui/Icons/iconHelloStrike";
```

> [!TIP] Come faccio a sapere quali percorsi esistono?
> Usa la **[Ricerca icone](#/tools/icons)** su questo sito. Contiene tutti i percorsi sprite del gioco e comprende ricerche in linguaggio naturale: digitare "death king" o "lightning bolt" ti restituirà il percorso esatto da copiare. In alternativa, apri **[UnityExplorer](#/toolbox/unity-explorer)** in gioco e leggi il valore `path_icon` dell'asset vanilla che assomiglia a ciò che vuoi creare :aPES_Magnifying:.

## Aggiungere la tua grafica personalizzata

Crea una cartella chiamata **`GameResources/`** all'interno della tua mod. NML la gestisce esattamente come la cartella `Resources` interna di Unity. Di conseguenza, un file salvato in:

```text
HelloBox/GameResources/ui/Icons/iconHelloSwift.png
```

verrà caricato come `ui/Icons/iconHelloSwift` e funzionerà ovunque sia valido un percorso vanilla. I formati `.png`, `.jpg` e `.jpeg` vengono riconosciuti in automatico.

### sprites.json

Accanto alle tue immagini, un file `sprites.json` spiega a NML come ritagliare e gestire le texture. Senza di esso vengono applicati i valori predefiniti di Unity, che per la pixel art sono quasi sempre inadatti. (Non è sempre strettamente necessario :PESgn_Maybe: )

```json GameResources/ui/Icons/sprites.json
{
  "Default": {
    "PixelsPerUnit": 1,
    "PivotX": 0.5,
    "PivotY": 0.5
  },
  "Specific": [
    {
      "Path": "iconHelloSwift.png",
      "PivotX": 0.5,
      "PivotY": 0.0
    }
  ]
}
```

| Campo | Cosa fa |
| --- | --- |
| `PixelsPerUnit` | Lascialo a `1`, a meno che tu non abbia un motivo ben preciso per cambiarlo |
| `PivotX` / `PivotY` | Il punto di ancoraggio. `0.5 / 0.0` corrisponde a in basso al centro, necessario per unità ed edifici |
| `BorderL/R/T/B` | Bordi per il 9-slice, per finestre e pulsanti ridimensionabili |
| `Path` | Il file specifico a cui applicare questa configurazione |

`Default` si applica a qualsiasi file nella cartella che non abbia una voce in `Specific`.

## Dove va posizionato ciascun tipo di grafica

Questa è la tabella di riferimento su cui tutti tornano regolarmente. Ogni asset punta alla propria grafica con un campo differente, e alcuni di essi aggiungono silenziosamente una sottocartella prima del caricamento. Il valore che scrivi **non** è sempre il percorso su disco.

| Asset | Campo | Dove salvare il file |
| --- | --- | --- |
| Tratto, potere divino, regno, gruppo | `path_icon` | `GameResources/` + esattamente ciò che hai scritto |
| Oggetto, impugnato in mano | `path_gameplay_sprite` | `GameResources/` + esattamente ciò che hai scritto |
| Edificio | `sprite_path` | Una **cartella**: `GameResources/` + `sprite_path` + `/`, con dentro `main_0.png`, `construction_0.png`, `ruin_0.png`. Con `sprite_path` vuoto è `main_path` + id, e `main_path` di default è `buildings/` |
| Drop (bottino) | `path_texture` | Una **cartella**: `GameResources/` + esattamente ciò che hai scritto |
| Nuvola | `path_sprites` | `GameResources/` + ciascun percorso presente nella lista |
| Effetto di stato | `texture` | Una **cartella**: `GameResources/effects/` + ciò che hai scritto |
| Proiettile | `texture` | Una **cartella**: `GameResources/effects/projectiles/` + ciò che hai scritto |
| Risorsa, trasportata in mano | `path_gameplay_sprite` | Una **cartella**: `GameResources/items/resources/` + ciò che hai scritto |
| Risorsa, icona inventario | `path_icon` | `GameResources/` + ciò che hai scritto (il gioco usa nomi semplici come `iconResBread`) |
| Tile di terreno & Top Tile | *(nessun campo)* | `GameResources/tiles/<id_della_tile>/` |

> [!WARNING] "Una cartella" non è una questione di stile
> Ogni asset segnato come **cartella** qui sopra viene letto con `getSpriteList()`, che restituisce i frame *dentro* una cartella. Puntalo a un PNG singolo e torna vuoto: un drop cade invisibile, un proiettile lancia `ArgumentOutOfRangeException` in `QuantumSpriteLibrary.drawProjectiles()`, uno status lancia a ogni frame. Un frame solo va benissimo, deve solo stare nella sua cartella: `drops/hello_ember/hello_ember_0.png` :wbfacepalm:.

Tre particolarità da tenere bene a mente:

- **Stati e proiettili antepongono una cartella.** Scrivere `texture = "effects/status/myThing"` farà cercare il file in `effects/effects/status/myThing`, che non esiste. Gli stati vanilla usano nomi semplici: `fx_status_burning_t`.
- **Le tile ignorano completamente questi campi.** La grafica di una tile viene cercata in base al suo **ID** in una cartella dedicata, poiché una tile ha diverse varianti. `hello_moss` richiede la cartella `GameResources/tiles/hello_moss/` con i PNG al suo interno.
- **Gli edifici non incollano, ma hanno un ripiego.** `sprite_path` viene usato esattamente com'è: `"buildings/hello_shrine"` significa `GameResources/buildings/hello_shrine/`. Se lo lasci vuoto il gioco usa `main_path` + id, quindi una cartella scritta in `main_path` diventa `buildings/hello_shrine/hello_shrine` :PESgn_Bruh:.

> [!TIP] Copia il percorso da un asset vanilla
> Scegli l'elemento vanilla più simile, leggi il suo campo su **[UnityExplorer](#/toolbox/unity-explorer)** o con la **[Ricerca icone](#/tools/icons)** e imitane la struttura. È il modo più rapido e sicuro per non sbagliare :PESgn_Noice:.

## Leggere un file direttamente dal disco

A volte vorrai accedere al file immagine puro: una cornice da ritagliare a mano con 9-slice, un file di dati o altro. `ModDeclare` conosce la cartella in cui si trova la tua mod; non scrivere mai percorsi assoluti fissi nel codice.

```csharp
string path = System.IO.Path.Combine(GetDeclaration().FolderPath, "GameResources", "ui", "frame.png");

Texture2D texture = new Texture2D(2, 2, TextureFormat.RGBA32, false);
texture.filterMode = FilterMode.Point;      // pixel art, nessun filtro sfocato
texture.LoadImage(System.IO.File.ReadAllBytes(path));
```

`NeoModLoader.utils.SpriteLoadUtils` mette a disposizione anche `LoadSingleSprite(path)` e `LoadSprites(path)` se preferisci non scrivere tutto a mano.

## Suoni

Ogni suono in WorldBox è un evento FMOD, riprodotto tramite percorso. Puoi riprodurre liberamente ciascuno di essi:

```csharp
MusicBox.playSound("event:/SFX/WEAPONS/WeaponFireballStart", pTile);   // at a place in the world
MusicBox.playSoundUI("event:/SFX/UI/WindowWhoosh");                     // on the interface
```

Il primo viene riprodotto a partire da quella casella del mondo. HelloBox riproduce il suono della palla di fuoco quando la sua azione di combattimento lancia un tizzone, vedi **[Proiettili, incantesimi ed effetti](#/nml/projectiles-spells)**. Per trovare i percorsi, cerca `event:/SFX/` nel codice del gioco: ce ne sono a centinaia, suddivisi in cartelle tematiche. Abbassa il volume prima di iniziare a provarli.

### Aggiungere i propri suoni

NML in realtà patcha FMOD dietro le quinte, quindi i tuoi file `.wav` funzionano senza che tu debba costruire un secondo motore audio in garage :PESgn_Noice:.

Metti il tuo file `.wav` direttamente in `GameResources/`, ad esempio:

```text
GameResources/sounds/hello_boom.wav
```

NML intercetta `MusicBox.playSound` e `playDrawingSound`, quindi lo riproduci con esattamente lo stesso metodo di un suono vanilla (senza l'estensione del file):

```csharp
MusicBox.playSound("sounds/hello_boom", pTile);
```

Accanto al file, un `hello_boom.json` opzionale ti permette di configurarne il comportamento:

```json GameResources/sounds/hello_boom.json
{
  "Volume": 60,
  "Mode": "Stereo3D",
  "Type": "Sound"
}
```

| Campo | Valori |
| --- | --- |
| `Mode` | `Basic` (2D piatto, il volume resta costante), `Stereo3D` (attenuazione vanilla con la distanza), `Mono3D` (direzionale) |
| `Type` | `Sound` (cursore effetti), `Music` (cursore musica), `UI` (cursore interfaccia) |
| `Volume` | Volume predefinito da 0 a 100 |
| `LoopCount` | Numero di ripetizioni (0 = una volta) |

La parte migliore: siccome NML li collega ai gruppi di canali del gioco, i tuoi suoni rispettano davvero le impostazioni del volume del giocatore invece di assordarlo a mezzanotte.

## Non passare mai uno sprite nullo al gioco

Un pulsante con uno sprite mancante non è un pulsante con un punto interrogativo: diventa un **buco invisibile** nell'interfaccia che il giocatore non troverà mai. Prevedi sempre un fallback:

```csharp
private static Sprite Icon(string pName)
{
    Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
    if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
    return sprite;
}
```

Un'icona di avviso ti fa capire subito: "il percorso è sbagliato". Il nulla assoluto ti condanna a passare due ore a chiederti dove sia finito il tuo pulsante :PES4_Invisible:.
