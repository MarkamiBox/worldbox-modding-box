---
title: Referencia de estadísticas
group: Contenido del juego
subgroup: Arquitectura y estadísticas
icon: :wbstonks:
order: 92
---

# Referencia de estadísticas :wbstonks:

Casi todos los assets que registrarás tienen un bloque `base_stats`, y casi todas las páginas después de esta configuran algo en él. Esta es la lista de todo lo que puedes colocar allí.

## Cómo funciona base_stats

`base_stats` es un diccionario de `string` a `float`. La clave debe ser uno de los ids de estadísticas que se muestran abajo. Escribir una clave desconocida **no** es inofensivo: el método setter busca el id en `base_stats_library`, recibe `null` y lanza una `NullReferenceException` en tu propio `Initialize()`.

Un error tipográfico en una estadística no falla en silencio: tumba toda tu fase de registro y nada de lo que esté debajo se ejecuta jamás. Mantén tus nombres de estadísticas en campos `const string` si los usas en más de un lugar.

```csharp
trait.base_stats["damage"] = 15;
trait.base_stats["multiplier_health"] = 0.25f;   // +25%, no x0.25
```

## De dónde proceden los números de una unidad

`Actor.updateStats()` limpia el bloque de estadísticas de la unidad y lo reconstruye desde cero en este orden exacto:

| # | Fuente | Nota |
| --- | --- | --- |
| 1 | **Subespecie**, más su bloque masculino o femenino | Si la unidad tiene una |
| 1b | **Actor asset** | Solo cuando **no** hay subespecie. La subespecie lo *reemplaza*, no se acumula encima |
| 2 | **Clan**, más su bloque masculino o femenino | |
| 3 | **Idioma** | |
| 4 | **Cultura** | |
| 5 | Atributos de líder de los propios datos de la unidad | `diplomacy`, `stewardship`, `intelligence`, `warfare` |
| 6 | Cada **efecto de estado** activo | |
| 7 | El objeto de **ataque por defecto** | Solo cuando está desarmada |
| 8 | Cada **rasgo de actor** | Los rasgos ligados a una era se omiten si dicha era no está activa |
| 9 | Su **personalidad** | |
| 10 | Cada **objeto equipado**, con sus modificadores | |

Dos errores comunes aquí:

