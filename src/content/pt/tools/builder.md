---
title: Construtor de conteúdo
group: Ferramentas de modding
icon: :wbhammer:
order: 405
---

# Construtor de conteúdo :wbhammer:

Escolha o que você quer criar, preencha os campos e leve tudo: o arquivo de código, o texto para o seu arquivo de `Locales` e onde exatamente colocar a sua arte. Ele escreve o mesmo código que as páginas do guia ensinam, incluindo os passos que todo mundo esquece, como os pools, os campos do post-init e as chaves de texto que não batem com o id.

::tool:builder::

## Como usar o que ele te dá

1. **O código** vai na pasta `Code/` do seu mod, num arquivo com o nome que aparece em cima do bloco.
2. **O texto** vai em `Locales/<idioma>.json`. Se você já tem esse arquivo, copie só as linhas de dentro das `{ }`, e cuidado com as vírgulas.
3. **A arte** vai exatamente onde a lista diz. Leia a palavra ao lado de cada uma: **pasta** quer dizer uma pasta de PNGs, mesmo que você só tenha um quadro. Um PNG solto onde deveria ser uma pasta é o motivo número um de a arte não aparecer :wbfacepalm:.
4. **A linha do Main.cs** vai dentro de `OnModLoad()`. A ordem importa: um traço que fica na sua própria aba precisa da aba primeiro, um item que custa o seu próprio recurso precisa do recurso primeiro.

Abra o jogo e olhe o log. Se algo estiver errado, o link **Explicação completa** embaixo do seletor leva para a página que explica esse conteúdo em detalhe.

> [!TIP] Mude os valores padrão
> Todo id no construtor começa com `my_`. Troque por algo seu, como `hello_` no HelloBox. Dois mods que adicionam um `my_trait` brigam por ele, e só um ganha :PESgn_Stop:.

## Modelos

O último grupo do seletor, **Templates**, funciona diferente. Criaturas, construções, desastres, IA, tramas e janelas são principalmente a sua própria lógica, então nenhum formulário conseguiria escrever isso por você. Em vez disso, você recebe o arquivo que funciona da própria página do guia, renomeado com o seu namespace e o seu prefixo. Ele compila e roda do jeito que está, e a página por trás de **Explicação completa** explica cada linha, para você saber o que mudar.

## O que ele não faz

O construtor te dá conteúdo que **funciona**. O que ele não consegue é inventar a sua ideia por você. Onde um recurso precisa da sua própria lógica, como um traço que faz algo especial ou um poder que faz algo novo, ele deixa um espaço bem marcado `// your code here`. A página por trás do link **Explicação completa** mostra o que você pode colocar ali.
