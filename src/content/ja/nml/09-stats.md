---
title: ステータス一覧
group: ゲームコンテンツ
subgroup: 設計とステータス
icon: :wbstonks:
order: 92
---

# ステータス一覧 :wbstonks:

あなたが登録するほぼすべてのアセットは `base_stats` ブロックを持っており、このページ以降のほぼすべての解説でそこに値を設定します。このページは、そこに設定できるステータスの一覧です。

## base_stats の仕組み

`base_stats` は `string` から `float` への辞書です。キーは以下の一覧にあるステータスIDのいずれかでなければなりません。未知のキーを設定することは**無害ではありません**。セッターは `base_stats_library` からそのIDを検索し、`null` が返ってきて、あなたの `Initialize()` のその行で `NullReferenceException` を即座にスローします。

つまりステータスのスペルミスは静かに無視されるのではなく、アセット登録処理全体をクラッシュさせ、それ以降の行は一切実行されなくなります。複数の場所で同じステータスを使う場合は、`const string` フィールドにまとめておくのが賢明です。

```csharp
trait.base_stats["damage"] = 15;
trait.base_stats["multiplier_health"] = 0.25f;   // +25%、x0.25ではない
```

## ユニットの数値の算出元

`Actor.updateStats()` はユニットのステータスブロックをクリアし、以下の厳密な順序でゼロから再構築します：

| # | 出典 | 備考 |
| --- | --- | --- |
| 1 | **亜種 (Subspecies)**、およびその男女専用ブロック | ユニットが属している場合 |
| 1b | **Actorアセット** | 亜種が**ない**場合のみ。亜種はアセットのステータスを*置き換える*ものであり、上に累積しません |
| 2 | **氏族 (Clan)**、およびその男女専用ブロック | |
| 3 | **言語 (Language)** | |
| 4 | **文化 (Culture)** | |
| 5 | ユニット自身のデータに属する統率属性 | `diplomacy`, `stewardship`, `intelligence`, `warfare` |
| 6 | 付与されているすべての**ステータス効果** | |
| 7 | **デフォルト攻撃** アイテム | 素手のときのみ |
| 8 | すべての**アクター特性 (Actor trait)** | 時代限定の特性は、該当する時代以外ではスキップされます |
| 9 | そのユニットの**性格** | |
| 10 | すべての**装備アイテム**とそのモディファイア | |

ここで多くの人が勘違いする点が2つあります：

