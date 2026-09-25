---
title: Вкладки сил и кнопки
group: Игровой контент
subgroup: Божественные силы и интерфейс
icon: :wbfingerclick:
order: 202
---

# Вкладки сил и кнопки :wbfingerclick:

Вы зарегистрировали божественную силу (GodPower). Никто не может нажать на нее, ведь `GodPower` - это просто данные: то, на что игрок физически нажимает, называется **PowerButton**, а кнопки живут внутри **вкладок** на нижней панели.

## Создание собственной вкладки

Вы *можете* добавить кнопку на одну из ванильных вкладок. Не надо. Они уже заполнены, игра расставляет дочерние элементы по имени, а панель прокручивается, так что ваша кнопка окажется там, куда игрок никогда не долистает :PESgn_ToughLuck:.

Своя вкладка, и всё, что вы добавите, лежит вместе и легко находится:

```csharp Mods/HelloBox/Code/HelloPowers.cs
using NeoModLoader.api;
using NeoModLoader.General;
using NeoModLoader.General.UI.Tab;
using UnityEngine;

namespace HelloBox
{
    public static class HelloPowers
    {
        public const string STRIKE         = "hello_strike";
        public const string DROP_POWER     = "hello_drop_power";
        public const string CLOUD_POWER    = "hello_cloud_power";
        public const string BOLT_POWER     = "hello_bolt_power";
        public const string STATUS_POWER   = "hello_status_power";
        public const string BUILD_POWER    = "hello_build_power";
        public const string TILE_POWER     = "hello_tile_power";
        public const string SPAWN_POWER    = "hello_spawn_power";
        public const string DISASTER_POWER = "hello_disaster_power";
        public const string SPAWN_WISP     = "hello_spawn_wisp";
        public const string SPAWN_GOLEM    = "hello_spawn_golem";

        private const string TAB = "Tab_HelloBox";
        private static PowersTab tab;
        private static bool laid_out;

        public static void Initialize()
        {
            Powers();
            Tab();
        }

        private static void Powers()
        {
            // -- 1. earthquake strike (from God powers page) --
            if (AssetManager.powers.get(STRIKE) == null)
            {
                GodPower strike = new GodPower
                {
                    id = STRIKE, name = STRIKE,
                    rank = PowerRank.Rank0_free,
                    path_icon = "ui/Icons/iconHelloStrike",
                    unselect_when_window = true,
                    show_tool_sizes = false,
                    click_action = (WorldTile pTile, string pPowerID) =>
                    {
                        if (pTile == null) return false;
                        EffectsLibrary.spawnExplosionWave(pTile.posV3, 3f, 0.5f);
                        Earthquake.startQuake(pTile);
                        return true;
                    }
                };
                AssetManager.powers.add(strike);
            }

            // -- 2. rain embers (from Drops page) --
            if (AssetManager.powers.get(DROP_POWER) == null)
            {
                GodPower drop = new GodPower
                {
                    id = DROP_POWER, name = DROP_POWER,
                    rank = PowerRank.Rank0_free,
                    path_icon = "ui/Icons/iconHelloDrop",
                    click_action = (WorldTile pTile, string pPowerID) =>
                    {
                        if (pTile == null) return false;
                        World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);
                        foreach (WorldTile n in pTile.neighboursAll)
                            World.world.drop_manager.spawn(n, "hello_ember", 15f, -1f, -1L);
                        return true;
                    }
                };
                AssetManager.powers.add(drop);
            }

            // -- 3. spawn cloud (from Clouds page) --
            if (AssetManager.powers.get(CLOUD_POWER) == null)
            {
                GodPower cloud = new GodPower
                {
                    id = CLOUD_POWER, name = CLOUD_POWER,
                    rank = PowerRank.Rank0_free,
                    path_icon = "ui/Icons/iconHelloCloud",
                    click_action = (WorldTile pTile, string pPowerID) =>
                    {
                        if (pTile == null) return false;
                        EffectsLibrary.spawn("fx_cloud", pTile, HelloClouds.EMBER);
                        MusicBox.playSound("event:/SFX/UNIQUE/SpawnCloud", pTile.pos.x, pTile.pos.y);
                        return true;
                    }
                };
                AssetManager.powers.add(cloud);
            }

            // -- 4. fire projectile at the nearest unit (from Projectiles page) --
            if (AssetManager.powers.get(BOLT_POWER) == null)
            {
                GodPower bolt = new GodPower
                {
                    id = BOLT_POWER, name = BOLT_POWER,
                    rank = PowerRank.Rank0_free,
                    path_icon = "ui/Icons/iconHelloBolt",
                    click_action = (WorldTile pTile, string pPowerID) =>
                    {
                        if (pTile == null) return false;
                        Actor target = null;
                        foreach (Actor a in Finder.getUnitsFromChunk(pTile, 1, 8f))
                        {
                            if (a != null && a.isAlive()) { target = a; break; }
                        }
                        if (target == null) return false;
                        Vector3 launch = pTile.posV3;
                        launch.y += 6f;
                        // No shooter means no kingdom, and the projectile manager keys a
                        // dictionary on it every frame. "nature" is the game's own neutral owner.
                        World.world.projectiles.spawn(
                            null, target, HelloProjectiles.EMBER_BOLT,
                            launch, target.current_tile.posV3,
                            pForcedKingdom: World.world.kingdoms_wild.get("nature"));
                        return true;
                    }
                };
                AssetManager.powers.add(bolt);
            }

            // -- 5. curse the nearest unit (from Status effects page) --
            if (AssetManager.powers.get(STATUS_POWER) == null)
            {
                GodPower status = new GodPower
                {
                    id = STATUS_POWER, name = STATUS_POWER,
                    rank = PowerRank.Rank0_free,
                    path_icon = "ui/Icons/iconHelloStatus",
                    click_action = (WorldTile pTile, string pPowerID) =>
                    {
                        if (pTile == null) return false;
                        Actor target = null;
                        foreach (Actor a in Finder.getUnitsFromChunk(pTile, 1, 4f))
                        {
                            if (a != null && a.isAlive()) { target = a; break; }
                        }
                        if (target == null) return false;
                        StatusAsset asset = AssetManager.status.get(HelloStatus.CURSED);
                        if (asset == null) return false;
                        World.world.statuses.newStatus(target, asset, 0f);
                        return true;
                    }
                };
                AssetManager.powers.add(status);
            }

            // -- 6. place a building (from Custom buildings page) --
            // addBuilding is internal: needs a publicised Assembly-CSharp.dll
            if (AssetManager.powers.get(BUILD_POWER) == null)
            {
                GodPower build = new GodPower
                {
                    id = BUILD_POWER, name = BUILD_POWER,
                    rank = PowerRank.Rank0_free,
                    path_icon = "ui/Icons/iconHelloBuilding",
                    click_action = (WorldTile pTile, string pPowerID) =>
                    {
                        if (pTile == null) return false;
                        BuildingAsset asset = AssetManager.buildings.get(HelloBuildings.SHRINE);
                        if (asset == null) return false;
                        Building placed = World.world.buildings.addBuilding(asset, pTile);
                        if (placed == null) return false;

                        // What the game itself does for a building dropped outside any city:
                        // owned by nature, and finished instead of a construction site.
                        placed.kingdom = World.world.kingdoms_wild.get("nature");
                        placed.updateBuild(10000);
                        return true;
                    }
                };
                AssetManager.powers.add(build);
            }

            // -- 7. paint hello_moss on a tile (from Tiles page) --
            if (AssetManager.powers.get(TILE_POWER) == null)
            {
                GodPower tile = new GodPower
                {
                    id = TILE_POWER, name = TILE_POWER,
                    rank = PowerRank.Rank0_free,
                    path_icon = "ui/Icons/iconHelloTile",
                    hold_action = true,
                    click_interval = 0.05f,
                    click_action = (WorldTile pTile, string pPowerID) =>
                    {
                        if (pTile == null) return false;
                        TopTileType moss = AssetManager.top_tiles.get(HelloTiles.MOSS);
                        if (moss == null) return false;
                        pTile.setTopTileType(moss);
                        return true;
                    }
                };
                AssetManager.powers.add(tile);
            }

            // -- 8. spawn a hello_sprite creature (from Custom actors page) --
            if (AssetManager.powers.get(SPAWN_POWER) == null)
            {
                GodPower spawn = new GodPower
                {
                    id = SPAWN_POWER, name = SPAWN_POWER,
                    rank = PowerRank.Rank0_free,
                    path_icon = "ui/Icons/iconHelloSpawn",
                    click_action = (WorldTile pTile, string pPowerID) =>
                    {
                        if (pTile == null) return false;
                        World.world.units.spawnNewUnit("hello_sprite", pTile,
                            pSpawnSound: true, pAdultAge: true);
                        return true;
                    }
                };
                AssetManager.powers.add(spawn);
            }

            // -- 9. spawn the ember cloud disaster (from Disasters page) --
            if (AssetManager.powers.get(DISASTER_POWER) == null)
            {
                GodPower disaster = new GodPower
                {
                    id = DISASTER_POWER, name = DISASTER_POWER,
                    rank = PowerRank.Rank0_free,
                    path_icon = "ui/Icons/iconHelloDisaster",
                    click_action = (WorldTile pTile, string pPowerID) =>
                    {
                        if (pTile == null) return false;
                        for (int i = 0; i < 3; i++)
                            EffectsLibrary.spawn("fx_cloud", pTile, HelloClouds.EMBER);
                        return true;
                    }
                };
                AssetManager.powers.add(disaster);
            }

            // -- 10 and 11. the two creatures with their own art --
            SpawnPower(SPAWN_WISP,  "hello_wisp",  "iconHelloWisp");
            SpawnPower(SPAWN_GOLEM, "hello_golem", "iconHelloGolem");
        }

        /** One click, one creature. The vanilla template does the falling-from-the-sky part. */
        private static void SpawnPower(string pId, string pActorId, string pIcon)
        {
            if (AssetManager.powers.get(pId) != null) return;

            GodPower power = AssetManager.powers.clone(pId, "$template_spawn_actor$");
            power.name = pId;
            power.actor_asset_id = pActorId;
            power.path_icon = "ui/Icons/" + pIcon;
            power.rank = PowerRank.Rank0_free;
        }

        private static void Tab()
        {
            if (tab != null) return;

            tab = TabManager.CreateTab(
                TAB,                              // internal tab id
                "hellobox_tab",                   // locale key for the name
                "hellobox_tab_description",       // locale key for the tooltip
                Icon("iconHelloTab"));

            if (tab == null) return;   // something went wrong, don't keep going

            Buttons();
        }

        /**
         * The tab's own Start() has not run at mod load, so its parent is still null and
         * laying it out there throws. Main.Update() calls this until it takes.
         */
        public static void LayoutWhenReady()
        {
            if (laid_out || tab == null) return;
            if (PowerTabController.instance == null) return;

            try
            {
                tab.recalc();       // width from the buttons inside it
                tab.sortButtons();  // and put them in order
                laid_out = true;
            }
            catch
            {
                // UI container is still initializing during the game loading screen
            }
        }

        private static void Buttons()
        {
            // god powers: each arms the cursor for a map click
            PowerButtonCreator.CreateGodPowerButton(STRIKE,         Icon("iconHelloStrike"),    tab.transform);
            PowerButtonCreator.CreateGodPowerButton(DROP_POWER,     Icon("iconHelloDrop"),      tab.transform);
            PowerButtonCreator.CreateGodPowerButton(CLOUD_POWER,    Icon("iconHelloCloud"),     tab.transform);
            PowerButtonCreator.CreateGodPowerButton(BOLT_POWER,     Icon("iconHelloBolt"),      tab.transform);
            PowerButtonCreator.CreateGodPowerButton(STATUS_POWER,   Icon("iconHelloStatus"),    tab.transform);
            PowerButtonCreator.CreateGodPowerButton(BUILD_POWER,    Icon("iconHelloBuilding"),  tab.transform);
            PowerButtonCreator.CreateGodPowerButton(TILE_POWER,     Icon("iconHelloTile"),      tab.transform);
            PowerButtonCreator.CreateGodPowerButton(SPAWN_POWER,    Icon("iconHelloSpawn"),     tab.transform);
            PowerButtonCreator.CreateGodPowerButton(DISASTER_POWER, Icon("iconHelloDisaster"),  tab.transform);
            PowerButtonCreator.CreateGodPowerButton(SPAWN_WISP,     Icon("iconHelloWisp"),      tab.transform);
            PowerButtonCreator.CreateGodPowerButton(SPAWN_GOLEM,    Icon("iconHelloGolem"),     tab.transform);

            // plain button: runs your method, no map click
            PowerButtonCreator.CreateSimpleButton("hello_panel", HelloWindow.Toggle, Icon("iconHelloPanel"), tab.transform);
        }

        /** A missing sprite is an invisible button, so never hand one back. */
        private static Sprite Icon(string pName)
        {
            Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
            if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
            return sprite;
        }
    }
}
```

