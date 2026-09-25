---
title: Patchs Harmony
group: Modding NML
subgroup: Avancé et publication
icon: :wbhammer:
order: 42
---

# Patchs Harmony :wbhammer:

Tout ce qui se trouve sur les autres pages **ajoute** du contenu à WorldBox : un trait, une arme, un bâtiment (building). Harmony sert à l'autre moitié du modding : **modifier ce que le jeu fait déjà**.

Vous ne pouvez pas modifier le code du jeu directement. Il est compilé, distribué sous forme de `Assembly-CSharp.dll`, et la moindre mise à jour écraserait vos changements. Harmony est la bibliothèque (library) qui vous permet de greffer votre propre code sur une méthode existante pendant que le jeu tourne.

> [!NOTE] Vous n'avez jamais écrit de code ?
> Lisez "Qu'est-ce qu'une méthode" et "Le pense-bête", puis allez créer quelque chose depuis les pages **Contenu du jeu** avant de revenir. Harmony n'est pas difficile, mais c'est le premier outil capable de casser les mods *des autres*, et vos patchs seront bien meilleurs après avoir vu comment sont agencés les assets du jeu :PES_Wise:.

## Ce qu'est une méthode

Une **méthode** est une action nommée au sein du code du jeu. Quelques exemples réels :

| Méthode | Quand le jeu l'exécute |
| --- | --- |
| `Actor.updateStats()` | Chaque fois que les statistiques (stats) d'une unité doivent être recalculées |
| `Actor.getHit(...)` | Chaque fois qu'une unité subit des dégâts |
| `City.makeWarrior(...)` | Chaque fois qu'une ville transforme un citoyen en soldat |

Le jeu en appelle des milliers par seconde. Chacune d'elles est un point d'ancrage potentiel pour votre code.

## Le post-it

Imaginez une méthode comme une page dans le livre (book) de recettes du jeu. Harmony ne réécrit pas la page : il y agrafe deux notes adhésives :

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
                if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

