---
title: カスタム特性
group: ゲームコンテンツ
subgroup: 特性と遺伝
icon: :wbstrongminded:
order: 100
---

# カスタム特性 :wbstrongminded:

特性（Trait）とは、ユニットに付与される永続的なラベルのことです（「勇敢」「俊足」「不死」など）。インスペクターに表示され、ユニットのステータスを変動させ、攻撃時・被弾時・死亡時にコードを実行でき、子どもへと遺伝することもあります。

ゲーム内で最も簡単に追加できる要素でもあり、誰もが最初に作るModとなる理由です。私は違いました。私の最初のModは他人のModのラッパーで、それはそれで一種のズルです :trollface:。

## ID には必ずプレフィックスを付ける

WorldBoxの全アセットは、`id` をキーとする1つのフラットな一覧で管理されています。もしあなたが `fast` というIDで登録し、他のModも `fast` で登録した場合、後から読み込まれた側が前の側を**上書き**し、誰も読まないログに1行だけ警告が残ります。

したがって、`swift` ではなく `hello_swift` のように命名してください。短いMod名＋アンダースコア＋要素名。これは特性、アイテム、建物（building）、能力、ステータス効果（status）など、あらゆるアセットで徹底してください :aPES4_Noted:。

## トレイトの作成と登録

```csharp Mods/HelloBox/Code/HelloTraits.cs
namespace HelloBox
{
    public static class HelloTraits
    {
        // IDを定数として1箇所に定義。他の全ファイルから HelloTraits.SWIFT を参照させることで、
        // タイポ時に「無言で動かない」のではなく「コンパイルエラー」として即座に検知できます。
        public const string SWIFT = "hello_swift";

        public static void Initialize()
        {
            // 同一IDの二重登録は絶対に避けること（上書き警告が出ます）。
            if (AssetManager.traits.has(SWIFT)) return;

            ActorTrait swift = new ActorTrait
            {
                id = SWIFT,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                path_icon = "ui/Icons/iconHelloSwift",   // 自分のファイル。詳細は後述
                group_id = "physique",              // 特性図鑑のどのタブに配置するか
                rate_birth = 0,                     // 0 = 自然発生しない
                can_be_given = true,                // 特性エディタで付与可能
                can_be_removed = true,
                can_be_cured = false
            };

            // add() は特性を登録すると同時にステータスブロックを割り当てます（この順序が必須）。
            AssetManager.traits.add(swift);

            swift.base_stats["speed"] = 20f;
            swift.base_stats["attack_speed"] = 10f;
            swift.base_stats["damage"] = 5;
        }
    }
}
```

そして `Main.cs` に1行追加します：

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");
    HelloTraits.Initialize();
}
```

### 各フィールドの役割

- **`AssetManager.traits`**：ゲーム内の全アクター特性（バニラおよびMod）を保持するライブラリ。`has`、`get`、`add`、`clone` の4つは、今後の全ライブラリ解説で共通して使う基本メソッドです。
- **`path_icon`**：インスペクターに表示される小さなアイコン画像。ファイル名ではなく*アセットパス*（拡張子なし）です。詳細は **[スプライトとリソース](#/nml/sprites-and-resources)** を参照。ゲーム起動時の内部初期化時しか自動補完されないため、Mod側で明示的に指定しないとアイコンが空白になります。
- **`needs_to_be_explored`**：既定は `true` で、プレイヤーがワールドで見つけるまで知識の書でロックされたままです。`false` にすると最初から使えます。HelloBoxは全部に付けているので、作ったものを探さずに見られます。
- **`group_id`**：特性図鑑でどのタブに並ぶか。一覧は後述。
- **`rate_birth`**：新生児が生まれつき獲得する確率。`0` は「特定の能力やコードから付与されない限り出現しない」ことを意味します。
- **`can_be_given` / `can_be_removed`**：プレイヤーが特性エディタで付け外しできるかどうか。どちらもデフォルトは `true` です。永続化したい場合や自前コードからのみ付与させたい場合は `false` にします。
- **`base_stats[...]`**：ステータス加算値。設定可能なステータス名は **[ステータス一覧](#/nml/stats)** を参照してください。

> [!WARNING] ステータス設定は**必ず** `add()` の後に行うこと
> 新規作成直後の `ActorTrait` にはステータスブロックがまだ存在しません。ライブラリが `add()` の内部でメモリを割り当てます。その行より前に `base_stats` に触ると、WorldBox Mod開発で最も頻発するクラッシュが発生します：
> `NullReferenceException: Object reference not set to an instance of an object`
>
> このルールはステータス効果、アイテム、建物、アクターでも共通です。例外は `clone()` だけで、内部で `add()` を呼んでくれるためクローン直後は安全にアクセスできます。

> [!TIP] 同じスイッチは作るものの大半にある
> `needs_to_be_explored` はアンロック可能なアセットすべてが共有する基底クラスにあるので、アクター、7種類すべてのtrait、アイテム、修飾、ワールドローで使えます。神の力、ステータス、建物、ドロップ、雲（cloud）、タイル、飛び道具には、そもそも発見の段階がありません :wbsmirk:。

### バニラのトレイトグループ

`group_id` には実在するグループIDを指定しなければならず、間違えるとどこにも表示されなくなります：

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

自前の独自タブを作りたい場合は **[特性グループとタブ](#/nml/trait-groups)** を参照してください。

## ローカライズテキスト

翻訳テキストを用意しないと、ゲーム内では `trait_hello_swift` という生キーがそのまま表示されてしまいます。見た目の通り、実にプロっぽくありません :pepeclown:。`Locales/ja.json` を作成します：

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money."
}
```

