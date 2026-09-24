---
title: Wolken & Wetter
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbtornado:
order: 172
---

# Wolken & Wetter :wbtornado:

Eine Wolke ist ein Sprite, das über die Karte zieht und Dinge auf alles fallen lässt, was sich darunter befindet. Regen, Säure, Lava, Schnee, Feuer: Sie sind alle dasselbe Asset mit einer anderen Farbe und einer anderen `drop_id`.

Wolken bieten das beste Preis-Leistungs-Verhältnis im ganzen Spiel für einen Modder. Ein einziges Asset, keine eigene Grafik erforderlich - und es bewegt sich, wirft Tropfen ab, beleuchtet den Boden und taucht von selbst in der Katastrophen-Liste auf.

## Eine Wolke registrieren

```csharp Mods/HelloBox/Code/HelloClouds.cs
using System.Collections.Generic;
using UnityEngine;

namespace HelloBox
{
    public static class HelloClouds
    {
        public const string EMBER = "hello_cloud_ember";

        // Your own art: GameResources/effects/clouds/hello_cloud.png
        private static readonly string[] Sprites = new string[]
        {
            "effects/clouds/hello_cloud"
        };

        public static void Initialize()
        {
            if (AssetManager.clouds.has(EMBER)) return;

            AssetManager.clouds.add(new CloudAsset
            {
                id = EMBER,
                color_hex = "#D14219",
                max_alpha = 0.8f,
                drop_id = "hello_ember",          // a drop id: see Drops & falling things
                cloud_action_1 = CloudLibrary.dropAction,
                interval_action_1 = 0.05f,
                speed_min = 1f,
                speed_max = 3f,
                considered_disaster = true,       // counts as a disaster in the game's own lists
                draw_light_area = true,
                draw_light_size = 4f,
                path_sprites = Sprites
            });

            // CloudLibrary turns path_sprites into sprites and color_hex into a colour during
            // the game's own startup, before your mod existed. Do both for yours.
            CloudAsset cloud = AssetManager.clouds.get(EMBER);
            List<Sprite> loaded = new List<Sprite>();
            foreach (string path in cloud.path_sprites)
            {
                Sprite sprite = SpriteTextureLoader.getSprite(path);
                if (sprite != null) loaded.Add(sprite);
            }
            cloud.cached_sprites = loaded.ToArray();
            cloud.color = Toolbox.makeColor(cloud.color_hex);
        }
    }
}
```

> [!WARNING] Eine spät registrierte Wolke hat keine Sprites
> `CloudLibrary` baut `cached_sprites` aus `path_sprites` und `color` aus `color_hex` in einem Durchgang beim Laden. Deine Wolke war da noch nicht in der Liste, beide bleiben leer, und beim ersten Spawn wirft das Spiel `NullReferenceException` in `Cloud.prepare()` :wbfacepalm:. Die letzten sechs Zeilen von `Initialize` oben machen diesen Durchgang für deine.


### Die Felder

Klone eine Vanilla-Wolke und ändere dann `drop_id` und `color_hex`. Viele Wolken brauchen nichts weiter.

| Feld | Was es tut |
| --- | --- |
| `color_hex` | Die Tönung. Das macht den Großteil der visuellen Identität aus |
| `max_alpha` | Wie deckend sie gezeichnet wird. Standardmäßig `0.8` |
| `drop_id` | Das fallende Objekt. Jede ID in `AssetManager.drops`, Vanilla oder deine |
| `cloud_action_1` / `cloud_action_2` | Zwei voneinander unabhängige Aktionen, jeweils mit eigenem Timer |
| `interval_action_1` / `interval_action_2` | Sekunden zwischen den Ausführungen jeder Aktion |
| `speed_min` / `speed_max` | Drift-Geschwindigkeit. Jede Wolke würfelt ihren Wert in diesem Bereich |
| `path_sprites` | Die Sprite-Liste. Das Spiel wählt zufällig eines pro Wolke |
| `considered_disaster` | Ob das Spiel sie als Katastrophe einstuft |
| `normal_cloud` | Markiert sie als gewöhnliches Wetter statt als Event |
| `draw_light_area`, `draw_light_size`, `draw_light_area_offset_x/y` | Das Leuchten auf dem Boden, für Feuer- und Lavawolken |

## Was eine Wolken-Aktion ist

Eine `CloudAction` nimmt die aktive Wolke entgegen und gibt nichts zurück:

```csharp
public delegate void CloudAction(Cloud pCloud);
```