Six choses se passent :

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`** : l'adresse. "La méthode appelée `updateStats`, dans la classe appelée `Actor`." Une ligne entre crochets est un *attribut* : une étiquette que l'ordinateur lit, pas du code qui s'exécute.
- **`public static class Patch_Actor_UpdateStats`** : un conteneur. Le nom est à vous et ne change rien, mais votre futur vous remerciera pour `Patch_<Class>_<Method>`.
- **`public static void Postfix(...)`** : ce nom n'est **pas** à vous, à moins de l'étiqueter. Sans étiquette, Harmony cherche une méthode qui s'appelle exactement `Prefix`, `Postfix` ou `Finalizer`. Écrivez `postfix` et rien ne se passe, sans aucune erreur :PESgn_ButWhy:. La solution, c'est l'étiquette, dans "Nommer les méthodes de patch vous-même" plus bas.
- **`Actor __instance`** : **deux** underscores. C'est l'unité précise sur laquelle le jeu travaille en ce moment. Sans lui, vous savez *qu*'une unité a vu ses stats recalculées, mais pas *laquelle*.
- **`if (!__instance.hasTrait(...)) return;`** : sortez tôt. Votre patch tourne pour chaque unité du monde, pour toujours. Faites du cas courant une vérification et un `return`.
- **`stats["speed"] += 20f;`** : le vrai changement. `updateStats` vide et reconstruit le bloc de stats au début, donc ajouter dans un Postfix tombe sur une page blanche au lieu de s'accumuler à chaque tick.

> [!DANGER] `updateStats` ne tourne pas sur le thread principal
> Le jeu l'enregistre comme une tâche **parallèle** (`createJob(out c_stats_dirty, updateStats, JobType.Parallel, ...)`, et `Config.parallel_jobs_updater` vaut `true` par défaut), donc votre Postfix tourne sur un thread de travail, sur beaucoup d'unités à la fois. À l'intérieur, touchez **uniquement aux nombres de cette unité**. Appeler Unity (`Time.time`, `transform`, `Destroy`, `Resources.Load`), l'outil aléatoire du jeu `Randy`, ou écrire dans une liste partagée à vous, c'est un crash qui n'apparaît que sur la machine de quelqu'un d'autre.
>
> Si vous avez besoin de ça, mettez l'unité dans une file et faites le travail dans votre propre `Update()` :
> ```csharp
> public static readonly System.Collections.Concurrent.ConcurrentQueue<Actor> pending = new();
>
> public static void Postfix(Actor __instance)
> {
>     if (!__instance.hasTrait(HelloTraits.GIGACHAD)) return;
>     __instance.stats["speed"] += 20f;   // this unit's own data: fine
>     pending.Enqueue(__instance);        // everything else waits for the main thread
> }
> ```

## Les noms magiques des paramètres

Harmony injecte vos paramètres **par leur nom**. Voici ceux qui comptent, et les tirets du bas font partie intégrante du nom :

| Nom | Ce que vous recevez |
| --- | --- |
| `__instance` | L'objet sur lequel la méthode a été appelée. À omettre pour une méthode `static` |
| `__result` | La valeur de retour de la méthode. Déclarez-la en `ref` pour la modifier. Uniquement en Postfix |
| `___someField` | **Trois** tirets : un champ privé de l'objet, orthographié exactement comme dans le jeu |
| `__state` | Une valeur que votre Prefix transmet à votre propre Postfix |
| n'importe quel paramètre réel | L'argument transmis par l'appelant, nommé **exactement** comme dans le jeu |

C'est sur cette dernière ligne que tout le monde trébuche, encore et encore. Si le jeu déclare `getHit(float pDamage, ...)`, votre paramètre doit s'appeler `pDamage`. Pas `damage`, pas `pDmg`. Vous pouvez omettre les paramètres inutiles, mais ceux que vous déclarez doivent correspondre mot pour mot, et dans ce jeu ils commencent presque tous par `p`.

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

La moitié des demandes du type "quelqu'un peut-il faire un mod qui..." ne concerne qu'un seul nombre. Rien n'est impossible, c'est juste que personne ne l'a encore fait :wbbru:. "Les villes deviennent trop grandes" n'est rien d'autre que cela, tiré directement de la classe `City` du jeu :

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
> Cela n'annule pas seulement *votre* vision de la méthode. Cela annule le code du jeu **pour tout le monde**. Le Postfix de chaque autre mod sur cette méthode s'exécute quand même, en réagissant à un appel qui n'a jamais eu lieu. Une méthode vanilla fait souvent cinq choses insoupçonnées, et l'annuler les désactive toutes en silence.
>
> Avant d'écrire `return false`, vérifiez si un Postfix ne suffirait pas. "Soigner les dégâts après coup" casse bien moins de choses que "les dégâts n'ont jamais existé" :PES3_Balance:.

## Deux façons d'écrire le nom de la méthode

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // méthode publique
[HarmonyPatch(typeof(Actor), "updateStats")]             // tout le reste
```

`nameof` est préférable car une coquille devient une erreur de compilation au lieu d'un patch qui ne s'applique jamais en silence. Mais `nameof` ne fonctionne que sur les membres visibles par votre code, et une grande partie de WorldBox est `internal` ou `private`. Pour ceux-là, la chaîne de caractères brute est la seule option : vérifiez l'orthographe dans le code réel via **[Lire le code du jeu](#/toolbox/reading-the-game-code)**.

## Nommer les méthodes de patch vous-même

