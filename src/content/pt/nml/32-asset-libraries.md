---
title: Bibliotecas de assets
group: Conteúdo do jogo
subgroup: Arquitetura e atributos
icon: :wbbrain:
order: 90
---

# Bibliotecas de assets :wbbrain:

Antes que qualquer uma das páginas seguintes faça sentido, você precisa desta. Absolutamente tudo no WorldBox (um traço, uma arma, uma construção, um ladrilho, uma nuvem, um reino) é um **asset** guardado em uma **biblioteca**, e cada biblioteca do jogo é a mesmíssima classe com os mesmíssimos quatro métodos.

Aprenda-os uma vez aqui e as próximas trinta páginas viram apenas: "qual biblioteca, quais campos".

## O que é uma biblioteca

```csharp
public abstract class AssetLibrary<T> : BaseAssetLibrary where T : Asset
{
    public List<T> list;                 // tudo, em ordem
    public Dictionary<string, T> dict;   // tudo, indexado por id
}
```

É só isso. Uma lista e um dicionário, ambos públicos, ambos prontos para o seu mod ler e alterar. O `AssetManager` gerencia 129 delas. Veja **[Todas as bibliotecas de assets](#/nml/asset-index)** para o catálogo completo.

## Os quatro métodos

```csharp
AssetManager.traits.has("hello_swift");            // esse id já está em uso?
AssetManager.traits.get("hello_swift");            // busca o objeto, ou null
AssetManager.traits.add(myTrait);                  // registra um novo asset
AssetManager.traits.clone("hello_new", "brave");   // copia um existente e registra a cópia
```

### `has(id)`

Retorna `true` se o id já estiver registrado. **A primeira linha de todo `Initialize()` que você escrever deve ser uma destas**:

```csharp
if (AssetManager.traits.has(SWIFT)) return;
```

Sem isso, qualquer recarregamento de mod registrará tudo em duplicata.

### `get(id)`

Retorna o asset vivo na memória, ou `null` se o id não existir. Ele **não** lança exceções, então a falha por ponteiro nulo vai estourar longe de onde o erro foi cometido:

```csharp
ActorTrait brave = AssetManager.traits.get("brave");
if (brave == null) return;   // sempre. absolutamente todas as vezes.
```

O fato de `get` retornar o objeto *vivo* é o recurso mais poderoso desta página. Significa que você pode alterar conteúdos vanilla sem precisar substituí-los:

```csharp
// Torne os dragões vanilla mais resistentes sem mexer em mais nada deles.
ActorAsset dragon = AssetManager.actor_library.get("dragon");
if (dragon != null) dragon.base_stats["health"] += 500;
```

### `add(asset)`

Registra um novo asset. Três coisas fundamentais acontecem internamente:

1. **Se o id já estiver ocupado, o asset antigo é removido e o seu toma o lugar dele**, gerando isto no log:
   ```text
   <e>AssetLibrary<ActorTrait></e>: duplicate asset - overwriting...
   ```
   É assim que um mod quebra silenciosamente o outro. Use prefixos em seus ids.
2. O método `create()` é executado no asset.
3. **A biblioteca aloca o bloco de `base_stats`** (e `base_stats_meta`, se o asset possuir). É por isso que a regra de ouro em todo este guia é "atributos sempre após `add()`".

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };

