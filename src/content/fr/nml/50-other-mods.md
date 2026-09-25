---
title: Les autres mods
group: Modding NML
subgroup: Avancé et publication
icon: :wbmodders:
order: 45
---

# Les autres mods :wbmodders:

Votre mod ne vit pas dans un monde vide. Un joueur peut installer HelloBox à côté de vingt autres mods, dont la moitié essaie aussi de modifier le combat, d'ajuster les lois du monde ou d'ajouter de nouveaux traits.

Parfois vous voulez coopérer avec eux : activer des fonctionnalités supplémentaires si un mod partenaire est installé, patcher leurs méthodes en toute sécurité sans planter s'ils sont absents, ou vous assurer que vos assets s'enregistrent dans le bon ordre.

Il existe deux façons de dialoguer avec d'autres mods : à la compilation via `mod.json`, ou à l'exécution via du code.

## Déclarer des dépendances dans mod.json

L'intégration la plus propre consiste à déclarer la relation dans votre `mod.json` :

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "Markami",
  "version": "1.0.0",
  "description": "My first mod",
  "iconPath": "icon.png",
  "GUID": "com.markami.hellobox",
  "Dependencies": [],
  "OptionalDependencies": [
    "com.friend.coolmod"
  ],
  "IncompatibleWith": []
}
```

| Clé | Ce qu'elle fait |
| --- | --- |
| `Dependencies` | Dépendance stricte. NML garantit que ces mods se chargent **avant** le vôtre. Si l'un d'eux est absent ou échoue à compiler, NML refuse purement et simplement de charger votre mod |
| `OptionalDependencies` | Dépendance souple. Si l'autre mod est installé, NML le charge avant le vôtre **et** définit un symbole de compilation pour lui. S'il est absent, votre mod se charge normalement |
| `IncompatibleWith` | Liste noire. Si l'un des mods de cette liste est présent, NML signale un conflit et empêche les deux de tourner ensemble |

### Le symbole #if à la compilation

Quand un mod listé dans `OptionalDependencies` est installé et compilé, NML définit une constante de préprocesseur pour vous.

Le symbole est le GUID de l'autre mod converti en majuscules, avec tous les caractères non alphanumériques remplacés par des tirets du bas :

| GUID dans `mod.json` | Symbole de compilation défini |
| --- | --- |
| `com.friend.coolmod` | `COM_FRIEND_COOLMOD` |
| `com.author.magic-items` | `COM_AUTHOR_MAGIC_ITEMS` |

Enveloppez votre code d'intégration dans un `#if` :

```csharp Mods/HelloBox/Code/HelloIntegration.cs
namespace HelloBox
{
    public static class HelloIntegration
    {
        public static void Initialize()
        {
#if COM_FRIEND_COOLMOD
            // Compilé uniquement quand cet autre mod est présent et actif
            ApplyCoolModSynergy();
#endif
        }

#if COM_FRIEND_COOLMOD
        private static void ApplyCoolModSynergy()
        {
            // Sûr de référencer leurs types directement ici
            Main.Log("CoolMod found! Enabling partner synergies.");
        }
#endif
    }
}
```

> [!WARNING] Un symbole mal orthographié échoue en silence
> Si vous écrivez `#if COM_FRIEND_COOL_MOD` au lieu de `#if COM_FRIEND_COOLMOD`, le compilateur voit un symbole non défini et retire silencieusement votre bloc de code. Il ne s'exécutera jamais, sans aucune erreur ni avertissement dans le log :PES4_1IQ:. Vérifiez toujours la conversion exacte du GUID.

## Vérifier à l'exécution

L'astuce `#if` ne fonctionne que lorsque NML compile votre mod depuis les sources, et seulement si l'autre mod est déclaré dans `OptionalDependencies`.

Si vous distribuez une `.dll` précompilée, ou si vous voulez détecter des mods dynamiquement sans recompiler, faites la vérification à l'exécution.

### Vérifier les assemblies chargées

Vous pouvez vérifier si l'assembly de l'autre mod est chargée dans l'AppDomain courant :

