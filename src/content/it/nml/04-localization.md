---
title: Localizzazione
group: NML Modding
subgroup: Flusso di sviluppo base
icon: :wbscroll:
order: 26
---

# Localizzazione :wbscroll:

Ogni singolo elemento che aggiungi al gioco (tratti, oggetti, poteri, schede, task) appare come una chiave grezza del tipo `trait_hello_swift` finché non gli assegni un testo. È il capitolo più noioso del modding, e saltarlo è il motivo principale per cui una mod sembra incompleta. (Coff.. le mie mod.. Coff Coff :pensiveanimated: )

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

Il nome del file **è** la lingua: `en.json`, `cz.json` (cinese semplificato), `ru.json`, `it.json` e così via.

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

`NeoModLoader.General.LM` è il gestore della localizzazione. Comodissimo quando il testo è generato dinamicamente o quando vuoi tenere tutto raccolto in un unico file `.cs` anziché in una marea di JSON.

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // legge nella lingua corrente
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // aggiunge alla lingua attualmente caricata
LM.Add("en", "trait_hello_swift", "Swift");          // aggiunge a una lingua specifica
LM.LoadLocale("en", path);            // carica un json manualmente
LM.LoadLocales("path/to/Locales/lang.csv");          // carica un csv manualmente
LM.ApplyLocale(false);                               // applica. false = non ridisegna tutti i testi a schermo
```

In HelloBox questo file si presenta così:

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

Aggiungi `HelloLocale.Initialize();` in `Main.cs` **per prima cosa**, prima di tutto il resto, così nessun elemento verrà mai registrato mentre il suo testo risulta ancora assente.

Registra **tutto insieme, al caricamento**, e chiama `ApplyLocale` una volta sola alla fine. Chiedere al gioco una chiave che non esiste genera un log di errore e scrive un file su disco: un tooltip pieno di chiavi mancanti non è solo brutto, ma intasa anche i log :PES_UghPing:.

## I nomi delle chiavi di cui hai davvero bisogno

Il gioco costruisce queste chiavi autonomamente, quindi devono combaciare alla perfezione:

| Elemento | Chiave del nome | Chiave della descrizione |
| --- | --- | --- |
| Tratto | `trait_<id>` | `trait_<id>_info` |
| Oggetto | `item_<id>` | `item_<id>_description` |
| Potere divino | `<power_id>` | `<power_id>_description` |
| Scheda poteri | il `locale_key` passato | la chiave di descrizione passata |
| Azione unità | `task_unit_<task_id>` | - |
| Effetto di stato | `<status_id>` | `<status_id>_description` |
| Legge del mondo | `<law_id>_title` (nota il suffisso) | `<law_id>_description` |

> [!WARNING] Gli ID non sono nomi
> Il tuo ID è `hello_swift` per sempre, in qualunque lingua, ed è ciò a cui fa riferimento il resto del tuo codice e le mod di altri autori. Il **testo di localizzazione** è l'unica parte che cambia. Non rinominare mai un ID solo per correggere un errore di battitura nel nome visualizzato :PESgn_Stop:.
