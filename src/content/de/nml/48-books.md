---
title: Bücher
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbscroll:
order: 187
---

# Bücher :wbscroll:

Einheiten schreiben Bücher (book), Städte bewahren sie auf, und andere Einheiten lesen sie und kommen ein bisschen anders wieder heraus. Eine Buchart ist eine neue Sorte Buch in diesem Kreislauf: wer es schreibt, wie es heißt, wie der Einband aussieht und was das Lesen mit dir macht.

Die Seite **[Sprach-Eigenschaften](#/nml/language-traits)** baut schon ein kleines, den Glut-Almanach. Diese Seite nimmt dasselbe Buch und macht es fertig: eigene Titel, eine echte Belohnung und etwas, das beim Lesen passiert.

## Wie ein Buch entsteht

Hier braucht nichts einen Patch, du musst nur den Kreislauf kennen:

1. Eine Einheit beschließt zu schreiben. Das Spiel sammelt jede Buchart, deren `requirement_check` für diese Einheit besteht.
2. Jede kommt `writing_rate`-mal in einen Beutel (oder `rate_calc`-mal, wenn du das setzt), **höchstens 10**, und eine wird gezogen.
3. Das Buch braucht ein Gebäude (building) mit freiem Buchplatz in der **Stadt** des Schreibers. Keine Bibliothek (library), kein Buch.
4. Der Titel kommt aus dem Namensgenerator in `name_template`, der Einband aus dem Ordner in `path_icons`.
5. Später liest es jemand und bekommt die Belohnungen unten.

Weil das Spiel `book_types.list` jedes Mal frisch liest, braucht eine Buchart nur `add()`. Keine Pools, kein Post-Init. Eine seltene nette Überraschung :PESgn_Neat:.

## Der Code

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

Diese Datei **ersetzt** die `HelloBooks.cs` von der Seite Sprach-Eigenschaften, es ist dieselbe Klasse in erwachsen. `HelloBooks.Initialize()` kommt nach das Merkmal (trait) und den Status, die sie benutzt.

## Was Lesen bringt

Die Zahlen in `base_stats` sind kein Buff, der nachlässt. Jedes Lesen verteilt sie einmal:

| Wert | Was der Leser bekommt |
| --- | --- |
| `happiness` | So viel Glück, als Ereignis "hat gerade ein Buch gelesen". Negativ geht auch, für deprimierende Bücher |
| `experience` | So viel Erfahrung |
| `mana` | So viel Mana |
| `diplomacy`, `warfare`, `stewardship`, `intelligence` | Werden dem Leser **dauerhaft** hinzugefügt. Bei jedem Lesen wieder |

Die letzte Zeile ist die mächtige. Ein Buch mit `intelligence = 1` macht eine belesene Stadt mit jeder Generation schlauer, also halte es klein. Ein +10-Buch ist der Weg zu einem Königreich (kingdom) voller Genies bis Jahr 50 :wbgenius:.

Sprach- und Kultur-Merkmale können die ersten beiden ändern: Eine Sprache mit `beautiful_calligraphy` macht das Glück größer, und eine Kultur (culture) mit `reading_lovers` macht traurige Bücher fröhlich.

## Die wichtigen Felder

| Feld | Was es macht |
| --- | --- |
| `name_template` | Der Namensgenerator für Titel. Vanilla-Beispiele: `book_name_fable`, `book_name_love_story`, `book_name_history`... |
| `writing_rate` | Das Gewicht, wenn ein Schreiber eine Art wählt. Vanilla nimmt 1 bis 3 |
| `rate_calc` | Eine Methode, die stattdessen das Gewicht zurückgibt, wie Vanillas Kriegshandbuch mit dem `warfare` des Schreibers. Trotzdem höchstens 10 |
| `requirement_check` | Wer es schreiben darf. `null` = jeder |
| `read_action` | Dein eigener Code, einmal pro Lesen |
| `path_icons` | Ein Ordner unter `books/book_icons/`, gelesen als Bilderliste. Pro Buch wird eins gewählt |
| `color_text` | Die Farbe des Titels in der Oberfläche |
| `save_culture` / `save_religion` | Ob sich das Buch Kultur und Religion des Schreibers merkt. Beides standardmäßig an, und wichtig für Bücher, die einen Glauben verbreiten |

## Der Titelgenerator

Titel benutzen den Wörterbuch-Stil aus **[Namensgeneratoren](#/nml/name-generators)**. Eine Vorlage ist eine Liste von Wörterbuch-Schlüsseln, und jeder Schlüssel nimmt ein Wort aus seiner Liste:

- `addDictPart("almanac", "Almanac,Handbook,Notes")` macht einen Schlüssel mit drei möglichen Wörtern.
- `addTemplate("almanac,of,fire")` klebt ein Wort aus jedem Schlüssel zusammen: "Handbook of Ash".
- Wörter wie `$unit$` und `$city$` sind Platzhalter. Ein **Replacer** füllt sie mit dem echten Namen oder der Stadt des Schreibers. Ohne den passenden Replacer steht `$unit$` wörtlich auf dem Einband :wbfacepalm:.

`$base_book_template$` zu klonen ist die Abkürzung: Es hat schon die kleinen Wörter (`of`, `and`, `about`, `the`...), jeden Platzhalter und die eigene Titelaufbereitung des Spiels.

## Der Text

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

Die Schlüssel sind fest: `book_type_<id>` und `book_type_info_<id>`. Die Titel selbst werden generiert, also haben sie keine Schlüssel.

## Deine eigenen Einbände

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── books/
        └── book_icons/
            └── hello_almanac/     <- one PNG per cover, any names
```

`path_icons` ist ein **Ordner**, mit dem `/` am Ende. Ein PNG reicht, es muss nur darin liegen. Solange du noch testest, borg dir einen Vanilla-Ordner wie `fable/`.

Um es in Aktion zu sehen, erstell eine Welt, lass eine Stadt mit deinem Merkmal wachsen, bis sie eine Bibliothek baut, und öffne die Bücher der Stadt. Das dauert, es ist ein Buch :PES2_Shrug:.
