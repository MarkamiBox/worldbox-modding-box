---
title: Законы мира
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbworldlaws:
order: 176
---

# Законы мира :wbworldlaws:

Законы мира (world law) - это переключатели в окне **Законы мира**: "старость", "голод", "мирные монстры". Это самая удобная для игроков вещь, которую вы можете добавить, ведь она позволяет включать и выключать функции вашего мода без редактирования конфигурационных файлов.

К тому же это один из простейших ассетов во всей игре. Всего четыре поля.

## Добавление переключателя

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
                group_id = "units",                                  // на какой вкладке появится
                icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
                default_state = false                                // по умолчанию выключен
            });
        }
    }
}
```

Добавьте `HelloLaws.Initialize();` в `Main.cs`, и переключатель уже в игре. Это действительно всё :poggers:.

| Поле | Назначение |
| --- | --- |
| `id` | Имя вашего закона. Оно же ключ перевода |
| `group_id` | Вкладка, куда он попадает. Полный список - в разделе **Вкладки** ниже, либо сделайте свою |
| `icon_path` | Иконка, правила путей те же, что и везде |
| `default_state` | `true` = включен для новых миров, `false` = выключен |
| `can_turn_off` | По умолчанию `true`. Укажите `false` для закона, который можно только включить |

## Чтение состояния переключателя в коде

В этом и заключается весь смысл. Переключатель, который никто не читает, - это украшение. В любом месте вашего мода:

```csharp
WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);

if (law != null && law.isEnabled())
{
    // игрок хочет хаоса - дайте ему хаос
}
```

Или коротким путём, прямо из мира, без получения ассета:

```csharp
bool chaos = World.world.world_laws.isEnabled(HelloLaws.CHAOS);
```

`isEnabled(string)` возвращает `false` для неизвестного id вместо того, чтобы бросить исключение, так что опечатка читается как "выключено", а не как краш. Это удобно, но и ужасно, потому что вас никто не предупредит :PES5_Hmmmm:. `World.world.world_laws` - это `internal`, так что это компилируется против публицизированной сборки, с которой NML собирает ваш мод (см. примечание в **[Эффекты статуса](#/nml/status-effects)**). Путь через ассет выше работает везде.

Практический пример: спавнить угли только тогда, когда закон активен:

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

## Реакция в момент переключения

Если включение закона должно мгновенно что-то *сделать*, а не просто проверяться позже:

```csharp
new WorldLawAsset
{
    id = CHAOS,
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
    default_state = false,
    on_state_enabled = (PlayerOptionData pOption) => { /* выполняется, когда игрок включает закон */ }
};
```

## Вкладки

Окно разделено на вкладки, и `group_id` выбирает одну из них. Вот все ванильные группы, в том порядке, в котором окно их рисует:

`harmony` · `diplomacy` · `civilizations` · `units` · `mobs` · `spawn` · `nature` · `trees` · `plants` · `fungi` · `biomes` · `weather` · `disasters` · `other`

### Собственная вкладка

Замените `Initialize()` из первого примера версией ниже и добавьте `GROUP` рядом с `CHAOS`.

Группа - это `WorldLawGroupAsset` в `AssetManager.world_law_groups`. Это тот же крошечный `BaseCategoryAsset`, что используют вкладки черт, см. **[Группы черт и вкладки](#/nml/trait-groups)**:

| Поле | Назначение |
| --- | --- |
| `id` | То, на что указывает `group_id` закона |
| `name` | **Ключ локализации** для названия вкладки. Не само название |
| `color` | Строка hex. Окрашивает заголовок вкладки |

```csharp Mods/HelloBox/Code/HelloLaws.cs
public const string GROUP = "hello_laws";

public static void Initialize()
{
    // сначала группа: законы ниже указывают на неё
    if (!AssetManager.world_law_groups.has(GROUP))
    {
        AssetManager.world_law_groups.add(new WorldLawGroupAsset
        {
            id = GROUP,
            name = "world_laws_tab_" + GROUP,   // ключ локализации, не сам текст
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

Никакой работы с UI: окно законов мира строит по одной вкладке на каждую запись в `world_law_groups.list`, а затем раскладывает каждый закон по вкладке, названной в его `group_id`. Оно делает это один раз, при первом создании окна, а ваш мод к тому моменту уже давно загружен. Ваша вкладка окажется в самом конце, после `other`.

> [!WARNING] Несуществующий `group_id` ломает всё окно
> Окно ищет вкладку обычным индексом по словарю. Закон, указывающий на группу, которую никто не зарегистрировал, бросает `KeyNotFoundException` прямо во время построения окна, и каждый закон, зарегистрированный после него - ваш и чужих модов - никогда не попадает в окно. Регистрируйте группу раньше законов и пишите её id одинаково оба раза :PESgn_ToughLuck:.

## Тексты

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one.",
  "world_laws_tab_hello_laws": "HelloBox"
}
```

> [!WARNING] Законы мира используют `_title`, а не голый id
> Почти все остальные ассеты используют свой голый id как ключ имени. Законы мира хотят `<id>_title`. Ошибётесь, и переключатель появится вообще без подписи :PESgn_Really:.

> [!TIP] Закон лучше настройки
> Настройки мода живут в меню, которое игрок открывает один раз. Закон мира - прямо в игре, рядом с ванильными, для каждого мира свой, и его можно переключить посреди партии. Если у вашего мода есть поведение (behaviour) вкл/выкл, ему место здесь :wbblessed:.
