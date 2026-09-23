---
title: Gocce & oggetti che cadono
group: Contenuto di gioco
subgroup: Oggetti ed equipaggiamento
icon: :wbloot:
order: 126
---

# Gocce & oggetti che cadono :wbloot:

Una **goccia** (drop) è un piccolo oggetto che cade dal cielo, atterra su una tessera e fa qualcosa: pioggia, sangue, semi, fuoco, acido, monete. Sono il modo più economico dell'intero gioco per far *accadere* qualcosa sulla mappa, e portano in dote la propria animazione e il proprio suono gratis.

## Registrarne una

Le gocce risiedono in `AssetManager.drops`. Ecco una goccia che atterra e dà fuoco alla tessera:

```csharp Mods/HelloBox/Code/HelloDrops.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public static class HelloDrops
    {
        public static void Initialize()
        {
            DropAsset ember = new DropAsset
            {
                id = "hello_ember",
                path_texture = "drops/hello_ember",   // sprite in GameResources/drops/
                type = DropType.DropMagic,
                animated = true,
                animation_speed = 0.03f,
                default_scale = 0.1f,
                falling_speed = 3.2f,
                sound_drop = "event:/SFX/DROPS/DropBlessing"
            };

            // cosa succede nel momento in cui tocca terra
            ember.action_landed = (WorldTile pTile, string pDropID) =>
            {
                if (pTile == null) return;
                World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
            };

            AssetManager.drops.add(ember);
        }
    }
}
```

Poi in `Main.cs`, aggiungi la riga: `HelloDrops.Initialize();`

### Cosa fanno i campi

| Campo | Significato |
| --- | --- |
| `id` | Il nome che usi ovunque altrove |
| `path_texture` | Lo sprite, stesse regole di percorso di tutto il resto |
| `type` | `DropType.DropMagic`, `DropGeneric`, … Decide parte della gestione interna del gioco |
| `animated` + `animation_speed` | Riproduce la lista di sprite come animazione |
| `default_scale` | Quanto è grande. `0.1f` è il solito per gocce piccole |
| `falling_speed` | Quanto velocemente scende |
| `sound_drop` / `sound_launch` | Eventi sonori FMOD |
| `action_landed` | **Quello interessante**: il tuo codice viene eseguito all'atterraggio |
| `action_launch` | Viene eseguito quando viene lanciata |

## Il tuo sprite personale

`path_texture` viene caricato esattamente come scritto, dall'interno di `GameResources/`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── drops/
        └── hello_ember/
            ├── hello_ember_0.png
            └── hello_ember_1.png
```

```csharp
ember.path_texture = "drops/hello_ember";   // a folder
```

I drop vengono caricati come **lista di sprite**: il gioco legge ogni PNG *dentro* quella cartella, ed è questo che fa funzionare `animated`. Anche un drop fermo è una cartella, con un solo frame dentro. Un `drops/hello_ember.png` sciolto torna come lista vuota, e il drop cade invisibile.

## Far cadere le gocce

Due modi, entrambi su `World.world.drop_manager`:

```csharp
// dritto verso il basso su una tessera: (tile, dropId, height, ?, ownerId)
World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);

// lanciata ad arco, come un'esplosione che scaglia detriti
World.world.drop_manager.spawnParabolicDrop(tile, "hello_ember", 0f, 0.1f, 5f, 0.5f, 4f, 0.15f);
```

`spawn` è quello che vuoi il 90% delle volte. Quel `15f` è l'altezza da cui cade: più è alto, più tempo ci vorrà prima che atterri.

## Un uso reale: far piovere braci con il tuo potere divino

Se hai fatto la pagina dei **[Poteri divini](#/nml/god-powers)**, questo è il premio: un potere, un'intera tessera in fiamme.

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    // una al centro, una su ogni tessera vicina
    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);
    foreach (WorldTile neighbour in pTile.neighboursAll)
    {
        World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
    }
    return true;
};
```

> [!TIP] Le gocce sono l'effetto speciale dei pigri
> Prima di scrivere un sistema particellare, chiediti se una goccia con uno sprite e un `action_landed` possa fare al caso tuo. Di solito basta e avanza, in dieci righe, con l'audio incluso :PESgn_Noice:.
