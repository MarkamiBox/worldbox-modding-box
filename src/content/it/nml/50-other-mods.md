---
title: Altre mod
group: NML Modding
subgroup: Funzionalità avanzate e rilascio
icon: :wbmodders:
order: 45
---

# Altre mod :wbmodders:

La tua mod non vive in un mondo vuoto. Un giocatore potrebbe installare HelloBox insieme ad altre venti mod, metà delle quali sta anche cercando di modificare il combattimento, ritoccare le leggi del mondo o aggiungere nuovi tratti.

A volte vuoi coordinarti con loro: abilitare funzionalità extra se una mod partner è installata, applicare patch (patch) sicure ai loro metodi senza andare in crash se mancano, o assicurarti che i tuoi asset si registrino nell'ordine giusto.

Ci sono due modi per comunicare con altre mod: in fase di compilazione tramite `mod.json`, oppure a runtime tramite codice.

## Dichiarare le dipendenze in mod.json

L'integrazione più pulita è dichiarare la relazione nel tuo `mod.json`:

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

| Chiave | Cosa fa |
| --- | --- |
| `Dependencies` | Requisito rigido. NML garantisce che quelle mod si carichino **prima** della tua. Se una manca o non compila, NML si rifiuta di caricare la tua mod del tutto |
| `OptionalDependencies` | Requisito morbido. Se l'altra mod è installata, NML la carica prima della tua **e** definisce per te un simbolo del compilatore. Se manca, la tua mod si carica comunque normalmente |
| `IncompatibleWith` | Lista di blocco. Se una mod di questo elenco è presente, NML segnala un conflitto e impedisce a entrambe di funzionare insieme |

### Il simbolo #if in fase di compilazione

Quando una mod elencata in `OptionalDependencies` è installata e viene compilata, NML definisce per te una costante del preprocessore.

Il simbolo è il GUID dell'altra mod convertito in maiuscolo, con tutti i caratteri non alfanumerici sostituiti da underscore:

| GUID in `mod.json` | Simbolo del compilatore definito |
| --- | --- |
| `com.friend.coolmod` | `COM_FRIEND_COOLMOD` |
| `com.author.magic-items` | `COM_AUTHOR_MAGIC_ITEMS` |

Racchiudi il tuo codice di integrazione in un `#if`:

```csharp Mods/HelloBox/Code/HelloIntegration.cs
namespace HelloBox
{
    public static class HelloIntegration
    {
        public static void Initialize()
        {
#if COM_FRIEND_COOLMOD
            // Compilato solo quando quella mod è presente e attiva
            ApplyCoolModSynergy();
#endif
        }

#if COM_FRIEND_COOLMOD
        private static void ApplyCoolModSynergy()
        {
            // Qui è sicuro fare riferimento direttamente ai loro tipi
            Main.Log("CoolMod found! Enabling partner synergies.");
        }
#endif
    }
}
```

> [!WARNING] I simboli scritti male falliscono in silenzio
> Se scrivi `#if COM_FRIEND_COOL_MOD` invece di `#if COM_FRIEND_COOLMOD`, il compilatore vede un simbolo non definito e rimuove silenziosamente il tuo blocco di codice. Non verrà mai eseguito, senza nessun errore o avviso nel log :PES4_1IQ:. Controlla sempre due volte l'esatta conversione del GUID.

## Controllare a runtime

Il trucco dell'`#if` funziona solo quando NML compila la tua mod dai sorgenti, e solo quando l'altra mod è dichiarata in `OptionalDependencies`.

Se distribuisci una `.dll` precompilata, o vuoi controllare la presenza di mod dinamicamente senza ricompilare, controlla a runtime.

### Controllare gli assembly caricati

Puoi verificare se l'assembly dell'altra mod è caricato nell'`AppDomain` corrente:

```csharp
using System;
using System.Linq;

public static bool IsModLoaded(string pAssemblyName)
{
    return AppDomain.CurrentDomain.GetAssemblies()
        .Any(a => string.Equals(a.GetName().Name, pAssemblyName, StringComparison.OrdinalIgnoreCase));
}
```

Oppure chiedi ad `AccessTools` di Harmony se esiste una delle loro classi:

```csharp
using HarmonyLib;

bool hasPartner = AccessTools.TypeByName("PartnerNamespace.PartnerMain") != null;
```

Se `AccessTools.TypeByName` restituisce un `Type` non nullo, il loro codice è caricato e pronto.

## Applicare patch Harmony a un'altra mod

Applicare una patch a un metodo vanilla è semplice. Applicarla a un metodo che vive in un'altra mod ha una trappola enorme :wbfacepalm:.

Se scrivi una normale classe di patch che fa riferimento al loro tipo:

```csharp
// NON farlo MAI per una mod opzionale!
[HarmonyPatch(typeof(PartnerMod.SomeClass), "SomeMethod")]
public static class BadCrossModPatch
{
    public static void Postfix() { }
}
```

Il runtime Mono cerca di risolvere `PartnerMod.SomeClass` non appena carica la tua classe di patch. Se il giocatore non ha quella mod installata, l'intera tua mod va in crash con una `TypeLoadException` o `FileNotFoundException` prima ancora che il tuo `Initialize()` finisca!

Invece, applica la patch **manualmente** con `AccessTools`:

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
                // L'altra mod non è installata. Salta senza drammi.
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
            // Viene eseguito dopo il loro metodo, solo se la loro mod è installata
        }
    }
}
```

Applicare la patch manualmente mantiene il riferimento al tipo come stringa, così il runtime non prova mai a caricare un assembly mancante.

## La trappola dell'ordine di caricamento

Quando cloni o fai riferimento al contenuto di un'altra mod, il tempismo è tutto.

```csharp
// Se la loro mod non ha ancora eseguito Initialize(), questo lancia NullReferenceException!
AssetManager.traits.clone("hello_super_trait", "partner_custom_trait");
```

NML carica le mod in ordine di dipendenza. Se metti l'altra mod in `Dependencies` o `OptionalDependencies`, NML garantisce che il suo `Initialize()` venga eseguito **prima** del tuo.

Se non le hai dichiarate come dipendenza, l'ordine di caricamento tra mod non è specificato. Sempre:
1. Dichiara l'altra mod in `OptionalDependencies`.
2. Proteggiti con `AssetManager.traits.has(...)` prima di clonare o leggere i loro asset.

## Condividere dati senza conflitti

WorldBox ti dà dizionari flessibili per salvare dati personalizzati sugli attori (`actor.data`) e sui mondi (`World.world.map_stats.custom_data`).

Ogni mod condivide quegli stessi dizionari. Se scrivi:

```csharp
// Male: qualcun altro potrebbe usare "level" anche lui
actor.data.set("level", 5);
```

Un'altra mod potrebbe scrivere su `"level"` nello stesso frame con presupposti completamente diversi.

Metti sempre un prefisso con il tuo namespace alle chiavi dei tuoi dati personalizzati:

```csharp
actor.data.set("hello_level", 5);
int myLevel = actor.data.get("hello_level", 0);
```

Prossima pagina: **[Pubblicare la tua mod](#/nml/publishing)** oppure gestisci velocità di simulazione e opzioni in **[Opzioni di gioco e scale temporali](#/nml/game-options)**.
