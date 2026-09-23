---
title: Estrarre la grafica del gioco (AssetRipper)
group: Panoramica
subgroup: Strumenti esterni e setup
icon: :wbgeneralartist:
order: 8
---

# Estrarre la grafica del gioco :wbgeneralartist:

Il codice ti dice *cosa* scrivere. **AssetRipper** ti mostra che aspetto ha la grafica e, cosa ancora più importante, **qual è il suo percorso esatto**.

Ogni icona, unità, edificio ed effetto in WorldBox viene caricato tramite una stringa di percorso tipo `ui/Icons/iconFly`. Se sbagli quel percorso, il tuo pulsante diventa un buco invisibile nell'interfaccia. Con AssetRipper smetti di tirare a indovinare.

> [!TIP] Se ti serve solo il percorso, non ti serve niente di tutto questo
> La **[Ricerca icone](#/tools/icons)** su questo sito è stata costruita esattamente a partire da questa esportazione: ogni singolo percorso del gioco, ricercabile comodamente. Estrai il gioco da te solo se vuoi *vedere* la grafica, scegliere le giuste dimensioni o copiare la palette. A questo serve il resto della pagina :PES4_HappyAwesome:.

## Esportare il gioco

1. Scarica [**AssetRipper**](https://github.com/AssetRipper/AssetRipper/releases).
2. Indicalo verso la tua cartella di WorldBox (quella che contiene `worldbox_Data`).
3. Esporta tutto in una cartella a tua scelta. Ci vorrà qualche minuto e un paio di gigabyte :pepehang:.

Ti ritroverai con un progetto Unity. La parte che ti interessa davvero è la cartella esportata `Resources`, che ha la stessa identica struttura di file richiesta dal gioco a runtime.

## Trasformare un file in un percorso

La regola è semplicissima: **il percorso coincide con la posizione all'interno di `Resources`, senza l'estensione del file.**

```text
ExportedProject/Assets/Resources/ui/Icons/iconFly.png
                                 └───────┬────────┘
                                         │
                      SpriteTextureLoader.getSprite("ui/Icons/iconFly")
```

Ecco le cartelle che userai più spesso:

| Cartella | Cosa contiene |
| --- | --- |
| `ui/Icons/` | Tutte le icone piccole dell'interfaccia: tratti, poteri, pulsanti |
| `ui/Icons/worldrules/` | Le icone delle leggi del mondo |
| `actors/` | Le unità e i loro singoli fotogrammi di animazione |
| `buildings/` | Case, alberi, minerali |
| `effects/` | Esplosioni, proiettili, sprite degli effetti di stato |

## Usarla nella tua mod

Cerca un'icona che ti piace nell'esportazione, segnati il suo percorso e usala direttamente, senza copiare alcun file: è già presente dentro il gioco:

```csharp Mods/HelloBox/Code/HelloPowers.cs
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
```

Oppure impostala direttamente come stringa su un asset:

```csharp
trait.path_icon = "ui/Icons/iconFly";
```

## Adattare lo stile per la tua grafica

Se decidi di disegnare da zero i tuoi sprite, apri prima un file vanilla e copia tre cose fondamentali:

- **Le dimensioni.** Le icone dei tratti e dei poteri sono minuscole, di solito tra i 16 e i 32 px. Aprine una e rispetta quella scala.
- **La palette.** WorldBox usa una palette di colori limitata e dalle tonalità morbide. Campiona i colori direttamente da uno sprite esistente e la tua icona non sembrerà un pugno nell'occhio :PES3_BobRoss:.
- **Il pivot.** Unità ed edifici poggiano sul terreno, quindi il loro punto di ancoraggio (pivot) è in basso al centro. È quel valore `PivotY: 0.0` nel tuo file `sprites.json` (vedi **[Sprite e risorse](#/nml/sprites-and-resources)**).

Poi metti il tuo PNG dentro `GameResources/` ricreando la stessa struttura di cartelle, e verrà caricato esattamente come se fosse vanilla:

```text
Mods/HelloBox/GameResources/ui/Icons/iconHello.png   ->   "ui/Icons/iconHello"
```
