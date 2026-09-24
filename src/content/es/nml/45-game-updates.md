---
title: Actualizar tras una actualización del juego
group: NML Modding
subgroup: Avanzado y publicación
icon: :wbsettingsgear:
order: 47
---

# Actualizar tras una actualización del juego :wbsettingsgear:

WorldBox se ha actualizado y tu mod sale en rojo en la lista. Bienvenido al modding, esto le pasa a todo el mundo y volverá a pasar :PES2_Shrug:.

Tu mod llama al código del propio juego. Cuando los desarrolladores renombran un método, mueven un campo o cambian lo que recibe un método, tu código apunta a algo que ya no existe. No está roto sin remedio, solo está desactualizado. Esta página es el orden en que lo reviso, cada vez.

## 1. Actualiza NML primero

Antes de tocar tu propio código, descarga el **`NeoModLoader.dll`** más reciente desde la página **[Instalar NML](#/install-nml)**. Una actualización grande del juego suele traer también un NML nuevo, y un cargador viejo en un juego nuevo falla de maneras que parecen exactamente culpa tuya.

Si NML ni siquiera carga, todavía no has llegado a tu mod. Mira **[el juego está en una versión antigua](#/troubleshooting)** en solución de problemas y luego vuelve.

## 2. Lee el primer error

Arranca el juego y abre `Player.log` (dónde está: **[Registros y depuración](#/nml/logs-and-debugging)**). Busca el primer error de tu mod e ignora todo lo que haya debajo por ahora. Los errores se encadenan, y arreglar el primero muchas veces hace desaparecer otros cinco.

Después de una actualización verás sobre todo estos:

| Error | Qué cambió en el juego |
| --- | --- |
| `CS0117: 'X' does not contain a definition for 'Y'` | Se renombró o eliminó un campo o un método estático |
| `CS1061: 'X' does not contain a definition for 'Y'` | Lo mismo, pero en un objeto: `actor.someMethod()` ya no existe |
| `CS0246: The type or namespace name 'X' could not be found` | Una clase entera cambió de nombre o de sitio |
| `CS7036` / `CS1501` | El método sigue existiendo, pero ahora recibe otros argumentos |
| `CS0122: 'X' is inaccessible due to its protection level` | Algo que usabas ahora es `internal`, mira **[esa entrada](#/troubleshooting)** |
| `CS0029` / `CS0266` | Un campo cambió de tipo, por ejemplo de `int` a `float` o de un texto a un asset |
| `HarmonyException` / `MissingMethodException` al arrancar | Se renombró un método que **parcheas**. Tu código compila, pero el parche no tiene dónde engancharse |

El último es el traicionero. Un parche que nombra su método con un texto normal, como `"updateStats"`, solo se comprueba al arrancar el juego. Así que un cambio de nombre no impide que tu mod compile, impide que funcione. Los parches escritos con `nameof` dan un error de compilación normal, otra razón para usarlo donde puedas (**[dos formas de escribir el nombre del método](#/nml/harmony-patches)**).

## 3. Encuentra el nombre nuevo

El nombre viejo ya no está, así que busca su sustituto:

- **[Búsqueda de métodos](#/tools/methods)** en este sitio. Escribe lo que *hacía* el método, no cómo se llamaba: "add trait to unit" lo encuentra aunque el nombre haya cambiado.
- **[Campos de assets](#/tools/fields)** para los campos de los assets. Busca la parte del nombre que recuerdes.
- **dnSpy**, que siempre tiene razón, porque lee el juego que tienes de verdad. Las herramientas de búsqueda de aquí se regeneran tras las actualizaciones, pero pueden ir unos días por detrás de una recién salida. Cómo usarlo: **[Leer el código del juego](#/toolbox/reading-the-game-code)**.

El truco que más uso: abre el asset o el método vanilla que hace lo mismo que el tuyo y mira cómo lo escribe **el propio juego** ahora. Si el juego cambió la forma de crear rasgos, sus propios rasgos ya usan la forma nueva :PESgn_Noice:.

## 4. Revisa tus parches de Harmony a mano

Un parche también puede fallar sin ningún error. Repásalos uno por uno y comprueba el método en dnSpy:

- **Nombres de parámetros.** Harmony rellena los parámetros **por nombre**. Si el juego renombró `pDamage` a `pAmount`, tu `float pDamage` no recibe nada, sin avisar. Mira **[los nombres de parámetro mágicos](#/nml/harmony-patches)**.
- **Sobrecargas.** Un método que antes era único puede tener ahora un gemelo, y tu parche falla con `Ambiguous match found`.
- **Lo que hace el método.** A veces el nombre se queda pero la lógica se va a otro sitio. Tu parche se ejecuta y no cambia nada. Pon una línea `LogInfo` en el parche: si nunca aparece, el juego ya no llama a ese método.

## 5. Busca cosas que dejaron de hacer algo

Volver a compilar no es la meta. Carga un mundo y comprueba que cada pieza sigue funcionando: el rasgo muestra su icono, el objeto cae, el poder genera lo que debe.

Una actualización puede añadir un campo que los assets vanilla ahora rellenan y los tuyos no. El asset carga, sin errores, y simplemente no hace nada. Compara tu asset campo por campo con el vanilla más parecido en el `init()` de su librería. Lo que el juego ahora pone y tú no es tu sospechoso.

## 6. Prueba también una partida vieja

Carga un mundo guardado **antes** de la actualización, con tu mod activado. Los datos propios guardados en unidades (**[Guardar datos](#/nml/saving-data)**) deberían volver tal como estaban. Si renombraste un id mientras arreglabas cosas, las partidas viejas siguen usando el id viejo, así que renombra solo si de verdad hace falta.

## 7. Publícalo

- Sube `version` en `mod.json`.
- Di con qué versión del juego funciona en la descripción y en el registro de cambios, para que los jugadores sepan cuál coger.
- Sube el zip nuevo igual que antes: **[Publicar](#/nml/publishing)**.

Luego responde a los comentarios de "¿¿está actualizado??", te lo has ganado :wbsalut:.

## Para que la próxima actualización duela menos

- **Parchea menos.** Cada parche de Harmony es un punto que se puede romper. Si un campo de asset o una función de NML puede hacer el trabajo, usa eso.
- **Envuelve tu código en try/catch.** Una función rota escribe un error en el registro y el resto de tu mod sigue funcionando. Mira **[Registros y depuración](#/nml/logs-and-debugging)**.
- **Una clase de parches por tarea.** Cuando un parche se rompe, solo cae esa función, no todas.
- **Guarda tus ids en un solo sitio.** Constantes como `HelloTraits.SWIFT` hacen que renombrar sea un cambio, no veinte.
