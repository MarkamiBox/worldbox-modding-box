---
title: Ogni frame
group: NML Modding
subgroup: Funzionalità avanzate e rilascio
icon: :wbyawn:
order: 43
---

# Ogni frame :wbyawn:

La tua classe principale è un componente Unity. `BasicMod<T>` deriva da `MonoBehaviour`, quindi se ci scrivi sopra un metodo `Update()`, Unity lo chiama una volta per frame. Dal primo secondo dopo l'avvio fino alla chiusura del gioco, sessanta volte al secondo, che ci sia un mondo o no.

Quello è il posto giusto per qualunque cosa non sia una reazione a qualcos'altro: un controllo ogni mese di gioco, una coda proveniente da una patch Harmony, la pressione di un tasto. È anche il modo più facile, nel modding, di trasformare il gioco di qualcuno in una presentazione di diapositive :wbfacepalm:.

## La guardia

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    // game_loaded: avvio superato. worldLoading: nessun mondo a metà pulito o a metà costruito
    if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

    HelloTicker.Tick();
}
```

| Controllo | Da cosa ti tiene fuori |
| --- | --- |
| `World.world != null` | Non esiste ancora nessuna istanza di mappa |
| `Config.game_loaded` | I primi istanti dopo l'avvio, prima che il gioco abbia iniziato il suo primo mondo |
| `Config.worldLoading` | La schermata di caricamento. Un mondo viene ripulito, generato o caricato, e le liste delle unità vengono svuotate e riempite sotto i tuoi piedi |

`Config.worldLoading` è `SmoothLoader.isLoading()`, lo stesso controllo che fa `MapBox.Update()` del gioco stesso prima di simulare qualsiasi cosa. La guardia in **[Log e debug](#/nml/logs-and-debugging)** copre l'avvio; aggiungi il controllo sul caricamento e resterai fuori anche da ogni caricamento di mondo successivo.

## Non ogni frame

La maggior parte delle cose non ha bisogno di sessanta controlli al secondo. Scegli un orologio e corri su quello.

| Orologio | Cosa fa |
| --- | --- |
| `Time.deltaTime` | Secondi reali dall'ultimo frame. Continua a scorrere quando il gioco è in pausa, ignora l'impostazione della velocità. Il gioco non tocca mai `Time.timeScale` |
| `World.world.getCurWorldTime()` | Secondi di mondo, come `double`. Si ferma mentre il gioco è in pausa o una finestra è aperta, corre più veloce a velocità più alte. 5 è un mese, 60 è un anno |

Il tempo di mondo per qualsiasi cosa accada *dentro* al mondo. Qui, ogni unità con il tratto del rancore da **[Ricordare le cose](#/nml/saving-data)** dimentica un colpo al mese:

```csharp Mods/HelloBox/Code/HelloTicker.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloTicker
    {
        private const double INTERVAL = 5.0;   // secondi di mondo: un mese di gioco
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

            // un orologio che va all'indietro reimposta la base senza far scattare un tick
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

Mantieni la chiamata a `PatchAll` da **[Patch Harmony](#/nml/harmony-patches)**: `ResetClock` viene eseguito dopo ogni mondo generato o caricato, anche uno con un timestamp uguale o successivo. Il primo tick in quel mondo aspetta un intervallo intero. Un controllo del solo orologio all'indietro non basta a rilevare ogni caricamento.

Pausa, velocità e finestre aperte sono tutte gestite, perché l'orologio del mondo le rispetta già. Tempo reale per le cose che non sono nel mondo, come un'etichetta che lampeggia:

```csharp
private static float _timer;

_timer += Time.deltaTime;
if (_timer < 2f) return;
_timer = 0f;
```

> [!NOTE] Controllare tu stesso la pausa
> `Config.paused` è il pulsante di pausa e nient'altro. La simulazione si ferma anche mentre una finestra è aperta; `World.world.isPaused()` copre entrambi i casi, ma è `internal`, quindi serve l'assembly pubblicizzato con cui NML compila la tua mod. Usare il tempo di mondo ti risparmia il problema.

## Coroutine

Una coroutine è un metodo che può fermarsi a metà strada. La tua classe principale è un `MonoBehaviour`, quindi può avviarne una:

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
                // controllato dopo ogni attesa: l'unità ha avuto un secondo intero per morire
                if (World.world == null || Config.worldLoading || pActor == null || !pActor.isAlive()) yield break;

                pActor.startShake();
                yield return new WaitForSeconds(1f);
            }
        }
    }
}
```

`WaitForSeconds` aspetta in secondi reali, e siccome il gioco non cambia mai `Time.timeScale`, non si ferma per la pausa e non gli importa della velocità di gioco. La coroutine continua a girare anche se il giocatore carica un altro mondo a metà strada. Da qui il controllo dopo ogni `yield`, non solo prima del primo :PES2_F:.

## Tasti

`Input.GetKeyDown(KeyCode.F7)` dentro `Update()` funziona. Scatta anche mentre il giocatore sta digitando il nome di un'unità in un campo di testo, e il giocatore non può cambiare il tasto. Gli hotkey del gioco stesso saltano i tasti mentre un campo di testo ha il focus, quindi un `HotkeyAsset` ottiene questo gratis. Vedi **[Finestre personalizzate](#/nml/custom-windows)** per registrarne uno. Tieni `GetKeyDown` solo per un tasto di debug che premerai solo tu.

## Lavoro pesante

- **Cicla sulle unità con un timer, mai ogni frame.** Diecimila unità per sessanta frame fa seicentomila controlli al secondo, per un tratto che magari hanno tre unità.
- **Il controllo economico per primo.** Stessa regola di una patch Harmony: la prima riga è quella che ti permette di fare `return`.
- **Code parallele che riempi, `Update()` che svuota.** Un Postfix su un metodo parallelo come `Actor.updateStats` non deve toccare Unity o lo stato condiviso, vedi **[Patch Harmony](#/nml/harmony-patches)**. Mette l'unità in coda, e il thread principale la raccoglie qui:

```csharp
// pending è la ConcurrentQueue che la tua patch riempie
while (pending.TryDequeue(out Actor actor))
{
    if (actor == null || !actor.isAlive()) continue;
    // ora è sicuro toccare Unity, Randy e le tue liste
}
```

Cosa fare una volta dentro il ciclo è **[Il mondo a runtime](#/nml/world-at-runtime)**. Cosa vuoi che resti lì dopo un salvataggio e un caricamento è **[Ricordare le cose](#/nml/saving-data)** :PES_OkHand:.
