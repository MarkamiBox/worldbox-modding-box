---
title: Messages & world log
group: Game Content
subgroup: God Powers & UI
icon: :wbscroll:
order: 207
---

# Messages & world log :wbscroll:

Printing to the console with `Main.Log()` is great while you are writing code. But when your god power drops a meteor, a custom boss unit awakens, or a kingdom signs a treaty, the player is not reading your debug log.

They need on-screen feedback: popup tips floating across the screen and entries in the world's history log.

## On-screen banners with WorldTip

The quickest way to put words in front of the player is `WorldTip.showNow`:

```csharp
WorldTip.showNow(string pText, bool pTranslate = true, string pPosition = "center", float pTime = 3f, string pColor = "#F3961F");
```

| Parameter | What it does | Default |
| --- | --- | --- |
| `pText` | Either a raw string or a localization key | Required |
| `pTranslate` | Whether to run `pText` through `LocalizedTextManager.getText()` | `true` |
| `pPosition` | Screen anchor: `"center"`, `"top"`, `"bottom"` | `"center"` |
| `pTime` | Duration in seconds before fading out | `3f` |
| `pColor` | Hex color code for the text | `"#F3961F"` (orange) |

> [!WARNING] WorldTip translates by default
> Because `pTranslate` defaults to `true`, writing `WorldTip.showNow("Something happened!")` makes the game look up a locale key named `"Something happened!"`. It fails to find one, logs a missing translation error, and displays raw placeholder text :PESgn_Oops:.
>
> If you are passing literal English text, **always** set `pTranslate: false`:
> ```csharp
> WorldTip.showNow("The Ancient Titan has awakened!", pTranslate: false, pColor: "#FF5555");
> ```
> For localized text, pass your translation key and leave `pTranslate: true`:
> ```csharp
> WorldTip.showNow("hello_titan_awakened", pTranslate: true);
> ```

### Bottom toolbar text

If you want a subtler message right above the god powers bar - like the tooltip text shown when selecting a brush - use `showToolbarText`:

```csharp
if (WorldTip.instance != null)
{
    WorldTip.instance.showToolbarText("Right-click to cancel");
}
```

This draws a small floating hint directly above the active power bar.

## Recording world events in WorldLog

The world log is the persistent record players open in the History window. Entries survive save-and-load and are tied to the world's chronology.

The game provides several ready-to-use static helpers on `WorldLog`:

```csharp
// Record an imperial succession:
WorldLog.logNewKing(kingdom);

// Record the founding of a new realm:
WorldLog.logNewKingdom(kingdom);

// Record a disaster event at a specific tile:
DisasterAsset earthquake = AssetManager.disasters.get("earthquake");
WorldTile centerTile = World.world.GetTile(100, 100);
WorldLog.logDisaster(earthquake, centerTile);
```

### Custom history entries

To add your own custom history event, construct a `WorldLogMessage` with a `WorldLogAsset` from `AssetManager.world_log`:

```csharp Mods/HelloBox/Code/HelloHistory.cs
namespace HelloBox
{
    public static class HelloHistory
    {
        public static void RecordTitanEvent(Kingdom pKingdom)
        {
            if (pKingdom == null || World.world == null) return;

            WorldLogAsset logAsset = AssetManager.world_log.get("king_new");
            if (logAsset == null) return;

            WorldLogMessage entry = new WorldLogMessage(logAsset, pKingdom.name, "Awakened the Titan")
            {
                timestamp = (int)World.world.getCurWorldTime()
            };

            // add() registers the entry with HistoryHud and writes it to the world log database:
            entry.add();
        }
    }
}
```

`entry.add()` adds the entry to the current game's history HUD and persists it into the world's SQLite database via `DBInserter.insertLog`.

## Map nameplates (nameplates_library)

When map layers are toggled on, banners appear over cities, kingdoms, and religions. These are handled by `AssetManager.nameplates_library` (`NameplateAsset`).

| Field | What it does |
| --- | --- |
| `id` | Identifier matching a `MetaType` |
| `path_sprite` | Sprite path for the banner frame |
| `padding_left` / `padding_right` / `padding_top` | Text offset boundaries |
| `map_mode` | Which `MetaType` this nameplate draws over |

> [!WARNING] Don't call add() for vanilla map modes
> The library only allows **one** nameplate per `MetaType`. If you call `AssetManager.nameplates_library.add(...)` for a `MetaType` that already exists (like kingdoms or cities), it throws an exception :wbfacepalm:.
>
> If you want to reskin or restyle vanilla nameplates, look up the existing one with `get()` and edit its fields:
> ```csharp
> NameplateAsset kingdomPlate = AssetManager.nameplates_library.get("kingdom");
> if (kingdomPlate != null)
> {
>     kingdomPlate.padding_left = 16;
> }
> ```

Next: **[Game options & time scales](#/nml/game-options)** for player options, or **[Every frame](#/nml/update-loops)** for running logic on a clock.
