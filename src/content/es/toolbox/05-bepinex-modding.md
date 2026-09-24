---
title: Modding con BepInEx
group: Resumen
subgroup: Herramientas externas y configuración
icon: :csharp:
order: 9
---

# Modding con BepInEx :csharp:

La mayor parte de esta guía te enseña a crear mods para **NeoModLoader**. NML te permite escribir archivos `.cs` limpios en el Bloc de notas, iniciar el juego y ver cómo tu código se compila automáticamente.

A BepInEx no le importan tus sentimientos :PES2_Shrug:. Es el marco de modding universal y veterano de Unity. Crear un mod de BepInEx implica configurar un proyecto C# real, compilar tu propia `.dll` y soltarla en `BepInEx/plugins/`. Pierdes la recarga en caliente instantánea y las facilidades para assets, pero obtienes control total sobre el proceso de Unity antes de que el juego sepa que está despierto.

## BepInEx frente a NeoModLoader

Antes de pasar una tarde entera configurando un entorno de compilación, elige la herramienta adecuada para el trabajo:

| Quieres... | Elige | Por qué |
| --- | --- | --- |
| Añadir rasgos, objetos, poderes divinos, criaturas o biomas | **NML** | NML incluye `AssetManager`, textos autolocalizados, sprites y guardado de datos gratis |
| Crear herramientas de desarrollo, superposiciones o hooks del motor | **BepInEx** | BepInEx se ejecuta a nivel de Mono antes de que WorldBox se inicialice |
| Editar código solo con el Bloc de notas y guardar | **NML** | NML compila los archivos C# en tiempo de ejecución |
| Distribuir un plugin binario precompilado con componentes de Unity puros | **BepInEx** | Tú controlas el compilador, las dependencias y la plataforma de destino |

Si quieres añadir contenido al juego, haz un mod de NML. Si estás construyendo una herramienta como UnityExplorer o disfrutas viendo la salida de MSBuild en la terminal, BepInEx es tu lugar.

## 1. Requisitos previos

