---
title: Dem Spiel unter die Haube schauen (UnityExplorer)
group: Übersicht
subgroup: Externe Tools & Setup
icon: :wbeyeball:
order: 6
---

# Dem Spiel unter die Haube schauen :wbeyeball:

**UnityExplorer** ist ein Ingame-Inspector. Damit kannst du das Spiel auf jedem Bildschirm anhalten, auf ein beliebiges Fenster, einen Button oder eine Einheit klicken und jeden einzelnen Wert live auslesen.

Warum du das willst: Statt mühsam zu erraten, woraus ein Vanilla-Fenster eigentlich zusammengebaut ist, machst du es einfach auf und *siehst nach*. Jede Frage der Sorte "Wie zur Hölle haben die das gemacht?" ist damit in zwei Minuten beantwortet.

## So installierst du es

1. Bring zuerst **BepInEx** zum Laufen, siehe **[Die Live-Konsole](#/toolbox/bepinex-console)**.
2. Lade [**UnityExplorer für BepInEx 5 (Mono)**](https://github.com/sinai-dev/UnityExplorer/releases) herunter (hol dir die Datei `UnityExplorer.BepInEx5.Mono.zip` von der Releases-Seite).
3. Entpacke das Zip-Archiv nach `C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\plugins/`. Achte darauf, dass sowohl `UnityExplorer.BIE5.Mono.dll` als auch die dazugehörige Abhängigkeit `UniverseLib.Mono.dll` darin landen!
4. Starte das Spiel und drücke **F7** (die Standardtaste zum Einblenden).

```text
worldbox/ (C:\Program Files (x86)\Steam\steamapps\common\worldbox\)
└── BepInEx/
    └── plugins/
        └── sinai-dev-UnityExplorer/ (or directly in plugins/)
            ├── UnityExplorer.BIE5.Mono.dll
            └── UniverseLib.Mono.dll
```

## Die drei Panels, die du wirklich brauchen wirst

| Panel | Wofür es gut ist |
| --- | --- |
| **Object Explorer → Scene Explorer** | Der Live-Baum von absolut allem auf dem Bildschirm. Dein Fenster versteckt sich irgendwo hier |
| **Inspector** | Klicke auf ein beliebiges Objekt im Baum, um jede Komponente, jedes Feld und die aktuellen Werte zu sehen |
| **C# Console** | Tippe eine Zeile C# ein und führe sie direkt im laufenden Spiel aus. Ganz ohne Neustart |

## Beispiel 1: Herausfinden, wie ein Vanilla-Fenster aufgebaut ist

Du möchtest, dass dein eigenes Fenster genau wie das Original im Spiel aussieht. Also:

1. Öffne im Spiel das Fenster, das dir gefällt (zum Beispiel die Weltgesetze).
2. Drücke F7, gehe zu **Object Explorer → Scene Explorer** und klappe `CanvasMain` → `canvas_ui` auf.
3. Klicke dich durch die untergeordneten Elemente, bis das markierte Objekt genau dem geöffneten Fenster entspricht.
4. Schau dir im Inspector die Komponenten an: das `Image` mit seinem 9-Slice-Sprite, die Abmessungen im `RectTransform`, das `ScrollRect`.

Jetzt kennst du die Größen, den Sprite-Pfad und die genaue Struktur, die du auf der Seite **[Eigene Fenster](#/nml/custom-windows)** übernehmen kannst. So sparst du dir drei Stunden planloses Herumprobieren an UI-Anchors :PES5_Peek:.

## Beispiel 2: Echte Feldwerte eines Vanilla-Assets auslesen

Öffne die **C# Console** und führe folgenden Code aus:

```csharp UnityExplorer C# console
var t = AssetManager.traits.get("strong");
UnityExplorer.ExplorerCore.Log(t.path_icon);
UnityExplorer.ExplorerCore.Log(t.group_id);
```

In der Log-Ausgabe von UnityExplorer siehst du sofort:

```text
[Message:UnityExplorer] ui/Icons/actor_traits/iconStrong
[Message:UnityExplorer] physique
[Message:UnityExplorer] Invoked REPL (no return value)
```

Du hast gerade Icon-Pfad und Trait-Gruppe eines Vanilla-Traits direkt aus dem laufenden Spiel ausgelesen. Kopiere beides in deinen eigenen Trait, und schon landet er an der richtigen Stelle im UI - mit einem Icon, das tatsächlich existiert.

## Beispiel 3: Eine Idee testen, bevor du eine ganze Mod dafür schreibst

Immer noch in der C#-Konsole:

```csharp UnityExplorer C# console
// Spawne einen Wolf auf der Kachel bei x=100, y=100
var tile = World.world.GetTile(100, 100);
World.world.units.spawnNewUnit("wolf", tile);
```

Wenn es hier klappt, klappt es auch in deiner Mod. Wenn es dir hier um die Ohren fliegt, hast du dir gerade einen kompletten Kompilier- und Neustart-Zyklus gespart :aPES2_ThumbsUp:.

> [!TIP] Nutze es zusammen mit der Konsole
> UnityExplorer beantwortet die Frage: "Woraus besteht das?". Die BepInEx-Konsole beantwortet: "Wurde mein Code überhaupt ausgeführt?". Fast jedes Modding-Problem ist eine dieser beiden Fragen.
