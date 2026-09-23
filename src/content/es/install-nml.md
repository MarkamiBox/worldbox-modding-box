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

1. Abre este enlace: **[github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest)**. Siempre apunta al NML más reciente, puedes guardarlo en marcadores.
2. Baja hasta la sección **Assets**. Si está plegada, haz clic para abrirla.
3. Haz clic en **NeoModLoader.dll**. Se descarga como cualquier otro archivo, normalmente en tu carpeta **Descargas**.

Solo necesitas ese archivo. La página también lista archivos que terminan en `.pdb`, `.xml` y "Source code": ignóralos.

> [!WARNING] Solo desde ese enlace
> Un `.dll` es un programa. Descarga NML **solo** desde la página de GitHub de arriba, nunca desde una web cualquiera ni desde un archivo que alguien te pasó por chat. Si el navegador pregunta "¿conservar este archivo?", pregunta porque es un `.dll`, y desde esa página la respuesta es conservar.

### Paso 3. Abre la carpeta de WorldBox

Es la carpeta donde Steam instaló el juego. Nunca tienes que buscarla:

1. Abre **Steam** y ve a tu **Biblioteca**.
2. **Clic derecho** en WorldBox en la lista de la izquierda.
3. Haz clic en **Administrar**, luego en **Explorar archivos locales**.

Se abre una ventana con los archivos del juego. Estás en el sitio correcto si ves un archivo llamado `worldbox` (o `worldbox.exe`) y una carpeta llamada `worldbox_Data`. En la mayoría de PCs es:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Deja esta ventana abierta. A partir de ahora, "la carpeta de WorldBox" es esta.

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

Los mismos cinco pasos. Solo cambia dónde está escondida la carpeta, porque en Mac todo el juego va empaquetado en un único icono.

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

La lógica es idéntica. Steam en Linux instala el juego en tu carpeta de usuario, y en Steam Deck solo necesitas cambiar primero al modo Escritorio.

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

Ahora la parte fácil, la que harás una y otra vez.

1. Descarga el mod. Lee antes su descripción: algunos mods necesitan algo más, y el autor suele decirlo.
2. Si vino como archivo **.zip**, descomprímelo. En Windows: clic derecho → **Extraer todo**. En Mac: doble clic.
3. Arrastra la carpeta que obtienes a **`worldbox\Mods/`**, la que está junto a `worldbox.exe`.
4. Inicia el juego.

Una carpeta de mod siempre tiene un archivo llamado `mod.json` en algún sitio dentro. Así la reconoce NML. Si el zip te dio una carpeta dentro de otra, no pasa nada, NML mira dentro.

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
> ¿No sabes si funciona? El mod que construye esta guía es una prueba ya hecha. Descárgalo desde **[El mod terminado](#/nml/all-together)**, descomprímelo en `Mods` e inicia el juego. Si aparece una pestaña de poderes nueva llena de botones tontos, todo está bien instalado :wbpeak:.

**Para quitar un mod**, cierra el juego y borra su carpeta de `Mods`. **Para apagarlo sin borrarlo**, usa la lista de mods de NML en el juego.

**Los mods del Workshop** también funcionan: suscríbete en el Steam Workshop y NML los encuentra solo, sin copiar nada.

---

## No funcionó

Revísalos en orden. El primero arregla a casi todo el mundo.

| Qué ves | Qué hacer |
| --- | --- |
| Ni botón de NML, ni carpeta `Mods` junto a `worldbox.exe` | Experimental Mode está apagado. Actívalo y reinicia. También tras cada actualización del juego |
| Sigue sin pasar nada, Experimental Mode está activado | `NeoModLoader.dll` está en la carpeta equivocada. Tiene que estar en `worldbox_Data\StreamingAssets\Mods/`, junto a `test_asset_load` |
| El archivo se llama `NeoModLoader.dll.dll` o `NeoModLoader (1).dll` | Renómbralo exactamente a `NeoModLoader.dll` |
| NML está, pero un mod no aparece | El mod está en la `Mods` equivocada. Va en la que está junto a `worldbox.exe`, como carpeta con `mod.json` dentro, no como `.zip` |
| NML dice que un mod "has been disabled due to an error" | El mod está roto o es demasiado viejo para tu versión del juego. Busca una actualización de ese mod o pregunta a su autor |
| Todo se rompió justo después de una actualización de WorldBox | Vuelve a activar Experimental Mode. Luego espera a que tus mods se actualicen: una actualización del juego suele romper los mods viejos unos días |

¿Sigues atascado? **[Solución de problemas](#/troubleshooting)** tiene la lista larga, y **[Logs y depuración](#/nml/logs-and-debugging)** muestra dónde apunta el juego lo que salió mal. Cuando pidas ayuda, di qué mods usas, qué hiciste justo antes de que se rompiera, e incluye el texto del error. "No funciona" no es algo que nadie pueda arreglar, ni yo :PESgn_ReadRules:.

---

## Lo que todo el mundo pregunta

**¿Puedo usar NML y BepInEx a la vez?**
Sí. No se molestan. Dos *mods* concretos pueden chocar igualmente, pero eso es cosa de los mods, no de los cargadores.

**El mod dice que necesita BepInEx, no NML.**
Entonces no va en `Mods`. Instala BepInEx como se explica en **[La consola en vivo (BepInEx)](#/toolbox/bepinex-console)** (Windows), abre el juego una vez y pon ese mod en `BepInEx\plugins/`. La descripción del mod dice qué cargador quiere.

**¿NML o NCMS?**
NML. NCMS dejó de actualizarse y no funciona en las versiones actuales del juego. NML ejecuta igualmente los viejos mods de NCMS, así que no pierdes nada.

**¿Es NML un virus?**
No. Los navegadores advierten sobre él porque un archivo `.dll` es un programa ejecutable y no mucha gente descarga este en particular. Descárgalo únicamente desde el enlace de GitHub de arriba: los mods en GameBanana son revisados por sus moderadores, mientras que un archivo que alguien te pasa por chat no lo revisa nadie :PESgn_ReadRules:.

**¿Tengo que reinstalar NML para cada mod?**
No. Con una vez basta. Después, cada mod es solo una carpeta en `Mods`.

**¿Tengo que actualizar NML?**
Normalmente no. NML busca una versión nueva cada vez que arranca el juego y se reemplaza solo (para eso está el `NeoModLoader.AutoUpdate_memload.dll` que aparece a su lado). Si alguna vez falla, descarga el nuevo `NeoModLoader.dll` del mismo enlace y reemplaza el viejo a mano.

**¿Los mods me rompen las partidas guardadas?**
Pueden. Un guardado hecho con un mod puede no cargar bien cuando quitas ese mod. Haz una copia de los mundos que te importan antes de probar algo nuevo :PES_MonkaSweat:.

¿Quieres hacer mods en vez de solo usarlos? Se empieza en **[Primeros pasos](#/getting-started)**.
