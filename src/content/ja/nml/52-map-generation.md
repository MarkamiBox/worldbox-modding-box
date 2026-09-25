---
title: マップ生成
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbworld:
order: 169
---

# マップ生成 :wbworld:

新規ワールドウィンドウは3つのライブラリを読みます。`map_sizes` はサイズ切り替え、`map_gen_templates` は形状カードの並び（`continent`、`islands`、`donut`……）、`map_gen_settings` はカードを選んだ後に出てくるスライダーとスイッチです。3つとも普通のアセットライブラリです。ただし、そのままModに追加してすぐ動くのは1つだけで、どの部分にUI側の作業が必要かは、痛い目を見る前にここで教えておきます。

## より大きなマップ

サイズは `MapSizeAsset` で、フィールドは4つだけです。

| フィールド | 説明 |
| --- | --- |
| `id` | 翻訳キーにもなる。プレフィックス付きで `map_size_<id>` |
| `size` | マップの一辺の長さ。単位は64タイル。`iceberg` は `9` なので 576 x 576 |
| `path_icon` | サイズ名の横に出るアイコン。`ui/Icons/` からの相対パス |
| `show_warning` | ウィンドウの挨拶文を「このマップは大きいです」という警告に差し替える |

バニラのサイズ: `tiny` 2 · `small` 3 · `standard` 4 · `large` 5 · `huge` 6 · `gigantic` 7 · `titanic` 8 · `iceberg` 9。

```csharp Mods/HelloBox/Code/HelloMapGen.cs
namespace HelloBox
{
    public static class HelloMapGen
    {
        public const string COLOSSAL = "hello_colossal";

        public static void Initialize()
        {
            AddColossal();
            AddRing();
        }

        public const string RING = "hello_ring";

        private static void AddRing()
        {
            if (AssetManager.map_gen_templates.has(RING)) return;

            MapGenTemplate ring = AssetManager.map_gen_templates.clone(RING, "donut");

            // values は単なるオブジェクトなので、cloneは donut のものを共有している。触る前に自分専用のものを与える
            ring.values = new MapGenValues
            {
                gradient_round_edges = true,
                add_center_gradient_land = true,
                add_center_lake = true,
                ring_effect = true,
                perlin_noise_stage_2 = true,
                random_shapes_amount = 3
            };

            // reset は起動時に作られたバックアップテーブルからコピーする。自分のidはそこに存在しない
            ring.show_reset_button = false;
        }

        public static void OpenRing()
        {
            if (!AssetManager.map_gen_templates.has(RING)) return;

            Config.current_map_template = RING;
            ScrollWindow.showWindow("new_world_templates_2");
        }

        private static void AddColossal()
        {
            if (AssetManager.map_sizes.has(COLOSSAL)) return;

            AssetManager.map_sizes.add(new MapSizeAsset
            {
                id = COLOSSAL,
                size = 10,                   // 10 x 64 = 一辺640タイル
                path_icon = "iconIceberg",   // ui/Icons/ は自動で付加される
                show_warning = true
            });

            // サイズ切り替えは linkAssets() が構築する配列を読む。それはあなたのModより前に実行済み
            AssetManager.map_sizes.linkAssets();
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "map_size_hello_colossal": "Colossal"
}
```

> [!WARNING] `linkAssets()` を呼ばないとそのサイズには到達できない
> ウィンドウの矢印はライブラリを直接たどっているわけではありません。矢印がたどるのは、`MapSizeLibrary.linkAssets()` が起動時に一度だけ構築する、ただの `string[]` です。しかもNMLがあなたのModを読み込むより前に実行されています。あなたのサイズはライブラリには登録されていますが、矢印はそれを永遠に素通りします。`linkAssets()` を再度呼び出せば、この配列を再構築するだけなので安全です。

矢印は `list` の順序どおりに動くので、末尾に追加したサイズは `iceberg` の後ろに来ます。より大きなマップにはちょうどいい位置です。より小さいサイズを追加したい場合は、`linkAssets()` を呼ぶ前に `list.Remove` と `list.Insert(0, ...)` が必要です。

コード上から分かる、上限についての情報です。

