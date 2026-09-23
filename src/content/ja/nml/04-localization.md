---
title: 多言語対応
group: NML Modding
subgroup: 基本ワークフロー
icon: :wbscroll:
order: 26
---

# 多言語対応 :wbscroll:

ゲームに追加するあらゆる要素（特徴、アイテム、神の力、タブ、タスク）は、テキストを登録しない限り `trait_hello_swift` のような生のキー名で画面に表示されます。Mod開発の中で最も退屈な作業ですが、ここを省くことが「Modが未完成に見える」最大の原因です。（ゴホッ… 私の過去のMod… ゴホッゴホッ :pensiveanimated: ）

## 手軽な方法：Localesフォルダを使う

メインクラスが `BasicMod<T>` を継承している場合、Mod内に `Locales/` フォルダを作成し、言語コード名のJSONファイルを置くだけです。NMLが `OnModLoad` の**前**に自動的に読み込んでくれるため、コードを1行も書く必要がありません。

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money.",
  "hello_sword_ember": "Ember Blade",
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess."
}
```

ファイル名**そのもの**が言語を表します：`en.json`、`cz.json`（簡体字中国語）、`ru.json`、`ja.json` など。

もし `IMod` を手動で実装している場合は、`ILocalizable` インターフェースを実装してフォルダの場所を指定します：

```csharp Code/Main.cs
public string GetLocaleFilesDirectory(ModDeclare pModDeclare)
{
    return System.IO.Path.Combine(pModDeclare.FolderPath, "Locales");
}
```

## 全言語を1つのファイルで管理する：CSV

同じフォルダ内に `.csv` ファイルを1つ置くだけで、すべての言語を一度に定義できます。15個ものJSONファイルを個別に管理するよりもはるかにメンテナンスが楽になります。この場合、ファイル名は何でも構いません：

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## C#コードから直接登録する

`NeoModLoader.General.LM` はローカライズ用のヘルパークラスです。テキストを動的に生成したい場合や、複数のJSONを用意せず `.cs` ファイル1つにすべてをまとめたい場合に便利です。

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // 現在のゲーム言語から取得
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // 現在読み込まれている言語に追加
LM.Add("en", "trait_hello_swift", "Swift");          // 特定の言語に追加
LM.LoadLocale("path/to/Locales/en.json");            // JSONファイルを手動で読み込む
LM.LoadLocales("path/to/Locales/lang.csv");          // CSVファイルを手動で読み込む
LM.ApplyLocale(false);                               // 適用。false = 画面上の全テキストの再描画を抑制
```

HelloBoxでは、以下のようなファイルを用意します：

```csharp Mods/HelloBox/Code/HelloLocale.cs
using System.Collections.Generic;
using NeoModLoader.General;

namespace HelloBox
{
    public static class HelloLocale
    {
        public static void Initialize()
        {
            Dictionary<string, string> texts = new Dictionary<string, string>
            {
                { "trait_hello_swift", "Swift" },
                { "trait_hello_swift_info", "Moves like the world owes it money." },
                { "hello_strike", "Hello Strike" },
                { "hello_strike_description", "Shakes the ground and makes a mess." }
            };

            foreach (KeyValuePair<string, string> pair in texts)
            {
                LM.AddToCurrentLocale(pair.Key, pair.Value);
                LM.Add("en", pair.Key, pair.Value);
            }

            LM.ApplyLocale(false);
        }
    }
}
```

他の何よりも**最初**に `HelloLocale.Initialize();` を `Main.cs` で呼び出してください。テキストが未登録のままアセットが追加されるのを防ぐためです。

**起動時に一括で登録**し、最後に `ApplyLocale` を1回だけ呼び出してください。ゲーム内に存在しないキーを参照すると、ゲームはエラーログを出力してディスクにファイルを書き出すため、キー抜けだらけのツールチップは見た目が悪いだけでなくログを汚染します :PES_UghPing:。

## 実際に必要となるキー名の命名規則

ゲーム本体が自動的にキーを構築するため、完全に一致させる必要があります：

| 対象 | 名前のキー | 説明文のキー |
| --- | --- | --- |
| 特徴 (Trait) | `trait_<id>` | `trait_<id>_info` |
| アイテム | `item_<id>` | `item_<id>_description` |
| 神の力 | `<power_id>` | `<power_id>_description` |
| パワータブ | 渡した `locale_key` | 渡した説明用キー |
| アクタータスク | `task_unit_<task_id>` | - |
| ステータス効果 | `<status_id>` | `<status_id>_description` |
| 世界の法則 | `<law_id>_title`（末尾に注意） | `<law_id>_description` |

> [!WARNING] IDは表示名ではありません
> あなたのIDは全言語で永遠に `hello_swift` であり、コード内や他人のModから参照される固有の名前です。変わるのは**ローカライズテキスト**の部分だけです。表示名のタイポを直すためだけにID自体を変更することは絶対に避けてください :PESgn_Stop:。