Les noms magiques `Prefix` et `Postfix` sont une convention, pas une obligation. Mettez une étiquette sur la méthode et appelez-la comme vous voulez :

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_UpdateStats
{
    [HarmonyPostfix]
    public static void AddSwiftSpeed(Actor __instance)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;
        __instance.stats["speed"] += 20f;
    }
}
```

`[HarmonyPrefix]`, `[HarmonyPostfix]` et `[HarmonyFinalizer]` existent tous les trois. Avec l'étiquette, le nom de la méthode n'est plus que pour vous, et le problème du "`Postfix` mal orthographié, rien ne se passe" disparaît. Ça vous permet aussi de garder un Prefix et un Postfix pour des cibles différentes dans une seule classe sans que les noms ne s'affrontent. Environ la moitié des mods existants procède ainsi, et c'est la moitié qui ne perd jamais une soirée à cause d'un `p` minuscule.

## Quand deux méthodes partagent le même nom

Alors classe + nom est ambigu. Harmony refuse de deviner et votre mod meurt au démarrage avec une `AmbiguousMatchException`. `Actor` a deux méthodes `addTrait` :

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool addTrait(ActorTrait pTrait, bool pRemoveOpposites = false)
```

Précisez les types de paramètres de celle que vous visez, **tous**, y compris ceux qui ont une valeur par défaut :

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.addTrait), new System.Type[] { typeof(string), typeof(bool) })]
```

D'autres vraies surcharges qui piègent les gens : `TileZone.isGoodForNewCity()` et `isGoodForNewCity(Actor pActor)`, et `SaveManager.loadWorld()` et `loadWorld(string pPath, bool pLoadWorkshop = false)` (toutes deux `internal`, donc uniquement des chaînes de caractères). En cas de doute, cherchez le nom de la méthode dans la classe avant d'écrire l'attribut.

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

## Propriétés et constructeurs

Tout n'est pas une simple méthode. `Actor.is_moving` est une propriété : ça ressemble à un champ, mais un bloc `get` s'exécute à chaque fois que quelqu'un la lit. Indiquez à Harmony quelle moitié vous voulez :

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.is_moving), MethodType.Getter)]
```

Après ça, c'est un patch normal, et `ref bool __result` est ce que le lecteur récupère. `MethodType.Setter` est l'autre moitié. `MethodType.Constructor` patche le constructeur d'une classe, où `__instance` est l'objet en cours de construction ; si la classe a plusieurs constructeurs, ajoutez le `Type[]` après, exactement comme une surcharge.

## Champs et méthodes privés

Votre patch peut voir un champ privé de `__instance` en le demandant comme paramètre : **trois** tirets du bas, puis le nom du champ orthographié exactement comme dans le jeu. Le jeu fait précéder la plupart de ses champs privés de son propre `_`, donc le `_hover_timer` privé de l'unité devient **quatre** :

```csharp
public static void Postfix(Actor __instance, ref float ____hover_timer)
```

`ref` si vous voulez y écrire. C'est fastidieux à lire et parfaitement correct.

En dehors d'un patch, `AccessTools` et `Traverse` (tous deux dans `HarmonyLib`) accèdent aux mêmes choses :

```csharp
// once in a while: Traverse is short and slow
float timer = Traverse.Create(pActor).Field("_hover_timer").GetValue<float>();

// every frame: build the accessor once, then it is almost as fast as a normal field
static readonly AccessTools.FieldRef<Actor, float> hover_timer = AccessTools.FieldRefAccess<Actor, float>("_hover_timer");
hover_timer(pActor) = 0f;   // it is a ref, so this writes

// a private method: reflection wants every argument, defaults included
AccessTools.Method(typeof(Actor), "die").Invoke(pActor, new object[] { false, AttackType.Other, true, true });
```

Une chaîne de caractères nomme quelque chose que le compilateur ne peut pas vérifier. Si une mise à jour renomme `_hover_timer`, vous le découvrez à l'exécution. L'alternative est une `Assembly-CSharp.dll` **publicisée**, où `internal` et `private` deviennent visibles et un renommage redevient une erreur de compilation.

## Patcher à la main

`[HarmonyPatch]` plus `PatchAll` est la voie facile. L'autre voie consiste à trouver la méthode vous-même et à appeler `Patch` :

