---
title: Modding com BepInEx
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# Modding com BepInEx :PES5_BigBrain:

A maior parte deste guia ensina a escrever mods para o **NeoModLoader**. Com o NML você escreve arquivos `.cs` comuns no Bloco de Notas, abre o jogo e vê o seu código compilar sozinho.

O BepInEx não liga para os seus sentimentos :PES2_Shrug:. É o framework de modding veterano e universal para Unity. Fazer um mod de BepInEx significa montar um projeto C# de verdade, compilar a sua própria `.dll` e colocar em `BepInEx/plugins/`. Você perde o recarregamento instantâneo e os ajudantes fáceis de assets, mas ganha controle total do processo do Unity antes mesmo de o jogo saber que acordou.

Esta parte do guia tem três páginas: esta coloca um plugin para rodar, **[Adicionando conteúdo com BepInEx](#/toolbox/bepinex-content)** faz ele adicionar coisas de verdade ao jogo, e **[Depuração e publicação](#/toolbox/bepinex-publishing)** leva ele até outras pessoas.

## BepInEx ou NeoModLoader

Antes de passar uma tarde montando um sistema de build, escolha a ferramenta certa:

| Você quer... | Escolha | Por quê |
| --- | --- | --- |
| Adicionar traços (trait), itens, poderes divinos (GodPower), criaturas ou biomas | **NML** | O NML te dá o `AssetManager` na hora certa, uma pasta `Locales`, `GameResources/`, botões e ajudantes de save de graça |
| Criar ferramentas de desenvolvimento, overlays ou ganchos no motor | **BepInEx** | O BepInEx inicia no nível do Mono, antes do WorldBox se inicializar |
| Editar código só no Bloco de Notas e salvar | **NML** | O NML compila arquivos C# enquanto o jogo roda |
| Distribuir um plugin já compilado com componentes puros do Unity | **BepInEx** | Você controla as opções do compilador, as dependências e o alvo do build |

Se você vai adicionar conteúdo ao jogo, escreva um mod de NML. Se vai criar uma ferramenta como o UnityExplorer, ou realmente gosta de ver a saída do MSBuild no terminal, o seu lugar é o BepInEx. Você *pode* adicionar conteúdo com BepInEx, a próxima página mostra como, mas refaz na mão o que o NML te dá de graça.

## 1. Pré-requisitos

1. Instale o **BepInEx 5 (Mono x64)** e ligue o console como explicado em **[O console ao vivo (BepInEx)](#/toolbox/bepinex-console)**. Abra o jogo uma vez para o BepInEx criar as pastas dele.
2. Instale o **[.NET SDK](https://dotnet.microsoft.com/)** (ou o Visual Studio com desenvolvimento para desktop .NET). Plugins de BepInEx precisam de um compilador C# de verdade.

## 2. Montando o projeto

Abra um terminal na pasta onde você guarda seus projetos e crie uma nova biblioteca de classes:

```bash
dotnet new classlib -n HelloBepInEx
cd HelloBepInEx
```

Depois troque todo o conteúdo de `HelloBepInEx.csproj` por isto. Ele usa a mesma versão de .NET do jogo, aponta para a sua pasta do WorldBox uma única vez e faz três trabalhos por você a cada build:

```xml HelloBepInEx.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>HelloBepInEx</AssemblyName>
    <Version>1.0.0</Version>
    <LangVersion>latest</LangVersion>
    <!-- Your WorldBox folder. Change this one line if Steam lives on another drive. -->
    <GameDir>C:\Program Files (x86)\Steam\steamapps\common\worldbox</GameDir>
  </PropertyGroup>

  <ItemGroup>
    <!-- Lets you build for net472 without installing the old .NET Framework developer pack -->
    <PackageReference Include="Microsoft.NETFramework.ReferenceAssemblies" Version="1.0.3" PrivateAssets="all" />
    <!-- Makes internal and private game code visible to your compiler, like NML does -->
    <PackageReference Include="BepInEx.AssemblyPublicizer.MSBuild" Version="0.4.3" PrivateAssets="all" />
  </ItemGroup>

  <ItemGroup>
    <!-- The game, publicized -->
    <Reference Include="$(GameDir)\worldbox_Data\Managed\Assembly-CSharp.dll" Publicize="true" Private="false" />
    <!-- Every Unity module: UnityEngine.dll alone does not have Input, UI or ImageConversion -->
    <Reference Include="$(GameDir)\worldbox_Data\Managed\UnityEngine*.dll" Private="false" />
    <!-- BepInEx and Harmony -->
    <Reference Include="$(GameDir)\BepInEx\core\BepInEx.dll" Private="false" />
    <Reference Include="$(GameDir)\BepInEx\core\0Harmony.dll" Private="false" />
  </ItemGroup>

  <!-- After every build, copy the plugin straight into the game -->
  <Target Name="CopyToGame" AfterTargets="Build">
    <Copy SourceFiles="$(TargetPath)" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
  </Target>
</Project>
```

Para que serve cada parte:

- **`Private="false"`** em cada referência do jogo: a sua pasta de build não copia o motor inteiro do jogo :PESgn_SMH:.
- **`Publicize="true"`**: as páginas de NML do guia usam membros `internal` do jogo o tempo todo, porque o NML compila contra um jogo "publicizado". O seu projeto de BepInEx não faz isso, a não ser que você peça. Com isso, o mesmo código compila aqui também. Os números de versão em `PackageReference` eram os estáveis mais novos quando eu escrevi isto; se o NuGet reclamar, use o mais novo que ele oferecer.
- **`UnityEngine*.dll`**: o Unity é dividido em vários módulos. `Input` fica em `UnityEngine.InputLegacyModule.dll`, a interface em `UnityEngine.UI.dll` e assim por diante. Referenciar todos te poupa da caça ao "tipo não encontrado".
- **`CopyToGame`**: chega de copiar a `.dll` na mão. Compile, abra o jogo, pronto.

## 3. O esqueleto do plugin

Um plugin de BepInEx é uma classe que herda de `BaseUnityPlugin` e tem o atributo `[BepInPlugin]`:

```csharp Plugin.cs
using BepInEx;
using BepInEx.Configuration;
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [BepInPlugin(PLUGIN_GUID, PLUGIN_NAME, PLUGIN_VERSION)]
    [BepInProcess("worldbox.exe")]
    public class HelloPlugin : BaseUnityPlugin
    {
        public const string PLUGIN_GUID = "com.example.hellobepinex";
        public const string PLUGIN_NAME = "HelloBepInEx";
        public const string PLUGIN_VERSION = "1.0.0";

        // BepInEx manages configuration files automatically
        private ConfigEntry<bool> configEnableLogs;
        private ConfigEntry<KeyCode> configHotkey;

        private void Awake()
        {
            // Bind configuration: section, key, default value, description
            configEnableLogs = Config.Bind(
                "General",
                "EnableLogs",
                true,
                "Print debug messages to the BepInEx console."
            );

            configHotkey = Config.Bind(
                "Controls",
                "ToggleKey",
                KeyCode.F7,
                "Key to press to trigger the plugin action."
            );

            if (configEnableLogs.Value)
            {
                Logger.LogInfo($"{PLUGIN_NAME} loaded successfully!");
            }

            // Apply any Harmony patches in this assembly
            Harmony harmony = new Harmony(PLUGIN_GUID);
            harmony.PatchAll();
        }

        private void Update()
        {
            // Standard Unity Update cycle
            if (Input.GetKeyDown(configHotkey.Value))
            {
                Logger.LogInfo("Hotkey pressed from BepInEx!");
            }
        }
    }
}
```

### As partes, uma por uma

- **`BaseUnityPlugin`**: herda direto do `MonoBehaviour` do Unity. O seu plugin é um componente ativo num `GameObject` persistente que sobrevive às trocas de cena.
- **`[BepInPlugin(guid, name, version)]`**: diz ao BepInEx como o seu mod se chama e qual é o identificador único dele. Use o formato de domínio invertido (`com.author.modname`) e nunca mude o GUID depois de lançar: o arquivo de config e as dependências de outros plugins dependem dele.
- **`[BepInProcess("worldbox.exe")]`**: só carregar dentro do WorldBox. Não atrapalha aqui, e evita um crash confuso se alguém colocar o seu plugin no BepInEx de outro jogo.
- **`Logger.LogInfo()`**: escreve direto no console ao vivo do BepInEx e em `BepInEx/LogOutput.log`.
- **`Config.Bind()`**: cria uma configuração com tipo. Na primeira vez que o plugin roda, o BepInEx gera um arquivo `BepInEx/config/com.example.hellobepinex.cfg` limpo que os jogadores podem editar.

## 4. Conectando ao jogo com Harmony

No BepInEx, o Harmony já vem em `BepInEx/core/0Harmony.dll`. Adicione uma classe de patch em qualquer lugar do projeto:

```csharp Patches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    // MapBox.startTheGame runs once the world exists: it is where the game sets Config.game_loaded
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.startTheGame))]
    public static class StartTheGamePatch
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            Debug.Log("[HelloBepInEx] The world is ready!");
        }
    }
}
```

Como o `Plugin.cs` chamou `harmony.PatchAll()`, o Harmony varre a sua assembly compilada e aplica todas as classes de patch dela. Tudo que você sabe de **[Patches do Harmony](#/nml/harmony-patches)** funciona igual aqui: os nomes de parâmetro mágicos, Prefix e Postfix, as regras para não quebrar outros mods.

## 5. Compilando e instalando

Compile o projeto pela linha de comando:

```bash
dotnet build -c Release
```

A sua `.dll` é criada em `bin/Release/net472/HelloBepInEx.dll`, e o passo `CopyToGame` coloca ela direto no jogo:

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

Abra o jogo com o console ligado. Você vai ver o BepInEx encontrar e carregar a sua assembly:

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

> [!WARNING] Feche o jogo antes de compilar
> Enquanto o WorldBox está aberto, ele segura a sua `.dll`, e a cópia falha com "the process cannot access the file". Feche o jogo, compile, abra de novo. Esse é todo o ciclo de desenvolvimento com BepInEx :PES2_Weary:.

## Verdades duras sobre modding com BepInEx

- **Sem recarregamento a quente**: mudar uma linha de código significa fechar o WorldBox, rodar `dotnet build` e abrir o jogo de novo. Se você está ajustando combate ou números de traços, cansa rápido. Tem uma meia solução em **[Depuração e publicação](#/toolbox/bepinex-publishing)**.
- **`HideManagerGameObject`**: em `BepInEx/config/BepInEx.cfg`, coloque `HideManagerGameObject = true` na seção `[Chainloader]`. Sem isso, algumas rotinas de limpeza do Unity podem destruir o objeto raiz do BepInEx e matar o seu plugin em silêncio :PES5_Hmmmm:.
- **Junto com o NML**: NML e BepInEx convivem numa boa na mesma pasta do jogo. Você pode usar NML para os mods de conteúdo e BepInEx para ferramentas como o UnityExplorer sem briga.
- **Acesso aos assets do jogo**: o seu plugin acorda antes de o jogo montar as bibliotecas (library) de assets. Mexa no `AssetManager` no `Awake()` e você recebe nulls. A próxima página, **[Adicionando conteúdo com BepInEx](#/toolbox/bepinex-content)**, mostra o momento exato de se conectar.
