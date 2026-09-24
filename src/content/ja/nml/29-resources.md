---
title: 資源と食料
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbtomato:
order: 182
---

# 資源と食料 :wbtomato:

資源（resource）とは、都市が保管、交易、消費、あるいは鍛造に用いるあらゆる物質を指します。小麦、パン、石材、ミスリル、骨、宝石などです。これらは `AssetManager.resources` に格納されており、経済全体の根底を支えるレイヤーとなっています。農場が生産するもの、パン職人が焼くもの、鍛冶屋が必要とするもの、そして飢えた住民が食べるものです。このご時世、パンですらデータ構造です :PES2_Cash:。

## テンプレートからクローンする

> [!WARNING] `full_sprite_path` を入れないとローダーが落ちる
> `path_gameplay_sprite` だけでは足りません。ライブラリはそこから `full_sprite_path` を `post_init()` で一度だけ組み立てます。ゲーム自身のロード中なので、modが登録したリソースはそこが `null` のままです。スプライトのプリローダーが `getSpriteList(null)` を呼び、ロード全体が `ArgumentNullException: Value cannot be null. Parameter name: key` で死にます :wbfacepalm:。

```csharp Mods/HelloBox/Code/HelloResources.cs
namespace HelloBox
{
    public static class HelloResources
    {
        public const string CAKE = "hello_cake";

        public static void Initialize()
        {
            if (AssetManager.resources.has(CAKE)) return;

            // $TEMPLATE_FOOD$ と $TEMPLATE_STRATEGIC_MINERAL$ が最適な2大出発点です。
            ResourceAsset cake = AssetManager.resources.clone(CAKE, "$TEMPLATE_FOOD$");

            cake.path_icon = "iconHelloCake";       // inventory icon in GameResources/
            cake.path_gameplay_sprite = "hello_cake";   // in-hand sprite in GameResources/

            // これはライブラリが post_init() で決めますが、もう走り終わっています。自分で入れてください。
            cake.full_sprite_path = "items/resources/" + cake.path_gameplay_sprite;   // ユニットが手に抱えて運ぶスプライト

            cake.ingredients = new string[] { "wheat", "honey" };
            cake.ingredients_amount = 1;

            cake.restore_nutrition = 140;
            cake.restore_happiness = 25;
            cake.restore_stamina = 15;
            cake.give_experience = 10;

            cake.produce_min = 40;
            cake.maximum = 999;
            cake.trade_bound = 50;
            cake.trade_give = 5;
        }
    }
}
```

## 各フィールドの解説

### 基本属性

| フィールド | 役割 |
| --- | --- |
| `type` | `ResType.Food`, `Ingredient_Food`, `Ingredient`, `Strategic`, `Currency` |
| `food` | ユニットが食事として摂取できるかどうか |
| `wood`, `mineral` | どの収穫ツールや職業が適用されるか |
| `path_icon` | インベントリや一覧画面に表示されるアイコン |
| `path_gameplay_sprite` | 運搬時にユニットが両手で抱えるスプライト |

### 摂食・消費時の効果

| フィールド | 役割 |
| --- | --- |
| `restore_nutrition` | 回復する満腹度 |
| `restore_health` | 回復する体力（割合） |
| `restore_stamina`, `restore_mana`, `restore_happiness` | その他の各種ステータスバーの回復量 |
| `give_experience` | 食べた時に獲得する経験値 |
| `tastiness`, `favorite_food_chance` | ユニットの好物として選ばれる確率 |
| `diet` | 摂取可能な食性（生物分類） |
| `eat_action` | 食べた際に実行されるカスタムコード |
| `give_trait_id`, `give_status_id`, `give_chance` | 食べた際に付与される特性（trait）やステータス効果（status） |

### 生産と物流

