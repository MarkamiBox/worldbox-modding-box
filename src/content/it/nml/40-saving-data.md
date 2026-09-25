---
title: Ricordare le cose
group: NML Modding
subgroup: Funzionalità avanzate e rilascio
icon: :wbfloppysavewink:
order: 44
---

# Ricordare le cose :wbfloppysavewink:

Prima o poi il tuo mod avrà bisogno di ricordare qualcosa su una specifica unità: quante volte è stata colpita, se ha già ricevuto la sua ricompensa o presso quale santuario prega. Un dizionario statico indicizzato sull'unità dimentica ogni singola cosa nell'istante in cui il giocatore salva e ricarica :wbfacepalm:.

Il gioco offre già una sede perfetta per questo. Ogni unità, città, regno (kingdom), edificio (building), oggetto e libro (book) conserva il proprio stato in un oggetto dati, e ciascuno di essi possiede un piccolo archivio di **dati personalizzati** (custom data) che viene salvato direttamente nel file di salvataggio.

## Il contenitore

| Chiamata | Cosa fa |
| --- | --- |
| `data.set(key, value)` | Salva un `int`, `long`, `float`, `string` o `bool` sotto una chiave |
| `data.get(key, out value, default)` | Legge il valore. Se la chiave manca, restituisce il default |
| `data.change(key, amount, min, max)` | Aggiunge a un `int` e ne limita il range (clamp), in una sola chiamata |
| `data.addFlag(key)` | Imposta un flag. Restituisce `false` se era già attivo |
| `data.hasFlag(key)` / `data.removeFlag(key)` | Controlla o cancella il flag |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | Elimina un valore |

Ogni tipo di dato ha la propria tabella dedicata, quindi un `int` e una `string` sotto la medesima chiave non collidono. Per chiarezza personale è comunque saggio non condividere le stesse chiavi. Il te del futuro non si ricorderà quale era quale.




## Salvare oggetti complessi con NML

Se cinque tipi primitivi ti sembrano roba del 1995 e hai davvero bisogno di salvare un'intera classe o lista su un attore, NML offre `DataExtension` in `NeoModLoader.General.Game.extensions`: due metodi di estensione, `Set` e `TryGet`, su uno qualsiasi degli oggetti dati qui sopra.

Avvolgi la tua classe di dati in `BasicCustomData<T>`:

```csharp
using System.Collections.Generic;
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}

```

Dentro un metodo con un `Actor actor`, crea il valore prima di salvarlo:

```csharp
if (actor == null || !actor.isAlive()) return;
QuestProgress quest = new QuestProgress { quest_id = "hello_first_steps", step = 1 };

// Salvataggio sull'actor:
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// Lettura dal salvataggio:
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress loadedQuest = saved.Data;
}
```

Dietro le quinte, `Set` trasforma il tuo oggetto in JSON e lo salva con il semplice `data.set(key, string)` della tabella qui sopra. Quindi è una stringa per chiave per unità, e la regola "mantienili leggeri" più sotto vale doppio. La tua classe ha bisogno di un costruttore senza parametri, e sono i suoi campi e proprietà pubblici a essere salvati.

Se pensi che il formato dei dati cambierà tra un aggiornamento e l'altro della mod, implementa `ICustomData` sulla tua classe invece. Sono due metodi: `Serialize()` restituisce un `SerializedCustomData(modId, dataVersion, jObject)`, e `Deserialize(SerializedCustomData)` lo recupera. Controllare `ModId` e `DataVersion` lì dentro è compito tuo, nessuno lo fa al posto tuo. `BasicCustomData<T>` scrive valori segnaposto in entrambi e lancia un'eccezione se legge qualcos'altro, quindi non mescolare i due su una stessa chiave :PES5_Hmmmm:.

> [!NOTE] Verificato contro NML 1.2.0
> Questi nomi e firme provengono dall'assembly NML stesso, non dalla sua documentazione, che non li menziona. Se una versione più recente di NML rinomina qualcosa, sarà il compilatore ad avvisarti prima dei tuoi giocatori.

## In HelloBox

Un tratto (trait) che conta ogni colpo andato a segno del portatore e assegna una ricompensa speciale una sola volta, al cinquantesimo colpo:

