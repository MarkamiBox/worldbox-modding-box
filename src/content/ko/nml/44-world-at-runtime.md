---
title: 실행 중인 월드 다루기
group: 게임 콘텐츠
subgroup: 구조 및 스탯
icon: :wbworld:
order: 96
---

# 실행 중인 월드 다루기 :wbworld:

다른 모든 페이지는 게임이 로드되는 동안 무언가를 등록하는 이야기였습니다. 이 페이지는 그 반대, 즉 이미 존재하는 실행 중인 월드에서 무언가를 가져와 바꾸는 이야기입니다. 마을을 파괴하고, 다른 왕국에 넘기고, 전쟁을 시작하고, 도시를 그 종족 주민으로 채우는 것.

이 모든 작업은 신의 권능의 `click_action`, `Update()`, 또는 월드 행동에서 실행하세요. **절대 `OnModLoad`에서 실행하지 마세요**, 그 시점에는 아직 월드가 존재하지 않습니다. 가드 작성법은 **[로그 및 디버깅](#/nml/logs-and-debugging)** 참고.

## 존재하는 것들 순회하기

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

`World.world.kingdoms`도 똑같이 사용합니다, **[왕국 및 세력](#/nml/kingdoms)** 참고. 매번 모든 항목에 `isRekt()`를 거세요. 이 목록들에는 지금 막 소멸 중인 객체도 들어 있습니다.

## 도시를 다른 왕국으로 옮기기

```csharp
city.joinAnotherKingdom(pNewSetKingdom: kingdom);
```

`pCaptured: true`로 하면 통계상 "정복"으로 처리되고, `pRebellion: true`면 "반란"으로 처리됩니다. 유닛들은 그 도시를 따라갑니다.

## 파괴하기

```csharp
city.destroyCity();              // 도시가 사라지고 그 구역은 누구의 것도 아니게 됩니다
building.startDestroyBuilding(); // 폐허 그래픽이 있으면 폐허가 된 뒤 사라집니다
```

`destroyCity()`는 public입니다. `startDestroyBuilding()`은 `internal`이지만 NML이 모드를 publicize된 어셈블리 기준으로 빌드하므로 컴파일됩니다. 왕국을 통째로 없애려면 도시를 하나씩 파괴하세요. 루프는 `kingdom.cities`의 사본에 대해 도세요. 라이브 목록에 대해 돌리면 `destroyCity()`가 실행될 때마다 목록이 바뀝니다.

## 전쟁 시작하기

```csharp
World.world.diplomacy.startWar(pAttacker, pDefender, WarTypeLibrary.normal);
```

위와 마찬가지로 `internal`입니다. 전쟁 유형은 `WarTypeLibrary`의 정적 필드입니다: `normal`, `spite`, `inspire`, `rebellion`, `whisper_of_war`, `clash`.

## 도시를 자기 종족 주민으로 채우기

```csharp
Subspecies main = city.getMainSubspecies();
WorldTile tile = city.getTile();
if (main == null || tile == null) return;

Actor actor = World.world.units.createNewUnit(city.getActorAsset().id, tile, pSubspecies: main, pAdultAge: true);
actor?.joinCity(city);
```

**[커스텀 액터](#/nml/custom-actors)**의 `spawnNewUnit`은 아종을 알아서 골라줍니다. `createNewUnit`은 아종을 직접 고를 수 있게 해 주는데, 이게 "인간 한 명"과 "바로 *이* 인간들 중 한 명"의 차이입니다.

## 부모 조회하기

```csharp
foreach (Actor parent in actor.getParents())
{
    // 살아 있는 부모만
}

long first = actor.data.parent_id_1;   // id는 사망 후에도 남습니다
```

`getParents()`는 살아 있는 부모만 반환합니다. 각 id를 `World.world.units.get(id)`로 조회해서 없거나 죽어 있으면 건너뜁니다. id는 유닛 데이터에 영원히 남지만, 게임은 그 인물에 대한 기록을 전혀 보관하지 않습니다. 죽은 조상까지 기억하는 가계도를 만들려면, 태어나는 순간 필요한 정보를 자식 자신의 데이터에 직접 적어 두는 수밖에 없습니다. **[데이터 저장 및 기억하기](#/nml/saving-data)** 참고, 월드 전체를 위해 무언가를 보관할 장소가 어디에도 없기 때문입니다 :PES_ThinkAboutIt:.
