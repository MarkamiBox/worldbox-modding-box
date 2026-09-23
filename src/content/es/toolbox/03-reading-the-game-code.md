---
title: Leyendo el código del juego (dnSpy)
group: Resumen
subgroup: Herramientas externas y configuración
icon: :wbnerd:
order: 7
---

# Leyendo el código del juego :wbnerd:

Todas las respuestas sobre moddear WorldBox ya están escritas: están dentro del propio juego :wbbru:. **dnSpy** (o **ILSpy**) vuelve a convertir el archivo compilado del juego en C# legible, para que puedas consultar con total precisión cómo se llama un método, qué parámetros recibe y qué hace de verdad.

Este es el mayor salto posible entre "copiar fragmentos a ciegas" y "moddear en serio" :3074-woah:.

## Abrir el juego

1. Descarga [**dnSpy**](https://github.com/dnSpyEx/dnSpy/releases) (o [**ILSpy**](https://github.com/icsharpcode/ILSpy/releases), misma idea con botones distintos).
2. Abre este archivo:

```text
worldbox/worldbox_Data/Managed/Assembly-CSharp.dll
```

Ese único archivo contiene todo el código del juego. A la izquierda verás el árbol con cada clase: `Actor`, `AssetManager`, `GodPower`, `ScrollWindow`, absolutamente todas.

## Las cuatro cosas que harás todo el tiempo

### 1. Buscar una clase

Con `Ctrl+Shift+K` buscas tipos. Escribe `ActorTrait`, ábrela y verás cada campo que puedes configurar, con su tipo y su valor por defecto:

```csharp Assembly-CSharp / ActorTrait
public string path_icon;
public string group_id;
public float rate_birth;
public bool can_be_cured;
```

Esa lista *es* la documentación para la página de **[Rasgos personalizados](#/nml/custom-traits)**. El mismo truco sirve para `ItemAsset`, `BuildingAsset`, `StatusAsset` o lo que sea.

### 2. Comprobar la firma real de un método

Adivinar nombres de métodos es la manera más rápida de perder una hora peleando con un error de compilación. Búscalo en su lugar. Al buscar `addTrait` dentro de `Actor` obtienes:

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool hasTrait(string pTraitID)
public void removeTrait(string pTraitID)
```

Ahora ya sabes que recibe un string, devuelve un bool y tiene un segundo argumento opcional.

### 3. Ver cómo lo hace el propio juego

Esta es la mejor parte. ¿Quieres crear una ley del mundo que funcione? Busca `WorldLawLibrary`, abre `init()` y lee lo que escribieron los propios desarrolladores:

```csharp Assembly-CSharp / WorldLawLibrary.init()
world_law_mutant_box = add(new WorldLawAsset
{
    id = "world_law_mutant_box",
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_mutant_box",
    default_state = false
});
```

Copia esa misma estructura, cambia el id y el icono, y tu ley funcionará. Cada `*Library.init()` del juego es un tutorial gratis para ese tipo de asset.

### 4. Encontrar todos los IDs

Los IDs son simples cadenas de texto, y un texto incorrecto falla en silencio. En los métodos `init()` están todos reunidos: `TileLibrary.init()` tiene cada ID de terreno, `ItemLibrary.init()` cada arma, `ActorAssetLibrary.init()` cada criatura.

## public, internal y tú

Al leer el código verás tres palabras delante de los métodos:

| Palabra | Qué significa para ti |
| --- | --- |
| `public` | Puedes llamarlo. Siempre. |
| `internal` | Solo se puede llamar si compilas contra una copia **publicized** de `Assembly-CSharp.dll` |
| `private` | No puedes llamarlo directamente. Busca el método público que lo use, o modifícalo con un parche (ver **[Parches con Harmony](#/nml/harmony-patches)**) |

Una DLL "publicized" es una copia en la que todos los miembros se han hecho públicos. La mayoría de modders de WorldBox usan una, y es la razón por la que código como `actor.getHit(...)` compila para ellos pero no para ti. Si algo se niega a compilar y dnSpy dice `internal`, esa es toda la explicación.

> [!TIP] Mantenlo abierto mientras programas
> No se trata de "leerse todo el juego", nadie en su sano juicio hace eso. Ábrelo junto a tu editor y consulta cada nombre sobre la marcha. Dos segundos ahí le ganan por goleada a veinte minutos de frustración con un error de compilación incomprensible :PES_ThumbsUp:.

Cuando solo necesitas el nombre de un método y su firma, el **[Buscador de métodos](#/tools/methods)** de este sitio es más rápido: cada método del juego, con búsqueda directa y con los `internal` ya señalizados. Vuelve a dnSpy cuando necesites leer lo que el método realmente *hace*: esa es la parte que ningún índice te puede dar.
