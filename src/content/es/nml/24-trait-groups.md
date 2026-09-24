---
title: Grupos de rasgos y pestañas
group: Contenido del juego
subgroup: Rasgos y genética
icon: :wbfamilies:
order: 102
---

# Grupos de rasgos y pestañas :wbfamilies:

Cada rasgo pertenece a un **grupo**, y el grupo es lo que dibuja una pestaña en el libro de rasgos. Si añades seis rasgos y los tiras todos en `miscellaneous`, se esfuman en una lista por la que nadie hace scroll :PES4_Invisible:.

Tener tu propia pestaña cuesta cuatro líneas.

## Qué es un grupo

Un grupo es un `BaseCategoryAsset`, que es el asset más diminuto de todo el juego:

| Campo | Qué hace |
| --- | --- |
| `id` | Hacia dónde apunta el `group_id` de un rasgo |
| `name` | La **clave de traducción** para la etiqueta de la pestaña. No el texto visible directo |
| `color` | Cadena hexadecimal. Tiñe la pestaña y los rasgos bajo ella |
| `show_counter` | Si la pestaña muestra "3 / 12". `true` por defecto |

## Tu propia pestaña

```csharp Mods/HelloBox/Code/HelloGroups.cs
namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";

        public static void Initialize()
        {
            if (AssetManager.trait_groups.has(TRAITS)) return;

            AssetManager.trait_groups.add(new ActorTraitGroupAsset
            {
                id = TRAITS,
                name = "trait_group_" + TRAITS,   // la clave de idioma, no el texto directo
                color = "#7FE7C4"
            });
        }
    }
}
```

Apunta tus rasgos hacia él:

```csharp
ActorTrait swift = new ActorTrait
{
    id = HelloTraits.SWIFT,
    group_id = HelloGroups.TRAITS,
    path_icon = "ui/Icons/iconSpeed"
};
AssetManager.traits.add(swift);
```

Y ponle nombre a la pestaña:

```json Mods/HelloBox/Locales/en.json
{
  "trait_group_hello_traits": "HelloBox"
}
```

> [!WARNING] Grupos antes de los rasgos contenidos en ellos
> Un rasgo cuyo `group_id` apunta a un grupo que aún no existe no tiene dónde dibujarse. En `OnModLoad`, `HelloGroups.Initialize()` debe ejecutarse antes de `HelloTraits.Initialize()`.

## Los grupos vanilla de rasgos de actores

Usa uno de estos cuando no quieras tu propia pestaña:

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

## Dónde aparece tu pestaña

Los grupos se dibujan en el orden de `list`, y `add()` coloca el tuyo al final. Para ubicarlo al lado de uno relacionado, muévelo a continuación:

```csharp
ActorTraitGroupAsset group = AssetManager.trait_groups.get(HelloGroups.TRAITS);
int index = AssetManager.trait_groups.list.FindIndex(g => g.id == "physique");

if (group != null && index != -1)
{
    AssetManager.trait_groups.list.Remove(group);
    AssetManager.trait_groups.list.Insert(index + 1, group);
}
```

`list` es una simple `List<T>` en cada biblioteca, así que este truco funciona en cualquiera de ellas. Consulta **[Bibliotecas de assets](#/nml/asset-libraries)**.

## Renombrar o recolorear un grupo vanilla

No tienes que añadir un grupo para modificar uno existente. `get()` te entrega el objeto en vivo:

```csharp
ActorTraitGroupAsset fun = AssetManager.trait_groups.get("fun");
if (fun != null)
{
    fun.name = "trait_group_hello_fun";   // tu propia clave de idioma
    fun.color = "#FFB35E";
}
```

Editar un grupo vanilla in situ mantiene funcionando cada rasgo vanilla que apunta a él y permite cargar partidas guardadas antiguas. Reemplazarlo no hace ninguna de las dos cosas :PES_NoSign:.

## Las otras seis bibliotecas de grupos

Los rasgos de actor son uno de siete sistemas de rasgos, y cada uno tiene su propia biblioteca de grupos con su propia clase de grupo. El código en esta página es idéntico para todos ellos, solo cambian dos nombres. Apréndelo una vez, cópialo seis veces:

| Sistema de rasgos | Biblioteca de grupos | Clase de grupo | Página |
| --- | --- | --- | --- |
| Actor | `AssetManager.trait_groups` | `ActorTraitGroupAsset` | esta página |
| Cultura | `AssetManager.culture_trait_groups` | `CultureTraitGroupAsset` | **[Rasgos culturales](#/nml/culture-traits)** |
| Religión | `AssetManager.religion_trait_groups` | `ReligionTraitGroupAsset` | **[Rasgos religiosos](#/nml/religion-traits)** |
| Subespecie | `AssetManager.subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | **[Rasgos de subespecies](#/nml/subspecies-traits)** |
| Clan | `AssetManager.clan_trait_groups` | `ClanTraitGroupAsset` | **[Rasgos de clanes](#/nml/clan-traits)** |
| Idioma | `AssetManager.language_trait_groups` | `LanguageTraitGroupAsset` | **[Rasgos de idioma](#/nml/language-traits)** |
| Reino | `AssetManager.kingdoms_traits_groups` | `KingdomTraitGroupAsset` | **[Rasgos de reinos](#/nml/kingdom-traits)** |

El equipamiento comparte el mismo concepto bajo otro nombre. Consulta **[Grupos de objetos y pestañas](#/nml/item-groups)**.

> [!TIP] Una pestaña, no seis
> La tentación en un mod grande es crear un grupo por característica. Resístela. El libro de rasgos ya está saturado: un jugador encontrará con gusto una pestaña con el nombre de tu mod, pero ignorará seis pestañas bautizadas con nombres de tus sistemas internos.