- **亜種はActorアセットのステータスを置き換えます。** `human` にどれほど数値を盛っても、亜種を持つ人間ユニットには一切反映されません。
- **宗教はこのリストに含まれていません。** 宗教特性の `base_stats` がユニットに届くことはありません。**[宗教特性](#/nml/religion-traits)** を参照してください。

さらに知っておくべき2つのルール：

- `damage` のような固定値ステータスは**加算ボーナス**であり、最終値ではありません。特性に `damage = 15` と書くのは「他の全計算の上に+15加算」という意味です。
- `multiplier_*` ステータスは**1.0に加算される小数割合**です。`multiplier_health = 0.5` は+50%を意味し、`multiplier_health = -0.5` は体力が半減します。

> [!WARNING] `base_stats` はアセットが登録されるまで存在しません
> 手動で新規構築したアセットでは、ステータスブロックは `add()` の内部で初めて割り当てられます。その行の前に `base_stats` を触ると `NullReferenceException` が発生します。`clone()` は内部で `add()` を呼んでくれるため、クローン直後は安全です。これはWorldBox Mod開発で最も多いクラッシュ原因です。

## Combat

| ステータス | 効果 |
| --- | --- |
| `damage` | 1ヒットあたりの固定ダメージ |
| `damage_range` | `damage` の上に加算されるランダムなブレ幅 |
| `attack_speed` | 攻撃の発生速度 |
| `accuracy` | 命中率 |
| `critical_chance` | クリティカルヒット率 |
| `critical_damage_multiplier` | クリティカル時のダメージ倍率 |
| `armor` | 固定値の被ダメージ軽減 |
| `range` | 攻撃射程 |
| `throwing_range` | 投擲武器の射程 |
| `targets` | 1回の攻撃で巻き込める対象数 |
| `projectiles` | 一度に発射される弾の数 |
| `knockback` | 攻撃が相手を吹き飛ばす距離 |
| `recoil` | 攻撃時に*自分自身*が吹き飛ぶ反動 |
| `skill_combat` | 近接戦闘スキル値 |
| `skill_spell` | 呪文詠唱スキル値 |
| `status_chance` | 付与されたステータス効果が発動する確率 |
| `area_of_effect` | 範囲攻撃の爆発半径 |

## Body

| ステータス | 効果 |
| --- | --- |
| `health` | 最大体力 |
| `stamina` | 最大スタミナ |
| `mana` | 最大マナ |
| `speed` | 移動速度 |
| `mass`, `mass_2` | 吹き飛び計算や物理挙動に使われる質量 |
| `size` | 当たり判定（ヒットボックス）のサイズ |
| `scale` | 描画上の表示スケール |
| `max_nutrition` | ユニットが保持できる食料の最大容量 |
| `metabolic_rate` | 食料を消費する代謝速度 |
| `construction_speed` | 建築速度 |
| `experience` | 経験値の獲得倍率 |

## ライフサイクル

| ステータス | 効果 |
| --- | --- |
| `lifespan` | 寿命 |
| `maturation` | 成長の早さ |
| `age_adult` | 成人扱いになる年齢 |
| `age_breeding` | 繁殖可能になる年齢 |
| `birth_rate` | 出産の発生頻度 |
| `offspring` | 1回の出産で生まれる子どもの数 |
| `multiplier_offspring` | その子ども数に対するパーセント補正 |
| `mutation` | 亜種突然変異の発生確率 |
| `happiness` | 基礎幸福度 |

## 文明ユニット専用属性

これらは動物には一切効果がありません。ゲーム内では `used_only_for_civs` とマークされています。

| ステータス | 効果 |
| --- | --- |
| `diplomacy` | 指導者属性：外交力 |
| `warfare` | 指導者属性：軍事力 |
| `stewardship` | 指導者属性：統治力 |
| `intelligence` | 指導者属性：知力 |
| `army` | 軍隊規模への貢献度 |
| `cities` | 国家が目標とする都市数 |
| `bonus_towers` | 都市が建設できる見張り塔の追加上限 |
| `limit_population` | 人口の上限値 |
| `limit_clan_members` | 氏族メンバーの上限値 |
| `loyalty_traits` | 特性による忠誠心補正 |
| `loyalty_mood` | 気分による忠誠心補正 |
| `opinion` | 他国に対する基礎友好度 |
| `multiplier_diplomacy` | 外交力へのパーセント補正 |
| `multiplier_supply_timer` | 軍隊の兵站補給が持続する時間 |
| `personality_aggression` | 隠しAI性格ウェイト：好戦性 |
| `personality_administration` | 隠しAI性格ウェイト：内政重視 |
| `personality_diplomatic` | 隠しAI性格ウェイト：外交重視 |
| `personality_rationality` | 隠しAI性格ウェイト：合理性 |

## Multipliers

これらはすべて1.0に加算される小数比率です。そのため `0.25` は+25%を意味します。

`multiplier_health` · `multiplier_lifespan` · `multiplier_stamina` · `multiplier_mana` · `multiplier_damage` · `multiplier_crit` · `multiplier_speed` · `multiplier_attack_speed` · `multiplier_mass` · `multiplier_offspring` · `multiplier_diplomacy` · `multiplier_supply_timer`

## base_stats と base_stats_meta の違い

すべての特性は**2つ**のステータスブロックを保持しており、どちらに入れるかを間違えることはメタ特性Modで最も頻発するバグです：

| ブロック | 適用される先 |
| --- | --- |
| `base_stats` | 所有者にマージされ、そこから所属する**全ユニット**へ分配される |
| `base_stats_meta` | 所有者自身にとどまる。文化や氏族、亜種自身が参照し、ユニットには渡されない |

```csharp
trait.base_stats["damage"] = 5;             // この文化に属する全ユニットの攻撃力が上昇（農民も含む）
trait.base_stats_meta["construction_speed"] = 10;   // 文化圏全体で建築が速くなる。個人の攻撃力は不変
```

特定の構成員にのみボーナスを付けたい場合（戦士のみ、大人限定など）、どちらのブロックでも表現できません。`Actor.updateStats` に対するHarmony Postfixを使って自前で判定してください。**[Harmonyパッチ](#/nml/harmony-patches)** を参照してください。

## タグ：数値ではないステータス

`base_stats` ブロックは、数値ではなくブール値フラグである **タグ (Tags)** の集合も保持しています。これらはステータスと同じルールでマージされるため、攻撃力を付与するのと同じ感覚でユニットに炎無効を付与できます：

```csharp
trait.base_stats.addTag("immunity_fire");
trait.base_stats.addTag("fast_swimming");

if (actor.stats.hasTag("immunity_fire")) { }
```

ゲーム本体が参照しているタグ一覧：

| グループ | タグ |
| --- | --- |
| 耐性 | `immunity_fire` · `immunity_cold` · `building_immunity_fire` · `damaged_by_water` |
| 移動 | `fast_swimming` · `water_creature` · `immovable` · `walk_adaptation_sand` · `walk_adaptation_snow` · `walk_adaptation_swamp` |
| 精神 | `strong_mind` · `has_sapience` · `has_emotions` · `has_advanced_memory` · `has_advanced_communication` · `can_read_any_book` · `mad` · `moody` · `unconscious` · `frozen_ai` |
| 行動 | `ignore_fights` · `love_peace` · `steal_items` · `needs_food` · `needs_mate` · `always_idle_animation` · `stop_idle_animation` · `generate_light` |
| 食性 | `diet_meat` · `diet_meat_insect` · `diet_fish` · `diet_blood` · `diet_grass` · `diet_crops` · `diet_fruits` · `diet_flowers` · `diet_nectar` · `diet_algae` · `diet_vegetation` · `diet_wood` · `diet_minerals` · `diet_tiles` · `diet_same_species` |
| 生殖 | `reproduction_sexual` · `reproduction_asexual` · `oviparity` · `viviparity` |
| 種別属性 | `civ` · `human` · `elf` · `orc` · `dwarf` · `demon` · `undead` · `magic` · `good` · `evil` · `neutral` · `nature_creature` · `neutral_animals` · `everyone` · `small` · `sliceable` |
| 建築制限 | `can_build_in_biome_corruption` · `can_build_in_biome_desert` · `can_build_in_biome_infernal` · `can_build_in_biome_permafrost` · `can_build_in_biome_swamp` · `can_build_in_biome_wasteland` |

ステータス名とは異なり、未知のタグを渡してもクラッシュせず、単に何にもマッチしなくなるだけです。ただしこれはスペルミスが完全に無言で無視されることも意味するため、正確に書き写してください。

## ユニットの現在値のリアルタイム取得

`base_stats` は*設計図*です。生きている `Actor` の `stats` は、すべての要素が加算統合された後の*最終結果*です：

```csharp
float finalDamage = actor.stats["damage"];
```

これは `Actor.updateStats` のHarmony Postfixから調整する対象でもあります（**[Harmonyパッチ](#/nml/harmony-patches)** 参照）。

## 独自のステータス（属性）を追加する

`AssetManager.base_stats_library` に新しい `BaseStatAsset` を登録すれば、インスペクターに表示され、他と同様に加算合算されます。ただし**何の効果も持ちません**。ゲーム本体は自分が知らないステータスを一切読み取らないからです。カスタムステータスは、あなた自身が後からHarmonyパッチや独自AI行動の中で参照するための数字入れとしてのみ役に立ちます。

大抵の場合の正解は「既存のステータスを流用する」であり、次点の正解は「自前で辞書を保持する」です。
