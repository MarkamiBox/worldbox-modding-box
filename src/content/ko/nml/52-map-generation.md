---
title: 맵 생성
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbworld:
order: 169
---

# 맵 생성 :wbworld:

새 월드 창은 라이브러리 세 개를 읽습니다. `map_sizes`는 크기 선택기이고, `map_gen_templates`는 (`continent`, `islands`, `donut`... 같은) 모양 카드들의 줄이며, `map_gen_settings`는 카드를 고른 뒤 나오는 슬라이더와 스위치들입니다. 셋 다 평범한 에셋 라이브러리입니다. 다만 이 중 하나만 플러그 앤 플레이이고, 나머지는 어떤 부분에 UI 작업이 필요한지 여러분이 직접 부딪히기 전에 미리 알려드리겠습니다.

## 더 큰 맵

크기는 `MapSizeAsset`이고, 필드는 네 개뿐입니다:

| 필드 | 의미 |
| --- | --- |
| `id` | 번역 키이기도 함, 접두사와 함께: `map_size_<id>` |
| `size` | 맵의 한 변, 64타일 블록 단위. `iceberg`는 `9`이므로 576 x 576 |
| `path_icon` | 크기 이름 옆의 아이콘, `ui/Icons/` 기준 상대 경로 |
| `show_warning` | 창의 인사말을 "이 맵은 큽니다" 경고로 바꿈 |

바닐라 값들: `tiny` 2 · `small` 3 · `standard` 4 · `large` 5 · `huge` 6 · `gigantic` 7 · `titanic` 8 · `iceberg` 9.

```csharp Mods/HelloBox/Code/HelloMapGen.cs
namespace HelloBox
{
    public static class HelloMapGen
    {
        public const string COLOSSAL = "hello_colossal";

        public static void Initialize()
        {
            AddColossal();
            AddRing();
        }

        public const string RING = "hello_ring";

        private static void AddRing()
        {
            if (AssetManager.map_gen_templates.has(RING)) return;

            MapGenTemplate ring = AssetManager.map_gen_templates.clone(RING, "donut");

            // values is a plain object, so the clone shares donut's. give it its own before touching it
            ring.values = new MapGenValues
            {
                gradient_round_edges = true,
                add_center_gradient_land = true,
                add_center_lake = true,
                ring_effect = true,
                perlin_noise_stage_2 = true,
                random_shapes_amount = 3
            };

            // reset copies from a backup table filled at startup, and your id is not in it
            ring.show_reset_button = false;
        }

        public static void OpenRing()
        {
            if (!AssetManager.map_gen_templates.has(RING)) return;

            Config.current_map_template = RING;
            ScrollWindow.showWindow("new_world_templates_2");
        }

        private static void AddColossal()
        {
            if (AssetManager.map_sizes.has(COLOSSAL)) return;

            AssetManager.map_sizes.add(new MapSizeAsset
            {
                id = COLOSSAL,
                size = 10,                   // 10 x 64 = 640 tiles a side
                path_icon = "iconIceberg",   // ui/Icons/ is added for you
                show_warning = true
            });

            // the size switcher reads an array built in linkAssets(), which ran before your mod
            AssetManager.map_sizes.linkAssets();
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "map_size_hello_colossal": "Colossal"
}
```

> [!WARNING] `linkAssets()` 없이는 크기에 도달할 수 없습니다
> 창의 화살표는 라이브러리를 직접 훑지 않습니다. `MapSizeLibrary.linkAssets()`가 시작 시점에, NML이 여러분의 모드를 로드하기도 전에 한 번 만들어 둔 평범한 `string[]`을 훑습니다. 크기는 등록됐지만, 화살표는 영원히 그걸 지나쳐 갑니다. `linkAssets()`를 다시 호출하면 그 배열을 다시 만들 뿐이므로 안전합니다.

화살표는 `list` 순서대로 진행되므로, 추가된 크기는 `iceberg` 뒤에 붙습니다. 더 큰 맵에는 딱 맞는 자리죠. 더 작은 크기를 원한다면 `linkAssets()`를 호출하기 전에 `list.Remove`와 `list.Insert(0, ...)`가 필요합니다.

코드를 보고 알 수 있는 한계는 다음과 같습니다:

- **Workshop 업로드가 거부합니다.** 업로드는 크기를 `Config.maxMapSize`(즉 `iceberg`)와 비교하고, 그보다 크면 "Not a valid world size!"로 거부합니다.
- **여러분의 모드 없이는 저장 목록이 원시 숫자로 표시됩니다.** 저장 브라우저는 숫자로 크기를 찾고, 일치하는 게 없으면 "width x height"로 대체합니다. 그런 저장 파일이 모드 없이도 깔끔하게 로드되는지는 확인하지 못했습니다.
- **얼마나 더 커질 수 있는지는 확인하지 못했습니다.** `10`은 `iceberg`보다 타일이 23% 더 많고, 그 뒤로 갈수록 비용은 더 커집니다. 어딘가에 플레이어의 컴퓨터가 싫어할 숫자가 있을 겁니다 :PES5_Hmmmm:.