- **Workshopへのアップロードは拒否される。** アップロード処理はサイズを `Config.maxMapSize`（つまり `iceberg`）と比較し、それより大きければ「Not a valid world size!」として拒否します。
- **あなたのModなしでは、セーブ一覧が生の数字を表示する。** セーブブラウザはサイズを番号で照合し、一致するものがなければ「width x height」にフォールバックします。あなたのModがない状態でそのセーブが問題なくロードできるかどうかは、検証していません。
- **どこまで大きくできるか、検証していない。** `10` は `iceberg` よりタイル数で23%多く、それ以降の1段階ごとにコストは増していきます。どこかの数字で、プレイヤーのPCが悲鳴を上げるはずです :PES5_Hmmmm:。

## 新しいワールド形状

テンプレートは `MapGenTemplate` です。実際のレシピはその `values` の中にあり、それ以外のフィールドは見せ方を決めます。

| フィールド | 説明 |
| --- | --- |
| `values` | `MapGenValues`。ジェネレーターが読むフラグと数値。詳細は後述 |
| `path_icon` | プレビュー画像。フルパスで `ui/new_world_templates_icons/template_donut` のような形式 |
| `force_height_to` | 最初のノイズパスの後、他の処理が形を整える前に、全タイルをこの高さに設定する。`0` ならスキップ |
| `freeze_mountains` | 地形が完成した時点で山頂を固定する |
| `perlin_replace` | 高さに応じたタイル置換。例えば「170以上なら `soil_high` を `soil_low` にする」など |
| `special_anthill`, `special_checkerboard`, `special_cubicles` | 3つあるハードコードされたジェネレーターのうち1つを有効にする |
| `allow_edit_*` | このテンプレートでプレイヤーにどの設定行を見せるか。次のセクションを参照 |
| `show_reset_button` | ウィンドウに「リセット」ボタンを表示するかどうか |

バニラのid（すべて `clone()` のソースとして有効）: `continent` · `box_world` · `islands` · `toast` · `pancake` · `boring_plains` · `checkerboard` · `cubicles` · `dormant_volcano` · `cheese` · `bad_apple` · `donut` · `lasagna` · `chaos_pearl` · `anthill` · `empty`。

そして、知っておく価値のある `MapGenValues` のフィールドです。

| フィールド | 説明 |
| --- | --- |
| `main_perlin_noise_stage`, `perlin_noise_stage_2`, `perlin_noise_stage_3` | 地形を作る3段階のノイズパス |
| `perlin_scale_stage_1` / `_2` / `_3` | 各パスの拡大率。既定値は `5` |
| `gradient_round_edges` / `square_edges` | マップの端に向かって高さをフェードさせる。円形か四角形か |
| `add_center_gradient_land`, `add_center_lake`, `center_gradient_mountains` | 陸地・湖・山を中央に寄せる |
| `ring_effect` | リング状の追加ノイズパス |
| `add_mountain_edges` / `remove_mountains` | マップの周囲を山で囲む / 山を通常の地面に均す |
| `low_ground` / `high_ground` | ノイズパスの後に地面を下げる / 上げる |
| `random_shapes_amount` | ランダムな塊をいくつ上に乗せるか |
| `random_biomes`, `add_vegetation`, `add_resources` | 最後の3つは既定で `true` |

上の `AddRing()` は、バニラのテンプレートをクローンして独自のレシピを与えています。3つのメソッドは同じ `HelloMapGen` クラスにまとめてください。

```json Mods/HelloBox/Locales/en.json
{
  "template_hello_ring": "Ember Ring",
  "template_hello_ring_info": "A lake in the middle, land around it, and nobody asked for it."
}
```

> [!WARNING] 自分のテンプレートではリセットボタンを隠すこと
> 「リセット」は `resetTemplateValues()` を呼び出しますが、これは起動時にバニラのidだけで一度だけ埋められる辞書から、テンプレートの既定値を読みます。あなたのテンプレートはそこに存在しないため、ボタンを押すと `KeyNotFoundException` が発生します。`show_reset_button = false` にしておけば、この問題自体が起こりません。