翻訳キーは単なるIDではありません。特性の種類ごとに固有の接頭辞が付きます：

| 特性の種類 | 名前キー | ツールチップ説明キー |
| --- | --- | --- |
| Actor trait | `trait_<id>` | `trait_<id>_info` |
| Culture trait | `culture_trait_<id>` | `culture_trait_<id>_info` |
| Religion trait | `religion_trait_<id>` | `religion_trait_<id>_info` |
| Subspecies trait | `subspecies_trait_<id>` | `subspecies_trait_<id>_info` |
| Clan trait | `clan_trait_<id>` | `clan_trait_<id>_info` |
| Language trait | `language_trait_<id>` | `language_trait_<id>_info` |
| Kingdom trait | `kingdom_trait_<id>` | `kingdom_trait_<id>_info` |

2行目の詳細説明文として `<prefix>_<id>_info_2` も利用可能です。

## カスタムアイコンの指定

`path_icon` はパスであり、Modの `GameResources/` フォルダ内に全く同じ階層でPNG画像を配置します（拡張子は文字列に含めません）。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSwift.png
```

```csharp
swift.path_icon = "ui/Icons/iconHelloSwift";
```

特性アイコンは小さく、ゲーム内ではおよそ 32x32 で描画されます。`ui/Icons/hellobox/iconSwift` のように自分専用のサブフォルダを作っても構いません。文字列とファイル配置が一致していれば読み込まれます。

他の6種類の特性システムもそれぞれバニラ専用フォルダを持っています（`ui/Icons/culture_traits/`、`religion_traits/`、`clan_traits/` など）。そこに合わせる義務はありませんが、真似て配置すると後からファイルを探しやすくなります。詳細は **[スプライトとリソース](#/nml/sprites-and-resources)** を参照。

## トレイトに*アクション*を持たせる

ステータス変動は静的ですが、特性は4つの特定のタイミングで独自の処理を実行できます：

```csharp
// 生存中、数秒ごとに定期実行
swift.special_effect_interval = 3f;
swift.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreStamina(5);
    return true;
};

// 死亡時
swift.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };

// 被弾時
swift.action_get_hit = (BaseSimObject pSelf, BaseSimObject pAttacker, WorldTile pTile) => { return true; };

