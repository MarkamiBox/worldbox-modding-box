---
title: Localisation
group: Modding NML
subgroup: Flux de travail de base
icon: :wbscroll:
order: 26
---

# Localisation :wbscroll:

Chaque élément que vous ajoutez au jeu (traits, objets, pouvoirs, onglets, tâches) apparaît sous forme de clé brute comme `trait_hello_swift` tant que vous ne lui donnez pas de texte. C'est le chapitre le plus rébarbatif du modding, et l'ignorer est la raison principale pour laquelle un mod donne l'impression d'être inachevé. (Tousse.. mes mods.. Tousse Tousse :pensiveanimated: )

## La méthode paresseuse : le dossier Locales

Si votre classe principale hérite de `BasicMod<T>`, créez simplement un dossier `Locales/` dans votre mod et déposez-y un fichier JSON nommé d'après la langue. NML le charge **avant** `OnModLoad`, sans que vous ayez à écrire la moindre ligne de code.

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money.",
  "hello_sword_ember": "Ember Blade",
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess."
}
```

Le nom du fichier **est** la langue : `en.json`, `cz.json` (chinois simplifié), `ru.json`, `fr.json`, etc.

Si vous implémentez `IMod` à la main, ajoutez `ILocalizable` et pointez vers le dossier :

```csharp Code/Main.cs
public string GetLocaleFilesDirectory(ModDeclare pModDeclare)
{
    return System.IO.Path.Combine(pModDeclare.FolderPath, "Locales");
}
```

## Un seul fichier pour toutes les langues : le CSV

Un fichier `.csv` dans le même dossier couvre toutes les langues d'un coup, ce qui est bien plus agréable à maintenir qu'une quinzaine de fichiers JSON. Ici, le nom du fichier n'a pas d'importance :

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## Le faire directement depuis le code

`NeoModLoader.General.LM` est l'outil d'aide à la localisation. Très pratique lorsque votre texte est généré dynamiquement ou si vous préférez tout centraliser dans un seul fichier `.cs` plutôt que de gérer des JSON.

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // lire dans la langue active
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // ajouter à la langue actuellement chargée
LM.Add("en", "trait_hello_swift", "Swift");          // ajouter à une langue spécifique
LM.LoadLocale("path/to/Locales/en.json");            // charger un json manuellement
LM.LoadLocales("path/to/Locales/lang.csv");          // charger un csv manuellement
LM.ApplyLocale(false);                               // appliquer. false = ne pas recalculer tous les textes affichés
```

Dans HelloBox, ce fichier ressemble à ceci :

```csharp Mods/HelloBox/Code/HelloLocale.cs
using System.Collections.Generic;
using NeoModLoader.General;

namespace HelloBox
{
    public static class HelloLocale
    {
        public static void Initialize()
        {
            Dictionary<string, string> texts = new Dictionary<string, string>
            {
                { "trait_hello_swift", "Swift" },
                { "trait_hello_swift_info", "Moves like the world owes it money." },
                { "hello_strike", "Hello Strike" },
                { "hello_strike_description", "Shakes the ground and makes a mess." }
            };

            foreach (KeyValuePair<string, string> pair in texts)
            {
                LM.AddToCurrentLocale(pair.Key, pair.Value);
                LM.Add("en", pair.Key, pair.Value);
            }

            LM.ApplyLocale(false);
        }
    }
}
```

Ajoutez `HelloLocale.Initialize();` dans `Main.cs` **en tout premier**, avant tout le reste, afin qu'aucun asset ne soit enregistré alors que son texte fait encore défaut.

Enregistrez **tout d'un coup, au chargement**, et appelez `ApplyLocale` une fois à la fin. Demander au jeu une clé qu'il ne connaît pas déclenche une ligne d'erreur dans le log et écrit un fichier sur le disque, donc une infobulle remplie de clés manquantes est non seulement moche, mais pollue aussi les logs :PES_UghPing:.

## Les noms de clés dont vous avez réellement besoin

Le jeu construit ces clés lui-même, elles doivent donc concorder exactement :

| Élément | Clé du nom | Clé de la description |
| --- | --- | --- |
| Trait | `trait_<id>` | `trait_<id>_info` |
| Objet | `item_<id>` | `item_<id>_description` |
| Pouvoir divin | `<power_id>` | `<power_id>_description` |
| Onglet de pouvoir | la `locale_key` fournie | la clé de description fournie |
| Tâche d'unité | `task_unit_<task_id>` | - |
| Effet de statut | `<status_id>` | `<status_id>_description` |
| Loi du monde | `<law_id>_title` (notez le suffixe) | `<law_id>_description` |

> [!WARNING] Les ID ne sont pas des noms
> Votre ID est `hello_swift` pour toujours, dans toutes les langues, et c'est ce à quoi le reste de votre code (et les mods des autres) fera référence. Le **texte de localisation** est la seule partie qui varie. Ne renommez jamais un ID simplement pour corriger une faute d'orthographe dans le nom d'affichage :PESgn_Stop:.