> [!WARNING] クローンされたテンプレートは `values` を共有する
> `clone()` はリストを新しいリストとしてコピーしますが、`values` は単なるクラスなので参照でコピーされます（**[アセットライブラリ](#/nml/asset-libraries)** 参照）。`new MapGenValues` の行を省いて `ring.values.ring_effect` を編集すると、すべてのバニラのdonutも一緒に変わってしまいます。`perlin_replace` の中身も同じく参照共有なので、編集するのではなく新しく作ってください。

### 落とし穴: カードが存在しない

テンプレート選択画面はプレハブです。バニラのテンプレートごとに1つのボタンがあり、それぞれ自分のGameObject名で対応するテンプレートを探します。新しいテンプレートにはボタンが用意されず、ライブラリ側の変更では何も変わりません。

代わりにできるのは、ボタンの仕事を自分でやってしまうことです。テンプレートをセットしてから、バニラのカードとまったく同じように2番目のウィンドウを開きます。

ボタンから `HelloMapGen.OpenRing()` を呼び出してください。

これを普通のボタンに割り当てれば（**[パワータブとボタン](#/nml/power-buttons)** 参照）、プレイヤーはバニラのテンプレートと同じように、あなたのプレビュー、設定行、サイズの矢印、生成ボタンを手に入れられます。選択画面に本物のカードを追加するには、既存のボタンの1つをクローンして、その `Awake()` が実行される前に名前を付け替える必要があります。ボタンが自分の名前を読むのはその瞬間だからです。それはまだ検証していないUI手術なので、このページには載せていません。

> [!NOTE] バニラのテンプレートを直接編集する場合
> `AssetManager.map_gen_templates.get("islands").values.random_shapes_amount = 10;` はこれだけで動き、ボタンは一切不要です。ただし「リセット」は起動時に取られたコピーを復元することを覚えておいてください。それはあなたのModが読み込まれる前のコピーです。1回クリックされれば、次の再起動まであなたの変更は消えます。

## テンプレートの下にある行

2番目のウィンドウの各スライダーとスイッチは `MapGenSettingsAsset` です。

| フィールド | 説明 |
| --- | --- |
| `is_switch` | 数値ではなくオン/オフ |
| `min_value` / `max_value` | 数値の場合の範囲 |
| `allowed_check` | 現在のテンプレートを踏まえて、この行を表示するかどうか |
| `action_get` / `action_set` | 値の読み書き。通常は現在のテンプレートの `values` に対して行う |
| `increase` / `decrease` / `action_switch` | 矢印とスイッチが何をするか |

バニラの行: `gen_perlin_scale_stage_1` · `gen_perlin_scale_stage_2` · `gen_perlin_scale_stage_3` · `gen_random_shapes` · `gen_cubicles_sizes` · `gen_random_biomes` · `gen_mountain_edges` · `gen_add_vegetation` · `gen_add_resources` · `gen_add_center_lake` · `gen_add_center_land` · `gen_round_edges` · `gen_square_edges` · `gen_ring_effect` · `gen_low_ground` · `gen_high_ground` · `gen_remove_mountains` · `gen_forbidden_knowledge`。

Modが実際に使う部分はここです。バニラの各行の `allowed_check` は、あなたのテンプレートの `allow_edit_*` フラグのどれかを読んでいます。つまり行を追加するのではなく、これらのうちどれをプレイヤーに見せるかを選ぶのです。

```csharp
// AddRing() 内、クローンの後: いったん全部隠してから、リングに意味のある行だけ戻す
AssetManager.map_gen_templates.disableNormalSettings(ring);
ring.allow_edit_random_biomes = true;
ring.allow_edit_random_vegetation = true;
```

小ネタ: perlinのスライダーは3つとも `allow_edit_perlin_scale_stage_1` をチェックします。`_2` と `_3` のフラグは存在しますが、どこからも読まれていません :PES2_Shrug:。

新しい `MapGenSettingsAsset` を単体で登録しても、何も表示されません。行はウィンドウのプレハブに焼き付けられていて、GameObject名で自分のアセットを探します。テンプレートカードと同じ仕組みです。自分専用の行を持たせるには、ウィンドウ内の既存の行をクローンする必要があり、登録するものには必ず `allowed_check` を設定してください。ウィンドウはnullチェックなしで、すべての行に対してそれを呼び出します。

> [!TIP] 設定ではなく形状から始める
> 十中八九、あなたが欲しいのは異なる `values` を持つテンプレートと、それを開くボタンです。それならプレハブの編集は一切不要です。ゲームのアップデート後は、フィールドをもう一度確認してください。地形が思いどおりになったら、そこに何が生えるかは **[バイオーム](#/nml/biomes)** が決めます :PES2_Wise:。
