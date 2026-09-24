---
title: Atores personalizados
group: Conteúdo do jogo
subgroup: Atores, construções e IA
icon: :wbhuman:
order: 140
---

# Atores personalizados :wbhuman:

> [!NOTE] Eles são chamados de atores, não raças
> O jogo chama cada criatura viva de **ator** (actor): um humano, um lobo, um dragão, um zumbi, um caranguejo. Todos se originam da mesma classe, `ActorAsset`, e vivem em `AssetManager.actor_library`. "Raça" é o termo antigo. O único lugar onde ele sobrevive é em uma propriedade `race` marcada como `[Obsolete("use .original_actor_asset instead")]`, mantida apenas para carregar salvamentos antiquíssimos. Escreva `actor` em todos os lugares.

Uma nova criatura é o mod que todo mundo sonha em fazer e quase ninguém termina, pois um `ActorAsset` carrega animações, texturas, sons, taxonomia, dieta, flags de IA, genoma, cultura (culture) e atributos (stats). Errar um único desses itens (item) resulta em uma unidade invisível parada estática no meio do oceano :PES4_Invisible:.

A boa notícia: o jogo base também não monta criaturas do zero. Isto é literalmente como o vanilla cria um elfo:

```csharp
clone("elf", "$civ_advanced_unit$");
```

Portanto, fazemos exatamente a mesma coisa.

## Os modelos

Identificadores envoltos em `$` são **modelos** (templates): atores semiacabados que o jogo mantém apenas para que outros atores sejam clonados a partir deles. Eles são o ponto de partida ideal para uma criatura inédita, pois trazem toda a fiação interna sem empurrar os sprites de um humano.

| Modelo | Clonar para |
| --- | --- |
| `$basic_unit$` | O ser vivo mínimo indispensável |
| `$animal$` | Um animal selvagem |
| `$mob$` | Um monstro hostil |
| `$civ_unit$` | Uma criatura de civilização básica |
| `$civ_advanced_unit$` | Uma criatura civilizada completa: cidades, reinos (kingdom), cultura, religião (religion). O que humanos, elfos, orcs e anões usam |

Você também pode clonar um ator acabado - `human`, `wolf`, `zombie` - e esse é o caminho mais tranquilo para a sua primeira criatura, pois os sprites do doador acompanham a cópia e sua unidade já fica visível imediatamente.

## Um ator individual

```csharp Mods/HelloBox/Code/HelloActors.cs
namespace HelloBox
{
    public static class HelloActors
    {
        public const string SPRITE = "hello_sprite";

        public static void Initialize()
        {
            if (AssetManager.actor_library.has(SPRITE)) return;

            // clone() copies every field, gives the copy the new id, and registers it.
            // Do NOT call add() afterwards: that registers it a second time and the
            // library logs "duplicate asset - overwriting...".
            ActorAsset sprite = AssetManager.actor_library.clone(SPRITE, "human");

            sprite.name_locale = "Sprite";
            sprite.civ = true;                       // founds cities, joins kingdoms, goes to war
            sprite.can_have_subspecies = true;
            sprite.actor_size = ActorSize.S13_Human;
            sprite.color_hex = "#7FE7C4";
            sprite.icon = "iconHelloSprite";

            // visible immediately: no need to discover them first
            sprite.needs_to_be_explored = false;

            // Taxonomy: what the knowledge window shows.
            sprite.name_taxonomic_genus = "spiritus";
            sprite.name_taxonomic_species = "minor";

            // Stats. clone() already ran add(), so base_stats exists here.
            sprite.base_stats["health"] = 80;
            sprite.base_stats["damage"] = 12;
            sprite.base_stats["speed"] = 32f;

            // see the warning below: the shadow is not loaded for you
            sprite.texture_asset.loadShadow();
        }
    }
}
```
> [!WARNING] Carregue a sombra você mesmo, ou o jogo reclama de cada ator
> `ActorAssetLibrary` percorre a lista na inicialização e chama `loadShadow()` em cada ator, que lê o sprite em `shadows/<shadow_texture>` e o mede. Isso aconteceu antes do seu mod registrar qualquer coisa, então a sombra do seu ator fica em `(0.00, 0.00)` e o jogo registra um erro de asset para ela, três vezes, uma para o adulto, o ovo e o filhote :wbfacepalm:.
>
> `loadShadow()` é `internal`, então isso precisa de um `Assembly-CSharp.dll` **publicizado** como o resto do guia. Se você não tiver um, use `asset.shadow = false;`: sem sombra, mas também sem erro.

