---
title: Complôs
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbrebellion:
order: 180
---

# Complôs :wbrebellion:

Um **complô** (plot) é um plano que um governante inicia, financia e desenvolve ao longo do tempo: uma rebelião, uma nova guerra (war), uma aliança. Quando a barra de progresso se enche, seu código é executado. Tudo o que acontece entre "alguém poderia" e "alguém fez" fica a cargo da própria mecânica do jogo, e é por isso que vale a pena usá-la: o jogador vê seu plano na lista de complôs, com autor, progresso e estandarte, de forma totalmente nativa.

## Adicionando um

```csharp Mods/HelloBox/Code/HelloPlots.cs
namespace HelloBox
{
    public static class HelloPlots
    {
        public const string FESTIVAL = "hello_ember_festival";

        public static void Initialize()
        {
            if (AssetManager.plots_library.has(FESTIVAL)) return;

            PlotAsset festival = new PlotAsset
            {
                id = FESTIVAL,
                path_icon = "ui/Icons/iconHelloDrop",
                group_id = "culture",
                is_basic_plot = true,            // any leader may try it, no religion needed
                pot_rate = 2,                    // weight against the other plots
                min_level = 1,
                money_cost = 10,
                progress_needed = 40f,
                can_be_done_by_king = true,
                can_be_done_by_leader = true,
                needs_to_be_explored = false,

                // called with no null check: a plot without it crashes the first time anyone looks at it
                check_is_possible = (Actor pActor) => pActor.hasCity() && !pActor.city.isInDanger(),
                check_should_continue = (Actor pActor) => pActor.hasCity(),

                // runs once, when the progress bar is full
                action = (Actor pActor) =>
                {
                    City city = pActor.city;
                    if (city == null) return false;

                    foreach (Actor unit in city.units)
                    {
                        if (unit != null && unit.isAlive()) unit.changeHappiness(HelloPolitics.WARM);
                    }

                    WorldTile tile = pActor.current_tile;
                    if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                    return true;
                }
            };

            AssetManager.plots_library.add(festival);

            // linkAssets() sorted the basic plots into their own list at startup,
            // and that list is the only one leaders pick from
            AssetManager.plots_library.basic_plots.Add(festival);
        }
    }
}
```

Um líder com dez moedas, uma cidade e tempo livre agora pode organizar um festival de brasas. Quando ele termina, todos na cidade ficam mais felizes com o evento de felicidade de **[Reinos e facções](#/nml/kingdoms)**, e brasas caem sobre o organizador, porque este ainda é o HelloBox.

> [!WARNING] `check_is_possible` não é opcional
> `PlotAsset.checkIsPossible()` o chama sem nenhuma verificação de nulos toda vez que um líder avalia seu complô. Se você omitir isso, o primeiro líder que o examinar causará um `NullReferenceException`. Se não tiver condições especiais, retorne simplesmente `true`. Sim, mesmo assim.

> [!WARNING] A lista básica é construída na inicialização
> Líderes escolhem apenas a partir de `plots_library.basic_plots` (além dos ritos de sua religião (religion)). `linkAssets()` preenche essa lista com todos os complôs marcados como `is_basic_plot` uma única vez, antes do carregamento do seu mod. Apenas definir a flag não basta: adicione o complô manualmente à lista.

## Os campos

### Quem pode iniciar

| Campo | O que faz |
| --- | --- |
| `can_be_done_by_king` / `can_be_done_by_leader` / `can_be_done_by_clan_member` | Funções permitidas. Se nenhuma estiver ativa, ninguém poderá iniciar |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | Requisitos mínimos do autor |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | Limiares de atributos (stats). O padrão é 2 |
| `money_cost` | Custo de ouro ao iniciar, a menos que o complô seja forçado pelo jogador |
| `requires_diplomacy` / `requires_rebellion` | Disponível apenas enquanto essa lei mundial estiver ativa |
| `check_is_possible` | Sua condição de início. Obrigatória |

### Como é executado

| Campo | O que faz |
| --- | --- |
| `progress_needed` | Quanto trabalho é necessário até disparar |
| `check_should_continue` | Verificado periodicamente. `false` cancela o complô |
| `action` | Executa quando a barra enche. Retorne `true` se tiver sucesso |
| `post_action` | Executa após uma `action` bem-sucedida |
| `try_to_start_advanced` | Substitui o início padrão para complôs com alvo: rebeliões vanilla definem `target_kingdom` aqui |
| `check_target_actor`, `check_target_city`, `check_target_kingdom`... | Verifica se o alvo do complô ainda está vivo |

### Aparência e grupo

| Campo | O que faz |
| --- | --- |
| `path_icon` | Seu ícone na lista de complôs e no estandarte |
| `group_id` | A categoria: `diplomacy`, `culture`, `rites_wrathful`, `rites_summoning`, `rites_merciful` |
| `pot_rate` | Peso em relação a outros complôs possíveis |
| `is_basic_plot` | Qualquer líder pode tentar. Caso contrário, só ocorre como rito religioso, veja **[Traços de religião](#/nml/religion-traits)** |

## Os textos

Um complô possui três chaves de texto: seu nome, a linha que descreve o complô em andamento e a descrição geral. `$initiator_actor$`, `$initiator_city$`, `$initiator_kingdom$` e `$target_kingdom$` são preenchidos automaticamente na segunda linha.

```json Mods/HelloBox/Locales/en.json
{
  "plot_hello_ember_festival": "Ember Festival",
  "plot_hello_ember_festival_info": "$initiator_actor$ is organising an ember festival in $initiator_city$.",
  "plot_hello_ember_festival_info_base": "A city celebrates, and something falls from the sky."
}
```

> [!TIP] Testando ao forçar o complô
> Esperar que um líder escolha seu complô por conta própria pode demorar. Selecione uma unidade e inicie o complô manualmente na janela dela: a unidade ainda precisa ter um dos papéis permitidos e `check_can_be_forced` (opcional) decide se o botão se acende, mas um complô forçado não custa nada. É a forma mais rápida de ver sua `action` rodando :PES2_EvilPlan:.