```csharp Mods/HelloBox/Code/HelloManualPatches.cs
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloManualPatches
    {
        private static readonly Harmony harmony = new Harmony("com.yourname.hellobox");

        public static void Initialize()
        {
            // two addTrait overloads exist, so the types are not optional
            MethodInfo original = AccessTools.Method(typeof(Actor), nameof(Actor.addTrait), new[] { typeof(string), typeof(bool) });

            // null means an update renamed it: lose one feature, not the whole mod
            if (original == null)
            {
                Main.LogWarning("Actor.addTrait(string, bool) not found, skipping that patch");
                return;
            }

            harmony.Patch(original, postfix: new HarmonyMethod(typeof(HelloManualPatches), nameof(AddTraitPostfix)));
        }

        public static void AddTraitPostfix(Actor __instance, string pTraitID, bool __result)
        {
            // __result is false when the unit already had it or an opposite blocked it
            if (!__result || pTraitID != HelloTraits.SWIFT) return;

            Main.LogInfo("Another unit got swift");
        }
    }
}
```

Même identifiant Harmony que votre `PatchAll`, mêmes règles pour les noms de paramètres. Ce que vous gagnez, c'est le `if` au milieu. Recourez-y quand :

- **La cible pourrait ne pas exister.** Une méthode que vous soupçonnez la prochaine mise à jour de déplacer, ou qui vit dans *un autre mod*. `AccessTools.TypeByName("TheirNamespace.TheirClass")` renvoie `null` quand ce mod n'est pas installé, et vous sautez simplement le patch. Voir **[Les autres mods](#/nml/other-mods)**.
- **Le patch dépend d'un réglage.** Ne patchez que si le joueur a activé la fonctionnalité dans **[Réglages du mod](#/nml/mod-config)**.
- **Vous voulez savoir si ça a marché.** Une cible manquante pour `PatchAll` lève une exception, et les patchs pas encore atteints ne sont jamais appliqués. Ici, une méthode manquante, c'est une ligne de log.

## Quand plusieurs mods patchent la même méthode

Au sein de chaque type de patch, Harmony ordonne les patchs par priorité, **la plus haute en premier**, `Normal` étant la valeur par défaut. Des dépendances explicites `[HarmonyBefore]` et `[HarmonyAfter]` peuvent changer cet ordre :

```csharp
[HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
public static class Patch_City_ZoneRange
{
    [HarmonyPostfix]
    [HarmonyPriority(Priority.Last)]
    public static void HalveZones(ref int __result) { /* ... */ }
}
```

Les priorités courantes sont `First`, `High`, `Normal`, `Low`, `Last`. Ça compte quand l'ordre change le résultat :

- Un Postfix qui **plafonne** un résultat (`Mathf.Min(__result, 20)`) veut `Priority.Last`, pour plafonner normalement après les Postfix de priorité plus haute. Il ne peut pas garantir d'être vraiment le dernier face à un autre patch `Last` ou à des dépendances d'ordre explicites.
- Un Prefix qui **vérifie** quelque chose et peut faire `return false` veut `Priority.First` ou `High`, pour décider tôt. Ne l'utilisez pas comme garantie que les autres Prefix seront sautés : NML embarque HarmonyX, qui [exécute tous les Prefix](https://github.com/BepInEx/HarmonyX/wiki/Prefix-changes) même quand l'un d'eux renvoie `false`.

Ne la définissez que lorsque vous avez une raison. Si chaque mod demande `First`, on revient à la case départ où personne n'est premier :PES3_Balance:.

## Finalizers : intercepter ce que le jeu lève

