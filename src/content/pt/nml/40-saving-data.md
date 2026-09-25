---
title: Lembrando de coisas
group: NML Modding
subgroup: Avançado e publicação
icon: :wbfloppysavewink:
order: 44
---

# Lembrando de coisas :wbfloppysavewink:

Cedo ou tarde seu mod precisará lembrar de algo sobre uma unidade específica: quantas vezes ela foi atingida, se já recebeu sua recompensa ou em qual santuário ela reza. Um dicionário estático indexado pela unidade esquecerá absolutamente tudo no instante em que o jogador salvar e recarregar a partida :wbfacepalm:.

O jogo já possui um lugar projetado para isso. Cada unidade, cidade, reino (kingdom), construção (building), item e livro (book) mantém seu estado em um objeto de dados, e cada um deles possui um pequeno armazenamento de **dados personalizados** (custom data) que vai junto para o arquivo de save.

## O armazenamento

| Chamada | O que faz |
| --- | --- |
| `data.set(key, value)` | Armazena um `int`, `long`, `float`, `string` ou `bool` sob uma chave |
| `data.get(key, out value, default)` | Lê o valor de volta. Se a chave não existir, retorna o padrão |
| `data.change(key, amount, min, max)` | Soma a um `int` e limita o intervalo (clamp) em uma única chamada |
| `data.addFlag(key)` | Define uma flag. Retorna `false` se ela já estava ativa |
| `data.hasFlag(key)` / `data.removeFlag(key)` | Verifica ou remove a flag |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | Deleta um valor |

Cada tipo possui sua própria tabela interna, portanto um `int` e uma `string` sob a mesma chave não colidem. Ainda assim, para seu próprio controle, não compartilhe chaves entre tipos diferentes. O seu eu do futuro não vai lembrar qual era qual.




## Salvando objetos complexos com NML

Se cinco tipos primitivos parecem coisa de 1995 e você realmente precisa salvar uma classe ou lista inteira num ator, o NML oferece `DataExtension` em `NeoModLoader.General.Game.extensions`: dois métodos de extensão, `Set` e `TryGet`, em qualquer um dos objetos de dados abaixo.

Embrulhe sua classe de dados em `BasicCustomData<T>`:

```csharp
using System.Collections.Generic;
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}

```

Dentro de um método com um `Actor actor`, crie o valor antes de salvá-lo:

```csharp
if (actor == null || !actor.isAlive()) return;
QuestProgress quest = new QuestProgress { quest_id = "hello_first_steps", step = 1 };

// Salvando no actor:
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// Lendo de volta:
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress loadedQuest = saved.Data;
}
```

Por baixo dos panos, `Set` transforma seu objeto em JSON e guarda com o `data.set(key, string)` simples da tabela acima. Então é uma string por chave por unidade, e a regra de "mantenha pequeno" abaixo vale em dobro. Sua classe precisa de um construtor sem parâmetros, e seus campos e propriedades públicos são o que é salvo.

Se você espera que o formato dos dados mude entre atualizações do mod, implemente `ICustomData` na sua classe em vez disso. São dois métodos: `Serialize()` retorna um `SerializedCustomData(modId, dataVersion, jObject)`, e `Deserialize(SerializedCustomData)` o recupera de volta. Verificar `ModId` e `DataVersion` ali é trabalho seu, ninguém faz isso por você. `BasicCustomData<T>` escreve valores de placeholder nos dois e lança exceção ao ler qualquer outra coisa, então não misture os dois na mesma chave :PES5_Hmmmm:.

> [!NOTE] Verificado contra o NML 1.2.0
> Esses nomes e assinaturas vêm do próprio assembly do NML, não da sua documentação, que não os menciona. Se um NML mais novo renomear algo, o compilador vai te avisar antes dos seus jogadores.

## No HelloBox

Um traço (trait) que conta cada golpe desferido pelo portador e concede uma recompensa única ao atingir cinquenta golpes:

