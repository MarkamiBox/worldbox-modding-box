---
title: Harmonyパッチ
group: NML Modding
subgroup: 高度な機能と公開
icon: :wbhammer:
order: 42
---

# Harmonyパッチ :wbhammer:

他のページで紹介している内容はすべて、WorldBoxに何かを**追加**するものでした（特性（trait）、武器、建物（building）など）。HarmonyはMod開発のもう半分、すなわち**ゲームが既に行っている動作を変更する**ためのツールです。

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
                if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

ここでは6つのことが起きています：

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**：住所です。「`Actor` というクラスの、`updateStats` というメソッド」。角括弧の行は*属性*で、実行されるコードではなく、コンピューターが読むラベルです。
- **`public static class Patch_Actor_UpdateStats`**：入れ物です。名前は自由で何も変わりませんが、`Patch_<Class>_<Method>` にしておくと未来の自分が感謝します。
- **`public static void Postfix(...)`**：ラベルを付けない限り、この名前は自由では**ありません**。ラベルがない場合、Harmonyは正確に `Prefix`、`Postfix`、`Finalizer` という名前のメソッドを探します。`postfix` と書くと何も起きず、エラーすら出ません :PESgn_ButWhy:。解決策はラベルを付けることで、後述の「パッチメソッドに自分で名前を付ける」で説明します。
- **`Actor __instance`**：アンダースコアは**2つ**。ゲームが今まさに処理している特定のユニットです。これがないと、ユニットのステータスが再計算された*こと*は分かっても、*誰の*かは分かりません。
- **`if (!__instance.hasTrait(...)) return;`**：早めに抜けましょう。このパッチはワールドのすべてのユニットで、永遠に実行されます。よくあるケースは1回のチェックと `return` で済ませます。
- **`stats["speed"] += 20f;`**：実際の変更です。`updateStats` は最初にステータスブロックを消して作り直すので、Postfixでの加算は毎ティック積み重なるのではなく、まっさらな状態に乗ります。

> [!DANGER] `updateStats` はメインスレッドで動かない
> ゲームはこれを**並列**ジョブとして登録しています（`createJob(out c_stats_dirty, updateStats, JobType.Parallel, ...)`、そして `Config.parallel_jobs_updater` はデフォルトで `true`）。つまりあなたのPostfixはワーカースレッド上で、多数のユニットに対して同時に実行されます。中では**そのユニット自身の数値だけ**に触れてください。Unity（`Time.time`、`transform`、`Destroy`、`Resources.Load`）やゲームの乱数ヘルパー `Randy` を呼んだり、自分の共有リストに書き込んだりすると、他人のPCでだけ起きるクラッシュになります。
>
> それらが必要なら、ユニットをキューに入れて、自分の `Update()` で処理してください：
> ```csharp
> public static readonly System.Collections.Concurrent.ConcurrentQueue<Actor> pending = new();
>
> public static void Postfix(Actor __instance)
> {
>     if (!__instance.hasTrait(HelloTraits.GIGACHAD)) return;
>     __instance.stats["speed"] += 20f;   // this unit's own data: fine
>     pending.Enqueue(__instance);        // everything else waits for the main thread
> }
> ```

## 特別なパラメータ名（マジックネーム）

Harmonyはパラメータを**名前一致**で自動注入します。重要なものは以下の通りで、アンダースコアの数も名前に含まれます：

| 名前 | 得られるもの |
| --- | --- |
| `__instance` | メソッドが呼び出された対象オブジェクト。`static` メソッドの場合は存在しないため省略 |
| `__result` | メソッドの戻り値。変更したい場合は `ref` を付けます。Postfixでのみ使用可能 |
| `___someField` | アンダースコア**3つ**：対象オブジェクトのプライベートフィールド（ゲーム内の変数名と完全一致） |
| `__state` | Prefixから自分自身のPostfixへ受け渡す一時データ |
| 実引数と同じ名前 | 呼び出し元から渡された引数（ゲーム側の引数名と**完全一致**） |

最後の行は多くの人が何度も何度も引っかかるポイントです。もしゲーム側で `getHit(float pDamage, ...)` と宣言されている場合、こちらの引数名も `pDamage` でなければなりません。`damage` や `pDmg` では認識されません。不要な引数は省略できますが、書く場合は名前を完全に一致させてください（WorldBoxの引数はほぼ全て `p` で始まります）。

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

