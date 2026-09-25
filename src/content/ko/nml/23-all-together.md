---
title: 완성된 모드
group: 게임 콘텐츠
subgroup: 마무리 및 업적
icon: :wbpeak:
order: 222
---

# 완성된 모드 :wbpeak:

지금까지 가이드를 순서대로 따라오셨다면, **[첫 모드 만들기](#/nml/your-first-mod)** 부터 시작해 하나의 모드에 파일을 하나씩 차근차근 추가해 오셨을 것입니다. 이 페이지는 그 모든 조각을 결합하는 최종 조립 단계입니다. 모든 조각이 맞춰진 HelloBox 의 전체 구조와, 각 부품이 서로를 어떻게 호출하는지 확인해 보세요.

## 당신이 만든 것

파일 스무 개 남짓, 그리고 게임 안에서는 이렇게 됩니다. 각 줄이 이 가이드의 한 페이지입니다  :wbpeak:.

| 무엇 | 어디서 보이는지 |
| --- | --- |
| 액터 특성 (trait), 그리고 그걸 담을 나만의 탭 | 유닛 인스펙터, 특성 목록 |
| 문화 (culture), 종교 (religion), 아종 (subspecies), 클랜, 언어, 왕국 (kingdom) 특성 | 각자의 창, 시스템마다 하나씩 |
| 무기, 그 인챈트, 그리고 둘을 담을 카테고리 | 유닛의 손, 장비 탭 |
| 상태 효과 (status) | 생물 머리 위, 전용 아이콘과 함께 |
| 드롭, 그것을 뿌리는 구름 (cloud), 그리고 투사체 (projectile) | 지도, 공중, 싸움 한복판 |
| 타일 | 지형, 모든 것의 아래 |
| 음식 레시피 | 도시의 창고 |
| 월드 법칙 | 월드 법칙 창 |
| 신의 권능 (GodPower), 그 탭과 버튼 | 아래쪽 권능 바 |
| 창 | 당신이 두기로 한 곳 |
| 건물 (building) | 누군가 짓는 순간의 도시 |
| 왕국과 거기 속한 생물 | 지도, 스폰하고 싸우는 모습 |
| 재해 (disaster) | 재해 메뉴 |
| 자기만의 AI 작업 (task) | 목적을 갖고 어딘가로 걸어가는 생물 |
| 결정 (decision), 도시 직업 (job), 손 도구 | 횃불을 들고 배회하는 위스프, 도시당 한 명의 지킴이 |
| 전투 액션 | 신속 특성을 가진 유닛이 접근 전 불씨를 투척 |
| 유전자, 성격, 책 종류, 깃발 파츠 | 게놈, 통치자, 도서관, 깃발 |
| 우호도, 충성도, 행복도 이벤트 | 외교 및 도시 세부 내역 |
| 음모 (plot) | 지도자가 불씨 축제를 계획할 때 음모 목록에 표시 |
| 세계의 시대와 월드 비헤이비어 | 시대의 수레바퀴와 월드 자체 타이머 |
| 도전 과제 | 위스프 10마리 달성 시 도전 과제 창 |
| 브러시, 툴팁, 단축키 | 브러시 순환, 마우스 오버 툴팁, F6 키 |
| Harmony 패치 | 어디에도 안 보입니다. 그게 핵심이고, 규칙을 조용히 바꿉니다 |

## 가져가기

<a class="dl" href="hellobox.zip" download>
  <span class="dl-icon">📦</span>
  <span class="dl-text">
    <span class="dl-title">HelloBox 내려받기</span>
    <span class="dl-sub">완성된 모드, 이 페이지의 모든 파일. <code>worldbox\Mods\</code> 에 풀고 게임을 켜세요.</span>
  </span>
</a>

이 가이드의 코드 블록에서 생성되므로, 당신이 복사해 온 바로 그 코드입니다. 시간이 지나며 어긋나는 별도 사본이 아닙니다. 읽고, 부수고, 필요 없는 3분의 2는 지우세요.

고급 페이지들은 선택적인 레시피도 함께 보여줍니다: **[수동 패치](#/nml/harmony-patches)**, **[타이머와 코루틴](#/nml/update-loops)**, **[맵 생성](#/nml/map-generation)**, **[게임 옵션](#/nml/game-options)**, **[다른 모드와 함께 작업하기](#/nml/other-mods)**. 이것들은 필요할 때 추가하는 것들입니다. 이 다운로드에는 활성화되어 있지 않습니다.

> [!WARNING] 제품이 아니라 데모입니다
> HelloBox를 이대로 배포하면 아무에게도 도움이 안 됩니다. 일부러 작은 일을 하나씩 대충 하는 기능 스무 개일 뿐입니다. id를 바꾸고, 이름을 바꾸고, 정말 원했던 부분만 남기세요  :wbbru:.

## 폴더 구조

```text Mods/HelloBox/
HelloBox/
├── mod.json                         the ID card
├── icon.png                         what players see in the mod list
├── default_config.json              the settings window
├── Locales/
│   └── en.json                      every piece of text
├── GameResources/
│   ├── iconHelloCake.png            the food inventory icon
│   ├── actors/species/other/
│   │   ├── hello_wisp/              main/ and child/: walk_0..3, swim_0..3, sprites.json
│   │   └── hello_golem/             the same shape
│   ├── buildings/hello_shrine/      main_0, construction_0, ruin_0, mini_0, sprites.json
│   ├── cultures/
│   │   └── hello_culture_element.png    a culture banner part
│   ├── drops/hello_ember/           hello_ember_0..1, the falling drop
│   ├── effects/
│   │   ├── clouds/hello_cloud.png   the cloud sprite
│   │   ├── fx_hello_status/         fx_hello_status_0..2, the status overhead
│   │   └── projectiles/hello_bolt/  hello_bolt_0..1, the flying ember
│   ├── items/
│   │   ├── resources/hello_cake/    hello_cake_0..1, cake in hand
│   │   ├── tools/tool_hello_torch/  tool_hello_torch_0, the torch in hand
│   │   └── weapons/
│   │       ├── sprites.json         pivot for held weapons
│   │       ├── w_hello_sword.png    weapon sprite
│   │       └── w_hello_sword/       the in-hand sprite list, with its own sprites.json
│   ├── tiles/hello_moss/            moss_1, a tile variation
│   └── ui/Icons/
│       ├── sprites.json             default icon slicing
│       ├── iconHello*.png           traits, powers, tabs, the age, the gene, the grudge...
│       ├── items/icon_hello_sword.png       weapon inventory icon
│       └── worldrules/icon_hello_law.png    world law switch
└── Code/
    ├── Main.cs                      the door NML knocks on
    ├── HelloSettings.cs             what the settings window writes to
    ├── HelloGroups.cs               your own trait tab and item category
    ├── HelloTraits.cs               an actor trait
    ├── HelloMemory.cs               a trait that remembers, in the save file
    ├── HelloCulture.cs              a culture trait
    ├── HelloReligion.cs             a religion trait
    ├── HelloSubspecies.cs           a subspecies trait
    ├── HelloClan.cs                 a clan trait
    ├── HelloLanguage.cs             a language trait
    ├── HelloGenes.cs                a gene
    ├── HelloKingdomTraits.cs        a kingdom trait
    ├── HelloItems.cs                a weapon cities actually forge
    ├── HelloModifiers.cs            an enchantment
    ├── HelloStatus.cs               a status effect
    ├── HelloDrops.cs                falling embers
    ├── HelloClouds.cs               an ember cloud
    ├── HelloTiles.cs                a top tile
    ├── HelloResources.cs            a food recipe
    ├── HelloProjectiles.cs          a flying ember
    ├── HelloLaws.cs                 a world law switch
    ├── HelloBuildings.cs            a building
    ├── HelloKingdoms.cs             their faction
    ├── HelloActors.cs               your creatures
    ├── HelloAI.cs                   its own behaviour
    ├── HelloDecisions.cs            the wisps choosing it on their own
    ├── HelloCityJobs.cs             a job cities hand out
    ├── HelloTools.cs                a torch in hand
    ├── HelloCombat.cs               a combat move
    ├── HelloPolitics.cs             opinion, loyalty, a happiness event
    ├── HelloPlots.cs                a festival leaders can plot
    ├── HelloAges.cs                 a world age and a world behaviour
    ├── HelloAchievements.cs         an achievement
    ├── HelloPersonality.cs          a ruler personality
    ├── HelloBooks.cs                a kind of book
    ├── HelloBanners.cs              a culture banner part
    ├── HelloBrushes.cs              a brush shape
    ├── HelloTooltips.cs             the panel's tooltip
    ├── HelloHotkeys.cs              F6 opens the panel
    ├── HelloDisasters.cs            an ember storm, with its log line
    ├── HelloPowers.cs               a god power + its tab and buttons
    ├── HelloWindow.cs               a panel
    └── HelloPatches.cs              your Harmony patches
```

## Main.cs 전체 코드

```csharp Mods/HelloBox/Code/Main.cs
using System;
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>, IReloadable
    {
        // Development only: turns on NML's reload button. Never ship it on. See Logs & debugging.
        private static bool DevReload = false;

        protected override void OnModLoad()
        {
            if (DevReload) Config.isEditor = true;

            // Order matters: things that are referenced must exist first.
            Stage("groups", HelloGroups.Initialize);        // tabs before the things that sit in them
            Stage("traits", HelloTraits.Initialize);
            Stage("memory", HelloMemory.Initialize);
            Stage("culture", HelloCulture.Initialize);
            Stage("religion", HelloReligion.Initialize);
            Stage("subspecies", HelloSubspecies.Initialize);
            Stage("clan", HelloClan.Initialize);
            Stage("language", HelloLanguage.Initialize);
            Stage("genes", HelloGenes.Initialize);
            Stage("status", HelloStatus.Initialize);
            Stage("drops", HelloDrops.Initialize);          // clouds rain drops, so drops go first
            Stage("clouds", HelloClouds.Initialize);
            Stage("tiles", HelloTiles.Initialize);
            Stage("biomes", HelloBiomes.Initialize);       // after the tiles, before anything spawns in it
            Stage("resources", HelloResources.Initialize);  // items and buildings cost resources
            Stage("projectiles", HelloProjectiles.Initialize);
            Stage("modifiers", HelloModifiers.Initialize);
            Stage("items", HelloItems.Initialize);          // items can roll the modifiers above
            Stage("buildings", HelloBuildings.Initialize);
            Stage("kingdoms", HelloKingdoms.Initialize);    // actors point at kingdoms
            Stage("kingdom_traits", HelloKingdomTraits.Initialize);
            Stage("names", HelloNames.Initialize);         // before the actors, so they can use its name set
            Stage("actors", HelloActors.Initialize);
            Stage("laws", HelloLaws.Initialize);
            Stage("ai", HelloAI.Initialize);
            Stage("decisions", HelloDecisions.Initialize);  // after the actors and the task they use
            Stage("city_jobs", HelloCityJobs.Initialize);
            Stage("tools", HelloTools.Initialize);
            Stage("combat", HelloCombat.Initialize);        // after the trait that carries it
            Stage("politics", HelloPolitics.Initialize);
            Stage("wars", HelloWars.Initialize);
            Stage("plots", HelloPlots.Initialize);
            Stage("ages", HelloAges.Initialize);            // after the cloud, the law and the status it uses
            Stage("achievements", HelloAchievements.Initialize);
            Stage("personality", HelloPersonality.Initialize);
            Stage("books", HelloBooks.Initialize);
            Stage("banners", HelloBanners.Initialize);
            Stage("brushes", HelloBrushes.Initialize);
            Stage("tooltips", HelloTooltips.Initialize);
            Stage("hotkeys", HelloHotkeys.Initialize);
            Stage("disasters", HelloDisasters.Initialize);
            Stage("powers", HelloPowers.Initialize);        // last: the buttons need the powers

            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
            LogInfo("HelloBox ready");
        }

        private static void Stage(string pName, Action pAction)
        {
            try { pAction(); }
            catch (Exception e) { LogError($"stage '{pName}' failed: {e}"); }
        }

        // NML calls this after it recompiled your code, when you press the reload button
        public void Reload()
        {
            LogInfo("HelloBox reloaded");
        }

        public void Update()
        {
            if (!Config.game_loaded) return;
            if (World.world == null || World.world.units == null || MapBox.instance == null) return;

            // the power tab can only be laid out once its own Start() has run
            HelloPowers.LayoutWhenReady();
        }
    }
}
```

### 등록 순서가 왜 중요한가

위 목록에 나타나지 않는 파일이 3개 있는데, 이것이 지극히 정상적인 설계입니다:

| 파일 | 누가 호출하는가 |
| --- | --- |
| `HelloPatches.cs` | `PatchAll()` 이 어트리뷰트를 보고 자동 검색합니다. 패치는 직접 호출하지 않습니다 |
| `HelloSettings.cs` | 플레이어가 슬라이더를 옮길 때 설정 로더가 값을 직접 대입합니다 |
| `HelloWindow.cs` | 누군가 버튼을 누르는 순간 버튼 메서드가 창을 최초 조립합니다 |

텍스트 파일 역시 등록 단계가 필요 없습니다. NML은 `OnModLoad` 를 호출하기 전에 이미 `Locales/en.json` 을 로드해 두므로 모든 키가 준비되어 있습니다. 그 외의 모든 코드는 상호 의존 관계를 가집니다:

1. **내용물보다 그룹이 먼저**: `group_id` 가 존재하지 않는 그룹을 가리키면 렌더링될 탭이 없어 에셋이 증발합니다.
2. **구름보다 드롭이 먼저**: 구름은 자기가 떨어뜨릴 드롭의 id를 지정하기 때문입니다.
3. **아이템/건물보다 자원이 먼저**: 둘 다 제작 및 건설 비용으로 자원을 요구하기 때문입니다.
4. **아이템보다 수식어가 먼저**: 무기는 자신이 획득 가능한 수식어 (modifier) 목록을 참조하기 때문입니다.
5. **액터보다 왕국이 먼저**: 액터는 야생 및 문명 상태의 소속 왕국 id를 가리키기 때문입니다.
6. **버튼보다 권능이 먼저**: `PowerButtonCreator` 는 id로 권능을 조회하므로 권능이 없으면 빈 껍데기 버튼이 됩니다.
7. **AI보다 AI가 참조할 모든 에셋이 먼저**: 태스크는 트레잇과 상태 효과를 id로 참조하기 때문입니다.
8. **결정, 도시 직업, 손 도구보다 액터와 AI를 먼저 등록하기**: 이들이 가리키는 생명체와 태스크가 이미 존재해야 하기 때문입니다.
9. **세계의 시대는 효과가 사용하는 구름, 세계 법칙 (world law), 상태 효과 뒤에 등록하기**: 음모, 정치, 도전 과제는 게임 실행 중에 대상을 조회하므로 의존성 뒤라면 어디에 두어도 괜찮습니다.

게임에서 무언가 나타나지 않을 때, "로그에 에러가 떴는가?"에 이어 두 번째로 물어야 할 질문은 바로 "그것을 필요로 하는 에셋보다 나중에 등록하지 않았는가?"입니다 :PES2_HmmmmNoted:.

## 배포 전 필수 최종 점검 목록

| 항목 | 확인 사항 |
| --- | --- |
| 로그 | 게임을 켜고 `HelloBox` 를 검색. "ready" 가 찍히고 **어떤** `Exception` 도 없어야 함 |
| 텍스트 | 게임 내 어디에도 `trait_hello_x` 같은 날것의 키 문자열이 노출되지 않아야 함 |
| 아이콘 | 권능 바에 투명한 빈 공간(이미지 누락으로 인한 투명 버튼)이 없어야 함 |
| 모드 설정 | `mods_config/<GUID>.config` 를 삭제하고 재시작하여 기본값이 온전히 적용되는지 확인 |
| 깨끗한 월드 | 새 맵을 열고 최고 속도로 5분간 돌려본 뒤 로그를 다시 점검할 것 |
| 타 모드 호환 | 다른 모드를 몇 개 켜볼 것. 내가 패치한 메서드는 남들도 패치하고 있을 확률이 높음 |

모든 점검을 마쳤다면 **[모드 배포하기](#/nml/publishing)** 로 넘어가 다른 플레이어들이 여러분의 모드를 즐기게 하세요 :aPES3_VictoryPog:.

## 앞으로 나아갈 길

- HelloBox 에서 내 모드에 필요 없는 파트는 과감히 지우세요. 이건 데모일 뿐 실제 모드가 아닙니다.
- 그중 **하나**를 골라 제대로 파고드세요. 열두 가지를 어설프게 흉내 낸 모드보다 한 가지를 완벽하게 구현한 모드가 훨씬 큰 사랑을 받습니다.
- 내가 고른 분야의 바닐라 원본 코드를 꼭 읽어보세요 (**[게임 코드 뜯어보기](#/toolbox/reading-the-game-code)**). 여러분이 궁금해할 모든 해답이 이미 그 안에 적혀 있습니다 :PESgn_ReadRules:.
