---
title: Andere Mods
group: NML-Modding
subgroup: Erweitert & Veröffentlichung
icon: :wbmodders:
order: 45
---

# Andere Mods :wbmodders:

Deine Mod lebt nicht in einer leeren Welt. Ein Spieler installiert HelloBox vielleicht neben zwanzig anderen Mods, von denen die Hälfte ebenfalls versucht, den Kampf zu verändern, Weltgesetze anzupassen oder neue Merkmale hinzuzufügen.

Manchmal willst du dich mit ihnen abstimmen: Zusatzfunktionen aktivieren, wenn eine Partner-Mod installiert ist, ihre Methoden sicher patchen, ohne abzustürzen, falls sie fehlen, oder sicherstellen, dass deine Assets in der richtigen Reihenfolge registriert werden.

Es gibt zwei Wege, mit anderen Mods zu sprechen: zur Kompilierzeit über `mod.json`, oder zur Laufzeit über Code.

## Abhängigkeiten in mod.json deklarieren

Die sauberste Integration ist, die Beziehung in deiner `mod.json` zu deklarieren:

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "Markami",
  "version": "1.0.0",
  "description": "My first mod",
  "iconPath": "icon.png",
  "GUID": "com.markami.hellobox",
  "Dependencies": [],
  "OptionalDependencies": [
    "com.friend.coolmod"
  ],
  "IncompatibleWith": []
}
```

| Schlüssel | Bedeutung |
| --- | --- |
| `Dependencies` | Harte Anforderung. NML garantiert, dass diese Mods **vor** deiner geladen werden. Fehlt eine oder lässt sie sich nicht kompilieren, weigert sich NML, deine Mod überhaupt zu laden |
| `OptionalDependencies` | Weiche Anforderung. Ist die andere Mod installiert, lädt NML sie vor deiner **und** definiert dafür ein Compiler-Symbol. Fehlt sie, lädt deine Mod trotzdem normal |
| `IncompatibleWith` | Sperrliste. Ist eine Mod aus dieser Liste vorhanden, meldet NML einen Konflikt und verhindert, dass beide zusammen laufen |

### Das #if-Symbol zur Kompilierzeit

Wenn eine in `OptionalDependencies` gelistete Mod installiert und kompiliert ist, definiert NML für dich eine Präprozessor-Konstante.

Das Symbol ist die GUID der anderen Mod, in Großbuchstaben, mit allen nicht-alphanumerischen Zeichen durch Unterstriche ersetzt:

| GUID in `mod.json` | Definiertes Compiler-Symbol |
| --- | --- |
| `com.friend.coolmod` | `COM_FRIEND_COOLMOD` |
| `com.author.magic-items` | `COM_AUTHOR_MAGIC_ITEMS` |

Verpacke deinen Integrationscode in `#if`:

```csharp Mods/HelloBox/Code/HelloIntegration.cs
namespace HelloBox
{
    public static class HelloIntegration
    {
        public static void Initialize()
        {
#if COM_FRIEND_COOLMOD
            // Compiled only when that mod is present and active
            ApplyCoolModSynergy();
#endif
        }

#if COM_FRIEND_COOLMOD
        private static void ApplyCoolModSynergy()
        {
            // Safe to reference their types directly here
            Main.Log("CoolMod found! Enabling partner synergies.");
        }
#endif
    }
}
```

> [!WARNING] Falsch geschriebene Symbole scheitern lautlos
> Schreibst du `#if COM_FRIEND_COOL_MOD` statt `#if COM_FRIEND_COOLMOD`, sieht der Compiler ein undefiniertes Symbol und entfernt deinen Codeblock stillschweigend. Er läuft niemals, ohne jeden Fehler oder Warnung im Log :PES4_1IQ:. Prüfe die exakte GUID-Umwandlung immer doppelt.

## Zur Laufzeit prüfen

Der `#if`-Trick funktioniert nur, wenn NML deine Mod aus dem Quellcode kompiliert, und nur, wenn die andere Mod in `OptionalDependencies` deklariert ist.

Lieferst du eine vorkompilierte `.dll` aus, oder willst du dynamisch auf Mods prüfen, ohne neu zu kompilieren, prüfe zur Laufzeit.

### Geladene Assemblies prüfen

Du kannst prüfen, ob die Assembly der anderen Mod in die aktuelle AppDomain geladen ist:

