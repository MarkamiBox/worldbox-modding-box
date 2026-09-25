---
title: BepInEx 모드 개발
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# BepInEx 모드 개발 :PES5_BigBrain:

이 가이드의 대부분은 **NeoModLoader** 용 모드 작성법을 알려 줍니다. NML에서는 메모장으로 평범한 `.cs` 파일을 쓰고 게임을 켜면, 코드가 알아서 컴파일됩니다.

BepInEx 는 여러분의 기분 따위 신경 쓰지 않습니다 :PES2_Shrug:. Unity용의 오래되고 범용적인 모딩 프레임워크입니다. BepInEx 모드를 만든다는 건 제대로 된 C# 프로젝트를 준비하고, 직접 `.dll` 을 컴파일해서 `BepInEx/plugins/` 에 넣는다는 뜻입니다. 즉시 다시 불러오기와 편한 에셋(asset) 도우미는 잃지만, 게임이 깨어났다는 걸 알기도 전에 Unity 프로세스를 완전히 제어할 수 있습니다.

이 부분은 세 페이지입니다: 이 페이지는 플러그인을 실행시키고, **[BepInEx로 콘텐츠 추가하기](#/toolbox/bepinex-content)** 는 게임에 진짜 콘텐츠를 넣게 하고, **[디버깅과 배포](#/toolbox/bepinex-publishing)** 는 다른 사람에게 전달합니다.

## BepInEx 와 NeoModLoader 중에서

빌드 환경을 준비하느라 오후를 쓰기 전에, 맞는 도구를 고르세요:

| 하고 싶은 일 | 고를 것 | 이유 |
| --- | --- | --- |
| 특성(trait), 아이템(item), 신의 권능(GodPower), 생물, 군계 추가 | **NML** | NML은 알맞은 시점의 `AssetManager`, `Locales` 폴더, `GameResources/`, 버튼, 저장 도우미를 공짜로 줍니다 |
| 개발자 도구, 오버레이, 엔진 훅 만들기 | **BepInEx** | BepInEx 는 WorldBox 가 초기화되기 전, Mono 수준에서 시작합니다 |
| 메모장으로만 코드를 고치고 저장하기 | **NML** | NML은 실행 중에 C# 소스 파일을 컴파일합니다 |
| 순수 Unity 컴포넌트로 된 미리 컴파일한 플러그인 배포 | **BepInEx** | 컴파일러 옵션, 의존성, 빌드 대상을 직접 정합니다 |

게임 콘텐츠를 추가한다면 NML 모드를 쓰세요. UnityExplorer 같은 도구를 만들거나, 터미널에 흐르는 MSBuild 출력을 보는 게 정말 좋다면 BepInEx 가 여러분의 자리입니다. BepInEx 로도 콘텐츠를 추가할 수 *있고* 다음 페이지에서 방법을 보여 주지만, NML이 공짜로 주는 걸 손으로 다시 만들어야 합니다.

## 1. 준비물

1. **BepInEx 5 (Mono x64)** 를 설치하고 **[실시간 콘솔(BepInEx)](#/toolbox/bepinex-console)** 의 설명대로 콘솔을 켜세요. 게임을 한 번 실행해서 BepInEx 가 폴더를 만들게 하세요.
2. **[.NET SDK](https://dotnet.microsoft.com/)** (또는 .NET 데스크톱 개발이 포함된 Visual Studio)를 설치하세요. BepInEx 플러그인에는 진짜 C# 컴파일러가 필요합니다.

## 2. 프로젝트 준비

프로젝트를 모아 두는 폴더에서 터미널을 열고 새 클래스 라이브러리를 만드세요:

```bash
dotnet new classlib -n HelloBepInEx
cd HelloBepInEx
```

그런 다음 `HelloBepInEx.csproj` 의 내용을 전부 이걸로 바꾸세요. 게임과 같은 .NET 버전을 쓰고, WorldBox 폴더를 한 곳에서만 지정하며, 빌드할 때마다 세 가지 일을 대신해 줍니다:

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

각 부분의 역할:

- 모든 게임 참조에 붙은 **`Private="false"`**: 빌드 결과물에 게임 엔진 전체가 복사되지 않습니다 :PESgn_SMH:.
- **`Publicize="true"`**: 가이드의 NML 페이지들은 게임의 `internal` 멤버를 계속 씁니다. NML이 "publicize" 된 게임에 대해 컴파일하기 때문입니다. BepInEx 프로젝트는 요청하지 않으면 그렇게 하지 않습니다. 이 설정이 있으면 같은 코드가 여기서도 컴파일됩니다. `PackageReference` 의 버전 번호는 이 글을 쓸 때 최신 안정판입니다. NuGet 이 불평하면 제시하는 최신 버전을 쓰세요.
- **`UnityEngine*.dll`**: Unity 는 여러 모듈 파일로 나뉘어 있습니다. `Input` 은 `UnityEngine.InputLegacyModule.dll`, UI는 `UnityEngine.UI.dll` 에 있는 식입니다. 전부 참조하면 "형식을 찾을 수 없음" 을 찾아 헤맬 일이 없습니다.
- **`CopyToGame`**: 더 이상 `.dll` 을 손으로 복사하지 않아도 됩니다. 빌드하고, 게임을 켜면 끝.

## 3. 플러그인 뼈대

BepInEx 플러그인은 `BaseUnityPlugin` 을 상속하고 `[BepInPlugin]` 특성을 붙인 클래스입니다:

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

### 부분별 설명

- **`BaseUnityPlugin`**: Unity 의 `MonoBehaviour` 를 직접 상속합니다. 플러그인은 장면이 바뀌어도 살아남는 `GameObject` 에 붙은 활성 컴포넌트입니다.
- **`[BepInPlugin(guid, name, version)]`**: 모드 이름과 고유 식별자를 BepInEx 에 알려 줍니다. 역도메인 형식(`com.author.modname`)을 쓰고, 공개한 뒤에는 GUID를 절대 바꾸지 마세요. 설정 파일과 다른 플러그인의 의존성이 거기에 묶여 있습니다.
- **`[BepInProcess("worldbox.exe")]`**: WorldBox 안에서만 불러옵니다. 여기서는 해가 없고, 누군가 플러그인을 다른 게임의 BepInEx 에 넣었을 때 생기는 알 수 없는 충돌을 막아 줍니다.
- **`Logger.LogInfo()`**: BepInEx 실시간 콘솔과 `BepInEx/LogOutput.log` 에 바로 씁니다.
- **`Config.Bind()`**: 타입이 있는 설정 항목을 만듭니다. 플러그인이 처음 실행될 때 BepInEx 가 플레이어가 수정할 수 있는 깔끔한 `BepInEx/config/com.example.hellobepinex.cfg` 파일을 만듭니다.

## 4. Harmony 로 게임에 끼어들기

BepInEx 에는 Harmony 가 `BepInEx/core/0Harmony.dll` 로 들어 있습니다. 프로젝트 아무 곳에나 패치 클래스를 추가하세요:

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

`Plugin.cs` 가 `harmony.PatchAll()` 을 불렀기 때문에, Harmony 는 컴파일된 어셈블리를 훑어서 그 안의 모든 패치 클래스를 적용합니다. **[Harmony 패치](#/nml/harmony-patches)** 에서 배운 내용은 여기서도 그대로 통합니다: 마법의 매개변수 이름, Prefix 와 Postfix, 다른 모드를 망가뜨리지 않는 규칙.

## 5. 빌드와 설치

명령줄에서 프로젝트를 컴파일하세요:

```bash
dotnet build -c Release
```

`.dll` 은 `bin/Release/net472/HelloBepInEx.dll` 에 만들어지고, `CopyToGame` 단계가 그걸 게임에 바로 넣습니다:

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

콘솔을 켜고 게임을 실행하세요. BepInEx 가 어셈블리를 찾아 불러오는 게 보입니다:

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

> [!WARNING] 빌드 전에 게임을 닫으세요
> WorldBox 가 실행 중이면 `.dll` 을 붙잡고 있어서, 복사가 "the process cannot access the file" 로 실패합니다. 게임을 닫고, 빌드하고, 다시 켜세요. 이게 BepInEx 개발 과정의 전부입니다 :PES2_Weary:.

## BepInEx 모딩의 냉혹한 현실

- **핫 리로드 없음**: 한 줄만 바꿔도 WorldBox 를 닫고, `dotnet build` 를 실행하고, 게임을 다시 켜야 합니다. 전투 밸런스나 특성 수치를 조정 중이라면 금방 지칩니다. 부분적인 우회 방법이 **[디버깅과 배포](#/toolbox/bepinex-publishing)** 에 있습니다.
- **`HideManagerGameObject`**: `BepInEx/config/BepInEx.cfg` 의 `[Chainloader]` 아래에 `HideManagerGameObject = true` 로 설정하세요. 그렇지 않으면 Unity 의 정리 루틴이 BepInEx 의 루트 오브젝트를 파괴해서 플러그인이 조용히 죽을 수 있습니다 :PES5_Hmmmm:.
- **NML과 함께 쓰기**: NML과 BepInEx 는 같은 게임 폴더에서 사이좋게 지냅니다. 콘텐츠 모드는 NML로, UnityExplorer 같은 개발 도구는 BepInEx 로 써도 서로 싸우지 않습니다.
- **게임 에셋 접근**: 플러그인은 게임이 에셋 라이브러리(library)를 만들기 전에 깨어납니다. `Awake()` 에서 `AssetManager` 를 건드리면 null 이 나옵니다. 다음 페이지 **[BepInEx로 콘텐츠 추가하기](#/toolbox/bepinex-content)** 에서 끼어들 정확한 시점을 보여 줍니다.
