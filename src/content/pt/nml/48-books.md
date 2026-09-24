---
title: Livros
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbscroll:
order: 187
---

# Livros :wbscroll:

Unidades escrevem livros (book), cidades guardam, e outras unidades leem e saem um pouco diferentes. Um tipo de livro é um novo tipo de livro nesse ciclo: quem escreve, como se chama, como é a capa e o que ler faz com você.

A página **[Traços linguísticos](#/nml/language-traits)** já cria um pequeno, o Almanaque de Brasa. Esta página pega o mesmo livro e termina: títulos próprios, uma recompensa de verdade e algo que acontece ao ler.

## Como um livro nasce

Nada aqui precisa de patch, você só precisa conhecer o ciclo:

1. Uma unidade decide escrever. O jogo junta todo tipo de livro cujo `requirement_check` passa para essa unidade.
2. Cada um entra num saco `writing_rate` vezes (ou `rate_calc` vezes, se você definir), **no máximo 10**, e um é sorteado.
3. O livro precisa de uma construção (building) com espaço livre para livros na **cidade** de quem escreve. Sem biblioteca (library), sem livro.
4. O título vem do gerador de nomes em `name_template`, e a capa da pasta em `path_icons`.
5. Depois, alguém lê e recebe as recompensas abaixo.

Como o jogo lê `book_types.list` de novo toda vez, um tipo de livro só precisa de `add()`. Sem pools, sem post-init. Uma rara surpresa boa :PESgn_Neat:.

## O código

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";
        public const string TITLES = "hello_book_titles";

        public static void Initialize()
        {
            Titles();

            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset almanac = new BookTypeAsset
            {
                id = ALMANAC,
                name_template = TITLES,              // our own titles, below
                color_text = "#D14219",
                writing_rate = 2,
                path_icons = "hello_almanac/",       // GameResources/books/book_icons/hello_almanac/
                requirement_check = (Actor pActor, BookTypeAsset pAsset) => pActor.hasTrait(HelloTraits.SWIFT),
                read_action = (Actor pActor, BookTypeAsset pAsset) =>
                {
                    // runs once per read, on the reader
                    StatusAsset curse = AssetManager.status.get(HelloStatus.CURSED);
                    if (curse != null) World.world.statuses.newStatus(pActor, curse, 0f);
                }
            };

            AssetManager.book_types.add(almanac);

            // what a reader gets out of it
            almanac.base_stats["experience"] = 5f;
            almanac.base_stats["happiness"] = 5f;
            almanac.base_stats["intelligence"] = 1f;   // this one is permanent, see below
        }

        /** A title generator in the dictionary style, built on the game's own book template. */
        private static void Titles()
        {
            if (AssetManager.name_generator.has(TITLES)) return;

            // $base_book_template$ already knows "of", "and", "about" and all the $name$ slots
            NameGeneratorAsset titles = AssetManager.name_generator.clone(TITLES, "$base_book_template$");
            titles.replacer += NameGeneratorReplacers.replaceOwnName;   // fills $unit$ with the writer
            titles.replacer += NameGeneratorReplacers.replaceOwnCity;   // fills $city$

            titles.addDictPart("almanac", "Almanac,Handbook,Notes,Scribbles,Field Guide");
            titles.addDictPart("fire", "Fire,Embers,Ash,Sparks,Smoke");
            titles.addTemplate("almanac,of,fire");
            titles.addTemplate("almanac,of,$unit$");
            titles.addTemplate("fire,and,$city$");
        }
    }
}
```

Este arquivo **substitui** o `HelloBooks.cs` da página de traços (trait) linguísticos, é a mesma classe crescida. `HelloBooks.Initialize()` vai depois do traço e do status que usa.

## O que ler dá

Os números em `base_stats` não são um bônus que passa. Cada leitura entrega eles uma vez:

| Atributo (stats) | O que o leitor ganha |
| --- | --- |
| `happiness` | Essa felicidade, como evento de "acabou de ler um livro". Negativo também funciona, para livros deprimentes |
| `experience` | Essa experiência |
| `mana` | Essa mana |
| `diplomacy`, `warfare`, `stewardship`, `intelligence` | Somados ao leitor **para sempre**. A cada leitura, de novo |

A última linha é a poderosa. Um livro que dá `intelligence = 1` deixa uma cidade leitora mais inteligente a cada geração, então mantenha pequeno. Um livro de +10 é o jeito de ter um reino (kingdom) de gênios até o ano 50 :wbgenius:.

Traços de idioma e de cultura (culture) podem mudar os dois primeiros: um idioma com `beautiful_calligraphy` aumenta a felicidade, e uma cultura com `reading_lovers` transforma livros tristes em alegres.

## Os campos que importam

| Campo | O que faz |
| --- | --- |
| `name_template` | O gerador de nomes dos títulos. Vanilla: `book_name_fable`, `book_name_love_story`, `book_name_history`... |
| `writing_rate` | O peso dele quando um escritor escolhe um tipo. O vanilla usa de 1 a 3 |
| `rate_calc` | Um método que devolve o peso no lugar, como o manual de guerra vanilla usando o `warfare` do escritor. Ainda no máximo 10 |
| `requirement_check` | Quem pode escrever. `null` = qualquer um |
| `read_action` | O seu próprio código, uma vez por leitura |
| `path_icons` | Uma pasta dentro de `books/book_icons/`, lida como lista de imagens. Uma é escolhida por livro |
| `color_text` | A cor do título na interface |
| `save_culture` / `save_religion` | Se o livro lembra a cultura e a religião (religion) de quem escreveu. Os dois ligados por padrão, e importam para livros que espalham uma fé |

## O gerador de títulos

Os títulos usam o estilo dicionário de **[Geradores de nomes](#/nml/name-generators)**. Um modelo é uma lista de chaves do dicionário, e cada chave escolhe uma palavra da sua lista:

- `addDictPart("almanac", "Almanac,Handbook,Notes")` cria uma chave com três palavras possíveis.
- `addTemplate("almanac,of,fire")` junta uma palavra de cada chave: "Handbook of Ash".
- Palavras como `$unit$` e `$city$` são espaços reservados. Um **replacer** preenche com o nome ou a cidade de verdade de quem escreveu. Sem o replacer certo, sai `$unit$`, literalmente, na capa :wbfacepalm:.

Clonar `$base_book_template$` é o atalho: ele já tem as palavras pequenas (`of`, `and`, `about`, `the`...), todos os espaços reservados e a arrumação de títulos do próprio jogo.

## O texto

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

As chaves são fixas: `book_type_<id>` e `book_type_info_<id>`. Os títulos são gerados, então não têm chaves.

## As suas capas

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── books/
        └── book_icons/
            └── hello_almanac/     <- one PNG per cover, any names
```

`path_icons` é uma **pasta**, com a `/` no final. Um PNG basta, só precisa estar dentro. Enquanto testa, pegue emprestada uma pasta vanilla como `fable/`.

Para ver funcionando, crie um mundo, deixe uma cidade com o seu traço crescer até construir uma biblioteca, e abra os livros da cidade. Demora, é um livro :PES2_Shrug:.
