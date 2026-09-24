---
title: Explorador de campos de asset
group: Herramientas de modding
icon: :wbwise:
order: 430
---

# Explorador de campos de asset :wbwise:

Cada asset que puedes crear tiene un conjunto fijo de campos. Un campo que no existe produce un error de compilación o una línea que silenciosamente no hace nada. Esta es la lista real, extraída directamente del juego descompilado.

Elige el tipo de asset, filtra y haz clic en un nombre para copiarlo.

::tool:fields::

## Cómo interpretarlo

- **La columna izquierda** es el tipo. `int` significa un número entero, así que `rate_birth = 0.5f` no compila. `float` admite decimales y pide el sufijo `f`, como `0.5f`. `string` admite texto entre comillas.
- **El `= value`** es el valor por defecto que el juego ya da a ese campo. Si el valor por defecto te sirve, no lo pongas. Menos código, menos erratas.
- **"inherited from"** significa que el campo viene de una clase padre. Funciona exactamente igual; solo está declarado más arriba. `id`, `base_stats` y `path_icon` suelen ser heredados.
- **La cadena encima de la tabla** (por ejemplo `ActorTrait -> BaseTrait -> BaseAugmentationAsset -> Asset`) indica de dónde vienen los campos, del más específico al más general.

> [!WARNING] Los campos no lo son todo
> Esta herramienta te dice que un campo **existe** y de qué tipo es. No te dice si el juego de verdad lo lee en tu caso: algunos campos solo importan en unidades civilizadas, o solo cuando otro ajuste está activado. Ante la duda, busca un asset vanilla que haga lo que quieres y copia sus valores, mira **[Leer el código del juego](#/toolbox/reading-the-game-code)**.
