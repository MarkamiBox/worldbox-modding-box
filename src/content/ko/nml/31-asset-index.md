---
title: 모든 에셋 라이브러리
group: 게임 콘텐츠
subgroup: 구조 및 스탯
icon: :wbworld:
order: 94
---

# 모든 에셋 라이브러리 :wbworld:

`AssetManager`는 게임 내에 존재할 수 있는 모든 객체를 총망라하는 대백과사전입니다. 무려 **129개의 라이브러리**를 보유하고 있으며, 각각의 라이브러리는 모드에서 읽고, 수정하고, 추가할 수 있는 하나의 `List`와 `Dictionary`로 구성되어 있습니다.

이 페이지는 그 전체 목록입니다. 대부분은 평생 건드릴 일이 없을 것입니다. 하지만 WorldBox에서 무언가를 수정하고자 할 때 첫 번째 질문은 항상 "그게 어느 라이브러리에 들어있는가?"이며, 그에 대한 해답이 바로 여기에 정리되어 있습니다.

## 이 페이지를 읽기 전에

**[에셋 라이브러리](#/nml/asset-libraries)** 에서는 라이브러리를 다루는 기본 원리(`has`, `get`, `add`, `clone`, 템플릿 활용, 순서 재배치, 그리고 129개 라이브러리 전체에 적용되는 4대 원칙)를 다룹니다. 반드시 그 문서를 먼저 읽으세요. 본 문서는 순수한 색인입니다.

핵심 요약:

```csharp
AssetManager.traits.has("hello_swift");            // 등록되어 있는가?
AssetManager.traits.get("hello_swift");            // 가져오기 (없으면 null)
AssetManager.traits.add(myTrait);                  // 새로 등록하기
AssetManager.traits.clone("hello_new", "brave");   // 기존 에셋을 복제하고 복제본 자동 등록까지 완료
AssetManager.traits.list;                          // 순서대로 정렬된 모든 에셋
AssetManager.traits.dict;                          // ID로 매핑된 모든 에셋
```

---

## 크리처 및 특성

| 라이브러리 | 에셋 | 담고 있는 내용 |
| --- | --- | --- |
| `actor_library` | `ActorAsset` | 모든 크리처 유형. **[커스텀 액터](#/nml/custom-actors)** |
| `traits` | `ActorTrait` | 액터 특성. **[커스텀 특성](#/nml/custom-traits)** |
| `trait_groups` | `ActorTraitGroupAsset` | 특성 탭. **[특성 그룹 및 탭](#/nml/trait-groups)** |
| `subspecies_traits` | `SubspeciesTrait` | 아종 특성 및 외형 텍스처. **[아종 특성](#/nml/subspecies-traits)** |
| `subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | 아종 특성 탭 |
| `phenotype_library` | `PhenotypeAsset` | 피부색 및 색상 변형 |
| `gene_library` | `GeneAsset` | 유전자 |
| `chromosome_type_library` | `ChromosomeTypeAsset` | 염색체 종류 |
| `trait_rains` | `TraitRainAsset` | "특성의 비" 이벤트 |
| `personalities` | `PersonalityAsset` | 유닛 성격 |
| `professions` | `ProfessionAsset` | 시민의 직업 |
| `base_stats_library` | `BaseStatAsset` | 모든 능력치 정의. **[스탯 레퍼런스](#/nml/stats)** |

## 사회 시스템

| 라이브러리 | 에셋 | 담고 있는 내용 |
| --- | --- | --- |
| `kingdoms` | `KingdomAsset` | 세력 유형. **[왕국 및 세력](#/nml/kingdoms)** |
| `kingdoms_traits` / `kingdoms_traits_groups` | `KingdomTrait` | 왕국 정책 및 조세. **[왕국 특성](#/nml/kingdom-traits)** |
| `culture_traits` / `culture_trait_groups` | `CultureTrait` | 문화. **[문화 특성](#/nml/culture-traits)** |
| `religion_traits` / `religion_trait_groups` | `ReligionTrait` | 종교. **[종교 특성](#/nml/religion-traits)** |
| `clan_traits` / `clan_trait_groups` | `ClanTrait` | 가문. **[가문 특성](#/nml/clan-traits)** |
| `language_traits` / `language_trait_groups` | `LanguageTrait` | 언어. **[언어 특성](#/nml/language-traits)** |
| `architecture_library` | `ArchitectureAsset` | 문화별 건물 외형 양식 |
| `city_build_orders` | `CityBuildOrderAsset` | 신생 도시의 건설 우선순위 |
| `war_types_library` | `WarTypeAsset` | 전쟁 유형 |
| `loyalty_library` | `LoyaltyAsset` | 충성도 증감 요인 |
| `opinion_library` | `OpinionAsset` | 외교 호감도 요인 |
| `happiness_library` | `HappinessAsset` | 행복도 증감 요인 |
| `plots_library` / `plot_category_library` | `PlotAsset` | 유닛과 시스템이 꾸미는 음모 |
| `decisions_library` | `DecisionAsset` | AI 의사결정 |
| `communication_library` / `communication_topic_library` | `CommunicationAsset` | 유닛 간 대화 주제 |
| `book_types` | `BookTypeAsset` | 서적 종류 |
| `knowledge_library` | `KnowledgeAsset` | 지식 창 항목 |

## 월드 내 오브젝트

| 라이브러리 | 에셋 | 담고 있는 내용 |
| --- | --- | --- |
| `buildings` | `BuildingAsset` | 모든 건축물. **[커스텀 건물](#/nml/custom-buildings)** |
| `tiles` | `TileType` | 바닥 지면 레이어. **[타일 및 지형](#/nml/tiles)** |
| `top_tiles` | `TopTileType` | 지표면 상층 레이어 |
| `tile_tile_effects` | `TileEffectAsset` | 타일별 이펙트 |
| `terraform` | `TerraformOptions` | 타일 정격 정리 규칙 |
| `biome_library` | `BiomeAsset` | 바이옴 |
| `resources` | `ResourceAsset` | 음식, 자원, 화폐. **[자원 및 음식](#/nml/resources)** |
| `clouds` | `CloudAsset` | 날씨 및 구름. **[구름 및 날씨](#/nml/clouds)** |
| `drops` | `DropAsset` | 낙하물. **[드롭 및 낙하물](#/nml/drops-and-loot)** |
| `disasters` | `DisasterAsset` | 재앙. **[재앙](#/nml/disasters)** |
| `projectiles` | `ProjectileAsset` | 날아가는 투사체. **[투사체, 주문 및 이펙트](#/nml/projectiles-spells)** |
| `effects_library` | `EffectAsset` | 시각 특수효과 |
| `months` | `MonthAsset` | 달력 및 월 |
| `era_library` | `WorldAgeAsset` | 세계의 시대 구분 |
| `time_scales` | `WorldTimeScaleAsset` | 게임 진행 속도 |
| `map_sizes` | `MapSizeAsset` | 맵 크기 정의 |
| `map_gen_settings` / `map_gen_templates` | `MapGenSettingsAsset` | 월드 생성 설정 |
| `world_behaviours` | `WorldBehaviourAsset` | 월드 단위 백그라운드 동작 |
| `sim_globals_library` | `SimGlobalAsset` | 전역 시뮬레이션 상수 |

## 아이템 및 전투

| 라이브러리 | 에셋 | 담고 있는 내용 |
| --- | --- | --- |
| `items` | `EquipmentAsset` | 무기, 방어구, 재료. **[커스텀 아이템](#/nml/custom-items)** |
| `items_modifiers` | `ItemModAsset` | 무기 마법부여. **[아이템 모디파이어](#/nml/item-modifiers)** |
| `item_groups` | `ItemGroupAsset` | 장비 분류군. **[아이템 그룹 및 탭](#/nml/item-groups)** |
| `unit_hand_tools` | `UnitHandToolAsset` | 노동 시 유닛이 손에 쥐는 도구 |
| `status` | `StatusAsset` | 상태 효과. **[상태 효과](#/nml/status-effects)** |
| `spells` | `SpellAsset` | 유닛이 시전하는 마법 주문 |
| `combat_action_library` | `CombatActionAsset` | 전투 모션 및 기술 |
| `rarity_library` | `RarityAsset` | 희귀도 등급 |

## 플레이어 도구

| 라이브러리 | 에셋 | 담고 있는 내용 |
| --- | --- | --- |
| `powers` | `GodPower` | 신의 권능. **[신의 권능](#/nml/god-powers)** |
| `power_tab_library` | `PowerTabAsset` | 하단 바 탭. **[파워 탭 및 버튼](#/nml/power-buttons)** |
| `world_laws_library` / `world_law_groups` | `WorldLawAsset` | 세계의 법칙. **[세계의 법칙](#/nml/world-laws)** |
| `brush_library` | `BrushData` | 브러시 크기 |
| `hotkey_library` | `HotkeyAsset` | 단축키 |
| `debug_tool_library` | `DebugToolAsset` | 디버그 도구 모음 |

## 인공지능 (AI)

| 라이브러리 | 에셋 | 담고 있는 내용 |
| --- | --- | --- |
| `job_actor` / `tasks_actor` | `ActorJob` / `BehaviourTaskActor` | 유닛 AI. **[커스텀 AI 및 비헤이비어](#/nml/custom-ai)** |
| `job_city` / `tasks_city` | `JobCityAsset` / `BehaviourTaskCity` | 도시 AI |
| `job_kingdom` / `tasks_kingdom` | `KingdomJob` / `BehaviourTaskKingdom` | 왕국 AI |
| `citizen_job_library` | `CitizenJobAsset` | 시민의 일상 노동 |
| `neural_layers` | `NeuralLayerAsset` | 신경망 레이어 디버그 뷰 |
| `tester_jobs` / `tester_tasks` | `JobTesterAsset` | 게임 내장 AI 테스트 프레임워크 |

## 유저 인터페이스

| 라이브러리 | 에셋 | 담고 있는 내용 |
| --- | --- | --- |
| `window_library` | `WindowAsset` | 팝업 창. **[커스텀 창](#/nml/custom-windows)** |
| `list_window_library` | `ListWindowAsset` | 목록 창 (왕국 목록, 도시 목록 등) |
| `tooltips` | `TooltipAsset` | 툴팁 레이아웃 |
| `nameplates_library` | `NameplateAsset` | 머리 위 이름표 |
| `options_library` | `OptionAsset` | 게임 설정 옵션 |
| `color_style_library` | `ColorStyleAsset` | UI 색상 테마 |
| `dynamic_sprites_library` | `DynamicSpritesAsset` | 런타임 생성 스프라이트 |
| `quantum_sprites` | `QuantumSpriteAsset` | 스프라이트 변형군 |
| `meta_type_library` | `MetaTypeAsset` | 메타 시스템 본체 (문화, 종교 등) |
| `meta_customization_library` | `MetaCustomizationAsset` | 메타 편집기 설정 옵션 |
| `meta_representation_library` | `MetaRepresentationAsset` | 메타 렌더링 양식 |
| `meta_text_report_library` | `MetaTextReportAsset` | 메타 텍스트 보고서 |
| `architect_mood_library` | `ArchitectMood` | 설계자 모드 무드 |

## 깃발 및 색상

용도별로 분리되어 있으나 모두 동일한 두 가지 에셋 타입을 관리합니다:

`kingdom_banners_library` · `culture_banners_library` · `clan_banners_library` · `religion_banners_library` · `language_banners_library` · `subspecies_banners_library` · `family_banners_library` → 모두 `BannerAsset`

`kingdom_colors_library` · `culture_colors_library` · `clan_colors_library` · `religion_colors_library` · `languages_colors_library` · `subspecies_colors_library` · `families_colors_library` · `armies_colors_library` → 모두 `ColorAsset`

## 작명, 언어 및 역사

| 라이브러리 | 에셋 | 담고 있는 내용 |
| --- | --- | --- |
| `name_generator` | `NameGeneratorAsset` | 이름 생성기 |
| `name_sets` | `NameSetAsset` | 단어 풀 모음집 |
| `onomastics_library` / `onomastics_evolution_library` | `OnomasticsAsset` | 고유명사 변화 규칙 |
| `linguistics_library` | `LinguisticsAsset` | 언어 구조 |
| `words_library` | `WordAsset` | 단어 |
| `sentences_library` | `SentenceAsset` | 문장 구성 |
| `story_library` | `StoryAsset` | 생성되는 연대기 이야기 |
| `world_log_library` | `WorldLogAsset` | 월드 로그 항목 유형 |
| `history_data_library` / `history_meta_data_library` | `HistoryDataAsset` | 기록된 역사 데이터 |
| `history_groups` | `HistoryGroupAsset` | 역사 범주 |
| `graph_time_library` | `GraphTimeAsset` | 그래프 시간 범위 |
| `statistics_library` | `StatisticsAsset` | 집계 통계 항목 |

## 사운드, 언어 및 진행도

| 라이브러리 | 에셋 | 담고 있는 내용 |
| --- | --- | --- |
| `music_box` | `MusicAsset` | 배경 음악 트랙 |
| `game_language_library` | `GameLanguageAsset` | 게임 공식 UI 지원 언어 |
| `locale_groups_library` | `LocaleGroupAsset` | 로케일 그룹 |
| `achievements` / `achievement_groups` | `Achievement` | 업적 |
| `signals` | `SignalAsset` | 내부 신호 전파 시스템 |

---

## 알맞은 라이브러리를 찾는 법

1. **명사를 유추하세요.** 거의 모든 라이브러리는 자신이 담고 있는 대상의 이름 그대로 명명되어 있습니다.
2. **콘솔에 내용을 출력하세요.** `foreach (var a in AssetManager.buildings.list) LogInfo(a.id);` 두 줄이면 어떤 id들이 존재하는지 즉시 파악할 수 있습니다.
3. **라이브러리의 `init()` 메서드를 읽으세요.** 모든 바닐라 에셋은 그곳에서 순수 C# 코드로 생성되므로, 특정 필드가 실제로 무슨 역할을 하는지 파악하기에 가장 훌륭한 설명서입니다. **[게임 코드 읽기](#/toolbox/reading-the-game-code)** 를 확인하세요.

> [!TIP] 추가하기 전에 기존 에셋을 먼저 수정해 보세요
> 모딩 작업의 상당 부분은 `get()`으로 기존 에셋을 가져온 뒤 두세 개의 필드만 입맛에 맞게 바꾸는 것으로 끝납니다. 코드도 훨씬 간결하고, 게임 업데이트에도 끄떡없으며, 새로운 그림을 그릴 필요도 없습니다 :PES2_Wise:.
