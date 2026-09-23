---
title: Olhando por dentro do jogo (UnityExplorer)
group: Visão Geral
subgroup: Ferramentas externas e configuração
icon: :wbeyeball:
order: 6
---

# Olhando por dentro do jogo :wbeyeball:

O **UnityExplorer** é um inspetor dentro do jogo. Ele permite pausar em qualquer tela, clicar em qualquer janela, botão ou unidade, e ler todos os seus valores em tempo real.

Por que você vai querer isso: em vez de ficar adivinhando do que uma janela vanilla é feita, você abre e simplesmente *olha*. Qualquer pergunta do tipo "como diabos eles fizeram isso?" vira uma resposta de dois minutos.

## Como instalar

1. Deixe o **BepInEx** funcionando primeiro, veja **[O console ao vivo](#/toolbox/bepinex-console)**.
2. Baixe o [**UnityExplorer para BepInEx 5 (Mono)**](https://github.com/sinai-dev/UnityExplorer/releases) (pegue o arquivo `UnityExplorer.BepInEx5.Mono.zip` na página de releases).
3. Extraia o zip em `C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\plugins/`. Certifique-se de que tanto o `UnityExplorer.BIE5.Mono.dll` quanto a dependência companheira `UniverseLib.Mono.dll` fiquem lá dentro!
4. Inicie o jogo e aperte **F7** (a tecla de atalho padrão).

```text
worldbox/ (C:\Program Files (x86)\Steam\steamapps\common\worldbox\)
└── BepInEx/
    └── plugins/
        └── sinai-dev-UnityExplorer/ (or directly in plugins/)
            ├── UnityExplorer.BIE5.Mono.dll
            └── UniverseLib.Mono.dll
```

## Os três painéis que você vai realmente usar

| Painel | Para que serve |
| --- | --- |
| **Object Explorer → Scene Explorer** | A árvore ao vivo de absolutamente tudo na tela. Sua janela está escondida em algum lugar por aqui |
| **Inspector** | Clique em qualquer objeto da árvore para ver todos os componentes e campos, com seus valores atuais |
| **C# Console** | Digite uma linha de C# e rode direto no jogo aberto. Sem reiniciar nada |

## Exemplo 1: descobrir como uma janela vanilla é construída

Você quer que a sua janela personalizada tenha a mesma cara das janelas do jogo. Então:

1. No jogo, abra a janela que você quer imitar (Leis do Mundo, por exemplo).
2. Pressione F7, vá em **Object Explorer → Scene Explorer** e expanda `CanvasMain` → `canvas_ui`.
3. Vá clicando pelos filhos até que o objeto destacado seja a janela que você abriu.
4. No Inspector, examine seus componentes: a `Image` com seu sprite 9-slice, os tamanhos no `RectTransform`, o `ScrollRect`.

Agora você já sabe as dimensões, o caminho do sprite e a estrutura exata para copiar na página de **[Janelas personalizadas](#/nml/custom-windows)**. É assim que você evita passar três horas chutando âncoras no escuro :PES5_Peek:.

## Exemplo 2: ler os valores reais dos campos de um asset

Abra o **C# Console** e execute:

```csharp UnityExplorer C# console
var t = AssetManager.traits.get("strong");
UnityExplorer.ExplorerCore.Log(t.path_icon);
UnityExplorer.ExplorerCore.Log(t.group_id);
```

Na saída de log do UnityExplorer, você verá imediatamente:

```text
[Message:UnityExplorer] ui/Icons/actor_traits/iconStrong
[Message:UnityExplorer] physique
[Message:UnityExplorer] Invoked REPL (no return value)
```

Você acabou de ler o caminho do ícone e o grupo de um trait vanilla, direto do jogo rodando. Copie para o seu próprio trait e ele vai parar exatamente no mesmo lugar da interface, com um ícone que existe de verdade.

## Exemplo 3: testar uma ideia antes de criar um mod inteiro para ela

Ainda no console C#:

```csharp UnityExplorer C# console
// spawna um lobo no ladrilho em x=100, y=100
var tile = World.world.GetTile(100, 100);
World.world.units.spawnNewUnit("wolf", tile);
```

Se funcionar aqui, vai funcionar no seu mod. Se estourar uma exceção aqui, você acabou de economizar um ciclo inteiro de compilar e reiniciar o jogo :aPES2_ThumbsUp:.

> [!TIP] Use junto com o console
> O UnityExplorer responde à pergunta "do que isso é feito?". O console do BepInEx responde a "meu código chegou a rodar?". Quase todo problema de modding se resume a uma dessas duas perguntas.
