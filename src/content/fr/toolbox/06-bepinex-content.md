---
title: Ajouter du contenu avec BepInEx
group: BepInEx Modding
icon: :wbhammer:
order: 2
---

# Ajouter du contenu avec BepInEx :wbhammer:

Un plugin BepInEx peut ajouter des traits, des objets (item) et des pouvoirs (GodPower) comme n'importe quel mod NML. Il doit juste faire à la main les trois tâches que NML fait pour vous sans rien dire : attendre le jeu, charger le texte et charger les images. Cette page fait les trois pour le même trait **Swift** que construit la page **[Traits personnalisés](#/nml/custom-traits)**, pour que vous puissiez comparer les deux ligne par ligne.

Si vous n'avez pas encore de projet, commencez par **[Modding avec BepInEx](#/toolbox/bepinex-modding)**.

## Le bon moment

Le `Awake()` de votre plugin s'exécute très tôt, avant que WorldBox ait construit la moindre bibliothèque (library) d'assets. `AssetManager.traits` y vaut encore null, et y toucher, c'est une `NullReferenceException` avant même que le menu principal s'affiche.

Le moment qu'il vous faut, c'est la fin de `AssetManager.init()`. Cette seule méthode publique construit toutes les bibliothèques, puis lance `post_init()` et `linkAssets()` de chacune. Un Postfix Harmony dessus s'exécute juste après, exactement là où vit aussi le `OnModLoad` d'un mod NML. Tout ce que disent les pages NML sur « le jeu a fait ça au démarrage, avant que votre mod existe, alors faites-le vous-même » s'applique ici mot pour mot.

## Le code

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

Compilez, lancez le jeu, ouvrez une unité, et Swift est dans l'onglet `physique` avec son nom, sa description et son icône.

> [!NOTE] `LocalizedTextManager.instance.language` est internal
> Ça compile parce que le projet de **[Modding avec BepInEx](#/toolbox/bepinex-modding)** publicise le jeu. Sans le publicizer, vous devriez retenir la langue vous-même.

## Les trois tâches, une par une

### Attendre le jeu

| NML | BepInEx |
| --- | --- |
| `OnModLoad()` s'exécute quand les bibliothèques sont prêtes | Un Postfix sur `AssetManager.init()` |
| NML s'assure qu'il ne tourne qu'une fois | À vous de le faire : la variable `done` empêche un second passage si `Awake()` l'a déjà appelé |

Si vous enregistrez quelque chose au mauvais moment, le log vous le dit : une `NullReferenceException` qui pointe sur `AssetManager.<quelque chose>` veut dire trop tôt.

### Le texte

NML lit votre dossier `Locales/` et le réapplique à chaque changement de langue. Avec BepInEx vous faites les deux vous-même, et le patch sur `setLanguage` est la partie que tout le monde oublie : en anglais tout marche, le joueur passe en italien, et votre trait s'appelle soudain `trait_hello_swift` :wbfacepalm:.

Les noms des clés sont les mêmes que partout ailleurs dans le guide, donc le tableau de **[Localisation](#/nml/localization)** reste valable. `LocalizedTextManager.add` met la clé en snake_case pour vous, comme les fichiers du jeu.

### Vos propres images

Il n'y a pas de dossier `GameResources/` dans BepInEx. Ce qu'il y a, c'est `SpriteTextureLoader.addSprite(path, bytes)` : il lit un PNG depuis n'importe où et l'enregistre sous le chemin de votre choix, avec un pivot au centre et un filtrage pixel art. Ensuite, `path_icon = "ui/Icons/iconHelloSwift"` le trouve comme un sprite vanilla.

Deux règles :

- **Enregistrez-le avant que quoi que ce soit ne demande ce chemin.** Le jeu retient chaque chemin qu'il a cherché, même un échec, et `addSprite` refuse un chemin déjà retenu. Le faire tout en haut de `Register()` est sûr.
- **C'est une image, pas un dossier d'images.** Les icônes, les icônes d'objets et les boutons de pouvoirs sont des images seules, donc ça marche. Tout ce que le guide marque comme **dossier** (animations de drops, effets de statut, projectiles, tuiles, sprites de bâtiments) est chargé avec `getSpriteList()`, que `addSprite` ne remplit pas. Pour ceux-là, empruntez un chemin vanilla, ou faites cette partie de votre mod avec NML.

Mettez le PNG à côté de votre `.dll` :

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

Pour que la compilation le copie aussi, ajoutez une ligne à la cible `CopyToGame` de votre `.csproj` :

```xml HelloBepInEx.csproj
<Copy SourceFiles="iconHelloSwift.png" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
```

## Ce qui ne vient pas de NML

Certaines pages s'appuient sur des aides de NML qui n'existent pas dans BepInEx. Voici quoi faire à la place :

| La page NML utilise | Avec BepInEx |
| --- | --- |
| Dossier `Locales/` | Le modèle `AddText()` ci-dessus |
| `GameResources/` | `SpriteTextureLoader.addSprite` pour les images seules, des chemins vanilla pour les dossiers |
| `TabManager`, `PowerButtonCreator` (boutons de pouvoirs) | Pas d'équivalent. Construisez l'interface vous-même avec Unity, ou mettez les boutons dans un mod NML |
| Fenêtre de réglages `ModConfig` | Le `Config.Bind()` de BepInEx, modifié dans le fichier `.cfg` |
| Données de sauvegarde perso | Les `data.set` / `data.get` du jeu sur les unités marchent pareil, voir **[Sauvegarder des données](#/nml/saving-data)** |
| Bouton de rechargement | Aucun. Fermer, compiler, lancer |

Tout ce qui est du code de jeu normal, c'est-à-dire la plus grande partie de chaque page, marche sans changement : assets, statistiques, statuts, patchs Harmony, IA, lois du monde.

Quand ça casse, **[Débogage et publication](#/toolbox/bepinex-publishing)** liste les erreurs que vous rencontrerez le plus probablement.
