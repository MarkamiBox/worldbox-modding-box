---
title: Onglets et boutons de pouvoir
group: Contenu du jeu
subgroup: Pouvoirs divins et interface
icon: :wbfingerclick:
order: 202
---

# Onglets et boutons de pouvoir :wbfingerclick:

Vous avez enregistré un pouvoir divin. Personne ne peut cliquer dessus, car un `GodPower` n'est qu'un ensemble de données : ce sur quoi le joueur clique réellement est un **PowerButton**, et les boutons logent dans des **onglets** situés sur la barre inférieure.

## Créer votre propre onglet

Vous *pouvez* rattacher un bouton à l'un des onglets de base. Ne le faites pas. Ils sont déjà pleins, le jeu ordonne les enfants par nom et la barre défile, si bien que votre bouton finira dans un recoin où le joueur ne fera jamais défiler :PESgn_ToughLuck:.

Un seul onglet bien à vous, et tout ce que vous ajouterez sera regroupé et facile à trouver :

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

Voilà le fichier entier : neuf pouvoirs divins, l'onglet, dix boutons et l'utilitaire d'icônes. Chaque bouton est une fonctionnalité que ce guide a enseignée. Les sections ci-dessous le décortiquent.


`recalc()` est ce qui dimensionne l'onglet autour de ses boutons, et `sortButtons()` est ce qui les met dans l'ordre. Les deux doivent attendre, et le jeu ne vous dira pas pourquoi de manière aimable :

> [!WARNING] Ne dispose pas l'onglet pendant `OnModLoad`
> `PowersTab` lit son propre parent dans le `Start()` d'Unity, qui n'a pas encore tourné sur l'objet que `CreateTab` vient de te donner. Appelle `recalc()` là et toute l'étape meurt sur `NullReferenceException` dans `PowersTab.setNewWidth()`, ton pouvoir ne s'enregistre jamais et l'onglet n'apparaît jamais :wbfacepalm:.
>
> ```csharp
> public void Update()
> {
>     if (!Config.game_loaded) return;
>     HelloPowers.LayoutWhenReady();
> }
> ```

## Deux types de boutons

```csharp
private static void Buttons()
{
    // pouvoirs divins : chacun arme le curseur, le prochain clic déclenche click_action
    PowerButtonCreator.CreateGodPowerButton(STRIKE, Icon("iconHelloStrike"), tab.transform);
    // ... un par fonctionnalité, voir le fichier complet ci-dessus ...

    // bouton simple : exécute votre méthode, pas de clic sur la carte
    PowerButtonCreator.CreateSimpleButton("hello_panel", HelloWindow.Toggle, Icon("iconHelloPanel"), tab.transform);
}
```

Utilisez `CreateGodPowerButton` pour tout ce que le joueur vise sur la carte (engendrer, frapper, inspecter une unité, placer un bâtiment), et `CreateSimpleButton` pour les actions globales (ouvrir votre fenêtre, basculer un mode).

> [!WARNING] Le pouvoir doit exister d'abord
> `CreateGodPowerButton` recherche le pouvoir par son identifiant. Si `AssetManager.powers` ne le possède pas encore, vous obtiendrez un bouton lié à du vent. Enregistrez le pouvoir, **puis** créez le bouton.

## L'ordre des boutons

Les boutons sont disposés dans l'ordre de leur création. La lecture de `Buttons()` de haut en bas correspond donc exactement à ce que le joueur découvrira de gauche à droite. Pour changer l'ordre, réorganisez les appels, pas les identifiants.


## Regrouper les boutons avec PowersTabExtension

Mettre dix boutons sur une seule ligne fonctionne, mais devient vite désordonné. NeoModLoader propose `PowersTabExtension` dans `NeoModLoader.General.UI.Tab` pour organiser vos boutons en groupes :

```csharp
using NeoModLoader.General.UI.Tab;

// 1. Déclarez les groupes
tab.SetLayout(new List<string> { "spells", "creatures" });

// 2. Assignez chaque bouton
PowerButton strikeBtn = PowerButtonCreator.CreateGodPowerButton(STRIKE, Icon("iconHelloStrike"), tab.transform);
tab.AddPowerButton("spells", strikeBtn);

PowerButton spawnBtn = PowerButtonCreator.CreateGodPowerButton(SPAWN_POWER, Icon("iconHelloSpawn"), tab.transform);
tab.AddPowerButton("creatures", spawnBtn);

// 3. Mettez à jour
tab.UpdateLayout();
```

`SetLayout()` fige la structure. Ajoutez vos boutons puis terminez par `tab.UpdateLayout()`. Si vous ciblez un groupe non déclaré, NML émettra un avertissement et laissera le bouton orphelin :PES5_Hmmmm:.

## Les icônes, encore une fois

```csharp
private static Sprite Icon(string pName)
{
    Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
    if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
    return sprite;
}
```

Un sprite `null` donne un bouton qui occupe de l'espace sans rien afficher. Le joueur ignore qu'il est là, vous ignorez qu'il est là, et le rapport de bug indiquera : "votre mod ne fait rien" :PES_Pathetic:.

## Le texte

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

Le nom du bouton et son infobulle proviennent de l'**id du pouvoir**, et non du bouton en lui-même. C'est pourquoi les clés ci-dessus correspondent aux identifiants transmis au créateur.
