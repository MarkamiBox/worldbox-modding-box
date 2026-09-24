---
title: 世界の法則
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbworldlaws:
order: 176
---

# 世界の法則 :wbworldlaws:

世界の法則とは、「老衰」「飢餓」「平和なモンスター」といった **世界の法則** ウィンドウに並ぶスイッチのことです。設定ファイルを一切触ることなくMODの挙動をプレイヤーが自由にオン/オフできるため、最もユーザーフレンドリーな機能です。

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
| `group_id` | 配置されるタブ: `units`, `civilizations`, `spawn`, `diplomacy`, `nature` … |
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

## テキスト設定

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one."
}
```

> [!WARNING] 世界の法則はIDそのままではなく `_title` を使う
> ほかのほぼすべてのアセットは、IDそのものを名前のキーに使います。世界の法則は `<id>_title` を求めます。間違えると、スイッチはラベルなしで表示されます :PESgn_Really:。

> [!TIP] 設定より法則
> Modの設定は、プレイヤーが一度だけ開くメニューにあります。世界の法則はゲームの中、バニラの法則のすぐ隣にあり、ワールドごとで、プレイ中に切り替えられます。あなたのModにオン/オフの挙動があるなら、ここが居場所です :wbblessed:。