> [!WARNING] `clone()` já registra
> `AssetManager.<library>.clone(newId, sourceId)` chama `add()` internamente. Todas as bibliotecas (library) funcionam assim. Chamar `add()` você mesmo depois é um registro duplicado: a biblioteca remove a primeira cópia, registra um erro e adiciona de novo. Inofensivo, mas é ruído no seu log que dificulta achar os erros de verdade, e é a primeira coisa que um revisor vai notar.
>
> O lado bom disso: **depois de um clone, `base_stats` já existe**, então a regra "atributos depois do add" de **[Traços personalizados](#/nml/custom-traits)** já está cumprida.

## Vários atores de uma vez

A maior parte dos mods de criaturas não para em uma criatura só. Três fadas significam três assets, e no instante em que você copia e cola o bloco acima três vezes, passa a ter três lugares para consertar cada bug.

Reúna as diferenças em uma tabela e o código em um laço:

```csharp Mods/HelloBox/Code/HelloActors.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloActors
    {
        // Everything that actually differs between the three, in one place.
        private struct Def
        {
            public string Id;
            public string From;      // which actor or template to clone
            public string Color;
            public string Icon;
            public float Health;
            public float Damage;
            public float Speed;
            public bool OwnArt;      // true: sprites come from GameResources/actors/species/other/<id>/
        }

        private static readonly Def[] Defs = new Def[]
        {
            new Def { Id = "hello_sprite", From = "human", Color = "#7FE7C4", Icon = "iconHelloSprite", Health = 80,  Damage = 12, Speed = 32f },
            new Def { Id = "hello_wisp",   From = "wolf",  Color = "#C49BFF", Icon = "iconHelloWisp",   Health = 60,  Damage = 20, Speed = 40f, OwnArt = true },
            new Def { Id = "hello_golem",  From = "wolf",  Color = "#8C8C8C", Icon = "iconHelloGolem",  Health = 240, Damage = 30, Speed = 18f, OwnArt = true },
        };

        public static void Initialize()
        {
            for (int i = 0; i < Defs.Length; i++)
            {
                Register(Defs[i]);
            }
        }

        private static void Register(Def pDef)
        {
            if (AssetManager.actor_library.has(pDef.Id)) return;
            if (!AssetManager.actor_library.has(pDef.From)) return;   // donor missing, skip quietly

            ActorAsset asset = AssetManager.actor_library.clone(pDef.Id, pDef.From);

            asset.civ = !pDef.OwnArt;                // a civ needs heads, male and female sheets
            asset.can_have_subspecies = true;
            asset.actor_size = ActorSize.S13_Human;
            asset.color_hex = pDef.Color;
            asset.icon = pDef.Icon;

            if (pDef.OwnArt)
            {
                // clone() copied the donor's texture paths, so point this one at its own folder.
                // The folder holds main/ and child/, one PNG per frame: walk_0..3, swim_0..3.
                asset.texture_asset = new ActorTextureSubAsset("actors/species/other/" + pDef.Id + "/", false);
                asset.has_advanced_textures = false;
                asset.animation_walk = ActorAnimationSequences.walk_0_3;
                asset.animation_swim = ActorAnimationSequences.swim_0_3;
                asset.animation_idle = ActorAnimationSequences.walk_0;
            }

            // visible immediately: no need to discover them first
            asset.needs_to_be_explored = false;

            asset.base_stats["health"] = pDef.Health;
            asset.base_stats["damage"] = pDef.Damage;
            asset.base_stats["speed"] = pDef.Speed;

            // The library loads every actor's shadow during its own startup, which was before
            // your mod existed. Without this the game logs "Shadow size is too small (0.00, 0.00)".
            asset.texture_asset.loadShadow();
        }
    }
}
```

Adicionar uma quarta criatura agora custa apenas uma linha na tabela. Quase todos os mods de criaturas publicados utilizam essa estrutura, e vale a pena adotá-la a partir da segunda criatura em diante :PESgn_ThisTBH:.

## Os campos que definem o que sua criatura *é*

No primeiro dia só três importam: `civ`, `actor_size` e `name_locale`. O resto pode esperar até a sua criatura estar visível e andando.

| Campo | O que faz |
| --- | --- |
| `civ` | Criatura de civilização: cidades, reinos, profissões, guerra (war). `false` = animal |
| `auto_civ` | Se o jogo inicia a civilização delas de forma autônoma |
| `default_animal` | Marca como fauna silvestre para as checagens internas |
| `unit_other` | Nem civ nem animal: monstro hostil, constructo, especial |
| `actor_size` | `S0_Bug` … `S13_Human` … `S17_Dragon`. Comanda a renderização e cálculos de combate |
| `name_locale` | Chave de exibição do nome |
| `icon` | Ícone exibido em listas e botões de invocação |
| `color_hex` | Coloração aplicada a unidades tingíveis |
| `can_have_subspecies` | Se mutam em subespécies (subspecies) ao longo das gerações |
| `has_ai_system` | Se executam o sistema geral de comportamento (behaviour) |
| `flying` / `hovering` | Se decolam do chão e a que altitude |
| `force_ocean_creature` / `force_land_creature` | Trava com rigor o terreno onde habitam |
| `can_attack_buildings` | Se atacam e destroem estruturas |
| `has_soul`, `can_receive_traits`, `can_be_cloned` | O que os poderes divinos (GodPower) têm permissão de fazer com elas |
| `kingdom_id_wild` / `kingdom_id_civilization` | Reino onde surgem (selvagens ou estabelecidas) |
| `texture_atlas` | `UnitTextureAtlasID.Units`, `Boats`, `Zombies` … atlas onde residem os sprites |
| `animation_walk` / `animation_idle` / `animation_swim` | Sequências de quadros com seus respectivos campos `_speed` |
| `sound_idle`, `sound_spawn`, `sound_death`, `sound_attack`, `sound_hit` | Caminhos de eventos de áudio FMOD |
| `name_taxonomic_*` | Reino, filo, classe, ordem, família, gênero e espécie para a enciclopédia |
| `collective_term` | Termo coletivo ("uma **alcateia** de lobos") |
| `allowed_status_tiers` | Quais níveis de efeitos de status podem atingi-las |
| `production` | O que suas cidades fabricam |
| `zombie_id_internal`, `skeleton_id`, `mush_id`, `tumor_id` | No que se transformam ao morrer |

## Conectando uma criatura de civilização ao mundo

Um ator `civ` não está pronto apenas com a definição de seus atributos. Estas são as partes que o jogo base preenche para qualquer raça jogável, e omiti-las explica por que uma civilização customizada "não faz rigorosamente nada":

```csharp
asset.kingdom_id_wild = "nomads_human";          // antes de se fixarem
asset.kingdom_id_civilization = "human";         // seu tipo de reino
asset.banner_id = "human";                       // gerador de estandartes
asset.architecture_id = "human";                 // visual de suas construções
asset.build_order_template_id = "build_order_advanced";
asset.name_template_sets = new string[] { "human_default_set" };   // regras de nomes
asset.civ_base_cities = 3;
asset.family_limit = 20;

asset.addPreferredColors("teal", "lime");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// Genoma: distribuição de atributos hereditários para cruzamento e mutação.
asset.addGenome(
    ("health", 70f), ("stamina", 200f), ("lifespan", 500f),
    ("damage", 10f), ("speed", 20f), ("offspring", 2f),
    ("intelligence", 6f), ("diplomacy", 5f), ("warfare", 2f), ("stewardship", 2f));

// Traços iniciais por sistema de traços.
asset.addCultureTrait("bow_lovers");
asset.addReligionTrait("rite_of_change");
asset.addSubspeciesTrait("long_lifespan");
asset.addClanTrait("blood_pact");
asset.addLanguageTrait("melodic");
asset.addKingdomTrait("tax_rate_local_low");
```

Reaproveite os `banner_id` e `architecture_id` do vanilla até que você tenha arte própria. Uma criatura sem arquitetura não constrói nada.

## Gerando um ator

```csharp
Actor actor = World.world.units.spawnNewUnit("hello_sprite", tile, pSpawnSound: true, pAdultAge: true);
```

`spawnNewUnit` é um método público que aceita argumentos opcionais para som de invocação, milagre, altura de geração, uma subespécie específica e atribuição de itens iniciais.

Disponibilize um botão de poder divino para ela e você terá um invocador completo. Veja **[Abas e botões de poder](#/nml/power-buttons)**.

## Subespécies

Subespécies são as variantes em que um ator se diversifica ao longo das gerações. Elas possuem sua própria biblioteca de traços (trait), separada dos traços dos atores, e sua própria lista de grupos:

```csharp
SubspeciesTrait scales = new SubspeciesTrait
{
    id = "hello_scales",
    group_id = "body",
    spawn_random_trait_allowed = true
};
AssetManager.subspecies_traits.add(scales);
scales.base_stats["armor"] = 5;

// faça seu ator começar com ele
asset.addSubspeciesTrait("hello_scales");
```

Traços de subespécie também podem incorporar **elementos visuais**: `sprite_path`, `animation_walk`, `skin_citizen_male`, `skin_warrior` e afins, permitindo que uma subespécie aparente ser diferente de sua espécie original sem a necessidade de criar um ator separado. Veja **[Traços de subespécie](#/nml/subspecies-traits)**.

## Seu próprio ícone

Antes do trabalho (job) pesado de animação adiante, a parte tranquila: o ícone nas listas e botões de invocação.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSprites.png
```

```csharp
sprite.icon = "iconHelloSprites";
```

A arte do **corpo** da criatura é um assunto completamente diferente e encerra esta seção.

## Sprites são a parte difícil

Tudo o que foi visto acima se resume a uma página de código. O verdadeiro trabalho está na arte, e é aqui que a maioria dos mods de criaturas morre em silêncio: uma criatura exige um conjunto completo de animações, no atlas correto, na escala exata e com os pivôs perfeitamente alinhados. Há duas saídas sinceras:

1. **Manter os sprites do doador.** Uma criatura que reaproveita animações humanas com atributos modificados e outra tonalidade é um primeiro mod excelente, e *funciona perfeitamente*.
2. **Exportar via AssetRipper**, localizar o atlas da criatura clonada e copiar seu layout com precisão cirúrgica antes de iniciar o desenho. Veja **[Extraindo as artes do jogo](#/toolbox/getting-the-sprites)**.

> [!WARNING] Teste em um mundo real, não em um mapa vazio
> Uma criatura civilizada que não consegue traçar rotas, não sabe construir ou morre afogada ao nascer parecerá perfeita nos primeiros trinta segundos. Crie vinte delas, deixe o mundo correr na velocidade máxima por cinco minutos e analise o log com atenção :PES_MonkaSweat:.
