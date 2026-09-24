---
title: カスタム建築物
group: ゲームコンテンツ
subgroup: アクター・建物・AI
icon: :wbcities:
order: 142
---

# カスタム建築物 :wbcities:

建築物（Building）の追加は、WorldBox のMOD制作において「数値を1つ弄るだけ」の手軽さから「このアセットには140個ものフィールドがあり、その大半は自分の用途には無関係」という現実へ叩き落とされる境界線です :PES2_Weary:。

そのため、ゼロから新しく組み立てるのではなく、すでに動いている既存の建築物をクローンして作ります。

## まずクローンし、後から微調整する

`clone(newId, sourceId)` は元のすべてのフィールドをコピーし、名前を変え、**登録まで行います**。最後の点が重要です：

```csharp Mods/HelloBox/Code/HelloBuildings.cs
namespace HelloBox
{
    public static class HelloBuildings
    {
        public const string SHRINE = "hello_shrine";

        public static void Initialize()
        {
            if (AssetManager.buildings.has(SHRINE)) return;

            BuildingAsset shrine = AssetManager.buildings.clone(SHRINE, "temple_human");

            shrine.sprite_path = "buildings/hello_shrine";   // a folder, used exactly as written

            // The game preloads every building's frames during its own startup, before your
            // mod existed. Load this one now, or placing it throws "Index was out of range".
            shrine.loadBuildingSprites();

            // Same story for the atlas that recolours it in the owner's colour: the library
            // links it in checkAtlasLink() at startup. Without it every frame throws.
            shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);
            shrine.building_type = BuildingType.Building_Civ;
            shrine.city_building = true;
            shrine.has_kingdom_color = true;
            shrine.max_houses = 0;                     // not housing, nobody lives here
            shrine.housing_slots = 0;
            shrine.draw_light_area = true;
            shrine.draw_light_size = 0.6f;
        }
    }
}
```

設定しなかったものはすべて、動作する都市の建物（building）である `temple_human` のまま残ります。コツはそれだけです。

> [!WARNING] `clone()` の後に `add()` を呼ばない
> `clone()` はすでにコピーを登録しています。その後で `AssetManager.buildings.add(shrine)` を呼ぶと2回目の登録になり、ライブラリは最初のコピーを捨てて `duplicate asset - overwriting...` をログに出します。動きはしますが、ログのノイズになり、あなたのコードをレビューする人が真っ先に指摘する点になります。

## クローン元となるベース

ライブラリには `$…$` で囲まれたテンプレートと、完成された建築物の双方が用意されています:

| クローン元 | 用途 |
| --- | --- |
| `$building$` | 最小限の基底アセット |
| `$city_building$` | 都市が建設する汎用施設。`well` や `mine` が使用 |
| `$city_colored_building$` | 上記と同様だが王国（kingdom）の色で着色される |
| `$building_civ_human$` / `_elf$` / `_orc$` / `_dwarf$` | 文化（culture）別の文明建築物 |
| `$building_creep$` | 侵食バイオーム（Creep）の建造物 |
| `$mineral$` | 採掘可能な岩石や鉱石 |
| `$resource$`, `$flora_small$` | 採取可能な自然物 |
| `tree_green_1` | バニラのすべての樹木はこのアセットからクローン |

クローン元として扱いやすい完成建築物: `house_human_0` … `house_human_5`, `barracks_human`, `temple_human`, `library_human`, `market_human`, `docks_human`, `well`, `mine`, `mineral_stone`, `mineral_gold`。

目的の機能に最も近い建築物を10分かけて調査してクローンするだけで、無意味なフィールドに悩まされる丸一晩の苦労を回避できます。

## 目的別フィールド解説

### 建物の種類

