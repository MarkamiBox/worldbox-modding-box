---
title: Modding con BepInEx
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# Modding con BepInEx :PES5_BigBrain:

La mayor parte de esta guía te enseña a escribir mods para **NeoModLoader**. Con NML escribes archivos `.cs` normales en el Bloc de notas, arrancas el juego y ves cómo tu código se compila solo.

A BepInEx le dan igual tus sentimientos :PES2_Shrug:. Es el framework veterano y universal para modear juegos de Unity. Hacer un mod de BepInEx significa montar un proyecto de C# de verdad, compilar tu propia `.dll` y dejarla en `BepInEx/plugins/`. Pierdes la recarga instantánea y las ayudas cómodas para assets, pero ganas control total sobre el proceso de Unity antes de que el juego sepa siquiera que se ha despertado.

Esta parte de la guía tiene tres páginas: esta pone un plugin en marcha, **[Añadir contenido con BepInEx](#/toolbox/bepinex-content)** hace que añada cosas reales al juego, y **[Depuración y publicación](#/toolbox/bepinex-publishing)** lo lleva a otras personas.

## BepInEx o NeoModLoader

Antes de pasarte una tarde montando un sistema de compilación, elige la herramienta correcta:

| Quieres... | Elige | Por qué |
| --- | --- | --- |
| Añadir rasgos (trait), objetos (item), poderes divinos (GodPower), criaturas o biomas | **NML** | NML te da `AssetManager` en el momento justo, una carpeta `Locales`, `GameResources/`, botones y ayudas para guardar datos gratis |
| Crear herramientas de desarrollo, overlays o ganchos al motor | **BepInEx** | BepInEx arranca a nivel de Mono antes de que WorldBox se inicialice |
| Editar código solo con el Bloc de notas y guardar | **NML** | NML compila archivos fuente de C# en tiempo de ejecución |
| Distribuir un plugin ya compilado con componentes de Unity puros | **BepInEx** | Tú controlas las opciones del compilador, las dependencias y el objetivo de compilación |

Si vas a añadir contenido al juego, haz un mod de NML. Si vas a crear una herramienta como UnityExplorer, o de verdad disfrutas viendo la salida de MSBuild en tu terminal, tu sitio es BepInEx. *Puedes* añadir contenido con BepInEx, la página siguiente enseña cómo, pero reconstruyes a mano lo que NML te regala.

## 1. Requisitos previos

1. Instala **BepInEx 5 (Mono x64)** y activa la consola como se explica en **[La consola en vivo (BepInEx)](#/toolbox/bepinex-console)**. Arranca el juego una vez para que BepInEx cree sus carpetas.
2. Instala el **[.NET SDK](https://dotnet.microsoft.com/)** (o Visual Studio con desarrollo de escritorio .NET). Para los plugins de BepInEx necesitas un compilador de C# de verdad.

## 2. Preparar el proyecto

Abre una terminal en la carpeta donde guardas tus proyectos y crea una nueva biblioteca de clases:

```bash
dotnet new classlib -n HelloBepInEx
cd HelloBepInEx
```

Luego sustituye todo el contenido de `HelloBepInEx.csproj` por esto. Apunta a la misma versión de .NET que el juego, indica tu carpeta de WorldBox una sola vez y hace tres trabajos por ti en cada compilación:

```xml HelloBepInEx.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>HelloBepInEx</AssemblyName>
    <Version>1.0.0</Version>
    <LangVersion>latest</LangVersion>
    <!-- Your WorldBox folder. Change this one line if Steam lives on another drive. -->
    <GameDir>C:\Program Files (x86)\Steam\steamapps\common\worldbox</GameDir>
  </PropertyGroup>

  <ItemGroup>
    <!-- Lets you build for net472 without installing the old .NET Framework developer pack -->
    <PackageReference Include="Microsoft.NETFramework.ReferenceAssemblies" Version="1.0.3" PrivateAssets="all" />
    <!-- Makes internal and private game code visible to your compiler, like NML does -->
    <PackageReference Include="BepInEx.AssemblyPublicizer.MSBuild" Version="0.4.3" PrivateAssets="all" />
  </ItemGroup>

  <ItemGroup>
    <!-- The game, publicized -->
    <Reference Include="$(GameDir)\worldbox_Data\Managed\Assembly-CSharp.dll" Publicize="true" Private="false" />
    <!-- Every Unity module: UnityEngine.dll alone does not have Input, UI or ImageConversion -->
    <Reference Include="$(GameDir)\worldbox_Data\Managed\UnityEngine*.dll" Private="false" />
    <!-- BepInEx and Harmony -->
    <Reference Include="$(GameDir)\BepInEx\core\BepInEx.dll" Private="false" />
    <Reference Include="$(GameDir)\BepInEx\core\0Harmony.dll" Private="false" />
  </ItemGroup>

  <!-- After every build, copy the plugin straight into the game -->
  <Target Name="CopyToGame" AfterTargets="Build">
    <Copy SourceFiles="$(TargetPath)" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
  </Target>
</Project>
```

Para qué sirve cada parte:

- **`Private="false"`** en cada referencia al juego: tu carpeta de compilación no copia el motor entero del juego :PESgn_SMH:.
- **`Publicize="true"`**: las páginas de NML de la guía usan miembros `internal` del juego todo el rato, porque NML compila contra un juego "publicizado". Tu proyecto de BepInEx no lo hace a menos que lo pidas. Con esto, el mismo código compila también aquí. Los números de versión de `PackageReference` eran los estables más nuevos cuando escribí esto; si NuGet se queja, usa el más nuevo que ofrezca.
- **`UnityEngine*.dll`**: Unity está dividido en muchos módulos. `Input` vive en `UnityEngine.InputLegacyModule.dll`, la interfaz en `UnityEngine.UI.dll`, etcétera. Referenciarlos todos te ahorra buscar el "tipo no encontrado".
- **`CopyToGame`**: se acabó copiar la `.dll` a mano. Compila, arranca el juego, listo.

## 3. El esqueleto del plugin

Un plugin de BepInEx es una clase que hereda de `BaseUnityPlugin` y lleva el atributo `[BepInPlugin]`:

```csharp Plugin.cs
using BepInEx;
using BepInEx.Configuration;
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [BepInPlugin(PLUGIN_GUID, PLUGIN_NAME, PLUGIN_VERSION)]
    [BepInProcess("worldbox.exe")]
    public class HelloPlugin : BaseUnityPlugin
    {
        public const string PLUGIN_GUID = "com.example.hellobepinex";
        public const string PLUGIN_NAME = "HelloBepInEx";
        public const string PLUGIN_VERSION = "1.0.0";

        // BepInEx manages configuration files automatically
        private ConfigEntry<bool> configEnableLogs;
        private ConfigEntry<KeyCode> configHotkey;

        private void Awake()
        {
            // Bind configuration: section, key, default value, description
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

            // Apply any Harmony patches in this assembly
            Harmony harmony = new Harmony(PLUGIN_GUID);
            harmony.PatchAll();
        }

        private void Update()
        {
            // Standard Unity Update cycle
            if (Input.GetKeyDown(configHotkey.Value))
            {
                Logger.LogInfo("Hotkey pressed from BepInEx!");
            }
        }
    }
}
```

### Las partes, una a una

- **`BaseUnityPlugin`**: hereda directamente de `MonoBehaviour` de Unity. Tu plugin es un componente activo en un `GameObject` persistente que sobrevive a los cambios de escena.
- **`[BepInPlugin(guid, name, version)]`**: le dice a BepInEx cómo se llama tu mod y su identificador único. Usa el formato de dominio invertido (`com.author.modname`) y no cambies nunca el GUID tras publicar: el archivo de configuración y las dependencias de otros plugins van ligados a él.
- **`[BepInProcess("worldbox.exe")]`**: cargar solo dentro de WorldBox. Aquí no molesta, y evita un cuelgue confuso si alguien pone tu plugin en el BepInEx de otro juego.
- **`Logger.LogInfo()`**: escribe directamente en la consola en vivo de BepInEx y en `BepInEx/LogOutput.log`.
- **`Config.Bind()`**: crea una opción con tipo. La primera vez que se ejecuta tu plugin, BepInEx genera un archivo `BepInEx/config/com.example.hellobepinex.cfg` limpio que los jugadores pueden editar.

## 4. Engancharse al juego con Harmony

En BepInEx, Harmony viene incluido en `BepInEx/core/0Harmony.dll`. Añade una clase de parche en cualquier parte de tu proyecto:

```csharp Patches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    // MapBox.startTheGame runs once the world exists: it is where the game sets Config.game_loaded
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.startTheGame))]
    public static class StartTheGamePatch
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            Debug.Log("[HelloBepInEx] The world is ready!");
        }
    }
}
```

Como `Plugin.cs` llamó a `harmony.PatchAll()`, Harmony recorre tu ensamblado compilado y aplica todas las clases de parche que contiene. Todo lo que sabes de **[Parches de Harmony](#/nml/harmony-patches)** funciona igual aquí: los nombres de parámetro mágicos, Prefix y Postfix, las reglas para no romper otros mods.

## 5. Compilar e instalar

Compila tu proyecto desde la línea de comandos:

```bash
dotnet build -c Release
```

Tu `.dll` se crea en `bin/Release/net472/HelloBepInEx.dll`, y el paso `CopyToGame` la deja directamente en el juego:

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

Arranca el juego con la consola activada. Verás cómo BepInEx encuentra y carga tu ensamblado:

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

> [!WARNING] Cierra el juego antes de compilar
> Mientras WorldBox está abierto, mantiene tu `.dll` en uso, y la copia falla con "the process cannot access the file". Cierra el juego, compila, arráncalo otra vez. Ese es todo el ciclo de desarrollo con BepInEx :PES2_Weary:.

## Verdades duras sobre el modding con BepInEx

- **Sin recarga en caliente**: cambiar una línea de código significa cerrar WorldBox, ejecutar `dotnet build` y volver a abrir el juego. Si estás ajustando el combate o los números de un rasgo, cansa rápido. Hay una salida a medias en **[Depuración y publicación](#/toolbox/bepinex-publishing)**.
- **`HideManagerGameObject`**: en `BepInEx/config/BepInEx.cfg`, pon `HideManagerGameObject = true` bajo `[Chainloader]`. Sin eso, algunas rutinas de limpieza de Unity pueden destruir el objeto raíz de BepInEx y matar tu plugin sin avisar :PES5_Hmmmm:.
- **Junto a NML**: NML y BepInEx conviven sin problema en la misma carpeta del juego. Puedes usar NML para tus mods de contenido y BepInEx para herramientas como UnityExplorer sin que se peleen.
- **Acceso a los assets del juego**: tu plugin se despierta antes de que el juego construya sus librerías (library) de assets. Toca `AssetManager` en `Awake()` y recibes nulls. La página siguiente, **[Añadir contenido con BepInEx](#/toolbox/bepinex-content)**, enseña el momento exacto para engancharte.
