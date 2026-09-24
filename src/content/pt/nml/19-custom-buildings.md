---
title: Edifícios personalizados
group: Conteúdo do jogo
subgroup: Atores, construções e IA
icon: :wbcities:
order: 142
---

# Edifícios personalizados :wbcities:

Edifícios são o ponto onde o modding de WorldBox deixa de ser "mude um número" e se torna "este asset tem cento e quarenta campos e a maioria não faz nada no meu caso" :PES2_Weary:.

Portanto, não construímos um do zero. Clonamos um que já funciona.

## Clonar primeiro, ajustar depois

`clone(newId, sourceId)` copia todos os campos do original, renomeia **e registra**. Essa última parte importa:

```csharp Mods/HelloBox/Code/HelloBuildings.cs
namespace HelloBox
{
    public static class HelloBuildings
    {
        public const string SHRINE = "hello_shrine";

        public static void Initialize()
        {
            if (AssetManager.buildings.has(SHRINE)) return;

            BuildingAsset shrine = AssetManager.buildings.clone(SHRINE, "temple_human");

            shrine.sprite_path = "buildings/hello_shrine";   // a folder, used exactly as written

            // The game preloads every building's frames during its own startup, before your
            // mod existed. Load this one now, or placing it throws "Index was out of range".
            shrine.loadBuildingSprites();

            // Same story for the atlas that recolours it in the owner's colour: the library
            // links it in checkAtlasLink() at startup. Without it every frame throws.
            shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);
            shrine.building_type = BuildingType.Building_Civ;
            shrine.city_building = true;
            shrine.has_kingdom_color = true;
            shrine.max_houses = 0;                     // not housing, nobody lives here
            shrine.housing_slots = 0;
            shrine.draw_light_area = true;
            shrine.draw_light_size = 0.6f;
        }
    }
}
```

Tudo o que você não definir fica exatamente como estava no `temple_human`, que é uma construção de cidade que funciona. Esse é o truque todo.

> [!WARNING] Não chame `add()` depois de `clone()`
> `clone()` já registrou a cópia. Chamar `AssetManager.buildings.add(shrine)` depois registra uma segunda vez, o que faz a biblioteca descartar a primeira cópia e registrar `duplicate asset - overwriting...` no log. Continua funcionando, mas é ruído no seu log e a primeira coisa que qualquer um que revisar seu código vai apontar.

## De onde clonar

A biblioteca possui tanto modelos com prefixo `$…$` quanto edifícios completos:

| Origem | Para |
| --- | --- |
| `$building$` | A base mais pura |
| `$city_building$` | Qualquer coisa construída por cidades. Usado por `well` e `mine` |
| `$city_colored_building$` | O mesmo, mas tingido pela cor do reino |
| `$building_civ_human$` / `_elf$` / `_orc$` / `_dwarf$` | Edifícios civis por cultura |
| `$building_creep$` | Estruturas de biomas invasores (creep) |
| `$mineral$` | Rochas e minérios mineráveis |
| `$resource$`, `$flora_small$` | Natureza colhível |
| `tree_green_1` | Todas as árvores vanilla são clonadas desta |

Edifícios prontos que vale a pena clonar: `house_human_0` … `house_human_5`, `barracks_human`, `temple_human`, `library_human`, `market_human`, `docks_human`, `well`, `mine`, `mineral_stone`, `mineral_gold`.

Clonar o parente mais próximo leva dez minutos de leitura e poupa uma noite inteira lidando com campos sem efeito prático.

## Os campos, pelo que você deseja

### Que tipo de edifício é

| Campo | O que faz |
| --- | --- |
| `building_type` | `Building_Civ`, `Building_Nature`, `Building_Tree`, `Building_Mineral`, `Building_Mob`, `Building_Creep`, `Building_Plant`, `Building_Fruits`, `Building_Hives`, `Building_Wheat` |
| `city_building` | Pertence a uma cidade, recebendo cores de reino, zonas e postos de trabalho |
| `type` | Tag de texto livre usada para agrupamento em listas internas |
| `kingdom`, `civ_kingdom` | Restringe a uma facção específica |
| `ignored_by_cities` | Cidades nunca constroem ou contabilizam |