「〜なModを作れる人いませんか」の半分は、単に1つの数字の話です。不可能なことなんてありません、まだ誰も作っていないだけです :wbbru:。「都市が大きくなりすぎる」はまさにこれで、ゲーム自身の `City` クラスから直接：

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
> スキップされるのは*あなたの*処理だけではありません。ゲーム本体のコードが**全員に対して**スキップされます。そのメソッドに対する他のModのPostfixは、それでも実行され続け、実際には起きなかった呼び出しに反応することになります。バニラのメソッドは目に見えない裏処理をいくつも抱えていることが多く、キャンセルするとそれらもすべて道連れになります。
>
> `return false` を書く前に、Postfixで代用できないか検討してください。「受けたダメージを直後に回復する」ほうが、「ダメージ判定そのものを消滅させる」よりはるかに安全です :PES3_Balance:。

## メソッド名の2つの書き方

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // public メソッド
[HarmonyPatch(typeof(Actor), "updateStats")]             // それ以外すべて
```

`nameof` のほうがタイポ時にコンパイルエラーになるため優れています（文字列だとパッチが静かに無視されるだけになります）。しかし `nameof` は自分のコードから参照できるメンバにしか使えず、WorldBoxの大半は `internal` や `private` です。それらに対しては文字列指定しかありませんので、**[ゲームコードを読む](#/toolbox/reading-the-game-code)** で正確な綴りを確認してください。

## パッチメソッドに自分で名前を付ける

マジックネームである `Prefix` と `Postfix` は、あくまで規約であって必須ではありません。メソッドにラベルを付ければ、好きな名前を使えます：

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_UpdateStats
{
    [HarmonyPostfix]
    public static void AddSwiftSpeed(Actor __instance)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;
        __instance.stats["speed"] += 20f;
    }
}
```

`[HarmonyPrefix]`、`[HarmonyPostfix]`、`[HarmonyFinalizer]` がそれぞれ存在します。ラベルさえ付けておけば、メソッド名は完全に自由になり、「`Postfix` の綴りを間違えて何も起きない」問題が消えます。また、1つのクラスの中で別々の対象に対するPrefixとPostfixを、名前を衝突させずに共存させられます。世に出ているModの約半分はこの書き方をしていて、その半分は小文字の `p` に丸一晩を溶かすことがありません。

## 同名のメソッドが存在する場合（オーバーロード）

同名のオーバーロードが存在する場合、クラス名＋メソッド名だけでは曖昧になります。Harmonyは推測を拒否し、あなたのModは起動時に `AmbiguousMatchException` で落ちます。`Actor` には `addTrait` メソッドが2つあります：

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool addTrait(ActorTrait pTrait, bool pRemoveOpposites = false)
```

意図する方の引数の型を、デフォルト値を持つものも含めて**すべて**書き出してください：

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.addTrait), new System.Type[] { typeof(string), typeof(bool) })]
```

このほかに人がよく引っかかる実在のオーバーロードとして、`TileZone.isGoodForNewCity()` と `isGoodForNewCity(Actor pActor)`、そして `SaveManager.loadWorld()` と `loadWorld(string pPath, bool pLoadWorkshop = false)` があります（どちらも `internal` なので文字列指定のみ）。迷ったら、属性を書く前にそのクラスをメソッド名で検索してください。

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

## プロパティとコンストラクタ

すべてが単純なメソッドというわけではありません。`Actor.is_moving` はプロパティで、見た目はフィールドですが、読み取るたびに `get` ブロックが実行されます。Harmonyにどちらを狙うか伝えてください：

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.is_moving), MethodType.Getter)]
```

そのあとは通常のパッチと同じで、`ref bool __result` が読み取り側への戻り値になります。`MethodType.Setter` はもう片方です。`MethodType.Constructor` はクラスのコンストラクタにパッチを当て、`__instance` は今まさに構築中のオブジェクトになります。クラスに複数のコンストラクタがある場合は、オーバーロードのときと同様に `Type[]` を続けて指定してください。

## プライベートなフィールドとメソッド

`__instance` のプライベートフィールドは、パラメータとして要求することで参照できます。アンダースコア**3つ**の後にゲームが綴るとおりのフィールド名を続けます。ゲームはほとんどのプライベートフィールドを自前の `_` で始めるため、ユニットの `_hover_timer` は**4つ**のアンダースコアになります：

```csharp
public static void Postfix(Actor __instance, ref float ____hover_timer)
```

書き込みたい場合は `ref` を付けます。読みづらいですが、これで完全に正しい書き方です。

パッチの外側では、`HarmonyLib` に含まれる `AccessTools` と `Traverse` で同じものにアクセスできます：

```csharp
// たまにしか使わないなら: Traverse は短く書けますが遅いです
float timer = Traverse.Create(pActor).Field("_hover_timer").GetValue<float>();

