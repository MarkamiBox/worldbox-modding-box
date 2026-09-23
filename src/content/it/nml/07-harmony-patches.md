---
title: Patch Harmony
group: NML Modding
subgroup: Funzionalità avanzate e rilascio
icon: :wbhammer:
order: 42
---

# Patch Harmony :wbhammer:

Tutto quanto visto nelle altre pagine **aggiunge** cose a WorldBox: un tratto, un'arma, un edificio. Harmony serve per l'altra metà del modding: **cambiare ciò che il gioco fa già**.

Non puoi modificare direttamente il codice del gioco. È compilato, viene distribuito come `Assembly-CSharp.dll`, e qualsiasi aggiornamento sovrascriverebbe le tue modifiche. Harmony è la libreria che ti permette di agganciare il tuo codice a un metodo già esistente mentre il gioco è in esecuzione.

> [!NOTE] Non hai mai scritto codice prima?
> Leggi "Cos'è un metodo" e "Il post-it", poi vai a creare qualcosa dalle pagine di **Contenuto di gioco** e torna qui dopo. Harmony non è difficile, ma è la prima cosa capace di rompere i mod di *altre persone*, e scriverai patch migliori una volta visto come sono strutturati gli asset del gioco :PES_Wise:.

## Cos'è un metodo

Un **metodo** è un'azione con un nome all'interno del codice del gioco. Alcuni esempi reali:

| Metodo | Quando il gioco lo esegue |
| --- | --- |
| `Actor.updateStats()` | Ogni volta che le statistiche di un'unità devono essere ricalcolate |
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
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

Qui accadono sei cose:

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**: l'indirizzo. "Il metodo chiamato `updateStats`, nella classe chiamata `Actor`." Una riga tra parentesi quadre è un *attributo*: un'etichetta per il compilatore, non codice che viene eseguito.
- **`public static class Patch_Actor_UpdateStats`**: un contenitore. Il nome è tuo e non cambia nulla, ma il tuo io futuro ti ringrazierà per `Patch_<Classe>_<Metodo>`.
- **`public static void Postfix(...)`**: questo nome **non** è tuo. Harmony cerca specificamente metodi chiamati esattamente `Prefix`, `Postfix` o `Finalizer`. Scrivi `postfix` minuscolo e non succederà nulla, senza alcun errore :PESgn_ButWhy:.
- **`Actor __instance`**: **due** trattini bassi. È l'unità specifica su cui il gioco sta lavorando in questo momento. Senza di essa sai *che* le statistiche di un'unità sono state ricalcolate, ma non *di chi*.
- **`if (!__instance.hasTrait(...)) return;`**: esci presto. La tua patch viene eseguita per ogni unità al mondo, per sempre. Fai in modo che il caso comune sia un controllo e un `return`.
- **`stats["speed"] += 20f;`**: la modifica vera e propria. `updateStats` azzera e ricostruisce il blocco delle statistiche in cima, quindi sommare nel Postfix lavora su una lavagna pulita invece di moltiplicarsi a ogni tick.

## I nomi magici dei parametri

Harmony associa i tuoi parametri **per nome**. Questi sono quelli che contano, e i trattini bassi fanno parte del nome:

| Nome | Cosa ricevi |
| --- | --- |
| `__instance` | L'oggetto su cui è stato chiamato il metodo. Omettilo per i metodi `static` |
| `__result` | Il valore di ritorno del metodo. Dichiaralo come `ref` per modificarlo. Solo in Postfix |
| `___someField` | **Tre** trattini bassi: un campo privato dell'oggetto, scritto esattamente come nel gioco |
| `__state` | Un valore che il tuo Prefix passa al tuo Postfix |
| qualsiasi vero nome di parametro | L'argomento passato dal chiamante, scritto **esattamente** come nel gioco |

