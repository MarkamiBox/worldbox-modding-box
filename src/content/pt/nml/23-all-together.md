---
title: O mod concluído
group: Conteúdo do jogo
subgroup: Toques finais e conquistas
icon: :wbpeak:
order: 222
---

# O mod concluído :wbpeak:

Se você seguiu as páginas em ordem, esteve adicionando um arquivo por vez ao mesmo mod desde **[Seu primeiro mod](#/nml/your-first-mod)**. Esta página é a montagem final: como o HelloBox fica quando cada peça está no lugar e como os componentes se comunicam entre si.

## O que você construiu

Uns vinte arquivos, e é nisso que eles dão no jogo. Cada linha é uma página deste guia  :wbpeak:.

| O quê | Onde você vê |
| --- | --- |
| Um traço (trait) de ator, e uma aba sua para guardá-lo | O inspetor da unidade, lista de traços |
| Traços de cultura (culture), religião (religion), subespécie (subspecies), clã, idioma e reino (kingdom) | As janelas deles, uma por sistema |
| Uma arma, seu encantamento (modifier) e uma categoria para os dois | As mãos de uma unidade, as abas de equipamento |
| Um efeito de status | Acima da cabeça da criatura, com o ícone dele |
| Drops, uma nuvem (cloud) que chove eles e um projétil (projectile) | O mapa, no ar, no meio da briga |
| Um tile | O terreno, embaixo de tudo |
| Uma receita de comida | Os estoques de uma cidade |
| Uma lei do mundo (world law) | A janela de Leis do Mundo |
| Um poder divino (GodPower), a aba dele e o botão | A barra de poderes lá embaixo |
| Uma janela | Onde você decidir |
| Uma construção (building) | Uma cidade, assim que alguém construir |
| Um reino e uma criatura que pertence a ele | O mapa, nascendo e brigando |
| Um desastre (disaster) | O menu de desastres |
| Um trabalho (job) de IA próprio | A criatura, andando para algum lugar de propósito |
| Uma decisão (decision), um emprego da cidade e uma ferramenta na mão | Fogos-fátuos vagando com uma tocha, um guardião por cidade |
| Uma ação de combate | Unidades rápidas lançando brasas antes de atacar |
| Um gene, uma personalidade, um tipo de livro (book), uma peça de estandarte | O genoma, governantes, bibliotecas (library), bandeiras |
| Opinião, lealdade e um evento de felicidade | Detalhamentos diplomáticos e de cidades |
| Uma trama (plot) | A lista de tramas, quando um líder planeja um festival |
| Uma era do mundo e um comportamento (behaviour) do mundo | A roda de eras e o temporizador do mundo |
| Uma conquista (achievement) | A janela de conquistas, ao atingir dez fogos-fátuos |
| Um pincel, uma dica de contexto e uma tecla de atalho | Rotação de pincéis, dica ao passar o mouse, F6 |
| Um patch do Harmony | Lugar nenhum, e esse é o ponto: muda uma regra caladinho |

## Leve com você

<a class="dl" href="hellobox.zip" download>
  <span class="dl-icon">📦</span>
  <span class="dl-text">
    <span class="dl-title">Baixar o HelloBox</span>
    <span class="dl-sub">O mod pronto, todos os arquivos desta página. Descompacte em <code>worldbox\Mods\</code> e abra o jogo.</span>
  </span>
</a>

Ele é gerado a partir dos blocos de código deste guia, então é o mesmo código que você vem copiando, não uma cópia separada que desanda com o tempo. Leia, quebre, apague os dois terços que você não quer.

> [!WARNING] É uma demo, não um produto
> Publicar o HelloBox do jeito que está não ajuda ninguém: são vinte recursos (resource) que fazem, cada um, uma coisinha mal feita de propósito. Troque os ids, troque o nome, fique com as partes que você realmente queria  :wbbru:.

## A pasta

```text Mods/HelloBox/
HelloBox/
├── mod.json                         the ID card
├── icon.png                         what players see in the mod list
├── default_config.json              the settings window
├── Locales/
│   └── en.json                      every piece of text
├── GameResources/
│   ├── iconHelloCake.png            the food inventory icon
│   ├── actors/species/other/
│   │   ├── hello_wisp/              main/ and child/: walk_0..3, swim_0..3, sprites.json
│   │   └── hello_golem/             the same shape
│   ├── buildings/hello_shrine/      main_0, construction_0, ruin_0, mini_0, sprites.json
│   ├── cultures/
│   │   └── hello_culture_element.png    a culture banner part
│   ├── drops/hello_ember/           hello_ember_0..1, the falling drop
│   ├── effects/
│   │   ├── clouds/hello_cloud.png   the cloud sprite
│   │   ├── fx_hello_status/         fx_hello_status_0..2, the status overhead
│   │   └── projectiles/hello_bolt/  hello_bolt_0..1, the flying ember
│   ├── items/
│   │   ├── resources/hello_cake/    hello_cake_0..1, cake in hand
│   │   ├── tools/tool_hello_torch/  tool_hello_torch_0, the torch in hand
│   │   └── weapons/
│   │       ├── sprites.json         pivot for held weapons
│   │       ├── w_hello_sword.png    weapon sprite
│   │       └── w_hello_sword/       the in-hand sprite list, with its own sprites.json
│   ├── tiles/hello_moss/            moss_1, a tile variation
│   └── ui/Icons/
│       ├── sprites.json             default icon slicing
│       ├── iconHello*.png           traits, powers, tabs, the age, the gene, the grudge...
│       ├── items/icon_hello_sword.png       weapon inventory icon
│       └── worldrules/icon_hello_law.png    world law switch
└── Code/
    ├── Main.cs                      the door NML knocks on
    ├── HelloSettings.cs             what the settings window writes to
    ├── HelloGroups.cs               your own trait tab and item category
    ├── HelloTraits.cs               an actor trait
    ├── HelloMemory.cs               a trait that remembers, in the save file
    ├── HelloCulture.cs              a culture trait
    ├── HelloReligion.cs             a religion trait
    ├── HelloSubspecies.cs           a subspecies trait
    ├── HelloClan.cs                 a clan trait
    ├── HelloLanguage.cs             a language trait
    ├── HelloGenes.cs                a gene
    ├── HelloKingdomTraits.cs        a kingdom trait
    ├── HelloItems.cs                a weapon cities actually forge
    ├── HelloModifiers.cs            an enchantment
    ├── HelloStatus.cs               a status effect
    ├── HelloDrops.cs                falling embers
    ├── HelloClouds.cs               an ember cloud
    ├── HelloTiles.cs                a top tile
    ├── HelloResources.cs            a food recipe
    ├── HelloProjectiles.cs          a flying ember
    ├── HelloLaws.cs                 a world law switch
    ├── HelloBuildings.cs            a building
    ├── HelloKingdoms.cs             their faction
    ├── HelloActors.cs               your creatures
    ├── HelloAI.cs                   its own behaviour
    ├── HelloDecisions.cs            the wisps choosing it on their own
    ├── HelloCityJobs.cs             a job cities hand out
    ├── HelloTools.cs                a torch in hand
    ├── HelloCombat.cs               a combat move
    ├── HelloPolitics.cs             opinion, loyalty, a happiness event
    ├── HelloPlots.cs                a festival leaders can plot
    ├── HelloAges.cs                 a world age and a world behaviour
    ├── HelloAchievements.cs         an achievement
    ├── HelloPersonality.cs          a ruler personality
    ├── HelloBooks.cs                a kind of book
    ├── HelloBanners.cs              a culture banner part
    ├── HelloBrushes.cs              a brush shape
    ├── HelloTooltips.cs             the panel's tooltip
    ├── HelloHotkeys.cs              F6 opens the panel
    ├── HelloDisasters.cs            an ember storm, with its log line
    ├── HelloPowers.cs               a god power + its tab and buttons
    ├── HelloWindow.cs               a panel
    └── HelloPatches.cs              your Harmony patches
```

## Main.cs, por completo

```csharp Mods/HelloBox/Code/Main.cs
using System;
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>, IReloadable
    {
        // Development only: turns on NML's reload button. Never ship it on. See Logs & debugging.
        private static bool DevReload = false;

        protected override void OnModLoad()
        {
            if (DevReload) Config.isEditor = true;

            // Order matters: things that are referenced must exist first.
            Stage("groups", HelloGroups.Initialize);        // tabs before the things that sit in them
            Stage("traits", HelloTraits.Initialize);
            Stage("memory", HelloMemory.Initialize);
            Stage("culture", HelloCulture.Initialize);
            Stage("religion", HelloReligion.Initialize);
            Stage("subspecies", HelloSubspecies.Initialize);
            Stage("clan", HelloClan.Initialize);
            Stage("language", HelloLanguage.Initialize);
            Stage("genes", HelloGenes.Initialize);
            Stage("status", HelloStatus.Initialize);
            Stage("drops", HelloDrops.Initialize);          // clouds rain drops, so drops go first
            Stage("clouds", HelloClouds.Initialize);
            Stage("tiles", HelloTiles.Initialize);
            Stage("biomes", HelloBiomes.Initialize);       // after the tiles, before anything spawns in it
            Stage("resources", HelloResources.Initialize);  // items and buildings cost resources
            Stage("projectiles", HelloProjectiles.Initialize);
            Stage("modifiers", HelloModifiers.Initialize);
            Stage("items", HelloItems.Initialize);          // items can roll the modifiers above
            Stage("buildings", HelloBuildings.Initialize);
            Stage("kingdoms", HelloKingdoms.Initialize);    // actors point at kingdoms
            Stage("kingdom_traits", HelloKingdomTraits.Initialize);
            Stage("names", HelloNames.Initialize);         // before the actors, so they can use its name set
            Stage("actors", HelloActors.Initialize);
            Stage("laws", HelloLaws.Initialize);
            Stage("ai", HelloAI.Initialize);
            Stage("decisions", HelloDecisions.Initialize);  // after the actors and the task they use
            Stage("city_jobs", HelloCityJobs.Initialize);
            Stage("tools", HelloTools.Initialize);
            Stage("combat", HelloCombat.Initialize);        // after the trait that carries it
            Stage("politics", HelloPolitics.Initialize);
            Stage("wars", HelloWars.Initialize);
            Stage("plots", HelloPlots.Initialize);
            Stage("ages", HelloAges.Initialize);            // after the cloud, the law and the status it uses
            Stage("achievements", HelloAchievements.Initialize);
            Stage("personality", HelloPersonality.Initialize);
            Stage("books", HelloBooks.Initialize);
            Stage("banners", HelloBanners.Initialize);
            Stage("brushes", HelloBrushes.Initialize);
            Stage("tooltips", HelloTooltips.Initialize);
            Stage("hotkeys", HelloHotkeys.Initialize);
            Stage("disasters", HelloDisasters.Initialize);
            Stage("powers", HelloPowers.Initialize);        // last: the buttons need the powers

            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
            LogInfo("HelloBox ready");
        }

        private static void Stage(string pName, Action pAction)
        {
            try { pAction(); }
            catch (Exception e) { LogError($"stage '{pName}' failed: {e}"); }
        }

        // NML calls this after it recompiled your code, when you press the reload button
        public void Reload()
        {
            LogInfo("HelloBox reloaded");
        }

        public void Update()
        {
            if (!Config.game_loaded) return;
            if (World.world == null || World.world.units == null || MapBox.instance == null) return;

            // the power tab can only be laid out once its own Start() has run
            HelloPowers.LayoutWhenReady();
        }
    }
}
```

### Por que essa ordem

Três arquivos dessa pasta nunca aparecem na lista acima, e isso está perfeitamente correto:

| Arquivo | Quem o chama |
| --- | --- |
| `HelloPatches.cs` | `PatchAll()` o descobre por meio de seus atributos. Você nunca chama um patch manualmente |
| `HelloSettings.cs` | O carregador de configurações grava nele quando o jogador move um controle |
| `HelloWindow.cs` | Seu próprio botão o instancia na primeira vez que alguém o abre |

Seus textos também não exigem nenhuma etapa: o NML carrega `Locales/en.json` antes de bater em `OnModLoad`, então cada chave já está presente. Todo o resto são dependências lógicas:

1. **Grupos antes do conteúdo**, pois um asset cujo `group_id` aponta para o vazio não tem aba onde ser desenhado.
2. **Gotas antes de nuvens**, pois uma nuvem referencia a gota que faz chover.
3. **Recursos antes de itens (item) e edifícios**, pois ambos consomem recursos.
4. **Modificadores antes de itens**, pois uma arma lista os modificadores que pode sortear.
5. **Reinos antes de atores**, pois um ator especifica seus reinos selvagem e civilizado.
6. **Poderes antes de seus botões**: o `PowerButtonCreator` busca o poder pelo id, e um botão atrelado a um poder ausente é um botão morto.
7. **Tudo o que a IA usa antes da própria IA**, já que uma tarefa (task) cita traços e status por id.
8. **Atores e a IA antes de decisões, empregos da cidade e ferramentas**, porque apontam para uma criatura e uma tarefa que já devem existir.
9. **A era do mundo após a nuvem, a lei e o status** que seus efeitos utilizam. Tramas, política e conquistas só consultam elementos durante a execução do jogo, podendo ficar em qualquer lugar após suas dependências.

Quando algo não aparecer no jogo, perguntar "eu registrei isso depois do elemento que precisava dele?" é a segunda pergunta obrigatória, logo após "isso está no log?" :PES2_HmmmmNoted:.

## O checklist antes de considerar o trabalho concluído

| | |
| --- | --- |
| Log | Inicie o jogo, procure por `HelloBox`. Você quer ver "ready" e **nenhuma** `Exception` |
| Texto | Nada no jogo deve exibir chaves brutas como `trait_hello_x` |
| Ícones | Nenhum buraco invisível na barra de poderes |
| Configurações | Apague `mods_config/<GUID>.config`, reinicie e confirme se os padrões são coerentes |
| Mundo limpo | Crie um mapa novo, deixe rodar na velocidade máxima por cinco minutos e releia o log |
| Outros mods | Ative alguns. Se você aplica patch em algo, com certeza outro mod também está aplicando |

Depois siga para **[Publicando seu mod](#/nml/publishing)** e deixe os outros jogadores colocarem seu código à prova :aPES3_VictoryPog:.

## Para onde ir agora

- Exclua as partes do HelloBox que você não pretende utilizar. Foi uma demo, não um mod real.
- Escolha **uma** única área e faça-a muito bem feita. Um mod que faz uma coisa com perfeição supera um que faz doze de forma medíocre.
- Leia o código original da mecânica que você escolheu (**[Lendo o código do jogo](#/toolbox/reading-the-game-code)**). Tudo o que você ainda não sabe já está escrito lá :PESgn_ReadRules:.
