---
title: Leggi del mondo
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbworldlaws:
order: 176
---

# Leggi del mondo :wbworldlaws:

Le leggi del mondo (world law) sono gli interruttori nella finestra **Leggi del mondo**: "vecchiaia", "fame", "mostri pacifici". Sono la cosa più comoda in assoluto per i giocatori, perché permettono loro di attivare e disattivare il comportamento (behaviour) della tua mod senza toccare alcun file di configurazione.

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
            if (AssetManager.world_laws_library.has(CHAOS)) return;

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
| `group_id` | La scheda in cui finisce. L'elenco completo è sotto **Le schede**, oppure creane una tua |
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

Oppure la via breve, direttamente dal mondo, senza recuperare l'asset:

```csharp
bool chaos = World.world.world_laws.isEnabled(HelloLaws.CHAOS);
```

`isEnabled(string)` restituisce `false` per un id sconosciuto invece di lanciare un'eccezione, quindi un refuso si legge come "spenta" invece che come un crash. Gentile, e anche terribile, perché nulla te lo dice :PES5_Hmmmm:. `World.world.world_laws` è `internal`, quindi questo compila contro l'assembly pubblicizzato con cui NML costruisce la tua mod (vedi la nota in **[Effetti di stato](#/nml/status-effects)**). La via dell'asset sopra funziona ovunque.

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

## Le schede

La finestra è divisa in schede, e `group_id` ne sceglie una. Questi sono tutti i gruppi vanilla, nell'ordine in cui la finestra li disegna:

`harmony` · `diplomacy` · `civilizations` · `units` · `mobs` · `spawn` · `nature` · `trees` · `plants` · `fungi` · `biomes` · `weather` · `disasters` · `other`

### Una scheda tutta tua

Sostituisci l'`Initialize()` del primo esempio con la versione qui sotto, e aggiungi `GROUP` accanto a `CHAOS`.

Un gruppo è un `WorldLawGroupAsset` in `AssetManager.world_law_groups`. È lo stesso piccolo `BaseCategoryAsset` usato dalle schede dei tratti, vedi **[Gruppi di tratti e schede](#/nml/trait-groups)**:

| Campo | Cosa fa |
| --- | --- |
| `id` | Ciò a cui punta il `group_id` di una legge |
| `name` | La **chiave di localizzazione** per il titolo della scheda. Non il titolo stesso |
| `color` | Stringa esadecimale. Colora il titolo della scheda |

```csharp Mods/HelloBox/Code/HelloLaws.cs
public const string GROUP = "hello_laws";

public static void Initialize()
{
    // prima il gruppo: le leggi sotto puntano a lui
    if (!AssetManager.world_law_groups.has(GROUP))
    {
        AssetManager.world_law_groups.add(new WorldLawGroupAsset
        {
            id = GROUP,
            name = "world_laws_tab_" + GROUP,   // la chiave di localizzazione, non il testo
            color = "#FF9A3C"
        });
    }

    if (AssetManager.world_laws_library.has(CHAOS)) return;

    AssetManager.world_laws_library.add(new WorldLawAsset
    {
        id = CHAOS,
        needs_to_be_explored = false,
        group_id = GROUP,
        icon_path = "ui/Icons/worldrules/icon_hello_law",
        default_state = false
    });
}
```

Nessun lavoro sull'UI: la finestra delle Leggi del mondo costruisce una scheda per ogni voce in `world_law_groups.list`, poi mette ogni legge nella scheda che il suo `group_id` indica. Lo fa una volta sola, quando la finestra viene creata per la prima volta, e la tua mod si è già caricata molto prima che il giocatore ci arrivi. La tua scheda finisce in fondo, dopo `other`.

> [!WARNING] Un `group_id` inesistente rompe l'intera finestra
> La finestra cerca la scheda con un semplice indice di dizionario. Una legge che punta a un gruppo che nessuno ha registrato lancia `KeyNotFoundException` mentre la finestra viene costruita, e ogni legge registrata dopo di essa, la tua e quella di altre mod, non arriva mai nella finestra. Registra il gruppo prima delle leggi, e scrivilo allo stesso modo entrambe le volte :PESgn_ToughLuck:.

## I testi

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one.",
  "world_laws_tab_hello_laws": "HelloBox"
}
```

> [!WARNING] Le leggi del mondo usano `_title`, non l'id nudo
> Quasi tutti gli altri asset usano il loro id nudo come chiave del nome. Le leggi del mondo vogliono `<id>_title`. Se sbagli, l'interruttore compare senza nessuna etichetta :PESgn_Really:.

> [!TIP] Una legge batte un'impostazione
> Le impostazioni della mod vivono in un menu che il giocatore apre una volta. Una legge del mondo è lì nel gioco, accanto a quelle vanilla, per ogni mondo, e si può cambiare a partita in corso. Se la tua mod ha un comportamento on/off, il suo posto è qui :wbblessed:.
