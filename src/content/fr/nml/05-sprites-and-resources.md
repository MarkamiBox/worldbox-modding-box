---
title: Sprites et ressources
group: Modding NML
subgroup: Flux de travail de base
icon: :wbfanartist:
order: 28
---

# Sprites et ressources :wbfanartist:

Votre trait a un nom, des statistiques et une description impeccable. Mais il a aussi un gros point d'interrogation bien moche en guise d'icône. Il est temps de corriger cela.

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
| `PivotX` / `PivotY` | Le point d'ancrage. `0.5 / 0.0` correspond au bas-centre, requis pour les unités et bâtiments |
| `BorderL/R/T/B` | Bordures 9-slice pour les cadres de fenêtres et les boutons extensibles |
| `Path` | Fichier particulier auquel s'applique cette configuration spécifique |

`Default` s'applique à tous les fichiers du dossier qui ne disposent pas d'une entrée dédiée dans `Specific`.

## Où doit se trouver chaque type d'élément graphique

Voici le tableau récapitulatif auquel tout le monde revient sans cesse. Chaque asset référence ses graphismes via un champ différent, et certains d'entre eux préfixent discrètement un sous-dossier au moment du chargement. La valeur saisie ne correspond donc **pas** toujours au chemin exact sur le disque.

| Asset | Champ | Emplacement du fichier |
| --- | --- | --- |
| Trait, pouvoir divin, royaume, groupe | `path_icon` | `GameResources/` + exactement ce que vous avez écrit |
| Objet, tenu en main par une unité | `path_gameplay_sprite` | `GameResources/` + exactement ce que vous avez écrit |
| Bâtiment | `sprite_path` | Un **dossier** : `GameResources/` + `sprite_path` + `/`, avec `main_0.png`, `construction_0.png`, `ruin_0.png`. Avec `sprite_path` vide, c'est `main_path` + id, et `main_path` vaut `buildings/` par défaut |
| Drop (butin) | `path_texture` | Un **dossier** : `GameResources/` + exactement ce que vous avez écrit |
| Nuage | `path_sprites` | `GameResources/` + chaque chemin présent dans la liste |
| Effet de statut | `texture` | Un **dossier** : `GameResources/effects/` + ce que vous avez écrit |
| Projectile | `texture` | Un **dossier** : `GameResources/effects/projectiles/` + ce que vous avez écrit |
| Ressource, portée en main | `path_gameplay_sprite` | Un **dossier** : `GameResources/items/resources/` + ce que vous avez écrit |
| Ressource, icône d'inventaire | `path_icon` | `GameResources/` + ce que vous avez écrit (le jeu utilise des noms simples comme `iconResBread`) |
| Case (Tile) et Top Tile | *(aucun champ)* | `GameResources/tiles/<id_de_la_case>/` |

> [!WARNING] "Un dossier" n'est pas une question de style
> Chaque asset marqué **dossier** ci-dessus est lu avec `getSpriteList()`, qui renvoie les frames *dans* un dossier. Pointe-le vers un PNG seul et il revient vide : un drop tombe invisible, un projectile lance `ArgumentOutOfRangeException` dans `QuantumSpriteLibrary.drawProjectiles()`, un statut lance à chaque frame. Un seul frame suffit, il doit juste être dans son propre dossier : `drops/hello_ember/hello_ember_0.png` :wbfacepalm:.

Trois subtilités à garder en tête :

- **Les statuts et les projectiles préfixent un sous-dossier.** Écrire `texture = "effects/status/myThing"` fera chercher le jeu dans `effects/effects/status/myThing`, qui n'existe pas. Les statuts vanilla utilisent des noms simples : `fx_status_burning_t`.
- **Les cases ignorent totalement ces champs.** Les graphismes d'une case sont résolus via son **identifiant (id)** dans son propre sous-dossier, car une case comporte de multiples variantes. `hello_moss` implique `GameResources/tiles/hello_moss/` avec vos PNG dedans.
- **Les bâtiments ne concatènent pas, mais ils ont un repli.** `sprite_path` est utilisé tel quel : `"buildings/hello_shrine"` veut dire `GameResources/buildings/hello_shrine/`. Laissez-le vide et le jeu prend `main_path` + id, donc un dossier écrit dans `main_path` devient `buildings/hello_shrine/hello_shrine` :PESgn_Bruh:.

> [!TIP] Copiez le chemin d'un asset vanilla
> Choisissez l'élément vanilla le plus proche, examinez son champ dans **[UnityExplorer](#/toolbox/unity-explorer)** ou avec la **[Recherche d'icônes](#/tools/icons)** et calquez sa structure exacte. C'est plus rapide et juste du premier coup :PESgn_Noice:.

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

> [!NOTE] Ajouter de nouveaux sons est un autre projet
> Les événements FMOD résident dans les banques de sons du jeu et un mod ne peut pas les enrichir directement. Jouer vos propres fichiers `.wav` implique de les charger vous-même dans une `AudioSource` Unity, en dehors des réglages de volume du jeu. Ce guide ne le traite pas, car je ne l'ai jamais moddé et je ne vais pas faire semblant du contraire.

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
