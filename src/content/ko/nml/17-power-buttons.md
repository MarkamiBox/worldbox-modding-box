---
title: 권능 탭 & 버튼
group: 게임 콘텐츠
subgroup: 신의 힘 및 UI
icon: :wbfingerclick:
order: 202
---

# 권능 탭 & 버튼 :wbfingerclick:

신의 권능을 등록했습니다. 하지만 아직 아무도 그것을 클릭할 수 없습니다. `GodPower` 는 단순한 데이터일 뿐이고, 플레이어가 실제로 누르는 것은 **PowerButton** 이며, 버튼은 하단 바의 **탭** 안에 존재하기 때문입니다.

## 나만의 탭 만들기

바닐라 탭에 버튼을 추가하는 것 자체는 *가능*합니다. 하지 마세요. 이미 꽉 차 있고, 게임은 자식 요소를 이름순으로 배치하며, 바는 스크롤되기 때문에 여러분의 버튼은 플레이어가 절대 스크롤하지 않을 곳에 가게 됩니다 :PESgn_ToughLuck:.

여러분만의 탭 하나를 만들면, 추가하는 모든 것이 한곳에 모여 찾기 쉬워집니다:

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

이게 파일 전체입니다: 신의 권능 (GodPower) 아홉 개, 탭, 버튼 열 개, 그리고 아이콘 헬퍼. 모든 버튼은 이 가이드에서 배운 기능 하나씩입니다. 아래 섹션에서 하나씩 뜯어봅니다.

`recalc()`는 버튼에 맞춰 탭 크기를 정하고, `sortButtons()`는 버튼을 순서대로 정렬합니다. 둘 다 기다려야 하고, 게임은 그 이유를 친절하게 알려주지 않습니다:

> [!WARNING] `OnModLoad` 안에서 탭을 배치하지 마세요
> `PowersTab`은 Unity의 `Start()`에서 자기 부모를 읽는데, `CreateTab`이 방금 준 객체에서는 아직 실행되지 않았습니다. 거기서 `recalc()`를 호출하면 단계 전체가 `PowersTab.setNewWidth()`에서 `NullReferenceException`으로 죽고, 권능은 등록되지 않으며 탭도 나타나지 않습니다 :wbfacepalm:.
>
> 탭과 버튼은 로드할 때 만들고, `PowerTabController.instance`가 존재하는 첫 프레임에 `Update()`에서 배치하세요. 위의 `LayoutWhenReady`가 그 용도이고, `Main.Update()`가 그것을 호출합니다:
>
> ```csharp
> public void Update()
> {
>     if (!Config.game_loaded) return;
>     HelloPowers.LayoutWhenReady();
> }
> ```

> [!TIP] IStagedLoad로 Update() 번거로움 건너뛰기
> `Update()` 안에서 계속 확인하는 게 어설프게 느껴진다면, 모드 클래스에 `IStagedLoad`를 구현하세요. 그 `Init()` 메서드는 모드가 생성된 뒤 두 번째 프레임에, 딱 기본 게임과 UI 컨트롤러가 완전히 깨어난 시점에 호출됩니다.

## 두 가지 버튼

```csharp
private static void Buttons()
{
    // 신의 힘: 커서를 무장시키고, 다음 클릭이 click_action을 실행
    PowerButtonCreator.CreateGodPowerButton(STRIKE, Icon("iconHelloStrike"), tab.transform);
    // ... 각 기능마다 하나씩, 위의 전체 파일 참조 ...

    // 일반 버튼: 메서드만 실행, 맵 클릭 불필요
    PowerButtonCreator.CreateSimpleButton("hello_panel", HelloWindow.Toggle, Icon("iconHelloPanel"), tab.transform);
}
```

`CreateGodPowerButton`은 플레이어가 무언가를 조준하는 기능(스폰, 공격, 유닛 검사, 건물 (building) 배치)에 사용하고, `CreateSimpleButton`은 글로벌 기능(창 열기, 모드 전환)에 사용합니다.

> [!WARNING] 권능이 먼저 등록되어 있어야 합니다
> `CreateGodPowerButton` 은 id로 권능을 조회합니다. `AssetManager.powers` 에 아직 등록되지 않았다면 아무것에도 연결되지 않은 먹통 버튼이 만들어집니다. 반드시 권능을 먼저 등록한 **다음** 버튼을 생성하세요.

## 버튼 정렬 순서

버튼은 생성된 순서대로 정렬되므로, `Buttons()` 메서드에서 위에서 아래로 읽히는 순서가 플레이어의 화면에서 왼쪽에서 오른쪽으로 나타나는 순서와 정확히 일치합니다. 순서를 바꾸고 싶다면 id가 아니라 호출 순서를 바꾸세요.


## PowersTabExtension을 사용한 버튼 그룹화

10개의 버튼을 한 줄로 나열하는 것도 가능하지만, 모드가 커지면 지저분해 보입니다. NeoModLoader는 바닐라처럼 버튼을 깔끔하게 그룹별로 정리할 수 있도록 `NeoModLoader.General.UI.Tab`에 `PowersTabExtension`을 제공합니다:

```csharp
using NeoModLoader.General.UI.Tab;

// 1. 탭에 포함될 그룹 정의
tab.SetLayout(new List<string> { "spells", "creatures" });

// 2. 각 버튼을 그룹에 배치
PowerButton strikeBtn = PowerButtonCreator.CreateGodPowerButton(STRIKE, Icon("iconHelloStrike"), tab.transform);
tab.AddPowerButton("spells", strikeBtn);

PowerButton spawnBtn = PowerButtonCreator.CreateGodPowerButton(SPAWN_POWER, Icon("iconHelloSpawn"), tab.transform);
tab.AddPowerButton("creatures", spawnBtn);

// 3. 레이아웃 갱신
tab.UpdateLayout();
```

`SetLayout()`을 호출하면 그룹 구조가 고정됩니다. 버튼을 지정된 그룹에 추가하고 `tab.UpdateLayout()`을 호출하세요. 등록되지 않은 그룹에 버튼을 넣으려고 하면 NML이 경고를 출력하고 배치를 건너뜁니다 :PES5_Hmmmm:。

## 다시 한 번 강조하는 아이콘

```csharp
private static Sprite Icon(string pName)
{
    Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
    if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
    return sprite;
}
```

`null` 스프라이트를 넘기면 공간만 차지하고 아무것도 그려지지 않는 유령 버튼이 생깁니다. 플레이어도 모르고 여러분도 모른 채, 버그 리포트에는 "모드가 아무런 동작도 안 해요"라고 올라오게 됩니다 :PES_Pathetic:.

## 텍스트 로컬라이제이션

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

버튼의 이름과 툴팁은 버튼 자체가 아니라 **권능 id**에서 가져옵니다. 그렇기 때문에 위의 키들이 생성 메서드에 전달한 id와 일치하는 것입니다.