| フィールド | 説明 |
| --- | --- |
| `building_type` | `Building_Civ`, `Building_Nature`, `Building_Tree`, `Building_Mineral`, `Building_Mob`, `Building_Creep`, `Building_Plant`, `Building_Fruits`, `Building_Hives`, `Building_Wheat` |
| `city_building` | 都市に所属し、王国色、領土ゾーン、雇用枠の対象となる |
| `type` | ゲーム内部のリストがグループ化に使用する任意の文字列タグ |
| `kingdom`, `civ_kingdom` | 特定の国家・勢力に限定する |
| `ignored_by_cities` | 都市が建設や統計計算から完全に除外する |

### 居住と用途

| フィールド | 説明 |
| --- | --- |
| `max_houses`, `housing_slots`, `can_units_live_here` | 市民が居住できるか、およびその定員 |
| `housing_happiness` | そこに居住することによる幸福度ボーナス |
| `storage`, `storage_only_food`, `is_stockpile` | 資源（resource）の保管庫として機能するか |
| `book_slots` | 図書館に所蔵できる本の容量 |
| `docks`, `boat_types`, `boat_type_fishing`, `boat_type_trading`, `boat_type_transport` | 船の建造能力 |
| `spawn_units`, `spawn_units_asset` | クリーチャーをスポーンさせる |
| `tower`, `tower_projectile`, `tower_projectile_reload`, `tower_projectile_amount`, `tower_attack_buildings` | 迎撃タワーとしての射撃能力 |

### 建設と配置ルール

| フィールド | 説明 |
| --- | --- |
| `cost`, `construction_progress_needed` | 建設に必要な都市の資源コストと所要時間 |
| `can_be_upgraded`, `upgrade_to`, `upgraded_from`, `upgrade_level` | `house_human_0` から `_5` のようなアップグレード系統 |
| `build_place_borders`, `build_place_center`, `build_place_single`, `build_place_batch` | 都市内のどの位置に建設されるか |
| `build_prefer_replace_house`, `check_for_close_building`, `ignore_same_building_id` | 配置時の干渉・置換ルール |
| `limit_per_zone`, `limit_in_radius`, `limit_global` | 存在できる最大数 |
| `can_be_placed_on_liquid`, `can_be_placed_on_blocks`, `needs_farms_ground`, `only_build_tiles` | 地形に関する制限 |
| `build_road_to` | 都市がこの建物に向けて道路を敷設するか |

### 自然と成長

| フィールド | 説明 |
| --- | --- |
| `can_be_grown`, `vegetation_random_chance`, `is_vegetation` | 時間経過とともに自然発生するか |
| `growth_time`, `has_resources_grown_to_collect` | 作物や果実の成長サイクル |
| `biome_tags_growth`, `has_biome_tags` | どのバイオームで成長するか |
| `resources_given`, `addResource(id, amount, pNewList)` | 採取時に得られる資源 |
| `can_be_chopped_down`, `gatherable` | ユニットによる伐採や採取が可能か |
| `grow_creep` および各種 `grow_creep_*` | 侵食バイオームの拡張挙動 |

### ダメージと破壊

| フィールド | 説明 |
| --- | --- |
| `burnable`, `affected_by_lava`, `affected_by_acid`, `damaged_by_rain`, `can_be_damaged_by_tornado` | 何によってダメージを受けるか |
| `has_ruins_graphics`, `has_ruin_state`, `auto_remove_ruin`, `remove_ruins` | 破壊された後に残る残骸の仕様 |
| `can_be_demolished`, `can_be_abandoned`, `destroy_on_liquid` | 解体や放棄の条件 |
| `loot_generation` | 倒壊時にドロップする戦利品 |

### 見た目と描画

| フィールド | 説明 |
| --- | --- |
| `sprite_path` + `main_path` | スプライト画像の配置場所 |
| `atlas_id`, `atlas_id_fallback_when_not_wobbly` | 使用するスプライトアトラス |
| `scale_base`, `bonus_z`, `random_flip` | サイズ、描画優先度、左右反転 |
| `shadow`, `shadow_bound`, `shadow_distortion` | 影の描画設定 |
| `has_kingdom_color` | 所属する王国の色で着色 |
| `draw_light_area`, `draw_light_size` | 発光効果 |
| `has_special_animation_state`, `animation_speed`, `sparkle_effect` | アニメーション設定 |

