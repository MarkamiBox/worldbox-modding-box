---
title: Jeder Frame
group: NML-Modding
subgroup: Erweitert & Veröffentlichung
icon: :wbyawn:
order: 43
---

# Jeder Frame :wbyawn:

Deine Hauptklasse ist eine Unity-Komponente. `BasicMod<T>` erbt von `MonoBehaviour`, schreibst du also eine `Update()`-Methode darauf, ruft Unity sie einmal pro Frame auf. Von der ersten Sekunde nach dem Start bis das Spiel schließt, sechzig Mal pro Sekunde, egal ob eine Welt existiert oder nicht.

Das ist der Platz für alles, was keine Reaktion auf etwas ist: eine Prüfung jeden Spielmonat, eine Warteschlange aus einem Harmony-Patch, ein Tastendruck. Es ist auch der leichteste Weg im Modding, das Spiel von jemandem in eine Diashow zu verwandeln :wbfacepalm:.

## Der Schutz

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    // game_loaded: past startup. worldLoading: no world half cleared or half built
    if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

    HelloTicker.Tick();
}
```

| Prüfung | Wovor sie dich schützt |
| --- | --- |
| `World.world != null` | Es existiert noch keine Karteninstanz |
| `Config.game_loaded` | Die ersten Momente nach dem Start, bevor das Spiel seine erste Welt begonnen hat |
| `Config.worldLoading` | Der Ladebildschirm. Eine Welt wird gerade geleert, generiert oder geladen, und die Einheitenlisten werden dir unter den Füßen geleert und neu gefüllt |

`Config.worldLoading` ist `SmoothLoader.isLoading()`, dieselbe Prüfung, die das eigene `MapBox.Update()` des Spiels macht, bevor es irgendetwas simuliert. Der Schutz in **[Logs & Debugging](#/nml/logs-and-debugging)** deckt den Start ab; füge die Ladeprüfung hinzu und du bleibst danach auch aus jedem Weltladen heraus.

## Nicht jeder Frame

Die meisten Dinge brauchen keine sechzig Prüfungen pro Sekunde. Wähle eine Uhr und laufe auf ihr.

| Uhr | Was sie tut |
| --- | --- |
| `Time.deltaTime` | Echte Sekunden seit dem letzten Frame. Läuft weiter, wenn das Spiel pausiert ist, ignoriert die Geschwindigkeitseinstellung. Das Spiel fasst `Time.timeScale` nie an |
| `World.world.getCurWorldTime()` | Weltsekunden, als `double`. Stoppt, während das Spiel pausiert ist oder ein Fenster offen ist, läuft bei höheren Geschwindigkeiten schneller. 5 ist ein Monat, 60 ist ein Jahr |

Weltzeit für alles, was *in* der Welt passiert. Hier vergisst jede Einheit mit dem Groll-Merkmal aus **[Dinge merken](#/nml/saving-data)** einen Treffer pro Monat:

```csharp Mods/HelloBox/Code/HelloTicker.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloTicker
    {
        private const double INTERVAL = 5.0;   // world seconds: one in-game month
        private static double _last;

        [HarmonyPostfix]
        public static void ResetClock(MapBox __instance)
        {
            _last = __instance == null ? 0.0 : __instance.getCurWorldTime();
        }

        public static void Tick()
        {
            if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

            double now = World.world.getCurWorldTime();

            // a backwards clock resets the baseline without firing a tick
            if (now < _last) _last = now;
            if (now - _last < INTERVAL) return;
            _last = now;

            foreach (Actor actor in World.world.units)
            {
                if (actor == null || !actor.isAlive()) continue;
                if (!actor.hasTrait(HelloMemory.GRUDGE)) continue;

                actor.data.change(HelloMemory.HITS, -1, 0, 100000);
            }
        }
    }
}
```

Behalte den `PatchAll`-Aufruf aus **[Harmony-Patches](#/nml/harmony-patches)**: `ResetClock` läuft nach jeder generierten oder geladenen Welt, auch nach einer mit gleichem oder späterem Zeitstempel. Der erste Tick wartet in dieser Welt ein volles Intervall. Eine rückwärtslaufende-Uhr-Prüfung allein kann nicht jedes Laden erkennen.

Pause, Geschwindigkeit und offene Fenster sind alle abgedeckt, weil die Weltuhr sie bereits beachtet. Echtzeit für Dinge, die nicht in der Welt liegen, wie ein blinkendes Label:

```csharp
private static float _timer;