```csharp
using System;
using System.Linq;

public static bool IsModLoaded(string pAssemblyName)
{
    return AppDomain.CurrentDomain.GetAssemblies()
        .Any(a => string.Equals(a.GetName().Name, pAssemblyName, StringComparison.OrdinalIgnoreCase));
}
```

Oder frage Harmonys `AccessTools`, ob eine ihrer Klassen existiert:

```csharp
using HarmonyLib;

bool hasPartner = AccessTools.TypeByName("PartnerNamespace.PartnerMain") != null;
```

Gibt `AccessTools.TypeByName` einen nicht-null `Type` zurück, ist ihr Code geladen und bereit.

## Eine andere Mod mit Harmony patchen

Eine Vanilla-Methode zu patchen ist unkompliziert. Eine Methode zu patchen, die in einer anderen Mod lebt, hat eine gewaltige Falle :wbfacepalm:.

Schreibst du eine normale Patch-Klasse, die ihren Typ referenziert:

```csharp
// NEVER do this for an optional mod!
[HarmonyPatch(typeof(PartnerMod.SomeClass), "SomeMethod")]
public static class BadCrossModPatch
{
    public static void Postfix() { }
}
```

Die Mono-Runtime versucht, `PartnerMod.SomeClass` aufzulösen, sobald sie deine Patch-Klasse lädt. Hat der Spieler diese Mod nicht installiert, stürzt deine gesamte Mod mit einer `TypeLoadException` oder `FileNotFoundException` ab, noch bevor dein `Initialize()` überhaupt fertig ist!

Patche stattdessen **manuell** mit `AccessTools`:

```csharp Mods/HelloBox/Code/HelloCrossPatch.cs
using System;
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCrossPatch
    {
        public static void ApplyIfPresent(Harmony pPatchEngine)
        {
            Type targetType = AccessTools.TypeByName("PartnerMod.SomeClass");
            if (targetType == null)
            {
                // The other mod is not installed. Skip peacefully.
                return;
            }

            MethodInfo targetMethod = AccessTools.Method(targetType, "SomeMethod");
            if (targetMethod == null)
            {
                Main.LogWarning("PartnerMod found, but SomeMethod was not found. Outdated version?");
                return;
            }

            MethodInfo postfix = typeof(HelloCrossPatch).GetMethod(nameof(Postfix), BindingFlags.Static | BindingFlags.NonPublic);
            pPatchEngine.Patch(targetMethod, postfix: new HarmonyMethod(postfix));
            Main.Log("Successfully hooked PartnerMod.SomeMethod!");
        }

        private static void Postfix()
        {
            // Runs after their method, only if their mod is installed
        }
    }
}
```

Manuelles Patchen hält die Typreferenz string-basiert, sodass die Runtime nie versucht, eine fehlende Assembly zu laden.

## Die Ladereihenfolge-Falle

Wenn du den Inhalt einer anderen Mod klonst oder referenzierst, ist Timing alles.

```csharp
// If their mod hasn't run Initialize() yet, this throws NullReferenceException!
AssetManager.traits.clone("hello_super_trait", "partner_custom_trait");
```

NML lädt Mods in Abhängigkeitsreihenfolge. Trägst du die andere Mod in `Dependencies` oder `OptionalDependencies` ein, garantiert NML, dass ihr `Initialize()` **vor** deinem läuft.

Hast du sie *nicht* als Abhängigkeit deklariert, ist die Ladereihenfolge zwischen Mods nicht festgelegt. Immer:
1. Deklariere die andere Mod in `OptionalDependencies`.
2. Sichere dich mit `AssetManager.traits.has(...)` ab, bevor du ihre Assets klonst oder liest.

## Daten ohne Konflikte teilen

WorldBox gibt dir flexible Dictionaries, um eigene Daten an Actors (`actor.data`) und an Welten (`World.world.map_stats.custom_data`) zu speichern.

Jede Mod teilt sich dieselben Dictionaries. Schreibst du:

```csharp
// Bad: someone else might use "level" too
actor.data.set("level", 5);
```

Könnte eine andere Mod im selben Frame mit völlig anderen Annahmen auf `"level"` schreiben.

Versieh deine eigenen Datenschlüssel immer mit deinem Mod-Präfix:

```csharp
actor.data.set("hello_level", 5);
int myLevel = actor.data.get("hello_level", 0);
```

Weiter geht's mit **[Mod veröffentlichen](#/nml/publishing)** oder verwalte Simulationsgeschwindigkeit und Optionen unter **[Spieloptionen & Zeitskalen](#/nml/game-options)**.
