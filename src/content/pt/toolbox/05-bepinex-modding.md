---
title: Modding com BepInEx
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# Modding com BepInEx :PES5_BigBrain:

A maior parte deste guia ensina a criar mods para o **NeoModLoader**. O NML permite que você edite arquivos `.cs` no Bloco de Notas, inicie o jogo e veja seu código ser compilado na hora.

O BepInEx não liga para os seus sentimentos :PES2_Shrug:. Ele é o veterano e universal framework de modding para Unity. Criar um mod no BepInEx significa configurar um projeto C# real, compilar sua própria `.dll` e colocá-la em `BepInEx/plugins/`. Você perde o hot-reload imediato e as facilidades de assets do WorldBox, mas ganha controle total sobre o processo da Unity antes mesmo do jogo perceber que acordou.

## BepInEx vs NeoModLoader

Antes de gastar uma tarde inteira configurando uma pipeline de compilação, escolha a ferramenta certa:

| Você quer... | Escolha | Por quê |
| --- | --- | --- |
| Adicionar traços, itens, poderes, criaturas ou biomas | **NML** | O NML traz `AssetManager`, textos autolocalizados, sprites e salvamento de dados inclusos |
| Criar ferramentas de desenvolvimento, overlays ou hooks de baixo nível | **BepInEx** | O BepInEx carrega no nível do Mono antes da inicialização do WorldBox |
| Escrever código apenas com o Bloco de Notas e salvar | **NML** | O NML compila os arquivos-fonte C# em tempo de execução |
| Distribuir um plugin binário pré-compilado com componentes puros da Unity | **BepInEx** | Você gerencia o compilador, as dependências e o destino da compilação |

Se o seu objetivo é adicionar conteúdo ao jogo, crie um mod para o NML. Se estiver desenvolvendo ferramentas como o UnityExplorer, o BepInEx é o seu lugar.

## 1. Pré-requisitos

