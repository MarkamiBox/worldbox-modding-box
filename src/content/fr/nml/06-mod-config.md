---
title: Paramètres du mod
group: Modding NML
subgroup: Avancé et publication
icon: :wbsettingsgear:
order: 40
---

# Paramètres du mod :wbsettingsgear:

Tôt ou tard, quelqu'un viendra vous dire que votre mod est trop fort, trop lent ou trop bruyant. Plutôt que de vous disputer sur Discord :PESgn_WhySoToxic:, donnez-leur une fenêtre de paramètres et laissez-les régler ça eux-mêmes.

NML dessine toute la fenêtre pour vous. Vous n'avez qu'à écrire un fichier JSON.

## default_config.json

Déposez un fichier `default_config.json` à la racine de votre mod, à côté de `mod.json` :

```json default_config.json
{
  "hellobox": [
    {
      "Id": "strike_radius",
      "Type": "INT_SLIDER",
      "IntVal": 25,
      "MinIntVal": 5,
      "MaxIntVal": 100,
      "Callback": "HelloBox.HelloSettings:SetStrikeRadius"
    },
    {
      "Id": "max_spawns",
      "Type": "INT_SLIDER",
      "IntVal": 40,
      "MinIntVal": 1,
      "MaxIntVal": 500
    },
    {
      "Id": "tint_by_mood",
      "Type": "SWITCH",
      "BoolVal": true
    }
  ]
}
```

`"hellobox"` est l'**identifiant de groupe** : un onglet de paramètres. Chaque élément à l'intérieur forme une ligne dans la fenêtre.

| Clé | Signification |
| --- | --- |
| `Id` | Unique au sein du groupe. Permet de lire la valeur dans le code |
| `Type` | `SWITCH` (on/off), `SLIDER` (flottant), `INT_SLIDER` (entier), `TEXT` (champ texte) |
| `BoolVal` / `FloatVal` / `IntVal` / `TextVal` | La valeur par défaut correspondant au type |
| `MinFloatVal` / `MaxFloatVal`, `MinIntVal` / `MaxIntVal` | Bornes du curseur |
| `IconPath` | Icône facultative pour la ligne |
| `Callback` | `Namespace.Type:MethodName` facultatif appelé quand la valeur change |

## Lire les valeurs

Avec `BasicMod<T>`, vous disposez de `GetConfig()` nativement, indexé par groupe puis par identifiant :

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LoadSettings();
}

private void LoadSettings()
{
    try { HelloSettings.StrikeRadius = GetConfig()["hellobox"]["strike_radius"].IntVal / 100f; }
    catch (System.Exception) { }

    try { HelloSettings.TintByMood = GetConfig()["hellobox"]["tint_by_mood"].BoolVal; }
    catch (System.Exception) { }
}
```

Oui, le `try/catch` autour de chaque élément a l'air paranoïaque. Ça ne l'est pas : si un joueur met à jour son mod depuis une ancienne version, sa configuration sauvegardée n'aura tout simplement pas la clé que vous venez d'ajouter, et une seule clé manquante ferait planter tout votre chargement.

## Callbacks

Un `Callback` est au format `Namespace.Type:MethodName`, et la méthode reçoit la nouvelle valeur :

```csharp Mods/HelloBox/Code/HelloSettings.cs
namespace HelloBox
{
    public static class HelloSettings
    {
        public static float StrikeRadius = 0.25f;
        public static bool TintByMood = true;

        // appelé par NML quand le joueur déplace le curseur
        public static void SetStrikeRadius(int pValue)
        {
            StrikeRadius = pValue / 100f;
        }
    }
}
```

> [!WARNING] Les modifications s'appliquent à la fermeture de la fenêtre
> Pas pendant le glissement. Si votre callback effectue une opération lourde, c'est une excellente nouvelle. Si vous attendiez un aperçu en direct, voilà pourquoi "ça ne marche pas" :huh:.

## Où c'est enregistré

Votre `default_config.json` n'est que le **modèle**. Les choix réels du joueur sont enregistrés dans :

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox\mods_config\<YOUR_GUID>.config
```

C'est aussi la toute première chose à supprimer lorsque vous testez vos valeurs par défaut et que vous vous demandez pourquoi vos modifications n'apparaissent jamais :PESgn_OOF:.

## Don't forget the text (again)

Les identifiants de groupe et d'élément sont également des clés de traduction ; ajoutez-les à vos fichiers sous `Locales/` pour éviter qu'ils n'apparaissent bruts :

Les ids de groupe et d'item sont aussi des clés de locale, donc mets-les dans `Locales/en.json` ou elles s'affichent brutes. Chaque ligne veut en plus une seconde clé, **`"<id> Description"`**, avec une espace et un D majuscule, pour l'infobulle :

```json Mods/HelloBox/Locales/en.json
{
  "hellobox": "HelloBox",

  "strike_radius": "Strike radius",
  "strike_radius Description": "How far the god power reaches.",

  "max_spawns": "Maximum spawns",
  "max_spawns Description": "Upper limit before the mod stops spawning.",

  "tint_by_mood": "Tint units by mood",
  "tint_by_mood Description": "Colour units by how happy they are."
}
```

> [!TIP] Le log te dit lesquelles tu as oubliées
> Un label manquant écrit `LocalizedTextManager: missing text: strike_radius Description`. Cherche `missing text:` après avoir ouvert la fenêtre des réglages une fois, et tu as la liste exacte des clés :wbsmirk:.


## Sans BasicMod

Si votre classe principale implémente directement `IMod`, implémentez `IConfigurable` sur cette même classe et retournez l'instance vous-même :

```csharp
public ModConfig GetConfig()
{
    return _config;   // créé ou chargé par vos soins
}
```

C'est cette méthode unique qui fait apparaître le bouton d'engrenage à côté de votre mod dans la liste des mods.
