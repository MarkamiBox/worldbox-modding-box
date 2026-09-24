---
title: BepInEx 모드 개발
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# BepInEx 모드 개발 :PES5_BigBrain:

이 가이드의 대부분은 **NeoModLoader**용 모드를 개발하는 방법을 다룹니다. NML을 사용하면 메모장에서 `.cs` 소스 파일을 직접 편집하고 게임 실행 시 자동으로 컴파일할 수 있습니다.

하지만 BepInEx는 당신의 편의 따위는 봐주지 않습니다 :PES2_Shrug:. BepInEx는 유니티 생태계에서 가장 유서 깊고 범용적인 모딩 프레임워크입니다. BepInEx 모드를 만든다는 것은 정식 C# 프로젝트를 구성하고, 직접 `.dll` 바이너리를 빌드하여 `BepInEx/plugins/`에 넣는 것을 의미합니다. NML의 핫 리로드와 편리한 에셋 헬퍼는 없지만, 게임이 켜지기도 전에 유니티 프로세스를 완벽하게 제어할 수 있습니다.

## BepInEx와 NeoModLoader 비교

빌드 환경 구축에 시간을 쓰기 전에 목적에 맞는 도구를 선택하세요:

| 원하는 작업 | 추천 도구 | 이유 |
| --- | --- | --- |
| 특성, 아이템, 신의 힘, 생명체, 바이옴 추가 | **NML** | `AssetManager`, 다국어 텍스트, 스프라이트, 세이브 연동이 기본 제공됨 |
| 개발자 도구, UI 오버레이, 엔진 로우레벨 훅 구현 | **BepInEx** | WorldBox 초기화 이전 Mono 런타임 단계에서 로드됨 |
| 메모장으로만 코드를 수정하고 즉시 적용 | **NML** | NML이 런타임에 C# 소스를 자동 컴파일함 |
| 순수 유니티 컴포넌트가 포함된 빌드 바이너리 배포 | **BepInEx** | 컴파일러 옵션, 종속성, 빌드 대상을 직접 완벽 제어 가능 |

게임 콘텐츠 추가가 목적이라면 NML 모드를 만드세요. UnityExplorer 같은 도구를 개발할 때는 BepInEx가 제격입니다.

## 1. 사전 준비

1. **[실시간 디버깅 콘솔 (BepInEx)](#/toolbox/bepinex-console)** 가이드를 참조하여 **BepInEx 5 (Mono x64)** 를 설치하고 콘솔을 활성화합니다.
2. **[.NET SDK](https://dotnet.microsoft.com/)**(또는 Visual Studio)를 설치합니다. 플러그인을 빌드하려면 실제 C# 컴파일러가 필요합니다.

## 2. 프로젝트 생성 및 설정

터미널에서 작업 폴더로 이동한 후 새 클래스 라이브러리 프로젝트를 생성합니다:

```bash
dotnet new classlib -n HelloBepInEx -f net472
cd HelloBepInEx
```

`HelloBepInEx.csproj` 파일을 열고 게임 어셈블리 및 BepInEx 라이브러리 참조를 추가합니다:

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

Steam 라이브러리 드라이브 경로가 다르면 경로를 알맞게 수정하세요. `<Private>false</Private>`를 설정하면 유니티 엔진 전체 어셈블리가 빌드 폴더로 불필요하게 복사되는 것을 막을 수 있습니다 :PESgn_SMH:.

## 3. 플러그인 기본 구조

BepInEx 플러그인은 `BaseUnityPlugin`을 상속받고 `[BepInPlugin]` 특성을 적용한 클래스로 구성됩니다:

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

### 주요 구성 요소 설명

- **`BaseUnityPlugin`**: 유니티의 `MonoBehaviour`를 상속합니다. 씬 전환 시에도 파괴되지 않는 영구적인 `GameObject` 컴포넌트로 동작합니다.
- **`[BepInPlugin(guid, name, version)]`**: 모드 이름과 고유 GUID를 선언합니다(예: `com.author.modname`).
- **`Logger.LogInfo()`**: BepInEx 콘솔 창과 `BepInEx/LogOutput.log` 파일에 로그를 실시간 출력합니다.
- **`Config.Bind()`**: 타입 안정성을 갖춘 설정 항목을 바인딩합니다. 첫 실행 시 `BepInEx/config/com.example.hellobepinex.cfg` 설정 파일이 자동 생성됩니다.

## 4. Harmony를 활용한 게임 후킹

BepInEx에는 Harmony가 `BepInEx/core/0Harmony.dll`에 기본 내장되어 있습니다. 프로젝트에 패치 클래스를 작성합니다:

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

`Plugin.cs`에서 `harmony.PatchAll()`을 호출했기 때문에, 빌드된 어셈블리 내의 모든 패치 클래스가 게임 시작 시 자동으로 적용됩니다.

## 5. 빌드 및 배포

명령줄에서 프로젝트를 컴파일하세요:

```bash
dotnet build -c Release
```

컴파일된 `.dll`은 `bin/Release/net472/HelloBepInEx.dll`에 만들어집니다.

1. WorldBox 폴더로 가세요: `C:\Program Files (x86)\Steam\steamapps\common\worldbox\`.
2. `BepInEx/plugins/` 안에 `HelloBepInEx`라는 폴더를 만드세요.
3. `HelloBepInEx.dll`을 `BepInEx/plugins/HelloBepInEx/`에 복사하세요.

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

콘솔을 켠 상태로 게임을 시작하세요. BepInEx가 여러분의 어셈블리를 찾아 불러오는 것이 보입니다:

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

## BepInEx 모딩 시 주의할 점

- **핫 리로드 미지원**: 코드를 수정할 때마다 게임을 종료하고 `dotnet build` 후 다시 실행해야 합니다.
- **`HideManagerGameObject`**: `BepInEx/config/BepInEx.cfg` 파일에서 `HideManagerGameObject = true`로 설정되어 있는지 확인하세요. 그렇지 않으면 유니티 정리 과정에서 BepInEx 매니저가 파괴될 수 있습니다 :PES5_Hmmmm:.
- **NML과의 공존**: NML과 BepInEx는 같은 게임 폴더 내에서 충돌 없이 완벽히 함께 작동합니다.
- **게임 에셋 접근**: BepInEx는 순수 유니티 계층에서 실행됩니다. WorldBox 유닛이나 아이템 등을 조작하려면 `AssetManager` 초기화를 기다리거나 `NeoModLoader.dll`을 참조해야 합니다.
