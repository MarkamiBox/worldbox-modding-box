---
title: Rasgos personalizados
group: Contenido del juego
subgroup: Rasgos y genética
icon: :wbstrongminded:
order: 100
---

# Rasgos personalizados :wbstrongminded:

Un rasgo (trait) es una etiqueta permanente en una unidad: *valiente*, *rápido*, *inmortal*. Aparece en el inspector, puede alterar las estadísticas (stats) de la unidad, puede ejecutar código cuando la unidad ataca, recibe daño o muere, y los hijos pueden heredarlo.

También es lo más sencillo de añadir en todo el juego, razón por la cual es el primer mod de todo el mundo. El mío no: mi primer mod era un wrapper alrededor del mod de otra persona, que es su propia forma de hacer trampa :trollface:.

## Pon siempre prefijo a tus ID

Cada asset en WorldBox vive en una única lista plana indexada por `id`. Si registras `fast` y otro mod registra `fast`, el segundo **sobrescribe** al primero y el log recibe una línea al respecto que nadie lee jamás.

Por lo tanto: `hello_swift`, no `swift`. Nombre corto del mod, guion bajo, tu nombre para el objeto. Haz esto para rasgos, objetos, edificios (building), poderes, estados, para absolutamente todo :aPES4_Noted:.

## El rasgo

```csharp Mods/HelloBox/Code/HelloTraits.cs
namespace HelloBox
{
    public static class HelloTraits
    {
        // El id escrito una sola vez. Cualquier otro archivo hace referencia a HelloTraits.SWIFT,
        // así un error tipográfico se convierte en un error de compilación en vez de un rasgo que no hace nada.
        public const string SWIFT = "hello_swift";

        public static void Initialize()
        {
            // Nunca registres el mismo id dos veces. La biblioteca registra un error y lo sobrescribe.
            if (AssetManager.traits.has(SWIFT)) return;

            ActorTrait swift = new ActorTrait
            {
                id = SWIFT,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                path_icon = "ui/Icons/iconSpeed",   // un icono vanilla, cámbialo por el tuyo más adelante
                group_id = "physique",              // en qué pestaña del libro de rasgos se ubica
                rate_birth = 0,                     // 0 = nunca aparece por sí solo
                can_be_given = true,                // el jugador puede asignarlo en el editor
                can_be_removed = true,
                can_be_cured = false
            };

            // add() registra el rasgo Y asigna su bloque de estadísticas. Ambas cosas, en ese orden.
            AssetManager.traits.add(swift);

            swift.base_stats["speed"] = 20f;
            swift.base_stats["attack_speed"] = 10f;
            swift.base_stats["damage"] = 5;
        }
    }
}
```

