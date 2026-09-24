---
title: BepInEx Mod開発
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# BepInEx Mod開発 :PES5_BigBrain:

本ガイドの大半では **NeoModLoader** 向けModの作成方法を解説しています。NMLを使用すればメモ帳で `.cs` ファイルを直接編集し、ゲーム起動時に自動コンパイルさせることができます。

しかし BepInEx に甘えは通用しません :PES2_Shrug:。これはUnityにおける老舗の汎用Modフレームワークです。BepInEx Modを開発するには正規のC#プロジェクトを構築し、自前で `.dll` をビルドして `BepInEx/plugins/` に配置する必要があります。ホットリロードや便利なアセット支援APIは失われますが、ゲームが起動する前のMonoランタイム段階からUnityプロセス全体を掌握できます。

## BepInEx と NeoModLoader の比較

ビルド環境構築に半日費やす前に、用途に合った適切なツールを選択してください：

| 実現したいこと | 選択肢 | 理由 |
| --- | --- | --- |
| 特性（trait）、アイテム、神の力、生物、バイオームの追加 | **NML** | `AssetManager`、多言語テキスト、スプライト、セーブデータ連携を標準装備 |
| 開発ツール、UIオーバーレイ、エンジン低レベルHookの作成 | **BepInEx** | WorldBoxの初期化前にMonoランタイム層で起動 |
| メモ帳だけでコードを編集して即座に反映 | **NML** | NMLが実行時にC#ソースコードを自動コンパイル |
| 素のUnityコンポーネントを含む事前ビルド済みバイナリの配布 | **BepInEx** | コンパイラ設定、依存関係、ビルドターゲットを完全に制御可能 |

ゲーム内コンテンツの追加が目的であれば、NML Modを作成してください。UnityExplorerのようなツール開発であれば、BepInExが最適です。

## 1. 事前準備

1. **[リアルタイムコンソール (BepInEx)](#/toolbox/bepinex-console)** の手順に従い **BepInEx 5 (Mono x64)** を導入し、コンソールを有効化します。
2. **[.NET SDK](https://dotnet.microsoft.com/)**（またはVisual Studio）をインストールします。プラグインのビルドには正規のC#コンパイラが必要です。

## 2. プロジェクトの作成と設定

ターミナルを開き、新しいクラスライブラリを作成します：

```bash
dotnet new classlib -n HelloBepInEx -f net472
cd HelloBepInEx
```

`HelloBepInEx.csproj` を開き、ゲーム本体およびBepInExのアセンブリへの参照を追加します：

```xml HelloBepInEx.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>HelloBepInEx</AssemblyName>
    <Version>1.0.0</Version>
    <LangVersion>latest</LangVersion>
  </PropertyGroup>

  <ItemGroup>
    <!-- Game assemblies from worldbox_Data/Managed -->
    <Reference Include="Assembly-CSharp">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\Assembly-CSharp.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="UnityEngine">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\UnityEngine.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="UnityEngine.CoreModule">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\UnityEngine.CoreModule.dll</HintPath>
      <Private>false</Private>
    </Reference>

    <!-- BepInEx and Harmony from BepInEx/core -->
    <Reference Include="BepInEx">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\core\BepInEx.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="0Harmony">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\core\0Harmony.dll</HintPath>
      <Private>false</Private>
    </Reference>
  </ItemGroup>
</Project>
```

Steamライブラリのドライブ構成に応じてパスを調整してください。`<Private>false</Private>` を指定することで、Unityエンジン本体の巨大ファイル群が出力フォルダへ重複コピーされるのを防止します :PESgn_SMH:.

## 3. プラグインの基本構造

BepInExプラグインは `BaseUnityPlugin` を継承し、`[BepInPlugin]` 属性を付与したクラスとして実装します：

```csharp Plugin.cs
using BepInEx;
using BepInEx.Configuration;
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [BepInPlugin(PLUGIN_GUID, PLUGIN_NAME, PLUGIN_VERSION)]
    public class HelloPlugin : BaseUnityPlugin
    {
        public const string PLUGIN_GUID = "com.example.hellobepinex";
        public const string PLUGIN_NAME = "HelloBepInEx";
        public const string PLUGIN_VERSION = "1.0.0";

        private ConfigEntry<bool> configEnableLogs;
        private ConfigEntry<KeyCode> configHotkey;

        private void Awake()
        {
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

            Harmony harmony = new Harmony(PLUGIN_GUID);
            harmony.PatchAll();
        }

        private void Update()
        {
            if (Input.GetKeyDown(configHotkey.Value))
            {
                Logger.LogInfo("Hotkey pressed from BepInEx!");
            }
        }
    }
}
```

### 主要コンポーネントの解説

- **`BaseUnityPlugin`**: Unityの `MonoBehaviour` を直接継承します。シーン遷移時にも破棄されない常駐型 `GameObject` 上で動作します。
- **`[BepInPlugin(guid, name, version)]`**: Modの名前と一意のGUIDを登録します（例: `com.author.modname`）。
- **`Logger.LogInfo()`**: BepInExコンソール画面および `BepInEx/LogOutput.log` にログを出力します。
- **`Config.Bind()`**: 型付き設定項目をバインドします。初回起動時に `BepInEx/config/com.example.hellobepinex.cfg` 設定ファイルが自動生成されます。

## 4. Harmonyによるゲーム処理のフック

BepInExには `BepInEx/core/0Harmony.dll` が同梱されています。プロジェクト内にパッチクラスを作成します：

```csharp Patches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [HarmonyPatch(typeof(World), nameof(World.init))]
    public static class WorldInitPatch
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            Debug.Log("[HelloBepInEx] World initialized from BepInEx patch!");
        }
    }
}
```

`Plugin.cs` 内で `harmony.PatchAll()` が呼び出されているため、ビルドされたアセンブリ内のパッチ属性が起動時に一括適用されます。

## 5. ビルドと配置

コマンドラインからプロジェクトをビルドします：

```bash
dotnet build -c Release
```

コンパイルされた `.dll` は `bin/Release/net472/HelloBepInEx.dll` に作られます。

1. WorldBoxのフォルダーを開きます：`C:\Program Files (x86)\Steam\steamapps\common\worldbox\`。
2. `BepInEx/plugins/` の中に `HelloBepInEx` という名前のフォルダーを作ります。
3. `HelloBepInEx.dll` を `BepInEx/plugins/HelloBepInEx/` にコピーします。

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

コンソールを有効にしてゲームを起動します。BepInExがあなたのアセンブリを見つけて読み込むのが見えます：

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

## BepInEx開発における厳しい現実

- **ホットリロード非対応**: コードを1行変更するたびにゲームを終了し、`dotnet build` を実行して再起動する必要があります。
- **`HideManagerGameObject`**: `BepInEx/config/BepInEx.cfg` 内で `HideManagerGameObject = true` が有効になっていることを確認してください。無効の場合、Unityのクリーンアップ処理によりBepInExオブジェクトが破棄される恐れがあります :PES5_Hmmmm:。
- **NMLとの共存**: NMLとBepInExは競合することなく同一のゲームディレクトリで完全に共存できます。
- **ゲーム内アセットへのアクセス**: BepInExは素のUnityレイヤーで動作します。WorldBox内のオブジェクトを操作する場合は、`AssetManager` の初期化完了を待機するか `NeoModLoader.dll` を参照してください。