Un Finalizer s'exécute après tout le reste, **même si la méthode a levé une exception**. Il reçoit l'exception, et ce qu'il renvoie est ce qui sera levé :

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.setAttackTarget))]
public static class Patch_Actor_SetAttackTarget_Log
{
    public static System.Exception Finalizer(System.Exception __exception)
    {
        if (__exception != null) Main.LogError("setAttackTarget threw: " + __exception);

        // preserve the failure after logging it
        return __exception;
    }
}
```

Ceci enregistre l'échec sans le cacher. Renvoyer `null` supprimerait l'exception, y compris les échecs venant d'autres patchs. Ne faites ça que pour un échec précis dont vous pouvez réellement vous remettre. Une méthode qui a levé une exception à mi-chemin a déjà fait la moitié de son travail, et avaler l'exception laisse le monde dans cet état-là :PESgn_Yikes:.

## Les méthodes que les mods patchent le plus

Parmi les mods que j'ai parcourus, ces méthodes reviennent sans cesse. Les signatures viennent directement du code du jeu.

| Cible | Ce qu'il faut savoir |
| --- | --- |
| `City.update(float pElapsed)` | Publique. Tourne à chaque frame pour chaque ville. Vérification bon marché d'abord |
| `MapBox.Update()` | **Privée**, donc `"Update"` en chaîne de caractères. Tourne à chaque frame, une fois. Voir **[Chaque frame](#/nml/update-loops)** avant de la patcher |
| `Actor.updateStats()` | **Interne**. Tourne dans une tâche parallèle, voir l'avertissement en haut de page |
| `Actor.getHit(float pDamage, bool pFlash, AttackType pAttackType, BaseSimObject pAttacker = null, ...)` | **Interne**. Chaque coup reçu par chaque unité |
| `Actor.die(bool pDestroy = false, AttackType pType = AttackType.Other, bool pCountDeath = true, bool pLogFavorite = true)` | **Privée**, `"die"` en chaîne de caractères |
| `Actor.setAttackTarget(BaseSimObject pAttackTarget)` | Publique |
| `ItemCrafting.tryToCraftRandomWeapon(Actor pActor, City pCity)` | Publique statique, renvoie un `bool`. Pas de `__instance` |
| `DiplomacyManager.startWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pAsset, bool pLog = true)` | **Interne**, renvoie la `War` |
| `WarManager.newWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pType)` | Publique, renvoie la `War` |
| `Kingdom.setKing(Actor pActor, bool pFromLoad = false)` | Publique. Tourne aussi pendant le chargement d'une sauvegarde, vérifiez `pFromLoad` |
| `City.setLeader(Actor pActor, bool pNew)` | Publique |
| `BabyMaker.makeBaby(Actor pParent1, Actor pParent2, ...)` | Publique statique, renvoie le bébé |
| `ActorManager.createNewUnit(string pStatsID, WorldTile pTile, ...)` | Publique, renvoie le nouvel `Actor`. Chaque apparition passe par là |

Les cibles `private` et `internal` se patchent très bien avec un nom en chaîne de caractères, et vos paramètres se lient toujours par leur nom. Ce que vous ne pouvez pas faire sans une assembly publicisée, c'est écrire `nameof(...)` pour elles, ou toucher leurs membres `internal` à l'intérieur du corps de votre patch.

> [!NOTE] `World` est le contenant, `MapBox` est la cible
> `typeof(World)` est du C# valide, même si `World` est statique. C'est la mauvaise cible Harmony pour `Update` ou `finishMakingWorld` : ces méthodes appartiennent à `MapBox`, le type renvoyé par `World.world`. Une mauvaise cible échoue quand Harmony applique le patch, pas quand C# compile `typeof`.

## Quand ça ne fonctionne pas

Avant d'accuser Harmony, lisez le log. C'est rarement Harmony :PES5_Noted:.

| Ce que vous voyez | La cause la plus probable |
| --- | --- |
| Rien ne se passe, rien dans les logs | `Postfix` mal orthographié sans étiquette `[HarmonyPostfix]`, ou `PatchAll` jamais appelé |
| `HarmonyException` / `MissingMethodException` au démarrage | Cette classe ou cette méthode n'existe pas. Vérifiez dans dnSpy |
| `AmbiguousMatchException` / `Ambiguous match found` | Plusieurs surcharges. Ajoutez l'argument `Type[]` montré plus haut |
| Un plantage qui n'arrive que sur les machines des autres | Un Postfix sur `Actor.updateStats` qui touche Unity, `Randy` ou une liste partagée depuis un thread de travail |
| `NullReferenceException` dans votre patch | `__instance` ou l'un de ses champs est null. Les patchs tournent dans des états hors-jeu : pendant le chargement, à la mort, sur des objets détruits |
| Le jeu tourne à 3 FPS | Vous avez patché une méthode appelée des milliers de fois par seconde avec des calculs lourds |
| Fonctionne seul, casse avec un autre mod | L'un de vous renvoie `false`, ou les deux écrasent `__result` sans ajustement |

## Les règles de bonne conduite

- **Postfix par défaut.** N'utilisez un Prefix que si vous devez changer un argument ou arrêter la méthode.
- **Ajustez, n'assignez jamais.** `+=`, `*=`, `Math.Min(...)`. Quelqu'un d'autre a aussi patché ça.
- **Vérifiez null, toujours.** Votre patch tournera pendant le chargement du monde et pendant la mort d'une unité.
- **La vérification bon marché d'abord.** La première ligne d'un patch très sollicité doit être le test qui vous permet de faire `return`. `City.update` et `MapBox.Update` sont les deux méthodes que les mods patchent le plus, et toutes deux tournent à chaque frame. Une recherche dans un dictionnaire là-dedans, ça va. Une boucle sur chaque unité, non.
- **Patchez la méthode la plus étroite qui fait le travail.** Patcher `Actor.updateStats` pour la vitesse d'un trait, ça va. Patcher la mise à jour du monde pour la même chose, c'est comme ça qu'un mod se fait désinstaller.
- **Gardez vos patchs dans un seul fichier.** Quand quelqu'un signale un conflit, vous voulez lire un fichier, pas douze. Soyez gentil avec votre futur vous. Faites ce que je dis, pas ce que font mes vieux mods :trollface:.

> [!NOTE] Patcher `has`, `get`, `add`, `clone` ou `post_init` d'une bibliothèque ne sert à rien
> Cela n'affecte que les appels faits après le chargement de votre mod, jamais l'enregistrement vanilla déjà effectué à ce moment-là. Voir **[Bibliothèques d'assets](#/nml/asset-libraries)**.

## Transpilers : modifier les instructions

Un transpiler réécrit l'IL, les instructions compilées à l'intérieur d'une méthode. Utilisez-le quand le changement se trouve au milieu et que ni un Prefix ni un Postfix ne peuvent l'exprimer. Il s'exécute quand Harmony construit la méthode de remplacement, pas à chaque tick du jeu, et peut s'exécuter à nouveau quand un autre transpiler est ajouté.

Voici la signature, à l'intérieur de votre classe de patch. Elle laisse délibérément tout passer :

```csharp
public static System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> Transpiler(
    System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> instructions)
{
    return instructions;
}
```

Pour une vraie réécriture :

1. Inspectez l'IL de la cible dans dnSpy. Repérez une séquence d'opcodes et l'opérande précis d'un champ ou d'une méthode, pas "l'instruction 42" ni chaque occurrence d'un nombre.
2. Collectez les correspondances **avant** de modifier quoi que ce soit. Vérifiez explicitement le nombre attendu. Si vous en attendez une et en trouvez zéro ou deux, enregistrez l'anomalie et renvoyez l'entrée non modifiée. N'émettez jamais une réécriture à moitié faite.
3. Préservez les étiquettes de branchement, les blocs d'exception, ainsi que les types et l'équilibre de la pile d'évaluation. Un remplacement qui a l'air correct en C# peut rester un IL invalide.
4. Testez le chemin où il y a correspondance et celui où il n'y en a pas, puis testez avec d'autres patchs sur la même méthode.

La [documentation des transpilers Harmony](https://harmony.pardeike.net/articles/patching-transpiler.html) couvre l'API d'instructions. Une mise à jour du jeu est une raison de revérifier le motif, pas de déplacer l'index magique de trois :PES5_BigBrain:.

NML embarque **HarmonyX**, un fork de Harmony. L'API de patch principale est partagée, mais le comportement peut différer, y compris pour le saut des Prefix. Prochaine étape, si plus d'un mod va toucher à la même chose : **[Les autres mods](#/nml/other-mods)**.
