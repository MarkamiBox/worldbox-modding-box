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

`clone(newId, sourceId)` はオリジナルのすべてのフィールドをコピーし、新しいIDを付与した上で、**自動的に登録（register）まで完了**します。この最後の仕様が極めて重要です:

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

明示的に変更しなかったプロパティは、すべて実績ある都市建築物である `temple_human` の設定値がそのまま維持されます。これが最も堅実な手法です。

> [!WARNING] clone() の後に add() を呼んではいけない
> `clone()` の内部ですでに登録が行われています。その直後に `AssetManager.buildings.add(shrine)` を呼び出すと2重登録となり、ライブラリは最初のコピーを破棄して `duplicate asset - overwriting...` というログを出力します。動作自体はしますがログが汚れ、コードレビューで真っ先に突っ込まれる原因になります。

## クローン元となるベース

ライブラリには `$…$` で囲まれたテンプレートと、完成された建築物の双方が用意されています:

| クローン元 | 用途 |
| --- | --- |
| `$building$` | 最小限の基底アセット |
| `$city_building$` | 都市が建設する汎用施設。`well` や `mine` が使用 |
| `$city_colored_building$` | 上記と同様だが王国の色で着色される |
| `$building_civ_human$` / `_elf$` / `_orc$` / `_dwarf$` | 文化別の文明建築物 |
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
| `storage`, `storage_only_food`, `is_stockpile` | 資源の保管庫として機能するか |
| `book_slots` | 図書館に所蔵できる本の容量 |
| `docks`, `boat_types`, `boat_type_fishing` … | 船の建造能力 |
| `spawn_units`, `spawn_units_asset` | クリーチャーをスポーンさせる |
| `tower`, `tower_projectile`, `tower_projectile_reload` … | 迎撃タワーとしての射撃能力 |

### 建設と配置ルール

| フィールド | 説明 |
| --- | --- |
| `cost`, `construction_progress_needed` | 建設に必要な都市の資源コストと所要時間 |
| `can_be_upgraded`, `upgrade_to`, `upgraded_from` … | `house_human_0` から `_5` のようなアップグレード系統 |
| `build_place_borders`, `build_place_center` … | 都市内のどの位置に建設されるか |
| `build_prefer_replace_house`, `check_for_close_building` … | 配置時の干渉・置換ルール |
| `limit_per_zone`, `limit_in_radius`, `limit_global` | 存在できる最大数 |
| `can_be_placed_on_liquid`, `can_be_placed_on_blocks` … | 地形に関する制限 |
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
| `burnable`, `affected_by_lava`, `affected_by_acid` … | 何によってダメージを受けるか |
| `has_ruins_graphics`, `has_ruin_state`, `auto_remove_ruin` … | 破壊された後に残る残骸の仕様 |
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
| `has_special_animation_state`, `animation_speed` … | アニメーション設定 |

### 挙動と動作

| フィールド | 説明 |
| --- | --- |
| `step_action`, `has_step_action` | 建築物の毎ティックごとに実行される独自コード |
| `base_stats` | 建築物が提供するステータス値 |
| `priority` | 都市の建築キューにおける優先順位 |

## スプライト

建築物は `main_path + sprite_path`、つまり `buildings/hello_shrine` というパスで画像を探します。PNG画像を `GameResources/buildings/hello_shrine.png` に配置すれば、バニラの建物と同様に読み込まれます。`sprites.json` でピボットを「下部中央（bottom-centre）」に設定しないと、祠が幽霊のように地面から浮遊してしまうので注意してください :aPES_GhostDance:。**[スプライトとリソース](#/nml/sprites-and-resources)** を参照してください。

## 独自のスプライト

建築物は **2つ** のフィールドを連結する唯一のアセットです: `main_path + sprite_path`。`main_path` のデフォルト値はすでに `buildings/` になっているため、`sprite_path` にはファイル名だけを指定します。

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

**ファイル名そのものが形式**です。ローダーは名前を `_` で分けます。前が種類（`main`、`construction`、`ruin`、`disabled`、`spawn`、`special`）、後ろがアニメーションのフレーム番号です。`main_0`、`main_1`、`main_2` で3フレームのアニメーションになります。それ以外の名前のファイルはフレームではなく、`main_0` のないフォルダでは建物に描くものがありません。

```csharp
shrine.main_path = "buildings/";       // デフォルト値。変更することは滅多にない
shrine.sprite_path = "hello_shrine";   // "buildings/hello_shrine" ではない
```

混ぜてしまう、つまり `main_path` にフォルダを書いて `sprite_path` を空にすると、ゲームは `buildings/hello_shrine/hello_shrine` を探しにいきます :aPES_BrainScratch:。

> [!WARNING] パスを設定したらフレームは自分でロードする
> ゲームは起動時のプリロードで全建物の `building_sprites` を埋めますが、それはmodより前です。後から登録した建物はフレーム一覧が空で、初めて置いた瞬間に `Building.setAnimData()` で `ArgumentOutOfRangeException: Index was out of range` が出て落ちます :wbfacepalm:。`sprite_path` を設定したら `shrine.loadBuildingSprites();` を呼んでください。
>
> 兄弟分が `atlas_asset` で、建物を持ち主の色に塗るアトラスです。ライブラリはこれも起動時に `checkAtlasLink()` で紐付けます。無いと建物は置けますが、その後 **画面に映っている間は毎フレーム** `DynamicSprites.getRecoloredBuilding()` で `NullReferenceException` を出します。


`sprites.json` で必ず **下部中央ピボット** を設定してください。そうしないと祠が空中に浮いてしまいます。詳細は **[スプライトとリソース](#/nml/sprites-and-resources)** を参照してください。

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

## テキスト設定

```json Mods/HelloBox/Locales/en.json
{
  "hello_shrine": "Shrine",
  "hello_shrine_description": "Nobody remembers who built it. Everybody agrees it should not be touched."
}
```

> [!TIP] クローンする前にオリジナルの実装を読む
> **dnSpy** で `BuildingLibrary` を開き、`house_human_0`、`tree_green_1`、`mineral_stone` がどのように定義されているか確認してみましょう。バニラのあらゆる建築物がプレーンな C# で構築されており、これ以上ない最高の実践的フィールド資料になります :PES_Smart:。
