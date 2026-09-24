---
title: Recursos e comida
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbtomato:
order: 182
---

# Recursos e comida :wbtomato:

Um recurso é tudo aquilo que uma cidade armazena, comercializa, come ou forja: trigo, pão, pedra, mithril, ossos, gemas. Eles residem em `AssetManager.resources` e são a camada fundamental de toda a economia: o que as fazendas plantam, o que os padeiros assam, o que os ferreiros usam e o que um cidadão faminto come. Nesta economia, até o pão é uma estrutura de dados :PES2_Cash:.

## Clonando a partir de um modelo

> [!WARNING] Defina `full_sprite_path` ou o carregador quebra
> `path_gameplay_sprite` é só metade. A biblioteca monta `full_sprite_path` a partir dele em `post_init()`, uma vez, durante o carregamento do jogo, então um recurso registrado por um mod fica com `null` ali. O preloader de sprites chama `getSpriteList(null)` e o carregamento inteiro morre com `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:.

```csharp Mods/HelloBox/Code/HelloResources.cs
namespace HelloBox
{
    public static class HelloResources
    {
        public const string CAKE = "hello_cake";

        public static void Initialize()
        {
            if (AssetManager.resources.has(CAKE)) return;

            // $TEMPLATE_FOOD$ e $TEMPLATE_STRATEGIC_MINERAL$ são os dois pontos de partida ideais.
            ResourceAsset cake = AssetManager.resources.clone(CAKE, "$TEMPLATE_FOOD$");

            cake.path_icon = "iconHelloCake";       // inventory icon in GameResources/
            cake.path_gameplay_sprite = "hello_cake";   // in-hand sprite in GameResources/

            // A biblioteca deriva isso em post_init(), que ja rodou. Defina voce mesmo.
            cake.full_sprite_path = "items/resources/" + cake.path_gameplay_sprite;   // o que a unidade carrega nas mãos

            cake.ingredients = new string[] { "wheat", "honey" };
            cake.ingredients_amount = 1;

            cake.restore_nutrition = 140;
            cake.restore_happiness = 25;
            cake.restore_stamina = 15;
            cake.give_experience = 10;

            cake.produce_min = 40;
            cake.maximum = 999;
            cake.trade_bound = 50;
            cake.trade_give = 5;
        }
    }
}
```

## Os campos

### O que ele é

| Campo | O que faz |
| --- | --- |
| `type` | `ResType.Food`, `Ingredient_Food`, `Ingredient`, `Strategic`, `Currency` |
| `food` | Se uma unidade o consome como refeição |
| `wood`, `mineral` | Quais ferramentas de colheita e empregos se aplicam |
| `path_icon` | O ícone visível em inventários e listas |
| `path_gameplay_sprite` | O sprite que a criatura segura nas mãos ao transportá-lo |

### Consumo e alimentação

| Campo | O que faz |
| --- | --- |
| `restore_nutrition` | Fome recuperada |
| `restore_health` | Vida restaurada, como proporção |
| `restore_stamina`, `restore_mana`, `restore_happiness` | As outras barras de estado |
| `give_experience` | Experiência concedida ao comer |
| `tastiness`, `favorite_food_chance` | Chance de uma unidade elegê-lo como comida favorita |
| `diet` | Quais dietas biológicas podem consumi-lo |
| `eat_action` | Seu código executado quando alguém o come |
| `give_trait_id`, `give_status_id`, `give_chance` | Traços ou efeitos de status concedidos ao ingerir |

### Produção e logística

| Campo | O que faz |
| --- | --- |
| `ingredients`, `ingredients_amount` | Ingredientes necessários para cozinhar ou forjar |
| `produce_min` | Quanto rende um único ciclo de produção |
| `mine_rate` | Velocidade com que é minerado ou colhido |
| `drop_max`, `drop_per_mass` | Quanto solta quando a fonte é destruída |
| `stack_size`, `storage_max`, `maximum` | Limites de transporte e armazenamento |
| `supply_give`, `supply_bound_give`, `supply_bound_take` | Comportamento no suprimento militar |
| `trade_cost`, `trade_give`, `trade_bound` | Comportamento nas rotas comerciais |
| `money_cost`, `loot_value` | Valor monetário e valor de pilhagem |

## Os recursos vanilla

Vale a pena conhecê-los, pois utilizar um existente é quase sempre melhor do que criar um novo:

**Comida e ingredientes:** `wheat` `bread` `berries` `bananas` `coconut` `mushrooms` `peppers` `herbs` `fish` `meat` `honey` `lemons` `worms` `pine_cones` `candy` `sushi` `jam` `cider` `ale` `burger` `pie` `tea` `crystal_salt` `desert_berries` `evil_beets` `snow_cucumbers` `celestial_avocado`

**Estratégicos e outros:** `wood` `stone` `common_metals` `silver` `mythril` `adamantine` `gems` `bones` `leather` `dragon_scales` `fertilizer` `gold`

## Seus próprios sprites

Um recurso possui duas ilustrações diferentes, e elas são resolvidas de maneira **completamente distinta**. É aqui que muita gente se perde: E vai pegar você uma vez também.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── iconHelloCake.png              <- o ícone de inventário, na raiz
    └── items/resources/
        └── hello_cake/hello_cake_0.png             <- o que a unidade carrega na mão
```

```csharp
cake.path_icon = "iconHelloCake";        // carregado exatamente como escrito
cake.path_gameplay_sprite = "hello_cake";   // carregado automaticamente como items/resources/hello_cake
```

`path_icon` é um caminho direto, e o vanilla usa nomes simples, então o arquivo reside na raiz de `GameResources/`. Para `path_gameplay_sprite`, o jogo adiciona `items/resources/` na frente automaticamente. Se você mesmo escrever a pasta, o jogo vai buscar por `items/resources/items/resources/...` e não vai encontrar nada.

## Conectando um recurso ao mundo

Um recurso fica inerte até que algo o produza. Os três locais fundamentais:

```csharp
// 1. Uma criatura o concede ao ser abatida ou morrer.
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// 2. Uma construção o concede ao ser colhida.
BuildingAsset tree = AssetManager.buildings.get("hello_tree");
tree.addResource("wood", 3, pNewList: true);

// 3. Uma cultura o produz em suas cidades.
asset.production = new string[] { "bread", "jam", "hello_cake" };
```

`pNewList: true` na primeira chamada significa: "inicie uma lista nova em vez de anexar à herdada do modelo doador". Se esquecer disso após um clone, sua criatura vai dropar tanto os recursos do doador quanto os seus.

## Materiais não são recursos

O **material** de um equipamento (ferro, aço, mithril) é um `ItemAsset` em uma biblioteca de materiais, não um `ResourceAsset`, ainda que usar um material custe recursos. Esse é um dos pontos em que a nomenclatura do jogo causa confusão genuína. Veja **[Itens personalizados](#/nml/custom-items)**.

O elo entre eles é `cost_resources` no material, que lista os ids de recursos e as quantidades necessárias.

> [!TIP] Adicione a receita, não o ingrediente
> Um novo *ingrediente* precisa de uma fonte: algo para cultivá-lo, um bioma para produzi-lo, um emprego para colhê-lo. Uma nova *receita* só precisa de ingredientes que já existem, integrando-se de imediato às padarias e rotas de comércio ativas. Um leva uma semana, o outro leva uma tarde :PES_ChillPill:.
