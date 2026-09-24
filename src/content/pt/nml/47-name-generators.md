---
title: Geradores de nomes
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbscroll:
order: 186
---

# Geradores de nomes :wbscroll:

Todo nome no WorldBox sai de um gerador: unidades, cidades, reinos, clãs, guerras, livros. As suas criaturas podem ter o delas, para que uma vila de espíritos de brasa seja cheia de Ashra e Cindox em vez de pegar nomes humanos emprestados.

## De onde vem um nome

Três passos, da criatura até as letras:

| Passo | Asset | O que guarda |
| --- | --- | --- |
| A criatura | `ActorAsset.name_template_sets` | Uma lista de ids de **conjuntos de nomes**. Um é escolhido por cultura |
| O conjunto | `NameSetAsset` (`name_sets`) | Qual gerador usar para cada tipo de coisa: `unit`, `city`, `kingdom`, `clan`, `family`, `culture`, `language`, `religion` |
| O gerador | `NameGeneratorAsset` (`name_generator`) | Como o nome é montado de verdade |

Então, para renomear uma espécie inteira, você faz um gerador, um conjunto que usa ele, e aponta a criatura para o conjunto.

## Três jeitos de montar um nome

Um gerador funciona em um de três estilos, e o jogo escolhe pelos campos que você preencheu:

- **Grupos de partes.** Uma lista de grupos, e um pedaço aleatório de cada um é colado no outro. O mais simples, e o que esta página usa.
- **Dicionário.** Palavras inteiras tiradas de listas com nome e colocadas numa frase. É assim que guerras e livros ganham títulos como "Bloody Hatred". Veja **[Tipos de guerra](#/nml/war-types)** e **[Livros](#/nml/books)**.
- **Onomástica.** Um formato de texto compacto que a maioria das civilizações vanilla usa, e que também deixa os nomes mudarem com o tempo numa cultura. É poderoso e eu não começaria por ele: copie um de `NameGeneratorLibrary` se quiser e troque as sílabas.

## O código

```csharp Mods/HelloBox/Code/HelloNames.cs
namespace HelloBox
{
    public static class HelloNames
    {
        public const string GENERATOR = "hello_sprite_name";
        public const string SET = "hello_sprite_set";

        public static void Initialize()
        {
            if (AssetManager.name_generator.has(GENERATOR)) return;

            NameGeneratorAsset generator = new NameGeneratorAsset
            {
                id = GENERATOR,
                // post_init() fills these two for part-group generators, and it already ran.
                // Female names add a vowel from this list, so leaving it null crashes.
                vowels = new string[] { "a", "e", "i", "o" },
                consonants = NameGeneratorAsset.consonants_sounds
            };

            // one piece from each group, in order. An empty entry means "sometimes nothing"
            generator.addPartGroup("ash,cin,em,sol,vol,ky");
            generator.addPartGroup("a,e,i,o,,");
            generator.addPartGroup("ra,dox,ber,rin,th,x");
            generator.addTemplate("Part_group");   // capital P = first letter upper case

            AssetManager.name_generator.add(generator);

            // the same generator for everything these creatures ever name
            AssetManager.name_sets.add(new NameSetAsset
            {
                id = SET,
                unit = GENERATOR,
                city = GENERATOR,
                kingdom = GENERATOR,
                clan = GENERATOR,
                family = GENERATOR,
                culture = GENERATOR,
                language = GENERATOR,
                religion = GENERATOR
            });
        }
    }
}
```

Depois, na sua criatura de **[Atores personalizados](#/nml/custom-actors)**:

```csharp
asset.name_template_sets = new string[] { HelloNames.SET };
```

`HelloNames.Initialize()` vai **antes** dos atores no `OnModLoad`, porque o ator aponta para o conjunto.

> [!WARNING] Preencha todos os espaços do conjunto
> Uma cultura pede ao conjunto um gerador para cada tipo de coisa. Um espaço `city` vazio significa que o jogo procura um gerador chamado `""`, recebe `null`, e a primeira cidade que as suas criaturas fundarem derruba o jogo junto. Use o mesmo gerador em todos se não tiver nada melhor :PESgn_Stop:.

## As palavras dos modelos

Um modelo é uma lista de palavras separadas por vírgula. Para geradores de grupos de partes, estas são as úteis:

| Palavra | O que adiciona |
| --- | --- |
| `part_group` / `Part_group` | Um pedaço de cada grupo de `addPartGroup`. O P maiúsculo deixa a primeira letra maiúscula |
| `part_group2`, `part_group3` | O mesmo para `addPartGroup2` e `addPartGroup3`, para uma segunda ou terceira palavra |
| `space` | Um espaço, então `Part_group,space,Part_group2` faz nome e sobrenome |
| `vowel` / `consonant` | Uma letra das suas `vowels` / `consonants` |
| `number` | Um dígito de 0 a 9. Para robôs, eu acho |

Chame `addTemplate` mais de uma vez e o jogo escolhe um modelo aleatório para cada nome.

## Testando sem esperar bebês

`NameGenerator.getName` é público, então você pode imprimir dez nomes no log ao carregar:

```csharp
for (int i = 0; i < 10; i++)
{
    LogInfo(NameGenerator.getName(HelloNames.GENERATOR));
}
```

Se metade parecer que um gato andou no teclado, os seus grupos estão longos demais. Pedaços curtos, mais grupos. Nomes que estão na lista negra do jogo são descartados e sorteados de novo, então você nunca vai ver um :PES5_Noted:.

Para títulos de palavras inteiras (guerras, livros, lemas), o estilo dicionário é o que você quer, e as próximas duas páginas constroem um cada.
