---
title: Como instalar o NML
group: NML Modding
icon: :wbhammer:
order: 1
---

# Instalar o NML :wbhammer:

O **NML** (NeoModLoader) é o programa que faz os mods de WorldBox funcionarem. O jogo sozinho não sabe carregar um mod, o NML faz isso por ele. Você instala o NML uma vez, e depois instalar um mod é só copiar uma pasta.

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

1. Abra este link: **[github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest)**. Ele sempre aponta para o NML mais recente, pode salvar nos favoritos.
2. Role até a seção **Assets**. Se estiver fechada, clique para abrir.
3. Clique em **NeoModLoader.dll**. Ele baixa como qualquer outro arquivo, normalmente na pasta **Downloads**.

Você só precisa desse arquivo. A página também lista arquivos terminados em `.pdb`, `.xml` e "Source code": ignore.

> [!WARNING] Só por esse link
> Um `.dll` é um programa. Baixe o NML **só** pela página do GitHub acima, nunca de um site qualquer ou de um arquivo que alguém te mandou no chat. Se o navegador perguntar "manter este arquivo?", ele pergunta porque é um `.dll`, e vindo dessa página a resposta é manter.

### Passo 3. Abra a pasta do WorldBox

É a pasta onde a Steam instalou o jogo. Você nunca precisa procurar por ela:

1. Abra a **Steam** e vá para a sua **Biblioteca**.
2. **Clique com o botão direito** em WorldBox na lista da esquerda.
3. Clique em **Gerenciar**, depois em **Explorar arquivos locais**.

Abre uma janela com os arquivos do jogo. Você está no lugar certo se vê um arquivo chamado `worldbox` (ou `worldbox.exe`) e uma pasta chamada `worldbox_Data`. Na maioria dos PCs é:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Deixe essa janela aberta. Daqui em diante, "a pasta do WorldBox" é esta.

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

Os mesmos cinco passos. Só muda onde a pasta está escondida, porque no Mac o jogo inteiro fica empacotado num único ícone de app.

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

## Instalar um mod

Agora a parte fácil, a que você vai fazer várias vezes.

1. Baixe o mod. Leia a descrição antes: alguns mods precisam de algo a mais, e o autor normalmente avisa.
2. Se veio como arquivo **.zip**, extraia. No Windows: botão direito → **Extrair tudo**. No Mac: dois cliques.
3. Arraste a pasta que você conseguiu para **`worldbox\Mods/`**, a que fica ao lado do `worldbox.exe`.
4. Abra o jogo.

Uma pasta de mod sempre tem um arquivo chamado `mod.json` em algum lugar dentro. É assim que o NML reconhece. Se o zip te deu uma pasta dentro de outra pasta, tudo bem, o NML olha lá dentro.

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
> Não sabe se está funcionando? O mod que este guia constrói é um teste pronto. Baixe em **[O mod concluído](#/nml/all-together)**, extraia em `Mods` e abra o jogo. Se aparecer uma aba de poderes nova cheia de botões bobos, está tudo instalado certo :wbpeak:.

**Para remover um mod**, feche o jogo e apague a pasta dele de `Mods`. **Para desligar sem apagar**, use a lista de mods do NML no jogo.

**Mods do Workshop** também funcionam: inscreva-se na Steam Workshop e o NML encontra sozinho, sem copiar nada.

---

## Não funcionou

Confira nesta ordem. O primeiro resolve quase todo mundo.

| O que você vê | O que fazer |
| --- | --- |
| Sem botão do NML, sem pasta `Mods` ao lado do `worldbox.exe` | O Experimental Mode está desligado. Ligue e reinicie. Também depois de cada atualização do jogo |
| Continua nada, e o Experimental Mode está ligado | O `NeoModLoader.dll` está na pasta errada. Tem que ficar em `worldbox_Data\StreamingAssets\Mods/`, ao lado de `test_asset_load` |
| O arquivo se chama `NeoModLoader.dll.dll` ou `NeoModLoader (1).dll` | Renomeie para exatamente `NeoModLoader.dll` |
| O NML está lá, mas um mod não aparece | O mod está na `Mods` errada. Ele vai na que fica ao lado do `worldbox.exe`, como pasta com `mod.json` dentro, não como `.zip` |
| O NML diz que um mod "has been disabled due to an error" | O mod está quebrado ou é velho demais para a sua versão do jogo. Procure uma atualização desse mod ou pergunte ao autor |
| Tudo quebrou logo depois de uma atualização do WorldBox | Ligue o Experimental Mode de novo. Depois espere seus mods atualizarem: uma atualização do jogo costuma quebrar mods antigos por alguns dias |

Ainda travado? **[Solução de problemas](#/troubleshooting)** tem a lista longa, e **[Logs e depuração](#/nml/logs-and-debugging)** mostra onde o jogo anota o que deu errado. Quando pedir ajuda, diga quais mods você usa, o que fez logo antes de quebrar, e inclua o texto do erro. "Não funciona" não é algo que alguém consiga consertar, nem eu :PESgn_ReadRules:.

---

## Perguntas que todo mundo faz

**Posso usar NML e BepInEx juntos?**
Sim. Um não atrapalha o outro. Dois *mods* específicos ainda podem brigar, mas aí é culpa dos mods, não dos carregadores.

**O mod diz que precisa de BepInEx, não de NML.**
Então ele não vai em `Mods`. Instale o BepInEx como mostrado em **[O console ao vivo (BepInEx)](#/toolbox/bepinex-console)** (Windows), abra o jogo uma vez e coloque esse mod em `BepInEx\plugins/`. A descrição do mod diz qual carregador ele quer.

**NML ou NCMS?**
NML. O NCMS parou de ser atualizado e não funciona nas versões atuais do jogo. O NML roda os mods antigos de NCMS de qualquer jeito, então você não perde nada.

**Preciso reinstalar o NML para cada mod?**
Não. Uma vez basta. Depois, cada mod é só uma pasta em `Mods`.

**Preciso atualizar o NML?**
Normalmente não. O NML procura uma versão nova toda vez que o jogo abre e se substitui sozinho (é para isso o `NeoModLoader.AutoUpdate_memload.dll` que aparece ao lado dele). Se algum dia isso falhar, baixe o novo `NeoModLoader.dll` no mesmo link e troque o antigo na mão.

**Mods estragam meus saves?**
Podem. Um save feito com um mod pode não carregar direito depois que você tira esse mod. Faça uma cópia dos mundos que importam para você antes de testar algo novo :PES_MonkaSweat:.

Quer fazer mods em vez de só usar? Começa em **[Primeiros passos](#/getting-started)**.
