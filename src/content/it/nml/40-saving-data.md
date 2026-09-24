---
title: Ricordare le cose
group: NML Modding
subgroup: Funzionalità avanzate e rilascio
icon: :wbfloppysavewink:
order: 44
---

# Ricordare le cose :wbfloppysavewink:

Prima o poi il tuo mod avrà bisogno di ricordare qualcosa su una specifica unità: quante volte è stata colpita, se ha già ricevuto la sua ricompensa o presso quale santuario prega. Un dizionario statico indicizzato sull'unità dimentica ogni singola cosa nell'istante in cui il giocatore salva e ricarica :wbfacepalm:.

Il gioco offre già una sede perfetta per questo. Ogni unità, città, regno, edificio, oggetto e libro conserva il proprio stato in un oggetto dati, e ciascuno di essi possiede un piccolo archivio di **dati personalizzati** (custom data) che viene salvato direttamente nel file di salvataggio.

## Il contenitore

| Chiamata | Cosa fa |
| --- | --- |
| `data.set(key, value)` | Salva un `int`, `long`, `float`, `string` o `bool` sotto una chiave |
| `data.get(key, out value, default)` | Legge il valore. Se la chiave manca, restituisce il default |
| `data.change(key, amount, min, max)` | Aggiunge a un `int` e ne limita il range (clamp), in una sola chiamata |
| `data.addFlag(key)` | Imposta un flag. Restituisce `false` se era già attivo |
| `data.hasFlag(key)` / `data.removeFlag(key)` | Controlla o cancella il flag |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | Elimina un valore |

Ogni tipo di dato ha la propria tabella dedicata, quindi un `int` e una `string` sotto la medesima chiave non collidono. Per chiarezza personale è comunque saggio non condividere le stesse chiavi.




## Salvare oggetti complessi con NML

Se cinque tipi primitivi ti sembrano una limitazione e vuoi salvare un'intera classe su un'entità, NML mette a disposizione `DataExtension` in `NeoModLoader.General.Game.extensions`:

```csharp
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}

// Salvataggio sull'actor:
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// Lettura dal salvataggio:
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress quest = saved.Data;
}
```

Sotto il cofano, NML serializza il tuo oggetto in formato JSON e lo salva nella tabella `custom_data_string`. Se prevedi che la struttura dati possa cambiare in futuro, implementa direttamente `ICustomData` con versioning invece di `BasicCustomData<T>` per evitare incompatibilità coi vecchi salvataggi :PES5_Hmmmm:.

## In HelloBox

Un tratto che conta ogni colpo andato a segno del portatore e assegna una ricompensa speciale una sola volta, al cinquantesimo colpo:

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

Salva il mondo e ricaricalo: il conteggio è ancora lì, poiché fa parte integrante dei dati di salvataggio dell'unità. Il flag assicura che la ricompensa scatti una volta sola e non a ogni singolo colpo successivo.

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
| Culture, religioni, clan, lingue, famiglie, eserciti, complotti | i rispettivi `data`, condividono tutti la stessa struttura |

## Cose da sapere

- **Aggiungi sempre un prefisso alle tue chiavi.** Tutti i mod scrivono nello stesso archivio. `hello_hits` non entrerà mai in collisione con nessuno; `hits` prima o poi lo farà.
- **Rimuovere il mod è del tutto sicuro.** Le chiavi rimangono nel salvataggio, nessuno le legge e nulla va in crash. Questo è l'enorme vantaggio rispetto al patchare il formato di salvataggio interno del gioco.
- **Gli archivi vuoti non pesano nulla.** Il gioco scarta le tabelle vuote prima di salvare su disco, quindi una chiave rimossa scompare davvero.
- **Mantieni i dati leggeri.** Vengono salvati con ogni unità. Un contatore o un flag per unità è impercettibile; una stringa lunga per unità su un mondo con diecimila creature appesantirà inutilmente il salvataggio di tutti.

Per tutto ciò che non è legato a un singolo oggetto specifico (come un'impostazione globale per l'intero mondo), usa invece la configurazione del tuo mod: vedi **[Configurazione mod](#/nml/mod-config)** :PES_OkHand:.
