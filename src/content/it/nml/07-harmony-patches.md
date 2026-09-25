---
title: Patch Harmony
group: NML Modding
subgroup: Funzionalità avanzate e rilascio
icon: :wbhammer:
order: 42
---

# Patch Harmony :wbhammer:

Tutto quanto visto nelle altre pagine **aggiunge** cose a WorldBox: un tratto (trait), un'arma, un edificio (building). Harmony serve per l'altra metà del modding: **cambiare ciò che il gioco fa già**.

Non puoi modificare direttamente il codice del gioco. È compilato, viene distribuito come `Assembly-CSharp.dll`, e qualsiasi aggiornamento sovrascriverebbe le tue modifiche. Harmony è la libreria (library) che ti permette di agganciare il tuo codice a un metodo già esistente mentre il gioco è in esecuzione.

> [!NOTE] Non hai mai scritto codice prima?
> Leggi "Cos'è un metodo" e "Il post-it", poi vai a creare qualcosa dalle pagine di **Contenuto di gioco** e torna qui dopo. Harmony non è difficile, ma è la prima cosa capace di rompere i mod di *altre persone*, e scriverai patch migliori una volta visto come sono strutturati gli asset del gioco :PES_Wise:.

## Cos'è un metodo

Un **metodo** è un'azione con un nome all'interno del codice del gioco. Alcuni esempi reali:

| Metodo | Quando il gioco lo esegue |
| --- | --- |
| `Actor.updateStats()` | Ogni volta che le statistiche (stats) di un'unità devono essere ricalcolate |
| `Actor.getHit(...)` | Ogni volta che un'unità subisce danni |
| `City.makeWarrior(...)` | Ogni volta che una città trasforma un cittadino in un soldato |

Il gioco ne chiama a migliaia al secondo. Ognuno di essi è un punto in cui puoi agganciarti.

## Il post-it

Immagina un metodo come una pagina del ricettario del gioco. Harmony non riscrive la pagina: ci attacca sopra due foglietti adesivi:

```text
┌─────────────────────────────┐
│  IL TUO PREFIX              │  <- viene eseguito PRIMA del codice del gioco
├─────────────────────────────┤
│  codice originale del gioco │  <- intatto
├─────────────────────────────┤
│  IL TUO POSTFIX             │  <- viene eseguito DOPO il codice del gioco
└─────────────────────────────┘
```

- Un **Prefix** vede i parametri in arrivo prima del gioco. Può alterarli e può annullare l'intera esecuzione.
- Un **Postfix** vede il risultato dopo che il gioco ha finito. Può modificare quel risultato o semplicemente reagire ad esso.

Questo è il 95% di Harmony. Il resto di questa pagina sono dettagli pratici.

## Attivare Harmony

