---
title: 毎フレーム
group: NML Modding
subgroup: 高度な機能と公開
icon: :wbyawn:
order: 43
---

# 毎フレーム :wbyawn:

あなたのメインクラスはUnityのコンポーネントです。`BasicMod<T>` は `MonoBehaviour` を継承しているので、そこに `Update()` メソッドを書けば、Unityはそれをフレームごとに1回呼び出します。起動直後の最初の1秒からゲームが閉じるまで、ワールドがあろうがなかろうが、1秒間に60回です。

ここは、何かへの反応ではないあらゆる処理の置き場所です。ゲーム内1か月ごとのチェック、Harmonyパッチからのキュー、キー入力など。同時に、Modding初心者が誰かのゲームをスライドショーに変えてしまう、最も手軽な方法でもあります :wbfacepalm:。

## ガード

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    // game_loaded: 起動処理を過ぎたか。worldLoading: ワールドが構築・破棄の途中でないか
    if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

    HelloTicker.Tick();
}
```

| チェック | 何を防ぐか |
| --- | --- |
| `World.world != null` | まだマップのインスタンスが存在しない状態 |
| `Config.game_loaded` | ゲームが起動した直後、最初のワールドがまだ始まっていない瞬間 |
| `Config.worldLoading` | ロード画面。ワールドがクリア・生成・ロードされている最中で、ユニットのリストがあなたの足元で空にされたり満たされたりしている状態 |

`Config.worldLoading` は `SmoothLoader.isLoading()` そのものであり、ゲーム自身の `MapBox.Update()` がシミュレーションを行う前に行っているのと同じチェックです。**[ログとデバッグ](#/nml/logs-and-debugging)** のガードは起動時をカバーしています。ロード中のチェックを加えれば、その後のすべてのワールドロードでも安全になります。

## 毎フレームではなく

ほとんどのものは1秒間に60回もチェックする必要はありません。時計を1つ選んで、それに合わせて動かしましょう。

| 時計 | 何をするか |
| --- | --- |
| `Time.deltaTime` | 前フレームからの経過秒数（現実時間）。ゲームが一時停止していても動き続け、速度設定を無視します。ゲームは `Time.timeScale` に一切触れません |
| `World.world.getCurWorldTime()` | ワールド内の経過秒数（`double`）。ゲームの一時停止中やウィンドウが開いている間は止まり、速度が上がるほど速く進みます。5でゲーム内1か月、60で1年です |

ワールド*内*で起きることには、ワールド時間を使ってください。ここでは、**[データを記憶する](#/nml/saving-data)** の grudge 特性を持つユニット全員が、1か月ごとに殴られた記憶を1つ忘れていきます。

```csharp Mods/HelloBox/Code/HelloTicker.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloTicker
    {
        private const double INTERVAL = 5.0;   // ワールド秒: ゲーム内1か月
        private static double _last;

        [HarmonyPostfix]
        public static void ResetClock(MapBox __instance)
        {
            _last = __instance == null ? 0.0 : __instance.getCurWorldTime();
        }

        public static void Tick()
        {
            if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

            double now = World.world.getCurWorldTime();

            // 時計が逆行した場合は、tickを発火させずに基準だけリセットする
            if (now < _last) _last = now;
            if (now - _last < INTERVAL) return;
            _last = now;

            foreach (Actor actor in World.world.units)
            {
                if (actor == null || !actor.isAlive()) continue;
                if (!actor.hasTrait(HelloMemory.GRUDGE)) continue;

                actor.data.change(HelloMemory.HITS, -1, 0, 100000);
            }
        }
    }
}
```

**[Harmonyパッチ](#/nml/harmony-patches)** の `PatchAll` 呼び出しはそのまま残してください。`ResetClock` は、生成されたワールドでもロードされたワールドでも、たとえタイムスタンプが同じか後であっても、毎回実行されます。そのワールドでの最初のtickは、丸々1インターバル分待ちます。時計の逆行チェックだけでは、すべてのロードを検知できません。

一時停止、速度、開いているウィンドウはすべて、ワールドの時計自体がそれらに従うため自動的に処理されます。ワールドの中にないもの、たとえば点滅するラベルなどには現実時間を使います。

```csharp
private static float _timer;

