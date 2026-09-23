---
title: Harmony-Patches
group: NML-Modding
subgroup: Erweitert & Veröffentlichung
icon: :wbhammer:
order: 42
---

# Harmony-Patches :wbhammer:

Alles auf den anderen Seiten **fügt** WorldBox neue Dinge hinzu: ein Merkmal, eine Waffe, ein Gebäude. Harmony ist für die andere Hälfte des Moddings da: **das Verhalten des vorhandenen Spiels verändern**.

Du kannst den Code des Spiels nicht direkt bearbeiten. Er ist kompiliert, wird als `Assembly-CSharp.dll` ausgeliefert und das nächste Update würde deine Änderungen überschreiben. Harmony ist die Bibliothek, mit der du deinen eigenen Code an eine bereits existierende Methode anhängst, während das Spiel läuft.

> [!NOTE] Noch nie Code geschrieben?
> Lies "Was eine Methode ist" und "Der Haftnotiz-Zettel", baue dann zuerst etwas aus den **Spielinhalte**-Seiten und kehre später zurück. Harmony ist nicht schwer, aber es ist das Erste, was die Mods *anderer Leute* kaputtmachen kann, und deine Patches werden sauberer, sobald du gesehen hast, wie die spieleigenen Assets aufgebaut sind :PES_Wise:.

## Was eine Methode ist

Eine **Methode** ist eine benannte Aktion im Spielcode. Einige echte Beispiele:

| Methode | Wann das Spiel sie ausführt |
| --- | --- |
| `Actor.updateStats()` | Jedes Mal, wenn die Werte einer Einheit neu berechnet werden müssen |
| `Actor.getHit(...)` | Jedes Mal, wenn eine Einheit Schaden erleidet |
| `City.makeWarrior(...)` | Jedes Mal, wenn eine Stadt einen Bürger zum Krieger ernennt |

Das Spiel ruft Tausende davon pro Sekunde auf. Jede einzelne ist ein Ort, an den du dich anhängen kannst.

## Der Klebezettel

Stelle dir eine Methode wie eine Seite im Rezeptbuch des Spiels vor. Harmony schreibt die Seite nicht um. Es heftet zwei leere Notizzettel daran:

```text
┌─────────────────────────────┐
│  DEIN PREFIX                │  <- läuft VOR dem Spielcode
├─────────────────────────────┤
│  der originale Spielcode    │  <- unberührt
├─────────────────────────────┤
│  DEIN POSTFIX               │  <- läuft NACH dem Spielcode
└─────────────────────────────┘
```

- Ein **Prefix** sieht die eingehenden Parameter vor dem Spiel. Es kann sie verändern und den gesamten Aufruf abbrechen.
- Ein **Postfix** sieht das Ergebnis, nachdem das Spiel fertig ist. Es kann dieses Ergebnis abändern oder einfach darauf reagieren.

Das sind 95 % von Harmony. Der Rest dieser Seite sind Details.

## Harmony aktivieren

Eine einzige Zeile, einmalig in `OnModLoad`. Sie durchsucht deine eigene Mod nach Patches und wendet jeden gefundenen Patch an:

```csharp Mods/HelloBox/Code/Main.cs
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");

            // "com.yourname.hellobox" ist deine GUID. Harmony beschriftet deine Patches damit,
            // damit das Log bei Konflikten verrät, wer die Schuld trägt.
            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
        }
    }
}
```

`Assembly.GetExecutingAssembly()` bedeutet "nur meine eigenen Dateien". Das ist keine optionale Dekoration: Ohne diesen Parameter scannt `PatchAll()` das aufrufende Assembly, und an einem schlechten Tag ist das die Mod von jemand anderem :PESgn_Yikes:.

