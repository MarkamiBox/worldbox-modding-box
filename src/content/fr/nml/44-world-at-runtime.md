---
title: Le monde à l'exécution
group: Game Content
subgroup: Architecture & Stats
icon: :wbworld:
order: 96
---

# Le monde à l'exécution :wbworld:

Toutes les autres pages enregistrent des éléments pendant le chargement du jeu. Celle-ci est dédiée à l'autre moitié : manipuler ce qui existe déjà dans un monde en cours d'exécution et le modifier. Détruire une ville, la transférer à un autre royaume (kingdom), déclencher une guerre (war), remplir une ville avec ses propres habitants.

Tout cela s'exécute à partir du `click_action` d'un pouvoir divin (GodPower), depuis `Update()`, ou depuis un world behaviour, et **jamais** depuis `OnModLoad`, où aucun monde n'existe encore. Consultez **[Logs et débogage](#/nml/logs-and-debugging)** pour connaître la condition de garde, et **[Chaque frame](#/nml/update-loops)** pour le faire depuis `Update()` sans coûter au joueur son nombre d'images par seconde.

## Parcourir ce qui existe

```csharp
if (World.world == null || Config.worldLoading) return;

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

`World.world.kingdoms` fonctionne de la même manière, voir **[Royaumes et factions](#/nml/kingdoms)**. Utilisez `isRekt()` sur chaque élément, systématiquement : ces listes contiennent des objets qui sont en train de mourir au moment même où vous les lisez :PES2_F:.

Une boucle comme celle-ci convient très bien une fois, sur un clic. À chaque frame sur chaque bâtiment, ça ne convient pas : exécutez-la selon une horloge, voir **[Chaque frame](#/nml/update-loops)**.

## Déplacer une ville vers un autre royaume

```csharp
city.joinAnotherKingdom(pNewSetKingdom: kingdom);
```

`pCaptured: true` la comptabilise comme conquise dans les statistiques (stats), `pRebellion: true` comme une rébellion. Les unités suivent leur ville.

## Détruire des éléments

```csharp
city.destroyCity();              // la ville disparaît, ses zones ne sont plus attribuées à personne
building.startDestroyBuilding(); // tombe en ruines s'il possède un sprite de ruine, puis disparaît
```

`destroyCity()` est public. `startDestroyBuilding()` est `internal` : il compile car NML compile votre mod contre l'assembly rendue publique. Pour anéantir un royaume, détruisez ses villes une par une : parcourez une copie de `kingdom.cities`, pas la liste active, car chaque `destroyCity()` la modifie en direct.

## Déclencher une guerre

```csharp
if (World.world == null || Config.worldLoading || pAttacker == null || pDefender == null) return;
World.world.diplomacy.startWar(pAttacker, pDefender, WarTypeLibrary.normal);
```

`internal`, comme ci-dessus. Les types de guerre sont les champs statiques de `WarTypeLibrary` : `normal`, `spite`, `inspire`, `rebellion`, `whisper_of_war`, `clash`.

## Remplir une ville avec ses propres habitants

```csharp
if (World.world == null || Config.worldLoading || city == null || city.isRekt()) return;

Subspecies main = city.getMainSubspecies();
WorldTile tile = city.getTile();
if (main == null || tile == null) return;

Actor actor = World.world.units.createNewUnit(city.getActorAsset().id, tile, pSubspecies: main, pAdultAge: true);
actor?.joinCity(city);
```

`spawnNewUnit` de **[Acteurs personnalisés](#/nml/custom-actors)** choisit la sous-espèce (subspecies) à votre place. `createNewUnit` vous permet de la choisir vous-même, ce qui fait la différence entre "un humain" et "l'un de *ces* humains".

## Parents

```csharp
foreach (Actor parent in actor.getParents())
{
    // seulement les vivants
}

long first = actor.data.parent_id_1;   // les identifiants subsistent après la mort
```

`getParents()` ne renvoie que les parents encore en vie : il recherche chaque identifiant avec `World.world.units.get(id)` et ignore tout ce qui est manquant ou mort. Les identifiants restent dans les données de l'unité pour toujours, mais le jeu ne garde aucune trace des personnes qui se trouvent derrière eux. Un arbre généalogique qui se souvient des morts doit inscrire ce dont il a besoin dans les données de chaque enfant à la naissance, voir **[Mémoriser des données](#/nml/saving-data)**. Le monde possède aussi son propre stockage, mais c'est une simple liste plate de clés, pas un endroit pour conserver dix mille arbres généalogiques :PES_ThinkAboutIt:.
