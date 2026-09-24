---
title: Modding avec BepInEx
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# Modding avec BepInEx :PES5_BigBrain:

La majeure partie de ce guide vous apprend à créer des mods pour **NeoModLoader**. NML vous permet d'écrire des fichiers `.cs` dans le Bloc-notes, de lancer le jeu et de voir votre code se compiler automatiquement.

BepInEx se moque éperdument de vos sentiments :PES2_Shrug:. C'est le cadre de modding historique et universel d'Unity. Créer un mod BepInEx implique de configurer un véritable projet C#, de compiler votre propre `.dll` et de la placer dans `BepInEx/plugins/`. Vous perdez le rechargement à chaud et les utilitaires d'assets faciles, mais vous gagnez un contrôle total sur Unity avant même que le jeu ne s'éveille.

## BepInEx face à NeoModLoader

Avant de passer un après-midi à configurer un pipeline de build, choisissez le bon outil :

| Vous voulez... | Choisissez | Pourquoi |
| --- | --- | --- |
| Ajouter des traits, objets, pouvoirs, créatures ou biomes | **NML** | NML fournit `AssetManager`, les textes localisés, les sprites et la sauvegarde gratuitement |
| Créer des outils de développement, des overlays ou des hooks bas niveau | **BepInEx** | BepInEx se charge au niveau du runtime Mono avant l'initialisation de WorldBox |
| Éditer du code avec le Bloc-notes et enregistrer | **NML** | NML compile les fichiers sources C# à la volée |
| Distribuer un plugin binaire précompilé avec des composants Unity bruts | **BepInEx** | Vous contrôlez directement le compilateur, les dépendances et la cible de build |

Si vous ajoutez du contenu de jeu, faites un mod NML. Si vous créez des outils comme UnityExplorer, BepInEx est fait pour vous.

## 1. Prérequis

1. Installez **BepInEx 5 (Mono x64)** et activez la console comme expliqué sur **[La console en direct (BepInEx)](#/toolbox/bepinex-console)**.
2. Installez le **[.NET SDK](https://dotnet.microsoft.com/)** (ou Visual Studio avec le développement .NET). Un véritable compilateur C# est requis.

## 2. Configuration du projet

Ouvrez un terminal dans le dossier de vos projets et générez une nouvelle bibliothèque de classes :

```bash
dotnet new classlib -n HelloBepInEx -f net472
cd HelloBepInEx
```

Ouvrez `HelloBepInEx.csproj` et ajoutez les références aux bibliothèques du jeu et de BepInEx :

```xml HelloBepInEx.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>HelloBepInEx</AssemblyName>
    <Version>1.0.0</Version>
    <LangVersion>latest</LangVersion>
  </PropertyGroup>

  <ItemGroup>
    <!-- Game assemblies from worldbox_Data/Managed -->
    <Reference Include="Assembly-CSharp">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\Assembly-CSharp.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="UnityEngine">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\UnityEngine.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="UnityEngine.CoreModule">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\UnityEngine.CoreModule.dll</HintPath>
      <Private>false</Private>
    </Reference>

    <!-- BepInEx and Harmony from BepInEx/core -->
    <Reference Include="BepInEx">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\core\BepInEx.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="0Harmony">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\core\0Harmony.dll</HintPath>
      <Private>false</Private>
    </Reference>
  </ItemGroup>
</Project>
```

Ajustez les chemins selon votre dossier Steam. `<Private>false</Private>` évite de recopier tout le moteur Unity dans votre dossier de sortie :PESgn_SMH:.

## 3. Le squelette du plugin

Un plugin BepInEx est une classe héritant de `BaseUnityPlugin` décorée de l'attribut `[BepInPlugin]` :

```csharp Plugin.cs
using BepInEx;
using BepInEx.Configuration;
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [BepInPlugin(PLUGIN_GUID, PLUGIN_NAME, PLUGIN_VERSION)]
    public class HelloPlugin : BaseUnityPlugin
    {
        public const string PLUGIN_GUID = "com.example.hellobepinex";
        public const string PLUGIN_NAME = "HelloBepInEx";
        public const string PLUGIN_VERSION = "1.0.0";

        private ConfigEntry<bool> configEnableLogs;
        private ConfigEntry<KeyCode> configHotkey;

        private void Awake()
        {
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

            Harmony harmony = new Harmony(PLUGIN_GUID);
            harmony.PatchAll();
        }

        private void Update()
        {
            if (Input.GetKeyDown(configHotkey.Value))
            {
                Logger.LogInfo("Hotkey pressed from BepInEx!");
            }
        }
    }
}
```

### Découpage des éléments clés

- **`BaseUnityPlugin`**: hérite directement de `MonoBehaviour`. Votre plugin devient un composant persistant attaché à un `GameObject` qui survit aux changements de scène.
- **`[BepInPlugin(guid, name, version)]`**: indique à BepInEx le nom et l'identifiant unique de votre mod en notation de domaine inversé (`com.auteur.nomdumod`).
- **`Logger.LogInfo()`**: envoie les messages directement dans la console en direct de BepInEx et dans `BepInEx/LogOutput.log`.
- **`Config.Bind()`**: enregistre un paramètre typé. Au premier lancement, BepInEx génère automatiquement un fichier `BepInEx/config/com.example.hellobepinex.cfg`.

## 4. Patcher le jeu avec Harmony

Dans BepInEx, Harmony est inclus directement dans `BepInEx/core/0Harmony.dll`. Créez une classe de patch dans votre projet :

```csharp Patches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [HarmonyPatch(typeof(World), nameof(World.init))]
    public static class WorldInitPatch
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            Debug.Log("[HelloBepInEx] World initialized from BepInEx patch!");
        }
    }
}
```

Comme `Plugin.cs` a appelé `harmony.PatchAll()`, BepInEx analyse l'assembly compilé et applique automatiquement tous les attributs de patch.

## 5. Compiler et installer

Compilez votre projet depuis votre terminal :

```bash
dotnet build -c Release
```

Votre `.dll` est créée dans `bin/Release/net472/HelloBepInEx.dll`.

1. Rendez-vous dans votre dossier WorldBox: `C:\Program Files (x86)\Steam\steamapps\common\worldbox\`.
2. Dans `BepInEx/plugins/`, créez un dossier nommé `HelloBepInEx`.
3. Copiez `HelloBepInEx.dll` dans `BepInEx/plugins/HelloBepInEx/`.

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

Lancez le jeu avec la console activée :

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

## Vérités crues sur le modding BepInEx

- **Pas de rechargement à chaud** : changer une ligne de code, c'est fermer WorldBox, lancer `dotnet build` et relancer le jeu. Si vous réglez l'équilibre des combats ou les nombres des traits, ça devient vite pénible.
- **`HideManagerGameObject`** : dans `BepInEx/config/BepInEx.cfg`, vérifiez que `HideManagerGameObject = true` est défini. Sans ça, certaines routines de nettoyage d'Unity peuvent détruire l'objet racine de BepInEx et tuer votre plugin sans bruit :PES5_Hmmmm:.
- **Cohabiter avec NML** : NML et BepInEx vivent très bien dans le même dossier de jeu. Vous pouvez utiliser NML pour vos mods de contenu et BepInEx pour des outils de développement comme UnityExplorer sans qu'ils se battent.
- **Accéder aux assets du jeu** : BepInEx tourne au niveau brut d'Unity. Si vous voulez faire apparaître des créatures, enregistrer des objets ou modifier des traits depuis un plugin BepInEx, vous devez attendre que WorldBox ait fini d'initialiser son `AssetManager`, ou référencer `NeoModLoader.dll` et laisser NML faire le gros du travail.
