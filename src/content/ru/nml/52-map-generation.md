---
title: Генерация карты
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbworld:
order: 169
---

# Генерация карты :wbworld:

Окно нового мира читает три библиотеки. `map_sizes` - переключатель размера, `map_gen_templates` - ряд карточек форм (`continent`, `islands`, `donut`...), а `map_gen_settings` - ползунки и переключатели, которые появляются после выбора карточки. Все три - обычные библиотеки ассетов. Только одна из них работает "из коробки", и я скажу вам, каким частям нужна работа с UI, прежде чем вы узнаете это на своей шкуре.

## Карта побольше

Размер - это `MapSizeAsset`, и в нём четыре поля:

| Поле | Назначение |
| --- | --- |
| `id` | Он же ключ перевода, с префиксом: `map_size_<id>` |
| `size` | Сторона карты в блоках по 64 тайла. У `iceberg` это `9`, то есть 576 x 576 |
| `path_icon` | Иконка рядом с названием размера, относительно `ui/Icons/` |
| `show_warning` | Меняет приветствие окна на предупреждение "эта карта большая" |

Ванильные: `tiny` 2 · `small` 3 · `standard` 4 · `large` 5 · `huge` 6 · `gigantic` 7 · `titanic` 8 · `iceberg` 9.

```csharp Mods/HelloBox/Code/HelloMapGen.cs
namespace HelloBox
{
    public static class HelloMapGen
    {
        public const string COLOSSAL = "hello_colossal";

        public static void Initialize()
        {
            AddColossal();
            AddRing();
        }

        public const string RING = "hello_ring";

        private static void AddRing()
        {
            if (AssetManager.map_gen_templates.has(RING)) return;

            MapGenTemplate ring = AssetManager.map_gen_templates.clone(RING, "donut");

            // values - обычный объект, так что клон разделяет его с donut. дайте ей свой, прежде чем трогать
            ring.values = new MapGenValues
            {
                gradient_round_edges = true,
                add_center_gradient_land = true,
                add_center_lake = true,
                ring_effect = true,
                perlin_noise_stage_2 = true,
                random_shapes_amount = 3
            };

            // reset копирует из резервной таблицы, заполненной при старте, а вашего id в ней нет
            ring.show_reset_button = false;
        }

        public static void OpenRing()
        {
            if (!AssetManager.map_gen_templates.has(RING)) return;

            Config.current_map_template = RING;
            ScrollWindow.showWindow("new_world_templates_2");
        }

        private static void AddColossal()
        {
            if (AssetManager.map_sizes.has(COLOSSAL)) return;

            AssetManager.map_sizes.add(new MapSizeAsset
            {
                id = COLOSSAL,
                size = 10,                   // 10 x 64 = 640 тайлов в стороне
                path_icon = "iconIceberg",   // ui/Icons/ подставляется автоматически
                show_warning = true
            });

            // переключатель размера читает массив, построенный в linkAssets(), который выполнился до вашего мода
            AssetManager.map_sizes.linkAssets();
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "map_size_hello_colossal": "Colossal"
}
```

> [!WARNING] Без `linkAssets()` размер недостижим
> Стрелки в окне не обходят библиотеку. Они обходят обычный `string[]`, который `MapSizeLibrary.linkAssets()` строит один раз при старте, до того как NML загрузит вас. Ваш размер зарегистрирован, а стрелки навсегда проходят мимо него. Повторный вызов `linkAssets()` лишь перестраивает этот массив, так что это безопасно.

Стрелки идут в порядке `list`, так что добавленный размер окажется после `iceberg`, и это как раз место для карты побольше. Для меньшего размера понадобятся `list.Remove` и `list.Insert(0, ...)` перед вызовом `linkAssets()`.

Что я могу сказать про ограничения, исходя из кода:

