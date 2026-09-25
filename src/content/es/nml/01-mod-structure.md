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
HelloBox/
├── mod.json          <- El documento de identidad de tu mod (obligatorio)
├── icon.png          <- El icono de vista previa del mod
├── Code/             <- La carpeta donde metes todo tu código
├── Locales/          <- Archivos de texto y traducciones (en.json, etc.)
└── GameResources/    <- Texturas, iconos, pixel art y sonidos personalizados
```

Todo mod necesita `mod.json`. HelloBox también necesita su punto de entrada en C#. Crea las demás carpetas cuando realmente las necesites. Un mod que solo contenga `mod.json` y `Code/` ya es un mod real y funcional. Las carpetas vacías no impresionan a nadie.

#### Qué hace cada carpeta

- **`mod.json`**: El carnet de identidad. Sin él, NML actuará como si tu mod ni siquiera existiera.
- **`icon.png`**: La imagen de vista previa que se muestra en el menú de mods dentro del juego.
- **`Code/`**: La carpeta donde pones todos tus archivos de código `.cs` (como `Main.cs`). En realidad NML compila cualquier `.cs` que encuentre en cualquier parte de tu mod, subcarpetas incluidas (saltándose `bin/`, `obj/`, `Properties/`, `packages/` y cualquier carpeta cuyo nombre empiece por un punto). Así que un `.cs` suelto junto a `mod.json` también funciona, y algunos mods hacen eso, pero ponerlos en `Code/` evita que tu proyecto se convierta en un vertedero. **NML compila el código fuente cuando hace falta y puede reutilizar su caché compilada.** No necesitas un paso de compilación aparte para seguir esta guía.
- **`Locales/`**: Donde residen tus archivos de traducción (como `en.json`). Sin esto, todos tus objetos y rasgos (trait) aparecerán en el juego como claves de texto sin formato.
- **`GameResources/`**: Todas tus texturas personalizadas, pixel art, iconos de rasgos, sprites de armas y sonidos. El nombre debe ser exactamente ese, ya que es el que busca NML. Consulta **[Sprites y recursos](#/nml/sprites-and-resources)**.

> [!WARNING] Los nombres de carpeta distinguen mayúsculas, aunque no en tu PC
> A Windows le da igual si escribiste `Locales` o `locales`. A Linux no. NML busca `Locales` y `GameResources` escritos exactamente así, así que un mod que te funciona a ti puede quedarse sin texto y sin sprites para otra persona. Respeta las mayúsculas de arriba y el problema no existe.

#### Carpetas que verás en mods de otras personas

No necesitas ninguna de estas para empezar. Las verás al abrir el mod de otra persona, así que aquí tienes qué son.

| Carpeta | Qué hace |
| --- | --- |
| `Assemblies/` | Bibliotecas gestionadas de terceros para mods de código fuente. NML recoge los archivos `.dll` que están directamente dentro de esta carpeta como referencias del compilador e intenta cargarlos. No es un sitio para DLLs del juego o de NML |
| `GameResourcesReplace/` | NML la carga exactamente igual que `GameResources/`, justo después. NML archiva el nombre bajo compatibilidad con NCMS. En un mod nuevo, usa simplemente `GameResources/` |
| `EmbededResources/` | Sí, está mal escrito, y tiene que estarlo. Los archivos ahí dentro se empaquetan en el código compilado de un mod **al estilo NCMS**. El compilador fuente verificado solo lo lee en su rama de compatibilidad con NCMS. No es un empaquetado automático para el código `BasicMod` de HelloBox. `EmbeddedResources/` no es el nombre de carpeta que usa esa rama |

#### Distribuir una `.dll` en lugar de código fuente

En el loader verificado, un archivo terminado en `.dll` **directamente junto a `mod.json`** selecciona la ruta precompilada. NML se salta la compilación del código fuente y carga las DLL de la raíz. Pon ahí tu DLL de HelloBox ya compilada y deja `Code/` fuera de la versión publicada. Consulta **[Publicar tu mod](#/nml/publishing)** para las comprobaciones de compilación y empaquetado.

> [!WARNING] Una sola .dll suelta desactiva tu código
> Esta es también la razón por la que una biblioteca dejada junto a `mod.json` "rompe" un mod de código fuente: NML ve la `.dll`, se salta `Code/`, y ninguno de tus cambios llega a cargar. Las bibliotecas van en `Assemblies/`, nunca en la raíz del mod.


### El manifiesto

NeoModLoader necesita el archivo `mod.json` para identificar tu mod :pepeOK:. Se coloca en la raíz misma de la carpeta de tu mod.

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.hellobox",
  "RepoUrl": "https://github.com/yourName/hellobox",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### ¿Qué significan estos campos?

| Campo | Qué hace |
| --- | --- |
| `name` | Nombre visible, aquí `HelloBox` |
| `author` | Tu nombre |
| `version` | Versión de la publicación. Súbela cuando publiques |
| `description` | Descripción breve |
| `iconPath` | Ruta del icono, relativa a la carpeta del mod |
| `GUID` | Identidad estable. NML lo normaliza a un `UID`; en este ejemplo, `COM_YOURNAME_HELLOBOX`. Mantenlo sin cambios tras publicarlo |
| `RepoUrl` | Metadato de URL del repositorio o soporte. Comprueba cómo se muestra en la versión de NML contra la que publiques |
| `Dependencies` | IDs de mods obligatorios. El flujo de código fuente documentado requiere que compilen correctamente |
| `OptionalDependencies` | IDs de mods opcionales. NML puede proporcionar sus referencias y símbolos de compilador durante la compilación del código fuente |
| `IncompatibleWith` | Declaraciones de conflicto. No asumas que se aplican igual en todas las versiones del loader |
| `UsePublicizedAssembly` | Por defecto `true` en el loader verificado. Añade la referencia al ensamblado publicitado del juego de NML durante la compilación del código fuente |

> [!WARNING] Comprueba la gestión de conflictos antes de rellenar la lista
> La documentación incluida describe `IncompatibleWith` como algo sin terminar. El loader instalado tiene un paso de eliminación que quita un mod con una lista no vacía antes de buscar los IDs listados. Deja el ejemplo vacío. Prueba tu versión exacta del loader con el mod en conflicto presente y ausente antes de publicar una declaración.

#### ModType y targetGameBuild

El enum verificado contiene `NEOMOD`, `COMPILED_NEOMOD`, `BEPINEX` y `RESOURCE_PACK`. El valor por defecto es `NEOMOD`; la detección de una DLL en la raíz selecciona `COMPILED_NEOMOD`.

El nombre de un enum no es una receta que funcione. El método `LoadMod` verificado gestiona los dos tipos NeoMod y rechaza los demás valores en esa ruta. Deja `ModType` fuera del manifiesto de HelloBox. Esta guía no afirma que fijar `RESOURCE_PACK` por sí solo cree un pack de texturas funcional.

`targetGameBuild` tiene un mapeo JSON en el ensamblado, pero el constructor verificado basado en archivo no lo copia a la declaración activa. No lo uses como filtro de compatibilidad. Indica en tus notas de publicación qué build del juego y qué versión de NML probaste.

#### Las claves del manifiesto no son intercambiables

La declaración verificada mapea `GUID` a su `UID` en tiempo de ejecución. No tiene mapeos para `id`, `mainClass`, `modLoader`, `gameVersion` ni `homepage`, y su constructor basado en archivo no consume esas claves. No sustituyen a los campos de arriba.

NML encuentra un tipo de punto de entrada adecuado en el ensamblado. Una cadena `mainClass` no lo selecciona. Mantén el manifiesto pequeño en vez de importar el esquema de otro loader.

#### Símbolos de dependencia

Para los **IDs ASCII usados aquí**, NML pone en mayúsculas las letras y sustituye la puntuación por guiones bajos: `com.yourname.hellobox-extra` se convierte en `COM_YOURNAME_HELLOBOX_EXTRA`. No extiendas esa regla a todos los caracteres Unicode; el normalizador verificado conserva algunos de ellos.

Durante la compilación del código fuente, NML define el símbolo de una dependencia opcional cuando ese ID tiene una entrada en su mapa de referencias de compilador. La instalación por sí sola no es la prueba. También puede reintentar una compilación fallida sin las dependencias opcionales.

> [!WARNING] Un símbolo mal escrito elimina el código en silencio
> Un símbolo `#if` desconocido es falso. Comprueba el ID de la dependencia, la lista `OptionalDependencies` y el símbolo normalizado. Una compilación exitosa no demuestra que tu integración se haya incluido.

