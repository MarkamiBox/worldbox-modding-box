---
title: Depuración y publicación
group: BepInEx Modding
icon: :wbfireworks:
order: 3
---

# Depuración y publicación :wbfireworks:

Tu plugin compila. Ahora tiene que cargar, funcionar y llegar a otras personas. Esta página son los errores que de verdad te vas a encontrar, en el orden en que aparecen, y luego cómo publicar la cosa.

## Dónde mirar

| Archivo | Dónde | Qué es |
| --- | --- | --- |
| La ventana de consola | Se abre con el juego, si la activaste | Todo, en vivo. Mira **[La consola en vivo (BepInEx)](#/toolbox/bepinex-console)** |
| `LogOutput.log` | `worldbox/BepInEx/` | Lo mismo, guardado. Es el que la gente te pide |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | El registro propio de Unity, para cuelgues que BepInEx no atrapó |

Busca primero el nombre de tu plugin en `LogOutput.log`. El primer error que lo menciona es el que importa, la misma regla que en **[Registros y depuración](#/nml/logs-and-debugging)**.

## Cuando no compila

| Error | Qué significa | Solución |
| --- | --- | --- |
| `The reference assemblies for .NETFramework,Version=v4.7.2 were not found` | Tu PC no tiene el paquete de desarrollo de .NET Framework 4.7.2 | El paquete `Microsoft.NETFramework.ReferenceAssemblies` de la **[preparación del proyecto](#/toolbox/bepinex-modding)** |
| `CS0246: The type or namespace name 'Input' could not be found` | Falta referenciar un módulo de Unity | Referencia `UnityEngine*.dll`, no solo `UnityEngine.dll` |
| `CS0122: '...' is inaccessible due to its protection level` | Usaste un miembro `internal` del juego | `Publicize="true"` en la referencia a `Assembly-CSharp` |
| `The process cannot access the file ... because it is being used by another process` | El juego está abierto y tiene tu `.dll` en uso | Cierra WorldBox, compila otra vez |
| `Could not find a part of the path` en el paso de copia | `GameDir` en tu `.csproj` está mal | Apúntalo a la carpeta que tiene `worldbox.exe` dentro |

## Cuando compila pero no carga

Arranca el juego y busca una línea `Loading [YourPlugin 1.0.0]`. Si no está, BepInEx nunca recogió tu plugin:

| Lo que ves | Por qué |
| --- | --- |
| Ninguna línea | La `.dll` no está dentro de `BepInEx/plugins/`, o BepInEx no está funcionando (ni consola ni `LogOutput.log`) |
| Ninguna línea, y la `.dll` está en su sitio | El proyecto apunta al framework equivocado. Tiene que ser `net472`, no `net8.0` ni `netstandard2.1` |
| La línea está, y luego `Could not load file or assembly 'Something'` | Usas una librería que no va con tu plugin. Pon su `.dll` junto a la tuya en la carpeta del plugin |
| Dos plugins con el mismo GUID | BepInEx carga solo uno. Normalmente una copia vieja de tu propio plugin en otra carpeta |

## Cuando carga pero se rompe

| Error | Lo que suele ser |
| --- | --- |
| `NullReferenceException` en `AssetManager...` | Tocaste las librerías (library) del juego demasiado pronto. Usa el Postfix sobre `AssetManager.init()` de **[Añadir contenido con BepInEx](#/toolbox/bepinex-content)** |
| `HarmonyException` / `Ambiguous match found` | Un parche apunta a un método que no existe o que tiene gemelos. Las mismas soluciones que en **[Parches de Harmony](#/nml/harmony-patches)** |
| `MissingMethodException` / `TypeLoadException` tras una actualización del juego | El juego cambió debajo de ti. Sigue **[Actualizar tras una actualización del juego](#/nml/game-updates)** y vuelve a compilar |
| Tu texto muestra claves en bruto tras cambiar de idioma | Falta el Postfix sobre `LocalizedTextManager.setLanguage` |
| Tu icono es invisible | El sprite se registró después de que algo ya pidiera su ruta, o apunta a una carpeta |
| Todo funciona y luego el plugin se para a mitad de partida | `HideManagerGameObject = true` en `BepInEx/config/BepInEx.cfg` |

## Un ciclo más rápido

Cerrar y abrir WorldBox en cada cambio es lo peor de BepInEx. El plugin **ScriptEngine** de la colección BepInEx.Debug lo suaviza: los plugins que pongas en `BepInEx/scripts/` en vez de `plugins/` se pueden recargar con una tecla mientras el juego está abierto (mira su readme para la tecla actual).

Es genial para herramientas, ventanas y overlays. Para contenido ayuda menos: el juego no olvida un rasgo (trait) que ya registraste, y cada parche de Harmony que aplicaste sigue puesto salvo que tu plugin lo quite al descargarse (`harmony.UnpatchSelf()` en `OnDestroy()`). Úsalo mientras construyes una interfaz, no mientras ajustas un rasgo :PES2_Shrug:.

## Publicar

### Qué va en el zip

Compila el plugin en modo Release y luego comprímelo para que los jugadores lo extraigan directamente en la carpeta del juego:

```text HelloBepInEx.zip
HelloBepInEx.zip
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

Lo que **no** va:

- **BepInEx en sí.** Los jugadores lo instalan una vez, igual que tú. Enlázales a la **[página de la consola](#/toolbox/bepinex-console)** y di qué versión: BepInEx 5, Mono, x64.
- **Los archivos del juego.** `Assembly-CSharp.dll`, los módulos de Unity y sobre todo la copia "publicizada" que creó la compilación. Son código del juego, no tuyo para compartir. `Private="false"` en el `.csproj` ya los deja fuera de tu carpeta de compilación, así que simplemente no los añadas a mano.
- **`BepInEx.dll` y `0Harmony.dll`.** BepInEx ya los tiene.

### El número de versión

Súbelo en dos sitios y mantenlos iguales: la `version` de `[BepInPlugin]` (lo que ven el registro y otros plugins) y `<Version>` en el `.csproj` (lo que dice el archivo `.dll`). Un plugin que registra `1.0.0` en su tercera versión complica cada informe de errores.

### Depender de otro plugin

Si tu plugin necesita que otro plugin de BepInEx cargue antes, dilo, y BepInEx ordena la carga y se niega a cargar el tuyo sin él:

```csharp
[BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
[BepInDependency("com.other.author.library")]
public class HelloPlugin : BaseUnityPlugin
```

Añade `BepInDependency.DependencyFlags.SoftDependency` como segundo argumento cuando el otro plugin es opcional y solo quieres cargar después de él si está.

### Dónde subirlo

Los mismos sitios que cualquier otro mod de WorldBox, y los mismos consejos: mira **[Publicar](#/nml/publishing)**. La única línea extra que necesita tu descripción es "Requires BepInEx 5 (Mono x64)", arriba del todo. Te ahorra los comentarios de "no funciona" de quien lo instaló en un juego solo con NML :wbsalut:.
