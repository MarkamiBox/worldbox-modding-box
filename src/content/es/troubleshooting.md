---
title: Solución de problemas
group: Resumen
icon: :wbfractured:
order: 4
---

# Solución de problemas :wbfractured:

Encuentra tu síntoma en la tabla, haz clic, lee tres líneas. Esa es toda la página :aPES2_ThumbsUp:.

> [!TIP] El registro responde la mayoría de dudas más rápido que yo
> Nueve de cada diez veces la respuesta ya está en `Player.log`. **[Registros y depuración](#/nml/logs-and-debugging)** te enseña dónde encontrarlo y cómo leer un fallo.

## Encuentra tu síntoma

**Usar mods (no crearlos)**

| Síntoma | |
| --- | --- |
| Inundación de texto rojo, `Missing className: NeoModLoader (1).WorldBoxMod` | [saltar](#inundación-de-texto-rojo-missing-classname) |
| NML funcionaba, el juego se actualizó, ahora los mods están en rojo o "failed" | [saltar](#los-mods-están-en-rojo-o-failed-tras-una-actualización-del-juego) |
| El juego está en una versión antigua y NML no carga | [saltar](#el-juego-está-en-una-versión-antigua) |
| El juego se volvió lento o se congela con los mods activos | [saltar](#el-juego-se-volvió-lento-o-se-congela-con-los-mods-activos) |
| Un mundo ya no carga | [saltar](#un-mundo-ya-no-carga) |
| Un mod de BepInEx está instalado y no muestra nada | [saltar](#un-mod-de-bepinex-está-instalado-y-no-muestra-nada) |
| Borraste un mod y todavía sigue ahí | [saltar](#borraste-un-mod-y-todavía-sigue-ahí) |
| El juego no arranca en absoluto | [saltar](#el-juego-no-arranca-en-absoluto) |

**No se carga nada**

| Síntoma | |
| --- | --- |
| Sin botón de Mods en el menú | [ir](#sin-botón-de-mods-en-el-menú) |
| Ventana de Mods vacía, antes funcionaba | [ir](#ventana-de-mods-vacía-antes-funcionaba) |
| La carpeta del mod está ahí, pero no aparece en la lista | [ir](#la-carpeta-del-mod-está-ahí-pero-no-aparece-en-la-lista) |
| El mod aparece en gris | [ir](#el-mod-aparece-en-gris) |
| "Compile failed" y el error no tiene sentido | [ir](#compile-failed-y-el-error-no-tiene-sentido) |
| Error en la línea 1 de un archivo recién pegado | [ir](#error-en-la-línea-1-de-un-archivo-recién-pegado) |
| Modificaste el código y no cambió nada | [ir](#modificaste-el-código-y-no-cambió-nada) |
| El Bloc de notas no guarda en la carpeta del juego | [ir](#el-bloc-de-notas-no-guarda-en-la-carpeta-del-juego) |
| Tus cambios nunca aparecen, ni después de reiniciar | [ir](#tus-cambios-nunca-aparecen-ni-después-de-reiniciar) |

**Carga, pero no aparece nada**

| Síntoma | |
| --- | --- |
| Bloqueo en la línea donde asignas una estadística | [ir](#bloqueo-en-la-línea-donde-asignas-una-estadística) |
| El mismo bloqueo, y el orden ya es el correcto | [ir](#el-mismo-bloqueo-y-el-orden-ya-es-el-correcto) |
| Tu edificio muere instantáneamente o no tiene tamaño | [ir](#tu-edificio-muere-instantáneamente-o-no-tiene-tamaño) |
| Registrado, pero no aparece en ninguna pestaña | [ir](#registrado-pero-no-aparece-en-ninguna-pestaña) |
| Muestra `trait_hello_swift` en vez de un nombre | [ir](#muestra-trait-hello-swift-en-vez-de-un-nombre) |
| Los nombres funcionan para rasgos pero no para objetos, estados o poderes | [ir](#los-nombres-funcionan-para-rasgos-pero-no-para-objetos-estados-o-poderes) |
| El icono es un hueco en blanco | [ir](#el-icono-es-un-hueco-en-blanco) |
| Un botón ocupa espacio y no dibuja nada | [ir](#un-botón-ocupa-espacio-y-no-dibuja-nada) |
| El efecto de estado no dibuja ningún sprite en la unidad | [ir](#el-efecto-de-estado-no-dibuja-ningún-sprite-en-la-unidad) |
| Botones apilados uno encima de otro | [ir](#botones-apilados-uno-encima-de-otro) |
| El botón está ahí, hacer clic no activa nada | [ir](#el-botón-está-ahí-hacer-clic-no-activa-nada) |
| `addOpposite` / `addDecision` / `addSpell` no hacen nada | [ir](#addopposite-adddecision-addspell-no-hacen-nada) |

**Registrado, luego roto en el mundo**

| Síntoma | |
| --- | --- |
| Tu criatura da un error de sombra | [ir](#tu-criatura-da-un-error-de-sombra) |
| Tu rasgo, objeto o criatura sigue bloqueado | [ir](#tu-rasgo-objeto-o-criatura-sigue-bloqueado) |
| El juego se cae al cargar tu arma o tu comida | [ir](#el-juego-se-cae-al-cargar-tu-arma-o-tu-comida) |
| Una nube revienta en cuanto aparece | [ir](#una-nube-revienta-en-cuanto-aparece) |
| Colocar tu edificio lanza Index was out of range | [ir](#colocar-tu-edificio-lanza-index-was-out-of-range) |
| Tu edificio lanza errores en cada frame en que se ve | [ir](#tu-edificio-lanza-errores-en-cada-frame-en-que-se-ve) |
| El minimapa lanza errores en cuanto existe tu edificio | [ir](#el-minimapa-lanza-errores-en-cuanto-existe-tu-edificio) |
| Tu tile se pinta y luego el renderizador del mapa revienta | [ir](#tu-tile-se-pinta-y-luego-el-renderizador-del-mapa-revienta) |
| Hacer aparecer un animal en tu tile revienta | [ir](#hacer-aparecer-un-animal-en-tu-tile-revienta) |
| Los drops caen invisibles, o un proyectil revienta | [ir](#los-drops-caen-invisibles-o-un-proyectil-revienta) |
| El log se llena de ArgumentNullException de proyectiles | [ir](#el-log-se-llena-de-argumentnullexception-de-proyectiles) |
| Tu pestaña de poderes nunca aparece | [ir](#tu-pestaña-de-poderes-nunca-aparece) |
| La ventana de ajustes muestra ids en crudo | [ir](#la-ventana-de-ajustes-muestra-ids-en-crudo) |
| El mundo lanza errores en cada frame tras añadir un comportamiento del mundo | [ir](#el-mundo-lanza-errores-en-cada-frame-tras-añadir-un-comportamiento-del-mundo) |
| Un desastre se bloquea al escribir en el registro del mundo | [ir](#un-desastre-se-bloquea-al-escribir-en-el-registro-del-mundo) |
| Un desastre sin action se bloquea cuando es seleccionado | [ir](#un-desastre-sin-action-se-bloquea-cuando-es-seleccionado) |
| El primer gobernante que evalúa tu complot lanza un error | [ir](#el-primer-gobernante-que-evalúa-tu-complot-lanza-un-error) |
| Tu decisión, complot, gen o arma existe y nada lo usa jamás | [ir](#tu-decisión-complot-gen-o-arma-existe-y-nada-lo-usa-jamás) |

**Compila para ti, pero no para otros**

| Síntoma | |
| --- | --- |
| `CS0122: inaccessible due to its protection level` | [ir](#cs0122-inaccessible-due-to-its-protection-level) |
| Funciona en tu ordenador, no hace nada en el suyo | [ir](#funciona-en-tu-ordenador-no-hace-nada-en-el-suyo) |

**Funciona al principio, se rompe más adelante**

| Síntoma | |
| --- | --- |
| Otro mod reemplaza silenciosamente tu contenido | [ir](#otro-mod-reemplaza-silenciosamente-tu-contenido) |
| Bloqueo en `World.world` mientras se carga el mod | [ir](#bloqueo-en-world-world-mientras-se-carga-el-mod) |
| Tus datos empiezan a controlar las criaturas equivocadas | [ir](#tus-datos-empiezan-a-controlar-las-criaturas-equivocadas) |
| Todo desaparece tras guardar y cargar partida | [ir](#todo-desaparece-tras-guardar-y-cargar-partida) |
| Las unidades se congelan en grupos | [ir](#las-unidades-se-congelan-en-grupos) |
| La mitad de tus parches de Harmony nunca se aplicaron | [ir](#la-mitad-de-tus-parches-de-harmony-nunca-se-aplicaron) |
| Tu parche de `updateStats` falla a otros jugadores | [ir](#tu-parche-de-updatestats-falla-a-otros-jugadores) |
| Parcheaste `getHit` y los edificios siguen recibiendo daño | [ir](#parcheaste-gethit-y-los-edificios-siguen-recibiendo-daño) |
| Tu Prefix rompió otros tres mods | [ir](#tu-prefix-rompió-otros-tres-mods) |
| Una unidad se queda quieta para siempre o falla en cada fotograma | [ir](#una-unidad-se-queda-quieta-para-siempre-o-falla-en-cada-fotograma) |
| Tu control de IA personalizada se revierte silenciosamente | [ir](#tu-control-de-ia-personalizada-se-revierte-silenciosamente) |
| El juego da tirones cuatro veces por segundo | [ir](#el-juego-da-tirones-cuatro-veces-por-segundo) |
| Los clics caen en el mapa detrás de tu ventana | [ir](#los-clics-caen-en-el-mapa-detrás-de-tu-ventana) |
| La memoria aumenta cada vez que se abre el panel | [ir](#la-memoria-aumenta-cada-vez-que-se-abre-el-panel) |
| Un nuevo valor por defecto nunca llega a los jugadores existentes | [ir](#un-nuevo-valor-por-defecto-nunca-llega-a-los-jugadores-existentes) |
| El deslizador de ajustes se mueve pero tu callback nunca se ejecuta | [ir](#el-deslizador-de-ajustes-se-mueve-pero-tu-callback-nunca-se-ejecuta) |

## Usar mods

Este grupo es para personas que juegan con mods, no para quienes los crean. Todo lo que sigue asume que eres tú quien escribe el código.

### Inundación de texto rojo, missing className

- **Qué ves**: Texto rojo desplazándose sobre el juego, `previous errors repeated`, `YOU SHOULD RESTART THE GAME`, y en el registro `Missing className: NeoModLoader (1).WorldBoxMod`.
- **Por qué ocurre**: El archivo no se llama `NeoModLoader.dll`. Un navegador que lo descarga por segunda vez añade ` (1)`, y NML lee su propio nombre de archivo.
- **Solución**: Cierra el juego, elimina cualquier copia anterior, renombra el archivo a exactamente `NeoModLoader.dll` y vuelve a empezar. Guía paso a paso en **[Instalar NML](#/install-nml)**.

### Los mods están en rojo o failed tras una actualización del juego

- **Qué ves**: La lista de mods muestra un mod en rojo, "failed", `current failed, will load`, o `<Mod> has been disabled due to an error`. Antes de la actualización funcionaba.
- **Por qué ocurre**: Los mods llaman al código del juego. Cuando WorldBox cambia ese código, un mod creado para la versión antigua deja de compilar. NML no es el problema, solo es el mensajero.
- **Solución**: Busca una versión más reciente del mod (en GameBanana, ordena por **Updated**). Si no hay una versión más nueva, espera al autor o juega en la versión antigua del juego, consulta **[las FAQ](#/install-nml)**. No guardes dos versiones del mismo mod en `Mods` "por si acaso": entrarán en conflicto.

### El juego está en una versión antigua

- **Qué ves**: NML nunca carga, o el registro muestra `MissingFieldException: Field not found: bool .Config.gameLoaded`. El número de versión en el menú principal es más antiguo que el que comentan todos.
- **Por qué ocurre**: El juego está en una **rama beta** de Steam, normalmente una elegida hace tiempo para probar una actualización antes, y el NML que descargaste está hecho para la versión actual.
- **Solución**: Steam → clic derecho en WorldBox → **Propiedades → Betas** → **Ninguna**. Deja que Steam se actualice y vuelve a activar el modo experimental :PES2_Shrug:.

### El juego se volvió lento o se congela con los mods activos

- **Qué ves**: FPS bajos, tirones o el mundo congelado mientras los botones siguen respondiendo. Sin mods funciona bien.
- **Por qué ocurre**: Casi siempre se debe a un mod que hace cálculos pesados en cada tick, generalmente un mod grande de contenido. Dos mods que modifican lo mismo también pueden bloquearse entre sí.
- **Solución**: Desactiva la mitad de tus mods, reinicia y prueba. Si sigue roto: el culpable está en la mitad activa. Sigue dividiendo por la mitad hasta que solo quede uno. Desactivar es suficiente, no hace falta borrar. Lee la descripción de ese mod para conocer incompatibilidades y nunca ejecutes dos versiones de un mismo mod (una completa y una "lite") juntas.

### Un mundo ya no carga

- **Qué ves**: La partida abre un mundo diferente, se detiene durante la carga o lanza `NullReferenceException` al guardar o cargar.
- **Por qué ocurre**: El mundo contiene criaturas, edificios o rasgos de un mod que ahora está desactivado, eliminado o desactualizado. El juego encuentra identificadores que desconoce.
- **Solución**: Vuelve a activar ese mod (o regresa a la versión con la que se guardó la partida), carga el mundo y elimina el contenido modificado dentro del juego antes de quitar el mod. Guarda una copia de los mundos que te importen antes de probar un mod de contenido nuevo :PES_MonkaSweat:.

### Un mod de BepInEx está instalado y no muestra nada

- **Qué ves**: El mod está en `BepInEx/plugins`, no aparece nada en el juego y no se genera ningún archivo de configuración propio en `BepInEx/config`.
- **Por qué ocurre**: O bien el archivo zip se soltó en `plugins` como un zip, o el objeto gestor de BepInEx está siendo destruido por el juego, algo para lo que algunos equipos necesitan un ajuste.
- **Solución**: Coloca la **carpeta interior** del zip en `BepInEx/plugins`, no el archivo zip. Luego abre `BepInEx/config/BepInEx.cfg`, busca `HideManagerGameObject = false`, cámbialo a `true`, guarda y reinicia. Configuración de BepInEx: **[La consola en vivo](#/toolbox/bepinex-console)**.

### Borraste un mod y todavía sigue ahí

- **Qué ves**: La carpeta ya no está en `Mods`, pero el mod se sigue cargando.
- **Por qué ocurre**: Estabas suscrito en Steam Workshop, y los mods de Workshop viven en la carpeta de Steam, no en la tuya.
- **Solución**: Cancela la suscripción en su página de Workshop. Desmarcarlo no es lo mismo.

### El juego no arranca en absoluto

- **Qué ves**: WorldBox se cierra o se cuelga antes del menú principal, incluso tras quitar tus mods.
- **Por qué ocurre**: Un archivo del propio juego se dañó, a menudo por copiar algo en la carpeta incorrecta.
- **Solución**: Steam → clic derecho en WorldBox → **Propiedades → Archivos instalados → Verificar integridad de los archivos del juego**. Luego vuelve a colocar NML y tus mods de uno en uno.

---

## No se carga nada

El juego se comporta como si tu mod no existiera. No es nada personal, normalmente es un interruptor o el nombre de un archivo.

### Sin botón de Mods en el menú

- **Qué ves**: El juego arranca bien, sin errores, sin botón de Mods y sin ninguna línea `[NML]` en el registro.
- **Por qué**: Hay dos carpetas llamadas "Mods". La DLL del cargador va en la carpeta de datos del juego; `worldbox\Mods/` es para *tus* mods.
- **Solución**: Pon `NeoModLoader.dll` en `worldbox\worldbox_Data\StreamingAssets\mods/`, reinicia y busca `[NML]: NeoModLoader Version:` en el registro. Cada clic, Mac incluido: **[Instalar NML](#/install-nml)**.

### Ventana de Mods vacía, antes funcionaba

- **Qué ves**: La ventana se abre vacía. Sin errores.
- **Por qué**: El **Modo Experimental está desactivado**, y el juego lo desactiva automáticamente tras cada actualización de WorldBox.
- **Solución**: Ajustes → Modo Experimental → activado → reiniciar. Revisa esto primero siempre que "ayer funcionaba y no cambié nada".

### La carpeta del mod está ahí, pero no aparece en la lista

- **Qué ves**: Nada en la lista, ninguna línea `Compile Mod <yours>`.
- **Por qué**: Por orden de frecuencia: el archivo en realidad se llama `mod.json.txt`; el JSON no es válido (una coma después de la última entrada, o comillas `"` tipográficas pegadas desde una app de chat); la carpeta no está dentro de `worldbox\Mods/`.
- **Solución**: Explorador → **Vista → Mostrar → Extensiones de nombre de archivo**, y luego comprueba el nombre real. Abre `mod.json` en VS Code, que te subraya los errores de JSON.

### El mod aparece en gris

- **Qué ves**: Aparece en gris en la lista y no se ejecuta nada de tu código.
- **Por qué**: Está desactivado, y eso queda guardado en disco en `StreamingAssets\mods\NML\mod_compile_records.json`.
- **Solución**: Haz clic en el icono del mod en la ventana de Mods y reinicia.

### "Compile failed" y el error no tiene sentido

- **Qué ves**: `Code\Main.cs(9,42): error CS1002: ; expected`, seguido de una línea de resumen.
- **Por qué**: El resumen no es el error. La línea superior indica archivo, línea y columna exactos.
- **Solución**: Corrige **únicamente el primer** error, luego reinicia y revisa de nuevo: los errores se propagan en cascada.

| Código | Significado |
| --- | --- |
| `CS1002` | Falta un punto y coma `;` |
| `CS0246` | Nombre desconocido, normalmente falta un `using` |
| `CS0266` | Pasaste un decimal donde va un entero (`0.5f` en un `int`) |
| `CS0122` | El miembro es `internal`, consulta [esa sección](#cs0122-inaccessible-due-to-its-protection-level) |

### Error en la línea 1 de un archivo recién pegado

- **Qué ves**: Un error de compilación en la línea 1 que no tiene sentido.
- **Por qué**: Los bloques de código en esta guía están etiquetados con su ruta. Si seleccionas demasiado arriba, la etiqueta entra en tu archivo `.cs`.
- **Solución**: Borra la línea 1. Un archivo `.cs` empieza con `using`, un `namespace` o una clase; `mod.json` empieza con `{`.

### Modificaste el código y no cambió nada

- **Qué ves**: Mismo comportamiento anterior, sin errores.
- **Por qué**: NML compila `Code\*.cs` **una sola vez al iniciar**. El juego en ejecución nunca relee tus archivos.
- **Solución**: Guarda, cierra por completo y vuelve a abrir. Un cambio por reinicio para aislar cualquier problema.

### El Bloc de notas no guarda en la carpeta del juego

- **Qué ves**: Reinicias, el registro dice `Compile Mod`, y el juego sigue ejecutando tu código viejo. La compilación tarda una fracción de segundo.
- **Por qué**: Dos carpetas en `Mods/` tienen el mismo `GUID` en `mod.json`, normalmente una copia antigua que el instalador de NML descomprimió como `COM_YOURNAME_HELLOBOX/`. NML carga **un mod por GUID** e ignora la otra carpeta sin avisar, y puede ser justo la que estás editando.
- **Solución**: Busca tu GUID en `Mods/` y deja exactamente una carpeta. Si las cuentas no salen, esto es lo primero que hay que mirar.

### Tus cambios nunca aparecen, ni después de reiniciar

- **Qué ves**: "No tienes permiso para guardar en esta ubicación", y te ofrece Documentos en su lugar.
- **Por qué**: El juego está en `C:\Program Files (x86)/`, que Windows protege.
- **Solución**: Crea primero el archivo en el Explorador (clic derecho → Nuevo → Documento de texto, y renómbralo), y luego edita ese archivo que ya existe.

---

## Carga, pero no aparece nada

NML encontró tu mod y lo ejecutó. Algo dentro nunca llegó a la pantalla.

### Bloqueo en la línea donde asignas una estadística

- **Qué ves**: `NullReferenceException` en tu `Initialize()`, y nada posterior se ejecuta.
- **Por qué**: Un asset nuevo **no tiene bloque de estadísticas**. La librería lo crea dentro de `add()`.
- **Solución**: Primero `add()`, luego las estadísticas. Misma regla para rasgos, estados, objetos, edificios y criaturas.

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };
AssetManager.traits.add(swift);      // esto asigna base_stats
swift.base_stats["speed"] = 20f;     // seguro a partir de aquí
```

`clone()` ya llama a `add()`, por lo que tras clonar el bloque ya existe.

### El mismo bloqueo, y el orden ya es el correcto

- **Qué ves**: La misma `NullReferenceException`, en una línea de estadísticas tras `add()`.
- **Por qué**: Inventaste el nombre de una estadística. Un id desconocido genera un bloqueo inmediato.
- **Solución**: Usa identificadores reales: `damage`, `health`, `speed`, `armor`, `attack_speed`, `stamina`, `mana`, `range`, `critical_chance`, `lifespan`, `warfare`. Los multiplicadores van aparte: `multiplier_damage`, `multiplier_health`, `multiplier_speed`. Lista completa en **[Referencia de estadísticas](#/nml/stats)**.

### Tu edificio muere instantáneamente o no tiene tamaño

- **Qué ves**: El edificio aparece y desaparece al instante, o no se puede seleccionar. Sin errores.
- **Por qué**: La `health` y `size` por defecto se configuran dentro de `add()` únicamente si `base_stats` es null. Si creas el bloque manualmente antes, obtienes `health = 0`.
- **Solución**: Nunca pre-asignes `base_stats`. Clona o llama a `add()` primero y modifica solo lo necesario.

### Registrado, pero no aparece en ninguna pestaña

- **Qué ves**: La línea de registro se imprime sin excepciones, pero no aparece en ninguna categoría.
- **Por qué**: `group_id` apunta a un grupo inexistente, por lo que no hay pestaña para dibujarlo.
- **Solución**: Usa un id de grupo real. Para rasgos: `cognitive`, `mind`, `spirit`, `physique`, `health`, `body`, `appearance`, `protection`, `skills`, `merits`, `acquired`, `fun`, `fate`, `miscellaneous`, `special`. Para crear pestañas: **[Grupos y pestañas de rasgos](#/nml/trait-groups)**.

### Muestra `trait_hello_swift` en vez de un nombre

- **Qué ves**: La clave sin traducir en pantalla, tooltip vacío, `missing text:` en el registro.
- **Por qué**: No hay traducción registrada. El juego genera las claves automáticamente: `trait_<id>` y `trait_<id>_info`.
- **Solución**: Añade ambas claves en `Locales/en.json` (y `es.json`). Cuidado con guardarlo como `en.json.txt`.

### Los nombres funcionan para rasgos pero no para objetos, estados o poderes

- **Qué ves**: Copiaste el patrón de los rasgos y aquí sigue saliendo una clave en bruto.
- **Por qué**: Cuatro assets **no** construyen la clave a partir del id:

| Asset | Clave del nombre | Clave de la descripción |
| --- | --- | --- |
| `GodPower` | el **campo** `name`, en snake_case | `<name>_description` |
| `ItemAsset` | `translation_key`, si no `item_<subtype or id>` | `<id>_description`, sin `item_` |
| `StatusAsset` | el **campo** `locale_id` | el **campo** `locale_description` |
| `WorldLawAsset` | `<id>_title` | `<id>_description` |

- **Solución**: Pon `name` = id en los poderes, `translation_key` en los objetos y `locale_id` en los estados. Usa claves en minúsculas y snake_case: se normalizan al guardarlas pero **no** al buscarlas, así que `MyKey` se guarda como `my_key` y nunca se vuelve a encontrar :PESgn_SMH:.

### El icono es un hueco en blanco

- **Qué ves**: Un cuadrado vacío donde debería estar el icono. Sin error.
- **Por qué**: El rellenado automático de iconos se ejecuta antes de que exista tu mod. Y una ruta errónea devuelve `null` **que se guarda en caché toda la sesión**, por lo que arreglar la ruta sin reiniciar no tiene efecto.
- **Solución**: Configura siempre `path_icon` explícitamente, sin extensión de archivo, con barras hacia adelante (`/`), y reinicia. Verifica al cargar:

```csharp
if (SpriteTextureLoader.getSprite(swift.path_icon) == null)
    LogError("icon path is wrong: " + swift.path_icon);
```

### Un botón ocupa espacio y no dibuja nada

- **Qué ves**: Un hueco en tu pestaña donde nadie podrá hacer clic.
- **Por qué**: Un sprite `null` no es un marcador de posición, es totalmente invisible :PES4_Invisible:.
- **Solución**: Nunca pases un sprite sin comprobar: usa como alternativa `ui/Icons/iconQuestionMark`. Guía en **[Pestañas y botones de poderes](#/nml/power-buttons)**.

### El efecto de estado no dibuja ningún sprite en la unidad

- **Qué ves**: O no se dibuja nada sobre la criatura, o `NullReferenceException` en `Status.updateAnimationFrame()` en **cada frame** mientras dure el estado.
- **Por qué**: `StatusLibrary` rellena `sprite_list` desde `"effects/" + texture` y activa `need_visual_render` en una sola pasada mientras carga el juego, antes de que tu mod existiera. Y `texture` es el nombre de una **carpeta** de frames, no de un PNG.
- **Solución**: Frames en `GameResources/effects/fx_hello_status/`, y después de `add()`:

```csharp
cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
cursed.need_visual_render = true;
```

### Botones apilados uno encima de otro

- **Qué ves**: La pestaña parece vacía o hay un solo botón encima de todos los demás.
- **Por qué**: `recalc()` solo recalcula el ancho; posicionar los botones requiere una segunda llamada y omite elementos inactivos.
- **Solución**: Llama a ambos en orden tras añadir los botones: `tab.recalc();` y luego `tab.sortButtons();`. Eso sí, no durante `OnModLoad`: ahí `recalc()` revienta, mira **[Tu pestaña de poderes nunca aparece](#tu-pestaña-de-poderes-nunca-aparece)**.

### El botón está ahí, hacer clic no activa nada

- **Qué ves**: El cursor no cambia y hacer clic en el mapa no hace nada.
- **Por qué**: El botón se vincula al poder **por id en el momento de creación**.
- **Solución**: Registra el poder primero y crea el botón después en el mismo método. Y `click_action` usa `(WorldTile, string)`; la firma `(WorldTile, GodPower)` pertenece a `click_power_action`.

### `addOpposite` / `addDecision` / `addSpell` no hacen nada

- **Qué ves**: El rasgo opuesto nunca se quita, la decisión nunca se activa. Sin avisos.
- **Por qué**: Esas llamadas solo añaden un **id**. Convertir los ids en objetos reales pasa una sola vez al arrancar, antes de que cargue tu mod.
- **Solución**: Rellena tú mismo los campos resueltos después de `add()`: `linkCombatActions()`, `linkSpells()`, `decisions_assets` (un array que construyes con `AssetManager.decisions_library.get()`, no hay método de enlace) y asigna `opposite_traits` directamente. Si pones `opposite_trait_mod` y dejas `opposite_traits` en null, el juego se cuelga más tarde dentro de su código social - un `HashSet` vacío lo evita.

---

## Registrado, luego roto en el mundo

Todas las entradas de esta sección tienen la misma causa. El juego prepara alguna parte de cada asset **una sola vez, mientras carga**, y tu mod registra sus assets después. Nada te avisa: el asset existe, tiene nombre, y la primera vez que el juego lo usa de verdad, revienta. La solución también tiene siempre la misma forma: haz ese paso tú, justo después de registrar el asset :wbfacepalm:. Palabra del día: work around.

### Tu criatura da un error de sombra

- **Qué ves**: `ActorAssetLibrary: Shadow size is too small : (0.00, 0.00)`, tres veces por criatura, y un popup de error en el juego.
- **Por qué**: La librería mide el sprite de sombra de cada actor al arrancar. Una criatura añadida después nunca se mide.
- **Solución**: `asset.texture_asset.loadShadow();` después del clon. Mira **[Actores personalizados](#/nml/custom-actors)**.

### Tu rasgo, objeto o criatura sigue bloqueado

- **Qué ves**: Existe, pero el libro de conocimiento lo muestra en gris y el jugador no puede usarlo hasta que aparezca en un mundo.
- **Por qué**: `needs_to_be_explored` es `true` por defecto en todo lo que se desbloquea: actores, los siete tipos de rasgo, objetos, modificadores y leyes del mundo.
- **Solución**: `needs_to_be_explored = false` al crearlo. Mira **[Rasgos personalizados](#/nml/custom-traits)**.

### El juego se cae al cargar tu arma o tu comida

- **Qué ves**: `ArgumentNullException: Value cannot be null. Parameter name: key` en `ItemLibrary.loadSprites()` o `ResourceLibrary.loadSprites()`.
- **Por qué**: Las armas reciben `path_gameplay_sprite`, y los recursos `full_sprite_path`, derivados en `post_init()` durante la carga del propio juego. Los tuyos se quedan en `null`.
- **Solución**: Ponlos tú. Mira **[Objetos personalizados](#/nml/custom-items)** y **[Recursos y comida](#/nml/resources)**.

### Una nube revienta en cuanto aparece

- **Qué ves**: `NullReferenceException` en `Cloud.prepare()` la primera vez que aparece tu nube.
- **Por qué**: `CloudLibrary` convierte `path_sprites` en `cached_sprites` y `color_hex` en `color` en una sola pasada al arrancar.
- **Solución**: Haz las dos cosas tú después de `add()`. Mira **[Nubes y clima](#/nml/clouds)**.

### Colocar tu edificio lanza Index was out of range

- **Qué ves**: `ArgumentOutOfRangeException: Index was out of range` en `Building.setAnimData()` en cuanto se coloca uno.
- **Por qué**: Los frames de edificios se precargan para todos al arrancar. El tuyo tiene la lista de frames vacía, o su carpeta no tiene `main_0.png`.
- **Solución**: `shrine.loadBuildingSprites();` en cuanto `sprite_path` esté puesto, y frames llamados `main_0`, `construction_0`, `ruin_0`, `mini_0`. Mira **[Edificios personalizados](#/nml/custom-buildings)**.

### Tu edificio lanza errores en cada frame en que se ve

- **Qué ves**: Cientos de `NullReferenceException` en `DynamicSprites.getRecoloredBuilding()`, uno por frame mientras está en pantalla.
- **Por qué**: El atlas que pinta un edificio del color de su dueño, `atlas_asset`, se enlaza en `checkAtlasLink()` al arrancar. Un clon no lo conserva.
- **Solución**: `shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);`

### El minimapa lanza errores en cuanto existe tu edificio

- **Qué ves**: `NullReferenceException` en `Building.getColorForMinimap()` cada vez que se redibuja el minimapa.
- **Por qué**: El punto del minimapa sale de `mini_0.png` en la carpeta del edificio, y no hay ninguno.
- **Solución**: Añade `mini_0.png`, un píxel por tile que ocupa el edificio: 5x4 para cualquier cosa clonada de `temple_human`.

### Tu tile se pinta y luego el renderizador del mapa revienta

- **Qué ves**: `NullReferenceException` en `WorldTilemap.getVariation()` por cada tile tuyo en pantalla.
- **Por qué**: `TopTileLibrary` carga los PNG de `tiles/<id>/` en `sprites` al arrancar.
- **Solución**: Cárgalos tú con `addVariation()`. Mira **[Tiles y terreno](#/nml/tiles)**.

### Hacer aparecer un animal en tu tile revienta

- **Qué ves**: `NullReferenceException` en `Subspecies.generateName()`, solo en tu tile y solo con animales.
- **Por qué**: Un clon de un tile de hierba conserva `is_biome = true` pero no `biome_asset`, que se enlaza en `linkAssets()` al arrancar. Los animales añaden el bioma al nombre de la especie.
- **Solución**: `moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);`

### Los drops caen invisibles, o un proyectil revienta

- **Qué ves**: Tus drops caen sin dibujar nada, o `ArgumentOutOfRangeException` en `QuantumSpriteLibrary.drawProjectiles()`.
- **Por qué**: Drops, proyectiles, estados, edificios y recursos en mano leen su arte con `getSpriteList()`, que devuelve los frames *dentro* de una carpeta. Un PNG suelto vuelve como lista vacía.
- **Solución**: Una carpeta por animación, aunque tenga un solo frame: `drops/hello_ember/hello_ember_0.png`. Mira **[Sprites y recursos](#/nml/sprites-and-resources)**.

### El log se llena de ArgumentNullException de proyectiles

- **Qué ves**: Miles de `ArgumentNullException: Value cannot be null` en `ProjectileManager.updateProjectiles()` mientras un proyectil está en el aire.
- **Por qué**: Un proyectil sin tirador no tiene reino, y el gestor usa el reino como clave de diccionario en cada frame.
- **Solución**: Dale uno: `pForcedKingdom: World.world.kingdoms_wild.get("nature")`, el dueño neutral del propio juego.

### Tu pestaña de poderes nunca aparece

- **Qué ves**: `NullReferenceException` en `PowersTab.setNewWidth()`, no hay pestaña y tampoco tus poderes.
- **Por qué**: Se llamó a `recalc()` durante `OnModLoad`. El `Start()` de la propia pestaña aún no ha corrido, su padre sigue siendo `null`, y la excepción mata toda la etapa.
- **Solución**: Crea la pestaña al cargar, colócala desde `Update()`. Mira **[Pestañas y botones de poderes](#/nml/power-buttons)**.

### La ventana de ajustes muestra ids en crudo

- **Qué ves**: `LocalizedTextManager: missing text: strike_radius Description` en el log.
- **Por qué**: NML pide a cada fila de ajustes dos claves: `<id>` para la etiqueta y `<id> Description`, con espacio y D mayúscula, para el tooltip.
- **Solución**: Añade las dos a `Locales/en.json`. Mira **[Ajustes del mod](#/nml/mod-config)**.

### El mundo lanza errores en cada frame tras añadir un comportamiento del mundo

- **Sintoma**: `NullReferenceException` en `MapBox.updateWorldBehaviours()`, en cada frame desde que carga tu mod.
- **Causa**: El mundo mantiene un temporizador por cada comportamiento, creado al iniciar el mapa antes de tu mod. El tuyo no tiene ninguno y el bucle lo llama de todos modos.
- **Solución**: `behaviour.manager = new WorldBehaviour(behaviour);` justo después de `add()`. Consulta **[Edades del mundo y comportamientos](#/nml/world-ages)**.

### Un desastre se bloquea al escribir en el registro del mundo

- **Sintoma**: `NullReferenceException` en el constructor de `WorldLogMessage`, llamado desde `WorldLog.logDisaster()`.
- **Causa**: `world_log` es el ID de un `WorldLogAsset`, no una clave de texto. Un ID no registrado devuelve `null` y el mensaje se construye sobre él.
- **Solución**: Clona `$basic_disaster$` bajo ese ID y asigna su `locale_id`. Consulta **[Desastres](#/nml/disasters)**.

### Un desastre sin action se bloquea cuando es seleccionado

- **Sintoma**: `NullReferenceException` en `WorldBehaviourActions.updateDisasters()`, la primera vez que el azar lo elige.
- **Causa**: La tirada invoca `action` sin comprobar si es nulo. `spawn_asset_unit` por sí solo no hace nada.
- **Solución**: Apunta `action` a `AssetManager.disasters.simpleUnitAssetSpawnUsingIslands` o escribe tu propia acción.

### El primer gobernante que evalúa tu complot lanza un error

- **Sintoma**: `NullReferenceException` en `PlotAsset.checkIsPossible()`.
- **Causa**: `check_is_possible` se llama sin comprobación de nulos cada vez que un líder examina el complot.
- **Solución**: Asígnalo siempre. Si no tienes condiciones, devuelve `true`. Consulta **[Complots](#/nml/plots)**.

### Tu decisión, complot, gen o arma existe y nada lo usa jamás

- **Sintoma**: Ningún error. El asset está en su librería, pero el juego nunca lo elige.
- **Causa**: El juego selecciona desde listas generadas al inicio: `basic_plots`, las listas de decisiones, la reserva de mutación de genes, las reservas de armas, las reservas de casillas de eras. El tuyo se añadió después.
- **Solución**: Añádelo a la lista que el juego realmente lee. Cada página indica cuál: **[IA y comportamientos personalizados](#/nml/custom-ai)**, **[Complots](#/nml/plots)**, **[Rasgos de subespecie](#/nml/subspecies-traits)**, **[Objetos personalizados](#/nml/custom-items)**, **[Edades del mundo y comportamientos](#/nml/world-ages)**.

---
## Compila para ti, pero no para otros

El clásico "en mi PC funciona". La diferencia suele estar en tu configuración, no en tu código :PES5_Hmmmm:.

### `CS0122: inaccessible due to its protection level`

- **Qué ves**: Código copiado de un mod funcional no compila: `addStatusEffect`, `getHit`, `_localized_text`, `addBuilding`.
- **Por qué**: Son `internal`. NML compila tu `Code/*.cs` contra su propia copia **publicized** (`StreamingAssets/Mods/NML/Assembly-CSharp-Publicized.dll`), así que en un mod de código normal simplemente funcionan. El error aparece cuando compilas tu propia `.dll` en Visual Studio contra el `Assembly-CSharp.dll` original, que los oculta.
- **Solución**: Referencia esa copia publicized en tu proyecto, o usa la vía pública:

| En lugar de | Usa |
| --- | --- |
| `actor.addStatusEffect("x", 20f)` | `World.world.statuses.newStatus(actor, AssetManager.status.get("x"), 20f)` |
| `actor.getHit(5f, ...)` | `actor.changeHealth(-5)` |
| `LocalizedTextManager.instance._localized_text[k] = v` | `LM.Add("en", k, v)` y luego `LM.ApplyLocale(false)` |

### Funciona en tu ordenador, no hace nada en el suyo

- **Qué ves**: Reportes de que el mod carga sin contenido o falla en la primera línea.
- **Por qué**: Casi siempre: una ruta fija con tu nombre de usuario; un zip del *contenido* en vez de la *carpeta*; un `GUID` cambiado; o la carpeta `Code/` junto a una `.dll` obsoleta.
- **Solución**: Obtén rutas con `GetDeclaration().FolderPath`. Comprime la carpeta completa. Fija el `GUID` de forma definitiva. Distribuye `Code/` **o** una `.dll`, nunca ambos.

---

## Funciona al principio, se rompe más adelante

Los lentos. Ayer tu mod funcionaba, y no ha cambiado nada :PES2_Shrug:.

### Otro mod reemplaza silenciosamente tu contenido

- **Qué ves**: Tu rasgo desaparece cuando otro mod específico está activo. En el registro aparece: `duplicate asset - overwriting...`.
- **Por qué**: Existe un único espacio de nombres de ids compartido. El último registro sobrescribe al anterior.
- **Solución**: Usa prefijos en todos tus ids: `hello_swift`, nunca `swift`. Protege con `if (AssetManager.traits.has(SWIFT)) return;`. Para modificar contenido base, obtén el asset con `get()` y modifícalo directamente.

### Bloqueo en `World.world` mientras se carga el mod

- **Qué ves**: El fallo ocurre en la primera línea que interactúa con el mapa.
- **Por qué**: `OnModLoad` se ejecuta antes de que exista ningún mundo. Las librerías de assets están listas; el mundo no.
- **Solución**: Registra en `OnModLoad` e interactúa con el mundo desde `Update()` protegido por `if (!Config.game_loaded) return;` junto con comprobaciones de nulidad en `World.world`, `World.world.units` y `MapBox.instance`.

### Tus datos empiezan a controlar las criaturas equivocadas

- **Qué ves**: Tras cargar una partida o crear un nuevo mundo, criaturas no relacionadas se comportan de forma anómala.
- **Por qué**: Los identificadores de unidad son **locales a cada mundo** y se reasignan desde el principio. Mantener la referencia al objeto `Actor` es aún peor porque los actores muertos se reciclan en memoria.
- **Solución**: Detecta el cambio de mundo y limpia los registros. El tiempo de juego retrocediendo es la señal más rápida:

```csharp
double now = World.world.getCurWorldTime();
if (_lastWorldTime >= 0.0 && now < _lastWorldTime - 1.0) MyRegister.Clear();
_lastWorldTime = now;
```

### Todo desaparece tras guardar y cargar partida

- **Qué ves**: Tus unidades vuelven al comportamiento estándar aunque sigan teniendo el rasgo.
- **Por qué**: Solo los datos propios del juego se serializan; los diccionarios estáticos no. Los rasgos se guardan como ids y los no reconocidos al cargar se eliminan silenciosamente.
- **Solución**: Usa el rasgo como indicador persistente y restaura los datos desde él: `trait.action_on_augmentation_load = (pActor, pTrait) => MyRegister.Restore(pActor);`
- **O bien**: mantén el estado en la propia unidad. Su almacén de datos personalizados se guarda con ella: consulta **[Recordar cosas](#/nml/saving-data)**..

### Las unidades se congelan en grupos

- **Qué ves**: Grupos de unidades dejan de moverse; el grupo cambia cada fotograma con una sola excepción en el registro.
- **Por qué**: Los bucles por unidad no tienen try/catch. Un error en la unidad *i* cancela todas las unidades posteriores en ese fotograma.
- **Solución**: Envuelve el cuerpo de cada parche y el método `execute` de comportamientos personalizados en bloques try/catch devolviendo `BehResult.Stop` en caso de fallo.

### La mitad de tus parches de Harmony nunca se aplicaron

- **Qué ves**: Solo dos parches de nueve funcionan. Un error y nada más.
- **Por qué**: `PatchAll` se detiene ante la primera clase de parche que no puede resolver y omite las siguientes.
- **Solución**: Aplica los parches clase por clase para aislar fallos. Código en **[Parches de Harmony](#/nml/harmony-patches)**.

### Tu parche de `updateStats` falla a otros jugadores

- **Qué ves**: Funciona durante horas en tu equipo pero genera excepciones de hilos en otros jugadores.
- **Por qué**: El juego ejecuta `updateStats` como un trabajo **paralelo**: tu Postfix corre en hilos de trabajo simultáneos sobre varias unidades.
- **Solución**: Modifica solo los números de esa unidad en ese parche. Pasa todo lo demás a tu propio `Update()`.

### Parcheaste `getHit` y los edificios siguen recibiendo daño

- **Qué ves**: Tu regla de daño funciona en unidades pero no en edificios, o se ejecuta dos veces.
- **Por qué**: `getHit` existe tres veces: en la clase base y como override en `Actor` **y** en `Building`. Harmony parchea métodos concretos, no la tabla virtual.
- **Solución**: Parchea cada override concreto y evita duplicar cálculos.

### Tu Prefix rompió otros tres mods

- **Qué ves**: "Tu mod ha roto el mod X." Nada en el registro, y el autor de X no consigue reproducirlo por su cuenta.
- **Por qué**: Devolver `false` se salta el original **y el parche de cualquier otro mod que vaya después del tuyo**. En `updateStats`, además, deja para siempre flags en caché desactualizados en la unidad.
- **Solución**: Mejor Postfix y ajustar (`__result *= 0.5f`) que Prefix y cancelar. Si tienes que cancelar, cancela el método más concreto posible y haz `return true` pronto en todos los casos que no te interesan.

### Una unidad se queda quieta para siempre o falla en cada fotograma

- **Qué ves**: Una unidad quieta sin tarea activa o errores constantes en el registro.
- **Por qué**: Un id de **task** desconocido se ignora silenciosamente; un id de **job** desconocido provoca un fallo en cada tick.
- **Solución**: Valida los ids al inicio, registra las tareas antes del trabajo que las requiere y nunca pases a `next_job_delegate` un id no comprobado.

### Tu control de IA personalizada se revierte silenciosamente

- **Qué ves**: Tras un tiempo, algunas unidades vuelven a la IA estándar aunque sigan en tu registro.
- **Por qué**: Los actores se reciclan del pool: una "nueva" criatura es un objeto antiguo cuyo delegado de trabajo se acaba de reiniciar.
- **Solución**: Reasigna el delegado periódicamente: `if (pActor.ai.next_job_delegate != MyAI.NextJob) pActor.ai.next_job_delegate = MyAI.NextJob;`.

### El juego da tirones cuatro veces por segundo

- **Qué ves**: Buen promedio de FPS pero micro-tirones rítmicos sin una función pesada aislada.
- **Por qué**: Todas las unidades calculan la lógica en el mismo tick y avanzan solo cuando finaliza la acción actual.
- **Solución**: Procesa en tu propio temporizador y no en `execute`. Divide la población en bloques y pre-asigna listas evitando LINQ o `Debug.Log` en esa ruta.

### Los clics caen en el mapa detrás de tu ventana

- **Qué ves**: El jugador hace clic en un control de tu panel y aparece una unidad debajo.
- **Por qué**: Un canvas sin `GraphicRaycaster` se dibuja pero no recibe clics. Y `unselect_when_window` solo conoce las ventanas del propio juego, así que un panel hecho a mano nunca desactiva el poder activo.
- **Solución**: `Canvas` + `overrideSorting` + `sortingOrder` + `GraphicRaycaster` + una `Image` de fondo, todo junto. `raycastTarget = false` en las etiquetas. Desactiva el poder tú mismo cuando se abra la ventana.

### La memoria aumenta cada vez que se abre el panel

- **Qué ves**: La memoria sube cada vez que se abre la ventana; sesiones largas pierden rendimiento.
- **Por qué**: `Destroy(root)` elimina los GameObject, pero las instancias de `Texture2D` o `Sprite` creadas por ti requieren liberación explícita.
- **Solución**: Destruye lo que hayas creado y anula las referencias. No destruyas sprites provenientes de `SpriteTextureLoader`.

### Un nuevo valor por defecto nunca llega a los jugadores existentes

- **Qué ves**: Cambias un valor por defecto en `default_config.json` y los jugadores existentes conservan el valor antiguo.
- **Por qué**: Ese archivo es solo una plantilla. Los valores reales viven en `mods_config\<UID>.config`, que guarda el elemento completo.
- **Solución**: Prueba borrando ese archivo de configuración. Si un rango o callback debe cambiar, usa un nuevo `Id`.

### El deslizador de ajustes se mueve pero tu callback nunca se ejecuta

- **Qué ves**: La fila funciona y el valor se guarda, pero tu método nunca es invocado.
- **Por qué**: La callback sigue el formato `Namespace.Type:MethodName`, el método debe ser **estático** y el parámetro debe coincidir con el tipo exacto (`INT_SLIDER` → `int`, `SLIDER` → `float`, `SWITCH` → `bool`, `TEXT` → `string`).
- **Solución**: Incluye el namespace, hazlo estático y ajusta el tipo. Los cambios se aplican al **cerrar** la ventana.

---

## ¿Sigues atascado?

Publica en **[Feedback y solicitudes](#/feedback)** con tres líneas (qué hiciste, qué esperabas, qué ocurrió) y la línea del registro. Las nuevas dudas se añaden periódicamente a esta página :aPES4_Noted:.
