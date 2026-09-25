---
title: Map generation
group: Game Content
subgroup: World & Civilizations
icon: :wbworld:
order: 169
---

# Map generation :wbworld:

The new-world window reads three libraries. `map_sizes` is the size switcher, `map_gen_templates` is the row of shape cards (`continent`, `islands`, `donut`...), and `map_gen_settings` is the sliders and switches you get after picking a card. All three are ordinary asset libraries. Only one of them is plug and play, and I will tell you which parts need UI work before you find out the hard way.

## A bigger map

A size is a `MapSizeAsset`, and it is four fields:

| Field | What it does |
| --- | --- |
| `id` | Also the translation key, with a prefix: `map_size_<id>` |
| `size` | The side of the map in blocks of 64 tiles. `iceberg` is `9`, so 576 x 576 |
| `path_icon` | The icon next to the size name, relative to `ui/Icons/` |
| `show_warning` | Swaps the window's greeting for the "this map is big" warning |

The vanilla ones: `tiny` 2 · `small` 3 · `standard` 4 · `large` 5 · `huge` 6 · `gigantic` 7 · `titanic` 8 · `iceberg` 9.

```csharp Mods/HelloBox/Code/HelloMapGen.cs
namespace HelloBox
{
    public static class HelloMapGen
    {
        public const string COLOSSAL = "hello_colossal";

        public static void Initialize()
        {
            AddColossal();
            AddRing();
        }

        public const string RING = "hello_ring";

        private static void AddRing()
        {
            if (AssetManager.map_gen_templates.has(RING)) return;

            MapGenTemplate ring = AssetManager.map_gen_templates.clone(RING, "donut");

            // values is a plain object, so the clone shares donut's. give it its own before touching it
            ring.values = new MapGenValues
            {
                gradient_round_edges = true,
                add_center_gradient_land = true,
                add_center_lake = true,
                ring_effect = true,
                perlin_noise_stage_2 = true,
                random_shapes_amount = 3
            };

            // reset copies from a backup table filled at startup, and your id is not in it
            ring.show_reset_button = false;
        }

        public static void OpenRing()
        {
            if (!AssetManager.map_gen_templates.has(RING)) return;

            Config.current_map_template = RING;
            ScrollWindow.showWindow("new_world_templates_2");
        }

        private static void AddColossal()
        {
            if (AssetManager.map_sizes.has(COLOSSAL)) return;

            AssetManager.map_sizes.add(new MapSizeAsset
            {
                id = COLOSSAL,
                size = 10,                   // 10 x 64 = 640 tiles a side
                path_icon = "iconIceberg",   // ui/Icons/ is added for you
                show_warning = true
            });

            // the size switcher reads an array built in linkAssets(), which ran before your mod
            AssetManager.map_sizes.linkAssets();
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "map_size_hello_colossal": "Colossal"
}
```

> [!WARNING] Without `linkAssets()` the size is unreachable
> The arrows in the window do not walk the library. They walk a plain `string[]` that `MapSizeLibrary.linkAssets()` builds once at startup, before NML loads you. Your size is registered, and the arrows go straight past it forever. Calling `linkAssets()` again only rebuilds that array, so it is safe.

The arrows go in `list` order, so an appended size lands after `iceberg`, which is where a bigger map belongs. A smaller one wants `list.Remove` and `list.Insert(0, ...)` before the `linkAssets()` call.

What I can tell you about the limits, from the code:

- **Workshop upload refuses it.** The upload checks the size against `Config.maxMapSize`, which is `iceberg`, and rejects anything bigger with "Not a valid world size!".
- **Without your mod, the save list shows raw numbers.** The save browser looks the size up by its number and falls back to "width x height" when nothing matches. Whether such a save loads cleanly without your mod, I have not tested.
- **I have not tested how far it goes.** `10` is 23% more tiles than `iceberg`, and every step after that costs more. Somewhere up there is a number your players' computers will not like :PES5_Hmmmm:.

## A new world shape

A template is a `MapGenTemplate`. The actual recipe lives in its `values`, the rest decides how it is presented:

| Field | What it does |
| --- | --- |
| `values` | A `MapGenValues`: the flags and numbers the generator reads. See below |
| `path_icon` | The preview picture, full path: `ui/new_world_templates_icons/template_donut` |
| `force_height_to` | Sets every tile to this height after the first noise pass, before the rest shape it. `0` skips it |
| `freeze_mountains` | Freezes the mountain tops once the land is done |
| `perlin_replace` | Height-based tile swaps, like "above 170, `soil_high` becomes `soil_low`" |
| `special_anthill`, `special_checkerboard`, `special_cubicles` | Switch on one of the three hard-coded generators |
| `allow_edit_*` | Which settings rows the player sees for this template. See the next section |
| `show_reset_button` | Whether the window has a "reset" button |

The vanilla ids, which are all valid `clone()` sources: `continent` · `box_world` · `islands` · `toast` · `pancake` · `boring_plains` · `checkerboard` · `cubicles` · `dormant_volcano` · `cheese` · `bad_apple` · `donut` · `lasagna` · `chaos_pearl` · `anthill` · `empty`.

