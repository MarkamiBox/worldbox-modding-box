---
title: Primeros pasos
group: Resumen
icon: :wbsalut:
order: 3
---

# Primeros pasos :wbsalut:

Lo que necesitas antes de escribir tu primera línea de código. Sigue estos pasos en orden, te llevará unos quince minutos.

> [!NOTE] Aún no necesitas saber programar
> Y **no** necesitas Visual Studio, un compilador ni nada parecido. NML lee los archivos de texto `.cs` en la carpeta de tu mod y los compila por ti cuando hace falta. **El Bloc de notas es una forma perfectamente válida de escribir tu primer mod** :PES_OkHand:. Ya mejorarás tus herramientas más adelante, cuando realmente eches algo en falta.

## 1. Encuentra tu carpeta de WorldBox

En esta guía se te indicará que coloques archivos "en la carpeta de WorldBox" unas cuarenta veces, así que localízala bien ahora:

**Steam → clic derecho en WorldBox → Administrar → Ver archivos locales.**

Se abrirá una ventana del Explorador en la carpeta que contiene `worldbox.exe`. En la mayoría de PC es:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Deja esa ventana abierta o fíjala en algún sitio accesible. Siempre que esta guía hable de *la carpeta de WorldBox*, se refiere a esa :gatoxd:.

## 2. Activa el Modo Experimental

Sin él, los mods no cargan. No es que "funcionen mal": no cargan en absoluto, sin error ni aviso.

Dentro del juego: abre **Ajustes**, busca **Modo Experimental** y actívalo. Tras cada actualización del juego, compruébalo de nuevo: el juego lo desactiva automáticamente al cambiar de versión.

## 3. Instala NeoModLoader

**NML** es lo que encuentra tu mod, lo compila y lo ejecuta. Sin NML no hay modding. ¿Nunca lo has hecho? En **[Instalar NML](#/install-nml)** tienes cada clic detallado, Mac incluido.

1. Descarga la última versión de `NeoModLoader.dll` desde la [página de lanzamientos de NML](https://github.com/WorldBoxOpenMods/ModLoader/releases). Un único archivo, eso es todo.
2. En tu carpeta de WorldBox, entra en `worldbox_Data\StreamingAssets\Mods/`.
3. Coloca `NeoModLoader.dll` ahí dentro.

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            └── NeoModLoader.dll   <- aquí
```

Inicia el juego. Si ha funcionado, verás un nuevo botón con el logo de NML entre las pestañas inferiores y una carpeta `Mods` vacía junto a `worldbox.exe`. Si no está, revisa el paso 2 :PES5_Hmmmm:.

> [!NOTE] No necesitas también la copia de Workshop
> NML ya comprueba si hay una nueva versión cada vez que se inicia el juego y se actualiza a sí mismo, por lo que la instalación manual explicada arriba se mantiene al día por su cuenta. También existe un [artículo de NML en Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3080294469), pero suscribirte a él **junto a** la copia manual que acabas de instalar es una causa común de que "los mods no aparecen" o "un mod no se va": las dos copias entran en conflicto. Elige una. Y si alguna vez te suscribes a algo en Workshop, desmarcarlo en la lista de mods no es lo mismo que cancelar la suscripción.

## 4. Un editor de texto

Cualquier cosa que guarde texto plano sirve. Más o menos en orden de "estaría bien tenerlo":

| | |
| --- | --- |
| **Bloc de notas** | Ya está en tu PC. Realmente suficiente para tu primer mod |
| **[VS Code](https://code.visualstudio.com/)** | Gratuito, ligero, colorea tu código y te avisa de erratas. El punto ideal para la mayoría |
| **Visual Studio** | El gigante. Autocompleta métodos del juego si lo vinculas a la `.dll` de WorldBox. Excesivo hasta que escribas mucho código |

Elijas lo que elijas: cuando guardes un archivo `.cs`, asegúrate de guardarlo como `.cs` y **no** como `.cs.txt`. El Bloc de notas tiende a jugarle esa mala pasada a la gente :PESgn_SMH:.

## 5. ¡Eso es todo, ve a crear algo!

Pasa a **[Estructura de un mod](#/nml/mod-structure)** en la sección NML Modding y luego a **[Tu primer mod](#/nml/your-first-mod)** :gatoxd: !

---

## Herramientas para instalar más tarde, no ahora

**No** necesitas esto para escribir un mod. Vuelve cuando una página te lo indique expresamente.

- **[La consola en vivo (BepInEx)](#/toolbox/bepinex-console)**: una ventana negra que imprime tus líneas de registro mientras juegas, en lugar de obligarte a abrir un archivo de registro tras cada prueba. Instálala pronto, ahorra muchísimo tiempo.
- **[UnityExplorer](#/toolbox/unity-explorer)**: haz clic en cualquier cosa del juego y examina de qué está hecha por dentro.
- **[dnSpy o ILSpy](#/toolbox/reading-the-game-code)**: abre el propio código del juego para leer cómo los desarrolladores hicieron algo.
- **[AssetRipper](#/toolbox/getting-the-sprites)**: extrae los sprites y sonidos del juego para que puedas igualar su estilo gráfico.
- **[Modding con BepInEx](#/toolbox/bepinex-modding)**: compilar plugins `.dll` si quieres hooks de bajo nivel en el motor de Unity en lugar de contenido de NML.

> [!NOTE] Leer mods antiguos de NCMS
> NML incluye una capa de compatibilidad con NCMS, incluido soporte para el punto de entrada antiguo `[ModEntry]`. Eso no repara las llamadas a las API del juego que hayan cambiado. Prueba un mod antiguo contra tus versiones de juego y de NML antes de confiar en él. Arranca HelloBox con `BasicMod<Main>`, como hace esta guía.

Siguiente: **[Estructura de un mod](#/nml/mod-structure)**.
