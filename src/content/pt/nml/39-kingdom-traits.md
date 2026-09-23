---
title: Traços de reino
group: Conteúdo do jogo
subgroup: Traços e genética
icon: :wbcrown:
order: 114
---

# Traços de reino :wbcrown:

Um **traço de reino** representa uma política de estado. Não é uma crença nem uma linhagem: é uma diretriz promulgada pela coroa que vigora sobre todo o reino.

O jogo base usa este sistema para exatamente uma finalidade: alíquotas de tributação. Isso faz dele o menor e mais deserto dos sete sistemas de traços – e portanto o lugar mais fértil para se introduzir mecânicas novas. Não há disputa por esse espaço.

| | |
| --- | --- |
| Biblioteca | `AssetManager.kingdoms_traits` |
| Classe | `KingdomTrait` |
| Grupos | `AssetManager.kingdoms_traits_groups`, classe `KingdomTraitGroupAsset` |
| Dono em tempo de execução | `Kingdom`, em `World.world.kingdoms` |
| Prefixo de localização | `kingdom_trait_` |
| Pasta de ícones padrão | `ui/Icons/kingdom_traits/` |

> [!WARNING] Atributos de reino não chegam às unidades
> Da mesma forma que na religião, `kingdom.base_stats` nunca se funde em um `Actor`. Os números a nível de reino visíveis no jogo decorrem dos **atributos pessoais do monarca** (`king.stats["cities"]` e similares), não do bloco de traços do reino.
>
> Sendo assim, um traço de reino transforma a nação através de seus campos próprios e de código, não por `base_stats`.

## Os campos de tributação

Os três campos exclusivos dos traços de reino, e tudo o que o jogo base realiza com este sistema:

```csharp
KingdomTrait trait = new KingdomTrait
{
    id = "hello_tax_rate_local_brutal",
    group_id = "local_tax",
    is_local_tax_trait = true,
    tax_rate = 0.9f
};
AssetManager.kingdoms_traits.add(trait);
trait.addOpposite("tax_rate_local_low");
```

| Campo | O que faz |
| --- | --- |
| `is_local_tax_trait` | Este traço define a alíquota de imposto **local** do reino |
| `is_tribute_tax_trait` | Este traço define a alíquota de **tributo** do reino |
| `tax_rate` | A alíquota propriamente dita, expressa como fração |

O reino recalcula ambas as taxas do zero sempre que seus traços mudam: começa no valor padrão global de `SimGlobals`, percorre seus traços e permite que cada traço correspondente **sobrescreva** o valor.

> [!WARNING] O último vence: declare sempre seus opostos
> Traços fiscais não se somam. Se um reino possuir dois traços `is_local_tax_trait`, aquele que vier depois na ordem de iteração prevalecerá silenciosamente sobre o outro.
>
> Cada traço fiscal vanilla declara o outro como oposto mútuo por este exato motivo. Faça o mesmo dos dois lados, ou sua taxa tributária funcionará apenas de modo intermitente :PES5_HmmmmNo:.

## Registrando um adequadamente

```csharp Mods/HelloBox/Code/HelloKingdomTraits.cs
namespace HelloBox
{
    public static class HelloKingdomTraits
    {
        public const string LEVY = "hello_levy";

        public static void Initialize()
        {
            if (AssetManager.kingdoms_traits.has(LEVY)) return;

            KingdomTrait trait = new KingdomTrait
            {
                id = LEVY,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "miscellaneous",
                path_icon = "ui/Icons/iconHelloKingdom",
                spawn_random_trait_allowed = false,
                can_be_given = true,
                can_be_removed = true
            };

            AssetManager.kingdoms_traits.add(trait);
        }
    }
}
```

## Criando uma política que realmente faça algo

Como `base_stats` não tem efeito, um traço de reino comprova sua relevância por dois caminhos:

**Uma decisão**, a alternativa limpa e direta:

```csharp
trait.addDecision("some_decision_id");
// ids are resolved at startup, before your mod: resolve yours
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("some_decision_id") };
```

**Um patch do Harmony que consulte o traço**, que é a forma de erguer um sistema legislativo real. Aplique o patch ao método que dita a ação da coroa e examine ali os traços do reino:

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;
        if (!__instance.kingdom.hasTrait(HelloKingdomTraits.LEVY)) return;

        __result *= 1.35f;
    }
}
```

Esse é o padrão universal para qualquer diretriz de reino que não seja uma taxa fiscal: o traço atua como interruptor e seu patch executa o comportamento. Veja **[Patches do Harmony](#/nml/harmony-patches)**.

## Os grupos vanilla

`tribute` · `local_tax` · `miscellaneous` · `fate`

Quatro grupos, dois dos quais formam a dupla de impostos. Se estiver criando mais do que duas diretrizes, monte uma aba exclusiva, veja **[Grupos de traços e abas](#/nml/trait-groups)**, com `AssetManager.kingdoms_traits_groups` e `KingdomTraitGroupAsset`.

## Os textos

```json Mods/HelloBox/Locales/en.json
{
  "kingdom_trait_hello_levy": "Levy",
  "kingdom_trait_hello_levy_info": "Everyone who can carry a spear, carries a spear."
}
```

## Distribuindo o traço

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addKingdomTrait(HelloKingdomTraits.LEVY);
```

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    kingdom.addTrait(HelloKingdomTraits.LEVY, pRemoveOpposites: true);
}
```

O asset de reino a partir do qual uma facção foi gerada é um elemento separado, veja **[Reinos e facções](#/nml/kingdoms)**.

> [!TIP] A sala vazia
> Seis dos sete sistemas de traços estão apinhados de conteúdo nativo que você precisa contornar. Este contém meros cinco traços. Se você quer um mod com ar de jogo original que não dispute espaço com ninguém, um conjunto de éditos reais é o caminho mais tranquilo :PES2_Cash:.
