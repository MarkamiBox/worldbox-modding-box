---
title: Logs e depuração
group: NML Modding
subgroup: Fluxo de trabalho básico
icon: :wbdebugburger:
order: 24
---

# Logs e depuração :wbdebugburger:

O log é a única coisa no mundo do modding que sempre diz a verdade. Ele responde à pergunta que você fará milhares de vezes: **meu código realmente rodou?**

## Imprimindo uma linha

Existem duas formas, e ambas terminam no mesmo arquivo.

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");      // NML: coloca o nome do seu mod como prefixo automaticamente
            LogWarning("something smells");
            LogError("something exploded");

            Debug.Log("[HelloBox] plain Unity");  // Unity: você mesmo adiciona o prefixo
        }
    }
}
```

Não está usando `BasicMod`? O `NeoModLoader.services.LogService` contém os mesmos métodos `LogInfo`, `LogWarning`, `LogError`, além de `LogStackTraceAsError` para obter o rastreamento completo.

## Como é a aparência de um log saudável

Inicie o jogo com o mod acima e procure por `HelloBox` no arquivo `Player.log`. Você deve ver algo assim:

```text Player.log
005: Compile Mod HelloBox                = 2,2480
006: Load Resources From Mod HelloBox    = 0,0012
[NML]: [HelloBox]: OnLoad
[NML]: [HelloBox]: HelloBox is alive!
[NML]: [HelloBox]: Loaded
008: Init Mod HelloBox                   = 0,0014
```

Linha por linha: o NML compilou os arquivos em `Code/`, carregou seus recursos e chamou o `OnModLoad`, que imprimiu sua mensagem. As linhas numeradas mostram a contagem de tempo do NML para cada etapa: o número após o `=` são segundos, e algumas linhas saem em vermelho no log. **O vermelho aqui não indica falha**, significa apenas que aquele passo foi o mais demorado :hmm:.

A linha que realmente interessa é a sua. Se `[HelloBox]: HelloBox is alive!` estiver ausente, continue lendo.

## Quando seu código não compila

Antes que seu mod possa rodar, o NML precisa compilá-lo. Um erro de digitação interrompe o processo na hora, e ele aponta exatamente o local:

```text Player.log
[NML]: Code\Main.cs(9,42): error CS1002: ; expected
[NML]: Failed to compile mod HelloBox
```

Leia da direita para a esquerda: **`; expected`** é o problema, **`(9,42)`** indica linha 9, caractere 42, e **`Code\Main.cs`** é o arquivo afetado. Abra esse arquivo, vá até a linha indicada e coloque o ponto e vírgula.

A linha realmente útil é a **primeira**. A linha `Failed to compile mod HelloBox` abaixo é apenas um aviso genérico. As pessoas leem essa última, entram em pânico e não veem a resposta clara logo acima :PES4_1IQ:.

## Como é a aparência de um log com erros em tempo de execução

Assim que seu código compilar, este é o outro erro que você verá com muita frequência :PES2_F::

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
NullReferenceException: Object reference not set to an instance of an object
  at HelloBox.HelloTraits.Initialize () [0x00021] in HelloTraits.cs:24
  at HelloBox.Main.OnModLoad () [0x0000c] in Main.cs:12
```

Parece assustador, mas é uma frase muito direta:

- **`NullReferenceException`**: você tentou acessar um objeto que estava vazio (`null`). Corresponde a 95% dos erros que você terá na vida.
- **`at HelloBox.HelloTraits.Initialize ()`**: o método onde a falha ocorreu.
- **`in HelloTraits.cs:24`**: **linha 24 do seu próprio arquivo**. Examine essa linha: algo nela vale `null`.
- As linhas abaixo representam a pilha de chamadas, da mais recente para a mais antiga. Dê atenção especial aos arquivos criados por você.

