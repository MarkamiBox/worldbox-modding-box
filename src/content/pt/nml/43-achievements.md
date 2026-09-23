---
title: Conquistas
group: Conteúdo do jogo
subgroup: Toques finais e conquistas
icon: :gold_star:
order: 220
---

# Conquistas :gold_star:

Sim, um mod pode adicionar conquistas (achievements). Elas aparecem na janela de conquistas do jogo, surgem na tela como as oficiais e são salvas no progresso do jogador. Leia o aviso no final antes de publicar uma.

```csharp Mods/HelloBox/Code/HelloAchievements.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAchievements
    {
        public const string SWARM = "achievement_hello_wisp_swarm";
        private const string WATCH = "hello_achievement_watch";

        public static void Initialize()
        {
            if (AssetManager.achievements.has(SWARM)) return;

            Achievement swarm = new Achievement
            {
                id = SWARM,
                group = "creatures",
                icon = "ui/Icons/iconHelloWisp",
                locale_key = SWARM,      // post_init() derives it at startup; yours stays null without this
                action = (object pData) => CountWisps() >= 10
            };

            AssetManager.achievements.add(swarm);

            // the achievements window reads each group's list, filled by linkAssets() at startup
            AssetManager.achievement_groups.get(swarm.group).achievements_list.Add(swarm);

            // nothing in the game knows when to check yours: look every 30 seconds
            WorldBehaviourAsset watch = new WorldBehaviourAsset
            {
                id = WATCH,
                interval = 30f,
                interval_random = 0f,
                action = () =>
                {
                    if (!swarm.isUnlocked()) swarm.check();
                }
            };
            AssetManager.world_behaviours.add(watch);
            watch.manager = new WorldBehaviour(watch);
        }

        private static int CountWisps()
        {
            int count = 0;
            List<Actor> units = World.world.units.getSimpleList();
            for (int i = 0; i < units.Count; i++)
            {
                Actor unit = units[i];
                if (unit != null && unit.isAlive() && unit.asset.id == "hello_wisp") count++;
            }
            return count;
        }
    }
}
```

Dez fogos-fátuos vivos ao mesmo tempo, e a conquista será desbloqueada.

## O que o jogo não faz automaticamente por você

- **A chave de texto.** `post_init()` preenche `locale_key` a partir do ID para cada conquista vanilla. A sua permanece `null` e a janela não exibe nada, então defina-a explicitamente.
- **A janela.** A janela de conquistas lista a `achievements_list` de cada grupo, preenchida por `linkAssets()` na inicialização. Adicione a sua ao grupo, ou ela será desbloqueada sem que ninguém possa vê-la.
- **A verificação.** Nada no jogo sabe *quando* avaliar sua conquista: o jogo vanilla chama `check()` exatamente nos locais onde suas condições podem mudar. O HelloBox usa um **[comportamento do mundo](#/nml/world-ages)** que verifica a cada trinta segundos, o que é ideal para "existirem dez criaturas de um tipo". Para um evento, chame `check()` diretamente onde a ação acontecer.

| Campo | O que faz |
| --- | --- |
| `group` | A seção da janela: `creation`, `worlds`, `civilizations`, `creatures`, `destruction`, `nature`, `experiments`, `collection`, `exploration`, `forbidden`, `miscellaneous` |
| `icon` | Sua imagem, como caminho completo de sprite |
| `action` | Sua condição. `check()` desbloqueia quando retorna `true`, e `check()` sem `action` desbloqueia imediatamente |
| `hidden` | Mostra uma linha de "oculto" em vez da descrição até ser desbloqueada |
| `locale_key` | A chave de texto. A descrição usa `<locale_key>_description` |

```json Mods/HelloBox/Locales/en.json
{
  "achievement_hello_wisp_swarm": "Wisp Swarm",
  "achievement_hello_wisp_swarm_description": "Have ten wisps alive at the same time."
}
```

> [!WARNING] Elas vão para o progresso real do jogador
> O desbloqueio executa o código nativo do jogo: ele escreve o ID no arquivo de progresso do jogador e solicita à Steam o desbloqueio de uma conquista com esse ID. A Steam não possui conquistas para o seu ID, portanto nada acontecerá no lado da Steam, mas a chamada é feita e o log registrará `Unlocking in Steam: <id>`. O jogo também envia o ID com seus eventos de telemetria. E enquanto a lei do "mundo amaldiçoado" estiver ativa, nada se desbloqueia, incluindo as suas.

Nada disso quebra o jogo. No entanto, continua sendo o arquivo de progresso real do jogador: mantenha uma quantidade moderada e nunca desbloqueie nada que o jogador não tenha feito de verdade :PESgn_ReadRules:.
