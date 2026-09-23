---
title: 実行中のワールドを操作する
group: ゲームコンテンツ
subgroup: 設計とステータス
icon: :wbworld:
order: 96
---

# 実行中のワールドを操作する :wbworld:

他のすべてのページは、ゲームロード中に何かを登録する話でした。このページはその反対、つまりすでに存在している実行中のワールドを取得して変更する話です。町を破壊する、別の王国に譲り渡す、戦争を始める、都市を自分たちの住民で満たす。

これらはすべて神の力の `click_action`、`Update()`、あるいはワールドビヘイビアから実行してください。**`OnModLoad` からは絶対に実行しないこと**、まだワールドが存在しないためです。ガードの書き方は **[ログとデバッグ](#/nml/logs-and-debugging)** を参照。

## 既存のものをループする

```csharp
foreach (City city in World.world.cities)
{
    if (city == null || city.isRekt()) continue;
    // city.kingdom, city.units, city.buildings, city.zones
}

foreach (Building building in World.world.buildings)
{
    if (building == null || building.isRekt()) continue;
}
```

`World.world.kingdoms` も同じように使えます。**[王国と勢力](#/nml/kingdoms)** を参照。毎回すべての要素に `isRekt()` をかけること。これらのリストには今まさに消えつつあるオブジェクトも入っています。

## 都市を別の王国に移す

```csharp
city.joinAnotherKingdom(pNewSetKingdom: kingdom);
```

`pCaptured: true` にすると統計上「征服」扱いになり、`pRebellion: true` なら「反乱」扱いになります。ユニットはその都市についていきます。

## 破壊する

```csharp
city.destroyCity();              // 都市が消え、そのゾーンは誰のものでもなくなる
building.startDestroyBuilding(); // 廃墟グラフィックがあれば廃墟になり、その後消える
```

`destroyCity()` はpublicです。`startDestroyBuilding()` は `internal` ですが、NMLがModをpublicize済みアセンブリに対してビルドするのでコンパイルが通ります。王国を丸ごと消したいときは、都市を1つずつ破壊します。ループは `kingdom.cities` のコピーに対して行ってください。ライブのリストに対して行うと、`destroyCity()` のたびにリストが変化します。

## 戦争を始める

```csharp
World.world.diplomacy.startWar(pAttacker, pDefender, WarTypeLibrary.normal);
```

上と同様 `internal` です。戦争タイプは `WarTypeLibrary` の静的フィールドです：`normal`、`spite`、`inspire`、`rebellion`、`whisper_of_war`、`clash`。

## 都市を自種族の住民で満たす

```csharp
Subspecies main = city.getMainSubspecies();
WorldTile tile = city.getTile();
if (main == null || tile == null) return;

Actor actor = World.world.units.createNewUnit(city.getActorAsset().id, tile, pSubspecies: main, pAdultAge: true);
actor?.joinCity(city);
```

**[カスタムアクター](#/nml/custom-actors)** の `spawnNewUnit` は亜種を自動で選んでくれます。`createNewUnit` なら亜種を自分で選べます。これが「人間を1体」と「*この*人間たちのうちの1体」との違いです。

## 親を調べる

```csharp
foreach (Actor parent in actor.getParents())
{
    // 生きている親だけ
}

long first = actor.data.parent_id_1;   // idは死後も残る
```

`getParents()` は生きている親だけを返します。それぞれのidを `World.world.units.get(id)` で探し、見つからないか死亡している場合はスキップします。idはユニットのデータに永遠に残りますが、ゲームはその人物についての記録を一切保持しません。死者まで覚えている家系図を作りたければ、誕生の瞬間に必要な情報を子ども自身のデータへ書き込むしかありません。**[データの保存と記憶](#/nml/saving-data)** を参照。ワールド全体に対して何かを保存できる場所はどこにもないためです :PES_ThinkAboutIt:。
