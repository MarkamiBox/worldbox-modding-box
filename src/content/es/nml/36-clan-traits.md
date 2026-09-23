---
title: Rasgos de clan
group: Contenido del juego
subgroup: Rasgos y genética
icon: :wbclanroses:
order: 110
---

# Rasgos de clan :wbclanroses:

Un **clan** es un linaje sanguíneo: una familia que creció lo suficiente como para formar una entidad propia, con su propio estandarte, su color característico y su propia reputación. Un rasgo de clan es lo que ese linaje porta en sus venas.

Los rasgos de clan son lo más cercano en el juego a un superpoder hereditario, y representan el único sistema de rasgos con una **división macho / hembra** integrada.

| | |
| --- | --- |
| Biblioteca | `AssetManager.clan_traits` |
| Clase | `ClanTrait` |
| Grupos | `AssetManager.clan_trait_groups`, clase `ClanTraitGroupAsset` |
| Propietario en ejecución | `Clan`, en `World.world.clans` |
| Prefijo de traducción | `clan_trait_` |
| Carpeta de iconos por defecto | `ui/Icons/clan_traits/` |

## Registrar uno

```csharp Mods/HelloBox/Code/HelloClan.cs
namespace HelloBox
{
    public static class HelloClan
    {
        public const string OLD_BLOOD = "hello_old_blood";

        public static void Initialize()
        {
            if (AssetManager.clan_traits.has(OLD_BLOOD)) return;

            ClanTrait trait = new ClanTrait
            {
                id = OLD_BLOOD,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloClan",
                rarity = Rarity.R1_Rare
            };

            AssetManager.clan_traits.add(trait);

            trait.base_stats["multiplier_health"] = 0.15f;
            trait.base_stats["armor"] = 4;
            trait.base_stats.addTag("immunity_cold");
        }
    }
}
```

Las `base_stats` del clan se fusionan en cada miembro del clan, así que, a diferencia de la religión, este sí es un sistema de atributos real. Consulta el orden de fusión en **[Referencia de estadísticas](#/nml/stats)**.

## La división macho / hembra

Los dos campos que ninguna otra clase de rasgo tiene:

```csharp
trait.base_stats["health"] = 20;           // todos los miembros
trait.base_stats_male["damage"] = 6;       // solo machos
trait.base_stats_female["intelligence"] = 4;   // solo hembras
```

`Actor.updateStats()` fusiona `clan.base_stats`, y luego `clan.base_stats_male` **o** `clan.base_stats_female` dependiendo del sexo de la unidad. Ambos bloques adicionales existen desde el principio sin asignarse en `add()`, por lo que puedes escribir en ellos en cualquier momento.

## Decisiones: lo que un clan *hace*

Los rasgos de clan de vanilla se apoyan en decisiones más que en acciones, porque un clan es ante todo una entidad social:

```csharp
trait.addDecision("banish_unruly_clan_members");
trait.addOpposite("hello_new_blood");
```

Una decisión es una opción de IA en `AssetManager.decisions_library`. Dos rasgos de clan de vanilla, `blood_pact` y `deathbound`, son en realidad el mismo rasgo con distinta decisión y están declarados como opuestos mutuos. Es una estructura que vale la pena replicar: dos rasgos, un mismo eje, mutuamente excluyentes.

## Hooks de combate y efectos

```csharp
// cada golpe que asesta un miembro del clan
trait.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null) return false;
    return true;
};

// con temporizador, en cada miembro del clan
trait.special_effect_interval = 2f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreHealth(1);
    return true;
};
```

Comprueba siempre valores nulos y devuelve `false` si no realizaste ninguna acción. Estos hooks se ejecutan para cada miembro de cada clan que posea el rasgo.

## Bloqueado tras un logro

Varios rasgos de clan de vanilla son recompensas en lugar de estar disponibles por defecto:

```csharp
trait.setUnlockedWithAchievement("achievementSegregator");
```

Un rasgo bloqueado sigue existiendo y funcionando con normalidad; el jugador simplemente no puede elegirlo en el editor hasta haber completado el logro correspondiente. Ten en cuenta que `BaseTraitLibrary` también asigna automáticamente `rarity = R3_Legendary` a cualquier elemento bloqueado de este modo.

## Los grupos de vanilla

`spirit` · `mind` · `body` · `chaos` · `harmony` · `fate` · `special`

Tu propia pestaña: consulta **[Grupos de rasgos y pestañas](#/nml/trait-groups)**, con `AssetManager.clan_trait_groups` y `ClanTraitGroupAsset`.

## Los textos

```json Mods/HelloBox/Locales/en.json
{
  "clan_trait_hello_old_blood": "Old Blood",
  "clan_trait_hello_old_blood_info": "Their great-grandparents were also difficult to kill."
}
```

## Asignar el rasgo

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addClanTrait(HelloClan.OLD_BLOOD);
```

```csharp
foreach (Clan clan in World.world.clans)
{
    if (clan == null || clan.isRekt()) continue;

    clan.addTrait(HelloClan.OLD_BLOOD, pRemoveOpposites: true);
}
```

El clan de una unidad está en `actor.clan`, y `actor.hasClan()` te indica si pertenece a uno; muchas unidades jamás se unen a ninguno.

> [!TIP] Los clanes son pequeños, puedes ser generoso
> Una cultura abarca un continente; un clan abarca una familia, y `limit_clan_members` limita su tamaño máximo. Un rasgo de clan puede ser mucho más poderoso que un rasgo cultural con el mismo nivel de impacto en el equilibrio del mundo, lo que convierte a los clanes en el hogar perfecto para ideas espectaculares :PES5_Menace:.
