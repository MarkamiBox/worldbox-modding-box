---
title: Sprach-Eigenschaften
group: Spielinhalte
subgroup: Eigenschaften & Genetik
icon: :wbconfused:
order: 112
---

# Sprach-Eigenschaften :wbconfused:

Eine **Sprache** gehört Städten und Königreichen, verändert sich mit ihrer Ausbreitung und bildet das Medium, in dem **Bücher** geschrieben werden. Eine Sprach-Eigenschaft ist ein Wesensmerkmal des geschriebenen und gesprochenen Wortes selbst.

Es ist das kleinste der sieben Eigenschaftssysteme und besitzt den spezifischsten Hook überhaupt: Code, der ausgeführt wird, sobald jemand ein **Buch** in dieser Sprache liest.

| | |
| --- | --- |
| Bibliothek | `AssetManager.language_traits` |
| Klasse | `LanguageTrait` |
| Gruppen | `AssetManager.language_trait_groups`, Klasse `LanguageTraitGroupAsset` |
| Besitzer zur Laufzeit | `Language`, in `World.world.languages` |
| Lokalisierungs-Präfix | `language_trait_` |
| Standard-Icon-Ordner | `ui/Icons/language_traits/` |

## Eine registrieren

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
                value = 2f,                    // Was diese Eigenschaft "wert" ist. Siehe unten
                rarity = Rarity.R1_Rare
            };

            AssetManager.language_traits.add(trait);

            trait.addOpposite("scribble");
            trait.base_stats["intelligence"] = 2;
        }
    }
}
```

Sprach-`base_stats` erreichen Einheiten **tatsächlich**: `Actor.updateStats()` verschmilzt `language.base_stats` in jeden, der sie spricht. Die genaue Reihenfolge findest du in der **[Stats-Referenz](#/nml/stats)**.

## Der Buch-Hook

`read_book_trait_action` ist das exklusive Feld der Sprach-Eigenschaften. Es feuert, wenn eine Einheit die Lektüre eines in dieser Sprache geschriebenen Buches abschließt:

```csharp
public delegate void BookTraitAction(Actor pActor, LanguageTrait pTrait, Book pBook);
```

```csharp
trait.value = 0.2f;   // Vanilla verwendet `value` als Wahrscheinlichkeit für diesen Hook

trait.read_book_trait_action = delegate(Actor pActor, LanguageTrait pTrait, Book pBook)
{
    if (pActor == null || !pActor.isAlive()) return;
    if (pActor.hasTrait("evil")) return;
    if (!Randy.randomChance(pTrait.value)) return;

    pActor.addTrait("hello_swift");
};
```

Exakt so funktionieren die verfluchten und gesegneten Schriften von Vanilla: `words_of_madness` würfelt gegen `value` und verteilt die `madness`-Eigenschaft, `cursed_font` vergibt einen Statuseffekt, `font_of_gods` einen noch besseren.

Zwei Dinge, die du von Vanilla übernehmen solltest:

- **Lies die Chance aus `pTrait.value` aus, statt eine Konstante fest einzutragen.** Die Eigenschaft wird dir extra übergeben, damit derselbe Delegat mehrere Eigenschaften mit unterschiedlicher Wirkungsstärke bedienen kann.
- **Brich frühzeitig bei Einheiten ab, die immun sein sollen.** Jede Vanilla-Implementierung prüft zuerst auf `evil` oder `blessed`.

## Deine eigene Art von Buch

Das Spiel definiert Buchformate in `AssetManager.book_types`:

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

## Das Feld `value`

`value` existiert auf jeder Eigenschaftsklasse, wird bei Sprachen jedoch am intensivsten genutzt. Vanilla verwendet es auf zwei verschiedene Arten:

| Verwendung | Beispiel |
| --- | --- |
| Sprachqualität | `melodic` und `stylish_writing` setzen `value = 3f` |
| Wahrscheinlichkeit für den Buch-Hook | `words_of_madness` setzt `value = 0.1f` |

Nichts erzwingt eine bestimmte Auslegung; wähle eine Bedeutung pro Eigenschaft und bleibe konsequent dabei.

## Gegensätze

Sprach-Eigenschaften bilden häufiger Paare als jedes andere System, denn eine Sprache besitzt entweder strukturierte Grammatik oder eben nicht:

```csharp
trait.addOpposite("scribble");
```

Deklariere es beidseitig, so wie Vanilla `scribble` und `nicely_structured_grammar` als gegenseitige Gegensätze definiert.

## Die Vanilla-Gruppen

`knowledge` · `spirit` · `harmony` · `chaos` · `miscellaneous` · `fate` · `special`

Dein eigener Tab: siehe **[Eigenschafts-Gruppen & Tabs](#/nml/trait-groups)** mit `AssetManager.language_trait_groups` und `LanguageTraitGroupAsset`.

## Die Texte

```json Mods/HelloBox/Locales/en.json
{
  "language_trait_hello_clipped": "Clipped",
  "language_trait_hello_clipped_info": "Every sentence ends two words early. Nobody minds."
}
```

## Die Eigenschaft verteilen

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

Ein `Language`-Objekt legt außerdem `cities`, `kingdoms` und `books` offen – genau das, was eigener Code abfragt, um die Verbreitung einer Sprache zu verfolgen.

> [!TIP] Bücher sind ein unterschätztes Zustellsystem
> Ein Buch in deiner Sprache ist ein entschleunigter, organischer Weg, um Eigenschaften oder Statuseffekte zu verteilen. Es wandert durch Bibliotheken, braucht Generationen und der Spieler beobachtet den Vorgang. Kaum jemand moddet das – genau deshalb lohnt es sich umso mehr :PES4_Classy:.
