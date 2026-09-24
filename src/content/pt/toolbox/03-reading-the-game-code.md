---
title: Lendo o código do jogo (dnSpy)
group: Visão Geral
subgroup: Ferramentas externas e configuração
icon: :wbnerd:
order: 7
---

# Lendo o código do jogo :wbnerd:

Todas as respostas sobre como moddar WorldBox já estão escritas: elas estão dentro do próprio jogo :wbbru:. O **dnSpy** (ou **ILSpy**) transforma o arquivo compilado do jogo de volta em C# legível, para que você possa consultar com precisão como um método se chama, quais parâmetros ele aceita e o que realmente faz.

Esse é o maior salto de todos entre "ficar copiando código aleatório" e "moddar de verdade" :3074-woah:.

## Abrir o jogo

1. Baixe o [**dnSpy**](https://github.com/dnSpyEx/dnSpy/releases) (ou o [**ILSpy**](https://github.com/icsharpcode/ILSpy/releases), mesma proposta, botões diferentes).
2. Abra este arquivo:

```text
worldbox/worldbox_Data/Managed/Assembly-CSharp.dll
```

Esse único arquivo é o código do jogo inteiro. Na esquerda você tem a árvore de cada classe: `Actor`, `AssetManager`, `GodPower`, `ScrollWindow`, literalmente todas elas.

## As quatro coisas que você vai fazer o tempo todo

### 1. Procurar uma classe

`Ctrl+Shift+K` busca tipos. Digite `ActorTrait`, abra, e você vê todos os campos que pode definir, com o tipo e o valor padrão:

```csharp Assembly-CSharp / ActorTrait
public string path_icon;
public string group_id;
public int rate_birth;
public bool can_be_cured;
```

Essa lista *é* a documentação da página **[Traços personalizados](#/nml/custom-traits)**. Leia os **tipos** também: `rate_birth` é um `int`, então `rate_birth = 0.5f` não compila. O mesmo truque vale para `ItemAsset`, `BuildingAsset`, `StatusAsset`, qualquer coisa.

### 2. Checar a assinatura real de um método

Adivinhar nomes de métodos é o caminho mais rápido para queimar uma hora inteira em um erro de compilação. Pesquise direto. Procurar `addTrait` dentro de `Actor` mostra:

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool hasTrait(string pTraitID)
public void removeTrait(string pTraitID)
```

Agora você tem certeza de que ele recebe uma string, devolve um bool e tem um segundo argumento opcional.

### 3. Ver como o jogo faz

Essa é a grande sacada. Quer criar uma lei do mundo (world law) funcional? Encontre `WorldLawLibrary`, abra o `init()` e leia o que os desenvolvedores escreveram:

```csharp Assembly-CSharp / WorldLawLibrary.init()
world_law_mutant_box = add(new WorldLawAsset
{
    id = "world_law_mutant_box",
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_mutant_box",
    default_state = false
});
```

Copie essa estrutura, troque o id e o ícone, e a sua lei vai funcionar. Cada `*Library.init()` no jogo é um tutorial de graça para aquele tipo de asset.

### 4. Encontrar todos os IDs

IDs são strings comuns, e uma string errada simplesmente falha em silêncio. É nos métodos `init()` que eles ficam guardados: `TileLibrary.init()` tem cada ID de terreno, `ItemLibrary.init()` cada arma, `ActorAssetLibrary.init()` cada criatura.

## public, internal e você

Enquanto lê o código, você vai notar três palavrinhas na frente dos métodos:

| Palavra | O que significa para você |
| --- | --- |
| `public` | Você pode chamar. Sempre. |
| `internal` | Só pode ser chamado se você compilar contra uma cópia **publicized** de `Assembly-CSharp.dll` |
| `private` | Você não pode chamar diretamente. Encontre o método público que chama ele, ou faça um patch (veja **[Patches com Harmony](#/nml/harmony-patches)**) |

Uma DLL "publicized" é uma cópia onde todos os membros foram tornados públicos. A maioria dos modders de WorldBox usa uma, e é por isso que códigos como `actor.getHit(...)` compilam para eles e não para você. Se algo se recusar a compilar e o dnSpy indicar `internal`, o mistério está explicado.

> [!TIP] Deixe aberto enquanto programa
> Não é para "ler o jogo inteiro", ninguém em sã consciência faz isso. Abra ao lado do seu editor e consulte cada nome conforme for precisando. Dois segundos ali valem muito mais do que vinte minutos batendo cabeça num erro de compilação sem sentido :PES_ThumbsUp:.

Quando você só precisa do nome de um método e da sua assinatura, a **[Busca de métodos](#/tools/methods)** deste site é mais rápida: cada método do jogo, pesquisável diretamente e com os `internal` já sinalizados. Volte ao dnSpy quando precisar ler o que o método realmente *faz*: essa é a parte que índice nenhum consegue te entregar.
