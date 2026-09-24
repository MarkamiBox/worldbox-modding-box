---
title: Ladrilhos e terreno
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbrockies:
order: 170
---

# Ladrilhos e terreno :wbrockies:

O mapa é uma grade de `WorldTile`, e cada ladrilho carrega **dois** tipos empilhados um sobre o outro:

| Camada | Campo no ladrilho | Biblioteca | Classe | Exemplos |
| --- | --- | --- | --- | --- |
| Chão | `main_type` | `AssetManager.tiles` | `TileType` | terra, areia, rochas, oceano profundo, lava |
| Topo | `top_type` | `AssetManager.top_tiles` | `TopTileType` | `grass_low`, `grass_high`, `road`, `field`, `frozen_low`, muros |

Ambos compartilham a mesma classe básica por baixo (`TileTypeBase`), de modo que tudo nesta página se aplica a qualquer um deles. A única diferença é em qual camada eles ficam, o que é decidido por `layer_type`.

Se você quer adicionar um novo tipo de *chão*, isso é um `TileType`. Se você quer algo que fique **sobre** o chão (uma estrada, um muro, uma plantação, musgo), isso é um `TopTileType`, e geralmente é o que você realmente procura.

## Clone, não construa do zero

Um tipo de ladrilho possui cerca de cem campos, a maioria dos quais só importa para um ladrilho vanilla específico. Não vou listar os cem. Clone o modelo mais próximo:

```csharp Mods/HelloBox/Code/HelloTiles.cs
using UnityEngine;

namespace HelloBox
{
    public static class HelloTiles
    {
        public const string MOSS = "hello_moss";

        public static void Initialize()
        {
            if (AssetManager.top_tiles.has(MOSS)) return;

            // clone(newId, sourceId) copies every field AND registers the copy.
            TopTileType moss = AssetManager.top_tiles.clone(MOSS, "grass_low");

            moss.color_hex = "#2E6B3F";
            moss.can_be_set_on_fire = true;
            moss.burnable = true;
            moss.burn_rate = 6;
            moss.walk_multiplier = 0.8f;             // slows units down
            moss.can_be_removed_with_sickle = true;
            moss.can_be_removed_with_spade = true;
            moss.strength = 2;

            // grass_low is a biome tile, so the clone says is_biome = true. The library links
            // biome_id to its BiomeAsset during startup, before your mod existed: link yours.
            moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);

            // The variations in GameResources/tiles/hello_moss/ are loaded at startup too.
            Sprite[] variations = SpriteTextureLoader.getSpriteList("tiles/" + moss.id);
            if (variations.Length > 0)
            {
                moss.sprites = new TileSprites();
                foreach (Sprite variation in variations)
                {
                    moss.sprites.addVariation(variation, moss.id);
                }
            }
        }
    }
}
```

> [!WARNING] Um tile de bioma precisa do bioma ligado
> Clonar um tile de grama copia `is_biome = true` e o `biome_id`, mas o `BiomeAsset` em si só é buscado em `TopTileLibrary.linkAssets()`, uma vez, enquanto o jogo carrega. Pule essa linha e tudo funciona até um animal nascer no seu tile: o nome da espécie ganha o sufixo do bioma, o bioma é `null`, e o spawn morre com `NullReferenceException` em `Subspecies.generateName()` :wbfacepalm:.
>
> As imagens têm o mesmo problema. `TopTileLibrary` transforma os PNGs em `tiles/<id>/` em `sprites` na inicialização, então sem o último bloco o tile pinta normal e depois o renderizador do mapa lança em `WorldTilemap.getVariation()` para cada tile dele na tela.


## Os campos que valem a pena conhecer

### Que tipo de coisa ele é

| Campo | O que faz |
| --- | --- |
| `layer_type` | `TileLayerType.Ground` ou a camada de topo. Decide a qual biblioteca pertence |
| `ground`, `liquid`, `ocean`, `lava` | Flags de categoria ampla pelas quais todo o jogo se ramifica |
| `grass`, `sand`, `rocks`, `mountains`, `summit`, `soil` | Flags de família de terreno |
| `road`, `wall`, `farm_field` | Flags de estrutura. A IA das cidades lê esses campos |
| `block`, `block_height` | Se impede a passagem e a altura visual desenhada |
| `is_biome`, `can_be_biome`, `biome_id` | Vincula o ladrilho a um bioma |
| `biome_tags`, `has_biome_tags` | Quais biomas farão este ladrilho se espalhar |

### Como ele se comporta

Comece aqui se o seu ladrilho é uma ideia de gameplay e não só uma cor nova.

| Campo | O que faz |
| --- | --- |
| `walk_multiplier` | Velocidade de caminhada. `1.0` é normal, valores menores desaceleram |
| `damage_units`, `damage` | Se pisar nele causa dano e em que quantidade |
| `damaged_when_walked` | O próprio ladrilho sofre desgaste quando pisado |
| `step_action`, `step_action_chance` | Seu código executado a cada passo sobre ele |
| `unit_death_action` | Seu código quando algo morre sobre ele |
| `can_be_set_on_fire`, `burnable`, `burn_rate` | Comportamento com fogo |
| `can_be_frozen`, `forever_frozen`, `fast_freeze`, `remove_on_freeze` | Comportamento com congelamento |
| `remove_on_heat`, `terraform_after_fire` | O que o calor e o fogo deixam para trás |
| `explodable`, `explodable_delayed`, `explodable_timed`, `explode_range` | Detonação |
| `strength` | Resistência ao dano. Mods de muros leem isso para durabilidade |
| `cost` | Custo de navegação (Pathfinding) |

