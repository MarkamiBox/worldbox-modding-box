---
title: IA e comportamentos personalizados
group: Conteúdo do jogo
subgroup: Atores, construções e IA
icon: :wbgoldenbrain:
order: 144
---

# IA e comportamentos personalizados :wbgoldenbrain:

Aqui mergulhamos fundo. Todo o restante deste guia adiciona *coisas e dados* ao jogo. Esta seção adiciona **decisões**: o que uma criatura decide fazer a seguir, por conta própria, para sempre, em um mundo compartilhado com milhares de outras. Sem pressão :PES_MonkaSweat:.

## Como o jogo pensa

Três camadas, do macro ao micro, mais a que fica ao lado delas. Entender isso me levou mais tempo do que eu gosto de admitir:

| Camada | O que é | Biblioteca |
| --- | --- | --- |
| **Trabalho** (`ActorJob`) | A ocupação geral da criatura: "ser um cidadão", "ser um soldado" | `AssetManager.job_actor` |
| **Tarefa** (`BehaviourTaskActor`) | Um objetivo concreto dentro de um trabalho: "ir comer", "construir aquilo" | `AssetManager.tasks_actor` |
| **Comportamento** (`BehaviourActionActor`) | Um passo de uma tarefa, executado a cada tick, indicando o que fazer a seguir | anexado a uma tarefa |

Um trabalho contém tarefas, uma tarefa contém comportamentos, e os comportamentos rodam em sequência até que um deles ordene parar.

## Escrevendo um comportamento

Um comportamento é uma classe com um único método. Ele recebe o ator, realiza uma pequena ação e devolve um `BehResult`:

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
`PickTile` é o ponto todo do exercício: é a única parte que o jogo já não faz por você. Todo o resto naquele arquivo é encanamento.

