---
title: Books
group: Game Content
subgroup: World & Civilizations
icon: :wbscroll:
order: 187
---

# Books :wbscroll:

Units write books, cities keep them, and other units read them and come out a little different. A book type is a new kind of book in that loop: who writes it, what it is called, what the cover looks like, and what reading it does to you.

The **[Language traits](#/nml/language-traits)** page already makes a small one, the Ember Almanac. This page takes the same book and finishes it: its own titles, a real reward, and something that happens when it is read.

## How a book is born

Nothing here needs a patch, you just have to know the loop:

1. A unit decides to write. The game collects every book type whose `requirement_check` passes for that unit.
2. Each one goes into a bag `writing_rate` times (or `rate_calc` times, if you set it), **capped at 10**, and one is drawn.
3. The book needs a building with a free book slot in the writer's **city**. No library, no book.
4. The title comes from the name generator in `name_template`, and the cover from the folder in `path_icons`.
5. Later, someone reads it and gets the rewards below.

Because the game reads `book_types.list` fresh every time, `add()` is all a book type needs. No pools, no post-init. A rare nice surprise :PESgn_Neat:.

## The code

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

This file **replaces** the `HelloBooks.cs` from the Language traits page, it is the same class grown up. `HelloBooks.Initialize()` goes after the trait and the status it uses.

## What reading gives

The numbers in `base_stats` are not a buff that wears off. Each read hands them out once:

| Stat | What the reader gets |
| --- | --- |
| `happiness` | That much happiness, as a "just read a book" event. Negative works too, for depressing books |
| `experience` | That much experience |
| `mana` | That much mana |
| `diplomacy`, `warfare`, `stewardship`, `intelligence` | Added to the reader **permanently**. Every read, again |

That last row is the powerful one. A book that gives `intelligence = 1` makes a well-read city smarter every generation, so keep it small. A +10 book is how you get a kingdom of geniuses by year 50 :wbgenius:.

Language and culture traits can change the first two: a language with `beautiful_calligraphy` makes happiness bigger, and a culture with `reading_lovers` turns sad books happy.

## The fields that matter

| Field | What it does |
| --- | --- |
| `name_template` | The name generator for titles. Vanilla ones: `book_name_fable`, `book_name_love_story`, `book_name_history`... |
| `writing_rate` | Its weight when a writer picks a type. Vanilla uses 1 to 3 |
| `rate_calc` | A method that returns the weight instead, like vanilla's warfare manual using the writer's `warfare`. Still capped at 10 |
| `requirement_check` | Who is allowed to write it. `null` = anybody |
| `read_action` | Your own code, once per read |
| `path_icons` | A folder under `books/book_icons/`, read as a list of pictures. One is picked per book |
| `color_text` | The colour of the title in the UI |
| `save_culture` / `save_religion` | Whether the book remembers the writer's culture and religion. Both on by default, and they matter for books that spread a faith |

## The title generator

Titles use the dictionary style of **[Name generators](#/nml/name-generators)**. A template is a list of dictionary keys, and each key picks one word from its list:

- `addDictPart("almanac", "Almanac,Handbook,Notes")` makes a key with three possible words.
- `addTemplate("almanac,of,fire")` glues one word from each key: "Handbook of Ash".
- Words like `$unit$` and `$city$` are slots. A **replacer** fills them with the real writer's name or city. Without the matching replacer they come out as `$unit$`, literally, on the cover :wbfacepalm:.

Cloning `$base_book_template$` is the shortcut: it already has the small words (`of`, `and`, `about`, `the`...), every slot, and the game's own title clean-up.

## The text

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

The keys are fixed: `book_type_<id>` and `book_type_info_<id>`. The titles themselves are generated, so they have no keys.

## Your own covers

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── books/
        └── book_icons/
            └── hello_almanac/     <- one PNG per cover, any names
```

`path_icons` is a **folder**, with the trailing `/`. One PNG is fine, it just has to be inside. While you are still testing, borrow a vanilla folder like `fable/`.

To see it working, make a world, let a city with your trait grow until it builds a library, and open the city's books. It takes a while, it is a book :PES2_Shrug:.