- **Workshop отказывает в загрузке.** Загрузка сверяет размер с `Config.maxMapSize`, а это `iceberg`, и отклоняет всё, что больше, с сообщением "Not a valid world size!".
- **Без вашего мода список сохранений показывает голые числа.** Браузер сохранений ищет размер по номеру и, если ничего не совпало, показывает "ширина x высота". Загрузится ли такое сохранение без вашего мода корректно, я не проверял.
- **Я не проверял, насколько далеко это можно зайти.** `10` - это на 23% больше тайлов, чем у `iceberg`, и каждый следующий шаг стоит дороже. Где-то там наверху есть число, которое не понравится компьютерам ваших игроков :PES5_Hmmmm:.

## Новая форма мира

Шаблон - это `MapGenTemplate`. Сам рецепт живёт в его `values`, остальное решает, как он представлен:

| Поле | Назначение |
| --- | --- |
| `values` | `MapGenValues`: флаги и числа, которые читает генератор. См. ниже |
| `path_icon` | Картинка предпросмотра, полный путь: `ui/new_world_templates_icons/template_donut` |
| `force_height_to` | Устанавливает всем тайлам эту высоту после первого прохода шума, до того как остальное придаст форму. `0` пропускает шаг |
| `freeze_mountains` | Замораживает вершины гор, когда земля готова |
| `perlin_replace` | Замены тайлов по высоте, например "выше 170 `soil_high` становится `soil_low`" |
| `special_anthill`, `special_checkerboard`, `special_cubicles` | Включают один из трёх жёстко заданных генераторов |
| `allow_edit_*` | Какие строки настроек видит игрок для этого шаблона. См. следующий раздел |
| `show_reset_button` | Есть ли в окне кнопка "сброс" |

Ванильные id, все годятся как источник для `clone()`: `continent` · `box_world` · `islands` · `toast` · `pancake` · `boring_plains` · `checkerboard` · `cubicles` · `dormant_volcano` · `cheese` · `bad_apple` · `donut` · `lasagna` · `chaos_pearl` · `anthill` · `empty`.

И поля `MapGenValues`, которые стоит знать:

| Поле | Назначение |
| --- | --- |
| `main_perlin_noise_stage`, `perlin_noise_stage_2`, `perlin_noise_stage_3` | Три прохода шума, создающие землю |
| `perlin_scale_stage_1` / `_2` / `_3` | Насколько приближен каждый проход. По умолчанию `5` |
| `gradient_round_edges` / `square_edges` | Плавно понижают высоту к краю карты, по кругу или по квадрату |
| `add_center_gradient_land`, `add_center_lake`, `center_gradient_mountains` | Сдвигают землю, озеро или горы к центру |
| `ring_effect` | Дополнительный проход шума в форме кольца |
| `add_mountain_edges` / `remove_mountains` | Горная граница вокруг карты / выравнивание гор до обычной земли |
| `low_ground` / `high_ground` | Понижают или поднимают землю после проходов шума |
| `random_shapes_amount` | Сколько случайных клякс добавится сверху |
| `random_biomes`, `add_vegetation`, `add_resources` | Последние три по умолчанию `true` |

`AddRing()` выше клонирует ванильный шаблон и даёт ему собственный рецепт. Держите все три метода в одном классе `HelloMapGen`.

```json Mods/HelloBox/Locales/en.json
{
  "template_hello_ring": "Ember Ring",
  "template_hello_ring_info": "A lake in the middle, land around it, and nobody asked for it."
}
```

> [!WARNING] Прячьте кнопку сброса на своих шаблонах
> "Reset" вызывает `resetTemplateValues()`, который читает значения шаблона по умолчанию из словаря, заполненного один раз при старте ванильными id. Вашего в нём нет, поэтому кнопка бросает `KeyNotFoundException`. `show_reset_button = false` - и проблемы не существует.

