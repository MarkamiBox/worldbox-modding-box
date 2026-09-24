---
title: Traços linguísticos
group: Conteúdo do jogo
subgroup: Traços e genética
icon: :wbconfused:
order: 112
---

# Traços linguísticos :wbconfused:

Um **idioma** pertence a cidades e reinos, sofre variações ao se propagar e serve de veículo no qual os **livros** são escritos. Um traço linguístico é uma propriedade intrínseca da palavra falada e escrita.

É o menor dos sete sistemas de traços e o que possui o hook mais específico do jogo: código executado quando alguém **lê um livro** escrito naquele idioma. Sim, sério :wbscroll:.

| | |
| --- | --- |
| Biblioteca | `AssetManager.language_traits` |
| Classe | `LanguageTrait` |
| Grupos | `AssetManager.language_trait_groups`, classe `LanguageTraitGroupAsset` |
| Dono em tempo de execução | `Language`, em `World.world.languages` |
| Prefixo de localização | `language_trait_` |
| Pasta de ícones padrão | `ui/Icons/language_traits/` |

## Registrando um

```csharp Mods/HelloBox/Code/HelloLanguage.cs
namespace HelloBox
{
    public static class HelloLanguage
    {
        public const string CLIPPED = "hello_clipped";

        public static void Initialize()
        {
            if (AssetManager.language_traits.has(CLIPPED)) return;

            LanguageTrait trait = new LanguageTrait
            {
                id = CLIPPED,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "knowledge",
                path_icon = "ui/Icons/iconHelloLanguage",
                value = 2f,                    // quanto este traço "vale". Veja abaixo
                rarity = Rarity.R1_Rare
            };

            AssetManager.language_traits.add(trait);

            trait.addOpposite("scribble");
            trait.base_stats["intelligence"] = 2;
        }
    }
}
```

Os atributos `base_stats` do idioma **realmente** chegam às unidades: `Actor.updateStats()` mescla `language.base_stats` em cada falante. Veja a ordem de fusão na **[Referência de atributos](#/nml/stats)**.

## O hook de livros

`read_book_trait_action` é o campo exclusivo dos traços linguísticos. Ele dispara quando uma unidade conclui a leitura de um livro escrito naquele idioma:

```csharp
public delegate void BookTraitAction(Actor pActor, LanguageTrait pTrait, Book pBook);
```

```csharp
trait.value = 0.2f;   // o jogo base reutiliza `value` como a chance para este hook

trait.read_book_trait_action = delegate(Actor pActor, LanguageTrait pTrait, Book pBook)
{
    if (pActor == null || !pActor.isAlive()) return;
    if (pActor.hasTrait("evil")) return;
    if (!Randy.randomChance(pTrait.value)) return;

    pActor.addTrait("hello_swift");
};
```

É exatamente assim que os manuscritos amaldiçoados e abençoados do jogo base funcionam: `words_of_madness` testa contra `value` e adiciona o traço `madness`, `cursed_font` aplica um status, `font_of_gods` aplica um melhor.

Duas boas práticas para copiar do jogo base:

- **Leia a probabilidade em `pTrait.value`, nunca em uma constante fixa.** O traço é entregue como parâmetro para que o mesmo delegate atenda a múltiplos traços com intensidades variadas.
- **Interrompa cedo para unidades imunes.** Todas as implementações do jogo base verificam `evil` ou `blessed` primeiro.

## Seu próprio tipo de livro

O jogo define formatos de livros em `AssetManager.book_types`:

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";

        public static void Initialize()
        {
            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset book = new BookTypeAsset
            {
                id = ALMANAC,
                name = "book_type_" + ALMANAC,
                description = "book_type_info_" + ALMANAC,
                rarity = 5
            };
            AssetManager.book_types.add(book);
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

## O campo `value`

`value` existe em todas as classes de traços, mas é nos idiomas que seu uso se destaca. O jogo base o emprega de duas formas distintas:

| Uso | Exemplo |
| --- | --- |
| Qualidade do idioma | `melodic` e `stylish_writing` usam `value = 3f` |
| Probabilidade do hook de leitura | `words_of_madness` usa `value = 0.1f` |

Não há regra rígida; defina um sentido por traço e mantenha a consistência.

## Opostos

Traços linguísticos formam pares contrários com mais frequência que qualquer outro sistema, pois um idioma tem uma gramática estruturada ou não tem:

```csharp
trait.addOpposite("scribble");
```

Declare dos dois lados, assim como o jogo base declara `scribble` e `nicely_structured_grammar` como opostos mútuos.

## Os grupos vanilla

`knowledge` · `spirit` · `harmony` · `chaos` · `miscellaneous` · `fate` · `special`

Para criar sua própria aba: veja **[Grupos de traços e abas](#/nml/trait-groups)**, com `AssetManager.language_trait_groups` e `LanguageTraitGroupAsset`.

## Os textos

```json Mods/HelloBox/Locales/en.json
{
  "language_trait_hello_clipped": "Clipped",
  "language_trait_hello_clipped_info": "Every sentence ends two words early. Nobody minds."
}
```

## Distribuindo o traço

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addLanguageTrait(HelloLanguage.CLIPPED);
```

```csharp
foreach (Language language in World.world.languages)
{
    if (language == null || language.isRekt()) continue;

    language.addTrait(HelloLanguage.CLIPPED, pRemoveOpposites: true);
}
```

Um objeto `Language` também disponibiliza `cities`, `kingdoms` e `books`, que é o que seu código consultará para verificar onde um idioma se fez presente.

> [!TIP] Livros são um meio de entrega subutilizado
> Um livro escrito no seu idioma é uma forma gradual e orgânica de espalhar um traço ou status. Ele circula por bibliotecas, atravessa gerações e o jogador assiste ao processo acontecer. Quase ninguém faz mods com isso, o que o torna uma excelente oportunidade :PES4_Classy:.

## Novas línguas sorteando um traço por conta própria

Além de concedê-lo manualmente, um traço de língua pode definir `spawn_random_trait_allowed` para ser sorteado quando uma nova língua se forma, da mesma forma que uma cultura sorteia seus traços iniciais. A mesma armadilha de todas as outras páginas de traços:

> [!WARNING] `spawn_random_trait_allowed` é lido apenas uma vez, na inicialização
> Novas línguas sorteiam seus traços iniciais de um grupo que `BaseTraitLibrary.linkAssets()` constrói durante o carregamento do jogo, antes do seu mod existir. Definir a flag no seu traço não muda nada por si só: seu traço nunca estará nesse grupo e nunca aparecerá por acaso em uma nova língua. Adicione-o você mesmo, com o peso que o jogo vanilla usa:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.language_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` é `protected`, portanto compila contra o assembly publicizado com o qual o NML já compila seu mod. `spawn_random_rate` tem o valor padrão de `5`: aumente-o para que o traço apareça com mais frequência.
