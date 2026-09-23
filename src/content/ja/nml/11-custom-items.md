---
title: カスタムアイテム
group: ゲームコンテンツ
subgroup: アイテムと装備
icon: :wbcrystalsword:
order: 120
---

# カスタムアイテム :wbcrystalsword:

武器、防具、指輪、首飾りはすべて `EquipmentAsset` として `AssetManager.items` に登録されています。

まず最初に理解すべき最も重要な点は、**実行時に素材を動的に選べるような汎用的な「剣」アイテムは存在しない**ということです。ゲーム内には `sword_wood`、`sword_stone`、`sword_copper`、`sword_bronze`、`sword_silver`、`sword_iron`、`sword_steel`、`sword_mythril`、`sword_adamantine` が個別に存在します。コスト、ステータス、`material` 文字列がそれぞれ異なる9つの独立した別々のアセットです。鎧、弓、アミュレットもすべて同様です。

だからこそ、アイテム制作においてクローン（`clone`）は単なる手抜きではなく、唯一の現実的なアプローチなのです。

## テンプレート

`$` で始まるIDはテンプレートであり、武器種ごとの標準的な配線一式をあらかじめ保持しています：

`$equipment` · `$weapon` · `$melee` · `$range` · `$sword` · `$axe` · `$hammer` · `$spear` · `$bow` · `$helmet` · `$armor` · `$boots` · `$ring` · `$amulet` · `$accessory`

`$sword` はすでに `equipment_subtype`、`is_pool_weapon`、`pool_rate`、斬撃アニメーション、名前テンプレート、`group_id` をすべて設定済みです。これらをそのまま活用できます。

## 武器の作成

> [!WARNING] スプライトパスのない武器はローダーを殺す
> プール武器には、ゲームが `path_gameplay_sprite` に `items/weapons/w_<id>` を、`path_icon` に `ui/Icons/items/icon_<id>` を入れます。やるのは自身のロード中の `post_init()` なので、あなたの武器はまだリストになく、両方 `null` のままです。するとプリローダーが `getSpriteList(null)` を呼び、ロードごと `ArgumentNullException: Value cannot be null. Parameter name: key` で落ちます :wbfacepalm:。
>
> 両方自分で入れてください。`GameResources/` の自分のファイルを指すか、他を試している間はバニラのものを使い回してください。

```csharp Mods/HelloBox/Code/HelloItems.cs
namespace HelloBox
{
    public static class HelloItems
    {
        public const string EMBER_BLADE = "hello_sword_ember";

        public static void Initialize()
        {
            if (AssetManager.items.has(EMBER_BLADE)) return;

            // clone() copies every field, renames it, and registers it. No add() afterwards.
            EquipmentAsset blade = AssetManager.items.clone(EMBER_BLADE, "$sword");

            blade.material = "ember";              // the material name used in its display name
            blade.metallic = true;                 // decides hit and clash sounds
            blade.equipment_value = 45;            // "how good is this" score the AI compares
            blade.rigidity_rating = 5;
            blade.quality = Rarity.R2_Epic;        // minimum quality it can roll at

            // What a city needs to forge it.
            blade.setCost(0, "common_metals", 4);
            blade.minimum_city_storage_resource_1 = 10;

            // Stats. clone() already ran add(), so base_stats exists.
            blade.base_stats["damage"] = 9f;
            blade.base_stats["critical_chance"] = 0.08f;
            blade.base_stats["attack_speed"] = 2f;

            blade.path_slash_animation = "effects/slashes/slash_fire";

            // The game derives these two in post_init(), which ran before your mod existed.
            // Set them yourself or the sprite preloader throws on a null path.
            blade.path_gameplay_sprite = "items/weapons/w_hello_sword";   // in-hand sprite in GameResources/
            blade.path_icon = "ui/Icons/items/icon_hello_sword";

            // visible immediately: no need to discover them first
            blade.needs_to_be_explored = false;

            // linkAssets() sorted every item into these lists at startup. Cities forge from
            // the subtype list, and new weapons roll from the pools: skip this and nobody
            // ever makes yours.
            AssetManager.items.equipment_by_subtypes[blade.equipment_subtype].Add(blade);
            if (blade.is_pool_weapon)
            {
                AssetManager.items.pot_weapon_assets_all.Add(blade);
                AssetManager.items.pot_weapon_assets_unlocked.Add(blade);
            }

            // Optional: code that runs on every hit landed with it.
            blade.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                if (pTile == null) return false;

                World.world.drop_manager.spawn(pTile, "fire", 10f, -1f, -1L);
                return true;
            };
        }
    }
}
```

