---
title: IA del regno
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbdiplomacyhandshake:
order: 180
---

# IA del regno :wbdiplomacyhandshake:

L'IA delle creature opera su singoli attori: cercare cibo, camminare verso un albero o combattere un nemico. L'IA del regno opera invece sulla civiltà stessa. È il modo in cui i regni decidono quando dichiarare guerra, espandere i confini, fondare colonie, stringere alleanze o inviare eserciti in campagna militare.

Come l'IA degli attori, l'IA del regno è costruita su compiti (job) e attività (task). Ma invece di un `Actor`, ogni passaggio riceve un `Kingdom`.

## Job e task a confronto

La logica del regno è suddivisa in due librerie di asset:

| Concetto | Classe | Libreria | Ruolo |
| --- | --- | --- | --- |
| **Kingdom job** | `KingdomJob` | `AssetManager.job_kingdom` | Un insieme denominato di task che un regno esegue a rotazione |
| **Kingdom task** | `BehaviourTaskKingdom` | `AssetManager.tasks_kingdom` | Un obiettivo strategico concreto contenente uno o più comportamenti |
| **Kingdom behaviour** | `BehaviourActionKingdom` | aggiunto al task | Un singolo passaggio valutato a ogni tick |

Le civiltà vanilla utilizzano il job di regno `"civ"` (`AssetManager.job_kingdom.get("civ")`). Quando un regno aggiorna il proprio turno, valuta i task presenti nel proprio job in sequenza.

## Scrivere un comportamento di regno

Un comportamento di regno eredita da `BehaviourActionKingdom` ed esegue l'override di `execute(Kingdom pKingdom)`. Svolge il proprio lavoro e restituisce un `BehResult`:

```csharp
using ai.behaviours;

namespace HelloBox
{
    public class BehHelloKingdomTribute : BehaviourActionKingdom
    {
        public override BehResult execute(Kingdom pKingdom)
        {
            if (pKingdom == null || pKingdom.isRekt() || !pKingdom.isCiv()) return BehResult.Stop;
            if (pKingdom.hasEnemies()) return BehResult.Stop;

            // controllo strategico personalizzato: se prospero, invia oro o attiva diplomazia
            if (pKingdom.data.gold > 500)
            {
                pKingdom.data.gold -= 50;
                return BehResult.Continue;
            }

            return BehResult.Stop;
        }
    }
}
```

### I codici di risultato

| Risultato | Cosa fa l'IA del regno |
| --- | --- |
| `BehResult.Continue` | Passa l'esecuzione al comportamento successivo nel task |
| `BehResult.Stop` | Interrompe questo task per il tick corrente |
| `BehResult.RepeatStep` | Valuta nuovamente questo comportamento al prossimo tick |
| `BehResult.Skip` | Salta il comportamento successivo e prosegue |

## Il codice

Questo file crea un task di regno, aggiunge un comportamento personalizzato e inserisce il task nel job vanilla `"civ"`, in modo che ogni civiltà lo esegua:

```csharp Mods/HelloBox/Code/HelloKingdomAI.cs
using System;
using ai.behaviours;

namespace HelloBox
{
    public class BehHelloCheckTribute : BehaviourActionKingdom
    {
        public override BehResult execute(Kingdom pKingdom)
        {
            if (pKingdom == null || pKingdom.isRekt() || !pKingdom.isCiv()) return BehResult.Stop;
            if (pKingdom.capital == null || pKingdom.king == null) return BehResult.Stop;

            // Example directive: if the kingdom has plenty of gold, donate to treasury
            if (pKingdom.data.gold > 300)
            {
                pKingdom.data.gold += 10;
                return BehResult.Continue;
            }

            return BehResult.Stop;
        }
    }

    public static class HelloKingdomAI
    {
        public const string TASK_ID = "hello_kingdom_tribute";

        public static void Initialize()
        {
            if (AssetManager.tasks_kingdom.has(TASK_ID)) return;

            // 1. Define the task
            BehaviourTaskKingdom task = new BehaviourTaskKingdom
            {
                id = TASK_ID
            };

            // 2. Add steps
            task.addBeh(new BehHelloCheckTribute());

            AssetManager.tasks_kingdom.add(task);

            // 3. Inject into the civ kingdom job
            KingdomJob civJob = AssetManager.job_kingdom.get("civ");
            if (civJob != null && !civJob.tasks.Contains(TASK_ID))
            {
                civJob.tasks.Add(TASK_ID);
            }
        }
    }
}
```

## Creare un job di regno dedicato

Se stai creando un tipo di civiltà completamente nuovo o una fazione mostruosa tramite `AssetManager.kingdoms`, puoi assegnarle un job personalizzato invece di modificare `"civ"`:

```csharp
KingdomJob job = new KingdomJob { id = "hello_faction_job" };
job.addTask("hello_kingdom_tribute");
job.addTask("check_war");
AssetManager.job_kingdom.add(job);
```

Poi imposta `job_id = "hello_faction_job"` sul tuo `KingdomAsset` in **[Regni](#/nml/kingdoms)** :PESgn_Noice:.

## Errori comuni da evitare

- **Verifica sempre `isRekt()`**: I regni possono cadere o essere annessi in qualsiasi momento durante la simulazione. Non toccare mai i dati di un regno senza controllare `pKingdom != null && !pKingdom.isRekt()`.
- **Controlla la presenza di capitale e re**: Molte operazioni del regno danno per scontato che `pKingdom.capital != null` e `pKingdom.king != null`. Se uno dei due è morto o distrutto, accedervi direttamente causa una `NullReferenceException`.
- **Mantieni leggeri i tick di regno**: Mentre le singole unità eseguono tick frequenti, le valutazioni del regno coinvolgono interi imperi. Cicli annidati pesanti su tutte le unità del mondo dentro un comportamento del regno causeranno cali visibili di frame rate :aPES2_Sweat:.
