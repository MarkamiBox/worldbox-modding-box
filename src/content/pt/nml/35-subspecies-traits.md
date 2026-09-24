---
title: Traços de subespécies
group: Conteúdo do jogo
subgroup: Traços e genética
icon: :wbelf:
order: 104
---

# Traços de subespécies :wbelf:

Uma **subespécie** é um ramo de uma espécie que divergiu geneticamente: vida mais longa, escamas, postura de ovos ou bioluminescência. Ela se propaga pela **reprodução**, não pela educação, e é o único sistema de traços que traz seus próprios sprites; por isso uma subespécie pode parecer visualmente distinta da espécie original sem precisar ser um actor separado.

| | |
| --- | --- |
| Biblioteca | `AssetManager.subspecies_traits` |
| Classe | `SubspeciesTrait` |
| Grupos | `AssetManager.subspecies_trait_groups`, classe `SubspeciesTraitGroupAsset` |
| Dono em tempo de execução | `Subspecies`, em `World.world.subspecies` |
| Prefixo de localização | `subspecies_trait_` |
| Pasta de ícones padrão | `ui/Icons/subspecies_traits/` |

> [!WARNING] Uma subespécie **substitui** os atributos do asset do actor
> Em `Actor.updateStats()`, uma unidade com subespécie mescla `subspecies.base_stats` e *ignora* completamente `asset.base_stats`. É uma substituição direta, não um acúmulo.
>
> Portanto, qualquer valor definido em `human` será invisível para qualquer humano com subespécie, o que em um mundo em execução há algum tempo representa a grande maioria :PES4_IDunnoMan:.

