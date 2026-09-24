---
title: Моддинг с BepInEx
group: Обзор
subgroup: Внешние инструменты и настройка
icon: :csharp:
order: 9
---

# Моддинг с BepInEx :csharp:

Большая часть этого руководства посвящена созданию модов для **NeoModLoader**. NML позволяет писать обычные файлы `.cs` в Блокноте, запускать игру и наблюдать за мгновенной компиляцией.

BepInEx плевать хотел на ваши чувства :PES2_Shrug:. Это проверенный временем универсальный фреймворк для моддинга Unity. Создание мода на BepInEx требует настройки полноценного C#-проекта, компиляции собственной `.dll` и размещения ее в `BepInEx/plugins/`. Вы теряете горячую перезагрузку и готовые вспомогательные методы ассетов, но получаете полный контроль над движком Unity еще до того, как игра поймет, что она запущена.

## BepInEx против NeoModLoader

Прежде чем тратить целый вечер на настройку сборки, выберите подходящий инструмент:

| Задача | Выбор | Почему |
| --- | --- | --- |
| Черты, предметы, силы, существа, биомы | **NML** | NML предоставляет `AssetManager`, локализацию, спрайты и сохранение данных из коробки |
| Инструменты разработчика, оверлеи, низкоуровневые хуки | **BepInEx** | BepInEx стартует на уровне Mono еще до инициализации WorldBox |
| Правка кода в Блокноте и сохранение | **NML** | NML компилирует исходники C# прямо во время запуска игры |
| Распространение готового бинарного плагина с чистыми компонентами Unity | **BepInEx** | Вы сами контролируете компилятор, зависимости и параметры сборки |

Для игрового контента используйте NML. Для инструментов вроде UnityExplorer идеально подходит BepInEx.

## 1. Предварительные требования

1. Установите **BepInEx 5 (Mono x64)** и включите консоль, как описано в разделе **[Живая консоль (BepInEx)](#/toolbox/bepinex-console)**.
2. Установите **[.NET SDK](https://dotnet.microsoft.com/)** (или Visual Studio). Для сборки плагинов BepInEx требуется настоящий компилятор C#.

## 2. Настройка проекта

Откройте командную строку в папке проектов и создайте новую библиотеку классов:

```bash
dotnet new classlib -n HelloBepInEx -f net472
cd HelloBepInEx
```

Откройте `HelloBepInEx.csproj` в редакторе и добавьте ссылки на библиотеки игры и BepInEx:

```xml HelloBepInEx.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>HelloBepInEx</AssemblyName>
    <Version>1.0.0</Version>
    <LangVersion>latest</LangVersion>
  </PropertyGroup>

  <ItemGroup>
    <!-- Game assemblies from worldbox_Data/Managed -->
    <Reference Include="Assembly-CSharp">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\Assembly-CSharp.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="UnityEngine">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\UnityEngine.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="UnityEngine.CoreModule">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\UnityEngine.CoreModule.dll</HintPath>
      <Private>false</Private>
    </Reference>

    <!-- BepInEx and Harmony from BepInEx/core -->
    <Reference Include="BepInEx">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\core\BepInEx.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="0Harmony">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\core\0Harmony.dll</HintPath>
      <Private>false</Private>
    </Reference>
  </ItemGroup>
</Project>
```

Скорректируйте пути, если библиотека Steam находится на другом диске. Тег `<Private>false</Private>` предотвратит копирование файлов движка в папку сборки :PESgn_SMH:.

## 3. Каркас плагина

Плагин BepInEx представляет собой класс, наследуемый от `BaseUnityPlugin` и помеченный атрибутом `[BepInPlugin]`:

```csharp Plugin.cs
using BepInEx;
using BepInEx.Configuration;
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [BepInPlugin(PLUGIN_GUID, PLUGIN_NAME, PLUGIN_VERSION)]
    public class HelloPlugin : BaseUnityPlugin
    {
        public const string PLUGIN_GUID = "com.markami.hellobepinex";
        public const string PLUGIN_NAME = "HelloBepInEx";
        public const string PLUGIN_VERSION = "1.0.0";

        private ConfigEntry<bool> configEnableLogs;
        private ConfigEntry<KeyCode> configHotkey;

        private void Awake()
        {
            configEnableLogs = Config.Bind(
                "General",
                "EnableLogs",
                true,
                "Print debug messages to the BepInEx console."
            );

            configHotkey = Config.Bind(
                "Controls",
                "ToggleKey",
                KeyCode.F7,
                "Key to press to trigger the plugin action."
            );

            if (configEnableLogs.Value)
            {
                Logger.LogInfo($"{PLUGIN_NAME} loaded successfully!");
            }

            Harmony harmony = new Harmony(PLUGIN_GUID);
            harmony.PatchAll();
        }

        private void Update()
        {
            if (Input.GetKeyDown(configHotkey.Value))
            {
                Logger.LogInfo("Hotkey pressed from BepInEx!");
            }
        }
    }
}
```

### Разбор ключевых элементов

- **`BaseUnityPlugin`**: наследуется от `MonoBehaviour` движка Unity. Плагин становится активным компонентом на постоянном `GameObject`, сохраняющемся между сценами.
- **`[BepInPlugin(guid, name, version)]`**: сообщает BepInEx имя и уникальный идентификатор мода в формате обратного домена (`com.author.modname`).
- **`Logger.LogInfo()`**: выводит строки напрямую в живую консоль BepInEx и записывает их в `BepInEx/LogOutput.log`.
- **`Config.Bind()`**: регистрирует типизированный параметр. При первом запуске BepInEx сам создаст файл конфигурации `BepInEx/config/com.markami.hellobepinex.cfg`.

## 4. Патчинг игры через Harmony

В BepInEx библиотека Harmony уже встроена в `BepInEx/core/0Harmony.dll`. Добавьте класс патча в проект:

```csharp Patches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [HarmonyPatch(typeof(World), nameof(World.init))]
    public static class WorldInitPatch
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            Debug.Log("[HelloBepInEx] World initialized from BepInEx patch!");
        }
    }
}
```

Поскольку в `Plugin.cs` был вызван `harmony.PatchAll()`, BepInEx автоматически найдет и применит все патчи при старте.

## 5. Сборка и установка

Скомпилируйте проект через терминал:

```bash
dotnet build -c Release
```

Готовая библиотека появится по пути `bin/Release/net472/HelloBepInEx.dll`.

1. Перейдите в папку WorldBox: `C:\Program Files (x86)\Steam\steamapps\common\worldbox\`.
2. Внутри `BepInEx/plugins/` создайте папку `HelloBepInEx`.
3. Скопируйте `HelloBepInEx.dll` в `BepInEx/plugins/HelloBepInEx/`.

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

Запустите игру с включенной консолью. BepInEx загрузит ваш плагин:

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

## Суровая правда о моддинге на BepInEx

- **Нет горячей перезагрузки**: любое изменение требует закрытия игры, компиляции через `dotnet build` и нового запуска.
- **`HideManagerGameObject`**: в `BepInEx/config/BepInEx.cfg` убедитесь, что включен параметр `HideManagerGameObject = true`, иначе стандартная очистка Unity может удалить объект BepInEx :PES5_Hmmmm:.
- **Совместимость с NML**: NML и BepInEx отлично уживаются в одной папке игры и не мешают друг другу.
- **Доступ к ресурсам игры**: BepInEx работает на чистом уровне Unity. Чтобы спавнить юнитов или регистрировать предметы, дождитесь инициализации `AssetManager` или подключите `NeoModLoader.dll`.
