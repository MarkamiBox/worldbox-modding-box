---
title: Asset field browser
group: Modding Tools
icon: :wbwise:
order: 430
---

# Asset field browser :wbwise:

Every asset you can create has a fixed set of fields, and a field that does not exist is a compile error or, worse, a line that quietly does nothing. This is the real list, pulled straight out of the decompiled game.

Pick the asset type, filter, click a name to copy it.

::tool:fields::

## How to read it

- **Left column** is the type. `int` means a whole number, so `rate_birth = 0.5f` will not compile. `float` takes a decimal and wants the `f` suffix, like `0.5f`. `string` takes text in quotes.
- **The `= value`** is the default the game already gives that field. If the default is what you want, do not set it. Less code, fewer typos.
- **"inherited from"** means the field comes from a parent class. It works exactly the same way; it is just declared higher up. `id`, `base_stats` and `path_icon` are usually inherited.
- **The chain above the table** (e.g. `ActorTrait -> BaseTrait -> BaseAugmentationAsset -> Asset`) is where the fields come from, most specific first.

> [!WARNING] Fields are not the whole story
> This tool tells you a field **exists** and what type it is. It does not tell you the game actually reads it for your case: some fields only matter for civ units, or only when another flag is on. When in doubt, find a vanilla asset that does what you want and copy its values, see **[Reading the game's code](#/toolbox/reading-the-game-code)**.