`CloudLibrary.dropAction` ist die Standard-Aktion des Spiels: Sie wählt eine zufällige Kachel unter dem Sprite der Wolke und spawnt dort ein `drop_id`. In 90 % der Fälle ist das die einzige Aktion, die du brauchst - du setzt sie auf `cloud_action_1` und bist fertig. Faul und korrekt, meine Lieblingskombination :pepeOK:.

Für zusätzliche Effekte schreibst du eine eigene Methode und weist sie `cloud_action_2` zu:

```csharp
private static void SparkAction(Cloud pCloud)
{
    // Läuft alle interval_action_2 Sekunden für jede Wolke dieses Typs auf der Karte.
    // Halte sie schlank und würfle eine Chance, damit sie nicht dauernd feuert.
    if (!Randy.randomChance(0.02f)) return;

    int x = (int)pCloud.transform.localPosition.x;
    int y = (int)pCloud.transform.localPosition.y;

    WorldTile tile = World.world.GetTile(x, y);
    if (tile == null) return;

    MapBox.spawnLightningSmall(tile, 0.15f);
}
```

Dann setzt du `cloud_action_2 = SparkAction; interval_action_2 = 0.1f;`.

## Eigene Sprites

`path_sprites` ist ein Array, und jeder Eintrag wird exakt wie angegeben aus `GameResources/` geladen. Das Spiel wählt eine Textur pro Wolke aus, weshalb Vanilla drei Varianten übergibt.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/clouds/
        ├── cloud_hello_1.png
        ├── cloud_hello_2.png
        └── cloud_hello_3.png
```

```csharp
path_sprites = new string[]
{
    "effects/clouds/cloud_hello_1",
    "effects/clouds/cloud_hello_2",
    "effects/clouds/cloud_hello_3"
}
```

Ein Wolken-Sprite ist ein großer, weicher Graustufen-Blob. `color_hex` erledigt die gesamte Arbeit - male sie also nicht in deiner Zielfarbe an, sondern halte sie weiß und überlasse die Tönung dem Spiel :wbsmirk:.

## Eine Wolke am Himmel platzieren

Wolken werden über das Effektsystem gespawnt, nicht über einen Wolken-Manager:

```csharp
EffectsLibrary.spawn("fx_cloud", tile, HelloClouds.EMBER);
```

Das ist exakt das, was jede Vanilla-Wolkenkraft im Spiel tut. Packe es in eine Gotteskraft und der Spieler erhält ein Wolken-Werkzeug:

```csharp
GodPower power = new GodPower
{
    id = "hello_cloud_power",
    name = "hello_cloud_power",
    rank = PowerRank.Rank0_free,
    path_icon = "ui/Icons/iconFire",
    click_action = (WorldTile pTile, string pPowerID) =>
    {
        if (pTile == null) return false;

        EffectsLibrary.spawn("fx_cloud", pTile, HelloClouds.EMBER);
        MusicBox.playSound("event:/SFX/UNIQUE/SpawnCloud", pTile.pos.x, pTile.pos.y);
        return true;
    }
};
AssetManager.powers.add(power);
```

Siehe **[Gotteskräfte](#/nml/god-powers)** und **[Kräfte-Tabs & Buttons](#/nml/power-buttons)** für den Button.

## Die Vanilla-Wolken

Nützlich als Klonvorlagen und als Erinnerung an das, was bereits existiert:

`cloud_rain` · `cloud_lightning` · `cloud_snow` · `cloud_fire` · `cloud_lava` · `cloud_acid` · `cloud_ash` · `cloud_rage`

```csharp
// Starte mit einer funktionierenden Vorlage und ändere nur Farbe und Drop.
CloudAsset mine = AssetManager.clouds.clone("hello_cloud_blood", "cloud_rain");
mine.color_hex = "#8B1A1A";
mine.drop_id = "blood";
```

Denke daran, dass `clone()` die Registrierung automatisch übernimmt: Rufe danach keinesfalls `add()` auf.

## Eigene Grafiken einbinden

`path_sprites` ist eine Liste von Pfaden unter deinem `GameResources/`, nach denselben Regeln wie überall sonst. Siehe **[Sprites & Ressourcen](#/nml/sprites-and-resources)**. Ein Wolkensprite ist ein großer, weicher Klecks; `color_hex` übernimmt die Farbgebung, daher reicht eine Form in Graustufen völlig aus.

> [!TIP] Wolken vor Katastrophen prüfen
> Eine "Katastrophe" in der internen Spielliste ist häufig einfach nur eine Wolke mit `considered_disaster = true`. Bevor du eine ausgewachsene Katastrophe mit Spawn-Bedingungen und Dauer schreibst, prüfe zuerst, ob eine Wolke mit deinem Drop bereits genau das erreicht, was du wolltest :PES2_HmmmmThumbsUp:.