Это весь файл: девять божественных сил, вкладка, десять кнопок и помощник для иконок. Каждая кнопка - это одна возможность, которой научило это руководство. Разделы ниже разбирают его по частям.

`recalc()` подгоняет размер вкладки под её кнопки, а `sortButtons()` расставляет их по порядку. Оба должны подождать, и игра не объяснит вам почему по-доброму:

> [!WARNING] Не раскладывайте вкладку во время `OnModLoad`
> `PowersTab` читает своего родителя в `Start()` Unity, который на объекте, только что выданном `CreateTab`, ещё не выполнился. Вызовите там `recalc()`, и весь этап упадёт с `NullReferenceException` в `PowersTab.setNewWidth()`, ваша сила так и не зарегистрируется, а вкладка не появится :wbfacepalm:.
>
> Создайте вкладку и кнопки при загрузке, а раскладывайте их из `Update()` в первом кадре, где существует `PowerTabController.instance`. Для этого и нужен `LayoutWhenReady` выше, и `Main.Update()` его вызывает:
>
> ```csharp
> public void Update()
> {
>     if (!Config.game_loaded) return;
>     HelloPowers.LayoutWhenReady();
> }
> ```

> [!TIP] Обходим пляски с Update() через IStagedLoad
> Если опрос внутри `Update()` кажется вам неуклюжим, реализуйте `IStagedLoad` в классе своего мода. Его метод `Init()` срабатывает на втором кадре после создания мода, как раз когда базовая игра и её контроллеры интерфейса полностью проснулись.

