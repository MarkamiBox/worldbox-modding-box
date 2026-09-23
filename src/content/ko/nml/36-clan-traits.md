---
title: 가문 특성
group: 게임 콘텐츠
subgroup: 특성 및 유전
icon: :wbclanroses:
order: 110
---

# 가문 특성 :wbclanroses:

**가문(Clan)**은 혈통입니다. 고유한 문양, 고유한 색상, 고유한 명성을 지닐 만큼 번성한 일가를 의미합니다. 가문 특성은 바로 그 혈통이 이어받은 유산입니다.

가문 특성은 게임 내에서 유전되는 초능력에 가장 가까운 개념이며, 기본적으로 **남성 / 여성 스탯 분기**를 지원하는 유일한 특성 시스템입니다.

| | |
| --- | --- |
| 라이브러리 | `AssetManager.clan_traits` |
| 클래스 | `ClanTrait` |
| 그룹 | `AssetManager.clan_trait_groups`, 클래스 `ClanTraitGroupAsset` |
| 런타임 소유자 | `Clan`, `World.world.clans` 내부 |
| 로컬라이제이션 접두사 | `clan_trait_` |
| 기본 아이콘 폴더 | `ui/Icons/clan_traits/` |

## 등록하기

```csharp Mods/HelloBox/Code/HelloClan.cs
namespace HelloBox
{
    public static class HelloClan
    {
        public const string OLD_BLOOD = "hello_old_blood";

        public static void Initialize()
        {
            if (AssetManager.clan_traits.has(OLD_BLOOD)) return;

            ClanTrait trait = new ClanTrait
            {
                id = OLD_BLOOD,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloClan",
                rarity = Rarity.R1_Rare
            };

            AssetManager.clan_traits.add(trait);

            trait.base_stats["multiplier_health"] = 0.15f;
            trait.base_stats["armor"] = 4;
            trait.base_stats.addTag("immunity_cold");
        }
    }
}
```

