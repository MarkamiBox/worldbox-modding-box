---
title: Leggi del mondo
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbworldlaws:
order: 176
---

# Leggi del mondo :wbworldlaws:

Le leggi del mondo sono gli interruttori nella finestra **Leggi del mondo**: "vecchiaia", "fame", "mostri pacifici". Sono la cosa più comoda in assoluto per i giocatori, perché permettono loro di attivare e disattivare il comportamento della tua mod senza toccare alcun file di configurazione.

Sono anche uno degli asset più facili dell'intero gioco. Quattro campi.

## Aggiungere un interruttore

```csharp Mods/HelloBox/Code/HelloLaws.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloLaws
    {
        public const string CHAOS = "world_law_hello_chaos";

        public static void Initialize()
        {
            AssetManager.world_laws_library.add(new WorldLawAsset
            {
                id = CHAOS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "units",                                  // in quale scheda appare
                icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
                default_state = false                                // inizia disattivata
            });
        }
    }
}
```

Aggiungi `HelloLaws.Initialize();` a `Main.cs` e l'interruttore è nel gioco. È sinceramente tutto qui :poggers:.

| Campo | Significato |
| --- | --- |
| `id` | Il nome della tua legge. Anche la chiave di traduzione |
| `group_id` | La scheda in cui finisce: `units`, `civilizations`, `spawn`, `diplomacy`, `nature`, … |
| `icon_path` | L'icona, stesse regole di percorso di tutto il resto |
| `default_state` | `true` = attiva per i nuovi mondi, `false` = spenta |
| `can_turn_off` | Di default a `true`. Imposta `false` per una legge che può solo essere attivata |

## Leggere l'interruttore nel tuo codice

Questo è il punto cruciale. Un interruttore che nessuno legge è una decorazione. Ovunque nella tua mod:

```csharp
WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);

if (law != null && law.isEnabled())
{
    // il giocatore vuole il caos, dagli il caos
}
```

Un esempio pratico: generare le tue braci solo finché la legge è attiva:

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
    bool chaos = law != null && law.isEnabled();

    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

    if (chaos)
    {
        foreach (WorldTile neighbour in pTile.neighboursAll)
        {
            World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
        }
    }
    return true;
};
```

## Reagire nel momento in cui viene attivato

Se attivare la legge dovesse *fare* subito qualcosa, invece di essere solo letta più tardi:

```csharp
new WorldLawAsset
{
    id = CHAOS,
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
    default_state = false,
    on_state_enabled = (PlayerOptionData pOption) => { /* viene eseguito quando il giocatore la attiva */ }
};
```

## I testi

```json Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one."
}
```

> [!WARNING] Le leggi del mondo usano _title, non l'id semplice
> Quasi ogni altro asset usa il suo semplice id come chiave del nome. Le leggi del mondo richiedono `<id>_title`. Sbaglia e l'interruttore apparirà completamente privo di etichetta :PESgn_Really:.

> [!TIP] Una legge batte un'impostazione
> Le impostazioni della mod vivono in un menu che il giocatore apre una volta. Una legge del mondo si trova proprio lì nel gioco, accanto a quelle vanilla, per mondo, e può essere attivata a metà partita. Se la tua mod ha un comportamento acceso/spento, questo è il posto giusto :wbblessed:.
