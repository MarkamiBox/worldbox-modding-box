---
title: Schede e pulsanti di potere
group: Contenuto di gioco
subgroup: Poteri divini e UI
icon: :wbfingerclick:
order: 202
---

# Schede e pulsanti di potere :wbfingerclick:

Hai registrato un potere divino (GodPower). Nessuno può cliccarci sopra, perché un `GodPower` è solo un insieme di dati: ciò che il giocatore preme effettivamente è un **PowerButton**, e i pulsanti vivono all'interno delle **schede** sulla barra inferiore.

## Crea la tua scheda personale

*Puoi* aggiungere un pulsante a una delle schede vanilla. Non farlo. Sono già piene, il gioco ordina i figli per nome e la barra scorre, quindi il tuo pulsante finisce in un punto dove il giocatore non scorrerà mai :PESgn_ToughLuck:.

Una scheda tutta tua, e tutto ciò che aggiungi sta insieme ed è facile da trovare:

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

Questo è il file completo: nove poteri divini, la scheda, dieci pulsanti e l'helper delle icone. Ogni pulsante è una funzionalità che questa guida ha insegnato. Le sezioni qui sotto lo smontano pezzo per pezzo.

`recalc()` è ciò che dimensiona la scheda attorno ai suoi pulsanti, e `sortButtons()` è ciò che li mette in ordine. Entrambi devono aspettare, e il gioco non ti dirà perché in modo gentile:

> [!WARNING] Non impaginare la scheda durante `OnModLoad`
> `PowersTab` legge il proprio parent nello `Start()` di Unity, che non è ancora stato eseguito sull'oggetto che `CreateTab` ti ha appena dato. Chiama lì `recalc()` e l'intera fase muore con `NullReferenceException` in `PowersTab.setNewWidth()`, il tuo potere non viene mai registrato e la scheda non compare mai :wbfacepalm:.
>
> Crea la scheda e i pulsanti al caricamento, poi impaginali da `Update()` nel primo frame in cui esiste `PowerTabController.instance`. È a questo che serve `LayoutWhenReady` qui sopra, e `Main.Update()` lo chiama:
>
> ```csharp
> public void Update()
> {
>     if (!Config.game_loaded) return;
>     HelloPowers.LayoutWhenReady();
> }
> ```

> [!TIP] Saltare il balletto di Update() con IStagedLoad
> Se fare polling dentro `Update()` ti sembra goffo, implementa `IStagedLoad` sulla classe della tua mod. Il suo metodo `Init()` scatta al secondo frame dopo la costruzione della mod, proprio quando il gioco base e i suoi controller dell'interfaccia sono completamente pronti.

## Due tipi di pulsante

```csharp
private static void Buttons()
{
    // poteri divini: ognuno arma il cursore, il prossimo clic scatena click_action
    PowerButtonCreator.CreateGodPowerButton(STRIKE, Icon("iconHelloStrike"), tab.transform);
    // ... uno per ogni funzionalità, vedi il file completo sopra ...

    // pulsante semplice: esegue il tuo metodo, nessun clic sulla mappa
    PowerButtonCreator.CreateSimpleButton("hello_panel", HelloWindow.Toggle, Icon("iconHelloPanel"), tab.transform);
}
```

Usa `CreateGodPowerButton` per qualsiasi cosa il giocatore debba mirare sulla mappa (generare, scagliare fulmini, ispezionare un'unità, posizionare un edificio (building)), e `CreateSimpleButton` per qualsiasi cosa globale (aprire la tua finestra, attivare/disattivare una modalità).

> [!WARNING] Il potere deve esistere prima
> `CreateGodPowerButton` cerca il potere in base all'id. Se `AssetManager.powers` non lo possiede ancora, otterrai un pulsante collegato al nulla. Registra il potere, **poi** crea il pulsante.

## L'ordine dei pulsanti

I pulsanti vengono disposti nell'ordine in cui sono stati creati, quindi leggere `Buttons()` dall'alto verso il basso corrisponde esattamente a ciò che il giocatore vede da sinistra a destra. Se desideri un ordine diverso, riordina le chiamate, non gli id.


## Raggruppare i pulsanti con PowersTabExtension

Mettere dieci pulsanti in un'unica riga funziona, ma non appena la mod cresce sembra un cassetto disordinato. NeoModLoader fornisce `PowersTabExtension` in `NeoModLoader.General.UI.Tab` per organizzare i pulsanti in gruppi distinti come nelle schede di gioco vanilla:

```csharp
using NeoModLoader.General.UI.Tab;

// 1. Definisci i gruppi contenuti nella scheda
tab.SetLayout(new List<string> { "spells", "creatures" });

// 2. Assegna ciascun pulsante al rispettivo gruppo
PowerButton strikeBtn = PowerButtonCreator.CreateGodPowerButton(STRIKE, Icon("iconHelloStrike"), tab.transform);
tab.AddPowerButton("spells", strikeBtn);

PowerButton spawnBtn = PowerButtonCreator.CreateGodPowerButton(SPAWN_POWER, Icon("iconHelloSpawn"), tab.transform);
tab.AddPowerButton("creatures", spawnBtn);

// 3. Ricalcola le posizioni
tab.UpdateLayout();
```

`SetLayout()` blocca la struttura della scheda una volta chiamato. Aggiungi i pulsanti ai gruppi dichiarati e chiama `tab.UpdateLayout()`. Se provi ad aggiungere un pulsante a un gruppo non dichiarato in `SetLayout()`, NML registrerà un avviso e lascerà il tuo pulsante fuori dal layout :PES5_Hmmmm:.

## Icone, ancora una volta

```csharp
private static Sprite Icon(string pName)
{
    Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
    if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
    return sprite;
}
```

Uno sprite `null` genera un pulsante che occupa spazio senza disegnare nulla. Il giocatore non sa che è lì, tu non sai che è lì, e la segnalazione del bug dirà "la tua mod non fa nulla" :PES_Pathetic:.

## I testi

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

Il nome del pulsante e il tooltip provengono dall'**id del potere**, non dal pulsante stesso, motivo per cui le chiavi qui sopra corrispondono agli id passati al creatore.
