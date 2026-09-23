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

`clone(newId, sourceId)` copia cada campo do original, o renomeia **e o registra**. Esta última parte é crucial:

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

Tudo o que você não definir permanece exatamente como estava em `temple_human`, que é um edifício urbano plenamente funcional. Esse é todo o segredo.

> [!WARNING] Não chame add() após clone()
> `clone()` já registrou a cópia. Chamar `AssetManager.buildings.add(shrine)` depois disso registra pela segunda vez, fazendo com que a biblioteca descarte a primeira cópia e registre `duplicate asset - overwriting...`. Ainda funciona, mas suja o log e é a primeira coisa que qualquer pessoa apontará ao revisar seu código.

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
| `docks`, `boat_types`, `boat_type_fishing` … | Produção de embarcações |
| `spawn_units`, `spawn_units_asset` | Gera criaturas |
| `tower`, `tower_projectile`, `tower_projectile_reload` … | Capacidades de ataque e disparo de torre |

### Construção e posicionamento

| Campo | O que faz |
| --- | --- |
| `cost`, `construction_progress_needed` | Custo pago pela cidade e tempo necessário |
| `can_be_upgraded`, `upgrade_to`, `upgraded_from` … | Cadeias de melhoria, como `house_human_0` a `_5` |
| `build_place_borders`, `build_place_center` … | Onde ele se localiza na vila |
| `build_prefer_replace_house`, `check_for_close_building` … | Regras de posicionamento |
| `limit_per_zone`, `limit_in_radius`, `limit_global` | Quantos podem existir |
| `can_be_placed_on_liquid`, `can_be_placed_on_blocks` … | Regras de terreno |
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
| `burnable`, `affected_by_lava`, `affected_by_acid` … | O que o danifica |
| `has_ruins_graphics`, `has_ruin_state`, `auto_remove_ruin` … | O que deixa para trás ao ser destruído |
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
| `has_special_animation_state`, `animation_speed` … | Animações |

### Comportamento

| Campo | O que faz |
| --- | --- |
| `step_action`, `has_step_action` | Código personalizado executado no tick do edifício |
| `base_stats` | Atributos concedidos pelo edifício |
| `priority` | Prioridade na fila de construção da cidade |

## Sprites

Edifícios buscam suas artes em `main_path + sprite_path`, resultando em `buildings/hello_shrine`. Coloque seu PNG em `GameResources/buildings/hello_shrine.png` e ele será resolvido como qualquer edifício vanilla. Defina um pivô inferior central (bottom-centre) em seu `sprites.json`, ou seu santuário flutuará acima do solo como um fantasma :aPES_GhostDance:. Veja **[Sprites e recursos](#/nml/sprites-and-resources)**.

## Seu próprio sprite

Edifícios são o único asset que junta **dois** campos: `main_path + sprite_path`. `main_path` já tem como padrão `buildings/`, logo `sprite_path` é apenas o nome do arquivo.

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

Os **nomes dos arquivos são o formato**. O carregador divide cada nome em `_`: antes vem o tipo (`main`, `construction`, `ruin`, `disabled`, `spawn`, `special`), depois o número do frame da animação. `main_0`, `main_1`, `main_2` é uma animação de três frames. Um arquivo com outro nome não é um frame, e uma pasta sem `main_0` deixa a construção sem nada para desenhar. `mini` é o ícone do minimapa: `mini_0` precisa ter tantos pixels quantos tiles a construção ocupa, 5x4 para qualquer coisa clonada de `temple_human`. Sem ele, o minimapa lança `NullReferenceException` em `Building.getColorForMinimap()` a cada redesenho.

```csharp
shrine.main_path = "buildings/";       // o padrão, você raramente altera
shrine.sprite_path = "hello_shrine";   // NÃO "buildings/hello_shrine"
```

Se misturar, pasta em `main_path` e `sprite_path` vazio, o jogo buscará `buildings/hello_shrine/hello_shrine` :aPES_BrainScratch:.

> [!WARNING] Carregue os frames você mesmo, depois de definir o caminho
> O jogo preenche `building_sprites` de cada construção no próprio pré-carregamento, que roda antes do seu mod. Uma construção registrada depois tem a lista de frames vazia, e na primeira vez que é colocada o jogo morre em `Building.setAnimData()` com `ArgumentOutOfRangeException: Index was out of range` :wbfacepalm:. Chame `shrine.loadBuildingSprites();` assim que `sprite_path` estiver definido.
>
> O irmão dele é `atlas_asset`, o atlas que pinta a construção na cor do dono. A biblioteca liga isso em `checkAtlasLink()`, também na inicialização. Sem ele a construção é colocada normalmente e depois lança `NullReferenceException` em `DynamicSprites.getRecoloredBuilding()` **em todo frame que aparece na tela**.


Configure um **pivô inferior central** no seu `sprites.json`, caso contrário seu santuário flutuará no ar (veja **[Sprites e recursos](#/nml/sprites-and-resources)**).

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

## O texto

```json Mods/HelloBox/Locales/en.json
{
  "hello_shrine": "Shrine",
  "hello_shrine_description": "Nobody remembers who built it. Everybody agrees it should not be touched."
}
```

> [!TIP] Leia o original antes de cloná-lo
> Abra `BuildingLibrary` no **dnSpy** e observe como `house_human_0`, `tree_green_1` e `mineral_stone` se diferenciam. Cada edifício vanilla é montado ali em C# puro, tornando-se a melhor documentação campo a campo existente :PES_Smart:.
