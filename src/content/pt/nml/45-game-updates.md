---
title: Atualizar depois de uma atualização do jogo
group: NML Modding
subgroup: Avançado e publicação
icon: :wbsettingsgear:
order: 47
---

# Atualizar depois de uma atualização do jogo :wbsettingsgear:

O WorldBox atualizou, e o seu mod está vermelho na lista. Bem-vindo ao modding, isso acontece com todo mundo e vai acontecer de novo :PES2_Shrug:.

O seu mod chama o código do próprio jogo. Quando os desenvolvedores renomeiam um método, mudam um campo de lugar ou mudam o que um método recebe, o seu código aponta para algo que não existe mais. Não está quebrado para sempre, só está desatualizado. Esta página é a ordem em que eu verifico tudo, toda vez.

## 1. Atualize o NML primeiro

Antes de mexer no seu código, pegue o **`NeoModLoader.dll`** mais recente na página **[Instalar o NML](#/install-nml)**. Uma atualização grande do jogo costuma trazer um NML novo também, e um loader velho num jogo novo falha de um jeito que parece exatamente culpa sua.

Se o próprio NML não carrega, você ainda nem chegou no seu mod. Veja **[o jogo está numa versão antiga](#/troubleshooting)** na solução de problemas e depois volte.

## 2. Leia o primeiro erro

Abra o jogo e depois o `Player.log` (onde fica: **[Logs e depuração](#/nml/logs-and-debugging)**). Encontre o primeiro erro do seu mod e ignore tudo abaixo dele por enquanto. Erros vêm em cascata, e corrigir o primeiro muitas vezes faz outros cinco sumirem.

Depois de uma atualização você vai ver principalmente estes:

| Erro | O que mudou no jogo |
| --- | --- |
| `CS0117: 'X' does not contain a definition for 'Y'` | Um campo ou método estático foi renomeado ou removido |
| `CS1061: 'X' does not contain a definition for 'Y'` | O mesmo, mas num objeto: `actor.someMethod()` não existe mais |
| `CS0246: The type or namespace name 'X' could not be found` | Uma classe inteira foi renomeada ou movida |
| `CS7036` / `CS1501` | O método ainda existe, mas agora recebe argumentos diferentes |
| `CS0122: 'X' is inaccessible due to its protection level` | Algo que você usava virou `internal`, veja **[essa entrada](#/troubleshooting)** |
| `CS0029` / `CS0266` | Um campo mudou de tipo, por exemplo de `int` para `float`, ou de um texto para um asset |
| `HarmonyException` / `MissingMethodException` ao iniciar | Um método que você **patcheia** foi renomeado. Seu código compila, mas o patch não tem onde se prender |

O último é o traiçoeiro. Um patch que escreve o nome do método como texto simples, tipo `"updateStats"`, só é verificado quando o jogo abre. Então uma mudança de nome não impede o mod de compilar, impede de funcionar. Patches escritos com `nameof` dão um erro de compilação normal, mais um motivo para usar sempre que der (**[duas formas de escrever o nome do método](#/nml/harmony-patches)**).

## 3. Encontre o nome novo

O nome velho sumiu, então procure o substituto:

- **[Busca de métodos](#/tools/methods)** neste site. Digite o que o método *fazia*, não como se chamava: "add trait to unit" encontra mesmo que o nome tenha mudado.
- **[Campos dos assets](#/tools/fields)** para os campos dos assets. Procure a parte do nome que você lembra.
- **dnSpy**, que sempre está certo, porque lê o jogo que você realmente tem. As ferramentas de busca daqui são refeitas depois das atualizações, mas podem ficar alguns dias atrás de uma recém-lançada. Como usar: **[Lendo o código do jogo](#/toolbox/reading-the-game-code)**.

O truque que eu mais uso: abra o asset ou método vanilla que faz o mesmo trabalho que o seu e veja como **o próprio jogo** escreve agora. Se o jogo mudou o jeito de criar traços, os traços dele já usam o jeito novo :PESgn_Noice:.

## 4. Confira seus patches do Harmony na mão

Um patch também pode dar errado sem erro nenhum. Passe um por um e confira o método no dnSpy:

- **Nomes dos parâmetros.** O Harmony preenche os parâmetros **pelo nome**. Se o jogo renomeou `pDamage` para `pAmount`, o seu `float pDamage` não recebe nada, em silêncio. Veja **[os nomes de parâmetro mágicos](#/nml/harmony-patches)**.
- **Sobrecargas.** Um método que era único pode ter ganhado um gêmeo, e o seu patch falha com `Ambiguous match found`.
- **O que o método faz.** Às vezes o nome fica, mas a lógica vai para outro lugar. O patch roda e nada muda. Coloque uma linha `LogInfo` no patch: se ela nunca aparecer, o jogo não chama mais esse método.

## 5. Procure coisas que pararam de fazer algo

Compilar de novo não é a linha de chegada. Carregue um mundo e confira se cada parte ainda funciona: o traço mostra o ícone, o item cai, o poder cria o que deveria.

Uma atualização pode adicionar um campo que os assets vanilla agora preenchem e os seus não. O asset carrega, sem erro, e simplesmente não faz nada. Compare o seu asset campo por campo com o vanilla mais parecido no `init()` da biblioteca dele. O que o jogo agora define e você não é o seu suspeito.

## 6. Teste um save antigo também

Carregue um mundo salvo **antes** da atualização, com o seu mod ligado. Os dados próprios guardados nas unidades (**[Salvando dados](#/nml/saving-data)**) devem voltar como estavam. Se você renomeou um id enquanto consertava, os saves antigos ainda usam o id velho, então só renomeie se for mesmo necessário.

## 7. Publique

- Aumente `version` no `mod.json`.
- Diga com qual versão do jogo ele funciona na descrição e no changelog, para os jogadores saberem qual pegar.
- Envie o zip novo do mesmo jeito que antes: **[Publicando](#/nml/publishing)**.

Depois responda os comentários de "tá atualizado??", você mereceu :wbsalut:.

## Para a próxima atualização doer menos

- **Faça menos patches.** Cada patch do Harmony é um ponto que pode quebrar. Se um campo de asset ou um recurso do NML resolve, use isso.
- **Coloque seu código em try/catch.** Um recurso quebrado escreve um erro no log, e o resto do mod continua funcionando. Veja **[Logs e depuração](#/nml/logs-and-debugging)**.
- **Uma classe de patch por tarefa.** Quando um patch quebra, só aquele recurso cai, não todos.
- **Deixe seus ids num lugar só.** Constantes como `HelloTraits.SWIFT` fazem uma renomeação ser uma edição, não vinte.
