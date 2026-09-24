---
title: Generatori di nomi
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbscroll:
order: 186
---

# Generatori di nomi :wbscroll:

Ogni nome in WorldBox esce da un generatore: unità, città, regni (kingdom), clan, guerre (war), libri (book). Le tue creature possono avere il loro, così un villaggio di spiriti di brace è pieno di Ashra e Cindox invece di prendere in prestito nomi umani.

## Da dove arriva un nome

Tre passaggi, dalla creatura fino alle lettere:

| Passaggio | Asset | Cosa contiene |
| --- | --- | --- |
| La creatura | `ActorAsset.name_template_sets` | Una lista di id di **set di nomi**. Ne viene scelto uno per cultura (culture) |
| Il set | `NameSetAsset` (`name_sets`) | Quale generatore usare per ogni tipo di cosa: `unit`, `city`, `kingdom`, `clan`, `family`, `culture`, `language`, `religion` |
| Il generatore | `NameGeneratorAsset` (`name_generator`) | Come viene costruito davvero il nome |

Quindi per rinominare un'intera specie fai un generatore, un set che lo usa, e fai puntare la creatura al set.

## Tre modi per costruire un nome

Un generatore lavora in uno di tre stili, e il gioco sceglie in base ai campi che hai riempito:

- **Gruppi di pezzi.** Una lista di gruppi, e da ognuno viene preso un pezzo a caso e incollato. Il più semplice, e quello che usa questa pagina.
- **Dizionario.** Parole intere prese da liste con un nome e messe in una frase. È così che guerre e libri ricevono titoli come "Bloody Hatred". Vedi **[Tipi di guerra](#/nml/war-types)** e **[Libri](#/nml/books)**.
- **Onomastica.** Un formato di testo compatto che usano quasi tutte le civiltà vanilla, e che fa anche cambiare i nomi nel tempo dentro una cultura. È potente e non comincerei da lì: copiane uno da `NameGeneratorLibrary` se lo vuoi, e cambia le sillabe.

## Il codice

```csharp Mods/HelloBox/Code/HelloNames.cs
namespace HelloBox
{
    public static class HelloNames
    {
        public const string GENERATOR = "hello_sprite_name";
        public const string SET = "hello_sprite_set";

        public static void Initialize()
        {
            if (AssetManager.name_generator.has(GENERATOR)) return;

            NameGeneratorAsset generator = new NameGeneratorAsset
            {
                id = GENERATOR,
                // post_init() fills these two for part-group generators, and it already ran.
                // Female names add a vowel from this list, so leaving it null crashes.
                vowels = new string[] { "a", "e", "i", "o" },
                consonants = NameGeneratorAsset.consonants_sounds
            };

            // one piece from each group, in order. An empty entry means "sometimes nothing"
            generator.addPartGroup("ash,cin,em,sol,vol,ky");
            generator.addPartGroup("a,e,i,o,,");
            generator.addPartGroup("ra,dox,ber,rin,th,x");
            generator.addTemplate("Part_group");   // capital P = first letter upper case

            AssetManager.name_generator.add(generator);

            // the same generator for everything these creatures ever name
            AssetManager.name_sets.add(new NameSetAsset
            {
                id = SET,
                unit = GENERATOR,
                city = GENERATOR,
                kingdom = GENERATOR,
                clan = GENERATOR,
                family = GENERATOR,
                culture = GENERATOR,
                language = GENERATOR,
                religion = GENERATOR
            });
        }
    }
}
```

Poi, sulla tua creatura di **[Attori personalizzati](#/nml/custom-actors)**:

```csharp
asset.name_template_sets = new string[] { HelloNames.SET };
```

`HelloNames.Initialize()` va **prima** degli attori in `OnModLoad`, perché l'attore punta al set.

> [!WARNING] Riempi ogni posto del set
> Una cultura chiede al suo set un generatore per ogni tipo di cosa. Un posto `city` vuoto vuol dire che il gioco cerca un generatore chiamato `""`, riceve `null`, e la prima città fondata dalle tue creature si porta dietro tutto il gioco. Usa lo stesso generatore ovunque se non hai di meglio :PESgn_Stop:.

## Le parole dei modelli

Un modello è una lista di parole separate da virgole. Per i generatori a gruppi di pezzi, queste sono quelle utili:

| Parola | Cosa aggiunge |
| --- | --- |
| `part_group` / `Part_group` | Un pezzo da ogni gruppo di `addPartGroup`. La P maiuscola rende maiuscola la prima lettera |
| `part_group2`, `part_group3` | Lo stesso per `addPartGroup2` e `addPartGroup3`, per una seconda o terza parola |
| `space` | Uno spazio, quindi `Part_group,space,Part_group2` fa nome e cognome |
| `vowel` / `consonant` | Una lettera dai tuoi `vowels` / `consonants` |
| `number` | Una cifra da 0 a 9. Per i robot, immagino |

Chiama `addTemplate` più di una volta e il gioco sceglie un modello a caso per ogni nome.

## Provarlo senza aspettare i neonati

`NameGenerator.getName` è public, quindi puoi stampare dieci nomi nel log al caricamento:

```csharp
for (int i = 0; i < 10; i++)
{
    LogInfo(NameGenerator.getName(HelloNames.GENERATOR));
}
```

Se metà sembrano scritti da un gatto che ha camminato sulla tastiera, i tuoi gruppi sono troppo lunghi. Pezzi corti, più gruppi. I nomi che stanno nella blacklist del gioco vengono scartati e ritirati, quindi non ne vedrai mai uno :PES5_Noted:.

Per titoli fatti di parole intere (guerre, libri, motti) ti serve lo stile dizionario, e le prossime due pagine ne costruiscono uno ciascuna.
