---
title: Estructura de un mod
group: NML Modding
subgroup: Flujo de trabajo básico
icon: :wbsavebuttonbox:
order: 20
---

# Estructura de un mod :wbsavebuttonbox:

## Dónde viven los mods

Cada mod es **una sola carpeta** dentro de `Mods/`, en tu directorio de WorldBox:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\Mods\
```

Si esa carpeta `Mods` aún no existe, créala tú mismo: clic derecho → Nuevo → Carpeta, y nómbrala exactamente `Mods`. Dentro de ella crearás la carpeta de tu propio mod con el nombre que elijas.

## Cómo se organiza un mod

```text
MyCoolMod/
├── mod.json          <- El documento de identidad de tu mod (obligatorio)
├── icon.png          <- El icono de vista previa del mod
├── Code/             <- La carpeta donde metes todo tu código
├── Locales/          <- Archivos de texto y traducciones (en.json, etc.)
└── GameResources/    <- Texturas, iconos, pixel art y sonidos personalizados
```

Solo `mod.json` es obligatorio. Crea las demás carpetas cuando realmente las necesites. Un mod que solo contenga `mod.json` y `Code/` ya es un mod real y funcional. Las carpetas vacías no impresionan a nadie.

#### Qué hace cada carpeta

- **`mod.json`**: El carnet de identidad. Sin él, NML actuará como si tu mod ni siquiera existiera.
- **`icon.png`**: La imagen de vista previa que se muestra en el menú de mods dentro del juego.
- **`Code/`**: La carpeta donde pones todos tus archivos de código `.cs` (como `Main.cs`). En realidad NML compila cualquier `.cs` que encuentre en tu mod (saltándose `bin/`, `obj/` y compañía), pero ponerlos en `Code/` evita que tu proyecto se convierta en un vertedero. **NML los compila cada vez que arranca el juego**, así que nunca compilas una `.dll` tú mismo y nunca necesitas Visual Studio.
- **`Locales/`**: Donde residen tus archivos de traducción (como `en.json`). Sin esto, todos tus objetos y rasgos (trait) aparecerán en el juego como claves de texto sin formato.
- **`GameResources/`**: Todas tus texturas personalizadas, pixel art, iconos de rasgos, sprites de armas y sonidos. El nombre debe ser exactamente ese, ya que es el que busca NML. Consulta **[Sprites y recursos](#/nml/sprites-and-resources)**.

### El manifiesto

NeoModLoader necesita el archivo `mod.json` para identificar tu mod :pepeOK:. Se coloca en la raíz misma de la carpeta de tu mod.

```json mod.json
{
  "name": "My-First-Mod",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.my-first-mod",
  "RepoUrl": "https://github.com/yourName/my-first-mod",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### ¿Qué significan estos campos?

- **`name`**: El nombre visible de tu mod en la lista dentro del juego.
- **`author`**: Tu nombre de usuario o apodo. ¡Llévate el mérito por tu trabajo!
- **`version`**: El número de versión de tu mod (ej. `"0.1.0"`). Increméntalo cada vez que publiques una actualización.
- **`description`**: Un breve resumen de lo que hace tu mod. Aparece en la ventana de detalles del mod.
- **`iconPath`**: La ruta relativa a tu icono de vista previa (normalmente `"icon.png"` en la raíz del mod).
- **`GUID`**: Un id único para tu mod, por convención `com.tunombre.nombremod`. NML lo limpia internamente a mayúsculas con guiones bajos (`COM_YOURNAME_MY_FIRST_MOD`), y esa es su identidad real. Si lo omites, NML junta tu autor y tu nombre de todas formas. **Elígelo una vez y no lo cambies nunca**: el archivo de configuración del jugador lleva su nombre.
- **`RepoUrl`**: Enlace opcional a tu repositorio de GitHub, Discord o web. NML pone un botón directamente en la tarjeta de tu mod para que los jugadores puedan ir con un clic.
- **`Dependencies`**: GUIDs de otros mods que DEBEN estar instalados obligatoriamente para que el tuyo funcione. Si tu mod es independiente, déjalo como `[]`.
- **`OptionalDependencies`**: Mods a los que das soporte si existen, pero que no necesitas estrictamente. Cuando uno está activo, NML incluso le da a tu código una constante de compilación `#if OTHER_MOD_GUID` para envolver el código de integración.
- **`IncompatibleWith`**: Una lista de GUIDs de mods que rompen el tuyo si se activan juntos. NML lo comprueba e impide que los mods en conflicto se carguen a la vez.

También puedes poner `"ModType": "RESOURCE_PACK"` si tu mod no tiene código y solo quiere reemplazar texturas, o `"UsePublicizedAssembly": false` si te gusta sufrir contra campos privados por deporte :PES5_Hmmmm:.


## Un poco de cosas técnicas :elpepehacker:

Cada mod necesita un archivo C# que diga "hola, soy un mod". Esto es todo lo necesario:

```csharp Code/Main.cs
using NeoModLoader.api;

namespace MyCoolMod
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("Mod loaded successfully!");
        }
    }
}
```

No es una versión simplificada para la guía: es exactamente con lo que empieza la gran mayoría de mods publicados.

#### Desglosando el código

- **`using NeoModLoader.api;`**: Piensa en esto como abrir tu caja de herramientas antes de empezar una obra. En vez de escribir `NeoModLoader.api.BasicMod` cada vez, `using` le dice al ordenador: *"ten las herramientas de NML listas sobre la mesa"*.
- **`namespace MyCoolMod`**: Un apellido para tu código. El mod de otra persona también puede tener una clase `Main`, y el espacio de nombres evita colisiones entre ambos.
- **`public class Main`**: En C#, todo el código vive dentro de "clases". Una clase es simplemente una receta o plano con un nombre.
- **`: BasicMod<Main>`**: la insignia oficial de tu mod. Le dice a NML *"soy un mod legítimo"*, y a cambio NML te da gratis el registro, los ajustes, la carga por etapas y las traducciones. La parte `<Main>` solo repite el nombre de tu propia clase. Sí, se ve raro, y sí, siempre se escribe así.
- **`protected override void OnModLoad()`**: El gran momento. Cuando WorldBox arranca, NML llama a esta puerta una vez. Todo lo que tu mod registre (rasgos, objetos, poderes) va dentro de estas `{ }`.
- **`LogInfo(...)`**: Imprime una línea en el log con el nombre de tu mod ya incluido. Así descubres si algo de esto ha funcionado. Consulta **[Logs y depuración](#/nml/logs-and-debugging)**.

> [!TIP] El camino largo
> Verás mods antiguos escritos de esta otra forma. Sí, soy lo bastante viejo para recordar cuando esto era lo normal:
> ```csharp
> public class MyMod : MonoBehaviour, IMod
> {
>     private ModDeclare _declare;
>
>     public void OnLoad(ModDeclare pModDecl, GameObject pGameObject)
>     {
>         _declare = pModDecl;
>     }
>
>     public ModDeclare GetDeclaration() => _declare;
>     public GameObject GetGameObject() => gameObject;
>     public string GetUrl() => _declare.RepoUrl;
> }
> ```
> `IMod` es la interfaz básica, mientras que `BasicMod<T>` es una clase ya preparada que la implementa y añade utilidades prácticas. Ambas funcionan. Usa `BasicMod` a menos que tengas un motivo muy específico :PES5_Noted:.

## Siguiente paso

Ya has visto la estructura. Ahora vamos a construir un mod real: **[Tu primer mod](#/nml/your-first-mod)**.
