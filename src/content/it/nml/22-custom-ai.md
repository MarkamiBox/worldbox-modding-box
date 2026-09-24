---
title: IA e comportamenti personalizzati
group: Contenuto di gioco
subgroup: Attori, edifici e IA
icon: :wbgoldenbrain:
order: 144
---

# IA e comportamenti personalizzati :wbgoldenbrain:

Qui si scende in profondità. Tutto il resto in questa guida aggiunge *oggetti e dati* al gioco. Questa parte aggiunge **decisioni** (decision): cosa farà una creatura subito dopo, di sua spontanea volontà, per sempre, in un mondo condiviso con migliaia di altre. Nessuna pressione :PES_MonkaSweat:.

## Come ragiona il gioco

Tre livelli, dal più grande al più piccolo, più quello che sta al loro fianco. Mi ci è voluto più tempo di quanto mi piaccia ammettere:

| Livello | Cos'è | Libreria (library) |
| --- | --- | --- |
| **Lavoro** (`ActorJob`) | Cosa fa in generale questa creatura: "fare il cittadino", "fare il soldato" | `AssetManager.job_actor` |
| **Attività** (`BehaviourTaskActor`) | Un obiettivo concreto dentro un lavoro: "vai a mangiare", "costruisci quello" | `AssetManager.tasks_actor` |
| **Comportamento** (`BehaviourActionActor`) | Un passo di un'attività, eseguito a ogni tick, che restituisce cosa fare dopo | aggiunto a un'attività |
| **Decisione** (`DecisionAsset`) | Quando iniziare un'attività: le opzioni che una creatura valuta ogni volta che è libera | `AssetManager.decisions_library` |

Un lavoro contiene attività, un'attività contiene comportamenti, e i comportamenti vengono eseguiti in ordine finché uno non dice basta. Le decisioni stanno accanto ai lavori: sono il modo in cui una creatura libera sceglie da sola la sua prossima attività, vedi **[Decisioni](#decisioni-lascia-che-sia-la-creatura-a-scegliere-la-tua-attività)** più sotto.

## Scrivere un comportamento

Un comportamento è una classe con un unico metodo. Riceve l'attore, compie una piccola azione e restituisce un `BehResult`:

```csharp
namespace HelloBox
{
    public class BehHelloDrive : BehaviourActionActor
    {
        public override BehResult execute(Actor pActor)
        {
            if (pActor == null || !pActor.isAlive()) return BehResult.Stop;

            // decide something, write it onto the actor
            WorldTile target = HelloAI.PickTile(pActor);
            if (target == null) return BehResult.Stop;

            pActor.beh_tile_target = target;
            return BehResult.Continue;   // let the next behaviour in the task run
        }
    }
}
```

| Risultato | Significato |
| --- | --- |
| `BehResult.Continue` | Passa al comportamento successivo in questa attività |
| `BehResult.Stop` | Terminato per questo tick |
| `BehResult.RepeatStep` | Eseguimi di nuovo al prossimo tick |
| `BehResult.Skip` | Salta il passo successivo |
| `BehResult.StepBack` | Torna indietro di un passo |
| `BehResult.RestartTask` | Riavvia l'attività dall'inizio |

## Collegare un'attività e un lavoro

