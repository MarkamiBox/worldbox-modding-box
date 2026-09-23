---
title: Черты культуры
group: Игровой контент
subgroup: Черты и генетика
icon: :wbtiphat:
order: 106
---

# Черты культуры :wbtiphat:

**Культура** — это совокупность общих привычек и обычаев группы городов. Она определяет, что они строят, что куют, как передают наследство, что читают и что ценят. Черта культуры — это одна из таких привычек.

Из всех семи систем черт культура обладает наибольшим охватом. Культура распространяется вместе с городами, переживает своего основателя и внедряет свои характеристики в абсолютно каждого юнита, который к ней принадлежит. Если вам нужен мод, эффект которого плавно разворачивается по всему миру в течение часа игры, эта библиотека создана именно для этого.

| | |
| --- | --- |
| Библиотека | `AssetManager.culture_traits` |
| Класс | `CultureTrait` |
| Группы | `AssetManager.culture_trait_groups`, класс `CultureTraitGroupAsset` |
| Владелец в рантайме | `Culture`, в `World.world.cultures` |
| Префикс локализации | `culture_trait_` |
| Папка иконок по умолчанию | `ui/Icons/culture_traits/` |

## Регистрация черты

```csharp Mods/HelloBox/Code/HelloCulture.cs
namespace HelloBox
{
    public static class HelloCulture
    {
        public const string DUELLISTS = "hello_duellists";

        public static void Initialize()
        {
            if (AssetManager.culture_traits.has(DUELLISTS)) return;

            CultureTrait trait = new CultureTrait
            {
                id = DUELLISTS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "warfare",
                path_icon = "ui/Icons/iconHelloCulture",
                priority = 10,                       // чем выше значение, тем выше в группе
                spawn_random_trait_allowed = false,  // никогда не выдается случайно
                can_be_given = true,                 // игрок может выдать в редакторе
                can_be_removed = true,
                rarity = Rarity.R2_Epic
            };

            AssetManager.culture_traits.add(trait);

            // Предупреждение ниже: это затронет и крестьян, и солдат.
            trait.base_stats["critical_chance"] = 0.05f;
        }
    }
}
```

Все правила из раздела **[Кастомные черты](#/nml/custom-traits)** действуют и здесь: вызов `add()` перед характеристиками, `path_icon` не генерируется сам, к ID обязательно добавляется префикс. Ниже описано то, что делает черты культуры уникальными.

> [!WARNING] `base_stats` у черты культуры распространяется на всех
> `Actor.updateStats()` объединяет `culture.base_stats` с каждым юнитом данной культуры. С каждым юнитом без исключения. Доктрина "+5 к урону" вооружит в том числе и пекарей.
>
> Если бонус должен распространяться только на отдельных представителей, оставьте `base_stats` пустым и отфильтруйте логику самостоятельно в постфиксе Harmony для `Actor.updateStats`, см. **[Патчи Harmony](#/nml/harmony-patches)**. Если бонус должен действовать на культуру как на сообщество, а не на отдельных жителей, используйте вместо этого `base_stats_meta`, см. **[Справочник характеристик](#/nml/stats)**.

## Направление кузнечного дела культуры

Это поле есть исключительно у черт культуры, и это самый элегантный способ придать культуре яркую *индивидуальность*, не изменяя при этом ни единого оружия:

```csharp
trait.value = 10f;                       // насколько силен вес предпочтения
trait.addWeaponSubtype("sword");         // предпочитать целый класс оружия
trait.addWeaponSpecial("hello_relic");   // или конкретный ID предмета
```

Оба вспомогательных метода автоматически устанавливают `is_weapon_trait = true`. Код ремесла обращается к предпочтениям культуры, когда город решает, что ковать; это меняет реальное оружие в руках солдата, а не просто абстрактную цифру. В ванильной игре `bow_lovers` и `spear_lovers` устроены ровно таким образом.

| Поле | Назначение |
| --- | --- |
| `is_weapon_trait` | Помечает черту как предпочтение в оружии |
| `related_weapon_subtype_ids` | Предпочитаемые классы оружия. `addWeaponSubtype` добавляет сюда |
| `related_weapons_ids` | Предпочитаемые ID предметов. `addWeaponSpecial` добавляет сюда |
| `value` | Вес предпочтения при выборе |

## Направление строительства культуры

```csharp
trait.setTownLayoutPlan(pZoneCheckerDelegate);
```

Принимает `PassableZoneChecker` и устанавливает `town_layout_plan = true`. Именно так работают ванильные черты планировки поселений: города с колоннами, города с развитой дорожной сетью.

Это самый глубокий хук на этой странице и тот, который с наибольшей вероятностью вступит в конфликт с другим модом, так как культура может следовать лишь одному плану застройки одновременно. Проверьте `town_layout_plan` у уже имеющихся черт культуры, прежде чем полагать, что ваш план будет единственным.

## Ванильные группы

`harmony` · `architecture` · `town_plan` · `kingdom` · `buildings` · `succession` · `knowledge` · `warfare` · `weapons` · `craft` · `happiness` · `worldview` · `miscellaneous` · `fate` · `special`

Собственная вкладка: см. **[Группы черт и вкладки](#/nml/trait-groups)**, с `AssetManager.culture_trait_groups` и `CultureTraitGroupAsset`.

## Тексты локализации

```json Mods/HelloBox/Locales/en.json
{
  "culture_trait_hello_duellists": "Duellists",
  "culture_trait_hello_duellists_info": "They settle it one at a time, and they practise."
}
```

## Раздача черты

```csharp
// каждое существо данного вида начинает с этой чертой
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addCultureTrait(HelloCulture.DUELLISTS);
```

```csharp
// или в рантайме для уже существующих культур
foreach (Culture culture in World.world.cultures)
{
    if (culture == null || culture.isRekt()) continue;
    if (culture.hasTrait("hello_duellists")) continue;

    culture.addTrait("hello_duellists", pRemoveOpposites: true);
}
```

`hasTrait` и `addTrait` одинаково принимают как строку идентификатора, так и сам ассет.

## Проверка черты культуры у юнита

У `Actor` есть удобный встроенный метод именно для этой распространенной задачи:

```csharp
if (actor.hasCultureTrait("hello_duellists")) { }
```

> [!TIP] Культура или подвид?
> И те, и другие черты передаются, но принципиально по-разному. Черта **культуры** распространяется вместе с городами и может быть перенята любым жителем, присоединившимся к культуре. Черта **подвида** передается только по наследству при размножении. «Эльфы лучше стреляют из лука, потому что их так воспитали» — это культура; «эльфы лучше стреляют из лука из-за строения глаз» — это подвид. См. **[Черты подвидов](#/nml/subspecies-traits)** :catnoted:.