1. Instale o **BepInEx 5 (Mono x64)** e ative o console conforme explicado em **[O console ao vivo (BepInEx)](#/toolbox/bepinex-console)**.
2. Instale o **[.NET SDK](https://dotnet.microsoft.com/)** (ou o Visual Studio com carga de trabalho .NET). Você precisa de um compilador C# real.

## 2. Configurando o projeto

Abra um terminal na pasta de projetos e gere uma nova biblioteca de classes:

```bash
dotnet new classlib -n HelloBepInEx -f net472
cd HelloBepInEx
```

Abra `HelloBepInEx.csproj` e adicione as referências aos assemblies do jogo e do BepInEx:

```xml HelloBepInEx.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>HelloBepInEx</AssemblyName>
    <Version>1.0.0</Version>
    <LangVersion>latest</LangVersion>
  </PropertyGroup>

  <ItemGroup>
    <!-- Game assemblies from worldbox_Data/Managed -->
    <Reference Include="Assembly-CSharp">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\Assembly-CSharp.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="UnityEngine">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\UnityEngine.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="UnityEngine.CoreModule">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\UnityEngine.CoreModule.dll</HintPath>
      <Private>false</Private>
    </Reference>

    <!-- BepInEx and Harmony from BepInEx/core -->
    <Reference Include="BepInEx">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\core\BepInEx.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="0Harmony">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\core\0Harmony.dll</HintPath>
      <Private>false</Private>
    </Reference>
  </ItemGroup>
</Project>
```

Ajuste os caminhos se sua biblioteca Steam estiver em outro disco. `<Private>false</Private>` evita copiar o motor inteiro da Unity para sua pasta de build :PESgn_SMH:.

## 3. O esqueleto do plugin

Um plugin BepInEx é uma classe que herda de `BaseUnityPlugin` decorada com o atributo `[BepInPlugin]`:

```csharp Plugin.cs
using BepInEx;
using BepInEx.Configuration;
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [BepInPlugin(PLUGIN_GUID, PLUGIN_NAME, PLUGIN_VERSION)]
    public class HelloPlugin : BaseUnityPlugin
    {
        public const string PLUGIN_GUID = "com.example.hellobepinex";
        public const string PLUGIN_NAME = "HelloBepInEx";
        public const string PLUGIN_VERSION = "1.0.0";

        private ConfigEntry<bool> configEnableLogs;
        private ConfigEntry<KeyCode> configHotkey;

        private void Awake()
        {
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

            Harmony harmony = new Harmony(PLUGIN_GUID);
            harmony.PatchAll();
        }

        private void Update()
        {
            if (Input.GetKeyDown(configHotkey.Value))
            {
                Logger.LogInfo("Hotkey pressed from BepInEx!");
            }
        }
    }
}
```

### Detalhes das partes principais

- **`BaseUnityPlugin`**: herda diretamente de `MonoBehaviour`. O plugin se torna um componente ativo em um `GameObject` persistente que sobrevive a trocas de cena.
- **`[BepInPlugin(guid, name, version)]`**: informa ao BepInEx o nome e o identificador único do mod no formato de domínio reverso (`com.autor.nomedomod`).
- **`Logger.LogInfo()`**: envia mensagens diretamente para o console ao vivo do BepInEx e para `BepInEx/LogOutput.log`.
- **`Config.Bind()`**: registra uma configuração tipada. Na primeira execução, o BepInEx cria automaticamente um arquivo limpo `BepInEx/config/com.example.hellobepinex.cfg`.

## 4. Modificando o jogo com Harmony

No BepInEx, o Harmony já vem incluído em `BepInEx/core/0Harmony.dll`. Adicione uma classe de patch em seu projeto:

```csharp Patches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [HarmonyPatch(typeof(World), nameof(World.init))]
    public static class WorldInitPatch
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            Debug.Log("[HelloBepInEx] World initialized from BepInEx patch!");
        }
    }
}
```

Como o `Plugin.cs` chamou `harmony.PatchAll()`, o BepInEx examina seu assembly compilado e aplica todas as classes com atributos de patch automaticamente.

## 5. Compilando e instalando

Compile seu projeto pelo terminal:

```bash
dotnet build -c Release
```

Sua `.dll` final será gerada em `bin/Release/net472/HelloBepInEx.dll`.

1. Abra a pasta do WorldBox: `C:\Program Files (x86)\Steam\steamapps\common\worldbox\`.
2. Em `BepInEx/plugins/`, crie uma pasta chamada `HelloBepInEx`.
3. Copie `HelloBepInEx.dll` para `BepInEx/plugins/HelloBepInEx/`.

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

Abra o jogo com o console ativado:

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

## Verdades inconvenientes sobre mods no BepInEx

- **Sem hot reload**: mudar uma linha de código significa fechar o WorldBox, rodar `dotnet build` e abrir o jogo de novo. Se você está ajustando o balanceamento de combate ou números de traços, isso cansa rápido.
- **`HideManagerGameObject`**: em `BepInEx/config/BepInEx.cfg`, garanta que `HideManagerGameObject = true` esteja definido. Sem isso, algumas rotinas de limpeza do Unity podem destruir o objeto raiz do BepInEx e matar o seu plugin em silêncio :PES5_Hmmmm:.
- **Jogando junto com o NML**: NML e BepInEx vivem felizes na mesma pasta do jogo. Você pode usar o NML para seus mods de conteúdo e o BepInEx para ferramentas de desenvolvimento como o UnityExplorer, sem que um brigue com o outro.
- **Acessando assets do jogo**: o BepInEx roda na camada crua do Unity. Se você quer gerar criaturas, registrar itens ou editar traços a partir de um plugin BepInEx, precisa esperar o WorldBox terminar de inicializar o `AssetManager`, ou referenciar `NeoModLoader.dll` e deixar o NML fazer o trabalho pesado.
