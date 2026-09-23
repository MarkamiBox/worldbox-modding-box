---
title: データの保存と記憶
group: NML Modding
subgroup: 高度な機能と公開
icon: :wbfloppysavewink:
order: 44
---

# データの保存と記憶 :wbfloppysavewink:

Mod を開発していると、特定のユニットに関する情報（何回攻撃をヒットさせたか、報酬を受け取り済みか、どの祠で祈りを捧げたかなど）を永続的に記録したくなる場面が必ず訪れます。ユニットをキーにした static な Dictionary では、プレイヤーがセーブしてリロードした瞬間にすべて消去されてしまいます :wbfacepalm:。

WorldBox にはそのための仕組みがあらかじめ用意されています。すべてのユニット、都市、王国、建物、アイテム、書籍はデータオブジェクト内に状態を保持しており、そのすべてにセーブファイルへ一緒に書き込まれる小さな **カスタムデータストア**（Custom Data）が備わっています。

## データストア

| メソッド | 動作 |
| --- | --- |
| `data.set(key, value)` | `int`、`long`、`float`、`string`、`bool` をキーに保存 |
| `data.get(key, out value, default)` | 値を取得。キーが存在しない場合はデフォルト値を返す |
| `data.change(key, amount, min, max)` | `int` に値を加算し、同時に最小・最大範囲内に収める（クランプ） |
| `data.addFlag(key)` | フラグを立てる。すでに立っていた場合は `false` を返す |
| `data.hasFlag(key)` / `data.removeFlag(key)` | フラグの確認および解除 |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | 指定した型の値を削除 |

型ごとに独立した内部テーブルを持つため、同じキー名で `int` と `string` を保存しても競合しません。ただし、混乱を防ぐためにも同じキー名を使い回すのは避けましょう。

## HelloBoxでの実装例

攻撃ヒット数をカウントし、50回に達した際に一度だけ報酬特性を付与するカスタム特性の実装例です:

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

ワールドをセーブしてロードし直しても、ユニット自身のセーブデータ内に書き込まれているためカウントはそのまま保持されます。フラグ判定のおかげで、50回以降の攻撃ごとに重複して報酬が付与されることもありません。

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
| 文化、宗教、氏族、言語、家族、軍隊、陰謀 | それぞれの `data`（すべて同一のストア構造） |

## 知っておくべきこと

- **キーには必ずプレフィックスを付ける。** すべての Mod が同一のデータストアを共有します。`hello_hits` なら他と衝突しませんが、`hits` だといつか必ず重複事故が起きます。
- **Mod の削除時も安全。** キーがセーブデータ内に残っても誰も読み取らなくなるだけで、ゲームが壊れることはありません。セーブフォーマット自体にパッチを当てるのと比べ、極めて安全です。
- **空のストアは無駄な容量を消費しない。** ゲームはセーブ書き出し時に空のテーブルを破棄するため、削除されたキーは完全に消去されます。
- **データサイズは最小限に抑える。** 各ユニットごとに保存されるため、数値やフラグであれば問題ありませんが、何万ものユニットが存在するマップで巨大な文字列を保存するとセーブ容量が肥大化します。

単一のオブジェクトに紐づかないグローバルな設定項目（ワールド全体の設定など）については、Mod 設定画面を活用してください（**[Mod設定](#/nml/mod-config)** を参照 :PES_OkHand:）。