```csharp Mods/HelloBox/Code/HelloAI.cs
using ai.behaviours;   // BehaviourTaskActor, BehaviourActionActor, BehResult, the vanilla behaviours

namespace HelloBox
{
    public class BehHelloDrive : BehaviourActionActor
    {
        public override BehResult execute(Actor pActor)
        {
            if (pActor == null || !pActor.isAlive()) return BehResult.Stop;

            WorldTile target = HelloAI.PickTile(pActor);
            if (target == null) return BehResult.Stop;

            pActor.beh_tile_target = target;
            return BehResult.Continue;
        }
    }

    public static class HelloAI
    {
        public const string JOB = "hellobox_job";
        public const string TASK = "hellobox_drive";

        public static void Initialize()
        {
            BehaviourTaskActor drive = new BehaviourTaskActor
            {
                id = TASK,
                ignore_fight_check = true,        // don't let the combat system hijack the task
                locale_key = "task_unit_" + TASK
            };

            AssetManager.tasks_actor.add(drive);  // add first
            drive.setIcon("ui/Icons/iconHelloDrive");    // then decorate
            drive.addBeh(new BehHelloDrive());    // my decision
            drive.addBeh(new BehGoToTileTarget()); // the game's own pathing does the walking

            ActorJob job = new ActorJob { id = JOB };
            job.addTask(TASK);
            AssetManager.job_actor.add(job);
        }

        /** Where the creature should walk next. One random neighbour it can actually reach. */
        public static WorldTile PickTile(Actor pActor)
        {
            WorldTile from = pActor.current_tile;
            if (from == null) return null;

            // the game's own helper: a random neighbour that is not across water
            return from.getTileAroundThisOnSameIsland(from);
        }
    }
}
```

`PickTile` è il senso di tutto l'esercizio: è l'unica parte che il gioco non fa già per te. Tutto il resto in quel file è impianto idraulico.

> [!WARNING] `beh_tile_target` è internal
> Il campo in cui scrive il comportamento è marcato `internal` nell'assembly del gioco, quindi questo compila con un `Assembly-CSharp.dll` **pubblicizzato** (vedi la nota in **[Effetti di stato](#/nml/status-effects)**). Senza, il compilatore rifiuta la riga e devi tenere il bersaglio in un tuo campo :PES5_Noted:.

Nota il secondo comportamento: **riusa i nodi vanilla**. Il gioco ha comportamenti per camminare fino a una casella (tile), aggiungere uno stato, trovare un edificio (building), attaccare un bersaglio. Scrivere la decisione e prendere in prestito l'esecuzione è la differenza tra un weekend e un mese.

## Far usare concretamente il tuo lavoro a una creatura

Non serve alcun patch Harmony. L'IA di ogni attore richiede il lavoro successivo tramite un delegato, quindi ti basta scambiare quel delegato:

```csharp
// prendi il controllo
pActor.ai.next_job_delegate = () => HelloAI.JOB;
pActor.ai.setTaskBehFinished();   // abbandona ciò che stava facendo e richiedi subito

// restituisci il controllo
pActor.ai.next_job_delegate = pActor.getNextJob;
pActor.ai.setTaskBehFinished();
```

> [!WARNING] Il controllo deve essere riconfermato
> Il combattimento (e altri sistemi) azzera il lavoro corrente al suo termine, e la creatura ne chiede uno nuovo. Se il tuo delegato è ancora impostato, riotterrà il tuo. Se un altro codice ha sostituito il delegato, perderai il controllo: verificalo periodicamente invece di darlo per scontato :PES5_Noted:.

## Decisioni: lascia che sia la creatura a scegliere la tua attività

Sostituire il delegato del lavoro è un controllo forzato. La maggior parte delle volte vorrai qualcosa di più naturale: la tua attività come un'ulteriore opzione che la creatura valuta insieme a mangiare, dormire e combattere. Questa è una **decisione (Decision)**, ed è il modo in cui il gioco stesso stabilisce cosa fa un'unità.

Una decisione stabilisce *quando*. L'attività che hai già scritto stabilisce *come*. Quando il cervello sceglie una decisione, avvia l'attività con lo stesso ID o quella specificata in `task_id`.

```csharp Mods/HelloBox/Code/HelloDecisions.cs
namespace HelloBox
{
    public static class HelloDecisions
    {
        public const string WANDER = "hello_decide_wander";

        public static void Initialize()
        {
            if (AssetManager.decisions_library.has(WANDER)) return;

            DecisionAsset wander = new DecisionAsset
            {
                id = WANDER,
                task_id = HelloAI.TASK,                  // the decision says when, the task says how
                priority = NeuroLayer.Layer_1_Low,
                path_icon = "ui/Icons/iconHelloDrive",
                cooldown = 20,                           // seconds before this unit may pick it again
                weight = 1f,
                unique = true,                           // only the actors you give it to, below
                action_check_launch = (Actor pActor) => pActor != null && pActor.isAlive() && !pActor.isFighting()
            };

            AssetManager.decisions_library.add(wander);

            // linkAssets() fills these three for every decision, at startup, before your mod.
            // decision_index is where each unit keeps this decision's cooldown: left at 0, yours
            // would share it with the first vanilla decision.
            wander.decision_index = AssetManager.decisions_library.list.IndexOf(wander);
            wander.priority_int_cached = (int)wander.priority;
            wander.has_weight_custom = wander.weight_calculate_custom != null;

            // who gets it: every wisp, through its actor asset
            ActorAsset wisp = AssetManager.actor_library.get("hello_wisp");
            if (wisp != null) wisp.addDecision(WANDER);
        }
    }
}
```

