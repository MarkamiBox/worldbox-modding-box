---
title: Navegador de campos de asset
group: Ferramentas de modding
icon: :wbwise:
order: 430
---

# Navegador de campos de asset :wbwise:

Cada asset possui um conjunto fixo de campos reais extraídos do jogo descompilado.

Escolha o tipo de asset, filtre e clique para copiar.

::tool:fields::

## Como ler

- **A coluna da esquerda** é o tipo. `int` significa número inteiro, então `rate_birth = 0.5f` não compila. `float` aceita decimal e quer o sufixo `f`, como `0.5f`. `string` aceita texto entre aspas.
- **O `= value`** é o padrão que o jogo já dá a esse campo. Se o padrão te serve, não defina. Menos código, menos erros de digitação.
- **"inherited from"** significa que o campo vem de uma classe pai. Funciona exatamente igual; só está declarado mais acima. `id`, `base_stats` e `path_icon` costumam ser herdados.
- **A cadeia acima da tabela** (ex.: `ActorTrait -> BaseTrait -> BaseAugmentationAsset -> Asset`) mostra de onde vêm os campos, do mais específico primeiro.

> [!WARNING] Campos não são a história toda
> Esta ferramenta diz que um campo **existe** e qual é o tipo. Ela não diz se o jogo realmente o lê no seu caso: alguns campos só importam para unidades civilizadas, ou só quando outra opção está ligada. Na dúvida, ache um asset vanilla que faça o que você quer e copie os valores, veja **[Lendo o código do jogo](#/toolbox/reading-the-game-code)**.