### Habitação e utilidade

| Campo | O que faz |
| --- | --- |
| `max_houses`, `housing_slots`, `can_units_live_here` | Se e quantos cidadãos moram nele |
| `housing_happiness` | Bônus de felicidade por morar ali |
| `storage`, `storage_only_food`, `is_stockpile` | Se armazena recursos |
| `book_slots` | Capacidade de livros em bibliotecas |
| `docks`, `boat_types`, `boat_type_fishing`, `boat_type_trading`, `boat_type_transport` | Produção de embarcações |
| `spawn_units`, `spawn_units_asset` | Gera criaturas |
| `tower`, `tower_projectile`, `tower_projectile_reload`, `tower_projectile_amount`, `tower_attack_buildings` | Capacidades de ataque e disparo de torre |

### Construção e posicionamento

| Campo | O que faz |
| --- | --- |
| `cost`, `construction_progress_needed` | Custo pago pela cidade e tempo necessário |
| `can_be_upgraded`, `upgrade_to`, `upgraded_from`, `upgrade_level` | Cadeias de melhoria, como `house_human_0` a `_5` |
| `build_place_borders`, `build_place_center`, `build_place_single`, `build_place_batch` | Onde ele se localiza na vila |
| `build_prefer_replace_house`, `check_for_close_building`, `ignore_same_building_id` | Regras de posicionamento |
| `limit_per_zone`, `limit_in_radius`, `limit_global` | Quantos podem existir |
| `can_be_placed_on_liquid`, `can_be_placed_on_blocks`, `needs_farms_ground`, `only_build_tiles` | Regras de terreno |
| `build_road_to` | A cidade constrói uma estrada até ele |

### Natureza e crescimento

| Campo | O que faz |
| --- | --- |
| `can_be_grown`, `vegetation_random_chance`, `is_vegetation` | Surge espontaneamente com o passar do tempo |
| `growth_time`, `has_resources_grown_to_collect` | Ciclos de colheita e frutos |
| `biome_tags_growth`, `has_biome_tags` | Quais biomas permitem seu crescimento |
| `resources_given`, `addResource(id, amount, pNewList)` | Recursos concedidos ao ser colhido |
| `can_be_chopped_down`, `gatherable` | Se as unidades podem derrubá-lo ou colhê-lo |
| `grow_creep` e suas variantes `grow_creep_*` | Comportamento de propagação de creep |

### Dano e destruição

| Campo | O que faz |
| --- | --- |
| `burnable`, `affected_by_lava`, `affected_by_acid`, `damaged_by_rain`, `can_be_damaged_by_tornado` | O que o danifica |
| `has_ruins_graphics`, `has_ruin_state`, `auto_remove_ruin`, `remove_ruins` | O que deixa para trás ao ser destruído |
| `can_be_demolished`, `can_be_abandoned`, `destroy_on_liquid` | Como ele desaparece |
| `loot_generation` | O que ele dropa ao ruir |

### Visual

| Campo | O que faz |
| --- | --- |
| `sprite_path` + `main_path` | Onde o sprite reside |
| `atlas_id`, `atlas_id_fallback_when_not_wobbly` | Qual atlas de sprites é utilizado |
| `scale_base`, `bonus_z`, `random_flip` | Tamanho, ordem de desenho e espelhamento |
| `shadow`, `shadow_bound`, `shadow_distortion` | A sombra |
| `has_kingdom_color` | Tingido pela cor do reino proprietário |
| `draw_light_area`, `draw_light_size` | Brilho e iluminação |
| `has_special_animation_state`, `animation_speed`, `sparkle_effect` | Animações |

### Comportamento

