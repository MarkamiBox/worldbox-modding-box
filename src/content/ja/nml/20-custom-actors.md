---
title: カスタムアクター
group: ゲームコンテンツ
subgroup: アクター・建物・AI
icon: :wbhuman:
order: 140
---

# カスタムアクター :wbhuman:

> [!NOTE] 種族ではなく「アクター」と呼ぶ
> ゲーム内では、人間、狼、ドラゴン、ゾンビ、カニなど、すべての生きた存在を **アクター**（actor）と呼びます。これらはすべて同一の `ActorAsset` クラスから派生し、`AssetManager.actor_library` に格納されています。「種族（Race）」は過去の呼称です。コード内に唯一残っているのは `[Obsolete("use .original_actor_asset instead")]` と注記された `race` プロパティだけであり、古代のセーブデータを読み込むためだけに存在しています。コード内では常に `actor` と記述してください。

新しいクリーチャーの追加は、誰もが一度は作りたがり、そしてほぼ全員が挫折するジャンルです。なぜなら `ActorAsset` はアニメーション、テクスチャ、効果音、分類学、食性、AIフラグ、ゲノム、文化、ステータスといった膨大な要素を抱え込んでいるからです。たった1つの設定を誤っただけで、大洋の真ん中に直立不動の透明なユニットが佇むことになります :PES4_Invisible:。

朗報です。ゲーム本体もクリーチャーをゼロから組み上げているわけではありません。バニラがエルフを生成する処理は、文字通りこれだけです:

```csharp
clone("elf", "$civ_advanced_unit$");
```

私たちも全く同じ手法をとります。

## テンプレート

`$` で囲まれたIDは **テンプレート** です。他のアクターがクローンできるようにゲームが用意している未完成のアクター定義です。人間のスプライトなどの不要なアセットを引き継ぐことなく、内部配線だけを綺麗に受け継ぐことができるため、完全な新クリーチャーを作る際の最適な出発点となります。

| テンプレート | クローン用途 |
| --- | --- |
| `$basic_unit$` | 最低限の生命体 |
| `$animal$` | 野生動物 |
| `$mob$` | 敵対的モンスター |
| `$civ_unit$` | 文明を持つ基本生物 |
| `$civ_advanced_unit$` | 都市、国家、文化、宗教を持つ完全な文明生物。人間、エルフ、オーク、ドワーフが使用 |

また、`human`、`wolf`、`zombie` といった完成済みアクターをクローンすることも可能です。最初のMOD制作ではドナーのスプライトが最初から付随し、すぐにゲーム内で姿を確認できるため、こちらのルートが最も簡単です。

## 1体のアクターを作成する

```csharp Mods/HelloBox/Code/HelloActors.cs
namespace HelloBox
{
    public static class HelloActors
    {
        public const string SPRITE = "hello_sprite";

        public static void Initialize()
        {
            if (AssetManager.actor_library.has(SPRITE)) return;

            // clone() copies every field, gives the copy the new id, and registers it.
            // Do NOT call add() afterwards: that registers it a second time and the
            // library logs "duplicate asset - overwriting...".
            ActorAsset sprite = AssetManager.actor_library.clone(SPRITE, "human");

            sprite.name_locale = "Sprite";
            sprite.civ = true;                       // founds cities, joins kingdoms, goes to war
            sprite.can_have_subspecies = true;
            sprite.actor_size = ActorSize.S13_Human;
            sprite.color_hex = "#7FE7C4";
            sprite.icon = "iconHelloSprite";

            // visible immediately: no need to discover them first
            sprite.needs_to_be_explored = false;

            // Taxonomy: what the knowledge window shows.
            sprite.name_taxonomic_genus = "spiritus";
            sprite.name_taxonomic_species = "minor";

            // Stats. clone() already ran add(), so base_stats exists here.
            sprite.base_stats["health"] = 80;
            sprite.base_stats["damage"] = 12;
            sprite.base_stats["speed"] = 32f;

            // see the warning below: the shadow is not loaded for you
            sprite.texture_asset.loadShadow();
        }
    }
}
```
> [!WARNING] 影は自分でロードする。でないと全アクターで怒られる
> `ActorAssetLibrary` は起動時にリストを走査し、各アクターで `loadShadow()` を呼びます。これは `shadows/<shadow_texture>` のスプライトを読み、サイズを測ります。それはmodが何かを登録するより前なので、あなたのアクターの影は `(0.00, 0.00)` のままで、ゲームはアセットエラーを3回、成体・卵・幼体ぶん出します :wbfacepalm:。
>
> `loadShadow()` は `internal` なので、ガイドの他の箇所と同じく **publicized** な `Assembly-CSharp.dll` が要ります。ない場合は代わりに `asset.shadow = false;` にしてください。影は出ませんが、エラーも出ません。


