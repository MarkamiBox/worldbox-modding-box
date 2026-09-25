---
title: 他のMod
group: NML Modding
subgroup: 高度な機能と公開
icon: :wbmodders:
order: 45
---

# 他のMod :wbmodders:

あなたのModは空っぽの世界に住んでいるわけではありません。プレイヤーはHelloBoxを他の20個のModと一緒にインストールするかもしれず、その半分は戦闘を変更したり、世界の法則をいじったり、新しい特性を追加したりしようとしています。

時には他のModと協調したいこともあるでしょう。パートナーModがインストールされていれば追加機能を有効にする、存在しなくてもクラッシュしないように相手のメソッドを安全にパッチする、あるいは自分のアセットが正しい順序で登録されるようにする、といった具合です。

他のModと対話する方法は2つあります。コンパイル時に `mod.json` を通じて行う方法と、実行時にコードを通じて行う方法です。

## mod.json で依存関係を宣言する

最もクリーンな連携方法は、`mod.json` にその関係性を宣言することです。

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "Markami",
  "version": "1.0.0",
  "description": "My first mod",
  "iconPath": "icon.png",
  "GUID": "com.markami.hellobox",
  "Dependencies": [],
  "OptionalDependencies": [
    "com.friend.coolmod"
  ],
  "IncompatibleWith": []
}
```

| キー | 説明 |
| --- | --- |
| `Dependencies` | 必須の依存関係。NMLはこれらのModが自分のModより**先に**読み込まれることを保証します。いずれかが見つからない、またはコンパイルに失敗した場合、NMLはあなたのModそのものを読み込みません |
| `OptionalDependencies` | 任意の依存関係。相手のModがインストールされていれば、NMLはそれをあなたのModより先に読み込み、**さらに**コンパイラシンボルを定義します。見つからなくても、あなたのModは通常どおり読み込まれます |
| `IncompatibleWith` | ブロックリスト。このリストに含まれるModが存在する場合、NMLは競合として検知し、両方が同時に動くのを止めます |

### コンパイル時の #if シンボル

`OptionalDependencies` に記載されたModがインストールされてコンパイルされると、NMLはあなたのために前処理定数を定義します。

シンボルは相手のModのGUIDを大文字に変換し、英数字以外の文字をすべてアンダースコアに置き換えたものです。

| `mod.json` のGUID | 定義されるコンパイラシンボル |
| --- | --- |
| `com.friend.coolmod` | `COM_FRIEND_COOLMOD` |
| `com.author.magic-items` | `COM_AUTHOR_MAGIC_ITEMS` |

連携コードは `#if` で囲みます。

```csharp Mods/HelloBox/Code/HelloIntegration.cs
namespace HelloBox
{
    public static class HelloIntegration
    {
        public static void Initialize()
        {
#if COM_FRIEND_COOLMOD
            // そのModが存在し、有効な場合のみコンパイルされる
            ApplyCoolModSynergy();
#endif
        }

#if COM_FRIEND_COOLMOD
        private static void ApplyCoolModSynergy()
        {
            // ここでは相手の型を直接参照しても安全
            Main.Log("CoolMod found! Enabling partner synergies.");
        }
#endif
    }
}
```

> [!WARNING] シンボルのスペルミスは無言で失敗する
> `#if COM_FRIEND_COOLMOD` の代わりに `#if COM_FRIEND_COOL_MOD` と書いてしまうと、コンパイラは未定義のシンボルと見なし、そのコードブロックを黙って取り除きます。ログにエラーも警告も一切出ないまま、そのコードは永遠に実行されません :PES4_1IQ:。GUIDの変換結果は必ず二重チェックしてください。

## 実行時にチェックする

`#if` の仕組みは、NMLがあなたのModをソースからコンパイルし、かつ相手のModが `OptionalDependencies` に宣言されている場合にしか機能しません。

コンパイル済みの `.dll` として配布する場合や、再コンパイルなしで動的にModの有無を調べたい場合は、実行時にチェックします。

### 読み込まれたアセンブリを調べる

相手のModのアセンブリが現在の `AppDomain` に読み込まれているかどうかを調べられます。

```csharp
using System;
using System.Linq;

public static bool IsModLoaded(string pAssemblyName)
{
    return AppDomain.CurrentDomain.GetAssemblies()
        .Any(a => string.Equals(a.GetName().Name, pAssemblyName, StringComparison.OrdinalIgnoreCase));
}
```

