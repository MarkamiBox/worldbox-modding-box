---
title: Gotteskräfte
group: Spielinhalte
subgroup: Göttliche Kräfte & UI
icon: :wbgodfinger:
order: 200
---

# Gotteskräfte :wbgodfinger:

Eine Gotteskraft ist das, was passiert, wenn der Spieler dein Werkzeug auswählt und auf die Welt klickt. Etwas spawnen, etwas segnen, etwas in die Luft jagen.

Zwei getrennte Dinge sind daran beteiligt, und sie zu verwechseln ist der klassische Anfängerfehler:

| | |
| --- | --- |
| Die **Kraft** (`GodPower`) | Die Daten: eine ID, ein Icon und der Code, der beim Klick ausgeführt wird |
| Der **Button** (`PowerButton`) | Das Ding in der Leiste, das der Spieler tatsächlich anklicken kann |

Diese Seite erstellt die Kraft. Die Seite **[Power-Tabs & Buttons](#/nml/power-buttons)** bringt sie auf den Bildschirm.

## Die Kraft erstellen

```csharp Mods/HelloBox/Code/HelloPowers.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloPowers
    {
        public const string STRIKE = "hello_strike";

        public static void Initialize()
        {
            // Registriere dieselbe ID niemals doppelt: Das Spiel behält die erste.
            if (AssetManager.powers.get(STRIKE) != null) return;

            GodPower strike = new GodPower
            {
                id = STRIKE,
                name = STRIKE,
                rank = PowerRank.Rank0_free,        // keine Freischaltung erforderlich
                path_icon = "ui/Icons/iconFire",
                unselect_when_window = true,        // Werkzeug abwählen, wenn sich ein Fenster öffnet
                show_tool_sizes = false,            // keine Pinselgrößen (klein/mittel/groß)

                // Was passiert, wenn der Spieler mit diesem Werkzeug auf eine Kachel klickt.
                click_action = (WorldTile pTile, string pPowerID) =>
                {
                    if (pTile == null) return false;

                    EffectsLibrary.spawnExplosionWave(pTile.posV3, 3f, 0.5f);
                    Earthquake.startQuake(pTile);
                    return true;   // true = der Klick wurde verarbeitet
                }
            };

            AssetManager.powers.add(strike);
        }
    }
}
```

Füge `HelloPowers.Initialize();` zu `Main.cs` hinzu.

### Was die einzelnen Teile bewirken

- **`id`**: der Name, auf den sich alles andere bezieht. Der Button, die Übersetzung, andere Mods.
- **`name`**: wird für die UI-Abfragen des Spiels genutzt. Ihn gleich der ID zu halten erspart dir Kopfschmerzen.
- **`rank = PowerRank.Rank0_free`**: von Anfang an verfügbar, nichts freizuschalten.
- **`path_icon`**: das Cursor-/Werkzeug-Icon.
- **`unselect_when_window`**: Öffnet der Spieler ein Fenster, legt sich das Werkzeug von selbst ab, damit er nicht versehentlich die Karte hinter dem Panel zerschmettert.
- **`click_action`**: dein Code. Er bekommt das **angeklickte Feld** und die **ID der Macht** und gibt `true` zurück, wenn er etwas getan hat.

> [!WARNING] Die Klick-Signatur ist `(WorldTile, string)`
> `click_action` ist eine `PowerActionWithID`, also ist das zweite Argument die **ID der Macht als String**, keine `GodPower`. Es gibt ein zweites Feld, `click_power_action`, das `(WorldTile, GodPower)` nimmt. Die falsche Form beschert dir einen Compilerfehler, der sich wie Unsinn liest :PES_DaFuq:.

## Nützliche Aktionen beim Klick

```csharp
// die Einheit auf (oder neben) der Kachel, falls vorhanden
Actor actor = null;
foreach (Actor found in Finder.getUnitsFromChunk(pTile, 1, 2.5f))
{
    if (found != null && found.isAlive()) { actor = found; break; }
}

// eine Kreatur spawnen
World.world.units.spawnNewUnit("wolf", pTile);

// ein visueller Effekt auf der Kachel
EffectsLibrary.spawnAt("fx_lightning_small", pTile.posV3, 0.25f);

// etwas vom Himmel fallen lassen (siehe Tropfen & fallende Objekte)
World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

// dem Spieler eine Nachricht anzeigen
WorldTip.showNow("The gods are displeased.", false, "top", 3f);
```

## Gedrückt halten zum Malen

Das Setzen von `hold_action = true` und einem `click_interval` sorgt dafür, dass sich die Kraft wiederholt, während die Maustaste gedrückt gehalten wird, genau wie bei den Vanilla-Pinselwerkzeugen:

```csharp
strike.hold_action = true;
strike.click_interval = 0.15f;   // Sekunden zwischen Wiederholungen
```

## Dein eigenes Icon

`path_icon` ist der Werkzeug-Cursor und das Gesicht des Buttons. Es wird genau wie angegeben geladen, aus `GameResources/`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloStrike.png
```

```csharp
strike.path_icon = "ui/Icons/iconHelloStrike";
```

> [!WARNING] Ein fehlendes Icon ist ein unsichtbarer Button
> Wenn der Pfad falsch ist, kommt das Sprite als `null` zurück. Und ein `null`-Sprite ist kein Button mit fehlendem Bild: es ist ein unsichtbares Loch in der Leiste, das der Spieler niemals finden wird. Siehe die Fallback-Hilfsfunktion auf **[Power-Tabs & Buttons](#/nml/power-buttons)** :aPES_Hide:.

## Die Texte

```json Locales/en.json
{
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess. Mostly a mess."
}
```

## Pinselformen

Eine Gotteskraft malt mit einem **Pinsel**: das Muster an Kacheln, das ein Klick abdeckt. Das Spiel erzeugt die Pixelliste und das Vorschaubild jedes Pinsels per Code, sodass eine neue Form überhaupt keine Bilddateien benötigt.

```csharp Mods/HelloBox/Code/HelloBrushes.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloBrushes
    {
        public const string TARGET = "hello_target";

        public static void Initialize()
        {
            if (AssetManager.brush_library.has(TARGET)) return;

            BrushData target = new BrushData
            {
                id = TARGET,
                size = 6,
                group = BrushGroup.Special,
                show_in_brush_window = true,
                localized_key = "brush_hello_target",
                continuous = true,
                fast_spawn = true
            };

            // post_init() runs generate_action and measures every brush, at startup.
            // Do both yourself: a centre dot and a ring around it.
            List<BrushPixelData> pixels = new List<BrushPixelData>();
            for (int x = -6; x <= 6; x++)
            {
                for (int y = -6; y <= 6; y++)
                {
                    int dist = x * x + y * y;
                    if (dist == 0 || (dist >= 16 && dist <= 36)) pixels.Add(new BrushPixelData(x, y, dist));
                }
            }
            target.pos = pixels.ToArray();
            target.width = 13;
            target.height = 13;
            target.sqr_size = target.width * target.height;

            AssetManager.brush_library.add(target);

            // linkAssets() shuffled every brush, and post_init() listed the ones the
            // brush hotkeys cycle through. Both at startup.
            BrushLibrary.shuffleBrush(target);
            BrushLibrary._available_brushes.Add(TARGET);
        }
    }
}
```

Eine Kraft kann sich über `force_brush = "hello_target"` an einen Pinsel binden, ähnlich wie die 1-Kachel-Kräfte des Hauptspiels an `sqr_0` gebunden sind. Die Pinsel-Hotkeys durchlaufen die Liste `_available_brushes`, sodass deine Form in dieser Rotation enthalten ist. Das Pinselfenster ist eine andere Sache: Es baut seine Buttons beim Öffnen auf. Falls deine Pinselform dort fehlt, ist sie über `force_brush` und die Hotkeys dennoch uneingeschränkt nutzbar.

> [!WARNING] Pinselformen werden beim Spielstart vermessen
> `BrushLibrary.post_init()` führt die `generate_action` jedes Pinsels aus und berechnet `width`, `height` sowie `sqr_size`, während `linkAssets()` die Pixel mischt. Ein nachträglich hinzugefügter Pinsel erhält nichts davon: Setze `pos` und die Größenangaben daher selbst wie oben gezeigt. Das Vorschaubild wird direkt aus `pos` gerendert, ein Pinsel benötigt also kein eigenes Icon.

```json Mods/HelloBox/Locales/en.json
{
  "brush_hello_target": "Target"
}
```

## Sie ist immer noch nicht im Spiel

Stimmt: Du hast eine Kraft gebaut, aber noch zeigt sie nichts an. Gehe zu **[Power-Tabs & Buttons](#/nml/power-buttons)**, das ist die andere Hälfte, und sie braucht gerade mal zehn Zeilen :pepeOK:.
