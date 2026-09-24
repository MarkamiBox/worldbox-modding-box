---
title: Libros
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbscroll:
order: 187
---

# Libros :wbscroll:

Las unidades escriben libros, las ciudades los guardan, y otras unidades los leen y salen un poco distintas. Un tipo de libro es una nueva clase de libro dentro de ese ciclo: quién lo escribe, cómo se llama, qué portada tiene y qué te hace leerlo.

La página **[Rasgos lingüísticos](#/nml/language-traits)** ya crea uno pequeño, el Almanaque de Brasa. Esta página toma el mismo libro y lo termina: sus propios títulos, una recompensa de verdad y algo que pasa al leerlo.

## Cómo nace un libro

Aquí nada necesita un parche, solo tienes que conocer el ciclo:

1. Una unidad decide escribir. El juego reúne todos los tipos de libro cuyo `requirement_check` se cumple para esa unidad.
2. Cada uno entra en una bolsa `writing_rate` veces (o `rate_calc` veces, si lo pones), **con un máximo de 10**, y se saca uno.
3. El libro necesita un edificio con un hueco libre para libros en la **ciudad** del escritor. Sin biblioteca, no hay libro.
4. El título sale del generador de nombres de `name_template`, y la portada de la carpeta de `path_icons`.
5. Más tarde alguien lo lee y recibe las recompensas de abajo.

Como el juego lee `book_types.list` de nuevo cada vez, a un tipo de libro le basta con `add()`. Sin pools, sin post-init. Una rara sorpresa agradable :PESgn_Neat:.

## El código

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";
        public const string TITLES = "hello_book_titles";

        public static void Initialize()
        {
            Titles();

            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset almanac = new BookTypeAsset
            {
                id = ALMANAC,
                name_template = TITLES,              // our own titles, below
                color_text = "#D14219",
                writing_rate = 2,
                path_icons = "hello_almanac/",       // GameResources/books/book_icons/hello_almanac/
                requirement_check = (Actor pActor, BookTypeAsset pAsset) => pActor.hasTrait(HelloTraits.SWIFT),
                read_action = (Actor pActor, BookTypeAsset pAsset) =>
                {
                    // runs once per read, on the reader
                    StatusAsset curse = AssetManager.status.get(HelloStatus.CURSED);
                    if (curse != null) World.world.statuses.newStatus(pActor, curse, 0f);
                }
            };

            AssetManager.book_types.add(almanac);

            // what a reader gets out of it
            almanac.base_stats["experience"] = 5f;
            almanac.base_stats["happiness"] = 5f;
            almanac.base_stats["intelligence"] = 1f;   // this one is permanent, see below
        }

        /** A title generator in the dictionary style, built on the game's own book template. */
        private static void Titles()
        {
            if (AssetManager.name_generator.has(TITLES)) return;

            // $base_book_template$ already knows "of", "and", "about" and all the $name$ slots
            NameGeneratorAsset titles = AssetManager.name_generator.clone(TITLES, "$base_book_template$");
            titles.replacer += NameGeneratorReplacers.replaceOwnName;   // fills $unit$ with the writer
            titles.replacer += NameGeneratorReplacers.replaceOwnCity;   // fills $city$

            titles.addDictPart("almanac", "Almanac,Handbook,Notes,Scribbles,Field Guide");
            titles.addDictPart("fire", "Fire,Embers,Ash,Sparks,Smoke");
            titles.addTemplate("almanac,of,fire");
            titles.addTemplate("almanac,of,$unit$");
            titles.addTemplate("fire,and,$city$");
        }
    }
}
```

Este archivo **sustituye** al `HelloBooks.cs` de la página de rasgos lingüísticos, es la misma clase ya crecida. `HelloBooks.Initialize()` va después del rasgo y del estado que usa.

## Lo que da leerlo

Los números de `base_stats` no son un efecto que se pasa. Cada lectura los reparte una vez:

| Estadística | Lo que recibe el lector |
| --- | --- |
| `happiness` | Esa felicidad, como evento de "acaba de leer un libro". También funciona en negativo, para libros deprimentes |
| `experience` | Esa experiencia |
| `mana` | Ese maná |
| `diplomacy`, `warfare`, `stewardship`, `intelligence` | Se suman al lector **para siempre**. En cada lectura, otra vez |

La última fila es la potente. Un libro que da `intelligence = 1` hace más lista a una ciudad lectora con cada generación, así que mantenlo pequeño. Un libro de +10 es la forma de tener un reino de genios para el año 50 :wbgenius:.

Los rasgos de idioma y de cultura pueden cambiar los dos primeros: un idioma con `beautiful_calligraphy` hace más grande la felicidad, y una cultura con `reading_lovers` convierte los libros tristes en alegres.

## Los campos que importan

| Campo | Qué hace |
| --- | --- |
| `name_template` | El generador de nombres para los títulos. Vanilla: `book_name_fable`, `book_name_love_story`, `book_name_history`... |
| `writing_rate` | Su peso cuando un escritor elige un tipo. Vanilla usa de 1 a 3 |
| `rate_calc` | Un método que devuelve el peso en su lugar, como el manual de guerra vanilla con el `warfare` del escritor. Sigue con máximo 10 |
| `requirement_check` | Quién puede escribirlo. `null` = cualquiera |
| `read_action` | Tu propio código, una vez por lectura |
| `path_icons` | Una carpeta dentro de `books/book_icons/`, leída como lista de imágenes. Se elige una por libro |
| `color_text` | El color del título en la interfaz |
| `save_culture` / `save_religion` | Si el libro recuerda la cultura y la religión del escritor. Las dos activadas por defecto, e importan en libros que difunden una fe |

## El generador de títulos

Los títulos usan el estilo diccionario de **[Generadores de nombres](#/nml/name-generators)**. Una plantilla es una lista de claves del diccionario, y cada clave elige una palabra de su lista:

- `addDictPart("almanac", "Almanac,Handbook,Notes")` crea una clave con tres palabras posibles.
- `addTemplate("almanac,of,fire")` pega una palabra de cada clave: "Handbook of Ash".
- Palabras como `$unit$` y `$city$` son huecos. Un **replacer** los rellena con el nombre o la ciudad real del escritor. Sin el replacer correspondiente salen como `$unit$`, literalmente, en la portada :wbfacepalm:.

Clonar `$base_book_template$` es el atajo: ya tiene las palabras pequeñas (`of`, `and`, `about`, `the`...), todos los huecos y el propio arreglo de títulos del juego.

## El texto

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

Las claves son fijas: `book_type_<id>` y `book_type_info_<id>`. Los títulos se generan, así que no tienen claves.

## Tus propias portadas

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── books/
        └── book_icons/
            └── hello_almanac/     <- one PNG per cover, any names
```

`path_icons` es una **carpeta**, con la `/` al final. Un PNG basta, solo tiene que estar dentro. Mientras pruebas, toma prestada una carpeta vanilla como `fable/`.

Para verlo funcionar, crea un mundo, deja crecer una ciudad con tu rasgo hasta que construya una biblioteca, y abre los libros de la ciudad. Tarda, es un libro :PES2_Shrug:.