```csharp Mods/HelloBox/Code/HelloMemory.cs
namespace HelloBox
{
    public static class HelloMemory
    {
        public const string GRUDGE = "hello_grudge";      // the trait that remembers
        public const string HITS = "hello_hits";          // int: hits this unit has landed
        public const string VETERAN = "hello_veteran";    // flag: it already got its reward

        public static void Initialize()
        {
            if (AssetManager.traits.has(GRUDGE)) return;

            ActorTrait grudge = new ActorTrait
            {
                id = GRUDGE,
                path_icon = "ui/Icons/iconHelloGrudge",
                group_id = HelloGroups.TRAITS,
                needs_to_be_explored = false
            };

            grudge.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                Actor actor = pSelf as Actor;
                if (actor == null || !actor.isAlive()) return false;

                // lives in the unit's own save data, so it survives save and load
                actor.data.change(HITS, 1, 0, 100000);
                actor.data.get(HITS, out int hits);

                // addFlag() is false when the flag was already there: the reward happens once
                if (hits >= 50 && actor.data.addFlag(VETERAN))
                {
                    actor.addTrait("veteran");
                }
                return true;
            };

            AssetManager.traits.add(grudge);
            grudge.base_stats["damage"] = 2f;
        }

        /** Anyone can read it back, a window, a patch, another trait. */
        public static int GetHits(Actor pActor)
        {
            if (pActor == null) return 0;
            pActor.data.get(HITS, out int hits);
            return hits;
        }
    }
}
```

Salve o mundo e carregue-o novamente: a contagem continua lá, pois faz parte dos dados de salvamento da própria unidade. A flag é o que faz a recompensa acontecer uma única vez e não a cada golpe após o quinquagésimo. Generoso, mas ainda é um bug.

Seus textos, como em qualquer traço:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_grudge": "Grudge",
  "trait_hello_grudge_info": "Remembers every blow it lands. Fifty, and it has seen enough to be a veteran."
}
```

> [!WARNING] `Actor.data` é `internal`
> O campo de dados de uma unidade é marcado como `internal` no assembly do jogo. O NML compila seu mod contra uma cópia **publicizada**, portanto funciona diretamente em um mod de código-fonte normal. Isso só quebra se você compilar sua própria `.dll` contra o assembly original sem modificações: veja **[Solução de problemas](#/troubleshooting)**. O campo `data` de cidades e reinos é público por padrão.

## Onde isso reside

| Objeto | Seus dados |
| --- | --- |
| Uma unidade | `actor.data` |
| Uma cidade | `city.data` |
| Um reino | `kingdom.data` |
| Uma construção | `building.data` |
| Culturas (culture), religiões (religion), clãs, idiomas, famílias, exércitos, complôs (plot) | os respectivos `data`, todos usam o mesmo armazenamento |

## Coisas para saber

- **Use prefixo em suas chaves.** Todos os mods escrevem no mesmo armazenamento. `hello_hits` nunca colidirá com ninguém; `hits` eventualmente colidirá.
- **Remover o mod é seguro.** As chaves permanecem no save, ninguém as lê e nada quebra. Essa é a enorme vantagem sobre patchear o formato de save nativo do jogo.
- **Armazenamentos vazios não custam nada.** O jogo descarta tabelas vazias antes de salvar, então uma chave removida realmente desaparece.
- **Mantenha os dados pequenos.** Eles são salvos com cada unidade. Um contador ou uma flag por criatura é levíssimo; uma string longa por unidade em um mundo com dez mil criaturas aumentará o save para todos.

## O mundo inteiro

Alguns estados não pertencem a nenhuma unidade: quantos meteoros o seu poder já derrubou neste mundo, se a bênção única já aconteceu. O mundo tem o mesmo armazenamento, nas suas estatísticas de mapa:

```csharp
// map_stats é internal: tranquilo num mod de código-fonte NML, mesma situação do actor.data acima
SaveCustomData world = World.world?.map_stats?.custom_data;
if (world == null) return;

world.change("hello_meteors", 1, 0, 1000000);   // change() limita a 1000 a menos que você diga o contrário
if (world.addFlag("hello_blessed")) { /* só na primeira vez neste mundo */ }
```

`SaveCustomData` é o mesmo armazenamento `BaseSystemData`, então toda chamada na tabela do topo funciona, e o `Set` / `TryGet` do NML também. É salvo junto com o resto das estatísticas de mapa, então cada slot de save tem o seu próprio. Um mundo recém-gerado começa vazio. O jogo cria o armazenamento sempre que constrói ou carrega as estatísticas de mapa, então a checagem de nulo nunca deveria disparar; não custa nada, mantenha-a.

> [!TIP] Configurações ou dados do mundo?
> Pergunte se o jogador esperaria que o valor mudasse ao carregar outro save. "Quão forte é o poder do meteoro" não muda: isso é **[Configurações do mod](#/nml/mod-config)**, compartilhado por todo mundo. "Este mundo já foi abençoado" muda: isso é `custom_data`.

## Tempo que sobrevive a um save

`Time.time` é segundos desde que o jogo foi iniciado. Guarde isso nos dados de uma unidade, salve, reinicie, carregue, e todo timestamp que você escreveu é de uma vida anterior :wbfacepalm:.

O mundo mantém seu próprio relógio, e ele é salvo com o mapa:

```csharp
if (World.world == null || World.world.map_stats == null || Config.worldLoading) return;
if (actor == null || !actor.isAlive()) return;

