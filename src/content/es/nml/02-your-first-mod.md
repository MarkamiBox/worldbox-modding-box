---
title: Tu primer mod
group: NML Modding
subgroup: Flujo de trabajo básico
icon: :wbchosen:
order: 22
---

# Tu primer mod :wbchosen:

Todo en esta guía se construye sobre **un único mod**. Lo empezamos aquí, y cada página posterior le añadirá un archivo nuevo.

Al final, HelloBox tendrá unos cuarenta archivos y habrás escrito cada línea tú mismo: un rasgo de criatura y un rasgo cultural con su propia pestaña, un arma y un encantamiento para ella, un efecto de estado, drops, una nube, una casilla de terreno, una receta de comida, un proyectil, una ley mundial, un poder divino con su propio botón, una ventana, un panel de configuración, un edificio, una facción, una criatura, un desastre, su propia IA y un parche de Harmony para retorcer una regla que el juego daba por sentada.

Eso es mucho más de lo que cualquier mod real necesita, y esa es precisamente la idea. Te quedas con las dos o tres partes que realmente quieras y borras el resto :PES4_DeleteThis:.

El mod se llama **HelloBox**. Hagamos que exista.

> [!NOTE] ¿Nunca has escrito código antes?
> No pasa nada. Lee los puntos de "qué hace cada línea" debajo de cada bloque y copia el código exactamente como está. Programar consiste en un 90% en copiar algo que funciona y cambiar una cosa cada vez :PES2_Legit:.

> [!TIP] O empieza desde la plantilla
> Si prefieres no crear los archivos a mano, coge el esqueleto vacío y salta al paso 4. Leer los tres pasos siguientes sigue mereciendo la pena: explican qué hay dentro.
>
> <a class="dl" href="hellobox-template.zip" download>
>   <span class="dl-icon">📄</span>
>   <span class="dl-text">
>     <span class="dl-title">Descargar la plantilla vacía</span>
>     <span class="dl-sub"><code>mod.json</code>, <code>Code/Main.cs</code> y las carpetas que NML busca. Nada más.</span>
>   </span>
> </a>

## 1. Crea la carpeta

Ve a tu carpeta de WorldBox (la que contiene `worldbox.exe`), abre `Mods/` y crea una carpeta llamada `HelloBox`. Dentro de ella, crea una carpeta llamada `Code`.

```text Where it goes
worldbox/
└── Mods/
    └── HelloBox/          <- tu mod
        ├── mod.json       <- el documento de identidad (siguiente paso)
        └── Code/          <- aquí vivirán tus archivos .cs
```

## 2. El documento de identidad: mod.json

Crea un archivo llamado `mod.json` en `HelloBox/` y pega esto. Cambia `author` por tu nombre:

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My first WorldBox mod, built while following the guide.",
  "GUID": "com.yourName.hellobox"
}
```

- **`name`** es lo que verán los jugadores en la lista de mods.
- **`GUID`** es un identificador único. Usa `com.tunombre.hellobox` y no lo cambies nunca más.

Sin este archivo, NML actuará como si tu mod no existiera :pepeno:.

> [!WARNING] El Bloc de notas intentará llamarlo `mod.json.txt`
> En el diálogo de Guardar, cambia el **Tipo** a **Todos los archivos (*.*)** antes de escribir el nombre. Luego compruébalo en el Explorador: si no ves la parte `.json`, activa **Vista → Extensiones de nombre de archivo** para que Windows deje de ocultarlas. Un archivo llamado `mod.json.txt` es completamente invisible para NML, y esto le pasa a casi todo el mundo al principio :PESgn_Oops:.

## 3. El código: Main.cs

Crea el archivo `Code/Main.cs` y pega esto:

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");
        }
    }
}
```

### Qué hace cada línea

- **`using NeoModLoader.api;`**: "Quiero usar las herramientas de NML en este archivo". Sin esto, el ordenador no tiene idea de qué es `BasicMod`.
- **`namespace HelloBox`**: un apellido para tu código, para que tu clase `Main` nunca colisione con el `Main` de otra persona.
- **`public class Main : BasicMod<Main>`**: tu mod. La parte `: BasicMod<Main>` significa "soy un mod de NML, dame las utilidades gratuitas" (logs, ajustes, traducciones).
- **`protected override void OnModLoad()`**: la puerta a la que NML llama cuando arranca el juego. Todo lo que tu mod inicialice se coloca dentro de estas llaves `{ }`.
- **`LogInfo(...)`**: imprime una línea en el registro con el nombre de tu mod ya incluido. Así compruebas si algo de esto ha funcionado.

## 4. Ejecútalo

Inicia WorldBox y abre la ventana **Mods** en el menú principal. **HelloBox** debería aparecer en la lista, y ya encendido por defecto. Un mod que colocas en `Mods/` por ti mismo se activa la primera vez que NML lo detecta.

En esa misma ventana podrás **apagarlo** más adelante. Al hacer clic en el icono se conmuta, y la mayoría de los mods aplican el cambio tras reiniciar :PES4_AlrightThen:.

> [!TIP] ¿No aparece en la lista en absoluto?
> Entonces NML nunca llegó a verlo. Nueve de cada diez veces se trata de un `mod.json.txt` en vez de `mod.json`, o de que la carpeta está en un sitio que no es `worldbox\Mods/`.

## 5. Comprueba que se ejecutó

Tu línea debería estar ahora en el registro:

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
```

Para encontrar ese archivo, pega esto en la barra de direcciones del Explorador de Windows:

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox
```

Abre `Player.log` en el Bloc de notas y presiona **Ctrl+F** para buscar `HelloBox`.

Si ves esa línea, felicidades: ya eres un modder :PESgn_Congrats:. Si no la ves, ve a **[Logs y depuración](#/nml/logs-and-debugging)**, esa página existe exactamente para solucionar este momento.

## 6. Cómo encaja cada página posterior

A partir de aquí, cada página te proporcionará **un archivo nuevo** en `Code/` y **una línea nueva** en `OnModLoad`. La estructura es siempre la misma:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");

    HelloTraits.Initialize();   // añadido por la página de Rasgos personalizados
    HelloItems.Initialize();    // añadido por la página de Objetos personalizados
    // ...y así sucesivamente
}
```

Cada nuevo archivo tendrá siempre este aspecto:

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public static void Initialize()
        {
            // el código de esa página va aquí dentro
        }
    }
}
```

> [!TIP] Una sola cosa cada vez
> Añade un archivo, inicia el juego, revisa el log y solo entonces pasa al siguiente. Si añades cinco cosas a la vez y el juego falla, tienes cinco sospechosos. Si añades una, tienes solo uno :aPES_Detect:.
