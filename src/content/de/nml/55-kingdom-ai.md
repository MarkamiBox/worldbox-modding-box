---
title: Königreichs-KI
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbdiplomacyhandshake:
order: 180
---

# Königreichs-KI :wbdiplomacyhandshake:

Kreaturen-KI läuft auf einzelnen Akteuren: Nahrung suchen, zu einem Baum wandern oder Gegner bekämpfen. Königreichs-KI läuft auf der Zivilisation selbst. Sie steuert, wann Reiche Kriege erklären, Grenzen erweitern, Kolonien gründen, Bündnisse schließen oder Armeen entsenden.

Wie Akteur-KI basiert sie auf Jobs und Aufgaben (Tasks). Doch statt eines `Actor` erhält jeder Schritt ein `Kingdom`.

## Jobs und Aufgaben im Vergleich

Die Königreichslogik ist auf zwei Asset-Bibliotheken aufgeteilt:

| Konzept | Klasse | Bibliothek | Rolle |
| --- | --- | --- | --- |
| **Kingdom job** | `KingdomJob` | `AssetManager.job_kingdom` | Eine benannte Sammlung von Aufgaben, die ein Reich durchläuft |
| **Kingdom task** | `BehaviourTaskKingdom` | `AssetManager.tasks_kingdom` | Ein konkretes strategisches Ziel aus einem oder mehreren Verhaltensweisen |
| **Kingdom behaviour** | `BehaviourActionKingdom` | zur Aufgabe hinzugefügt | Ein einzelner, pro Tick evaluierter Teilschritt |

Vanilla-Zivilisationen nutzen den Königreichs-Job `"civ"` (`AssetManager.job_kingdom.get("civ")`). Bei jedem Update prüft das Reich die Aufgaben nacheinander.

## Ein Königreichs-Verhalten schreiben

Ein Königreichs-Verhalten erbt von `BehaviourActionKingdom` und überschreibt `execute(Kingdom pKingdom)`:

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

### Die Ergebniscodes

| Ergebnis | Was die Königreichs-KI tut |
| --- | --- |
| `BehResult.Continue` | Führt das nächste Verhalten in dieser Aufgabe aus |
| `BehResult.Stop` | Beendet die Aufgabe für den aktuellen Tick |
| `BehResult.RepeatStep` | Wiederholt dieses Verhalten beim nächsten Tick |
| `BehResult.Skip` | Überspringt das nächste Verhalten und fährt fort |

## Der Code

Diese Datei erstellt eine Königreichsaufgabe und hängt sie in den Vanilla-Job `"civ"` ein:

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

## Einen eigenen Königreichs-Job erstellen

Wenn du mit `AssetManager.kingdoms` eine eigene Spezies oder Monsterfraktion erstellst, kannst du einen eigenen Job vergeben:

```csharp
KingdomJob job = new KingdomJob { id = "hello_faction_job" };
job.addTask("hello_kingdom_tribute");
job.addTask("check_war");
AssetManager.job_kingdom.add(job);
```

Setze danach `job_id = "hello_faction_job"` an deinem `KingdomAsset` in **[Königreiche](#/nml/kingdoms)** :PESgn_Noice:.

## Typische Fallstricke

- **Immer `isRekt()` prüfen**: Reiche können jederzeit zerstört oder erobert werden. Greife nie auf Daten zu ohne `pKingdom != null && !pKingdom.isRekt()`.
- **Hauptstadt und Herrscher prüfen**: Viele Operationen setzen `capital` und `king` voraus. Sind sie zerstört, fliegt eine `NullReferenceException`.
- **Ticks schlank halten**: Während Einheiten lokal ticken, umfasst ein Königreich ganze Kontinente. Schwere Schleifen über Einheiten im Verhalten erzeugen sichtbare Ruckler :aPES2_Sweat:.
