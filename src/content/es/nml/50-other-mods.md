---
title: Otros mods
group: NML Modding
subgroup: Avanzado y publicación
icon: :wbmodders:
order: 45
---

# Otros mods :wbmodders:

Tu mod no vive en un mundo vacío. Un jugador puede instalar HelloBox junto a otros veinte mods, la mitad de los cuales también intenta cambiar el combate, ajustar las leyes del mundo o añadir rasgos nuevos.

A veces quieres coordinarte con ellos: activar funciones extra si un mod compañero está instalado, parchear sus métodos con seguridad sin colapsar si faltan, o asegurarte de que tus assets se registran en el orden correcto.

Hay dos formas de hablar con otros mods: en tiempo de compilación mediante `mod.json`, o en tiempo de ejecución mediante código.

## Declarar dependencias en mod.json

La integración más limpia es declarar la relación en tu `mod.json`:

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "Markami",
  "version": "1.0.0",
  "description": "My first mod",
  "iconPath": "icon.png",
  "GUID": "com.markami.hellobox",
  "Dependencies": [],
  "OptionalDependencies": [
    "com.friend.coolmod"
  ],
  "IncompatibleWith": []
}
```

| Clave | Qué hace |
| --- | --- |
| `Dependencies` | Requisito estricto. NML garantiza que esos mods cargan **antes** que el tuyo. Si falta alguno o no compila, NML se niega a cargar tu mod directamente |
| `OptionalDependencies` | Requisito flexible. Si el otro mod está instalado, NML lo carga antes que el tuyo **y** define un símbolo de compilador para él. Si falta, tu mod carga con normalidad igualmente |
| `IncompatibleWith` | Lista de bloqueo. Si algún mod de esta lista está presente, NML marca un conflicto e impide que ambos se ejecuten juntos |

### El símbolo #if en tiempo de compilación

Cuando un mod listado en `OptionalDependencies` está instalado y se compila, NML define una constante de preprocesador por ti.

El símbolo es el GUID del otro mod convertido a mayúsculas, con todos los caracteres no alfanuméricos reemplazados por guiones bajos:

| GUID en `mod.json` | Símbolo de compilador definido |
| --- | --- |
| `com.friend.coolmod` | `COM_FRIEND_COOLMOD` |
| `com.author.magic-items` | `COM_AUTHOR_MAGIC_ITEMS` |

Envuelve tu código de integración en `#if`:

```csharp Mods/HelloBox/Code/HelloIntegration.cs
namespace HelloBox
{
    public static class HelloIntegration
    {
        public static void Initialize()
        {
#if COM_FRIEND_COOLMOD
            // Compilado solo cuando ese mod está presente y activo
            ApplyCoolModSynergy();
#endif
        }

#if COM_FRIEND_COOLMOD
        private static void ApplyCoolModSynergy()
        {
            // Aquí es seguro referenciar sus tipos directamente
            Main.Log("CoolMod found! Enabling partner synergies.");
        }
#endif
    }
}
```

> [!WARNING] Un símbolo mal escrito falla en silencio
> Si escribes `#if COM_FRIEND_COOL_MOD` en lugar de `#if COM_FRIEND_COOLMOD`, el compilador ve un símbolo no definido y elimina tu bloque de código sin decir nada. Nunca se ejecutará, sin errores ni advertencias en el log :PES4_1IQ:. Comprueba siempre la conversión exacta del GUID.

## Comprobar en tiempo de ejecución

El truco de `#if` solo funciona cuando NML compila tu mod desde el código fuente, y solo cuando el otro mod está declarado en `OptionalDependencies`.

Si distribuyes una `.dll` precompilada, o quieres comprobar la presencia de mods de forma dinámica sin recompilar, hazlo en tiempo de ejecución.

### Comprobar los ensamblados cargados

Puedes comprobar si el ensamblado del otro mod está cargado en el `AppDomain` actual:

```csharp
using System;
using System.Linq;

public static bool IsModLoaded(string pAssemblyName)
{
    return AppDomain.CurrentDomain.GetAssemblies()
        .Any(a => string.Equals(a.GetName().Name, pAssemblyName, StringComparison.OrdinalIgnoreCase));
}
```

