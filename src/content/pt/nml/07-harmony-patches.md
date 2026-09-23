---
title: Patches com Harmony
group: NML Modding
subgroup: Avançado e publicação
icon: :wbhammer:
order: 42
---

# Patches com Harmony :wbhammer:

Tudo nas outras páginas **adiciona** coisas ao WorldBox: um traço, uma arma, uma construção. O Harmony serve para a outra metade do modding: **alterar o que o jogo já faz**.

Você não pode editar o código do jogo diretamente. Ele é compilado, vem como `Assembly-CSharp.dll` e a próxima atualização sobrescreveria qualquer alteração. O Harmony é a biblioteca que permite acoplar o seu próprio código a um método existente enquanto o jogo está rodando.

> [!NOTE] Nunca escreveu código antes?
> Leia "O que é um método" e "O bilhete adesivo", depois vá criar algo nas páginas de **Conteúdo do jogo** e volte depois. O Harmony não é difícil, mas é a primeira coisa que pode quebrar os mods de *outras pessoas*, e você escreverá patches muito melhores depois de ver como os próprios assets do jogo são estruturados :PES_Wise:.

## O que é um método

Um **método** é uma ação nomeada dentro do código do jogo. Alguns exemplos reais:

| Método | Quando o jogo executa |
| --- | --- |
| `Actor.updateStats()` | Toda vez que os atributos de uma unidade precisam ser recalculados |
| `Actor.getHit(...)` | Toda vez que uma unidade sofre dano |
| `City.makeWarrior(...)` | Toda vez que uma cidade transforma um cidadão em guerreiro |

O jogo chama milhares desses métodos por segundo. Cada um deles é um ponto onde você pode se conectar.

## O post-it

Imagine um método como uma página no livro de receitas do jogo. O Harmony não reescreve a página. Ele cola dois bilhetes nela:

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
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

Seis coisas estão acontecendo aqui:

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**: o endereço. "O método chamado `updateStats`, na classe chamada `Actor`." Uma linha entre colchetes é um *atributo*: um rótulo para o compilador, não código executável.
- **`public static class Patch_Actor_UpdateStats`**: um contêiner. O nome é seu e não muda nada, mas seu eu do futuro agradecerá por `Patch_<Classe>_<Método>`.
- **`public static void Postfix(...)`**: este nome **não** é seu. O Harmony procura especificamente por métodos chamados exatamente `Prefix`, `Postfix` ou `Finalizer`. Escreva `postfix` em minúsculas e nada acontecerá, sem erro algum :PESgn_ButWhy:.
- **`Actor __instance`**: **dois** underlines. Esta é a unidade específica em que o jogo está trabalhando agora. Sem isso você sabe *que* os atributos foram recalculados, mas não *de quem*.
- **`if (!__instance.hasTrait(...)) return;`**: saída rápida. Seu patch executa para todas as unidades do mundo, para sempre. Faça com que o caso comum seja uma verificação e um `return`.
- **`stats["speed"] += 20f;`**: a alteração real. O `updateStats` limpa e reconstrói o bloco de atributos no início, então somar no Postfix atua sobre uma base limpa em vez de se acumular a cada tick.

## Os nomes mágicos dos parâmetros

O Harmony preenche os parâmetros **por nome**. Estes são os que importam, e os underlines fazem parte do identificador:

| Nome | O que você recebe |
| --- | --- |
| `__instance` | O objeto sobre o qual o método foi chamado. Omita para métodos `static` |
| `__result` | O valor de retorno do método. Declare como `ref` para alterá-lo. Apenas no Postfix |
| `___someField` | **Três** underlines: um campo privado daquele objeto, com a grafia exata do jogo |
| `__state` | Um valor que o seu Prefix guarda para o seu próprio Postfix usar |
| qualquer nome de parâmetro real | O argumento que o chamador passou, com a grafia **exata** do jogo |

