---
title: Outros mods
group: NML Modding
subgroup: Avançado e publicação
icon: :wbmodders:
order: 45
---

# Outros mods :wbmodders:

Seu mod não vive num mundo vazio. Um jogador pode instalar o HelloBox junto com outros vinte mods, metade deles também tentando alterar combate, ajustar leis do mundo (world law) ou adicionar novos traços.

Às vezes você quer se coordenar com eles: ativar recursos extras se um mod parceiro estiver instalado, aplicar patches nos métodos deles com segurança sem travar se estiverem ausentes, ou garantir que seus assets se registrem na ordem certa.

Há duas formas de conversar com outros mods: em tempo de compilação, pelo `mod.json`, ou em tempo de execução, pelo código.

## Declarando dependências no mod.json

A integração mais limpa é declarar a relação no seu `mod.json`:

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "Markami",
  "version": "1.0.0",
  "description": "My first mod",
  "iconPath": "icon.png",
  "GUID": "com.markami.hellobox",
  "Dependencies": [],
  "OptionalDependencies": [
    "com.friend.coolmod"
  ],
  "IncompatibleWith": []
}
```

| Chave | O que faz |
| --- | --- |
| `Dependencies` | Requisito obrigatório. O NML garante que esses mods carreguem **antes** do seu. Se algum estiver ausente ou falhar ao compilar, o NML se recusa a carregar o seu mod de vez |
| `OptionalDependencies` | Requisito opcional. Se o outro mod estiver instalado, o NML o carrega antes do seu **e** define um símbolo de compilação para ele. Se estiver ausente, seu mod carrega normalmente |
| `IncompatibleWith` | Lista de bloqueio. Se qualquer mod desta lista estiver presente, o NML sinaliza um conflito e impede que os dois rodem juntos |

### O símbolo #if em tempo de compilação

Quando um mod listado em `OptionalDependencies` está instalado e é compilado, o NML define uma constante de pré-processador para você.

O símbolo é o GUID do outro mod convertido para maiúsculas, com todos os caracteres não alfanuméricos trocados por underline:

| GUID no `mod.json` | Símbolo de compilação definido |
| --- | --- |
| `com.friend.coolmod` | `COM_FRIEND_COOLMOD` |
| `com.author.magic-items` | `COM_AUTHOR_MAGIC_ITEMS` |

Envolva seu código de integração em `#if`:

```csharp Mods/HelloBox/Code/HelloIntegration.cs
namespace HelloBox
{
    public static class HelloIntegration
    {
        public static void Initialize()
        {
#if COM_FRIEND_COOLMOD
            // Compilado apenas quando o outro mod está presente e ativo
            ApplyCoolModSynergy();
#endif
        }

#if COM_FRIEND_COOLMOD
        private static void ApplyCoolModSynergy()
        {
            // Seguro referenciar os tipos deles diretamente aqui
            Main.Log("CoolMod found! Enabling partner synergies.");
        }
#endif
    }
}
```

> [!WARNING] Símbolos com erro de digitação falham em silêncio
> Se você escrever `#if COM_FRIEND_COOL_MOD` em vez de `#if COM_FRIEND_COOLMOD`, o compilador vê um símbolo não definido e simplesmente remove o bloco de código. Ele nunca roda, sem nenhum erro ou aviso no log :PES4_1IQ:. Sempre confira duas vezes a conversão exata do GUID.

## Verificando em tempo de execução

O truque do `#if` só funciona quando o NML compila seu mod a partir do código-fonte, e apenas quando o outro mod está declarado em `OptionalDependencies`.

Se você distribuir uma `.dll` pré-compilada, ou quiser verificar mods dinamicamente sem recompilar, verifique em tempo de execução.

### Verificando assemblies carregados

Você pode verificar se o assembly do outro mod está carregado no `AppDomain` atual:

```csharp
using System;
using System.Linq;

public static bool IsModLoaded(string pAssemblyName)
{
    return AppDomain.CurrentDomain.GetAssemblies()
        .Any(a => string.Equals(a.GetName().Name, pAssemblyName, StringComparison.OrdinalIgnoreCase));
}
```