Una singola riga, una sola volta in `OnModLoad`. Scansiona il tuo mod alla ricerca di patch e applica tutte quelle che trova:

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

            // "com.yourname.hellobox" è il tuo GUID. Harmony etichetta le tue patch con esso,
            // così quando c'è un conflitto il log indica chiaramente di chi è la colpa.
            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
        }
    }
}
```

`Assembly.GetExecutingAssembly()` significa "solo i miei file". Non è una decorazione opzionale: senza di esso, `PatchAll()` esamina l'assembly da cui è stato chiamato, e in una brutta giornata sarà il mod di qualcun altro :PESgn_Yikes:.

## La tua prima patch, riga per riga

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

Succedono sei cose:

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**: l'indirizzo. "Il metodo chiamato `updateStats`, nella classe chiamata `Actor`." Una riga tra parentesi quadre è un *attributo*: un'etichetta che il computer legge, non codice che viene eseguito.
- **`public static class Patch_Actor_UpdateStats`**: un contenitore. Il nome è tuo e non cambia nulla, ma il te del futuro ringrazierà il te di oggi per `Patch_<Class>_<Method>`.
- **`public static void Postfix(...)`**: questo nome **non** è tuo, a meno che tu non lo etichetti. Senza etichetta, Harmony cerca un metodo chiamato esattamente `Prefix`, `Postfix` o `Finalizer`. Scrivi `postfix` e non succede niente, senza nessun errore :PESgn_ButWhy:. La soluzione è l'etichetta, in "Dare tu stesso il nome ai metodi di patch" più sotto.
- **`Actor __instance`**: **due** underscore. È l'unità precisa su cui il gioco sta lavorando in quel momento. Senza, sai *che* le statistiche di un'unità sono state ricalcolate, ma non *di quale*.
- **`if (!__instance.hasTrait(...)) return;`**: esci subito. La tua patch gira per ogni unità del mondo, per sempre. Fai in modo che il caso comune sia un controllo e un `return`.
- **`stats["speed"] += 20f;`**: la modifica vera e propria. `updateStats` svuota e ricostruisce il blocco delle statistiche all'inizio, quindi sommare in un Postfix parte da zero invece di accumularsi a ogni tick.

> [!DANGER] `updateStats` non gira sul thread principale
> Il gioco lo registra come job **parallelo** (`createJob(out c_stats_dirty, updateStats, JobType.Parallel, ...)`, e `Config.parallel_jobs_updater` è `true` di default), quindi il tuo Postfix gira su un thread di lavoro (job), su molte unità contemporaneamente. Lì dentro tocca **solo i numeri di quell'unità**. Chiamare Unity (`Time.time`, `transform`, `Destroy`, `Resources.Load`), l'helper casuale del gioco `Randy`, o scrivere in una tua lista condivisa è un crash che salta fuori solo sul PC di qualcun altro.
>
> Se ti serve una di queste cose, metti l'unità in coda e fai il lavoro nel tuo `Update()`:
> ```csharp
> public static readonly System.Collections.Concurrent.ConcurrentQueue<Actor> pending = new();
>
> public static void Postfix(Actor __instance)
> {
>     if (!__instance.hasTrait(HelloTraits.GIGACHAD)) return;
>     __instance.stats["speed"] += 20f;   // dati dell'unità stessa: va bene
>     pending.Enqueue(__instance);        // tutto il resto aspetta il thread principale
> }
> ```

## I nomi magici dei parametri

Harmony associa i tuoi parametri **per nome**. Questi sono quelli che contano, e i trattini bassi fanno parte del nome:

| Nome | Cosa ricevi |
| --- | --- |
| `__instance` | L'oggetto su cui è stato chiamato il metodo. Omettilo per un metodo `static`, che non ne ha |
| `__result` | Il valore di ritorno del metodo. Dichiaralo come `ref` per modificarlo. Solo in Postfix |
| `___someField` | **Tre** trattini bassi: un campo privato dell'oggetto, scritto esattamente come nel gioco |
| `__state` | Un valore che il tuo Prefix passa al tuo Postfix |
| qualsiasi vero nome di parametro | L'argomento passato dal chiamante, scritto **esattamente** come nel gioco |

Quell'ultima riga è dove inciampano quasi tutti, ancora e ancora. Se il gioco dichiara `getHit(float pDamage, ...)`, il tuo parametro deve chiamarsi `pDamage`. Non `damage`, non `pDmg`. Puoi elencare solo i parametri che ti interessano e saltare gli altri, ma quelli che elenchi devono corrispondere, e in questo gioco iniziano quasi tutti con `p`.

## Modificare un risultato

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    // ref significa "puoi scrivere su questo", e ciò che scrivi è ciò che il chiamante riceverà.
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;

        __result *= 1.5f;
    }
}
```

Modifica, non assegnare ciecamente. `__result *= 1.5f` funziona pacificamente se un altro mod ha patchato lo stesso metodo. `__result = 12f` butta via il loro lavoro e apre discussioni nei tuoi commenti.

## Modificare un numero hardcodato nel gioco