### 挙動と動作

| フィールド | 説明 |
| --- | --- |
| `step_action`, `has_step_action` | 建築物の毎ティックごとに実行される独自コード |
| `base_stats` | 建築物が提供するステータス値 |
| `priority` | 都市の建築キューにおける優先順位 |

## スプライト

建物は `sprite_path` から画像を読み込み、**書いたとおり**に使います。`sprite_path` を空にしたときだけ、ゲームは `main_path + id` にフォールバックします。画像は `GameResources/buildings/hello_shrine/` に置き、`sprites.json` で下中央のピボットを指定してください。そうしないと、祠が幽霊のように地面から浮いてしまいます :aPES_GhostDance:。**[スプライト＆リソース](#/nml/sprites-and-resources)** を参照してください。

## 独自のスプライト

下の2つの形のどちらかを選び、混ぜないでください。ローダーの処理は文字どおり、`sprite_path` に何か入っていればそれを使い、なければ `main_path + id` を使う、です。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── buildings/
        └── hello_shrine/
            ├── main_0.png           the building itself
            ├── construction_0.png   while a city is still building it
            ├── ruin_0.png           what is left after it is destroyed
            ├── mini_0.png           the minimap dot, one pixel per tile it covers
            └── sprites.json         bottom-centre pivot
```

**ファイル名がそのまま形式です**。ローダーは各名前を `_` で分けます。前の部分が種類（`main`、`construction`、`ruin`、`disabled`、`spawn`、`special`、ミニマップ用の `mini`）、後ろの数字がアニメーションのフレームです。`mini_0` は建物が占めるタイル数と正確に同じピクセル数でなければならず、`temple_human` からクローンしたものなら 5x4 です。省略すると、ミニマップが再描画のたびに `Building.getColorForMinimap()` で `NullReferenceException` を投げます。`main_0`、`main_1`、`main_2` は3フレームのアニメーションです。それ以外の名前のファイルはフレームではなく、`main_0` のないフォルダーでは建物に描くものがありません。

```csharp
// A: full path in sprite_path. main_path is then ignored.
shrine.sprite_path = "buildings/hello_shrine";

// B: leave sprite_path empty and let main_path + id decide.
shrine.sprite_path = string.Empty;
shrine.main_path = "buildings/";       // -> buildings/hello_shrine
```

2つを混ぜる、つまり `main_path` にフォルダーを書いて `sprite_path` を空にすると、ゲームは `buildings/hello_shrine/hello_shrine` を探します :aPES_BrainScratch:。

> [!WARNING] パスを設定した後、フレームは自分で読み込む
> ゲームはあなたのModより前に動く自身のプリロードで、すべての建物の `building_sprites` を埋めます。後から登録した建物はフレームリストが空のままで、最初に1つ置いた瞬間にゲームは `Building.setAnimData()` で `ArgumentOutOfRangeException: Index was out of range` を出して落ちます :wbfacepalm:。`sprite_path` を設定したら `shrine.loadBuildingSprites();` を呼んでください。
>
> その兄弟が `atlas_asset` で、建物を持ち主の色に塗るスプライトアトラスです。ライブラリはこれを、やはり起動時に `checkAtlasLink()` でリンクします。省くと建物は問題なく置けますが、その後**画面に映っているすべてのフレームで** `DynamicSprites.getRecoloredBuilding()` が `NullReferenceException` を投げます。

`sprites.json` で**下中央のピボット**を指定してください。そうしないと、祠が幽霊のように地面から浮いてしまいます（**[スプライト＆リソース](#/nml/sprites-and-resources)** を参照）。

## マップ上に配置する

`World.world.buildings.addBuilding(...)` は `internal` 修飾子が付いているため、**公開化（publicized）** された `Assembly-CSharp.dll` を参照している環境でのみコンパイルできます（**[ステータス効果](#/nml/status-effects)** の注記を参照）:

```csharp
BuildingAsset asset = AssetManager.buildings.get(HelloBuildings.SHRINE);
if (asset == null || tile == null) return;

if (World.world.buildings.canBuildFrom(tile, asset, null, BuildPlacingType.New))
{
    World.world.buildings.addBuilding(asset, tile);
}
```

必ず事前に `canBuildFrom` で判定を行ってください。水上や他の建物の上、あるいは都市が別用途に確保しているタイルに無理やり建築物を配置すると、一見正常に見えても数分後に世界が崩壊します :PES_OhShit:。

## 都市に自動で建てさせる

神の力でシュラインを1つ落とすのは一時の楽しみに過ぎません。都市が十分に大きくなったとき自分で建ててくれるシュラインこそがModです。都市は次の2つから何を建てるかを選び、あなたの建物はまだそのどちらにも入っていません：

| | 保持している内容 |
| --- | --- |
| **ビルドオーダー**（`AssetManager.city_build_orders`） | `order_temple` のような発注キーのリストで、それぞれ必要な人口と建物数を持つ |
| **アーキテクチャ**（`AssetManager.architecture_library`） | ある種族にとって発注キーが何の建物を意味するか。`order_temple` は人間なら `temple_human`、他の種族なら別の建物 |

そこで、独自の発注キーを1つ作り、すべてのアーキテクチャにその意味を教え、ビルドオーダーに追加します：

```csharp Mods/HelloBox/Code/HelloBuildings.cs
public const string ORDER = "order_hello_shrine";

private static void AddToCities()
{
    BuildingAsset shrine = AssetManager.buildings.get(SHRINE);
    if (shrine == null) return;

    // 独自のtypeを持たせることで、都市はシュラインを神殿とは別枠で数える
    shrine.type = "type_hello_shrine";

    // アーキテクチャの参照はただのDictionaryで、知らないキーはその種族のすべての都市でスローする。
    // 到達しない種族にも念のため教えておく。
    foreach (ArchitectureAsset architecture in AssetManager.architecture_library.list)
    {
        architecture.addBuildingOrderKey(ORDER, SHRINE);
    }

    foreach (CityBuildOrderAsset orders in AssetManager.city_build_orders.list)
    {
        if (orders.list.Exists(pOrder => pOrder.id == ORDER)) continue;

        // 神殿と同じ制限：1つまで、人口50、町の建物15棟
        orders.addBuilding(ORDER, 1, 50, 15);
    }
}
```

`AddToCities()` は `Initialize()` の末尾、クローンの後に呼び出してください。

このガイドの他の多くの部分と違い、ここには起動時トラップはありません。`CityBehBuild.calcPossibleBuildings()` は都市が建築を検討するたびにビルドオーダーのリストを読み直すので、ロード時に追加した発注は最初に見た都市からすぐ認識されます。それでも都市は建物の `cost` を払えて、発注の条件をすべて満たす必要があり、満たせなければ何も言わずシュラインを飛ばします :PES5_Hmmmm:。

| `addBuilding(...)` の引数 | 役割 |
| --- | --- |
| `pID` | 建物IDではなく発注キー |
| `pLimitType` | 都市が持てる上限数。神殿は `1` |
| `pPop` | 必要な最低人口 |
| `pBuildings` | 町にすでに必要な最低建物数 |
| `pCheckFullVillage` | 家がすべて満室のときだけ |
| `pCheckHouseLimit` | 住居用：住居に余裕があるうちはスキップし、都市の住居上限で止まる |
| `pMinZones` | 必要な最低都市サイズ（ゾーン数） |

## テキスト設定

```json Mods/HelloBox/Locales/en.json
{
  "hello_shrine": "Shrine",
  "hello_shrine_description": "Nobody remembers who built it. Everybody agrees it should not be touched."
}
```

> [!TIP] クローンする前にオリジナルの実装を読む
> **dnSpy** で `BuildingLibrary` を開き、`house_human_0`、`tree_green_1`、`mineral_stone` がどのように定義されているか確認してみましょう。バニラのあらゆる建築物がプレーンな C# で構築されており、これ以上ない最高の実践的フィールド資料になります :PES_Smart:。
