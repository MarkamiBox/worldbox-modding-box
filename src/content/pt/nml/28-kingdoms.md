---
title: Reinos e facções
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbkingdoms:
order: 178
---

# Reinos e facções :wbkingdoms:

Toda unidade em WorldBox pertence a um reino. Não apenas as civilizadas: lobos pertencem a um reino de lobos, bandidos a uma facção de bandidos, e uma galinha neutra pertence a um reino neutro. Um `KingdomAsset` é o **tipo** de facção, não um reino individual existente no mapa.

Essa é a distinção fundamental:

| | |
| --- | --- |
| `KingdomAsset` em `AssetManager.kingdoms` | O modelo. "O que define um reino orc" |
| `Kingdom` em `World.world.kingdoms` | Um reino de fato no mundo em execução, com nome, cor e cidades |

Você registra o primeiro. O jogo cria o segundo.

## Clonando um modelo

Assim como os atores, os reinos contam com identificadores `$TEMPLATE$` criados exatamente para isso:

| Modelo | Finalidade |
| --- | --- |
| `$TEMPLATE_CIV$` | Uma facção civilizada |
| `$TEMPLATE_CIV_NEW$` | O estilo mais recente de civilizações animais |
| `$TEMPLATE_NOMAD$` | O estágio nômade antes do assentamento |
| `$TEMPLATE_MOB$` | Uma facção de monstros hostis |
| `$TEMPLATE_MOB_GOOD$` / `$TEMPLATE_MOB_VERY_GOOD$` | Hostil a certas coisas, amigável com civilizações |
| `$TEMPLATE_ANIMAL$` | Animais selvagens |
| `$TEMPLATE_ANIMAL_NEUTRAL$` / `$TEMPLATE_ANIMAL_PEACEFUL$` | Animais pacíficos que não iniciam brigas |

```csharp Mods/HelloBox/Code/HelloKingdoms.cs
namespace HelloBox
{
    public static class HelloKingdoms
    {
        public const string CIV = "hello_sprites";
        public const string WILD = "hello_nomads_sprites";

        public static void Initialize()
        {
            if (AssetManager.kingdoms.has(CIV)) return;

            // A facção civilizada assentada.
            KingdomAsset civ = AssetManager.kingdoms.clone(CIV, "$TEMPLATE_CIV$");
            civ.addTag("civ");
            civ.addFriendlyTag("civ");
            civ.addEnemyTag("orc");
            civ.setIcon("ui/Icons/iconHelloCiv");

            // O estágio selvagem, antes de fundarem uma cidade.
            KingdomAsset wild = AssetManager.kingdoms.clone(WILD, "$TEMPLATE_NOMAD$");
            wild.addTag("hello_sprite");
            wild.addFriendlyTag("hello_sprite");
            wild.setIcon("ui/Icons/iconHelloWild");
        }
    }
}
```

`$TEMPLATE_NOMAD$` já define `nomads = true`, `civ = false` e `mobs = true` por conta própria. Vale a pena enfatizar isso porque muitos erram aqui: **`civ`, `nomads`, `mobs` e companhia são campos `bool`, não tags.** `wild.nomads = true` é um campo real. `wild.addTag("nomads")` é uma tag que absolutamente nada no jogo lê, falhando em silêncio absoluto :aPES_Liar:.

