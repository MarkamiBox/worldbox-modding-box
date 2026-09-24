---
title: Tratti linguistici
group: Contenuto di gioco
subgroup: Tratti e genetica
icon: :wbconfused:
order: 112
---

# Tratti linguistici :wbconfused:

Una **lingua** appartiene a città e regni, muta con il diffondersi del suo uso ed è il mezzo con cui vengono scritti i **libri**. Un tratto linguistico è una proprietà intrinseca della parola scritta e parlata.

È il più compatto dei sette sistemi di tratti e vanta l'hook più specifico in assoluto: codice che scatta nel momento in cui qualcuno **legge un libro** redatto in quella lingua. Sì, davvero :wbscroll:.

| | |
| --- | --- |
| Libreria | `AssetManager.language_traits` |
| Classe | `LanguageTrait` |
| Gruppi | `AssetManager.language_trait_groups`, classe `LanguageTraitGroupAsset` |
| Proprietario a runtime | `Language`, in `World.world.languages` |
| Prefisso di localizzazione | `language_trait_` |
| Cartella icone predefinita | `ui/Icons/language_traits/` |

## Registrarne uno

```csharp Mods/HelloBox/Code/HelloLanguage.cs
namespace HelloBox
{
    public static class HelloLanguage
    {
        public const string CLIPPED = "hello_clipped";

        public static void Initialize()
        {
            if (AssetManager.language_traits.has(CLIPPED)) return;

            LanguageTrait trait = new LanguageTrait
            {
                id = CLIPPED,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "knowledge",
                path_icon = "ui/Icons/iconHelloLanguage",
                value = 2f,                    // quanto "vale" questo tratto. Vedi sotto
                rarity = Rarity.R1_Rare
            };

            AssetManager.language_traits.add(trait);

            trait.addOpposite("scribble");
            trait.base_stats["intelligence"] = 2;
        }
    }
}
```

Le statistiche `base_stats` della lingua arrivano **effettivamente** alle unità: `Actor.updateStats()` unisce `language.base_stats` in chiunque la parli. Consulta l'ordine di fusione nel **[Riferimento statistiche](#/nml/stats)**.

## L'hook dei libri

`read_book_trait_action` è il campo riservato esclusivamente ai tratti linguistici. Scatta quando un'unità finisce di leggere un libro scritto in quella lingua:

```csharp
public delegate void BookTraitAction(Actor pActor, LanguageTrait pTrait, Book pBook);
```

```csharp
trait.value = 0.2f;   // il vanilla riutilizza `value` come probabilità per questo hook

trait.read_book_trait_action = delegate(Actor pActor, LanguageTrait pTrait, Book pBook)
{
    if (pActor == null || !pActor.isAlive()) return;
    if (pActor.hasTrait("evil")) return;
    if (!Randy.randomChance(pTrait.value)) return;

    pActor.addTrait("hello_swift");
};
```

È esattamente così che operano le scritture maledette e benedette del gioco base: `words_of_madness` verifica `value` e assegna il tratto `madness`, `cursed_font` applica uno status, `font_of_gods` ne applica uno migliore.

Due ottime pratiche da mutuare dal vanilla:

- **Leggi la probabilità da `pTrait.value`, mai da una costante.** Il tratto viene passato come argomento proprio affinché lo stesso delegato possa gestire più tratti a intensità diverse.
- **Interrompi subito per le unità che devono risultare immuni.** Tutte le versioni vanilla verificano prima `evil` o `blessed`.

## Il tuo tipo di libro

Il gioco definisce i formati dei libri in `AssetManager.book_types`:

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";

        public static void Initialize()
        {
            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset book = new BookTypeAsset
            {
                id = ALMANAC,
                name = "book_type_" + ALMANAC,
                description = "book_type_info_" + ALMANAC,
                rarity = 5
            };
            AssetManager.book_types.add(book);
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

## Il campo `value`

`value` è presente in ogni classe di tratto, ma nelle lingue trova il suo impiego maggiore. Il gioco vanilla lo adotta in due maniere:

| Utilizzo | Esempio |
| --- | --- |
| Qualità della lingua | `melodic` e `stylish_writing` usano `value = 3f` |
| Probabilità per l'hook del libro | `words_of_madness` usa `value = 0.1f` |

Nulla impone una scelta vincolante; definisci un significato per tratto e mantienilo con coerenza.

## Opposti

I tratti linguistici formano coppie contrapposte con maggiore frequenza rispetto agli altri sistemi, poiché una lingua o possiede una grammatica strutturata o ne è priva:

```csharp
trait.addOpposite("scribble");
```

Dichiaralo su entrambi i lati, esattamente come il vanilla dichiara `scribble` e `nicely_structured_grammar` opposti reciproci.

## I gruppi vanilla

`knowledge` · `spirit` · `harmony` · `chaos` · `miscellaneous` · `fate` · `special`

Per creare la tua scheda: vedi **[Gruppi di tratti e schede](#/nml/trait-groups)**, con `AssetManager.language_trait_groups` e `LanguageTraitGroupAsset`.

## I testi

```json Mods/HelloBox/Locales/en.json
{
  "language_trait_hello_clipped": "Clipped",
  "language_trait_hello_clipped_info": "Every sentence ends two words early. Nobody minds."
}
```

## Assegnare il tratto

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addLanguageTrait(HelloLanguage.CLIPPED);
```

```csharp
foreach (Language language in World.world.languages)
{
    if (language == null || language.isRekt()) continue;

    language.addTrait(HelloLanguage.CLIPPED, pRemoveOpposites: true);
}
```

Un'istanza di `Language` espone anche `cities`, `kingdoms` e `books`, fondamentali quando il tuo codice desidera mappare la diffusione geografica di una parlata.

> [!TIP] I libri sono un veicolo di diffusione sottovalutato
> Un libro scritto nella tua lingua è un metodo graduale e organico per dispensare tratti o status. Circola nelle biblioteche, richiede generazioni e il giocatore ne segue visivamente gli sviluppi. Quasi nessun modder lo sfrutta, ed è proprio per questo che merita farlo :PES4_Classy:.

## Nuove lingue che estraggono un tratto da sole

Oltre ad assegnarlo manualmente, un tratto di lingua può impostare `spawn_random_trait_allowed` per essere estratto alla formazione di una nuova lingua, nello stesso modo in cui una cultura sceglie i suoi tratti iniziali. Stessa trappola di ogni altra pagina sui tratti:

> [!WARNING] `spawn_random_trait_allowed` viene letto una sola volta, all'avvio
> Le nuove lingue pescano i loro tratti iniziali da un gruppo che `BaseTraitLibrary.linkAssets()` costruisce durante il caricamento del gioco, prima che la tua mod esista. Impostare il flag sul tuo tratto non cambia nulla da solo: il tuo tratto non è mai in quel gruppo e non apparirà mai per caso su una nuova lingua. Aggiungilo tu stesso, con il peso usato dal gioco vanilla:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.language_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` è `protected`, quindi compila contro l'assembly pubblicizzata con cui NML compila già la tua mod. `spawn_random_rate` ha valore predefinito `5`: aumentalo e il tratto apparirà più spesso.
