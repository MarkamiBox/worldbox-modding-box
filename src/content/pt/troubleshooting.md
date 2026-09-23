---
title: Solução de problemas
group: Visão Geral
icon: :wbfractured:
order: 4
---

# Solução de problemas :wbfractured:

Encontre seu sintoma na tabela, clique nele, leia três linhas. Essa é a página inteira :aPES2_ThumbsUp:.

> [!TIP] O log responde a maioria disso mais rápido do que eu
> Nove em cada dez vezes a resposta já está no `Player.log`. **[Logs e depuração](#/nml/logs-and-debugging)** mostra onde ele fica e como ler um crash.

## Encontre seu sintoma

**Usando mods (não criando)**

| Sintoma | |
| --- | --- |
| Inundação de texto vermelho, `Missing className: NeoModLoader (1).WorldBoxMod` | [pular](#inundação-de-texto-vermelho-missing-classname) |
| O NML funcionava, o jogo atualizou, agora os mods estão vermelhos ou "failed" | [pular](#os-mods-estão-vermelhos-ou-failed-após-uma-atualização-do-jogo) |
| O jogo está em uma versão antiga e o NML não carrega | [pular](#o-jogo-está-em-uma-versão-antiga) |
| O jogo ficou lento ou trava com os mods ativos | [pular](#o-jogo-ficou-lento-ou-trava-com-os-mods-ativos) |
| Um mundo não carrega mais | [pular](#um-mundo-não-carrega-mais) |
| Um mod do BepInEx está instalado e nada aparece | [pular](#um-mod-do-bepinex-está-instalado-e-nada-aparece) |
| Você deletou um mod e ele ainda continua lá | [pular](#você-deletou-um-mod-e-ele-ainda-continua-lá) |
| O jogo não inicia de jeito nenhum | [pular](#o-jogo-não-inicia-de-jeito-nenhum) |

**Nada carrega**

| Sintoma | |
| --- | --- |
| Sem botão Mods no menu | [ir](#sem-botão-mods-no-menu) |
| Janela de Mods vazia, antes funcionava | [ir](#janela-de-mods-vazia-antes-funcionava) |
| A pasta do mod existe, mas o mod não está na lista | [ir](#a-pasta-do-mod-existe-mas-o-mod-não-está-na-lista) |
| O mod aparece acinzentado | [ir](#o-mod-aparece-acinzentado) |
| "Compile failed" e o erro não faz sentido | [ir](#compile-failed-e-o-erro-não-faz-sentido) |
| Erro na linha 1 de um arquivo que você acabou de colar | [ir](#erro-na-linha-1-de-um-arquivo-que-você-acabou-de-colar) |
| Você editou o código e nada mudou | [ir](#você-editou-o-código-e-nada-mudou) |
| Suas mudanças nunca aparecem, nem depois de reiniciar | [ir](#suas-mudanças-nunca-aparecem-nem-depois-de-reiniciar) |
| O Bloco de Notas não salva na pasta do jogo | [ir](#o-bloco-de-notas-não-salva-na-pasta-do-jogo) |

**Carrega, mas nada aparece**

| Sintoma | |
| --- | --- |
| Crash na linha em que você define um stat | [ir](#crash-na-linha-em-que-você-define-um-stat) |
| O mesmo crash, e a ordem já está certa | [ir](#o-mesmo-crash-e-a-ordem-já-está-certa) |
| Sua construção morre na hora ou não tem tamanho | [ir](#sua-construção-morre-na-hora-ou-não-tem-tamanho) |
| Registrado, mas em nenhuma aba | [ir](#registrado-mas-em-nenhuma-aba) |
| Aparece `trait_hello_swift` em vez de um nome | [ir](#aparece-trait-hello-swift-em-vez-de-um-nome) |
| Os nomes funcionam para traços, mas não para itens, status, poderes | [ir](#os-nomes-funcionam-para-traços-mas-não-para-itens-status-poderes) |
| O ícone é um buraco em branco | [ir](#o-ícone-é-um-buraco-em-branco) |
| Um botão ocupa espaço mas não desenha nada | [ir](#um-botão-ocupa-espaço-mas-não-desenha-nada) |
| O efeito de status não desenha nenhum sprite na unidade | [ir](#o-efeito-de-status-não-desenha-nenhum-sprite-na-unidade) |
| Botões empilhados uns sobre os outros | [ir](#botões-empilhados-uns-sobre-os-outros) |
| O botão está lá, mas clicar nele não ativa nada | [ir](#o-botão-está-lá-mas-clicar-nele-não-ativa-nada) |
| `addOpposite` / `addDecision` / `addSpell` não fazem nada | [ir](#addopposite-adddecision-addspell-não-fazem-nada) |

**Registrado, depois quebra no mundo**

| Sintoma | |
| --- | --- |
| A sua criatura gera um erro de sombra | [ir](#a-sua-criatura-gera-um-erro-de-sombra) |
| O seu traço, item ou criatura continua bloqueado | [ir](#o-seu-traço-item-ou-criatura-continua-bloqueado) |
| O jogo quebra ao carregar a sua arma ou a sua comida | [ir](#o-jogo-quebra-ao-carregar-a-sua-arma-ou-a-sua-comida) |
| Uma nuvem quebra no momento em que aparece | [ir](#uma-nuvem-quebra-no-momento-em-que-aparece) |
| Colocar a sua construção dá Index was out of range | [ir](#colocar-a-sua-construção-dá-index-was-out-of-range) |
| A sua construção quebra em todo frame em que aparece | [ir](#a-sua-construção-quebra-em-todo-frame-em-que-aparece) |
| O minimapa quebra quando a sua construção existe | [ir](#o-minimapa-quebra-quando-a-sua-construção-existe) |
| O seu tile pinta, depois o renderizador do mapa quebra | [ir](#o-seu-tile-pinta-depois-o-renderizador-do-mapa-quebra) |
| Fazer nascer um animal no seu tile quebra o jogo | [ir](#fazer-nascer-um-animal-no-seu-tile-quebra-o-jogo) |
| Drops caem invisíveis, ou um projétil quebra | [ir](#drops-caem-invisíveis-ou-um-projétil-quebra) |
| O log enche de ArgumentNullException vindos de projéteis | [ir](#o-log-enche-de-argumentnullexception-vindos-de-projéteis) |
| A sua aba de poderes nunca aparece | [ir](#a-sua-aba-de-poderes-nunca-aparece) |
| A janela de configurações mostra ids crus | [ir](#a-janela-de-configurações-mostra-ids-crus) |
| O mundo gera erros a cada quadro após adicionar um comportamento do mundo | [ir](#o-mundo-gera-erros-a-cada-quadro-após-adicionar-um-comportamento-do-mundo) |
| Um desastre trava ao gravar no registro do mundo | [ir](#um-desastre-trava-ao-gravar-no-registro-do-mundo) |
| Um desastre sem action trava quando é sorteado | [ir](#um-desastre-sem-action-trava-quando-é-sorteado) |
| O primeiro governante a avaliar sua trama trava | [ir](#o-primeiro-governante-a-avaliar-sua-trama-trava) |
| Sua decisão, trama, gene ou arma existe e nada jamais a utiliza | [ir](#sua-decisão-trama-gene-ou-arma-existe-e-nada-jamais-a-utiliza) |

**Compila para você, mas não para os outros**

| Sintoma | |
| --- | --- |
| `CS0122: inaccessible due to its protection level` | [ir](#cs0122-inaccessible-due-to-its-protection-level) |
| Funciona na sua máquina, não faz nada na dos outros | [ir](#funciona-na-sua-máquina-não-faz-nada-na-dos-outros) |

**Funciona, depois quebra**

| Sintoma | |
| --- | --- |
| Outro mod substitui o seu conteúdo em silêncio | [ir](#outro-mod-substitui-o-seu-conteúdo-em-silêncio) |
| Crash em `World.world` enquanto o mod carrega | [ir](#crash-em-world-world-enquanto-o-mod-carrega) |
| Os seus dados começam a controlar as criaturas erradas | [ir](#os-seus-dados-começam-a-controlar-as-criaturas-erradas) |
| Tudo some depois de salvar e carregar | [ir](#tudo-some-depois-de-salvar-e-carregar) |
| Unidades congelam em grupos | [ir](#unidades-congelam-em-grupos) |
| Metade dos seus patches Harmony nunca foi aplicada | [ir](#metade-dos-seus-patches-harmony-nunca-foi-aplicada) |
| O seu patch em `updateStats` quebra para outras pessoas | [ir](#o-seu-patch-em-updatestats-quebra-para-outras-pessoas) |
| Você fez patch em `getHit` e as construções ainda levam dano | [ir](#você-fez-patch-em-gethit-e-as-construções-ainda-levam-dano) |
| O seu Prefix quebrou três outros mods | [ir](#o-seu-prefix-quebrou-três-outros-mods) |
| Uma unidade fica parada para sempre, ou quebra em todo frame | [ir](#uma-unidade-fica-parada-para-sempre-ou-quebra-em-todo-frame) |
| O seu controle da IA volta atrás em silêncio | [ir](#o-seu-controle-da-ia-volta-atrás-em-silêncio) |
| O jogo engasga quatro vezes por segundo | [ir](#o-jogo-engasga-quatro-vezes-por-segundo) |
| Os cliques caem no mapa atrás da sua janela | [ir](#os-cliques-caem-no-mapa-atrás-da-sua-janela) |
| A memória sobe toda vez que o painel abre | [ir](#a-memória-sobe-toda-vez-que-o-painel-abre) |
| Um novo padrão nunca chega a quem já joga | [ir](#um-novo-padrão-nunca-chega-a-quem-já-joga) |
| Um slider de configuração se mexe, o seu callback nunca roda | [ir](#um-slider-de-configuração-se-mexe-o-seu-callback-nunca-roda) |

## Usando mods

Este grupo é para pessoas que jogam com mods, não para quem os cria. Tudo a partir daqui presume que é você quem está escrevendo o código.

### Inundação de texto vermelho, missing className

- **O que você vê**: Texto vermelho rolando sobre o jogo, `previous errors repeated`, `YOU SHOULD RESTART THE GAME`, e no log `Missing className: NeoModLoader (1).WorldBoxMod`.
- **Por que acontece**: O arquivo não se chama `NeoModLoader.dll`. Um navegador baixando pela segunda vez adiciona ` (1)`, e o NML lê seu próprio nome de arquivo.
- **Como consertar**: Feche o jogo, delete cópias antigas, renomeie o arquivo exatamente para `NeoModLoader.dll` e inicie de novo. Passo a passo em **[Instalar o NML](#/install-nml)**.

### Os mods estão vermelhos ou failed após uma atualização do jogo

- **O que você vê**: A lista de mods mostra um mod em vermelho, "failed", `current failed, will load` ou `<Mod> has been disabled due to an error`. Funcionava antes da atualização.
- **Por que acontece**: Mods chamam o código do jogo. Quando o WorldBox altera esse código, um mod feito para a versão antiga para de compilar. O NML não é o problema, é apenas o mensageiro.
- **Como consertar**: Procure por uma versão mais nova do mod (no GameBanana, ordene por **Updated**). Se não houver, aguarde o autor ou jogue na versão antiga do jogo, veja **[o FAQ](#/install-nml)**. Não mantenha duas versões do mesmo mod em `Mods` "por precaução": elas entram em conflito.

### O jogo está em uma versão antiga

- **O que você vê**: O NML nunca carrega, ou o log diz `MissingFieldException: Field not found: bool .Config.gameLoaded`. O número da versão no menu principal é mais antigo que o que todos comentam.
- **Por que acontece**: O jogo está em uma **ramificação beta** da Steam, geralmente escolhida há tempos para testar uma atualização antes, e o NML que você baixou é feito para a versão atual.
- **Como consertar**: Steam → clique com o botão direito em WorldBox → **Propriedades → Betas** → **Nenhuma**. Deixe a Steam atualizar e reative o Modo Experimental :PES2_Shrug:.

### O jogo ficou lento ou trava com os mods ativos

- **O que você vê**: FPS baixo, travamentos ou o mundo congelando enquanto os botões continuam respondendo. Sem mods funciona normalmente.
- **Por que acontece**: Quase sempre é um mod fazendo cálculos pesados a cada tick, geralmente um mod grande de conteúdo. Dois mods alterando a mesma coisa também podem travar um ao outro.
- **Como consertar**: Desative metade dos seus mods, reinicie e teste. Se continuar com problemas: o culpado está na metade ativa. Continue dividindo pela metade até restar apenas um. Desativar é suficiente, não precisa deletar. Leia a descrição do mod para incompatibilidades conhecidas e nunca use duas versões do mesmo mod (uma completa e uma "lite") juntas.

### Um mundo não carrega mais

- **O que você vê**: O save abre um mundo diferente, trava durante o carregamento ou lança `NullReferenceException` ao salvar ou carregar.
- **Por que acontece**: O mundo contém criaturas, edifícios ou traços de um mod que agora está desativado, removido ou desatualizado. O jogo encontra identificadores desconhecidos.
- **Como consertar**: Reative esse mod (ou volte para a versão em que o save foi criado), carregue o mundo e remova o conteúdo modificado no jogo antes de tirar o mod. Guarde uma cópia dos mundos importantes antes de testar novos mods de conteúdo :PES_MonkaSweat:.

### Um mod do BepInEx está instalado e nada aparece

- **O que você vê**: O mod está em `BepInEx/plugins`, nada aparece no jogo e nenhum arquivo de configuração próprio aparece em `BepInEx/config`.
- **Por que acontece**: Ou o arquivo zip foi solto em `plugins` como zip, ou o objeto gerenciador do BepInEx está sendo destruído pelo jogo, algo que algumas máquinas exigem uma configuração para resolver.
- **Como consertar**: Coloque a **pasta dentro** do zip em `BepInEx/plugins`, não o arquivo zip. Depois abra `BepInEx/config/BepInEx.cfg`, procure `HideManagerGameObject = false`, mude para `true`, salve e reinicie. Configuração do BepInEx: **[O console ao vivo](#/toolbox/bepinex-console)**.

### Você deletou um mod e ele ainda continua lá

- **O que você vê**: A pasta sumiu de `Mods`, mas o mod ainda é carregado.
- **Por que acontece**: Você estava inscrito nele na Steam Workshop, e mods da Workshop ficam na pasta própria da Steam, não na sua.
- **Como consertar**: Cancele a inscrição na página dele na Workshop. Desmarcá-lo na lista não é a mesma coisa.

### O jogo não inicia de jeito nenhum

- **O que você vê**: O WorldBox fecha ou trava antes do menu principal, mesmo após retirar seus mods.
- **Por que acontece**: Um arquivo do próprio jogo foi corrompido, geralmente ao copiar algo na pasta errada.
- **Como consertar**: Steam → clique com o botão direito em WorldBox → **Propriedades → Arquivos instalados → Verificar integridade dos arquivos do jogo**. Em seguida, recoloque o NML e seus mods um de cada vez.

---

## Nada carrega

### Sem botão Mods no menu

- **O que você vê**: O jogo abre normalmente, sem erro, sem botão Mods e sem nenhuma linha `[NML]` no log.
- **Por quê**: Duas pastas se chamam "Mods". A DLL do carregador vai na pasta de dados do jogo; `worldbox\Mods/` é para os *seus* mods.
- **Solução**: Coloque `NeoModLoader.dll` em `worldbox\worldbox_Data\StreamingAssets\mods/`, reinicie e procure `[NML]: NeoModLoader Version:` no log.

### Janela de Mods vazia, antes funcionava

- **O que você vê**: A janela abre e não lista nada. Sem erros.
- **Por quê**: O **Modo Experimental está desligado**, e o jogo o desliga sozinho depois de toda atualização do WorldBox.
- **Solução**: Configurações → Modo Experimental → ligar → reiniciar. Confira isso primeiro sempre que "ontem funcionava e eu não mudei nada".

### A pasta do mod existe, mas o mod não está na lista

- **O que você vê**: Nada na lista, nenhuma linha `Compile Mod <seu mod>`.
- **Por quê**: Em ordem de frequência: o arquivo na verdade é `mod.json.txt`; o JSON é inválido (vírgula depois do último item, ou aspas curvas `"` coladas de um app de chat); a pasta não está dentro de `worldbox\Mods/`.
- **Solução**: Explorer → **Exibir → Mostrar → Extensões de nomes de arquivos**, e confira o nome real. Abra o `mod.json` no VS Code, que sublinha os erros de JSON para você.

### O mod aparece acinzentado

- **O que você vê**: Listado em cinza, nada do seu código roda.
- **Por quê**: Ele está desativado, e isso fica salvo em disco em `StreamingAssets\mods\NML\mod_compile_records.json`.
- **Solução**: Clique no ícone do mod na janela de Mods e reinicie.

### "Compile failed" e o erro não faz sentido

- **O que você vê**: `Code\Main.cs(9,42): error CS1002: ; expected`, e depois uma linha de resumo.
- **Por quê**: O resumo não é o erro. A linha acima dele é, e ela diz arquivo, linha e coluna.
- **Solução**: Corrija só o **primeiro** erro, reinicie e olhe de novo: os erros vêm em cascata.

| Código | Significa |
| --- | --- |
| `CS1002` | Falta um `;` |
| `CS0246` | Um nome que ele não conhece, geralmente falta um `using` |
| `CS0266` | Você deu um decimal onde vai um número inteiro (`0.5f` num `int`) |
| `CS0122` | O membro é `internal`, veja [essa entrada](#cs0122-inaccessible-due-to-its-protection-level) |

### Erro na linha 1 de um arquivo que você acabou de colar

- **O que você vê**: Um erro de compilação na linha 1 que parece não ter sentido.
- **Por quê**: Os blocos de código aqui têm o caminho do arquivo como rótulo. Selecione um pouco demais para cima e o rótulo vai parar dentro do seu `.cs`.
- **Solução**: Apague a linha 1. Um `.cs` começa com `using`, um `namespace` ou uma classe; o `mod.json` começa com `{`.

### Você editou o código e nada mudou

- **O que você vê**: Comportamento antigo, sem erro.
- **Por quê**: O NML compila `Code\*.cs` **uma vez, na inicialização**. Um jogo aberto nunca relê o seu arquivo.
- **Solução**: Salve, feche o jogo por completo e abra de novo. Uma mudança por reinício, assim quando quebrar só tem um suspeito.

### Suas mudanças nunca aparecem, nem depois de reiniciar

- **O que você vê**: Você reinicia, o log diz `Compile Mod`, e o jogo continua rodando o código antigo. A compilação leva uma fração de segundo.
- **Por quê**: Duas pastas em `Mods/` têm o mesmo `GUID` no `mod.json`, normalmente uma cópia antiga que o instalador do NML descompactou como `COM_YOURNAME_HELLOBOX/`. O NML carrega **um mod por GUID** e ignora a outra pasta em silêncio, e pode muito bem ser a que você está editando.
- **Solução**: Procure o seu GUID em `Mods/` e deixe exatamente uma pasta. Se a conta não fecha, é a primeira coisa a conferir.

### O Bloco de Notas não salva na pasta do jogo

- **O que você vê**: "Você não tem permissão para salvar neste local", e ele oferece Documentos.
- **Por quê**: O jogo fica em `C:\Program Files (x86)/`, que o Windows protege.
- **Solução**: Crie o arquivo no Explorer primeiro (botão direito → Novo → Documento de Texto, renomeie) e depois edite esse arquivo que já existe.

---

## Carrega, mas nada aparece

### Crash na linha em que você define um stat

- **O que você vê**: `NullReferenceException` no seu `Initialize()`, e nada depois dela roda.
- **Por quê**: Um asset novo **não tem bloco de stats**. A biblioteca o cria dentro do `add()`.
- **Solução**: Primeiro `add()`, depois os stats. A mesma regra vale para traços, status, itens, construções, atores.

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };
AssetManager.traits.add(swift);      // this is what allocates base_stats
swift.base_stats["speed"] = 20f;     // safe from here
```

`clone()` chama o `add()` por você, então depois de um clone o bloco já existe.

### O mesmo crash, e a ordem já está certa

- **O que você vê**: O mesmo `NullReferenceException`, numa linha de stat que roda depois do `add()`.
- **Por quê**: Você inventou o nome de um stat. Um id de stat desconhecido é um crash, não um "não faz nada".
- **Solução**: Use ids reais: `damage`, `health`, `speed`, `armor`, `attack_speed`, `stamina`, `mana`, `range`, `critical_chance`, `lifespan`, `warfare`. Os multiplicadores são separados: `multiplier_damage`, `multiplier_health`, `multiplier_speed`. Lista completa em **[Referência de stats](#/nml/stats)**.

### Sua construção morre na hora ou não tem tamanho

- **O que você vê**: A construção aparece e some, ou não pode ser alvo. Sem erro.
- **Por quê**: A `health` e o `size` padrão de uma construção só são definidos dentro do `add()`, e só quando `base_stats` ainda é null. Crie o bloco você mesmo antes e fica com `health = 0`.
- **Solução**: Nunca crie `base_stats` antes. Clone ou faça `add()` primeiro, depois mude só o que precisa ser diferente.

### Registrado, mas em nenhuma aba

- **O que você vê**: Sua linha de log aparece, sem exceção, e a coisa não está em nenhuma categoria.
- **Por quê**: `group_id` aponta para um grupo que não existe, então não há aba para desenhá-la.
- **Solução**: Use um id de grupo real. Traços de ator: `cognitive`, `mind`, `spirit`, `physique`, `health`, `body`, `appearance`, `protection`, `skills`, `merits`, `acquired`, `fun`, `fate`, `miscellaneous`, `special`. A sua própria aba: **[Grupos de traços e abas](#/nml/trait-groups)**.

### Aparece `trait_hello_swift` em vez de um nome

- **O que você vê**: A chave crua na tela, tooltip vazio, `missing text:` no log.
- **Por quê**: Nenhuma tradução registrada. O jogo monta a chave sozinho: `trait_<id>` e `trait_<id>_info`.
- **Solução**: Adicione essas duas chaves ao `Locales/en.json`. Cuidado com `en.json.txt`.

### Os nomes funcionam para traços, mas não para itens, status, poderes

- **O que você vê**: Você copiou o padrão dos traços e este ainda mostra uma chave crua.
- **Por quê**: Quatro assets **não** montam a chave a partir do id:

| Asset | Chave do nome | Chave da descrição |
| --- | --- | --- |
| `GodPower` | o **campo** `name`, snake_case | `<name>_description` |
| `ItemAsset` | `translation_key`, senão `item_<subtype ou id>` | `<id>_description`, sem `item_` |
| `StatusAsset` | o **campo** `locale_id` | o **campo** `locale_description` |
| `WorldLawAsset` | `<id>_title` | `<id>_description` |

- **Solução**: Defina `name` = id nos poderes, `translation_key` nos itens, `locale_id` nos status. Mantenha as chaves em snake_case minúsculo: elas são normalizadas quando salvas mas **não** quando procuradas, então `MyKey` é salva como `my_key` e nunca mais é encontrada :PESgn_SMH:.

### O ícone é um buraco em branco

- **O que você vê**: Um quadrado vazio onde deveria estar o ícone. Sem erro.
- **Por quê**: O preenchimento automático de ícones roda antes do seu mod existir, então nada preenche o seu. E um caminho errado devolve `null`, **que fica em cache pela sessão inteira**, então corrigir o caminho sem reiniciar não muda nada.
- **Solução**: Sempre defina `path_icon` você mesmo, sem extensão, com barras normais, e reinicie. Confira no carregamento:

```csharp
if (SpriteTextureLoader.getSprite(swift.path_icon) == null)
    LogError("icon path is wrong: " + swift.path_icon);
```

### Um botão ocupa espaço mas não desenha nada

- **O que você vê**: Um vazio na sua aba em que ninguém vai clicar.
- **Por quê**: Um sprite `null` não é um espaço reservado, é nada mesmo :PES4_Invisible:.
- **Solução**: Nunca passe um sprite sem conferir: volte para `ui/Icons/iconQuestionMark`, que diz "caminho errado" de cara. O helper está em **[Abas e botões de poderes](#/nml/power-buttons)**.

### O efeito de status não desenha nenhum sprite na unidade

- **O que você vê**: Ou nada é desenhado sobre a criatura, ou `NullReferenceException` em `Status.updateAnimationFrame()` em **todo frame** enquanto o status durar.
- **Por quê**: `StatusLibrary` preenche `sprite_list` a partir de `"effects/" + texture` e liga `need_visual_render` numa passada só enquanto o jogo carrega, antes do seu mod existir. E `texture` é o nome de uma **pasta** de frames, não de um PNG.
- **Solução**: Frames em `GameResources/effects/fx_hello_status/`, e depois do `add()`:

```csharp
cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
cursed.need_visual_render = true;
```

### Botões empilhados uns sobre os outros

- **O que você vê**: A aba parece vazia, ou um botão está em cima da pilha.
- **Por quê**: `recalc()` só recalcula a largura; organizar os botões é uma segunda chamada, e ela pula filhos inativos.
- **Solução**: Chame as duas, nessa ordem, depois de adicionar todos os botões: `tab.recalc();` e depois `tab.sortButtons();`. Só não durante o `OnModLoad`: ali o `recalc()` quebra, veja **[A sua aba de poderes nunca aparece](#a-sua-aba-de-poderes-nunca-aparece)**.

### O botão está lá, mas clicar nele não ativa nada

- **O que você vê**: O cursor não muda, clicar no mapa não faz nada.
- **Por quê**: O botão é ligado ao poder **pelo id, na hora em que é criado**.
- **Solução**: Registre o poder primeiro, crie o botão depois, no mesmo helper, para a ordem não escapar. E `click_action` é `(WorldTile, string)`; o formato `(WorldTile, GodPower)` é do `click_power_action`.

### `addOpposite` / `addDecision` / `addSpell` não fazem nada

- **O que você vê**: O traço oposto nunca é removido, a decisão nunca dispara. Silêncio.
- **Por quê**: Essas chamadas só acrescentam um **id**. Transformar ids em objetos vivos acontece uma vez, na inicialização, antes do seu mod carregar.
- **Solução**: Preencha você mesmo os campos resolvidos depois do `add()`: `linkCombatActions()`, `linkSpells()`, e atribua `opposite_traits` diretamente. Se você define `opposite_trait_mod` e deixa `opposite_traits` null, o jogo quebra mais tarde no código social; um `HashSet` vazio evita isso.

---

## Registrado, depois quebra no mundo

Toda entrada desta seção tem a mesma causa. O jogo prepara uma parte de cada asset **uma vez, enquanto carrega**, e o seu mod registra os assets depois disso. Nada avisa: o asset existe, tem nome, e na primeira vez que o jogo realmente o usa, ele quebra. A solução também tem sempre a mesma forma: faça esse passo você mesmo, logo depois de registrar o asset :wbfacepalm:.

### A sua criatura gera um erro de sombra

- **O que você vê**: `ActorAssetLibrary: Shadow size is too small : (0.00, 0.00)`, três vezes por criatura, e um popup de erro no jogo.
- **Por quê**: A biblioteca mede o sprite de sombra de cada ator na inicialização. Uma criatura adicionada depois nunca é medida.
- **Solução**: `asset.texture_asset.loadShadow();` depois do clone. Veja **[Atores personalizados](#/nml/custom-actors)**.

### O seu traço, item ou criatura continua bloqueado

- **O que você vê**: Ele existe, mas o livro de conhecimento mostra acinzentado e o jogador não pode usar até ele aparecer num mundo.
- **Por quê**: `needs_to_be_explored` é `true` por padrão em tudo que pode ser desbloqueado: atores, os sete tipos de traço, itens, modificadores de item e leis do mundo.
- **Solução**: `needs_to_be_explored = false` ao criar. Veja **[Traços personalizados](#/nml/custom-traits)**.

### O jogo quebra ao carregar a sua arma ou a sua comida

- **O que você vê**: `ArgumentNullException: Value cannot be null. Parameter name: key` em `ItemLibrary.loadSprites()` ou `ResourceLibrary.loadSprites()`.
- **Por quê**: Armas recebem `path_gameplay_sprite`, e recursos `full_sprite_path`, derivados em `post_init()` durante o carregamento do próprio jogo. Os seus ficam `null`.
- **Solução**: Defina você mesmo. Veja **[Itens personalizados](#/nml/custom-items)** e **[Recursos e comida](#/nml/resources)**.

### Uma nuvem quebra no momento em que aparece

- **O que você vê**: `NullReferenceException` em `Cloud.prepare()` na primeira vez que a sua nuvem aparece.
- **Por quê**: `CloudLibrary` transforma `path_sprites` em `cached_sprites` e `color_hex` em `color` numa passada só, na inicialização.
- **Solução**: Faça os dois você mesmo depois do `add()`. Veja **[Nuvens e clima](#/nml/clouds)**.

### Colocar a sua construção dá Index was out of range

- **O que você vê**: `ArgumentOutOfRangeException: Index was out of range` em `Building.setAnimData()` no momento em que uma é colocada.
- **Por quê**: Os frames das construções são pré-carregados para todas na inicialização. A sua tem a lista de frames vazia, ou a pasta dela não tem `main_0.png`.
- **Solução**: `shrine.loadBuildingSprites();` assim que `sprite_path` estiver definido, e frames com os nomes `main_0`, `construction_0`, `ruin_0`, `mini_0`. Veja **[Construções personalizadas](#/nml/custom-buildings)**.

### A sua construção quebra em todo frame em que aparece

- **O que você vê**: Centenas de `NullReferenceException` em `DynamicSprites.getRecoloredBuilding()`, uma por frame enquanto ela está na tela.
- **Por quê**: O atlas que pinta uma construção na cor do dono, `atlas_asset`, é ligado em `checkAtlasLink()` na inicialização. Um clone não o mantém.
- **Solução**: `shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);`

### O minimapa quebra quando a sua construção existe

- **O que você vê**: `NullReferenceException` em `Building.getColorForMinimap()` sempre que o minimapa redesenha.
- **Por quê**: O ponto no minimapa vem do `mini_0.png` na pasta da construção, e não tem nenhum.
- **Solução**: Adicione `mini_0.png`, um pixel por tile que a construção ocupa: 5x4 para qualquer coisa clonada de `temple_human`.

### O seu tile pinta, depois o renderizador do mapa quebra

- **O que você vê**: `NullReferenceException` em `WorldTilemap.getVariation()` para cada tile seu na tela.
- **Por quê**: `TopTileLibrary` carrega os PNGs de `tiles/<id>/` em `sprites` na inicialização.
- **Solução**: Carregue você mesmo com `addVariation()`. Veja **[Tiles e terreno](#/nml/tiles)**.

### Fazer nascer um animal no seu tile quebra o jogo

- **O que você vê**: `NullReferenceException` em `Subspecies.generateName()`, só no seu tile e só para animais.
- **Por quê**: Um clone de um tile de grama mantém `is_biome = true` mas não `biome_asset`, que é ligado em `linkAssets()` na inicialização. Animais acrescentam o bioma ao nome da espécie.
- **Solução**: `moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);`

### Drops caem invisíveis, ou um projétil quebra

- **O que você vê**: Os seus drops caem sem nada desenhado, ou `ArgumentOutOfRangeException` em `QuantumSpriteLibrary.drawProjectiles()`.
- **Por quê**: Drops, projéteis, status, construções e recursos na mão leem a arte com `getSpriteList()`, que devolve os frames *dentro* de uma pasta. Um PNG solto volta como lista vazia.
- **Solução**: Uma pasta por animação, mesmo com um frame só: `drops/hello_ember/hello_ember_0.png`. Veja **[Sprites e recursos](#/nml/sprites-and-resources)**.

### O log enche de ArgumentNullException vindos de projéteis

- **O que você vê**: Milhares de `ArgumentNullException: Value cannot be null` em `ProjectileManager.updateProjectiles()` enquanto um projétil está no ar.
- **Por quê**: Um projétil sem atirador não tem reino, e o gerenciador usa o reino como chave de dicionário em todo frame.
- **Solução**: Dê um a ele: `pForcedKingdom: World.world.kingdoms_wild.get("nature")`, o dono neutro do próprio jogo.

### A sua aba de poderes nunca aparece

- **O que você vê**: `NullReferenceException` em `PowersTab.setNewWidth()`, a aba não existe e os seus poderes também não.
- **Por quê**: `recalc()` foi chamado durante o `OnModLoad`. O `Start()` da própria aba ainda não rodou, então o pai dela ainda é `null`, e a exceção derruba a etapa inteira.
- **Solução**: Crie a aba no carregamento, organize a partir do `Update()`. Veja **[Abas e botões de poderes](#/nml/power-buttons)**.

### A janela de configurações mostra ids crus

- **O que você vê**: `LocalizedTextManager: missing text: strike_radius Description` no log.
- **Por quê**: O NML pede duas chaves para cada linha de configuração: `<id>` para o rótulo e `<id> Description`, com espaço e D maiúsculo, para o tooltip.
- **Solução**: Adicione as duas ao `Locales/en.json`. Veja **[Configurações do mod](#/nml/mod-config)**.

### O mundo gera erros a cada quadro após adicionar um comportamento do mundo

- **Sintoma**: `NullReferenceException` em `MapBox.updateWorldBehaviours()`, a cada quadro a partir do momento em que o seu mod carrega.
- **Causa**: O mundo mantém um temporizador por comportamento, criado quando o mapa é iniciado antes do seu mod. O seu não possui nenhum e o loop o chama mesmo assim.
- **Solução**: `behaviour.manager = new WorldBehaviour(behaviour);` logo após `add()`. Veja **[Eras do mundo e comportamentos](#/nml/world-ages)**.

### Um desastre trava ao gravar no registro do mundo

- **Sintoma**: `NullReferenceException` no construtor de `WorldLogMessage`, chamado a partir de `WorldLog.logDisaster()`.
- **Causa**: `world_log` é o ID de um `WorldLogAsset`, não uma chave de texto. Um ID não registrado retorna `null` e a mensagem é construída sobre ele.
- **Solução**: Clone `$basic_disaster$` com esse ID e defina seu `locale_id`. Veja **[Desastres](#/nml/disasters)**.

### Um desastre sem action trava quando é sorteado

- **Sintoma**: `NullReferenceException` em `WorldBehaviourActions.updateDisasters()`, na primeira vez em que o sorteio escolhe o seu.
- **Causa**: O sorteio chama `action` sem verificar se é nulo. `spawn_asset_unit` por si só não faz nada.
- **Solução**: Aponte `action` para `AssetManager.disasters.simpleUnitAssetSpawnUsingIslands` ou escreva sua própria ação.

### O primeiro governante a avaliar sua trama trava

- **Sintoma**: `NullReferenceException` em `PlotAsset.checkIsPossible()`.
- **Causa**: `check_is_possible` é chamado sem verificação de nulo toda vez que um líder examina a trama.
- **Solução**: Sempre configure este delegate. Se não houver condição, retorne `true`. Veja **[Tramas](#/nml/plots)**.

### Sua decisão, trama, gene ou arma existe e nada jamais a utiliza

- **Sintoma**: Nenhum erro. O asset está na biblioteca, mas o jogo nunca o escolhe.
- **Causa**: O jogo escolhe a partir de listas criadas na inicialização: `basic_plots`, as listas de decisões, a reserva de mutação de genes, as reservas de armas, as reservas de slots das eras. O seu foi adicionado depois.
- **Solução**: Adicione-o à lista da qual o jogo realmente lê. Cada página indica qual: **[IA e comportamentos personalizados](#/nml/custom-ai)**, **[Tramas](#/nml/plots)**, **[Traços de subespécies](#/nml/subspecies-traits)**, **[Itens personalizados](#/nml/custom-items)**, **[Eras do mundo e comportamentos](#/nml/world-ages)**.

---
## Compila para você, mas não para os outros

### `CS0122: inaccessible due to its protection level`

- **O que você vê**: Código copiado de um mod que funciona não compila: `addStatusEffect`, `getHit`, `_localized_text`, `addBuilding`.
- **Por quê**: Esses são `internal`. O NML compila o seu `Code/*.cs` contra a própria cópia **publicized** (`StreamingAssets/Mods/NML/Assembly-CSharp-Publicized.dll`), então num mod de código normal eles simplesmente funcionam. O erro aparece quando você monta a sua própria `.dll` no Visual Studio contra o `Assembly-CSharp.dll` original, que os esconde.
- **Solução**: Referencie essa cópia publicized no seu projeto, ou use o caminho público:

| Em vez de | Use |
| --- | --- |
| `actor.addStatusEffect("x", 20f)` | `World.world.statuses.newStatus(actor, AssetManager.status.get("x"), 20f)` |
| `actor.getHit(5f, ...)` | `actor.changeHealth(-5)` |
| `LocalizedTextManager.instance._localized_text[k] = v` | `LM.Add("en", k, v)` e depois `LM.ApplyLocale(false)` |

### Funciona na sua máquina, não faz nada na dos outros

- **O que você vê**: Relatos de que o mod carrega e não tem conteúdo, ou quebra na primeira linha.
- **Por quê**: Quase sempre um de quatro: um caminho fixo com o seu nome de usuário; um zip do *conteúdo* do mod em vez da *pasta*; um `GUID` que mudou entre versões; `Code/` enviado junto com uma `.dll` velha.
- **Solução**: Derive os caminhos de `GetDeclaration().FolderPath`. Zipe a pasta. Defina o `GUID` uma vez e nunca mais mude. Envie `Code/` **ou** uma `.dll`, nunca os dois.

---

## Funciona, depois quebra

### Outro mod substitui o seu conteúdo em silêncio

- **O que você vê**: O seu traço some quando um mod específico está ligado. Uma linha no log, que passou faz tempo: `duplicate asset - overwriting...`
- **Por quê**: Um único espaço de ids por biblioteca, dividido entre o vanilla e todos os mods. O último registro vence, e a ordem de carregamento não é sua.
- **Solução**: Prefixe todo id: `hello_swift`, nunca `swift`. Proteja com `if (AssetManager.traits.has(SWIFT)) return;`. Para *mudar* conteúdo vanilla, pegue com `get()` e edite no lugar em vez de adicionar um substituto.

### Crash em `World.world` enquanto o mod carrega

- **O que você vê**: O crash está na sua primeira linha que mexe no mapa.
- **Por quê**: `OnModLoad` roda antes de existir qualquer mundo. As bibliotecas de assets estão prontas; o mundo não.
- **Solução**: Registre no `OnModLoad`, mexa no mundo a partir do `Update()` atrás de `if (!Config.game_loaded) return;` mais uma checagem de null em `World.world`, `World.world.units` e `MapBox.instance`.

### Os seus dados começam a controlar as criaturas erradas

- **O que você vê**: Depois de carregar um save ou criar um mundo novo, unidades sem relação agem possuídas.
- **Por quê**: Os ids de unidade são **por mundo** e são reemitidos do começo. Guardar o objeto `Actor` é pior: atores mortos ficam num pool e são reaproveitados, então a sua referência nunca é null: agora é outra pessoa.
- **Solução**: Perceba a troca de mundo e jogue tudo fora. O tempo do mundo andando para trás é o sinal mais barato:

```csharp
double now = World.world.getCurWorldTime();
if (_lastWorldTime >= 0.0 && now < _lastWorldTime - 1.0) MyRegister.Clear();
_lastWorldTime = now;
```

### Tudo some depois de salvar e carregar

- **O que você vê**: As suas unidades voltam ao comportamento vanilla, mas ainda carregam o seu traço.
- **Por quê**: Só as classes de dados do próprio jogo são serializadas; o seu dicionário estático não. Os traços são salvos como ids, e um id **que não está na biblioteca na hora do carregamento é descartado em silêncio**: desative, carregue, reative, e o traço some de todas as unidades.
- **Solução**: Deixe o traço ser a marca que sobrevive e reconstrua a partir dele: `trait.action_on_augmentation_load = (pActor, pTrait) => MyRegister.Restore(pActor);`
- **Ou**: mantenha o estado na própria unidade. Seu armazenamento de dados personalizados é salvo com ela: veja **[Lembrando coisas](#/nml/saving-data)**.

### Unidades congelam em grupos

- **O que você vê**: Grupos de unidades param de andar; o grupo muda a cada frame. Uma exceção por frame, não milhares.
- **Por quê**: Os loops por unidade não têm try/catch. Uma exceção na unidade *i* pula todas as unidades depois dela naquele frame.
- **Solução**: Envolva o corpo de todo patch e de todo `execute` de comportamento personalizado em try/catch, devolvendo `BehResult.Stop` em caso de falha.

### Metade dos seus patches Harmony nunca foi aplicada

- **O que você vê**: Dois patches de nove funcionam. Um erro, e depois nada.
- **Por quê**: `PatchAll` para na primeira classe de patch que não consegue resolver e nunca processa o resto.
- **Solução**: Faça o patch classe por classe, assim uma falha custa um patch só. O loop completo está em **[Patches Harmony](#/nml/harmony-patches)**.

### O seu patch em `updateStats` quebra para outras pessoas

- **O que você vê**: Tudo bem por uma hora na sua máquina, uma exceção de threads na de um testador.
- **Por quê**: O jogo roda `updateStats` como um job **paralelo**: o seu Postfix executa em threads de trabalho, em várias unidades ao mesmo tempo.
- **Solução**: Ali mexa só nos números daquela unidade. Enfileire todo o resto (chamadas da Unity, listas compartilhadas, o helper de aleatório) para o seu próprio `Update()`.

### Você fez patch em `getHit` e as construções ainda levam dano

- **O que você vê**: A sua regra de dano vale para unidades mas não para construções, ou dispara duas vezes.
- **Por quê**: `getHit` existe três vezes: na classe base e como override em `Actor` **e** em `Building`. O Harmony faz patch num corpo de método, não num slot de despacho.
- **Solução**: Faça patch em cada override concreto que interessa, e proteja contra contagem dupla.

### O seu Prefix quebrou três outros mods

- **O que você vê**: "O seu mod quebrou o mod X." Nada no log, e o autor do X não consegue reproduzir sozinho.
- **Por quê**: Devolver `false` pula o original **e o patch de todos os outros mods depois do seu**. Em `updateStats`, isso ainda deixa flags em cache vencidas na unidade para sempre.
- **Solução**: Prefira Postfix e ajustar (`__result *= 0.5f`) a Prefix e cancelar. Quando precisar cancelar, cancele o método mais estreito e faça `return true` cedo em todo caso que não te interessa.

### Uma unidade fica parada para sempre, ou quebra em todo frame

- **O que você vê**: Uma unidade congelada sem nome de tarefa, ou um stack trace a cada tick.
- **Por quê**: Um id de **tarefa** desconhecido é um "não faz nada" permanente e silencioso; um id de **trabalho** desconhecido é um crash a cada tick.
- **Solução**: Confira os seus ids uma vez no carregamento, registre as tarefas antes do trabalho que as lista, e nunca passe para `next_job_delegate` um id que você não verificou.

### O seu controle da IA volta atrás em silêncio

- **O que você vê**: Depois de um tempo algumas unidades voltam à IA vanilla enquanto o seu registro ainda as lista.
- **Por quê**: Os atores ficam num pool: uma unidade "nova" é um objeto reciclado cujo delegate de trabalho acabou de ser resetado. O combate também reseta.
- **Solução**: Reafirme no seu próprio relógio em vez de uma vez só: `if (pActor.ai.next_job_delegate != MyAI.NextJob) pActor.ai.next_job_delegate = MyAI.NextJob;`

### O jogo engasga quatro vezes por segundo

- **O que você vê**: O FPS médio parece bom, o jogo engasga no ritmo, nenhuma função quente sozinha.
- **Por quê**: Tudo pensa no mesmo tick, e as unidades só avançam quando a ação atual acaba, então terminam juntas.
- **Solução**: Pense no seu próprio temporizador, não no `execute`. Divida a população em fatias e processe uma fatia por passada. Pré-aloque listas; deixe LINQ, lambdas e `Debug.Log` fora desse caminho.

### Os cliques caem no mapa atrás da sua janela

- **O que você vê**: O jogador clica num controle do seu painel e uma unidade nasce embaixo dele.
- **Por quê**: Um canvas sem `GraphicRaycaster` é desenhado mas não recebe cliques. E `unselect_when_window` só conhece as janelas do próprio jogo, então um painel feito à mão nunca desarma o poder ativo.
- **Solução**: `Canvas` + `overrideSorting` + `sortingOrder` + `GraphicRaycaster` + uma `Image` de fundo, juntos. `raycastTarget = false` nos rótulos. Desarme o poder você mesmo quando a janela abrir.

### A memória sobe toda vez que o painel abre

- **O que você vê**: A memória cresce em degraus, um por abertura do painel; sessões longas pioram.
- **Por quê**: `Destroy(root)` libera a árvore de GameObjects, mas uma `Texture2D` ou um `Sprite` que **você** criou é um objeto separado que ninguém recolhe.
- **Solução**: Destrua o que você criou e zere as referências. **Não** destrua sprites vindos do `SpriteTextureLoader`: esses são compartilhados.

### Um novo padrão nunca chega a quem já joga

- **O que você vê**: Você muda um padrão no `default_config.json` e quem já jogava mantém o valor antigo. Instalações novas estão certas.
- **Por quê**: Esse arquivo é só um modelo. Os valores vivos ficam em `mods_config\<UID>.config`, que guarda o **item inteiro**: então limites alterados e callbacks renomeados também ficam por baixo.
- **Solução**: Teste com esse arquivo apagado. Quando limites ou um callback precisarem mudar para quem já joga, adicione um `Id` novo em vez de editar o antigo.

### Um slider de configuração se mexe, o seu callback nunca roda

- **O que você vê**: A linha funciona, o valor é salvo, o seu método nunca é chamado.
- **Por quê**: O callback é `Namespace.Type:MethodName`, o método precisa ser **static**, e o parâmetro precisa bater com o tipo (`INT_SLIDER` → `int`, `SLIDER` → `float`, `SWITCH` → `bool`, `TEXT` → `string`).
- **Solução**: Inclua o namespace, faça static, bata o tipo. As mudanças valem quando a janela **fecha**, não enquanto você arrasta.

---

## Ainda com problemas?

Mande em **[Feedback e solicitações](#/feedback)** com três linhas (o que você fez, o que esperava, o que aconteceu) e a linha do log. Armadilhas novas entram nesta página :aPES4_Noted:.
