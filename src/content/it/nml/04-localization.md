---
title: Localizzazione
group: NML Modding
subgroup: Flusso di sviluppo base
icon: :wbscroll:
order: 26
---

# Localizzazione :wbscroll:

Ogni singolo elemento che aggiungi al gioco (tratti (trait), oggetti, poteri, schede, task) appare come una chiave grezza del tipo `trait_hello_swift` finché non gli assegni un testo. È il capitolo più noioso del modding, e saltarlo è il motivo principale per cui una mod sembra incompleta. (Coff.. le mie mod.. Coff Coff :pensiveanimated: )

## La via pigra: la cartella Locales

Se la tua classe principale eredita da `BasicMod<T>`, crea una cartella `Locales/` nella tua mod e inserisci un file JSON con il nome della lingua. NML lo caricherà **prima** di `OnModLoad`, senza che tu debba scrivere una sola riga di codice.

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money.",
  "hello_sword_ember": "Ember Blade",
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess."
}
```

Il nome del file **è** la lingua: `en.json`, `cz.json` (cinese semplificato), `ch.json` (cinese tradizionale), `ja.json` (giapponese), `ru.json`, `it.json` e così via. Questi sono gli id registrati da `GameLanguageLibrary`, non codici ISO indovinati. Il ceco è `cs`, non `cz`. Tieni la cartella della mod chiamata `Locales` con la L maiuscola; i percorsi delle risorse `locales/` del gioco stesso sono una cosa separata.

Se invece implementi `IMod` manualmente, aggiungi `ILocalizable` e punta alla cartella:

```csharp Code/Main.cs
public string GetLocaleFilesDirectory(ModDeclare pModDeclare)
{
    return System.IO.Path.Combine(pModDeclare.FolderPath, "Locales");
}
```

## Un solo file per tutte le lingue: il CSV


Se il tuo programma di fogli di calcolo esporta con punti e virgola o tabulazioni anziché virgole, implementa `ICsvSepCustomized` nella tua classe principale e restituisci `';'` da `GetCsvSeparator()` in modo che NML non trasformi le tue traduzioni in una minestra :PES2_Shrug:.
Un file `.csv` nella stessa cartella gestisce tutte le lingue contemporaneamente, il che è enormemente più comodo da mantenere rispetto a quindici file JSON distinti. In questo caso il nome del file non ha importanza:

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## Gestire i testi da codice

`NeoModLoader.General.LM` è l'helper di localizzazione. Comodo quando il tuo testo è generato, o quando vuoi semplicemente tutto in un unico file `.cs` invece di una pila di JSON.

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // read in the current language
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // add to whatever language is loaded now
LM.Add("en", "trait_hello_swift", "Swift");          // add to a specific language
LM.LoadLocale("en", "path/to/Locales/en.json");       // load a json manually (language + path)
LM.LoadLocales("path/to/Locales/lang.csv");          // load a csv manually
LM.ApplyLocale(false);                               // apply. false = don't refresh every text on screen
```

In HelloBox quel file è così:

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

Aggiungi `HelloLocale.Initialize();` in `Main.cs` **per primo**, prima di tutto il resto, così niente viene mai registrato mentre il suo testo manca ancora.

Registra **tutto in una volta, al caricamento**, e chiama `ApplyLocale` una sola volta alla fine. Se chiedi al gioco una chiave che non ha, ti restituisce la chiave stessa come testo, più un errore `missing text` nel log per ogni chiave: un tooltip fatto di chiavi mancanti non è solo brutto, ti riempie anche il log di rumore :PES_UghPing:.

## I nomi delle chiavi di cui hai davvero bisogno

Il gioco costruisce queste chiavi da solo, quindi devono combaciare alla perfezione o non compare nulla. Due di queste **non** seguono la regola "uguale all'id", e sono proprio quelle su cui la gente perde un'ora:

| Cosa | Chiave del nome | Chiave della descrizione |
| --- | --- | --- |
| Tratto | `trait_<id>` | `trait_<id>_info` |
| Oggetto | `translation_key` se ne imposti una, altrimenti `item_<equipment_subtype or id>` | `<id>_description` (senza il prefisso `item_`) |
| Potere divino (GodPower) | `<power_id>` | `<power_id>_description` |
| Scheda poteri | il `locale_key` che hai passato | la chiave di descrizione che hai passato |
| Azione unità | `task_unit_<task_id>` | - |
| Effetto di stato (status) | il **campo** `locale_id` che imposti | il **campo** `locale_description` che imposti |
| Legge del mondo (world law) | `<law_id>_title` (nota il suffisso) | `<law_id>_description` |

> [!WARNING] Gli ID non sono nomi
> Il tuo ID è `hello_swift` per sempre, in qualunque lingua, ed è ciò a cui fa riferimento il resto del tuo codice (e le mod di altri). Il **testo di localizzazione** è la parte che cambia. Non rinominare mai un ID solo per correggere un refuso nel nome visualizzato :PESgn_Stop:.

## L'API di gioco senza LM

Per un valore che serve solo nella lingua attualmente caricata:

```csharp
LocalizedTextManager.add("hello_notice", "Hello from HelloBox", pReplace: true);
string notice = LocalizedTextManager.getText("hello_notice");
```

`add(string pKey, string pTranslation, bool pReplace = false, string pFileName = "", bool pCheckForCharacters = true)` scrive nel dizionario di testo corrente. Le chiavi esistenti restano invariate a meno che `pReplace` non sia vero. Normalizza la chiave tramite `Underscore()`, quindi usa fin da subito chiavi con underscore. `getText(string pKey, Text text = null, bool pForceEnglish = false)` legge quel dizionario; il sorgente verificato non usa `pForceEnglish` per selezionare l'inglese.

> [!NOTE] Il testo corrente non è un file di traduzione
> Cambiare lingua ricostruisce i dizionari di testo del gioco. Usa `Locales` o `LM.Add` per traduzioni che devono sopravvivere a un cambio di lingua. `add` diretto inoltre non aggiorna per te i componenti di testo già esistenti.

Prossima pagina: **[Sprite e risorse](#/nml/sprites-and-resources)** oppure metti testo a schermo con **[Messaggi e registro del mondo](#/nml/messages-and-world-log)**.