Y una línea en `Main.cs`:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");
    HelloTraits.Initialize();
}
```

### Qué hace cada parte

- **`AssetManager.traits`**: La biblioteca que alberga cada rasgo de unidad en el juego, vanilla y modificado. `has`, `get`, `add` y `clone` son los cuatro métodos que utilizarás en cada biblioteca en cada página a partir de aquí.
- **`path_icon`**: La pequeña imagen en el inspector. Una *ruta*, no un archivo. Consulta **[Sprites y recursos](#/nml/sprites-and-resources)**. El juego solo completa esto automáticamente mientras construye sus propias bibliotecas (lo cual ocurre antes de que cargue cualquier mod), por lo que para tu rasgo estará vacío a menos que lo especifiques.
- **`needs_to_be_explored`**: `true` por defecto, así que el rasgo sigue bloqueado en el libro (book) de conocimiento hasta que el jugador lo encuentre en un mundo. `false` lo deja disponible desde el primer segundo. HelloBox lo pone en todo, para que veas lo que has hecho sin tener que buscarlo.
- **`group_id`**: Bajo qué pestaña del libro de rasgos aparece. La lista completa está más abajo.
- **`rate_birth`**: La probabilidad de que un recién nacido lo obtenga de forma natural. `0` significa "solo si algo se lo concede".
- **`can_be_given` / `can_be_removed`**: Si el jugador puede añadirlo o quitarlo en el editor de rasgos. Ambos están por defecto en `true`; pon uno en `false` para un rasgo pensado para ser permanente o concedido solo por tu propio código.
- **`base_stats[...]`**: Las bonificaciones de atributos. La lista completa de estadísticas está en la página **[Referencia de estadísticas](#/nml/stats)**.

> [!WARNING] Las estadísticas van **después** de `add()`, siempre
> Un `ActorTrait` recién instanciado no tiene bloque de estadísticas. La biblioteca lo asigna dentro de `add()`. Si tocas `base_stats` antes de esa línea obtendrás el cuelgue más habitual del modding de WorldBox:
> `NullReferenceException: Object reference not set to an instance of an object`
>
> La misma regla aplica a estados, objetos, edificios y criaturas. La excepción es `clone()`, que llama a `add()` internamente por ti, así que tras clonar las estadísticas ya están listas.

> [!TIP] El mismo interruptor existe en casi todo lo que creas
> `needs_to_be_explored` vive en la clase base que comparten todos los assets desbloqueables, así que funciona en actores, los siete tipos de rasgo, objetos, modificadores (modifier) y leyes del mundo (world law). Poderes divinos (GodPower), estados, edificios, drops, nubes (cloud), tiles y proyectiles (projectile) no tienen paso de descubrimiento :wbsmirk:.

### Los grupos de rasgos vanilla

`group_id` debe ser uno existente, o tu rasgo no aparecerá en ninguna parte:

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

¿Quieres tu propia pestaña? Consulta **[Grupos de rasgos y pestañas](#/nml/trait-groups)**.

## Los textos de localización

Sin traducciones, tu rasgo se mostrará en el juego con la clave cruda `trait_hello_swift`, que se ve exactamente tan profesional como suena :pepeclown:. Crea `Locales/es.json`:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money."
}
```

La clave **no** es el id a secas. Cada tipo de rasgo antepone su propio identificador como prefijo:

| Tipo de rasgo | Clave de nombre | Clave de descripción emergente |
| --- | --- | --- |
| Actor trait | `trait_<id>` | `trait_<id>_info` |
| Culture trait | `culture_trait_<id>` | `culture_trait_<id>_info` |
| Religion trait | `religion_trait_<id>` | `religion_trait_<id>_info` |
| Subspecies trait | `subspecies_trait_<id>` | `subspecies_trait_<id>_info` |
| Clan trait | `clan_trait_<id>` | `clan_trait_<id>_info` |
| Language trait | `language_trait_<id>` | `language_trait_<id>_info` |
| Kingdom trait | `kingdom_trait_<id>` | `kingdom_trait_<id>_info` |

Existe también una segunda línea de descripción, `<prefix>_<id>_info_2`, usada por los rasgos que la necesitan.

## Tu propio icono personalizado

`path_icon` es una ruta, y el archivo va exactamente en esa ruta dentro de la carpeta `GameResources/` de tu mod. Sin extensión en la cadena de texto.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSwift.png
```

```csharp
swift.path_icon = "ui/Icons/iconHelloSwift";
```

Los iconos de rasgos son pequeños y el juego los dibuja a unos 32x32. Pon tu PNG en una carpeta propia si prefieres: `ui/Icons/hellobox/iconSwift` funciona igual de bien, solo debe coincidir con la cadena.

Los otros seis sistemas de rasgos tienen cada uno su carpeta vanilla (`ui/Icons/culture_traits/`, `religion_traits/`, `clan_traits/`, etc.). No estás obligado a usarlas, pero situarte junto a los rasgos que estás copiando facilita encontrar tu arte más adelante. Tabla completa en **[Sprites y recursos](#/nml/sprites-and-resources)**.

## Hacer que un rasgo *haga* algo

Las estadísticas son estáticas. Un rasgo también puede ejecutar código en cuatro momentos clave:

```csharp
// cada pocos segundos, mientras la unidad está viva
swift.special_effect_interval = 3f;
swift.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreStamina(5);
    return true;
};

// cuando la unidad muere
swift.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };

// cuando la unidad recibe un golpe
swift.action_get_hit = (BaseSimObject pSelf, BaseSimObject pAttacker, WorldTile pTile) => { return true; };

