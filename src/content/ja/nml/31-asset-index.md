---
title: すべてのアセットライブラリ
group: ゲームコンテンツ
subgroup: 設計とステータス
icon: :wbworld:
order: 94
---

# すべてのアセットライブラリ :wbworld:

`AssetManager` は、ゲーム内に存在し得るあらゆる要素の総合カタログです。**129個のライブラリ**を管理しており、そのすべてがModから読み取り、編集、追加が可能な `List` と `Dictionary` で構成されています。

このページはその完全な一覧です。大半は一度も触れることがないでしょう。重要なのは、WorldBoxで何かを変更したいと思った時、最初の疑問は常に「それはどのライブラリにあるのか？」であり、その答えがこのページにあるということです。

## このページを読む前に

**[アセットライブラリ](#/nml/asset-libraries)** では、これらの基本的な使い方（`has`, `get`, `add`, `clone`, テンプレート、順序変更、そして129個すべてに共通する4つの鉄則）を解説しています。必ず先にそちらをお読みください。このページは純粋な索引です。

要約すると：

```csharp
AssetManager.traits.has("hello_swift");            // 登録済みか？
AssetManager.traits.get("hello_swift");            // 取得（存在しなければnull）
AssetManager.traits.add(myTrait);                  // 新規登録
AssetManager.traits.clone("hello_new", "strong");   // 既存を複製して登録まで行う
AssetManager.traits.list;                          // 登録順の全アセット
AssetManager.traits.dict;                          // ID引きの全アセット
```

---

## クリーチャーとその特性

実際に触る機会が多いのは最初の4つです :PES2_Shrug:。


| ライブラリ | アセット | 保持内容 |
| --- | --- | --- |
| `actor_library` | `ActorAsset` | 全クリーチャー種族。**[カスタムアクター](#/nml/custom-actors)** |
| `traits` | `ActorTrait` | アクター特性（trait）。**[カスタム特性](#/nml/custom-traits)** |
| `trait_groups` | `ActorTraitGroupAsset` | 特性タブ。**[特性グループとタブ](#/nml/trait-groups)** |
| `subspecies_traits` | `SubspeciesTrait` | 亜種（subspecies）特性とグラフィック。**[亜種特性](#/nml/subspecies-traits)** |
| `subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | 亜種特性タブ |
| `phenotype_library` | `PhenotypeAsset` | 肌色や色彩バリエーション |
| `gene_library` | `GeneAsset` | 遺伝子 |
| `chromosome_type_library` | `ChromosomeTypeAsset` | 染色体の種類 |
| `trait_rains` | `TraitRainAsset` | 「特性の雨」イベント |
| `personalities` | `PersonalityAsset` | ユニットの性格 |
| `professions` | `ProfessionAsset` | 市民の職業 |
| `base_stats_library` | `BaseStatAsset` | 全ステータス定義。**[ステータス一覧](#/nml/stats)** |

## 社会システム

| ライブラリ | アセット | 保持内容 |
| --- | --- | --- |
| `kingdoms` | `KingdomAsset` | 勢力タイプ。**[王国と勢力](#/nml/kingdoms)** |
| `kingdoms_traits` / `kingdoms_traits_groups` | `KingdomTrait` | 国家方針・税制。**[王国特性](#/nml/kingdom-traits)** |
| `culture_traits` / `culture_trait_groups` | `CultureTrait` | 文化。**[文化特性](#/nml/culture-traits)** |
| `religion_traits` / `religion_trait_groups` | `ReligionTrait` | 宗教。**[宗教特性](#/nml/religion-traits)** |
| `clan_traits` / `clan_trait_groups` | `ClanTrait` | 一族・氏族。**[一族特性](#/nml/clan-traits)** |
| `language_traits` / `language_trait_groups` | `LanguageTrait` | 言語。**[言語特性](#/nml/language-traits)** |
| `architecture_library` | `ArchitectureAsset` | 各文化の建築スタイル |
| `city_build_orders` | `CityBuildOrderAsset` | 新都市が建設する施設順序 |
| `war_types_library` | `WarTypeAsset` | 戦争のカテゴリ。**[戦争の種類](#/nml/war-types)** |
| `loyalty_library` | `LoyaltyAsset` | 忠誠度の算出要素 |
| `opinion_library` | `OpinionAsset` | 外交感情の算出要素 |
| `happiness_library` | `HappinessAsset` | 幸福度の算出要素 |
| `plots_library` | `PlotAsset` | 統治者が始め、代償を払う陰謀。**[陰謀](#/nml/plots)** |
| `plot_category_library` | `PlotCategoryAsset` | 陰謀ウィンドウの区分。**[陰謀](#/nml/plots)** |
| `decisions_library` | `DecisionAsset` | AIの意思決定（decision） |
| `communication_library` / `communication_topic_library` | `CommunicationAsset` | ユニット間の会話トピック |
| `book_types` | `BookTypeAsset` | 書物の種類。**[本](#/nml/books)** |
| `knowledge_library` | `KnowledgeAsset` | 知識ウィンドウの項目 |

## ワールド内のオブジェクト

| ライブラリ | アセット | 保持内容 |
| --- | --- | --- |
| `buildings` | `BuildingAsset` | 全建造物。**[カスタム建造物](#/nml/custom-buildings)** |
| `tiles` | `TileType` | 地面レイヤー。**[タイルと地形](#/nml/tiles)** |
| `top_tiles` | `TopTileType` | 上層レイヤー |
| `tile_tile_effects` | `TileEffectAsset` | タイル別エフェクト |
| `terraform` | `TerraformOptions` | 地形整地・浄化ルール |
| `biome_library` | `BiomeAsset` | バイオーム。**[バイオーム](#/nml/biomes)** |
| `resources` | `ResourceAsset` | 食料、資材、通貨。**[資源と食料](#/nml/resources)** |
| `clouds` | `CloudAsset` | 天候・雲。**[雲と天候](#/nml/clouds)** |
| `drops` | `DropAsset` | 落下物・雨粒。**[ドロップと落下物](#/nml/drops-and-loot)** |
| `disasters` | `DisasterAsset` | 災害。**[災害](#/nml/disasters)** |
| `projectiles` | `ProjectileAsset` | 飛翔体。**[投射物、呪文、エフェクト](#/nml/projectiles-spells)** |
| `effects_library` | `EffectAsset` | 視覚効果エフェクト |
| `months` | `MonthAsset` | 暦・月 |
| `era_library` | `WorldAgeAsset` | 世界の時代（world age）区分 |
| `time_scales` | `WorldTimeScaleAsset` | ゲーム進行速度。「速く」ボタンは `list` を順番にたどり、デバッグモード以外では最後の項目（バニラの `x40`）には決して到達しません。追加した速度はその到達不能な項目になってしまうので、最後の項目の手前に `Insert` してください |
| `map_sizes` | `MapSizeAsset` | 新規ワールド作成ウィンドウのサイズ一覧。**[マップ生成](#/nml/map-generation)** |
| `map_gen_templates` | `MapGenTemplate` | ワールドの形状：`continent`、`islands`、`donut`など。**[マップ生成](#/nml/map-generation)** |
| `map_gen_settings` | `MapGenSettingsAsset` | テンプレートの下にあるスライダーとスイッチ。**[マップ生成](#/nml/map-generation)** |
| `world_behaviours` | `WorldBehaviourAsset` | ワールド全体の背景挙動 |
| `sim_globals_library` | `SimGlobalAsset` | シミュレーションの大域定数 |

## アイテムと戦闘

| ライブラリ | アセット | 保持内容 |
| --- | --- | --- |
| `items` | `EquipmentAsset` | 武器、防具、素材。**[カスタムアイテム](#/nml/custom-items)** |
| `items_modifiers` | `ItemModAsset` | エンチャント。**[武器エンチャント](#/nml/item-modifiers)** |
| `item_groups` | `ItemGroupAsset` | 装備カテゴリ。**[アイテムグループとタブ](#/nml/item-groups)** |
| `unit_hand_tools` | `UnitHandToolAsset` | ユニットが労働時に持つ手持ち道具 |
| `status` | `StatusAsset` | ステータス効果。**[ステータス効果](#/nml/status-effects)** |
| `spells` | `SpellAsset` | ユニットが自発詠唱する呪文（spell） |
| `combat_action_library` | `CombatActionAsset` | 戦闘アクション |
| `rarity_library` | `RarityAsset` | レア度ランク |

## プレイヤーのツール

| ライブラリ | アセット | 保持内容 |
| --- | --- | --- |
| `powers` | `GodPower` | 神の力。**[神の力（God powers）](#/nml/god-powers)** |
| `power_tab_library` | `PowerTabAsset` | 下部ツールバーのタブ。**[パワーのタブとボタン](#/nml/power-buttons)** |
| `world_laws_library` | `WorldLawAsset` | 世界の法則（world law）。**[世界の法則](#/nml/world-laws)** |
| `world_law_groups` | `WorldLawGroupAsset` | 世界の法則ウィンドウのタブ。**[世界の法則](#/nml/world-laws)** |
| `brush_library` | `BrushData` | ブラシサイズ |
| `hotkey_library` | `HotkeyAsset` | キーボードショートカット |
| `debug_tool_library` | `DebugToolAsset` | デバッグツール群 |

## 人工知能（AI）

| ライブラリ | アセット | 保持内容 |
| --- | --- | --- |
| `job_actor` / `tasks_actor` | `ActorJob` / `BehaviourTaskActor` | 個体AI。**[カスタムAIと挙動](#/nml/custom-ai)** |
| `job_city` / `tasks_city` | `JobCityAsset` / `BehaviourTaskCity` | 都市AI |
| `job_kingdom` / `tasks_kingdom` | `KingdomJob` / `BehaviourTaskKingdom` | 国家AI |
| `citizen_job_library` | `CitizenJobAsset` | 市民の日常労働AI |
| `neural_layers` | `NeuralLayerAsset` | ニューラルレイヤーのデバッグ表示 |
| `tester_jobs` / `tester_tasks` | `JobTesterAsset` | ゲーム内蔵のAIテストハーネス |

## ユーザーインターフェース

専用ページがあるのは `window_library` と `options_library` です :PES5_Hmmmm:。


| ライブラリ | アセット | 保持内容 |
| --- | --- | --- |
| `window_library` | `WindowAsset` | ウィンドウ。**[カスタムウィンドウ](#/nml/custom-windows)** |
| `list_window_library` | `ListWindowAsset` | 一覧ウィンドウ（王国（kingdom）リスト、都市リスト等） |
| `tooltips` | `TooltipAsset` | ツールチップレイアウト |
| `nameplates_library` | `NameplateAsset` | マップモードが王国、都市、氏族などの上に描くネームバナー。`MetaType` ごとに1つで、`add()` は既にプレートがある`MetaType`に対して例外を投げるため、バニラのプレートを編集するには `get()` を使う |
| `options_library` | `OptionAsset` | ゲーム自身の設定画面。**[ゲームオプション](#/nml/game-options)** |
| `color_style_library` | `ColorStyleAsset` | UIカラースタイル |
| `dynamic_sprites_library` | `DynamicSpritesAsset` | 動的生成スプライト |
| `quantum_sprites` | `QuantumSpriteAsset` | スプライトバリエーション |
| `meta_type_library` | `MetaTypeAsset` | メタシステム本体（文化、宗教等） |
| `meta_customization_library` | `MetaCustomizationAsset` | メタエディタ設定項目 |
| `meta_representation_library` | `MetaRepresentationAsset` | メタシステムの描画定義 |
| `meta_text_report_library` | `MetaTextReportAsset` | メタシステムのテキストレポート |
| `architect_mood_library` | `ArchitectMood` | アーキテクトモードのムード |

## 旗と色

それぞれ用途別に分かれたライブラリですが、保持するアセット型は共通の2種類です：

`kingdom_banners_library` · `culture_banners_library` · `clan_banners_library` · `religion_banners_library` · `language_banners_library` · `subspecies_banners_library` · `family_banners_library` → すべて `BannerAsset`

`kingdom_colors_library` · `culture_colors_library` · `clan_colors_library` · `religion_colors_library` · `languages_colors_library` · `subspecies_colors_library` · `families_colors_library` · `armies_colors_library` → すべて `ColorAsset`

## 名前、言葉、歴史

| ライブラリ | アセット | 保持内容 |
| --- | --- | --- |
| `name_generator` | `NameGeneratorAsset` | 命名ジェネレーター。**[名前ジェネレーター](#/nml/name-generators)** |
| `name_sets` | `NameSetAsset` | 命名用単語プール |
| `onomastics_library` / `onomastics_evolution_library` | `OnomasticsAsset` | 人名・地名の変遷構造 |
| `linguistics_library` | `LinguisticsAsset` | 言語生成構造 |
| `words_library` | `WordAsset` | 単語リスト |
| `sentences_library` | `SentenceAsset` | 文章構文 |
| `story_library` | `StoryAsset` | 自動生成される年代記・物語 |
| `world_log_library` | `WorldLogAsset` | 世界記録ログの種別 |
| `history_data_library` / `history_meta_data_library` | `HistoryDataAsset` | 記録された歴史データ |
| `history_groups` | `HistoryGroupAsset` | 歴史カテゴリ |
| `graph_time_library` | `GraphTimeAsset` | グラフの時間軸範囲 |
| `statistics_library` | `StatisticsAsset` | 追跡統計項目 |

## 音響、言語、実績

| ライブラリ | アセット | 保持内容 |
| --- | --- | --- |
| `music_box` | `MusicAsset` | 楽曲トラック |
| `game_language_library` | `GameLanguageAsset` | ゲームのUI言語定義 |
| `locale_groups_library` | `LocaleGroupAsset` | ロケールグループ |
| `achievements` / `achievement_groups` | `Achievement` | 実績（achievement） |
| `signals` | `SignalAsset` | 内部シグナル配信システム |

---

## 目的のライブラリを見つけるコツ

1. **名詞から推測する。** ほぼすべてのライブラリは、保持する対象の名前がそのまま付いています。
2. **中身を出力してみる。** `foreach (var a in AssetManager.buildings.list) LogInfo(a.id);` は、存在するIDを調べるための最速の手段です。
3. **ライブラリの `init()` を読む。** すべてのバニラアセットはそこで素のC#コードとして生成されているため、どのフィールドが何のためのものかを理解する上で最高のドキュメントです。**[ゲームコードを読む](#/toolbox/reading-the-game-code)** を参照してください。

> [!TIP] 新規追加の前にまず既存を書き換える
> Mod開発のかなりの部分は、`get()` して既存のアセットのフィールドを3つほど変更するだけで完了します。コードも短く、ゲーム本体のアップデートにも強く、何より新しいイラストを描く必要がありません :PES2_Wise:。
