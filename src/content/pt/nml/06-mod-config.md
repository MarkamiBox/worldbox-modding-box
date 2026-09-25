---
title: Configurações do mod
group: NML Modding
subgroup: Avançado e publicação
icon: :wbsettingsgear:
order: 40
---

# Configurações do mod :wbsettingsgear:

Mais cedo ou mais tarde alguém vai dizer que o seu mod é forte demais, lento demais ou barulhento demais. Em vez de ficar discutindo no Discord :PESgn_WhySoToxic:, dê a eles uma janela de configurações e deixe que ajustem por conta própria.

O NML desenha a janela inteira para você. Você só escreve um único arquivo JSON.

## default_config.json

Coloque um `default_config.json` na raiz do seu mod, ao lado de `mod.json`:

```json default_config.json
{
  "hellobox": [
    {
      "Id": "strike_radius",
      "Type": "INT_SLIDER",
      "IntVal": 25,
      "MinIntVal": 5,
      "MaxIntVal": 100,
      "Callback": "HelloBox.HelloSettings:SetStrikeRadius"
    },
    {
      "Id": "max_spawns",
      "Type": "INT_SLIDER",
      "IntVal": 40,
      "MinIntVal": 1,
      "MaxIntVal": 500
    },
    {
      "Id": "tint_by_mood",
      "Type": "SWITCH",
      "BoolVal": true
    }
  ]
}
```

`"hellobox"` é o **group id**: uma aba de configurações. Tudo dentro dele forma uma linha na janela.

| Chave | Significado |
| --- | --- |
| `Id` | Único dentro do grupo. É assim que você lê o valor no código |
| `Type` | `SWITCH` (on/off), `SLIDER` (decimal), `INT_SLIDER` (inteiro), `TEXT` (campo de texto), `SELECT` (grade de opções) |
| `BoolVal` / `FloatVal` / `IntVal` / `TextVal` | O valor padrão compatível com o tipo |
| `MinFloatVal` / `MaxFloatVal`, `MinIntVal` / `MaxIntVal` | Limites do controle deslizante. Para `SELECT`, `MaxIntVal` é o número de opções e `IntVal` o índice escolhido |
| `IconPath` | Ícone opcional para a linha |
| `Callback` | `Namespace.Type:MethodName` opcional chamado quando o valor muda |

Para `SELECT`, o NML cria um botão para cada opção. Os rótulos vêm direto da sua localização como `<id>_0`, `<id>_1` e assim por diante.

## Lendo os valores

Com o `BasicMod<T>`, você ganha o `GetConfig()` de graça, indexado por grupo e depois por id:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LoadSettings();
}

private void LoadSettings()
{
    try { HelloSettings.StrikeRadius = GetConfig()["hellobox"]["strike_radius"].IntVal / 100f; }
    catch (System.Exception) { }

    try { HelloSettings.TintByMood = GetConfig()["hellobox"]["tint_by_mood"].BoolVal; }
    catch (System.Exception) { }
}
```

O NML chama `persistent_config.MergeWith(default_config)` na inicialização, então quando você adiciona uma chave nova ao `default_config.json`, o NML a mescla automaticamente na configuração salva do jogador com o valor padrão. O `try/catch` continua sendo uma boa prática caso alguém tenha aberto o `.config` num editor de texto e quebrado o JSON, mas nas atualizações normais o NML te protege.

## Callbacks

Um `Callback` tem a forma `Namespace.Type:MethodName`, e o método recebe o novo valor:

```csharp Mods/HelloBox/Code/HelloSettings.cs
namespace HelloBox
{
    public static class HelloSettings
    {
        public static float StrikeRadius = 0.25f;
        public static bool TintByMood = true;

        // chamado pelo NML quando o jogador mexe no controle deslizante
        public static void SetStrikeRadius(int pValue)
        {
            StrikeRadius = pValue / 100f;
        }
    }
}
```

> [!WARNING] As mudanças se aplicam quando a janela fecha
> Não enquanto você arrasta o controle. Se o seu callback faz algo pesado, isso é uma ótima notícia. Se você esperava uma prévia em tempo real, é por isso que "não funciona" :huh:. O `BasicMod` também dispara cada callback uma vez na inicialização, para que seu código pegue o que o jogador salvou.

## Onde é salvo

O seu `default_config.json` é apenas o **modelo**. As escolhas reais do jogador são gravadas em:

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox\mods_config\<YOUR_GUID>.config
```

Que também é a primeira coisa a deletar quando você estiver testando valores padrão e se perguntando por que o novo valor nunca aparece :PESgn_OOF:.

## Don't forget the text (again)

Ids de grupo e de item também são chaves de locale, então coloque no `Locales/en.json` ou vão aparecer crus. Cada linha quer ainda uma segunda chave, **`"<id> Description"`**, com espaço e D maiúsculo, para o tooltip:

```json Mods/HelloBox/Locales/en.json
{
  "hellobox": "HelloBox",

  "strike_radius": "Strike radius",
  "strike_radius Description": "How far the god power reaches.",

  "max_spawns": "Maximum spawns",
  "max_spawns Description": "Upper limit before the mod stops spawning.",

  "tint_by_mood": "Tint units by mood",
  "tint_by_mood Description": "Colour units by how happy they are."
}
```

> [!TIP] O log diz quais você esqueceu
> Um rótulo faltando imprime `LocalizedTextManager: missing text: strike_radius Description`. Procure por `missing text:` depois de abrir a janela de configurações uma vez e você tem a lista exata de chaves :wbsmirk:.


## Sem BasicMod

Se a sua classe principal implementar `IMod` diretamente, implemente `IConfigurable` na mesma classe e retorne a instância você mesmo:

```csharp
public ModConfig GetConfig()
{
    return _config;   // criado ou carregado por você
}
```

Esse único método é o que faz o botão de configurações aparecer ao lado do seu mod na lista de mods. Um único método, e ninguém mais discute com você no Discord. Na teoria.

## Configurações do mod ou opções do jogo?

Mantenha as preferências comuns do HelloBox em `default_config.json`. O `AssetManager.options_library` do jogo é um sistema diferente, apoiado por `PlayerConfig`, e é útil quando você está ligando um interruptor nativo. Registrar um asset de opção sozinho não cria seu valor armazenado.

Próximo: **[Opções de jogo e escalas de tempo](#/nml/game-options)** para essa rota, ou **[Abas e botões de poder](#/nml/power-buttons)** para colocar um controle na tela.