Essa última linha é onde quase todo mundo tropeça. Se o jogo declara `getHit(float pDamage, ...)`, seu parâmetro precisa se chamar `pDamage`. Não `damage`, nem `pDmg`. Você pode listar apenas os parâmetros que interessam e omitir o resto, mas os que listar precisam ser idênticos - e neste jogo quase todos começam com `p`.

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
> Ele não pula apenas a *sua* versão do método. Ele pula a de **todo mundo**: o código do jogo e o Prefix e Postfix de qualquer outro mod naquele método. Um método vanilla geralmente faz cinco coisas que você nem imagina, e cancelá-lo desativa todas as cinco em silêncio.
>
> Antes de escrever `return false`, veja se um Postfix não resolveria. "Curar o dano logo depois" quebra infinitamente menos coisas do que "nunca houve dano algum" :PES3_Balance:.

## Duas maneiras de escrever o nome do método

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // método público
[HarmonyPatch(typeof(Actor), "updateStats")]             // qualquer outro caso
```

`nameof` é melhor porque um erro de digitação vira um erro de compilação em vez de um patch que silenciosamente nunca é aplicado. Mas o `nameof` só funciona em membros visíveis para o seu código, e grande parte do WorldBox é `internal` ou `private`. Para esses a string pura é a única opção, então confira o nome no código real em **[Lendo o código do jogo](#/toolbox/reading-the-game-code)**.

## Quando dois métodos compartilham o mesmo nome

Quando dois métodos compartilham o mesmo nome, classe + nome é ambíguo e o Harmony não tentará adivinhar. Especifique os tipos dos parâmetros:

```csharp
[HarmonyPatch(typeof(World), "GetTile", new System.Type[] { typeof(int), typeof(int) })]
```

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

## Quando não funciona

| O que você vê | O que geralmente é |
| --- | --- |
| Nada acontece, nada no log | `Postfix` com erro de digitação, ou você nunca chamou `PatchAll` |
| `HarmonyException` / `MissingMethodException` ao iniciar | Essa classe ou método não existe. Confira no dnSpy |
| `Ambiguous match found` | Várias sobrecargas. Adicione o argumento `Type[]` mostrado acima |
| `NullReferenceException` dentro do seu patch | `__instance` ou um de seus campos é null. Patches rodam em estados invisíveis no jogo normal: durante o carregamento, na morte, em objetos sendo destruídos |
| O jogo roda a 3 FPS | Você alterou um método que executa milhares de vezes por segundo e colocou cálculos pesados dentro |
| Funciona sozinho, quebra com outro mod | Um retorna `false`, ou ambos atribuem `__result` diretamente em vez de ajustar |

## Regras de boa convivência

- **Postfix por padrão.** Use um Prefix apenas quando precisar alterar um argumento ou interromper a execução.
- **Ajuste, nunca atribua diretamente.** `+=`, `*=`, `Math.Min(...)`. Outra pessoa também alterou isso.
- **Sempre verifique se é null.** Seu patch rodará durante o carregamento do mundo e durante a morte de uma unidade.
- **Verificação rápida primeiro.** A primeira linha de um patch frequente deve ser o teste que permite dar `return` logo.
- **Altere o método mais específico possível.** Modificar `Actor.updateStats` para a velocidade de um traço é perfeito. Modificar o loop de atualização do mundo inteiro para fazer o mesmo é como se faz um mod ser desinstalado.
- **Mantenha seus patches em um único arquivo.** Quando alguém relatar um conflito, você vai querer ler um arquivo, não doze.

## O que não cobriremos aqui

Os **Transpilers** reescrevem as instruções IL compiladas de um método uma por uma. Eles são incrivelmente poderosos e são a única forma de mudar um número escondido no meio de um método fechado, mas quebram a quase cada atualização do jogo. Se você algum dia chegar ao ponto de precisar de um, já não precisará mais deste guia :PES5_BigBrain:.