```csharp Mods/HelloBox/Code/HelloMemory.cs
namespace HelloBox
{
    public static class HelloMemory
    {
        public const string GRUDGE = "hello_grudge";      // the trait that remembers
        public const string HITS = "hello_hits";          // int: hits this unit has landed
        public const string VETERAN = "hello_veteran";    // flag: it already got its reward

        public static void Initialize()
        {
            if (AssetManager.traits.has(GRUDGE)) return;

            ActorTrait grudge = new ActorTrait
            {
                id = GRUDGE,
                path_icon = "ui/Icons/iconHelloGrudge",
                group_id = HelloGroups.TRAITS,
                needs_to_be_explored = false
            };

            grudge.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                Actor actor = pSelf as Actor;
                if (actor == null || !actor.isAlive()) return false;

                // lives in the unit's own save data, so it survives save and load
                actor.data.change(HITS, 1, 0, 100000);
                actor.data.get(HITS, out int hits);

                // addFlag() is false when the flag was already there: the reward happens once
                if (hits >= 50 && actor.data.addFlag(VETERAN))
                {
                    actor.addTrait("veteran");
                }
                return true;
            };

            AssetManager.traits.add(grudge);
            grudge.base_stats["damage"] = 2f;
        }

        /** Anyone can read it back, a window, a patch, another trait. */
        public static int GetHits(Actor pActor)
        {
            if (pActor == null) return 0;
            pActor.data.get(HITS, out int hits);
            return hits;
        }
    }
}
```

Salva il mondo e ricaricalo: il conteggio è ancora lì, poiché fa parte integrante dei dati di salvataggio dell'unità. Il flag assicura che la ricompensa scatti una volta sola e non a ogni singolo colpo successivo. Generoso, ma sempre un bug.

I suoi testi, come per qualsiasi tratto:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_grudge": "Grudge",
  "trait_hello_grudge_info": "Remembers every blow it lands. Fifty, and it has seen enough to be a veteran."
}
```

> [!WARNING] `Actor.data` è `internal`
> Il campo dati di un'unità è contrassegnato come `internal` nell'assembly del gioco. NML compila il tuo mod usando una copia **publicized**, quindi funziona normalmente nei normali mod con codice sorgente. Si rompe solo se crei una tua `.dll` compilando contro l'assembly originale non modificato: vedi **[Risoluzione problemi](#/troubleshooting)**. Il campo `data` di città e regni è comunque pubblico.

## Dove risiedono i dati

| Oggetto | I suoi dati |
| --- | --- |
| Un'unità | `actor.data` |
| Una città | `city.data` |
| Un regno | `kingdom.data` |
| Un edificio | `building.data` |
| Culture (culture), religioni (religion), clan, lingue, famiglie, eserciti, complotti (plot) | i rispettivi `data`, condividono tutti la stessa struttura |

## Cose da sapere

- **Aggiungi sempre un prefisso alle tue chiavi.** Tutti i mod scrivono nello stesso archivio. `hello_hits` non entrerà mai in collisione con nessuno; `hits` prima o poi lo farà.
- **Rimuovere il mod è del tutto sicuro.** Le chiavi rimangono nel salvataggio, nessuno le legge e nulla va in crash. Questo è l'enorme vantaggio rispetto al patchare il formato di salvataggio interno del gioco.
- **Gli archivi vuoti non pesano nulla.** Il gioco scarta le tabelle vuote prima di salvare su disco, quindi una chiave rimossa scompare davvero.
- **Mantieni i dati leggeri.** Vengono salvati con ogni unità. Un contatore o un flag per unità è impercettibile; una stringa lunga per unità su un mondo con diecimila creature appesantirà inutilmente il salvataggio di tutti.

## L'intero mondo

Alcuni stati non appartengono a nessuna unità: quanti meteoriti ha fatto cadere il tuo potere su questo mondo, se la benedizione una tantum è già avvenuta. Il mondo ha lo stesso archivio, nelle sue statistiche di mappa:

```csharp
// map_stats è internal: va bene in una mod NML a sorgenti, stesso discorso di actor.data sopra
SaveCustomData world = World.world?.map_stats?.custom_data;
if (world == null) return;

world.change("hello_meteors", 1, 0, 1000000);   // change() limita a 1000 a meno che tu non dica diversamente
if (world.addFlag("hello_blessed")) { /* solo la prima volta su questo mondo */ }
```

`SaveCustomData` è lo stesso archivio `BaseSystemData`, quindi ogni chiamata nella tabella in cima funziona, e così anche `Set` / `TryGet` di NML. Viene salvato insieme al resto delle statistiche di mappa, quindi ogni slot di salvataggio ha il proprio. Un mondo appena generato parte vuoto. Il gioco crea l'archivio ogni volta che costruisce o carica le statistiche di mappa, quindi il controllo di nullità non dovrebbe mai scattare; non costa nulla, tienilo.

> [!TIP] Impostazioni o dati di mondo?
> Chiediti se il giocatore si aspetterebbe che il valore cambi quando carica un salvataggio diverso. "Quanto è forte il potere del meteorite" no: quello è **[Impostazioni del mod](#/nml/mod-config)**, condiviso da ogni mondo. "Questo mondo è stato benedetto" sì: quello è `custom_data`.

## Tempo che sopravvive a un salvataggio

`Time.time` sono i secondi trascorsi dall'avvio del gioco. Salvalo nei dati di un'unità, salva, riavvia, carica, e ogni timestamp che hai scritto appartiene a una vita precedente :wbfacepalm:.

Il mondo tiene il proprio orologio, e viene salvato con la mappa:

```csharp
if (World.world == null || World.world.map_stats == null || Config.worldLoading) return;
if (actor == null || !actor.isAlive()) return;