// ユニットの攻撃がヒットするたびに、ダメージ処理の直後に呼ばれる
swift.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor self = pSelf as Actor;
    // pTarget は建物（building）の場合もあり、この一撃でちょうど破壊されたかもしれない
    if (self == null || !self.isAlive() || pTarget == null) return false;

    self.restoreHealth(2);
    return true;
};
```

4つのデリゲート共通の2つの鉄則：**最初に必ずnullチェックと生存チェックを行うこと**、そして何も処理しなかった場合は `false` を返すこと。これらはその特性を持つ世界中の全ユニットに対して毎秒走り続けます。

> [!NOTE] `action_birth` と `action_growth` は存在するが、ここでは絶対に発火しない
> `ActorTrait` はこの2つのフィールドを継承しているため、コンパイルは通ります。しかしゲームがこれらを実際に読むのは**亜種（subspecies）**特性からだけです：ゲームは亜種の全特性を1つの誕生コールバックと1つの成長コールバックにまとめてから呼び出します。アクター特性の上では、これらは何もせずに、静かに座っているだけです :wbreally:。「ユニットが誕生したとき」を実現したいなら、亜種特性として作ってください：**[亜種特性](#/nml/subspecies-traits)**。

### 特性を得たとき・失ったとき・ロードされたとき

もう3つのフックがあり、こちらは常時ではなく一度きり実行されます。これらは異なるデリゲート `WorldActionTrait` を受け取り、所有者を `NanoObject` として、そして特性自体を渡してきます：

```csharp
// addTrait() がユニットに特性を付与した瞬間、一度だけ
swift.action_on_augmentation_add = (NanoObject pTarget, BaseAugmentationAsset pTrait) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreHealth(actor.getMaxHealth());   // 歓迎のプレゼント、一度だけ
    return true;
};
```

| フィールド | 実行されるタイミング |
| --- | --- |
| `action_on_augmentation_add` | `addTrait()` が成功したとき |
| `action_on_augmentation_remove` | `removeTrait()` が特性を剥奪したとき（別の特性が対立関係や `traits_to_remove` によって押し出した場合も含む） |
| `action_on_augmentation_load` | セーブされたワールドがロードされ、そのユニットが特性を持ったまま復帰したとき |

ロードされたユニットは `addTrait()` を経由**せずに**特性を取り戻すため、`_add` は再度実行されません。`_add` がセーブに保存されない何かをセットアップしている場合は、`_load` で同じ処理をやり直してください。

## 対立関係と排他設定

バニラのやり方は `addOpposite("slow")` と `traits_to_remove_ids` です。どちらも**ID**しか書き込みません。そしてゲームは、ロード中に一度だけ、あなたのModが存在するよりも前のタイミングで、それらのIDを実際に読み取る集合に変換します。あなたの特性の上では、これらは何もしません :wbfacepalm:。解決済みのフィールドは `add()` の後に自分で埋めてください：

```csharp
ActorTrait slow = AssetManager.traits.get("slow");
if (slow != null)
{
    // addTrait() は新しい特性側の集合しかチェックしないため、両側を埋める必要がある：
    // そうしないと、slowなユニットはswiftを拒否するのに、swiftなユニットは平気でslowになれてしまう
    swift.opposite_traits = new HashSet<ActorTrait> { slow };
    if (slow.opposite_traits == null) slow.opposite_traits = new HashSet<ActorTrait>();
    slow.opposite_traits.Add(swift);
}

// swiftを獲得するとこれらを剥奪する。ゲームが読むのはIDではなく配列
ActorTrait fat = AssetManager.traits.get("fat");
if (fat != null) swift.traits_to_remove = new ActorTrait[] { fat };
```

`HashSet` を使うにはファイル先頭に `using System.Collections.Generic;` が必要です。

> [!WARNING] `opposite_trait_mod` には `opposite_traits` が必要
> `opposite_trait_mod` は、一方が相手の特性の対立関係を持っている場合に、2ユニット間の好感度がどれだけ変化するかを決めます。社交関係のコードはnullチェックなしで `opposite_traits` をループするため、このmodを設定したまま集合を `null` のままにしておくと、2ユニットが初めて互いを値踏みした瞬間に `NullReferenceException` が発生します。空の集合であっても、必ず値を与えてください。

## レア度

`rarity` は名前の色と、特性ツールチップ内のレア度表示を決めます。`Rarity.R3_Legendary` はさらに専用の伝説フレームも得ます。値は `R0_Normal`、`R1_Rare`、`R2_Epic`、`R3_Legendary` です。

バニラの特性についてはほぼ自動化されています：ゲームのロード中、ライブラリは各特性が何をするか（アクション、決定（decision）、呪文、戦闘アクション、タグ）を数え、何かしら処理をするものを `R1_Rare` または `R2_Epic` に引き上げます。あなたの特性はそのパス処理の後に到着するため、書いた通りの値を保持します。もし何も書かなければ、どれだけ多くの処理をしていてもデフォルトの `R1_Rare` のままです。自分で設定してください：

```csharp
swift.rarity = Rarity.R2_Epic;
```

## コードからアンロックする

`needs_to_be_explored = true` にすると、特性は知識の書の中でロックされた状態から始まります。`unlock()` がゲームにその特性を「発見」させる方法です：

```csharp
AssetManager.traits.get(HelloTraits.SWIFT)?.unlock();
```

これはプレイヤーの進行状況にIDを追加し、「新しい知識」のヒントを表示し、進行状況ファイルを保存します。`unlock(false)` はその保存をスキップします：複数のものを連続してアンロックする場合に使い、最後に一度だけ `GameProgress.saveData()` を呼んでください。特性がすでに利用可能な場合は `false` を返して何もしません。`needs_to_be_explored = false` の特性は常に利用可能な扱いです。プレイヤーが本当に獲得したタイミングで、ゲームプレイ中から呼び出してください：これは本物の進行状況ファイルであり、以降どのワールドでもアンロックされたままになります。

`unlocked_with_achievement` はデフォルトですでに `false` です。`unlocked_with_achievement = false` と書いても何も変わりません。

## ユニットにトレイトを付与する

```csharp
actor.addTrait(HelloTraits.SWIFT);