## Два типа кнопок

```csharp
private static void Buttons()
{
    // божественные силы: каждая вооружает курсор, следующий клик запускает click_action
    PowerButtonCreator.CreateGodPowerButton(STRIKE, Icon("iconHelloStrike"), tab.transform);
    // ... по одной на каждую функцию, см. полный файл выше ...

    // простая кнопка: запускает ваш метод, клик по карте не нужен
    PowerButtonCreator.CreateSimpleButton("hello_panel", HelloWindow.Toggle, Icon("iconHelloPanel"), tab.transform);
}
```

Используйте `CreateGodPowerButton` для всего, что игрок нацеливает на карте (спавн, удар, осмотр юнита, размещение здания (building)), и `CreateSimpleButton` для глобальных действий (открыть окно, переключить режим).

> [!WARNING] Сила должна быть зарегистрирована первой
> `CreateGodPowerButton` ищет силу по её id. Если в `AssetManager.powers` её пока нет, вы получите кнопку, привязанную к пустоте. Сначала регистрируйте силу, и только **затем** создавайте кнопку.

## Порядок кнопок

Кнопки располагаются в том порядке, в котором создаются. Поэтому чтение вызовов в `Buttons()` сверху вниз в точности соответствует тому, что игрок видит слева направо. Если хотите изменить порядок, поменяйте местами сами вызовы, а не id.