| フィールド | 役割 |
| --- | --- |
| `ingredients`, `ingredients_amount` | 調理・クラフトに必要な材料とその消費量 |
| `produce_min` | 1回の生産作業で産出される最小数量 |
| `mine_rate` | 採掘・収穫にかかる速度 |
| `drop_max`, `drop_per_mass` | 産出元のオブジェクトが破壊された時のドロップ量 |
| `stack_size`, `storage_max`, `maximum` | 運搬および都市内の貯蔵上限 |
| `supply_give`, `supply_bound_give`, `supply_bound_take` | 軍隊への補給物資としての挙動 |
| `trade_cost`, `trade_give`, `trade_bound` | 都市間の交易挙動 |
| `money_cost`, `loot_value` | 金銭的価値および戦利品価値 |

## バニラの資源一覧

既存の資源を利用する方が新規追加よりも遥かに簡単なため、把握しておくと役立ちます：

**食料および食材：** `wheat` `bread` `berries` `bananas` `coconut` `mushrooms` `peppers` `herbs` `fish` `meat` `honey` `lemons` `worms` `pine_cones` `candy` `sushi` `jam` `cider` `ale` `burger` `pie` `tea` `crystal_salt` `desert_berries` `evil_beets` `snow_cucumbers` `celestial_avocado`

**戦略物資およびその他：** `wood` `stone` `common_metals` `silver` `mythril` `adamantine` `gems` `bones` `leather` `dragon_scales` `fertilizer` `gold`

## 自作スプライトの指定方法

資源には2種類の画像が必要ですが、それらは**まったく異なるルール**で解決されます。ここで混乱する人が後を絶ちません：そしてあなたも一度は引っかかります。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── iconHelloCake.png              <- インベントリアイコン（ルート直下）
    └── items/resources/
        └── hello_cake/hello_cake_0.png             <- ユニットが抱えるスプライト
```

```csharp
cake.path_icon = "iconHelloCake";        // 指定した文字列そのままロードされる
cake.path_gameplay_sprite = "hello_cake";   // 自動的に items/resources/hello_cake として解決される
```

`path_icon` は通常のパスであり、バニラでは単一のファイル名が指定されているため、ファイルは `GameResources/` のルートに置かれます。一方、`path_gameplay_sprite` は自動的に `items/resources/` が先頭に付与されます。そのためフォルダ名まで自分で書いてしまうと `items/resources/items/resources/...` となり、画像が見つからなくなります。

## 資源をゲーム世界に組み込む

資源は何かによって生産されない限り死にデータとなります。関与する3つの重要箇所：

```csharp
// 1. 生物が解体された時や死亡した時にドロップ
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// 2. 建築物が収穫された時に産出
BuildingAsset tree = AssetManager.buildings.get("hello_tree");
tree.addResource("wood", 3, pNewList: true);

// 3. 文化が都市内で生産
asset.production = new string[] { "bread", "jam", "hello_cake" };
```

最初の呼び出しの `pNewList: true` は「ドナーから継承したリストに追加するのではなく、新しいリストを開始する」ことを意味します。クローン後にこれを忘れると、あなたの生物はドナーの資源とあなたの資源の両方を同時にドロップするようになります。

## 素材（Material）は資源ではない

装備品の**素材**（鉄、鋼、ミスリルなど）は素材ライブラリ内の `ItemAsset` であり、`ResourceAsset` ではありません。たとえその素材を使用するのに資源を消費するとしてもです。これはゲーム内の命名規則で最も紛らわしい箇所の1つです。**[カスタムアイテム](#/nml/custom-items)** を参照してください。

両者を結びつけるのは、素材アセット側にある `cost_resources` フィールドであり、そこで必要な資源IDと数量が定義されています。

> [!TIP] 食材ではなくレシピを追加する
> 新しい*食材*を追加するには、それを育てる作物、自生するバイオーム、収穫する職業といった供給源がすべて必要になります。しかし新しい*レシピ*なら、すでに存在する食材を指定するだけで、既存のパン職人や交易ルートにそのまま組み込まれます。前者は1週間かかりますが、後者は半日で終わります :PES_ChillPill:。
