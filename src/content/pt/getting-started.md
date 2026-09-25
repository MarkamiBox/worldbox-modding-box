---
title: Começando
group: Visão Geral
icon: :wbsalut:
order: 3
---

# Começando :wbsalut:

O que você precisa antes de escrever sua primeira linha de código. Siga estas etapas em ordem; leva cerca de quinze minutos.

> [!NOTE] Você não precisa saber programar ainda
> E você **não** precisa do Visual Studio, de um compilador nem de nada disso. O NML lê os arquivos de texto `.cs` na pasta do seu mod e os compila para você quando necessário. **O Bloco de Notas é uma forma perfeitamente válida de escrever seu primeiro mod** :PES_OkHand:. Você poderá atualizar suas ferramentas mais tarde, quando realmente sentir falta de algo.

## 1. Encontre sua pasta do WorldBox

Você será instruído a colocar arquivos "na pasta do WorldBox" cerca de quarenta vezes neste guia, então localize-a de uma vez:

**Steam → clique com o botão direito no WorldBox → Gerenciar → Explorar arquivos locais.**

Uma janela do Explorer se abrirá na pasta que contém o `worldbox.exe`. Na maioria dos PCs, é:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Deixe essa janela aberta ou fixe-a em algum lugar fácil. Sempre que este guia falar sobre *a pasta do WorldBox*, refere-se a essa :gatoxd:.

## 2. Ative o Modo Experimental

Sem ele, os mods não carregam. Não é que "funcionam mal", eles simplesmente não carregam: nenhum erro, nada.

No jogo: abra as **Configurações**, encontre o **Modo Experimental** e ative-o. Após cada atualização do jogo, verifique novamente: o jogo o desativa sozinho quando a versão muda.

## 3. Instale o NeoModLoader

O **NML** é o que encontra seu mod, o compila e o executa. Sem o NML não há modding. Nunca fez isso antes? **[Instalar o NML](#/install-nml)** descreve cada clique, inclusive no Mac.

1. Baixe o `NeoModLoader.dll` mais recente na [página de lançamentos do NML](https://github.com/WorldBoxOpenMods/ModLoader/releases). Apenas um arquivo, é tudo de que você precisa.
2. Na sua pasta do WorldBox, vá em `worldbox_Data\StreamingAssets\Mods/`.
3. Cole o `NeoModLoader.dll` lá dentro.

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            └── NeoModLoader.dll   <- aqui
```

Inicie o jogo. Se funcionou, haverá um novo botão com o logo do NML entre as abas inferiores e uma pasta `Mods` vazia ao lado do `worldbox.exe`. Se não estiver lá, revise a etapa 2 :PES5_Hmmmm:.

> [!TIP] Deixe a Steam mantê-lo atualizado
> Também existe um [item do NML na Oficina Steam](https://steamcommunity.com/sharedfiles/filedetails/?id=3080294469). Inscrever-se nele não instala o NML sozinho, mas mantém sua cópia atualizada após a instalação manual acima.

## 4. Um editor de texto

Qualquer coisa que salve texto puro serve. Mais ou menos em ordem de "bom ter":

| | |
| --- | --- |
| **Bloco de Notas** | Já está no seu PC. Realmente suficiente para o seu primeiro mod |
| **[VS Code](https://code.visualstudio.com/)** | Gratuito, leve, colore seu código e avisa sobre erros de digitação. A melhor escolha para a maioria |
| **Visual Studio** | O gigante. Autocompleta métodos do jogo se você vinculá-lo à `.dll` do WorldBox. Exagero até você estar escrevendo muito código |

Qualquer que seja sua escolha: ao salvar um arquivo `.cs`, certifique-se de que ele seja salvo como `.cs` e **não** como `.cs.txt`. O Bloco de Notas adora pregar essa peça :PESgn_SMH:.

## 5. É isso, vá criar algo!

Vá para **[Estrutura de um mod](#/nml/mod-structure)** na seção NML Modding e depois para **[Seu primeiro mod](#/nml/your-first-mod)** :gatoxd: !

---

## Coisas para instalar mais tarde, não agora

Você **não** precisa disso para criar um mod. Volte aqui quando uma página indicar.

- **[O console em tempo real (BepInEx)](#/toolbox/bepinex-console)**: uma janela preta que exibe seus logs enquanto você joga, sem precisar abrir um arquivo de log depois. Instale-o cedo, economiza muito tempo.
- **[UnityExplorer](#/toolbox/unity-explorer)**: clique em qualquer elemento do jogo e veja de que ele é feito por dentro.
- **[dnSpy ou ILSpy](#/toolbox/reading-the-game-code)**: abre o código original do jogo para você ver como os desenvolvedores implementaram algo.
- **[AssetRipper](#/toolbox/getting-the-sprites)**: extrai sprites e sons do jogo para você combinar com o estilo oficial.
- **[Modding com BepInEx](#/toolbox/bepinex-modding)**: criar plugins `.dll` pré-compilados se você quer hooks de baixo nível no motor Unity em vez de conteúdo NML.

> [!NOTE] Lendo mods NCMS mais antigos
> O NML inclui uma camada de compatibilidade com o NCMS, incluindo suporte ao antigo ponto de entrada `[ModEntry]`. Isso não conserta chamadas a APIs do jogo que mudaram. Teste um mod mais antigo contra as suas versões do jogo e do NML antes de confiar nele. Comece o HelloBox com `BasicMod<Main>`, como o guia faz.

Próximo: **[Estrutura de um mod](#/nml/mod-structure)**.
