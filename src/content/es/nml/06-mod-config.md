---
title: Configuración del mod
group: NML Modding
subgroup: Avanzado y publicación
icon: :wbsettingsgear:
order: 40
---

# Configuración del mod :wbsettingsgear:

Tarde o temprano alguien te dirá que tu mod está demasiado fuerte, es muy lento o hace demasiado ruido. En lugar de discutir en Discord :PESgn_WhySoToxic:, dales una ventana de ajustes y deja que lo resuelvan ellos mismos.

NML dibuja toda la ventana por ti. Tú solo escribes un archivo JSON.

## default_config.json

Coloca un archivo `default_config.json` en la raíz de tu mod, junto a `mod.json`:

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

`"hellobox"` es el **id de grupo**: una pestaña de ajustes. Todo lo que esté adentro representa una fila en la ventana.

| Clave | Significado |
| --- | --- |
| `Id` | Único dentro del grupo. Así es como lees el valor en código |
| `Type` | `SWITCH` (on/off), `SLIDER` (decimal), `INT_SLIDER` (entero), `TEXT` (campo de texto), `SELECT` (cuadrícula de opciones) |
| `BoolVal` / `FloatVal` / `IntVal` / `TextVal` | El valor por defecto correspondiente al tipo |
| `MinFloatVal` / `MaxFloatVal`, `MinIntVal` / `MaxIntVal` | Límites del control deslizante. Para `SELECT`, `MaxIntVal` es el número de opciones e `IntVal` el índice elegido |
| `IconPath` | Icono opcional para la fila |
| `Callback` | Opcional: `Namespace.Type:MethodName` ejecutado al cambiar el valor |

Para `SELECT`, NML crea un botón por cada opción. Las etiquetas salen directamente de tu localización como `<id>_0`, `<id>_1`, etc.

## Leer los valores

Con `BasicMod<T>` tienes `GetConfig()` gratis, indexado por grupo y luego por id:

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

NML llama a `persistent_config.MergeWith(default_config)` al arrancar, así que cuando añades una clave nueva a `default_config.json`, NML la mezcla automáticamente en la configuración guardada del jugador con su valor por defecto. El `try/catch` sigue siendo buena higiene por si alguien abrió su `.config` con un editor de texto y rompió el JSON, pero en las actualizaciones normales NML te cubre las espaldas.

## Callbacks

Un `Callback` es `Namespace.Type:MethodName`, y el método recibe el nuevo valor:

```csharp Mods/HelloBox/Code/HelloSettings.cs
namespace HelloBox
{
    public static class HelloSettings
    {
        public static float StrikeRadius = 0.25f;
        public static bool TintByMood = true;

        // llamado por NML cuando el jugador mueve el deslizador
        public static void SetStrikeRadius(int pValue)
        {
            StrikeRadius = pValue / 100f;
        }
    }
}
```

> [!WARNING] Los cambios se aplican al cerrar la ventana
> No mientras arrastras el control. Si tu callback hace algo costoso, esto es una buena noticia. Si esperabas una vista previa en tiempo real, por esto es que "no funciona" :huh:. `BasicMod` además dispara cada callback una vez al arrancar, para que tu código recoja lo que el jugador haya guardado.

## Dónde se guarda

Tu `default_config.json` es únicamente la **plantilla**. Las elecciones reales del jugador se guardan en:

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox\mods_config\<YOUR_GUID>.config
```

Que además es lo primero que debes borrar cuando estés probando valores por defecto y te preguntes por qué tu nuevo valor nunca aparece :PESgn_OOF:.

## Don't forget the text (again)

Los ids de grupo y de item también son claves de locale, así que mételos en `Locales/en.json` o saldrán en crudo. Cada fila quiere además una segunda clave, **`"<id> Description"`**, con espacio y D mayúscula, para el tooltip:

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

> [!TIP] El log te dice cuáles se te han olvidado
> Una etiqueta que falta imprime `LocalizedTextManager: missing text: strike_radius Description`. Busca `missing text:` después de abrir la ventana de ajustes una vez y tienes la lista exacta de claves :wbsmirk:.


## Sin BasicMod

Si tu clase principal implementa `IMod` directamente, implementa `IConfigurable` en la misma clase y devuelve la instancia tú mismo:

```csharp
public ModConfig GetConfig()
{
    return _config;   // creado o cargado por ti
}
```

Ese único método es lo que hace que el botón de configuración aparezca junto a tu mod en la ventana de mods. Un solo método, y nadie vuelve a discutir contigo en Discord. En teoría.