// 毎フレーム使うなら: アクセサを一度だけ作れば、通常のフィールドとほぼ同じ速さになります
static readonly AccessTools.FieldRef<Actor, float> hover_timer = AccessTools.FieldRefAccess<Actor, float>("_hover_timer");
hover_timer(pActor) = 0f;   // it is a ref, so this writes

// プライベートメソッド: リフレクションはデフォルト値も含めてすべての引数を要求します
AccessTools.Method(typeof(Actor), "die").Invoke(pActor, new object[] { false, AttackType.Other, true, true });
```

文字列で指定したものはコンパイラがチェックできません。アップデートで `_hover_timer` の名前が変わっても、実行時になるまで気づけません。代替手段は**公開化（publicized）**した `Assembly-CSharp.dll` を使うことです。これなら `internal` や `private` も見えるようになり、名前変更は再びコンパイルエラーとして検出できます。

## 手動でのパッチ適用

`[HarmonyPatch]` と `PatchAll` の組み合わせが簡単な方法です。もう1つの方法は、自分でメソッドを探して `Patch` を呼び出すことです：

```csharp Mods/HelloBox/Code/HelloManualPatches.cs
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloManualPatches
    {
        private static readonly Harmony harmony = new Harmony("com.yourname.hellobox");

        public static void Initialize()
        {
            // two addTrait overloads exist, so the types are not optional
            MethodInfo original = AccessTools.Method(typeof(Actor), nameof(Actor.addTrait), new[] { typeof(string), typeof(bool) });

            // null means an update renamed it: lose one feature, not the whole mod
            if (original == null)
            {
                Main.LogWarning("Actor.addTrait(string, bool) not found, skipping that patch");
                return;
            }

            harmony.Patch(original, postfix: new HarmonyMethod(typeof(HelloManualPatches), nameof(AddTraitPostfix)));
        }

        public static void AddTraitPostfix(Actor __instance, string pTraitID, bool __result)
        {
            // __result is false when the unit already had it or an opposite blocked it
            if (!__result || pTraitID != HelloTraits.SWIFT) return;

            Main.LogInfo("Another unit got swift");
        }
    }
}
```

`PatchAll` と同じHarmony ID、同じパラメータ名のルールが使えます。得られるものは、途中に挟める `if` です。次のような場面で使ってください：

- **対象が存在しないかもしれない場合。** 次のアップデートで移動しそうなメソッドや、*別のMod*の中にあるメソッドです。`AccessTools.TypeByName("TheirNamespace.TheirClass")` はそのModが入っていなければ `null` を返すので、単にパッチをスキップすればよいだけです。**[他のModとの連携](#/nml/other-mods)** を参照してください。
- **パッチが設定に依存する場合。** プレイヤーが **[Mod設定](#/nml/mod-config)** でその機能をオンにした場合のみパッチを当てます。
- **成功したかどうかを知りたい場合。** `PatchAll` の対象が見つからなければ例外が投げられ、まだ到達していなかった残りのパッチは一切適用されません。この方法なら、メソッドが1つ見つからないだけでログが1行出るだけで済みます。

## 複数のModが同じメソッドにパッチを当てる場合

各パッチ種別の中で、Harmonyは優先度順（**高いものが先**）にパッチを並べます。デフォルトは `Normal` です。明示的な `[HarmonyBefore]` と `[HarmonyAfter]` の依存関係でこの順序を変えられます：

```csharp
[HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
public static class Patch_City_ZoneRange
{
    [HarmonyPostfix]
    [HarmonyPriority(Priority.Last)]
    public static void HalveZones(ref int __result) { /* ... */ }
}
```

よく使う優先度は `First`、`High`、`Normal`、`Low`、`Last` です。順序が結果を左右するのは次のような場合です：

- 結果を**クランプ（上限・下限に丸める）**Postfix（例：`Mathf.Min(__result, 20)`）は `Priority.Last` を指定したくなります。これにより通常はより高い優先度のPostfixの後にクランプされます。ただし、別の `Last` 指定のパッチや明示的な順序依存に対して、必ず最後になることを保証するものではありません。
- 何かを**チェック**して `return false` するかもしれないPrefixは `Priority.First` や `High` を指定したくなります。これは早い段階で判断を下すためです。ただし、他のPrefixが必ずスキップされる保証として使わないでください。NMLはHarmonyXを同梱しており、[あるPrefixが `false` を返しても全てのPrefixを実行します](https://github.com/BepInEx/HarmonyX/wiki/Prefix-changes)。

理由があるときだけ設定してください。全員が `First` を要求すれば、結局誰も先頭にはなりません :PES3_Balance:。

## Finalizer：ゲームが投げた例外を受け止める

Finalizerは、**メソッドが例外を投げた場合でも**、すべての最後に実行されます。例外を受け取り、そこから返した値がそのまま投げ直されます：

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.setAttackTarget))]
public static class Patch_Actor_SetAttackTarget_Log
{
    public static System.Exception Finalizer(System.Exception __exception)
    {
        if (__exception != null) Main.LogError("setAttackTarget threw: " + __exception);

        // preserve the failure after logging it
        return __exception;
    }
}
```

これは失敗を隠さずにログに残すやり方です。`null` を返すと例外は握りつぶされ、他のパッチからの失敗も含めて表に出なくなります。それをしてよいのは、実際に回復できる具体的な失敗に対してだけです。メソッドが途中で例外を投げたということは、すでに仕事を半分終えている可能性が高く、例外を握りつぶすとワールドはその中途半端な状態のまま残ります :PESgn_Yikes:。

## Modが最もよくパッチを当てるメソッド

私が目を通してきたModの中で、繰り返し登場するのがこれらです。シグネチャはゲームのコードそのままです。

| 対象 | 知っておくべきこと |
| --- | --- |
| `City.update(float pElapsed)` | Public。すべての都市について毎フレーム実行されます。まず安いチェックを |
| `MapBox.Update()` | **Private**なので `"Update"` を文字列指定。毎フレーム1回実行されます。パッチを当てる前に **[アップデートループ](#/nml/update-loops)** を参照してください |
| `Actor.updateStats()` | **Internal**。並列ジョブで実行されます。ページ冒頭の警告を参照してください |
| `Actor.getHit(float pDamage, bool pFlash, AttackType pAttackType, BaseSimObject pAttacker = null, ...)` | **Internal**。すべてのユニットへのすべての攻撃で呼ばれます |
| `Actor.die(bool pDestroy = false, AttackType pType = AttackType.Other, bool pCountDeath = true, bool pLogFavorite = true)` | **Private**、`"die"` を文字列指定 |
| `Actor.setAttackTarget(BaseSimObject pAttackTarget)` | Public |
| `ItemCrafting.tryToCraftRandomWeapon(Actor pActor, City pCity)` | Public static、`bool` を返します。`__instance` はありません |
| `DiplomacyManager.startWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pAsset, bool pLog = true)` | **Internal**、`War` を返します |
| `WarManager.newWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pType)` | Public、`War` を返します |
| `Kingdom.setKing(Actor pActor, bool pFromLoad = false)` | Public。セーブの読み込み中にも実行されるので `pFromLoad` を確認してください |
| `City.setLeader(Actor pActor, bool pNew)` | Public |
| `BabyMaker.makeBaby(Actor pParent1, Actor pParent2, ...)` | Public static、生まれた赤ちゃんを返します |
| `ActorManager.createNewUnit(string pStatsID, WorldTile pTile, ...)` | Public、新しい `Actor` を返します。すべてのスポーンがここを通ります |

`private` や `internal` の対象にも文字列指定でパッチを当てられ、パラメータは名前による束縛のままです。公開化されたアセンブリなしにできないのは、それらに対して `nameof(...)` を書くことと、パッチの本体の中でそれらの `internal` メンバに触れることです。

> [!NOTE] `World` は保持者、`MapBox` が実際の対象
> `typeof(World)` は `World` がstaticクラスであっても有効なC#です。しかし `Update` や `finishMakingWorld` に対するHarmonyの対象としては誤りです。これらのメソッドは `World.world` が返す型である `MapBox` に属しています。対象を間違えると、Harmonyがパッチを適用する段階で失敗します。C#が `typeof` をコンパイルする段階ではありません。

## 動かないときの対処法

Harmonyのせいにする前に、ログを読んでください。Harmonyが原因なことはめったにありません :PES5_Noted:。

| 現象 | よくある原因 |
| --- | --- |
| 何も起きず、ログにも出ない | `[HarmonyPostfix]` ラベルなしで `Postfix` を綴り間違えている、または `PatchAll` を呼んでいない |
| 起動時に `HarmonyException` / `MissingMethodException` | クラス名またはメソッド名が存在しない。dnSpyで確認 |
| `AmbiguousMatchException` / `Ambiguous match found` | 複数のオーバーロードが存在する。上記の `Type[]` 引数を追加 |
| 他人のPCでだけ起きるクラッシュ | `Actor.updateStats` へのPostfixがワーカースレッドからUnity、`Randy`、または共有リストに触っている |
| パッチ内で `NullReferenceException` | `__instance` やそのフィールドが null。パッチはロード中や死亡時、破棄処理中など通常プレイで見ない状態でも実行される |
| ゲームが3 FPSまで激重になる | 毎秒数千回呼ばれるメソッドに重い処理を仕込んでいる |
| 単体では動くが他Modと競合する | どちらかが `false` を返しているか、`__result` に直接代入している |

## 互換性を保つためのルール

- **基本はPostfix。** Prefixは、引数を変えたいときかメソッドを止めたいときだけ使います。
- **代入せず、調整する。** `+=`、`*=`、`Math.Min(...)`。他の誰かもここにパッチを当てています。
- **nullチェックは必ず。** パッチはワールドの読み込み中にも、ユニットが死ぬ最中にも実行されます。
- **安いチェックを最初に。** 頻繁に呼ばれるパッチの1行目は、`return` できるかどうかのテストにしましょう。`City.update` と `MapBox.Update` はModが最もよくパッチを当てる2つのメソッドで、どちらも毎フレーム実行されます。そこでの辞書検索は問題ありませんが、全ユニットへのループは問題です。
- **仕事をこなせる一番狭いメソッドにパッチを当てる。** 特性1つの速度のために `Actor.updateStats` にパッチを当てるのは問題ありません。同じことのためにワールド更新にパッチを当てるのは、Modがアンインストールされる道です。
- **パッチは1つのファイルにまとめる。** 誰かが競合を報告してきたとき、読みたいのは12個ではなく1個のファイルです。未来の自分に優しくしましょう。私の古いModの真似ではなく、私の言う通りにしてください :trollface:。

> [!NOTE] ライブラリの `has`、`get`、`add`、`clone`、`post_init` にパッチを当てても無意味
> 影響するのはあなたのModが読み込まれた後の呼び出しだけで、その時点で済んでいるバニラの登録には一切影響しません。**[アセットライブラリ](#/nml/asset-libraries)** を参照してください。

## Transpiler：命令そのものを書き換える

Transpilerは、メソッド内部のコンパイル済み命令であるILを書き換えます。変更がメソッドの途中にあり、PrefixでもPostfixでも表現できない場合に使います。これはHarmonyが差し替え用のメソッドを構築するときに実行されるのであって、ゲームの毎ティック実行されるわけではなく、別のTranspilerが追加されたときに再実行されることもあります。

これがパッチクラス内のシグネチャです。あえてすべてをそのまま素通りさせています：

```csharp
public static System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> Transpiler(
    System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> instructions)
{
    return instructions;
}
```

実際に書き換えるなら：

1. dnSpyで対象のILを調べます。「42番目の命令」や、ある数値の出現すべてではなく、opcodeの並びと特定のフィールド・メソッドのオペランドに一致させてください。
2. 編集する**前に**一致箇所をすべて集めます。想定している件数を明示的にチェックしてください。想定が1件なのに0件や2件見つかった場合は、不一致をログに残し、元の入力をそのまま返します。中途半端な書き換えは絶対に出力しないでください。
3. 分岐ラベル、例外ブロック、評価スタックの型とバランスを保ってください。C#として正しく見える置き換えでも、ILとしては無効になり得ます。
4. 一致する場合としない場合の両方をテストし、さらに同じメソッドに対する他のパッチと組み合わせてもテストしてください。

[Harmonyのtranspilerドキュメント](https://harmony.pardeike.net/articles/patching-transpiler.html) に命令APIの説明があります。ゲームがアップデートされたら、マジックナンバーのインデックスを3つずらすのではなく、パターンそのものを見直す理由だと考えてください :PES5_BigBrain:。

NMLはHarmonyのフォークである**HarmonyX**を同梱しています。中核のパッチAPIは共通ですが、Prefixのスキップ挙動を含め、動作が異なる場合があります。複数のModが同じものに触ろうとするなら、次に読むべきは **[他のModとの連携](#/nml/other-mods)** です。
