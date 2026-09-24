---
title: Namensgeneratoren
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbscroll:
order: 186
---

# Namensgeneratoren :wbscroll:

Jeder Name in WorldBox kommt aus einem Generator: Einheiten, Städte, Königreiche (kingdom), Clans, Kriege (war), Bücher (book). Deine Kreaturen können ihren eigenen haben, damit ein Dorf voller Glutgeister voller Ashra und Cindox ist, statt sich menschliche Namen zu borgen.

## Woher ein Name kommt

Drei Schritte, von der Kreatur runter bis zu den Buchstaben:

| Schritt | Asset | Was es enthält |
| --- | --- | --- |
| Die Kreatur | `ActorAsset.name_template_sets` | Eine Liste von **Namenssets**. Pro Kultur (culture) wird eines gewählt |
| Das Namensset | `NameSetAsset` (`name_sets`) | Welcher Generator für welche Art Ding: `unit`, `city`, `kingdom`, `clan`, `family`, `culture`, `language`, `religion` |
| Der Generator | `NameGeneratorAsset` (`name_generator`) | Wie der Name tatsächlich gebaut wird |

Um eine ganze Art umzubenennen, baust du also einen Generator, ein Namensset, das ihn benutzt, und lässt die Kreatur auf das Set zeigen.

## Drei Arten, einen Namen zu bauen

Ein Generator arbeitet in einem von drei Stilen, und das Spiel entscheidet danach, welche Felder du ausgefüllt hast:

- **Teilgruppen.** Eine Liste von Gruppen, aus jeder wird ein zufälliges Stück genommen und alles zusammengeklebt. Der einfachste, und der, den diese Seite benutzt.
- **Wörterbuch.** Ganze Wörter aus benannten Listen, zu einem Satz zusammengesetzt. So bekommen Kriege und Bücher Titel wie "Bloody Hatred". Siehe **[Kriegsarten](#/nml/war-types)** und **[Bücher](#/nml/books)**.
- **Onomastik.** Ein kompaktes Textformat, das die meisten Vanilla-Zivilisationen benutzen und mit dem sich Namen in einer Kultur mit der Zeit verändern. Mächtig, aber ich würde nicht damit anfangen: Kopier eines aus `NameGeneratorLibrary`, wenn du es willst, und ändere die Silben.

## Der Code

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

Dann an deiner Kreatur aus **[Eigene Akteure](#/nml/custom-actors)**:

```csharp
asset.name_template_sets = new string[] { HelloNames.SET };
```

`HelloNames.Initialize()` kommt in `OnModLoad` **vor** die Akteure, weil der Akteur auf das Set zeigt.

> [!WARNING] Füll jeden Platz des Namenssets
> Eine Kultur fragt ihr Set nach einem Generator pro Art Ding. Ein leerer `city`-Platz heißt, dass das Spiel einen Generator namens `""` sucht, `null` bekommt, und die erste Stadt, die deine Kreaturen gründen, das Spiel mit in den Abgrund reißt. Nimm überall denselben Generator, wenn du nichts Besseres hast :PESgn_Stop:.

## Die Vorlagenwörter

Eine Vorlage ist eine kommagetrennte Liste von Wörtern. Für Teilgruppen-Generatoren sind das die nützlichen:

| Wort | Was es hinzufügt |
| --- | --- |
| `part_group` / `Part_group` | Ein Stück aus jeder `addPartGroup`-Gruppe. Das große P macht den ersten Buchstaben groß |
| `part_group2`, `part_group3` | Dasselbe für `addPartGroup2` und `addPartGroup3`, für ein zweites oder drittes Wort |
| `space` | Ein Leerzeichen, also macht `Part_group,space,Part_group2` einen Vor- und Nachnamen |
| `vowel` / `consonant` | Ein Buchstabe aus deinen `vowels` / `consonants` |
| `number` | Eine Ziffer von 0 bis 9. Für Roboter, schätze ich |

Ruf `addTemplate` mehrmals auf, und das Spiel wählt für jeden Namen zufällig eine Vorlage.

## Testen, ohne auf Babys zu warten

`NameGenerator.getName` ist public, also kannst du beim Laden zehn Namen ins Log schreiben:

```csharp
for (int i = 0; i < 10; i++)
{
    LogInfo(NameGenerator.getName(HelloNames.GENERATOR));
}
```

Wenn die Hälfte aussieht, als wäre eine Katze über die Tastatur gelaufen, sind deine Gruppen zu lang. Kurze Stücke, mehr Gruppen. Namen, die auf der Blacklist des Spiels stehen, werden verworfen und neu gewürfelt, die siehst du also nie :PES5_Noted:.

Für Titel aus ganzen Wörtern (Kriege, Bücher, Mottos) willst du den Wörterbuch-Stil, und die nächsten beiden Seiten bauen beide einen.