あるいはHarmonyの `AccessTools` に、相手のクラスが存在するかどうかを尋ねる方法もあります。

```csharp
using HarmonyLib;

bool hasPartner = AccessTools.TypeByName("PartnerNamespace.PartnerMain") != null;
```

`AccessTools.TypeByName` がnullでない `Type` を返せば、相手のコードは読み込まれて使える状態にあります。

## 他のModをHarmonyでパッチする

バニラのメソッドをパッチするのは簡単です。しかし他のModの中にあるメソッドをパッチするには、1つ大きな落とし穴があります :wbfacepalm:。

相手の型を参照する普通のパッチクラスをこう書いてしまうと、

```csharp
// 任意依存のModに対して絶対にこれをやってはいけない！
[HarmonyPatch(typeof(PartnerMod.SomeClass), "SomeMethod")]
public static class BadCrossModPatch
{
    public static void Postfix() { }
}
```

Monoランタイムは、このパッチクラスを読み込んだ瞬間に `PartnerMod.SomeClass` の解決を試みます。プレイヤーがそのModを持っていなければ、あなたの `Initialize()` が終わる前に、Mod全体が `TypeLoadException` や `FileNotFoundException` でクラッシュします！

代わりに、`AccessTools` を使って**手動で**パッチしてください。

```csharp Mods/HelloBox/Code/HelloCrossPatch.cs
using System;
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCrossPatch
    {
        public static void ApplyIfPresent(Harmony pPatchEngine)
        {
            Type targetType = AccessTools.TypeByName("PartnerMod.SomeClass");
            if (targetType == null)
            {
                // 相手のModはインストールされていない。静かにスキップする
                return;
            }

            MethodInfo targetMethod = AccessTools.Method(targetType, "SomeMethod");
            if (targetMethod == null)
            {
                Main.LogWarning("PartnerMod found, but SomeMethod was not found. Outdated version?");
                return;
            }

            MethodInfo postfix = typeof(HelloCrossPatch).GetMethod(nameof(Postfix), BindingFlags.Static | BindingFlags.NonPublic);
            pPatchEngine.Patch(targetMethod, postfix: new HarmonyMethod(postfix));
            Main.Log("Successfully hooked PartnerMod.SomeMethod!");
        }

        private static void Postfix()
        {
            // 相手のメソッドの後、相手のModがインストールされている場合のみ実行される
        }
    }
}
```

手動パッチは型の参照を文字列ベースに保つため、ランタイムは存在しないアセンブリを読み込もうとすることが決してありません。

## 読み込み順序の罠

他のModのコンテンツをクローンまたは参照するとき、タイミングがすべてです。

```csharp
// 相手のModがまだ Initialize() を実行していなければ、NullReferenceException が発生する！
AssetManager.traits.clone("hello_super_trait", "partner_custom_trait");
```

NMLは依存関係の順にModを読み込みます。相手のModを `Dependencies` か `OptionalDependencies` に入れておけば、NMLは相手の `Initialize()` があなたのものより**先に**実行されることを保証します。

依存関係として宣言していない場合、Mod間の読み込み順序は不定です。常に以下を守ってください。
1. 相手のModを `OptionalDependencies` に宣言する。
2. クローンや参照の前に `AssetManager.traits.has(...)` などでガードする。

## 競合しないデータ共有

WorldBoxは、アクター用（`actor.data`）とワールド用（`World.world.map_stats.custom_data`）に、自由に使えるカスタムデータ用の辞書を提供しています。

すべてのModがこれら同じ辞書を共有しています。もしこう書いてしまうと、

```csharp
// 悪い例: 他のModも "level" を使っているかもしれない
actor.data.set("level", 5);
```

別のModが同じフレームで `"level"` にまったく異なる前提で書き込むかもしれません。

カスタムデータのキーには、必ず自分のModのプレフィックスを付けて名前空間を分けてください。

```csharp
actor.data.set("hello_level", 5);
int myLevel = actor.data.get("hello_level", 0);
```

次は: **[Modの公開](#/nml/publishing)**、またはシミュレーション速度とオプションを扱う **[ゲームオプションと時間スケール](#/nml/game-options)** へ。
