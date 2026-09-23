---
title: Eigene KI & Verhalten
group: Spielinhalte
subgroup: Akteure, Gebäude & KI
icon: :wbgoldenbrain:
order: 144
---

# Eigene KI & Verhalten :wbgoldenbrain:

Hier geht es ans Eingemachte. Alles andere in diesem Guide fügt dem Spiel *Gegenstände und Daten* hinzu. Das hier fügt **Entscheidungen** hinzu: was eine Kreatur als Nächstes tut, von ganz allein, für immer, in einer Welt, die sie sich mit Tausenden anderen teilt.

## Wie das Spiel denkt

Drei Ebenen, von groß nach klein:

| Ebene | Was es ist | Bibliothek |
| --- | --- | --- |
| **Job** (`ActorJob`) | Was diese Kreatur im Großen und Ganzen treibt: "Bürger sein", "Soldat sein" | `AssetManager.job_actor` |
| **Task** (`BehaviourTaskActor`) | Ein konkretes Ziel innerhalb eines Jobs: "etwas essen", "das da bauen" | `AssetManager.tasks_actor` |
| **Verhalten** (`BehaviourActionActor`) | Ein Einzelschritt eines Tasks, läuft jeden Tick, gibt die nächste Aktion zurück | wird an einen Task angehängt |

Ein Job enthält Tasks, ein Task enthält Verhaltensweisen (Behaviours), und die Verhaltensweisen laufen der Reihe nach ab, bis eine von ihnen Stopp sagt.

## Ein Verhalten schreiben

Ein Verhalten ist eine Klasse mit einer einzigen Methode. Sie erhält den Akteur, führt eine kleine Aktion aus und gibt ein `BehResult` zurück:

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
`PickTile` ist der eigentliche Punkt der Übung: es ist das Einzige, was das Spiel nicht schon für dich macht. Alles andere in der Datei ist Verkabelung.