### O que o jogador pode fazer nele

| Campo | O que faz |
| --- | --- |
| `can_be_removed_with_spade` / `_bucket` / `_demolish` / `_pickaxe` / `_axe` / `_sickle` | Qual ferramenta limpa o ladrilho |
| `allowed_to_be_finger_copied` | Se a ferramenta de cópia do dedo pode copiá-lo |
| `can_build_on`, `can_be_farm` | Se uma cidade pode construir ou cultivar sobre ele |
| `only_allowed_to_build_with_tag` | Restringe construções a uma tag específica |

### Transições

| Campo | O que faz |
| --- | --- |
| `increase_to_id` / `decrease_to_id` | No que se transforma ao crescer ou erodir |
| `freeze_to_id` | No que se transforma quando congelado |
| `fill_to_ocean`, `can_be_filled_with_ocean` | No que se transforma sob a água |
| `lava_increase` / `lava_decrease` / `lava_level` | Cadeia de progressão exclusiva da lava |

### Aparência

| Campo | O que faz |
| --- | --- |
| `color_hex` | Cor do minimapa e tonalidade |
| `edge_color_hex` | Cor do contorno no encontro com outro ladrilho |
| `render_z`, `draw_layer_name` | Ordem de desenho. `setDrawLayer(...)` é o método auxiliar |
| `force_edge_variation`, `force_edge_variation_frame` | Trava a variação do sprite de borda |

## Executando código quando algo pisa nele

```csharp
moss.step_action_chance = 0.05f;   // 5% dos passos
moss.step_action = (WorldTile pTile, Actor pActor) =>
{
    if (pActor == null || !pActor.isAlive()) return false;

    pActor.restoreStamina(2);
    return true;
};
```

As mesmas regras de qualquer outra ação neste guia: faça verificação de nulidade primeiro, retorne `false` se não fez nada, e lembre-se de que isso roda para cada criatura andando sobre cada ladrilho deste tipo.

## Seus próprios gráficos

Os ladrilhos são uma exceção: **não existe nenhum campo de caminho**. O jogo procura uma pasta batizada exatamente com o **id** do ladrilho e carrega tudo dentro dela como variações.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── tiles/
        └── hello_moss/          <- o id exato do ladrilho
            ├── moss_1.png
            ├── moss_2.png
            └── moss_3.png
```

Não há nada para configurar no código. Nomeie a pasta com o id registrado e o ladrilho a encontrará sozinho.

Múltiplos arquivos nessa pasta tornam-se variações aleatórias, o que evita que uma área do seu ladrilho pareça um papel de parede repetitivo. Um arquivo só também funciona perfeitamente. Ladrilhos de chão e de topo carregam ambos dessa forma.

`color_hex` é independente e continua indispensável: é o que desenha o minimapa e o que colore o ladrilho quando o jogo precisa colori-lo.

## Modificando ladrilhos em tempo de execução

```csharp
WorldTile tile = World.world.GetTile(x, y);
if (tile == null) return;

tile.setTopTileType(AssetManager.top_tiles.get("hello_moss"));   // muda a camada de topo
tile.setTileType(AssetManager.tiles.get("sand"));                // muda o chão
tile.setTileTypes("sand", null);                                 // chão, e limpa o topo
```

Todos os três métodos são públicos. Modificar um ladrilho marca seu chunk como alterado e o renderizador atualiza a tela por conta própria.

### Lendo o que está no ladrilho

```csharp
if (tile.main_type != null && tile.main_type.ground) { }
if (tile.top_type != null && tile.top_type.road) { }
if (tile.isOnFire()) { }
if (tile.hasBuilding()) { }
```

Tanto `main_type` quanto `top_type` podem ser `null`. Verifique antes de manipulá-los. Essa é a causa número um de crashes em qualquer mod que percorre o mapa :PES2_F:.

## Opções de terraformação

Um `TerraformOptions` em `AssetManager.terraform` é um pacote de limpeza de ladrilho, usado por poderes divinos e projéteis:

| Campo | O que faz |
| --- | --- |
| `remove_top_tile`, `remove_roads`, `remove_borders` | Remove estruturas |
| `remove_trees_fully`, `remove_burned`, `remove_ruins` | Limpa restos |
| `destroy_buildings`, `make_ruins` | O que acontece com as construções |
| `remove_water`, `remove_fire`, `remove_frozen`, `remove_tornado` | Remove estados |
| `add_burned`, `add_heat`, `flash` | Adiciona estados |

Um `ProjectileAsset` indica um deles em `terraform_option` junto com um `terraform_range`, que é como uma flecha explosiva limpa o chão onde aterrissa.

## Biomas

Um `BiomeAsset` em `AssetManager.biome_library` decide quais ladrilhos surgem em cada lugar. Um ladrilho é integrado a um bioma via `setBiome("biome_forest")` ou incluindo as tags certas em `biome_tags`. Clonar um bioma existente e trocar os ids de ladrilhos é um caminho muito mais rápido do que construir um do zero, e a regra do clone registrar sozinho continua válida.

> [!TIP] Os ladrilhos de topo são onde a mágica dos mods acontece
> Praticamente tudo o que os modders realmente constroem (muros, estradas, plantações, corrupção se espalhando por um continente) é um ladrilho de topo com um `step_action` e um código decidindo onde posicioná-lo. Novos tipos de chão são mais raros, mais difíceis de integrar com harmonia e interagem com o gerador de mundos de maneiras que você não pediu :PES3_Yikes:.
