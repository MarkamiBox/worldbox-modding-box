---
title: Aggiungere contenuti con BepInEx
group: BepInEx Modding
icon: :wbhammer:
order: 2
---

# Aggiungere contenuti con BepInEx :wbhammer:

Un plugin BepInEx può aggiungere tratti (trait), oggetti (item) e poteri (GodPower) come qualsiasi mod NML. Deve solo fare a mano i tre lavori che NML fa per te senza dire niente: aspettare il gioco, caricare il testo e caricare la grafica. Questa pagina li fa tutti e tre per lo stesso tratto **Swift** che costruisce la pagina **[Tratti personalizzati](#/nml/custom-traits)**, così puoi confrontarli riga per riga.

Se non hai ancora un progetto, parti da **[Modding con BepInEx](#/toolbox/bepinex-modding)**.

## Il momento giusto

L'`Awake()` del tuo plugin gira prestissimo, prima che WorldBox abbia costruito anche una sola libreria (library) di asset. Lì `AssetManager.traits` è ancora null, e toccarlo è una `NullReferenceException` prima ancora che compaia il menu principale.

Il momento che ti serve è la fine di `AssetManager.init()`. Quell'unico metodo pubblico costruisce tutte le librerie, poi esegue `post_init()` e `linkAssets()` di ognuna. Un Postfix di Harmony su di esso gira subito dopo, esattamente dove vive anche l'`OnModLoad` di una mod NML. Tutto quello che le pagine NML dicono su "il gioco l'ha fatto all'avvio, prima che la tua mod esistesse, quindi fallo tu" vale qui parola per parola.

## Il codice

```csharp Plugin.cs
using System.IO;
using BepInEx;
using HarmonyLib;

namespace HelloBepInEx
{
    [BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
    [BepInProcess("worldbox.exe")]
    public class HelloPlugin : BaseUnityPlugin
    {
        public static HelloPlugin Instance;

        /** The folder your .dll sits in, for loading your own files. */
        public static string Folder => Path.GetDirectoryName(Instance.Info.Location);

        private void Awake()
        {
            Instance = this;
            new Harmony("com.example.hellobepinex").PatchAll();

            // Installed while the game was already running? The libraries exist, go now.
            if (InitLibraries.initiated) HelloContent.Register();
        }
    }

    [HarmonyPatch(typeof(AssetManager), nameof(AssetManager.init))]
    public static class AssetsReadyPatch
    {
        [HarmonyPostfix]
        public static void Postfix() => HelloContent.Register();
    }

    [HarmonyPatch(typeof(LocalizedTextManager), nameof(LocalizedTextManager.setLanguage))]
    public static class LanguagePatch
    {
        // setLanguage throws the whole text table away and reloads it from the game files,
        // so our lines have to go back in after every language change.
        [HarmonyPostfix]
        public static void Postfix() => HelloContent.AddText();
    }
}
```

```csharp HelloContent.cs
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace HelloBepInEx
{
    public static class HelloContent
    {
        public const string SWIFT = "hello_swift";
        private const string ICON = "ui/Icons/iconHelloSwift";
        private static bool done;

        /** Text per language. English is the fallback for everything else. */
        private static readonly Dictionary<string, Dictionary<string, string>> Text =
            new Dictionary<string, Dictionary<string, string>>
            {
                ["en"] = new Dictionary<string, string>
                {
                    ["trait_hello_swift"] = "Swift",
                    ["trait_hello_swift_info"] = "Moves like the world owes it money."
                },
                ["it"] = new Dictionary<string, string>
                {
                    ["trait_hello_swift"] = "Rapido",
                    ["trait_hello_swift_info"] = "Si muove come se il mondo gli dovesse dei soldi."
                }
            };

        public static void Register()
        {
            if (done) return;
            done = true;

            // 1. The art, before anything asks for it. See "Your own art" below.
            string png = Path.Combine(HelloPlugin.Folder, "iconHelloSwift.png");
            if (File.Exists(png)) SpriteTextureLoader.addSprite(ICON, File.ReadAllBytes(png));

            // 2. The trait: exactly the Custom traits page, nothing BepInEx-specific.
            if (!AssetManager.traits.has(SWIFT))
            {
                ActorTrait swift = new ActorTrait
                {
                    id = SWIFT,
                    needs_to_be_explored = false,
                    path_icon = ICON,
                    group_id = "physique",
                    rate_birth = 0,
                    can_be_given = true,
                    can_be_removed = true
                };
                AssetManager.traits.add(swift);
                swift.base_stats["speed"] = 20f;
            }

            // 3. The text for the language that is already loaded.
            AddText();
        }

        public static void AddText()
        {
            if (LocalizedTextManager.instance == null) return;

            string lang = LocalizedTextManager.instance.language;
            if (!Text.TryGetValue(lang, out Dictionary<string, string> lines)) lines = Text["en"];

            foreach (KeyValuePair<string, string> line in lines)
            {
                // pReplace: true, or a second call logs "Already exists" for every line
                LocalizedTextManager.add(line.Key, line.Value, pReplace: true);
            }
        }
    }
}
```

Compila, avvia il gioco, apri un'unità, e Swift è nella scheda `physique` con nome, descrizione e icona.

> [!NOTE] `LocalizedTextManager.instance.language` è internal
> Compila perché il progetto di **[Modding con BepInEx](#/toolbox/bepinex-modding)** publicizza il gioco. Senza il publicizer dovresti ricordarti la lingua da solo.

## I tre lavori, uno per uno

### Aspettare il gioco

| NML | BepInEx |
| --- | --- |
| `OnModLoad()` gira quando le librerie sono pronte | Un Postfix su `AssetManager.init()` |
| NML si assicura che giri una volta sola | Tocca a te: la variabile `done` blocca un secondo giro se `Awake()` l'ha già chiamato |

Se registri qualcosa al momento sbagliato, te lo dice il log: una `NullReferenceException` che punta a `AssetManager.<qualcosa>` vuol dire troppo presto.

### Il testo

NML legge la tua cartella `Locales/` e la riapplica a ogni cambio di lingua. In BepInEx fai tutte e due le cose da solo, e la patch su `setLanguage` è la parte che tutti dimenticano: in inglese funziona tutto, il giocatore passa all'italiano, e il tuo tratto all'improvviso si chiama `trait_hello_swift` :wbfacepalm:.

I nomi delle chiavi sono gli stessi del resto della guida, quindi la tabella di **[Localizzazione](#/nml/localization)** vale ancora. `LocalizedTextManager.add` trasforma la chiave in snake_case per te, come i file del gioco.

### La tua grafica

In BepInEx non c'è la cartella `GameResources/`. Quello che c'è è `SpriteTextureLoader.addSprite(path, bytes)`: legge un PNG da qualsiasi posto e lo registra col percorso che vuoi, con il pivot al centro e il filtro per pixel art. Dopo, `path_icon = "ui/Icons/iconHelloSwift"` lo trova come uno sprite vanilla.

Due regole:

- **Registralo prima che qualcosa chieda quel percorso.** Il gioco si ricorda ogni percorso che ha cercato, anche quelli falliti, e `addSprite` rifiuta un percorso che ricorda già. Farlo all'inizio di `Register()` è sicuro.
- **È un'immagine, non una cartella di frame.** Le icone, le icone degli oggetti e i pulsanti dei poteri sono immagini singole, quindi funzionano. Tutto quello che la guida segna come **cartella** (animazioni dei drop, effetti di stato, proiettili, caselle, sprite degli edifici) si carica con `getSpriteList()`, che `addSprite` non riempie. Per quelli, prendi in prestito un percorso vanilla, o fai quella parte della mod con NML.

Metti il PNG accanto alla tua `.dll`:

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

Per farlo copiare anche dalla build, aggiungi una riga al target `CopyToGame` del tuo `.csproj`:

```xml HelloBepInEx.csproj
<Copy SourceFiles="iconHelloSwift.png" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
```

## Cosa non si porta da NML

Alcune pagine si appoggiano ad aiuti di NML che in BepInEx non esistono. Ecco cosa fare invece:

| La pagina NML usa | In BepInEx |
| --- | --- |
| Cartella `Locales/` | Lo schema `AddText()` qui sopra |
| `GameResources/` | `SpriteTextureLoader.addSprite` per le immagini singole, percorsi vanilla per le cartelle |
| `TabManager`, `PowerButtonCreator` (pulsanti dei poteri) | Nessun equivalente. Costruisci l'interfaccia da solo con Unity, o metti i pulsanti in una mod NML |
| Finestra delle impostazioni `ModConfig` | Il `Config.Bind()` di BepInEx, modificato nel file `.cfg` |
| Dati salvati tuoi | I `data.set` / `data.get` del gioco sulle unità funzionano uguale, vedi **[Salvare i dati](#/nml/saving-data)** |
| Pulsante di ricarica | Nessuno. Chiudi, compila, avvia |

Tutto quello che è normale codice del gioco, cioè quasi tutto di ogni pagina, funziona senza cambiare niente: asset, statistiche, stati, patch di Harmony, IA, leggi del mondo.

Quando qualcosa si rompe, **[Debug e pubblicazione](#/toolbox/bepinex-publishing)** ha gli errori che è più probabile incontrare.
