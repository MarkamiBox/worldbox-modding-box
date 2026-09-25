---
title: データの保存と記憶
group: NML Modding
subgroup: 高度な機能と公開
icon: :wbfloppysavewink:
order: 44
---

# データの保存と記憶 :wbfloppysavewink:

Mod を開発していると、特定のユニットに関する情報（何回攻撃をヒットさせたか、報酬を受け取り済みか、どの祠で祈りを捧げたかなど）を永続的に記録したくなる場面が必ず訪れます。ユニットをキーにした static な Dictionary では、プレイヤーがセーブしてリロードした瞬間にすべて消去されてしまいます :wbfacepalm:。

WorldBox にはそのための仕組みがあらかじめ用意されています。すべてのユニット、都市、王国（kingdom）、建物（building）、アイテム、書籍はデータオブジェクト内に状態を保持しており、そのすべてにセーブファイルへ一緒に書き込まれる小さな **カスタムデータストア**（Custom Data）が備わっています。

## データストア

| メソッド | 動作 |
| --- | --- |
| `data.set(key, value)` | `int`、`long`、`float`、`string`、`bool` をキーに保存 |
| `data.get(key, out value, default)` | 値を取得。キーが存在しない場合はデフォルト値を返す |
| `data.change(key, amount, min, max)` | `int` に値を加算し、同時に最小・最大範囲内に収める（クランプ） |
| `data.addFlag(key)` | フラグを立てる。すでに立っていた場合は `false` を返す |
| `data.hasFlag(key)` / `data.removeFlag(key)` | フラグの確認および解除 |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | 指定した型の値を削除 |

型ごとに独立した内部テーブルを持つため、同じキー名で `int` と `string` を保存しても競合しません。ただし、混乱を防ぐためにも同じキー名を使い回すのは避けましょう。未来の自分は、どれがどれだったか覚えていません。



## NMLによる複雑なオブジェクトの保存

プリミティブ型5つでは1995年みたいに感じて、クラスやリストを丸ごとアクターに保存したいなら、NMLは `NeoModLoader.General.Game.extensions` に `DataExtension` を用意しています。上記のデータオブジェクトなら何にでも使える拡張メソッドが2つ、`Set` と `TryGet` です。

データクラスを `BasicCustomData<T>` で包みます：

```csharp
using System.Collections.Generic;
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}

```

`Actor actor` を持つメソッドの中で、保存する前に値を作ります：

```csharp
if (actor == null || !actor.isAlive()) return;
QuestProgress quest = new QuestProgress { quest_id = "hello_first_steps", step = 1 };

// Saving it to the actor:
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// Reading it back:
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress loadedQuest = saved.Data;
}
```

内部では、`Set` があなたのオブジェクトをJSONに変換し、上の表にある普通の `data.set(key, string)` で保存しています。つまりユニット1体・キー1つにつき文字列1本ということで、下の「小さく保つ」ルールが二重にかかってきます。クラスには引数なしコンストラクタが必要で、保存されるのは public なフィールドとプロパティだけです。

Modのアップデートでデータ形式が変わりそうなら、`BasicCustomData<T>` の代わりにクラスに直接 `ICustomData` を実装してください。メソッドは2つだけです。`Serialize()` は `SerializedCustomData(modId, dataVersion, jObject)` を返し、`Deserialize(SerializedCustomData)` で元に戻します。`ModId` と `DataVersion` のチェックは自分でやる必要があり、誰も代わりにやってくれません。`BasicCustomData<T>` は両方にプレースホルダーの値を書き込み、それ以外を読むと例外を投げるので、同じキーで2つを混在させないでください :PES5_Hmmmm:。

> [!NOTE] NML 1.2.0で確認済み
> これらの名前とシグネチャはNMLのアセンブリ自体から確認したもので、ドキュメントには載っていません。将来のNMLでリネームされた場合は、コンパイラがプレイヤーより先に教えてくれます。

## HelloBoxでの実装例

攻撃ヒット数をカウントし、50回に達した際に一度だけ報酬特性（trait）を付与するカスタム特性の実装例です:

```csharp Mods/HelloBox/Code/HelloMemory.cs
namespace HelloBox
{
    public static class HelloMemory
    {
        public const string GRUDGE = "hello_grudge";      // the trait that remembers
        public const string HITS = "hello_hits";          // int: hits this unit has landed
        public const string VETERAN = "hello_veteran";    // flag: it already got its reward

        public static void Initialize()
        {
            if (AssetManager.traits.has(GRUDGE)) return;

            ActorTrait grudge = new ActorTrait
            {
                id = GRUDGE,
                path_icon = "ui/Icons/iconHelloGrudge",
                group_id = HelloGroups.TRAITS,
                needs_to_be_explored = false
            };

            grudge.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                Actor actor = pSelf as Actor;
                if (actor == null || !actor.isAlive()) return false;

                // lives in the unit's own save data, so it survives save and load
                actor.data.change(HITS, 1, 0, 100000);
                actor.data.get(HITS, out int hits);

                // addFlag() is false when the flag was already there: the reward happens once
                if (hits >= 50 && actor.data.addFlag(VETERAN))
                {
                    actor.addTrait("veteran");
                }
                return true;
            };

            AssetManager.traits.add(grudge);
            grudge.base_stats["damage"] = 2f;
        }

        /** Anyone can read it back, a window, a patch, another trait. */
        public static int GetHits(Actor pActor)
        {
            if (pActor == null) return 0;
            pActor.data.get(HITS, out int hits);
            return hits;
        }
    }
}
```

ワールドをセーブしてロードし直しても、ユニット自身のセーブデータ内に書き込まれているためカウントはそのまま保持されます。フラグ判定のおかげで、50回以降の攻撃ごとに重複して報酬が付与されることもありません。気前はいいですが、それでもバグです。

他の特性と同様のローカライズテキスト:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_grudge": "Grudge",
  "trait_hello_grudge_info": "Remembers every blow it lands. Fifty, and it has seen enough to be a veteran."
}
```

> [!WARNING] `Actor.data` は `internal` です
> ユニットの data フィールドはゲームのアセンブリ内で `internal` 指定されています。NML は **public 化（publicized）** されたアセンブリに対して Mod をコンパイルするため、通常のソースコード Mod であればそのまま記述できます。素のアセンブリに対して独自に `.dll` をビルドする場合にのみ問題となります（詳細は **[トラブルシューティング](#/troubleshooting)** を参照）。なお、都市や王国の `data` は最初から public です。

## データの保存先

| 対象オブジェクト | データフィールド |
| --- | --- |
| ユニット | `actor.data` |
| 都市 | `city.data` |
| 王国 | `kingdom.data` |
| 建物 | `building.data` |
| 文化（culture）、宗教（religion）、氏族（clan）、言語、家族、軍隊、陰謀（plot） | それぞれの `data`（すべて同一のストア構造） |

## 知っておくべきこと

- **キーには必ずプレフィックスを付ける。** すべての Mod が同一のデータストアを共有します。`hello_hits` なら他と衝突しませんが、`hits` だといつか必ず重複事故が起きます。
- **Mod の削除時も安全。** キーがセーブデータ内に残っても誰も読み取らなくなるだけで、ゲームが壊れることはありません。セーブフォーマット自体にパッチを当てるのと比べ、極めて安全です。
- **空のストアは無駄な容量を消費しない。** ゲームはセーブ書き出し時に空のテーブルを破棄するため、削除されたキーは完全に消去されます。
- **データサイズは最小限に抑える。** 各ユニットごとに保存されるため、数値やフラグであれば問題ありませんが、何万ものユニットが存在するマップで巨大な文字列を保存するとセーブ容量が肥大化します。

## ワールド全体のデータ

どのユニットにも属さない状態もあります。このワールドであなたのパワーが何個の隕石を落としたか、一度きりの祝福がもう起きたかどうか、といったものです。ワールドにも同じストアがあり、map stats の中にあります：

```csharp
// map_stats is internal: fine in an NML source mod, same deal as actor.data above
SaveCustomData world = World.world?.map_stats?.custom_data;
if (world == null) return;

