---
title: Instalar NML
group: NML Modding
icon: :wbhammer:
order: 1
---

# Instalar NML :wbhammer:

**NML** (NeoModLoader) es el programa que hace funcionar los mods de WorldBox. Instalas NML una vez, y a partir de ahí instalar un mod es copiar una carpeta.

Esta página da por hecho que nunca has hecho nada de esto. Si sabes qué es un `.dll`, salta a **[la versión corta](#la-versión-corta)** :PES_OkHand:.

> [!NOTE] Windows, Mac y Linux (Steam Deck)
> Los mods funcionan en la **versión de Steam para Windows, Mac y Linux** (incluyendo Steam Deck / SteamOS). No en móviles, tablets ni consolas.

## La versión corta

1. En el juego: **Ajustes → Experimental Mode → activado**.
2. Descarga `NeoModLoader.dll` de la [página oficial de versiones](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest).
3. Ponlo en `worldbox_Data/StreamingAssets/Mods/` dentro de tu carpeta de WorldBox.
4. Borra de esa misma carpeta todo lo que tenga `NCMS` en el nombre.
5. Inicia el juego. Los mods ahora van en la carpeta `Mods` junto a `worldbox.exe`.

Eso es todo. El resto de la página son los mismos cinco pasos, con cada clic escrito.

---

## Windows

### Paso 1. Activa Experimental Mode

1. Inicia WorldBox como siempre, desde Steam.
2. Abre la ventana de **Ajustes** del juego.
3. Busca en la lista **Experimental Mode** (con el juego en español: **Modo experimental**) y actívalo.
4. Cierra el juego.

Sin este interruptor el juego ni siquiera busca mods. Sin error, sin mensaje, simplemente nada :PES5_Hmmmm:.

> [!WARNING] Hay dos carpetas llamadas Mods
> Esta, dentro de `worldbox_Data\StreamingAssets\Mods/`, es únicamente para el **propio NML** (en concreto `NeoModLoader.dll`) y nada más. La carpeta donde colocarás tus **mods** es independiente, situada en la raíz del juego junto a `worldbox.exe` (`worldbox\Mods/`). Todavía no existe; NML la creará automáticamente la primera vez que inicies el juego. Poner un mod en `StreamingAssets\Mods/` o NML en `worldbox\Mods/` es el fallo más habitual de esta página.

### Paso 2. Descarga NML

1. Abre este enlace: **[github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest)**. Siempre apunta al NML más nuevo, así que puedes guardarlo en marcadores.
2. Baja hasta la sección llamada **Assets**. Si está plegada, haz clic para abrirla.
3. Haz clic en **NeoModLoader.dll**. Se descarga como cualquier otro archivo, normalmente en tu carpeta **Descargas**.

Solo necesitas ese archivo. La página también muestra `nml-setup-win.exe` y archivos que terminan en `.pdb`, `.xml` y "Source code": ignóralos todos. Son para los desarrolladores de NML, no para ti.

> [!WARNING] Solo desde ese enlace
> Un `.dll` es un programa. Descarga NML **solo** desde la página de GitHub de arriba, nunca desde CurseForge, otra web o un archivo que alguien te mandó por chat. Una copia vieja de cualquier otro sitio se borra sola la primera vez que arranca el juego y deja solo una carpeta `NML` y `NeoModLoader.AutoUpdate_memload.dll` - si pasa eso, vuelve aquí y descarga el archivo de verdad. El botón de "instalación en 1 clic" de GameBanana tampoco instala NML; descarga el `.dll` a mano.
>
> Si tu navegador pregunta "¿conservar este archivo?", o Chrome lo marca como **No confirmado**, es porque un `.dll` es un programa y no mucha gente descarga este. Desde esa página de GitHub la respuesta es conservar (en Chrome: abre la lista de descargas y luego **Conservar de todos modos**).

### Paso 3. Abre la carpeta de WorldBox

Es la carpeta donde Steam instaló el juego. Nunca tienes que buscarla:

1. Abre **Steam** y ve a tu **Biblioteca**.
2. **Clic derecho** en WorldBox en la lista de la izquierda.
3. Haz clic en **Administrar**, luego en **Explorar archivos locales**.

Se abre una ventana con los archivos del juego. Estás en el sitio correcto si ves un archivo llamado `worldbox` (o `worldbox.exe`) y una carpeta llamada `worldbox_Data`. En la mayoría de PCs es:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Deja esta ventana abierta. A partir de ahora, "la carpeta de WorldBox" es esta. Volverás aquí más a menudo de lo que crees.

> [!TIP] Haz que Windows muestre las extensiones
> Por defecto Windows oculta el final de los nombres de archivo, así que `NeoModLoader.dll` aparece solo como `NeoModLoader`. Eso complica cualquier guía. En la ventana de la carpeta, haz clic en **Vista** arriba y marca **Extensiones de nombre de archivo** (en Windows 11: **Vista → Mostrar → Extensiones de nombre de archivo**). No se rompe nada, solo ves los nombres completos.

### Paso 4. Pon NML en su sitio

1. En la carpeta de WorldBox, doble clic en **worldbox_Data**.
2. Doble clic en **StreamingAssets**.
3. Doble clic en **Mods**.
4. Ahora abre tu carpeta **Descargas** en una segunda ventana y arrastra **NeoModLoader.dll** a esta ventana `Mods`.

Tiene que quedar aquí:

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            ├── test_asset_load/     es del juego, déjala
            └── NeoModLoader.dll     <- el que acabas de añadir
```

Si ahí dentro no ves `test_asset_load`, estás en la carpeta equivocada. Vuelve a la carpeta de WorldBox y prueba otra vez.

**Ya que estás en esta carpeta:** si hay algo con **NCMS** en el nombre (por ejemplo `NCMS_memload.dll`, o una carpeta llamada `NCMS`), bórralo. NCMS es el antiguo cargador de mods, está muerto, y NML ya puede ejecutar los viejos mods de NCMS :PES2_Shrug:.

> [!WARNING] `NeoModLoader (1).dll` no es `NeoModLoader.dll`
> ¿Has descargado NML dos veces o ya había una copia antigua en esa carpeta? Windows nombra el nuevo archivo `NeoModLoader (1).dll` en lugar de sobrescribirlo, y NML se negará a iniciar: un texto rojo inundará la pantalla pidiéndote que reinicies el juego, y el registro mostrará `Missing className: NeoModLoader (1).WorldBoxMod`. Cierra el juego, elimina el archivo antiguo, renombra el nuevo a exactamente `NeoModLoader.dll` (sin espacios ni números) y vuelve a empezar. Este único carácter es la razón más común por la que NML "no funciona" :PESgn_SMH:.
>
> Si Windows se niega a eliminar el archivo antiguo porque "está en uso", significa que el juego todavía se está ejecutando. Ciérralo primero.

> [!WARNING] Hay dos carpetas llamadas Mods
> Esta, dentro de `worldbox_Data\StreamingAssets\Mods/`, es únicamente para el **propio NML** (en concreto `NeoModLoader.dll`) y nada más. La carpeta donde colocarás tus **mods** es independiente, situada en la raíz del juego junto a `worldbox.exe` (`worldbox\Mods/`). Todavía no existe; NML la creará automáticamente la primera vez que inicies el juego. Poner un mod en `StreamingAssets\Mods/` o NML en `worldbox\Mods/` es el fallo más habitual de esta página.

### Paso 5. Inicia el juego y comprueba

Inicia WorldBox desde Steam y, la primera vez, dale un poco más de tiempo de lo normal.

Lo hiciste bien si:

- Mientras carga el mundo, el juego muestra el mensaje **Experimental mode is enabled**.
- Hay un botón nuevo con el **logo de NML** entre los botones de pestañas de la parte de abajo de la pantalla. Haz clic: ahí vive tu lista de mods.
- De vuelta en la carpeta de WorldBox, hay una carpeta nueva y vacía llamada **Mods**, justo al lado de `worldbox.exe`.
- En `worldbox_Data\StreamingAssets\Mods/` NML creó una carpeta **NML** para sus cosas. No la toques.

Si no pasó nada de eso, salta a **[No funcionó](#no-funcionó)**.

---

## Mac

Los mismos cinco pasos. Solo cambia dónde está escondida la carpeta, porque en Mac todo el juego va empaquetado en un único icono. Cosas de Apple :wbbre:.

1. **Experimental Mode**: igual que en Windows, **[Paso 1](#paso-1-activa-experimental-mode)**. El aviso sobre las actualizaciones también va por ti.
2. **Descarga** `NeoModLoader.dll` de la [misma página de versiones](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest). Es el mismo archivo para Windows y Mac.
3. **Abre la carpeta de WorldBox**: Steam → Biblioteca → clic derecho en WorldBox → **Administrar → Explorar archivos locales**. Se abre una ventana del Finder.
4. **Entra en la app**: clic derecho en el icono de la app **worldbox** y elige **Mostrar contenido del paquete**. Luego abre **Contents → Resources → Data → StreamingAssets → Mods** y arrastra ahí `NeoModLoader.dll`. Ya que estás, borra todo lo que tenga `NCMS` en el nombre.
5. **Inicia el juego** y comprueba lo mismo que en el **[Paso 5](#paso-5-inicia-el-juego-y-comprueba)**. La nueva carpeta `Mods` para tus mods aparece en la carpeta de WorldBox, junto a la app, no dentro.

```text
worldbox/
├── worldbox.app/
│   └── Contents/Resources/Data/StreamingAssets/Mods/
│       └── NeoModLoader.dll     <- NML va aquí
└── Mods/                        <- tus mods van aquí
```

---

## Linux y Steam Deck

La lógica es idéntica. Steam en Linux instala el juego en tu carpeta de usuario, y en Steam Deck solo necesitas cambiar primero al modo Escritorio. Pingüinos bienvenidos :wbpenguin:.

1. **Modo experimental**: exactamente igual que en Windows, **[Paso 1](#paso-1-activa-experimental-mode)**.
2. **Descarga** `NeoModLoader.dll` desde la [página oficial de releases](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest). Es el mismo archivo para todas las plataformas.
3. **Abre la carpeta de WorldBox**:
   - **Linux de escritorio**: Steam → Biblioteca → clic derecho en WorldBox → **Administrar → Ver archivos locales**.
   - **Steam Deck**: Pulsa el botón **STEAM → Encendido/Apagado → Cambiar a Escritorio**. Abre Steam en modo Escritorio, ve a la Biblioteca → clic derecho en WorldBox → **Administrar → Ver archivos locales**.
   La ruta suele ser:
   ```text
   ~/.local/share/Steam/steamapps/common/worldbox/
   ```
4. **Coloca NML en su sitio**: Abre `worldbox_Data → StreamingAssets → Mods` y arrastra `NeoModLoader.dll` allí. Elimina cualquier archivo que contenga `NCMS` en el nombre.
5. **Inicia el juego** (en Steam Deck puedes volver al modo Juego) y comprueba lo mismo que en el **[Paso 5](#paso-5-inicia-el-juego-y-comprueba)**. La nueva carpeta `Mods` aparecerá en la carpeta raíz de WorldBox.

```text
worldbox/
├── worldbox_Data/
│   └── StreamingAssets/
│       └── Mods/
│           └── NeoModLoader.dll     <- NML
└── Mods/                            <- mods
```

---

## Instalar un mod

Ahora la parte fácil, y la que harás una y otra vez.

1. Descarga el mod. Lee primero su descripción: algunos mods necesitan algo extra, y el autor suele decirlo.
2. Pon el `.zip` directamente en **`worldbox\Mods/`**, la que está junto a `worldbox.exe`. No lo descomprimas: NML descomprime sus propios zips la próxima vez que arranca el juego.
3. Arranca el juego.

¿Ya lo descomprimiste por costumbre? También funciona, siempre que la carpeta que contiene `mod.json` quede directamente dentro de `Mods/`. Una carpeta de mod siempre tiene un archivo llamado `mod.json` en algún sitio, así es como NML la reconoce. El error a evitar es una carpeta dentro de otra carpeta dentro de `Mods/`, o los archivos del mod sueltos en `Mods/` sin ninguna carpeta alrededor.

```text
worldbox/
├── worldbox.exe
└── Mods/
    ├── SomeMod/
    │   └── mod.json
    └── AnotherMod/
        └── mod.json
```

> [!TIP] Pruébalo con HelloBox
> ¿No estás seguro de que funcione? El mod que construye esta guía es una prueba lista para usar. Descárgalo desde **[El mod terminado](#/nml/all-together)**, descomprímelo en `Mods` y arranca el juego. Si aparece una pestaña de poderes nueva llena de botones tontos, todo está bien instalado :wbpeak:.

**Para quitar un mod**, cierra el juego y borra su carpeta de `Mods`. **Para desactivarlo sin borrarlo**, usa la lista de mods de NML en el juego.

**Los mods del Workshop** también funcionan: suscríbete en el Steam Workshop y NML los recoge, sin copiar nada.

---

## No funcionó

Revisa esto en orden. Lo primero arregla a la mayoría.

| Lo que ves | Qué hacer |
| --- | --- |
| No hay botón de NML ni carpeta `Mods` junto a `worldbox.exe` | El Modo Experimental está apagado. Actívalo y reinicia. También después de cada actualización del juego |
| Sigue sin haber nada, el Modo Experimental está activado | `NeoModLoader.dll` está en la carpeta equivocada. Tiene que estar en `worldbox_Data\StreamingAssets\Mods/`, junto a `test_asset_load` |
| El archivo se llama `NeoModLoader.dll.dll` o `NeoModLoader (1).dll` | Renómbralo exactamente a `NeoModLoader.dll` |
| NML está, pero un mod no aparece | El mod está en la `Mods` equivocada. Va en la que está junto a `worldbox.exe`, como su propio `.zip` o como una carpeta con `mod.json` dentro |
| Un aluvión de texto rojo llena la pantalla y dice `YOU SHOULD RESTART THE GAME` | NML se llama `NeoModLoader (1).dll` o algo parecido. Mira el **[Paso 4](#paso-4-pon-nml-en-su-sitio)** |
| NML dice que un mod "has been disabled due to an error" | El mod está roto o es demasiado viejo para tu versión del juego. Busca una actualización de ese mod o pregúntale a su autor |
| La versión de la esquina del menú principal nunca cambia | Tu juego está en una rama beta de Steam. Mira **[Solución de problemas](#/troubleshooting)** |
| Todo se rompió justo después de una actualización de WorldBox | Vuelve a activar el Modo Experimental. Luego espera a que tus mods se actualicen: una actualización del juego suele romper los mods viejos durante unos días |

¿Sigues atascado? **[Solución de problemas](#/troubleshooting)** tiene la lista larga, y **[Logs y depuración](#/nml/logs-and-debugging)** muestra dónde apunta el juego lo que salió mal. Cuando pidas ayuda, di qué mods usas, qué hiciste justo antes de que se rompiera, e incluye el texto del error. "No funciona" no es algo que nadie pueda arreglar, ni siquiera yo :PESgn_ReadRules:.

---

## Lo que todo el mundo pregunta

**¿Puedo usar NML y BepInEx juntos?**
Sí. No se estorban entre sí. Dos *mods* concretos pueden chocar, pero eso es cosa de los mods, no de los cargadores.

**El mod dice que necesita BepInEx, no NML.**
Entonces no va en `Mods`. Instala BepInEx como se muestra en **[La consola en vivo (BepInEx)](#/toolbox/bepinex-console)** (Windows), arranca el juego una vez y pon ese mod en `BepInEx\plugins/`. La descripción del mod dice qué cargador quiere.

**¿NML o NCMS?**
NML. NCMS dejó de actualizarse y no funciona en las versiones actuales del juego. NML ejecuta igualmente los mods viejos de NCMS, así que no pierdes nada.

**¿NML es un virus?**
No. Los navegadores avisan porque un `.dll` es un programa y no mucha gente descarga este. Consíguelo solo desde el enlace de GitHub de arriba: los mods de GameBanana los revisan sus moderadores, y un archivo que alguien te manda por chat no lo revisa nadie :PESgn_ReadRules:.

**¿Tengo que reinstalar NML para cada mod?**
No. Con una vez basta. Después, cada mod es solo una carpeta en `Mods`.

**¿Tengo que actualizar NML?**
Normalmente no. NML busca una versión nueva cada vez que arranca el juego y se reemplaza solo (eso es el `NeoModLoader.AutoUpdate_memload.dll` que aparece a su lado). Si alguna vez falla, descarga el `NeoModLoader.dll` nuevo del mismo enlace y reemplaza el viejo a mano.

**¿Los mods me romperán las partidas guardadas?**
Pueden. Una partida hecha con un mod puede no cargar bien cuando quitas ese mod. Guarda una copia de los mundos que te importan antes de probar algo nuevo :PES_MonkaSweat:.

**Mi mod favorito está desactualizado. ¿Puedo seguir jugándolo?**
O esperas a su autor, o juegas la versión del juego para la que se hizo: en Steam, clic derecho en WorldBox → **Propiedades → Betas**, y elige esa rama. También necesitas la versión de NML correspondiente, enlazada en los mensajes fijados del canal de modding del Discord de WorldBox. Mientras estés ahí, todos los mods hechos para la versión actual dejan de funcionar. Para volver, elige **Ninguna** en el mismo menú.

**¿Cómo actualizo un mod?**
Los mods del Workshop se actualizan solos. Para todo lo demás: cierra el juego, borra la carpeta vieja del mod (y su `.zip` viejo) de `Mods`, y pon el `.zip` nuevo.

**Borré un mod y sigue en el juego.**
Venía del Steam Workshop. Desmarcarlo en la lista de mods no basta: cancela la suscripción en su página del Workshop.

**¿Puedo cambiar un mod para mí?**
Si tiene una carpeta `Code` llena de archivos `.cs`, sí: son texto plano, NML los compila cada vez que arranca el juego, y su arte está en `GameResources`. Guarda antes una copia del original. Compartir tu versión modificada es otra cuestión, pregunta al autor. Un mod que solo trae un `.dll` no se puede editar, solo recompilar desde su código fuente.

**Alguien que me ayuda me pidió mi log.**
Pega `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` en la barra de direcciones del Explorador y mándale `Player.log`, el archivo en sí, no una captura. Si el juego acaba de crashear, manda `Player-prev.log` en su lugar: arrancar el juego de nuevo sobrescribe `Player.log`.

¿Quieres hacer mods en vez de solo usarlos? Empieza en **[Primeros pasos](#/getting-started)**.