AssetManager.traits.add(swift);        // <- aloca o bloco de atributos
swift.base_stats["speed"] = 20f;       // <- seguro apenas a partir desta linha
```

Inverta essa ordem e você causará o crash mais clássico de todo o modding de WorldBox:

```text
NullReferenceException: Object reference not set to an instance of an object
```

### `clone(newId, sourceId)`

Copia todos os campos serializáveis de `sourceId` para um objeto novinho em folha, atribui a ele `newId` **e chama `add()` nele**. Retorna a cópia criada.

```csharp
BuildingAsset shrine = AssetManager.buildings.clone("hello_shrine", "temple_human");
shrine.max_houses = 0;                     // altere o que você quiser
shrine.base_stats["health"] = 200;         // já alocado, porque add() já rodou
```

> [!WARNING] Nunca chame `add()` após `clone()`
> Um segundo `add()` remove a primeira cópia, gera a mensagem `duplicate asset overwriting...` no log e a adiciona de novo. Funciona, mas polui os logs e dificulta enxergar os erros de verdade.

Clonar é a melhor opção padrão para qualquer coisa com mais de dez campos: construções, atores, itens, ladrilhos. Você herda uma configuração estável e só precisa entender os campos que resolver modificar.

## Modelos

As bibliotecas mantêm assets inacabados cujo id começa com `$` ou `_`. Eles ficam registrados no `dict`, mas são mantidos fora da `list`, não aparecendo no jogo real: existem unicamente para serem clonados.

```csharp
AssetManager.actor_library.clone("hello_sprite", "$civ_advanced_unit$");
AssetManager.items.clone("hello_sword_ember", "$sword");
AssetManager.buildings.clone("hello_shrine", "$city_building$");
AssetManager.resources.clone("hello_cake", "$TEMPLATE_FOOD$");
AssetManager.kingdoms.clone("hello_sprites", "$TEMPLATE_CIV$");
```

Um modelo é quase sempre uma fonte de clone superior a um asset finalizado, pois você não herda a identidade do doador junto com a fiação interna. A exceção são as artes: clonar `human` lhe dá sprites humanos, e uma criatura visível sempre ganha de uma criatura invisível :PES4_AlrightThen:.

## Listando o que existe

A maneira mais rápida de descobrir quais ids estão disponíveis para clonagem é imprimi-los no console:

```csharp
foreach (BuildingAsset asset in AssetManager.buildings.list)
{
    LogInfo(asset.id);
}
```

Duas linhas e você nunca mais terá que adivinhar um id no escuro. A `list` exclui modelos; já o `dict.Keys` inclui todos eles.

## Reordenando elementos

A `list` é uma `List<T>` comum, e o jogo desenha grupos e categorias na ordem exata da lista. Você pode colocar seu asset exatamente onde preferir:

```csharp
ItemGroupAsset group = AssetManager.item_groups.get("hello_relics");
int index = AssetManager.item_groups.list.FindIndex(g => g.id == "amulet");

if (group != null && index != -1)
{
    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## Quando seu código é executado

O jogo constrói todas as 129 bibliotecas na inicialização, executa `post_init()` nelas e, **somente depois**, o NML carrega o seu mod. Duas consequências com as quais muitos tropeçam, eu incluído:

- **Tudo o que uma biblioteca faz de forma automática no `post_init` já aconteceu.** Traços de atores, por exemplo, recebem um `path_icon` padrão nessa etapa. O seu não receberá, pois ele ainda não existia. Defina-o manualmente.
- **Todos os assets vanilla já existem quando o seu `OnModLoad` roda.** Por isso `get("human")` funciona, `clone(..., "human")` funciona e editar conteúdo vanilla no local funciona. Você nunca chega cedo demais.

## O padrão que todas as páginas seguintes usam

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public const string ID = "hello_something";

        public static void Initialize()
        {
            // 1. nunca registrar em duplicata
            if (AssetManager.<library>.has(ID)) return;

            // 2. clonar se houver algo próximo, criar do zero se não houver
            SomeAsset asset = AssetManager.<library>.clone(ID, "$template$");

            // 3. alterar os campos desejados
            asset.some_field = true;

            // 4. atributos sempre por último
            asset.base_stats["damage"] = 10;
        }
    }
}
```

Cada página de asset neste guia adota essa mesmíssima estrutura, alterando apenas os substantivos. Se alguma página o deixar confuso, volte aqui :PESgn_GoOn:.

## Quatro regras de ouro para pendurar na parede

1. **`has()` primeiro.** Nunca registre o mesmo id duas vezes.
2. **`clone()` já chama `add()`.** Nunca chame ambos em sequência.
3. **`base_stats` só existe depois de `add()`.** Atributos sempre por último.
4. **Coloque prefixos nos seus ids.** `hello_swift`, nunca `swift`. O espaço de nomes é único e compartilhado com todos os outros mods.