## 새로운 월드 모양

템플릿은 `MapGenTemplate`입니다. 실제 레시피는 `values`에 있고, 나머지는 그게 어떻게 보여질지를 결정합니다:

| 필드 | 의미 |
| --- | --- |
| `values` | `MapGenValues`: 생성기가 읽는 플래그와 숫자들. 아래 참고 |
| `path_icon` | 미리보기 이미지, 전체 경로: `ui/new_world_templates_icons/template_donut` |
| `force_height_to` | 첫 노이즈 패스 이후, 나머지가 모양을 잡기 전에 모든 타일 높이를 이 값으로 설정. `0`이면 건너뜀 |
| `freeze_mountains` | 육지가 완성되면 산 정상을 고정함 |
| `perlin_replace` | 높이 기반 타일 치환. 예: "170 이상이면 `soil_high`가 `soil_low`가 됨" |
| `special_anthill`, `special_checkerboard`, `special_cubicles` | 하드코딩된 세 생성기 중 하나를 켬 |
| `allow_edit_*` | 이 템플릿에서 플레이어에게 어떤 설정 행이 보일지. 다음 섹션 참고 |
| `show_reset_button` | 창에 "초기화" 버튼이 있을지 여부 |

바닐라 ID들 (전부 유효한 `clone()` 소스입니다): `continent` · `box_world` · `islands` · `toast` · `pancake` · `boring_plains` · `checkerboard` · `cubicles` · `dormant_volcano` · `cheese` · `bad_apple` · `donut` · `lasagna` · `chaos_pearl` · `anthill` · `empty`.

그리고 알아둘 만한 `MapGenValues` 필드들:

| 필드 | 의미 |
| --- | --- |
| `main_perlin_noise_stage`, `perlin_noise_stage_2`, `perlin_noise_stage_3` | 육지를 만드는 세 번의 노이즈 패스 |
| `perlin_scale_stage_1` / `_2` / `_3` | 각 패스가 얼마나 확대되어 있는지. 기본값 `5` |
| `gradient_round_edges` / `square_edges` | 맵 가장자리로 갈수록 원형 또는 사각형으로 높이를 낮춤 |
| `add_center_gradient_land`, `add_center_lake`, `center_gradient_mountains` | 육지, 호수, 산을 중앙으로 밀어줌 |
| `ring_effect` | 고리 모양의 추가 노이즈 패스 |
| `add_mountain_edges` / `remove_mountains` | 맵 테두리에 산맥 / 산을 평지로 깎음 |
| `low_ground` / `high_ground` | 노이즈 패스 이후 지면을 낮추거나 높임 |
| `random_shapes_amount` | 위에 찍히는 랜덤 덩어리의 개수 |
| `random_biomes`, `add_vegetation`, `add_resources` | 마지막 세 개는 기본값이 `true` |

위의 `AddRing()`은 바닐라 템플릿을 clone 해서 자신만의 레시피를 부여합니다. 세 메서드 모두 같은 `HelloMapGen` 클래스 안에 두세요.

```json Mods/HelloBox/Locales/en.json
{
  "template_hello_ring": "Ember Ring",
  "template_hello_ring_info": "A lake in the middle, land around it, and nobody asked for it."
}
```

> [!WARNING] 내 템플릿에서는 초기화 버튼을 숨기세요
> "초기화"는 `resetTemplateValues()`를 호출하며, 시작 시점에 바닐라 ID들로 한 번 채워진 딕셔너리에서 템플릿의 기본값을 읽어옵니다. 여러분의 ID는 그 안에 없으므로 버튼을 누르면 `KeyNotFoundException`이 발생합니다. `show_reset_button = false`로 하면 이 문제 자체가 사라집니다.

