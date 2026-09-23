---
title: Lembrando de coisas
group: NML Modding
subgroup: Avançado e publicação
icon: :wbfloppysavewink:
order: 44
---

# Lembrando de coisas :wbfloppysavewink:

Cedo ou tarde seu mod precisará lembrar de algo sobre uma unidade específica: quantas vezes ela foi atingida, se já recebeu sua recompensa ou em qual santuário ela reza. Um dicionário estático indexado pela unidade esquecerá absolutamente tudo no instante em que o jogador salvar e recarregar a partida :wbfacepalm:.

O jogo já possui um lugar projetado para isso. Cada unidade, cidade, reino, construção, item e livro mantém seu estado em um objeto de dados, e cada um deles possui um pequeno armazenamento de **dados personalizados** (custom data) que vai junto para o arquivo de save.

## O armazenamento

| Chamada | O que faz |
| --- | --- |
| `data.set(key, value)` | Armazena um `int`, `long`, `float`, `string` ou `bool` sob uma chave |
| `data.get(key, out value, default)` | Lê o valor de volta. Se a chave não existir, retorna o padrão |
| `data.change(key, amount, min, max)` | Soma a um `int` e limita o intervalo (clamp) em uma única chamada |
| `data.addFlag(key)` | Define uma flag. Retorna `false` se ela já estava ativa |
| `data.hasFlag(key)` / `data.removeFlag(key)` | Verifica ou remove a flag |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | Deleta um valor |

Cada tipo possui sua própria tabela interna, portanto um `int` e uma `string` sob a mesma chave não colidem. Ainda assim, para seu próprio controle, não compartilhe chaves entre tipos diferentes.


> [!NOTE] Armazenando algo maior que cinco tipos primitivos
> O NML tem seu próprio utilitário para guardar um objeto inteiro nos dados de uma unidade, não apenas `int`/`long`/`float`/`string`/`bool`. Eu nunca precisei de mais do que um contador ou uma flag, então não posso guiá-lo por isso aqui. Existe, se você precisar memorizar uma struct ou lista inteira.

## No HelloBox

Um traço que conta cada golpe desferido pelo portador e concede uma recompensa única ao atingir cinquenta golpes:

```csharp Mods/HelloBox/Code/HelloMemory.cs
namespace HelloBox
{
    public static class HelloMemory
    {
        public const string GRUDGE = "hello_grudge";      // the trait that remembers
        public const string HITS = "hello_hits";          // int: hits this unit has landed
        public const string VETERAN = "hello_veteran";    // flag: it already got its reward

        public static void Initialize()
        {
            if (AssetManager.traits.has(GRUDGE)) return;

            ActorTrait grudge = new ActorTrait
            {
                id = GRUDGE,
                path_icon = "ui/Icons/iconHelloGrudge",
                group_id = HelloGroups.TRAITS,
                needs_to_be_explored = false
            };

            grudge.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                Actor actor = pSelf as Actor;
                if (actor == null || !actor.isAlive()) return false;

                // lives in the unit's own save data, so it survives save and load
                actor.data.change(HITS, 1, 0, 100000);
                actor.data.get(HITS, out int hits);

                // addFlag() is false when the flag was already there: the reward happens once
                if (hits >= 50 && actor.data.addFlag(VETERAN))
                {
                    actor.addTrait("veteran");
                }
                return true;
            };

            AssetManager.traits.add(grudge);
            grudge.base_stats["damage"] = 2f;
        }

        /** Anyone can read it back, a window, a patch, another trait. */
        public static int GetHits(Actor pActor)
        {
            if (pActor == null) return 0;
            pActor.data.get(HITS, out int hits);
            return hits;
        }
    }
}
```

Salve o mundo e carregue-o novamente: a contagem continua lá, pois faz parte dos dados de salvamento da própria unidade. A flag é o que faz a recompensa acontecer uma única vez e não a cada golpe após o quinquagésimo.

Seus textos, como em qualquer traço:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_grudge": "Grudge",
  "trait_hello_grudge_info": "Remembers every blow it lands. Fifty, and it has seen enough to be a veteran."
}
```

> [!WARNING] `Actor.data` é `internal`
> O campo de dados de uma unidade é marcado como `internal` no assembly do jogo. O NML compila seu mod contra uma cópia **publicizada**, portanto funciona diretamente em um mod de código-fonte normal. Isso só quebra se você compilar sua própria `.dll` contra o assembly original sem modificações: veja **[Solução de problemas](#/troubleshooting)**. O campo `data` de cidades e reinos é público por padrão.

## Onde isso reside

| Objeto | Seus dados |
| --- | --- |
| Uma unidade | `actor.data` |
| Uma cidade | `city.data` |
| Um reino | `kingdom.data` |
| Uma construção | `building.data` |
| Culturas, religiões, clãs, idiomas, famílias, exércitos, complôs | os respectivos `data`, todos usam o mesmo armazenamento |

## Coisas para saber

- **Use prefixo em suas chaves.** Todos os mods escrevem no mesmo armazenamento. `hello_hits` nunca colidirá com ninguém; `hits` eventualmente colidirá.
- **Remover o mod é seguro.** As chaves permanecem no save, ninguém as lê e nada quebra. Essa é a enorme vantagem sobre patchear o formato de save nativo do jogo.
- **Armazenamentos vazios não custam nada.** O jogo descarta tabelas vazias antes de salvar, então uma chave removida realmente desaparece.
- **Mantenha os dados pequenos.** Eles são salvos com cada unidade. Um contador ou uma flag por criatura é levíssimo; uma string longa por unidade em um mundo com dez mil criaturas aumentará o save para todos.

Para tudo o que não estiver vinculado a um único objeto (como uma configuração global para todo o mundo), use as configurações do seu mod: veja **[Configurações do mod](#/nml/mod-config)** :PES_OkHand:.