> [!WARNING] clone() はすでに登録を完了している
> `AssetManager.<library>.clone(newId, sourceId)` は内部で `add()` を呼び出します。どのライブラリもこの規則で動いています。その後に自前で `add()` を呼ぶと2重登録となり、ライブラリは最初のインスタンスを破棄してエラーログを出力した上で再登録します。無害とはいえログが汚れ、真のエラーの発見を妨げる上、コードレビューで真っ先に指摘されます。
>
> 逆に言えば、**クローン直後は既に `base_stats` が初期化されている** というメリットがあります。**[カスタム特性](#/nml/custom-traits)** で解説した「add の後にステータスを設定する」という鉄則が最初からクリアされているのです。

## 複数のアクターを一括登録する

大半のクリーチャーMODは1体だけで終わりません。3体の妖精を追加するなら3つのアセットが必要になり、上記のコードブロックを3回コピー＆ペーストした瞬間から、バグを直す場所が3箇所に増えてしまいます。

差分を構造体の配列にまとめ、ループ処理で生成しましょう:

```csharp Mods/HelloBox/Code/HelloActors.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloActors
    {
        // Everything that actually differs between the three, in one place.
        private struct Def
        {
            public string Id;
            public string From;      // which actor or template to clone
            public string Color;
            public string Icon;
            public float Health;
            public float Damage;
            public float Speed;
            public bool OwnArt;      // true: sprites come from GameResources/actors/species/other/<id>/
        }

        private static readonly Def[] Defs = new Def[]
        {
            new Def { Id = "hello_sprite", From = "human", Color = "#7FE7C4", Icon = "iconHelloSprite", Health = 80,  Damage = 12, Speed = 32f },
            new Def { Id = "hello_wisp",   From = "wolf",  Color = "#C49BFF", Icon = "iconHelloWisp",   Health = 60,  Damage = 20, Speed = 40f, OwnArt = true },
            new Def { Id = "hello_golem",  From = "wolf",  Color = "#8C8C8C", Icon = "iconHelloGolem",  Health = 240, Damage = 30, Speed = 18f, OwnArt = true },
        };

        public static void Initialize()
        {
            for (int i = 0; i < Defs.Length; i++)
            {
                Register(Defs[i]);
            }
        }

        private static void Register(Def pDef)
        {
            if (AssetManager.actor_library.has(pDef.Id)) return;
            if (!AssetManager.actor_library.has(pDef.From)) return;   // donor missing, skip quietly

            ActorAsset asset = AssetManager.actor_library.clone(pDef.Id, pDef.From);

            asset.civ = !pDef.OwnArt;                // a civ needs heads, male and female sheets
            asset.can_have_subspecies = true;
            asset.actor_size = ActorSize.S13_Human;
            asset.color_hex = pDef.Color;
            asset.icon = pDef.Icon;

            if (pDef.OwnArt)
            {
                // clone() copied the donor's texture paths, so point this one at its own folder.
                // The folder holds main/ and child/, one PNG per frame: walk_0..3, swim_0..3.
                asset.texture_asset = new ActorTextureSubAsset("actors/species/other/" + pDef.Id + "/", false);
                asset.has_advanced_textures = false;
                asset.animation_walk = ActorAnimationSequences.walk_0_3;
                asset.animation_swim = ActorAnimationSequences.swim_0_3;
                asset.animation_idle = ActorAnimationSequences.walk_0;
            }

            // visible immediately: no need to discover them first
            asset.needs_to_be_explored = false;

            asset.base_stats["health"] = pDef.Health;
            asset.base_stats["damage"] = pDef.Damage;
            asset.base_stats["speed"] = pDef.Speed;

            // The library loads every actor's shadow during its own startup, which was before
            // your mod existed. Without this the game logs "Shadow size is too small (0.00, 0.00)".
            asset.texture_asset.loadShadow();
        }
    }
}
```

4体目を追加する作業は、テーブルに1行書き足すだけで完了します。公開されているほぼ全てのクリーチャーMODが最終的にこの形に落ち着いており、2体目以降は最初からこのように組むのが得策です :PESgn_ThisTBH:。

## 生物の本質を決定づけるフィールド群

初日に大事なのは3つだけです：`civ`、`actor_size`、`name_locale`。残りは、クリーチャーが見えて歩くようになるまで後回しで構いません。

| フィールド | 説明 |
| --- | --- |
| `civ` | 文明生物フラグ: 都市、国家、職業、戦争の対象。`false` = 動物 |
| `auto_civ` | ゲーム側が自動的に文明化を開始するかどうか |
| `default_animal` | ゲーム内部の判定において野生動物として扱う |
| `unit_other` | 文明でも動物でもない分類: モブ、ゴーレム、特殊ユニットなど |
| `actor_size` | `S0_Bug` … `S13_Human` … `S17_Dragon`。描画と戦闘計算に影響 |
| `name_locale` | 表示名用のローカライズキー |
| `icon` | リストやスポーンボタンで表示されるアイコン |
| `color_hex` | 着色可能なユニットに適用されるカラーコード |
| `can_have_subspecies` | 世代交代を経て亜種に変異するかどうか |
| `has_ai_system` | 一般的な行動AIシステムを実行するかどうか |
| `flying` / `hovering` | 地面から浮上するかどうか、およびその高度 |
| `force_ocean_creature` / `force_land_creature` | 生息可能な地形を海洋または陸地に固定 |
| `can_attack_buildings` | 建造物を標的に攻撃・破壊できるか |
| `has_soul`, `can_receive_traits`, `can_be_cloned` | 神の力による干渉の許可設定 |
| `kingdom_id_wild` / `kingdom_id_civilization` | 所属する勢力（野生時および定住時） |
| `texture_atlas` | `UnitTextureAtlasID.Units`, `Boats`, `Zombies` … スプライトの所属アトラス |
| `animation_walk` / `animation_idle` / `animation_swim` | コマ送りアニメーション定義とそれぞれの `_speed` |
| `sound_idle`, `sound_spawn`, `sound_death` … | FMOD サウンドイベントのパス |
| `name_taxonomic_*` | 知識ウィンドウに表示される界・門・綱・目・科・属・種 |
| `collective_term` | 群れの呼び方（「狼の **群れ**」など） |
| `allowed_status_tiers` | 付与可能なステータス効果の階級 |
| `production` | 都市が生産する品目 |
| `zombie_id_internal`, `skeleton_id`, `mush_id` … | 死亡時や変異時の転換先 |

## 文明を持つ生物をワールドに組み込む

`civ` を持つアクターは、ステータスを並べただけでは完成しません。バニラがプレイ可能な種族すべてに設定している以下の項目を怠ると、せっかく作ったカスタム文明が「何も行動しない」事態に陥ります:

```csharp
asset.kingdom_id_wild = "nomads_human";          // 定住前の遊牧民状態
asset.kingdom_id_civilization = "human";         // 国家種別
asset.banner_id = "human";                       // 国旗ジェネレーター
asset.architecture_id = "human";                 // 建築物の見た目
asset.build_order_template_id = "build_order_advanced";
asset.name_template_sets = new string[] { "human_default_set" };   // 命名規則
asset.civ_base_cities = 3;
asset.family_limit = 20;

asset.addPreferredColors("teal", "lime");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// ゲノム: 繁殖や突然変異に影響する遺伝ステータス分布
asset.addGenome(
    ("health", 70f), ("stamina", 200f), ("lifespan", 500f),
    ("damage", 10f), ("speed", 20f), ("offspring", 2f),
    ("intelligence", 6f), ("diplomacy", 5f), ("warfare", 2f), ("stewardship", 2f));

// 特性システム別の初期特性
asset.addCultureTrait("bow_lovers");
asset.addReligionTrait("rite_of_change");
asset.addSubspeciesTrait("long_lifespan");
asset.addClanTrait("blood_pact");
asset.addLanguageTrait("melodic");
asset.addKingdomTrait("tax_rate_local_low");
```

独自のアセットが完成するまでは、バニラの `banner_id` と `architecture_id` を流用してください。建築グラフィックのない種族は、何も建設することができません。

## スポーンさせる

```csharp
Actor actor = World.world.units.spawnNewUnit("hello_sprite", tile, pSpawnSound: true, pAdultAge: true);
```

`spawnNewUnit` は public メソッドであり、出現効果音、奇跡エフェクト、出現高度、特定の亜種指定、初期装備の有無などを引数で指定できます。

これを呼び出す神の力ボタンを用意すれば、立派なスポナーの完成です。**[パワータブ & ボタン](#/nml/power-buttons)** を参照してください。

## 亜種（Subspecies）

亜種とは、アクターが何世代にもわたる繁殖の中で分岐していく変異種のことです。アクター特性とは完全に分離された独自の特性ライブラリとグループリストを持っています:

```csharp
SubspeciesTrait scales = new SubspeciesTrait
{
    id = "hello_scales",
    group_id = "body",
    spawn_random_trait_allowed = true
};
AssetManager.subspecies_traits.add(scales);
scales.base_stats["armor"] = 5;

// アクターの初期特性として登録
asset.addSubspeciesTrait("hello_scales");
```

亜種特性には **グラフィック** も組み込むことができます: `sprite_path`, `animation_walk`, `skin_citizen_male`, `skin_warrior` などを指定することで、別のアクターを新規定義することなく、親種とは外見の異なる亜種を表現できます。**[亜種特性](#/nml/subspecies-traits)** を参照してください。

## 独自のアイコン

アニメーション制作に入る前に、まずは手軽なアイコンの準備です。リストやスポーンボタンに表示されます。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSprites.png
```

```csharp
sprite.icon = "iconHelloSprites";
```

クリーチャーの **身体本体** のスプライト制作は全く別の難関であり、この後の項目で解説します。

## スプライトこそが最難関

ここまでの解説は、コードにすればわずか1ページ分にすぎません。本当の重労働は美術作業で、ほとんどのクリーチャーModはここで静かに息絶えます。クリーチャーを動かすには、適切なアトラス内に、適切なサイズとピボット位置で、完全なアニメーションフレーム群を描き起こす必要があります。現実的な選択肢は2つあります:

1. **ドナーのスプライトをそのまま流用する。** 人間のアニメーションを流用し、ステータスと色合いだけを変えたクリーチャーは、最初のMODとして完全に成立しており、何より*確実に動きます*。
2. **AssetRipper でバニラのアセットを抽出し**、クローン元のアトラスの配置構成をピクセル単位で完全に把握してから描き始めること。**[ゲームのグラフィックを抽出する](#/toolbox/getting-the-sprites)** を参照してください。

> [!WARNING] 空白のマップではなく、実際のワールドでテストする
> 経路探索ができない、建設ができない、スポーン直後に溺死するといった不具合を抱えた文明生物でも、最初の30秒間は完全に正常に見えます。20体ほどスポーンさせ、最高速度で5分間ワールドを稼働させた上で、ログをじっくり確認してください :PES_MonkaSweat:。
