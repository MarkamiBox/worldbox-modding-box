---
title: Harmony-Patches
group: NML-Modding
subgroup: Erweitert & Veröffentlichung
icon: :wbhammer:
order: 42
---

# Harmony-Patches :wbhammer:

Alles auf den anderen Seiten **fügt** WorldBox neue Dinge hinzu: ein Merkmal (trait), eine Waffe, ein Gebäude (building). Harmony ist für die andere Hälfte des Moddings da: **das Verhalten des vorhandenen Spiels verändern**.

Du kannst den Code des Spiels nicht direkt bearbeiten. Er ist kompiliert, wird als `Assembly-CSharp.dll` ausgeliefert und das nächste Update würde deine Änderungen überschreiben. Harmony ist die Bibliothek (library), mit der du deinen eigenen Code an eine bereits existierende Methode anhängst, während das Spiel läuft.

> [!NOTE] Noch nie Code geschrieben?
> Lies "Was eine Methode ist" und "Der Haftnotiz-Zettel", baue dann zuerst etwas aus den **Spielinhalte**-Seiten und kehre später zurück. Harmony ist nicht schwer, aber es ist das Erste, was die Mods *anderer Leute* kaputtmachen kann, und deine Patches werden sauberer, sobald du gesehen hast, wie die spieleigenen Assets aufgebaut sind :PES_Wise:.

## Was eine Methode ist

Eine **Methode** ist eine benannte Aktion im Spielcode. Einige echte Beispiele:

| Methode | Wann das Spiel sie ausführt |
| --- | --- |
| `Actor.updateStats()` | Jedes Mal, wenn die Werte (stats) einer Einheit neu berechnet werden müssen |
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
                if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

Sechs Dinge passieren hier:

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**: die Adresse. "Die Methode namens `updateStats` in der Klasse namens `Actor`." Eine Zeile in eckigen Klammern ist ein *Attribut*: ein Etikett, das der Computer liest, kein Code, der ausgeführt wird.
- **`public static class Patch_Actor_UpdateStats`**: ein Behälter. Der Name gehört dir und ändert nichts, aber dein zukünftiges Ich wird dir für `Patch_<Class>_<Method>` danken.
- **`public static void Postfix(...)`**: dieser Name gehört **nicht** dir, außer du versiehst ihn mit einer Beschriftung. Ohne Beschriftung sucht Harmony nach einer Methode, die exakt `Prefix`, `Postfix` oder `Finalizer` heißt. Schreib `postfix` und nichts passiert, ohne Fehlermeldung :PESgn_ButWhy:. Der Fix ist die Beschriftung, unten in "Die Patch-Methoden selbst benennen".
- **`Actor __instance`**: **zwei** Unterstriche. Das ist die konkrete Einheit, an der das Spiel gerade arbeitet. Ohne sie weißt du, *dass* die Werte einer Einheit neu berechnet wurden, aber nicht, *wessen*.
- **`if (!__instance.hasTrait(...)) return;`**: früh raus. Dein Patch läuft für jede Einheit der Welt, für immer. Mach den Normalfall zu einer Prüfung und einem `return`.
- **`stats["speed"] += 20f;`**: die eigentliche Änderung. `updateStats` leert den Werteblock am Anfang und baut ihn neu auf, also landet ein Aufschlag im Postfix auf einem frischen Stand, statt sich jeden Tick aufzuaddieren.

> [!DANGER] `updateStats` läuft nicht im Hauptthread
> Das Spiel registriert es als **parallelen** Job (`createJob(out c_stats_dirty, updateStats, JobType.Parallel, ...)`, und `Config.parallel_jobs_updater` ist standardmäßig `true`), also läuft dein Postfix auf einem Worker-Thread, für viele Einheiten gleichzeitig. Fass darin **nur die eigenen Werte dieser Einheit** an. Unity aufzurufen (`Time.time`, `transform`, `Destroy`, `Resources.Load`), den Zufallshelfer `Randy` des Spiels zu nutzen oder in eine gemeinsame Liste von dir zu schreiben, ist ein Absturz, der nur auf dem Rechner von jemand anderem auftaucht.
>
> Wenn du so etwas brauchst, stell die Einheit in eine Warteschlange und erledige die Arbeit in deinem eigenen `Update()`:
> ```csharp
> public static readonly System.Collections.Concurrent.ConcurrentQueue<Actor> pending = new();
>
> public static void Postfix(Actor __instance)
> {
>     if (!__instance.hasTrait(HelloTraits.GIGACHAD)) return;
>     __instance.stats["speed"] += 20f;   // this unit's own data: fine
>     pending.Enqueue(__instance);        // everything else waits for the main thread
> }
> ```