1. Instala **BepInEx 5 (Mono x64)** y activa la consola como se explica en **[La consola en vivo (BepInEx)](#/toolbox/bepinex-console)**.
2. Instala el **[.NET SDK](https://dotnet.microsoft.com/)** (o Visual Studio con desarrollo para el escritorio .NET). Necesitas un compilador C# real para los plugins de BepInEx.

## 2. Configurar el proyecto

Abre una terminal en la carpeta donde guardas tus proyectos y genera una nueva biblioteca de clases:

```bash
dotnet new classlib -n HelloBepInEx -f net472
cd HelloBepInEx
```

Abre `HelloBepInEx.csproj` en tu editor y añade las referencias a los ensamblados del juego y de BepInEx:

```xml HelloBepInEx.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>HelloBepInEx</AssemblyName>
    <Version>1.0.0</Version>
    <LangVersion>latest</LangVersion>
  </PropertyGroup>

  <ItemGroup>
    <!-- Game assemblies from worldbox_Data/Managed -->
    <Reference Include="Assembly-CSharp">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\Assembly-CSharp.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="UnityEngine">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\UnityEngine.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="UnityEngine.CoreModule">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\UnityEngine.CoreModule.dll</HintPath>
      <Private>false</Private>
    </Reference>

    <!-- BepInEx and Harmony from BepInEx/core -->
    <Reference Include="BepInEx">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\core\BepInEx.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="0Harmony">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\core\0Harmony.dll</HintPath>
      <Private>false</Private>
    </Reference>
  </ItemGroup>
</Project>
```

Ajusta las rutas si tu biblioteca de Steam está en otra unidad. Poner `<Private>false</Private>` evita que la carpeta entera de dependencias de Unity se copie en tu carpeta de publicación :PESgn_SMH:.

## 3. El esqueleto del plugin

Un plugin de BepInEx es una clase que hereda de `BaseUnityPlugin` decorada con el atributo `[BepInPlugin]`:

```csharp Plugin.cs
using BepInEx;
using BepInEx.Configuration;
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [BepInPlugin(PLUGIN_GUID, PLUGIN_NAME, PLUGIN_VERSION)]
    public class HelloPlugin : BaseUnityPlugin
    {
        public const string PLUGIN_GUID = "com.markami.hellobepinex";
        public const string PLUGIN_NAME = "HelloBepInEx";
        public const string PLUGIN_VERSION = "1.0.0";

        private ConfigEntry<bool> configEnableLogs;
        private ConfigEntry<KeyCode> configHotkey;

        private void Awake()
        {
            configEnableLogs = Config.Bind(
                "General",
                "EnableLogs",
                true,
                "Print debug messages to the BepInEx console."
            );

            configHotkey = Config.Bind(
                "Controls",
                "ToggleKey",
                KeyCode.F7,
                "Key to press to trigger the plugin action."
            );

            if (configEnableLogs.Value)
            {
                Logger.LogInfo($"{PLUGIN_NAME} loaded successfully!");
            }

            Harmony harmony = new Harmony(PLUGIN_GUID);
            harmony.PatchAll();
        }

        private void Update()
        {
            if (Input.GetKeyDown(configHotkey.Value))
            {
                Logger.LogInfo("Hotkey pressed from BepInEx!");
            }
        }
    }
}
```

### Desglosando las partes clave

- **`BaseUnityPlugin`**: hereda directamente de `MonoBehaviour` de Unity. Tu plugin es un componente vivo anclado a un `GameObject` persistente que no se destruye entre escenas.
- **`[BepInPlugin(guid, name, version)]`**: le dice a BepInEx cómo se llama tu mod y su identificador único. Usa nomenclatura de dominio inverso (`com.autor.nombremod`).
- **`Logger.LogInfo()`**: envía mensajes directamente a la consola en vivo de BepInEx y al archivo `BepInEx/LogOutput.log`.
- **`Config.Bind()`**: crea una opción de configuración tipada. La primera vez que se ejecuta el plugin, BepInEx genera un archivo `BepInEx/config/com.markami.hellobepinex.cfg` limpio que los jugadores pueden editar.

## 4. Enganchar el juego con Harmony

En BepInEx, Harmony ya viene incluido directamente en `BepInEx/core/0Harmony.dll`. Añade una clase de parche en cualquier parte de tu proyecto:

```csharp Patches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [HarmonyPatch(typeof(World), nameof(World.init))]
    public static class WorldInitPatch
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            Debug.Log("[HelloBepInEx] World initialized from BepInEx patch!");
        }
    }
}
```

Como `Plugin.cs` llamó a `harmony.PatchAll()`, BepInEx escanea tu ensamblado compilado y aplica automáticamente todos los parches al iniciar.

## 5. Compilar e instalar

Compila tu proyecto desde la terminal:

```bash
dotnet build -c Release
```

Tu archivo `.dll` compilado se genera en `bin/Release/net472/HelloBepInEx.dll`.

1. Ve a tu carpeta de WorldBox: `C:\Program Files (x86)\Steam\steamapps\common\worldbox\`.
2. Dentro de `BepInEx/plugins/`, crea una carpeta llamada `HelloBepInEx`.
3. Copia `HelloBepInEx.dll` dentro de `BepInEx/plugins/HelloBepInEx/`.

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

Inicia el juego con la consola activada. Verás cómo BepInEx detecta y carga tu plugin:

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

## Verdades incómodas sobre el modding con BepInEx

- **Sin recarga en caliente**: cambiar una línea de código significa cerrar WorldBox, ejecutar `dotnet build` y volver a abrir el juego. Si estás ajustando estadísticas de combate, esto cansa rápido.
- **`HideManagerGameObject`**: en `BepInEx/config/BepInEx.cfg`, asegúrate de tener `HideManagerGameObject = true`. De lo contrario, los procesos de limpieza de Unity pueden destruir el objeto raíz de BepInEx y apagar tu mod en silencio :PES5_Hmmmm:.
- **Convivencia con NML**: NML y BepInEx conviven perfectamente en la misma carpeta del juego. Puedes usar NML para tus mods de contenido y BepInEx para herramientas de desarrollo como UnityExplorer sin que interfieran entre sí.
- **Acceso a los assets del juego**: BepInEx se ejecuta en la capa pura de Unity. Si quieres invocar criaturas, registrar objetos o crear rasgos desde BepInEx, debes esperar a que WorldBox termine de inicializar su `AssetManager` o hacer referencia a `NeoModLoader.dll` y dejar que NML haga el trabajo duro.