Consulta **[Trabajar junto a otros mods](#/nml/other-mods)** para un ejemplo completo y la comprobación aparte en tiempo de ejecución.

#### Cosas que rompen la carpeta de un mod

- **Distribuir DLLs del juego o del loader.** No incluyas `Assembly-CSharp.dll`, su copia publicitada, `NeoModLoader.dll`, DLLs de Unity u otras DLLs copiadas de la carpeta `Managed/` del juego. Referencia copias locales al compilar; mantenlas fuera del zip. El cargador de bibliotecas adicionales de NML tiene casos especiales y deduplicación, así que copiar una DLL no es una forma fiable de reemplazar la versión cargada.
- **Manifiestos anidados.** NML primero comprueba el propio `mod.json` de la carpeta del mod. Solo si no está, busca por debajo de esa carpeta. Con varias coincidencias anidadas, el loader verificado avisa y usa el primer resultado. No dependas de ese orden. Publica un único manifiesto en `HelloBox/mod.json`.
- **Copias de seguridad del código fuente dentro del mod.** Una carpeta `dist/`, `backup/` u `old/` puede aportar clases C# duplicadas a la compilación del código fuente. Mantén el montaje de la publicación y las copias de seguridad fuera del mod instalado.
- **Rutas fijas en el código.** Dentro de tu clase `BasicMod`, usa `GetDeclaration().FolderPath` y `Path.Combine` para los archivos empaquetados. El directorio `StreamingAssets/mods` del juego es la ubicación nativa del loader, no la carpeta de HelloBox.
- **Rutas que escapan del paquete.** Usa rutas relativas de icono y recursos con las mayúsculas correctas. No distribuyas rutas absolutas ni segmentos `..`. `Path.Combine` une rutas; no comprueba que una entrada suministrada por el jugador se quede dentro de tu carpeta.

> [!NOTE] Qué se verificó
> El comportamiento de carpetas y compilador de aquí se rastreó a través del ensamblado de NML instalado, versión de archivo `1.2.0.1`, commit informativo `cd47a1a6c437718d38e8f29240bdb761d543e09a`, junto con la documentación de NML incluida. Esto no es una promesa sobre cada versión futura.


## Un poco de cosas técnicas :elpepehacker:

Cada mod necesita un archivo C# que diga "hola, soy un mod". Esto es todo lo necesario:

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
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
- **`namespace HelloBox`**: Un apellido para tu código. El mod de otra persona también puede tener una clase `Main`, y el espacio de nombres evita colisiones entre ambos.
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
