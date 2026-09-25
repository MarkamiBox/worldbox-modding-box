---
title: IA de reino
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbdiplomacyhandshake:
order: 180
---

# IA de reino :wbdiplomacyhandshake:

A IA de criaturas atua em atores individuais: buscar comida, caminhar até uma árvore ou lutar. A IA de reino opera sobre a civilização como um todo. É ela que decide quando declarar guerras, expandir territórios, fundar colônias, criar alianças ou despachar exércitos.

Assim como a IA de atores, ela é estruturada em trabalhos (jobs) e tarefas (tasks). Mas em vez de um `Actor`, cada passo recebe um `Kingdom`.

## Trabalhos versus tarefas

A lógica de reino é dividida entre duas bibliotecas de assets:

| Conceito | Classe | Biblioteca | Função |
| --- | --- | --- | --- |
| **Kingdom job** | `KingdomJob` | `AssetManager.job_kingdom` | Conjunto nomeado de tarefas avaliadas em ciclo |
| **Kingdom task** | `BehaviourTaskKingdom` | `AssetManager.tasks_kingdom` | Objetivo estratégico concreto com comportamentos |
| **Kingdom behaviour** | `BehaviourActionKingdom` | adicionado à tarefa | Um passo individual avaliado a cada tick |

As civilizações vanilla utilizam o job de reino `"civ"` (`AssetManager.job_kingdom.get("civ")`). A cada turno, o reino avalia as tarefas daquele trabalho em sequência.

## Criando um comportamento de reino

Um comportamento de reino herda de `BehaviourActionKingdom` e sobrescreve `execute(Kingdom pKingdom)`:

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

### Códigos de retorno

| Resultado | O que a IA de reino faz |
| --- | --- |
| `BehResult.Continue` | Passa a execução para o próximo comportamento nesta tarefa |
| `BehResult.Stop` | Interrompe a tarefa no tick atual |
| `BehResult.RepeatStep` | Reavalia este comportamento no próximo tick |
| `BehResult.Skip` | Pula o próximo comportamento e avança |

## O código

Este arquivo cria uma tarefa de reino e a injeta no job vanilla `"civ"` para que todos os reinos a executem:

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

## Criando um trabalho de reino dedicado

Ao criar uma espécie ou facção inédita através de `AssetManager.kingdoms`, você pode atribuir um job exclusivo:

```csharp
KingdomJob job = new KingdomJob { id = "hello_faction_job" };
job.addTask("hello_kingdom_tribute");
job.addTask("check_war");
AssetManager.job_kingdom.add(job);
```

Em seguida, atribua `job_id = "hello_faction_job"` no seu `KingdomAsset` em **[Reinos](#/nml/kingdoms)** :PESgn_Noice:.

## Armadilhas a evitar

- **Sempre verifique `isRekt()`**: Reinos podem cair ou ser anexados a qualquer segundo. Nunca acesse dados sem checar `pKingdom != null && !pKingdom.isRekt()`.
- **Verifique a capital e o rei**: Muitas operações supõem que `capital` e `king` estejam presentes. Se tiverem sido destruídos, haverá uma `NullReferenceException`.
- **Mantenha os ticks leves**: Enquanto uma unidade roda localmente, o reino engloba impérios inteiros. Loops pesados sobre todas as unidades do mundo em um comportamento causarão quedas drásticas de FPS :aPES2_Sweat:.
