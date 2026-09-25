---
title: Añadir contenido con BepInEx
group: BepInEx Modding
icon: :wbhammer:
order: 2
---

# Añadir contenido con BepInEx :wbhammer:

Un plugin de BepInEx puede añadir rasgos (trait), objetos (item) y poderes (GodPower) como cualquier mod de NML. Solo tiene que hacer a mano los tres trabajos que NML hace por ti sin decir nada: esperar al juego, cargar el texto y cargar el arte. Esta página hace los tres para el mismo rasgo **Swift** que construye la página **[Rasgos personalizados](#/nml/custom-traits)**, para que puedas compararlos línea por línea.

Si todavía no tienes un proyecto, empieza en **[Modding con BepInEx](#/toolbox/bepinex-modding)**.

## El momento justo

El `Awake()` de tu plugin se ejecuta muy pronto, antes de que WorldBox haya construido una sola librería (library) de assets. Ahí `AssetManager.traits` todavía es null, y tocarlo es una `NullReferenceException` antes incluso de que aparezca el menú principal.

El momento que quieres es el final de `AssetManager.init()`. Ese único método público construye todas las librerías y luego ejecuta `post_init()` y `linkAssets()` de cada una. Un Postfix de Harmony sobre él se ejecuta justo después, que es exactamente donde vive también el `OnModLoad` de un mod de NML. Todo lo que dicen las páginas de NML sobre "el juego hizo esto al arrancar, antes de que existiera tu mod, así que hazlo tú" se aplica aquí palabra por palabra.

## El código

```csharp Plugin.cs
using System.IO;
using BepInEx;
using HarmonyLib;

namespace HelloBepInEx
{
    [BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
    [BepInProcess("worldbox.exe")]
    public class HelloPlugin : BaseUnityPlugin
    {
        public static HelloPlugin Instance;

        /** The folder your .dll sits in, for loading your own files. */
        public static string Folder => Path.GetDirectoryName(Instance.Info.Location);

        private void Awake()
        {
            Instance = this;
            new Harmony("com.example.hellobepinex").PatchAll();

            // Installed while the game was already running? The libraries exist, go now.
            if (InitLibraries.initiated) HelloContent.Register();
        }
    }

    [HarmonyPatch(typeof(AssetManager), nameof(AssetManager.init))]
    public static class AssetsReadyPatch
    {
        [HarmonyPostfix]
        public static void Postfix() => HelloContent.Register();
    }

    [HarmonyPatch(typeof(LocalizedTextManager), nameof(LocalizedTextManager.setLanguage))]
    public static class LanguagePatch
    {
        // setLanguage throws the whole text table away and reloads it from the game files,
        // so our lines have to go back in after every language change.
        [HarmonyPostfix]
        public static void Postfix() => HelloContent.AddText();
    }
}
```

```csharp HelloContent.cs
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace HelloBepInEx
{
    public static class HelloContent
    {
        public const string SWIFT = "hello_swift";
        private const string ICON = "ui/Icons/iconHelloSwift";
        private static bool done;

        /** Text per language. English is the fallback for everything else. */
        private static readonly Dictionary<string, Dictionary<string, string>> Text =
            new Dictionary<string, Dictionary<string, string>>
            {
                ["en"] = new Dictionary<string, string>
                {
                    ["trait_hello_swift"] = "Swift",
                    ["trait_hello_swift_info"] = "Moves like the world owes it money."
                },
                ["it"] = new Dictionary<string, string>
                {
                    ["trait_hello_swift"] = "Rapido",
                    ["trait_hello_swift_info"] = "Si muove come se il mondo gli dovesse dei soldi."
                }
            };

        public static void Register()
        {
            if (done) return;
            done = true;

            // 1. The art, before anything asks for it. See "Your own art" below.
            string png = Path.Combine(HelloPlugin.Folder, "iconHelloSwift.png");
            if (File.Exists(png)) SpriteTextureLoader.addSprite(ICON, File.ReadAllBytes(png));

            // 2. The trait: exactly the Custom traits page, nothing BepInEx-specific.
            if (!AssetManager.traits.has(SWIFT))
            {
                ActorTrait swift = new ActorTrait
                {
                    id = SWIFT,
                    needs_to_be_explored = false,
                    path_icon = ICON,
                    group_id = "physique",
                    rate_birth = 0,
                    can_be_given = true,
                    can_be_removed = true
                };
                AssetManager.traits.add(swift);
                swift.base_stats["speed"] = 20f;
            }

            // 3. The text for the language that is already loaded.
            AddText();
        }

        public static void AddText()
        {
            if (LocalizedTextManager.instance == null) return;

            string lang = LocalizedTextManager.instance.language;
            if (!Text.TryGetValue(lang, out Dictionary<string, string> lines)) lines = Text["en"];

            foreach (KeyValuePair<string, string> line in lines)
            {
                // pReplace: true, or a second call logs "Already exists" for every line
                LocalizedTextManager.add(line.Key, line.Value, pReplace: true);
            }
        }
    }
}
```

Compila, arranca el juego, abre una unidad, y Swift está en la pestaña `physique` con su nombre, descripción e icono.

> [!NOTE] `LocalizedTextManager.instance.language` es internal
> Compila porque el proyecto de **[Modding con BepInEx](#/toolbox/bepinex-modding)** "publiciza" el juego. Sin el publicizer tendrías que recordar el idioma tú mismo.

## Los tres trabajos, uno a uno

### Esperar al juego

| NML | BepInEx |
| --- | --- |
| `OnModLoad()` se ejecuta cuando las librerías están listas | Un Postfix sobre `AssetManager.init()` |
| NML se asegura de que se ejecute una vez | Te toca a ti: la variable `done` evita una segunda ejecución si `Awake()` ya lo llamó |

Si registras algo en el momento equivocado, el registro te lo dice: una `NullReferenceException` que apunta a `AssetManager.<algo>` significa demasiado pronto.

### Texto

NML lee tu carpeta `Locales/` y la vuelve a aplicar en cada cambio de idioma. En BepInEx haces las dos cosas tú, y el parche sobre `setLanguage` es la parte que todos olvidan: en inglés todo funciona, el jugador cambia a italiano y tu rasgo de repente se llama `trait_hello_swift` :wbfacepalm:.

Los nombres de las claves son los mismos que en el resto de la guía, así que la tabla de **[Localización](#/nml/localization)** sigue valiendo. `LocalizedTextManager.add` pasa la clave a snake_case por ti, como los archivos del propio juego.

### Tu propio arte

En BepInEx no hay carpeta `GameResources/`. Lo que hay es `SpriteTextureLoader.addSprite(path, bytes)`: lee un PNG de cualquier sitio y lo registra con la ruta que quieras, con el pivote en el centro y filtrado para pixel art. Después, `path_icon = "ui/Icons/iconHelloSwift"` lo encuentra como un sprite vanilla.

Dos reglas:

- **Regístralo antes de que nada pida esa ruta.** El juego recuerda cada ruta que ha buscado, incluso las que fallaron, y `addSprite` rechaza una ruta que ya recuerda. Hacerlo al principio de `Register()` es seguro.
- **Es una imagen, no una carpeta de fotogramas.** Los iconos, los iconos de objetos y los botones de poderes son imágenes sueltas, así que funcionan. Todo lo que la guía marca como **carpeta** (animaciones de drops, efectos de estado, proyectiles, casillas, sprites de edificios) se carga con `getSpriteList()`, que `addSprite` no rellena. Para eso, toma prestada una ruta vanilla o haz esa parte de tu mod con NML.

Pon el PNG junto a tu `.dll`:

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

Para que la compilación también lo copie, añade una línea al objetivo `CopyToGame` de tu `.csproj`:

```xml HelloBepInEx.csproj
<Copy SourceFiles="iconHelloSwift.png" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
```

## Lo que no se trae de NML

Algunas páginas se apoyan en ayudas de NML que no existen en BepInEx. Esto es lo que haces en su lugar:

| La página de NML usa | En BepInEx |
| --- | --- |
| Carpeta `Locales/` | El patrón `AddText()` de arriba |
| `GameResources/` | `SpriteTextureLoader.addSprite` para imágenes sueltas, rutas vanilla para carpetas |
| `TabManager`, `PowerButtonCreator` (botones de poderes) | No hay equivalente. Construye la interfaz tú con Unity, o haz los botones como parte de un mod de NML |
| Ventana de ajustes `ModConfig` | El `Config.Bind()` de BepInEx, editado en el archivo `.cfg` |
| Datos guardados propios | Los `data.set` / `data.get` del propio juego en las unidades funcionan igual, mira **[Guardar datos](#/nml/saving-data)** |
| Botón de recarga | Ninguno. Cierra, compila, arranca |

Todo lo que es código normal del juego, que es la mayor parte de cada página, funciona sin cambios: assets, estadísticas, estados, parches de Harmony, IA, leyes del mundo.

Cuando algo se rompa, **[Depuración y publicación](#/toolbox/bepinex-publishing)** tiene los errores que más probablemente te encuentres.
