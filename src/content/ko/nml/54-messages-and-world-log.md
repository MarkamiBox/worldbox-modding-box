---
title: 메시지 및 세계 기록
group: 게임 콘텐츠
subgroup: 신의 힘 및 UI
icon: :wbscroll:
order: 207
---

# 메시지 및 세계 기록 :wbscroll:

`Main.Log()`로 콘솔에 출력하는 건 코드를 짜는 동안엔 훌륭합니다. 하지만 여러분의 신의 권능이 운석을 떨어뜨리거나, 커스텀 보스 유닛이 깨어나거나, 왕국이 조약을 맺을 때 플레이어는 여러분의 디버그 로그를 읽고 있지 않습니다.

그들에게는 화면상의 피드백이 필요합니다: 화면을 가로질러 떠오르는 팝업 팁, 그리고 세계 역사 기록에 남는 항목들이죠.

## WorldTip으로 화면에 배너 띄우기

플레이어 눈앞에 글자를 가장 빨리 띄우는 방법은 `WorldTip.showNow`입니다:

```csharp
WorldTip.showNow(string pText, bool pTranslate = true, string pPosition = "center", float pTime = 3f, string pColor = "#F3961F");
```

| 매개변수 | 의미 | 기본값 |
| --- | --- | --- |
| `pText` | 원본 문자열 또는 로컬라이제이션 키 | 필수 |
| `pTranslate` | `pText`를 `LocalizedTextManager.getText()`에 통과시킬지 여부 | `true` |
| `pPosition` | 화면 앵커: `"center"`, `"top"`, `"bottom"` | `"center"` |
| `pTime` | 사라지기 전까지의 지속 시간(초) | `3f` |
| `pColor` | 텍스트의 헥스 색상 코드 | `"#F3961F"` (주황) |

> [!WARNING] WorldTip은 기본적으로 번역을 시도합니다
> `pTranslate`의 기본값이 `true`이므로, `WorldTip.showNow("Something happened!")`라고 쓰면 게임은 `"Something happened!"`라는 이름의 로케일 키를 찾으려 듭니다. 당연히 찾지 못하고, 번역 누락 에러를 로그에 남긴 뒤 원본 플레이스홀더 텍스트를 그대로 표시합니다 :PESgn_Oops:.
>
> 있는 그대로의 영어 텍스트를 넘긴다면 **항상** `pTranslate: false`로 설정하세요:
> ```csharp
> WorldTip.showNow("The Ancient Titan has awakened!", pTranslate: false, pColor: "#FF5555");
> ```
> 번역된 텍스트라면 번역 키를 넘기고 `pTranslate: true`를 그대로 두세요:
> ```csharp
> WorldTip.showNow("hello_titan_awakened", pTranslate: true);
> ```

### 하단 툴바 텍스트

브러시를 선택했을 때 뜨는 툴팁처럼, 신의 힘 바 바로 위에 더 은은한 메시지를 띄우고 싶다면 `showToolbarText`를 사용하세요:

```csharp
if (WorldTip.instance != null)
{
    WorldTip.instance.showToolbarText("Right-click to cancel");
}
```

이건 현재 활성화된 파워 바 바로 위에 작은 떠 있는 힌트를 그립니다.

## WorldLog에 세계 이벤트 기록하기

세계 기록(world log)은 플레이어가 역사 창에서 여는 영구 기록입니다. 항목들은 저장 및 불러오기를 견디고, 세계의 연대기에 묶여 있습니다.

게임은 `WorldLog`에 곧바로 쓸 수 있는 몇 가지 정적 헬퍼를 제공합니다:

```csharp
// Record an imperial succession:
WorldLog.logNewKing(kingdom);

// Record the founding of a new realm:
WorldLog.logNewKingdom(kingdom);

// Record a disaster event at a specific tile:
DisasterAsset earthquake = AssetManager.disasters.get("earthquake");
WorldTile centerTile = World.world.GetTile(100, 100);
WorldLog.logDisaster(earthquake, centerTile);
```

### 커스텀 역사 항목

나만의 커스텀 역사 이벤트를 추가하려면, `AssetManager.world_log`의 `WorldLogAsset`으로 `WorldLogMessage`를 만드세요:

```csharp Mods/HelloBox/Code/HelloHistory.cs
namespace HelloBox
{
    public static class HelloHistory
    {
        public static void RecordTitanEvent(Kingdom pKingdom)
        {
            if (pKingdom == null || World.world == null) return;

            WorldLogAsset logAsset = AssetManager.world_log.get("king_new");
            if (logAsset == null) return;

            WorldLogMessage entry = new WorldLogMessage(logAsset, pKingdom.name, "Awakened the Titan")
            {
                timestamp = (int)World.world.getCurWorldTime()
            };

            // add() registers the entry with HistoryHud and writes it to the world log database:
            entry.add();
        }
    }
}
```

`entry.add()`는 항목을 현재 게임의 역사 HUD에 추가하고, `DBInserter.insertLog`를 통해 세계의 SQLite 데이터베이스에 영구 저장합니다.

## 지도 명패 (nameplates_library)

지도 레이어를 켜면 도시, 왕국, 종교 위에 배너가 나타납니다. 이건 `AssetManager.nameplates_library` (`NameplateAsset`)가 처리합니다.

| 필드 | 의미 |
| --- | --- |
| `id` | `MetaType`과 대응하는 식별자 |
| `path_sprite` | 배너 프레임의 스프라이트 경로 |
| `padding_left` / `padding_right` / `padding_top` | 텍스트 여백 경계 |
| `map_mode` | 이 명패가 그려질 대상 `MetaType` |

> [!WARNING] 바닐라 지도 모드에는 add()를 호출하지 마세요
> 라이브러리는 `MetaType`당 명패를 **하나만** 허용합니다. 이미 존재하는 `MetaType`(왕국이나 도시 같은)에 대해 `AssetManager.nameplates_library.add(...)`를 호출하면 예외가 발생합니다 :wbfacepalm:.
>
> 바닐라 명패를 리스킨하거나 스타일만 바꾸고 싶다면, `get()`으로 기존 것을 찾아 필드를 수정하세요:
> ```csharp
> NameplateAsset kingdomPlate = AssetManager.nameplates_library.get("kingdom");
> if (kingdomPlate != null)
> {
>     kingdomPlate.padding_left = 16;
> }
> ```

다음: 플레이어 옵션을 다루는 **[게임 옵션](#/nml/game-options)**, 또는 시계에 맞춰 로직을 돌리는 **[매 프레임마다](#/nml/update-loops)**.
