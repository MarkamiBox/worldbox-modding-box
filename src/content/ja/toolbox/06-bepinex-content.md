---
title: BepInEx でコンテンツを追加する
group: BepInEx Modding
icon: :wbhammer:
order: 2
---

# BepInEx でコンテンツを追加する :wbhammer:

BepInEx のプラグインでも、NMLのmodと同じように特性（trait）、アイテム（item）、パワー（GodPower）を追加できます。ただし、NMLが黙ってやってくれる3つの仕事を自分でやる必要があります：ゲームの準備を待つ、テキストを読み込む、画像を読み込む。このページでは **[カスタム特性](#/nml/custom-traits)** のページと同じ **Swift** 特性で3つすべてを行うので、1行ずつ見比べられます。

まだプロジェクトがなければ、**[BepInEx Mod開発](#/toolbox/bepinex-modding)** から始めてください。

## 正しいタイミング

プラグインの `Awake()` はとても早く、WorldBox がアセットのライブラリ（library）をひとつも作っていない段階で動きます。そこでは `AssetManager.traits` はまだ null で、触るとメインメニューが出る前に `NullReferenceException` になります。

狙うべきタイミングは `AssetManager.init()` の終わりです。この public なメソッドひとつがすべてのライブラリを作り、そのあと各ライブラリの `post_init()` と `linkAssets()` を実行します。そこに Harmony の Postfix を付ければ直後に動きます。NMLのmodの `OnModLoad` が動くのもまさにそこです。NMLのページにある「ゲームは起動時にこれをやった。modがまだ存在しない時に。だから自分でやる」という話は、ここでも一字一句そのまま当てはまります。

## コード

```csharp Plugin.cs
using System.IO;
using BepInEx;
using HarmonyLib;

namespace HelloBepInEx
{
    [BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
    [BepInProcess("worldbox.exe")]
    public class HelloPlugin : BaseUnityPlugin
    {
        public static HelloPlugin Instance;

        /** The folder your .dll sits in, for loading your own files. */
        public static string Folder => Path.GetDirectoryName(Instance.Info.Location);

        private void Awake()
        {
            Instance = this;
            new Harmony("com.example.hellobepinex").PatchAll();

            // Installed while the game was already running? The libraries exist, go now.
            if (InitLibraries.initiated) HelloContent.Register();
        }
    }

    [HarmonyPatch(typeof(AssetManager), nameof(AssetManager.init))]
    public static class AssetsReadyPatch
    {
        [HarmonyPostfix]
        public static void Postfix() => HelloContent.Register();
    }

    [HarmonyPatch(typeof(LocalizedTextManager), nameof(LocalizedTextManager.setLanguage))]
    public static class LanguagePatch
    {
        // setLanguage throws the whole text table away and reloads it from the game files,
        // so our lines have to go back in after every language change.
        [HarmonyPostfix]
        public static void Postfix() => HelloContent.AddText();
    }
}
```

```csharp HelloContent.cs
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace HelloBepInEx
{
    public static class HelloContent
    {
        public const string SWIFT = "hello_swift";
        private const string ICON = "ui/Icons/iconHelloSwift";
        private static bool done;

        /** Text per language. English is the fallback for everything else. */
        private static readonly Dictionary<string, Dictionary<string, string>> Text =
            new Dictionary<string, Dictionary<string, string>>
            {
                ["en"] = new Dictionary<string, string>
                {
                    ["trait_hello_swift"] = "Swift",
                    ["trait_hello_swift_info"] = "Moves like the world owes it money."
                },
                ["it"] = new Dictionary<string, string>
                {
                    ["trait_hello_swift"] = "Rapido",
                    ["trait_hello_swift_info"] = "Si muove come se il mondo gli dovesse dei soldi."
                }
            };

        public static void Register()
        {
            if (done) return;
            done = true;

            // 1. The art, before anything asks for it. See "Your own art" below.
            string png = Path.Combine(HelloPlugin.Folder, "iconHelloSwift.png");
            if (File.Exists(png)) SpriteTextureLoader.addSprite(ICON, File.ReadAllBytes(png));

            // 2. The trait: exactly the Custom traits page, nothing BepInEx-specific.
            if (!AssetManager.traits.has(SWIFT))
            {
                ActorTrait swift = new ActorTrait
                {
                    id = SWIFT,
                    needs_to_be_explored = false,
                    path_icon = ICON,
                    group_id = "physique",
                    rate_birth = 0,
                    can_be_given = true,
                    can_be_removed = true
                };
                AssetManager.traits.add(swift);
                swift.base_stats["speed"] = 20f;
            }

            // 3. The text for the language that is already loaded.
            AddText();
        }

        public static void AddText()
        {
            if (LocalizedTextManager.instance == null) return;

            string lang = LocalizedTextManager.instance.language;
            if (!Text.TryGetValue(lang, out Dictionary<string, string> lines)) lines = Text["en"];

            foreach (KeyValuePair<string, string> line in lines)
            {
                // pReplace: true, or a second call logs "Already exists" for every line
                LocalizedTextManager.add(line.Key, line.Value, pReplace: true);
            }
        }
    }
}
```

ビルドしてゲームを起動し、ユニットを開けば、Swift が名前・説明・アイコン付きで `physique` タブに入っています。

> [!NOTE] `LocalizedTextManager.instance.language` は internal
> コンパイルできるのは、**[BepInEx Mod開発](#/toolbox/bepinex-modding)** のプロジェクトがゲームを publicize しているからです。publicizer がなければ、言語を自分で覚えておく必要があります。

## 3つの仕事をひとつずつ

### ゲームを待つ

| NML | BepInEx |
| --- | --- |
| ライブラリの準備ができたら `OnModLoad()` が動く | `AssetManager.init()` への Postfix |
| NMLが1回だけ動くよう保証する | 自分の責任：`Awake()` がすでに呼んでいたら、`done` フラグが2回目を止める |

間違ったタイミングで登録すると、ログが教えてくれます：`AssetManager.<何か>` を指す `NullReferenceException` は、早すぎるという意味です。

### テキスト

NMLは `Locales/` フォルダを読み込み、言語を切り替えるたびにかけ直します。BepInEx ではその両方を自分でやります。そして `setLanguage` へのパッチは誰もが忘れる部分です：英語では全部動くのに、プレイヤーがイタリア語に切り替えた瞬間、特性の名前が `trait_hello_swift` になります :wbfacepalm:。

キーの名前はガイドの他の場所と同じなので、**[多言語対応](#/nml/localization)** のページの表はそのまま使えます。`LocalizedTextManager.add` は、ゲーム自身のファイルと同じようにキーを snake_case に変えてくれます。

### 自作の画像

BepInEx には `GameResources/` フォルダがありません。代わりにあるのが `SpriteTextureLoader.addSprite(path, bytes)` です。どこにあるPNGでも読み込み、好きなパスで登録してくれます。ピボットは中央、フィルタはドット絵向けです。あとは `path_icon = "ui/Icons/iconHelloSwift"` が、バニラのスプライトと同じようにそれを見つけます。

ルールは2つ：

- **そのパスを誰かが要求する前に登録する。** ゲームは一度調べたパスを失敗したものも含めてすべて覚えていて、`addSprite` はすでに覚えられているパスを拒否します。`Register()` の一番最初でやれば安全です。
- **1枚の画像であって、フレームのフォルダではない。** アイコン、アイテムのアイコン、パワーのボタンは1枚の画像なので使えます。ガイドで**フォルダ**と書かれているもの（ドロップのアニメーション、ステータス効果、投射物、タイル、建物のスプライト）は `getSpriteList()` で読み込まれ、`addSprite` はそこを埋めません。それらはバニラのパスを借りるか、その部分をNMLのmodにしてください。

PNGは `.dll` の隣に置きます：

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

ビルドでそれもコピーさせるには、`.csproj` の `CopyToGame` ターゲットに1行足します：

```xml HelloBepInEx.csproj
<Copy SourceFiles="iconHelloSwift.png" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
```

## NMLから持ってこれないもの

NMLのヘルパーに頼っているページもありますが、それらは BepInEx にはありません。代わりの方法はこちら：

| NMLのページで使うもの | BepInEx では |
| --- | --- |
| `Locales/` フォルダ | 上の `AddText()` のやり方 |
| `GameResources/` | 1枚の画像なら `SpriteTextureLoader.addSprite`、フォルダはバニラのパス |
| `TabManager`、`PowerButtonCreator`（パワーのボタン） | 相当するものなし。Unity でUIを自作するか、ボタンをNMLのmodに入れる |
| `ModConfig` の設定ウィンドウ | BepInEx の `Config.Bind()`。`.cfg` ファイルで編集 |
| 独自のセーブデータ | ゲーム自身のユニットの `data.set` / `data.get` がそのまま使える。**[データの保存](#/nml/saving-data)** を参照 |
| リロードボタン | なし。閉じて、ビルドして、起動 |

普通のゲームのコード、つまり各ページのほとんどは、そのまま動きます：アセット、ステータス、状態、Harmony パッチ、AI、ワールド法則。

うまくいかないときは、**[デバッグと公開](#/toolbox/bepinex-publishing)** に一番出会いやすいエラーをまとめてあります。
