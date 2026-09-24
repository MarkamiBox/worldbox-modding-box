---
title: Traços personalizados
group: Conteúdo do jogo
subgroup: Traços e genética
icon: :wbstrongminded:
order: 100
---

# Traços personalizados :wbstrongminded:

Um traço (trait) é um rótulo permanente em uma unidade: *corajoso*, *rápido*, *imortal*. Ele aparece no inspetor, pode alterar os atributos da unidade, pode executar código quando ela nasce, é atingida ou morre, e os filhos podem herdá-lo.

É também a coisa mais simples e leve de adicionar em todo o jogo, e é por isso que costuma ser o primeiro mod de todo mundo. O meu não: meu primeiro mod era um wrapper em volta do mod de outra pessoa, o que é um tipo próprio de trapaça :trollface:.

## Sempre use prefixo nos seus IDs

Todo asset no WorldBox vive em uma única lista plana indexada por `id`. Se você registrar `fast` e outro mod também registrar `fast`, o segundo **sobrescreve** o primeiro e o log recebe uma linha sobre isso que ninguém lê.

Portanto: `hello_swift`, não `swift`. Nome curto do mod, underline, seu nome para o item. Faça isso para traços, itens, construções, poderes, status, absolutamente tudo :aPES4_Noted:.

## O traço

```csharp Mods/HelloBox/Code/HelloTraits.cs
namespace HelloBox
{
    public static class HelloTraits
    {
        // O id escrito uma única vez. Qualquer outro arquivo fará referência a HelloTraits.SWIFT,
        // transformando um erro de digitação em erro de compilação em vez de um traço inútil.
        public const string SWIFT = "hello_swift";

        public static void Initialize()
        {
            // Nunca registre o mesmo id duas vezes. A biblioteca registra um erro e sobrescreve.
            if (AssetManager.traits.has(SWIFT)) return;

            ActorTrait swift = new ActorTrait
            {
                id = SWIFT,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                path_icon = "ui/Icons/iconSpeed",   // um ícone vanilla, troque pelo seu mais tarde
                group_id = "physique",              // em qual aba do livro de traços ele fica
                rate_birth = 0,                     // 0 = nunca surge espontaneamente ao nascer
                can_be_given = true,                // o jogador pode adicionar no editor de traços
                can_be_removed = true,
                can_be_cured = false
            };

            // add() registra o traço E aloca seu bloco de atributos. Ambos, nessa ordem.
            AssetManager.traits.add(swift);

            swift.base_stats["speed"] = 20f;
            swift.base_stats["attack_speed"] = 10f;
            swift.base_stats["damage"] = 5;
        }
    }
}
```

E uma linha em `Main.cs`:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");
    HelloTraits.Initialize();
}
```

### O que cada parte faz

- **`AssetManager.traits`**: A biblioteca que contém todos os traços de criaturas do jogo, vanilla e modificados. `has`, `get`, `add` e `clone` são os quatro métodos que você usará em todas as bibliotecas a partir daqui.
- **`path_icon`**: A imagem pequena no inspetor. Um *caminho*, não um arquivo com extensão. Veja **[Sprites e recursos](#/nml/sprites-and-resources)**. O jogo só preenche isso automaticamente enquanto constrói suas próprias bibliotecas internas, então para o seu traço ele ficará vazio a menos que você defina.
- **`needs_to_be_explored`**: `true` por padrão, ou seja, o traço fica bloqueado no livro de conhecimento até o jogador encontrá-lo num mundo. `false` deixa disponível desde o primeiro segundo. O HelloBox coloca em tudo, para você ver o que construiu sem precisar caçar.
- **`group_id`**: Em qual aba do livro de traços ele aparece. A lista completa está abaixo.
- **`rate_birth`**: A chance de um recém-nascido adquiri-lo naturalmente. `0` significa "apenas se algo conceder explicitamente".
- **`can_be_given` / `can_be_removed`**: Se o jogador pode colocar ou remover no editor de traços. Ambos vêm como `true` por padrão; coloque um em `false` para traços permanentes ou concedidos apenas pelo seu código.
- **`base_stats[...]`**: Os bônus de atributos. A lista completa de nomes de atributos está na página **[Referência de atributos](#/nml/stats)**.

> [!WARNING] Atributos vão **depois** de `add()`, sempre
> Um `ActorTrait` recém-instanciado não tem bloco de atributos. A biblioteca o aloca dentro de `add()`. Mexa em `base_stats` antes dessa linha e você terá o erro mais comum no modding de WorldBox:
> `NullReferenceException: Object reference not set to an instance of an object`
>
> A mesma regra vale para status, itens, construções e criaturas. A única exceção é `clone()`, que chama `add()` internamente por você.

> [!TIP] O mesmo interruptor existe em quase tudo que você cria
> `needs_to_be_explored` fica na classe base que todos os assets desbloqueáveis compartilham, então funciona em atores, nos sete tipos de traço, itens, modificadores e leis do mundo. Poderes divinos, status, construções, drops, nuvens, tiles e projéteis não têm etapa de descoberta :wbsmirk:.

### Os grupos de traços vanilla

`group_id` precisa ser um grupo existente, senão o seu traço não aparecerá em lugar nenhum:

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

Quer a sua própria aba? Veja **[Grupos de traços e abas](#/nml/trait-groups)**.

## Os textos de localização

Sem traduções o seu traço aparecerá no jogo como o identificador cru `trait_hello_swift`, o que parece exatamente tão profissional quanto soa :pepeclown:. Crie `Locales/pt.json`:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money."
}
```

A chave **não** é o id puro. Cada tipo de traço o antecede com o seu respectivo prefixo:

| Tipo de traço | Chave do nome | Chave do tooltip |
| --- | --- | --- |
| Actor trait | `trait_<id>` | `trait_<id>_info` |
| Culture trait | `culture_trait_<id>` | `culture_trait_<id>_info` |
| Religion trait | `religion_trait_<id>` | `religion_trait_<id>_info` |
| Subspecies trait | `subspecies_trait_<id>` | `subspecies_trait_<id>_info` |
| Clan trait | `clan_trait_<id>` | `clan_trait_<id>_info` |
| Language trait | `language_trait_<id>` | `language_trait_<id>_info` |
| Kingdom trait | `kingdom_trait_<id>` | `kingdom_trait_<id>_info` |

Há também uma segunda linha descritiva, `<prefix>_<id>_info_2`, usada por traços que precisam dela.

## Seu próprio ícone

`path_icon` é um caminho, e o arquivo PNG vai exatamente nesse caminho dentro da pasta `GameResources/` do seu mod. Sem extensão na string.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSwift.png
```

```csharp
swift.path_icon = "ui/Icons/iconHelloSwift";
```

Ícones de traços são pequenos e o jogo desenha em torno de 32x32. Coloque seu PNG em uma pasta própria se preferir: `ui/Icons/hellobox/iconSwift` funciona perfeitamente, só precisa bater com a string.

Os outros seis sistemas de traços têm suas próprias pastas vanilla (`ui/Icons/culture_traits/`, `religion_traits/`, `clan_traits/` etc.). Você não é obrigado a usá-las, mas colocá-las ao lado dos traços que você está imitando facilita encontrar suas artes depois. Tabela completa em **[Sprites e recursos](#/nml/sprites-and-resources)**.

## Fazendo um traço *fazer* algo

Atributos são estáticos. Um traço também pode executar seu código em quatro momentos cruciais:

```csharp
// a cada poucos segundos, enquanto a unidade estiver viva
swift.special_effect_interval = 3f;
swift.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreStamina(5);
    return true;
};

// quando a unidade morre
swift.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };

// quando a unidade nasce
swift.action_birth = (BaseSimObject pSelf, WorldTile pTile) => { return true; };

// quando a unidade sofre dano
swift.action_get_hit = (BaseSimObject pSelf, BaseSimObject pAttacker, WorldTile pTile) => { return true; };
```

Duas regras fundamentais: **verifique se é null e verifique se a unidade está viva antes de tudo**, e retorne `false` se você não fez nada. Esses callbacks rodam em todas as unidades que têm o traço, para sempre.

## Opostos e exclusões mútuas

```csharp
swift.addOpposite("slow");                            // os dois nunca poderão coexistir
swift.traits_to_remove_ids = new string[] { "fat" };  // ganhar este traço remove aquele
```

## Atribuindo o traço a uma unidade

```csharp
actor.addTrait(HelloTraits.SWIFT);

if (actor.hasTrait(HelloTraits.SWIFT))
{
    // ...
}
```

> [!WARNING] `spawn_random_trait_allowed` é lido uma única vez, na inicialização
> Unidades novas sorteiam seus traços iniciais de uma urna que `BaseTraitLibrary.linkAssets()` monta enquanto o jogo carrega, antes de o seu mod existir. Ligar a opção no seu traço não muda nada sozinho: seu traço nunca está nessa urna e nunca aparece por acaso. Coloque-o você mesmo, com o peso que o vanilla usa:
>
> ```csharp
> swift.spawn_random_trait_allowed = true;
> AssetManager.traits._pot_allowed_to_be_given_randomly.AddTimes(swift.spawn_random_rate, swift);
> ```
>
> `_pot_allowed_to_be_given_randomly` é `protected`, então isso compila contra o assembly publicizado com que o NML já compila o seu mod. `spawn_random_rate` vale `5` por padrão: aumente e o traço aparece com mais frequência.

## Verificando se funcionou

Abra o jogo, abra uma criatura, abra o editor de traços e procure na aba `physique`. Não está lá? O log sabe o porquê, e a resposta quase sempre é uma de três coisas: `can_be_given` está false, `group_id` não existe, ou `path_icon` aponta para o nada :wbreally:.

## Os outros seis tipos de traços

Os traços de criatura são apenas um de **sete** sistemas de traços. Cada um tem sua própria biblioteca, seus próprios grupos e sua própria entidade dona, e todos seguem exatamente o padrão desta página. Apenas o nome da classe, a biblioteca e o prefixo de tradução mudam.

| Sistema | Pertence a | Página |
| --- | --- | --- |
| Actor | uma criatura | esta página |
| Culture | uma cultura, compartilhada por suas cidades | **[Traços de cultura](#/nml/culture-traits)** |
| Religion | uma religião e seus fiéis | **[Traços de religião](#/nml/religion-traits)** |
| Subspecies | um ramo de uma espécie | **[Traços de subespécie](#/nml/subspecies-traits)** |
| Clan | uma linhagem de sangue | **[Traços de clã](#/nml/clan-traits)** |
| Language | um idioma e todos os seus falantes | **[Traços de idioma](#/nml/language-traits)** |
| Kingdom | a política de um reino | **[Traços de reino](#/nml/kingdom-traits)** |

Escolha o dono antes de escrever o traço. "Elfos atiram melhor" é um traço de cultura se deve se espalhar com suas cidades, um traço de subespécie se deve se propagar por reprodução, e um traço de criatura se pertence a um indivíduo específico. Errar nisso é a diferença entre um mod que transforma o mundo em uma hora e um que não faz absolutamente nada :PES_ThinkAboutIt:.
