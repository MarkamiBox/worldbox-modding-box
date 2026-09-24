---
title: Publicando seu mod
group: NML Modding
subgroup: Avançado e publicação
icon: :wbfireworks:
order: 46
---

# Publicando seu mod :wbfireworks:

Seu mod funciona. Agora deixe as outras pessoas quebrarem ele.

Existem dois lugares onde um mod de WorldBox pode viver, e eles não têm a mesma popularidade:

| | |
| --- | --- |
| **[GameBanana](https://gamebanana.com/games/11196)** | Onde a comunidade de modding de WorldBox realmente está. Qualquer um pode baixar de lá, incluindo jogadores que compraram o jogo fora da Steam |
| **Steam Workshop** | Integrado ao NML, mas com muito menos mods |

Publique no GameBanana. Faça um espelho na Workshop depois se tiver vontade.

## Empacotando o mod

Um upload no GameBanana é um **zip da pasta do seu mod**, nada além disso. A pasta dentro do zip precisa ser aquela que contém o `mod.json`:

```text HelloBox.zip
HelloBox/
├── mod.json
├── icon.png
├── default_config.json
├── Locales/
├── GameResources/
└── Code/
```

Não um zip do *conteúdo*. Um zip da *pasta*. Alguém descompactando na pasta `Mods/` deve terminar com `Mods/HelloBox/mod.json`. Se terminar com `Mods/mod.json`, vai reclamar que o seu mod não carrega :PES_Facepalm:.

**Deixe de fora** tudo o que não for necessário para rodar: `.git/`, `bin/`, `obj/`, `.vs/`, sua `.sln`, suas anotações. Se você distribuir uma `.dll` pré-compilada, distribua ela *em vez de* `Code/`, não junto com uma cópia desatualizada do código-fonte.

## Enviando para o GameBanana

1. Crie uma conta e vá para a **[página do jogo WorldBox](https://gamebanana.com/games/11196)**.
2. **Add → Mod**.
3. Preencha nome, descrição e categoria. A categoria importa mais do que você pensa: é assim que as pessoas te encontram.
4. Envie o zip e adicione pelo menos uma captura de tela **do mod fazendo algo dentro do jogo**. Não apenas o seu ícone ou a lista de mods.
5. Na descrição, diga claramente: o que ele adiciona, que precisa do **NeoModLoader** e qualquer mod com o qual ele entre em conflito.

Atualizar mais tarde é feito na mesma página em **Edit → Files**. Adicione o novo zip, escreva uma linha de changelog e aumente a `version` no `mod.json` para coincidir. Manter a versão do GameBanana e do `mod.json` sincronizadas não custa nada e evita qualquer dúvida sobre qual versão está instalada.

> [!TIP] Uma imagem vale mais que um parágrafo
> As pessoas decidem pela miniatura. Uma única foto clara no jogo mostrando o que seu mod adiciona fará muito mais por você do que a descrição mais bem escrita do site :PES_Camera:.

## O caminho do Steam Workshop

Enviar para a Workshop acontece **dentro do jogo**, e o jeito de abrir a janela de envio é o pedaço de interface mais amaldiçoado deste hobby :kekw:.

1. Abra a janela de **Mods** no jogo.
2. Clique no **ícone** do seu mod exatamente **oito vezes**, com menos de um segundo entre os cliques.
3. Espere cerca de três segundos.
4. A janela de upload vai aparecer.

Se nada acontecer, você clicou devagar demais ou clicou na linha em vez do ícone.

| Campo | O que preencher |
| --- | --- |
| Campo superior (`fileID`) | **Deixe vazio** na primeira vez. Para atualizações, cole o id do link do seu item da workshop |
| Campo inferior | O changelog. Pode ficar vazio, editável na página da workshop depois |

Essa é toda a diferença entre publicar e atualizar: um `fileID` vazio cria um item novo, um preenchido substitui um existente.

### Autenticação, na primeira vez

Enviar um mod novo para a Workshop pede autenticação. Três maneiras:

- **Discord**: consiga o cargo `Modder` no Discord oficial de WorldBox pedindo a um administrador.
- **GitHub**: junte-se à organização `WorldBoxOpenMods`. Mande um e-mail com o assunto "WorldBoxOpenMods", seu usuário do GitHub e seu mod, e espere até uma semana.
- **Pular**: seu mod sobe com a tag `Unverified Mods`. Funciona normalmente, só fica menos visível.

## Antes de enviar, em qualquer plataforma

- **`mod.json` é sua vitrine.** `name`, `author`, `version`, `description` são o que as pessoas leem. Suba a `version` a cada lançamento e **nunca mude sua `GUID`** depois do primeiro envio: ela é a identidade do seu mod, o arquivo de configurações do jogador leva o nome dela e outros mods podem depender dela.
- **`icon.png` existe e é apresentável.** Na Workshop é também a imagem onde o jogador terá que clicar oito vezes, então pelo menos deixe-a bonita.
- **Seu mod deve funcionar em qualquer pasta.** Nunca coloque caminhos absolutos como `C:\Users\SeuNome\...`. Use `GetDeclaration().FolderPath`. Essa é a razão mais comum para um mod funcionar para o autor e para mais ninguém :PES2_Bruh:.
- **Leia o seu próprio log com calma pelo menos uma vez.** Abra o jogo, carregue um mundo, jogue por dois minutos, procure no `Player.log` pelo seu prefixo e por `Exception`. Lance com zero exceções.
- **Teste com o arquivo de configurações apagado.** Apague `mods_config/<GUID>.config` para testar os valores padrão que um novo jogador realmente recebe.
- **Teste com outros mods ligados.** Se você alterou algo, outra pessoa também deve estar alterando.
- **Teste em um save novo.** Os assets que você registra precisam existir antes de carregar um save que faça referência a eles.

## Dependencies

Se o seu mod depende de outro, declare em vez de travar por falta de classe:

```json mod.json
{
  "Dependencies": ["com.otherperson.coolmod"],
  "OptionalDependencies": ["com.someone.niceextra"],
  "IncompatibleWith": ["com.someone.rivalmod"]
}
```

O NML cuida da ordem de carregamento e avisa o jogador, o que é muito mais elegante do que uma NullReferenceException logo na linha um.

## Após o lançamento

Os comentários terão exatamente três tipos de mensagem: "não funciona" sem log nenhum anexo, uma ideia verdadeiramente brilhante que você não tinha pensado, e alguém pedindo multiplayer :PESgn_DidIAsk:.

Responda à segunda. Para a primeira, fixe uma mensagem avisando onde fica o `Player.log` (veja **[Logs e depuração](#/nml/logs-and-debugging)**), porque um relato de erro sem log é um relato sobre o qual você não pode fazer absolutamente nada.

E seja bem-vindo. Cada mod novo deixa esta pequena comunidade um pouco menos cemitério, e cinco numa semana é a era de ouro do modding :PES5_CrazyPog:.
