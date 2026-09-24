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


表計算ソフトがカンマではなくセミコロンやタブ区切りで出力する場合は、メインクラスに `ICsvSepCustomized` を実装して `GetCsvSeparator()` から `';'` を返してください :PES2_Shrug:。
同じフォルダ内に `.csv` ファイルを1つ置くだけで、すべての言語を一度に定義できます。15個ものJSONファイルを個別に管理するよりもはるかにメンテナンスが楽になります。この場合、ファイル名は何でも構いません：

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## C#コードから直接登録する

`NeoModLoader.General.LM` はローカライズ用のヘルパーです。テキストを生成する場合や、JSONの山ではなくすべてを1つの `.cs` ファイルにまとめたい場合に便利です。

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // read in the current language
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // add to whatever language is loaded now
LM.Add("en", "trait_hello_swift", "Swift");          // add to a specific language
LM.LoadLocale("en", "path/to/Locales/en.json");       // load a json manually (language + path)
LM.LoadLocales("path/to/Locales/lang.csv");          // load a csv manually
LM.ApplyLocale(false);                               // apply. false = don't refresh every text on screen
```

HelloBoxでは、そのファイルはこうなります：

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

`HelloLocale.Initialize();` を `Main.cs` の **一番最初** に、他のすべてより先に追加してください。テキストがまだない状態で何かが登録されることがなくなります。

**すべてを一度に、ロード時に** 登録し、最後に `ApplyLocale` を1回だけ呼びます。ゲームが持っていないキーを要求すると、キーそのものがテキストとして返り、キーごとにログに `missing text` エラーが1つ出ます。つまり、欠けたキーで作られたツールチップは見た目が悪いだけでなく、ログもノイズだらけにします :PES_UghPing:。

## 実際に必要となるキー名の命名規則

これらのキーはゲーム自身が組み立てるので、完全に一致しないと何も表示されません。そのうち2つは「IDと同じ」ルールに**従わず**、まさにそこで皆が1時間を失います：

| 対象 | 名前のキー | 説明のキー |
| --- | --- | --- |
| 特性 | `trait_<id>` | `trait_<id>_info` |
| アイテム | 設定していれば `translation_key`、なければ `item_<equipment_subtype or id>` | `<id>_description`（`item_` 接頭辞なし） |
| 神の力 | `<power_id>` | `<power_id>_description` |
| パワー（GodPower）タブ | 渡した `locale_key` | 渡した説明キー |
| アクターのタスク | `task_unit_<task_id>` | - |
| ステータス効果（status） | 設定した `locale_id` **フィールド** | 設定した `locale_description` **フィールド** |
| 世界の法則（world law） | `<law_id>_title`（接尾辞に注意） | `<law_id>_description` |

> [!WARNING] IDは名前ではない
> あなたのIDはどの言語でも永遠に `hello_swift` であり、残りのコード（や他人のMod）が参照するのはこれです。変わるのは **ローカライズされたテキスト** の方です。表示名のタイプミスを直すためだけにIDを変えてはいけません :PESgn_Stop:。
