---
title: 王国特性
group: ゲームコンテンツ
subgroup: 特性と遺伝
icon: :wbcrown:
order: 114
---

# 王国特性 :wbcrown:

**王国特性**とは国家の政策です。信仰でも血統でもなく、王権が決定し領土全域に適用される国策そのものです。

バニラはこのシステムを税率設定という唯一の用途にしか利用していません。そのため、7つある特性システムの中で最も規模が小さく空席の目立つ領域であり、新たな要素を追加する場として最も魅力的なキャンバスとなっています。誰とも競合しません。

| | |
| --- | --- |
| ライブラリ | `AssetManager.kingdoms_traits` |
| クラス | `KingdomTrait` |
| グループ | `AssetManager.kingdoms_traits_groups`, クラス `KingdomTraitGroupAsset` |
| 実行時の所持者 | `Kingdom`, `World.world.kingdoms` 内 |
| ローカライズ接頭辞 | `kingdom_trait_` |
| デフォルトのアイコンフォルダ | `ui/Icons/kingdom_traits/` |

> [!WARNING] 王国のステータスはユニットに届かない
> 宗教と同様に、`kingdom.base_stats` が `Actor` に合成されることは決してありません。ゲーム内の王国情報で見られる各種数値は**国王自身のステータス**（`king.stats["cities"]` など）から供給されており、王国の特性ブロックによるものではありません。
>
> したがって、王国特性は `base_stats` ではなく、自身の固有フィールドやコード処理を通じて国を変革していくことになります。

## 税率に関するフィールド

王国特性だけが持っている3つの専用フィールドであり、バニラがこのシステムで行っている処理のすべてです:

```csharp
KingdomTrait trait = new KingdomTrait
{
    id = "hello_tax_rate_local_brutal",
    group_id = "local_tax",
    is_local_tax_trait = true,
    tax_rate = 0.9f
};
AssetManager.kingdoms_traits.add(trait);
trait.addOpposite("tax_rate_local_low");
```

| フィールド | 説明 |
| --- | --- |
| `is_local_tax_trait` | この特性が王国の**地方税率**を決定することを示す |
| `is_tribute_tax_trait` | この特性が王国の**貢ぎ物（朝貢）税率**を決定することを示す |
| `tax_rate` | 税率の数値そのもの（小数表記） |

特性に変更が生じるたびに、王国は両方の税率を最初から再計算します。`SimGlobals` のグローバルデフォルト値から開始し、所持特性を順に走査して該当する特性に値を**上書き**させていきます。

> [!WARNING] 最後に走査された特性が勝つ。相反設定を忘れずに
> 税率特性は加算されません。もし王国が2つの `is_local_tax_trait` 特性を併せ持っていた場合、反復処理で後から読み込まれた側が無条件で勝ちます。どちらが勝つかはイテレーション順序次第です。
>
> バニラの税率特性が互いを相反特性として登録しているのはまさにこの理由からです。双方から必ず反対設定を行ってください。さもないと、設定した税率が反映されたりされなかったりして頭を抱えることになります :PES5_HmmmmNo:。

## 適切に登録する

```csharp Mods/HelloBox/Code/HelloKingdomTraits.cs
namespace HelloBox
{
    public static class HelloKingdomTraits
    {
        public const string LEVY = "hello_levy";

        public static void Initialize()
        {
            if (AssetManager.kingdoms_traits.has(LEVY)) return;

            KingdomTrait trait = new KingdomTrait
            {
                id = LEVY,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "miscellaneous",
                path_icon = "ui/Icons/iconHelloKingdom",
                spawn_random_trait_allowed = false,
                can_be_given = true,
                can_be_removed = true
            };

            AssetManager.kingdoms_traits.add(trait);
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed` はゲーム起動時に一度だけ読み込まれます
> 新しい王国は、ゲームロード中に `BaseTraitLibrary.linkAssets()` が構築するプールから初期特性を抽選します。これはあなたのModが存在するより前のタイミングです。特性にこのフラグを立てるだけでは何も変わりません。あなたの特性はそのプールに一度も入らず、偶然付与されることもありません。バニラと同じ重み付けで、自分でプールに追加してください：
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.kingdoms_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` は `protected` なので、NML がModのビルドに使うpublicize済みアセンブリに対してならコンパイルが通ります。`spawn_random_rate` の既定値は `5` です。数値を上げるほど出現頻度が上がります。

## 実際に効果を持つ政策を作成する

`base_stats` が利用できない以上、王国特性が真価を発揮するには以下の2つのアプローチのいずれかをとります。

**決断（Decision）**: 最も手堅く簡潔な選択肢です:

```csharp
trait.addDecision("some_decision_id");
// ids are resolved at startup, before your mod: resolve yours
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("some_decision_id") };
```

**特性を読み取る Harmony パッチ**: 本格的な国策システムを構築する王道の手法です。国家の意思決定が参照するメソッドにパッチを当て、そこで王国の特性を検査します:

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;
        if (!__instance.kingdom.hasTrait(HelloKingdomTraits.LEVY)) return;

        __result *= 1.35f;
    }
}
```

税率以外のあらゆる王国政策はすべてこのパターンに従います。特性がスイッチとなり、パッチが実際の挙動を担うのです。**[Harmonyパッチ](#/nml/harmony-patches)** を参照してください。

## バニラのグループ

`tribute` · `local_tax` · `miscellaneous` · `fate`

計4グループであり、そのうち2つは税率ペアです。政策を3つ以上作成する場合は独自の専用タブを用意しましょう。**[特性グループとタブ](#/nml/trait-groups)** を参照してください（`AssetManager.kingdoms_traits_groups` と `KingdomTraitGroupAsset`）。

## テキスト

```json Mods/HelloBox/Locales/en.json
{
  "kingdom_trait_hello_levy": "Levy",
  "kingdom_trait_hello_levy_info": "Everyone who can carry a spear, carries a spear."
}
```

## 特性を付与する

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addKingdomTrait(HelloKingdomTraits.LEVY);
```

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    kingdom.addTrait(HelloKingdomTraits.LEVY, pRemoveOpposites: true);
}
```

勢力の母体となった王国アセットは別個の存在です。**[王国と派閥](#/nml/kingdoms)** を参照してください。

> [!TIP] 誰もいない部屋
> 7大特性システムのうち6つは膨大なバニラコンテンツで埋まっており、MOD制作時はそれらをかいくぐる必要があります。しかしこの王国特性システムには、わずか5つの特性しか存在しません。ゲームに自然に溶け込み、誰とも競合しないMODを作りたいなら、一連の王国政策を実装するのが最も手軽で賢い道です :PES2_Cash:。
