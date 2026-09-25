---
title: Добавление контента через BepInEx
group: BepInEx Modding
icon: :wbhammer:
order: 2
---

# Добавление контента через BepInEx :wbhammer:

Плагин BepInEx может добавлять черты (trait), предметы (item) и силы (GodPower), как любой мод на NML. Ему просто нужно вручную сделать три дела, которые NML молча делает за вас: дождаться игры, загрузить текст и загрузить графику. Эта страница делает все три для той же черты **Swift**, которую строит страница **[Свои черты](#/nml/custom-traits)**, чтобы вы могли сравнить их построчно.

Если у вас ещё нет проекта, начните со страницы **[Моддинг с BepInEx](#/toolbox/bepinex-modding)**.

## Правильный момент

`Awake()` вашего плагина выполняется очень рано, до того как WorldBox построит хоть одну библиотеку (library) ассетов. Там `AssetManager.traits` ещё null, и обращение к нему это `NullReferenceException` ещё до появления главного меню.

Нужный момент это конец `AssetManager.init()`. Этот единственный публичный метод строит все библиотеки, а затем вызывает у каждой `post_init()` и `linkAssets()`. Postfix от Harmony на нём выполняется сразу после, ровно там же, где живёт `OnModLoad` мода на NML. Всё, что страницы про NML говорят о "игра сделала это при запуске, до появления вашего мода, так что сделайте сами", здесь верно слово в слово.

## Код

```csharp Plugin.cs
using System.IO;
using BepInEx;
using HarmonyLib;

namespace HelloBepInEx
{
    [BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
    [BepInProcess("worldbox.exe")]
    public class HelloPlugin : BaseUnityPlugin
    {
        public static HelloPlugin Instance;

        /** The folder your .dll sits in, for loading your own files. */
        public static string Folder => Path.GetDirectoryName(Instance.Info.Location);

        private void Awake()
        {
            Instance = this;
            new Harmony("com.example.hellobepinex").PatchAll();

            // Installed while the game was already running? The libraries exist, go now.
            if (InitLibraries.initiated) HelloContent.Register();
        }
    }

    [HarmonyPatch(typeof(AssetManager), nameof(AssetManager.init))]
    public static class AssetsReadyPatch
    {
        [HarmonyPostfix]
        public static void Postfix() => HelloContent.Register();
    }

    [HarmonyPatch(typeof(LocalizedTextManager), nameof(LocalizedTextManager.setLanguage))]
    public static class LanguagePatch
    {
        // setLanguage throws the whole text table away and reloads it from the game files,
        // so our lines have to go back in after every language change.
        [HarmonyPostfix]
        public static void Postfix() => HelloContent.AddText();
    }
}
```

```csharp HelloContent.cs
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace HelloBepInEx
{
    public static class HelloContent
    {
        public const string SWIFT = "hello_swift";
        private const string ICON = "ui/Icons/iconHelloSwift";
        private static bool done;

        /** Text per language. English is the fallback for everything else. */
        private static readonly Dictionary<string, Dictionary<string, string>> Text =
            new Dictionary<string, Dictionary<string, string>>
            {
                ["en"] = new Dictionary<string, string>
                {
                    ["trait_hello_swift"] = "Swift",
                    ["trait_hello_swift_info"] = "Moves like the world owes it money."
                },
                ["it"] = new Dictionary<string, string>
                {
                    ["trait_hello_swift"] = "Rapido",
                    ["trait_hello_swift_info"] = "Si muove come se il mondo gli dovesse dei soldi."
                }
            };

        public static void Register()
        {
            if (done) return;
            done = true;

            // 1. The art, before anything asks for it. See "Your own art" below.
            string png = Path.Combine(HelloPlugin.Folder, "iconHelloSwift.png");
            if (File.Exists(png)) SpriteTextureLoader.addSprite(ICON, File.ReadAllBytes(png));

            // 2. The trait: exactly the Custom traits page, nothing BepInEx-specific.
            if (!AssetManager.traits.has(SWIFT))
            {
                ActorTrait swift = new ActorTrait
                {
                    id = SWIFT,
                    needs_to_be_explored = false,
                    path_icon = ICON,
                    group_id = "physique",
                    rate_birth = 0,
                    can_be_given = true,
                    can_be_removed = true
                };
                AssetManager.traits.add(swift);
                swift.base_stats["speed"] = 20f;
            }

            // 3. The text for the language that is already loaded.
            AddText();
        }

        public static void AddText()
        {
            if (LocalizedTextManager.instance == null) return;

            string lang = LocalizedTextManager.instance.language;
            if (!Text.TryGetValue(lang, out Dictionary<string, string> lines)) lines = Text["en"];

            foreach (KeyValuePair<string, string> line in lines)
            {
                // pReplace: true, or a second call logs "Already exists" for every line
                LocalizedTextManager.add(line.Key, line.Value, pReplace: true);
            }
        }
    }
}
```

Соберите, запустите игру, откройте юнита, и Swift будет во вкладке `physique` с названием, описанием и иконкой.

> [!NOTE] `LocalizedTextManager.instance.language` помечен как internal
> Это компилируется, потому что проект со страницы **[Моддинг с BepInEx](#/toolbox/bepinex-modding)** публицирует игру. Без publicizer вам пришлось бы запоминать язык самим.

## Три дела по очереди

### Дождаться игры

| NML | BepInEx |
| --- | --- |
| `OnModLoad()` выполняется, когда библиотеки готовы | Postfix на `AssetManager.init()` |
| NML следит, чтобы это выполнилось один раз | Это ваша забота: флаг `done` не даст запустить второй раз, если `Awake()` уже вызвал |

Если вы регистрируете что-то не вовремя, лог скажет: `NullReferenceException`, указывающий на `AssetManager.<что-то>`, значит слишком рано.

### Текст

NML читает вашу папку `Locales/` и применяет её заново при каждой смене языка. В BepInEx и то и другое делаете вы, и патч на `setLanguage` это та часть, о которой все забывают: на английском всё работает, игрок переключается на итальянский, и ваша черта вдруг называется `trait_hello_swift` :wbfacepalm:.

Имена ключей те же, что и во всём руководстве, так что таблица на странице **[Локализация](#/nml/localization)** по-прежнему верна. `LocalizedTextManager.add` сам переводит ключ в snake_case, как в файлах игры.

### Своя графика

В BepInEx нет папки `GameResources/`. Зато есть `SpriteTextureLoader.addSprite(path, bytes)`: он читает PNG откуда угодно и регистрирует его под любым путём, с опорной точкой по центру и фильтрацией для пиксель-арта. После этого `path_icon = "ui/Icons/iconHelloSwift"` находит его, как ванильный спрайт.

Два правила:

- **Регистрируйте до того, как кто-то запросит этот путь.** Игра запоминает каждый путь, который искала, даже неудачный, а `addSprite` отказывается принимать уже запомненный путь. В самом начале `Register()` это безопасно.
- **Это одна картинка, а не папка кадров.** Иконки, иконки предметов и кнопки сил это одиночные картинки, с ними всё работает. Всё, что руководство отмечает как **папку** (анимации дропа, эффекты статусов, снаряды, клетки, спрайты зданий), грузится через `getSpriteList()`, а его `addSprite` не заполняет. Для этого возьмите ванильный путь или сделайте эту часть мода на NML.

Положите PNG рядом со своей `.dll`:

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

Чтобы сборка копировала и его, добавьте строку в цель `CopyToGame` вашего `.csproj`:

```xml HelloBepInEx.csproj
<Copy SourceFiles="iconHelloSwift.png" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
```

## Что не переносится из NML

Некоторые страницы опираются на помощники NML, которых в BepInEx нет. Вот что делать вместо них:

| Страница про NML использует | В BepInEx |
| --- | --- |
| Папку `Locales/` | Приём `AddText()` выше |
| `GameResources/` | `SpriteTextureLoader.addSprite` для одиночных картинок, ванильные пути для папок |
| `TabManager`, `PowerButtonCreator` (кнопки сил) | Аналога нет. Постройте интерфейс сами на Unity или сделайте кнопки частью мода на NML |
| Окно настроек `ModConfig` | `Config.Bind()` из BepInEx, настройки правятся в файле `.cfg` |
| Свои данные в сохранении | Игровые `data.set` / `data.get` у юнитов работают так же, см. **[Сохранение данных](#/nml/saving-data)** |
| Кнопку перезагрузки | Её нет. Закрыть, собрать, запустить |

Всё, что является обычным кодом игры, а это большая часть каждой страницы, работает без изменений: ассеты, характеристики, статусы, патчи Harmony, ИИ, законы мира.

Когда что-то сломается, на странице **[Отладка и публикация](#/toolbox/bepinex-publishing)** собраны ошибки, которые вы встретите скорее всего.
