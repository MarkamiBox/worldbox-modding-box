---
title: Librerie di asset
group: Contenuto di gioco
subgroup: Architettura e statistiche
icon: :wbbrain:
order: 90
---

# Librerie di asset :wbbrain:

Prima che le pagine successive abbiano senso, ti serve questa. Ogni singola cosa in WorldBox (un tratto, un'arma, un edificio, una casella, una nuvola, un regno) è un **asset** custodito in una **libreria**, e ogni libreria del gioco appartiene alla medesima classe con i medesimi quattro metodi.

Imparali una volta qui e le successive trenta pagine si ridurranno a: "quale libreria, quali campi".

## Cos'è una libreria

```csharp
public abstract class AssetLibrary<T> : BaseAssetLibrary where T : Asset
{
    public List<T> list;                 // tutti gli asset, in ordine
    public Dictionary<string, T> dict;   // tutti gli asset, indicizzati per id
}
```

Tutto qui. Una lista e un dizionario, entrambi pubblici, pronti per essere letti e modificati dalla tua mod. `AssetManager` ne gestisce 129. Consulta **[Tutte le librerie di asset](#/nml/asset-index)** per il catalogo completo.

## I quattro metodi

```csharp
AssetManager.traits.has("hello_swift");            // questo id è già occupato?
AssetManager.traits.get("hello_swift");            // recuperalo, oppure null
AssetManager.traits.add(myTrait);                  // registra un nuovo asset
AssetManager.traits.clone("hello_new", "brave");   // copia un esistente e registra la copia
```

### `has(id)`

Restituisce `true` se l'id è già registrato. **La prima riga di ogni `Initialize()` che scrivi deve sempre essere questa**:

```csharp
if (AssetManager.traits.has(SWIFT)) return;
```

Senza di essa, qualsiasi ricaricamento della mod registrerà tutto due volte.

### `get(id)`

Restituisce l'asset vivo in memoria, oppure `null` se l'id non esiste. **Non** solleva eccezioni, quindi il null pointer crash si manifesterà molto lontano dalla riga d'origine:

```csharp
ActorTrait brave = AssetManager.traits.get("brave");
if (brave == null) return;   // sempre. ogni singola volta.
```

Il fatto che `get` restituisca l'oggetto *vivo* è l'aspetto più prezioso di questa pagina. Significa che puoi alterare i contenuti vanilla senza doverli rimpiazzare da zero:

```csharp
// Rendi i draghi vanilla più robusti senza toccare nient'altro di loro.
ActorAsset dragon = AssetManager.actor_library.get("dragon");
if (dragon != null) dragon.base_stats["health"] += 500;
```

### `add(asset)`

Registra un nuovo asset. Al suo interno accadono tre passaggi fondamentali che devi conoscere:

1. **Se l'id è già occupato, il vecchio asset viene rimosso e il tuo prende il suo posto**, registrando questo nel log:
   ```text
   <e>AssetLibrary<ActorTrait></e>: duplicate asset - overwriting...
   ```
   È così che una mod ne danneggia silenziosamente un'altra. Metti sempre un prefisso ai tuoi id.
2. Viene invocato `create()` sull'asset.
3. **La libreria alloca il blocco `base_stats`** (e `base_stats_meta` se presente). Ecco perché la regola categorica di tutta questa guida è "le statistiche vanno sempre dopo `add()`".

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };

AssetManager.traits.add(swift);        // <- alloca il blocco statistiche
swift.base_stats["speed"] = 20f;       // <- sicuro solo dopo questa riga
```

Inverti questo ordine e otterrai il crash più frequente dell'intero modding di WorldBox:

```text
NullReferenceException: Object reference not set to an instance of an object
```

### `clone(newId, sourceId)`

Copia ogni campo serializzabile di `sourceId` in un oggetto completamente nuovo, gli assegna `newId` **e chiama `add()` su di esso**. Restituisce la copia creata.

```csharp
BuildingAsset shrine = AssetManager.buildings.clone("hello_shrine", "temple_human");
shrine.max_houses = 0;                     // modifica solo ciò che ti interessa
shrine.base_stats["health"] = 200;         // già allocato, perché add() è già stato eseguito
```

> [!WARNING] Mai chiamare `add()` dopo `clone()`
> Un secondo `add()` rimuove la prima copia, genera la voce di log `duplicate asset overwriting...` e la reinserisce. Funziona, ma genera rumore nei log che nasconde gli errori autentici.

Clonare è la scelta predefinita ideale per qualsiasi cosa abbia più di dieci campi: edifici, creature, equipaggiamento, caselle. Erediti una configurazione già testata e funzionante, dovendo comprendere soltanto i campi che intendi ritoccare.

## Modelli

Le librerie contengono asset semilavorati il cui id inizia con `$` o `_`. Sono registrati in `dict` ma esclusi da `list`, quindi non compaiono mai nel gioco vero e proprio: esistono unicamente per essere clonati.

```csharp
AssetManager.actor_library.clone("hello_sprite", "$civ_advanced_unit$");
AssetManager.items.clone("hello_sword_ember", "$sword");
AssetManager.buildings.clone("hello_shrine", "$city_building$");
AssetManager.resources.clone("hello_cake", "$TEMPLATE_FOOD$");
AssetManager.kingdoms.clone("hello_sprites", "$TEMPLATE_CIV$");
```

Un modello è quasi sempre un punto di partenza migliore rispetto a un asset finito, poiché non erediti l'identità del donatore insieme alla sua logica interna. L'eccezione è la grafica: clonare `human` ti fornisce gli sprite umani, e una creatura visibile batte sempre una creatura corretta ma invisibile :PES4_AlrightThen:.

## Elencare ciò che esiste

Il modo più rapido per scoprire quali id puoi clonare è stamparli a schermo:

```csharp
foreach (BuildingAsset asset in AssetManager.buildings.list)
{
    LogInfo(asset.id);
}
```

Due righe, e non dovrai mai più tirare a indovinare un id. `list` esclude i modelli; `dict.Keys` li include tutti.

## Riordinare gli elementi

`list` è una comune `List<T>`, e il gioco disegna schede e categorie nell'ordine della lista. Puoi quindi posizionare il tuo asset esattamente nel punto desiderato:

```csharp
ItemGroupAsset group = AssetManager.item_groups.get("hello_relics");
int index = AssetManager.item_groups.list.FindIndex(g => g.id == "amulet");

if (group != null && index != -1)
{
    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## Quando viene eseguito il tuo codice

Il gioco costruisce tutte le 129 librerie all'avvio, poi esegue `post_init()` su di esse, **poi** NML carica la tua mod. Due conseguenze su cui la gente inciampa di continuo, me compreso:

- **Tutto ciò che una libreria fa automaticamente in `post_init` è già successo.** I tratti degli attori, per esempio, ricevono lì un `path_icon` predefinito. Il tuo no, perché il tuo tratto non esisteva ancora. Impostalo tu.
- **Ogni asset vanilla esiste già quando gira il tuo `OnModLoad`.** Quindi `get("human")` funziona, `clone(..., "human")` funziona, e modificare i contenuti vanilla sul posto funziona. Non sei mai troppo presto.

> [!NOTE] Patchare questi metodi non tocca i contenuti vanilla
> `has`, `get`, `add`, `clone` e `post_init` girano tutti sulle 129 librerie durante l'avvio del gioco, prima che NML carichi una sola mod. Una patch Harmony su uno di questi influisce solo sulle chiamate fatte *dopo* il caricamento della tua mod. Non tocca mai la registrazione vanilla già avvenuta a quel punto. Vuoi contenuti vanilla diversi? Cambiali dopo con `get()`, come fa il resto di questa pagina.

## Lo schema che ogni pagina successiva adotta

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public const string ID = "hello_something";

        public static void Initialize()
        {
            // 1. mai registrare due volte
            if (AssetManager.<library>.has(ID)) return;

            // 2. clona se esiste qualcosa di simile, crea da zero altrimenti
            SomeAsset asset = AssetManager.<library>.clone(ID, "$template$");

            // 3. modifica i campi desiderati
            asset.some_field = true;

            // 4. statistiche sempre alla fine
            asset.base_stats["damage"] = 10;
        }
    }
}
```

Ogni pagina dedicata agli asset in questa guida segue questa precisa struttura, cambiando solo i nomi. Se mai una pagina ti disorienta, torna qui :PESgn_GoOn:.

## Quattro regole d'oro da appendere sopra la scrivania

1. **`has()` prima di tutto.** Mai registrare lo stesso id due volte.
2. **`clone()` chiama già `add()`.** Mai chiamarli entrambi in sequenza.
3. **`base_stats` esiste solo dopo `add()`.** Statistiche sempre per ultime.
4. **Metti un prefisso ai tuoi id.** `hello_swift`, mai `swift`. Esiste un unico spazio dei nomi condiviso con tutte le altre mod.
