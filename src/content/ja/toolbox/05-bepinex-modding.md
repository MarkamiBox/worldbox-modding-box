---
title: BepInEx Mod開発
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# BepInEx Mod開発 :PES5_BigBrain:

このガイドの大部分は **NeoModLoader** 用のmodの書き方を教えています。NMLなら、メモ帳で普通の `.cs` ファイルを書いてゲームを起動するだけで、コードが自動でコンパイルされます。

BepInEx はあなたの気持ちなんて気にしません :PES2_Shrug:。Unity向けの老舗で汎用のmodフレームワークです。BepInEx のmodを作るということは、ちゃんとしたC#プロジェクトを用意し、自分で `.dll` をコンパイルして `BepInEx/plugins/` に置くということです。即時リロードや便利なアセット（asset）ヘルパーは失いますが、ゲームが目を覚ましたと気づく前から、Unityのプロセスを完全に制御できます。

このパートは3ページあります：このページでプラグインを動かし、**[BepInEx でコンテンツを追加する](#/toolbox/bepinex-content)** で本物のコンテンツを追加させ、**[デバッグと公開](#/toolbox/bepinex-publishing)** で他の人に届けます。

## BepInEx と NeoModLoader のどちらか

ビルド環境の準備に午後を費やす前に、正しい道具を選びましょう：

| やりたいこと | 選ぶもの | 理由 |
| --- | --- | --- |
| 特性（trait）、アイテム（item）、ゴッドパワー（GodPower）、生き物、バイオームを追加する | **NML** | NMLは正しいタイミングの `AssetManager`、`Locales` フォルダ、`GameResources/`、ボタン、セーブ用ヘルパーをタダでくれます |
| 開発者ツール、オーバーレイ、エンジンへのフックを作る | **BepInEx** | BepInEx は WorldBox の初期化より前、Monoのレベルで起動します |
| メモ帳だけでコードを書いて保存したい | **NML** | NMLは実行時にC#のソースをコンパイルします |
| Unityのコンポーネントだけでできた、コンパイル済みのプラグインを配布する | **BepInEx** | コンパイラの設定、依存関係、ビルド対象を自分で決められます |

ゲームのコンテンツを追加するなら、NMLのmodを書きましょう。UnityExplorer のようなツールを作るなら、あるいはターミナルに流れるMSBuildの出力を眺めるのが本当に好きなら、BepInEx があなたの居場所です。BepInEx でもコンテンツは追加*できます*。やり方は次のページですが、NMLがタダでくれるものを自分の手で作り直すことになります。

## 1. 事前準備

1. **BepInEx 5 (Mono x64)** をインストールし、**[ライブコンソール（BepInEx）](#/toolbox/bepinex-console)** の説明どおりにコンソールを有効にします。一度ゲームを起動して、BepInEx にフォルダを作らせてください。
2. **[.NET SDK](https://dotnet.microsoft.com/)**（または .NET デスクトップ開発を入れた Visual Studio）をインストールします。BepInEx のプラグインには本物のC#コンパイラが必要です。

## 2. プロジェクトの準備

プロジェクトを置くフォルダでターミナルを開き、新しいクラスライブラリを作ります：

```bash
dotnet new classlib -n HelloBepInEx
cd HelloBepInEx
```

次に `HelloBepInEx.csproj` の中身を全部これに置き換えます。ゲームと同じ .NET バージョンを使い、WorldBox のフォルダを1か所で指定し、ビルドのたびに3つの仕事を代わりにやってくれます：

```xml HelloBepInEx.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>HelloBepInEx</AssemblyName>
    <Version>1.0.0</Version>
    <LangVersion>latest</LangVersion>
    <!-- Your WorldBox folder. Change this one line if Steam lives on another drive. -->
    <GameDir>C:\Program Files (x86)\Steam\steamapps\common\worldbox</GameDir>
  </PropertyGroup>

  <ItemGroup>
    <!-- Lets you build for net472 without installing the old .NET Framework developer pack -->
    <PackageReference Include="Microsoft.NETFramework.ReferenceAssemblies" Version="1.0.3" PrivateAssets="all" />
    <!-- Makes internal and private game code visible to your compiler, like NML does -->
    <PackageReference Include="BepInEx.AssemblyPublicizer.MSBuild" Version="0.4.3" PrivateAssets="all" />
  </ItemGroup>

  <ItemGroup>
    <!-- The game, publicized -->
    <Reference Include="$(GameDir)\worldbox_Data\Managed\Assembly-CSharp.dll" Publicize="true" Private="false" />
    <!-- Every Unity module: UnityEngine.dll alone does not have Input, UI or ImageConversion -->
    <Reference Include="$(GameDir)\worldbox_Data\Managed\UnityEngine*.dll" Private="false" />
    <!-- BepInEx and Harmony -->
    <Reference Include="$(GameDir)\BepInEx\core\BepInEx.dll" Private="false" />
    <Reference Include="$(GameDir)\BepInEx\core\0Harmony.dll" Private="false" />
  </ItemGroup>

  <!-- After every build, copy the plugin straight into the game -->
  <Target Name="CopyToGame" AfterTargets="Build">
    <Copy SourceFiles="$(TargetPath)" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
  </Target>
</Project>
```

各部分の役割：

- ゲームへの参照すべてに付いた **`Private="false"`**：ビルドの出力先にゲームのエンジン丸ごとがコピーされません :PESgn_SMH:。
- **`Publicize="true"`**：ガイドのNMLのページはゲームの `internal` メンバーをしょっちゅう使います。NMLが「publicize」されたゲームに対してコンパイルするからです。BepInEx のプロジェクトは、頼まない限りそうしません。この設定で、同じコードがここでもコンパイルできます。`PackageReference` のバージョン番号は、執筆時点で最新の安定版です。NuGet が文句を言ったら、提示される最新のものを使ってください。
- **`UnityEngine*.dll`**：Unity はたくさんのモジュールファイルに分かれています。`Input` は `UnityEngine.InputLegacyModule.dll`、UIは `UnityEngine.UI.dll` にある、という具合です。全部参照しておけば「型が見つからない」探しをしなくて済みます。
- **`CopyToGame`**：`.dll` を手でコピーするのはもう終わり。ビルドしてゲームを起動すれば完了です。

## 3. プラグインの骨組み

BepInEx のプラグインは、`BaseUnityPlugin` を継承し `[BepInPlugin]` 属性を付けたクラスです：

```csharp Plugin.cs
using BepInEx;
using BepInEx.Configuration;
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [BepInPlugin(PLUGIN_GUID, PLUGIN_NAME, PLUGIN_VERSION)]
    [BepInProcess("worldbox.exe")]
    public class HelloPlugin : BaseUnityPlugin
    {
        public const string PLUGIN_GUID = "com.example.hellobepinex";
        public const string PLUGIN_NAME = "HelloBepInEx";
        public const string PLUGIN_VERSION = "1.0.0";

        // BepInEx manages configuration files automatically
        private ConfigEntry<bool> configEnableLogs;
        private ConfigEntry<KeyCode> configHotkey;

        private void Awake()
        {
            // Bind configuration: section, key, default value, description
            configEnableLogs = Config.Bind(
                "General",
                "EnableLogs",
                true,
                "Print debug messages to the BepInEx console."
            );

            configHotkey = Config.Bind(
                "Controls",
                "ToggleKey",
                KeyCode.F7,
                "Key to press to trigger the plugin action."
            );

            if (configEnableLogs.Value)
            {
                Logger.LogInfo($"{PLUGIN_NAME} loaded successfully!");
            }

            // Apply any Harmony patches in this assembly
            Harmony harmony = new Harmony(PLUGIN_GUID);
            harmony.PatchAll();
        }

        private void Update()
        {
            // Standard Unity Update cycle
            if (Input.GetKeyDown(configHotkey.Value))
            {
                Logger.LogInfo("Hotkey pressed from BepInEx!");
            }
        }
    }
}
```

### 各部分の解説

- **`BaseUnityPlugin`**：Unity の `MonoBehaviour` を直接継承しています。プラグインは、シーンが切り替わっても残り続ける `GameObject` に付いた、動作中のコンポーネントです。
- **`[BepInPlugin(guid, name, version)]`**：modの名前と一意の識別子を BepInEx に伝えます。逆ドメイン形式（`com.author.modname`）を使い、公開後はGUIDを絶対に変えないでください。設定ファイルや他のプラグインの依存関係がそれに結びついています。
- **`[BepInProcess("worldbox.exe")]`**：WorldBox の中でだけ読み込みます。ここでは無害で、誰かが別のゲームの BepInEx にプラグインを入れたときのわけの分からないクラッシュを防げます。
- **`Logger.LogInfo()`**：BepInEx のライブコンソールと `BepInEx/LogOutput.log` に直接書き込みます。
- **`Config.Bind()`**：型付きの設定項目を作ります。プラグインの初回起動時に、BepInEx がプレイヤーの編集できるきれいな `BepInEx/config/com.example.hellobepinex.cfg` を作ります。

## 4. Harmony でゲームに割り込む

BepInEx では Harmony が `BepInEx/core/0Harmony.dll` に同梱されています。プロジェクトのどこかにパッチクラスを追加します：

```csharp Patches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    // MapBox.startTheGame runs once the world exists: it is where the game sets Config.game_loaded
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.startTheGame))]
    public static class StartTheGamePatch
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            Debug.Log("[HelloBepInEx] The world is ready!");
        }
    }
}
```

`Plugin.cs` が `harmony.PatchAll()` を呼んでいるので、Harmony はコンパイル済みのアセンブリを調べて、中のパッチクラスをすべて適用します。**[Harmony パッチ](#/nml/harmony-patches)** で学んだことはここでもそのまま使えます：魔法のパラメータ名、Prefix と Postfix、他のmodを壊さないためのルール。

## 5. ビルドと導入

コマンドラインでプロジェクトをコンパイルします：

```bash
dotnet build -c Release
```

`.dll` は `bin/Release/net472/HelloBepInEx.dll` に作られ、`CopyToGame` の手順がそれをゲームに直接置きます：

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

コンソールを有効にしてゲームを起動すると、BepInEx がアセンブリを見つけて読み込むのが見えます：

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

> [!WARNING] ビルドの前にゲームを閉じる
> WorldBox が起動している間は `.dll` が使用中になり、コピーが "the process cannot access the file" で失敗します。ゲームを閉じて、ビルドして、また起動する。これが BepInEx の開発サイクルのすべてです :PES2_Weary:。

## BepInEx でmodを作るときの厳しい現実

- **ホットリロードなし**：1行変えるたびに WorldBox を閉じ、`dotnet build` を実行し、ゲームを起動し直します。戦闘バランスや特性の数値を調整していると、すぐにうんざりします。部分的な抜け道が **[デバッグと公開](#/toolbox/bepinex-publishing)** にあります。
- **`HideManagerGameObject`**：`BepInEx/config/BepInEx.cfg` の `[Chainloader]` で `HideManagerGameObject = true` にしてください。これがないと、Unity の後片付け処理が BepInEx のルートオブジェクトを壊し、プラグインが黙って止まることがあります :PES5_Hmmmm:。
- **NMLとの共存**：NMLと BepInEx は同じゲームフォルダで仲良く動きます。コンテンツmodにはNML、UnityExplorer のような開発ツールには BepInEx と使い分けても、ケンカしません。
- **ゲームのアセットへのアクセス**：プラグインは、ゲームがアセットのライブラリ（library）を作るより前に目を覚まします。`Awake()` で `AssetManager` に触ると null が返ってきます。次のページ **[BepInEx でコンテンツを追加する](#/toolbox/bepinex-content)** で、割り込むべき正確なタイミングを説明します。
