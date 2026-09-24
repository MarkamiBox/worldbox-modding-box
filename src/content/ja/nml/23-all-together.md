---
title: 完成したMOD
group: ゲームコンテンツ
subgroup: 仕上げと実績
icon: :wbpeak:
order: 222
---

# 完成したMOD :wbpeak:

順番通りにガイドを進めてきたなら、**[最初のMOD制作](#/nml/your-first-mod)** から始めて1ファイルずつ同じMODへと機能を追加してきたはずです。このページはその総まとめです。すべてのピースが揃った HelloBox の最終的な姿と、それぞれの部品がどのように呼び出し合っているのかを確認しましょう。

## 作ったもの

ファイル20個ちょっと。それがゲーム内でこうなります。どの行もこのガイドの1ページです  :wbpeak:。

| 何 | どこで見えるか |
| --- | --- |
| アクターtraitと、それを置く自前のタブ | ユニットのインスペクター、trait一覧 |
| 文化・宗教・亜種・クラン・言語・王国のtrait | それぞれの窓、システムごとに1つ |
| 武器、その付与効果、そして両方を入れるカテゴリ | ユニットの手、装備タブ |
| ステータス効果 | 生物の頭の上、専用アイコン付き |
| ドロップ、それを降らせる雲、そして飛び道具 | マップ、空中、戦闘のまっただ中 |
| タイル | 地形、すべての下 |
| 食べ物のレシピ | 都市の備蓄 |
| ワールドロー | ワールドローの窓 |
| 神の力、そのタブとボタン | 画面下の神力バー |
| ウィンドウ | 自分が置くと決めた場所 |
| 建物 | 誰かが建てた瞬間の都市 |
| 王国と、そこに属する生物 | マップ、湧いて戦うところ |
| 災害 | 災害メニュー |
| 専用のAIジョブ | 目的を持ってどこかへ歩く生物 |
| 意思決定、都市の職業、手持ちツール | 松明を持って徘徊するウィスプ、都市ごとに1人の番人 |
| 戦闘アクション | 俊足特性を持つユニットが接近前に火の粉を投擲 |
| 遺伝子、性格、本の種類、旗パーツ | ゲノム、統治者、図書館、旗の紋章 |
| 友好度、忠誠度、幸福度イベント | 外交画面と都市の内訳一覧 |
| 陰謀・計画 | 指導者が火の粉の祭典を企てた際の陰謀リスト |
| ワールド時代とワールド挙動 | 時代の車輪とワールドタイマー |
| 実績 | ウィスプが10体になった際の実績ウィンドウ |
| ブラシ、ツールチップ、ショートカットキー | ブラシ切り替え、ホバー時の詳細、F6キー |
| Harmonyパッチ | どこにも出ません。それが狙いで、ルールを静かに変えます |

## 持ち帰る

<a class="dl" href="hellobox.zip" download>
  <span class="dl-icon">📦</span>
  <span class="dl-text">
    <span class="dl-title">HelloBoxをダウンロード</span>
    <span class="dl-sub">完成したmod、このページの全ファイル。<code>worldbox\Mods\</code> に展開してゲームを起動してください。</span>
  </span>
</a>

このガイドのコードブロックから生成しているので、あなたがコピーしてきたコードそのものです。時間とともにズレる別コピーではありません。読んで、壊して、要らない3分の2は消してください。

> [!WARNING] 製品ではなくデモです
> HelloBoxをこのまま公開しても誰の役にも立ちません。わざと小さいことを一つずつ雑にやる機能が20個あるだけです。idを変え、名前を変え、本当に欲しかった部分だけ残してください  :wbbru:。

## フォルダ構造

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

## Main.cs の全体像

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

### なぜこの実行順序なのか

上記の初期化リストに登場しないファイルが3つ存在しますが、それで正常です:

| ファイル | 誰が呼び出すか |
| --- | --- |
| `HelloPatches.cs` | `PatchAll()` が属性（Attribute）を手掛かりに自動検出。手動で呼ぶ必要はない |
| `HelloSettings.cs` | プレイヤーが設定スライダーを動かした際に設定ローダーが直接書き込む |
| `HelloWindow.cs` | ボタンが初めて押された際に自身のメソッドがウィンドウを構築する |

ローカライズ文章もステージ登録不要です。NMLは `OnModLoad` を叩く前に `Locales/en.json` を読み込むため、すべてのキーは最初から利用可能です。それ以外の要素はすべて依存関係で結ばれており、順序には明確な必然性があります:

1. **要素本体より先にグループ**: `group_id` が存在しないグループを指しているアセットは、描画されるべきタブが存在しなくなります。
2. **雲より先にドロップ**: 雲は降らせるドロップのIDを指定するためです。
3. **アイテムや建物より先に資源**: どちらも建設・製造コストとして資源を要求するためです。
4. **アイテムより先にモディファイア**: 武器は付与可能なモディファイアの一覧を保持するためです。
5. **アクターより先に国家（Kingdom）**: アクターは野生状態および文明状態での所属国家IDを指定するためです。
6. **ボタンより先にパワー**: `PowerButtonCreator` はIDでパワーを検索するため、存在しないパワーに結びつけられたボタンは機能しません。
7. **AIより先に関連要素**: タスクは特性やステータスをIDで参照するためです。
8. **意思決定、都市の職業、手持ちツールよりも前に生物アセットと AI を登録する**：これらは既に存在する生物やタスクを参照するためです。
9. **ワールド時代は、その効果で使用する雲・法則・ステータス効果の後に登録する**：陰謀、政治、実績はゲーム実行中に検索を行うため、依存関係の後であればどこに配置しても問題ありません。

ゲーム内で何かが表示されない場合、「それを必要とする要素よりも後に登録してしまっていないか？」は、「ログにエラーが出ていないか？」に次いで確認すべき必須の問いです :PES2_HmmmmNoted:。

## 完成と呼ぶ前の最終チェックリスト

| 項目 | 確認内容 |
| --- | --- |
| ログ | ゲームを起動して `HelloBox` で検索。"ready" が出力され、`Exception` が **一切ない** こと |
| テキスト | ゲーム内のどこにも `trait_hello_x` のような生のキー名が露出していないこと |
| アイコン | パワーバーに透明な穴（画像欠落による空白ボタン）が開いていないこと |
| 設定 | `mods_config/<GUID>.config` を一度削除して再起動し、デフォルト値が正常に適用されること |
| クリーンな環境 | 新規マップを生成し、最高速度で5分間放置した後にログを再確認すること |
| 競合確認 | 他のMODをいくつか有効化してみること。あなたがパッチを当てた箇所は、他の誰かもパッチを当てています |

すべてパスしたら **[MODの公開](#/nml/publishing)** へ進み、世界中のプレイヤーに遊び倒してもらいましょう :aPES3_VictoryPog:。

## 次のステップ

- HelloBox の中で使わない不要なパーツは削除してください。これはデモであって、本物のModではありません。
- その中から **1つだけ** を選び、クオリティをとことん高めてください。12個の要素を中途半端に詰め込んだMODより、1つの要素を完璧に仕上げたMODの方が遥かに愛されます。
- 選んだ要素に関連するバニラのコードを熟読してください（**[ゲームのコードを読む](#/toolbox/reading-the-game-code)**）。あなたが知りたいすべての答えがそこに書かれています :PESgn_ReadRules:。