O motivo clássico desse erro exato: tentar alterar `base_stats` em um asset antes de adicioná-lo à sua biblioteca. Mais detalhes na página **[Traços customizados](#/nml/custom-traits)**.

## Onde os logs ficam salvos

| Arquivo | Local | Finalidade |
| --- | --- | --- |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | Sessão atual |
| `Player-prev.log` | mesma pasta | A sessão **anterior**, que acabou de travar :aPES_Flatline: |
| `logs/error_*.log` | mesma pasta, dentro de `logs/` | Um arquivo para cada erro capturado pelo jogo |
| `mods_config/<GUID>.config` | mesma pasta | As configurações salvas do usuário para o seu mod |

Cole `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` na barra de endereços do Windows Explorer para abrir a pasta diretamente.

## Um console em tempo real em vez de um arquivo

Abrir um arquivo após o jogo fechar é lento. Com o **BepInEx** você ganha uma janela preta de console que exibe logs em tempo real enquanto joga, permitindo ver sua linha surgir no milissegundo em que clica em um botão. Leva dois minutos para instalar: **[Console BepInEx](#/toolbox/bepinex-console)**.

Quer clicar em janelas do jogo e inspecionar valores em tempo de execução? Use o **[UnityExplorer](#/toolbox/unity-explorer)**.

## Não deixe um erro quebrar o mod inteiro

O `OnModLoad` roda de cima para baixo. Se a linha 3 disparar um erro, as linhas de 4 a 20 nunca serão executadas e metade do seu mod deixará de existir sem aviso. Dê a cada parte sua própria rede de proteção:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    Stage("traits", HelloTraits.Initialize);
    Stage("items", HelloItems.Initialize);
    Stage("powers", HelloPowers.Initialize);
    LogInfo("HelloBox ready");
}

// Executa uma etapa e, se falhar, registra qual foi e continua a execução.
private static void Stage(string pName, System.Action pAction)
{
    try { pAction(); }
    catch (System.Exception e) { LogError($"stage '{pName}' failed: {e}"); }
}
```

Agora, um traço com defeito custará apenas aquele traço, não o mod inteiro, e o log identificará exatamente a etapa culpada:

```text Player.log
[NML]: [HelloBox]: stage 'items' failed: NullReferenceException ...
[NML]: [HelloBox]: HelloBox ready
```

## Não toque no mundo antes que ele exista

O `OnModLoad` roda **antes** de qualquer mundo ser criado. Não há mapa, nem unidades, nada. Tentar acessá-los ali fará o jogo travar antes do menu principal :surprised_pikachu:. Tudo o que rodar a cada frame precisa de uma verificação de segurança:

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;                        // ainda no menu
    if (World.world == null || World.world.units == null) return;  // ainda não há mundo
    if (MapBox.instance == null) return;

    // a partir daqui é seguro interagir com o mundo
}
```

## Recarregar código sem reiniciar

Reiniciar o WorldBox para testar uma única linha alterada consome a maior parte do tempo de modding. Pergunte a quem já fez isso quarenta vezes numa noite. O NML pode recompilar seu mod enquanto o jogo roda e trocar a quente os métodos que você marcou.

1. Sua classe principal implementa `IReloadable`, que consiste em um único método, `Reload()`. O HelloBox faz isso em **[O mod completo](#/nml/all-together)**.
2. O botão de recarga só aparece enquanto `Config.isEditor` for `true`. O HelloBox alterna isso a partir de uma opção `DevReload` que vem como `false`.
3. Marque os métodos que deseja substituir com `[Hotfixable]`, de `NeoModLoader.api.attributes`:

```csharp
using NeoModLoader.api.attributes;

[Hotfixable]
public static WorldTile PickTile(Actor pActor)
{
    // edite isso enquanto o jogo roda, aperte recarregar e veja a próxima criatura usar
}
```

Em seguida, edite o método, salve e clique no botão de recarregar do seu mod na lista do NML. O NML recompila, aplica patches nos métodos marcados e chama `Reload()`. Qualquer método não marcado continua executando o código antigo.

> [!WARNING] `Config.isEditor` é o próprio interruptor do jogo
> Ele diz ao WorldBox que está rodando dentro do editor Unity, e alguns sistemas reagem a isso: algumas interfaces adotam layout mobile, certos objetos se destroem no início. Ative para seus testes e nunca em um mod publicado.

O que não pode fazer: callbacks do Unity como `Awake` e `Update`, construtores e qualquer coisa que o jogo já tenha instanciado com o código antigo. Um asset registrado no carregamento mantém os delegates fornecidos na época: o `Reload()` é onde você os reatribui manualmente.

## Os erros clássicos que todo mundo comete

| Sintoma visível | O que realmente significa |
| --- | --- |
| O mod não aparece na lista | Falta `mod.json`, ou contém JSON inválido (uma vírgula a mais :pepeclown:) |
| O mod está na lista, mas nada acontece | O `OnModLoad` falhou. Procure no log pelo prefixo do mod e pela palavra `Exception` |
| `Failed to compile mod ...` | Erro de digitação no C#. O erro real está na linha **imediatamente acima** |
| `NullReferenceException` em asset novo | Você alterou `base_stats` antes de chamar `add()`: a biblioteca é quem o inicializa |
| O texto aparece como `trait_whatever` | Tradução ausente, veja **[Localização](#/nml/localization)** |
| Seu botão é um buraco invisível | O caminho do sprite está errado e o ícone retornou `null` |
| Funciona no seu PC, mas em nenhum outro | Você colocou um caminho absoluto com seu nome de usuário do Windows :homerhide: |
