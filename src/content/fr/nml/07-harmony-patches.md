---
title: Patchs Harmony
group: Modding NML
subgroup: Avancé et publication
icon: :wbhammer:
order: 42
---

# Patchs Harmony :wbhammer:

Tout ce qui se trouve sur les autres pages **ajoute** du contenu à WorldBox : un trait, une arme, un bâtiment. Harmony sert à l'autre moitié du modding : **modifier ce que le jeu fait déjà**.

Vous ne pouvez pas modifier le code du jeu directement. Il est compilé, distribué sous forme de `Assembly-CSharp.dll`, et la moindre mise à jour écraserait vos changements. Harmony est la bibliothèque qui vous permet de greffer votre propre code sur une méthode existante pendant que le jeu tourne.

> [!NOTE] Vous n'avez jamais écrit de code ?
> Lisez "Qu'est-ce qu'une méthode" et "Le pense-bête", puis allez créer quelque chose depuis les pages **Contenu du jeu** avant de revenir. Harmony n'est pas difficile, mais c'est le premier outil capable de casser les mods *des autres*, et vos patchs seront bien meilleurs après avoir vu comment sont agencés les assets du jeu :PES_Wise:.

## Ce qu'est une méthode

Une **méthode** est une action nommée au sein du code du jeu. Quelques exemples réels :

| Méthode | Quand le jeu l'exécute |
| --- | --- |
| `Actor.updateStats()` | Chaque fois que les statistiques d'une unité doivent être recalculées |
| `Actor.getHit(...)` | Chaque fois qu'une unité subit des dégâts |
| `City.makeWarrior(...)` | Chaque fois qu'une ville transforme un citoyen en soldat |

Le jeu en appelle des milliers par seconde. Chacune d'elles est un point d'ancrage potentiel pour votre code.

## Le post-it

Imaginez une méthode comme une page dans le livre de recettes du jeu. Harmony ne réécrit pas la page : il y agrafe deux notes adhésives :

```text
┌─────────────────────────────┐
│  VOTRE PREFIX               │  <- s'exécute AVANT le code du jeu
├─────────────────────────────┤
│  code original du jeu       │  <- intact
├─────────────────────────────┤
│  VOTRE POSTFIX              │  <- s'exécute APRÈS le code du jeu
└─────────────────────────────┘
```

- Un **Prefix** intercepte les paramètres avant le jeu. Il peut les modifier ou annuler complètement l'exécution.
- Un **Postfix** voit le résultat une fois le travail du jeu terminé. Il peut retoucher ce résultat ou simplement réagir à celui-ci.

Voilà 95 % de ce qu'est Harmony. Le reste de cette page n'est que détails pratiques.

## Activer Harmony

Une seule ligne, une seule fois dans `OnModLoad`. Elle examine votre mod à la recherche de patchs et applique tous ceux qu'elle trouve :

```csharp Mods/HelloBox/Code/Main.cs
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");

            // "com.yourname.hellobox" est votre GUID. Harmony signe vos patchs avec,
            // ainsi en cas de conflit les logs indiquent clairement à qui la faute.
            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
        }
    }
}
```

`Assembly.GetExecutingAssembly()` signifie "uniquement mes propres fichiers". Ce n'est pas décoratif : sans cela, `PatchAll()` inspecte l'assembly depuis lequel il a été appelé, et un mauvais jour, ce sera le mod de quelqu'un d'autre :PESgn_Yikes:.