> [!WARNING] 登録されたことと鍛造されることは別物です
> 都市が鍛造する武器は `equipment_by_subtypes`（武器種ごとのリスト）から選ばれ、新規生成時のドロップ武器は `pot_weapon_assets_all` および `pot_weapon_assets_unlocked` から抽選されます。`ItemLibrary.linkAssets()` は起動時にこれらのリストを構築するため、末尾の4行がないと、武器自体は存在してコマンド等で付与できるものの、世界のどの鍛冶屋も製造してくれません :PES5_Hmmmm:。防具やアクセサリーは武器プールの代わりに `group_id` ごとの `pot_equipment_by_groups_all` と `pot_equipment_by_groups_unlocked` を使用します。


## 各種フィールド

### Identity

| フィールド | 役割 |
| --- | --- |
| `material` | 素材名。表示名の一部になり、AIの装備更新判定でも比較される |
| `equipment_type` | `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet`。どのスロットを占有するか |
| `equipment_subtype` | `sword`, `axe`, `bow` … 武器カテゴリ。文化ごとに好みの武器種が存在 |
| `group_id` | 装備カテゴリタブ。**[特性グループとタブ](#/nml/trait-groups)** を参照 |
| `attack_type` | 近接または遠距離の攻撃挙動 |
| `quality` | 出現しうる最低品質レアリティ |
| `rarity`, `pool_rate` | アイテム抽選時に選ばれる頻度 |
| `is_pool_weapon` | 一般のドロップ武器プールに含まれるかどうか |

### コストと価値

| フィールド | 役割 |
| --- | --- |
| `setCost(gold, res1, amount1, res2, amount2)` | コストを一括設定する推奨メソッド。個別設定よりこちらを使う |
| `minimum_city_storage_resource_1` | 都市の備蓄がこの数値を下回っていると鍛造されない |
| `equipment_value` | AIが認識する強さのスコア。「兵士が武器を更新すべきか」の基準 |
| `durability`, `rigidity_rating` | 耐久度と頑丈さ |

### 見た目とレンダリング

| フィールド | 役割 |
| --- | --- |
| `path_gameplay_sprite` | ユニットの手元に描画されるスプライト |
| `colored`, `animated` | 色合い調整を受けるか、アニメーションするか |
| `path_slash_animation` | 斬撃エフェクト画像 |
| `projectile` | 遠距離武器の場合、発射される弾のID。**[弾・呪文・エフェクト](#/nml/projectiles-spells)** を参照 |
| `name_class`, `name_templates` | 伝説級になった際の命名ルール |

### Behaviour

| フィールド | 役割 |
| --- | --- |
| `action_attack_target` | 攻撃がヒットするたびに実行される |
| `action_special_effect` + `special_effect_interval` | 装備中、タイマー間隔で定期実行される |
| `item_modifier_ids` | 付与されうるエンチャント。**[武器のエンチャント](#/nml/item-modifiers)** を参照 |
| `addSpell(id)` | 装備者が使用可能になる呪文 |
| `addCombatAction(id)` | 装備者に付与される戦闘アクション |

## 装備中だけ発動する効果

「Ember Bladeを持つ者はSwiftになる」というのは特性のように聞こえますが、アイテムに特性は付けられません。ただし上の表にある `action_special_effect` で装備中だけタイマー実行することはでき、**ステータス効果**は放っておけば自然に切れます。つまりアイテム側が短いステータスを一定間隔で再適用し続け、アイテムを外せばステータスはそのまま自然消滅します：

```csharp Mods/HelloBox/Code/HelloItems.cs
blade.special_effect_interval = 1f;
blade.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    StatusAsset status = AssetManager.status.get(HelloStatus.CURSED);
    if (status == null) return false;

    // 3秒間、1秒ごとに更新。剣を手放せば自然に切れる
    World.world.statuses.newStatus(actor, status, 3f);
    return true;
};
```

このステータスには `allow_timer_reset = true` が必要です（新規作成した `StatusAsset` では既定でtrueですが、クローン元によってはfalseの場合があります）。設定していないと、再適用が何もせず、途中で切れてしまいます。HelloBoxではこの剣は持ち主自身を呪う仕様で、まさにEmber Bladeらしい振る舞いです :wbfacepalm:。

特性を使わない理由：特性は何かが取り除くまで残り続けるので、剣がなくなったことに気づいて剥がす別のタイマーが必要になります。ステータス効果は自分で後始末をしてくれます。

## カスタムスプライトの追加

アイテムには2つの画像アセットがあり、それぞれ別のフィールドで指定します：

```text
HelloBox/
└── GameResources/
    ├── items/
    │   └── weapons/
    │       ├── sprites.json                 <- bottom-center pivot
    │       └── w_hello_sword/
    │           └── w_hello_sword.png        <- what the unit holds
    └── effects/slashes/
        └── slash_fire.png                   <- the swing
```

```csharp
blade.path_gameplay_sprite = "items/weapons/w_hello_sword";
blade.path_slash_animation = "effects/slashes/slash_fire";
```

> [!NOTE] 武器スプライトには LoadAll 用のフォルダが必要です
> ゲームの武器プリローダーは `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)` を呼び出し、内部で `Resources.LoadAll<Sprite>` を実行します。NeoModLoader では `LoadAll` はフォルダ名で検索を行います。`path_gameplay_sprite` が `"items/weapons/w_hello_sword"` の場合、NML は `GameResources/items/weapons/w_hello_sword/` というディレクトリを探します。フォルダを作らず単体の `w_hello_sword.png` ファイルのみを配置すると、`LoadAll` がディレクトリを見つけられず 0 個のスプライトを返し、ゲームログに `Weapon Texture is Missing` と記録されます。該当する名前のフォルダ内に画像を配置することで正しく読み込まれます。

> [!NOTE] 武器スプライトには LoadAll 用のフォルダが必要です
> ゲームの武器プリローダーは `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)` を呼び出し、内部で `Resources.LoadAll<Sprite>` を実行します。NeoModLoader では `LoadAll` はフォルダ名で検索を行います。`path_gameplay_sprite` が `"items/weapons/w_hello_sword"` の場合、NML は `GameResources/items/weapons/w_hello_sword/` というディレクトリを探します。フォルダを作らず単体の `w_hello_sword.png` ファイルのみを配置すると、`LoadAll` がディレクトリを見つけられず 0 個のスプライトを返し、ゲームログに `Weapon Texture is Missing` と記録されます。該当する名前のフォルダ内に画像を配置することで正しく読み込まれます。

> [!NOTE] 武器テクスチャには LoadAll 用のフォルダが必要です
> ゲームの武器プリローダーは `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)` を呼び出し、内部で `Resources.LoadAll<Sprite>` を実行します。NeoModLoader では `LoadAll` はフォルダ名を対象に検索します。もし `path_gameplay_sprite` が `"items/weapons/w_hello_sword"` の場合、NML は `GameResources/items/weapons/w_hello_sword/` というディレクトリを探します。フォルダを作らず単体の `w_hello_sword.png` だけを置くと、`LoadAll` はフォルダを見つけられず 0 個のスプライトを返し、ゲームログに `Weapon Texture is Missing` と出力されます。同名のフォルダ内にスプライトを配置することで解決します。

武器画像はユニットのスケールに合わせて描画され、下部中央（`sprites.json` で `PivotX: 0.5, PivotY: 0.0`）をピボット（基準点）に設定しないと手元から浮いてしまいます（詳細は **[スプライトとリソース](#/nml/sprites-and-resources)** を参照）。

どちらかのパスをバニラの値（`"items/weapons/w_sword_iron"` など）のままにしておけば、公式のアートがそのまま使われます。最初の武器を実装する際には非常に手軽でおすすめの方法です :PESgn_Neat:。

## 素材バリエーションの一括作成

アクターと同様に、1つのアイテムだけを作ることは稀です。9つの素材を用意するには9つのアセットが必要であり、9回コピペすればバグ修正の手間も9倍になります。

```csharp
private struct Mat
{
    public string Suffix;
    public int Value;
    public float Damage;
    public int Cost;
}

private static readonly Mat[] Mats = new Mat[]
{
    new Mat { Suffix = "copper", Value = 15, Damage = 4f, Cost = 2 },
    new Mat { Suffix = "iron",   Value = 30, Damage = 6f, Cost = 3 },
    new Mat { Suffix = "steel",  Value = 40, Damage = 7f, Cost = 4 },
};

private static void RegisterLine(string pPrefix, string pTemplate)
{
    for (int i = 0; i < Mats.Length; i++)
    {
        string id = pPrefix + "_" + Mats[i].Suffix;
        if (AssetManager.items.has(id)) continue;

        EquipmentAsset item = AssetManager.items.clone(id, pTemplate);
        item.material = Mats[i].Suffix;
        item.metallic = true;
        item.equipment_value = Mats[i].Value;
        item.setCost(0, "common_metals", Mats[i].Cost);
        item.base_stats["damage"] = Mats[i].Damage;
    }
}

// RegisterLine("hello_glaive", "$spear");
```

## ローカライズテキスト

アイテムの命名規則は他のアセットと大きく異なっており、多くの人が混乱します。アイテムの表示名は次のように決定されます：

```text
translation_key   ?? "item_" + (equipment_subtype ?? id)
```

上記で `$sword` から複製した剣は `equipment_subtype = "sword"` を継承しているため、あなたのIDではなくバニラの「剣」という名称が表示されます。解決策は2つあります：

```csharp
blade.translation_key = "hello_sword_ember";   // 剣の特性を維持しつつ固有の名称を与える
```

あるいはサブタイプの名前はいじらず、バニラと同じように**素材名**に語らせる方法です。バニラではどの剣も単に「剣」であり、`sword_iron` は素材キーによって「鉄の剣」と合成表示されます。

```json Mods/HelloBox/Locales/en.json
{
  "hello_sword_ember": "Ember Blade",
  "hello_sword_ember_description": "Forged in something that is still angry about it.",

  "item_mat_ember": "Ember"
}
```

| キー | 用途 |
| --- | --- |
| `item_<subtype>` または自前の `translation_key` | アイテムの基本名称 |
| `<id>_description` | ツールチップの説明文 |
| `item_mat_<material>` | 名前に前置される素材の単語 |

新しい素材には**必ず** `item_mat_` キーを定義してください。そうしないと未翻訳の素材キーが武器名の頭にくっついてしまいます。

## ユニットに装備を持たせる

**アセット**はレシピです。**アイテム**は、品質やモディファイア、名前が付与されて特定のユニットが所持している実体オブジェクトです。生成と配布は2段階で行います：

```csharp
EquipmentAsset asset = AssetManager.items.get(HelloItems.EMBER_BLADE);
if (asset == null || actor == null) return;

// 1. レシピから実体アイテムを生成
Item item = World.world.items.generateItem(asset, actor.kingdom, actor.getName(), 1, actor);

// 2. ユニットに装備させる（equipment_type に応じた正しいスロットを自動選択）
actor.equipment.setItem(item, actor);
```

`generateItem` は通常のドロップ品と同様に品質や追加効果をランダムに決定するため、ユニットが受け取るアイテムは登録した元アセットの素の値とは常に異なります。

## 手持ちツール

大工が振るうハンマーや採取者が抱えるカゴはアイテムではありません。これらは **手持ちツール** であり、タスクが指示している間だけ表示され、タスク終了とともに消える純粋なビジュアル表示です。

```csharp Mods/HelloBox/Code/HelloTools.cs
using ai.behaviours;   // BehaviourTaskActor

namespace HelloBox
{
    public static class HelloTools
    {
        public const string TORCH = "hello_torch";

        public static void Initialize()
        {
            if (AssetManager.unit_hand_tools.has(TORCH)) return;

            UnitHandToolAsset torch = new UnitHandToolAsset
            {
                id = TORCH,
                path_gameplay_sprite = "items/tools/tool_hello_torch"   // a folder of frames
            };

            AssetManager.unit_hand_tools.add(torch);

            // loadSprites() ran at startup. An empty list here is a hand holding nothing.
            torch.gameplay_sprites = SpriteTextureLoader.getSpriteList(torch.path_gameplay_sprite);

            // A tool shows up while a task forces it. Give it to the task from the AI page.
            BehaviourTaskActor drive = AssetManager.tasks_actor.get(HelloAI.TASK);
            if (drive != null) drive.force_hand_tool = TORCH;
        }
    }
}
```

タスクは `force_hand_tool` を介してツールを表示するため、生物が **[カスタム AI](#/nml/custom-ai)** の徘徊タスクを実行すると松明を手に持ちます。

> [!WARNING] フレーム画像は手動でロードする
> `UnitHandToolLibrary.loadSprites()` は起動時に全ツールの `gameplay_sprites` を構築します。後から追加されたツールには画像配列が存在せず、ユニットは何も持っていないように見えます。パスは `getSpriteList()` で読み込まれるため、1フレームのみであっても `items/tools/tool_hello_torch/` のような **フォルダ** に配置する必要があります。`sprites.json` でピボットを設定しないと画像の中央が基準になります（松明なら問題ありませんが、長い柄の道具ではずれてしまいます）。

| フィールド | 効果 |
| --- | --- |
| `path_gameplay_sprite` | 画像フォルダ。バニラは ID から `items/tools/tool_<id>` を自動生成します |
| `animated` | コーヒーカップのようにフレームをループ再生するかどうか |
| `colored` | 旗のように王国の色で着色するかどうか |

> [!TIP] 武器本体より先にエンチャントを作るのがおすすめ
> 新しい武器の作成にはスプライト、素材リスト、コスト、バランス調整が必要です。一方、新しい **モディファイア（エンチャント）** は20行程度で実装でき、他の Mod の武器も含めてゲーム内のすべての武器に適用されます。手軽に新しいゲーム体験を作りたい場合は、まず **[武器エンチャント](#/nml/item-modifiers)** をご覧ください :PESgn_DoIt:。