Em seguida, aponte seu ator para eles, que é o passo que conecta os dois lados:

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.kingdom_id_wild = HelloKingdoms.WILD;
asset.kingdom_id_civilization = HelloKingdoms.CIV;
```

Sem isso, sua criatura vai surgir no reino utilizado pelo modelo doador do clone (geralmente humanos), o que causa uma confusão danada.

## Os campos

### Que tipo de facção ela é

| Campo | O que faz |
| --- | --- |
| `civ` | Funda cidades, trava guerras, tem um líder |
| `nomads` | Estágio errante antes do assentamento |
| `nature` | Vida selvagem |
| `mobs` | Monstros hostis |
| `neutral` | Não ataca ninguém sem provocação |
| `abandoned`, `concept` | Facções técnicas de controle interno, não povos reais |
| `brain` | A metafacção controlada pela IA |
| `group_main`, `group_miniciv`, `group_minicivs_cool`, `group_creeps` | Em qual gaveta as listas internas do jogo a colocam |

### Como ela se comporta

| Campo | O que faz |
| --- | --- |
| `always_attack_each_other` | Dois reinos deste tipo são permanentemente hostis entre si |
| `units_always_looking_for_enemies` | Unidades caçam inimigos sem parar |
| `count_as_danger` | Se outras facções a tratam como ameaça. `true` por padrão |
| `friendship_for_everyone` | Amigável com tudo e todos |
| `force_look_all_chunks` | Unidades escaneiam o mapa inteiro, não só os arredores. Pesado |
| `building_attractor_id` | Tipo de construção que atrai essas criaturas |

### Tags: quem luta contra quem

Esta é a parte central, e não se trata de uma estatística numérica, mas sim de três conjuntos de strings:

```csharp
kingdom.addTag("civ");             // o que eu sou
kingdom.addFriendlyTag("neutral"); // quem eu estimo
kingdom.addEnemyTag("orc");        // quem eu odeio
```

Dois reinos comparam suas tags para determinar sua postura diplomática padrão. Uma facção sem tags não gosta de ninguém, não odeia ninguém e não faz nada de interessante.

### Visual

| Campo | O que faz |
| --- | --- |
| `path_icon`, `show_icon` | Ícone da facção. `setIcon(path)` configura ambos |
| `default_kingdom_color`, `default_civ_color_index` | A cor inicial |
| `color_building` | Tonalidade aplicada às construções da facção |

## O restante da estrutura de uma facção

Um asset de reino isolado é apenas um rótulo. Estas são as outras bibliotecas com as quais uma facção completa se relaciona:

| Elemento | Biblioteca | Utilização |
| --- | --- | --- |
| Estandartes | `AssetManager.kingdom_banners_library` | A bandeira gerada |
| Cores | `AssetManager.kingdom_colors_library` | A paleta atribuída aos reinos |
| Traços de reino | `AssetManager.kingdoms_traits` | Políticas, principalmente impostos. Veja **[Traços de reino](#/nml/kingdom-traits)** |
| Trabalhos de reino | `AssetManager.job_kingdom` | No que a IA da facção está trabalhando |
| Tarefas de reino | `AssetManager.tasks_kingdom` | A árvore de comportamento por trás desses trabalhos |
| Tipos de guerra | `AssetManager.war_types_library` | Os tipos de guerra que podem ser declarados |
| Arquitetura | `AssetManager.architecture_library` | A aparência das construções |
| Ordens de construção | `AssetManager.city_build_orders` | O que uma nova cidade constrói e em que ordem |
| Geradores de nomes | `AssetManager.name_generator`, `AssetManager.name_sets` | Como reinos, cidades e cidadãos são batizados |

Reutilize os elementos vanilla até ter um ótimo motivo para o contrário. Configurar `banner_id = "human"` no seu ator dá a você um gerador de bandeiras funcional de graça.

## Manipulando reinos em tempo de execução

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    // kingdom.name, kingdom.cities, kingdom.king, kingdom.getPopulationTotal()
}
```

`isRekt()` é um método de extensão que significa "este objeto foi destruído, mas algo ainda guarda uma referência para ele". Verifique isso em todo laço sobre reinos, cidades, exércitos ou unidades. É o que separa um mod que funciona de um mod que trava uma vez por hora :aPES2_Sweat:.

## Personalidades

Um rei e um líder de cidade recebem uma **personalidade**: um rótulo e alguns atributos `personality_*` que direcionam se o reino joga de forma agressiva ou diplomática. Registrar uma leva três linhas. Fazer com que alguém a *tenha* é o desafio: `Actor.updateStats()` escolhe um dos quatro IDs padrão por nome a cada atualização de atributos.

```csharp Mods/HelloBox/Code/HelloPersonality.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPersonality
    {
        public const string RESTLESS = "hello_restless";

        public static void Initialize()
        {
            if (AssetManager.personalities.has(RESTLESS)) return;

            PersonalityAsset restless = new PersonalityAsset { id = RESTLESS, icon = "iconHelloSwift" };
            AssetManager.personalities.add(restless);
            restless.base_stats["personality_aggression"] = 0.4f;
            restless.base_stats["personality_diplomatic"] = 0.05f;
            restless.base_stats["personality_administration"] = 0.05f;
        }

        // updateStats() picks a ruler's personality by name, out of four, every time stats change.
        // A new one is never picked unless you swap it in afterwards.
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Personality
        {
            public static void Postfix(Actor __instance)
            {
                PersonalityAsset current = __instance.s_personality;
                if (current == null) return;                               // not a ruler
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                PersonalityAsset mine = AssetManager.personalities.get(RESTLESS);
                if (mine == null || current == mine) return;

                // take the vanilla one's numbers back out, put yours in
                __instance.stats.mergeStats(current.base_stats, -1f);
                __instance.stats.mergeStats(mine.base_stats);
                __instance.s_personality = mine;
            }
        }
    }
}
```

O postfix roda após cada atualização de atributos para manter a troca. Ele subtrai os valores da personalidade padrão antes de somar os seus, evitando que o governante acumule ambos. `s_personality` e `mergeStats()` são membros `internal`: compila contra a biblioteca **publicized** do NML.

## Opinião, lealdade e felicidade

Três pequenas bibliotecas definem o clima político, e todas as três são listas de pequenas funções de cálculo:

| Biblioteca | Chamada para | Retorna |
| --- | --- | --- |
| `AssetManager.opinion_library` | Cada par de reinos | Pontos de opinião de um sobre o outro |
| `AssetManager.loyalty_library` | Cada cidade | Pontos de lealdade ao reino |
| `AssetManager.happiness_library` | Eventos sofridos por uma unidade | Uma alteração fixa de felicidade |