_timer += Time.deltaTime;
if (_timer < 2f) return;
_timer = 0f;
```

> [!NOTE] Selbst auf Pause prüfen
> `Config.paused` ist der Pause-Button und nichts weiter. Die Simulation stoppt auch, während ein Fenster offen ist; `World.world.isPaused()` deckt beides ab, ist aber `internal`, braucht also die publizierte Assembly, gegen die NML dich kompiliert. Weltzeit zu nutzen erspart dir die Frage.

## Koroutinen

Eine Koroutine ist eine Methode, die mitten drin warten kann. Deine Hauptklasse ist ein `MonoBehaviour`, kann also eine starten:

```csharp Mods/HelloBox/Code/HelloShakes.cs
using System.Collections;
using UnityEngine;

namespace HelloBox
{
    public static class HelloShakes
    {
        public static void Begin(Actor pActor)
        {
            Main.Instance.StartCoroutine(ShakeThreeTimes(pActor));
        }

        private static IEnumerator ShakeThreeTimes(Actor pActor)
        {
            for (int i = 0; i < 3; i++)
            {
                // checked after every wait: the unit had a whole second to die
                if (World.world == null || Config.worldLoading || pActor == null || !pActor.isAlive()) yield break;

                pActor.startShake();
                yield return new WaitForSeconds(1f);
            }
        }
    }
}
```

`WaitForSeconds` wartet in echten Sekunden, und da das Spiel `Time.timeScale` nie ändert, stoppt sie nicht bei Pause und kümmert sich nicht um die Spielgeschwindigkeit. Die Koroutine läuft auch weiter, wenn der Spieler mittendrin eine andere Welt lädt. Daher die Prüfung nach jedem `yield`, nicht nur vor dem ersten :PES2_F:.

## Tasten

`Input.GetKeyDown(KeyCode.F7)` in `Update()` funktioniert. Es feuert aber auch, während der Spieler den Namen einer Einheit in ein Textfeld tippt, und der Spieler kann die Taste nicht ändern. Die eigenen Hotkeys des Spiels überspringen Tasten, solange ein Textfeld fokussiert ist, ein `HotkeyAsset` bekommt das also gratis dazu. Siehe **[Eigene Fenster](#/nml/custom-windows)**, um eines zu registrieren. Behalte `GetKeyDown` für eine Debug-Taste, die nur du je drückst.

## Schwere Arbeit

- **Über Einheiten auf einem Timer iterieren, niemals jeden Frame.** Zehntausend Einheiten mal sechzig Frames sind sechshunderttausend Prüfungen pro Sekunde, für ein Merkmal, das vielleicht drei Einheiten haben.
- **Billige Prüfung zuerst.** Dieselbe Regel wie bei einem Harmony-Patch: Die erste Zeile ist die, die dich `return` lässt.
- **Parallele Codes reihen ein, `Update()` leert.** Ein Postfix auf einer parallelen Methode wie `Actor.updateStats` darf Unity oder gemeinsamen Zustand nicht anfassen, siehe **[Harmony-Patches](#/nml/harmony-patches)**. Er reiht die Einheit ein, und der Hauptthread holt sie hier ab:

```csharp
// pending is the ConcurrentQueue your patch fills
while (pending.TryDequeue(out Actor actor))
{
    if (actor == null || !actor.isAlive()) continue;
    // now Unity, Randy and your own lists are safe to touch
}
```

Was du tust, sobald du in der Schleife bist, ist **[Die Welt zur Laufzeit](#/nml/world-at-runtime)**. Was noch da sein soll, nachdem gespeichert und geladen wurde, ist **[Dinge merken](#/nml/saving-data)** :PES_OkHand:.
