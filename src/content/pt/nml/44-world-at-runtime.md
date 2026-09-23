---
title: O mundo em tempo de execução
group: Game Content
subgroup: Architecture & Stats
icon: :wbworld:
order: 96
---

# O mundo em tempo de execução :wbworld:

Todas as outras páginas registram elementos durante a inicialização do jogo. Esta é dedicada à outra metade: manipular o que já existe em um mundo em execução e alterá-lo. Destruir uma cidade, entregá-la a outro reino, iniciar uma guerra, encher uma cidade com seus próprios habitantes.

Tudo isso é executado a partir do `click_action` de um poder divino, de `Update()`, ou de um world behaviour, e **nunca** de `OnModLoad`, onde ainda não existe mundo algum. Consulte **[Logs e depuração](#/nml/logs-and-debugging)** para ver a condição de segurança.

## Percorrendo o que existe

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

`World.world.kingdoms` funciona da mesma maneira, veja **[Reinos e facções](#/nml/kingdoms)**. Execute `isRekt()` em cada item, todas as vezes: essas listas contêm objetos que estão morrendo neste exato instante.

## Movendo uma cidade para outro reino

```csharp
city.joinAnotherKingdom(pNewSetKingdom: kingdom);
```

`pCaptured: true` a conta como conquistada para as estatísticas, `pRebellion: true` como rebelião. As unidades seguem sua cidade.

## Destruindo coisas

```csharp
city.destroyCity();              // a cidade desaparece, suas zonas voltam a ser livres
building.startDestroyBuilding(); // cai em ruínas se tiver arte de ruína, depois desaparece
```

`destroyCity()` é público. `startDestroyBuilding()` é `internal`: compila porque o NML compila seu mod contra o assembly publicizado. Para aniquilar um reino, destrua suas cidades uma a uma: itere sobre uma cópia de `kingdom.cities`, não sobre a lista ativa, porque cada `destroyCity()` a modifica.

## Iniciando uma guerra

```csharp
World.world.diplomacy.startWar(pAttacker, pDefender, WarTypeLibrary.normal);
```

`internal`, igual ao caso acima. Os tipos de guerra são os campos estáticos em `WarTypeLibrary`: `normal`, `spite`, `inspire`, `rebellion`, `whisper_of_war`, `clash`.

## Enchendo uma cidade com seus próprios habitantes

```csharp
Subspecies main = city.getMainSubspecies();
WorldTile tile = city.getTile();
if (main == null || tile == null) return;

Actor actor = World.world.units.createNewUnit(city.getActorAsset().id, tile, pSubspecies: main, pAdultAge: true);
actor?.joinCity(city);
```

`spawnNewUnit` de **[Criaturas customizadas](#/nml/custom-actors)** escolhe a subespécie para você. `createNewUnit` permite que você a escolha, o que é a diferença entre "um humano" e "um *desses* humanos".

## Pais

```csharp
foreach (Actor parent in actor.getParents())
{
    // apenas os que ainda estiverem vivos
}

long first = actor.data.parent_id_1;   // os IDs são preservados após a morte
```

`getParents()` retorna apenas os pais que ainda estão vivos: ele busca cada ID com `World.world.units.get(id)` e ignora itens faltantes ou mortos. Os IDs permanecem nos dados da unidade para sempre, mas o jogo não guarda histórico das pessoas por trás deles. Uma árvore genealógica que queira lembrar dos mortos deve gravar o que precisa nos dados de cada filho ao nascer, veja **[Salvando dados](#/nml/saving-data)**, pois não há um local global para armazenar dados para o mundo inteiro :PES_ThinkAboutIt:.