```csharp Mods/HelloBox/Code/HelloPolitics.cs
namespace HelloBox
{
    public static class HelloPolitics
    {
        public const string WARM = "hello_warm_embers";            // happiness event
        public const string DISTRUST = "hello_opinion_swift_king";  // kingdom to kingdom
        public const string EMBER_AGE = "hello_loyalty_ember_age";  // city to kingdom

        public static void Initialize()
        {
            if (!AssetManager.happiness_library.has(WARM))
            {
                HappinessAsset warm = new HappinessAsset
                {
                    id = WARM,
                    value = 10,
                    path_icon = "ui/Icons/iconHelloDrop",
                    dialogs_amount = 2     // happiness_dialog_hello_warm_embers_0 and _1
                };
                AssetManager.happiness_library.add(warm);

                // post_init() numbers every entry at startup, and the unit's happiness
                // history stores that number, not the id. Yours would show up as entry 0.
                warm.index = AssetManager.happiness_library.list.IndexOf(warm);
            }

            // Opinion and loyalty are summed from the whole list every time: add() is enough.
            if (!AssetManager.opinion_library.has(DISTRUST))
            {
                AssetManager.opinion_library.add(new OpinionAsset
                {
                    id = DISTRUST,
                    translation_key = DISTRUST,
                    calc = (Kingdom pMain, Kingdom pTarget) =>
                    {
                        if (pTarget == null || !pTarget.hasKing()) return 0;
                        return pTarget.king.hasTrait(HelloTraits.SWIFT) ? -10 : 0;
                    }
                });
            }

            if (!AssetManager.loyalty_library.has(EMBER_AGE))
            {
                AssetManager.loyalty_library.add(new LoyaltyAsset
                {
                    id = EMBER_AGE,
                    translation_key = EMBER_AGE,
                    calc = (City pCity) =>
                    {
                        WorldAgeAsset age = AssetManager.era_library.get(HelloAges.EMBERS);
                        if (age == null) return 0;
                        return World.world.era_manager.isCurrentAge(age) ? 5 : 0;
                    }
                });
            }
        }
    }
}
```

Opinião e lealdade são somadas da lista inteira a cada avaliação, logo o `add()` é suficiente, e cada uma aparece como uma linha própria no detalhamento do jogo usando `translation_key` (ou `translation_key_negative` quando o valor for negativo). Eventos de felicidade disparam quando seu código chama `actor.changeHappiness("hello_warm_embers")`, como faz o festival em **[Tramas](#/nml/plots)**.

> [!WARNING] Entradas de felicidade são numeradas na inicialização
> O histórico de felicidade de uma unidade armazena o *número* da entrada, não seu ID, e `HappinessLibrary.post_init()` distribui esses números uma única vez. A sua ficaria em 0 e apareceria como a primeira entrada padrão. Defina o `index` manualmente.

## Estandartes para outros sistemas

Reinos não são os únicos com estandarte: culturas, religiões, clãs, idiomas, subespécies e famílias possuem suas próprias bibliotecas de componentes (`AssetManager.culture_banners_library` e afins). Cada uma tem um asset `main` com listas de caminhos, e uma nova cultura sorteia um índice.

```csharp Mods/HelloBox/Code/HelloBanners.cs
namespace HelloBox
{
    public static class HelloBanners
    {
        public const string CULTURE_ICON = "cultures/hello_culture_element";

        public static void Initialize()
        {
            BannerAsset culture = AssetManager.culture_banners_library.main;
            if (culture == null || culture.icons.Contains(CULTURE_ICON)) return;

            // A culture stores the index it rolled, not the path. Append, never insert,
            // or every existing culture's banner shifts by one.
            culture.icons.Add(CULTURE_ICON);
        }
    }
}
```

Os caminhos são carregados individualmente quando o estandarte é desenhado, logo não há nada a recarregar. Um índice além do fim da lista recai para 0, permitindo que um save feito com seu mod abra normalmente sem ele. Respeite as proporções originais no **[UnityExplorer](#/toolbox/unity-explorer)**.

```json Mods/HelloBox/Locales/en.json
{
  "personality_hello_restless": "Restless",
  "happiness_hello_warm_embers": "Warmed by embers",
  "happiness_dialog_hello_warm_embers_0": "The embers are nice this time of year.",
  "happiness_dialog_hello_warm_embers_1": "Nothing like a little fire from the sky.",
  "hello_opinion_swift_king": "Their king is too fast to trust",
  "hello_loyalty_ember_age": "Loves the Age of Embers"
}
```

> [!TIP] Você provavelmente não precisa de um novo asset de reino
> Uma nova criatura precisa. Um novo *comportamento* não: a maioria dos mods de facções funciona melhor como traços de reino, uma cultura ou um patch Harmony na diplomacia. Adicione um asset de reino apenas quando sua criatura precisar de seu próprio espaço no mundo.
