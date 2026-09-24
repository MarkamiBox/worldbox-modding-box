---
title: Traços de clã
group: Conteúdo do jogo
subgroup: Traços e genética
icon: :wbclanroses:
order: 110
---

# Traços de clã :wbclanroses:

Um **clã** é uma linhagem sanguínea: uma família que cresceu o bastante para se tornar uma entidade própria, com estandarte, cor característica e reputação exclusiva. Um traço (trait) de clã é o que corre nas veias dessa linhagem.

Os traços de clã são o que há de mais próximo a um superpoder hereditário no jogo, e representam o único sistema de traços com uma **divisão macho / fêmea** nativa.

| | |
| --- | --- |
| Biblioteca (library) | `AssetManager.clan_traits` |
| Classe | `ClanTrait` |
| Grupos | `AssetManager.clan_trait_groups`, classe `ClanTraitGroupAsset` |
| Dono em tempo de execução | `Clan`, em `World.world.clans` |
| Prefixo de localização | `clan_trait_` |
| Pasta de ícones padrão | `ui/Icons/clan_traits/` |

## Registrando um

```csharp Mods/HelloBox/Code/HelloClan.cs
namespace HelloBox
{
    public static class HelloClan
    {
        public const string OLD_BLOOD = "hello_old_blood";

        public static void Initialize()
        {
            if (AssetManager.clan_traits.has(OLD_BLOOD)) return;

            ClanTrait trait = new ClanTrait
            {
                id = OLD_BLOOD,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloClan",
                rarity = Rarity.R1_Rare
            };

            AssetManager.clan_traits.add(trait);

            trait.base_stats["multiplier_health"] = 0.15f;
            trait.base_stats["armor"] = 4;
            trait.base_stats.addTag("immunity_cold");
        }
    }
}
```

Os `base_stats` de clã se fundem em cada membro do clã. Logo, ao contrário da religião (religion), este é um sistema de atributos (stats) real. Veja a ordem de fusão na **[Referência de atributos](#/nml/stats)**.

## A divisão macho / fêmea

Os dois campos exclusivos que nenhuma outra classe de traços possui:

```csharp
trait.base_stats["health"] = 20;           // todos os membros
trait.base_stats_male["damage"] = 6;       // apenas machos
trait.base_stats_female["intelligence"] = 4;   // apenas fêmeas
```

`Actor.updateStats()` mescla `clan.base_stats` e, em seguida, `clan.base_stats_male` **ou** `clan.base_stats_female` dependendo do sexo da unidade. Ambos os blocos adicionais já existem desde o início sem depender de alocação em `add()`, permitindo escrita a qualquer momento.

## Decisões: o que um clã *faz*

Os traços de clã do jogo base apoiam-se em decisões (decision) mais do que em ações, já que um clã é fundamentalmente uma estrutura social:

```csharp
trait.addDecision("banish_unruly_clan_members");
trait.addOpposite("hello_new_blood");
```

Uma decisão é uma escolha de IA em `AssetManager.decisions_library`. Dois traços de clã vanilla, `blood_pact` e `deathbound`, são o mesmo traço com decisões distintas e são declarados opostos mútuos. É um padrão excelente para se replicar: dois traços, um único eixo, mutuamente exclusivos.

## Hooks de combate e efeitos

```csharp
// a cada golpe desferido por um membro do clã
trait.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null) return false;
    return true;
};

// por temporizador, em cada membro do clã
trait.special_effect_interval = 2f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreHealth(1);
    return true;
};
```

Sempre proteja referências contra nulos e retorne `false` quando não tiver executado nenhuma ação. Esses hooks rodam para cada membro de cada clã que possua o traço.

## Bloqueado por conquista

Vários traços de clã vanilla são recompensas em vez de opções padrão:

```csharp
trait.setUnlockedWithAchievement("achievementSegregator");
```

Um traço bloqueado ainda existe e funciona perfeitamente; o jogador apenas não pode selecioná-lo no editor até completar a conquista (achievement). Note que `BaseTraitLibrary` também define automaticamente `rarity = R3_Legendary` para qualquer traço bloqueado dessa maneira, para a sua recompensa parecer à altura :gold_star:.

## Os grupos vanilla

`spirit` · `mind` · `body` · `chaos` · `harmony` · `fate` · `special`

Para criar sua própria aba: veja **[Grupos de traços e abas](#/nml/trait-groups)**, com `AssetManager.clan_trait_groups` e `ClanTraitGroupAsset`.

## Os textos

```json Mods/HelloBox/Locales/en.json
{
  "clan_trait_hello_old_blood": "Old Blood",
  "clan_trait_hello_old_blood_info": "Their great-grandparents were also difficult to kill."
}
```

## Distribuindo o traço

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addClanTrait(HelloClan.OLD_BLOOD);
```

```csharp
foreach (Clan clan in World.world.clans)
{
    if (clan == null || clan.isRekt()) continue;

    clan.addTrait(HelloClan.OLD_BLOOD, pRemoveOpposites: true);
}
```

O clã de uma unidade está em `actor.clan`, e `actor.hasClan()` informa se ela pertence a algum; muitas unidades nunca chegam a integrar um clã.

> [!TIP] Clãs são pequenos, pode ser generoso
> Uma cultura (culture) abrange um continente; um clã abrange uma família, e `limit_clan_members` limita seu tamanho máximo. Um traço de clã pode ser muito mais forte que um traço cultural para o mesmo impacto no equilíbrio do mundo, tornando os clãs o lugar ideal para mecânicas dramáticas :PES5_Menace:.

## Novos clãs sorteando um traço por conta própria

Além de concedê-lo manualmente, um traço de clã pode definir `spawn_random_trait_allowed` para ser sorteado quando um novo clã se forma, da mesma forma que uma cultura sorteia seus traços iniciais. A mesma armadilha de todas as outras páginas de traços:

> [!WARNING] `spawn_random_trait_allowed` é lido apenas uma vez, na inicialização
> Novos clãs sorteiam seus traços iniciais de um grupo que `BaseTraitLibrary.linkAssets()` constrói durante o carregamento do jogo, antes do seu mod existir. Definir a flag no seu traço não muda nada por si só: seu traço nunca estará nesse grupo e nunca aparecerá por acaso em um novo clã. Adicione-o você mesmo, com o peso que o jogo vanilla usa:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.clan_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` é `protected`, portanto compila contra o assembly publicizado com o qual o NML já compila seu mod. `spawn_random_rate` tem o valor padrão de `5`: aumente-o para que o traço apareça com mais frequência.
