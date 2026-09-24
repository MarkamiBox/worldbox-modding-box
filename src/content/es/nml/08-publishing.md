---
title: Publicar tu mod
group: NML Modding
subgroup: Avanzado y publicación
icon: :wbfireworks:
order: 46
---

# Publicar tu mod :wbfireworks:

Tu mod funciona. Ahora deja que los demás lo rompan.

Hay dos sitios donde puede vivir un mod de WorldBox, y no se usan por igual:

| | |
| --- | --- |
| **[GameBanana](https://gamebanana.com/games/11196)** | Donde realmente se mueve la comunidad de modding de WorldBox. Cualquiera puede descargar de allí, incluidos los jugadores que compraron el juego fuera de Steam |
| **Steam Workshop** | Integrado en NML, pero con muchos menos mods |

Publica en GameBanana. Luego duplícalo en la Workshop si te apetece.

## Empaquetar el mod

Una subida a GameBanana es un **zip de la carpeta de tu mod**, nada más. La carpeta dentro del zip debe ser la que contiene `mod.json`:

```text HelloBox.zip
HelloBox/
├── mod.json
├── icon.png
├── default_config.json
├── Locales/
├── GameResources/
└── Code/
```

No un zip del *contenido*. Un zip de la *carpeta*. Alguien que descomprima en su carpeta `Mods/` debería terminar con `Mods/HelloBox/mod.json`. Si termina con `Mods/mod.json`, publicará que tu mod no carga :PES_Facepalm:.

**Deja fuera** todo lo que no sea necesario para ejecutar el mod: `.git/`, `bin/`, `obj/`, `.vs/`, tu `.sln`, tus notas. Si distribuyes una `.dll` precompilada, distribúyela *en lugar de* `Code/`, no junto a una copia obsoleta del código fuente.

## Subir a GameBanana

1. Crea una cuenta y ve a la **[página del juego WorldBox](https://gamebanana.com/games/11196)**.
2. **Add → Mod**.
3. Completa nombre, descripción y categoría. La categoría importa más de lo que crees: es como la gente te encuentra.
4. Sube el zip y al menos una captura de pantalla **del mod haciendo algo en el juego**. No tu icono, no la lista de mods.
5. En la descripción, explica claramente: qué añade, que requiere **NeoModLoader** y con qué mods entra en conflicto.

Actualizar más tarde es en la misma página con **Edit → Files**. Añade el nuevo zip, escribe una línea de cambios y sube la `version` en `mod.json` para que coincida. Mantener sincronizadas la versión de GameBanana y la de `mod.json` no cuesta nada y evita preguntas sobre qué versión se tiene instalada.

> [!TIP] Una captura vale más que un párrafo
> La gente decide por la miniatura. Una sola captura clara en el juego mostrando lo que añade tu mod hará más por ti que la mejor descripción escrita :PES_Camera:.

## La ruta de Steam Workshop

Subir a la Workshop se hace **dentro del juego**, y la forma de abrir la ventana de subida es la pieza de interfaz más maldita de todo este mundillo :kekw:.

1. Abre la ventana de **Mods** en el juego.
2. Haz clic en el **icono** de tu mod exactamente **ocho veces**, con menos de un segundo entre clics.
3. Espera unos tres segundos.
4. Aparecerá la ventana de subida.

Si no pasa nada, hiciste clic demasiado despacio o hiciste clic en la fila en lugar del icono.

La nueva ventana de lista de mods de NML también incluye botones rápidos en los mods seleccionados para abrir su carpeta en disco, activarlos o recargar código, pero el rito de los ocho clics en el icono sigue siendo la forma de invocar el cargador de Steam :PES2_Shrug:.

| Campo | Qué poner |
| --- | --- |
| Campo superior (`fileID`) | **Déjalo vacío** la primera vez. Para actualizaciones, pega el id de la URL de tu elemento de workshop |
| Campo inferior | El registro de cambios. Puede estar vacío y editarse luego en la página de workshop |

Esa es toda la diferencia entre publicar y actualizar: un `fileID` vacío crea un elemento nuevo; uno lleno reemplaza uno existente.

### Autenticación, la primera vez

Subir un mod nuevo a la Workshop te pide autenticarte. Hay tres formas:

- **Discord**: consigue el rol `Modder` en el Discord oficial de WorldBox pidiéndoselo a un admin.
- **GitHub**: únete a la organización `WorldBoxOpenMods`. Envíales un correo con el asunto "WorldBoxOpenMods", tu usuario de GitHub y tu mod, y espera hasta una semana.
- **Saltártelo**: tu mod se subirá con la etiqueta `Unverified Mods`. Funciona igual, solo tiene menos visibilidad.

## Antes de pulsar subir, en cualquiera de los sitios

- **`mod.json` es tu escaparate.** `name`, `author`, `version`, `description` son lo que la gente lee. Incrementa la `version` en cada entrega y **nunca cambies tu `GUID`** después de la primera subida: es la identidad de tu mod, el archivo de configuración del jugador lleva su nombre y otros mods pueden depender de él.
- **`icon.png` existe y se ve bien.** En la Workshop es además la imagen en la que hay que hacer clic ocho veces, así que al menos hazla agradable.
- **Tu mod debe funcionar en cualquier carpeta.** Nunca pongas rutas fijas como `C:\Users\TuNombre\...`. Usa `GetDeclaration().FolderPath`. Esta es la razón más común por la que un mod funciona para su autor y para nadie más :PES2_Bruh:.
- **Revisa tu propio log limpio al menos una vez.** Abre el juego, carga un mundo, juega dos minutos, busca en `Player.log` tu prefijo y busca `Exception`. No publiques con ninguna de ellas.
- **Prueba habiendo borrado tu archivo de ajustes.** Borra `mods_config/<GUID>.config` para probar los valores por defecto que recibe un jugador nuevo.
- **Prueba con otros mods activados.** Si parcheas algo, alguien más también lo estará parcheando.
- **Prueba en una partida limpia.** Los assets que registras deben existir antes de que cargue una partida guardada que haga referencia a ellos.

## Dependencies

Si tu mod necesita otro, decláralo en lugar de estrellarte por un tipo inexistente:

```json mod.json
{
  "Dependencies": ["com.otherperson.coolmod"],
  "OptionalDependencies": ["com.someone.niceextra"],
  "IncompatibleWith": ["com.someone.rivalmod"]
}
```

NML gestiona el orden de carga y avisa al jugador, lo cual es mucho más amable que una referencia nula en la línea uno.

## Después del lanzamiento

Los comentarios contendrán exactamente tres tipos de mensajes: "no funciona" sin ningún log adjunto, una idea realmente brillante que no se te había ocurrido y alguien pidiendo multijugador :PESgn_DidIAsk:.

Responde al segundo. Para el primero, fija un mensaje indicando dónde está `Player.log` (mira **[Registros y depuración](#/nml/logs-and-debugging)**), porque un reporte de error sin log es un reporte sobre el que no puedes hacer nada.

Y bienvenido. Cada mod nuevo hace que esta pequeña comunidad sea un poco menos cementerio, y cinco en una semana son la edad de oro del modding :PES5_CrazyPog:.