// double, in secondi di mondo: 5 è un mese, 60 è un anno
double now = World.world.getCurWorldTime();

// l'archivio non ha un double, un float basta e avanza per un timestamp
actor.data.set("hello_blessed_at", (float)now);

actor.data.get("hello_blessed_at", out float at, -1f);
bool blessedThisYear = at >= 0f && now - at < 60.0;
```

Si ferma anche quando il gioco è in pausa e scorre più veloce a velocità più alte, il che è quasi sempre ciò che intendevi. `Date.getYearsSince(at)` e `Date.getMonthsSince(at)` fanno la divisione al posto tuo.

## Eseguire codice dopo che un mondo si carica

Tutto quanto sopra viene letto su richiesta, quindi di solito non devi sapere quando un mondo si è caricato. Quando ti serve, per esempio per ricostruire una tua cache, questi sono i metodi che le mod agganciano con **[Harmony](#/nml/harmony-patches)**:

| Metodo | Quando gira |
| --- | --- |
| `MapBox.clearWorld` (pubblico) | Prima che qualsiasi mondo venga generato o caricato. Svuota qui le tue cache statiche |
| `SaveManager.loadActors` (privato) | Durante il caricamento di un salvataggio, subito dopo la ricostruzione delle unità |
| `MapBox.finishMakingWorld` (pubblico) | Verso la fine sia della generazione che del caricamento di un mondo |
| `SaveManager.saveWorldToDirectory` (pubblico, static) | Al salvataggio, manuale o automatico. Un Prefix è la tua ultima occasione per scrivere nell'archivio |
| `MapBox.addLastStep` (privato) | Una volta sola, all'avvio del gioco. Non per ogni mondo |
| `MapBox.OnApplicationQuit` (privato) | Il gioco si sta chiudendo |

```csharp Mods/HelloBox/Code/HelloWorldCache.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloWorldCache
    {
        // una copia in cache per il codice che la legge ogni frame; il salvataggio tiene quella vera
        public static int MeteorsThisWorld;

        // gira sia per un mondo nuovo di zecca sia per un salvataggio caricato
        public static void Postfix()
        {
            MeteorsThisWorld = 0;
            SaveCustomData world = World.world?.map_stats?.custom_data;
            if (world == null) return;

            world.get("hello_meteors", out int meteors);
            MeteorsThisWorld = meteors;
        }
    }
}
```

I metodi privati prendono il nome come stringa, `[HarmonyPatch(typeof(SaveManager), "loadActors")]`, come spiega la pagina di Harmony. La schermata di caricamento è ancora attiva quando gira `finishMakingWorld`; un paio di passaggi la seguono.

## I tuoi file personali

Molte mod saltano tutto questo e scrivono un file JSON con `File.WriteAllText`, di solito sotto `Application.persistentDataPath`, che è la cartella `LocalLow\mkarpenko\WorldBox` accanto a `Player.log`. Va bene per cose che appartengono al **giocatore**: un elenco di unità preferite che ha esportato, statistiche di ogni partita che ha mai giocato.

È sbagliato per cose che appartengono a un **mondo**. Il file non sa quale slot di salvataggio sia caricato. Il giocatore benedice un regno nello slot 1, carica lo slot 2, e anche lo slot 2 risulta benedetto. Poi cancella lo slot 1 e il tuo file conserva quello stato per sempre :PES2_F:. Se deve cambiare quando cambia il salvataggio, va nel salvataggio, in uno degli archivi qui sopra.

## Dove andare adesso

Per i valori che il giocatore sceglie una volta e che ogni mondo condivide, vedi **[Impostazioni del mod](#/nml/mod-config)**. Per il codice che controlla qualcosa ogni frame, o ogni mese di gioco, vedi **[Ogni frame](#/nml/update-loops)** :PES_OkHand:.
