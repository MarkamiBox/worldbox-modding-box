---
title: Modding avec BepInEx
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# Modding avec BepInEx :PES5_BigBrain:

La plus grande partie de ce guide vous apprend à écrire des mods pour **NeoModLoader**. Avec NML, vous écrivez de simples fichiers `.cs` dans le Bloc-notes, vous lancez le jeu et votre code se compile tout seul.

BepInEx se moque de vos sentiments :PES2_Shrug:. C'est le framework de modding vétéran et universel pour Unity. Faire un mod BepInEx, c'est monter un vrai projet C#, compiler votre propre `.dll` et la déposer dans `BepInEx/plugins/`. Vous perdez le rechargement instantané et les aides pratiques pour les assets, mais vous gagnez le contrôle total du processus Unity avant même que le jeu sache qu'il est réveillé.

Cette partie du guide a trois pages : celle-ci fait tourner un plugin, **[Ajouter du contenu avec BepInEx](#/toolbox/bepinex-content)** lui fait ajouter de vraies choses au jeu, et **[Débogage et publication](#/toolbox/bepinex-publishing)** l'amène jusqu'aux autres.

## BepInEx ou NeoModLoader

Avant de passer un après-midi à monter une chaîne de compilation, choisissez le bon outil :

| Vous voulez... | Prenez | Pourquoi |
| --- | --- | --- |
| Ajouter des traits, des objets (item), des pouvoirs divins (GodPower), des créatures ou des biomes | **NML** | NML vous donne `AssetManager` au bon moment, un dossier `Locales`, `GameResources/`, des boutons et des aides de sauvegarde gratuitement |
| Créer des outils de développement, des overlays ou des hooks du moteur | **BepInEx** | BepInEx démarre au niveau de Mono, avant que WorldBox ne s'initialise |
| Éditer du code dans le Bloc-notes et sauvegarder | **NML** | NML compile les fichiers source C# pendant l'exécution |
| Livrer un plugin déjà compilé avec des composants Unity purs | **BepInEx** | Vous contrôlez vous-même les options du compilateur, les dépendances et la cible |

Si vous ajoutez du contenu au jeu, écrivez un mod NML. Si vous créez un outil comme UnityExplorer, ou si vous adorez regarder la sortie de MSBuild dans votre terminal, BepInEx est fait pour vous. Vous *pouvez* ajouter du contenu avec BepInEx, la page suivante montre comment, mais vous refaites à la main ce que NML vous offre.

## 1. Prérequis

1. Installez **BepInEx 5 (Mono x64)** et activez la console comme expliqué sur **[La console en direct (BepInEx)](#/toolbox/bepinex-console)**. Lancez le jeu une fois pour que BepInEx crée ses dossiers.
2. Installez le **[.NET SDK](https://dotnet.microsoft.com/)** (ou Visual Studio avec le développement bureau .NET). Il vous faut un vrai compilateur C# pour les plugins BepInEx.

## 2. Préparer le projet

Ouvrez un terminal dans le dossier où vous rangez vos projets et créez une nouvelle bibliothèque de classes :

```bash
dotnet new classlib -n HelloBepInEx
cd HelloBepInEx
```

Remplacez ensuite tout le contenu de `HelloBepInEx.csproj` par ceci. Il cible la même version de .NET que le jeu, indique votre dossier WorldBox une seule fois, et fait trois tâches pour vous à chaque compilation :

```xml HelloBepInEx.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>HelloBepInEx</AssemblyName>
    <Version>1.0.0</Version>
    <LangVersion>latest</LangVersion>
    <!-- Your WorldBox folder. Change this one line if Steam lives on another drive. -->
    <GameDir>C:\Program Files (x86)\Steam\steamapps\common\worldbox</GameDir>
  </PropertyGroup>

  <ItemGroup>
    <!-- Lets you build for net472 without installing the old .NET Framework developer pack -->
    <PackageReference Include="Microsoft.NETFramework.ReferenceAssemblies" Version="1.0.3" PrivateAssets="all" />
    <!-- Makes internal and private game code visible to your compiler, like NML does -->
    <PackageReference Include="BepInEx.AssemblyPublicizer.MSBuild" Version="0.4.3" PrivateAssets="all" />
  </ItemGroup>

  <ItemGroup>
    <!-- The game, publicized -->
    <Reference Include="$(GameDir)\worldbox_Data\Managed\Assembly-CSharp.dll" Publicize="true" Private="false" />
    <!-- Every Unity module: UnityEngine.dll alone does not have Input, UI or ImageConversion -->
    <Reference Include="$(GameDir)\worldbox_Data\Managed\UnityEngine*.dll" Private="false" />
    <!-- BepInEx and Harmony -->
    <Reference Include="$(GameDir)\BepInEx\core\BepInEx.dll" Private="false" />
    <Reference Include="$(GameDir)\BepInEx\core\0Harmony.dll" Private="false" />
  </ItemGroup>

  <!-- After every build, copy the plugin straight into the game -->
  <Target Name="CopyToGame" AfterTargets="Build">
    <Copy SourceFiles="$(TargetPath)" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
  </Target>
</Project>
```

À quoi sert chaque partie :

- **`Private="false"`** sur chaque référence au jeu : votre dossier de compilation ne recopie pas tout le moteur du jeu :PESgn_SMH:.
- **`Publicize="true"`** : les pages NML du guide utilisent tout le temps des membres `internal` du jeu, parce que NML compile contre un jeu « publicisé ». Votre projet BepInEx ne le fait pas, sauf si vous le demandez. Avec ça, le même code compile ici aussi. Les numéros de version dans `PackageReference` étaient les plus récents stables au moment où j'ai écrit ceci ; si NuGet se plaint, prenez le plus récent qu'il propose.
- **`UnityEngine*.dll`** : Unity est découpé en nombreux modules. `Input` vit dans `UnityEngine.InputLegacyModule.dll`, l'interface dans `UnityEngine.UI.dll`, et ainsi de suite. Tous les référencer vous évite la chasse au « type introuvable ».
- **`CopyToGame`** : fini de copier la `.dll` à la main. Compilez, lancez le jeu, c'est fait.

## 3. Le squelette du plugin

Un plugin BepInEx est une classe qui hérite de `BaseUnityPlugin` et porte l'attribut `[BepInPlugin]` :

```csharp Plugin.cs
using BepInEx;
using BepInEx.Configuration;
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [BepInPlugin(PLUGIN_GUID, PLUGIN_NAME, PLUGIN_VERSION)]
    [BepInProcess("worldbox.exe")]
    public class HelloPlugin : BaseUnityPlugin
    {
        public const string PLUGIN_GUID = "com.example.hellobepinex";
        public const string PLUGIN_NAME = "HelloBepInEx";
        public const string PLUGIN_VERSION = "1.0.0";

        // BepInEx manages configuration files automatically
        private ConfigEntry<bool> configEnableLogs;
        private ConfigEntry<KeyCode> configHotkey;

        private void Awake()
        {
            // Bind configuration: section, key, default value, description
            configEnableLogs = Config.Bind(
                "General",
                "EnableLogs",
                true,
                "Print debug messages to the BepInEx console."
            );

            configHotkey = Config.Bind(
                "Controls",
                "ToggleKey",
                KeyCode.F7,
                "Key to press to trigger the plugin action."
            );

            if (configEnableLogs.Value)
            {
                Logger.LogInfo($"{PLUGIN_NAME} loaded successfully!");
            }

            // Apply any Harmony patches in this assembly
            Harmony harmony = new Harmony(PLUGIN_GUID);
            harmony.PatchAll();
        }

        private void Update()
        {
            // Standard Unity Update cycle
            if (Input.GetKeyDown(configHotkey.Value))
            {
                Logger.LogInfo("Hotkey pressed from BepInEx!");
            }
        }
    }
}
```

### Les parties une à une

- **`BaseUnityPlugin`** : hérite directement du `MonoBehaviour` de Unity. Votre plugin est un composant actif sur un `GameObject` persistant qui survit aux changements de scène.
- **`[BepInPlugin(guid, name, version)]`** : dit à BepInEx comment s'appelle votre mod et quel est son identifiant unique. Utilisez la forme de domaine inversé (`com.author.modname`) et ne changez jamais le GUID après la sortie : le fichier de config et les dépendances des autres plugins en dépendent.
- **`[BepInProcess("worldbox.exe")]`** : ne charger que dans WorldBox. Sans danger ici, et ça évite un plantage déroutant si quelqu'un met votre plugin dans le BepInEx d'un autre jeu.
- **`Logger.LogInfo()`** : écrit directement dans la console en direct de BepInEx et dans `BepInEx/LogOutput.log`.
- **`Config.Bind()`** : crée un réglage typé. Au premier lancement, BepInEx génère un fichier `BepInEx/config/com.example.hellobepinex.cfg` propre que les joueurs peuvent modifier.

## 4. Se brancher sur le jeu avec Harmony

Avec BepInEx, Harmony est fourni dans `BepInEx/core/0Harmony.dll`. Ajoutez une classe de patch n'importe où dans votre projet :

```csharp Patches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    // MapBox.startTheGame runs once the world exists: it is where the game sets Config.game_loaded
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.startTheGame))]
    public static class StartTheGamePatch
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            Debug.Log("[HelloBepInEx] The world is ready!");
        }
    }
}
```

Comme `Plugin.cs` a appelé `harmony.PatchAll()`, Harmony parcourt votre assembly compilée et applique toutes les classes de patch qu'elle contient. Tout ce que vous savez des **[Patchs Harmony](#/nml/harmony-patches)** marche pareil ici : les noms de paramètres magiques, Prefix et Postfix, les règles pour ne pas casser les autres mods.

## 5. Compiler et installer

Compilez votre projet en ligne de commande :

```bash
dotnet build -c Release
```

Votre `.dll` est créée dans `bin/Release/net472/HelloBepInEx.dll`, et l'étape `CopyToGame` la dépose directement dans le jeu :

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

Lancez le jeu avec la console activée. Vous verrez BepInEx trouver et charger votre assembly :

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

> [!WARNING] Fermez le jeu avant de compiler
> Tant que WorldBox tourne, il garde votre `.dll` ouverte, et la copie échoue avec « the process cannot access the file ». Fermez le jeu, compilez, relancez. C'est toute la boucle de développement avec BepInEx :PES2_Weary:.

## Les dures vérités du modding BepInEx

- **Pas de rechargement à chaud** : changer une ligne de code veut dire fermer WorldBox, lancer `dotnet build` et relancer le jeu. Si vous réglez l'équilibre des combats ou les nombres d'un trait, ça lasse vite. Il y a une demi-solution sur **[Débogage et publication](#/toolbox/bepinex-publishing)**.
- **`HideManagerGameObject`** : dans `BepInEx/config/BepInEx.cfg`, mettez `HideManagerGameObject = true` sous `[Chainloader]`. Sans ça, certaines routines de nettoyage de Unity peuvent détruire l'objet racine de BepInEx et tuer votre plugin en silence :PES5_Hmmmm:.
- **Avec NML** : NML et BepInEx cohabitent sans souci dans le même dossier de jeu. Vous pouvez utiliser NML pour vos mods de contenu et BepInEx pour des outils comme UnityExplorer sans qu'ils se battent.
- **Accès aux assets du jeu** : votre plugin se réveille avant que le jeu ait construit ses bibliothèques (library) d'assets. Touchez `AssetManager` dans `Awake()` et vous obtenez des nulls. La page suivante, **[Ajouter du contenu avec BepInEx](#/toolbox/bepinex-content)**, montre le moment exact où se brancher.
