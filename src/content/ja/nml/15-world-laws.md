---
title: 世界の法則
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbworldlaws:
order: 176
---

# 世界の法則 :wbworldlaws:

世界の法則（world law）とは、「老衰」「飢餓」「平和なモンスター」といった **世界の法則** ウィンドウに並ぶスイッチのことです。設定ファイルを一切触ることなくMODの挙動をプレイヤーが自由にオン/オフできるため、最もユーザーフレンドリーな機能です。

しかも、ゲーム全体の中でも最も作成が簡単なアセットの1つです。必要なフィールドはたったの4つ。

## スイッチを追加する

```csharp Mods/HelloBox/Code/HelloLaws.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloLaws
    {
        public const string CHAOS = "world_law_hello_chaos";

        public static void Initialize()
        {
            if (AssetManager.world_laws_library.has(CHAOS)) return;

            AssetManager.world_laws_library.add(new WorldLawAsset
            {
                id = CHAOS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "units",                                  // どのタブに表示されるか
                icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
                default_state = false                                // 初期状態はオフ
            });
        }
    }
}
```

`Main.cs` に `HelloLaws.Initialize();` を追加するだけで、スイッチがゲーム内に現れます。本当にこれだけです :poggers:。

| フィールド | 説明 |
| --- | --- |
| `id` | 法則のID名。翻訳キーとしても使用 |
| `group_id` | 配置されるタブ。全リストは下の**タブ一覧**を参照、あるいは自作も可能 |
| `icon_path` | アイコン。他と同じパスルール |
| `default_state` | `true` = 新規ワールドで最初からオン, `false` = オフ |
| `can_turn_off` | デフォルトは `true`。オンにしたらオフにできない法則にする場合は `false` |

## コード内でスイッチの状態を読み取る

これこそがスイッチを追加した目的です。誰も読まないスイッチはただの飾りです。MOD内のどこからでも判定できます:

```csharp
WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);

if (law != null && law.isEnabled())
{
    // プレイヤーが混沌を望んでいるなら、混沌を与えよう
}
```

あるいは、アセットを取得せずにワールドから直接読む短い書き方もあります：

```csharp
bool chaos = World.world.world_laws.isEnabled(HelloLaws.CHAOS);
```

`isEnabled(string)` は知らないIDに対して例外を投げる代わりに `false` を返すので、タイプミスは「クラッシュ」ではなく「オフ」として読めてしまいます。親切なようで、実はひどい話です。何も教えてくれないので :PES5_Hmmmm:。`World.world.world_laws` は `internal` なので、これはNMLがあなたのModをビルドする際に使う公開化済みアセンブリに対してコンパイルされます（**[ステータス効果](#/nml/status-effects)** の注記参照）。上のアセット経由の方法はどこでも使えます。

実践例: 法則がオンになっているときだけ火の粉を降らせる:

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
    bool chaos = law != null && law.isEnabled();

    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

    if (chaos)
    {
        foreach (WorldTile neighbour in pTile.neighboursAll)
        {
            World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
        }
    }
    return true;
};
```

## 切り替えられた瞬間に反応する

後から状態を読み取るだけでなく、スイッチをオンにした瞬間に即座に何らかの処理を *実行* したい場合:

```csharp
new WorldLawAsset
{
    id = CHAOS,
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
    default_state = false,
    on_state_enabled = (PlayerOptionData pOption) => { /* プレイヤーがオンにした瞬間に実行される */ }
};
```

## タブ一覧

このウィンドウは複数のタブに分かれており、`group_id` でどれを選ぶかが決まります。以下がバニラの全グループで、ウィンドウが描画する順番通りに並べてあります：

`harmony` · `diplomacy` · `civilizations` · `units` · `mobs` · `spawn` · `nature` · `trees` · `plants` · `fungi` · `biomes` · `weather` · `disasters` · `other`

### 自分専用のタブ

最初の例の `Initialize()` を以下のバージョンに置き換え、`CHAOS` の隣に `GROUP` を追加します。

グループは `AssetManager.world_law_groups` の中の `WorldLawGroupAsset` です。特性タブが使うのと同じ小さな `BaseCategoryAsset` です。**[特性グループとタブ](#/nml/trait-groups)** 参照：

| フィールド | 役割 |
| --- | --- |
| `id` | 法則の `group_id` が指す先 |
| `name` | タブタイトルの**ローカライズキー**。タイトル文字列そのものではない |
| `color` | 16進カラー文字列。タブタイトルを彩色する |

```csharp Mods/HelloBox/Code/HelloLaws.cs
public const string GROUP = "hello_laws";

public static void Initialize()
{
    // まずグループから：下の法則がこれを指す
    if (!AssetManager.world_law_groups.has(GROUP))
    {
        AssetManager.world_law_groups.add(new WorldLawGroupAsset
        {
            id = GROUP,
            name = "world_laws_tab_" + GROUP,   // ローカライズキーであり、テキストそのものではない
            color = "#FF9A3C"
        });
    }

    if (AssetManager.world_laws_library.has(CHAOS)) return;

    AssetManager.world_laws_library.add(new WorldLawAsset
    {
        id = CHAOS,
        needs_to_be_explored = false,
        group_id = GROUP,
        icon_path = "ui/Icons/worldrules/icon_hello_law",
        default_state = false
    });
}
```

UI側の作業は不要です：世界の法則ウィンドウは `world_law_groups.list` の各エントリごとに1つずつタブを構築し、その後、各法則をその `group_id` が指すタブに振り分けます。これはウィンドウが最初に作られたときに一度だけ行われ、あなたのModはプレイヤーがそこにたどり着くよりずっと前にロードされています。あなたのタブは末尾、`other` の後に置かれます。

> [!WARNING] 存在しない `group_id` はウィンドウ全体を壊す
> ウィンドウは単純な辞書のインデックス参照でタブを探します。誰も登録していないグループを指す法則は、ウィンドウ構築中に `KeyNotFoundException` を投げ、その後に登録された法則は、あなたのものも他のModのものも、一切ウィンドウに入らなくなります。法則より先にグループを登録し、綴りを2回とも一致させてください :PESgn_ToughLuck:。

## テキスト設定

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one.",
  "world_laws_tab_hello_laws": "HelloBox"
}
```

> [!WARNING] 世界の法則はIDそのままではなく `_title` を使う
> ほかのほぼすべてのアセットは、IDそのものを名前のキーに使います。世界の法則は `<id>_title` を求めます。間違えると、スイッチはラベルなしで表示されます :PESgn_Really:。

> [!TIP] 設定より法則
> Modの設定は、プレイヤーが一度だけ開くメニューにあります。世界の法則はゲームの中、バニラの法則のすぐ隣にあり、ワールドごとで、プレイ中に切り替えられます。あなたのModにオン/オフの挙動があるなら、ここが居場所です :wbblessed:。