> [!WARNING] `beh_tile_target` ist internal
> Das Feld, in das das Behaviour schreibt, ist in der Spiel-Assembly als `internal` markiert, das kompiliert also gegen eine **publicized** `Assembly-CSharp.dll` (siehe die Notiz in **[Status-Effekte](#/nml/status-effects)**). Ohne eine solche lehnt der Compiler die Zeile ab und du musst das Ziel stattdessen in einem eigenen Feld halten :PES5_Noted:.


| Ergebnis | Bedeutung |
| --- | --- |
| `BehResult.Continue` | Fahre mit dem nächsten Verhalten in diesem Task fort |
| `BehResult.Stop` | Fertig für diesen Tick |
| `BehResult.RepeatStep` | Führe mich im nächsten Tick erneut aus |
| `BehResult.Skip` | Überspringe den nächsten Schritt |
| `BehResult.StepBack` | Gehe einen Schritt zurück |
| `BehResult.RestartTask` | Starte den Task von vorne |

## Einen Task und einen Job verknüpfen

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

Beachte das zweite Verhalten: **Nutze die Vanilla-Knoten wieder**. Das Spiel verfügt bereits über Verhaltensweisen zum Gehen zu einer Kachel, zum Hinzufügen eines Status, zum Finden eines Gebäudes oder zum Angreifen eines Ziels. Die Entscheidung selbst zu schreiben und die Ausführung auszuleihen, ist der Unterschied zwischen einem Wochenende und einem ganzen Monat.

## Eine Kreatur dazu bringen, deinen Job tatsächlich zu nutzen

Du musst nichts patchen. Die KI jedes Akteurs fragt über einen Delegaten nach ihrem nächsten Job, also tauschst du einfach den Delegaten aus:

```csharp
// die Kontrolle übernehmen
pActor.ai.next_job_delegate = () => HelloAI.JOB;
pActor.ai.setTaskBehFinished();   // brich ab, was immer er tat, und frage sofort neu an

// die Kontrolle zurückgeben
pActor.ai.next_job_delegate = pActor.getNextJob;
pActor.ai.setTaskBehFinished();
```

> [!WARNING] Die Übernahme muss wiederholt abgesichert werden
> Kämpfe (und einige andere Systeme) setzen den aktuellen Job zurück, sobald sie enden, und die Kreatur fragt nach einem neuen. Wenn dein Delegat noch aktiv ist, erhält sie deinen Job zurück und die Übernahme hält. Wenn jedoch ein anderer Code den Delegaten ersetzt hat, verlierst du die Kontrolle. Prüfe dies daher regelmäßig, anstatt blind davon auszugehen :PES5_Noted:.

## Entscheidungen: Lass die Kreatur deine Aufgabe wählen

Das Austauschen des Job-Delegates ist eine vollständige Übernahme. Meistens möchtest du etwas Sanfteres: Deine Aufgabe soll eine weitere Option sein, die die Kreatur gegen Essen, Schlafen und Kämpfen abwägt. Das ist eine **Entscheidung (Decision)**, und genau so wählt das Spiel selbst die nächste Handlung einer Einheit aus.

Eine Entscheidung bestimmt *wann*. Die Aufgabe, die du bereits geschrieben hast, bestimmt *wie*. Wenn das Gehirn eine Entscheidung trifft, startet es die Aufgabe mit derselben ID oder der in `task_id` angegebenen.

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

| Feld | Was es bewirkt |
| --- | --- |
| `task_id` | Die zu startende Aufgabe. Leer bedeutet eine Aufgabe mit der ID der Entscheidung |
| `priority` | Die Schicht, `NeuroLayer.Layer_0_Minimal` bis `Layer_4_Critical`. Meist konkurriert nur die höchste Schicht, die eine mögliche Entscheidung hat |
| `weight` / `weight_calculate_custom` | Wie attraktiv sie im Vergleich zu anderen auf ihrer Schicht ist, fest oder pro Einheit berechnet |
| `action_check_launch` | Deine Bedingung. Bei `false` steht sie diesmal nicht zur Wahl |
| `cooldown` | Sekunden, bevor dieselbe Einheit sie erneut wählen darf |
| `only_adult`, `only_safe`, `only_hungry`, `only_sapient`... | Schnelle Vorprüfungen des Spiels vor deinem Delegat |
| `unique` | Hält sie aus den Standardlisten für alle Einheiten heraus. Für Mod-Entscheidungen immer `true` |

> [!WARNING] Drei Felder, die das Spiel beim Start befüllt
> `DecisionsLibrary.linkAssets()` nummeriert alle Entscheidungen, kopiert `priority` nach `priority_int_cached` und setzt `has_weight_custom` beim Spielstart vor deiner Mod. Lässt du die drei Zeilen nach `add()` weg, teilt sich deine Entscheidung die Abklingzeit mit der ersten vanilla Entscheidung, landet unabhängig von `priority` auf der niedrigsten Ebene und ignoriert ihr individuelles Gewicht :wbfacepalm:.

> [!WARNING] Bereits existierende Einheiten haben genau einen freien Slot
> Jede Einheit verwaltet ihre Entscheidungs-Abklingzeiten in einem Array, das bei der Erstellung der Einheit auf die nächste Zweierpotenz aufgerundet wird. Vanilla hat 127 Entscheidungen, das Array fasst 128: Platz für genau **eine** weitere. Eine Einheit, die vor deiner Mod existierte und eine zweite Mod-Entscheidung erhält, wirft eine `IndexOutOfRangeException`. Neue Einheiten werden passend dimensioniert – weshalb HelloBox seine Entscheidung einer eigenen Kreatur zuweist, nicht einem Merkmal für vanilla Einheiten.

Eine Entscheidung erreicht eine Kreatur über das Objekt, das sie verleiht. Ein `ActorAsset` nimmt sie mit `addDecision()` auf. **Merkmale funktionieren anders**: Sie lösen ihre IDs beim Start auf, weshalb du das Array bei einem Merkmal manuell setzt:

```csharp
trait.addDecision("hello_decide_wander");
// BaseTraitLibrary.linkDecisions() did this at startup, for vanilla traits only
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("hello_decide_wander") };
```

## Stadt-Berufe

Bürger erhalten ihre Arbeit von der Stadt, nicht aus ihrem eigenen Gehirn. Die Stadt zählt den Bedarf, öffnet Arbeitsplätze (Bauarbeiter, Bauern, Bergleute...) und teilt sie zu. Ein **Bürgerberuf (Citizen Job)** ist einer dieser Plätze, und die Einheit führt den `ActorJob` mit derselben ID aus.

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

Drei Dinge, die jeweils etwas beheben, das das Spiel nur beim Start oder nur für eigene Berufe tut:

1. **`unit_job_default`** ist der `ActorJob`, den ein eingestellter Bürger ausführt. `post_init()` kopiert die ID für jeden Standardberuf hinein.
2. **`list_priority_normal`** ist die Liste, die Bürgern angeboten wird (erstellt von `linkAssets()`). Berufe mit `priority` > 0 landen in `list_priority_high` und werden zuerst vergeben.
3. **Die Arbeitsplätze.** `CityBehCheckCitizenTasks.execute()` öffnet Plätze aus einer festen Liste von vanilla Berufen. Der Harmony-Postfix fügt danach einen Platz für deinen Beruf hinzu.

| Feld | Was es bewirkt |
| --- | --- |
| `priority` / `priority_no_food` | Über 0: Wird vor normalen Berufen angeboten, oder nur bei Nahrungsmangel |
| `ok_for_king` / `ok_for_leader` / `only_leaders` | Wer diesen Beruf annehmen darf |
| `should_be_assigned` | Deine Zuweisungsbedingung pro Einheit |
| `common_job` | `false` hält den Beruf komplett aus den Auswahllisten heraus |
| `path_icon` | Das Icon in der Berufsübersicht der Stadt |

## Die Texte

Der Name der Aufgabe wird im Einheitenfenster als aktuelle Tätigkeit angezeigt, und eine Entscheidung übernimmt den Namen der Aufgabe, die sie startet:

```json Mods/HelloBox/Locales/en.json
{
  "task_unit_hellobox_drive": "Wandering with purpose"
}
```

## Regeln, um die Framerate nicht zu zerstören

Es kann Tausende von Einheiten geben. Dein Verhalten läuft auf jeder einzelnen davon, in jedem einzelnen Tick.

- **Denke in deinem eigenen Rhythmus, nicht in `execute`.** Führe teure Logik in `Update()` über einen Timer aus, speichere das Ergebnis ab und lass `execute` diesen Wert nur auslesen.
- **Verteile die Last.** Wenn du für 40 Kreaturen denkst, denke in vier Durchläufen für jeweils 10 von ihnen, anstatt für alle 40 auf einmal.
- **Steige frühzeitig aus.** Die ersten Zeilen von `execute` sollten die billigen Prüfungen sein, bei denen du sofort zurückkehren kannst.
- **Allokiere niemals im Hot-Path.** Neue Listen und neue Lambdas bei jedem Tick mal tausend Einheiten bedeuten, dass du dem Garbage Collector deine gesamte Framerate zum Fraß vorwirfst.

> [!TIP] Erst das Merkmal, dann das Verhalten
> Gib den übernommenen Kreaturen ein sichtbares Merkmal (siehe **[Eigene Merkmale](#/nml/custom-traits)**), damit der Spieler weiß, welche Einheiten zu deiner Mod gehören - und damit *du* auf einen Blick siehst, ob dein Code auf den richtigen Einheiten läuft :pepeOK:.