world.change("hello_meteors", 1, 0, 1000000);   // change() clamps to 1000 unless you say otherwise
if (world.addFlag("hello_blessed")) { /* first time on this world only */ }
```

`SaveCustomData` は同じ `BaseSystemData` ストアなので、上の表のすべての呼び出しが使え、NMLの `Set` / `TryGet` も使えます。map stats の一部としてセーブされるため、セーブスロットごとに別々に持ちます。新しく生成したワールドは空の状態から始まります。ゲームは map stats を構築・ロードするたびにこのストアを作るので、null チェックが発動することは本来ありません。それでもコストはゼロなので、残しておきましょう。

> [!TIP] 設定かワールドデータか
> 「別のセーブをロードしたら値が変わってほしいか」で判断します。「隕石パワーの威力」は変わってほしくない、つまり **[Mod設定](#/nml/mod-config)** で、すべてのワールドで共有されます。「このワールドは祝福済みか」は変わってほしい、つまり `custom_data` です。

## セーブをまたいで生き残る時刻

`Time.time` はゲームを起動してからの秒数です。これをユニットのデータに保存し、セーブして再起動してロードすると、あなたが書き込んだタイムスタンプはすべて前世のものになります :wbfacepalm:。

ワールドは自分自身の時計を持っていて、マップと一緒にセーブされます：

```csharp
if (World.world == null || World.world.map_stats == null || Config.worldLoading) return;
if (actor == null || !actor.isAlive()) return;

// double, in world seconds: 5 is a month, 60 is a year
double now = World.world.getCurWorldTime();

// the store has no double, a float is plenty for a timestamp
actor.data.set("hello_blessed_at", (float)now);

actor.data.get("hello_blessed_at", out float at, -1f);
bool blessedThisYear = at >= 0f && now - at < 60.0;
```

これはゲームが一時停止すると止まり、速度を上げるとその分速く進みます。たいていはそれがまさに欲しい挙動です。`Date.getYearsSince(at)` と `Date.getMonthsSince(at)` が割り算をやってくれます。

## ワールドロード後にコードを実行する

ここまでの内容はすべて必要なときに読み出す方式なので、普段はワールドがいつロードされたかを知る必要はありません。知る必要がある場合、たとえば自前のキャッシュを再構築したいときは、Modが **[Harmony](#/nml/harmony-patches)** でフックするメソッドは次の通りです：

| メソッド | 実行タイミング |
| --- | --- |
| `MapBox.clearWorld`（public） | ワールドが生成・ロードされる直前。自前の static キャッシュをここでクリアする |
| `SaveManager.loadActors`（private） | セーブのロード中、ユニットが再構築された直後 |
| `MapBox.finishMakingWorld`（public） | 生成・ロードいずれの場合も、ワールド作成の終盤 |
| `SaveManager.saveWorldToDirectory`（public, static） | セーブ時（手動・自動問わず）。Prefixならストアに書き込む最後のチャンス |
| `MapBox.addLastStep`（private） | ゲーム起動時に一度だけ。ワールドごとではない |
| `MapBox.OnApplicationQuit`（private） | ゲーム終了時 |

```csharp Mods/HelloBox/Code/HelloWorldCache.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloWorldCache
    {
        // a cached copy for code that reads it every frame; the save keeps the real one
        public static int MeteorsThisWorld;

        // runs for a brand new world and for a loaded save alike
        public static void Postfix()
        {
            MeteorsThisWorld = 0;
            SaveCustomData world = World.world?.map_stats?.custom_data;
            if (world == null) return;

            world.get("hello_meteors", out int meteors);
            MeteorsThisWorld = meteors;
        }
    }
}
```

private メソッドは名前を文字列で指定します。`[HarmonyPatch(typeof(SaveManager), "loadActors")]` のように、Harmonyのページで説明している通りです。`finishMakingWorld` が実行されている間もロード画面はまだ表示されており、この後いくつかのステップが続きます。

## 自前のファイル

多くのModはここまでの仕組みをすべて飛ばして、`File.WriteAllText` でJSONファイルを書き出します。保存先はたいてい `Application.persistentDataPath`、つまり `Player.log` の隣にある `LocalLow\mkarpenko\WorldBox` フォルダです。これは**プレイヤー**に属するもの、たとえばエクスポートしたお気に入りユニットの一覧や、これまでプレイした全ゲームを通じての統計には向いています。

しかし**ワールド**に属するものには向いていません。そのファイルはどのセーブスロットがロードされているかを知りません。プレイヤーがスロット1である王国を祝福し、スロット2をロードすると、スロット2も祝福されたことになってしまいます。その後スロット1を削除しても、あなたのファイルはその状態を永遠に保持し続けます :PES2_F:。セーブが変わったら変わってほしい値なら、上記のいずれかのストアに入れましょう。

## 次に読むところ

プレイヤーが一度だけ選び、すべてのワールドで共有される値については **[Mod設定](#/nml/mod-config)** を参照してください。毎フレーム、あるいはゲーム内の毎月ごとに何かをチェックするコードについては **[毎フレーム](#/nml/update-loops)** を参照してください :PES_OkHand:。
