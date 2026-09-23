---
title: Eigenschaftsgruppen & Tabs
group: Spielinhalte
subgroup: Eigenschaften & Genetik
icon: :wbfamilies:
order: 102
---

# Eigenschaftsgruppen & Tabs :wbfamilies:

Jede Eigenschaft gehört zu einer **Gruppe**, und diese Gruppe zeichnet einen Tab im Eigenschaften-Buch. Wenn du sechs Eigenschaften hinzufügst und alle in `miscellaneous` wirfst, verschwinden sie in einer Liste, die niemand durchscrollt.

Ein eigener Tab kostet dich vier Zeilen.

## Was eine Gruppe ist

Eine Gruppe ist ein `BaseCategoryAsset` - das kleinste Asset im gesamten Spiel:

| Feld | Was es tut |
| --- | --- |
| `id` | Worauf das `group_id` einer Eigenschaft zeigt |
| `name` | Der **Lokalisierungsschlüssel** für das Tab-Label. Nicht die Beschriftung selbst |
| `color` | Hex-Farbcode. Färbt den Tab und die Eigenschaften darunter ein |
| `show_counter` | Ob der Tab "3 / 12" anzeigt. Standardmäßig `true` |

## Dein eigener Tab

```csharp Mods/HelloBox/Code/HelloGroups.cs
namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";

        public static void Initialize()
        {
            if (AssetManager.trait_groups.has(TRAITS)) return;

            AssetManager.trait_groups.add(new ActorTraitGroupAsset
            {
                id = TRAITS,
                name = "trait_group_" + TRAITS,   // der Lokalisierungsschlüssel, nicht der Text
                color = "#7FE7C4"
            });
        }
    }
}
```

Lass deine Eigenschaften darauf zeigen:

```csharp
ActorTrait swift = new ActorTrait
{
    id = HelloTraits.SWIFT,
    group_id = HelloGroups.TRAITS,
    path_icon = "ui/Icons/iconSpeed"
};
AssetManager.traits.add(swift);
```

Und benenne den Tab:

```json Mods/HelloBox/Locales/en.json
{
  "trait_group_hello_traits": "HelloBox"
}
```

> [!WARNING] Gruppen vor den darin enthaltenen Eigenschaften
> Eine Eigenschaft, deren `group_id` auf eine Gruppe zeigt, die noch nicht existiert, hat keinen Ort zum Rendern. In `OnModLoad` gehört `HelloGroups.Initialize()` über `HelloTraits.Initialize()`.

## Die Vanilla-Gruppen für Akteurseigenschaften

Verwende eine davon, wenn du keinen eigenen Tab brauchst:

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

## Wo dein Tab erscheint

Gruppen werden in Reihenfolge der `list` gezeichnet, und `add()` setzt deine ganz ans Ende. Um sie neben eine verwandte Gruppe zu platzieren, verschiebe sie im Nachhinein:

```csharp
ActorTraitGroupAsset group = AssetManager.trait_groups.get(HelloGroups.TRAITS);
int index = AssetManager.trait_groups.list.FindIndex(g => g.id == "physique");

if (group != null && index != -1)
{
    AssetManager.trait_groups.list.Remove(group);
    AssetManager.trait_groups.list.Insert(index + 1, group);
}
```

`list` ist in jeder Bibliothek eine gewöhnliche `List<T>`, daher funktioniert dieser Trick für jede von ihnen. Siehe **[Asset-Bibliotheken](#/nml/asset-libraries)**.

## Eine Vanilla-Gruppe umbenennen oder umfärben

Du musst keine Gruppe neu hinzufügen, um eine zu ändern. `get()` übergibt dir direkt das Live-Objekt:

```csharp
ActorTraitGroupAsset fun = AssetManager.trait_groups.get("fun");
if (fun != null)
{
    fun.name = "trait_group_hello_fun";   // dein eigener Lokalisierungsschlüssel
    fun.color = "#FFB35E";
}
```

Das direkte Bearbeiten einer Vanilla-Gruppe sorgt dafür, dass jede darauf verweisende Vanilla-Eigenschaft weiter funktioniert und alte Spielstände geladen werden. Sie zu ersetzen tut keines von beidem :PES_NoSign:.

## Die anderen sechs Gruppen-Bibliotheken

Akteurseigenschaften sind nur eines von sieben Eigenschaftssystemen, und jedes besitzt seine eigene Gruppenbibliothek mit seiner eigenen Gruppenklasse. Der Code auf dieser Seite ist für alle identisch, nur die zwei Namen ändern sich:

| Eigenschaftssystem | Gruppen-Bibliothek | Gruppen-Klasse | Seite |
| --- | --- | --- | --- |
| Akteur | `AssetManager.trait_groups` | `ActorTraitGroupAsset` | diese Seite |
| Kultur | `AssetManager.culture_trait_groups` | `CultureTraitGroupAsset` | **[Kultureigenschaften](#/nml/culture-traits)** |
| Religion | `AssetManager.religion_trait_groups` | `ReligionTraitGroupAsset` | **[Religionseigenschaften](#/nml/religion-traits)** |
| Unterart | `AssetManager.subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | **[Unterarteigenschaften](#/nml/subspecies-traits)** |
| Clan | `AssetManager.clan_trait_groups` | `ClanTraitGroupAsset` | **[Claneigenschaften](#/nml/clan-traits)** |
| Sprache | `AssetManager.language_trait_groups` | `LanguageTraitGroupAsset` | **[Spracheigenschaften](#/nml/language-traits)** |
| Königreich | `AssetManager.kingdoms_traits_groups` | `KingdomTraitGroupAsset` | **[Königreicheigenschaften](#/nml/kingdom-traits)** |

Ausrüstung besitzt dasselbe Konzept unter einem anderen Namen. Siehe **[Gegenstandsgruppen & Tabs](#/nml/item-groups)**.

> [!TIP] Ein Tab, nicht sechs
> Die Versuchung bei einer großen Mod ist eine Gruppe pro Feature. Widerstehe ihr. Das Eigenschaften-Buch ist bereits vollgestopft: Ein Spieler findet einen Tab mit dem Namen deiner Mod, aber ganz sicher keine sechs Tabs, die nach deinen internen Systemen benannt sind.