## Ton premier patch, ligne par ligne

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPatches
    {
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Actor_UpdateStats
        {
            public static void Postfix(Actor __instance)
            {
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

Six choses se produisent ici :

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`** : l'adresse. "La méthode nommée `updateStats` dans la classe `Actor`." Une ligne entre crochets est un *attribut* : une étiquette pour le compilateur, pas du code exécutable.
- **`public static class Patch_Actor_UpdateStats`** : un conteneur. Le nom vous appartient et ne change rien au comportement, mais votre futur vous remerciera pour `Patch_<Classe>_<Méthode>`.
- **`public static void Postfix(...)`** : ce nom ne vous appartient **pas**. Harmony recherche spécifiquement des méthodes nommées `Prefix`, `Postfix` ou `Finalizer`. Écrivez `postfix` en minuscules et rien ne se passera, sans la moindre erreur :PESgn_ButWhy:.
- **`Actor __instance`** : **deux** traits de soulignement. C'est l'unité exacte sur laquelle le jeu travaille en ce moment. Sans cela, vous savez *qu'une* unité a été recalculée, mais pas *laquelle*.
- **`if (!__instance.hasTrait(...)) return;`** : sortie rapide. Votre patch s'exécute pour chaque unité du monde, en permanence. Faites en sorte que le cas général se règle en un test et un `return`.
- **`stats["speed"] += 20f;`** : la modification concrète. `updateStats` réinitialise le bloc de stats au début, donc ajouter dans le Postfix s'applique sur une base propre plutôt que de s'empiler à chaque tick.

## Les noms magiques des paramètres

Harmony injecte vos paramètres **par leur nom**. Voici ceux qui comptent, et les tirets du bas font partie intégrante du nom :

| Nom | Ce que vous recevez |
| --- | --- |
| `__instance` | L'objet sur lequel la méthode a été appelée. À omettre pour une méthode `static` |
| `__result` | La valeur de retour de la méthode. Déclarez-la en `ref` pour la modifier. Uniquement en Postfix |
| `___someField` | **Trois** tirets : un champ privé de l'objet, orthographié exactement comme dans le jeu |
| `__state` | Une valeur que votre Prefix transmet à votre propre Postfix |
| n'importe quel paramètre réel | L'argument transmis par l'appelant, nommé **exactement** comme dans le jeu |

C'est sur cette dernière ligne que tout le monde trébuche. Si le jeu déclare `getHit(float pDamage, ...)`, votre paramètre doit s'appeler `pDamage`. Pas `damage`, pas `pDmg`. Vous pouvez omettre les paramètres inutiles, mais ceux que vous déclarez doivent correspondre mot pour mot, et dans ce jeu ils commencent presque tous par `p`.

## Modifier un résultat

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    // ref signifie "vous pouvez modifier ceci", et votre valeur sera celle reçue par l'appelant.
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;

        __result *= 1.5f;
    }
}
```

Ajustez, n'écrasez pas aveuglément. `__result *= 1.5f` fonctionne harmonieusement si un autre mod a patché la même méthode. `__result = 12f` jette son travail à la poubelle et déclenche une dispute dans vos commentaires.


## Modifier un nombre codé en dur dans le jeu

La moitié des demandes du type "quelqu'un peut-il faire un mod qui..." ne concerne qu'un seul nombre. "Les villes deviennent trop grandes" n'est rien d'autre que cela, tiré directement de la classe `City` du jeu :

```csharp Assembly-CSharp / City
public int getZoneRange(bool pAllowCheat = true)
{
    if (pAllowCheat && DebugConfig.isOn(DebugOption.CityUnlimitedZoneRange))
    {
        return 999;
    }
    return 13;
}
```

Une méthode qui renvoie une constante est la chose la plus simple à modifier dans le jeu. Vous ne touchez pas à la constante, vous ajustez ce qui en sort :

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBox
{
    [HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
    public static class Patch_City_ZoneRange
    {
        private const float SCALE = 0.5f;   // villes deux fois plus petites

        public static void Postfix(ref int __result)
        {
            // 999 est l'option de débogage "unlimited zone range". Ne touchez pas au cheat du joueur
            if (__result == 999) return;

            __result = Mathf.Max(1, Mathf.RoundToInt(__result * SCALE));
        }
    }
}
```

Placez `SCALE` derrière un curseur de **[Configuration du mod](#/nml/mod-config)** et les joueurs pourront l'ajuster eux-mêmes.

Trouver la méthode est le vrai travail. Cherchez dans **dnSpy** le nombre que vous voyez en jeu (13 zones, 2 armes, 5 ans), ou le nom de la règle ("zone", "limit", "max"). Une constante située dans une petite méthode est un Postfix. Une constante enfouie au milieu d'une méthode longue nécessite un transpiler, et c'est là que cette page s'arrête :PES2_Shrug:.

## Annuler la méthode originale

Un Prefix renvoyant un `bool` décide si le code original du jeu doit s'exécuter ou non :

```csharp
[HarmonyPatch(typeof(Actor), "getHit")]
public static class Patch_Actor_GetHit
{
    public static bool Prefix(Actor __instance, float pDamage)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return true;

        // false = ignorer complètement le getHit original. L'unité ne subit aucun dégât.
        return false;
    }
}
```

Observez bien la structure : le cas particulier renvoie `false`, et **tous les autres cas renvoient `true`**. Oubliez ce `return true` et vous venez de désactiver les dégâts pour le monde entier.

> [!WARNING] `return false` est l'option nucléaire
> Cela n'annule pas seulement *votre* vision de la méthode. Cela annule celle de **tout le monde** : le code du jeu ainsi que tous les Prefix et Postfix des autres mods sur cette méthode. Une méthode vanilla fait souvent cinq choses insoupçonnées, et l'annuler les désactive toutes en silence.
>
> Avant d'écrire `return false`, vérifiez si un Postfix ne suffirait pas. "Soigner les dégâts après coup" casse bien moins de choses que "les dégâts n'ont jamais existé" :PES3_Balance:.

## Deux façons d'écrire le nom de la méthode

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // méthode publique
[HarmonyPatch(typeof(Actor), "updateStats")]             // tout le reste
```

`nameof` est préférable car une coquille devient une erreur de compilation au lieu d'un patch qui ne s'applique jamais en silence. Mais `nameof` ne fonctionne que sur les membres visibles par votre code, et une grande partie de WorldBox est `internal` ou `private`. Pour ceux-là, la chaîne de caractères brute est la seule option : vérifiez l'orthographe dans le code réel via **[Lire le code du jeu](#/toolbox/reading-the-game-code)**.

## Quand deux méthodes partagent le même nom

Si deux méthodes partagent le même nom, classe + nom devient ambigu et Harmony refuse de deviner. Précisez les types de paramètres :

```csharp
[HarmonyPatch(typeof(World), "GetTile", new System.Type[] { typeof(int), typeof(int) })]
```

## Patchs nécessitant un avant et un après

`__state` est une valeur que votre Prefix transmet à votre Postfix pour ce même appel. Utilisez-le pour mémoriser l'état d'une variable avant que le jeu n'y touche :

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_StatDelta
{
    public static void Prefix(Actor __instance, out float __state)
    {
        __state = __instance.stats["health"];
    }

    public static void Postfix(Actor __instance, float __state)
    {
        if (__instance.stats["health"] < __state) { /* quelque chose a retiré des points de vie */ }
    }
}
```

## Quand ça ne fonctionne pas

| Ce que vous voyez | La cause la plus probable |
| --- | --- |
| Rien ne se passe, rien dans les logs | `Postfix` mal orthographié, ou `PatchAll` jamais appelé |
| `HarmonyException` / `MissingMethodException` au démarrage | Cette classe ou cette méthode n'existe pas. Vérifiez dans dnSpy |
| `Ambiguous match found` | Plusieurs surcharges. Ajoutez l'argument `Type[]` montré plus haut |
| `NullReferenceException` dans votre patch | `__instance` ou l'un de ses champs est null. Les patchs tournent dans des états hors-jeu : pendant le chargement, à la mort, sur des objets détruits |
| Le jeu tourne à 3 FPS | Vous avez patché une méthode appelée des milliers de fois par seconde avec des calculs lourds |
| Fonctionne seul, casse avec un autre mod | L'un de vous renvoie `false`, ou les deux écrasent `__result` sans ajustement |

## Les règles de bonne conduite

- **Postfix par défaut.** N'utilisez un Prefix que si vous devez modifier un argument ou stopper l'exécution.
- **Ajustez, n'écrasez jamais.** `+=`, `*=`, `Math.Min(...)`. Quelqu'un d'autre patche sans doute aussi cet endroit.
- **Vérifiez toujours les null.** Votre patch s'exécutera pendant le chargement du monde et pendant la mort d'une unité.
- **Le test rapide en premier.** La première ligne d'un patch fréquent doit être la condition qui permet un `return` immédiat.
- **Patchez la méthode la plus ciblée possible.** Patcher `Actor.updateStats` pour la vitesse d'un trait est parfait. Patcher la boucle générale de mise à jour du monde pour faire la même chose est le meilleur moyen de faire désinstaller votre mod.
- **Gardez vos patchs dans un seul fichier.** Quand un utilisateur signale un conflit, vous voudrez examiner un fichier, pas douze.

## Ce que nous n'aborderons pas ici

Les **Transpilers** réécrivent les instructions IL compilées d'une méthode instruction par instruction. C'est extrêmement puissant, c'est l'unique moyen de modifier un chiffre enfoui au milieu d'une méthode fermée, et ils cassent à presque chaque mise à jour du jeu. Si vous atteignez un jour le niveau où vous en avez besoin, vous n'aurez plus besoin de ce guide :PES5_BigBrain:.