| Campo | O que faz |
| --- | --- |
| `step_action`, `has_step_action` | Código personalizado executado no tick do edifício |
| `base_stats` | Atributos concedidos pelo edifício |
| `priority` | Prioridade na fila de construção da cidade |

## Sprites

As construções carregam a arte de `sprite_path`, usado **exatamente como está escrito**. Só quando você deixa `sprite_path` vazio o jogo recorre a `main_path + id`. Coloque sua arte em `GameResources/buildings/hello_shrine/` e dê a ela um pivô no centro de baixo no seu `sprites.json`, ou o seu santuário flutua acima do chão como um fantasma :aPES_GhostDance:. Veja **[Sprites e recursos](#/nml/sprites-and-resources)**.

## Seu próprio sprite

Escolha um dos dois formatos abaixo e não misture. O carregador faz literalmente isto: usa `sprite_path` se tiver alguma coisa, senão usa `main_path + id`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── buildings/
        └── hello_shrine/
            ├── main_0.png           the building itself
            ├── construction_0.png   while a city is still building it
            ├── ruin_0.png           what is left after it is destroyed
            ├── mini_0.png           the minimap dot, one pixel per tile it covers
            └── sprites.json         bottom-centre pivot
```

Os **nomes dos arquivos são o formato**. O carregador divide cada nome no `_`: a parte antes é o tipo (`main`, `construction`, `ruin`, `disabled`, `spawn`, `special`, e `mini` para o minimapa), o número depois é o frame da animação. `mini_0` precisa ter exatamente tantos pixels quantos tiles a construção ocupa, 5x4 para qualquer coisa clonada de `temple_human`; sem ele, o minimapa lança `NullReferenceException` em `Building.getColorForMinimap()` toda vez que redesenha. `main_0`, `main_1`, `main_2` é uma animação de três frames. Um arquivo com qualquer outro nome não é um frame, e uma pasta sem `main_0` não dá nada para a construção desenhar.

```csharp
// A: full path in sprite_path. main_path is then ignored.
shrine.sprite_path = "buildings/hello_shrine";

// B: leave sprite_path empty and let main_path + id decide.
shrine.sprite_path = string.Empty;
shrine.main_path = "buildings/";       // -> buildings/hello_shrine
```

Misture os dois, pasta em `main_path` e `sprite_path` vazio, e o jogo procura `buildings/hello_shrine/hello_shrine` :aPES_BrainScratch:.

> [!WARNING] Carregue os frames você mesmo, depois de definir o caminho
> O jogo preenche `building_sprites` para cada construção no próprio pré-carregamento, que roda antes do seu mod. Uma construção que você registra depois tem a lista de frames vazia, e na primeira vez que alguém é colocado o jogo morre em `Building.setAnimData()` com `ArgumentOutOfRangeException: Index was out of range` :wbfacepalm:. Chame `shrine.loadBuildingSprites();` assim que `sprite_path` estiver definido.
>
> O irmão dele é `atlas_asset`, o atlas de sprites que pinta a construção na cor do dono. A biblioteca o liga em `checkAtlasLink()`, também na inicialização. Pule isso e a construção é colocada sem problemas, mas depois lança `NullReferenceException` em `DynamicSprites.getRecoloredBuilding()` em **todo frame em que aparece na tela**.

Dê a ela um **pivô no centro de baixo** no seu `sprites.json`, ou o seu santuário flutua acima do chão como um fantasma (veja **[Sprites e recursos](#/nml/sprites-and-resources)**).

## Colocando um no mapa

`World.world.buildings.addBuilding(...)` está marcado como `internal`, compilando apenas quando você referencia uma `Assembly-CSharp.dll` **publicizada**; veja a nota em **[Efeitos de status](#/nml/status-effects)**:

```csharp
BuildingAsset asset = AssetManager.buildings.get(HelloBuildings.SHRINE);
if (asset == null || tile == null) return;

if (World.world.buildings.canBuildFrom(tile, asset, null, BuildPlacingType.New))
{
    World.world.buildings.addBuilding(asset, tile);
}
```

Sempre consulte `canBuildFrom` primeiro. Colocar um edifício sobre a água, sobre outra construção ou sobre um ladrilho reservado por uma cidade cria um mundo que parece perfeito e quebra três minutos depois :PES_OhShit:.


## Fazendo as cidades construírem o edifício

Um poder divino que posiciona seu santuário é divertido por uma tarde. Um santuário que as cidades constroem por conta própria, quando atingem o tamanho necessário, é um mod. As cidades escolhem o que construir a partir de duas coisas, e sua construção ainda não está em nenhuma delas:

| | O que contém |
| --- | --- |
| Uma **ordem de construção** (`AssetManager.city_build_orders`) | Uma lista de chaves de ordem como `order_temple`, com a população e a quantidade de edifícios exigidas para cada uma |
| Uma **arquitetura** (`AssetManager.architecture_library`) | Qual edifício uma chave de ordem significa para essa criatura: `order_temple` é `temple_human` para humanos, outra coisa para orcs |

Então você inventa uma chave de ordem, ensina a cada arquitetura o que ela significa e a adiciona às ordens de construção:

```csharp Mods/HelloBox/Code/HelloBuildings.cs
public const string ORDER = "order_hello_shrine";

private static void AddToCities()
{
    BuildingAsset shrine = AssetManager.buildings.get(SHRINE);
    if (shrine == null) return;

    // Um tipo próprio, para que a cidade conte santuários contra o seu limite, não templos
    shrine.type = "type_hello_shrine";

    // A busca de arquitetura é um dicionário simples: uma chave desconhecida lança um erro para cada cidade
    // dessa criatura. Ensine-a para todas, mesmo para as que nunca a alcançarão.
    foreach (ArchitectureAsset architecture in AssetManager.architecture_library.list)
    {
        architecture.addBuildingOrderKey(ORDER, SHRINE);
    }

    foreach (CityBuildOrderAsset orders in AssetManager.city_build_orders.list)
    {
        if (orders.list.Exists(pOrder => pOrder.id == ORDER)) continue;

        // mesmo limite que o templo usa: 1, 50 habitantes, 15 edifícios na cidade
        orders.addBuilding(ORDER, 1, 50, 15);
    }
}
```

Chame `AddToCities()` no final de `Initialize()`, depois do clone.

Ao contrário da maior parte deste guia, não há armadilha de inicialização aqui: `CityBehBuild.calcPossibleBuildings()` lê a lista de ordens de construção de cada cidade toda vez que avalia construir, portanto uma ordem adicionada no carregamento é vista pela primeira cidade que verificar. A cidade ainda precisa conseguir pagar o `cost` do edifício e atender a cada número da ordem; quando não consegue, simplesmente ignora o seu santuário em silêncio :PES5_Hmmmm:.

| Argumento de `addBuilding(...)` | O que faz |
| --- | --- |
| `pID` | A chave de ordem, não o id do edifício |
| `pLimitType` | Quantos a cidade pode ter. O templo usa `1` |
| `pPop` | População mínima |
| `pBuildings` | Número mínimo de edifícios já presentes na cidade |
| `pCheckFullVillage` | Apenas quando todas as casas estiverem cheias |
| `pCheckHouseLimit` | Para casas: ignorar enquanto não faltar moradia, parar no limite de casas da cidade |
| `pMinZones` | Tamanho mínimo da cidade, em zonas |

## O texto

```json Mods/HelloBox/Locales/en.json
{
  "hello_shrine": "Shrine",
  "hello_shrine_description": "Nobody remembers who built it. Everybody agrees it should not be touched."
}
```

> [!TIP] Leia o original antes de cloná-lo
> Abra `BuildingLibrary` no **dnSpy** e observe como `house_human_0`, `tree_green_1` e `mineral_stone` se diferenciam. Cada edifício vanilla é montado ali em C# puro, tornando-se a melhor documentação campo a campo existente :PES_Smart:.