| Campo | Cosa fa |
| --- | --- |
| `task_id` | L'attività da avviare. Vuoto usa l'attività con l'ID della decisione |
| `priority` | Il livello, da `NeuroLayer.Layer_0_Minimal` a `Layer_4_Critical`. Quasi sempre compete solo il livello più alto che ha una decisione valida |
| `weight` / `weight_calculate_custom` | Quanto è appetibile rispetto alle altre sul suo livello, fisso o calcolato per unità |
| `action_check_launch` | La tua condizione. `false` la esclude per questo ciclo |
| `cooldown` | Secondi prima che la stessa unità possa risceglierla |
| `only_adult`, `only_safe`, `only_hungry`, `only_sapient`... | Filtri rapidi valutati prima del tuo delegato |
| `unique` | La tiene fuori dagli elenchi generici. Per le decisioni dei mod, sempre `true` |

> [!WARNING] Tre campi inizializzati all'avvio dal gioco
> `DecisionsLibrary.linkAssets()` numera ciascuna decisione, copia `priority` in `priority_int_cached` e imposta `has_weight_custom` all'avvio prima del tuo mod. Saltando le tre righe dopo `add()`, la tua decisione condividerà il cooldown con la prima decisione vanilla, rimarrà al livello più basso e ignorerà il peso personalizzato :wbfacepalm:.

> [!WARNING] Le unità preesistenti hanno un solo slot libero
> Ogni unità memorizza i cooldown delle decisioni in un array dimensionato alla nascita (arrotondato alla potenza di 2 successiva). Il gioco base ha 127 decisioni, quindi l'array ne contiene 128: spazio per esattamente **una** in più. Un'unità preesistente che riceve una seconda decisione di mod lancerà un'eccezione `IndexOutOfRangeException`. Le nuove unità vengono dimensionate correttamente, motivo per cui HelloBox assegna la decisione alla propria creatura e non a un tratto (trait) generico.

Una decisione raggiunge una creatura tramite l'oggetto che la concede. Un `ActorAsset` la riceve con `addDecision()`. **I tratti funzionano diversamente**: collegano gli ID all'avvio, quindi su un tratto devi assegnare l'array manualmente:

```csharp
trait.addDecision("hello_decide_wander");
// BaseTraitLibrary.linkDecisions() did this at startup, for vanilla traits only
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("hello_decide_wander") };
```

## Lavori cittadini

I cittadini ricevono il proprio lavoro dalla città, non dalla loro mente. La città valuta le necessità, apre gli slot di lavoro (costruttori, contadini, minatori...) e li assegna. Un **lavoro cittadino (Citizen Job)** è uno di questi slot, e l'unità che lo accetta esegue l'`ActorJob` con lo stesso ID. Stesso ID da entrambe le parti: tutto il trucco è qui.

