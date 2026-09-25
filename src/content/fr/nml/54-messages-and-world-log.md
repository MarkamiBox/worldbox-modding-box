---
title: Messages et journal du monde
group: Contenu du jeu
subgroup: Pouvoirs divins et interface
icon: :wbscroll:
order: 207
---

# Messages et journal du monde :wbscroll:

Afficher des messages dans la console avec `Main.Log()` est très pratique quand vous écrivez du code. Mais quand votre pouvoir divin fait tomber une météorite, qu'une créature boss personnalisée s'éveille, ou qu'un royaume signe un traité, le joueur ne lit pas votre log de débogage.

Il lui faut un retour à l'écran : des info-bulles qui flottent à travers l'écran et des entrées dans le journal d'histoire du monde.

## Bannières à l'écran avec WorldTip

Le moyen le plus rapide de mettre des mots devant le joueur est `WorldTip.showNow` :

```csharp
WorldTip.showNow(string pText, bool pTranslate = true, string pPosition = "center", float pTime = 3f, string pColor = "#F3961F");
```

| Paramètre | Ce qu'il fait | Par défaut |
| --- | --- | --- |
| `pText` | Soit une chaîne brute, soit une clé de localisation | Requis |
| `pTranslate` | Si `pText` doit passer par `LocalizedTextManager.getText()` | `true` |
| `pPosition` | Ancrage à l'écran : `"center"`, `"top"`, `"bottom"` | `"center"` |
| `pTime` | Durée en secondes avant de s'estomper | `3f` |
| `pColor` | Code couleur hexadécimal du texte | `"#F3961F"` (orange) |

> [!WARNING] WorldTip traduit par défaut
> Comme `pTranslate` vaut `true` par défaut, écrire `WorldTip.showNow("Something happened!")` fait chercher au jeu une clé de locale nommée `"Something happened!"`. Il n'en trouve pas, enregistre une erreur de traduction manquante, et affiche le texte brut en guise de solution de secours :PESgn_Oops:.
>
> Si vous passez du texte anglais littéral, définissez **toujours** `pTranslate: false` :
> ```csharp
> WorldTip.showNow("The Ancient Titan has awakened!", pTranslate: false, pColor: "#FF5555");
> ```
> Pour du texte localisé, passez votre clé de traduction et laissez `pTranslate: true` :
> ```csharp
> WorldTip.showNow("hello_titan_awakened", pTranslate: true);
> ```

### Texte de la barre d'outils du bas

Si vous voulez un message plus discret juste au-dessus de la barre des pouvoirs divins - comme le texte d'infobulle affiché en sélectionnant un pinceau - utilisez `showToolbarText` :

```csharp
if (WorldTip.instance != null)
{
    WorldTip.instance.showToolbarText("Right-click to cancel");
}
```

Cela dessine un petit indice flottant directement au-dessus de la barre de pouvoirs active.

## Enregistrer des événements du monde dans WorldLog

Le journal du monde est le registre persistant que les joueurs ouvrent dans la fenêtre Histoire. Les entrées survivent à une sauvegarde et un chargement, et sont liées à la chronologie du monde.

Le jeu fournit plusieurs aides statiques prêtes à l'emploi sur `WorldLog` :

```csharp
// Record an imperial succession:
WorldLog.logNewKing(kingdom);

// Record the founding of a new realm:
WorldLog.logNewKingdom(kingdom);

// Record a disaster event at a specific tile:
DisasterAsset earthquake = AssetManager.disasters.get("earthquake");
WorldTile centerTile = World.world.GetTile(100, 100);
WorldLog.logDisaster(earthquake, centerTile);
```

### Entrées d'histoire personnalisées

Pour ajouter votre propre événement d'histoire personnalisé, construisez un `WorldLogMessage` avec un `WorldLogAsset` provenant de `AssetManager.world_log` :

```csharp Mods/HelloBox/Code/HelloHistory.cs
namespace HelloBox
{
    public static class HelloHistory
    {
        public static void RecordTitanEvent(Kingdom pKingdom)
        {
            if (pKingdom == null || World.world == null) return;

            WorldLogAsset logAsset = AssetManager.world_log.get("king_new");
            if (logAsset == null) return;

            WorldLogMessage entry = new WorldLogMessage(logAsset, pKingdom.name, "Awakened the Titan")
            {
                timestamp = (int)World.world.getCurWorldTime()
            };

            // add() registers the entry with HistoryHud and writes it to the world log database:
            entry.add();
        }
    }
}
```

`entry.add()` ajoute l'entrée au HUD d'histoire de la partie en cours et la persiste dans la base de données SQLite du monde via `DBInserter.insertLog`.

## Étiquettes sur la carte (nameplates_library)

Quand les calques de carte sont activés, des bannières apparaissent au-dessus des villes, des royaumes et des religions. Elles sont gérées par `AssetManager.nameplates_library` (`NameplateAsset`).

| Champ | Ce qu'il fait |
| --- | --- |
| `id` | Identifiant correspondant à un `MetaType` |
| `path_sprite` | Chemin du sprite pour le cadre de la bannière |
| `padding_left` / `padding_right` / `padding_top` | Marges de décalage du texte |
| `map_mode` | Sur quel `MetaType` cette étiquette se dessine |

> [!WARNING] N'appelez pas add() pour les modes de carte vanilla
> La bibliothèque n'autorise **qu'une seule** étiquette par `MetaType`. Si vous appelez `AssetManager.nameplates_library.add(...)` pour un `MetaType` qui existe déjà (comme les royaumes ou les villes), ça lève une exception :wbfacepalm:.
>
> Si vous voulez retexturer ou restyliser les étiquettes vanilla, recherchez celle qui existe avec `get()` et modifiez ses champs :
> ```csharp
> NameplateAsset kingdomPlate = AssetManager.nameplates_library.get("kingdom");
> if (kingdomPlate != null)
> {
>     kingdomPlate.padding_left = 16;
> }
> ```

Suite : **[Options de jeu et vitesses](#/nml/game-options)** pour les options du joueur, ou **[Chaque frame](#/nml/update-loops)** pour exécuter de la logique sur une horloge.
