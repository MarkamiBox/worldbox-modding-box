---
title: Patches com Harmony
group: NML Modding
subgroup: Avançado e publicação
icon: :wbhammer:
order: 42
---

# Patches com Harmony :wbhammer:

Tudo nas outras páginas **adiciona** coisas ao WorldBox: um traço (trait), uma arma, uma construção (building). O Harmony serve para a outra metade do modding: **alterar o que o jogo já faz**.

Você não pode editar o código do jogo diretamente. Ele é compilado, vem como `Assembly-CSharp.dll` e a próxima atualização sobrescreveria qualquer alteração. O Harmony é a biblioteca (library) que permite acoplar o seu próprio código a um método existente enquanto o jogo está rodando.

> [!NOTE] Nunca escreveu código antes?
> Leia "O que é um método" e "O bilhete adesivo", depois vá criar algo nas páginas de **Conteúdo do jogo** e volte depois. O Harmony não é difícil, mas é a primeira coisa que pode quebrar os mods de *outras pessoas*, e você escreverá patches muito melhores depois de ver como os próprios assets do jogo são estruturados :PES_Wise:.

## O que é um método

Um **método** é uma ação nomeada dentro do código do jogo. Alguns exemplos reais:

| Método | Quando o jogo executa |
| --- | --- |
| `Actor.updateStats()` | Toda vez que os atributos (stats) de uma unidade precisam ser recalculados |
| `Actor.getHit(...)` | Toda vez que uma unidade sofre dano |
| `City.makeWarrior(...)` | Toda vez que uma cidade transforma um cidadão em guerreiro |

O jogo chama milhares desses métodos por segundo. Cada um deles é um ponto onde você pode se conectar.

## O post-it

Imagine um método como uma página no livro (book) de receitas do jogo. O Harmony não reescreve a página. Ele cola dois bilhetes nela:

```text
┌─────────────────────────────┐
│  SEU PREFIX                 │  <- executa ANTES do código do jogo
├─────────────────────────────┤
│  o código original do jogo  │  <- intacto
├─────────────────────────────┤
│  SEU POSTFIX                │  <- executa DEPOIS do código do jogo
└─────────────────────────────┘
```

- Um **Prefix** vê os parâmetros recebidos antes do jogo. Ele pode alterá-los e pode cancelar a execução inteira.
- Um **Postfix** vê o resultado depois que o jogo terminou. Ele pode alterar esse resultado ou apenas reagir a ele.

Isso é 95% do Harmony. O resto desta página são detalhes práticos.

## Ativando o Harmony

Uma única linha, uma única vez em `OnModLoad`. Ela procura patches no seu mod e aplica todos os que encontrar:

```csharp Mods/HelloBox/Code/Main.cs
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");

            // "com.yourname.hellobox" é o seu GUID. O Harmony rotula seus patches com ele,
            // então em caso de conflito o log diz claramente de quem é a culpa.
            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
        }
    }
}
```

`Assembly.GetExecutingAssembly()` significa "apenas os meus próprios arquivos". Não é enfeite opcional: sem isso, o `PatchAll()` escaneia o assembly de onde foi chamado, e em um dia ruim isso será o mod de outra pessoa :PESgn_Yikes:.

