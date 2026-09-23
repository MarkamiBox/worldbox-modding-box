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

- **Columna izquierda**: es el tipo de dato. `int` significa un número entero, por lo que `rate_birth = 0.5f` no compilará. `float` toma decimales con sufijo `f`, como `0.5f`. `string` toma texto entre comillas.
- **El `= valor`**: es el valor predeterminado que el juego ya asigna.
- **"inherited from"**: significa que el campo proviene de una clase padre.
- **La cadena superior**: (p. ej. `ActorTrait -> BaseTrait -> BaseAugmentationAsset -> Asset`) muestra la jerarquía de herencia.

> [!WARNING] Los campos no lo dicen todo
> Esta herramienta te indica que un campo **existe** y qué tipo tiene. No garantiza que el juego lo procese en tu caso específico. En caso de duda, revisa **[Leer el código del juego](#/toolbox/reading-the-game-code)**.
