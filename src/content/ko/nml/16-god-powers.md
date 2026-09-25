---
title: 신의 권능
group: 게임 콘텐츠
subgroup: 신의 힘 및 UI
icon: :wbgodfinger:
order: 200
---

# 신의 권능 :wbgodfinger:

신의 권능은 플레이어가 도구를 선택하고 월드를 클릭했을 때 일어나는 동작입니다. 무언가를 소환하거나, 축복을 내리거나, 폭파시키는 일들이죠.

여기에는 두 가지 별개의 개념이 얽혀 있으며, 이 둘을 혼동하는 것이 전형적인 초보자의 실수입니다:

| | |
| --- | --- |
| **권능** (`GodPower`) | 데이터: id, 아이콘, 클릭 시 실행될 코드 |
| **버튼** (`PowerButton`) | 플레이어가 하단 바에서 실제로 누를 수 있는 UI 버튼 |

이 페이지에서는 권능을 만듭니다. 화면에 띄우는 작업은 **[권능 탭 & 버튼](#/nml/power-buttons)** 페이지에서 다룹니다.

## 권능 만들기

```csharp Mods/HelloBox/Code/HelloPowers.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloPowers
    {
        public const string STRIKE = "hello_strike";

        public static void Initialize()
        {
            // 이 id로 이미 등록된 에셋을 덮어쓰지 않도록 함
            if (AssetManager.powers.get(STRIKE) != null) return;

            GodPower strike = new GodPower
            {
                id = STRIKE,
                name = STRIKE,
                rank = PowerRank.Rank0_free,        // 해금 조건 없음
                path_icon = "ui/Icons/iconFire",
                unselect_when_window = true,        // 창이 열리면 도구 선택 해제
                show_tool_sizes = false,            // 브러시 크기(소/중/대) 숨김

                // 도구를 든 상태로 플레이어가 타일을 클릭했을 때 실행되는 동작
                click_action = (WorldTile pTile, string pPowerID) =>
                {
                    if (pTile == null) return false;

                    EffectsLibrary.spawnExplosionWave(pTile.posV3, 3f, 0.5f);
                    Earthquake.startQuake(pTile);
                    return true;   // true = 클릭이 소모됨
                }
            };

            AssetManager.powers.add(strike);
        }
    }
}
```

`Main.cs` 에 `HelloPowers.Initialize();` 를 추가하세요.

### 각 부분의 역할

- **`id`**: 나머지 모든 것이 참조하는 이름입니다. 버튼, 번역, 다른 모드.
- **`name`**: 게임 자체 UI의 조회에 쓰입니다. ID와 같게 두면 골치 아플 일이 줄어듭니다.
- **`rank = PowerRank.Rank0_free`**: 처음부터 사용 가능, 잠금 해제 없음.
- **`path_icon`**: 커서/도구 아이콘입니다.
- **`unselect_when_window`**: 플레이어가 창을 열면 도구가 알아서 해제되어, 패널 뒤의 지도를 실수로 내려치지 않게 합니다.
- **`click_action`**: 여러분의 코드입니다. **클릭된 타일**과 **권능 ID**를 받고, 무언가를 했다면 `true`를 반환합니다.

> [!WARNING] 클릭 시그니처는 `(WorldTile, string)`입니다
> `click_action`은 `PowerActionWithID`이므로, 두 번째 인자는 `GodPower`가 아니라 **문자열로 된 권능 ID**입니다. `(WorldTile, GodPower)`를 받는 `click_power_action`이라는 두 번째 필드도 있습니다. 잘못된 형태를 쓰면 말도 안 되는 것처럼 보이는 컴파일 오류가 납니다 :PES_DaFuq:.

## 클릭 시 유용한 동작들

```csharp
// 해당 타일 위에(또는 근처에) 서 있는 유닛 가져오기
Actor actor = null;
foreach (Actor found in Finder.getUnitsFromChunk(pTile, 1, 2.5f))
{
    if (found != null && found.isAlive()) { actor = found; break; }
}

// 생명체 소환하기
World.world.units.spawnNewUnit("wolf", pTile);

// 타일 위치에 시각 효과 발생
EffectsLibrary.spawnAt("fx_lightning_small", pTile.posV3, 0.25f);

// 하늘에서 물체 떨어뜨리기 (드롭 & 낙하물 참고)
World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

// 플레이어에게 알림 메시지 띄우기
WorldTip.showNow("The gods are displeased.", false, "top", 3f);
```

## 누른 채로 연속 사용하기

`hold_action = true` 와 `click_interval` 을 지정하면 바닐라 브러시 도구처럼 마우스를 누르고 있는 동안 권능이 연속으로 발동합니다:

```csharp
strike.hold_action = true;
strike.click_interval = 0.15f;   // 발동 간격(초)
```

## 어떤 델리게이트가 브러시를 칠하는가?

| 필드 | 의미 |
| --- | --- |
| `click_action` | 타일 하나에 대한 `bool (WorldTile pTile, string pPowerID)` |
| `click_brush_action` | 같은 시그니처, 지정돼 있으면 `click_action` 대신 호출됨 |
| `click_power_action` | 타일 하나에 대한 `bool (WorldTile pTile, GodPower pPower)` |
| `click_power_brush_action` | 같은 에셋 기반 시그니처, 지정돼 있으면 `click_power_action` 대신 호출됨 |

플레이어의 클릭 경로는 둘 중 하나가 설정돼 있으면 에셋 기반 쌍을 우선합니다. 브러시 델리게이트는 중심 타일 하나를 받습니다. 브러시 픽셀마다 알아서 한 번씩 실행되는 게 아닙니다. 이 선택적 대체는 `click_action`을 지정한 뒤, 권능 설정 안에 넣습니다:

```csharp
strike.show_tool_sizes = true;
strike.click_brush_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null || World.world == null) return false;
    GodPower power = AssetManager.powers.get(pPowerID);
    if (power == null || power.click_action == null) return false;
    World.world.loopWithBrush(pTile, Config.current_brush_data,
        power.click_action, pPowerID);
    return true;
};
```

> [!WARNING] 커서가 커진다고 효과 범위까지 커지지는 않습니다
> `show_tool_sizes`는 브러시 크기 선택을 노출시킬 뿐입니다. 브러시 콜백은 여전히 타일들을 직접 순회해야 합니다. 바닐라의 `PowerLibrary.loopWithCurrentBrush` 헬퍼는 private이므로, 위 예제는 대신 public인 월드 메서드를 씁니다. `(WorldTile, GodPower)` 쌍의 경우, `loopWithBrush`에는 `PowerAction`과 권능 에셋을 받는 대응 오버로드가 있습니다.

클릭 이후 피드백을 주는 방법은 **[메시지 및 세계 기록](#/nml/messages-and-world-log)**을 참고하세요.

## 커스텀 아이콘

`path_icon` 은 도구 커서이자 버튼의 전면 이미지입니다. `GameResources/` 내부에서 작성한 경로 그대로 로드됩니다.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloStrike.png
```

```csharp
strike.path_icon = "ui/Icons/iconHelloStrike";
```

> [!WARNING] 아이콘이 없으면 보이지 않는 투명 버튼이 됩니다
> 경로가 틀리면 반환되는 스프라이트가 `null` 이 되며, `null` 스프라이트는 엑스박스가 뜨는 게 아니라 바에 투명한 빈 공간을 만들어 플레이어가 절대 찾을 수 없게 만듭니다. **[권능 탭 & 버튼](#/nml/power-buttons)** 에 있는 대체 아이콘 헬퍼를 참고하세요 :aPES_Hide:.

## 텍스트 로컬라이제이션

```json Locales/en.json
{
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess. Mostly a mess."
}
```

## 브러시

신의 권능은 **브러시**를 통해 타일을 칠합니다. 브러시는 한 번의 클릭이 덮는 타일의 기하학적 형태입니다. 게임은 코드로부터 각 브러시의 픽셀 좌표 목록과 미리보기 이미지를 생성하므로, 새로운 형태를 만들 때 이미지 파일이 전혀 필요하지 않습니다.

```csharp Mods/HelloBox/Code/HelloBrushes.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloBrushes
    {
        public const string TARGET = "hello_target";

        public static void Initialize()
        {
            if (AssetManager.brush_library.has(TARGET)) return;

            BrushData target = new BrushData
            {
                id = TARGET,
                size = 6,
                group = BrushGroup.Special,
                show_in_brush_window = true,
                localized_key = "brush_hello_target",
                continuous = true,
                fast_spawn = true
            };

            // post_init() runs generate_action and measures every brush, at startup.
            // Do both yourself: a centre dot and a ring around it.
            List<BrushPixelData> pixels = new List<BrushPixelData>();
            for (int x = -6; x <= 6; x++)
            {
                for (int y = -6; y <= 6; y++)
                {
                    int dist = x * x + y * y;
                    if (dist == 0 || (dist >= 16 && dist <= 36)) pixels.Add(new BrushPixelData(x, y, dist));
                }
            }
            target.pos = pixels.ToArray();
            target.width = 13;
            target.height = 13;
            target.sqr_size = target.width * target.height;

            AssetManager.brush_library.add(target);

            // linkAssets() shuffled every brush, and post_init() listed the ones the
            // brush hotkeys cycle through. Both at startup.
            BrushLibrary.shuffleBrush(target);
            BrushLibrary._available_brushes.Add(TARGET);
        }
    }
}
```

바니라의 단일 타일 권능이 `sqr_0`에 고정되어 있는 것처럼, `force_brush = "hello_target"`을 지정하여 권능을 특정 브러시 형태로 고정할 수 있습니다. 브러시 단축키는 `_available_brushes` 목록을 순회하므로 내 브러시도 단축키 순환에 포함됩니다. 브러시 선택 창의 경우 창이 처음 열릴 때 버튼을 구성하므로, 창에 보이지 않더라도 `force_brush`와 단축키를 통해 정상적으로 동작합니다.

> [!WARNING] 브러시는 시작 시점에 크기가 측정됩니다
> `BrushLibrary.post_init()`은 모든 브러시의 `generate_action`을 실행하고 `width`, `height`, `sqr_size`를 계산하며, `linkAssets()`가 픽셀들을 셔플합니다. 나중에 추가된 브러시는 이 과정을 거치지 않으므로, 위와 같이 `pos`와 크기 필드를 직접 설정해 주어야 합니다. 미리보기 이미지는 `pos` 배열로부터 직접 렌더링되므로 아이콘이 필요 없습니다.

```json Mods/HelloBox/Locales/en.json
{
  "brush_hello_target": "Target"
}
```

## 아직 게임에 나타나지 않습니다

맞습니다. 권능을 만들었을 뿐 아직 화면에 띄워주는 장치가 없습니다. 나머지 절반을 완성하러 **[권능 탭 & 버튼](#/nml/power-buttons)** 으로 넘어가세요. 단 열 줄이면 끝납니다 :pepeOK:.