- **Una subespecie reemplaza las estadísticas del actor asset.** Pon un número en `human` y una unidad con subespecie jamás lo verá.
- **La religión no está en esta lista.** El `base_stats` de un rasgo religioso jamás llega a la unidad. Consulta **[Rasgos de religión](#/nml/religion-traits)**.

Dos consecuencias más:

- Una estadística plana como `damage` es una **bonificación**, no un valor final. `damage = 15` en un rasgo significa "+15 por encima de todo lo demás".
- Una estadística `multiplier_*` es una **fracción sumada a 1.0**. `multiplier_health = 0.5` es +50%. `multiplier_health = -0.5` es mitad de vida.

> [!WARNING] `base_stats` no existe hasta registrar el asset
> En un asset creado a mano, el bloque de estadísticas se asigna dentro de `add()`. Si tocas `base_stats` antes de esa línea, obtendrás una `NullReferenceException`. `clone()` llama a `add()` por ti, así que tras clonar ya estás a salvo. Es el cuelgue más habitual de todo el modding de WorldBox.

## Combat

| Estadística | Lo que hace |
| --- | --- |
| `damage` | Daño fijo por golpe |
| `damage_range` | Variación aleatoria sumada a `damage` |
| `attack_speed` | Rapidez con la que salen los ataques |
| `accuracy` | Probabilidad de acertar el golpe |
| `critical_chance` | Probabilidad de golpe crítico |
| `critical_damage_multiplier` | Multiplicador de daño crítico |
| `armor` | Reducción plana de daño |
| `range` | Alcance del ataque |
| `throwing_range` | Alcance para armas arrojadizas |
| `targets` | Cuántos objetivos puede golpear un solo ataque |
| `projectiles` | Cuántos proyectiles dispara a la vez |
| `knockback` | Cuánto empuja el golpe al objetivo |
| `recoil` | Cuánto te empuja el retroceso a *ti* |
| `skill_combat` | Nivel de habilidad en combate |
| `skill_spell` | Nivel de habilidad mágica |
| `status_chance` | Probabilidad de aplicar un efecto de estado vinculado |
| `area_of_effect` | Radio de daño en área |

## Body

| Estadística | Lo que hace |
| --- | --- |
| `health` | Vida máxima |
| `stamina` | Resistencia máxima |
| `mana` | Maná máximo |
| `speed` | Velocidad de movimiento |
| `mass`, `mass_2` | Masa física, usada para empuje y físicas |
| `size` | Tamaño de la caja de colisión (hitbox) |
| `scale` | Tamaño visual renderizado |
| `max_nutrition` | Cuánta comida puede almacenar la unidad |
| `metabolic_rate` | Con qué rapidez quema esa comida |
| `construction_speed` | Velocidad de construcción |
| `experience` | Ganancia de experiencia |

## Ciclo de vida

| Estadística | Lo que hace |
| --- | --- |
| `lifespan` | Esperanza de vida |
| `maturation` | Rapidez de maduración |
| `age_adult` | Edad a la que pasa a considerarse adulto |
| `age_breeding` | Edad a la que puede reproducirse |
| `birth_rate` | Frecuencia de nacimientos |
| `offspring` | Cuántos descendientes por camada |
| `multiplier_offspring` | Modificación porcentual de dicha cantidad |
| `mutation` | Probabilidad de mutación de subespecie |
| `happiness` | Estado de ánimo base |

## Solo para civilizaciones

Estas estadísticas no hacen absolutamente nada en un animal. El juego las marca con `used_only_for_civs`.

| Estadística | Lo que hace |
| --- | --- |
| `diplomacy` | Atributo de líder: negociación |
| `warfare` | Atributo de líder: guerra |
| `stewardship` | Atributo de líder: administración |
| `intelligence` | Atributo de líder: aprendizaje |
| `army` | Contribución al tamaño del ejército |
| `cities` | Cantidad de ciudades a la que aspira el reino |
| `bonus_towers` | Torres adicionales que la ciudad puede construir |
| `limit_population` | Techo de población |
| `limit_clan_members` | Límite de miembros del clan |
| `loyalty_traits` | Lealtad otorgada por rasgos |
| `loyalty_mood` | Lealtad otorgada por el humor |
| `opinion` | Opinión base sobre los demás |
| `multiplier_diplomacy` | Cambio porcentual en diplomacia |
| `multiplier_supply_timer` | Duración de los suministros del ejército |
| `personality_aggression` | Ponderación de personalidad oculta de la IA |
| `personality_administration` | Ponderación de personalidad oculta de la IA |
| `personality_diplomatic` | Ponderación de personalidad oculta de la IA |
| `personality_rationality` | Ponderación de personalidad oculta de la IA |

## Multipliers

Todos ellos son fracciones añadidas a 1.0, por lo que `0.25` significa +25%.

`multiplier_health` · `multiplier_lifespan` · `multiplier_stamina` · `multiplier_mana` · `multiplier_damage` · `multiplier_crit` · `multiplier_speed` · `multiplier_attack_speed` · `multiplier_mass` · `multiplier_offspring` · `multiplier_diplomacy` · `multiplier_supply_timer`

## base_stats frente a base_stats_meta

Cada rasgo contiene **dos** bloques de estadísticas, y equivocarse de bloque es el error de equilibrio más común en los mods de meta-rasgos:

| Bloque | Dónde acaba |
| --- | --- |
| `base_stats` | Se fusiona en el portador, y de ahí en **cada unidad** que pertenezca a él |
| `base_stats_meta` | Se queda en el poseedor. Leído por la cultura, clan o subespecie, jamás por una unidad |

```csharp
trait.base_stats["damage"] = 5;             // todos los miembros de esta cultura golpean más fuerte. Los granjeros también
trait.base_stats_meta["construction_speed"] = 10;   // el grupo construye más rápido. El daño de nadie cambia
```

Si una bonificación debe aplicarse solo a ciertos miembros (solo guerreros, solo adultos), ninguno de los dos bloques puede lograrlo. Usa un Postfix de Harmony en `Actor.updateStats` y fíltralo tú mismo. Consulta **[Parches de Harmony](#/nml/harmony-patches)**.

## Etiquetas: las estadísticas que no son números

Un bloque `base_stats` también incluye un conjunto de **tags**, que son etiquetas booleanas en vez de números. Se fusionan exactamente igual que las estadísticas, por lo que un rasgo puede otorgar inmunidad al fuego de la misma forma que otorga daño:

```csharp
trait.base_stats.addTag("immunity_fire");
trait.base_stats.addTag("fast_swimming");

if (actor.stats.hasTag("immunity_fire")) { }
```

Los tags que el propio juego lee:

| Grupo | Tags |
| --- | --- |
| Inmunidad | `immunity_fire` · `immunity_cold` · `building_immunity_fire` · `damaged_by_water` |
| Movimiento | `fast_swimming` · `water_creature` · `immovable` · `walk_adaptation_sand` · `walk_adaptation_snow` · `walk_adaptation_swamp` |
| Mente | `strong_mind` · `has_sapience` · `has_emotions` · `has_advanced_memory` · `has_advanced_communication` · `can_read_any_book` · `mad` · `moody` · `unconscious` · `frozen_ai` |
| Comportamiento | `ignore_fights` · `love_peace` · `steal_items` · `needs_food` · `needs_mate` · `always_idle_animation` · `stop_idle_animation` · `generate_light` |
| Dieta | `diet_meat` · `diet_meat_insect` · `diet_fish` · `diet_blood` · `diet_grass` · `diet_crops` · `diet_fruits` · `diet_flowers` · `diet_nectar` · `diet_algae` · `diet_vegetation` · `diet_wood` · `diet_minerals` · `diet_tiles` · `diet_same_species` |
| Reproducción | `reproduction_sexual` · `reproduction_asexual` · `oviparity` · `viviparity` |
| Naturaleza | `civ` · `human` · `elf` · `orc` · `dwarf` · `demon` · `undead` · `magic` · `good` · `evil` · `neutral` · `nature_creature` · `neutral_animals` · `everyone` · `small` · `sliceable` |
| Construcción | `can_build_in_biome_corruption` · `can_build_in_biome_desert` · `can_build_in_biome_infernal` · `can_build_in_biome_permafrost` · `can_build_in_biome_swamp` · `can_build_in_biome_wasteland` |

A diferencia del nombre de una estadística, un tag desconocido es inofensivo: simplemente nunca coincidirá con nada. Eso también significa que un error de escritura pasará desapercibido, así que cópialos con exactitud.

## Leer los valores en tiempo real de una unidad

`base_stats` es la *receta*. `stats` en un `Actor` vivo es el *resultado*, una vez que todo ha sido sumado:

```csharp
float finalDamage = actor.stats["damage"];
```

Eso es también lo que ajustas desde un Postfix de Harmony en `Actor.updateStats` - ver **[Parches de Harmony](#/nml/harmony-patches)**.

## Añadir tu propia estadística

Puedes registrar un nuevo `BaseStatAsset` en `AssetManager.base_stats_library`, y aparecerá en el inspector y se sumará como cualquier otro. Lo que **no** hará es surtir efecto por sí solo: nada en el juego lee una estadística que no conoce de antemano. Una estadística personalizada solo es útil como un número que tú mismo lees después, desde tu propio parche de Harmony o comportamiento.

Casi siempre la respuesta es "usa una estadística existente", y la segunda es "mantén tu propio diccionario".
