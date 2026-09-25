---
title: Opções de jogo
group: Conteúdo do jogo
subgroup: Poderes divinos e interface
icon: :wbsettingsgear:
order: 206
---

# Opções de jogo :wbsettingsgear:

Em **[Configurações do mod](#/nml/mod-config)** você viu a própria janela de configuração do NML (`default_config.json`), que dá ao seu mod uma aba de configurações limpa e separada.

O WorldBox também tem seu próprio sistema nativo de opções: `AssetManager.options_library`, apoiado por `PlayerConfig`. É o sistema que move a janela de configurações vanilla, os interruptores de desenvolvedor e os botões de poder divino que alternam estado. Ao lado dele fica `AssetManager.time_scales`, que controla a velocidade com que o mundo avança.

## Registrando uma opção nativa

Opções em `AssetManager.options_library` são instâncias de `OptionAsset`:

```csharp Mods/HelloBox/Code/HelloOptions.cs
namespace HelloBox
{
    public static class HelloOptions
    {
        public const string TURBO_HARVEST = "hello_turbo_harvest";

        public static void Initialize()
        {
            if (AssetManager.options_library.has(TURBO_HARVEST)) return;

            OptionAsset option = new OptionAsset
            {
                id = TURBO_HARVEST,
                type = OptionType.Bool,
                default_bool = false,
                translation_key = "option_hello_turbo_harvest",
                translation_key_description = "option_desc_hello_turbo_harvest",
                action = (OptionAsset pAsset) =>
                {
                    bool active = IsTurboActive();
                    Main.Log("Turbo harvest is now: " + active);
                }
            };

            AssetManager.options_library.add(option);

            // Registrar o asset NÃO preenche PlayerConfig.dict automaticamente.
            // Garanta que o valor exista para que seu código possa lê-lo imediatamente:
            if (!PlayerConfig.dict.ContainsKey(TURBO_HARVEST))
            {
                PlayerConfig.dict.Add(TURBO_HARVEST, new PlayerOptionData
                {
                    name = TURBO_HARVEST,
                    boolVal = option.default_bool
                });
            }
        }

        public static bool IsTurboActive()
        {
            if (PlayerConfig.dict.TryGetValue(TURBO_HARVEST, out PlayerOptionData data))
            {
                return data.boolVal;
            }
            return false;
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "option_hello_turbo_harvest": "Turbo Harvest",
  "option_desc_hello_turbo_harvest": "Settlers gather crops at triple speed."
}
```

### Os campos de OptionAsset

| Campo | O que faz |
| --- | --- |
| `id` | Identificador único da opção |
| `type` | `OptionType.Bool`, `OptionType.Int`, ou `OptionType.String` |
| `default_bool` / `default_int` / `default_string` | O valor padrão quando não definido |
| `translation_key` | Chave de localização para o título da opção |
| `translation_key_description` | Chave de localização para o tooltip |
| `action` | Delegate de callback (`ActionOptionAsset`) disparado quando a opção muda |
| `reset_to_default_on_launch` | Se esta opção volta ao padrão quando o jogo inicia |
| `computer_only` | Se `true`, mostrado apenas em builds de PC |

> [!WARNING] OptionAsset não é armazenamento
> `OptionAsset` só descreve os metadados e o callback da opção. O valor de verdade que o jogador alternou vive em `PlayerConfig.dict[id]`. Se você adicionar um `OptionAsset` sem também inserir um `PlayerOptionData` correspondente em `PlayerConfig.dict`, qualquer código que tentar indexar `PlayerConfig.dict[id]` lança `KeyNotFoundException` até a janela de configurações ser salva!

## Ligando a botões de alternância

Opções nativas brilham quando combinadas com botões de alternância de `GodPower` na barra de poderes.

Como explicado em **[Abas e botões de poder](#/nml/power-buttons)**, definir `power.toggle_name = HelloOptions.TURBO_HARVEST` liga um botão diretamente ao estado da sua opção. Ao clicar, o jogo alterna `PlayerConfig.dict[toggle_name].boolVal`, atualiza o destaque visual do botão, e dispara o callback da sua opção.

## Velocidade de simulação e escalas de tempo

O WorldBox controla a velocidade de simulação do jogo através de `AssetManager.time_scales` (`WorldTimeScaleLibrary`). Cada configuração de velocidade é um `WorldTimeScaleAsset`:

```csharp Mods/HelloBox/Code/HelloSpeed.cs
namespace HelloBox
{
    public static class HelloSpeed
    {
        public const string HYPER = "hello_hyper_speed";

        public static void Initialize()
        {
            if (AssetManager.time_scales.has(HYPER)) return;

            WorldTimeScaleAsset hyper = new WorldTimeScaleAsset
            {
                id = HYPER,
                locale_key = "speed_hello_hyper",
                multiplier = 10f,          // 10x velocidade de simulação do mundo
                ticks = 2,                 // Sub-ticks de simulação por frame
                conway_ticks = 2,          // Ticks de autômato celular por frame (fogo, ácido, temperatura)
                path_icon = "ui/Icons/iconClockX5"
            };

            AssetManager.time_scales.add(hyper);
        }
    }
}
```

| Campo | O que faz |
| --- | --- |
| `multiplier` | Multiplicador visual e de velocidade do mundo (`1f` = normal, `0.5f` = câmera lenta) |
| `ticks` | Quantas passagens de simulação rodam por frame |
| `conway_ticks` | Quantas passagens de autômato celular (espalhamento de tile, lava, gelo) rodam por frame |
| `locale_key` | Chave de tradução mostrada ao passar o mouse sobre o botão do relógio |
| `path_icon` | Caminho da textura do ícone dentro de `ui/Icons/` |

As velocidades vanilla são `slow_mo` (0.5x), `x1` (1x), `x2` (2x), `x3` (3x), `x4` (4x), e `x5` (5x). A velocidade sônica (velocidade Greg nas opções de depuração) empurra os ticks de simulação ainda mais alto.

Para ativar uma velocidade programaticamente:

```csharp
// Troca suavemente o relógio do mundo para o seu asset de velocidade:
WorldTimeScaleAsset target = AssetManager.time_scales.get(HelloSpeed.HYPER);
if (target != null)
{
    Config.time_scale_asset = target;
}
```

## Qual caminho de configurações escolher?

| Necessidade | Caminho recomendado |
| --- | --- |
| Configurações específicas do mod (multiplicadores de dano, quantidades de spawn, recursos que ligam/desligam) | **[Configurações do mod](#/nml/mod-config)** (`default_config.json`). Fica no card do seu mod, lida bem com números/strings, e não polui a UI do jogo base |
| Interruptores ligados a botões da barra de ferramentas | `OptionAsset` nativo + `GodPower.toggle_name` |
| Velocidades de jogo personalizadas ou ritmo de simulação | `AssetManager.time_scales` (`WorldTimeScaleAsset`) |

Próximo: **[Mensagens e registro do mundo](#/nml/messages-and-world-log)** para exibir dicas e registrar a história do mundo.
