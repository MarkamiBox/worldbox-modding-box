---
title: IA del reino
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbdiplomacyhandshake:
order: 180
---

# IA del reino :wbdiplomacyhandshake:

La IA de las criaturas se ejecuta en actores individuales: buscar comida, caminar hacia un árbol o luchar contra un enemigo. La IA del reino opera sobre la propia civilización. Es el mecanismo con el que los reinos deciden cuándo declarar guerras, expandir fronteras, fundar colonias, forjar alianzas o enviar ejércitos a campañas.

Al igual que la IA de actores, la IA del reino se basa en trabajos (jobs) y tareas (tasks). Pero en lugar de un `Actor`, cada paso recibe un `Kingdom`.

## Trabajos frente a tareas

La lógica de reino se divide entre dos bibliotecas de assets:

| Concepto | Clase | Biblioteca | Función |
| --- | --- | --- | --- |
| **Kingdom job** | `KingdomJob` | `AssetManager.job_kingdom` | Un conjunto con nombre de tareas que un reino recorre en ciclo |
| **Kingdom task** | `BehaviourTaskKingdom` | `AssetManager.tasks_kingdom` | Un objetivo estratégico concreto con uno o más comportamientos |
| **Kingdom behaviour** | `BehaviourActionKingdom` | añadido a la tarea | Un único paso evaluado en cada tick |

Las civilizaciones vanilla emplean el trabajo de reino `"civ"` (`AssetManager.job_kingdom.get("civ")`). Al actualizar su turno, el reino evalúa secuencialmente las tareas de su trabajo.

## Escribir un comportamiento de reino

Un comportamiento de reino hereda de `BehaviourActionKingdom` y sobrescribe `execute(Kingdom pKingdom)`. Realiza su trabajo y devuelve un `BehResult`:

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

            // comprobación estratégica: si es próspero, envía oro o inicia diplomacia
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

### Los códigos de resultado

| Resultado | Qué hace la IA del reino |
| --- | --- |
| `BehResult.Continue` | Pasa la ejecución al siguiente comportamiento en esta tarea |
| `BehResult.Stop` | Detiene esta tarea durante el tick actual |
| `BehResult.RepeatStep` | Vuelve a evaluar este comportamiento en el siguiente tick |
| `BehResult.Skip` | Salta el siguiente comportamiento y continúa |

## El código

Este archivo crea una tarea de reino, añade un comportamiento personalizado y la inyecta en el trabajo vanilla `"civ"` para que todas las civilizaciones la ejecuten:

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

## Crear un trabajo de reino exclusivo

Si creas un tipo de civilización totalmente nuevo o una facción de monstruos mediante `AssetManager.kingdoms`, puedes asignarle su propio trabajo en lugar de alterar `"civ"`:

```csharp
KingdomJob job = new KingdomJob { id = "hello_faction_job" };
job.addTask("hello_kingdom_tribute");
job.addTask("check_war");
AssetManager.job_kingdom.add(job);
```

Luego asigna `job_id = "hello_faction_job"` en tu `KingdomAsset` en **[Reinos](#/nml/kingdoms)** :PESgn_Noice:.

## Errores comunes que debes evitar

- **Comprueba siempre `isRekt()`**: Los reinos pueden ser destruidos o anexionados en cualquier momento de la simulación. Nunca toques datos de un reino sin verificar `pKingdom != null && !pKingdom.isRekt()`.
- **Verifica la capital y el rey**: Muchas rutinas asumen que `pKingdom.capital != null` y `pKingdom.king != null`. Si han muerto o han sido destruidos, acceder directamente provocará `NullReferenceException`.
- **Mantén ligeros los ticks de reino**: Las unidades evalúan ticks de forma localizada, pero la IA de reino abarca imperios enteros. Bucles anidados pesados sobre todas las unidades del mundo dentro de un comportamiento causarán tirones notables de rendimiento :aPES2_Sweat:.