Quell'ultima riga è dove inciampano quasi tutti. Se il gioco dichiara `getHit(float pDamage, ...)`, il tuo parametro deve chiamarsi `pDamage`. Non `damage`, non `pDmg`. Puoi omettere i parametri che non ti interessano, ma quelli che includi devono corrispondere al millimetro, e in questo gioco iniziano quasi tutti con `p`.

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
> Non salta solo la *tua* versione del metodo. Salta quella di **tutti**: il codice del gioco e il Prefix e Postfix di ogni altro mod su quel metodo. Un metodo vanilla fa solitamente cinque cose che non hai mai letto, e cancellarlo le disabilita tutte e cinque silenziosamente.
>
> Prima di scrivere `return false`, controlla se un Postfix non sia sufficiente. "Curare il danno subito dopo" crea infinitamente meno problemi rispetto a "il danno non è mai esistito" :PES3_Balance:.

## Due modi per indicare il nome del metodo

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // metodo pubblico
[HarmonyPatch(typeof(Actor), "updateStats")]             // qualsiasi altro caso
```

`nameof` è preferibile perché un errore di battitura diventa un errore di compilazione invece di una patch che silenziosamente non si applica mai. Ma `nameof` funziona solo sui membri visibili al tuo codice, e gran parte di WorldBox è `internal` o `private`. Per quelli la stringa pura è l'unica opzione: controlla l'ortografia nel codice reale tramite **[Leggere il codice del gioco](#/toolbox/reading-the-game-code)**.

## Quando due metodi hanno lo stesso nome

Quando due metodi hanno lo stesso nome, classe + nome è ambiguo e Harmony rifiuta di tirare a indovinare. Specifica i tipi dei parametri:

```csharp
[HarmonyPatch(typeof(World), "GetTile", new System.Type[] { typeof(int), typeof(int) })]
```

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

## Quando non funziona

| Cosa vedi | Di cosa si tratta di solito |
| --- | --- |
| Non succede nulla, nulla nei log | `Postfix` scritto male, o non hai mai chiamato `PatchAll` |
| `HarmonyException` / `MissingMethodException` all'avvio | Quella classe o metodo non esiste. Controllalo in dnSpy |
| `Ambiguous match found` | Più overload. Aggiungi l'argomento `Type[]` mostrato sopra |
| `NullReferenceException` nella tua patch | `__instance` o uno dei suoi campi è null. Le patch vengono eseguite in stati mai visti nel gioco normale: durante il caricamento, in punto di morte, su oggetti distrutti |
| Il gioco gira a 3 FPS | Hai patchato qualcosa che gira migliaia di volte al secondo facendoci calcoli pesanti |
| Funziona da solo, si rompe con un altro mod | Uno restituisce `false`, o entrambi assegnano `__result` invece di aggiustarlo |

## Regole di convivenza per modder

- **Postfix come scelta predefinita.** Usa un Prefix solo quando devi modificare un argomento o fermare l'esecuzione del metodo.
- **Aggiusta, non assegnare mai ciecamente.** `+=`, `*=`, `Math.Min(...)`. Anche qualcun altro ha patchato questo punto.
- **Controlla sempre i null.** La tua patch verrà eseguita durante il caricamento del mondo e durante la morte di un'unità.
- **Il controllo economico per primo.** La prima riga di una patch frequente deve essere il controllo che ti permette di fare subito `return`.
- **Patcha il metodo più specifico possibile.** Patchare `Actor.updateStats` per la velocità di un tratto va benissimo. Patchare il loop generale del mondo per fare la stessa cosa è il modo perfetto per farsi disinstallare il mod.
- **Tieni le tue patch in un unico file.** Quando qualcuno segnala un conflitto, vorrai esaminare un file, non dodici.

## Cosa non tratteremo qui

I **Transpiler** riscrivono le istruzioni IL compilate di un metodo una alla volta. Sono straordinariamente potenti e rappresentano l'unico modo per modificare un numero sepolto nel mezzo di un metodo inaccessibile, e si rompono a quasi ogni aggiornamento del gioco. Se mai arriverai al punto di averne bisogno, non avrai più bisogno di questa guida :PES5_BigBrain:.
