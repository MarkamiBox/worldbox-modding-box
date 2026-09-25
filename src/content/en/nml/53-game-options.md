---
title: Game options
group: Game Content
subgroup: God Powers & UI
icon: :wbsettingsgear:
order: 206
---

# Game options :wbsettingsgear:

In **[Mod settings](#/nml/mod-config)** you saw NML's own config window (`default_config.json`), which gives your mod a clean, separated settings tab.

WorldBox also has its own native option system: `AssetManager.options_library`, backed by `PlayerConfig`. This is the system that powers the vanilla settings window, developer toggles, and god-power toggle buttons. Alongside it sits `AssetManager.time_scales`, which controls how fast the world ticks.

## Registering a native option

Options in `AssetManager.options_library` are instances of `OptionAsset`:

```csharp Mods/HelloBox/Code/HelloOptions.cs
namespace HelloBox
{
    public static class HelloOptions
    {
        public const string TURBO_HARVEST = "hello_turbo_harvest";

        public static void Initialize()
        {
            if (AssetManager.options_library.has(TURBO_HARVEST)) return;

            OptionAsset option = new OptionAsset
            {
                id = TURBO_HARVEST,
                type = OptionType.Bool,
                default_bool = false,
                translation_key = "option_hello_turbo_harvest",
                translation_key_description = "option_desc_hello_turbo_harvest",
                action = (OptionAsset pAsset) =>
                {
                    bool active = IsTurboActive();
                    Main.Log("Turbo harvest is now: " + active);
                }
            };

            AssetManager.options_library.add(option);

            // Registering the asset does NOT automatically populate PlayerConfig.dict.
            // Ensure the value exists so your code can read it immediately:
            if (!PlayerConfig.dict.ContainsKey(TURBO_HARVEST))
            {
                PlayerConfig.dict.Add(TURBO_HARVEST, new PlayerOptionData
                {
                    name = TURBO_HARVEST,
                    boolVal = option.default_bool
                });
            }
        }

        public static bool IsTurboActive()
        {
            if (PlayerConfig.dict.TryGetValue(TURBO_HARVEST, out PlayerOptionData data))
            {
                return data.boolVal;
            }
            return false;
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "option_hello_turbo_harvest": "Turbo Harvest",
  "option_desc_hello_turbo_harvest": "Settlers gather crops at triple speed."
}
```

### The fields on OptionAsset

| Field | What it does |
| --- | --- |
| `id` | Unique option identifier |
| `type` | `OptionType.Bool`, `OptionType.Int`, or `OptionType.String` |
| `default_bool` / `default_int` / `default_string` | The default value when unset |
| `translation_key` | Localization key for the option's title |
| `translation_key_description` | Localization key for the tooltip |
| `action` | Callback delegate (`ActionOptionAsset`) triggered when the option changes |
| `reset_to_default_on_launch` | Whether to reset this option back to default when the game starts |
| `computer_only` | If true, only shown on PC builds |

> [!WARNING] OptionAsset is not storage
> `OptionAsset` only describes the option's metadata and callback. The actual value the player flipped lives in `PlayerConfig.dict[id]`. If you add an `OptionAsset` without also inserting a matching `PlayerOptionData` into `PlayerConfig.dict`, any code attempting to index `PlayerConfig.dict[id]` throws a `KeyNotFoundException` until the settings window is saved!

## Linking with toggle buttons

Native options shine when paired with `GodPower` toggle buttons on the power bar.

As explained in **[Power tabs & buttons](#/nml/power-buttons)**, setting `power.toggle_name = HelloOptions.TURBO_HARVEST` binds a button directly to your option state. When clicked, the game toggles `PlayerConfig.dict[toggle_name].boolVal`, updates the button's visual highlight, and triggers your option callback.

## Simulation speed & time scales

WorldBox controls the game's simulation speed through `AssetManager.time_scales` (`WorldTimeScaleLibrary`). Each speed setting is a `WorldTimeScaleAsset`:

```csharp Mods/HelloBox/Code/HelloSpeed.cs
namespace HelloBox
{
    public static class HelloSpeed
    {
        public const string HYPER = "hello_hyper_speed";

        public static void Initialize()
        {
            if (AssetManager.time_scales.has(HYPER)) return;

            WorldTimeScaleAsset hyper = new WorldTimeScaleAsset
            {
                id = HYPER,
                locale_key = "speed_hello_hyper",
                multiplier = 10f,          // 10x world simulation speed
                ticks = 2,                 // Simulation sub-ticks per frame
                conway_ticks = 2,          // CA ticks per frame (fire, acid, temperature)
                path_icon = "ui/Icons/iconClockX5"
            };

            AssetManager.time_scales.add(hyper);
        }
    }
}
```

| Field | What it does |
| --- | --- |
| `multiplier` | Visual and world speed multiplier (`1f` = normal, `0.5f` = slow motion) |
| `ticks` | How many simulation passes run each frame |
| `conway_ticks` | How many cellular automaton passes (tile spreading, lava, ice) run per frame |
| `locale_key` | Translation key displayed when hovering over the clock button |
| `path_icon` | Icon texture path inside `ui/Icons/` |

The vanilla speeds are `slow_mo` (0.5x), `x1` (1x), `x2` (2x), `x3` (3x), `x4` (4x), and `x5` (5x). Sonic speed (Greg speed in debug options) pushes simulation ticks even higher.

To activate a speed programmatically:

```csharp
// Smoothly switch world clock to your speed asset:
WorldTimeScaleAsset target = AssetManager.time_scales.get(HelloSpeed.HYPER);
if (target != null)
{
    Config.time_scale_asset = target;
}
```

## Which settings route should you pick?

| Need | Recommended Route |
| --- | --- |
| Mod-specific configs (damage multipliers, spawn counts, toggleable features) | **[Mod settings](#/nml/mod-config)** (`default_config.json`). It lives on your mod's card, handles numbers/strings cleanly, and does not pollute the base game's UI |
| Toggles bound to toolbar buttons | Native `OptionAsset` + `GodPower.toggle_name` |
| Custom game speeds or simulation pacing | `AssetManager.time_scales` (`WorldTimeScaleAsset`) |

Next: **[Messages & world log](#/nml/messages-and-world-log)** for displaying tips and recording world history.
