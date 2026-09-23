---
title: Rasgos lingüísticos
group: Contenido del juego
subgroup: Rasgos y genética
icon: :wbconfused:
order: 112
---

# Rasgos lingüísticos :wbconfused:

Un **idioma** pertenece a ciudades y reinos, sufre variaciones conforme se expande y es el vehículo en el que se redactan los **libros**. Un rasgo lingüístico es una cualidad inherente a la propia palabra hablada y escrita.

Es el más compacto de los siete sistemas de rasgos y cuenta con el hook más singular de todos: código que se dispara cuando alguien **lee un libro** escrito en dicha lengua.

| | |
| --- | --- |
| Biblioteca | `AssetManager.language_traits` |
| Clase | `LanguageTrait` |
| Grupos | `AssetManager.language_trait_groups`, clase `LanguageTraitGroupAsset` |
| Propietario en ejecución | `Language`, en `World.world.languages` |
| Prefijo de traducción | `language_trait_` |
| Carpeta de iconos por defecto | `ui/Icons/language_traits/` |

## Registrar uno

```csharp Mods/HelloBox/Code/HelloLanguage.cs
namespace HelloBox
{
    public static class HelloLanguage
    {
        public const string CLIPPED = "hello_clipped";

        public static void Initialize()
        {
            if (AssetManager.language_traits.has(CLIPPED)) return;

            LanguageTrait trait = new LanguageTrait
            {
                id = CLIPPED,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "knowledge",
                path_icon = "ui/Icons/iconHelloLanguage",
                value = 2f,                    // lo que este rasgo "vale". Ver abajo
                rarity = Rarity.R1_Rare
            };

            AssetManager.language_traits.add(trait);

            trait.addOpposite("scribble");
            trait.base_stats["intelligence"] = 2;
        }
    }
}
```

Las `base_stats` del idioma **sí** alcanzan a las unidades: `Actor.updateStats()` fusiona `language.base_stats` en todos los que lo hablen. Consulta el orden de fusión en la **[Referencia de estadísticas](#/nml/stats)**.

## El hook de libros

`read_book_trait_action` es el campo exclusivo de los rasgos de idioma. Se activa en el instante en que una unidad termina de leer un libro escrito en dicha lengua:

```csharp
public delegate void BookTraitAction(Actor pActor, LanguageTrait pTrait, Book pBook);
```

```csharp
trait.value = 0.2f;   // vanilla reutiliza `value` como la probabilidad de este hook

trait.read_book_trait_action = delegate(Actor pActor, LanguageTrait pTrait, Book pBook)
{
    if (pActor == null || !pActor.isAlive()) return;
    if (pActor.hasTrait("evil")) return;
    if (!Randy.randomChance(pTrait.value)) return;

    pActor.addTrait("hello_swift");
};
```

Así es con exactitud como operan las escrituras malditas y benditas de vanilla: `words_of_madness` comprueba `value` y añade el rasgo `madness`, `cursed_font` aplica un estado, `font_of_gods` aplica uno superior.

Dos pautas clave para imitar de vanilla:

- **Lee la probabilidad desde `pTrait.value`, nunca desde una constante.** El rasgo se pasa como argumento precisamente para que el mismo delegado sirva para varios rasgos con distinta intensidad.
- **Sal inmediatamente en las unidades que deban ser inmunes.** Todas las implementaciones de vanilla comprueban primero `evil` o `blessed`.

## Tu propio tipo de libro

El juego define formatos de libros en `AssetManager.book_types`:

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";

        public static void Initialize()
        {
            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset book = new BookTypeAsset
            {
                id = ALMANAC,
                name = "book_type_" + ALMANAC,
                description = "book_type_info_" + ALMANAC,
                rarity = 5
            };
            AssetManager.book_types.add(book);
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

## El campo `value`

`value` está en todas las clases de rasgos, pero en los idiomas es donde adquiere mayor protagonismo. Vanilla lo emplea con dos propósitos:

| Uso | Ejemplo |
| --- | --- |
| Calidad lingüística | `melodic` y `stylish_writing` usan `value = 3f` |
| Probabilidad del hook de lectura | `words_of_madness` usa `value = 0.1f` |

Ninguna regla impone un significado; elige un criterio por rasgo y mantén la coherencia.

## Opuestos

Los rasgos lingüísticos forman parejas antagónicas con más frecuencia que ningún otro sistema, ya que una lengua o posee una gramática estructurada o no la tiene:

```csharp
trait.addOpposite("scribble");
```

Decláralo en ambos extremos, del mismo modo que vanilla declara `scribble` y `nicely_structured_grammar` como opuestos mutuos.

## Los grupos de vanilla

`knowledge` · `spirit` · `harmony` · `chaos` · `miscellaneous` · `fate` · `special`

Tu propia pestaña: consulta **[Grupos de rasgos y pestañas](#/nml/trait-groups)**, con `AssetManager.language_trait_groups` y `LanguageTraitGroupAsset`.

## Los textos

```json Mods/HelloBox/Locales/en.json
{
  "language_trait_hello_clipped": "Clipped",
  "language_trait_hello_clipped_info": "Every sentence ends two words early. Nobody minds."
}
```

## Asignar el rasgo

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addLanguageTrait(HelloLanguage.CLIPPED);
```

```csharp
foreach (Language language in World.world.languages)
{
    if (language == null || language.isRekt()) continue;

    language.addTrait(HelloLanguage.CLIPPED, pRemoveOpposites: true);
}
```

Un objeto `Language` expone también `cities`, `kingdoms` y `books`, que es lo que querrás consultar cuando tu código necesite rastrear el alcance de una lengua.

> [!TIP] Los libros son un sistema de entrega desaprovechado
> Un libro escrito en tu idioma es una forma pausada y muy orgánica de otorgar un rasgo o estado. Circula por bibliotecas, atraviesa generaciones y el jugador contempla su difusión. Casi nadie crea mods para esto, lo cual lo convierte en una oportunidad perfecta :PES4_Classy:.

## Nuevos idiomas que obtienen un rasgo por sí mismos

Además de otorgarlo manualmente, un rasgo de idioma puede establecer `spawn_random_trait_allowed` para ser seleccionado cuando se forma un nuevo idioma, de la misma manera que una cultura selecciona sus rasgos iniciales.

> [!WARNING] `spawn_random_trait_allowed` se lee una sola vez, al inicio
> Los nuevos idiomas eligen sus rasgos iniciales de un grupo que `BaseTraitLibrary.linkAssets()` construye mientras se carga el juego, antes de que tu mod exista. Establecer la bandera en tu rasgo no cambia nada por sí solo: tu rasgo nunca estará en ese grupo y nunca aparecerá por casualidad en un nuevo idioma. Agrégalo tú mismo, con el peso que usa el juego vanilla:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.language_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` es `protected`, por lo que compila contra el ensamblado publicitado con el que NML ya compila tu mod. `spawn_random_rate` tiene un valor predeterminado de `5`: auméntalo y el rasgo aparecerá con más frecuencia.