La metà delle richieste del tipo "qualcuno può fare una mod che..." riguarda un singolo numero. Niente è impossibile, semplicemente nessuno l'ha ancora fatto :wbbru:. "Le città crescono troppo" è proprio questo, preso direttamente dalla classe `City` del gioco:

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

Un metodo che restituisce una costante è la cosa più facile da modificare nel gioco. Non tocchi la costante, modifichi ciò che restituisce:

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBox
{
    [HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
    public static class Patch_City_ZoneRange
    {
        private const float SCALE = 0.5f;   // città grandi la metà

        public static void Postfix(ref int __result)
        {
            // 999 è l'opzione di debug "unlimited zone range". Non toccare il trucco del giocatore
            if (__result == 999) return;

            __result = Mathf.Max(1, Mathf.RoundToInt(__result * SCALE));
        }
    }
}
```

Metti `SCALE` dietro uno slider di **[Impostazioni del mod](#/nml/mod-config)** e i giocatori lo regoleranno da soli.

Trovare il metodo è il vero lavoro. Cerca in **dnSpy** il numero che vedi nel gioco (13 zone, 2 armi, 5 anni) o il sostantivo della regola ("zone", "limit", "max"). Una costante dentro un metodo piccolo è un Postfix. Una costante nascosta in mezzo a un metodo lungo richiede un transpiler, ed è qui che questa pagina si ferma :PES2_Shrug:.

## Annullare il metodo originale

Un Prefix che restituisce `bool` decide se il codice originale del gioco deve essere eseguito o meno:

```csharp
[HarmonyPatch(typeof(Actor), "getHit")]
public static class Patch_Actor_GetHit
{
    public static bool Prefix(Actor __instance, float pDamage)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return true;

        // false = salta completamente il getHit del gioco. L'unità non subisce danni.
        return false;
    }
}
```

Nota la struttura del controllo: il caso particolare restituisce `false`, e **qualsiasi altro caso restituisce `true`**. Se dimentichi quel `return true`, avrai disattivato i danni per l'intero mondo.

> [!WARNING] `return false` è l'opzione nucleare
> Non salta solo la *tua* versione del metodo. Salta il codice del gioco **per tutti**. Il Postfix di ogni altro mod su quel metodo continua comunque a girare, reagendo a una chiamata che non è mai avvenuta. Un metodo vanilla fa solitamente cinque cose che non hai mai letto, e cancellarlo le disabilita tutte e cinque silenziosamente.
>
> Prima di scrivere `return false`, controlla se un Postfix non sia sufficiente. "Curare il danno subito dopo" crea infinitamente meno problemi rispetto a "il danno non è mai esistito" :PES3_Balance:.

## Due modi per indicare il nome del metodo

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // metodo pubblico
[HarmonyPatch(typeof(Actor), "updateStats")]             // qualsiasi altro caso
```