if (actor.hasTrait(HelloTraits.SWIFT))
{
    // ...
}
```

> [!WARNING] `spawn_random_trait_allowed` はゲーム起動時に一度だけ読み込まれます
> 新しく生まれるユニットは、ゲームロード中に `BaseTraitLibrary.linkAssets()` が構築するプールから初期特性を抽選します。これはあなたのModが存在するより前のタイミングです。特性にこのフラグを立てるだけでは何も変わりません。あなたの特性はそのプールに一度も入らず、新規ユニットに偶然付与されることもありません。バニラと同じ重み付けで、自分でプールに追加してください：
>
> ```csharp
> swift.spawn_random_trait_allowed = true;
> AssetManager.traits._pot_allowed_to_be_given_randomly.AddTimes(swift.spawn_random_rate, swift);
> ```
>
> `_pot_allowed_to_be_given_randomly` は `protected` なので、NML がModのビルドに使うpublicize済みアセンブリに対してならコンパイルが通ります。`spawn_random_rate` の既定値は `5` です。数値を上げるほど出現頻度が上がります。

## 正常動作の確認

ゲームを起動し、ユニットを開き、特性エディタを開き、`physique` タブを確認してください。見当たらない場合、ログを見れば原因が分かります。原因の大半は「`can_be_given` が false」「`group_id` が存在しない」「`path_icon` の参照先が存在しない」のいずれかです :wbreally:。

## その他6種類のトレイト

アクター特性は、ゲーム内に存在する**7種類**の特性システムの1つに過ぎません。それぞれが固有のライブラリ、グループ、所有対象を持っており、すべてこのページと全く同じパターンに従います。変わるのはクラス名、ライブラリ、そして翻訳キーの接頭辞だけです。

| システム | 所有対象 | 該当ページ |
| --- | --- | --- |
| Actor | 1体の生物個体 | このページ |
| Culture | 文化（culture）（所属都市全体で共有） | **[文化特性](#/nml/culture-traits)** |
| Religion | 宗教（religion）（その信者全体） | **[宗教特性](#/nml/religion-traits)** |
| Subspecies | 生物の亜種（subspecies） | **[亜種特性](#/nml/subspecies-traits)** |
| Clan | 家系・血統 | **[氏族特性](#/nml/clan-traits)** |
| Language | 言語（それを話す全員） | **[言語特性](#/nml/language-traits)** |
| Kingdom | 王国（kingdom）の国策方針 | **[王国特性](#/nml/kingdom-traits)** |

特性を作る前に、まず「誰に持たせるべきか」を決めてください。「エルフの射撃が上手くなる」は、都市の発展とともに広まるなら文化特性、繁殖によって遺伝するなら亜種特性、特定の個人だけの才能ならアクター特性です。この選択を間違えると、世界に波及するはずのModが何も起きずに終わってしまいます :PES_ThinkAboutIt:。
