---
title: Como instalar o NML
group: NML Modding
icon: :wbhammer:
order: 1
---

# Instalar o NML :wbhammer:

O **NML** (NeoModLoader) é o programa que faz os mods de WorldBox funcionarem. Você instala o NML uma vez, e depois instalar um mod é só copiar uma pasta.

Esta página parte do princípio de que você nunca fez nada disso. Se você sabe o que é um `.dll`, pule para **[a versão curta](#a-versão-curta)** :PES_OkHand:.

> [!NOTE] Windows, Mac e Linux (Steam Deck)
> Os mods funcionam na **versão Steam para Windows, Mac e Linux** (incluindo Steam Deck / SteamOS). Não em celulares, tablets ou consoles.

## A versão curta

1. No jogo: **Configurações → Experimental Mode → ligado**.
2. Baixe o `NeoModLoader.dll` na [página oficial de versões](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest).
3. Coloque em `worldbox_Data/StreamingAssets/Mods/` dentro da sua pasta do WorldBox.
4. Apague dessa mesma pasta tudo que tiver `NCMS` no nome.
5. Abra o jogo. Os mods agora vão na pasta `Mods` ao lado do `worldbox.exe`.

É isso. O resto da página são os mesmos cinco passos, com cada clique escrito.

---

## Windows

### Passo 1. Ligue o Experimental Mode

1. Abra o WorldBox normalmente, pela Steam.
2. Abra a janela de **Configurações** do jogo.
3. Procure na lista **Experimental Mode** (com o jogo em português: **Modo experimental**) e ligue.
4. Feche o jogo.

Sem esse botão o jogo nem procura mods. Nenhum erro, nenhuma mensagem, simplesmente nada :PES5_Hmmmm:.

> [!WARNING] Existem duas pastas chamadas Mods
> Esta, dentro de `worldbox_Data\StreamingAssets\Mods/`, é apenas para o **próprio NML** (especificamente `NeoModLoader.dll`) e nada mais. A pasta onde você colocará os seus **mods** é separada, localizada diretamente na raiz do jogo ao lado de `worldbox.exe` (`worldbox\Mods/`). Ela ainda não existe; o NML a criará automaticamente na primeira inicialização. Colocar um mod em `StreamingAssets\Mods/` ou o NML em `worldbox\Mods/` é o erro mais comum desta página.

### Passo 2. Baixe o NML

1. Abra este link: **[github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest)**. Ele sempre aponta para o NML mais novo, então você pode salvá-lo nos favoritos.
2. Role até a seção chamada **Assets**. Se estiver recolhida, clique para abrir.
3. Clique em **NeoModLoader.dll**. Ele baixa como qualquer outro arquivo, normalmente na pasta **Downloads**.

Você só precisa desse arquivo. A página também lista `nml-setup-win.exe` e arquivos terminados em `.pdb`, `.xml` e "Source code": ignore todos. Eles são para os desenvolvedores do NML, não para você.

> [!WARNING] Só por esse link
> Um `.dll` é um programa. Baixe o NML **só** pela página do GitHub acima, nunca pelo CurseForge, outro site ou um arquivo que alguém te mandou num chat. Uma cópia antiga de qualquer outro lugar se apaga sozinha na primeira vez que o jogo inicia, deixando só uma pasta `NML` e `NeoModLoader.AutoUpdate_memload.dll` - se isso acontecer, volte aqui e baixe o arquivo de verdade. O botão de "instalação em 1 clique" do GameBanana também não instala o NML; baixe o `.dll` à mão.
>
> Se o seu navegador perguntar "manter este arquivo?", ou o Chrome marcar como **Não confirmado**, é porque um `.dll` é um programa e pouca gente baixa este. Vindo dessa página do GitHub, a resposta é manter (no Chrome: abra a lista de downloads e clique em **Manter mesmo assim**).

### Passo 3. Abra a pasta do WorldBox

É a pasta onde a Steam instalou o jogo. Você nunca precisa procurar por ela:

1. Abra a **Steam** e vá para a sua **Biblioteca**.
2. **Clique com o botão direito** em WorldBox na lista da esquerda.
3. Clique em **Gerenciar**, depois em **Explorar arquivos locais**.

Abre uma janela com os arquivos do jogo. Você está no lugar certo se vê um arquivo chamado `worldbox` (ou `worldbox.exe`) e uma pasta chamada `worldbox_Data`. Na maioria dos PCs é:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Deixe essa janela aberta. Daqui em diante, "a pasta do WorldBox" é esta. Você vai voltar aqui mais vezes do que imagina.

> [!TIP] Faça o Windows mostrar as extensões
> Por padrão o Windows esconde o final dos nomes dos arquivos, então `NeoModLoader.dll` aparece só como `NeoModLoader`. Isso deixa qualquer guia mais difícil. Na janela da pasta, clique em **Exibir** no topo e marque **Extensões de nomes de arquivos** (no Windows 11: **Exibir → Mostrar → Extensões de nomes de arquivos**). Nada quebra, você só passa a ver os nomes completos.

### Passo 4. Coloque o NML no lugar certo

1. Na pasta do WorldBox, dê dois cliques em **worldbox_Data**.
2. Dois cliques em **StreamingAssets**.
3. Dois cliques em **Mods**.
4. Agora abra a pasta **Downloads** numa segunda janela e arraste o **NeoModLoader.dll** para esta janela `Mods`.

Ele tem que ficar aqui:

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            ├── test_asset_load/     é do jogo, deixe quieta
            └── NeoModLoader.dll     <- o que você acabou de colocar
```

Se você não vê `test_asset_load` ali dentro, está na pasta errada. Volte para a pasta do WorldBox e tente de novo.

**Já que você está nessa pasta:** se tiver algo com **NCMS** no nome (por exemplo `NCMS_memload.dll`, ou uma pasta chamada `NCMS`), apague. O NCMS é o carregador de mods antigo, está morto, e o NML já roda os mods antigos de NCMS :PES2_Shrug:.

> [!WARNING] `NeoModLoader (1).dll` não é `NeoModLoader.dll`
> Baixou o NML duas vezes ou já havia uma cópia antiga nessa pasta? O Windows nomeia o novo arquivo como `NeoModLoader (1).dll` em vez de substituí-lo, e o NML se recusará a iniciar: um texto vermelho inundará a tela pedindo para você reiniciar o jogo, e o log mostrará `Missing className: NeoModLoader (1).WorldBoxMod`. Feche o jogo, delete o arquivo antigo, renomeie o novo exatamente para `NeoModLoader.dll` (sem espaços nem números) e comece de novo. Esse único caractere é o motivo mais comum para o NML "não funcionar" :PESgn_SMH:.
>
> Se o Windows se recusar a excluir o arquivo antigo porque "está em uso", significa que o jogo ainda está aberto. Feche-o primeiro.

> [!WARNING] Existem duas pastas chamadas Mods
> Esta, dentro de `worldbox_Data\StreamingAssets\Mods/`, é apenas para o **próprio NML** (especificamente `NeoModLoader.dll`) e nada mais. A pasta onde você colocará os seus **mods** é separada, localizada diretamente na raiz do jogo ao lado de `worldbox.exe` (`worldbox\Mods/`). Ela ainda não existe; o NML a criará automaticamente na primeira inicialização. Colocar um mod em `StreamingAssets\Mods/` ou o NML em `worldbox\Mods/` é o erro mais comum desta página.

### Passo 5. Abra o jogo e confira

Abra o WorldBox pela Steam e, na primeira vez, dê um pouco mais de tempo que o normal.

Deu certo se:

- Enquanto o mundo carrega, o jogo mostra a mensagem **Experimental mode is enabled**.
- Tem um botão novo com o **logo do NML** entre os botões de abas na parte de baixo da tela. Clique nele: é lá que fica a sua lista de mods.
- Voltando na pasta do WorldBox, tem uma pasta nova e vazia chamada **Mods**, bem ao lado do `worldbox.exe`.
- Em `worldbox_Data\StreamingAssets\Mods/` o NML criou uma pasta **NML** para as coisas dele. Não mexa nela.

Se nada disso aconteceu, pule para **[Não funcionou](#não-funcionou)**.

---

## Mac

Os mesmos cinco passos. Só muda onde a pasta está escondida, porque no Mac o jogo inteiro fica empacotado num único ícone de app. Coisas da Apple :wbbre:.

1. **Experimental Mode**: igual ao Windows, **[Passo 1](#passo-1-ligue-o-experimental-mode)**. O aviso sobre atualizações vale para você também.
2. **Baixe** o `NeoModLoader.dll` na [mesma página de versões](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest). É o mesmo arquivo para Windows e Mac.
3. **Abra a pasta do WorldBox**: Steam → Biblioteca → botão direito em WorldBox → **Gerenciar → Explorar arquivos locais**. Abre uma janela do Finder.
4. **Entre no app**: botão direito no ícone do app **worldbox** e escolha **Mostrar Conteúdo do Pacote**. Depois abra **Contents → Resources → Data → StreamingAssets → Mods** e arraste o `NeoModLoader.dll` para lá. Aproveite e apague tudo que tiver `NCMS` no nome.
5. **Abra o jogo** e confira as mesmas coisas do **[Passo 5](#passo-5-abra-o-jogo-e-confira)**. A nova pasta `Mods` para os seus mods aparece na pasta do WorldBox, ao lado do app, não dentro dele.

```text
worldbox/
├── worldbox.app/
│   └── Contents/Resources/Data/StreamingAssets/Mods/
│       └── NeoModLoader.dll     <- o NML vai aqui
└── Mods/                        <- seus mods vão aqui
```

---

## Linux & Steam Deck

A lógica é exatamente a mesma. O Steam no Linux instala o jogo no diretório do usuário, e no Steam Deck basta mudar primeiro para o Modo Desktop. Pinguins são bem-vindos :wbpenguin:.

1. **Experimental Mode**: exatamente como no Windows, **[Passo 1](#passo-1-ligue-o-experimental-mode)**.
2. **Baixe** `NeoModLoader.dll` na [página oficial de releases](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest). É o mesmo arquivo para todas as plataformas.
3. **Abra a pasta do WorldBox**:
   - **Linux Desktop**: Steam → Biblioteca → clique com o botão direito no WorldBox → **Gerenciar → Explorar arquivos locais**.
   - **Steam Deck**: Pressione o botão **STEAM → Ligar/Desligar → Mudar para a Área de Trabalho**. Abra o Steam no Modo Desktop, vá em Biblioteca → clique com o botão direito no WorldBox (ou trackpad esquerdo / gatilho) → **Gerenciar → Explorar arquivos locais**.
   O caminho da pasta geralmente é:
   ```text
   ~/.local/share/Steam/steamapps/common/worldbox/
   ```
4. **Coloque o NML no lugar**: Abra `worldbox_Data → StreamingAssets → Mods` e arraste `NeoModLoader.dll` para lá. Exclua qualquer arquivo com `NCMS` no nome enquanto estiver lá.
5. **Inicie o jogo** (no Steam Deck, você pode voltar para o Modo de Jogo) e verifique as mesmas coisas do **[Passo 5](#passo-5-abra-o-jogo-e-confira)**. A nova pasta `Mods` para os seus mods aparecerá na pasta principal do WorldBox, ao lado do executável.

```text
worldbox/
├── worldbox_Data/
│   └── StreamingAssets/
│       └── Mods/
│           └── NeoModLoader.dll     <- NML
└── Mods/                            <- mods
```

---

## Instalar um mod

Agora a parte fácil, e a que você vai fazer de novo e de novo.

1. Baixe o mod. Leia a descrição primeiro: alguns mods precisam de algo a mais, e o autor normalmente avisa.
2. Coloque o `.zip` direto em **`worldbox\Mods/`**, a que fica ao lado de `worldbox.exe`. Não extraia: o NML descompacta os próprios zips na próxima vez que o jogo iniciar.
3. Inicie o jogo.

Já extraiu por costume? Também funciona, desde que a pasta que contém `mod.json` fique direto dentro de `Mods/`. Uma pasta de mod sempre tem um arquivo chamado `mod.json` em algum lugar, é assim que o NML a reconhece. O erro a evitar é uma pasta dentro de uma pasta dentro de `Mods/`, ou os arquivos do mod soltos em `Mods/` sem nenhuma pasta em volta.

```text
worldbox/
├── worldbox.exe
└── Mods/
    ├── SomeMod/
    │   └── mod.json
    └── AnotherMod/
        └── mod.json
```

> [!TIP] Teste com o HelloBox
> Não tem certeza se funciona? O mod que este guia constrói é um teste pronto. Baixe em **[O mod concluído](#/nml/all-together)**, descompacte em `Mods` e inicie o jogo. Se aparecer uma aba de poderes nova cheia de botões bobos, está tudo instalado certo :wbpeak:.

**Para remover um mod**, feche o jogo e apague a pasta dele de `Mods`. **Para desativar sem apagar**, use a lista de mods do NML no jogo.

**Mods do Workshop** também funcionam: inscreva-se no Steam Workshop e o NML os pega, sem copiar nada.

---

## Não funcionou

Siga estes itens em ordem. O primeiro resolve para a maioria.

| O que você vê | O que fazer |
| --- | --- |
| Nenhum botão do NML, nenhuma pasta `Mods` ao lado de `worldbox.exe` | O Modo Experimental está desligado. Ligue e reinicie. Também depois de cada atualização do jogo |
| Ainda nada, e o Modo Experimental está ligado | `NeoModLoader.dll` está na pasta errada. Ele precisa ficar em `worldbox_Data\StreamingAssets\Mods/`, ao lado de `test_asset_load` |
| O arquivo se chama `NeoModLoader.dll.dll` ou `NeoModLoader (1).dll` | Renomeie para exatamente `NeoModLoader.dll` |
| O NML está lá, mas um mod não aparece | O mod está na `Mods` errada. Ele vai na que fica ao lado de `worldbox.exe`, como o próprio `.zip` ou como uma pasta com `mod.json` dentro |
| Uma enxurrada de texto vermelho cobre a tela e diz `YOU SHOULD RESTART THE GAME` | O NML se chama `NeoModLoader (1).dll` ou algo parecido. Veja o **[Passo 4](#passo-4-coloque-o-nml-no-lugar-certo)** |
| O NML diz que um mod "has been disabled due to an error" | O mod está quebrado ou é velho demais para a sua versão do jogo. Procure uma atualização desse mod ou pergunte ao autor |
| A versão no canto do menu principal nunca muda | Seu jogo está num branch beta da Steam. Veja **[Solução de problemas](#/troubleshooting)** |
| Tudo quebrou logo depois de uma atualização do WorldBox | Ligue o Modo Experimental de novo. Depois espere seus mods atualizarem: uma atualização do jogo costuma quebrar mods antigos por alguns dias |

Ainda travado? **[Solução de problemas](#/troubleshooting)** tem a lista longa, e **[Logs e depuração](#/nml/logs-and-debugging)** mostra onde o jogo anota o que deu errado. Quando pedir ajuda, diga quais mods você usa, o que fez logo antes de quebrar, e inclua o texto do erro. "Não funciona" não é algo que alguém consiga consertar, nem eu :PESgn_ReadRules:.

---

## Perguntas que todo mundo faz

**Posso usar NML e BepInEx juntos?**
Sim. Um não atrapalha o outro. Dois *mods* específicos ainda podem entrar em conflito, mas aí é coisa dos mods, não dos loaders.

**O mod diz que precisa do BepInEx, não do NML.**
Então ele não vai em `Mods`. Instale o BepInEx como mostrado em **[O console ao vivo (BepInEx)](#/toolbox/bepinex-console)** (Windows), abra o jogo uma vez e coloque o mod em `BepInEx\plugins/`. A descrição do mod diz qual loader ele quer.

**NML ou NCMS?**
NML. O NCMS parou de ser atualizado e não funciona nas versões atuais do jogo. O NML roda os mods antigos do NCMS de qualquer jeito, então você não perde nada.

**O NML é vírus?**
Não. Os navegadores avisam porque um `.dll` é um programa e pouca gente baixa este. Pegue só pelo link do GitHub acima: os mods do GameBanana são verificados pelos moderadores de lá, e um arquivo que alguém te manda num chat não é verificado por ninguém :PESgn_ReadRules:.

**Preciso reinstalar o NML para cada mod?**
Não. Uma vez basta. Depois disso, cada mod é só uma pasta em `Mods`.

**Preciso atualizar o NML?**
Normalmente não. O NML procura uma versão nova toda vez que o jogo inicia e se substitui sozinho (é o `NeoModLoader.AutoUpdate_memload.dll` que aparece ao lado dele). Se isso falhar algum dia, baixe o `NeoModLoader.dll` novo pelo mesmo link e substitua o antigo à mão.

**Mods vão quebrar meus saves?**
Podem. Um save feito com um mod pode não carregar direito depois que você remove esse mod. Guarde uma cópia dos mundos que importam antes de testar algo novo :PES_MonkaSweat:.

**Meu mod favorito está desatualizado. Ainda dá para jogar?**
Ou você espera o autor, ou joga a versão do jogo para a qual ele foi feito: na Steam, clique com o botão direito em WorldBox → **Propriedades → Betas**, e escolha esse branch. Você também precisa do build do NML correspondente, linkado nas mensagens fixadas do canal de modding no Discord do WorldBox. Enquanto estiver lá, todo mod feito para a versão atual para de funcionar. Para voltar, escolha **Nenhum** no mesmo menu.

**Como atualizo um mod?**
Mods do Workshop se atualizam sozinhos. Para todo o resto: feche o jogo, apague a pasta antiga do mod (e o `.zip` antigo) de `Mods`, e coloque o `.zip` novo.

**Apaguei um mod e ele ainda está no jogo.**
Ele veio do Steam Workshop. Desmarcar na lista de mods não basta: cancele a inscrição na página dele no Workshop.

**Posso mudar um mod para mim?**
Se ele tem uma pasta `Code` cheia de arquivos `.cs`, sim: são texto puro, o NML os compila toda vez que o jogo inicia, e a arte fica em `GameResources`. Guarde uma cópia do original antes. Compartilhar a sua versão modificada é outra história, pergunte ao autor. Um mod que vem só com um `.dll` não dá para editar, só recompilar a partir do código-fonte.

**Alguém me ajudando pediu meu log.**
Cole `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` na barra de endereço do Explorer e envie o `Player.log`, o próprio arquivo, não um print dele. Se o jogo acabou de travar, envie o `Player-prev.log`: abrir o jogo de novo sobrescreve o `Player.log`.

Quer fazer mods em vez de só usar? Isso começa em **[Começando](#/getting-started)**.
