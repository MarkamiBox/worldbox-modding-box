---
title: O console ao vivo (BepInEx)
group: Visão Geral
subgroup: Ferramentas externas e configuração
icon: :wbvideo:
order: 5
---

# O console ao vivo :wbvideo:

Ficar abrindo o `Player.log` no Bloco de Notas após cada teste é um sofrimento sem fim. (E eu ainda faço isso às vezes, não vou mentir :23062-durrr:). O **BepInEx** te dá uma janela preta de console que cospe logs ao vivo enquanto o jogo roda, para que sua linha apareça no exato segundo em que o seu código for executado.

Essa é uma configuração de dez minutos que você faz uma única vez e aproveita pelo resto da sua vida de modder.

## O que é o BepInEx

Um mod loader que se conecta aos jogos de Unity antes mesmo da inicialização. Os modders de WorldBox usam ele basicamente para duas coisas: o console ao vivo e o **UnityExplorer** (que tem uma página dedicada só para ele). Aqui somos gente civilizada do NML, mas esse console é bom demais para ficar de fora :trollface:. O NML até pode instalá-lo para você caso um mod exija, mas fazer isso manualmente garante que você tenha total controle das configurações.

## Como instalar

1. Na [página oficial de releases do BepInEx](https://github.com/BepInEx/BepInEx/releases), role até **Assets** e pegue o arquivo chamado `BepInEx_win_x64_5.4.x.x.zip`. Exatamente com esse formato: **win**, **x64**, **5**. As versões de `x86`, `unix`, `macos` e `BepInEx 6 / IL2CPP` parecem tentadoras, mas nenhuma delas funciona aqui :PES5_Dumb:.
2. Clique com o botão direito no zip → **Propriedades** → marque a caixa **Desbloquear** se ela estiver presente, e extraia o conteúdo **diretamente na pasta do WorldBox**, onde fica o `worldbox.exe` (caminho padrão da Steam: `C:\Program Files (x86)\Steam\steamapps\common\worldbox`, ou botão direito no WorldBox na Steam → **Gerenciar** → **Navegar pelos arquivos locais**). O resultado deve ficar assim:

```text
worldbox/
├── worldbox.exe
├── BepInEx/
├── doorstop_config.ini
└── winhttp.dll
```

3. **Inicie o jogo uma vez e feche.** Essa primeira inicialização serve apenas para gerar os arquivos de configuração. Nada de diferente vai aparecer na tela, e isso é normal :hmm:.

## Ativando o console

Abra `BepInEx/config/BepInEx.cfg` em qualquer editor de texto, procure a seção `[Logging.Console]` e defina:

```text BepInEx/config/BepInEx.cfg
[Logging.Console]

## Enables showing a console for log output.
# Setting type: Boolean
# Default value: false
Enabled = true
```

Inicie o jogo novamente. Uma segunda janela preta vai abrir ao lado dele, já jorrando mensagens de texto.

## Lendo o console

Mesmo sem ter criado mod nenhum ainda, ao abrir o jogo você já verá o BepInEx e o NeoModLoader inicializando:

```text BepInEx console
[Info   :   BepInEx] Loading [NeoModLoader 1.x.x]
[Info   :Application] Initializing WorldBox...
[Info   :Application] [NML]: NeoModLoader initialized!
```

Se você viu essas linhas, parabéns: seu console ao vivo já está de pé e funcionando!

Mais para frente, quando você criar seu primeiro mod no guia **[Seu primeiro mod](#/nml/your-first-mod)**, você verá o seu próprio mod compilando e dando oi bem no meio do turbilhão de logs:

```text BepInEx console
[Info   :Application] 005: Compile Mod HelloBox                = 2,2480
[Info   :Application] [NML]: [HelloBox]: HelloBox is alive!
```

Três hábitos que fazem o console valer cada segundo:

- **Coloque um prefixo em cada log** com o nome do seu mod, tipo `[MeuMod]`, para bater o olho e achar suas linhas na hora.
- **Logue no começo e no fim** de cada etapa de inicialização. Se você vir "registrando traits..." mas nunca ler "traits registrados", já sabe de primeira onde o código morreu.
- **Deixe o console em um segundo monitor** (ou dividindo a tela). Ver uma linha pular na tela no exato instante em que você clica em um botão é o método de depuração mais rápido que existe :memes:.

## Como você vai usá-lo (Prévia rápida)

Assim que configurar os arquivos do seu mod no guia **[Seu primeiro mod](#/nml/your-first-mod)**, você poderá adicionar logs ao vivo para testar ações no jogo:

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;

    // Botão esquerdo do mouse, um disparo por clique
    if (Input.GetMouseButtonDown(0))
    {
        LogInfo("click!");
    }
}
```

Cada clique vai imprimir uma linha no console na mesma hora. Essa resposta instantânea é a razão pela qual o BepInEx é simplesmente indispensável!
