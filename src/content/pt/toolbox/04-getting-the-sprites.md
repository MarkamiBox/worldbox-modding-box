---
title: Extraindo os gráficos do jogo (AssetRipper)
group: Visão Geral
subgroup: Ferramentas externas e configuração
icon: :wbgeneralartist:
order: 8
---

# Extraindo os gráficos do jogo :wbgeneralartist:

O código te ensina *o que* escrever. O **AssetRipper** te mostra qual é a cara dos gráficos e, mais importante ainda, **qual é o caminho exato deles**.

Cada ícone, unidade, construção (building) e efeito no WorldBox é carregado a partir de uma string de caminho como `ui/Icons/iconFly`. Se você errar esse caminho, o seu botão vira um buraco invisível na interface. Com o AssetRipper você para de chutar no escuro.

> [!TIP] Se você só precisa do caminho, não precisa de nada disso
> A **[Pesquisa de ícones](#/tools/icons)** deste site foi criada exatamente a partir desta exportação: todos os caminhos do jogo pesquisáveis. Extraia o jogo você mesmo quando quiser *ver* a arte, escolher o tamanho certo ou combinar a paleta. É para isso que serve o restante desta página :PES4_HappyAwesome:.

## Exportar o jogo

1. Baixe o [**AssetRipper**](https://github.com/AssetRipper/AssetRipper/releases).
2. Aponte para a sua pasta do WorldBox (aquela com o `worldbox_Data`).
3. Exporte para uma pasta da sua escolha. Isso leva alguns minutos e consome alguns gigabytes :pepehang:.

Você vai receber um projeto do Unity. A única parte que realmente te interessa é a pasta exportada `Resources`, a mesma árvore que o jogo consulta em tempo de execução.

## Transformando um arquivo em caminho

A regra é básica: **o caminho é a localização dentro de `Resources`, sem a extensão do arquivo.**

```text
ExportedProject/Assets/Resources/ui/Icons/iconFly.png
                                 └───────┬────────┘
                                         │
                      SpriteTextureLoader.getSprite("ui/Icons/iconFly")
```

Estas são as pastas que você mais vai usar:

| Pasta | O que tem nela |
| --- | --- |
| `ui/Icons/` | Todos os ícones pequenos da interface: traits, poderes, botões |
| `ui/Icons/worldrules/` | Ícones das leis do mundo (world law) |
| `actors/` | Unidades e seus quadros de animação |
| `buildings/` | Casas, árvores, minérios |
| `effects/` | Explosões, projéteis (projectile), sprites de efeitos de status |

## Usando no seu mod

Encontre um ícone que você gostou na exportação, anote o caminho dele e use diretamente, sem precisar copiar nenhum arquivo: ele já existe no jogo:

```csharp Mods/HelloBox/Code/HelloPowers.cs
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
```

Ou defina direto como string em um asset:

```csharp
trait.path_icon = "ui/Icons/iconFly";
```

## Imitando o estilo para criar sua própria arte

Se você for desenhar seus próprios sprites, abra um arquivo vanilla primeiro e copie três coisas:

- **O tamanho.** Ícones de traits e poderes são pequenos, normalmente entre 16 e 32 px. Abra um e respeite essa escala.
- **A paleta de cores.** O WorldBox usa uma paleta reduzida e de tons suaves. Puxe as cores com o conta-gotas de um sprite oficial e o seu ícone não vai parecer deslocado :PES3_BobRoss:.
- **O pivô (pivot).** Unidades e construções ficam pisando no chão, então o pivô de ancoragem delas fica embaixo no centro. É o valor `PivotY: 0.0` no seu arquivo `sprites.json` (veja **[Sprites e recursos](#/nml/sprites-and-resources)**).

Depois é só jogar o seu PNG em `GameResources/` mantendo a mesma estrutura de pastas, e ele vai carregar exatamente como se fosse vanilla:

```text
Mods/HelloBox/GameResources/ui/Icons/iconHello.png   ->   "ui/Icons/iconHello"
```
