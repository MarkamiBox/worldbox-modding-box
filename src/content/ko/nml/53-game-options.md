---
title: 게임 옵션
group: 게임 콘텐츠
subgroup: 신의 힘 및 UI
icon: :wbsettingsgear:
order: 206
---

# 게임 옵션 :wbsettingsgear:

**[모드 설정](#/nml/mod-config)**에서 NML 자체의 설정 창(`default_config.json`)을 봤습니다. 이건 여러분의 모드에 깔끔하고 분리된 설정 탭을 줍니다.

월드박스에는 자체 네이티브 옵션 시스템도 있습니다: `PlayerConfig`가 뒷받침하는 `AssetManager.options_library`입니다. 이건 바닐라 설정 창, 개발자 토글, 신의 힘 토글 버튼을 움직이는 바로 그 시스템입니다. 그 옆에는 월드가 얼마나 빠르게 흘러가는지를 제어하는 `AssetManager.time_scales`가 있습니다.

## 네이티브 옵션 등록하기

`AssetManager.options_library`의 옵션들은 `OptionAsset`의 인스턴스입니다:

```csharp Mods/HelloBox/Code/HelloOptions.cs
namespace HelloBox
{
    public static class HelloOptions
    {
        public const string TURBO_HARVEST = "hello_turbo_harvest";

        public static void Initialize()
        {
            if (AssetManager.options_library.has(TURBO_HARVEST)) return;

            OptionAsset option = new OptionAsset
            {
                id = TURBO_HARVEST,
                type = OptionType.Bool,
                default_bool = false,
                translation_key = "option_hello_turbo_harvest",
                translation_key_description = "option_desc_hello_turbo_harvest",
                action = (OptionAsset pAsset) =>
                {
                    bool active = IsTurboActive();
                    Main.Log("Turbo harvest is now: " + active);
                }
            };

            AssetManager.options_library.add(option);

            // Registering the asset does NOT automatically populate PlayerConfig.dict.
            // Ensure the value exists so your code can read it immediately:
            if (!PlayerConfig.dict.ContainsKey(TURBO_HARVEST))
            {
                PlayerConfig.dict.Add(TURBO_HARVEST, new PlayerOptionData
                {
                    name = TURBO_HARVEST,
                    boolVal = option.default_bool
                });
            }
        }

        public static bool IsTurboActive()
        {
            if (PlayerConfig.dict.TryGetValue(TURBO_HARVEST, out PlayerOptionData data))
            {
                return data.boolVal;
            }
            return false;
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "option_hello_turbo_harvest": "Turbo Harvest",
  "option_desc_hello_turbo_harvest": "Settlers gather crops at triple speed."
}
```

### OptionAsset의 필드들

| 필드 | 의미 |
| --- | --- |
| `id` | 옵션 고유 식별자 |
| `type` | `OptionType.Bool`, `OptionType.Int`, 또는 `OptionType.String` |
| `default_bool` / `default_int` / `default_string` | 설정되지 않았을 때의 기본값 |
| `translation_key` | 옵션 제목의 로컬라이제이션 키 |
| `translation_key_description` | 툴팁의 로컬라이제이션 키 |
| `action` | 옵션이 바뀔 때 발동되는 콜백 델리게이트 (`ActionOptionAsset`) |
| `reset_to_default_on_launch` | 게임 시작 시 이 옵션을 기본값으로 되돌릴지 여부 |
| `computer_only` | true면 PC 빌드에서만 표시됨 |

> [!WARNING] OptionAsset은 저장소가 아닙니다
> `OptionAsset`은 옵션의 메타데이터와 콜백만 기술합니다. 플레이어가 전환한 실제 값은 `PlayerConfig.dict[id]`에 있습니다. `PlayerOptionData`를 `PlayerConfig.dict`에 함께 넣지 않고 `OptionAsset`만 추가하면, 설정 창이 저장되기 전까지 `PlayerConfig.dict[id]`를 인덱싱하려는 모든 코드가 `KeyNotFoundException`을 던집니다!

## 토글 버튼과 연결하기

네이티브 옵션은 파워 바의 `GodPower` 토글 버튼과 짝지었을 때 빛을 발합니다.

**[권능 탭 & 버튼](#/nml/power-buttons)**에서 설명했듯, `power.toggle_name = HelloOptions.TURBO_HARVEST`를 설정하면 버튼이 여러분의 옵션 상태에 직접 묶입니다. 클릭하면 게임이 `PlayerConfig.dict[toggle_name].boolVal`을 토글하고, 버튼의 시각적 강조를 갱신하며, 여러분의 옵션 콜백을 발동합니다.

## 시뮬레이션 속도 및 시간 배율

월드박스는 `AssetManager.time_scales` (`WorldTimeScaleLibrary`)를 통해 게임의 시뮬레이션 속도를 제어합니다. 각 속도 설정은 `WorldTimeScaleAsset`입니다:

```csharp Mods/HelloBox/Code/HelloSpeed.cs
namespace HelloBox
{
    public static class HelloSpeed
    {
        public const string HYPER = "hello_hyper_speed";

        public static void Initialize()
        {
            if (AssetManager.time_scales.has(HYPER)) return;

            WorldTimeScaleAsset hyper = new WorldTimeScaleAsset
            {
                id = HYPER,
                locale_key = "speed_hello_hyper",
                multiplier = 10f,          // 10x world simulation speed
                ticks = 2,                 // Simulation sub-ticks per frame
                conway_ticks = 2,          // CA ticks per frame (fire, acid, temperature)
                path_icon = "ui/Icons/iconClockX5"
            };

            AssetManager.time_scales.add(hyper);
        }
    }
}
```

| 필드 | 의미 |
| --- | --- |
| `multiplier` | 시각 및 월드 속도 배율 (`1f` = 보통, `0.5f` = 슬로모션) |
| `ticks` | 프레임마다 실행되는 시뮬레이션 패스 횟수 |
| `conway_ticks` | 프레임마다 실행되는 셀룰러 오토마타 패스 횟수 (타일 확산, 용암, 얼음) |
| `locale_key` | 시계 버튼에 마우스를 올렸을 때 표시되는 번역 키 |
| `path_icon` | `ui/Icons/` 안의 아이콘 텍스처 경로 |

바닐라 속도는 `slow_mo` (0.5배), `x1` (1배), `x2` (2배), `x3` (3배), `x4` (4배), `x5` (5배)입니다. (디버그 옵션의 Greg 속도인) 소닉 속도는 시뮬레이션 틱을 그보다도 더 높입니다.

프로그램으로 속도를 활성화하려면:

```csharp
// Smoothly switch world clock to your speed asset:
WorldTimeScaleAsset target = AssetManager.time_scales.get(HelloSpeed.HYPER);
if (target != null)
{
    Config.time_scale_asset = target;
}
```

## 어떤 설정 경로를 골라야 할까요?

| 필요한 것 | 권장 경로 |
| --- | --- |
| 모드 전용 설정 (데미지 배율, 스폰 개수, 켜고 끌 수 있는 기능) | **[모드 설정](#/nml/mod-config)** (`default_config.json`). 모드 카드에 자리 잡고, 숫자/문자열을 깔끔히 다루며, 본편 UI를 어지럽히지 않음 |
| 툴바 버튼에 묶인 토글 | 네이티브 `OptionAsset` + `GodPower.toggle_name` |
| 커스텀 게임 속도나 시뮬레이션 페이스 | `AssetManager.time_scales` (`WorldTimeScaleAsset`) |

다음: 팁을 표시하고 세계 역사를 기록하는 **[메시지 및 세계 기록](#/nml/messages-and-world-log)**.
