---
title: Localización
group: NML Modding
subgroup: Flujo de trabajo básico
icon: :wbscroll:
order: 26
---

# Localización :wbscroll:

Cada elemento que añades al juego (rasgos, objetos, poderes, pestañas, tareas) aparece como una clave sin formato como `trait_hello_swift` hasta que le asignas un texto. Es el capítulo más aburrido del modding, y saltárselo es la razón número uno por la que un mod parece a medio hacer. (Coff.. mis mods.. Coff Coff :pensiveanimated: )

## El camino fácil: la carpeta Locales

Si tu clase principal hereda de `BasicMod<T>`, crea una carpeta llamada `Locales/` en tu mod y pon dentro un archivo JSON con el nombre del idioma. NML lo carga **antes** de `OnModLoad`, sin que tengas que escribir ni una sola línea de código.

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money.",
  "hello_sword_ember": "Ember Blade",
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess."
}
```

El nombre del archivo **es** el idioma: `en.json`, `cz.json` (chino simplificado), `ru.json`, `es.json`, etcétera.

Si por el contrario implementas `IMod` a mano, añade la interfaz `ILocalizable` y apunta a la carpeta:

```csharp Code/Main.cs
public string GetLocaleFilesDirectory(ModDeclare pModDeclare)
{
    return System.IO.Path.Combine(pModDeclare.FolderPath, "Locales");
}
```

## Un solo archivo para todos los idiomas: CSV


Si tu programa de hojas de cálculo exporta con punto y coma o tabulaciones en vez de comas, implementa `ICsvSepCustomized` en tu clase principal y devuelve `';'` en `GetCsvSeparator()` para que NML no haga sopa con tus textos :PES2_Shrug:.
Un archivo `.csv` en la misma carpeta cubre todos los idiomas a la vez, lo cual resulta mucho más cómodo de mantener que quince archivos JSON individuales. En este caso el nombre del archivo no importa:

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## Hacerlo desde código

`NeoModLoader.General.LM` es el ayudante de localización. Útil cuando tu texto se genera, o cuando simplemente quieres tenerlo todo en un solo archivo `.cs` en vez de un montón de JSON.

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // read in the current language
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // add to whatever language is loaded now
LM.Add("en", "trait_hello_swift", "Swift");          // add to a specific language
LM.LoadLocale("en", "path/to/Locales/en.json");       // load a json manually (language + path)
LM.LoadLocales("path/to/Locales/lang.csv");          // load a csv manually
LM.ApplyLocale(false);                               // apply. false = don't refresh every text on screen
```

En HelloBox, ese archivo queda así:

```csharp Mods/HelloBox/Code/HelloLocale.cs
using System.Collections.Generic;
using NeoModLoader.General;

namespace HelloBox
{
    public static class HelloLocale
    {
        public static void Initialize()
        {
            Dictionary<string, string> texts = new Dictionary<string, string>
            {
                { "trait_hello_swift", "Swift" },
                { "trait_hello_swift_info", "Moves like the world owes it money." },
                { "hello_strike", "Hello Strike" },
                { "hello_strike_description", "Shakes the ground and makes a mess." }
            };

            foreach (KeyValuePair<string, string> pair in texts)
            {
                LM.AddToCurrentLocale(pair.Key, pair.Value);
                LM.Add("en", pair.Key, pair.Value);
            }

            LM.ApplyLocale(false);
        }
    }
}
```

Añade `HelloLocale.Initialize();` en `Main.cs` **lo primero**, antes que todo lo demás, para que nunca se registre nada mientras su texto aún falta.

Registra **todo de una vez, al cargar**, y llama a `ApplyLocale` una sola vez al final. Pedirle al juego una clave que no tiene te devuelve la propia clave como texto, más un error `missing text` en el log por cada clave, así que un tooltip hecho de claves que faltan no solo es feo, también te llena el log de ruido :PES_UghPing:.

## Los nombres de clave que realmente necesitas

El juego construye estas claves él mismo, así que tienen que coincidir exactamente o no aparece nada. Dos de ellas **no** siguen la regla de "igual que el id", y son justo en las que la gente pierde una hora:

| Qué | Clave del nombre | Clave de la descripción |
| --- | --- | --- |
| Rasgo | `trait_<id>` | `trait_<id>_info` |
| Objeto | `translation_key` si pones uno, si no `item_<equipment_subtype or id>` | `<id>_description` (sin el prefijo `item_`) |
| Poder divino | `<power_id>` | `<power_id>_description` |
| Pestaña de poderes | el `locale_key` que pasaste | la clave de descripción que pasaste |
| Tarea de actor | `task_unit_<task_id>` | - |
| Efecto de estado | el **campo** `locale_id` que pongas | el **campo** `locale_description` que pongas |
| Ley mundial | `<law_id>_title` (ojo al sufijo) | `<law_id>_description` |

> [!WARNING] Los ids no son nombres
> Tu id es `hello_swift` para siempre, en todos los idiomas, y es a lo que hace referencia el resto de tu código (y los mods de otros). El **texto de localización** es la parte que cambia. Nunca renombres un id solo para corregir una errata en el nombre visible :PESgn_Stop:.
