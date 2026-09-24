---
title: Generadores de nombres
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbscroll:
order: 186
---

# Generadores de nombres :wbscroll:

Cada nombre de WorldBox sale de un generador: unidades, ciudades, reinos (kingdom), clanes, guerras (war), libros (book). Tus criaturas pueden tener el suyo, para que un pueblo de espíritus de brasa esté lleno de Ashra y Cindox en vez de tomar prestados nombres humanos.

## De dónde sale un nombre

Tres pasos, de la criatura hasta las letras:

| Paso | Asset | Qué contiene |
| --- | --- | --- |
| La criatura | `ActorAsset.name_template_sets` | Una lista de ids de **conjuntos de nombres**. Se elige uno por cultura (culture) |
| El conjunto | `NameSetAsset` (`name_sets`) | Qué generador usar para cada tipo de cosa: `unit`, `city`, `kingdom`, `clan`, `family`, `culture`, `language`, `religion` |
| El generador | `NameGeneratorAsset` (`name_generator`) | Cómo se construye el nombre de verdad |

Así que para renombrar una especie entera haces un generador, un conjunto que lo use, y apuntas la criatura al conjunto.

## Tres formas de construir un nombre

Un generador funciona en uno de tres estilos, y el juego elige según qué campos hayas rellenado:

- **Grupos de partes.** Una lista de grupos, y se pega un trozo al azar de cada uno. El más sencillo, y el que usa esta página.
- **Diccionario.** Palabras enteras sacadas de listas con nombre y puestas en una frase. Así reciben las guerras y los libros títulos como "Bloody Hatred". Mira **[Tipos de guerra](#/nml/war-types)** y **[Libros](#/nml/books)**.
- **Onomástica.** Un formato de texto compacto que usan la mayoría de las civilizaciones vanilla y que además deja que los nombres cambien con el tiempo en una cultura. Es potente y yo no empezaría por ahí: copia uno de `NameGeneratorLibrary` si lo quieres y cambia las sílabas.

## El código

```csharp Mods/HelloBox/Code/HelloNames.cs
namespace HelloBox
{
    public static class HelloNames
    {
        public const string GENERATOR = "hello_sprite_name";
        public const string SET = "hello_sprite_set";

        public static void Initialize()
        {
            if (AssetManager.name_generator.has(GENERATOR)) return;

            NameGeneratorAsset generator = new NameGeneratorAsset
            {
                id = GENERATOR,
                // post_init() fills these two for part-group generators, and it already ran.
                // Female names add a vowel from this list, so leaving it null crashes.
                vowels = new string[] { "a", "e", "i", "o" },
                consonants = NameGeneratorAsset.consonants_sounds
            };

            // one piece from each group, in order. An empty entry means "sometimes nothing"
            generator.addPartGroup("ash,cin,em,sol,vol,ky");
            generator.addPartGroup("a,e,i,o,,");
            generator.addPartGroup("ra,dox,ber,rin,th,x");
            generator.addTemplate("Part_group");   // capital P = first letter upper case

            AssetManager.name_generator.add(generator);

            // the same generator for everything these creatures ever name
            AssetManager.name_sets.add(new NameSetAsset
            {
                id = SET,
                unit = GENERATOR,
                city = GENERATOR,
                kingdom = GENERATOR,
                clan = GENERATOR,
                family = GENERATOR,
                culture = GENERATOR,
                language = GENERATOR,
                religion = GENERATOR
            });
        }
    }
}
```

Luego, en tu criatura de **[Actores personalizados](#/nml/custom-actors)**:

```csharp
asset.name_template_sets = new string[] { HelloNames.SET };
```

`HelloNames.Initialize()` va **antes** que los actores en `OnModLoad`, porque el actor apunta al conjunto.

> [!WARNING] Rellena todos los huecos del conjunto
> Una cultura le pide a su conjunto un generador por cada tipo de cosa. Un hueco `city` vacío significa que el juego busca un generador llamado `""`, recibe `null`, y la primera ciudad que funden tus criaturas se lleva el juego por delante. Usa el mismo generador en todos si no tienes nada mejor :PESgn_Stop:.

## Las palabras de las plantillas

Una plantilla es una lista de palabras separadas por comas. Para los generadores de grupos de partes, estas son las útiles:

| Palabra | Qué añade |
| --- | --- |
| `part_group` / `Part_group` | Un trozo de cada grupo de `addPartGroup`. La P mayúscula pone en mayúscula la primera letra |
| `part_group2`, `part_group3` | Lo mismo para `addPartGroup2` y `addPartGroup3`, para una segunda o tercera palabra |
| `space` | Un espacio, así que `Part_group,space,Part_group2` hace nombre y apellido |
| `vowel` / `consonant` | Una letra de tus `vowels` / `consonants` |
| `number` | Un dígito del 0 al 9. Para robots, supongo |

Llama a `addTemplate` más de una vez y el juego elige una plantilla al azar para cada nombre.

## Probarlo sin esperar a que nazcan bebés

`NameGenerator.getName` es público, así que puedes imprimir diez nombres en el registro al cargar:

```csharp
for (int i = 0; i < 10; i++)
{
    LogInfo(NameGenerator.getName(HelloNames.GENERATOR));
}
```

Si la mitad parecen escritos por un gato paseando por el teclado, tus grupos son demasiado largos. Trozos cortos, más grupos. Los nombres que están en la lista negra del juego se descartan y se vuelven a tirar, así que nunca verás uno :PES5_Noted:.

Para títulos de palabras enteras (guerras, libros, lemas) el estilo diccionario es el que quieres, y las dos páginas siguientes construyen uno cada una.