`nameof` è preferibile perché un errore di battitura diventa un errore di compilazione invece di una patch che silenziosamente non si applica mai. Ma `nameof` funziona solo sui membri visibili al tuo codice, e gran parte di WorldBox è `internal` o `private`. Per quelli la stringa pura è l'unica opzione: controlla l'ortografia nel codice reale tramite **[Leggere il codice del gioco](#/toolbox/reading-the-game-code)**.

## Dare tu stesso il nome ai metodi di patch

I nomi magici `Prefix` e `Postfix` sono una convenzione, non un obbligo. Metti un'etichetta sul metodo e chiamalo come preferisci:

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

`[HarmonyPrefix]`, `[HarmonyPostfix]` e `[HarmonyFinalizer]` esistono tutti. Con l'etichetta, il nome del metodo è solo per te, e il problema del "`Postfix` scritto male, non succede niente" sparisce. Ti permette anche di tenere un Prefix e un Postfix per bersagli diversi nella stessa classe senza che i nomi entrino in conflitto. Circa metà delle mod in giro lo fa così, ed è la metà che non perde mai una serata per colpa di una `p` minuscola.

## Quando due metodi hanno lo stesso nome

Allora classe + nome è ambiguo. Harmony rifiuta di tirare a indovinare e la tua mod muore all'avvio con un `AmbiguousMatchException`. `Actor` ha due metodi `addTrait`:

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool addTrait(ActorTrait pTrait, bool pRemoveOpposites = false)
```

Specifica i tipi dei parametri di quello che intendi, **tutti**, inclusi quelli con un valore predefinito:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.addTrait), new System.Type[] { typeof(string), typeof(bool) })]
```

Altri overload reali in cui si inciampa: `TileZone.isGoodForNewCity()` e `isGoodForNewCity(Actor pActor)`, e `SaveManager.loadWorld()` e `loadWorld(string pPath, bool pLoadWorkshop = false)` (entrambi `internal`, quindi solo nomi come stringa). Nel dubbio, cerca il nome del metodo nella classe prima di scrivere l'attributo.

## Patch che richiedono un prima e un dopo

`__state` è un valore che il tuo Prefix passa al tuo Postfix per quella stessa chiamata. Usalo per ricordare l'aspetto di una variabile prima che il gioco ci mettesse mano:

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
        if (__instance.stats["health"] < __state) { /* qualcosa ha sottratto salute */ }
    }
}
```

## Proprietà e costruttori

Non tutto è un semplice metodo. `Actor.is_moving` è una proprietà: sembra un campo, ma un blocco `get` viene eseguito ogni volta che qualcuno la legge. Di' a Harmony quale metà vuoi:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.is_moving), MethodType.Getter)]
```

Dopodiché è una patch normale, e `ref bool __result` è ciò che riceve chi legge. `MethodType.Setter` è l'altra metà. `MethodType.Constructor` fa patch al costruttore di una classe, dove `__instance` è l'oggetto in costruzione; se la classe ha più costruttori, aggiungi il `Type[]` dopo, esattamente come per un overload.

## Campi e metodi privati

La tua patch può vedere un campo privato di `__instance` chiedendolo come parametro: **tre** underscore, poi il nome del campo esattamente come lo scrive il gioco. Il gioco fa iniziare la maggior parte dei campi privati con un proprio `_`, quindi il `_hover_timer` privato dell'unità diventa **quattro**:

```csharp
public static void Postfix(Actor __instance, ref float ____hover_timer)
```

`ref` se vuoi scriverci sopra. È scomodo da leggere ed è perfettamente corretto.

Fuori da una patch, `AccessTools` e `Traverse` (entrambi in `HarmonyLib`) raggiungono le stesse cose:

```csharp
// ogni tanto: Traverse è breve e lento
float timer = Traverse.Create(pActor).Field("_hover_timer").GetValue<float>();

// ogni frame: costruisci l'accessore una volta, poi è quasi veloce come un campo normale
static readonly AccessTools.FieldRef<Actor, float> hover_timer = AccessTools.FieldRefAccess<Actor, float>("_hover_timer");
hover_timer(pActor) = 0f;   // è un ref, quindi questo scrive

// un metodo privato: la reflection vuole ogni argomento, valori predefiniti inclusi
AccessTools.Method(typeof(Actor), "die").Invoke(pActor, new object[] { false, AttackType.Other, true, true });
```

Una stringa dà un nome a qualcosa che il compilatore non può controllare. Se un aggiornamento rinomina `_hover_timer`, lo scopri a runtime. L'alternativa è un `Assembly-CSharp.dll` **pubblicizzato**, dove `internal` e `private` diventano visibili e una rinominazione torna a essere un errore di compilazione.

## Applicare patch manualmente

