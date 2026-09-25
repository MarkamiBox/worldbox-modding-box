---
title: Spieloptionen
group: Spielinhalte
subgroup: Göttliche Kräfte & UI
icon: :wbsettingsgear:
order: 206
---

# Spieloptionen :wbsettingsgear:

In **[Mod-Einstellungen](#/nml/mod-config)** hast du NMLs eigenes Konfigurationsfenster gesehen (`default_config.json`), das deiner Mod einen sauberen, getrennten Einstellungs-Tab gibt.

WorldBox hat außerdem sein eigenes natives Optionssystem: `AssetManager.options_library`, gestützt von `PlayerConfig`. Das ist das System hinter dem Vanilla-Einstellungsfenster, den Entwickler-Schaltern und den Gotteskraft-Umschaltbuttons. Daneben steht `AssetManager.time_scales`, das steuert, wie schnell die Welt tickt.

## Eine native Option registrieren

Optionen in `AssetManager.options_library` sind Instanzen von `OptionAsset`:

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

### Die Felder auf OptionAsset

| Feld | Bedeutung |
| --- | --- |
| `id` | Eindeutige Options-ID |
| `type` | `OptionType.Bool`, `OptionType.Int` oder `OptionType.String` |
| `default_bool` / `default_int` / `default_string` | Der Standardwert, wenn nicht gesetzt |
| `translation_key` | Lokalisierungsschlüssel für den Titel der Option |
| `translation_key_description` | Lokalisierungsschlüssel für den Tooltip |
| `action` | Callback-Delegat (`ActionOptionAsset`), ausgelöst, wenn sich die Option ändert |
| `reset_to_default_on_launch` | Ob diese Option beim Spielstart auf den Standard zurückgesetzt wird |
| `computer_only` | Wenn `true`, nur in PC-Builds gezeigt |

> [!WARNING] OptionAsset ist kein Speicher
> `OptionAsset` beschreibt nur die Metadaten und den Callback der Option. Der eigentliche Wert, den der Spieler umgelegt hat, lebt in `PlayerConfig.dict[id]`. Fügst du ein `OptionAsset` hinzu, ohne auch ein passendes `PlayerOptionData` in `PlayerConfig.dict` einzutragen, wirft jeder Code, der `PlayerConfig.dict[id]` indiziert, eine `KeyNotFoundException`, bis das Einstellungsfenster gespeichert wurde!

## Verknüpfung mit Umschaltbuttons

Native Optionen glänzen im Zusammenspiel mit `GodPower`-Umschaltbuttons auf der Kraftleiste.

Wie in **[Power-Tabs & Buttons](#/nml/power-buttons)** erklärt, bindet das Setzen von `power.toggle_name = HelloOptions.TURBO_HARVEST` einen Button direkt an den Zustand deiner Option. Beim Klick schaltet das Spiel `PlayerConfig.dict[toggle_name].boolVal` um, aktualisiert die visuelle Hervorhebung des Buttons und löst deinen Options-Callback aus.

## Simulationsgeschwindigkeit & Zeitskalen

WorldBox steuert die Simulationsgeschwindigkeit des Spiels über `AssetManager.time_scales` (`WorldTimeScaleLibrary`). Jede Geschwindigkeitseinstellung ist ein `WorldTimeScaleAsset`:

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

| Feld | Bedeutung |
| --- | --- |
| `multiplier` | Visueller und simulierter Geschwindigkeitsfaktor (`1f` = normal, `0.5f` = Zeitlupe) |
| `ticks` | Wie viele Simulationsdurchgänge pro Frame laufen |
| `conway_ticks` | Wie viele zellularautomatische Durchgänge (Tile-Ausbreitung, Lava, Eis) pro Frame laufen |
| `locale_key` | Übersetzungsschlüssel, gezeigt beim Hovern über den Uhr-Button |
| `path_icon` | Icon-Texturpfad innerhalb von `ui/Icons/` |

Die Vanilla-Geschwindigkeiten sind `slow_mo` (0.5x), `x1` (1x), `x2` (2x), `x3` (3x), `x4` (4x) und `x5` (5x). Sonic-Geschwindigkeit (Greg-Geschwindigkeit in den Debug-Optionen) treibt die Simulationsticks noch weiter hoch.

Um eine Geschwindigkeit programmatisch zu aktivieren:

```csharp
// Smoothly switch world clock to your speed asset:
WorldTimeScaleAsset target = AssetManager.time_scales.get(HelloSpeed.HYPER);
if (target != null)
{
    Config.time_scale_asset = target;
}
```

## Welchen Einstellungsweg solltest du wählen?

| Bedarf | Empfohlener Weg |
| --- | --- |
| Mod-spezifische Konfigurationen (Schadensmultiplikatoren, Spawn-Anzahlen, umschaltbare Funktionen) | **[Mod-Einstellungen](#/nml/mod-config)** (`default_config.json`). Sie liegen auf der Karte deiner Mod, handhaben Zahlen/Strings sauber und verschmutzen nicht die UI des Basisspiels |
| Umschalter, gebunden an Symbolleisten-Buttons | Native `OptionAsset` + `GodPower.toggle_name` |
| Eigene Spielgeschwindigkeiten oder Simulationstempo | `AssetManager.time_scales` (`WorldTimeScaleAsset`) |

Weiter geht's mit **[Nachrichten & Weltprotokoll](#/nml/messages-and-world-log)**, um Hinweise anzuzeigen und Weltgeschichte aufzuzeichnen.
