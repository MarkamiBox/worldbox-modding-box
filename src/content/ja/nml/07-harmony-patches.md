---
title: Harmonyパッチ
group: NML Modding
subgroup: 高度な機能と公開
icon: :wbhammer:
order: 42
---

# Harmonyパッチ :wbhammer:

他のページで紹介している内容はすべて、WorldBoxに何かを**追加**するものでした（特性、武器、建物など）。HarmonyはMod開発のもう半分、すなわち**ゲームが既に行っている動作を変更する**ためのツールです。

ゲーム本体のコードを直接編集することはできません。コンパイルされて `Assembly-CSharp.dll` として提供されており、ゲームがアップデートされるたびに上書きされてしまいます。Harmonyは、ゲーム実行中に既存のメソッドへ独自のコードを割り込ませるためのライブラリです。

> [!NOTE] プログラミング自体が初めてですか？
> まず「メソッドとは何か」と「付箋のたとえ」を読み、そのあとは**ゲームコンテンツ**のページで何かを作ってみてから戻ってきてください。Harmony自体は難しくありませんが、*他の人のMod*を壊してしまう最初の原因になりやすい分野です。ゲーム自身のデータ構造を理解したあとで書いたほうが、はるかに安全なパッチが作れます :PES_Wise:。

## メソッドとは

**メソッド**とは、ゲームコード内の名前付きのアクションのことです。実際の例をいくつか挙げます：

| メソッド | ゲームが実行するタイミング |
| --- | --- |
| `Actor.updateStats()` | ユニットのステータス再計算が必要になるたび |
| `Actor.getHit(...)` | ユニットがダメージを受けるたび |
| `City.makeWarrior(...)` | 都市が市民を兵士に任命するたび |

ゲームはこれらを毎秒何千回も呼び出しています。そのすべてが、あなたがコードを割り込ませられるポイントです。

## 付箋（ポストイット）の例え

メソッドをゲームのレシピ本に書かれた1ページだと想像してください。Harmonyはそのページを書き換えるのではなく、前後に2枚の付箋を貼り付けます：

```text
┌─────────────────────────────┐
│  あなたのPREFIX             │  <- ゲーム本体のコードの「前」に実行
├─────────────────────────────┤
│  ゲーム本体のオリジナルコード │  <- そのまま無傷
├─────────────────────────────┤
│  あなたのPOSTFIX            │  <- ゲーム本体のコードの「後」に実行
└─────────────────────────────┘
```

- **Prefix** は、ゲームが処理を行う前に渡された引数を確認できます。引数を改ざんしたり、処理そのものを中断させたりできます。
- **Postfix** は、ゲームが処理を終えた後の結果を確認できます。その結果を書き換えたり、単に結果に応じて後処理を行ったりできます。

これがHarmonyの95%です。このページの残りは実践的な詳細です。

## Harmony の有効化

`OnModLoad` でたった1行呼ぶだけです。Mod内のパッチを自動検出し、見つかったものをすべて適用します：

```csharp Mods/HelloBox/Code/Main.cs
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");

            // "com.yourname.hellobox" はあなたのGUIDです。Harmonyはこれでパッチに署名するため、
            // 競合が発生した際にログを見れば誰のパッチが原因かが一目で分かります。
            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
        }
    }
}
```

`Assembly.GetExecutingAssembly()` は「自分自身のアセンブリのみ」を意味します。単なるお飾りではありません。これを省略すると `PatchAll()` は呼び出し元のアセンブリ全体を走査してしまい、運が悪いと他人のModまで巻き込みます :PESgn_Yikes:。