> [!WARNING] `beh_tile_target` é internal
> O campo em que o behaviour escreve está marcado como `internal` na assembly do jogo, então isso compila contra uma `Assembly-CSharp.dll` **publicized** (veja a nota em **[Efeitos de status](#/nml/status-effects)**). Sem ela o compilador recusa a linha e você precisa guardar o alvo num campo seu :PES5_Noted:.


| Resultado | Significado |
| --- | --- |
| `BehResult.Continue` | Seguir para o próximo comportamento nesta tarefa |
| `BehResult.Stop` | Concluído por este tick |
| `BehResult.RepeatStep` | Executar-me novamente no próximo tick |
| `BehResult.Skip` | Pular o próximo passo |
| `BehResult.StepBack` | Voltar um passo |
| `BehResult.RestartTask` | Reiniciar a tarefa desde o início |

## Conectando uma tarefa e um trabalho

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

Observe o segundo comportamento: **reutilize nós vanilla**. O jogo já possui comportamentos prontos para caminhar até um ladrilho, aplicar um status, encontrar um edifício ou atacar um alvo. Escrever a decisão e pegar emprestada a execução é a diferença entre um fim de semana e um mês inteiro.

## Fazendo uma criatura realmente usar o seu trabalho

Você não precisa aplicar patches de código. A IA de cada ator solicita o próximo trabalho por meio de um delegate: basta trocar o delegate:

```csharp
// assumir o controle
pActor.ai.next_job_delegate = () => HelloAI.JOB;
pActor.ai.setTaskBehFinished();   // descarta o que estava fazendo e solicita agora

// devolver o controle
pActor.ai.next_job_delegate = pActor.getNextJob;
pActor.ai.setTaskBehFinished();
```

> [!WARNING] A tomada de controle precisa ser reafirmada
> O combate (e outros sistemas) limpa o trabalho atual ao terminar, e a criatura pede um novo. Se o seu delegate ainda estiver ativo, ela retoma o seu trabalho. Mas se outro código substituiu o delegate, você perde o controle: verifique-o periodicamente em vez de achar que ele se manterá para sempre :PES5_Noted:.

## Decisões: deixe a criatura escolher sua tarefa

Substituir o delegate de trabalho é uma tomada de controle total. Na maioria das vezes você quer algo mais suave: sua tarefa como mais uma opção que a criatura pesa contra comer, dormir e lutar. Isso é uma **decisão (Decision)**, e é como o próprio jogo escolhe o que uma unidade faz.

Uma decisão diz *quando*. A tarefa que você já escreveu diz *como*. Quando o cérebro escolhe uma decisão, ele inicia a tarefa com o mesmo ID ou a indicada em `task_id`.

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

| Campo | O que faz |
| --- | --- |
| `task_id` | A tarefa a iniciar. Vazio usa a tarefa com o ID da decisão |
| `priority` | A camada, de `NeuroLayer.Layer_0_Minimal` a `Layer_4_Critical`. Quase sempre apenas a camada mais alta com opções válidas compete |
| `weight` / `weight_calculate_custom` | Quão atraente é frente às outras em sua camada, fixo ou calculado por unidade |
| `action_check_launch` | Sua condição. `false` a descarta para esta rodada |
| `cooldown` | Segundos antes que a mesma unidade possa escolhê-la novamente |
| `only_adult`, `only_safe`, `only_hungry`, `only_sapient`... | Filtros rápidos verificados antes do seu delegate |
| `unique` | Mantém fora das listas genéricas. Para decisões de mods, sempre `true` |

> [!WARNING] Três campos que o jogo preenche na inicialização
> `DecisionsLibrary.linkAssets()` numera cada decisão, copia `priority` em `priority_int_cached` e define `has_weight_custom` na inicialização antes do seu mod. Pular as três linhas após o `add()` fará sua decisão compartilhar recarga com a primeira decisão padrão, ficar na camada mais baixa e ignorar o peso personalizado :wbfacepalm:.

> [!WARNING] Unidades existentes possuem apenas um slot livre
> Cada unidade mantém suas recargas de decisões em um array dimensionado na criação da unidade (arredondado para potência de 2). O jogo padrão tem 127 decisões, logo o array tem 128: espaço para exatamente **mais uma**. Uma unidade antiga que receba uma segunda decisão de mod causará `IndexOutOfRangeException`. Novas unidades são dimensionadas corretamente, razão pela qual o HelloBox concede a decisão à sua própria criatura.

Uma decisão chega a uma criatura através de quem a concede. Um `ActorAsset` a recebe com `addDecision()`. **Traços funcionam diferente**: resolvem IDs na inicialização, logo em um traço você atribui o array manualmente:

```csharp
trait.addDecision("hello_decide_wander");
// BaseTraitLibrary.linkDecisions() did this at startup, for vanilla traits only
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("hello_decide_wander") };
```

## Empregos da cidade

Os cidadãos recebem trabalho da cidade, não de seu próprio cérebro. A cidade avalia as necessidades, abre vagas de trabalho (construtores, fazendeiros, mineradores...) e as distribui. Um **emprego de cidadão (Citizen Job)** é uma dessas vagas, e a unidade contratada executa o `ActorJob` de mesmo ID. O mesmo id dos dois lados: esse é todo o truque.

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

Três detalhes cruciais que corrigem omissões da inicialização:

1. **`unit_job_default`** é o `ActorJob` que o cidadão executa. `post_init()` copia o ID para ele.
2. **`list_priority_normal`** é a lista oferecida aos cidadãos (construída por `linkAssets()`). Empregos com `priority` > 0 vão para `list_priority_high` e são distribuídos primeiro.
3. **As vagas.** `CityBehCheckCitizenTasks.execute()` abre vagas de uma lista fixa padrão. O postfix do Harmony adiciona uma vaga para o seu emprego.

| Campo | O que faz |
| --- | --- |
| `priority` / `priority_no_food` | Acima de 0: oferecido antes dos normais, ou apenas quando falta comida |
| `ok_for_king` / `ok_for_leader` / `only_leaders` | Quem pode assumir o cargo |
| `should_be_assigned` | Sua condição de atribuição por unidade |
| `common_job` | `false` o remove totalmente das listas padrão |
| `path_icon` | O ícone na visão geral de empregos da cidade |

## O texto

O nome da tarefa é o que a janela da unidade exibe como atividade atual, então o jogador vai lê-lo mais do que qualquer outra linha que você escrever. Uma decisão herda o nome da tarefa que ela inicia:

```json Mods/HelloBox/Locales/en.json
{
  "task_unit_hellobox_drive": "Wandering with purpose"
}
```

## Regras para não destruir a taxa de quadros

Podem existir milhares de unidades. Seu comportamento roda em cada uma delas, a cada tick. "Performance? Nunca ouvi falar, dá pra comer?" é uma boa piada até o seu mod ser o que está comendo. A maioria dos mods, incluindo os meus, roda loops enormes a cada tick e se safa num PC razoável. Um comportamento não se safa.

- **Processe o raciocínio pesado no seu próprio tempo, não no `execute`.** Rode sua lógica pesada no `Update()` com um temporizador, armazene a resposta e faça com que o `execute` apenas leia o resultado.
- **Distribua a carga.** Se você processa para 40 criaturas, processe 10 por rodada ao longo de quatro rodadas, em vez das 40 de uma só vez.
- **Saia mais cedo.** As primeiras linhas de `execute` devem ser verificações simples que permitam retornar de imediato.
- **Nunca aloque memória no hot path.** Criar novas listas e lambdas a cada tick multiplicado por mil unidades é a melhor maneira de entregar seus FPS de bandeja ao coletor de lixo.

> [!TIP] Traço primeiro, comportamento depois
> Dê às criaturas que você controla um traço visível (veja **[Traços personalizados](#/nml/custom-traits)**), para que o jogador saiba quais unidades são suas e para que *você* consiga conferir num relance se o seu código está rodando nas unidades certas :pepeOK:.