And the `MapGenValues` fields worth knowing:

| Field | What it does |
| --- | --- |
| `main_perlin_noise_stage`, `perlin_noise_stage_2`, `perlin_noise_stage_3` | The three noise passes that make the land |
| `perlin_scale_stage_1` / `_2` / `_3` | How zoomed-in each pass is. `5` by default |
| `gradient_round_edges` / `square_edges` | Fade the height down towards the map edge, in a circle or a square |
| `add_center_gradient_land`, `add_center_lake`, `center_gradient_mountains` | Push land, a lake or mountains towards the middle |
| `ring_effect` | An extra ring-shaped noise pass |
| `add_mountain_edges` / `remove_mountains` | A mountain border around the map / flatten mountains to normal ground |
| `low_ground` / `high_ground` | Lower or raise the ground after the noise passes |
| `random_shapes_amount` | How many random blobs get stamped on top |
| `random_biomes`, `add_vegetation`, `add_resources` | The last three are `true` by default |

`AddRing()` above clones a vanilla template and gives it its own recipe. Keep all three methods in the same `HelloMapGen` class.

```json Mods/HelloBox/Locales/en.json
{
  "template_hello_ring": "Ember Ring",
  "template_hello_ring_info": "A lake in the middle, land around it, and nobody asked for it."
}
```

> [!WARNING] Hide the reset button on your own templates
> "Reset" calls `resetTemplateValues()`, which reads the template's defaults from a dictionary filled once at startup with the vanilla ids. Yours is not in it, so the button throws `KeyNotFoundException`. `show_reset_button = false` and the problem does not exist.

> [!WARNING] A cloned template shares its `values`
> `clone()` copies lists into new lists, but `values` is a plain class, so it is copied by reference (see **[Asset libraries](#/nml/asset-libraries)**). Edit `ring.values.ring_effect` without the `new MapGenValues` line and every vanilla donut changes with it. The entries inside `perlin_replace` are shared the same way: build new ones rather than editing them.

### The catch: there is no card

The template picker is a prefab. It has one button per vanilla template, and each button finds its template by its own GameObject name. A new template gets no button, and nothing in the library changes that.

What does work is doing the button's job yourself: set the template, then open the second window, exactly like a vanilla card does.

Call `HelloMapGen.OpenRing()` from your button.

Hang that on a simple button, see **[Power tabs & buttons](#/nml/power-buttons)**, and the player gets your preview, your settings rows, the size arrows and the generate button, like any vanilla template. Putting a real card into the picker means cloning one of its buttons and renaming the clone before its `Awake()` runs, because that is when it reads its name. That is UI surgery I have not verified, so it is not on this page.

> [!NOTE] Editing a vanilla template instead
> `AssetManager.map_gen_templates.get("islands").values.random_shapes_amount = 10;` works, and needs no button at all. Just know that "reset" restores the startup copy, which was taken before your mod loaded. One click and your change is gone until the next restart.

## The rows under a template

Each slider and switch in the second window is a `MapGenSettingsAsset`:

| Field | What it does |
| --- | --- |
| `is_switch` | On/off instead of a number |
| `min_value` / `max_value` | The range, for a number |
| `allowed_check` | Given the current template, whether this row is shown |
| `action_get` / `action_set` | Read and write the value, usually on the current template's `values` |
| `increase` / `decrease` / `action_switch` | What the arrows and the switch do |

The vanilla rows: `gen_perlin_scale_stage_1` · `gen_perlin_scale_stage_2` · `gen_perlin_scale_stage_3` · `gen_random_shapes` · `gen_cubicles_sizes` · `gen_random_biomes` · `gen_mountain_edges` · `gen_add_vegetation` · `gen_add_resources` · `gen_add_center_lake` · `gen_add_center_land` · `gen_round_edges` · `gen_square_edges` · `gen_ring_effect` · `gen_low_ground` · `gen_high_ground` · `gen_remove_mountains` · `gen_forbidden_knowledge`.

The part a mod actually uses: every vanilla row's `allowed_check` reads one of your template's `allow_edit_*` flags. So you do not add rows, you pick which of these the player gets:

```csharp
// in AddRing(), after the clone: hide everything, then give back the rows that make sense for a ring
AssetManager.map_gen_templates.disableNormalSettings(ring);
ring.allow_edit_random_biomes = true;
ring.allow_edit_random_vegetation = true;
```

Fun detail: all three perlin sliders check `allow_edit_perlin_scale_stage_1`. The `_2` and `_3` flags exist and nothing reads them :PES2_Shrug:.

A new `MapGenSettingsAsset` on its own shows nothing. The rows are baked into the window's prefab and find their asset by GameObject name, the same trick as the template cards. A row of your own means cloning an existing one inside the window, and whatever you register must have `allowed_check` set, because the window calls it on every row without a null check.

> [!TIP] Start from the shape, not the settings
> Nine times out of ten, what you want is a template with a different `values` and a button that opens it. That needs no prefab edits. Check the fields again after a game update. Once the land looks right, **[Biomes](#/nml/biomes)** decides what grows on it :PES2_Wise:.
