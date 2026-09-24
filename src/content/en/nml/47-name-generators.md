---
title: Name generators
group: Game Content
subgroup: World & Civilizations
icon: :wbscroll:
order: 186
---

# Name generators :wbscroll:

Every name in WorldBox comes out of a generator: units, cities, kingdoms, clans, wars, books. Your creatures can have their own, so a village of ember sprites is full of Ashra and Cindox instead of borrowing human names.

## Where a name comes from

Three steps, from the creature down to the letters:

| Step | Asset | What it holds |
| --- | --- | --- |
| The creature | `ActorAsset.name_template_sets` | A list of **name set** ids. One is picked per culture |
| The name set | `NameSetAsset` (`name_sets`) | Which generator to use for each kind of thing: `unit`, `city`, `kingdom`, `clan`, `family`, `culture`, `language`, `religion` |
| The generator | `NameGeneratorAsset` (`name_generator`) | How to actually build the name |

So to rename a whole species you make a generator, a name set that uses it, and point the creature at the set.

## Three ways to build a name

A generator can work in one of three styles, and the game picks based on which fields you filled in:

- **Part groups.** A list of groups, and one random piece from each is glued together. The simplest, and what this page uses.
- **Dictionary.** Whole words picked from named lists and put in a sentence. That is how wars and books get titles like "Bloody Hatred". See **[War types](#/nml/war-types)** and **[Books](#/nml/books)**.
- **Onomastics.** A compact string format most vanilla civilisations use, which also lets names drift over time in a culture. It is powerful and I would not start with it: copy a vanilla one from `NameGeneratorLibrary` if you want it, and change the syllables.

## The code

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

Then, on your creature from **[Custom actors](#/nml/custom-actors)**:

```csharp
asset.name_template_sets = new string[] { HelloNames.SET };
```

`HelloNames.Initialize()` goes **before** the actors in `OnModLoad`, since the actor points at the set.

> [!WARNING] Fill every slot of the name set
> A culture asks its set for a generator per kind of thing. An empty `city` slot means the game looks up a generator called `""`, gets `null`, and the first city your creatures found takes the game down with it. Use the same generator everywhere if you have nothing better :PESgn_Stop:.

## The template words

A template is a comma separated list of words. For part-group generators these are the useful ones:

| Word | What it adds |
| --- | --- |
| `part_group` / `Part_group` | One piece from each `addPartGroup` group. Capital P upper-cases the first letter |
| `part_group2`, `part_group3` | The same for `addPartGroup2` and `addPartGroup3`, for a second or third word |
| `space` | A space, so `Part_group,space,Part_group2` makes a first and a last name |
| `vowel` / `consonant` | One letter from your `vowels` / `consonants` |
| `number` | A digit from 0 to 9. For robots, I guess |

Call `addTemplate` more than once and the game picks one template at random for each name.

## Testing it without waiting for babies

`NameGenerator.getName` is public, so you can print ten names in the log on load:

```csharp
for (int i = 0; i < 10; i++)
{
    LogInfo(NameGenerator.getName(HelloNames.GENERATOR));
}
```

If half of them look like a cat walked on the keyboard, your groups are too long. Short pieces, more groups. Names that match the game's blacklist are thrown away and rolled again, so you will never see one of those :PES5_Noted:.

For titles made of whole words (wars, books, mottos), the dictionary style is the one you want, and the next two pages both build one.