> [!WARNING] Клонированный шаблон разделяет свои `values`
> `clone()` копирует списки в новые списки, но `values` - обычный класс, так что копируется по ссылке (см. **[Библиотеки ассетов](#/nml/asset-libraries)**). Измените `ring.values.ring_effect` без строки `new MapGenValues`, и вместе с ним изменится каждый ванильный donut. Записи внутри `perlin_replace` разделяются точно так же: стройте новые, а не редактируйте существующие.

### Загвоздка: карточки нет

Селектор шаблонов - это префаб. В нём по одной кнопке на каждый ванильный шаблон, и каждая кнопка находит свой шаблон по собственному имени GameObject. Новый шаблон не получает кнопки, и ничто в библиотеке этого не меняет.

Что действительно работает - сделать работу кнопки самостоятельно: установить шаблон, затем открыть второе окно, в точности как это делает ванильная карточка.

Вызывайте `HelloMapGen.OpenRing()` из своей кнопки.

Повесьте это на обычную кнопку, см. **[Вкладки и кнопки сил](#/nml/power-buttons)**, и игрок получит ваш предпросмотр, ваши строки настроек, стрелки размера и кнопку генерации, как у любого ванильного шаблона. Добавить настоящую карточку в селектор означает клонировать одну из его кнопок и переименовать клон до того, как выполнится её `Awake()`, потому что именно тогда она читает своё имя. Это UI-хирургия, которую я не проверял, поэтому её на этой странице нет.

> [!NOTE] Вместо этого можно отредактировать ванильный шаблон
> `AssetManager.map_gen_templates.get("islands").values.random_shapes_amount = 10;` работает, и кнопка вообще не нужна. Только учтите: "reset" восстанавливает копию, снятую при старте, ещё до загрузки вашего мода. Один клик - и ваше изменение пропадает до следующего перезапуска.

## Строки под шаблоном

Каждый ползунок и переключатель во втором окне - это `MapGenSettingsAsset`:

| Поле | Назначение |
| --- | --- |
| `is_switch` | Вкл/выкл вместо числа |
| `min_value` / `max_value` | Диапазон, для числового значения |
| `allowed_check` | При текущем шаблоне - показывать ли эту строку |
| `action_get` / `action_set` | Чтение и запись значения, обычно в `values` текущего шаблона |
| `increase` / `decrease` / `action_switch` | Что делают стрелки и переключатель |

Ванильные строки: `gen_perlin_scale_stage_1` · `gen_perlin_scale_stage_2` · `gen_perlin_scale_stage_3` · `gen_random_shapes` · `gen_cubicles_sizes` · `gen_random_biomes` · `gen_mountain_edges` · `gen_add_vegetation` · `gen_add_resources` · `gen_add_center_lake` · `gen_add_center_land` · `gen_round_edges` · `gen_square_edges` · `gen_ring_effect` · `gen_low_ground` · `gen_high_ground` · `gen_remove_mountains` · `gen_forbidden_knowledge`.

Часть, которую мод реально использует: у каждой ванильной строки `allowed_check` читает один из флагов `allow_edit_*` вашего шаблона. Так что вы не добавляете строки, а выбираете, какие из них достанутся игроку:

```csharp
// в AddRing(), после клона: спрятать всё, затем вернуть строки, уместные для кольца
AssetManager.map_gen_templates.disableNormalSettings(ring);
ring.allow_edit_random_biomes = true;
ring.allow_edit_random_vegetation = true;
```

Забавная деталь: все три ползунка перлина проверяют `allow_edit_perlin_scale_stage_1`. Флаги `_2` и `_3` существуют, и их никто не читает :PES2_Shrug:.

Новый `MapGenSettingsAsset` сам по себе ничего не покажет. Строки вшиты в префаб окна и находят свой ассет по имени GameObject, тот же трюк, что и с карточками шаблонов. Собственная строка означает клонирование существующей внутри окна, и всё, что вы регистрируете, обязано иметь `allowed_check`, потому что окно вызывает его для каждой строки без проверки на null.

> [!TIP] Начинайте с формы, а не с настроек
> В девяти случаях из десяти вам нужен шаблон с другими `values` и кнопка, которая его открывает. Это не требует правок префаба. Проверяйте поля заново после обновления игры. Когда форма земли устраивает, **[Биомы](#/nml/biomes)** решают, что на ней растёт :PES2_Wise:.