가문의 `base_stats` 는 가문 소속 모든 구성원에게 병합되므로, 종교와 달리 실질적인 능력치 시스템으로 기능합니다. 병합 순서는 **[스탯 레퍼런스](#/nml/stats)** 를 참고하세요.

## 남성 / 여성 스탯 분기

다른 특성 클래스에는 없는 두 가지 고유 필드:

```csharp
trait.base_stats["health"] = 20;           // 모든 구성원 공통
trait.base_stats_male["damage"] = 6;       // 남성 전용
trait.base_stats_female["intelligence"] = 4;   // 여성 전용
```

`Actor.updateStats()` 는 먼저 `clan.base_stats` 를 병합한 후, 유닛의 성별에 따라 `clan.base_stats_male` **또는** `clan.base_stats_female` 을 추가로 결합합니다. 두 추가 블록은 `add()` 에서 할당되는 것이 아니라 처음부터 이미 인스턴스화되어 있으므로 언제든 자유롭게 수정할 수 있습니다.

## 결정: 가문이 *행하는* 일

바닐라 가문 특성은 행동 훅보다 결정(Decisions)에 무게를 둡니다. 가문은 무엇보다 사회적 집단이기 때문입니다:

```csharp
trait.addDecision("banish_unruly_clan_members");
trait.addOpposite("hello_new_blood");
```

결정은 `AssetManager.decisions_library` 에 정의된 AI의 선택지입니다. 바닐라 가문 특성인 `blood_pact` 와 `deathbound` 는 사실상 서로 다른 결정을 지닌 동일한 특성이며 상호 배타적인 반대 특성으로 선언되어 있습니다. 하나의 축을 두고 두 특성을 상호 배타적으로 설계하는 이러한 형태는 매우 모범적인 방식입니다.

## 전투 및 효과 훅

```csharp
// 가문 구성원의 공격이 적중할 때마다
trait.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null) return false;
    return true;
};

// 주기적 타이머 기반, 모든 가문 구성원에게 실행
trait.special_effect_interval = 2f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreHealth(1);
    return true;
};
```

반드시 null 검사를 수행하고, 아무런 조치를 취하지 않은 경우 `false` 를 반환하세요. 이 훅들은 해당 특성을 지닌 모든 가문의 모든 구성원을 대상으로 실행됩니다.

## 업적 달성으로 잠금 해제

바닐라 가문 특성 중 몇몇은 기본 개방이 아닌 업적 보상으로 지정되어 있습니다:

```csharp
trait.setUnlockedWithAchievement("achievementSegregator");
```

잠긴 특성도 정상적으로 존재하며 게임 내에서 온전히 작동합니다. 단지 업적이 달성되기 전까지 플레이어가 에디터에서 임의로 선택할 수 없을 뿐입니다. 참고로 이러한 방식으로 잠긴 특성에는 `BaseTraitLibrary` 가 자동으로 `rarity = R3_Legendary` 를 부여합니다.

## 바닐라 그룹

`spirit` · `mind` · `body` · `chaos` · `harmony` · `fate` · `special`

나만의 탭 만들기: **[특성 그룹 및 탭](#/nml/trait-groups)** 참조 (`AssetManager.clan_trait_groups` 및 `ClanTraitGroupAsset`).

## 텍스트

```json Mods/HelloBox/Locales/en.json
{
  "clan_trait_hello_old_blood": "Old Blood",
  "clan_trait_hello_old_blood_info": "Their great-grandparents were also difficult to kill."
}
```

## 특성 부여하기

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addClanTrait(HelloClan.OLD_BLOOD);
```

```csharp
foreach (Clan clan in World.world.clans)
{
    if (clan == null || clan.isRekt()) continue;

    clan.addTrait(HelloClan.OLD_BLOOD, pRemoveOpposites: true);
}
```

유닛의 가문은 `actor.clan` 에 있으며, `actor.hasClan()` 으로 가문 소속 여부를 확인할 수 있습니다. 실제로 수많은 유닛들은 평생 어떤 가문에도 가입하지 않습니다.

> [!TIP] 가문은 규모가 작으므로 과감해져도 좋습니다
> 문화는 대륙 전체를 지배하지만 가문은 하나의 가족에 국한되며 `limit_clan_members` 로 최대 인원이 제한됩니다. 따라서 동일한 수준의 밸런스 영향력 안에서 가문 특성은 문화 특성보다 훨씬 강력하게 설계할 수 있습니다. 극적인 능력을 부여하기에 가문만큼 안성맞춤인 곳은 없습니다 :PES5_Menace:.

## 새로 생기는 가문이 특성을 스스로 뽑도록 하기

직접 부여하는 방법 외에도, 가문 특성은 `spawn_random_trait_allowed`를 설정해 새 가문이 결성될 때 뽑히도록 할 수 있습니다. 문화가 초기 특성을 뽑는 방식과 동일합니다.

> [!WARNING] `spawn_random_trait_allowed`는 게임 시작 시 딱 한 번만 읽힙니다
> 새로 생기는 가문은 게임이 로드되는 동안 `BaseTraitLibrary.linkAssets()`가 만드는 풀에서 초기 특성을 뽑습니다. 이는 여러분의 모드가 존재하기도 전의 시점입니다. 특성에 이 플래그를 켜는 것만으로는 아무것도 바뀌지 않습니다. 여러분의 특성은 그 풀에 절대 들어가지 않으며, 새로 생긴 가문에게 우연히 부여되는 일도 없습니다. 바닐라와 같은 가중치로 직접 넣어주세요:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.clan_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly`는 `protected`이므로, NML이 모드를 빌드할 때 이미 사용하는 publicize된 어셈블리를 기준으로 컴파일됩니다. `spawn_random_rate`의 기본값은 `5`이며, 값을 올릴수록 더 자주 등장합니다.