## Группировка кнопок через PowersTabExtension

Десять кнопок в один ряд работают, но мод быстро превращается в свалку. NeoModLoader предоставляет `PowersTabExtension` в пространстве `NeoModLoader.General.UI.Tab` для группировки кнопок:

```csharp
using NeoModLoader.General.UI.Tab;

// 1. Объявляем группы
tab.SetLayout(new List<string> { "spells", "creatures" });

// 2. Добавляем кнопки в группы
PowerButton strikeBtn = PowerButtonCreator.CreateGodPowerButton(STRIKE, Icon("iconHelloStrike"), tab.transform);
tab.AddPowerButton("spells", strikeBtn);

PowerButton spawnBtn = PowerButtonCreator.CreateGodPowerButton(SPAWN_POWER, Icon("iconHelloSpawn"), tab.transform);
tab.AddPowerButton("creatures", spawnBtn);

// 3. Обновляем расположение
tab.UpdateLayout();
```

`SetLayout()` фиксирует структуру. Добавьте кнопки и вызовите `tab.UpdateLayout()`. Попытка добавить кнопку в необъявленную группу приведет к предупреждению в логе и потере кнопки :PES5_Hmmmm:.

## И снова об иконках

```csharp
private static Sprite Icon(string pName)
{
    Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
    if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
    return sprite;
}
```

Спрайт со значением `null` создаст кнопку, которая занимает место на экране, но абсолютно ничего не отображает. Игрок не видит её, вы не понимаете в чем дело, а баг-репорт гласит: "ваш мод ничего не делает" :PES_Pathetic:.

## Тексты

