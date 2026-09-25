---
title: Настройки игры
group: Игровой контент
subgroup: Божественные силы и интерфейс
icon: :wbsettingsgear:
order: 206
---

# Настройки игры :wbsettingsgear:

В **[Настройки мода](#/nml/mod-config)** вы видели собственное окно конфигурации NML (`default_config.json`), которое даёт вашему моду отдельную, аккуратную вкладку настроек.

У WorldBox есть и собственная нативная система настроек: `AssetManager.options_library`, опирающаяся на `PlayerConfig`. Именно эта система приводит в действие ванильное окно настроек, переключатели разработчика и кнопки-переключатели сил бога. Рядом с ней стоит `AssetManager.time_scales`, управляющая скоростью хода мира.

## Регистрация нативной настройки

Настройки в `AssetManager.options_library` - это экземпляры `OptionAsset`:

```csharp Mods/HelloBox/Code/HelloOptions.cs
namespace HelloBox
{
    public static class HelloOptions
    {
        public const string TURBO_HARVEST = "hello_turbo_harvest";

        public static void Initialize()
        {
            if (AssetManager.options_library.has(TURBO_HARVEST)) return;

            OptionAsset option = new OptionAsset
            {
                id = TURBO_HARVEST,
                type = OptionType.Bool,
                default_bool = false,
                translation_key = "option_hello_turbo_harvest",
                translation_key_description = "option_desc_hello_turbo_harvest",
                action = (OptionAsset pAsset) =>
                {
                    bool active = IsTurboActive();
                    Main.Log("Turbo harvest is now: " + active);
                }
            };

            AssetManager.options_library.add(option);

            // Регистрация ассета НЕ заполняет PlayerConfig.dict автоматически.
            // Убедитесь, что значение существует, чтобы ваш код мог прочитать его немедленно:
            if (!PlayerConfig.dict.ContainsKey(TURBO_HARVEST))
            {
                PlayerConfig.dict.Add(TURBO_HARVEST, new PlayerOptionData
                {
                    name = TURBO_HARVEST,
                    boolVal = option.default_bool
                });
            }
        }

        public static bool IsTurboActive()
        {
            if (PlayerConfig.dict.TryGetValue(TURBO_HARVEST, out PlayerOptionData data))
            {
                return data.boolVal;
            }
            return false;
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "option_hello_turbo_harvest": "Turbo Harvest",
  "option_desc_hello_turbo_harvest": "Settlers gather crops at triple speed."
}
```

### Поля OptionAsset

| Поле | Назначение |
| --- | --- |
| `id` | Уникальный идентификатор настройки |
| `type` | `OptionType.Bool`, `OptionType.Int` или `OptionType.String` |
| `default_bool` / `default_int` / `default_string` | Значение по умолчанию, пока не установлено |
| `translation_key` | Ключ локализации для названия настройки |
| `translation_key_description` | Ключ локализации для подсказки |
| `action` | Делегат обратного вызова (`ActionOptionAsset`), срабатывающий при изменении настройки |
| `reset_to_default_on_launch` | Сбрасывать ли эту настройку к значению по умолчанию при старте игры |
| `computer_only` | Если true, показывается только на ПК-сборках |

> [!WARNING] OptionAsset - это не хранилище
> `OptionAsset` описывает только метаданные и обратный вызов настройки. Само значение, которое переключил игрок, живёт в `PlayerConfig.dict[id]`. Если вы добавите `OptionAsset`, не вставив соответствующий `PlayerOptionData` в `PlayerConfig.dict`, любой код, пытающийся обратиться по индексу `PlayerConfig.dict[id]`, бросит `KeyNotFoundException` - пока окно настроек не будет сохранено!

## Привязка к кнопкам-переключателям

Нативные настройки раскрываются в паре с кнопками-переключателями `GodPower` на панели сил.

Как объяснено в **[Вкладки и кнопки сил](#/nml/power-buttons)**, установка `power.toggle_name = HelloOptions.TURBO_HARVEST` привязывает кнопку прямо к состоянию вашей настройки. При клике игра переключает `PlayerConfig.dict[toggle_name].boolVal`, обновляет визуальную подсветку кнопки и вызывает обратный вызов вашей настройки.

## Скорость симуляции и шкалы времени

WorldBox управляет скоростью симуляции игры через `AssetManager.time_scales` (`WorldTimeScaleLibrary`). Каждая настройка скорости - это `WorldTimeScaleAsset`:

```csharp Mods/HelloBox/Code/HelloSpeed.cs
namespace HelloBox
{
    public static class HelloSpeed
    {
        public const string HYPER = "hello_hyper_speed";

        public static void Initialize()
        {
            if (AssetManager.time_scales.has(HYPER)) return;

            WorldTimeScaleAsset hyper = new WorldTimeScaleAsset
            {
                id = HYPER,
                locale_key = "speed_hello_hyper",
                multiplier = 10f,          // 10-кратная скорость симуляции мира
                ticks = 2,                 // подтиков симуляции за кадр
                conway_ticks = 2,          // тиков клеточного автомата за кадр (огонь, кислота, температура)
                path_icon = "ui/Icons/iconClockX5"
            };

            AssetManager.time_scales.add(hyper);
        }
    }
}
```

| Поле | Назначение |
| --- | --- |
| `multiplier` | Множитель визуальной и мировой скорости (`1f` = обычная, `0.5f` = замедление) |
| `ticks` | Сколько проходов симуляции выполняется за кадр |
| `conway_ticks` | Сколько проходов клеточного автомата (распространение тайлов, лава, лёд) выполняется за кадр |
| `locale_key` | Ключ перевода, показываемый при наведении на кнопку часов |
| `path_icon` | Путь к иконке внутри `ui/Icons/` |

Ванильные скорости: `slow_mo` (0.5x), `x1` (1x), `x2` (2x), `x3` (3x), `x4` (4x) и `x5` (5x). Sonic speed (Greg speed в отладочных настройках) поднимает тики симуляции ещё выше.

Чтобы включить скорость программно:

```csharp
// Плавно переключить мировые часы на ваш ассет скорости:
WorldTimeScaleAsset target = AssetManager.time_scales.get(HelloSpeed.HYPER);
if (target != null)
{
    Config.time_scale_asset = target;
}
```

## Какой путь настроек выбрать?

| Потребность | Рекомендуемый путь |
| --- | --- |
| Настройки, специфичные для мода (множители урона, число спавнов, переключаемые функции) | **[Настройки мода](#/nml/mod-config)** (`default_config.json`). Живут на карточке вашего мода, аккуратно обрабатывают числа/строки и не засоряют интерфейс базовой игры |
| Переключатели, привязанные к кнопкам панели | Нативный `OptionAsset` + `GodPower.toggle_name` |
| Собственные скорости игры или темп симуляции | `AssetManager.time_scales` (`WorldTimeScaleAsset`) |

Далее: **[Сообщения и журнал мира](#/nml/messages-and-world-log)** про показ подсказок и запись истории мира.
