---
title: Chaque frame
group: Modding NML
subgroup: Avancé et publication
icon: :wbyawn:
order: 43
---

# Chaque frame :wbyawn:

Votre classe principale est un composant Unity. `BasicMod<T>` dérive de `MonoBehaviour`, donc si vous y écrivez une méthode `Update()`, Unity l'appelle une fois par frame. Depuis la première seconde après le lancement jusqu'à la fermeture du jeu, soixante fois par seconde, qu'il y ait un monde ou non.

C'est l'endroit pour tout ce qui n'est pas une réaction à un événement : une vérification chaque mois en jeu, une file d'attente venant d'un patch Harmony, une pression sur une touche. C'est aussi le moyen le plus facile, en modding, de transformer le jeu de quelqu'un en diaporama :wbfacepalm:.

## Le garde-fou

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    // game_loaded: past startup. worldLoading: no world half cleared or half built
    if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

    HelloTicker.Tick();
}
```

| Vérification | Ce qu'elle vous évite |
| --- | --- |
| `World.world != null` | Aucune instance de carte n'existe encore |
| `Config.game_loaded` | Les tout premiers instants après le lancement, avant que le jeu n'ait démarré son premier monde |
| `Config.worldLoading` | L'écran de chargement. Un monde est en train d'être vidé, généré ou chargé, et les listes d'unités sont vidées et remplies sous vos pieds |

`Config.worldLoading` correspond à `SmoothLoader.isLoading()`, la même vérification que fait le propre `MapBox.Update()` du jeu avant de simuler quoi que ce soit. Le garde-fou de **[Logs et débogage](#/nml/logs-and-debugging)** couvre le démarrage ; ajoutez la vérification de chargement et vous restez aussi à l'écart de chaque chargement de monde par la suite.

## Pas chaque frame

La plupart des choses n'ont pas besoin de soixante vérifications par seconde. Choisissez une horloge et calez-vous dessus.

| Horloge | Ce qu'elle fait |
| --- | --- |
| `Time.deltaTime` | Secondes réelles depuis la dernière frame. Continue de tourner même quand le jeu est en pause, ignore le réglage de vitesse. Le jeu ne touche jamais à `Time.timeScale` |
| `World.world.getCurWorldTime()` | Secondes du monde, en `double`. S'arrête pendant la pause ou quand une fenêtre est ouverte, tourne plus vite aux vitesses élevées. 5, c'est un mois, 60, c'est une année |

Le temps du monde pour tout ce qui se passe *dans* le monde. Ici, chaque unité portant le trait rancunier de **[Se souvenir des choses](#/nml/saving-data)** oublie un coup par mois :

```csharp Mods/HelloBox/Code/HelloTicker.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloTicker
    {
        private const double INTERVAL = 5.0;   // world seconds: one in-game month
        private static double _last;

        [HarmonyPostfix]
        public static void ResetClock(MapBox __instance)
        {
            _last = __instance == null ? 0.0 : __instance.getCurWorldTime();
        }

        public static void Tick()
        {
            if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

            double now = World.world.getCurWorldTime();

            // a backwards clock resets the baseline without firing a tick
            if (now < _last) _last = now;
            if (now - _last < INTERVAL) return;
            _last = now;

            foreach (Actor actor in World.world.units)
            {
                if (actor == null || !actor.isAlive()) continue;
                if (!actor.hasTrait(HelloMemory.GRUDGE)) continue;

                actor.data.change(HelloMemory.HITS, -1, 0, 100000);
            }
        }
    }
}
```

Gardez l'appel à `PatchAll` de **[Patchs Harmony](#/nml/harmony-patches)** : `ResetClock` s'exécute après chaque monde généré ou chargé, même avec un horodatage égal ou postérieur. Le premier tick attend un intervalle complet dans ce monde-là. Une simple vérification d'horloge qui recule ne peut pas détecter chaque chargement.

La pause, la vitesse et les fenêtres ouvertes sont toutes gérées, parce que l'horloge du monde leur obéit déjà. Le temps réel pour ce qui n'est pas dans le monde, comme une étiquette qui clignote :

```csharp
private static float _timer;

_timer += Time.deltaTime;
if (_timer < 2f) return;
_timer = 0f;
```

> [!NOTE] Vérifier la pause vous-même
> `Config.paused` est le bouton pause et rien d'autre. La simulation s'arrête aussi quand une fenêtre est ouverte ; `World.world.isPaused()` couvre les deux cas, mais il est `internal`, donc il nécessite l'assembly publicisée contre laquelle NML compile votre mod. Utiliser le temps du monde vous évite la question.

## Coroutines

Une coroutine est une méthode qui peut attendre en plein milieu. Votre classe principale est un `MonoBehaviour`, elle peut donc en démarrer une :

```csharp Mods/HelloBox/Code/HelloShakes.cs
using System.Collections;
using UnityEngine;

namespace HelloBox
{
    public static class HelloShakes
    {
        public static void Begin(Actor pActor)
        {
            Main.Instance.StartCoroutine(ShakeThreeTimes(pActor));
        }

        private static IEnumerator ShakeThreeTimes(Actor pActor)
        {
            for (int i = 0; i < 3; i++)
            {
                // checked after every wait: the unit had a whole second to die
                if (World.world == null || Config.worldLoading || pActor == null || !pActor.isAlive()) yield break;

                pActor.startShake();
                yield return new WaitForSeconds(1f);
            }
        }
    }
}
```

`WaitForSeconds` attend en secondes réelles, et comme le jeu ne change jamais `Time.timeScale`, elle ne s'arrête pas à la pause et ne se soucie pas de la vitesse du jeu. La coroutine continue aussi de tourner si le joueur charge un autre monde en plein milieu. D'où la vérification après *chaque* `yield`, pas seulement avant le premier :PES2_F:.

## Les touches

`Input.GetKeyDown(KeyCode.F7)` dans `Update()` fonctionne. Ça se déclenche aussi pendant que le joueur tape le nom d'une unité dans un champ de texte, et le joueur ne peut pas changer la touche. Les raccourcis du jeu lui-même ignorent les touches quand un champ de texte a le focus, donc un `HotkeyAsset` obtient ça gratuitement. Voir **[Fenêtres personnalisées](#/nml/custom-windows)** pour en enregistrer un. Gardez `GetKeyDown` pour une touche de débogage que vous seul appuierez.

## Le travail lourd

- **Bouclez sur les unités selon une horloge, jamais à chaque frame.** Dix mille unités fois soixante frames, ça fait six cent mille vérifications par seconde, pour un trait que trois unités possèdent peut-être.
- **La vérification la moins chère d'abord.** Même règle qu'un patch Harmony : la première ligne est celle qui vous permet de faire `return`.
- **Des files d'attente en parallèle, `Update()` les vide.** Un Postfix sur une méthode parallèle comme `Actor.updateStats` ne doit toucher ni Unity ni un état partagé, voir **[Patchs Harmony](#/nml/harmony-patches)**. Il met l'unité en file, et le thread principal la récupère ici :

```csharp
// pending is the ConcurrentQueue your patch fills
while (pending.TryDequeue(out Actor actor))
{
    if (actor == null || !actor.isAlive()) continue;
    // now Unity, Randy and your own lists are safe to touch
}
```

Ce que vous faites une fois dans la boucle, c'est **[Le monde à l'exécution](#/nml/world-at-runtime)**. Ce que vous voulez voir encore présent après une sauvegarde et un chargement, c'est **[Se souvenir des choses](#/nml/saving-data)** :PES_OkHand:.
