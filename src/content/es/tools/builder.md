---
title: Constructor de contenido
group: Herramientas de modding
icon: :wbhammer:
order: 405
---

# Constructor de contenido :wbhammer:

Elige lo que quieres crear, rellena las casillas y te llevas todo: el archivo de código, el texto para tu archivo de `Locales` y dónde va exactamente tu arte. Escribe el mismo código que enseñan las páginas de la guía, incluidos los pasos que todo el mundo olvida, como los pools, los campos de post-init y las claves de texto que no coinciden con el id.

::tool:builder::

## Cómo usar lo que te da

1. **El código** va en la carpeta `Code/` de tu mod, en un archivo con el nombre que aparece encima del bloque.
2. **El texto** va en `Locales/<idioma>.json`. Si ya tienes ese archivo, copia solo las líneas de dentro de las `{ }` y cuidado con las comas.
3. **El arte** va exactamente donde dice la lista. Lee la palabra junto a cada uno: **carpeta** significa una carpeta de PNG, aunque solo tengas un fotograma. Un PNG suelto donde va una carpeta es la razón número uno de que el arte no aparezca :wbfacepalm:.
4. **La línea de Main.cs** va dentro de `OnModLoad()`. El orden importa: un rasgo que va en tu propia pestaña necesita la pestaña primero, y un objeto que cuesta tu propio recurso necesita el recurso primero.

Arranca el juego y mira el registro. Si algo falla, el enlace **Explicación completa** debajo del selector te lleva a la página que explica ese contenido en detalle.

> [!TIP] Cambia los valores por defecto
> Todos los ids del constructor empiezan por `my_`. Cámbialo por algo tuyo, como `hello_` en HelloBox. Dos mods que añaden los dos un `my_trait` se pelean por él, y solo gana uno :PESgn_Stop:.

## Lo que no hace

El constructor te da contenido que **funciona**. Lo que no puede hacer es inventar tu idea por ti. Donde una función necesita tu propia lógica, como un rasgo que hace algo especial o un poder que hace algo nuevo, deja un hueco bien marcado `// your code here`. La página detrás del enlace **Explicación completa** muestra lo que puedes poner ahí.
