---
title: Leis do mundo
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbworldlaws:
order: 176
---

# Leis do mundo :wbworldlaws:

Leis do mundo (world law) são os interruptores na janela **Leis do mundo**: "velhice", "fome", "monstros pacíficos". Elas são o recurso mais amigável ao jogador que você pode adicionar, permitindo ligar e desligar o comportamento (behaviour) do seu mod sem tocar em nenhum arquivo de configuração.

Elas também são um dos assets mais fáceis de todo o jogo. Quatro campos.

## Adicionar um interruptor

```csharp Mods/HelloBox/Code/HelloLaws.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloLaws
    {
        public const string CHAOS = "world_law_hello_chaos";

        public static void Initialize()
        {
            if (AssetManager.world_laws_library.has(CHAOS)) return;

            AssetManager.world_laws_library.add(new WorldLawAsset
            {
                id = CHAOS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "units",                                  // em qual aba aparece
                icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
                default_state = false                                // começa desativada
            });
        }
    }
}
```

Adicione `HelloLaws.Initialize();` ao `Main.cs` e o interruptor estará no jogo. É genuinamente só isso :poggers:.

| Campo | Significado |
| --- | --- |
| `id` | O nome da sua lei. Também a chave de tradução |
| `group_id` | A aba onde ela fica. A lista completa está em **As abas** abaixo, ou crie a sua própria |
| `icon_path` | O ícone, as mesmas regras de caminho de todo o resto |
| `default_state` | `true` = ativado em mundos novos, `false` = desativado |
| `can_turn_off` | Padrão `true`. Defina `false` para uma lei que só pode ser ligada |

## Lendo o interruptor no seu código

Este é o propósito principal. Um interruptor que ninguém lê é decoração. Em qualquer lugar do seu mod:

```csharp
WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);

if (law != null && law.isEnabled())
{
    // o jogador quer caos, dê a ele caos
}
```

Ou o jeito rápido, direto do mundo, sem buscar o asset:

```csharp
bool chaos = World.world.world_laws.isEnabled(HelloLaws.CHAOS);
```

`isEnabled(string)` retorna `false` para um id que não conhece em vez de lançar exceção, então um erro de digitação aparece como "desligado" em vez de um crash. Gentil, e também terrível, porque nada avisa você :PES5_Hmmmm:. `World.world.world_laws` é `internal`, então isso compila contra o assembly publicizado com o qual o NML constrói o seu mod (veja a nota em **[Efeitos de status](#/nml/status-effects)**). A rota pelo asset acima funciona em qualquer lugar.

Um exemplo prático: gerando suas brasas apenas enquanto a lei estiver ativa:

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
    bool chaos = law != null && law.isEnabled();

    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

    if (chaos)
    {
        foreach (WorldTile neighbour in pTile.neighboursAll)
        {
            World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
        }
    }
    return true;
};
```

## Reagindo no momento em que é alternado

Se ativar a lei deve *fazer* algo imediatamente, em vez de apenas ser lida depois:

```csharp
new WorldLawAsset
{
    id = CHAOS,
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
    default_state = false,
    on_state_enabled = (PlayerOptionData pOption) => { /* roda quando o jogador a ativa */ }
};
```

## As abas

A janela é dividida em abas, e `group_id` escolhe uma. Estes são todos os grupos vanilla, na ordem em que a janela os desenha:

`harmony` · `diplomacy` · `civilizations` · `units` · `mobs` · `spawn` · `nature` · `trees` · `plants` · `fungi` · `biomes` · `weather` · `disasters` · `other`

### Uma aba própria

Substitua o `Initialize()` do primeiro exemplo pela versão abaixo, e adicione `GROUP` ao lado de `CHAOS`.

Um grupo é um `WorldLawGroupAsset` em `AssetManager.world_law_groups`. É o mesmo `BaseCategoryAsset` pequeno que as abas de traços usam, veja **[Grupos de traços e abas](#/nml/trait-groups)**:

| Campo | O que faz |
| --- | --- |
| `id` | O que o `group_id` de uma lei aponta |
| `name` | A **chave de localização** do título da aba. Não o título em si |
| `color` | String hex. Tinge o título da aba |

```csharp Mods/HelloBox/Code/HelloLaws.cs
public const string GROUP = "hello_laws";

public static void Initialize()
{
    // o grupo primeiro: as leis abaixo apontam para ele
    if (!AssetManager.world_law_groups.has(GROUP))
    {
        AssetManager.world_law_groups.add(new WorldLawGroupAsset
        {
            id = GROUP,
            name = "world_laws_tab_" + GROUP,   // a chave de localização, não o texto
            color = "#FF9A3C"
        });
    }

    if (AssetManager.world_laws_library.has(CHAOS)) return;

    AssetManager.world_laws_library.add(new WorldLawAsset
    {
        id = CHAOS,
        needs_to_be_explored = false,
        group_id = GROUP,
        icon_path = "ui/Icons/worldrules/icon_hello_law",
        default_state = false
    });
}
```

Nenhum trabalho de UI: a janela de Leis do Mundo constrói uma aba por entrada em `world_law_groups.list`, depois coloca cada lei na aba que seu `group_id` nomeia. Ela faz isso uma vez, quando a janela é criada pela primeira vez, e o seu mod já carregou bem antes de o jogador chegar lá. Sua aba fica no final, depois de `other`.

> [!WARNING] Um `group_id` que não existe quebra a janela inteira
> A janela procura a aba com um índice de dicionário simples. Uma lei apontando para um grupo que ninguém registrou lança `KeyNotFoundException` enquanto a janela está sendo construída, e toda lei registrada depois dela, sua e de outros mods, nunca chega na janela. Registre o grupo antes das leis, e escreva o nome igual nas duas vezes :PESgn_ToughLuck:.

## O texto

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one.",
  "world_laws_tab_hello_laws": "HelloBox"
}
```

> [!WARNING] Leis do mundo usam `_title`, não o id puro
> Quase todos os outros assets usam o id puro como chave do nome. As leis do mundo pedem `<id>_title`. Erre isso e o interruptor aparece sem nenhum rótulo :PESgn_Really:.

> [!TIP] Uma lei ganha de uma configuração
> As configurações do mod ficam num menu que o jogador abre uma vez. Uma lei do mundo está ali no jogo, junto das vanilla, por mundo, e pode ser trocada no meio da partida. Se o seu mod tem um comportamento de liga/desliga, o lugar dele é aqui :wbblessed:.
