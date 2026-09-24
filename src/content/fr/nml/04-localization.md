---
title: Localisation
group: Modding NML
subgroup: Flux de travail de base
icon: :wbscroll:
order: 26
---

# Localisation :wbscroll:

Chaque élément que vous ajoutez au jeu (traits, objets, pouvoirs, onglets, tâches (task)) apparaît sous forme de clé brute comme `trait_hello_swift` tant que vous ne lui donnez pas de texte. C'est le chapitre le plus rébarbatif du modding, et l'ignorer est la raison principale pour laquelle un mod donne l'impression d'être inachevé. (Tousse.. mes mods.. Tousse Tousse :pensiveanimated: )

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


Si votre tableur exporte avec des points-virgules ou des tabulations plutôt que des virgules, implémentez `ICsvSepCustomized` sur votre classe principale et renvoyez `';'` depuis `GetCsvSeparator()` pour que NML ne transforme pas vos traductions en soupe :PES2_Shrug:.
Un fichier `.csv` dans le même dossier couvre toutes les langues d'un coup, ce qui est bien plus agréable à maintenir qu'une quinzaine de fichiers JSON. Ici, le nom du fichier n'a pas d'importance :

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## Le faire directement depuis le code

`NeoModLoader.General.LM` est l'outil de localisation. Pratique quand votre texte est généré, ou quand vous voulez simplement tout avoir dans un seul fichier `.cs` plutôt qu'une pile de JSON.

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // read in the current language
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // add to whatever language is loaded now
LM.Add("en", "trait_hello_swift", "Swift");          // add to a specific language
LM.LoadLocale("en", "path/to/Locales/en.json");       // load a json manually (language + path)
LM.LoadLocales("path/to/Locales/lang.csv");          // load a csv manually
LM.ApplyLocale(false);                               // apply. false = don't refresh every text on screen
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

Ajoutez `HelloLocale.Initialize();` dans `Main.cs` **en premier**, avant tout le reste, pour que rien ne soit jamais enregistré tant que son texte manque.

Enregistrez **tout d'un coup, au chargement**, et appelez `ApplyLocale` une seule fois à la fin. Demander au jeu une clé qu'il n'a pas vous renvoie la clé elle-même comme texte, plus une erreur `missing text` dans le log par clé : une infobulle faite de clés manquantes n'est donc pas seulement moche, elle remplit aussi votre log de bruit :PES_UghPing:.

## Les noms de clés dont vous avez réellement besoin

Le jeu construit ces clés lui-même, elles doivent donc correspondre exactement, sinon rien ne s'affiche. Deux d'entre elles ne suivent **pas** la règle "comme l'id", et ce sont justement celles sur lesquelles on perd une heure :

| Quoi | Clé du nom | Clé de la description |
| --- | --- | --- |
| Trait | `trait_<id>` | `trait_<id>_info` |
| Objet | `translation_key` si vous en définissez une, sinon `item_<equipment_subtype or id>` | `<id>_description` (sans le préfixe `item_`) |
| Pouvoir divin (GodPower) | `<power_id>` | `<power_id>_description` |
| Onglet de pouvoirs | le `locale_key` que vous avez passé | la clé de description que vous avez passée |
| Tâche d'acteur | `task_unit_<task_id>` | - |
| Effet de statut (status) | le **champ** `locale_id` que vous définissez | le **champ** `locale_description` que vous définissez |
| Loi du monde (world law) | `<law_id>_title` (attention au suffixe) | `<law_id>_description` |

> [!WARNING] Les ids ne sont pas des noms
> Votre id reste `hello_swift` pour toujours, dans toutes les langues, et c'est à lui que se réfèrent le reste de votre code (et les mods des autres). Le **texte localisé** est la partie qui change. Ne renommez jamais un id juste pour corriger une faute dans le nom affiché :PESgn_Stop:.
