---
title: El mundo en tiempo de ejecución
group: Game Content
subgroup: Architecture & Stats
icon: :wbworld:
order: 96
---

# El mundo en tiempo de ejecución :wbworld:

Todas las demás páginas registran cosas mientras se carga el juego. Esta está dedicada a la otra mitad: tomar lo que ya existe en un mundo en ejecución y modificarlo. Destruir una ciudad, entregarla a otro reino, iniciar una guerra, llenar una ciudad con sus propios habitantes.

Todo esto se ejecuta desde el `click_action` de un poder divino, desde `Update()`, o desde un world behaviour, y **nunca** desde `OnModLoad`, donde todavía no existe ningún mundo. Consulta **[Registros y depuración](#/nml/logs-and-debugging)** para ver la condición de seguridad.

## Recorrer lo que existe

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

`World.world.kingdoms` funciona de la misma manera, consulta **[Reinos y facciones](#/nml/kingdoms)**. Ejecuta `isRekt()` en cada elemento, cada vez: estas listas contienen objetos que están muriendo en este preciso instante :PES2_F:.

## Mover una ciudad a otro reino

```csharp
city.joinAnotherKingdom(pNewSetKingdom: kingdom);
```

`pCaptured: true` la cuenta como conquistada para las estadísticas, `pRebellion: true` como rebelión. Las unidades siguen a su ciudad.

## Destruir cosas

```csharp
city.destroyCity();              // la ciudad desaparece, sus zonas vuelven a ser de nadie
building.startDestroyBuilding(); // cae en ruinas si tiene arte de ruina, luego desaparece
```

`destroyCity()` es público. `startDestroyBuilding()` es `internal`: compila porque NML compila tu mod contra el ensamblado publicitado. Para aniquilar un reino, destruye sus ciudades una a una: recorre una copia de `kingdom.cities`, no la lista activa, porque cada `destroyCity()` la modifica.

## Iniciar una guerra

```csharp
World.world.diplomacy.startWar(pAttacker, pDefender, WarTypeLibrary.normal);
```

`internal`, igual que arriba. Los tipos de guerra son los campos estáticos en `WarTypeLibrary`: `normal`, `spite`, `inspire`, `rebellion`, `whisper_of_war`, `clash`.

## Llenar una ciudad con sus propios habitantes

```csharp
Subspecies main = city.getMainSubspecies();
WorldTile tile = city.getTile();
if (main == null || tile == null) return;

Actor actor = World.world.units.createNewUnit(city.getActorAsset().id, tile, pSubspecies: main, pAdultAge: true);
actor?.joinCity(city);
```

`spawnNewUnit` de **[Actores personalizados](#/nml/custom-actors)** elige la subespecie por ti. `createNewUnit` te permite elegirla, que es la diferencia entre "un humano" y "uno de *estos* humanos".

## Padres

```csharp
foreach (Actor parent in actor.getParents())
{
    // solo los que sigan vivos
}

long first = actor.data.parent_id_1;   // los identificadores se conservan tras la muerte
```

`getParents()` solo devuelve a los padres que siguen vivos: busca cada id con `World.world.units.get(id)` y omite cualquier elemento faltante o muerto. Los identificadores permanecen en los datos de la unidad para siempre, pero el juego no guarda registro de las personas detrás de ellos. Un árbol genealógico que recuerde a los muertos debe escribir lo que necesita en los datos de cada hijo al nacer, consulta **[Guardar datos](#/nml/saving-data)**, porque no hay un lugar donde almacenar algo para el mundo entero :PES_ThinkAboutIt:.