> [!WARNING] clone 된 템플릿은 `values`를 공유합니다
> `clone()`은 리스트를 새 리스트로 복사하지만, `values`는 평범한 클래스라 참조로 복사됩니다 (**[에셋 라이브러리](#/nml/asset-libraries)** 참고). `new MapGenValues` 줄 없이 `ring.values.ring_effect`를 수정하면 모든 바닐라 donut도 함께 바뀝니다. `perlin_replace` 안의 항목들도 같은 방식으로 공유되므로, 수정하지 말고 새로 만드세요.

### 함정: 카드가 없습니다

템플릿 선택기는 프리팹입니다. 바닐라 템플릿마다 버튼이 하나씩 있고, 각 버튼은 자기 GameObject 이름으로 템플릿을 찾습니다. 새 템플릿에는 버튼이 없고, 라이브러리를 아무리 바꿔도 이건 바뀌지 않습니다.

대신 통하는 방법은 버튼의 역할을 직접 대신하는 것입니다: 템플릿을 설정하고, 바닐라 카드가 하는 것과 똑같이 두 번째 창을 여세요.

버튼에서 `HelloMapGen.OpenRing()`을 호출하세요.

이걸 간단한 버튼에 연결하면 (**[권능 탭 & 버튼](#/nml/power-buttons)** 참고), 플레이어는 바닐라 템플릿과 마찬가지로 미리보기, 설정 행, 크기 화살표, 생성 버튼을 전부 얻게 됩니다. 선택기 안에 진짜 카드를 넣으려면 기존 버튼 중 하나를 clone 해서 `Awake()`가 실행되기 전에 이름을 바꿔야 하는데, 그때 이름을 읽기 때문입니다. 이건 검증하지 못한 UI 수술이라 이 페이지에서 다루지 않습니다.

> [!NOTE] 대신 바닐라 템플릿을 수정하기
> `AssetManager.map_gen_templates.get("islands").values.random_shapes_amount = 10;`는 동작하며, 버튼이 전혀 필요 없습니다. 다만 "초기화"는 모드가 로드되기 전에 찍어둔 시작 시점 복사본을 복원한다는 점만 알아두세요. 한 번 클릭하면 다음 재시작 전까지 여러분의 변경은 사라집니다.

## 템플릿 아래의 행들

두 번째 창의 슬라이더와 스위치 각각은 `MapGenSettingsAsset`입니다:

| 필드 | 의미 |
| --- | --- |
| `is_switch` | 숫자 대신 켜기/끄기 |
| `min_value` / `max_value` | 숫자일 경우의 범위 |
| `allowed_check` | 현재 템플릿을 기준으로 이 행이 보일지 여부 |
| `action_get` / `action_set` | 값을 읽고 쓰기, 보통 현재 템플릿의 `values`에 |
| `increase` / `decrease` / `action_switch` | 화살표와 스위치가 하는 일 |

바닐라 행들: `gen_perlin_scale_stage_1` · `gen_perlin_scale_stage_2` · `gen_perlin_scale_stage_3` · `gen_random_shapes` · `gen_cubicles_sizes` · `gen_random_biomes` · `gen_mountain_edges` · `gen_add_vegetation` · `gen_add_resources` · `gen_add_center_lake` · `gen_add_center_land` · `gen_round_edges` · `gen_square_edges` · `gen_ring_effect` · `gen_low_ground` · `gen_high_ground` · `gen_remove_mountains` · `gen_forbidden_knowledge`.

모드가 실제로 쓰는 부분은 이겁니다: 모든 바닐라 행의 `allowed_check`는 여러분 템플릿의 `allow_edit_*` 플래그 중 하나를 읽습니다. 즉 행을 추가하는 게 아니라, 플레이어에게 이 중 어떤 걸 줄지 고르는 겁니다:

```csharp
// in AddRing(), after the clone: hide everything, then give back the rows that make sense for a ring
AssetManager.map_gen_templates.disableNormalSettings(ring);
ring.allow_edit_random_biomes = true;
ring.allow_edit_random_vegetation = true;
```

재미있는 사실: 세 개의 perlin 슬라이더 전부 `allow_edit_perlin_scale_stage_1`만 확인합니다. `_2`와 `_3` 플래그는 존재하지만 아무도 읽지 않습니다 :PES2_Shrug:.

새로운 `MapGenSettingsAsset`만 등록해서는 아무것도 보이지 않습니다. 행들은 창의 프리팹에 박혀 있고, 템플릿 카드와 같은 트릭으로 GameObject 이름으로 자기 에셋을 찾습니다. 나만의 행을 만들려면 창 안의 기존 행을 clone 해야 하고, 등록하는 무엇이든 `allowed_check`가 설정돼 있어야 합니다. 창이 모든 행에 대해 null 체크 없이 그걸 호출하기 때문입니다.

> [!TIP] 설정이 아니라 모양에서 시작하세요
> 열에 아홉은, 여러분이 원하는 건 다른 `values`를 가진 템플릿과 그걸 여는 버튼일 뿐입니다. 프리팹 수정이 전혀 필요 없죠. 게임 업데이트 후에는 필드를 다시 확인하세요. 지형이 마음에 들면, **[생물 군계](#/nml/biomes)**가 그 위에 무엇이 자랄지를 결정합니다 :PES2_Wise:.
