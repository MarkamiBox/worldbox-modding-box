---
title: Desastres
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbmeteorite:
order: 184
---

# Desastres :wbmeteorite:

Um desastre é algo que o mundo causa a si mesmo: um tornado, uma onda de calor, um meteorito. O jogo sorteia desastres ao longo do tempo, então, diferente de um poder divino, **ninguém precisa clicar em nada**. Você define as condições, o mundo cuida do resto.

## Adicionando um desastre

```csharp Mods/HelloBox/Code/HelloDisasters.cs
namespace HelloBox
{
    public static class HelloDisasters
    {
        public const string EMBER_STORM = "hello_ember_storm";
        public const string EMBER_STORM_LOG = "disaster_hello_ember_storm";

        public static void Initialize()
        {
            if (AssetManager.disasters.has(EMBER_STORM)) return;

            // The line in the world log. world_log below is the id of this asset, not a text key.
            if (!AssetManager.world_log_library.has(EMBER_STORM_LOG))
            {
                WorldLogAsset log = AssetManager.world_log_library.clone(EMBER_STORM_LOG, "$basic_disaster$");
                log.locale_id = "worldlog_disaster_hello_ember_storm";
                log.path_icon = "ui/Icons/iconHelloDisaster";
            }

            DisasterAsset emberStorm = new DisasterAsset
            {
                id = EMBER_STORM,
                rate = 4,                      // weight: how often it is picked vs other disasters
                chance = 0.5f,                 // and then a coin flip on top
                min_world_population = 100,    // don't ruin an empty world
                min_world_cities = 1,
                world_log = EMBER_STORM_LOG,
                type = DisasterType.Nature
            };

            emberStorm.action = (DisasterAsset pAsset) =>
            {
                WorldTile first = null;

                // 40 embers on random tiles. tiles_list is every tile in the world.
                for (int i = 0; i < 40; i++)
                {
                    WorldTile tile = World.world.tiles_list[Randy.randomInt(0, World.world.tiles_list.Length)];
                    if (tile == null) continue;
                    if (first == null) first = tile;
                    World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                }

                // one line in the log, pointing at where it started
                if (first != null) WorldLog.logDisaster(pAsset, first);
            };

            AssetManager.disasters.add(emberStorm);
        }
    }
}
```

Registre-o no `Main.cs` (veja **[O mod completo](#/nml/all-together)**), carregue um mundo com pelo menos uma cidade e cem unidades, e aguarde. Eventualmente o céu começará a despejar brasas por conta própria :wbfireskull:.

### Os campos

`rate` e `chance` são os dois que você mais vai ajustar. O aviso no fim da página explica o porquê.

| Campo | O que faz |
| --- | --- |
| `rate` | Peso: frequência com que é escolhido em relação a outros desastres |
| `chance` | Uma segunda rolagem após ser selecionado |
| `min_world_population` / `min_world_cities` | Condições antes que possa acontecer |
| `type` | `DisasterType.Nature`, `Other`, … |
| `world_log` | O ID de um `WorldLogAsset`: a linha no registro do mundo. **Não** é uma chave de texto, veja abaixo |
| `action` | Seu código. Este é o desastre |
| `spawn_asset_unit` + `units_min`/`units_max` | Atalho para "gerar N desta criatura" |
| `max_existing_units` | Não gerar mais se já existir essa quantidade |

## Gerando criaturas sem código

```csharp
DisasterAsset wolves = new DisasterAsset
{
    id = "hello_wolf_year",
    rate = 2,
    chance = 0.3f,
    min_world_cities = 2,
    world_log = "disaster_hello_wolf_year",
    type = DisasterType.Other,

    // spawn 4 to 8 wolves, but only if the world has fewer than 40
    spawn_asset_unit = "wolf",
    units_min = 4,
    units_max = 8,
    max_existing_units = 40
};

// the game calls action without checking it: point it at the vanilla spawner
wolves.action = AssetManager.disasters.simpleUnitAssetSpawnUsingIslands;

AssetManager.disasters.add(wolves);
```

"Sem código" é quase verdade. Um desastre **sempre** precisa de uma `action`, porque o sorteio do jogo a chama sem verificar se é nulo: deixe vazio e na primeira vez que o seu for escolhido, `NullReferenceException`. Os desastres de criaturas padrão apontam para `simpleUnitAssetSpawnUsingIslands`, que lê `spawn_asset_unit`, `units_min`, `units_max` e `max_existing_units`, e grava a linha do registro para você. O seu pode fazer o mesmo.

## A linha no registro do mundo

`world_log` não é o texto. É o **ID de um `WorldLogAsset`** na `AssetManager.world_log_library`, e esse asset aponta para a chave de texto. Se usar um ID que não existe, no momento em que o desastre tentar registrar o evento, `WorldLog.logDisaster()` construirá a mensagem sobre `null` e lançará uma `NullReferenceException` :wbfacepalm:.

Os desastres padrão clonam um modelo comum, `$basic_disaster$`, que já possui a cor de aviso e o grupo "disasters". O `HelloDisasters` acima faz o mesmo:

```csharp
WorldLogAsset log = AssetManager.world_log_library.clone("disaster_hello_ember_storm", "$basic_disaster$");
log.locale_id = "worldlog_disaster_hello_ember_storm";   // the text key
log.path_icon = "ui/Icons/iconHelloDisaster";            // the icon next to the line
```

Depois, algo precisa gravar a linha no registro. Os geradores padrão chamam `WorldLog.logDisaster(pAsset, tile)` sozinhos. Uma `action` personalizada não faz isso automaticamente, então a sua a chama com o bloco onde a tempestade começou: esse é o ponto para onde o botão "ir até lá" do registro pula.

| Campo de `WorldLogAsset` | O que faz |
| --- | --- |
| `locale_id` | A chave de texto. Usa o próprio ID se estiver vazio |
| `path_icon` | O ícone no início da linha |
| `color` | A cor da linha. O modelo usa a cor de aviso |
| `group` | A qual filtro do registro do mundo pertence |
| `random_ids` | Escolhe um entre vários textos: `<locale_id>_1`, `_2`... |

O exemplo dos lobos precisa das mesmas duas coisas: seu próprio asset de log clonado sob `disaster_hello_wolf_year` e o texto `worldlog_disaster_hello_wolf_year`. O gerador padrão cuidará de gravar a linha.

```json Mods/HelloBox/Locales/en.json
{
  "worldlog_disaster_hello_ember_storm": "Embers are falling from the sky!"
}
```

Escreva como uma manchete de jornal, não como uma descrição técnica. "Brasas caem do céu" ganha de "um evento relacionado a brasas começou". É a frase que o jogador lerá no registro do mundo.

> [!WARNING] Teste com os números elevados
> `rate = 4, chance = 0.5f` significa que você pode esperar vinte minutos para ver seu próprio desastre. Durante o desenvolvimento, aumente bastante o `rate` e zere os requisitos mínimos; depois restaure antes de publicar :PES2_EvilPlan:.
