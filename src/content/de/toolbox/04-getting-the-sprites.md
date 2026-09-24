---
title: Die Spielegrafiken extrahieren (AssetRipper)
group: Übersicht
subgroup: Externe Tools & Setup
icon: :wbgeneralartist:
order: 8
---

# Die Spielegrafiken extrahieren :wbgeneralartist:

Der Code verrät dir, *was* du schreiben musst. **AssetRipper** zeigt dir, wie die Grafik aussieht und, noch viel wichtiger: **wie ihr genauer Pfad lautet**.

Jedes Icon, jede Einheit, jedes Gebäude (building) und jeder Effekt in WorldBox wird über einen String-Pfad wie `ui/Icons/iconFly` geladen. Wenn du diesen Pfad versemmelst, ist dein Button schlicht ein unsichtbares Loch in der UI. Mit AssetRipper musst du nicht mehr raten.

> [!TIP] Wenn du nur den Pfad brauchst, brauchst du das hier gar nicht
> Die **[Icon-Suche](#/tools/icons)** auf dieser Website wurde genau aus diesem Export erstellt: jeder Pfad im Spiel, durchsuchbar. Rippe das Spiel selbst, wenn du die Grafik *sehen*, die richtige Größe wählen oder die Farbpalette abgleichen willst. Genau dafür ist der Rest dieser Seite da :PES4_HappyAwesome:.

## Das Spiel exportieren

1. Lade dir [**AssetRipper**](https://github.com/AssetRipper/AssetRipper/releases) herunter.
2. Wähle deinen WorldBox-Ordner aus (den Ordner mit `worldbox_Data`).
3. Exportiere alles in einen Ordner deiner Wahl. Das dauert ein paar Minuten und frisst ein paar Gigabyte :pepehang:.

Heraus kommt ein komplettes Unity-Projekt. Der einzige Teil, der dich wirklich interessiert, ist der exportierte Ordner `Resources` - genau dieser Baum wird vom Spiel zur Laufzeit abgefragt.

## Aus einer Datei einen Pfad machen

Die Regel ist kinderleicht: **Der Pfad ist der relative Ort unter `Resources`, ohne die Dateiendung.**

```text
ExportedProject/Assets/Resources/ui/Icons/iconFly.png
                                 └───────┬────────┘
                                         │
                      SpriteTextureLoader.getSprite("ui/Icons/iconFly")
```

Das sind die Ordner, die du am häufigsten brauchen wirst:

| Ordner | Was darin liegt |
| --- | --- |
| `ui/Icons/` | Alle kleinen Interface-Icons: Traits, Gottkräfte, Buttons |
| `ui/Icons/worldrules/` | Icons der Weltgesetze (world law) |
| `actors/` | Einheiten und ihre einzelnen Animations-Frames |
| `buildings/` | Häuser, Bäume, Erze |
| `effects/` | Explosionen, Projektile (projectile), Statuseffekt-Sprites |

## In deiner Mod verwenden

Such dir im Export ein Icon aus, das dir gefällt, notiere den Pfad und nutze es direkt. Du musst keine Dateien herumkopieren, das Icon steckt ja schon im Spiel:

```csharp Mods/HelloBox/Code/HelloPowers.cs
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
```

Oder setze es direkt als String an einem Asset:

```csharp
trait.path_icon = "ui/Icons/iconFly";
```

## Den Stil für eigene Grafiken treffen

Wenn du deine Grafiken selbst pixelst, öffne vorher eine Vanilla-Datei und kopiere drei Dinge:

- **Die Größe.** Trait- und Power-Icons sind winzig, meistens zwischen 16 und 32 px. Öffne ein Original und passe deines daran an.
- **Die Farbpalette.** WorldBox nutzt eine überschaubare, eher sanfte Farbpalette. Schnapp dir die Farben mit der Pipette von einem existierenden Sprite, damit dein Icon im Spiel nicht wie ein Fremdkörper wirkt :PES3_BobRoss:.
- **Der Pivot.** Einheiten und Gebäude stehen auf dem Boden, ihr Drehpunkt (Pivot) liegt also unten in der Mitte. Das entspricht `PivotY: 0.0` in deiner `sprites.json` (siehe **[Sprites & Ressourcen](#/nml/sprites-and-resources)**).

Pack dein PNG dann einfach in `GameResources/` mit derselben Ordnerstruktur, und es lädt haargenau wie eine offizielle Vanilla-Grafik:

```text
Mods/HelloBox/GameResources/ui/Icons/iconHello.png   ->   "ui/Icons/iconHello"
```