## Die magischen Parameternamen

Harmony befüllt deine Methodenparameter **nach Namen**. Das sind die wichtigsten, und die Unterstriche gehören zwingend zum Namen:

| Name | Was du erhältst |
| --- | --- |
| `__instance` | Das Objekt, auf dem die Methode aufgerufen wurde. Bei `static`-Methoden weglassen |
| `__result` | Der Rückgabewert der Methode. Deklariere ihn als `ref`, um ihn zu ändern. Nur im Postfix |
| `___someField` | **Drei** Unterstriche: ein privates Feld des Objekts, exakt wie im Spielcode geschrieben |
| `__state` | Ein Wert, den dein Prefix für dein eigenes Postfix zwischenspeichert |
| beliebiger echter Parametername | Das vom Aufrufer übergebene Argument, **exakt** wie im Spielcode geschrieben |

Über die letzte Zeile stolpert fast jeder, immer und immer wieder. Wenn das Spiel `getHit(float pDamage, ...)` deklariert, muss dein Parameter `pDamage` heißen. Nicht `damage`, nicht `pDmg`. Du darfst Parameter weglassen, die du nicht brauchst, aber die deklarierten müssen übereinstimmen - und in diesem Spiel beginnen sie fast alle mit `p`.

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

Die Hälfte aller Anfragen nach dem Motto "Kann jemand eine Mod machen, die..." dreht sich nur um eine einzige Zahl. Nichts ist unmöglich, es hat nur noch niemand gemacht :wbbru:. "Städte wachsen zu groß" ist genau das, direkt aus der `City`-Klasse des Spiels:

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
> Es überspringt nicht nur *deine* Version der Methode. Es überspringt den Code des Spiels **für alle**. Das Postfix jeder anderen Mod für diese Methode läuft trotzdem, und reagiert auf einen Aufruf, der nie stattfand. Eine Standardmethode erledigt meist fünf Dinge, von denen du nichts weißt, und das Abbrechen schaltet alle fünf stumm ab.
>
> Bevor du `return false` schreibst, prüfe immer, ob ein Postfix reicht. "Den Schaden im Nachhinein heilen" bricht unendlich viel weniger als "es gab nie Schaden" :PES3_Balance:.

## Zwei Arten, den Methodennamen zu schreiben

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // öffentliche Methode
[HarmonyPatch(typeof(Actor), "updateStats")]             // alles andere
```

`nameof` ist überlegen, weil ein Tippfehler zum Kompilierfehler wird, statt zu einem Patch, der still und leise niemals greift. Aber `nameof` funktioniert nur bei Elementen, die dein Code sehen darf, und ein Großteil von WorldBox ist `internal` oder `private`. Für diese bleibt nur der plain String - gleiche die Schreibweise daher im echten Code ab unter **[Den Spielcode lesen](#/toolbox/reading-the-game-code)**.

## Die Patch-Methoden selbst benennen

Die magischen Namen `Prefix` und `Postfix` sind eine Konvention, keine Pflicht. Versieh die Methode mit einer Beschriftung und nenne sie, wie du willst:

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_UpdateStats
{
    [HarmonyPostfix]
    public static void AddSwiftSpeed(Actor __instance)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;
        __instance.stats["speed"] += 20f;
    }
}
```

`[HarmonyPrefix]`, `[HarmonyPostfix]` und `[HarmonyFinalizer]` existieren alle. Mit der Beschriftung ist der Methodenname nur noch für dich, und das Problem "falsch geschriebenes `Postfix`, nichts passiert" ist verschwunden. Es erlaubt dir außerdem, ein Prefix und ein Postfix für unterschiedliche Ziele in derselben Klasse zu behalten, ohne dass die Namen sich in die Quere kommen. Etwa die Hälfte der Mods da draußen macht es so, und das ist die Hälfte, die nie einen Abend an ein kleines `p` verliert.