```csharp Mods/HelloBox/Code/HelloCityJobs.cs
using ai.behaviours;   // CityBehCheckCitizenTasks
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCityJobs
    {
        public const string KEEPER = "hello_ember_keeper";

        public static void Initialize()
        {
            if (AssetManager.citizen_job_library.has(KEEPER)) return;

            // What the citizen does once hired: an actor job with the same id
            ActorJob work = new ActorJob { id = KEEPER };
            work.addTask(HelloAI.TASK);
            work.addTask("end_job");
            AssetManager.job_actor.add(work);

            CitizenJobAsset keeper = new CitizenJobAsset
            {
                id = KEEPER,
                path_icon = "ui/Icons/iconHelloDrive"
            };
            AssetManager.citizen_job_library.add(keeper);

            // post_init() and linkAssets() did these two at startup
            keeper.unit_job_default = KEEPER;
            AssetManager.citizen_job_library.list_priority_normal.Add(keeper);
        }

        // A city hands out job slots in one behaviour, from a fixed list of vanilla jobs.
        // Nothing ever opens a slot for yours unless you add it after that list.
        [HarmonyPatch(typeof(CityBehCheckCitizenTasks), nameof(CityBehCheckCitizenTasks.execute))]
        public static class Patch_CitizenTasks
        {
            public static void Postfix(City pCity)
            {
                if (pCity == null || pCity.status.population_adults < 10) return;

                CitizenJobAsset keeper = AssetManager.citizen_job_library.get(KEEPER);
                if (keeper == null) return;

                // one keeper per city, recomputed every time the city recounts its jobs
                if (pCity.jobs.countCurrentJobs(keeper) == 0) pCity.jobs.addToJob(keeper, 1);
            }
        }
    }
}
```

Tre passaggi fondamentali che risolvono ciò che il gioco fa solo all'avvio:

1. **`unit_job_default`** è l'`ActorJob` eseguito dal cittadino assunto. `post_init()` vi copia l'ID.
2. **`list_priority_normal`** è l'elenco offerto ai cittadini (creato da `linkAssets()`). I lavori con `priority` > 0 vanno in `list_priority_high` e vengono assegnati per primi.
3. **Gli slot.** `CityBehCheckCitizenTasks.execute()` apre gli slot da un elenco fisso vanilla. Il postfix di Harmony ne aggiunge uno per il tuo.

| Campo | Cosa fa |
| --- | --- |
| `priority` / `priority_no_food` | Superiore a 0: offerto prima dei lavori normali, o solo in caso di carestia |
| `ok_for_king` / `ok_for_leader` / `only_leaders` | Chi può accettarlo |
| `should_be_assigned` | La tua condizione di assegnazione per unità |
| `common_job` | `false` lo esclude del tutto dagli elenchi ordinari |
| `path_icon` | L'icona nella panoramica dei lavori della città |

## Il testo

Il nome dell'attività corrisponde a quanto mostrato nella finestra dell'unità come azione corrente, quindi il giocatore la leggerà più di qualsiasi altra riga che scrivi. Una decisione adotta il nome dell'attività che avvia:

```json Mods/HelloBox/Locales/en.json
{
  "task_unit_hellobox_drive": "Wandering with purpose"
}
```

## Regole d'oro per non distruggere il framerate

Possono esserci migliaia di unità. Il tuo comportamento gira su ciascuna di esse, a ogni singolo tick. "Performance? Mai sentita, si mangia?" è una bella battuta finché non è la tua mod a mangiarsela. La maggior parte delle mod, comprese le mie, esegue loop enormi a ogni tick e se la cava su un PC decente. Un comportamento non se la cava.

- **Esegui i calcoli complessi sul tuo timer, non in `execute`.** Esegui la logica pesante in `Update()` a intervalli regolari, memorizza la risposta e lascia che `execute` si limiti a leggerla.
- **Distribuisci il carico.** Se calcoli per 40 creature, calcola per 10 alla volta distribuite su quattro passaggi, invece di tutte e 40 simultaneamente.
- **Esci prima possibile.** Le prime righe di `execute` devono essere controlli leggeri che consentano un ritorno immediato.
- **Mai allocare memoria nell'hot path.** Istanziar nuove liste e lambda a ogni tick moltiplicato per mille unità è il modo più rapido per immolare il framerate al garbage collector.

> [!TIP] Prima il tratto, poi il comportamento
> Assegna alle creature che controlli un tratto visibile (vedi **[Tratti personalizzati](#/nml/custom-traits)**), così che il giocatore possa riconoscere le tue unità e *tu* possa verificare a colpo d'occhio se il codice sta agendo su quelle giuste :pepeOK:.
