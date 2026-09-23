---
title: La console en direct (BepInEx)
group: Vue d'ensemble
subgroup: Outils externes et configuration
icon: :wbvideo:
order: 5
---

# La console en direct :wbvideo:

Ouvrir `Player.log` dans le Bloc-notes après chaque test est une corvée sans nom. (Et pourtant je le fais encore parfois, sans mentir :23062-durrr:). **BepInEx** t'offre une fenêtre de console noire qui affiche les logs en direct pendant que le jeu tourne, pour que ta ligne de log apparaisse au moment précis où ton code l'exécute.

C'est une installation de dix minutes que tu ne fais qu'une seule fois et que tu gardes pour toute ta vie de moddeur.

## Qu'est-ce que BepInEx ?

Un modloader qui s'accroche aux jeux Unity avant même leur démarrage. Les moddeurs de WorldBox l'utilisent essentiellement pour deux choses : la console en direct et **UnityExplorer** (qui a sa propre page). NML peut l'installer automatiquement quand un mod l'exige, mais l'installer toi-même te permet de garder la main sur les réglages.

## Comment l'installer

1. Sur la [page officielle des versions de BepInEx](https://github.com/BepInEx/BepInEx/releases), descends jusqu'à **Assets** et récupère le fichier nommé `BepInEx_win_x64_5.4.x.x.zip`. Cette version exacte : **win**, **x64**, **5**. Les builds pour `x86`, `unix`, `macos` et `BepInEx 6 / IL2CPP` ont l'air attirants, mais aucun d'eux ne fonctionnera ici :PES5_Dumb:.
2. Clic droit sur le zip → **Propriétés** → coche la case **Débloquer** si elle est présente, puis décompresse-le **directement dans ton dossier WorldBox**, celui où se trouve `worldbox.exe` (chemin Steam par défaut : `C:\Program Files (x86)\Steam\steamapps\common\worldbox`, ou clic droit sur WorldBox dans Steam → **Gérer** → **Parcourir les fichiers locaux**). Tu dois obtenir ceci :

```text
worldbox/
├── worldbox.exe
├── BepInEx/
├── doorstop_config.ini
└── winhttp.dll
```

3. **Lance le jeu une première fois puis referme-le.** Ce premier lancement génère les fichiers de configuration. Rien de spécial ne s'affiche à l'écran, c'est tout à fait normal :hmm:.

## Activer la console

Ouvre `BepInEx/config/BepInEx.cfg` dans n'importe quel éditeur de texte, trouve la section `[Logging.Console]` et configure :

```text BepInEx/config/BepInEx.cfg
[Logging.Console]

## Enables showing a console for log output.
# Setting type: Boolean
# Default value: false
Enabled = true
```

Relance le jeu. Une seconde fenêtre s'ouvre à côté, et elle est déjà en train de défiler à toute vitesse.

## Lire les logs

Pour l'instant, même sans avoir créé le moindre mod, lancer le jeu affichera le démarrage de BepInEx et NeoModLoader :

```text BepInEx console
[Info   :   BepInEx] Loading [NeoModLoader 1.x.x]
[Info   :Application] Initializing WorldBox...
[Info   :Application] [NML]: NeoModLoader initialized!
```

Si ces lignes apparaissent, félicitations : ta console en direct est fin prête !

Plus tard, quand tu créeras ton premier mod dans le guide **[Ton premier mod](#/nml/your-first-mod)**, tu verras ton propre mod se compiler et te saluer en plein milieu du flot de texte :

```text BepInEx console
[Info   :Application] 005: Compile Mod HelloBox                = 2,2480
[Info   :Application] [NML]: [HelloBox]: HelloBox is alive!
```

Trois habitudes qui rendent cette console réellement indispensable :

- **Ajoute un préfixe à chaque log** avec le nom de ton mod, comme `[MonMod]`, pour repérer tes propres lignes en un clin d'œil.
- **Logue au début et à la fin** de chaque étape d'initialisation. Si tu lis "enregistrement des traits..." mais jamais "traits enregistrés", tu sais immédiatement où le code a planté.
- **Garde la console sur un second écran** (ou sur la moitié de l'écran). Voir une ligne apparaître au moment exact où tu cliques sur un bouton, c'est le débogage le plus rapide qui soit :memes:.

## Comment tu vas t'en servir (Aperçu rapide)

Une fois tes fichiers de mod en place dans **[Ton premier mod](#/nml/your-first-mod)**, tu pourras ajouter des logs en temps réel pour tester les actions en jeu :

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;

    // Clic gauche de la souris, une fois par clic
    if (Input.GetMouseButtonDown(0))
    {
        LogInfo("click!");
    }
}
```

Chaque clic imprime instantanément une ligne dans la console. C'est précisément cette boucle de rétroaction immédiate qui rend BepInEx indispensable !