`[HarmonyPatch]` più `PatchAll` è la via facile. L'altra via è trovare tu stesso il metodo e chiamare `Patch`:

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
            // esistono due overload di addTrait, quindi i tipi non sono opzionali
            MethodInfo original = AccessTools.Method(typeof(Actor), nameof(Actor.addTrait), new[] { typeof(string), typeof(bool) });

            // null significa che un aggiornamento l'ha rinominato: perdi una funzionalità, non l'intera mod
            if (original == null)
            {
                Main.LogWarning("Actor.addTrait(string, bool) not found, skipping that patch");
                return;
            }

            harmony.Patch(original, postfix: new HarmonyMethod(typeof(HelloManualPatches), nameof(AddTraitPostfix)));
        }

        public static void AddTraitPostfix(Actor __instance, string pTraitID, bool __result)
        {
            // __result è false quando l'unità lo aveva già o un opposto lo ha bloccato
            if (!__result || pTraitID != HelloTraits.SWIFT) return;

            Main.LogInfo("Another unit got swift");
        }
    }
}
```

Stesso id Harmony del tuo `PatchAll`, stesse regole per i nomi dei parametri. Ciò che guadagni è l'`if` in mezzo. Ricorrici quando:

- **Il bersaglio potrebbe non esistere.** Un metodo che sospetti verrà spostato dal prossimo aggiornamento, o uno che vive in *un'altra mod*. `AccessTools.TypeByName("TheirNamespace.TheirClass")` restituisce `null` quando quella mod non è installata, e tu salti semplicemente la patch. Vedi **[Altre mod](#/nml/other-mods)**.
- **La patch dipende da un'impostazione.** Applica la patch solo se il giocatore ha attivato la funzionalità in **[Impostazioni del mod](#/nml/mod-config)**.
- **Vuoi sapere se ha funzionato.** Un bersaglio mancante in `PatchAll` lancia un'eccezione, e le patch non ancora raggiunte non vengono mai applicate. Qui, un metodo mancante è una sola riga di log.

## Quando più mod applicano patch allo stesso metodo

All'interno di ogni tipo di patch, Harmony ordina le patch per priorità, **la più alta prima**, con `Normal` come predefinita. Le dipendenze esplicite `[HarmonyBefore]` e `[HarmonyAfter]` possono cambiare quell'ordine:

```csharp
[HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
public static class Patch_City_ZoneRange
{
    [HarmonyPostfix]
    [HarmonyPriority(Priority.Last)]
    public static void HalveZones(ref int __result) { /* ... */ }
}
```

Le priorità comuni sono `First`, `High`, `Normal`, `Low`, `Last`. Conta quando l'ordine cambia il risultato:

- Un Postfix che **limita** un risultato (`Mathf.Min(__result, 20)`) vuole `Priority.Last`, così normalmente limita dopo i Postfix con priorità più alta. Non può garantire di essere davvero ultimo contro un'altra patch `Last` o dipendenze di ordinamento esplicite.
- Un Prefix che **controlla** qualcosa e può restituire `false` vuole `Priority.First` o `High`, così decide presto. Non usarlo come garanzia che gli altri Prefix vengano saltati: NML distribuisce HarmonyX, che [esegue tutti i Prefix](https://github.com/BepInEx/HarmonyX/wiki/Prefix-changes) anche quando uno restituisce `false`.

Impostala solo quando hai un motivo. Se ogni mod chiede `First`, sei punto e a capo, nessuno è più primo :PES3_Balance:.

## Finalizer: catturare ciò che il gioco lancia

Un Finalizer gira dopo tutto il resto, **anche se il metodo ha lanciato un'eccezione**. Riceve l'eccezione, e ciò che restituisce è ciò che viene effettivamente lanciato:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.setAttackTarget))]
public static class Patch_Actor_SetAttackTarget_Log
{
    public static System.Exception Finalizer(System.Exception __exception)
    {
        if (__exception != null) Main.LogError("setAttackTarget threw: " + __exception);

        // conserva il fallimento dopo averlo registrato
        return __exception;
    }
}
```

Questo registra il fallimento senza nasconderlo. Restituire `null` sopprimerebbe l'eccezione, inclusi i fallimenti di altre patch. Fallo solo per un fallimento specifico da cui puoi davvero recuperare. Un metodo che ha lanciato a metà strada ha già fatto metà del suo lavoro, e ingoiare l'eccezione lascia il mondo in quello stato :PESgn_Yikes:.

## I metodi più patchati dalle mod

Tra le mod che ho esaminato, questi tornano continuamente. Le firme sono prese direttamente dal codice del gioco.

| Bersaglio | Cosa sapere |
| --- | --- |
| `City.update(float pElapsed)` | Pubblico. Gira ogni frame per ogni città. Controllo economico per primo |
| `MapBox.Update()` | **Privato**, quindi `"Update"` come stringa. Gira ogni frame, una volta sola. Vedi **[Ogni frame](#/nml/update-loops)** prima di patcharlo |
| `Actor.updateStats()` | **Internal**. Gira in un job parallelo, vedi l'avviso in cima |
| `Actor.getHit(float pDamage, bool pFlash, AttackType pAttackType, BaseSimObject pAttacker = null, ...)` | **Internal**. Ogni colpo su ogni unità |
| `Actor.die(bool pDestroy = false, AttackType pType = AttackType.Other, bool pCountDeath = true, bool pLogFavorite = true)` | **Privato**, `"die"` come stringa |
| `Actor.setAttackTarget(BaseSimObject pAttackTarget)` | Pubblico |
| `ItemCrafting.tryToCraftRandomWeapon(Actor pActor, City pCity)` | Pubblico static, restituisce `bool`. Nessun `__instance` |
| `DiplomacyManager.startWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pAsset, bool pLog = true)` | **Internal**, restituisce la `War` |
| `WarManager.newWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pType)` | Pubblico, restituisce la `War` |
| `Kingdom.setKing(Actor pActor, bool pFromLoad = false)` | Pubblico. Gira anche durante il caricamento di un salvataggio, controlla `pFromLoad` |
| `City.setLeader(Actor pActor, bool pNew)` | Pubblico |
| `BabyMaker.makeBaby(Actor pParent1, Actor pParent2, ...)` | Pubblico static, restituisce il neonato |
| `ActorManager.createNewUnit(string pStatsID, WorldTile pTile, ...)` | Pubblico, restituisce il nuovo `Actor`. Ogni spawn ci passa attraverso |

I bersagli `private` e `internal` accettano patch tranquillamente con un nome come stringa, e i tuoi parametri si associano comunque per nome. Ciò che non puoi fare senza un assembly pubblicizzato è scrivere `nameof(...)` per loro, o toccare i loro membri `internal` dentro il corpo della tua patch.

> [!NOTE] `World` è il contenitore, `MapBox` è il bersaglio
> `typeof(World)` è C# valido, anche se `World` è statica. Non è il bersaglio Harmony corretto per `Update` o `finishMakingWorld`: quei metodi appartengono a `MapBox`, il tipo restituito da `World.world`. Un bersaglio sbagliato fallisce quando Harmony applica la patch, non quando C# compila `typeof`.

## Quando non funziona

Prima di dare la colpa a Harmony, leggi il log. Raramente è colpa di Harmony :PES5_Noted:.

| Cosa vedi | Di cosa si tratta di solito |
| --- | --- |
| Non succede nulla, nulla nei log | `Postfix` scritto male senza l'etichetta `[HarmonyPostfix]`, o non hai mai chiamato `PatchAll` |
| `HarmonyException` / `MissingMethodException` all'avvio | Quella classe o metodo non esiste. Controllalo in dnSpy |
| `AmbiguousMatchException` / `Ambiguous match found` | Più overload. Aggiungi l'argomento `Type[]` mostrato sopra |
| Crash che succede solo sui PC di altre persone | Un Postfix su `Actor.updateStats` che tocca Unity, `Randy` o una lista condivisa da un thread di lavoro |
| `NullReferenceException` nella tua patch | `__instance` o uno dei suoi campi è null. Le patch vengono eseguite in stati mai visti nel gioco normale: durante il caricamento, in punto di morte, su oggetti distrutti |
| Il gioco gira a 3 FPS | Hai patchato qualcosa che gira migliaia di volte al secondo facendoci calcoli pesanti |
| Funziona da solo, si rompe con un altro mod | Uno restituisce `false`, o entrambi assegnano `__result` invece di aggiustarlo |

## Regole di convivenza per modder

- **Postfix come scelta predefinita.** Usa un Prefix solo quando devi cambiare un argomento o fermare il metodo.
- **Aggiusta, non assegnare mai.** `+=`, `*=`, `Math.Min(...)`. Anche qualcun altro ha patchato questo punto.
- **Controlla sempre i null.** La tua patch verrà eseguita durante il caricamento del mondo e durante la morte di un'unità.
- **Il controllo economico per primo.** La prima riga di una patch molto chiamata deve essere il test che ti permette di fare `return`. `City.update` e `MapBox.Update` sono i due metodi più patchati dalle mod, ed entrambi girano ogni frame. Una ricerca in un dizionario lì va bene. Un ciclo su ogni unità no.
- **Patcha il metodo più ristretto che fa il lavoro.** Patchare `Actor.updateStats` per la velocità di un tratto va bene. Patchare l'aggiornamento del mondo per la stessa cosa è il modo in cui una mod viene disinstallata.
- **Tieni le tue patch in un unico file.** Quando qualcuno segnala un conflitto, vuoi leggere un file, non dodici. Sii gentile con il te del futuro. Fai come dico io, non come fanno le mie vecchie mod :trollface:.

> [!NOTE] Patchare `has`, `get`, `add`, `clone` o `post_init` di una libreria è inutile
> Influisce solo sulle chiamate fatte dopo il caricamento della tua mod, mai sulla registrazione vanilla già avvenuta a quel punto. Vedi **[Librerie di asset](#/nml/asset-libraries)**.

## Transpiler: modificare le istruzioni

Un transpiler riscrive l'IL, le istruzioni compilate dentro un metodo. Usalo quando la modifica appartiene al mezzo e né un Prefix né un Postfix possono esprimerla. Gira quando Harmony costruisce il metodo sostitutivo, non a ogni tick di gioco, e può girare di nuovo quando viene aggiunto un altro transpiler.

Questa è la firma, dentro la tua classe di patch. Fa deliberatamente passare tutto:

```csharp
public static System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> Transpiler(
    System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> instructions)
{
    return instructions;
}
```

Per una riscrittura vera e propria:

1. Ispeziona l'IL del bersaglio in dnSpy. Fai corrispondere una sequenza di opcode e lo specifico operando di campo o metodo, non "l'istruzione 42" o ogni occorrenza di un numero.
2. Raccogli le corrispondenze **prima** di modificare. Controlla esplicitamente il numero atteso. Se te ne aspetti una e ne trovi zero o due, registra la discrepanza e restituisci l'input intatto. Non emettere mai una riscrittura a metà.
3. Conserva le etichette dei branch, i blocchi delle eccezioni e i tipi e il bilanciamento dello stack di valutazione. Una sostituzione che sembra corretta in C# può comunque essere IL non valido.
4. Testa sia il percorso con corrispondenza che quello senza, poi testa con altre patch sullo stesso metodo.

La [documentazione dei transpiler di Harmony](https://harmony.pardeike.net/articles/patching-transpiler.html) copre l'API delle istruzioni. Un aggiornamento del gioco è un motivo per ricontrollare lo schema, non per spostare l'indice magico di tre :PES5_BigBrain:.

NML distribuisce **HarmonyX**, un fork di Harmony. L'API di patch principale è condivisa, ma il comportamento può differire, incluso il salto dei Prefix. Prossima tappa, se più di una mod sta per toccare la stessa cosa: **[Altre mod](#/nml/other-mods)**.