```csharp
using System;
using System.Linq;

public static bool IsModLoaded(string pAssemblyName)
{
    return AppDomain.CurrentDomain.GetAssemblies()
        .Any(a => string.Equals(a.GetName().Name, pAssemblyName, StringComparison.OrdinalIgnoreCase));
}
```

Ou demandez à `AccessTools` de Harmony si l'une de leurs classes existe :

```csharp
using HarmonyLib;

bool hasPartner = AccessTools.TypeByName("PartnerNamespace.PartnerMain") != null;
```

Si `AccessTools.TypeByName` retourne un `Type` non nul, leur code est chargé et prêt.

## Patcher un autre mod avec Harmony

Patcher une méthode vanilla est simple. Patcher une méthode qui vit dans un autre mod cache un piège énorme :wbfacepalm:.

Si vous écrivez une classe de patch normale référençant leur type :

```csharp
// NEVER do this for an optional mod!
[HarmonyPatch(typeof(PartnerMod.SomeClass), "SomeMethod")]
public static class BadCrossModPatch
{
    public static void Postfix() { }
}
```

Le runtime Mono essaie de résoudre `PartnerMod.SomeClass` dès qu'il charge votre classe de patch. Si le joueur n'a pas ce mod installé, tout votre mod plante avec un `TypeLoadException` ou un `FileNotFoundException` avant même que votre `Initialize()` ne se termine !

À la place, patchez-la **manuellement** avec `AccessTools` :

```csharp Mods/HelloBox/Code/HelloCrossPatch.cs
using System;
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCrossPatch
    {
        public static void ApplyIfPresent(Harmony pPatchEngine)
        {
            Type targetType = AccessTools.TypeByName("PartnerMod.SomeClass");
            if (targetType == null)
            {
                // L'autre mod n'est pas installé. On passe son chemin, tranquillement.
                return;
            }

            MethodInfo targetMethod = AccessTools.Method(targetType, "SomeMethod");
            if (targetMethod == null)
            {
                Main.LogWarning("PartnerMod found, but SomeMethod was not found. Outdated version?");
                return;
            }

            MethodInfo postfix = typeof(HelloCrossPatch).GetMethod(nameof(Postfix), BindingFlags.Static | BindingFlags.NonPublic);
            pPatchEngine.Patch(targetMethod, postfix: new HarmonyMethod(postfix));
            Main.Log("Successfully hooked PartnerMod.SomeMethod!");
        }

        private static void Postfix()
        {
            // S'exécute après leur méthode, uniquement si leur mod est installé
        }
    }
}
```

Le patch manuel garde la référence de type sous forme de chaîne, donc le runtime n'essaie jamais de charger une assembly absente.

## Le piège de l'ordre de chargement

Quand vous clonez ou référencez le contenu d'un autre mod, le timing est primordial.

```csharp
// If their mod hasn't run Initialize() yet, this throws NullReferenceException!
AssetManager.traits.clone("hello_super_trait", "partner_custom_trait");
```

NML charge les mods dans l'ordre des dépendances. Si vous placez l'autre mod dans `Dependencies` ou `OptionalDependencies`, NML garantit que leur `Initialize()` s'exécute **avant** le vôtre.

Si vous ne l'avez *pas* déclaré comme dépendance, l'ordre de chargement entre mods n'est pas spécifié. Toujours :
1. Déclarez l'autre mod dans `OptionalDependencies`.
2. Protégez-vous avec `AssetManager.traits.has(...)` avant de cloner ou de lire leurs assets.

## Partager des données sans conflits

WorldBox vous donne des dictionnaires flexibles pour stocker des données personnalisées sur les créatures (`actor.data`) et sur les mondes (`World.world.map_stats.custom_data`).

Chaque mod partage ces mêmes dictionnaires. Si vous écrivez :

```csharp
// Bad: someone else might use "level" too
actor.data.set("level", 5);
```

Un autre mod peut écrire dans `"level"` sur la même frame avec des hypothèses complètement différentes.

Préfixez toujours vos clés de données personnalisées avec le préfixe de votre mod :

```csharp
actor.data.set("hello_level", 5);
int myLevel = actor.data.get("hello_level", 0);
```

Suite : **[Publier votre mod](#/nml/publishing)** ou gérez la vitesse de simulation et les options dans **[Options de jeu et vitesses](#/nml/game-options)**.
