---
title: Leis do mundo
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbworldlaws:
order: 176
---

# Leis do mundo :wbworldlaws:

Leis do mundo são os interruptores na janela **Leis do mundo**: "velhice", "fome", "monstros pacíficos". Elas são o recurso mais amigável ao jogador que você pode adicionar, permitindo ligar e desligar o comportamento do seu mod sem tocar em nenhum arquivo de configuração.

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
| `group_id` | A aba onde ela fica: `units`, `civilizations`, `spawn`, `diplomacy`, `nature`, … |
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

## O texto

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one."
}
```

> [!WARNING] Leis do mundo usam `_title`, não o id puro
> Quase todos os outros assets usam o id puro como chave do nome. As leis do mundo pedem `<id>_title`. Erre isso e o interruptor aparece sem nenhum rótulo :PESgn_Really:.

> [!TIP] Uma lei ganha de uma configuração
> As configurações do mod ficam num menu que o jogador abre uma vez. Uma lei do mundo está ali no jogo, junto das vanilla, por mundo, e pode ser trocada no meio da partida. Se o seu mod tem um comportamento de liga/desliga, o lugar dele é aqui :wbblessed:.