## Seu primeiro patch, linha por linha

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPatches
    {
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Actor_UpdateStats
        {
            public static void Postfix(Actor __instance)
            {
                if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

Seis coisas estão acontecendo:

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**: o endereço. "O método chamado `updateStats`, na classe chamada `Actor`." Uma linha entre colchetes é um *atributo*: uma etiqueta que o computador lê, não código que roda.
- **`public static class Patch_Actor_UpdateStats`**: um recipiente. O nome é seu e não muda nada, mas o seu eu do futuro vai agradecer por `Patch_<Class>_<Method>`.
- **`public static void Postfix(...)`**: esse nome **não** é seu, a menos que você o rotule. Sem um rótulo, o Harmony procura um método escrito exatamente `Prefix`, `Postfix` ou `Finalizer`. Escreva `postfix` e nada acontece, sem erro nenhum :PESgn_ButWhy:. A solução é o rótulo, em "Nomeando os métodos de patch você mesmo" abaixo.
- **`Actor __instance`**: **dois** underlines. É a unidade específica em que o jogo está trabalhando agora. Sem isso você sabe *que* os atributos de uma unidade foram recalculados, mas não *de qual*.
- **`if (!__instance.hasTrait(...)) return;`**: saia cedo. Seu patch roda para cada unidade do mundo, para sempre. Faça do caso comum uma verificação e um `return`.
- **`stats["speed"] += 20f;`**: a mudança de verdade. `updateStats` limpa e reconstrói o bloco de atributos no começo, então somar num Postfix cai numa folha em branco em vez de acumular a cada tick.

> [!DANGER] `updateStats` não roda na thread principal
> O jogo o registra como um job **paralelo** (`createJob(out c_stats_dirty, updateStats, JobType.Parallel, ...)`, e `Config.parallel_jobs_updater` é `true` por padrão), então seu Postfix roda numa thread de trabalho (job), em várias unidades ao mesmo tempo. Lá dentro, mexa **só nos números daquela unidade**. Chamar o Unity (`Time.time`, `transform`, `Destroy`, `Resources.Load`), o ajudante aleatório do jogo `Randy`, ou escrever numa lista compartilhada sua é um crash que só aparece no computador de outra pessoa.
>
> Se precisar de alguma dessas coisas, coloque a unidade numa fila e faça o trabalho no seu próprio `Update()`:
> ```csharp
> public static readonly System.Collections.Concurrent.ConcurrentQueue<Actor> pending = new();
>
> public static void Postfix(Actor __instance)
> {
>     if (!__instance.hasTrait(HelloTraits.GIGACHAD)) return;
>     __instance.stats["speed"] += 20f;   // this unit's own data: fine
>     pending.Enqueue(__instance);        // everything else waits for the main thread
> }
> ```

## Os nomes mágicos dos parâmetros

O Harmony preenche os parâmetros **por nome**. Estes são os que importam, e os underlines fazem parte do identificador:

| Nome | O que você recebe |
| --- | --- |
| `__instance` | O objeto sobre o qual o método foi chamado. Omita para métodos `static` |
| `__result` | O valor de retorno do método. Declare como `ref` para alterá-lo. Apenas no Postfix |
| `___someField` | **Três** underlines: um campo privado daquele objeto, com a grafia exata do jogo |
| `__state` | Um valor que o seu Prefix guarda para o seu próprio Postfix usar |
| qualquer nome de parâmetro real | O argumento que o chamador passou, com a grafia **exata** do jogo |

Essa última linha é onde quase todo mundo tropeça, de novo e de novo. Se o jogo declara `getHit(float pDamage, ...)`, seu parâmetro precisa se chamar `pDamage`. Não `damage`, nem `pDmg`. Você pode listar apenas os parâmetros que interessam e omitir o resto, mas os que listar precisam ser idênticos - e neste jogo quase todos começam com `p`.

## Alterando um resultado

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    // ref significa "você pode escrever aqui", e o que você escrever é o que o chamador receberá.
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;

        __result *= 1.5f;
    }
}
```

Ajuste, não atribua cegamente. `__result *= 1.5f` ainda funciona pacificamente se outro mod tiver alterado o mesmo método. `__result = 12f` joga o trabalho dele fora e cria discussões na sua seção de comentários.


## Alterando um número fixo no jogo

Metade dos pedidos do tipo "alguém pode fazer um mod que..." é apenas um número. Nada é impossível, só que ninguém fez ainda :wbbru:. "Cidades crescem demais" é isso, tirado diretamente da classe `City` do jogo:

```csharp Assembly-CSharp / City
public int getZoneRange(bool pAllowCheat = true)
{
    if (pAllowCheat && DebugConfig.isOn(DebugOption.CityUnlimitedZoneRange))
    {
        return 999;
    }
    return 13;
}
```

Um método que retorna uma constante é a coisa mais fácil de alterar no jogo. Você não mexe na constante, altera o que ele retorna:

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBox
{
    [HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
    public static class Patch_City_ZoneRange
    {
        private const float SCALE = 0.5f;   // cidades com metade do tamanho

        public static void Postfix(ref int __result)
        {
            // 999 é a opção de debug "unlimited zone range". Não mexa no cheat do jogador
            if (__result == 999) return;

            __result = Mathf.Max(1, Mathf.RoundToInt(__result * SCALE));
        }
    }
}
```

Coloque `SCALE` atrás de um slider na **[Configuração do mod](#/nml/mod-config)** e os jogadores poderão ajustá-lo sozinhos.

Encontrar o método é o trabalho real. Procure no **dnSpy** pelo número que você vê no jogo (13 zonas, 2 armas, 5 anos) ou pelo substantivo da regra ("zone", "limit", "max"). Uma constante em um método pequeno é um Postfix. Uma constante oculta no meio de um método longo exige um transpiler, e é aí que esta página para :PES2_Shrug:.

## Cancelando o método original

Um Prefix que retorna `bool` decide se o código original do jogo deve rodar ou não:

```csharp
[HarmonyPatch(typeof(Actor), "getHit")]
public static class Patch_Actor_GetHit
{
    public static bool Prefix(Actor __instance, float pDamage)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return true;

        // false = pula completamente o getHit do jogo. A unidade não sofre dano.
        return false;
    }
}
```

Observe o formato: o caso especial retorna `false`, e **todos os outros casos retornam `true`**. Se esquecer esse `return true`, você desativará o dano no mundo inteiro.

> [!WARNING] `return false` é a opção nuclear
> Ele não pula apenas a *sua* versão do método. Ele pula o código do jogo **para todo mundo**. O Postfix de qualquer outro mod naquele método ainda roda, reagindo a uma chamada que nunca aconteceu. Um método vanilla geralmente faz cinco coisas que você nem imagina, e cancelá-lo desativa todas as cinco em silêncio.
>
> Antes de escrever `return false`, veja se um Postfix não resolveria. "Curar o dano logo depois" quebra infinitamente menos coisas do que "nunca houve dano algum" :PES3_Balance:.

## Duas maneiras de escrever o nome do método

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // método público
[HarmonyPatch(typeof(Actor), "updateStats")]             // qualquer outro caso
```

`nameof` é melhor porque um erro de digitação vira um erro de compilação em vez de um patch que silenciosamente nunca é aplicado. Mas o `nameof` só funciona em membros visíveis para o seu código, e grande parte do WorldBox é `internal` ou `private`. Para esses a string pura é a única opção, então confira o nome no código real em **[Lendo o código do jogo](#/toolbox/reading-the-game-code)**.

## Nomeando os métodos de patch você mesmo

Os nomes mágicos `Prefix` e `Postfix` são uma convenção, não uma exigência. Coloque um rótulo no método e chame-o do que quiser:

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_UpdateStats
{
    [HarmonyPostfix]
    public static void AddSwiftSpeed(Actor __instance)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;
        __instance.stats["speed"] += 20f;
    }
}
```

`[HarmonyPrefix]`, `[HarmonyPostfix]` e `[HarmonyFinalizer]` existem todos. Com o rótulo, o nome do método é só para você, e o problema de "`Postfix` com erro de digitação, nada acontece" desaparece. Isso também permite manter um Prefix e um Postfix para alvos diferentes na mesma classe sem os nomes brigarem entre si. Cerca de metade dos mods por aí faz assim, e são a metade que nunca perde uma noite por causa de um `p` minúsculo.

## Quando dois métodos compartilham o mesmo nome

Aí classe + nome é ambíguo. O Harmony não tenta adivinhar e o seu mod morre na inicialização com uma `AmbiguousMatchException`. `Actor` tem dois métodos `addTrait`:

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool addTrait(ActorTrait pTrait, bool pRemoveOpposites = false)
```

Especifique os tipos dos parâmetros do que você quer, **todos** eles, incluindo os que têm valor padrão:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.addTrait), new System.Type[] { typeof(string), typeof(bool) })]
```

Outras sobrecargas reais que pegam as pessoas: `TileZone.isGoodForNewCity()` e `isGoodForNewCity(Actor pActor)`, e `SaveManager.loadWorld()` e `loadWorld(string pPath, bool pLoadWorkshop = false)` (ambos `internal`, então só strings). Na dúvida, procure o nome do método na classe antes de escrever o atributo.

## Patches que precisam de um antes e um depois

`__state` é um valor que o seu Prefix entrega para o seu Postfix naquela mesma chamada. Use-o para lembrar como algo era antes do jogo mexer:

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_StatDelta
{
    public static void Prefix(Actor __instance, out float __state)
    {
        __state = __instance.stats["health"];
    }

    public static void Postfix(Actor __instance, float __state)
    {
        if (__instance.stats["health"] < __state) { /* algo tirou vida */ }
    }
}
```

## Propriedades e construtores

Nem tudo é um método simples. `Actor.is_moving` é uma propriedade: parece um campo, mas um bloco `get` roda toda vez que alguém a lê. Diga ao Harmony qual metade você quer:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.is_moving), MethodType.Getter)]
```

Depois disso é um patch normal, e `ref bool __result` é o que quem lê recebe de volta. `MethodType.Setter` é a outra metade. `MethodType.Constructor` faz patch no construtor de uma classe, onde `__instance` é o objeto sendo construído; se a classe tiver vários construtores, adicione o `Type[]` depois dele, exatamente como numa sobrecarga.

## Campos e métodos privados

Seu patch pode ver um campo privado de `__instance` pedindo-o como parâmetro: **três** underlines, depois o nome do campo exatamente como o jogo escreve. O jogo começa a maioria dos campos privados com seu próprio `_`, então o `_hover_timer` privado da unidade vira **quatro**:

```csharp
public static void Postfix(Actor __instance, ref float ____hover_timer)
```

`ref` se você quiser escrever nele. É complicado de ler e perfeitamente correto.

Fora de um patch, `AccessTools` e `Traverse` (ambos em `HarmonyLib`) alcançam as mesmas coisas:

```csharp
// de vez em quando: Traverse é curto e lento
float timer = Traverse.Create(pActor).Field("_hover_timer").GetValue<float>();

// todo frame: construa o acessor uma vez, depois é quase tão rápido quanto um campo normal
static readonly AccessTools.FieldRef<Actor, float> hover_timer = AccessTools.FieldRefAccess<Actor, float>("_hover_timer");
hover_timer(pActor) = 0f;   // é um ref, então isso escreve

// um método privado: reflection quer todo argumento, inclusive os padrão
AccessTools.Method(typeof(Actor), "die").Invoke(pActor, new object[] { false, AttackType.Other, true, true });
```

Uma string nomeia algo que o compilador não consegue checar. Se uma atualização renomear `_hover_timer`, você descobre em tempo de execução. A alternativa é um `Assembly-CSharp.dll` **publicizado**, onde `internal` e `private` ficam visíveis e um rename volta a ser um erro de compilação.

## Fazendo patch manualmente

`[HarmonyPatch]` mais `PatchAll` é o jeito fácil. O outro jeito é encontrar o método você mesmo e chamar `Patch`:

```csharp Mods/HelloBox/Code/HelloManualPatches.cs
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloManualPatches
    {
        private static readonly Harmony harmony = new Harmony("com.yourname.hellobox");

        public static void Initialize()
        {
            // existem duas sobrecargas de addTrait, então os tipos não são opcionais
            MethodInfo original = AccessTools.Method(typeof(Actor), nameof(Actor.addTrait), new[] { typeof(string), typeof(bool) });

            // null significa que uma atualização o renomeou: perca um recurso, não o mod inteiro
            if (original == null)
            {
                Main.LogWarning("Actor.addTrait(string, bool) not found, skipping that patch");
                return;
            }

            harmony.Patch(original, postfix: new HarmonyMethod(typeof(HelloManualPatches), nameof(AddTraitPostfix)));
        }

        public static void AddTraitPostfix(Actor __instance, string pTraitID, bool __result)
        {
            // __result é false quando a unidade já tinha o traço ou um oposto bloqueou
            if (!__result || pTraitID != HelloTraits.SWIFT) return;

            Main.LogInfo("Another unit got swift");
        }
    }
}
```

Mesmo id de Harmony do seu `PatchAll`, mesmas regras para os nomes dos parâmetros. O que você ganha é o `if` no meio. Recorra a isso quando:

- **O alvo pode não existir.** Um método que você suspeita que a próxima atualização vai mover, ou um que vive em *outro mod*. `AccessTools.TypeByName("TheirNamespace.TheirClass")` retorna `null` quando aquele mod não está instalado, e você simplesmente pula o patch. Veja **[Outros mods](#/nml/other-mods)**.
- **O patch depende de uma configuração.** Só faça o patch se o jogador ligou o recurso em **[Configurações do mod](#/nml/mod-config)**.
- **Você quer saber se funcionou.** Um alvo de `PatchAll` ausente lança exceção, e os patches que ainda não tinha alcançado nunca são aplicados. Aqui, um método ausente é uma linha de log.

## Quando vários mods fazem patch no mesmo método

Dentro de cada tipo de patch, o Harmony ordena os patches por prioridade, **maior primeiro**, com `Normal` como padrão. Dependências explícitas de `[HarmonyBefore]` e `[HarmonyAfter]` podem mudar essa ordem:

```csharp
[HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
public static class Patch_City_ZoneRange
{
    [HarmonyPostfix]
    [HarmonyPriority(Priority.Last)]
    public static void HalveZones(ref int __result) { /* ... */ }
}
```

Prioridades comuns são `First`, `High`, `Normal`, `Low`, `Last`. Isso importa quando a ordem muda a resposta:

- Um Postfix que **limita** um resultado (`Mathf.Min(__result, 20)`) quer `Priority.Last`, para limitar normalmente depois dos Postfixes de prioridade maior. Ele não consegue garantir ser o último contra outro patch `Last` ou dependências explícitas de ordenação.
- Um Prefix que **verifica** algo e pode dar `return false` quer `Priority.First` ou `High`, para decidir cedo. Não use isso como garantia de que outros Prefixes serão pulados: o NML distribui o HarmonyX, que [roda todos os Prefixes](https://github.com/BepInEx/HarmonyX/wiki/Prefix-changes) mesmo quando um retorna `false`.

Só defina isso quando tiver um motivo. Se todo mod pedir `First`, você volta à estaca zero de ninguém ser o primeiro :PES3_Balance:.

## Finalizers: pegando o que o jogo lança

Um Finalizer roda depois de tudo o mais, **mesmo se o método lançou uma exceção**. Ele recebe a exceção, e o que ele retornar é o que será lançado:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.setAttackTarget))]
public static class Patch_Actor_SetAttackTarget_Log
{
    public static System.Exception Finalizer(System.Exception __exception)
    {
        if (__exception != null) Main.LogError("setAttackTarget threw: " + __exception);

        // preserva a falha depois de registrá-la
        return __exception;
    }
}
```

Isso registra a falha sem escondê-la. Retornar `null` suprimiria a exceção, incluindo falhas de outros patches. Só faça isso para uma falha específica da qual você realmente consegue se recuperar. Um método que lançou no meio do caminho já fez metade do seu trabalho, e engolir a exceção deixa o mundo naquele estado :PESgn_Yikes:.

## Os métodos que mods mais fazem patch

Nos mods que eu revisei, esses aparecem repetidamente. As assinaturas vêm direto do código do jogo.

| Alvo | O que saber |
| --- | --- |
| `City.update(float pElapsed)` | Público. Roda todo frame para cada cidade. Verificação barata primeiro |
| `MapBox.Update()` | **Privado**, então `"Update"` como string. Roda todo frame, uma vez. Veja **[Todo frame](#/nml/update-loops)** antes de fazer patch nele |
| `Actor.updateStats()` | **Internal**. Roda num job paralelo, veja o aviso no topo |
| `Actor.getHit(float pDamage, bool pFlash, AttackType pAttackType, BaseSimObject pAttacker = null, ...)` | **Internal**. Todo golpe em toda unidade |
| `Actor.die(bool pDestroy = false, AttackType pType = AttackType.Other, bool pCountDeath = true, bool pLogFavorite = true)` | **Privado**, `"die"` como string |
| `Actor.setAttackTarget(BaseSimObject pAttackTarget)` | Público |
| `ItemCrafting.tryToCraftRandomWeapon(Actor pActor, City pCity)` | Público estático, retorna `bool`. Sem `__instance` |
| `DiplomacyManager.startWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pAsset, bool pLog = true)` | **Internal**, retorna a `War` |
| `WarManager.newWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pType)` | Público, retorna a `War` |
| `Kingdom.setKing(Actor pActor, bool pFromLoad = false)` | Público. Também roda enquanto um save carrega, verifique `pFromLoad` |
| `City.setLeader(Actor pActor, bool pNew)` | Público |
| `BabyMaker.makeBaby(Actor pParent1, Actor pParent2, ...)` | Público estático, retorna o bebê |
| `ActorManager.createNewUnit(string pStatsID, WorldTile pTile, ...)` | Público, retorna o novo `Actor`. Todo spawn passa por ele |

Alvos `private` e `internal` fazem patch normalmente com um nome em string, e seus parâmetros ainda são vinculados pelo nome. O que você não pode fazer sem um assembly publicizado é escrever `nameof(...)` para eles, ou tocar seus membros `internal` dentro do corpo do seu patch.

> [!NOTE] `World` é o suporte, `MapBox` é o alvo
> `typeof(World)` é C# válido, mesmo `World` sendo estático. É o alvo errado de Harmony para `Update` ou `finishMakingWorld`: esses métodos pertencem a `MapBox`, o tipo retornado por `World.world`. Um alvo errado falha quando o Harmony aplica o patch, não quando o C# compila o `typeof`.

## Quando não funciona

Antes de culpar o Harmony, leia o log. Raramente é o Harmony :PES5_Noted:.

| O que você vê | O que geralmente é |
| --- | --- |
| Nada acontece, nada no log | `Postfix` com erro de digitação e sem o rótulo `[HarmonyPostfix]`, ou você nunca chamou `PatchAll` |
| `HarmonyException` / `MissingMethodException` ao iniciar | Essa classe ou método não existe. Confira no dnSpy |
| `AmbiguousMatchException` / `Ambiguous match found` | Várias sobrecargas. Adicione o argumento `Type[]` mostrado acima |
| Crash que só acontece no computador de outras pessoas | Um Postfix em `Actor.updateStats` tocando na Unity, no `Randy` ou numa lista compartilhada a partir de uma thread de trabalho |
| `NullReferenceException` dentro do seu patch | `__instance` ou um de seus campos é null. Patches rodam em estados invisíveis no jogo normal: durante o carregamento, na morte, em objetos sendo destruídos |
| O jogo roda a 3 FPS | Você alterou um método que executa milhares de vezes por segundo e colocou cálculos pesados dentro |
| Funciona sozinho, quebra com outro mod | Um retorna `false`, ou ambos atribuem `__result` diretamente em vez de ajustar |

## Regras de boa convivência

- **Postfix por padrão.** Use um Prefix só quando precisar mudar um argumento ou impedir o método.
- **Ajuste, nunca atribua.** `+=`, `*=`, `Math.Min(...)`. Outra pessoa também fez patch nisso.
- **Verifique null, sempre.** Seu patch vai rodar durante o carregamento do mundo e durante a morte de uma unidade.
- **A verificação barata primeiro.** A primeira linha de um patch muito chamado deve ser o teste que te deixa dar `return`. `City.update` e `MapBox.Update` são os dois métodos que mods mais fazem patch, e os dois rodam todo frame. Uma busca em dicionário ali tudo bem. Um loop sobre cada unidade não.
- **Faça patch no método mais estreito que resolve.** Fazer patch em `Actor.updateStats` para a velocidade de um traço tudo bem. Fazer patch na atualização do mundo para a mesma coisa é como um mod acaba desinstalado.
- **Mantenha seus patches num único arquivo.** Quando alguém relatar um conflito, você vai querer ler um arquivo, não doze. Seja gentil com o seu eu do futuro. Faça o que eu digo, não o que os meus mods antigos fazem :trollface:.

> [!NOTE] Fazer patch em `has`, `get`, `add`, `clone` ou `post_init` de uma biblioteca não adianta
> Isso só afeta chamadas feitas depois que o seu mod carrega, nunca o registro vanilla que já aconteceu até lá. Veja **[Bibliotecas de assets](#/nml/asset-libraries)**.

## Transpilers: mudando as instruções

Um transpiler reescreve o IL, as instruções compiladas dentro de um método. Use quando a mudança pertence ao meio e nem um Prefix nem um Postfix conseguem expressá-la. Ele roda quando o Harmony constrói o método substituto, não a cada tick do jogo, e pode rodar de novo quando outro transpiler é adicionado.

Essa é a assinatura, dentro da sua classe de patch. Ela deliberadamente deixa tudo passar:

```csharp
public static System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> Transpiler(
    System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> instructions)
{
    return instructions;
}
```

Para uma reescrita de verdade:

1. Inspecione o IL do alvo no dnSpy. Combine uma sequência de opcodes e o campo ou operando de método específico, não "instrução 42" nem toda ocorrência de um número.
2. Colete as correspondências **antes** de editar. Verifique explicitamente a contagem esperada. Se você espera uma e encontra zero ou duas, registre a inconsistência no log e devolva a entrada intocada. Nunca emita metade de uma reescrita.
3. Preserve rótulos de desvio, blocos de exceção e os tipos e o equilíbrio da pilha de avaliação. Uma substituição que parece certa em C# ainda pode ser IL inválido.
4. Teste o caminho de correspondência e o de não correspondência, depois teste com outros patches no mesmo método.

A [documentação de transpiler do Harmony](https://harmony.pardeike.net/articles/patching-transpiler.html) cobre a API de instruções. Uma atualização do jogo é motivo para conferir o padrão de novo, não mover o índice mágico em três :PES5_BigBrain:.

O NML distribui o **HarmonyX**, um fork do Harmony. A API principal de patch é compartilhada, mas o comportamento pode diferir, inclusive o pulo de Prefixes. Próxima parada, se mais de um mod vai mexer na mesma coisa: **[Outros mods](#/nml/other-mods)**.