O preguntarle a `AccessTools` de Harmony si existe una de sus clases:

```csharp
using HarmonyLib;

bool hasPartner = AccessTools.TypeByName("PartnerNamespace.PartnerMain") != null;
```

Si `AccessTools.TypeByName` devuelve un `Type` distinto de null, su código está cargado y listo.

## Parchear otro mod con Harmony

Parchear un método vanilla es sencillo. Parchear un método que vive en otro mod tiene una trampa enorme :wbfacepalm:.

Si escribes una clase de parche normal referenciando su tipo:

```csharp
// ¡Nunca hagas esto para un mod opcional!
[HarmonyPatch(typeof(PartnerMod.SomeClass), "SomeMethod")]
public static class BadCrossModPatch
{
    public static void Postfix() { }
}
```

El runtime de Mono intenta resolver `PartnerMod.SomeClass` en cuanto carga tu clase de parche. Si el jugador no tiene ese mod instalado, ¡todo tu mod colapsa con una `TypeLoadException` o `FileNotFoundException` antes incluso de que termine tu `Initialize()`!

En su lugar, parchéalo **manualmente** con `AccessTools`:

```csharp Mods/HelloBox/Code/HelloCrossPatch.cs
using System;
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCrossPatch
    {
        public static void ApplyIfPresent(Harmony pPatchEngine)
        {
            Type targetType = AccessTools.TypeByName("PartnerMod.SomeClass");
            if (targetType == null)
            {
                // El otro mod no está instalado. Se omite tranquilamente.
                return;
            }

            MethodInfo targetMethod = AccessTools.Method(targetType, "SomeMethod");
            if (targetMethod == null)
            {
                Main.LogWarning("PartnerMod found, but SomeMethod was not found. Outdated version?");
                return;
            }

            MethodInfo postfix = typeof(HelloCrossPatch).GetMethod(nameof(Postfix), BindingFlags.Static | BindingFlags.NonPublic);
            pPatchEngine.Patch(targetMethod, postfix: new HarmonyMethod(postfix));
            Main.Log("Successfully hooked PartnerMod.SomeMethod!");
        }

        private static void Postfix()
        {
            // Se ejecuta después de su método, solo si su mod está instalado
        }
    }
}
```

El parcheo manual mantiene la referencia al tipo basada en texto, así que el runtime nunca intenta cargar un ensamblado que falta.

## La trampa del orden de carga

Cuando clonas o referencias el contenido de otro mod, el orden lo es todo.

```csharp
// ¡Si su mod aún no ha ejecutado Initialize(), esto lanza NullReferenceException!
AssetManager.traits.clone("hello_super_trait", "partner_custom_trait");
```

NML carga los mods en orden de dependencia. Si pones al otro mod en `Dependencies` u `OptionalDependencies`, NML garantiza que su `Initialize()` se ejecuta **antes** que el tuyo.

Si *no* los declaraste como dependencia, el orden de carga entre mods no está definido. Siempre:
1. Declara al otro mod en `OptionalDependencies`.
2. Protégete con `AssetManager.traits.has(...)` antes de clonar o leer sus assets.

## Compartir datos sin conflictos

WorldBox te da diccionarios flexibles para guardar datos personalizados en actores (`actor.data`) y en mundos (`World.world.map_stats.custom_data`).

Cada mod comparte esos mismos diccionarios. Si escribes:

```csharp
// Mal: alguien más podría usar "level" también
actor.data.set("level", 5);
```

Otro mod podría escribir en `"level"` en el mismo frame con supuestos completamente distintos.

Antepone siempre un prefijo de tu mod a las claves de tus datos personalizados:

```csharp
actor.data.set("hello_level", 5);
int myLevel = actor.data.get("hello_level", 0);
```

Siguiente: **[Publicar tu mod](#/nml/publishing)** o gestiona la velocidad de simulación y las opciones en **[Opciones del juego y escalas de tiempo](#/nml/game-options)**.
