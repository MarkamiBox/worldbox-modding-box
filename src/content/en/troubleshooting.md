---
title: Troubleshooting
group: Overview
icon: :wbfractured:
order: 4
---

# Troubleshooting :wbfractured:

Find your symptom in the table, click it, read three lines. That is the whole page :aPES2_ThumbsUp:.

> [!TIP] The log answers most of these faster than I can
> Nine times out of ten the answer is already in `Player.log`. **[Logs & debugging](#/nml/logs-and-debugging)** shows you where it is and how to read a crash.

## Find your symptom

**Using mods (not making them)**

| Symptom | |
| --- | --- |
| Red text flood, `Missing className: NeoModLoader (1).WorldBoxMod` | [jump](#red-text-flood-missing-classname) |
| NML worked, the game updated, now mods are red or "failed" | [jump](#mods-are-red-or-failed-after-a-game-update) |
| The game is on an old version and NML will not load | [jump](#the-game-is-on-an-old-version) |
| The game got slow, or freezes, with mods on | [jump](#the-game-got-slow-or-freezes-with-mods-on) |
| A world will not load any more | [jump](#a-world-will-not-load-any-more) |
| A BepInEx mod is installed and shows nothing | [jump](#a-bepinex-mod-is-installed-and-shows-nothing) |
| You deleted a mod and it is still there | [jump](#you-deleted-a-mod-and-it-is-still-there) |
| The game does not start at all | [jump](#the-game-does-not-start-at-all) |

**Nothing loads**

| Symptom | |
| --- | --- |
| No Mods button in the menu | [jump](#no-mods-button-in-the-menu) |
| Mods window empty, it used to work | [jump](#mods-window-empty-it-used-to-work) |
| Mod folder is there, mod is not in the list | [jump](#mod-folder-is-there-mod-is-not-in-the-list) |
| The mod is greyed out | [jump](#the-mod-is-greyed-out) |
| "Compile failed" and the error makes no sense | [jump](#compile-failed-and-the-error-makes-no-sense) |
| Error on line 1 of a file you just pasted | [jump](#error-on-line-1-of-a-file-you-just-pasted) |
| You edited the code and nothing changed | [jump](#you-edited-the-code-and-nothing-changed) |
| Notepad will not save into the game folder | [jump](#notepad-will-not-save-into-the-game-folder) |
| Your changes never show up, even after a restart | [jump](#your-changes-never-show-up-even-after-a-restart) |

**It loads, nothing shows up**

| Symptom | |
| --- | --- |
| Crash on the line where you set a stat | [jump](#crash-on-the-line-where-you-set-a-stat) |
| Same crash, and the order is already right | [jump](#same-crash-and-the-order-is-already-right) |
| Your building dies instantly or has no size | [jump](#your-building-dies-instantly-or-has-no-size) |
| Registered, but in no tab anywhere | [jump](#registered-but-in-no-tab-anywhere) |
| It shows `trait_hello_swift` instead of a name | [jump](#it-shows-trait-hello-swift-instead-of-a-name) |
| Names work for traits but not items, statuses, powers | [jump](#names-work-for-traits-but-not-items-statuses-powers) |
| The icon is a blank hole | [jump](#the-icon-is-a-blank-hole) |
| A button that takes up space and draws nothing | [jump](#a-button-that-takes-up-space-and-draws-nothing) |
| Status effect draws no sprite on the unit | [jump](#status-effect-draws-no-sprite-on-the-unit) |
| Buttons stacked on top of each other | [jump](#buttons-stacked-on-top-of-each-other) |
| The button is there, clicking it arms nothing | [jump](#the-button-is-there-clicking-it-arms-nothing) |
| `addOpposite` / `addDecision` / `addSpell` do nothing | [jump](#addopposite-adddecision-addspell-do-nothing) |

**Registered, then broken in the world**

| Symptom | |
| --- | --- |
| Your creature raises a shadow error | [jump](#your-creature-raises-a-shadow-error) |
| Your trait, item or creature stays locked | [jump](#your-trait-item-or-creature-stays-locked) |
| The game crashes while loading your weapon or your food | [jump](#the-game-crashes-while-loading-your-weapon-or-your-food) |
| A cloud crashes the moment it spawns | [jump](#a-cloud-crashes-the-moment-it-spawns) |
| Placing your building throws Index was out of range | [jump](#placing-your-building-throws-index-was-out-of-range) |
| Your building throws on every frame it is visible | [jump](#your-building-throws-on-every-frame-it-is-visible) |
| The minimap throws once your building exists | [jump](#the-minimap-throws-once-your-building-exists) |
| Your tile paints, then the map renderer throws | [jump](#your-tile-paints-then-the-map-renderer-throws) |
| Spawning an animal on your tile crashes | [jump](#spawning-an-animal-on-your-tile-crashes) |
| Drops fall invisibly, or a projectile throws | [jump](#drops-fall-invisibly-or-a-projectile-throws) |
| The log fills with ArgumentNullException from projectiles | [jump](#the-log-fills-with-argumentnullexception-from-projectiles) |
| Your power tab never appears | [jump](#your-power-tab-never-appears) |
| The settings window shows raw ids | [jump](#the-settings-window-shows-raw-ids) |
| The world throws every frame after you add a world behaviour | [jump](#the-world-throws-every-frame-after-you-add-a-world-behaviour) |
| A disaster crashes when it writes to the world log | [jump](#a-disaster-crashes-when-it-writes-to-the-world-log) |
| A disaster with no action crashes when it is picked | [jump](#a-disaster-with-no-action-crashes-when-it-is-picked) |
| The first ruler to consider your plot throws | [jump](#the-first-ruler-to-consider-your-plot-throws) |
| Your decision, plot, gene or weapon exists and nothing ever uses it | [jump](#your-decision-plot-gene-or-weapon-exists-and-nothing-ever-uses-it) |

**Compiles for you, not for them**

| Symptom | |
| --- | --- |
| `CS0122: inaccessible due to its protection level` | [jump](#cs0122-inaccessible-due-to-its-protection-level) |
| Works on your machine, does nothing on theirs | [jump](#works-on-your-machine-does-nothing-on-theirs) |

**Works, then breaks later**

| Symptom | |
| --- | --- |
| Another mod silently replaces your content | [jump](#another-mod-silently-replaces-your-content) |
| Crash on `World.world` while the mod loads | [jump](#crash-on-world-world-while-the-mod-loads) |
| Your data starts controlling the wrong creatures | [jump](#your-data-starts-controlling-the-wrong-creatures) |
| Everything is gone after a save/load | [jump](#everything-is-gone-after-a-save-load) |
| Units freeze in clumps | [jump](#units-freeze-in-clumps) |
| Half your Harmony patches never applied | [jump](#half-your-harmony-patches-never-applied) |
| Your `updateStats` patch crashes for other people | [jump](#your-updatestats-patch-crashes-for-other-people) |
| You patched `getHit` and buildings still take damage | [jump](#you-patched-gethit-and-buildings-still-take-damage) |
| Your Prefix broke three other mods | [jump](#your-prefix-broke-three-other-mods) |
| A unit stands still forever, or crashes every frame | [jump](#a-unit-stands-still-forever-or-crashes-every-frame) |
| Your AI takeover quietly reverts | [jump](#your-ai-takeover-quietly-reverts) |
| The game hitches four times a second | [jump](#the-game-hitches-four-times-a-second) |
| Clicks land on the map behind your window | [jump](#clicks-land-on-the-map-behind-your-window) |
| Memory climbs every time the panel opens | [jump](#memory-climbs-every-time-the-panel-opens) |
| A new default never reaches existing players | [jump](#a-new-default-never-reaches-existing-players) |
| A settings slider moves, your callback never runs | [jump](#a-settings-slider-moves-your-callback-never-runs) |

---

## Using mods

This group is for people playing with mods, not writing them. Everything after it assumes you are the one writing the code.

### Red text flood, missing className

- **See**: Red text scrolling over the game, `previous errors repeated`, `YOU SHOULD RESTART THE GAME`, and in the log `Missing className: NeoModLoader (1).WorldBoxMod`.
- **Why**: The file is not called `NeoModLoader.dll`. A browser downloading it a second time adds ` (1)`, and NML reads its own file name.
- **Fix**: Close the game, delete any older copy, rename the file to exactly `NeoModLoader.dll`, start again. Full walkthrough on **[Install NML](#/install-nml)**.

### Mods are red or failed after a game update

- **See**: The mod list shows a mod in red, "failed", `current failed, will load`, or `<Mod> has been disabled due to an error`. It worked before the update.
- **Why**: Mods call the game's own code. When WorldBox changes that code, a mod built for the old version stops compiling. NML is not the problem, it is only the messenger.
- **Fix**: Look for a newer version of the mod (on GameBanana, sort by **Updated**). No newer version means wait for the author, or play the old game version, see **[the FAQ](#/install-nml)**. Do not keep two versions of the same mod in `Mods` "just in case": they fight.

### The game is on an old version

- **See**: NML never loads, or the log says `MissingFieldException: Field not found: bool .Config.gameLoaded`. The version number on the main menu is older than the one everybody else talks about.
- **Why**: The game is on a Steam **beta branch**, usually one picked long ago to try an update early, and the NML you downloaded is made for the current version.
- **Fix**: Steam → right-click WorldBox → **Properties → Betas** → **None**. Let Steam update, turn Experimental Mode back on :PES2_Shrug:.

### The game got slow, or freezes, with mods on

- **See**: Low FPS, stutters, or the world freezing while the buttons still work. Fine without mods.
- **Why**: Nearly always one mod doing heavy work every tick, usually a big content mod. Two mods that change the same thing can also lock each other up.
- **Fix**: Disable half your mods, restart, test. Still broken: the culprit is in the half that is on. Keep halving until one is left. Disabling is enough, no need to delete. Read that mod's description for known incompatibilities, and never run two versions of one mod (a full and a "lite" one) together.

### A world will not load any more

- **See**: The save opens a different world, stops while loading, or throws `NullReferenceException` while saving or loading.
- **Why**: The world contains creatures, buildings or traits from a mod that is now off, removed or outdated. The game finds ids it does not know.
- **Fix**: Turn that mod back on (or go back to the version the save was made with), load the world, and remove the modded content in game before removing the mod. Keep a copy of worlds you care about before trying a new content mod :PES_MonkaSweat:.

### A BepInEx mod is installed and shows nothing

- **See**: The mod is in `BepInEx/plugins`, nothing appears in game, and no config file of its own shows up in `BepInEx/config`.
- **Why**: Either the zip was dropped into `plugins` as a zip, or BepInEx's manager object is being destroyed by the game, which some machines need a setting for.
- **Fix**: Put the **folder inside** the zip into `BepInEx/plugins`, not the zip. Then open `BepInEx/config/BepInEx.cfg`, find `HideManagerGameObject = false`, change it to `true`, save, restart. Setting up BepInEx itself: **[The live console](#/toolbox/bepinex-console)**.

### You deleted a mod and it is still there

- **See**: The folder is gone from `Mods`, the mod still loads.
- **Why**: It was subscribed on the Steam Workshop, and Workshop mods live in Steam's own folder, not in yours.
- **Fix**: Unsubscribe on its Workshop page. Unticking it is not the same thing.

### The game does not start at all

- **See**: WorldBox closes or hangs before the main menu, even after taking your mods out.
- **Why**: A file of the game itself got damaged, often by copying something into the wrong folder.
- **Fix**: Steam → right-click WorldBox → **Properties → Installed Files → Verify integrity of game files**. Then put NML and your mods back one at a time.

---

## Nothing loads

### No Mods button in the menu

- **See**: Game starts fine, no error, no Mods button, and no `[NML]` line anywhere in the log.
- **Why**: Two folders are called "Mods". The loader DLL goes in the game data folder; `worldbox\Mods/` is for *your* mods.
- **Fix**: Put `NeoModLoader.dll` in `worldbox\worldbox_Data\StreamingAssets\mods/`, restart, and look for `[NML]: NeoModLoader Version:` in the log. Every click, Mac included: **[Install NML](#/install-nml)**.

### Mods window empty, it used to work

- **See**: The window opens and lists nothing. No errors.
- **Why**: **Experimental Mode is off**, and the game switches it off by itself after every WorldBox update.
- **Fix**: Settings → Experimental Mode → on → restart. Check this first whenever "it worked yesterday and I changed nothing" 

### Mod folder is there, mod is not in the list

- **See**: Nothing in the list, no `Compile Mod <yours>` line.
- **Why**: In order of how often it happens: the file is really `mod.json.txt`; the JSON is invalid (comma after the last entry, or curly `"` quotes pasted from a chat app); the folder is not inside `worldbox\Mods/`.
- **Fix**: Explorer → **View → Show → File name extensions**, then check the real name. Open `mod.json` in VS Code, which underlines JSON errors for you.

### The mod is greyed out

- **See**: Listed in grey, none of your code runs.
- **Why**: It is disabled, and that is remembered on disk in `StreamingAssets\mods\NML\mod_compile_records.json`.
- **Fix**: Click the mod icon in the Mods window, then restart.

### "Compile failed" and the error makes no sense

- **See**: `Code\Main.cs(9,42): error CS1002: ; expected`, then a summary line.
- **Why**: The summary is not the error. The line above it is, and it names file, line and column.
- **Fix**: Fix the **first** error only, then restart and look again - errors cascade.

| Code | Means |
| --- | --- |
| `CS1002` | Missing `;` |
| `CS0246` | A name it does not know, usually a missing `using` |
| `CS0266` | You gave a decimal where a whole number goes (`0.5f` into an `int`) |
| `CS0122` | The member is `internal`, see [that entry](#cs0122-inaccessible-due-to-its-protection-level) |

### Error on line 1 of a file you just pasted

- **See**: A compile error on line 1 that looks like nonsense.
- **Why**: Code blocks here are labelled with their file path. Select slightly too far up and the label lands inside your `.cs`.
- **Fix**: Delete line 1. A `.cs` starts with `using`, a `namespace` or a class; `mod.json` starts with `{`.

### You edited the code and nothing changed

- **See**: Old behaviour, no error.
- **Why**: NML compiles `Code\*.cs` **once at startup**. A running game never re-reads your file.
- **Fix**: Save, fully quit, start again. One change per restart, so a break has one suspect.

### Your changes never show up, even after a restart

- **See**: You restart, the log says `Compile Mod`, and the game still runs your old code. The compile takes a fraction of a second.
- **Why**: Two folders in `Mods/` have the same `GUID` in `mod.json`, typically an older copy the NML installer unpacked as `COM_YOURNAME_HELLOBOX/`. NML loads **one mod per GUID** and quietly ignores the other folder, which may well be the one you are editing.
- **Fix**: Search `Mods/` for your GUID and keep exactly one folder. If the numbers do not add up, this is the first thing to check.

### Notepad will not save into the game folder

- **See**: "You don't have permission to save in this location", offering Documents instead.
- **Why**: The game lives under `C:\Program Files (x86)/`, which Windows protects.
- **Fix**: Create the file in Explorer first (right-click → New → Text Document, rename it), then edit that existing file.

---

## It loads, nothing shows up

### Crash on the line where you set a stat

- **See**: `NullReferenceException` in your `Initialize()`, and everything after it never runs.
- **Why**: A fresh asset has **no stat block**. The library creates it inside `add()`.
- **Fix**: `add()` first, stats after. Same rule for traits, statuses, items, buildings, actors.

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };
AssetManager.traits.add(swift);      // this is what allocates base_stats
swift.base_stats["speed"] = 20f;     // safe from here
```

`clone()` calls `add()` for you, so after a clone the block already exists.

### Same crash, and the order is already right

- **See**: Same `NullReferenceException`, on a stat line that runs after `add()`.
- **Why**: You invented a stat name. An unknown stat id is a crash, not a no-op.
- **Fix**: Use real ids: `damage`, `health`, `speed`, `armor`, `attack_speed`, `stamina`, `mana`, `range`, `critical_chance`, `lifespan`, `warfare`. Multipliers are separate: `multiplier_damage`, `multiplier_health`, `multiplier_speed`. Full list in **[Stats reference](#/nml/stats)**.

### Your building dies instantly or has no size

- **See**: The building appears, then vanishes, or cannot be targeted. No error.
- **Why**: A building's default `health` and `size` are only set inside `add()`, and only when `base_stats` is still null. Create the block yourself first and you get `health = 0`.
- **Fix**: Never pre-create `base_stats`. Clone or `add()` first, then change only what should differ.

### Registered, but in no tab anywhere

- **See**: Your log line prints, no exception, and the thing is in no category.
- **Why**: `group_id` points at a group that does not exist, so there is no tab to draw it in.
- **Fix**: Use a real group id. Actor traits: `cognitive`, `mind`, `spirit`, `physique`, `health`, `body`, `appearance`, `protection`, `skills`, `merits`, `acquired`, `fun`, `fate`, `miscellaneous`, `special`. Your own tab: **[Trait groups & tabs](#/nml/trait-groups)**.

### It shows `trait_hello_swift` instead of a name

- **See**: The raw key on screen, empty tooltip, `missing text:` in the log.
- **Why**: No translation registered. The game builds the key itself: `trait_<id>` and `trait_<id>_info`.
- **Fix**: Add those two keys to `Locales/en.json`. Watch out for `en.json.txt`.

### Names work for traits but not items, statuses, powers

- **See**: You copied the trait pattern and this one still shows a raw key.
- **Why**: Four assets do **not** build the key from the id:

| Asset | Name key | Description key |
| --- | --- | --- |
| `GodPower` | the `name` **field**, snake_case | `<name>_description` |
| `ItemAsset` | `translation_key`, else `item_<subtype or id>` | `<id>_description`, no `item_` |
| `StatusAsset` | the `locale_id` **field** | the `locale_description` **field** |
| `WorldLawAsset` | `<id>_title` | `<id>_description` |

- **Fix**: Set `name` = id on powers, `translation_key` on items, `locale_id` on statuses. Keep keys lowercase snake_case: they are normalised when stored but **not** when looked up, so `MyKey` is saved as `my_key` and never found again :PESgn_SMH:.

### The icon is a blank hole

- **See**: An empty square where the icon should be. No error.
- **Why**: The automatic icon fill-in runs before your mod exists, so nothing fills yours. And a wrong path returns `null` **which is cached for the whole session**, so fixing the path without restarting changes nothing.
- **Fix**: Always set `path_icon` yourself, no file extension, forward slashes - then restart. Check it at load:

```csharp
if (SpriteTextureLoader.getSprite(swift.path_icon) == null)
    LogError("icon path is wrong: " + swift.path_icon);
```

### A button that takes up space and draws nothing

- **See**: A gap in your tab that nobody will ever click.
- **Why**: A `null` sprite is not a placeholder, it is nothing at all :PES4_Invisible:.
- **Fix**: Never pass a sprite through unchecked - fall back to `ui/Icons/iconQuestionMark`, which says "bad path" at a glance. Helper on **[Power tabs & buttons](#/nml/power-buttons)**.

### Status effect draws no sprite on the unit

- **See**: Either nothing is drawn over the creature, or `NullReferenceException` in `Status.updateAnimationFrame()` on **every frame** for as long as the status lasts.
- **Why**: `StatusLibrary` fills `sprite_list` from `"effects/" + texture` and sets `need_visual_render` in one pass while the game loads, before your mod existed. And `texture` names a **folder** of frames, not one PNG.
- **Fix**: Frames in `GameResources/effects/fx_hello_status/`, then after `add()`:

```csharp
cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
cursed.need_visual_render = true;
```

### Buttons stacked on top of each other

- **See**: The tab looks empty, or one button sits on the pile.
- **Why**: `recalc()` only recomputes the width; laying the buttons out is a second call, and it skips inactive children.
- **Fix**: Call both, in order, after adding every button: `tab.recalc();` then `tab.sortButtons();`. Not during `OnModLoad`, though: there `recalc()` crashes, see **[Your power tab never appears](#your-power-tab-never-appears)**.

### The button is there, clicking it arms nothing

- **See**: Cursor does not change, clicking the map does nothing.
- **Why**: The button is bound to the power **by id, at creation time**.
- **Fix**: Register the power first, create the button second - in the same helper, so the order cannot drift. And `click_action` is `(WorldTile, string)`; the `(WorldTile, GodPower)` shape belongs to `click_power_action`.

### `addOpposite` / `addDecision` / `addSpell` do nothing

- **See**: The opposite trait is never removed, the decision never fires. Silent.
- **Why**: Those calls only append an **id**. Turning ids into live objects happens once at startup, before your mod loads.
- **Fix**: Fill the resolved fields yourself after `add()`: `linkCombatActions()`, `linkSpells()`, `decisions_assets` (an array you build from `AssetManager.decisions_library.get()`, there is no link method), and assign `opposite_traits` directly. If you set `opposite_trait_mod` and leave `opposite_traits` null, the game crashes later inside its social code - an empty `HashSet` prevents it.

---

## Registered, then broken in the world

Every entry in this section has the same cause. The game prepares some part of every asset **once, while it loads**, and your mod registers its assets after that. Nothing tells you: the asset exists, it has a name, and the first time the game actually uses it, it throws. The fix is always the same shape, too: do that one step yourself, right after you register the asset :wbfacepalm:.

### Your creature raises a shadow error

- **See**: `ActorAssetLibrary: Shadow size is too small : (0.00, 0.00)`, three times per creature, and an error popup in game.
- **Why**: The library measures every actor's shadow sprite at startup. A creature added afterwards is never measured.
- **Fix**: `asset.texture_asset.loadShadow();` after the clone. See **[Custom actors](#/nml/custom-actors)**.

### Your trait, item or creature stays locked

- **See**: It exists, but the knowledge book shows it greyed out and the player cannot use it until it turns up in a world.
- **Why**: `needs_to_be_explored` is `true` by default on everything that can be unlocked: actors, the seven kinds of trait, items, item modifiers and world laws.
- **Fix**: `needs_to_be_explored = false` when you create it. See **[Custom traits](#/nml/custom-traits)**.

### The game crashes while loading your weapon or your food

- **See**: `ArgumentNullException: Value cannot be null. Parameter name: key` in `ItemLibrary.loadSprites()` or `ResourceLibrary.loadSprites()`.
- **Why**: Weapons get `path_gameplay_sprite`, and resources `full_sprite_path`, derived in `post_init()` during the game's own load. Yours stay `null`.
- **Fix**: Set them yourself. See **[Custom items](#/nml/custom-items)** and **[Resources & food](#/nml/resources)**.

### A cloud crashes the moment it spawns

- **See**: `NullReferenceException` in `Cloud.prepare()` the first time your cloud appears.
- **Why**: `CloudLibrary` turns `path_sprites` into `cached_sprites` and `color_hex` into `color` in one pass at startup.
- **Fix**: Do both yourself after `add()`. See **[Clouds & weather](#/nml/clouds)**.

### Placing your building throws Index was out of range

- **See**: `ArgumentOutOfRangeException: Index was out of range` in `Building.setAnimData()` the moment one is placed.
- **Why**: Building frames are preloaded for every building at startup. Yours has an empty frame list, or its folder has no `main_0.png`.
- **Fix**: `shrine.loadBuildingSprites();` once `sprite_path` is set, and frames named `main_0`, `construction_0`, `ruin_0`, `mini_0`. See **[Custom buildings](#/nml/custom-buildings)**.

### Your building throws on every frame it is visible

- **See**: Hundreds of `NullReferenceException` in `DynamicSprites.getRecoloredBuilding()`, one per frame while it is on screen.
- **Why**: The atlas that paints a building in its owner's colour, `atlas_asset`, is linked in `checkAtlasLink()` at startup. A clone does not keep it.
- **Fix**: `shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);`

### The minimap throws once your building exists

- **See**: `NullReferenceException` in `Building.getColorForMinimap()` whenever the minimap redraws.
- **Why**: The minimap dot comes from `mini_0.png` in the building folder, and there is none.
- **Fix**: Add `mini_0.png`, one pixel per tile the building covers: 5x4 for anything cloned from `temple_human`.

### Your tile paints, then the map renderer throws

- **See**: `NullReferenceException` in `WorldTilemap.getVariation()` for every tile of yours on screen.
- **Why**: `TopTileLibrary` loads the PNGs in `tiles/<id>/` into `sprites` at startup.
- **Fix**: Load them yourself with `addVariation()`. See **[Tiles & terrain](#/nml/tiles)**.

### Spawning an animal on your tile crashes

- **See**: `NullReferenceException` in `Subspecies.generateName()`, only on your tile and only for animals.
- **Why**: A clone of a grass tile keeps `is_biome = true` but not `biome_asset`, which is linked in `linkAssets()` at startup. Animals add the biome to their species name.
- **Fix**: `moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);`

### Drops fall invisibly, or a projectile throws

- **See**: Your drops land with nothing drawn, or `ArgumentOutOfRangeException` in `QuantumSpriteLibrary.drawProjectiles()`.
- **Why**: Drops, projectiles, statuses, buildings and in-hand resources read their art with `getSpriteList()`, which returns the frames *inside* a folder. A single PNG comes back as an empty list.
- **Fix**: One folder per animation, even for a single frame: `drops/hello_ember/hello_ember_0.png`. See **[Sprites & resources](#/nml/sprites-and-resources)**.

### The log fills with ArgumentNullException from projectiles

- **See**: Thousands of `ArgumentNullException: Value cannot be null` in `ProjectileManager.updateProjectiles()` while a projectile is in the air.
- **Why**: A projectile with no shooter has no kingdom, and the manager uses the kingdom as a dictionary key every frame.
- **Fix**: Give it one: `pForcedKingdom: World.world.kingdoms_wild.get("nature")`, the game's own neutral owner.

### Your power tab never appears

- **See**: `NullReferenceException` in `PowersTab.setNewWidth()`, the tab is missing and so are your powers.
- **Why**: `recalc()` was called during `OnModLoad`. The tab's own `Start()` has not run yet, so its parent is still `null`, and the exception kills the whole stage.
- **Fix**: Create the tab at load, lay it out from `Update()`. See **[Power tabs & buttons](#/nml/power-buttons)**.

### The settings window shows raw ids

- **See**: `LocalizedTextManager: missing text: strike_radius Description` in the log.
- **Why**: NML asks every settings row for two keys: `<id>` for the label and `<id> Description`, with a space and a capital D, for the tooltip.
- **Fix**: Add both to `Locales/en.json`. See **[Mod settings](#/nml/mod-config)**.

### The world throws every frame after you add a world behaviour

- **See**: `NullReferenceException` in `MapBox.updateWorldBehaviours()`, every frame, from the moment your mod loads.
- **Why**: The world keeps one timer per behaviour, created when the map first woke up, before your mod. Yours has none, and the loop calls it anyway.
- **Fix**: `behaviour.manager = new WorldBehaviour(behaviour);` right after `add()`. See **[World ages & behaviours](#/nml/world-ages)**.

### A disaster crashes when it writes to the world log

- **See**: `NullReferenceException` in the `WorldLogMessage` constructor, called from `WorldLog.logDisaster()`.
- **Why**: `world_log` is the id of a `WorldLogAsset`, not a text key. An id nobody registered comes back `null`, and the message is built around it.
- **Fix**: Clone `$basic_disaster$` under that id and set its `locale_id`. See **[Disasters](#/nml/disasters)**.

### A disaster with no action crashes when it is picked

- **See**: `NullReferenceException` in `WorldBehaviourActions.updateDisasters()`, the first time the roll lands on yours.
- **Why**: The roll calls `action` without checking it. `spawn_asset_unit` on its own does nothing.
- **Fix**: Point `action` at `AssetManager.disasters.simpleUnitAssetSpawnUsingIslands`, or write your own.

### The first ruler to consider your plot throws

- **See**: `NullReferenceException` in `PlotAsset.checkIsPossible()`.
- **Why**: `check_is_possible` is called without a null check, every time a leader looks at the plot.
- **Fix**: Always set it. With no condition, return `true`. See **[Plots](#/nml/plots)**.

### Your decision, plot, gene or weapon exists and nothing ever uses it

- **See**: No error. The asset is in its library, the game never picks it.
- **Why**: The game picks from lists it built at startup: `basic_plots`, the decision lists, the gene mutation pool, the weapon pools, the ages' slot pools. Yours was added after.
- **Fix**: Add it to the list the game actually reads. Each page says which: **[Custom AI](#/nml/custom-ai)**, **[Plots](#/nml/plots)**, **[Subspecies traits](#/nml/subspecies-traits)**, **[Custom items](#/nml/custom-items)**, **[World ages & behaviours](#/nml/world-ages)**.

---

## Compiles for you, not for them

### `CS0122: inaccessible due to its protection level`

- **See**: Code copied from a working mod does not compile: `addStatusEffect`, `getHit`, `_localized_text`, `addBuilding`.
- **Why**: Those are `internal`. NML compiles your `Code/*.cs` against its own **publicized** copy (`StreamingAssets/Mods/NML/Assembly-CSharp-Publicized.dll`), so in a normal source mod they just work. The error appears when you build your own `.dll` in Visual Studio against the stock `Assembly-CSharp.dll`, which hides them.
- **Fix**: Reference that publicized copy in your project, or take the public route:

| Instead of | Use |
| --- | --- |
| `actor.addStatusEffect("x", 20f)` | `World.world.statuses.newStatus(actor, AssetManager.status.get("x"), 20f)` |
| `actor.getHit(5f, ...)` | `actor.changeHealth(-5)` |
| `LocalizedTextManager.instance._localized_text[k] = v` | `LM.Add("en", k, v)` then `LM.ApplyLocale(false)` |

### Works on your machine, does nothing on theirs

- **See**: Reports that the mod loads and has no content, or throws on the first line.
- **Why**: Almost always one of four: a hardcoded path with your username; a zip of the mod's *contents* instead of the *folder*; a `GUID` that changed between releases; `Code/` shipped next to a stale `.dll`.
- **Fix**: Derive paths from `GetDeclaration().FolderPath`. Zip the folder. Set `GUID` once and never change it. Ship `Code/` **or** a `.dll`, never both.

---

## Works, then breaks later

### Another mod silently replaces your content

- **See**: Your trait is gone when a specific other mod is on. One line in the log, long scrolled past: `duplicate asset - overwriting...`
- **Why**: One flat id namespace per library, shared by vanilla and every mod. Last registration wins, and load order is not yours.
- **Fix**: Prefix every id: `hello_swift`, never `swift`. Guard with `if (AssetManager.traits.has(SWIFT)) return;`. To *change* vanilla content, fetch it with `get()` and edit in place instead of adding a replacement.

### Crash on `World.world` while the mod loads

- **See**: The crash is on your first line that touches the map.
- **Why**: `OnModLoad` runs before any world exists. Asset libraries are ready; the world is not.
- **Fix**: Register in `OnModLoad`, touch the world from `Update()` behind `if (!Config.game_loaded) return;` plus a null check on `World.world`, `World.world.units` and `MapBox.instance`.

### Your data starts controlling the wrong creatures

- **See**: After loading a save or making a new world, unrelated units act possessed.
- **Why**: Unit ids are **per world** and get reissued from the start. Keeping the `Actor` object is worse: dead actors are pooled and revived, so your reference is never null - it is somebody else now.
- **Fix**: Notice the world change and drop everything. World time running backwards is the cheapest signal:

```csharp
double now = World.world.getCurWorldTime();
if (_lastWorldTime >= 0.0 && now < _lastWorldTime - 1.0) MyRegister.Clear();
_lastWorldTime = now;
```

### Everything is gone after a save/load

- **See**: Your units are back to vanilla behaviour, but still carry your trait.
- **Why**: Only the game's own data classes are serialized; your static dictionary is not. Traits are saved as ids, and an id **not in the library at load time is silently dropped** - so disable, load, re-enable, and the trait is stripped from every unit.
- **Fix**: Let the trait be the flag that survives and rehydrate from it: `trait.action_on_augmentation_load = (pActor, pTrait) => MyRegister.Restore(pActor);`
- **Or**: Keep the state in the unit itself. Its custom data store is saved with it: see **[Remembering things](#/nml/saving-data)**.

### Units freeze in clumps

- **See**: Groups of units stop moving; the group changes every frame. One exception per frame, not thousands.
- **Why**: The per-unit loops have no try/catch. An exception on unit *i* skips every unit after it that frame.
- **Fix**: Wrap the body of every patch and every custom behaviour's `execute` in try/catch, returning `BehResult.Stop` on failure.

### Half your Harmony patches never applied

- **See**: Two patches of nine work. One error, then nothing.
- **Why**: `PatchAll` stops at the first patch class it cannot resolve and never processes the rest.
- **Fix**: Patch class by class, so one failure costs one patch - full loop on **[Harmony patches](#/nml/harmony-patches)**.

### Your `updateStats` patch crashes for other people

- **See**: Fine for an hour on your machine, a threading exception on a tester's.
- **Why**: The game runs `updateStats` as a **parallel** job: your Postfix executes on worker threads, on many units at once.
- **Fix**: Touch only that unit's own numbers there. Queue everything else (Unity calls, shared lists, the random helper) for your own `Update()`.

### You patched `getHit` and buildings still take damage

- **See**: Your damage rule applies to units but not buildings, or fires twice.
- **Why**: `getHit` exists three times: on the base class and as an override on `Actor` **and** on `Building`. Harmony patches a body, not a dispatch slot.
- **Fix**: Patch each concrete override you care about, and guard against double-counting.

### Your Prefix broke three other mods

- **See**: "Your mod broke mod X." Nothing in the log, and X's author cannot reproduce it alone.
- **Why**: Returning `false` skips the original **and every other mod's patch after yours**. On `updateStats`, that also leaves stale cached flags on the unit forever.
- **Fix**: Prefer Postfix and adjust (`__result *= 0.5f`) over Prefix and cancel. When you must cancel, cancel the narrowest method, and `return true` early for every case you do not care about.

### A unit stands still forever, or crashes every frame

- **See**: One unit frozen with no task name, or a stack trace every tick.
- **Why**: An unknown **task** id is a silent permanent no-op; an unknown **job** id is a crash every tick.
- **Fix**: Assert your ids once at load, register tasks before the job that lists them, and never hand `next_job_delegate` an id you have not verified.

### Your AI takeover quietly reverts

- **See**: After a while some units are back on vanilla AI while your register still lists them.
- **Why**: Actors are pooled: a "new" unit is a recycled object whose job delegate was just reset. Combat resets it too.
- **Fix**: Re-assert it on your own clock instead of once: `if (pActor.ai.next_job_delegate != MyAI.NextJob) pActor.ai.next_job_delegate = MyAI.NextJob;`

### The game hitches four times a second

- **See**: Average FPS looks fine, the game stutters rhythmically, no single hot function.
- **Why**: Everything thinks on the same tick, and units only advance when their current action ends, so they finish together.
- **Fix**: Think on your own timer, not in `execute`. Slice the population and process one slice per pass. Preallocate lists; keep LINQ, lambdas and `Debug.Log` out of that path.

### Clicks land on the map behind your window

- **See**: The player clicks a control on your panel and a unit spawns underneath it.
- **Why**: A canvas without a `GraphicRaycaster` is drawn but not hit-tested. And `unselect_when_window` only knows about the game's own windows, so a hand-built panel never disarms the active power.
- **Fix**: `Canvas` + `overrideSorting` + `sortingOrder` + `GraphicRaycaster` + a background `Image`, together. `raycastTarget = false` on labels. Disarm the power yourself when the window opens.

### Memory climbs every time the panel opens

- **See**: Memory grows in steps matching panel opens; long sessions degrade.
- **Why**: `Destroy(root)` frees the GameObject tree, but a `Texture2D` or `Sprite` **you** created is a separate object nothing collects.
- **Fix**: Destroy what you created and null the references. Do **not** destroy sprites that came from `SpriteTextureLoader` - those are shared.

### A new default never reaches existing players

- **See**: You change a default in `default_config.json` and returning players keep the old value. Fresh installs are fine.
- **Why**: That file is only a template. Live values live in `mods_config\<UID>.config`, which stores the **whole item** - so changed bounds and renamed callbacks are shadowed too.
- **Fix**: Test with that file deleted. When bounds or a callback must change for existing users, add a new `Id` instead of editing the old one.

### A settings slider moves, your callback never runs

- **See**: The row works, the value is saved, your method is never called.
- **Why**: The callback is `Namespace.Type:MethodName`, the method must be **static**, and its parameter must match the type (`INT_SLIDER` → `int`, `SLIDER` → `float`, `SWITCH` → `bool`, `TEXT` → `string`).
- **Fix**: Include the namespace, make it static, match the type. Changes apply when the window **closes**, not while dragging.

---

## Still stuck?

Post it on **[Feedback & requests](#/feedback)** with three lines - what you did, what you expected, what happened - and the log line. New traps get added to this page :aPES4_Noted:.