## Wenn zwei Methoden denselben Namen teilen

Dann ist Klasse + Name mehrdeutig. Harmony weigert sich zu raten und deine Mod stirbt beim Start mit einer `AmbiguousMatchException`. `Actor` hat zwei `addTrait`-Methoden:

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool addTrait(ActorTrait pTrait, bool pRemoveOpposites = false)
```

Gib die Parametertypen der gemeinten Methode explizit an, **alle**, auch die mit Standardwert:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.addTrait), new System.Type[] { typeof(string), typeof(bool) })]
```

Andere echte Überladungen, die Leute erwischen: `TileZone.isGoodForNewCity()` und `isGoodForNewCity(Actor pActor)`, sowie `SaveManager.loadWorld()` und `loadWorld(string pPath, bool pLoadWorkshop = false)` (beide `internal`, also nur String-Namen). Im Zweifel durchsuche die Klasse nach dem Methodennamen, bevor du das Attribut schreibst.

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

## Eigenschaften und Konstruktoren

Nicht alles ist eine schlichte Methode. `Actor.is_moving` ist eine Eigenschaft (property): Sie sieht aus wie ein Feld, aber ein `get`-Block läuft jedes Mal, wenn jemand sie liest. Sag Harmony, welche Hälfte du willst:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.is_moving), MethodType.Getter)]
```

Danach ist es ein normaler Patch, und `ref bool __result` ist das, was der Leser zurückbekommt. `MethodType.Setter` ist die andere Hälfte. `MethodType.Constructor` patcht den Konstruktor einer Klasse, wo `__instance` das gerade gebaute Objekt ist; hat die Klasse mehrere Konstruktoren, füge danach das `Type[]` hinzu, genau wie bei einer Überladung.

## Private Felder und Methoden

Dein Patch kann ein privates Feld von `__instance` sehen, indem er es als Parameter anfordert: **drei** Unterstriche, dann der Feldname exakt wie im Spiel geschrieben. Das Spiel beginnt die meisten privaten Felder mit seinem eigenen `_`, aus dem privaten `_hover_timer` der Einheit werden also **vier**:

```csharp
public static void Postfix(Actor __instance, ref float ____hover_timer)
```

`ref`, wenn du hineinschreiben willst. Es ist umständlich zu lesen und völlig korrekt.

Außerhalb eines Patches erreichen `AccessTools` und `Traverse` (beide in `HarmonyLib`) dieselben Dinge:

```csharp
// once in a while: Traverse is short and slow
float timer = Traverse.Create(pActor).Field("_hover_timer").GetValue<float>();

// every frame: build the accessor once, then it is almost as fast as a normal field
static readonly AccessTools.FieldRef<Actor, float> hover_timer = AccessTools.FieldRefAccess<Actor, float>("_hover_timer");
hover_timer(pActor) = 0f;   // it is a ref, so this writes