// cada vez que uno de los ataques de la unidad impacta, justo después del daño
swift.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor self = pSelf as Actor;
    // pTarget puede ser un edificio, y el golpe puede acabar de destruirlo
    if (self == null || !self.isAlive() || pTarget == null) return false;

    self.restoreHealth(2);
    return true;
};
```

Dos reglas para los cuatro: **comprueba si es null y comprueba si la unidad sigue viva primero**, y devuelve `false` cuando no hayas hecho nada. Estos callbacks corren en cada unidad que tenga el rasgo, para siempre.

> [!NOTE] `action_birth` y `action_growth` existen, y aquí nunca se disparan
> `ActorTrait` hereda ambos campos, así que compilan. El juego solo los lee de rasgos de **subespecie**: fusiona los rasgos de una subespecie en un único callback de nacimiento y uno de crecimiento, y llama a esos. En un rasgo de criatura se quedan ahí sin hacer nada, en silencio :wbreally:. Si quieres "cuando nace una unidad", conviértelo en un rasgo de subespecie: **[Rasgos de subespecie](#/nml/subspecies-traits)**.

### Cuando el rasgo se gana, se pierde o se carga

Otros tres ganchos se ejecutan una sola vez en lugar de todo el tiempo. Usan un delegado distinto, `WorldActionTrait`, que te entrega al propietario como `NanoObject` y el propio rasgo:

```csharp
// una sola vez, en el momento en que addTrait() lo pone en una unidad
swift.action_on_augmentation_add = (NanoObject pTarget, BaseAugmentationAsset pTrait) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreHealth(actor.getMaxHealth());   // un regalo de bienvenida, una sola vez
    return true;
};
```

| Campo | Cuándo se ejecuta |
| --- | --- |
| `action_on_augmentation_add` | `addTrait()` tuvo éxito |
| `action_on_augmentation_remove` | `removeTrait()` lo quitó, incluido cuando otro rasgo lo expulsó como opuesto o mediante `traits_to_remove` |
| `action_on_augmentation_load` | Un mundo guardado cargó y la unidad volvió con el rasgo |

Una unidad cargada recupera sus rasgos **sin** pasar por `addTrait()`, así que `_add` no se vuelve a ejecutar. Si `_add` configura algo que el guardado no conserva, vuelve a hacerlo en `_load`.

## Opuestos y exclusiones mutuas

La forma vanilla es `addOpposite("slow")` y `traits_to_remove_ids`. Ambas solo escriben **ids**, y el juego convierte esos ids en los conjuntos que realmente lee una sola vez, mientras carga, antes de que tu mod exista. En tu rasgo no hacen nada :wbfacepalm:. Rellena tú mismo los campos ya resueltos, después de `add()`:

```csharp
ActorTrait slow = AssetManager.traits.get("slow");
if (slow != null)
{
    // addTrait() solo comprueba el propio conjunto del rasgo NUEVO, así que rellena ambos lados:
    // si no, una unidad lenta rechaza swift, pero una unidad swift se vuelve lenta encantada
    swift.opposite_traits = new HashSet<ActorTrait> { slow };
    if (slow.opposite_traits == null) slow.opposite_traits = new HashSet<ActorTrait>();
    slow.opposite_traits.Add(swift);
}

