---
title: BepInEx로 콘텐츠 추가하기
group: BepInEx Modding
icon: :wbhammer:
order: 2
---

# BepInEx로 콘텐츠 추가하기 :wbhammer:

BepInEx 플러그인도 NML 모드처럼 특성(trait), 아이템(item), 권능(GodPower)을 추가할 수 있습니다. 다만 NML이 조용히 대신해 주는 세 가지 일을 직접 해야 합니다: 게임을 기다리기, 텍스트 불러오기, 그림 불러오기. 이 페이지는 **[사용자 정의 특성](#/nml/custom-traits)** 페이지와 같은 **Swift** 특성으로 세 가지를 모두 해 보니, 한 줄씩 비교해 볼 수 있습니다.

아직 프로젝트가 없다면 **[BepInEx 모드 개발](#/toolbox/bepinex-modding)** 부터 시작하세요.

## 알맞은 시점

플러그인의 `Awake()` 는 아주 일찍, WorldBox 가 에셋 라이브러리(library)를 하나도 만들기 전에 실행됩니다. 그때 `AssetManager.traits` 는 아직 null 이고, 건드리면 메인 메뉴가 뜨기도 전에 `NullReferenceException` 이 납니다.

원하는 시점은 `AssetManager.init()` 이 끝나는 순간입니다. 이 public 메서드 하나가 모든 라이브러리를 만들고, 각 라이브러리의 `post_init()` 과 `linkAssets()` 를 실행합니다. 여기에 Harmony Postfix 를 붙이면 바로 뒤에 실행되는데, 이게 정확히 NML 모드의 `OnModLoad` 가 실행되는 자리입니다. NML 페이지에서 말하는 "게임이 시작할 때 이걸 했는데, 그때는 모드가 없었으니 직접 하세요" 는 여기서도 그대로 통합니다.

## 코드

```csharp Plugin.cs
using System.IO;
using BepInEx;
using HarmonyLib;

namespace HelloBepInEx
{
    [BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
    [BepInProcess("worldbox.exe")]
    public class HelloPlugin : BaseUnityPlugin
    {
        public static HelloPlugin Instance;

        /** The folder your .dll sits in, for loading your own files. */
        public static string Folder => Path.GetDirectoryName(Instance.Info.Location);

        private void Awake()
        {
            Instance = this;
            new Harmony("com.example.hellobepinex").PatchAll();

            // Installed while the game was already running? The libraries exist, go now.
            if (InitLibraries.initiated) HelloContent.Register();
        }
    }

    [HarmonyPatch(typeof(AssetManager), nameof(AssetManager.init))]
    public static class AssetsReadyPatch
    {
        [HarmonyPostfix]
        public static void Postfix() => HelloContent.Register();
    }

    [HarmonyPatch(typeof(LocalizedTextManager), nameof(LocalizedTextManager.setLanguage))]
    public static class LanguagePatch
    {
        // setLanguage throws the whole text table away and reloads it from the game files,
        // so our lines have to go back in after every language change.
        [HarmonyPostfix]
        public static void Postfix() => HelloContent.AddText();
    }
}
```

```csharp HelloContent.cs
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace HelloBepInEx
{
    public static class HelloContent
    {
        public const string SWIFT = "hello_swift";
        private const string ICON = "ui/Icons/iconHelloSwift";
        private static bool done;

        /** Text per language. English is the fallback for everything else. */
        private static readonly Dictionary<string, Dictionary<string, string>> Text =
            new Dictionary<string, Dictionary<string, string>>
            {
                ["en"] = new Dictionary<string, string>
                {
                    ["trait_hello_swift"] = "Swift",
                    ["trait_hello_swift_info"] = "Moves like the world owes it money."
                },
                ["it"] = new Dictionary<string, string>
                {
                    ["trait_hello_swift"] = "Rapido",
                    ["trait_hello_swift_info"] = "Si muove come se il mondo gli dovesse dei soldi."
                }
            };

        public static void Register()
        {
            if (done) return;
            done = true;

            // 1. The art, before anything asks for it. See "Your own art" below.
            string png = Path.Combine(HelloPlugin.Folder, "iconHelloSwift.png");
            if (File.Exists(png)) SpriteTextureLoader.addSprite(ICON, File.ReadAllBytes(png));

            // 2. The trait: exactly the Custom traits page, nothing BepInEx-specific.
            if (!AssetManager.traits.has(SWIFT))
            {
                ActorTrait swift = new ActorTrait
                {
                    id = SWIFT,
                    needs_to_be_explored = false,
                    path_icon = ICON,
                    group_id = "physique",
                    rate_birth = 0,
                    can_be_given = true,
                    can_be_removed = true
                };
                AssetManager.traits.add(swift);
                swift.base_stats["speed"] = 20f;
            }

            // 3. The text for the language that is already loaded.
            AddText();
        }

        public static void AddText()
        {
            if (LocalizedTextManager.instance == null) return;

            string lang = LocalizedTextManager.instance.language;
            if (!Text.TryGetValue(lang, out Dictionary<string, string> lines)) lines = Text["en"];

            foreach (KeyValuePair<string, string> line in lines)
            {
                // pReplace: true, or a second call logs "Already exists" for every line
                LocalizedTextManager.add(line.Key, line.Value, pReplace: true);
            }
        }
    }
}
```

빌드하고, 게임을 켜고, 유닛을 열면 Swift 가 이름, 설명, 아이콘과 함께 `physique` 탭에 있습니다.

> [!NOTE] `LocalizedTextManager.instance.language` 는 internal 입니다
> 컴파일되는 건 **[BepInEx 모드 개발](#/toolbox/bepinex-modding)** 의 프로젝트가 게임을 publicize 하기 때문입니다. publicizer 가 없으면 언어를 직접 기억해야 합니다.

## 세 가지 일, 하나씩

### 게임 기다리기

| NML | BepInEx |
| --- | --- |
| 라이브러리가 준비되면 `OnModLoad()` 가 실행됨 | `AssetManager.init()` 에 Postfix |
| NML이 한 번만 실행되도록 보장함 | 직접 챙길 일: `Awake()` 가 이미 불렀다면 `done` 플래그가 두 번째 실행을 막음 |

잘못된 시점에 등록하면 로그가 알려 줍니다: `AssetManager.<무언가>` 를 가리키는 `NullReferenceException` 은 너무 이르다는 뜻입니다.

### 텍스트

NML은 `Locales/` 폴더를 읽고, 언어가 바뀔 때마다 다시 적용합니다. BepInEx 에서는 둘 다 직접 해야 하고, `setLanguage` 패치는 다들 잊어버리는 부분입니다: 영어에서는 다 되는데, 플레이어가 이탈리아어로 바꾸는 순간 특성 이름이 `trait_hello_swift` 가 됩니다 :wbfacepalm:.

키 이름은 가이드의 다른 곳과 같으니 **[현지화](#/nml/localization)** 페이지의 표를 그대로 쓰면 됩니다. `LocalizedTextManager.add` 는 게임 자체 파일처럼 키를 snake_case 로 바꿔 줍니다.

### 직접 만든 그림

BepInEx 에는 `GameResources/` 폴더가 없습니다. 대신 `SpriteTextureLoader.addSprite(path, bytes)` 가 있습니다. 어디에 있는 PNG든 읽어서 원하는 경로로 등록해 주며, 피벗은 가운데, 필터는 픽셀 아트용입니다. 그러면 `path_icon = "ui/Icons/iconHelloSwift"` 가 바닐라 스프라이트처럼 그걸 찾습니다.

규칙은 두 가지:

- **누가 그 경로를 요청하기 전에 등록하세요.** 게임은 한 번 찾아본 경로를 실패한 것까지 전부 기억하고, `addSprite` 는 이미 기억된 경로를 거부합니다. `Register()` 맨 처음에 하면 안전합니다.
- **그림 한 장이지, 프레임 폴더가 아닙니다.** 아이콘, 아이템 아이콘, 권능 버튼은 그림 한 장이라 됩니다. 가이드에서 **폴더** 라고 표시한 것들(드롭 애니메이션, 상태 효과, 투사체, 타일, 건물 스프라이트)은 `getSpriteList()` 로 불러오는데, `addSprite` 는 그걸 채우지 않습니다. 그런 건 바닐라 경로를 빌리거나, 그 부분을 NML 모드로 만드세요.

PNG는 `.dll` 옆에 두세요:

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

빌드할 때 그것도 복사되게 하려면 `.csproj` 의 `CopyToGame` 대상에 한 줄을 추가하세요:

```xml HelloBepInEx.csproj
<Copy SourceFiles="iconHelloSwift.png" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
```

## NML에서 가져올 수 없는 것

일부 페이지는 BepInEx 에 없는 NML 도우미에 기댑니다. 대신 이렇게 하세요:

| NML 페이지가 쓰는 것 | BepInEx 에서는 |
| --- | --- |
| `Locales/` 폴더 | 위의 `AddText()` 방식 |
| `GameResources/` | 그림 한 장은 `SpriteTextureLoader.addSprite`, 폴더는 바닐라 경로 |
| `TabManager`, `PowerButtonCreator` (권능 버튼) | 대응하는 것 없음. Unity 로 UI를 직접 만들거나, 버튼을 NML 모드에 넣으세요 |
| `ModConfig` 설정 창 | BepInEx 의 `Config.Bind()`, `.cfg` 파일에서 수정 |
| 직접 만든 저장 데이터 | 게임 자체의 유닛 `data.set` / `data.get` 이 똑같이 됩니다. **[데이터 저장](#/nml/saving-data)** 참고 |
| 다시 불러오기 버튼 | 없음. 닫고, 빌드하고, 실행 |

평범한 게임 코드, 즉 각 페이지의 대부분은 그대로 작동합니다: 에셋, 능력치, 상태, Harmony 패치, AI, 세계 법칙.

문제가 생기면 **[디버깅과 배포](#/toolbox/bepinex-publishing)** 에 가장 마주치기 쉬운 오류들을 모아 두었습니다.
