---
title: Regarder sous le capot du jeu (UnityExplorer)
group: Vue d'ensemble
subgroup: Outils externes et configuration
icon: :wbeyeball:
order: 6
---

# Regarder sous le capot du jeu :wbeyeball:

**UnityExplorer** est un inspecteur directement intégré en jeu. Il te permet de mettre en pause sur n'importe quel écran, de cliquer sur n'importe quelle fenêtre, bouton ou unité, et de lire chacune de ses valeurs en direct.

Pourquoi tu en as besoin : au lieu de deviner de quoi est faite une fenêtre vanilla, tu l'ouvres et tu *regardes*. Chaque question du genre "mais comment ils ont fait ça ?" trouve sa réponse en deux minutes.

## Comment l'installer

1. Fais d'abord fonctionner **BepInEx**, voir **[La console en direct](#/toolbox/bepinex-console)**.
2. Télécharge [**UnityExplorer pour BepInEx 5 (Mono)**](https://github.com/sinai-dev/UnityExplorer/releases) (récupère le fichier `UnityExplorer.BepInEx5.Mono.zip` sur la page des releases).
3. Extrais le zip dans `C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\plugins/`. Assure-toi que `UnityExplorer.BIE5.Mono.dll` ainsi que sa dépendance compagne `UniverseLib.Mono.dll` soient bien placées à l'intérieur !
4. Lance le jeu et appuie sur **F7** (la touche d'activation par défaut).

```text
worldbox/ (C:\Program Files (x86)\Steam\steamapps\common\worldbox\)
└── BepInEx/
    └── plugins/
        └── sinai-dev-UnityExplorer/ (or directly in plugins/)
            ├── UnityExplorer.BIE5.Mono.dll
            └── UniverseLib.Mono.dll
```

## Les trois panneaux que tu vas vraiment utiliser

| Panneau | À quoi il sert |
| --- | --- |
| **Object Explorer → Scene Explorer** | L'arborescence en direct de tout ce qui s'affiche à l'écran. Ta fenêtre est cachée quelque part là-dedans |
| **Inspector** | Clique sur n'importe quel objet de l'arborescence pour voir chaque composant et chaque champ avec ses valeurs actuelles |
| **C# Console** | Tape une ligne de C# et exécute-la directement dans le jeu lancé. Sans aucun redémarrage |

## Exemple 1 : comprendre comment est construite une fenêtre vanilla

Tu veux que ta propre fenêtre ressemble à celles du jeu. Alors :

1. En jeu, ouvre la fenêtre qui t'intéresse (Lois du monde (world law), par exemple).
2. Appuie sur F7, va dans **Object Explorer → Scene Explorer**, et déplie `CanvasMain` → `canvas_ui`.
3. Clique à travers les éléments enfants jusqu'à ce que l'objet en surbrillance soit bien la fenêtre ouverte.
4. Dans l'Inspector, examine ses composants : l'`Image` avec son sprite découpé en 9 tranches, les dimensions du `RectTransform`, le `ScrollRect`.

Maintenant, tu connais les dimensions, le chemin du sprite et la structure exacte à reproduire sur la page **[Fenêtres personnalisées](#/nml/custom-windows)**. C'est exactement comme ça qu'on s'évite trois heures à deviner des ancres à l'aveugle :PES5_Peek:.

## Exemple 2 : lire les vraies valeurs des champs d'un asset

Ouvre la **C# Console** et lance :

```csharp UnityExplorer C# console
var t = AssetManager.traits.get("strong");
UnityExplorer.ExplorerCore.Log(t.path_icon);
UnityExplorer.ExplorerCore.Log(t.group_id);
```

Dans la sortie du log de UnityExplorer, tu verras immédiatement :

```text
[Message:UnityExplorer] ui/Icons/actor_traits/iconStrong
[Message:UnityExplorer] physique
[Message:UnityExplorer] Invoked REPL (no return value)
```

Tu viens de lire le chemin de l'icône et le groupe d'un trait vanilla, directement depuis le jeu en cours d'exécution. Copie-les dans ton propre trait et il se placera au bon endroit dans l'interface, avec une icône qui existe pour de vrai.

## Exemple 3 : tester une idée avant d'écrire un mod complet

Toujours dans la console C# :

```csharp UnityExplorer C# console
// fait apparaître un loup sur la case à x=100, y=100
var tile = World.world.GetTile(100, 100);
World.world.units.spawnNewUnit("wolf", tile);
```

Si ça marche ici, ça marchera dans ton mod. Si ça plante avec une exception ici, tu viens de t'épargner un cycle complet de compilation et redémarrage du jeu :aPES2_ThumbsUp:.

> [!TIP] Utilise-le avec la console
> UnityExplorer répond à la question "de quoi est fait cet élément ?". La console BepInEx répond à "est-ce que mon code a bien tourné ?". Presque chaque galère de modding se résume à l'une de ces deux questions.
