---
title: Debugging & Veröffentlichen
group: BepInEx Modding
icon: :wbfireworks:
order: 3
---

# Debugging & Veröffentlichen :wbfireworks:

Dein Plugin baut. Jetzt muss es laden, funktionieren und zu anderen Leuten kommen. Diese Seite sind die Fehler, denen du wirklich begegnest, in der Reihenfolge, in der sie kommen, und danach, wie du das Ding veröffentlichst.

## Wo du nachsiehst

| Datei | Wo | Was es ist |
| --- | --- | --- |
| Das Konsolenfenster | Öffnet sich mit dem Spiel, wenn du es eingeschaltet hast | Alles, live. Siehe **[Die Live-Konsole (BepInEx)](#/toolbox/bepinex-console)** |
| `LogOutput.log` | `worldbox/BepInEx/` | Dasselbe, gespeichert. Danach fragen dich die Leute |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | Unitys eigenes Log, für Abstürze, die BepInEx nicht abgefangen hat |

Such in `LogOutput.log` zuerst nach dem Namen deines Plugins. Der erste Fehler, der ihn erwähnt, ist der wichtige, dieselbe Regel wie bei **[Logs & Debugging](#/nml/logs-and-debugging)**.

## Wenn es nicht baut

| Fehler | Was er bedeutet | Lösung |
| --- | --- | --- |
| `The reference assemblies for .NETFramework,Version=v4.7.2 were not found` | Dein PC hat kein Entwicklerpaket für .NET Framework 4.7.2 | Das Paket `Microsoft.NETFramework.ReferenceAssemblies` aus dem **[Projekt-Setup](#/toolbox/bepinex-modding)** |
| `CS0246: The type or namespace name 'Input' could not be found` | Ein Unity-Modul ist nicht referenziert | `UnityEngine*.dll` referenzieren, nicht nur `UnityEngine.dll` |
| `CS0122: '...' is inaccessible due to its protection level` | Du hast ein `internal`-Mitglied des Spiels benutzt | `Publicize="true"` an der Referenz auf `Assembly-CSharp` |
| `The process cannot access the file ... because it is being used by another process` | Das Spiel läuft und hält deine `.dll` fest | WorldBox schließen, neu bauen |
| `Could not find a part of the path` beim Kopieren | `GameDir` in deiner `.csproj` stimmt nicht | Lass es auf den Ordner zeigen, in dem `worldbox.exe` liegt |

## Wenn es baut, aber nicht lädt

Starte das Spiel und such nach einer Zeile `Loading [YourPlugin 1.0.0]`. Keine Zeile heißt, BepInEx hat dein Plugin nie gefunden:

| Was du siehst | Warum |
| --- | --- |
| Gar keine Zeile | Die `.dll` liegt nicht in `BepInEx/plugins/`, oder BepInEx läuft selbst nicht (keine Konsole, kein `LogOutput.log`) |
| Keine Zeile, obwohl die `.dll` am richtigen Ort liegt | Das Projekt zielt auf das falsche Framework. Es muss `net472` sein, nicht `net8.0` oder `netstandard2.1` |
| Die Zeile ist da, dann `Could not load file or assembly 'Something'` | Du benutzt eine Bibliothek, die nicht mit deinem Plugin ausgeliefert wird. Leg ihre `.dll` neben deine in den Plugin-Ordner |
| Zwei Plugins mit derselben GUID | BepInEx lädt nur eins. Meistens eine alte Kopie deines eigenen Plugins in einem anderen Ordner |

## Wenn es lädt, aber kaputtgeht

| Fehler | Was es meistens ist |
| --- | --- |
| `NullReferenceException` bei `AssetManager...` | Du hast die Bibliotheken (library) des Spiels zu früh angefasst. Nimm den Postfix auf `AssetManager.init()` aus **[Inhalte mit BepInEx hinzufügen](#/toolbox/bepinex-content)** |
| `HarmonyException` / `Ambiguous match found` | Ein Patch zeigt auf eine Methode, die es nicht gibt oder die Zwillinge hat. Dieselben Lösungen wie bei **[Harmony-Patches](#/nml/harmony-patches)** |
| `MissingMethodException` / `TypeLoadException` nach einem Spiel-Update | Das Spiel hat sich unter dir verändert. Geh **[Nach einem Spiel-Update aktualisieren](#/nml/game-updates)** durch und bau neu |
| Nach einem Sprachwechsel zeigt dein Text rohe Schlüssel | Der Postfix auf `LocalizedTextManager.setLanguage` fehlt |
| Dein Icon ist unsichtbar | Das Sprite wurde registriert, nachdem schon etwas nach seinem Pfad gefragt hatte, oder es zeigt auf einen Ordner |
| Alles läuft, dann hört das Plugin mitten im Spiel auf | `HideManagerGameObject = true` in `BepInEx/config/BepInEx.cfg` |

## Eine schnellere Schleife

WorldBox für jede Änderung zu schließen und neu zu öffnen, ist das Schlimmste an BepInEx. Das Plugin **ScriptEngine** aus der Sammlung BepInEx.Debug macht es erträglicher: Plugins in `BepInEx/scripts/` statt `plugins/` lassen sich mit einer Taste neu laden, während das Spiel läuft (die aktuelle Taste steht in seiner Readme).

Für Tools, Fenster und Overlays ist das super. Für Inhalte hilft es weniger: Das Spiel vergisst ein Merkmal (trait), das du schon registriert hast, nicht, und jeder Harmony-Patch bleibt aktiv, außer dein Plugin entfernt ihn beim Entladen (`harmony.UnpatchSelf()` in `OnDestroy()`). Nimm es, während du an einer Oberfläche baust, nicht, während du ein Merkmal feinjustierst :PES2_Shrug:.

## Veröffentlichen

### Was in die Zip kommt

Bau das Plugin im Release-Modus und pack es so in eine Zip, dass Spieler sie direkt in ihren Spielordner entpacken können:

```text HelloBepInEx.zip
HelloBepInEx.zip
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

Was **nicht** hineinkommt:

- **BepInEx selbst.** Spieler installieren es einmal, genau wie du. Verlink sie auf die **[Konsolen-Seite](#/toolbox/bepinex-console)** und sag, welche Version: BepInEx 5, Mono, x64.
- **Die Dateien des Spiels.** `Assembly-CSharp.dll`, die Unity-Module und vor allem die publicized Kopie, die der Build erzeugt hat. Das ist der Code des Spiels, nicht deiner zum Weitergeben. `Private="false"` in der `.csproj` hält sie schon aus deinem Build-Ordner heraus, also füg sie einfach nicht von Hand hinzu.
- **`BepInEx.dll` und `0Harmony.dll`.** BepInEx hat sie schon.

### Die Versionsnummer

Erhöh sie an zwei Stellen und halte sie gleich: `version` in `[BepInPlugin]` (was das Log und andere Plugins sehen) und `<Version>` in der `.csproj` (was die `.dll`-Datei sagt). Ein Plugin, das bei seinem dritten Release `1.0.0` loggt, macht jeden Fehlerbericht schwerer.

### Von einem anderen Plugin abhängen

Wenn dein Plugin ein anderes BepInEx-Plugin zuerst geladen braucht, sag es, dann sortiert BepInEx die Ladereihenfolge und weigert sich, deins ohne das andere zu laden:

```csharp
[BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
[BepInDependency("com.other.author.library")]
public class HelloPlugin : BaseUnityPlugin
```

Gib `BepInDependency.DependencyFlags.SoftDependency` als zweites Argument an, wenn das andere Plugin optional ist und du nur nach ihm laden willst, falls es da ist.

### Wo hochladen

An denselben Orten wie jede andere WorldBox-Mod, und mit denselben Tipps: siehe **[Veröffentlichen](#/nml/publishing)**. Die eine zusätzliche Zeile, die deine Beschreibung braucht, ist "Requires BepInEx 5 (Mono x64)", ganz oben. Sie erspart dir die "geht nicht"-Kommentare von Leuten, die es in ein reines NML-Spiel installiert haben :wbsalut:.