## Dein erster Patch, Zeile für Zeile

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPatches
    {
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Actor_UpdateStats
        {
            public static void Postfix(Actor __instance)
            {
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

Hier passieren sechs Dinge:

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**: die Adresse. "Die Methode namens `updateStats` in der Klasse `Actor`." Eine Zeile in eckigen Klammern ist ein *Attribut*: eine Markierung für den Computer, kein ausführbarer Code.
- **`public static class Patch_Actor_UpdateStats`**: ein Container. Der Name gehört dir und ändert nichts, aber dein Zukunfts-Ich wird dir für `Patch_<Klasse>_<Methode>` danken.
- **`public static void Postfix(...)`**: dieser Name gehört dir **nicht**. Harmony sucht nach Methoden, die exakt `Prefix`, `Postfix` oder `Finalizer` heißen. Schreibst du `postfix` klein, passiert gar nichts, ohne jede Fehlermeldung :PESgn_ButWhy:.
- **`Actor __instance`**: **zwei** Unterstriche. Das ist die konkrete Einheit, an der das Spiel gerade arbeitet. Ohne diesen Parameter weißt du zwar, *dass* Werte berechnet wurden, aber nicht *wessen*.
- **`if (!__instance.hasTrait(...)) return;`**: vorzeitiger Ausstieg. Dein Patch läuft für jede Einheit der Welt, für immer. Sorge dafür, dass der Standardfall mit einer Prüfung und einem `return` endet.
- **`stats["speed"] += 20f;`**: die eigentliche Änderung. `updateStats` leert und baut den Werteblock am Anfang neu auf, daher landet die Erhöhung im Postfix auf einem sauberen Blatt statt sich jeden Tick zu multiplizieren.

## Die magischen Parameternamen

Harmony befüllt deine Methodenparameter **nach Namen**. Das sind die wichtigsten, und die Unterstriche gehören zwingend zum Namen:

| Name | Was du erhältst |
| --- | --- |
| `__instance` | Das Objekt, auf dem die Methode aufgerufen wurde. Bei `static`-Methoden weglassen |
| `__result` | Der Rückgabewert der Methode. Deklariere ihn als `ref`, um ihn zu ändern. Nur im Postfix |
| `___someField` | **Drei** Unterstriche: ein privates Feld des Objekts, exakt wie im Spielcode geschrieben |
| `__state` | Ein Wert, den dein Prefix für dein eigenes Postfix zwischenspeichert |
| beliebiger echter Parametername | Das vom Aufrufer übergebene Argument, **exakt** wie im Spielcode geschrieben |

Über die letzte Zeile stolpert fast jeder. Wenn das Spiel `getHit(float pDamage, ...)` deklariert, muss dein Parameter `pDamage` heißen. Nicht `damage`, nicht `pDmg`. Du darfst Parameter weglassen, die du nicht brauchst, aber die deklarierten müssen übereinstimmen - und in diesem Spiel beginnen sie fast alle mit `p`.

## Ein Ergebnis verändern

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    // ref bedeutet "du darfst diesen Wert überschreiben", und der Aufrufer erhält deine Zuweisung.
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;

        __result *= 1.5f;
    }
}
```

Anpassen, nicht blind zuweisen. `__result *= 1.5f` funktioniert auch dann noch friedlich, wenn eine andere Mod dieselbe Methode gepatcht hat. `__result = 12f` wirft deren Arbeit in den Müll und entfacht Diskussionen in deinem Kommentarbereich.


## Einen fest im Spiel kodierten Wert ändern

Die Hälfte aller Anfragen nach dem Motto "Kann jemand eine Mod machen, die..." dreht sich nur um eine einzige Zahl. "Städte wachsen zu groß" ist genau das, direkt aus der `City`-Klasse des Spiels:

```csharp Assembly-CSharp / City
public int getZoneRange(bool pAllowCheat = true)
{
    if (pAllowCheat && DebugConfig.isOn(DebugOption.CityUnlimitedZoneRange))
    {
        return 999;
    }
    return 13;
}
```

Eine Methode, die eine Konstante zurückgibt, ist das Einfachste, was man im Spiel patchen kann. Du fasst nicht die Konstante an, sondern veränderst den Rückgabewert:

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBox
{
    [HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
    public static class Patch_City_ZoneRange
    {
        private const float SCALE = 0.5f;   // Städte nur halb so groß

        public static void Postfix(ref int __result)
        {
            // 999 ist die Debug-Option "unlimited zone range". Den Cheat des Spielers nicht antasten
            if (__result == 999) return;

            __result = Mathf.Max(1, Mathf.RoundToInt(__result * SCALE));
        }
    }
}
```

Binde `SCALE` an einen Schieberegler in der **[Mod-Konfiguration](#/nml/mod-config)** und die Spieler können es selbst einstellen.

Die eigentliche Arbeit besteht darin, die Methode zu finden. Suche in **dnSpy** nach der Zahl, die du im Spiel siehst (13 Zonen, 2 Waffen, 5 Jahre) oder nach dem Substantiv der Regel ("zone", "limit", "max"). Eine Konstante in einer kleinen Methode ist ein Postfix. Eine Konstante tief in einer langen Methode erfordert einen Transpiler, und an dieser Stelle macht diese Seite Halt :PES2_Shrug:.

## Die originale Methode abbrechen

Ein Prefix mit dem Rückgabetyp `bool` entscheidet darüber, ob der spieleigene Code überhaupt ausgeführt wird:

```csharp
[HarmonyPatch(typeof(Actor), "getHit")]
public static class Patch_Actor_GetHit
{
    public static bool Prefix(Actor __instance, float pDamage)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return true;

        // false = getHit des Spiels komplett überspringen. Die Einheit nimmt keinen Schaden.
        return false;
    }
}
```

Beachte die Struktur der Abfrage: Nur der Sonderfall gibt `false` zurück, und **jeder andere Fall gibt `true` zurück**. Vergisst du dieses `return true`, hast du Schaden für die gesamte Spielwelt deaktiviert.

> [!WARNING] `return false` ist die nukleare Option
> Es überspringt nicht nur *deine* Version der Methode. Es überspringt **alles**: den Code des Spiels und die Prefixes und Postfixes aller anderen Mods für diese Methode. Eine Standardmethode erledigt meist fünf Dinge, von denen du nichts weißt, und das Abbrechen schaltet alle fünf stumm ab.
>
> Bevor du `return false` schreibst, prüfe immer, ob ein Postfix reicht. "Den Schaden im Nachhinein heilen" bricht unendlich viel weniger als "es gab nie Schaden" :PES3_Balance:.

## Zwei Arten, den Methodennamen zu schreiben

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // öffentliche Methode
[HarmonyPatch(typeof(Actor), "updateStats")]             // alles andere
```

`nameof` ist überlegen, weil ein Tippfehler zum Kompilierfehler wird, statt zu einem Patch, der still und leise niemals greift. Aber `nameof` funktioniert nur bei Elementen, die dein Code sehen darf, und ein Großteil von WorldBox ist `internal` oder `private`. Für diese bleibt nur der plain String - gleiche die Schreibweise daher im echten Code ab unter **[Den Spielcode lesen](#/toolbox/reading-the-game-code)**.

## Wenn zwei Methoden denselben Namen teilen

Wenn zwei Methoden denselben Namen tragen, ist Klasse + Name mehrdeutig und Harmony weigert sich zu raten. Gib die Parametertypen explizit an:

```csharp
[HarmonyPatch(typeof(World), "GetTile", new System.Type[] { typeof(int), typeof(int) })]
```

## Patches, die ein Vorher und Nachher brauchen

`__state` ist ein Wert, den dein Prefix an dein Postfix für denselben Aufruf weiterreicht. Nutze ihn, um dir zu merken, wie ein Zustand aussah, bevor das Spiel ihn angefasst hat:

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_StatDelta
{
    public static void Prefix(Actor __instance, out float __state)
    {
        __state = __instance.stats["health"];
    }

    public static void Postfix(Actor __instance, float __state)
    {
        if (__instance.stats["health"] < __state) { /* etwas hat Gesundheit abgezogen */ }
    }
}
```

## Wenn es nicht funktioniert

| Was du siehst | Was meist die Ursache ist |
| --- | --- |
| Nichts passiert, nichts im Log | `Postfix` falsch geschrieben oder `PatchAll` nie aufgerufen |
| `HarmonyException` / `MissingMethodException` beim Start | Diese Klasse oder dieser Methodenname existiert nicht. In dnSpy prüfen |
| `Ambiguous match found` | Mehrere Überladungen. Füge das oben gezeigte `Type[]`-Argument hinzu |
| `NullReferenceException` in deinem Patch | `__instance` oder ein Feld ist null. Patches laufen in Zuständen, die du normal nie siehst: beim Laden, beim Sterben, bei zerstörten Objekten |
| Das Spiel läuft mit 3 FPS | Du hast etwas gepatcht, das tausende Male pro Sekunde läuft, und darin schwere Berechnungen angestellt |
| Funktioniert allein, bricht mit anderer Mod | Einer von euch gibt `false` zurück oder beide weisen `__result` hart zu statt es anzupassen |

## Regeln für ein friedliches Miteinander

- **Postfix als Standard.** Greife nur zum Prefix, wenn du ein Argument ändern oder den Ablauf stoppen musst.
- **Anpassen, niemals blind zuweisen.** `+=`, `*=`, `Math.Min(...)`. Jemand anderes patcht diese Stelle vielleicht auch.
- **Immer auf null prüfen.** Dein Patch läuft auch während des Weltladens und während des Todes einer Einheit.
- **Günstige Prüfung zuerst.** Die allererste Zeile eines heißen Patches sollte die Bedingung sein, die dir den schnellen `return` erlaubt.
- **Patche die engste Methode, die den Job erledigt.** `Actor.updateStats` für das Tempo eines Traits zu patchen ist völlig in Ordnung. Den gesamten Welt-Update-Loop dafür zu patchen, sorgt dafür, dass deine Mod deinstalliert wird.
- **Behalte deine Patches in einer Datei.** Wenn ein Konflikt gemeldet wird, willst du eine Datei lesen, nicht zwölf.

## Was wir hier nicht behandeln

**Transpiler** schreiben die kompilierten IL-Instruktionen einer Methode einzeln um. Sie sind mächtig und der einzige Weg, eine Zahl tief im Bauch einer unzugänglichen Methode zu ändern - und sie brechen bei fast jedem Spielupdate. Sobald du das Niveau erreichst, einen Transpiler zu brauchen, wirst du diese Seite nicht mehr benötigen :PES5_BigBrain:.
