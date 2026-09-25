---
title: Моддинг с BepInEx
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# Моддинг с BepInEx :PES5_BigBrain:

Почти всё руководство учит писать моды для **NeoModLoader**. С NML вы пишете обычные файлы `.cs` в Блокноте, запускаете игру, и код компилируется сам.

BepInEx всё равно, что вы чувствуете :PES2_Shrug:. Это старый универсальный фреймворк для моддинга Unity. Мод на BepInEx означает: настроить настоящий C#-проект, скомпилировать свою `.dll` и положить её в `BepInEx/plugins/`. Вы теряете мгновенную перезагрузку и удобные помощники для ассетов, но получаете полный контроль над процессом Unity ещё до того, как игра поймёт, что проснулась.

В этой части руководства три страницы: эта запускает плагин, **[Добавление контента через BepInEx](#/toolbox/bepinex-content)** учит его добавлять в игру настоящие вещи, а **[Отладка и публикация](#/toolbox/bepinex-publishing)** доводит его до других людей.

## BepInEx или NeoModLoader

Прежде чем тратить полдня на сборочный конвейер, выберите правильный инструмент:

| Вы хотите... | Берите | Почему |
| --- | --- | --- |
| Добавить черты (trait), предметы (item), божественные силы (GodPower), существ или биомы | **NML** | NML даёт `AssetManager` в нужный момент, папку `Locales`, `GameResources/`, кнопки и помощники для сохранений бесплатно |
| Сделать инструменты разработчика, оверлеи или хуки движка | **BepInEx** | BepInEx стартует на уровне Mono, до инициализации WorldBox |
| Править код в Блокноте и просто сохранять | **NML** | NML компилирует исходники C# во время работы |
| Выпустить готовый скомпилированный плагин с чистыми компонентами Unity | **BepInEx** | Флаги компилятора, зависимости и цель сборки вы контролируете сами |

Если добавляете игровой контент, пишите мод на NML. Если делаете инструмент вроде UnityExplorer или просто любите смотреть на вывод MSBuild в терминале, ваше место в BepInEx. Добавлять контент через BepInEx *можно*, следующая страница показывает как, но вы вручную собираете то, что NML даёт бесплатно.

## 1. Что нужно заранее

1. Установите **BepInEx 5 (Mono x64)** и включите консоль, как описано на странице **[Консоль в реальном времени (BepInEx)](#/toolbox/bepinex-console)**. Запустите игру один раз, чтобы BepInEx создал свои папки.
2. Установите **[.NET SDK](https://dotnet.microsoft.com/)** (или Visual Studio с разработкой классических приложений .NET). Для плагинов BepInEx нужен настоящий компилятор C#.

## 2. Настройка проекта

Откройте терминал в папке, где храните проекты, и создайте новую библиотеку классов:

```bash
dotnet new classlib -n HelloBepInEx
cd HelloBepInEx
```

Затем замените всё содержимое `HelloBepInEx.csproj` на это. Файл нацелен на ту же версию .NET, что и игра, один раз указывает на вашу папку WorldBox и при каждой сборке делает за вас три дела:

```xml HelloBepInEx.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>HelloBepInEx</AssemblyName>
    <Version>1.0.0</Version>
    <LangVersion>latest</LangVersion>
    <!-- Your WorldBox folder. Change this one line if Steam lives on another drive. -->
    <GameDir>C:\Program Files (x86)\Steam\steamapps\common\worldbox</GameDir>
  </PropertyGroup>

  <ItemGroup>
    <!-- Lets you build for net472 without installing the old .NET Framework developer pack -->
    <PackageReference Include="Microsoft.NETFramework.ReferenceAssemblies" Version="1.0.3" PrivateAssets="all" />
    <!-- Makes internal and private game code visible to your compiler, like NML does -->
    <PackageReference Include="BepInEx.AssemblyPublicizer.MSBuild" Version="0.4.3" PrivateAssets="all" />
  </ItemGroup>

  <ItemGroup>
    <!-- The game, publicized -->
    <Reference Include="$(GameDir)\worldbox_Data\Managed\Assembly-CSharp.dll" Publicize="true" Private="false" />
    <!-- Every Unity module: UnityEngine.dll alone does not have Input, UI or ImageConversion -->
    <Reference Include="$(GameDir)\worldbox_Data\Managed\UnityEngine*.dll" Private="false" />
    <!-- BepInEx and Harmony -->
    <Reference Include="$(GameDir)\BepInEx\core\BepInEx.dll" Private="false" />
    <Reference Include="$(GameDir)\BepInEx\core\0Harmony.dll" Private="false" />
  </ItemGroup>

  <!-- After every build, copy the plugin straight into the game -->
  <Target Name="CopyToGame" AfterTargets="Build">
    <Copy SourceFiles="$(TargetPath)" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
  </Target>
</Project>
```

Зачем нужна каждая часть:

- **`Private="false"`** у каждой ссылки на игру: папка сборки не копирует в себя весь движок игры :PESgn_SMH:.
- **`Publicize="true"`**: страницы про NML постоянно используют `internal`-члены игры, потому что NML компилирует против "публицированной" игры. Ваш проект BepInEx так не делает, пока вы не попросите. С этой строкой тот же код компилируется и здесь. Номера версий в `PackageReference` были самыми новыми стабильными на момент написания; если NuGet ругается, берите самую новую, которую он предлагает.
- **`UnityEngine*.dll`**: Unity разбит на много модулей. `Input` живёт в `UnityEngine.InputLegacyModule.dll`, интерфейс в `UnityEngine.UI.dll` и так далее. Если сослаться на все, не придётся искать, где "тип не найден".
- **`CopyToGame`**: больше не нужно копировать `.dll` вручную. Собрали, запустили игру, готово.

## 3. Каркас плагина

Плагин BepInEx это класс, унаследованный от `BaseUnityPlugin` и помеченный атрибутом `[BepInPlugin]`:

```csharp Plugin.cs
using BepInEx;
using BepInEx.Configuration;
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [BepInPlugin(PLUGIN_GUID, PLUGIN_NAME, PLUGIN_VERSION)]
    [BepInProcess("worldbox.exe")]
    public class HelloPlugin : BaseUnityPlugin
    {
        public const string PLUGIN_GUID = "com.example.hellobepinex";
        public const string PLUGIN_NAME = "HelloBepInEx";
        public const string PLUGIN_VERSION = "1.0.0";

        // BepInEx manages configuration files automatically
        private ConfigEntry<bool> configEnableLogs;
        private ConfigEntry<KeyCode> configHotkey;

        private void Awake()
        {
            // Bind configuration: section, key, default value, description
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

            // Apply any Harmony patches in this assembly
            Harmony harmony = new Harmony(PLUGIN_GUID);
            harmony.PatchAll();
        }

        private void Update()
        {
            // Standard Unity Update cycle
            if (Input.GetKeyDown(configHotkey.Value))
            {
                Logger.LogInfo("Hotkey pressed from BepInEx!");
            }
        }
    }
}
```

### По частям

- **`BaseUnityPlugin`**: наследуется прямо от `MonoBehaviour` из Unity. Ваш плагин это активный компонент на постоянном `GameObject`, который переживает смену сцен.
- **`[BepInPlugin(guid, name, version)]`**: говорит BepInEx, как называется ваш мод и какой у него уникальный идентификатор. Используйте обратную доменную запись (`com.author.modname`) и никогда не меняйте GUID после выпуска: к нему привязаны файл настроек и зависимости других плагинов.
- **`[BepInProcess("worldbox.exe")]`**: загружаться только внутри WorldBox. Здесь безвредно, а если кто-то положит ваш плагин в BepInEx другой игры, это спасёт от непонятного краша.
- **`Logger.LogInfo()`**: пишет прямо в консоль BepInEx и в `BepInEx/LogOutput.log`.
- **`Config.Bind()`**: создаёт типизированную настройку. При первом запуске плагина BepInEx создаёт аккуратный файл `BepInEx/config/com.example.hellobepinex.cfg`, который игроки могут править.

## 4. Подключаемся к игре через Harmony

В BepInEx Harmony уже лежит в `BepInEx/core/0Harmony.dll`. Добавьте класс патча в любое место проекта:

```csharp Patches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    // MapBox.startTheGame runs once the world exists: it is where the game sets Config.game_loaded
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.startTheGame))]
    public static class StartTheGamePatch
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            Debug.Log("[HelloBepInEx] The world is ready!");
        }
    }
}
```

Раз `Plugin.cs` вызвал `harmony.PatchAll()`, Harmony просматривает вашу скомпилированную сборку и применяет все классы патчей в ней. Всё, что вы знаете со страницы **[Патчи Harmony](#/nml/harmony-patches)**, работает так же: магические имена параметров, Prefix и Postfix, правила, как не ломать чужие моды.

## 5. Сборка и установка

Соберите проект из командной строки:

```bash
dotnet build -c Release
```

`.dll` появится в `bin/Release/net472/HelloBepInEx.dll`, а шаг `CopyToGame` сразу положит её в игру:

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

Запустите игру с включённой консолью. Вы увидите, как BepInEx находит и загружает вашу сборку:

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

> [!WARNING] Закройте игру перед сборкой
> Пока WorldBox запущен, он держит вашу `.dll` открытой, и копирование падает с "the process cannot access the file". Закрыть игру, собрать, запустить снова. Это и есть весь цикл разработки на BepInEx :PES2_Weary:.

## Суровая правда о моддинге на BepInEx

- **Нет горячей перезагрузки**: поменять одну строчку значит закрыть WorldBox, выполнить `dotnet build` и снова запустить игру. Если вы подбираете баланс боя или числа черт, это быстро надоедает. Частичный обход есть на странице **[Отладка и публикация](#/toolbox/bepinex-publishing)**.
- **`HideManagerGameObject`**: в `BepInEx/config/BepInEx.cfg` в разделе `[Chainloader]` поставьте `HideManagerGameObject = true`. Без этого некоторые процедуры очистки Unity могут уничтожить корневой объект BepInEx и тихо убить ваш плагин :PES5_Hmmmm:.
- **Вместе с NML**: NML и BepInEx спокойно живут в одной папке игры. Можно использовать NML для контентных модов, а BepInEx для инструментов вроде UnityExplorer, и они не будут драться.
- **Доступ к ассетам игры**: ваш плагин просыпается до того, как игра построит свои библиотеки (library) ассетов. Тронете `AssetManager` в `Awake()` и получите null. Следующая страница, **[Добавление контента через BepInEx](#/toolbox/bepinex-content)**, показывает точный момент, когда подключаться.
