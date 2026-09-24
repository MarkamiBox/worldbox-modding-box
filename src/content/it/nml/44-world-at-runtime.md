---
title: Il mondo a runtime
group: Game Content
subgroup: Architecture & Stats
icon: :wbworld:
order: 96
---

# Il mondo a runtime :wbworld:

Tutte le altre pagine registrano elementi durante il caricamento del gioco. Questa è dedicata all'altra metà: prendere ciò che già esiste in un mondo in esecuzione e modificarlo. Distruggere una città, consegnarla a un altro regno (kingdom), scatenare una guerra (war), riempire una città con i suoi stessi abitanti.

Tutto questo viene eseguito dal `click_action` di un potere divino (GodPower), da `Update()`, o da un world behaviour, e **mai** da `OnModLoad`, dove non esiste ancora alcun mondo. Vedi **[Log e debugging](#/nml/logs-and-debugging)** per la condizione di sicurezza.

## Scorrere ciò che esiste

```csharp
foreach (City city in World.world.cities)
{
    if (city == null || city.isRekt()) continue;
    // city.kingdom, city.units, city.buildings, city.zones
}

foreach (Building building in World.world.buildings)
{
    if (building == null || building.isRekt()) continue;
}
```

`World.world.kingdoms` funziona allo stesso modo, vedi **[Regni e fazioni](#/nml/kingdoms)**. Esegui `isRekt()` su ogni elemento, ogni volta: queste liste contengono oggetti che stanno morendo proprio in questo istante :PES2_F:.

## Spostare una città in un altro regno

```csharp
city.joinAnotherKingdom(pNewSetKingdom: kingdom);
```

`pCaptured: true` la conta come conquistata per le statistiche (stats), `pRebellion: true` come ribellione. Le unità seguono la loro città.

## Distruggere le cose

```csharp
city.destroyCity();              // la città scompare, le sue zone tornano libere
building.startDestroyBuilding(); // cade in rovina se ha uno sprite di rovina, poi scompare
```

`destroyCity()` è pubblico. `startDestroyBuilding()` è `internal`: compila perché NML compila la tua mod contro l'assembly pubblicizzata. Per annientare un regno, distruggi le sue città una alla volta: scorri una copia di `kingdom.cities`, non la lista attiva, perché ogni `destroyCity()` la modifica.

## Scatenare una guerra

```csharp
World.world.diplomacy.startWar(pAttacker, pDefender, WarTypeLibrary.normal);
```

`internal`, esattamente come sopra. I tipi di guerra sono i campi statici in `WarTypeLibrary`: `normal`, `spite`, `inspire`, `rebellion`, `whisper_of_war`, `clash`.

## Riempire una città con i suoi stessi abitanti

```csharp
Subspecies main = city.getMainSubspecies();
WorldTile tile = city.getTile();
if (main == null || tile == null) return;

Actor actor = World.world.units.createNewUnit(city.getActorAsset().id, tile, pSubspecies: main, pAdultAge: true);
actor?.joinCity(city);
```

`spawnNewUnit` da **[Attori personalizzati](#/nml/custom-actors)** sceglie la sottospecie (subspecies) per te. `createNewUnit` ti permette di sceglierla, che è la differenza tra "un umano" e "uno di *questi* umani".

## Genitori

```csharp
foreach (Actor parent in actor.getParents())
{
    // solo quelli ancora vivi
}

long first = actor.data.parent_id_1;   // gli ID restano dopo la morte
```

`getParents()` restituisce solo i genitori ancora in vita: cerca ciascun ID con `World.world.units.get(id)` e salta qualsiasi elemento mancante o morto. Gli ID rimangono nei dati dell'unità per sempre, ma il gioco non conserva alcuna memoria delle persone che vi stavano dietro. Un albero genealogico che ricordi i morti deve scrivere ciò che gli serve nei dati di ogni figlio alla nascita, vedi **[Salvare i dati](#/nml/saving-data)**, perché non c'è un posto dove memorizzare qualcosa per il mondo intero :PES_ThinkAboutIt:.
