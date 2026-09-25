---
title: Opciones del juego
group: Contenido del juego
subgroup: Poderes divinos e interfaz
icon: :wbsettingsgear:
order: 206
---

# Opciones del juego :wbsettingsgear:

En **[Ajustes del mod](#/nml/mod-config)** viste la propia ventana de configuración de NML (`default_config.json`), que da a tu mod una pestaña de ajustes limpia y separada.

WorldBox también tiene su propio sistema nativo de opciones: `AssetManager.options_library`, respaldado por `PlayerConfig`. Este es el sistema que alimenta la ventana de ajustes vanilla, los interruptores de desarrollador y los botones de poder divino de tipo interruptor. Junto a él está `AssetManager.time_scales`, que controla la velocidad a la que avanza el mundo.

## Registrar una opción nativa

Las opciones en `AssetManager.options_library` son instancias de `OptionAsset`:

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

            // Registrar el asset NO rellena PlayerConfig.dict automáticamente.
            // Asegúrate de que el valor existe para que tu código pueda leerlo de inmediato:
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

### Los campos de OptionAsset

| Campo | Qué hace |
| --- | --- |
| `id` | Identificador único de la opción |
| `type` | `OptionType.Bool`, `OptionType.Int`, o `OptionType.String` |
| `default_bool` / `default_int` / `default_string` | El valor por defecto cuando no está fijado |
| `translation_key` | Clave de localización para el título de la opción |
| `translation_key_description` | Clave de localización para el tooltip |
| `action` | Delegado de callback (`ActionOptionAsset`) que se dispara cuando cambia la opción |
| `reset_to_default_on_launch` | Si esta opción vuelve a su valor por defecto al iniciar el juego |
| `computer_only` | Si es true, solo se muestra en las builds de PC |

> [!WARNING] OptionAsset no es almacenamiento
> `OptionAsset` solo describe los metadatos y el callback de la opción. El valor real que el jugador cambió vive en `PlayerConfig.dict[id]`. Si añades un `OptionAsset` sin insertar también un `PlayerOptionData` correspondiente en `PlayerConfig.dict`, cualquier código que intente indexar `PlayerConfig.dict[id]` lanza una `KeyNotFoundException` ¡hasta que se guarde la ventana de ajustes!

## Vincularlo con botones interruptor

Las opciones nativas brillan cuando se combinan con botones interruptor de `GodPower` en la barra de poderes.

Como se explica en **[Pestañas y botones de poder](#/nml/power-buttons)**, fijar `power.toggle_name = HelloOptions.TURBO_HARVEST` vincula un botón directamente al estado de tu opción. Al pulsarlo, el juego alterna `PlayerConfig.dict[toggle_name].boolVal`, actualiza el resaltado visual del botón y dispara el callback de tu opción.

## Velocidad de simulación y escalas de tiempo

WorldBox controla la velocidad de simulación del juego a través de `AssetManager.time_scales` (`WorldTimeScaleLibrary`). Cada ajuste de velocidad es un `WorldTimeScaleAsset`:

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
                multiplier = 10f,          // 10x velocidad de simulación del mundo
                ticks = 2,                 // Sub-ticks de simulación por frame
                conway_ticks = 2,          // Ticks de autómata celular por frame (fuego, ácido, temperatura)
                path_icon = "ui/Icons/iconClockX5"
            };

            AssetManager.time_scales.add(hyper);
        }
    }
}
```

| Campo | Qué hace |
| --- | --- |
| `multiplier` | Multiplicador visual y de velocidad del mundo (`1f` = normal, `0.5f` = cámara lenta) |
| `ticks` | Cuántos pasos de simulación se ejecutan por frame |
| `conway_ticks` | Cuántos pasos de autómata celular (propagación de tiles, lava, hielo) se ejecutan por frame |
| `locale_key` | Clave de traducción mostrada al pasar el ratón sobre el botón del reloj |
| `path_icon` | Ruta de la textura del icono dentro de `ui/Icons/` |

Las velocidades vanilla son `slow_mo` (0.5x), `x1` (1x), `x2` (2x), `x3` (3x), `x4` (4x) y `x5` (5x). La velocidad sónica (velocidad Greg en las opciones de depuración) empuja los ticks de simulación aún más alto.

Para activar una velocidad mediante código:

```csharp
// Cambia suavemente el reloj del mundo a tu asset de velocidad:
WorldTimeScaleAsset target = AssetManager.time_scales.get(HelloSpeed.HYPER);
if (target != null)
{
    Config.time_scale_asset = target;
}
```

## ¿Qué ruta de ajustes deberías elegir?

| Necesidad | Ruta recomendada |
| --- | --- |
| Configuraciones específicas del mod (multiplicadores de daño, cantidades de aparición, funciones activables) | **[Ajustes del mod](#/nml/mod-config)** (`default_config.json`). Vive en la tarjeta de tu mod, maneja números/cadenas con limpieza, y no contamina la UI del juego base |
| Interruptores vinculados a botones de la barra | `OptionAsset` nativo + `GodPower.toggle_name` |
| Velocidades de juego o ritmo de simulación personalizados | `AssetManager.time_scales` (`WorldTimeScaleAsset`) |

Siguiente: **[Mensajes y registro del mundo](#/nml/messages-and-world-log)** para mostrar avisos y registrar la historia del mundo.
