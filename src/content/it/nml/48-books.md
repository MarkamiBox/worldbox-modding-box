---
title: Libri
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbscroll:
order: 187
---

# Libri :wbscroll:

Le unità scrivono libri (book), le città li conservano, e altre unità li leggono e ne escono un po' diverse. Un tipo di libro è un nuovo genere di libro in questo ciclo: chi lo scrive, come si chiama, che copertina ha e cosa ti fa leggerlo.

La pagina **[Tratti linguistici](#/nml/language-traits)** ne crea già uno piccolo, l'Almanacco di Brace. Questa pagina prende lo stesso libro e lo finisce: titoli suoi, una ricompensa vera e qualcosa che succede quando lo leggi.

## Come nasce un libro

Qui niente ha bisogno di una patch, devi solo conoscere il ciclo:

1. Un'unità decide di scrivere. Il gioco raccoglie tutti i tipi di libro il cui `requirement_check` passa per quell'unità.
2. Ognuno entra in un sacchetto `writing_rate` volte (o `rate_calc` volte, se lo imposti), **al massimo 10**, e se ne estrae uno.
3. Il libro ha bisogno di un edificio (building) con un posto libero per i libri nella **città** di chi scrive. Niente biblioteca, niente libro.
4. Il titolo viene dal generatore di nomi in `name_template`, la copertina dalla cartella in `path_icons`.
5. Più tardi qualcuno lo legge e riceve le ricompense qui sotto.

Siccome il gioco rilegge `book_types.list` ogni volta, a un tipo di libro basta `add()`. Niente pool, niente post-init. Una rara bella sorpresa :PESgn_Neat:.

## Il codice

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";
        public const string TITLES = "hello_book_titles";

        public static void Initialize()
        {
            Titles();

            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset almanac = new BookTypeAsset
            {
                id = ALMANAC,
                name_template = TITLES,              // our own titles, below
                color_text = "#D14219",
                writing_rate = 2,
                path_icons = "hello_almanac/",       // GameResources/books/book_icons/hello_almanac/
                requirement_check = (Actor pActor, BookTypeAsset pAsset) => pActor.hasTrait(HelloTraits.SWIFT),
                read_action = (Actor pActor, BookTypeAsset pAsset) =>
                {
                    // runs once per read, on the reader
                    StatusAsset curse = AssetManager.status.get(HelloStatus.CURSED);
                    if (curse != null) World.world.statuses.newStatus(pActor, curse, 0f);
                }
            };

            AssetManager.book_types.add(almanac);

            // what a reader gets out of it
            almanac.base_stats["experience"] = 5f;
            almanac.base_stats["happiness"] = 5f;
            almanac.base_stats["intelligence"] = 1f;   // this one is permanent, see below
        }

        /** A title generator in the dictionary style, built on the game's own book template. */
        private static void Titles()
        {
            if (AssetManager.name_generator.has(TITLES)) return;

            // $base_book_template$ already knows "of", "and", "about" and all the $name$ slots
            NameGeneratorAsset titles = AssetManager.name_generator.clone(TITLES, "$base_book_template$");
            titles.replacer += NameGeneratorReplacers.replaceOwnName;   // fills $unit$ with the writer
            titles.replacer += NameGeneratorReplacers.replaceOwnCity;   // fills $city$

            titles.addDictPart("almanac", "Almanac,Handbook,Notes,Scribbles,Field Guide");
            titles.addDictPart("fire", "Fire,Embers,Ash,Sparks,Smoke");
            titles.addTemplate("almanac,of,fire");
            titles.addTemplate("almanac,of,$unit$");
            titles.addTemplate("fire,and,$city$");
        }
    }
}
```

Questo file **sostituisce** l'`HelloBooks.cs` della pagina dei tratti (trait) linguistici, è la stessa classe cresciuta. `HelloBooks.Initialize()` va dopo il tratto e lo stato che usa.

## Cosa dà leggerlo

I numeri in `base_stats` non sono un bonus che svanisce. Ogni lettura li distribuisce una volta:

| Statistica (stats) | Cosa riceve chi legge |
| --- | --- |
| `happiness` | Tanta felicità, come evento "ha appena letto un libro". Funziona anche in negativo, per i libri deprimenti |
| `experience` | Tanta esperienza |
| `mana` | Tanto mana |
| `diplomacy`, `warfare`, `stewardship`, `intelligence` | Aggiunti a chi legge **per sempre**. A ogni lettura, di nuovo |

L'ultima riga è quella potente. Un libro che dà `intelligence = 1` rende una città di lettori più intelligente a ogni generazione, quindi tienilo piccolo. Un libro da +10 è il modo per avere un regno (kingdom) di geni entro l'anno 50 :wbgenius:.

I tratti di lingua e di cultura (culture) possono cambiare i primi due: una lingua con `beautiful_calligraphy` rende la felicità più grande, e una cultura con `reading_lovers` rende allegri i libri tristi.

## I campi che contano

| Campo | Cosa fa |
| --- | --- |
| `name_template` | Il generatore di nomi per i titoli. Vanilla: `book_name_fable`, `book_name_love_story`, `book_name_history`... |
| `writing_rate` | Il suo peso quando uno scrittore sceglie un tipo. Vanilla usa da 1 a 3 |
| `rate_calc` | Un metodo che restituisce il peso al suo posto, come il manuale di guerra vanilla con il `warfare` di chi scrive. Sempre al massimo 10 |
| `requirement_check` | Chi può scriverlo. `null` = chiunque |
| `read_action` | Il tuo codice, una volta per lettura |
| `path_icons` | Una cartella dentro `books/book_icons/`, letta come lista di immagini. Ne viene scelta una per libro |
| `color_text` | Il colore del titolo nell'interfaccia |
| `save_culture` / `save_religion` | Se il libro ricorda la cultura e la religione (religion) di chi l'ha scritto. Tutti e due attivi di default, e contano per i libri che diffondono una fede |

## Il generatore di titoli

I titoli usano lo stile dizionario di **[Generatori di nomi](#/nml/name-generators)**. Un modello è una lista di chiavi del dizionario, e ogni chiave sceglie una parola dalla sua lista:

- `addDictPart("almanac", "Almanac,Handbook,Notes")` crea una chiave con tre parole possibili.
- `addTemplate("almanac,of,fire")` incolla una parola da ogni chiave: "Handbook of Ash".
- Parole come `$unit$` e `$city$` sono segnaposto. Un **replacer** li riempie con il nome o la città veri di chi scrive. Senza il replacer giusto escono così come sono, `$unit$`, sulla copertina :wbfacepalm:.

Clonare `$base_book_template$` è la scorciatoia: ha già le parole piccole (`of`, `and`, `about`, `the`...), tutti i segnaposto e la sistemazione dei titoli del gioco.

## Il testo

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

Le chiavi sono fisse: `book_type_<id>` e `book_type_info_<id>`. I titoli vengono generati, quindi non hanno chiavi.

## Le tue copertine

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── books/
        └── book_icons/
            └── hello_almanac/     <- one PNG per cover, any names
```

`path_icons` è una **cartella**, con la `/` alla fine. Basta un PNG, deve solo stare dentro. Mentre provi, prendi in prestito una cartella vanilla come `fable/`.

Per vederlo funzionare, crea un mondo, lascia crescere una città con il tuo tratto finché non costruisce una biblioteca, e apri i libri della città. Ci vuole un po', è un libro :PES2_Shrug:.
