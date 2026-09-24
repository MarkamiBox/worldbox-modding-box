---
title: Traços religiosos
group: Conteúdo do jogo
subgroup: Traços e genética
icon: :wbpray:
order: 108
---

# Traços religiosos :wbpray:

Uma **religião** (religion) pertence a cidades e reinos (kingdom), propaga-se por conversão, escreve livros (book) e pode realizar **ritos**: conspirações capazes de alterar o mundo que seus seguidores tentam executar por conta própria. Um traço (trait) religioso é uma crença individual.

| | |
| --- | --- |
| Biblioteca (library) | `AssetManager.religion_traits` |
| Classe | `ReligionTrait` |
| Grupos | `AssetManager.religion_trait_groups`, classe `ReligionTraitGroupAsset` |
| Dono em tempo de execução | `Religion`, em `World.world.religions` |
| Prefixo de localização | `religion_trait_` |
| Pasta de ícones padrão | `ui/Icons/religion_traits/` |

> [!WARNING] Atributos (stats) de religião não chegam às unidades
> Este é o único sistema de traços cujos `base_stats` nunca aterrissam em um `Actor`. `Actor.updateStats()` mescla subespécies (subspecies), clãs, idiomas e culturas (culture). **Religião não faz parte dessa lista.**
>
> Portanto, um traço religioso altera o mundo através daquilo que *faz* (um rito, uma transformação, um hook de ação), e não por meio de números. Escrever `base_stats["damage"] = 10` nele é uma operação inerte, e é a tarde desperdiçada mais clássica desta página :PES4_BigSad:.

## Registrando um

```csharp Mods/HelloBox/Code/HelloReligion.cs
namespace HelloBox
{
    public static class HelloReligion
    {
        public const string ASHES = "hello_rite_of_ashes";

        public static void Initialize()
        {
            if (AssetManager.religion_traits.has(ASHES)) return;

            ReligionTrait trait = new ReligionTrait
            {
                id = ASHES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "destruction",
                path_icon = "ui/Icons/iconHelloReligion",
                plot_id = "summon_meteor_rain",      // o rito que os fiéis podem tentar
                priority = -1,
                spawn_random_trait_allowed = false,
                rarity = Rarity.R2_Epic
            };

            AssetManager.religion_traits.add(trait);
        }
    }
}
```


> [!WARNING] `spawn_random_trait_allowed` é lido apenas uma vez, na inicialização
> Novas religiões sorteiam seus traços iniciais de um grupo que `BaseTraitLibrary.linkAssets()` constrói durante o carregamento do jogo, antes do seu mod existir. Definir a flag no seu traço não muda nada por si só: seu traço nunca estará nesse grupo e nunca aparecerá por acaso em um fundador. Adicione-o você mesmo, com o peso que o jogo vanilla usa:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.religion_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` é `protected`, portanto compila contra o assembly publicizado com o qual o NML já compila seu mod. `spawn_random_rate` tem o valor padrão de `5`: aumente-o para que o traço apareça com mais frequência.

## Ritos: o campo `plot_id`

Um traço religioso provido de um `plot_id` torna-se um **rito**. A religião reúne seus ritos em `possible_rites`, e líderes e sacerdotes tentam realizá-los por conta própria assim que as condições da conspiração são atendidas. Você escreve a crença, os sacerdotes fazem o resto :wbpray:.

```csharp
trait.plot_id = "summon_meteor_rain";
```

O identificador aponta para `AssetManager.plots_library`. Os ritos do jogo base reutilizam conspirações existentes - `summon_earthquake`, `summon_meteor_rain`, `summon_thunderstorm`, `summon_stormfront`, `summon_hellstorm`, `clan_ascension` - e você pode fazer o mesmo ou registrar seu próprio `PlotAsset` antes.

A conspiração define quem pode iniciá-la e o quão difícil ela é:

| Campo de PlotAsset | O que faz |
| --- | --- |
| `can_be_done_by_king`, `can_be_done_by_leader`, `can_be_done_by_clan_member` | Quem tem permissão para iniciar |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | Requisitos de atributos |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | Requisitos de nível e renome |
| `progress_needed`, `money_cost` | Duração e custo monetário |
| `pot_rate`, `rarity` | Com que frequência a IA o escolhe |
| `check_is_possible`, `check_should_continue` | Suas condições personalizadas |

## Transformações: o campo `transformation_biome_id`

O outro campo exclusivo dos traços de religião. Ele marca o traço como uma transformação e nomeia o bioma (biome) que a fé espalha pelo território:

```csharp
trait.transformation_biome_id = "biome_desert";
```

O jogo base usa isso para `sands_of_ruin` (deserto), `shadowroot` (corrompido), `echo_of_the_void` (singularidade), `infernal_rot` (infernal) e `cosmic_radiation` (ermo). Uma religião com um desses traços reescreve lentamente o terreno onde seus fiéis vivem, o que representa o maior impacto visual que um único traço pode produzir no jogo.

## Fazendo o traço *agir* de verdade

Como os atributos não surtem efeito, os hooks de ação são a maneira pela qual um traço religioso justifica sua existência. São exatamente os mesmos que qualquer outro traço possui:

```csharp
// a cada poucos segundos, em cada fiel
trait.special_effect_interval = 5f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreMana(2);
    return true;
};

// quando um fiel morre
trait.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };
```

Um traço religioso também pode conceder uma magia ou uma decisão (decision), o que normalmente é uma escolha bem melhor do que um temporizador fixo:

```csharp
trait.addSpell("hello_bolt");           // veja Projéteis, magias e efeitos
trait.addDecision("burn_tumors");       // uma decisão de IA que os fiéis podem tomar
```

## Os grupos vanilla

`harmony` · `creation` · `destruction` · `restoration` · `necromancy` · `protection` · `the_void` · `transformation` · `fate` · `special`

Para criar sua própria aba: veja **[Grupos de traços e abas](#/nml/trait-groups)**, com `AssetManager.religion_trait_groups` e `ReligionTraitGroupAsset`.

## Os textos

```json Mods/HelloBox/Locales/en.json
{
  "religion_trait_hello_rite_of_ashes": "Rite of Ashes",
  "religion_trait_hello_rite_of_ashes_info": "Somebody always volunteers."
}
```

## Distribuindo o traço

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addReligionTrait(HelloReligion.ASHES);
```

```csharp
foreach (Religion religion in World.world.religions)
{
    if (religion == null || religion.isRekt()) continue;

    religion.addTrait(HelloReligion.ASHES, pRemoveOpposites: true);
}
```

Um objeto `Religion` também expõe `cities`, `kingdoms`, `books` e `possible_rites`, que costuma ser exatamente o que você desejará ler quando seu código precisar acompanhar os planos de uma fé.

> [!TIP] Os ritos são o grande propósito
> Uma religião que apenas altera números é invisível. Uma religião cujos sacerdotes invocam tempestades de meteoros de tempos em tempos é o que faz os jogadores tirarem prints e compartilharem. Dedique seus esforços em `plot_id` :aPES_Flames:.