```json Mods/HelloBox/Locales/en.json
{
  "hellobox_tab": "HelloBox",
  "hellobox_tab_description": "Everything HelloBox adds",
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess.",
  "hello_drop_power": "Rain Embers",
  "hello_drop_power_description": "Drops burning embers on the tile and its neighbours.",
  "hello_cloud_power": "Ember Cloud",
  "hello_cloud_power_description": "Spawns an ember cloud that drifts and rains fire.",
  "hello_bolt_power": "Fire Bolt",
  "hello_bolt_power_description": "Fires a projectile at the nearest creature.",
  "hello_status_power": "Curse",
  "hello_status_power_description": "Applies the Hello Cursed status to the nearest creature.",
  "hello_build_power": "Place Shrine",
  "hello_build_power_description": "Drops a shrine on the tile.",
  "hello_tile_power": "Paint Moss",
  "hello_tile_power_description": "Covers tiles in hello_moss. Hold to paint.",
  "hello_spawn_power": "Spawn Sprite",
  "hello_spawn_power_description": "Places a hello_sprite creature on the tile.",
  "hello_disaster_power": "Ember Storm",
  "hello_disaster_power_description": "Spawns three ember clouds at once.",
  "hello_spawn_wisp": "Spawn Wisp",
  "hello_spawn_wisp_description": "Drops a hello_wisp, drawn from the mod's own sprites.",
  "hello_spawn_golem": "Spawn Golem",
  "hello_spawn_golem_description": "Drops a hello_golem, drawn from the mod's own sprites.",
  "hello_panel": "Open panel",
  "hello_panel_description": "Show or hide the panel."
}
```

Название кнопки и всплывающая подсказка берутся из **id силы**, а не из самой кнопки, именно поэтому ключи выше совпадают с id, переданными создателю кнопок.

## Помощники для окон и переключателей

Установленная сборка NML также предоставляет эти помощники в `NeoModLoader.General`. Используйте их один раз, после того как вкладка и целевое окно или сила уже существуют:

```csharp
PowerButton windowButton = PowerButtonCreator.CreateWindowButton(
    "hello_native_open", HelloNativeWindow.WindowId,
    Icon("iconHelloPanel"), tab.transform, Vector2.zero);
```

`CreateWindowButton` устанавливает `open_window_id` кнопки. Он не создаёт окно. `CreateSimpleButton` принимает `UnityAction`; используйте его для собственного колбэка. `GetTab(string pId)` ищет вкладку, а `AddButtonToTab(button, tab)` переносит кнопку в неё. Его перегрузка также принимает `Vector2`-позицию и опциональный индекс среди соседних элементов.

`CreateToggleButton(pGodPowerId, pIcon, pParent, pLocalPosition, pNoAutoSetToggleAction = false)` требует зарегистрированный `GodPower` с непустым `toggle_name`. Это имя определяет его настройку в `PlayerConfig`. Помощник создаёт булеву настройку со значением false и значение игрока, если в словаре игрока нет такого ключа. Предпочтительнее регистрировать оба самостоятельно, как показано в **[Настройки игры и шкалы времени](#/nml/game-options)**.

> [!NOTE] Автоматический переключатель - часть колбэка
> По умолчанию NML добавляет своё действие переключения и сохранения после уже существующего `toggle_action`. Передайте `pNoAutoSetToggleAction: true`, когда изменением состояния владеет ваш собственный колбэк. Если колбэк равен null, этот флаг не остановит установку NML своего действия по умолчанию. Повторный вызов создателя может добавить повторяющиеся действия.

## Собственный PowerTabAsset игры

`AssetManager.power_tab_library` хранит нативные ассеты вкладок. Это отдельная сущность от UI-компонента `PowersTab`, который возвращает `TabManager.CreateTab` из NML.

| Поле | Назначение |
| --- | --- |
| `locale_key` | Ключ названия; `getDescriptionID()` возвращает этот ключ плюс `_info` |
| `icon_path` | Путь к спрайту, используемый `getIcon()` |
| `get_power_tab` | Делегат, возвращающий `PowersTab` для показа |
| `gameplay_tab` | Ссылка на UI-вкладку |
| `window_id` | Id связанного окна |
| `on_main_tab_select` / `on_main_info_click` | Колбэки главной вкладки |
| `on_update_check_active` | Колбэк проверки активного состояния |

`tryToShowPowerTab()` вызывает `get_power_tab` и просит возвращённый компонент показать себя. Добавление голого ассета - не замена созданию UI-вкладки. Явные аргументы названия и описания у NML не стоит путать с нативным соглашением `_info`.

Далее: **[Пользовательские окна](#/nml/custom-windows)** про панель, или **[Настройки игры и шкалы времени](#/nml/game-options)** про её состояние.
