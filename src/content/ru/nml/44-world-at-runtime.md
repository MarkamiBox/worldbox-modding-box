---
title: Мир во время выполнения
group: Game Content
subgroup: Architecture & Stats
icon: :wbworld:
order: 96
---

# Мир во время выполнения :wbworld:

Все остальные страницы регистрируют вещи во время загрузки игры. Эта страница посвящена второй половине: работе с тем, что уже существует в запущенном мире, и его изменению. Уничтожить город, передать его другому королевству (kingdom), начать войну (war), заселить город его собственными жителями.

Всё это выполняется из `click_action` божественной силы (GodPower), из `Update()` или из world behaviour, и **никогда** из `OnModLoad`, где мира ещё не существует. См. **[Логи и отладка](#/nml/logs-and-debugging)** для проверки условий безопасности, и **[Каждый кадр](#/nml/update-loops)** для вызова из `Update()` без вреда для частоты кадров игрока.

## Перебор существующих объектов

```csharp
if (World.world == null || Config.worldLoading) return;

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

`World.world.kingdoms` работает аналогично, см. **[Королевства и фракции](#/nml/kingdoms)**. Вызывайте `isRekt()` для каждого элемента без исключения: эти списки содержат объекты, которые могут умирать прямо в этот момент :PES2_F:.

Подобный цикл вполне нормален однократно по клику. Каждый кадр по всем зданиям — уже нет: запускайте его по таймеру, см. **[Каждый кадр](#/nml/update-loops)**.

## Передача города другому королевству

```csharp
city.joinAnotherKingdom(pNewSetKingdom: kingdom);
```

`pCaptured: true` засчитывает его как захваченный для статистики, `pRebellion: true` — как восстание. Юниты следуют за своим городом.

## Уничтожение объектов

```csharp
city.destroyCity();              // город исчезает, его зоны снова становятся свободными
building.startDestroyBuilding(); // превращается в руины при наличии спрайта руин, затем исчезает
```

`destroyCity()` публичный. `startDestroyBuilding()` объявлен как `internal`: он компилируется, потому что NML собирает ваш мод с публицизированной сборкой. Чтобы уничтожить королевство, уничтожайте его города по очереди: перебирайте копию `kingdom.cities`, а не активный список, так как каждый `destroyCity()` модифицирует его.

## Начало войны

```csharp
if (World.world == null || Config.worldLoading || pAttacker == null || pDefender == null) return;
World.world.diplomacy.startWar(pAttacker, pDefender, WarTypeLibrary.normal);
```

`internal`, как и выше. Типы войн — это статические поля в `WarTypeLibrary`: `normal`, `spite`, `inspire`, `rebellion`, `whisper_of_war`, `clash`.

## Заселение города его собственными жителями

```csharp
if (World.world == null || Config.worldLoading || city == null || city.isRekt()) return;

Subspecies main = city.getMainSubspecies();
WorldTile tile = city.getTile();
if (main == null || tile == null) return;

Actor actor = World.world.units.createNewUnit(city.getActorAsset().id, tile, pSubspecies: main, pAdultAge: true);
actor?.joinCity(city);
```

`spawnNewUnit` из раздела **[Кастомные существа](#/nml/custom-actors)** выбирает подвид (subspecies) за вас. `createNewUnit` позволяет выбрать его вручную — в этом разница между «человеком» и «одним из *этих* людей».

## Родители

```csharp
foreach (Actor parent in actor.getParents())
{
    // только те, кто ещё жив
}

long first = actor.data.parent_id_1;   // идентификаторы сохраняются после смерти
```

`getParents()` возвращает только живых родителей: метод ищет каждый ID через `World.world.units.get(id)` и пропускает отсутствующих или мёртвых. Идентификаторы остаются в данных юнита навсегда, но игра не сохраняет информацию об умерших персонажах. Генеалогическое древо, помнящее умерших, должно записывать нужные данные в каждого ребёнка при рождении, см. **[Сохранение данных](#/nml/saving-data)**. У мира также есть собственное хранилище, но это один плоский список ключей, а не место для хранения десяти тысяч генеалогических деревьев :PES_ThinkAboutIt:.