_timer += Time.deltaTime;
if (_timer < 2f) return;
_timer = 0f;
```

> [!NOTE] 自分で一時停止をチェックする場合
> `Config.paused` は一時停止ボタンそのものだけを指すフラグです。シミュレーションはウィンドウが開いている間も止まります。`World.world.isPaused()` は両方をカバーしますが `internal` なので、NMLがあなたをコンパイルする際のpublicize済みアセンブリが必要です。ワールド時間を使えば、この問題自体を考えずに済みます。

## コルーチン

コルーチンとは、途中で待機できるメソッドのことです。あなたのメインクラスは `MonoBehaviour` なので、コルーチンを開始できます。

```csharp Mods/HelloBox/Code/HelloShakes.cs
using System.Collections;
using UnityEngine;

namespace HelloBox
{
    public static class HelloShakes
    {
        public static void Begin(Actor pActor)
        {
            Main.Instance.StartCoroutine(ShakeThreeTimes(pActor));
        }

        private static IEnumerator ShakeThreeTimes(Actor pActor)
        {
            for (int i = 0; i < 3; i++)
            {
                // 待機のたびにチェックする: そのユニットには死ぬための丸々1秒があった
                if (World.world == null || Config.worldLoading || pActor == null || !pActor.isAlive()) yield break;

                pActor.startShake();
                yield return new WaitForSeconds(1f);
            }
        }
    }
}
```

`WaitForSeconds` は現実時間で待機し、ゲームが `Time.timeScale` を変更することはないので、一時停止でも止まらず、ゲーム速度も気にしません。コルーチンは、プレイヤーが途中で別のワールドをロードしても動き続けます。だからこそ、最初の待機の前だけでなく、`yield` のたびにチェックが必要なのです :PES2_F:。

## キー

`Update()` 内の `Input.GetKeyDown(KeyCode.F7)` は動作します。しかしこれは、プレイヤーがテキストフィールドにユニットの名前を入力している最中にも発火してしまい、プレイヤーはそのキーを変更できません。ゲーム自身のホットキーは、テキストフィールドにフォーカスがある間はキー入力をスキップするので、`HotkeyAsset` を使えばそれをタダで手に入れられます。登録方法は **[カスタムウィンドウ](#/nml/custom-windows)** を参照してください。`GetKeyDown` は、あなただけが押すデバッグ用キーのために取っておきましょう。

## 重い処理

- **ユニットのループはタイマーで回し、毎フレームは避ける。** ユニット1万体×60フレームで、1秒間に60万回のチェックになります。それも、せいぜい3体しか持っていないかもしれない特性のために。
- **軽いチェックを先に。** Harmonyパッチと同じルールです。最初の行こそが `return` させてくれる行です。
- **並列コードはキューに入れ、`Update()` で処理する。** `Actor.updateStats` のような並列メソッドへのPostfixは、Unityや共有状態に触れてはいけません（**[Harmonyパッチ](#/nml/harmony-patches)** 参照）。ユニットをキューに入れ、メインスレッド側がここで受け取ります。

```csharp
// pending はあなたのパッチが詰め込む ConcurrentQueue
while (pending.TryDequeue(out Actor actor))
{
    if (actor == null || !actor.isAlive()) continue;
    // ここまで来ればUnity、Randy、自分のリストに触れても安全
}
```

そのループの中で何をするかは **[実行時のワールド](#/nml/world-at-runtime)** の話です。セーブとロードの後にも残したいものについては **[データを記憶する](#/nml/saving-data)** を参照してください :PES_OkHand:。