// obtener swift elimina estos; el juego lee el array, no los ids
ActorTrait fat = AssetManager.traits.get("fat");
if (fat != null) swift.traits_to_remove = new ActorTrait[] { fat };
```

`HashSet` necesita `using System.Collections.Generic;` al principio del archivo.

> [!WARNING] `opposite_trait_mod` necesita `opposite_traits`
> `opposite_trait_mod` cambia cuánto se aprecian dos unidades entre sí cuando una tiene un opuesto del rasgo de la otra. El código social recorre `opposite_traits` sin comprobar null, así que fijar el modificador y dejar el conjunto en `null` lanza `NullReferenceException` la primera vez que dos unidades se evalúan mutuamente. Dale un valor al conjunto, aunque sea uno vacío.

## Rareza

`rarity` decide el color del nombre y la línea de rareza en el tooltip del rasgo, y `Rarity.R3_Legendary` también obtiene el marco especial legendario. Los valores son `R0_Normal`, `R1_Rare`, `R2_Epic` y `R3_Legendary`.

Para los rasgos vanilla es casi automático: mientras el juego carga, la biblioteca cuenta lo que hace cada rasgo (acciones, decisiones, hechizos, acciones de combate, etiquetas) y sube cualquier cosa que haga algo a `R1_Rare` o `R2_Epic`. Tu rasgo llega después de ese paso, así que conserva lo que hayas escrito, y si no escribiste nada ese es el valor por defecto, `R1_Rare`, por mucho que haga. Fíjalo tú mismo:

```csharp
swift.rarity = Rarity.R2_Epic;
```

## Desbloquearlo desde código

Con `needs_to_be_explored = true` el rasgo empieza bloqueado en el libro de conocimiento. `unlock()` es cómo el juego lo descubre:

```csharp
AssetManager.traits.get(HelloTraits.SWIFT)?.unlock();
```

Añade el id al progreso del jugador, muestra el aviso de "nuevo conocimiento" y guarda el archivo de progreso. `unlock(false)` se salta el guardado: úsalo cuando desbloquees varias cosas seguidas, y luego llama a `GameProgress.saveData()` una vez al final. Devuelve `false` y no hace nada cuando el rasgo ya está disponible, y un rasgo con `needs_to_be_explored = false` siempre lo está. Llámalo desde la jugabilidad, cuando el jugador se lo haya ganado: es su archivo de progreso real, y sigue desbloqueado en cada mundo después.

`unlocked_with_achievement` ya es `false` por defecto. Escribir `unlocked_with_achievement = false` no cambia nada.

## Asignar el rasgo a una unidad

```csharp
actor.addTrait(HelloTraits.SWIFT);

if (actor.hasTrait(HelloTraits.SWIFT))
{
    // ...
}
```

> [!WARNING] `spawn_random_trait_allowed` se lee una sola vez, al arrancar
> Las unidades nuevas sortean sus rasgos iniciales de una bolsa que `BaseTraitLibrary.linkAssets()` construye mientras carga el juego, antes de que exista tu mod. Activar el ajuste en tu rasgo no cambia nada por sí solo: tu rasgo nunca está en esa bolsa y nunca aparece por azar. Mételo tú mismo, con el peso que usa vanilla:
>
> ```csharp
> swift.spawn_random_trait_allowed = true;
> AssetManager.traits._pot_allowed_to_be_given_randomly.AddTimes(swift.spawn_random_rate, swift);
> ```
>
> `_pot_allowed_to_be_given_randomly` es `protected`, así que esto compila contra el ensamblado publicitado con el que NML ya compila tu mod. `spawn_random_rate` vale `5` por defecto: súbelo y el rasgo aparece más a menudo.

## Comprobar que ha funcionado

Inicia el juego, abre una unidad, abre el editor de rasgos y mira en la pestaña `physique`. ¿No está? El log sabe por qué, y la respuesta casi siempre es una de estas tres: `can_be_given` es false, `group_id` no existe, o `path_icon` apunta a la nada :wbreally:.

## Los otros seis tipos de rasgos

Los rasgos de criatura son solo uno de **siete** sistemas de rasgos. Cada uno tiene su propia biblioteca, sus propios grupos y su propio portador, y todos ellos siguen exactamente el patrón de esta página. Solo cambian el nombre de la clase, la biblioteca y el prefijo de traducción.

| Sistema | Pertenece a | Página |
| --- | --- | --- |
| Actor | una criatura | esta página |
| Culture | una cultura (culture), compartida por sus ciudades | **[Rasgos de cultura](#/nml/culture-traits)** |
| Religion | una religión (religion) y sus creyentes | **[Rasgos de religión](#/nml/religion-traits)** |
| Subspecies | una rama de una especie | **[Rasgos de subespecie](#/nml/subspecies-traits)** |
| Clan | un linaje de sangre | **[Rasgos de clan](#/nml/clan-traits)** |
| Language | un idioma y quienes lo hablan | **[Rasgos de idioma](#/nml/language-traits)** |
| Kingdom | la política de un reino (kingdom) | **[Rasgos de reino](#/nml/kingdom-traits)** |

Elige al portador antes de escribir el rasgo. "Los elfos disparan mejor" es un rasgo cultural si debe propagarse con sus ciudades, un rasgo de subespecie (subspecies) si debe heredarse por reproducción, y un rasgo de criatura si pertenece a un individuo. Confundirse en eso es la diferencia entre un mod que transforma un mundo a lo largo de una hora y uno que no hace nada en absoluto :PES_ThinkAboutIt:.
