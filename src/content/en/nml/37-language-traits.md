---
title: Language traits
group: Game Content
subgroup: Traits & Genetics
icon: :wbconfused:
order: 112
---

# Language traits :wbconfused:

A **language** belongs to cities and kingdoms, drifts as it spreads, and, this is the part that matters, is what **books** are written in. A language trait is a property of the written and spoken word itself.

It is the smallest of the seven trait systems and the one with the most specific hook: code that runs when somebody **reads a book** in that language.

| | |
| --- | --- |
| Library | `AssetManager.language_traits` |
| Class | `LanguageTrait` |
| Groups | `AssetManager.language_trait_groups`, class `LanguageTraitGroupAsset` |
| Owner at runtime | `Language`, in `World.world.languages` |
| Locale prefix | `language_trait_` |
| Default icon folder | `ui/Icons/language_traits/` |

## Registering one

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
                value = 2f,                    // what this trait is "worth". See below
                rarity = Rarity.R1_Rare
            };

            AssetManager.language_traits.add(trait);

            trait.addOpposite("scribble");
            trait.base_stats["intelligence"] = 2;
        }
    }
}
```

Language `base_stats` **do** reach units: `Actor.updateStats()` merges `language.base_stats` into everyone who speaks it. See the merge order on **[Stats reference](#/nml/stats)**.

## The book hook

`read_book_trait_action` is the field only language traits have. It fires when a unit finishes reading a book written in that language:

```csharp
public delegate void BookTraitAction(Actor pActor, LanguageTrait pTrait, Book pBook);
```

```csharp
trait.value = 0.2f;   // vanilla reuses `value` as the chance for this hook

trait.read_book_trait_action = delegate(Actor pActor, LanguageTrait pTrait, Book pBook)
{
    if (pActor == null || !pActor.isAlive()) return;
    if (pActor.hasTrait("evil")) return;
    if (!Randy.randomChance(pTrait.value)) return;

    pActor.addTrait("hello_swift");
};
```

That is exactly how vanilla's cursed and blessed scripts work: `words_of_madness` rolls `value` and adds the `madness` trait, `cursed_font` applies a status, `font_of_gods` applies a better one.

Two things to copy from vanilla here:

- **Read the chance off `pTrait.value`, not off a constant.** The trait is handed to you precisely so the same delegate can serve several traits at different strengths.
- **Bail early on the units that should be immune.** Every vanilla version checks `evil` or `blessed` first.

## Your own kind of book

The book hook above changes what a book does. A **book type** is a new kind of book: what it is called, who writes it, and what reading it gives.

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";

        public static void Initialize()
        {
            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset almanac = new BookTypeAsset
            {
                id = ALMANAC,
                name_template = "book_name_fable",   // a vanilla name template
                color_text = "#D14219",
                writing_rate = 2,                    // weight against the other book types
                path_icons = "fable/",               // borrow the fables' covers: books/book_icons/fable/
                requirement_check = (Actor pActor, BookTypeAsset pAsset) => pActor.hasTrait(HelloTraits.SWIFT)
            };

            AssetManager.book_types.add(almanac);

            // what a reader gets out of it
            almanac.base_stats["experience"] = 5f;
            almanac.base_stats["happiness"] = 5f;
        }
    }
}
```

The writer picks a type among the ones whose `requirement_check` passes, weighted by `writing_rate` (or your `rate_calc`, capped at 10), from the whole list each time: `add()` is enough. `path_icons` is a folder under `books/book_icons/` read as a list of covers, so borrowing a vanilla one costs nothing.

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

## The `value` field

`value` is on every trait class, but language is where it is used most. Vanilla sets it two different ways:

| Use | Example |
| --- | --- |
| Quality of the language | `melodic` and `stylish_writing` use `value = 3f` |
| Chance for the book hook | `words_of_madness` uses `value = 0.1f` |

Nothing enforces which meaning you pick, so pick one per trait and keep it consistent.

## Opposites

Language traits pair up more than any other system, because a language either has structured grammar or it does not:

```csharp
trait.addOpposite("scribble");
```

Declare it on both sides, the way vanilla declares `scribble` and `nicely_structured_grammar` as opposites of each other.

## The vanilla groups

`knowledge` · `spirit` · `harmony` · `chaos` · `miscellaneous` · `fate` · `special`

Your own tab: see **[Trait groups & tabs](#/nml/trait-groups)**, with `AssetManager.language_trait_groups` and `LanguageTraitGroupAsset`.

## The text

```json Mods/HelloBox/Locales/en.json
{
  "language_trait_hello_clipped": "Clipped",
  "language_trait_hello_clipped_info": "Every sentence ends two words early. Nobody minds."
}
```

## Handing it out

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

A `Language` also exposes `cities`, `kingdoms` and `books`, which is what you read when your own code needs to know where a language has got to.

> [!TIP] Books are an underused delivery system
> A book written in your language is a slow, world-shaped way to hand out a trait or a status. It spreads through libraries, it takes generations, and the player sees it happen. Almost nobody mods this, which is exactly why it is worth doing :PES4_Classy:.
