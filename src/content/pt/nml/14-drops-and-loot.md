---
title: Gotas e coisas que caem
group: Conteúdo do jogo
subgroup: Itens e equipamentos
icon: :wbloot:
order: 126
---

# Gotas e coisas que caem :wbloot:

Uma **gota** (drop) é um pequeno objeto que cai do céu, pousa em um ladrilho e faz algo: chuva, sangue, sementes, fogo, ácido, moedas. Elas são a forma mais barata em todo o jogo de fazer algo *acontecer* no mapa, e vêm acompanhadas de animação e som próprios de graça.

## Registrar uma

Gotas vivem em `AssetManager.drops`. Aqui está uma gota que pousa e coloca fogo no ladrilho:

```csharp Mods/HelloBox/Code/HelloDrops.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public static class HelloDrops
    {
        public static void Initialize()
        {
            DropAsset ember = new DropAsset
            {
                id = "hello_ember",
                path_texture = "drops/hello_ember",   // sprite in GameResources/drops/
                type = DropType.DropMagic,
                animated = true,
                animation_speed = 0.03f,
                default_scale = 0.1f,
                falling_speed = 3.2f,
                sound_drop = "event:/SFX/DROPS/DropBlessing"
            };

            // o que acontece no instante em que toca o chão
            ember.action_landed = (WorldTile pTile, string pDropID) =>
            {
                if (pTile == null) return;
                World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
            };

            AssetManager.drops.add(ember);
        }
    }
}
```

Depois em `Main.cs`, adicione a linha: `HelloDrops.Initialize();`

### O que os campos fazem

| Campo | Significado |
| --- | --- |
| `id` | O nome que você usa em todos os outros lugares |
| `path_texture` | O sprite, as mesmas regras de caminho de todo o resto |
| `type` | `DropType.DropMagic`, `DropGeneric`, … Decide parte do tratamento interno do jogo |
| `animated` + `animation_speed` | Reproduz a lista de sprites como uma animação |
| `default_scale` | O tamanho. `0.1f` é o habitual para gotas pequenas |
| `falling_speed` | A velocidade com que cai |
| `sound_drop` / `sound_launch` | Eventos de som FMOD |
| `action_landed` | **O interessante**: seu código roda quando ela pousa |
| `action_launch` | Roda quando ela é arremessada |

## Seu próprio sprite

`path_texture` é carregado exatamente como escrito, de dentro de `GameResources/`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── drops/
        └── hello_ember/
            ├── hello_ember_0.png
            └── hello_ember_1.png
```

```csharp
ember.path_texture = "drops/hello_ember";   // a folder
```

Drops são carregados como **lista de sprites**: o jogo lê cada PNG *dentro* dessa pasta, e é isso que faz `animated` funcionar. Um drop parado continua sendo uma pasta, com um frame dentro. Um `drops/hello_ember.png` solto volta como lista vazia, e o drop cai invisível.

## Fazendo gotas caírem

Duas formas, ambas em `World.world.drop_manager`:

```csharp
// direto para baixo em um ladrilho: (tile, dropId, height, ?, ownerId)
World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);

// arremessada em arco, como uma explosão lançando destroços
World.world.drop_manager.spawnParabolicDrop(tile, "hello_ember", 0f, 0.1f, 5f, 0.5f, 4f, 0.15f);
```

`spawn` é o que você quer em 90% dos casos. O `15f` é a altura de onde cai: maior significa que leva mais tempo para aterrissar.

## Um uso real: faça seu poder divino chover brasas

Se você concluiu a página de **[Poderes divinos](#/nml/god-powers)**, esta é a recompensa: um poder, um ladrilho inteiro em chamas.

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    // uma no meio, uma em cada ladrilho vizinho
    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);
    foreach (WorldTile neighbour in pTile.neighboursAll)
    {
        World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
    }
    return true;
};
```

> [!TIP] Gotas são o efeito especial dos preguiçosos
> Antes de escrever um sistema de partículas, pergunte-se se uma gota com um sprite e uma `action_landed` resolve o problema. Geralmente resolve, em dez linhas, com som incluso :PESgn_Noice:.