Ou pergunte ao `AccessTools` do Harmony se uma das classes deles existe:

```csharp
using HarmonyLib;

bool hasPartner = AccessTools.TypeByName("PartnerNamespace.PartnerMain") != null;
```

Se `AccessTools.TypeByName` retornar um `Type` não nulo, o código deles está carregado e pronto.

## Aplicando patch do Harmony em outro mod

Fazer patch num método vanilla é direto. Fazer patch num método que vive em outro mod tem uma armadilha enorme :wbfacepalm:.

Se você escrever uma classe de patch normal referenciando o tipo deles:

```csharp
// NUNCA faça isso para um mod opcional!
[HarmonyPatch(typeof(PartnerMod.SomeClass), "SomeMethod")]
public static class BadCrossModPatch
{
    public static void Postfix() { }
}
```

O runtime Mono tenta resolver `PartnerMod.SomeClass` assim que carrega sua classe de patch. Se o jogador não tiver aquele mod instalado, seu mod inteiro trava com uma `TypeLoadException` ou `FileNotFoundException` antes mesmo do seu `Initialize()` terminar!

Em vez disso, aplique o patch **manualmente** com `AccessTools`:

```csharp Mods/HelloBox/Code/HelloCrossPatch.cs
using System;
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCrossPatch
    {
        public static void ApplyIfPresent(Harmony pPatchEngine)
        {
            Type targetType = AccessTools.TypeByName("PartnerMod.SomeClass");
            if (targetType == null)
            {
                // O outro mod não está instalado. Pule em paz.
                return;
            }

            MethodInfo targetMethod = AccessTools.Method(targetType, "SomeMethod");
            if (targetMethod == null)
            {
                Main.LogWarning("PartnerMod found, but SomeMethod was not found. Outdated version?");
                return;
            }

            MethodInfo postfix = typeof(HelloCrossPatch).GetMethod(nameof(Postfix), BindingFlags.Static | BindingFlags.NonPublic);
            pPatchEngine.Patch(targetMethod, postfix: new HarmonyMethod(postfix));
            Main.Log("Successfully hooked PartnerMod.SomeMethod!");
        }

        private static void Postfix()
        {
            // Roda depois do método deles, só se o mod deles estiver instalado
        }
    }
}
```

O patch manual mantém a referência do tipo baseada em string, então o runtime nunca tenta carregar um assembly ausente.

## A armadilha da ordem de carregamento

Quando você clona ou referencia conteúdo de outro mod, o momento certo é tudo.

```csharp
// Se o mod deles ainda não rodou Initialize(), isso lança NullReferenceException!
AssetManager.traits.clone("hello_super_trait", "partner_custom_trait");
```

O NML carrega mods na ordem de dependência. Se você colocar o outro mod em `Dependencies` ou `OptionalDependencies`, o NML garante que o `Initialize()` deles rode **antes** do seu.

Se você *não* os declarou como dependência, a ordem de carregamento entre mods não é especificada. Sempre:
1. Declare o outro mod em `OptionalDependencies`.
2. Proteja com `AssetManager.traits.has(...)` antes de clonar ou ler os assets deles.

## Compartilhando dados sem conflitos

O WorldBox oferece dicionários flexíveis para guardar dados personalizados em unidades (`actor.data`) e em mundos (`World.world.map_stats.custom_data`).

Todo mod compartilha esses mesmos dicionários. Se você escrever:

```csharp
// Ruim: outra pessoa pode usar "level" também
actor.data.set("level", 5);
```

Outro mod pode escrever em `"level"` no mesmo frame com premissas completamente diferentes.

Sempre coloque prefixo do seu mod nas chaves de dados personalizados:

```csharp
actor.data.set("hello_level", 5);
int myLevel = actor.data.get("hello_level", 0);
```

Próximo: **[Publicando seu mod](#/nml/publishing)** ou gerencie a velocidade de simulação e opções em **[Opções de jogo e escalas de tempo](#/nml/game-options)**.
