---
title: Depuração e publicação
group: BepInEx Modding
icon: :wbfireworks:
order: 3
---

# Depuração e publicação :wbfireworks:

O seu plugin compila. Agora ele precisa carregar, funcionar e chegar até outras pessoas. Esta página são os erros que você realmente vai encontrar, na ordem em que aparecem, e depois como publicar a coisa.

## Onde olhar

| Arquivo | Onde | O que é |
| --- | --- | --- |
| A janela do console | Abre junto com o jogo, se você ligou | Tudo, ao vivo. Veja **[O console ao vivo (BepInEx)](#/toolbox/bepinex-console)** |
| `LogOutput.log` | `worldbox/BepInEx/` | A mesma coisa, salva. É o que as pessoas vão te pedir |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | O log do próprio Unity, para crashes que o BepInEx não pegou |

Procure primeiro o nome do seu plugin no `LogOutput.log`. O primeiro erro que menciona ele é o que importa, a mesma regra de **[Logs e depuração](#/nml/logs-and-debugging)**.

## Quando não compila

| Erro | O que significa | Solução |
| --- | --- | --- |
| `The reference assemblies for .NETFramework,Version=v4.7.2 were not found` | O seu PC não tem o pacote de desenvolvedor do .NET Framework 4.7.2 | O pacote `Microsoft.NETFramework.ReferenceAssemblies` da **[preparação do projeto](#/toolbox/bepinex-modding)** |
| `CS0246: The type or namespace name 'Input' could not be found` | Falta referenciar um módulo do Unity | Referencie `UnityEngine*.dll`, não só `UnityEngine.dll` |
| `CS0122: '...' is inaccessible due to its protection level` | Você usou um membro `internal` do jogo | `Publicize="true"` na referência ao `Assembly-CSharp` |
| `The process cannot access the file ... because it is being used by another process` | O jogo está aberto e segurando a sua `.dll` | Feche o WorldBox, compile de novo |
| `Could not find a part of the path` no passo de cópia | O `GameDir` do seu `.csproj` está errado | Aponte para a pasta que tem o `worldbox.exe` |

## Quando compila mas não carrega

Abra o jogo e procure uma linha `Loading [YourPlugin 1.0.0]`. Sem essa linha, o BepInEx nunca pegou o seu plugin:

| O que você vê | Por quê |
| --- | --- |
| Nenhuma linha | A `.dll` não está dentro de `BepInEx/plugins/`, ou o próprio BepInEx não está rodando (sem console, sem `LogOutput.log`) |
| Nenhuma linha, e a `.dll` está no lugar certo | O projeto usa o framework errado. Tem que ser `net472`, não `net8.0` nem `netstandard2.1` |
| A linha aparece, depois `Could not load file or assembly 'Something'` | Você usa uma biblioteca que não vai junto com o plugin. Coloque a `.dll` dela ao lado da sua na pasta do plugin |
| Dois plugins com o mesmo GUID | O BepInEx carrega só um. Normalmente uma cópia velha do seu próprio plugin em outra pasta |

## Quando carrega mas quebra

| Erro | O que costuma ser |
| --- | --- |
| `NullReferenceException` em `AssetManager...` | Você mexeu nas bibliotecas (library) do jogo cedo demais. Use o Postfix no `AssetManager.init()` de **[Adicionando conteúdo com BepInEx](#/toolbox/bepinex-content)** |
| `HarmonyException` / `Ambiguous match found` | Um patch aponta para um método que não existe ou que tem gêmeos. As mesmas soluções de **[Patches do Harmony](#/nml/harmony-patches)** |
| `MissingMethodException` / `TypeLoadException` depois de uma atualização do jogo | O jogo mudou por baixo de você. Siga **[Atualizar depois de uma atualização do jogo](#/nml/game-updates)** e compile de novo |
| O seu texto mostra chaves cruas depois de trocar o idioma | Falta o Postfix no `LocalizedTextManager.setLanguage` |
| O seu ícone está invisível | O sprite foi registrado depois de algo já ter pedido o caminho dele, ou aponta para uma pasta |
| Tudo funciona, depois o plugin para no meio do jogo | `HideManagerGameObject = true` em `BepInEx/config/BepInEx.cfg` |

## Um ciclo mais rápido

Fechar e abrir o WorldBox a cada mudança é a pior parte do BepInEx. O plugin **ScriptEngine** da coleção BepInEx.Debug alivia isso: plugins colocados em `BepInEx/scripts/` em vez de `plugins/` podem ser recarregados com uma tecla enquanto o jogo roda (veja o readme dele para a tecla atual).

É ótimo para ferramentas, janelas e overlays. Para conteúdo ajuda menos: o jogo não esquece um traço (trait) que você já registrou, e cada patch do Harmony aplicado continua ativo, a não ser que o seu plugin remova ao ser descarregado (`harmony.UnpatchSelf()` no `OnDestroy()`). Use enquanto monta uma interface, não enquanto ajusta um traço :PES2_Shrug:.

## Publicando

### O que vai no zip

Compile o plugin no modo Release e depois compacte para os jogadores extraírem direto na pasta do jogo:

```text HelloBepInEx.zip
HelloBepInEx.zip
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

O que **não** vai:

- **O próprio BepInEx.** Os jogadores instalam uma vez, igual você fez. Mande eles para a **[página do console](#/toolbox/bepinex-console)** e diga qual versão: BepInEx 5, Mono, x64.
- **Os arquivos do jogo.** `Assembly-CSharp.dll`, os módulos do Unity e principalmente a cópia publicizada que o build criou. É código do jogo, não é seu para compartilhar. O `Private="false"` no `.csproj` já deixa eles fora da sua pasta de build, então só não adicione na mão.
- **`BepInEx.dll` e `0Harmony.dll`.** O BepInEx já tem.

### O número de versão

Aumente em dois lugares e mantenha iguais: a `version` no `[BepInPlugin]` (o que o log e outros plugins veem) e o `<Version>` no `.csproj` (o que o arquivo `.dll` diz). Um plugin que mostra `1.0.0` na terceira versão deixa todo relatório de bug mais difícil.

### Dependendo de outro plugin

Se o seu plugin precisa que outro plugin de BepInEx carregue antes, avise, e o BepInEx organiza a ordem de carregamento e se recusa a carregar o seu sem ele:

```csharp
[BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
[BepInDependency("com.other.author.library")]
public class HelloPlugin : BaseUnityPlugin
```

Adicione `BepInDependency.DependencyFlags.SoftDependency` como segundo argumento quando o outro plugin for opcional e você só quiser carregar depois dele se ele estiver lá.

### Onde publicar

Nos mesmos lugares de qualquer outro mod de WorldBox, com os mesmos conselhos: veja **[Publicando](#/nml/publishing)**. A única linha a mais que a sua descrição precisa é "Requires BepInEx 5 (Mono x64)", bem no topo. Ela te poupa dos comentários "não funciona" de quem instalou num jogo só com NML :wbsalut:.
