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
| `group_id` | Вкладка, куда он попадает: `units`, `civilizations`, `spawn`, `diplomacy`, `nature`, … |
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

## Тексты

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one."
}
```

> [!WARNING] Законы мира используют `_title`, а не голый id
> Почти все остальные ассеты используют свой голый id как ключ имени. Законы мира хотят `<id>_title`. Ошибётесь, и переключатель появится вообще без подписи :PESgn_Really:.

> [!TIP] Закон лучше настройки
> Настройки мода живут в меню, которое игрок открывает один раз. Закон мира - прямо в игре, рядом с ванильными, для каждого мира свой, и его можно переключить посреди партии. Если у вашего мода есть поведение (behaviour) вкл/выкл, ему место здесь :wbblessed:.
