---
title: Sprites et ressources
group: Modding NML
subgroup: Flux de travail de base
icon: :wbfanartist:
order: 28
---

# Sprites et ressources :wbfanartist:

Votre trait a un nom, des statistiques (stats) et une description impeccable. Mais il a aussi un gros point d'interrogation bien moche en guise d'icône. Il est temps de corriger cela.

## Utiliser une icône déjà présente dans le jeu

L'option la plus rapide, et celle dont vous vous servirez le plus souvent : pointer vers le chemin d'un sprite du jeu de base.

```csharp
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
Sprite[] frames = SpriteTextureLoader.getSpriteList("effects/projectiles/arrow");
```

`getSprite` correspond à `Resources.Load` avec mise en cache, et `getSpriteList` correspond à `Resources.LoadAll` avec cache. Les chemins ne comportent aucune extension : on écrit `ui/Icons/iconFly`, jamais `ui/Icons/iconFly.png`.

La plupart des champs d'assets attendent le **chemin sous forme de chaîne de caractères (string)** plutôt qu'un objet Sprite instancié :

```csharp
trait.path_icon = "ui/Icons/iconHelloSwift";
power.path_icon = "ui/Icons/iconHelloStrike";
```

> [!TIP] Comment savoir quels chemins existent ?
> Utilisez la **[Recherche d'icônes](#/tools/icons)** sur ce site. Elle recense tous les chemins de sprites du jeu et accepte des mots courants : "death king" ou "lightning bolt" vous donnera le chemin exact à coller. Sinon, ouvrez **[UnityExplorer](#/toolbox/unity-explorer)** en jeu et lisez le `path_icon` sur l'asset vanilla qui ressemble à ce que vous souhaitez créer :aPES_Magnifying:.

## Ajouter vos propres créations graphiques

Créez un dossier nommé **`GameResources/`** dans votre mod. NML le traite exactement comme le dossier interne `Resources` d'Unity. Par conséquent, un fichier situé à l'emplacement :

```text
HelloBox/GameResources/ui/Icons/iconHelloSwift.png
```

sera chargé sous l'identifiant `ui/Icons/iconHelloSwift` et fonctionnera partout où un chemin officiel est attendu. Les formats `.png`, `.jpg` et `.jpeg` sont reconnus automatiquement.

### sprites.json

À côté de vos images, un fichier `sprites.json` explique à NML comment découper les textures. Sans lui, les réglages par défaut d'Unity s'appliquent, et pour du pixel art, ils sont presque toujours inadaptés. (Pas toujours obligatoire :PESgn_Maybe: )

```json GameResources/ui/Icons/sprites.json
{
  "Default": {
    "PixelsPerUnit": 1,
    "PivotX": 0.5,
    "PivotY": 0.5
  },
  "Specific": [
    {
      "Path": "iconHelloSwift.png",
      "PivotX": 0.5,
      "PivotY": 0.0
    }
  ]
}
```

| Champ | Description |
| --- | --- |
| `PixelsPerUnit` | Laissez cette valeur à `1`, à moins de savoir exactement pourquoi la changer |
| `PivotX` / `PivotY` | Le point d'ancrage. `0.5 / 0.0` correspond au bas-centre, requis pour les unités et bâtiments (building) |
| `BorderL/R/T/B` | Bordures 9-slice pour les cadres de fenêtres et les boutons extensibles |
| `Path` | Fichier particulier auquel s'applique cette configuration spécifique |

`Default` s'applique à tous les fichiers du dossier qui ne disposent pas d'une entrée dédiée dans `Specific`.

## Où doit se trouver chaque type d'élément graphique

C'est le tableau auquel on revient sans cesse. Chaque asset pointe vers son image avec un champ différent, et quelques-uns ajoutent discrètement un dossier devant avant de charger, donc la valeur que vous écrivez n'est **pas** toujours le chemin où se trouve le fichier.

| Asset | Champ | Le fichier va dans |
| --- | --- | --- |
| Trait, pouvoir divin (GodPower), royaume (kingdom), groupe | `path_icon` | `GameResources/` + exactement ce que vous avez écrit |
| Objet, dans la main d'une unité | `path_gameplay_sprite` | `GameResources/` + exactement ce que vous avez écrit |
| Bâtiment | `sprite_path` | Un **dossier** : `GameResources/` + `sprite_path` + `/`, contenant `main_0.png`, `construction_0.png`, `ruin_0.png`. Si `sprite_path` est vide, c'est `main_path` + id, et `main_path` vaut `buildings/` par défaut |
| Drop | `path_texture` | Un **dossier** : `GameResources/` + exactement ce que vous avez écrit, un PNG par frame |
| Nuage (cloud) | `path_sprites` | `GameResources/` + chaque chemin de la liste |
| Effet de statut (status) | `texture` | Un **dossier** : `GameResources/effects/` + ce que vous avez écrit, un PNG par frame |
| Projectile | `texture` | Un **dossier** : `GameResources/effects/projectiles/` + ce que vous avez écrit, un PNG par frame |
| Ressource (resource), portée en main | `path_gameplay_sprite` | Un **dossier** : `GameResources/items/resources/` + ce que vous avez écrit, un PNG par frame |
| Ressource, icône d'inventaire | `path_icon` | `GameResources/` + ce que vous avez écrit. Le vanilla utilise un nom nu comme `iconResBread`, donc le fichier est à la racine |
| Tuile (tile) et tuile supérieure | *(aucun champ)* | `GameResources/tiles/<the tile's id>/` |

> [!WARNING] "Un dossier" n'est pas une question de style
> Chaque asset marqué **dossier** ci-dessus est lu avec `getSpriteList()`, qui renvoie les frames *à l'intérieur* d'un dossier. Pointez-le vers un seul PNG et il revient vide : un drop tombe invisible, un projectile lève `ArgumentOutOfRangeException` dans `QuantumSpriteLibrary.drawProjectiles()`, un statut plante à chaque frame. Une seule frame suffit, elle doit juste être dans son propre dossier : `drops/hello_ember/hello_ember_0.png` :wbfacepalm:.

Trois d'entre eux mordent :

- **Statut et projectile ajoutent un dossier devant.** Écrire `texture = "effects/status/myThing"` sur un statut fait chercher `effects/effects/status/myThing` au jeu, ce qui n'existe pas. Les statuts vanilla utilisent un nom nu : `fx_status_burning_t`.
- **Les tuiles ignorent complètement les champs.** L'image d'une tuile est trouvée par son **id**, dans un dossier à elle, parce qu'une tuile a plusieurs variantes. `hello_moss` veut dire `GameResources/tiles/hello_moss/` avec vos PNG dedans.
- **Les bâtiments ne collent rien, mais ont une solution de repli.** `sprite_path` est utilisé tel quel : `"buildings/hello_shrine"` veut dire `GameResources/buildings/hello_shrine/`. Laissez-le vide et le jeu utilise `main_path` + id, donc un dossier écrit dans `main_path` devient `buildings/hello_shrine/hello_shrine` :PESgn_Bruh:.

> [!TIP] Copiez le chemin d'un asset vanilla
> Prenez la chose vanilla la plus proche, lisez son champ dans **[UnityExplorer](#/toolbox/unity-explorer)** ou avec la **[Recherche de chemins de sprites](#/tools/icons)**, et reproduisez la forme exactement. C'est plus rapide que de raisonner, et c'est juste du premier coup :PESgn_Noice:.

## Charger un fichier directement depuis le disque

Il arrive que l'on souhaite charger l'image brute : un cadre de fenêtre pour du 9-slice sur mesure, un fichier de données, etc. `ModDeclare` connaît l'emplacement de votre mod ; ne codez jamais de chemin absolu en dur.

```csharp
string path = System.IO.Path.Combine(GetDeclaration().FolderPath, "GameResources", "ui", "frame.png");

Texture2D texture = new Texture2D(2, 2, TextureFormat.RGBA32, false);
texture.filterMode = FilterMode.Point;      // pixel art, pas de flou bilinéaire
texture.LoadImage(System.IO.File.ReadAllBytes(path));
```

`NeoModLoader.utils.SpriteLoadUtils` met aussi à disposition `LoadSingleSprite(path)` et `LoadSprites(path)` pour s'épargner ce code bas niveau.

## Sons

Chaque son dans WorldBox est un événement FMOD, joué à partir d'un chemin d'accès. Vous pouvez utiliser n'importe lequel :

```csharp
MusicBox.playSound("event:/SFX/WEAPONS/WeaponFireballStart", pTile);   // at a place in the world
MusicBox.playSoundUI("event:/SFX/UI/WindowWhoosh");                     // on the interface
```

Le premier joue le son à l'emplacement de cette case du monde. HelloBox joue le son de boule de feu lorsque son action de combat projette une braise, voir **[Projectiles, sorts et effets](#/nml/projectiles-spells)**. Pour trouver des chemins, cherchez `event:/SFX/` dans le code du jeu : il en existe des centaines, classés dans des dossiers selon leur nature. Baissez le volume avant de commencer à les tester.

### Ajouter vos propres sons

NML patche en fait FMOD en coulisses, donc vos propres fichiers `.wav` fonctionnent sans que vous ayez à bricoler un second moteur audio dans un garage :PESgn_Noice:.

Déposez simplement votre fichier `.wav` dans `GameResources/`, par exemple :

```text
GameResources/sounds/hello_boom.wav
```

NML intercepte `MusicBox.playSound` et `playDrawingSound`, vous le jouez donc avec exactement la même méthode qu'un son vanilla (sans l'extension du fichier) :

```csharp
MusicBox.playSound("sounds/hello_boom", pTile);
```

À côté de votre fichier, un `hello_boom.json` optionnel vous permet de régler son comportement :

```json GameResources/sounds/hello_boom.json
{
  "Volume": 60,
  "Mode": "Stereo3D",
  "Type": "Sound"
}
```

| Champ | Valeurs |
| --- | --- |
| `Mode` | `Basic` (2D plat, le volume reste constant), `Stereo3D` (atténuation vanilla avec la distance), `Mono3D` (directionnel) |
| `Type` | `Sound` (curseur des effets), `Music` (curseur de la musique), `UI` (curseur de l'interface) |
| `Volume` | Volume par défaut de 0 à 100 |
| `LoopCount` | Nombre de répétitions (0 = une fois) |

Le meilleur : comme NML les branche sur les groupes de canaux du jeu, vos sons respectent vraiment les réglages de volume du joueur au lieu de le rendre sourd à minuit.

## Ne transmettez jamais de sprite nul au jeu

Un bouton privé de sprite n'est pas un bouton avec une icône manquante : c'est un **trou invisible** dans l'interface utilisateur que le joueur ne pourra jamais deviner. Prévoyez systématiquement une solution de repli :

```csharp
private static Sprite Icon(string pName)
{
    Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
    if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
    return sprite;
}
```

Une icône d'avertissement vous indique clairement : "le chemin est erroné". L'absence totale de sprite vous condamne à passer deux heures à chercher où est passé votre bouton :PES4_Invisible:.