Uma subespécie aplica blocos separados de atributos masculinos e femininos, mas eles **não** vêm de seus traços. Vêm do seu genoma em `AssetManager.gene_library`. Um traço de subespécie tem um único `base_stats` para todo mundo. Se você deseja divisão por sexo a partir de um traço, isso é papel dos traços de clã, veja **[Traços de clã](#/nml/clan-traits)**.

## Registrando um

```csharp Mods/HelloBox/Code/HelloSubspecies.cs
namespace HelloBox
{
    public static class HelloSubspecies
    {
        public const string SCALES = "hello_scales";

        public static void Initialize()
        {
            if (AssetManager.subspecies_traits.has(SCALES)) return;

            SubspeciesTrait trait = new SubspeciesTrait
            {
                id = SCALES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloSubspecies",
                in_mutation_pot_add = true,       // mutação pode conceder
                in_mutation_pot_remove = false,   // mutação não pode remover
                spawn_random_trait_allowed = true,
                rarity = Rarity.R1_Rare
            };

            AssetManager.subspecies_traits.add(trait);

            trait.base_stats["armor"] = 5;
            trait.base_stats.addTag("immunity_fire");
        }
    }
}
```

## Mutação

É assim que um traço de subespécie surge no mundo sem que você precise distribuí-lo manualmente, que é o jeito divertido. A biblioteca mantém duas urnas de sorteio, e estes dois campos decidem em quais urnas seu traço entra:

| Campo | O que faz |
| --- | --- |
| `in_mutation_pot_add` | Um evento de mutação pode conceder este traço |
| `in_mutation_pot_remove` | Um evento de mutação pode removê-lo |
| `spawn_random_trait_allowed` | Se pode ser sorteado aleatoriamente |
| `rarity` | A probabilidade de ser escolhido |

O atributo `mutation` da unidade determina a chance de isso acontecer. Veja **[Referência de atributos](#/nml/stats)**.

## Arte gráfica: o que nenhum outro sistema de traços possui

```csharp
trait.is_mutation_skin = true;
trait.sprite_path = "actors/species/mutations/hello_scales";
trait.animation_walk = ActorAnimationSequences.walk_0_3;
trait.animation_idle = ActorAnimationSequences.walk_0_3;
trait.animation_swim = ActorAnimationSequences.swim_0_3;
trait.skin_citizen_male = new List<string> { "male_1" };
trait.skin_citizen_female = new List<string> { "female_1" };
trait.skin_warrior = new List<string> { "warrior_1" };
trait.render_heads_for_children = true;

// A biblioteca constrói isso para suas próprias aparências através de um helper privado.
// Um mod faz o mesmo manualmente:
trait.texture_asset = new ActorTextureSubAsset(trait.sprite_path + "/", pHasAdvancedTextures: true);
trait.texture_asset.prevent_unconscious_rotation = trait.prevent_unconscious_rotation;
trait.texture_asset.render_heads_for_children = trait.render_heads_for_children;
trait.texture_asset.shadow = trait.shadow;
```

| Campo | O que faz |
| --- | --- |
| `is_mutation_skin` | Marca como substituição de aparência em vez de traço comum |
| `sprite_path` | A pasta de suas texturas. Note a barra final `/` necessária |
| `texture_asset` | O conjunto compilado de texturas. Configure manualmente como acima |
| `skin_citizen_male` / `_female` / `skin_warrior` | Variantes de aparência por função, sorteadas por unidade |
| `animation_walk` / `animation_idle` / `animation_swim` | Substituem as animações da espécie de origem |
| `shadow`, `shadow_texture`, `shadow_texture_egg`, `shadow_texture_baby` | Sombras para cada estágio de vida |
| `render_heads_for_children` | Se renderiza cabeça separada para crianças |
| `prevent_unconscious_rotation` | Mantém ereto quando inconsciente (para orbes e massas) |
| `remove_for_zombies` | Remove o visual quando a unidade vira zumbi |
| `priority` | Qual visual prevalece quando a unidade possui dois |

As mutações de aparência vanilla (hambúrguer, rocha viva, horror tentacular, orbe de luz, fractal) são clones de `$skin_mutation$`, e clonar esse modelo é de longe o caminho mais rápido para uma aparência funcional. Sim, burger é uma mutação de verdade. Os caminhos de Maxim são misteriosos :wbpray:.

## Fenótipos, dieta e ovos

Três subsistemas aos quais os traços de subespécie se integram:

| Campo | O que faz |
| --- | --- |
| `phenotype_skin`, `id_phenotype` | Vincula o traço a um fenótipo em `AssetManager.phenotype_library` |
| `is_diet_related` | Marca como parte da dieta. Combine com uma tag `diet_*` |
| `id_egg`, `phenotype_egg` | A forma do ovo para subespécies ovíparas |
| `after_hatch_from_egg_action`, `has_after_hatch_from_egg_action` | Código disparado quando o ovo choca |

## Genes

Um gene é a forma como um traço de subespécie sofre mutação para outro traço. O jogo percorre `AssetManager.genes` durante a reprodução para decidir o que será transmitido: Dever de casa de biologia, basicamente.

```csharp Mods/HelloBox/Code/HelloGenes.cs
namespace HelloBox
{
    public static class HelloGenes
    {
        public static void Initialize()
        {
            GeneAsset gene = new GeneAsset
            {
                id = "hello_swift_gene",
                id_trait = HelloSubspecies.SWIFT,
                rate = 0.05f
            };
            AssetManager.genes.add(gene);
            AssetManager.genes._gene_assets_mutations.Add(gene);
        }
    }
}
```

Dois campos:

- `gene.id_trait` vincula-o ao traço de subespécie que você registrou.
- `gene.rate` é a chance de mutação, de 0.0 a 1.0.

Sem a chamada a `_gene_assets_mutations.Add(gene)`, o gene é registrado, mas nunca entra no sorteio de mutações.

## Tags meta

Vários traços de subespécies vanilla contêm apenas uma tag, pois é nessa tag que o jogo baseia seus desvios lógicos:

```csharp
trait.base_stats_meta.addTag("can_build_in_biome_permafrost");   // a subespécie pode colonizar aquele bioma
trait.base_stats.addTag("walk_adaptation_snow");                 // suas unidades caminham bem sobre a neve
```

`base_stats_meta` fica na subespécie. `base_stats` chega até suas unidades. A lista completa de tags está na **[Referência de atributos](#/nml/stats)**.

## Os grupos vanilla

`harmony` · `advanced_brain` · `mind` · `body` · `diet` · `rebirth` · `growth` · `bioproducts` · `chaos` · `talents` · `sleep_cycles` · `hibernation` · `reproduction_strategy` · `reproductive_methods` · `gestation` · `eggs` · `mutations` · `adaptations` · `fate` · `phenotypes` · `special`

Para criar sua própria aba: veja **[Grupos de traços e abas](#/nml/trait-groups)**, com `AssetManager.subspecies_trait_groups` e `SubspeciesTraitGroupAsset`.

## Os textos

```json Mods/HelloBox/Locales/en.json
{
  "subspecies_trait_hello_scales": "Scaled",
  "subspecies_trait_hello_scales_info": "Thick, overlapping, and quietly smug about it."
}
```

## Distribuindo o traço

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
if (asset != null) asset.addSubspeciesTrait(HelloSubspecies.SCALES);
```

Isso faz com que toda nova subespécie dessa criatura comece com ele. Omitir essa linha e depender apenas de `in_mutation_pot_add` significa que ele surgirá sozinho em algum lugar eventualmente, o que normalmente é bem mais divertido.

> [!TIP] Magias combinam perfeitamente aqui
> As linhagens mágicas vanilla são traços de subespécie que concedem uma magia e nada mais: `trait.addSpell("summon_lightning")`. Uma única linha, herdada pelos descendentes, e você cria uma linhagem visível de invocadores de tempestades por todo um continente :PES5_CrazyPog:.
