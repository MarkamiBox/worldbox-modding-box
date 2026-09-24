---
title: Mod settings
group: NML Modding
subgroup: Advanced & Publishing
icon: :wbsettingsgear:
order: 40
---

# Mod settings :wbsettingsgear:

Sooner or later somebody will tell you your mod is too strong, too slow, or too loud. Instead of arguing on Discord :PESgn_WhySoToxic:, give them a settings window and let them fix it themselves.

NML draws the whole window for you. You write one JSON file.

## default_config.json

Drop a `default_config.json` in the root of your mod, next to `mod.json`:

```json Mods/HelloBox/default_config.json
{
  "hellobox": [
    {
      "Id": "strike_radius",
      "Type": "INT_SLIDER",
      "IntVal": 25,
      "MinIntVal": 5,
      "MaxIntVal": 100,
      "Callback": "HelloBox.HelloSettings:SetStrikeRadius"
    },
    {
      "Id": "max_spawns",
      "Type": "INT_SLIDER",
      "IntVal": 40,
      "MinIntVal": 1,
      "MaxIntVal": 500
    },
    {
      "Id": "tint_by_mood",
      "Type": "SWITCH",
      "BoolVal": true
    }
  ]
}
```

`"hellobox"` is the **group id**: one tab of settings. Everything inside it is one row in the window.

| Key | Meaning |
| --- | --- |
| `Id` | Unique inside the group. This is how you read the value in code |
| `Type` | `SWITCH` (on/off), `SLIDER` (float), `INT_SLIDER` (int), `TEXT` (text field) |
| `BoolVal` / `FloatVal` / `IntVal` / `TextVal` | The default value, matching the type |
| `MinFloatVal` / `MaxFloatVal`, `MinIntVal` / `MaxIntVal` | Slider bounds |
| `IconPath` | Optional icon for the row |
| `Callback` | Optional `Namespace.Type:MethodName` called when the value changes |

## Reading the values

With `BasicMod<T>` you get `GetConfig()` for free, and it is indexed by group, then by id:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LoadSettings();
}

private void LoadSettings()
{
    try { HelloSettings.StrikeRadius = GetConfig()["hellobox"]["strike_radius"].IntVal / 100f; }
    catch (System.Exception) { }

    try { HelloSettings.TintByMood = GetConfig()["hellobox"]["tint_by_mood"].BoolVal; }
    catch (System.Exception) { }
}
```

Yes, the `try/catch` around each one looks paranoid. It is not: if a player is upgrading from an older version of your mod, their saved config simply does not have the key you just added, and one missing key would otherwise take down your whole load.

## Callbacks

A `Callback` is `Namespace.Type:MethodName`, and the method takes the new value:

```csharp Mods/HelloBox/Code/HelloSettings.cs
namespace HelloBox
{
    public static class HelloSettings
    {
        public static float StrikeRadius = 0.25f;
        public static bool TintByMood = true;

        // called by NML when the player moves the slider
        public static void SetStrikeRadius(int pValue)
        {
            StrikeRadius = pValue / 100f;
        }
    }
}
```

> [!WARNING] Changes land when the window closes
> Not while dragging. If your callback does something expensive, this is good news. If you were expecting live preview, this is why it "doesn't work" :huh:.

## Where it is saved

Your `default_config.json` is only the **template**. The player's actual choices are written to:

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox\mods_config\<YOUR_GUID>.config
```

Which is also the first thing to delete when you are testing defaults and wondering why your new value never shows up :PESgn_OOF:.

## Don't forget the text (again)

Group ids and item ids are locale keys too, so add them to `Locales/en.json` or they show up raw. Each row also wants a second key, **`"<id> Description"`**, with a space and a capital D, for the tooltip:

```json Mods/HelloBox/Locales/en.json
{
  "hellobox": "HelloBox",

  "strike_radius": "Strike radius",
  "strike_radius Description": "How far the god power reaches.",

  "max_spawns": "Maximum spawns",
  "max_spawns Description": "Upper limit before the mod stops spawning.",

  "tint_by_mood": "Tint units by mood",
  "tint_by_mood Description": "Colour units by how happy they are."
}
```

> [!TIP] The log tells you which ones you forgot
> A missing label prints `LocalizedTextManager: missing text: strike_radius Description`. Search your log for `missing text:` after opening the settings window once, and you have the exact list of keys to add :wbsmirk:.

## Without BasicMod

If your main class implements `IMod` directly, implement `IConfigurable` on the same class and return the instance yourself:

```csharp
public ModConfig GetConfig()
{
    return _config;   // created or loaded by you
}
```

That single method is what makes the settings button appear next to your mod in the mods window. One method, and nobody argues with you on Discord any more. In theory.