// double, em segundos do mundo: 5 é um mês, 60 é um ano
double now = World.world.getCurWorldTime();

// o armazenamento não tem double, um float é suficiente para um timestamp
actor.data.set("hello_blessed_at", (float)now);

actor.data.get("hello_blessed_at", out float at, -1f);
bool blessedThisYear = at >= 0f && now - at < 60.0;
```

Ele também para quando o jogo está pausado e roda mais rápido em velocidades maiores, que é quase sempre o que você queria. `Date.getYearsSince(at)` e `Date.getMonthsSince(at)` fazem a divisão para você.

## Rodando código depois que um mundo carrega

Tudo acima é lido sob demanda, então geralmente você não precisa saber quando um mundo carregou. Quando precisa, digamos para reconstruir um cache seu, estes são os métodos que os mods engancham com **[Harmony](#/nml/harmony-patches)**:

| Método | Quando roda |
| --- | --- |
| `MapBox.clearWorld` (público) | Antes de qualquer mundo ser gerado ou carregado. Descarte seus caches estáticos aqui |
| `SaveManager.loadActors` (privado) | Durante o carregamento de um save, logo depois de as unidades serem reconstruídas |
| `MapBox.finishMakingWorld` (público) | Perto do fim tanto de gerar quanto de carregar um mundo |
| `SaveManager.saveWorldToDirectory` (público, estático) | Ao salvar, manual ou automático. Um Prefix é sua última chance de escrever no armazenamento |
| `MapBox.addLastStep` (privado) | Uma única vez, quando o jogo inicia. Não por mundo |
| `MapBox.OnApplicationQuit` (privado) | O jogo está fechando |

```csharp Mods/HelloBox/Code/HelloWorldCache.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloWorldCache
    {
        // uma cópia em cache para código que a lê todo frame; o save guarda a de verdade
        public static int MeteorsThisWorld;

        // roda tanto para um mundo novo quanto para um save carregado
        public static void Postfix()
        {
            MeteorsThisWorld = 0;
            SaveCustomData world = World.world?.map_stats?.custom_data;
            if (world == null) return;

            world.get("hello_meteors", out int meteors);
            MeteorsThisWorld = meteors;
        }
    }
}
```

Métodos privados recebem o nome como string, `[HarmonyPatch(typeof(SaveManager), "loadActors")]`, como a página do Harmony explica. A tela de carregamento ainda está aberta quando `finishMakingWorld` roda; alguns passos vêm depois dela.

## Seus próprios arquivos

Muitos mods pulam tudo isso e escrevem um arquivo JSON com `File.WriteAllText`, geralmente sob `Application.persistentDataPath`, que é a pasta `LocalLow\mkarpenko\WorldBox` ao lado do `Player.log`. Isso é bom para coisas que pertencem ao **jogador**: uma lista de unidades favoritas que ele exportou, estatísticas de todas as partidas que ele já jogou.

É errado para coisas que pertencem a um **mundo**. O arquivo não sabe qual slot de save está carregado. O jogador abençoa um reino no slot 1, carrega o slot 2, e o slot 2 também fica abençoado. Depois ele apaga o slot 1 e o seu arquivo mantém o estado para sempre :PES2_F:. Se deve mudar quando o save muda, vai no save, em um dos armazenamentos acima.

## Para onde ir agora

Para valores que o jogador escolhe uma vez e todo mundo compartilha, veja **[Configurações do mod](#/nml/mod-config)**. Para código que verifica algo todo frame, ou todo mês do jogo, veja **[Todo frame](#/nml/update-loops)** :PES_OkHand:.