// a private method: reflection wants every argument, defaults included
AccessTools.Method(typeof(Actor), "die").Invoke(pActor, new object[] { false, AttackType.Other, true, true });
```

Ein String benennt etwas, das der Compiler nicht prüfen kann. Benennt ein Update `_hover_timer` um, erfährst du es zur Laufzeit. Die Alternative ist eine **publizierte** `Assembly-CSharp.dll`, in der `internal` und `private` sichtbar werden und eine Umbenennung wieder ein Kompilierfehler ist.

## Von Hand patchen

`[HarmonyPatch]` plus `PatchAll` ist der einfache Weg. Der andere Weg ist, die Methode selbst zu finden und `Patch` aufzurufen:

```csharp Mods/HelloBox/Code/HelloManualPatches.cs
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloManualPatches
    {
        private static readonly Harmony harmony = new Harmony("com.yourname.hellobox");

        public static void Initialize()
        {
            // two addTrait overloads exist, so the types are not optional
            MethodInfo original = AccessTools.Method(typeof(Actor), nameof(Actor.addTrait), new[] { typeof(string), typeof(bool) });

            // null means an update renamed it: lose one feature, not the whole mod
            if (original == null)
            {
                Main.LogWarning("Actor.addTrait(string, bool) not found, skipping that patch");
                return;
            }

            harmony.Patch(original, postfix: new HarmonyMethod(typeof(HelloManualPatches), nameof(AddTraitPostfix)));
        }

        public static void AddTraitPostfix(Actor __instance, string pTraitID, bool __result)
        {
            // __result is false when the unit already had it or an opposite blocked it
            if (!__result || pTraitID != HelloTraits.SWIFT) return;

            Main.LogInfo("Another unit got swift");
        }
    }
}
```

Dieselbe Harmony-ID wie bei deinem `PatchAll`, dieselben Regeln für Parameternamen. Was du gewinnst, ist das `if` in der Mitte. Greif darauf zurück, wenn:

- **Das Ziel eventuell nicht existiert.** Eine Methode, von der du vermutest, das nächste Update verschiebt sie, oder eine, die in *einer anderen Mod* lebt. `AccessTools.TypeByName("TheirNamespace.TheirClass")` gibt `null` zurück, wenn diese Mod nicht installiert ist, und du überspringst den Patch einfach. Siehe **[Andere Mods](#/nml/other-mods)**.
- **Der Patch von einer Einstellung abhängt.** Patche nur, wenn der Spieler die Funktion in **[Mod-Einstellungen](#/nml/mod-config)** eingeschaltet hat.
- **Du wissen willst, ob es geklappt hat.** Ein fehlendes `PatchAll`-Ziel wirft, und die Patches, die es noch nicht erreicht hatte, werden nie angewendet. Hier ist eine fehlende Methode eine Log-Zeile.

## Wenn mehrere Mods dieselbe Methode patchen

Innerhalb jeder Patch-Art ordnet Harmony Patches nach Priorität, **höchste zuerst**, mit `Normal` als Standard. Explizite `[HarmonyBefore]`- und `[HarmonyAfter]`-Abhängigkeiten können diese Reihenfolge ändern:

```csharp
[HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
public static class Patch_City_ZoneRange
{
    [HarmonyPostfix]
    [HarmonyPriority(Priority.Last)]
    public static void HalveZones(ref int __result) { /* ... */ }
}
```

Gängige Prioritäten sind `First`, `High`, `Normal`, `Low`, `Last`. Es zählt, wenn die Reihenfolge das Ergebnis ändert:

- Ein Postfix, das ein Ergebnis **begrenzt** (`Mathf.Min(__result, 20)`), will `Priority.Last`, damit es normalerweise nach Postfixes mit höherer Priorität begrenzt. Es kann nicht garantieren, gegenüber einem anderen `Last`-Patch oder expliziten Reihenfolge-Abhängigkeiten wirklich zuletzt zu kommen.
- Ein Prefix, das etwas **prüft** und eventuell `return false` macht, will `Priority.First` oder `High`, damit es früh entscheidet. Nutze das nicht als Garantie, dass andere Prefixes übersprungen werden: NML liefert HarmonyX aus, das [alle Prefixes ausführt](https://github.com/BepInEx/HarmonyX/wiki/Prefix-changes), auch wenn eines `false` zurückgibt.

Setze es nur, wenn du einen Grund hast. Verlangt jede Mod `First`, ist wieder niemand zuerst :PES3_Balance:.

## Finalizers: fangen, was das Spiel wirft

Ein Finalizer läuft nach allem anderen, **selbst wenn die Methode eine Exception geworfen hat**. Er bekommt die Exception, und was er zurückgibt, ist das, was geworfen wird:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.setAttackTarget))]
public static class Patch_Actor_SetAttackTarget_Log
{
    public static System.Exception Finalizer(System.Exception __exception)
    {
        if (__exception != null) Main.LogError("setAttackTarget threw: " + __exception);

        // preserve the failure after logging it
        return __exception;
    }
}
```

Das protokolliert den Fehler, ohne ihn zu verstecken. `null` zurückzugeben würde die Exception unterdrücken, einschließlich Fehlern aus anderen Patches. Mach das nur für einen bestimmten Fehler, von dem du dich tatsächlich erholen kannst. Eine Methode, die auf halbem Weg geworfen hat, hat bereits die Hälfte ihrer Arbeit erledigt, und die Exception zu schlucken lässt die Welt in diesem Zustand zurück :PESgn_Yikes:.

## Die Methoden, die Mods am meisten patchen

Über die Mods hinweg, die ich durchgesehen habe, tauchen diese immer wieder auf. Signaturen stammen direkt aus dem Spielcode.

| Ziel | Was man wissen sollte |
| --- | --- |
| `City.update(float pElapsed)` | Public. Läuft jeden Frame für jede Stadt. Billige Prüfung zuerst |
| `MapBox.Update()` | **Private**, also `"Update"` als String. Läuft jeden Frame, einmal. Siehe **[Jeder Frame](#/nml/update-loops)**, bevor du es patchst |
| `Actor.updateStats()` | **Internal**. Läuft in einem parallelen Job, siehe die Warnung oben |
| `Actor.getHit(float pDamage, bool pFlash, AttackType pAttackType, BaseSimObject pAttacker = null, ...)` | **Internal**. Jeder Treffer jeder Einheit |
| `Actor.die(bool pDestroy = false, AttackType pType = AttackType.Other, bool pCountDeath = true, bool pLogFavorite = true)` | **Private**, `"die"` als String |
| `Actor.setAttackTarget(BaseSimObject pAttackTarget)` | Public |
| `ItemCrafting.tryToCraftRandomWeapon(Actor pActor, City pCity)` | Public static, gibt `bool` zurück. Kein `__instance` |
| `DiplomacyManager.startWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pAsset, bool pLog = true)` | **Internal**, gibt den `War` zurück |
| `WarManager.newWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pType)` | Public, gibt den `War` zurück |
| `Kingdom.setKing(Actor pActor, bool pFromLoad = false)` | Public. Läuft auch während ein Spielstand lädt, prüfe `pFromLoad` |
| `City.setLeader(Actor pActor, bool pNew)` | Public |
| `BabyMaker.makeBaby(Actor pParent1, Actor pParent2, ...)` | Public static, gibt das Baby zurück |
| `ActorManager.createNewUnit(string pStatsID, WorldTile pTile, ...)` | Public, gibt den neuen `Actor` zurück. Jeder Spawn läuft darüber |

`private`- und `internal`-Ziele lassen sich mit einem String-Namen problemlos patchen, und deine Parameter binden weiterhin nach Namen. Was du ohne publizierte Assembly nicht kannst, ist `nameof(...)` für sie zu schreiben oder ihre `internal`-Member im Rumpf deines Patches anzufassen.

> [!NOTE] `World` ist der Halter, `MapBox` ist das Ziel
> `typeof(World)` ist gültiges C#, auch wenn `World` statisch ist. Es ist das falsche Harmony-Ziel für `Update` oder `finishMakingWorld`: Diese Methoden gehören zu `MapBox`, dem Typ, den `World.world` zurückgibt. Ein falsches Ziel schlägt fehl, wenn Harmony den Patch anwendet, nicht wenn C# `typeof` kompiliert.

## Wenn es nicht funktioniert

Bevor du Harmony die Schuld gibst, lies das Log. Es ist selten Harmony :PES5_Noted:.

| Was du siehst | Was meist die Ursache ist |
| --- | --- |
| Nichts passiert, nichts im Log | `Postfix` falsch geschrieben, ohne `[HarmonyPostfix]`-Beschriftung, oder `PatchAll` nie aufgerufen |
| `HarmonyException` / `MissingMethodException` beim Start | Diese Klasse oder dieser Methodenname existiert nicht. In dnSpy prüfen |
| `AmbiguousMatchException` / `Ambiguous match found` | Mehrere Überladungen. Füge das oben gezeigte `Type[]`-Argument hinzu |
| Absturz, der nur auf fremden Rechnern passiert | Ein Postfix auf `Actor.updateStats`, das Unity, `Randy` oder eine gemeinsame Liste von einem Worker-Thread aus anfasst |
| `NullReferenceException` in deinem Patch | `__instance` oder ein Feld ist null. Patches laufen in Zuständen, die du normal nie siehst: beim Laden, beim Sterben, bei zerstörten Objekten |
| Das Spiel läuft mit 3 FPS | Du hast etwas gepatcht, das tausende Male pro Sekunde läuft, und darin schwere Berechnungen angestellt |
| Funktioniert allein, bricht mit anderer Mod | Einer von euch gibt `false` zurück oder beide weisen `__result` hart zu statt es anzupassen |

## Regeln für ein friedliches Miteinander

- **Standardmäßig Postfix.** Greif nur dann zu einem Prefix, wenn du ein Argument ändern oder die Methode stoppen musst.
- **Anpassen, nie zuweisen.** `+=`, `*=`, `Math.Min(...)`. Jemand anderes hat das auch gepatcht.
- **Immer auf null prüfen.** Dein Patch läuft während des Weltladens und während eine Einheit stirbt.
- **Billige Prüfung zuerst.** Die erste Zeile eines heißen Patches sollte der Test sein, der dich `return` machen lässt. `City.update` und `MapBox.Update` sind die zwei Methoden, die Mods am häufigsten patchen, und beide laufen jeden Frame. Eine Dictionary-Abfrage dort ist in Ordnung. Eine Schleife über jede Einheit nicht.
- **Patch die engste Methode, die den Job erledigt.** `Actor.updateStats` für die Geschwindigkeit eines Merkmals zu patchen ist okay. Das Welt-Update für dasselbe zu patchen ist der Weg, wie eine Mod deinstalliert wird.
- **Halte deine Patches in einer Datei.** Wenn jemand einen Konflikt meldet, willst du eine Datei lesen, nicht zwölf. Sei nett zu deinem zukünftigen Ich. Mach es, wie ich es sage, nicht wie meine alten Mods es machen :trollface:.

> [!NOTE] `has`, `get`, `add`, `clone` oder `post_init` einer Bibliothek zu patchen ist sinnlos
> Das betrifft nur Aufrufe nach dem Laden deiner Mod, nie die Vanilla-Registrierung, die bis dahin schon passiert ist. Siehe **[Asset-Bibliotheken](#/nml/asset-libraries)**.

## Transpiler: die Instruktionen ändern

Ein Transpiler schreibt IL um, die kompilierten Instruktionen innerhalb einer Methode. Nutze ihn, wenn die Änderung mittendrin gehört und weder ein Prefix noch ein Postfix sie ausdrücken kann. Er läuft, wenn Harmony die Ersatzmethode baut, nicht bei jedem Spiel-Tick, und kann erneut laufen, wenn ein weiterer Transpiler hinzukommt.

Das ist die Signatur, innerhalb deiner Patch-Klasse. Sie lässt absichtlich alles durch:

```csharp
public static System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> Transpiler(
    System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> instructions)
{
    return instructions;
}
```

Für eine echte Umschreibung:

1. Untersuche die IL des Ziels in dnSpy. Finde eine Opcode-Sequenz und den konkreten Feld- oder Methoden-Operanden, nicht "Instruktion 42" oder jedes Vorkommen einer Zahl.
2. Sammle Treffer, **bevor** du bearbeitest. Prüfe die erwartete Anzahl explizit. Erwartest du einen und findest null oder zwei, protokolliere den Widerspruch und gib die unveränderte Eingabe zurück. Gib niemals eine halbe Umschreibung aus.
3. Erhalte Sprungmarken, Exception-Blöcke sowie Typen und Balance des Auswertungsstapels. Eine Ersetzung, die in C# richtig aussieht, kann trotzdem ungültige IL sein.
4. Teste den Treffer- und den Nichttreffer-Pfad, dann teste mit anderen Patches auf derselben Methode.

Die [Harmony-Transpiler-Dokumentation](https://harmony.pardeike.net/articles/patching-transpiler.html) deckt die Instruktions-API ab. Ein Spiel-Update ist ein Grund, das Muster erneut zu prüfen, nicht den magischen Index um drei zu verschieben :PES5_BigBrain:.

NML liefert **HarmonyX** aus, einen Fork von Harmony. Die Kern-Patch-API ist gleich, aber Verhalten kann abweichen, auch beim Überspringen von Prefixes. Nächster Halt, wenn mehr als eine Mod dasselbe anfassen wird: **[Andere Mods](#/nml/other-mods)**.