## 初めてのパッチ：1行ずつ解説

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPatches
    {
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Actor_UpdateStats
        {
            public static void Postfix(Actor __instance)
            {
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

ここでは6つのことが起きています：

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**：宛先指定。「`Actor` クラスの `updateStats` という名前のメソッド」。角括弧で囲まれた行は*属性 (Attribute)* であり、実行コードではなくシステムが読むラベルです。
- **`public static class Patch_Actor_UpdateStats`**：入れ物。クラス名は自由で動作には影響しませんが、将来の自分のために `Patch_<クラス名>_<メソッド名>` と名付けておくと感謝することになります。
- **`public static void Postfix(...)`**：このメソッド名は自由では**ありません**。Harmonyは `Prefix`、`Postfix`、`Finalizer` という完全一致の名前を探します。小文字で `postfix` と書くと、何のエラーも出ずに完全に無視されます :PESgn_ButWhy:。
- **`Actor __instance`**：アンダースコアが**2つ**。今まさにゲームが処理している具体的なユニットのインスタンスです。これがないと「何かのステータスが更新された」ことは分かっても「誰の」かが分かりません。
- **`if (!__instance.hasTrait(...)) return;`**：早期リターン。このパッチは世界の全ユニットに対して永久に実行され続けます。最も一般的なケースは1回の判定ですぐ `return` させてください。
- **`stats["speed"] += 20f;`**：実際の変更内容。`updateStats` は先頭でステータス辞書をクリアして再構築するため、Postfixで加算すれば毎フレーム無限に重複することなく安全に加算されます。

## 特別なパラメータ名（マジックネーム）

Harmonyはパラメータを**名前一致**で自動注入します。重要なものは以下の通りで、アンダースコアの数も名前に含まれます：

| 名前 | 得られるもの |
| --- | --- |
| `__instance` | メソッドが呼び出された対象オブジェクト。`static` メソッドの場合は存在しないため省略 |
| `__result` | メソッドの戻り値。変更したい場合は `ref` を付けます。Postfixでのみ使用可能 |
| `___someField` | アンダースコア**3つ**：対象オブジェクトのプライベートフィールド（ゲーム内の変数名と完全一致） |
| `__state` | Prefixから自分自身のPostfixへ受け渡す一時データ |
| 実引数と同じ名前 | 呼び出し元から渡された引数（ゲーム側の引数名と**完全一致**） |

最後の行は多くの人が引っかかるポイントです。もしゲーム側で `getHit(float pDamage, ...)` と宣言されている場合、こちらの引数名も `pDamage` でなければなりません。`damage` や `pDmg` では認識されません。不要な引数は省略できますが、書く場合は名前を完全に一致させてください（WorldBoxの引数はほぼ全て `p` で始まります）。

## 戻り値（結果）の変更

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    // ref は「この値を書き換えてよい」ことを意味し、書き換えた値が呼び出し元に返されます。
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;

        __result *= 1.5f;
    }
}
```

代入ではなく調整をしてください。`__result *= 1.5f` なら他のModが同じメソッドをパッチしていても共存できます。`__result = 12f` と直接代入してしまうと他人のパッチ成果を握りつぶすことになり、コメント欄で喧嘩が始まります。

## ゲームがハードコードした数値を変える

「〜なModを作れる人いませんか」の半分は、単に1つの数字の話です。「都市が大きくなりすぎる」はまさにこれで、ゲーム自身の `City` クラスから直接：

```csharp Assembly-CSharp / City
public int getZoneRange(bool pAllowCheat = true)
{
    if (pAllowCheat && DebugConfig.isOn(DebugOption.CityUnlimitedZoneRange))
    {
        return 999;
    }
    return 13;
}
```

定数を返すだけのメソッドは、ゲーム内で最も簡単にパッチできる対象です。定数そのものには触らず、出てくる値を調整します：

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBox
{
    [HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
    public static class Patch_City_ZoneRange
    {
        private const float SCALE = 0.5f;   // 都市を半分の大きさに

        public static void Postfix(ref int __result)
        {
            // 999はデバッグの「無制限ゾーン範囲」スイッチ。プレイヤーのチート設定を邪魔しない
            if (__result == 999) return;

            __result = Mathf.Max(1, Mathf.RoundToInt(__result * SCALE));
        }
    }
}
```

`SCALE` を **[Mod設定](#/nml/mod-config)** のスライダーに繋げれば、プレイヤー自身が調整できます。

本当に大変なのはメソッドを見つける作業です。ゲーム内で見た数値（13ゾーン、武器2つ、5年）や、ルールに出てくる名詞（"zone"、"limit"、"max"）を **dnSpy** で検索してください。小さなメソッドの中の定数ならPostfixで対応できます。長いメソッドの途中に埋め込まれた定数にはtranspilerが必要で、それはこのページの範囲外です :PES2_Shrug:。

## 元のメソッドのキャンセル

`bool` を返すPrefixは、ゲーム本体のオリジナルコードを実行するかどうかを決定できます：

```csharp
[HarmonyPatch(typeof(Actor), "getHit")]
public static class Patch_Actor_GetHit
{
    public static bool Prefix(Actor __instance, float pDamage)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return true;

        // false = ゲーム本来の getHit 処理を丸ごとスキップ。ユニットは一切ダメージを受けない。
        return false;
    }
}
```

ガード条件の構造に注目してください。特別な条件のときだけ `false` を返し、**それ以外のすべてのケースでは `true` を返します**。この `return true` を忘れると、世界中のあらゆるダメージ判定が消滅します。

> [!WARNING] `return false` は最終手段です
> スキップされるのは*あなたの*処理だけではありません。ゲーム本体のコード、そしてそのメソッドに対する他のModのPrefixやPostfixを含め、**全員の処理**がスキップされます。バニラのメソッドは目に見えない裏処理をいくつも抱えていることが多く、キャンセルするとそれらもすべて道連れになります。
>
> `return false` を書く前に、Postfixで代用できないか検討してください。「受けたダメージを直後に回復する」ほうが、「ダメージ判定そのものを消滅させる」よりはるかに安全です :PES3_Balance:。

## メソッド名の2つの書き方

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // public メソッド
[HarmonyPatch(typeof(Actor), "updateStats")]             // それ以外すべて
```

`nameof` のほうがタイポ時にコンパイルエラーになるため優れています（文字列だとパッチが静かに無視されるだけになります）。しかし `nameof` は自分のコードから参照できるメンバにしか使えず、WorldBoxの大半は `internal` や `private` です。それらに対しては文字列指定しかありませんので、**[ゲームコードを読む](#/toolbox/reading-the-game-code)** で正確な綴りを確認してください。

## 同名のメソッドが存在する場合（オーバーロード）

同名のオーバーロードが存在する場合、クラス名＋メソッド名だけでは曖昧になりHarmonyは推測を拒否します。引数の型を明記してください：

```csharp
[HarmonyPatch(typeof(World), "GetTile", new System.Type[] { typeof(int), typeof(int) })]
```

## 前処理と後処理の両方が必要なパッチ

`__state` は、同一呼び出し内でPrefixからPostfixへ値を手渡すための仕組みです。ゲームが数値を処理する前の状態を記録しておくのに使います：

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_StatDelta
{
    public static void Prefix(Actor __instance, out float __state)
    {
        __state = __instance.stats["health"];
    }

    public static void Postfix(Actor __instance, float __state)
    {
        if (__instance.stats["health"] < __state) { /* 体力が削られた */ }
    }
}
```

## 動かないときの対処法

| 現象 | よくある原因 |
| --- | --- |
| 何も起きず、ログにも出ない | `Postfix` の綴り間違い、または `PatchAll` を呼んでいない |
| 起動時に `HarmonyException` / `MissingMethodException` | クラス名またはメソッド名が存在しない。dnSpyで確認 |
| `Ambiguous match found` | 複数のオーバーロードが存在する。上記の `Type[]` 引数を追加 |
| パッチ内で `NullReferenceException` | `__instance` やそのフィールドが null。パッチはロード中や死亡時、破棄処理中など通常プレイで見ない状態でも実行される |
| ゲームが3 FPSまで激重になる | 毎秒数千回呼ばれるメソッドに重い処理を仕込んでいる |
| 単体では動くが他Modと競合する | どちらかが `false` を返しているか、`__result` に直接代入している |

## 互換性を保つためのルール

- **基本はPostfixを使う。** 引数を変えたい場合や処理を中断したい場合のみPrefixを使う。
- **代入ではなく調整する。** `+=` や `*=`、`Math.Min` を使う。他のModもそこをパッチしています。
- **常にnullチェックを入れる。** パッチはワールドのロード中やユニットの死亡時にも走ります。
- **軽い判定を一番上に置く。** 頻繁に呼ばれるパッチの1行目は、すぐに `return` できる条件式にしてください。
- **目的に対して最も狭いメソッドをパッチする。** 特性の移動速度のために `Actor.updateStats` をパッチするのは健全です。同じことのためにワールド全体の更新ループをパッチするとModをアンインストールされます。
- **パッチは1つのファイルにまとめる。** 競合報告が上がってきたとき、調べたいのは12個のファイルではなく1個のファイルです。

> [!NOTE] ライブラリの `has`、`get`、`add`、`clone`、`post_init` へのパッチは意味がありません
> 影響するのは自分のModがロードされた後に行われる呼び出しだけで、その時点で既に完了しているバニラの登録処理には一切影響しません。**[アセットライブラリ](#/nml/asset-libraries)** を参照。

## ここでは扱わない内容

**Transpiler** は、メソッドのコンパイル済みIL命令を1命令ずつ直接書き換える仕組みです。極めて強力で、外側に公開されていないメソッド内部の定数をいじる唯一の方法ですが、ゲームのアップデートのたびにほぼ確実に壊れます。これが必要になるレベルに達したなら、もはやこのページを読む必要はないでしょう :PES5_BigBrain:。
