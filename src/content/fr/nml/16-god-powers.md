---
title: Pouvoirs divins
group: Contenu du jeu
subgroup: Pouvoirs divins et interface
icon: :wbgodfinger:
order: 200
---

# Pouvoirs divins :wbgodfinger:

Un pouvoir divin (GodPower) correspond à ce qui se produit lorsque le joueur sélectionne votre outil et clique sur le monde. Faire apparaître une entité, bénir quelqu'un, faire exploser quelque chose.

Deux éléments distincts sont impliqués, et les confondre est l'erreur classique du débutant :

| | |
| --- | --- |
| Le **pouvoir** (`GodPower`) | Les données : un identifiant, une icône et le code exécuté au clic |
| Le **bouton** (`PowerButton`) | L'élément dans la barre inférieure sur lequel le joueur clique réellement |

Cette page crée le pouvoir. La page **[Onglets et boutons de pouvoir](#/nml/power-buttons)** l'affiche à l'écran.

## Créer le pouvoir

```csharp Mods/HelloBox/Code/HelloPowers.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloPowers
    {
        public const string STRIKE = "hello_strike";

        public static void Initialize()
        {
            // Ne jamais enregistrer deux fois le même id : le jeu ne conserve que le premier.
            if (AssetManager.powers.get(STRIKE) != null) return;

            GodPower strike = new GodPower
            {
                id = STRIKE,
                name = STRIKE,
                rank = PowerRank.Rank0_free,        // aucun déblocage requis
                path_icon = "ui/Icons/iconFire",
                unselect_when_window = true,        // désélectionne l'outil à l'ouverture d'une fenêtre
                show_tool_sizes = false,            // pas de tailles de pinceau (petit/moyen/grand)

                // Ce qui se passe lorsque le joueur clique sur une case avec cet outil en main.
                click_action = (WorldTile pTile, string pPowerID) =>
                {
                    if (pTile == null) return false;

                    EffectsLibrary.spawnExplosionWave(pTile.posV3, 3f, 0.5f);
                    Earthquake.startQuake(pTile);
                    return true;   // true = le clic a été consommé
                }
            };

            AssetManager.powers.add(strike);
        }
    }
}
```

Ajoutez `HelloPowers.Initialize();` dans `Main.cs`.

### Ce que fait chaque partie

- **`id`** : le nom auquel tout le reste se réfère. Le bouton, la traduction, les autres mods.
- **`name`** : utilisé par les recherches de l'interface du jeu. Le garder identique à l'id vous évite un mal de tête.
- **`rank = PowerRank.Rank0_free`** : disponible dès le départ, rien à débloquer.
- **`path_icon`** : l'icône du curseur/de l'outil.
- **`unselect_when_window`** : quand le joueur ouvre une fenêtre, l'outil se désarme tout seul, pour qu'il ne foudroie pas par accident la carte derrière le panneau.
- **`click_action`** : votre code. Il reçoit la **case cliquée** et l'**id du pouvoir**, et renvoie `true` s'il a fait quelque chose.

> [!WARNING] La signature du clic est `(WorldTile, string)`
> `click_action` est un `PowerActionWithID`, donc son second argument est l'**id du pouvoir sous forme de string**, pas un `GodPower`. Il existe un second champ, `click_power_action`, qui prend `(WorldTile, GodPower)`. La mauvaise forme vous donne une erreur de compilation qui ressemble à du charabia :PES_DaFuq:.

## Choses utiles à faire lors d'un clic

```csharp
// l'unité se tenant sur (ou à côté de) la case, le cas échéant
Actor actor = null;
foreach (Actor found in Finder.getUnitsFromChunk(pTile, 1, 2.5f))
{
    if (found != null && found.isAlive()) { actor = found; break; }
}

// faire apparaître une créature
World.world.units.spawnNewUnit("wolf", pTile);

// un effet visuel sur la case
EffectsLibrary.spawnAt("fx_lightning_small", pTile.posV3, 0.25f);

// faire tomber quelque chose du ciel (voir Gouttes & objets qui tombent)
World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

// afficher un message au joueur
WorldTip.showNow("The gods are displeased.", false, "top", 3f);
```

## Maintenir pour peindre

Définir `hold_action = true` ainsi qu'un `click_interval` permet au pouvoir de se répéter tant que le bouton de la souris reste enfoncé, à la manière des pinceaux vanilla :

```csharp
strike.hold_action = true;
strike.click_interval = 0.15f;   // secondes entre chaque répétition
```

## Votre propre icône

`path_icon` est à la fois le curseur de l'outil et l'icône du bouton. Il est chargé exactement tel qu'écrit, depuis `GameResources/`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloStrike.png
```

```csharp
strike.path_icon = "ui/Icons/iconHelloStrike";
```

> [!WARNING] Une icône manquante donne un bouton invisible
> Si le chemin est erroné, le sprite renvoyé est `null`. Or, un sprite `null` n'est pas un bouton avec une image manquante : c'est un trou béant dans la barre que le joueur ne trouvera jamais. Consultez la fonction de secours sur **[Onglets et boutons de pouvoir](#/nml/power-buttons)** :aPES_Hide:.

## Le texte

```json Locales/en.json
{
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess. Mostly a mess."
}
```

## Pinceaux

Un pouvoir divin peint à l'aide d'un **pinceau** : le motif de cases qu'un clic affecte. Le jeu génère la liste de pixels et l'aperçu visuel de chaque pinceau par code, donc créer une nouvelle forme ne nécessite aucune texture.

```csharp Mods/HelloBox/Code/HelloBrushes.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloBrushes
    {
        public const string TARGET = "hello_target";

        public static void Initialize()
        {
            if (AssetManager.brush_library.has(TARGET)) return;

            BrushData target = new BrushData
            {
                id = TARGET,
                size = 6,
                group = BrushGroup.Special,
                show_in_brush_window = true,
                localized_key = "brush_hello_target",
                continuous = true,
                fast_spawn = true
            };

            // post_init() runs generate_action and measures every brush, at startup.
            // Do both yourself: a centre dot and a ring around it.
            List<BrushPixelData> pixels = new List<BrushPixelData>();
            for (int x = -6; x <= 6; x++)
            {
                for (int y = -6; y <= 6; y++)
                {
                    int dist = x * x + y * y;
                    if (dist == 0 || (dist >= 16 && dist <= 36)) pixels.Add(new BrushPixelData(x, y, dist));
                }
            }
            target.pos = pixels.ToArray();
            target.width = 13;
            target.height = 13;
            target.sqr_size = target.width * target.height;

            AssetManager.brush_library.add(target);

            // linkAssets() shuffled every brush, and post_init() listed the ones the
            // brush hotkeys cycle through. Both at startup.
            BrushLibrary.shuffleBrush(target);
            BrushLibrary._available_brushes.Add(TARGET);
        }
    }
}
```

Un pouvoir peut s'associer obligatoirement à un pinceau via `force_brush = "hello_target"`, de la même manière que les pouvoirs à case unique vanilla se verrouillent sur `sqr_0`. Les raccourcis clavier de pinceaux parcourent `_available_brushes`, votre pinceau fait donc partie de cette rotation. La fenêtre de pinceaux fonctionne différemment : elle assemble ses boutons à son ouverture ; si votre pinceau n'y figure pas, `force_brush` et les raccourcis y accèdent toujours parfaitement.

> [!WARNING] Les pinceaux sont mesurés au démarrage du jeu
> `BrushLibrary.post_init()` exécute la méthode `generate_action` de chaque pinceau et calcule `width`, `height` et `sqr_size`, tandis que `linkAssets()` mélange les pixels. Un pinceau ajouté ultérieurement ne bénéficie d'aucun de ces calculs : définissez `pos` et les dimensions vous-même comme ci-dessus. L'image d'aperçu étant dessinée à partir de `pos`, un pinceau ne nécessite aucune icône dédiée.

```json Mods/HelloBox/Locales/en.json
{
  "brush_hello_target": "Target"
}
```

## Elle n'est toujours pas dans le jeu

Tout à fait : vous avez créé un pouvoir, mais rien ne l'affiche encore. Rendez-vous sur **[Onglets et boutons de pouvoir](#/nml/power-buttons)**, c'est l'autre moitié du travail, et cela tient en dix lignes :pepeOK:.
