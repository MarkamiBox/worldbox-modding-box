---
title: Eigene Merkmale
group: Spielinhalte
subgroup: Eigenschaften & Genetik
icon: :wbstrongminded:
order: 100
---

# Eigene Merkmale :wbstrongminded:

Ein Merkmal (Trait) ist eine dauerhafte Eigenschaft einer Einheit: *mutig*, *schnell*, *unsterblich*. Es erscheint im Inspektor, kann die Werte (stats) der Einheit verändern, Code ausführen wenn die Einheit angreift, Schaden nimmt oder stirbt, und Kinder können es erben.

Es ist außerdem das am leichtesten hinzuzufügende Ding im ganzen Spiel, weshalb es jedermanns erste Mod ist. Meine nicht: Meine erste Mod war ein Wrapper um die Mod von jemand anderem, was auf seine eigene Art geschummelt ist :trollface:.

## IDs immer mit Präfix versehen

Jedes Asset in WorldBox lebt in einer einzigen flachen Liste mit der `id` als Schlüssel. Wenn du `fast` registrierst und eine andere Mod ebenfalls `fast` registriert, **überschreibt** die zweite Mod die erste und das Log erhält eine Zeile darüber, die niemand liest.

Also: `hello_swift`, nicht `swift`. Kurzer Modname, Unterstrich, dein Name für die Sache. Mache das für Merkmale, Gegenstände (item), Gebäude (building), Kräfte, Statusse, einfach alles :aPES4_Noted:.

## Das Trait

```csharp Mods/HelloBox/Code/HelloTraits.cs
namespace HelloBox
{
    public static class HelloTraits
    {
        // Die ID einmalig aufgeschrieben. Jede andere Datei bezieht sich auf HelloTraits.SWIFT,
        // so wird ein Tippfehler zum Kompilierfehler statt zu einem Merkmal, das still nichts tut.
        public const string SWIFT = "hello_swift";

        public static void Initialize()
        {
            // Registriere dieselbe ID niemals doppelt. Die Bibliothek loggt einen Fehler und überschreibt.
            if (AssetManager.traits.has(SWIFT)) return;

            ActorTrait swift = new ActorTrait
            {
                id = SWIFT,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                path_icon = "ui/Icons/iconSpeed",   // ein Vanilla-Icon, tausche es später gegen dein eigenes
                group_id = "physique",              // in welchem Reiter des Merkmalsbuchs es liegt
                rate_birth = 0,                     // 0 = taucht niemals von selbst auf
                can_be_given = true,                // der Spieler kann es im Editor vergeben
                can_be_removed = true,
                can_be_cured = false
            };

            // add() registriert das Merkmal UND alloziert seinen Werteblock. Beides, in dieser Reihenfolge.
            AssetManager.traits.add(swift);

            swift.base_stats["speed"] = 20f;
            swift.base_stats["attack_speed"] = 10f;
            swift.base_stats["damage"] = 5;
        }
    }
}
```

Und eine Zeile in `Main.cs`:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");
    HelloTraits.Initialize();
}
```

### Was jeder Teil bewirkt

- **`AssetManager.traits`**: Die Bibliothek (library), die jedes Einheiten-Merkmal im Spiel enthält, Vanilla wie Modded. `has`, `get`, `add` und `clone` sind die vier Methoden, die du in jeder Bibliothek auf jeder Seite nach dieser hier nutzen wirst.
- **`path_icon`**: Das kleine Bildchen im Inspektor. Ein *Pfad*, keine Datei. Siehe **[Sprites & Ressourcen](#/nml/sprites-and-resources)**. Das Spiel füllt dies nur automatisch aus, während seine eigenen Bibliotheken gebaut werden (was vor jedem Mod-Laden geschieht), daher bleibt es für dein Merkmal leer, wenn du es nicht setzt.
- **`needs_to_be_explored`**: standardmäßig `true`, das Merkmal bleibt also im Wissensbuch gesperrt, bis der Spieler es in einer Welt findet. `false` macht es ab der ersten Sekunde verfügbar. HelloBox setzt es überall, damit du siehst, was du gebaut hast, ohne danach zu suchen.
- **`group_id`**: Unter welchem Reiter des Merkmalsbuchs es auftaucht. Die vollständige Liste steht unten.
- **`rate_birth`**: Die Chance, dass ein Neugeborenes es auf natürliche Weise erhält. `0` bedeutet "nur wenn etwas es gezielt verleiht".
- **`can_be_given` / `can_be_removed`**: Ob der Spieler es im Merkmals-Editor hinzufügen oder entfernen kann. Beide stehen standardmäßig auf `true`; setze eines auf `false` für Merkmale, die dauerhaft sein oder nur von deinem Code vergeben werden sollen.
- **`base_stats[...]`**: Die Werteboni. Die vollständige Liste der Wertenamen findest du auf der Seite **[Werte-Referenz](#/nml/stats)**.

> [!WARNING] Werte gehören **nach** `add()`, immer
> Ein frisch erstelltes `ActorTrait` besitzt noch keinen Werteblock. Die Bibliothek alloziert ihn innerhalb von `add()`. Berührst du `base_stats` vor dieser Zeile, erhältst du den häufigsten Absturz im WorldBox-Modding:
> `NullReferenceException: Object reference not set to an instance of an object`
>
> Dieselbe Regel gilt für Statusse, Items, Gebäude und Kreaturen. Die Ausnahme ist `clone()`, welches `add()` bereits für dich aufruft, sodass die Werte nach einem Klon bereits da sind.

> [!TIP] Denselben Schalter gibt es bei fast allem, was du baust
> `needs_to_be_explored` sitzt in der Basisklasse, die alle freischaltbaren Assets teilen, also funktioniert er bei Actors, allen sieben Merkmalsarten, Items, Item-Modifiern und Weltgesetzen (world law). Gottkräfte, Status, Gebäude, Drops, Wolken (cloud), Tiles und Projektile (projectile) haben gar keinen Entdeckungsschritt :wbsmirk:.

### Die Vanilla-Trait-Gruppen

`group_id` muss eine existierende Gruppe sein, sonst landet dein Merkmal im Nirgendwo:

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

Willst du stattdessen deinen eigenen Reiter? Siehe **[Merkmalsgruppen & Reiter](#/nml/trait-groups)**.

## Die Texte (Lokalisierung)

Ohne Übersetzungen erscheint dein Merkmal im Spiel als roher Schlüssel `trait_hello_swift`, und das sieht genau so professionell aus, wie es klingt :pepeclown:. Erstelle `Locales/de.json`:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money."
}
```

Der Schlüssel ist **nicht** die bloße ID. Jede Merkmalsart stellt ihren eigenen Typnamen als Präfix voran:

| Merkmalsart | Namens-Schlüssel | Tooltip-Schlüssel |
| --- | --- | --- |
| Actor trait | `trait_<id>` | `trait_<id>_info` |
| Culture trait | `culture_trait_<id>` | `culture_trait_<id>_info` |
| Religion trait | `religion_trait_<id>` | `religion_trait_<id>_info` |
| Subspecies trait | `subspecies_trait_<id>` | `subspecies_trait_<id>_info` |
| Clan trait | `clan_trait_<id>` | `clan_trait_<id>_info` |
| Language trait | `language_trait_<id>` | `language_trait_<id>_info` |
| Kingdom trait | `kingdom_trait_<id>` | `kingdom_trait_<id>_info` |

Es gibt auch eine zweite Beschreibungszeile, `<prefix>_<id>_info_2`, genutzt von Merkmalen, die eine benötigen.

## Dein eigenes Icon

`path_icon` ist ein Pfad, und die Datei gehört an genau diesen Pfad innerhalb des `GameResources/`-Ordners deiner Mod. Keine Dateiendung im String.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSwift.png
```

```csharp
swift.path_icon = "ui/Icons/iconHelloSwift";
```

Merkmals-Icons sind klein, das Spiel zeichnet sie bei etwa 32x32. Lege deine PNG in einen eigenen Ordner, wenn du möchtest - `ui/Icons/hellobox/iconSwift` funktioniert genauso gut, es muss nur zum String passen.

Die anderen sechs Merkmalssysteme haben jeweils ihren eigenen Vanilla-Ordner (`ui/Icons/culture_traits/`, `religion_traits/`, `clan_traits/` usw.). Du bist nicht verpflichtet, sie zu nutzen, aber direkt neben den kopierten Merkmalen zu liegen macht deine eigenen Grafiken später leichter auffindbar. Komplette Tabelle unter **[Sprites & Ressourcen](#/nml/sprites-and-resources)**.

## Ein Trait dazu bringen, etwas zu *tun*

Werte sind statisch. Ein Merkmal kann deinen Code aber auch an vier Schlüsselmomenten ausführen:

```csharp
// alle paar Sekunden, solange die Einheit lebt
swift.special_effect_interval = 3f;
swift.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreStamina(5);
    return true;
};

// wenn die Einheit stirbt
swift.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };

// wenn die Einheit Schaden nimmt
swift.action_get_hit = (BaseSimObject pSelf, BaseSimObject pAttacker, WorldTile pTile) => { return true; };

// every time one of the unit's attacks lands, right after the damage
swift.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor self = pSelf as Actor;
    // pTarget can be a building, and the hit may just have killed it
    if (self == null || !self.isAlive() || pTarget == null) return false;

    self.restoreHealth(2);
    return true;
};
```

Zwei Regeln für alle vier: **zuerst auf null prüfen und prüfen, ob die Einheit lebt**, und gib `false` zurück, wenn du nichts getan hast. Diese Aktionen laufen für jede Einheit mit diesem Merkmal, für immer.

> [!NOTE] `action_birth` und `action_growth` existieren und feuern hier nie
> `ActorTrait` erbt beide Felder, sie kompilieren also. Das Spiel liest sie nur von **Subspezies**-Merkmalen: Es fasst die Merkmale einer Subspezies zu einem Geburts- und einem Wachstums-Callback zusammen und ruft nur diese auf. An einem Actor-Merkmal liegen sie einfach da und tun nichts, lautlos :wbreally:. Willst du "wenn eine Einheit geboren wird", mach es zu einem Subspezies-Merkmal: **[Subspezies-Merkmale](#/nml/subspecies-traits)**.

### Wenn das Merkmal erhalten, verloren oder geladen wird

Drei weitere Hooks laufen einmal statt ständig. Sie nutzen einen anderen Delegaten, `WorldActionTrait`, der dir den Besitzer als `NanoObject` und das Merkmal selbst übergibt:

```csharp
// once, the moment addTrait() puts it on a unit
swift.action_on_augmentation_add = (NanoObject pTarget, BaseAugmentationAsset pTrait) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreHealth(actor.getMaxHealth());   // a welcome gift, once
    return true;
};
```

| Feld | Wann es läuft |
| --- | --- |
| `action_on_augmentation_add` | `addTrait()` war erfolgreich |
| `action_on_augmentation_remove` | `removeTrait()` hat es entfernt, auch wenn ein anderes Merkmal es als Gegensatz verdrängt hat oder über `traits_to_remove` |
| `action_on_augmentation_load` | Eine gespeicherte Welt wurde geladen und die Einheit kam mit dem Merkmal zurück |

Eine geladene Einheit bekommt ihre Merkmale zurück, **ohne** dass `addTrait()` durchlaufen wird, `_add` läuft also nicht erneut. Richtet `_add` etwas ein, das der Spielstand nicht hält, mach es in `_load` erneut.

## Gegensätze und Ausschlüsse

Der Vanilla-Weg ist `addOpposite("slow")` und `traits_to_remove_ids`. Beide schreiben nur **IDs**, und das Spiel wandelt diese IDs einmal beim Laden in die Sets um, die es tatsächlich liest, bevor deine Mod existiert. An deinem Merkmal tun sie nichts :wbfacepalm:. Fülle die aufgelösten Felder selbst, nach `add()`:

```csharp
ActorTrait slow = AssetManager.traits.get("slow");
if (slow != null)
{
    // addTrait() only checks the NEW trait's own set, so fill both sides:
    // otherwise a slow unit refuses swift, but a swift unit happily turns slow
    swift.opposite_traits = new HashSet<ActorTrait> { slow };
    if (slow.opposite_traits == null) slow.opposite_traits = new HashSet<ActorTrait>();
    slow.opposite_traits.Add(swift);
}

// gaining swift strips these; the game reads the array, not the ids
ActorTrait fat = AssetManager.traits.get("fat");
if (fat != null) swift.traits_to_remove = new ActorTrait[] { fat };
```

`HashSet` braucht `using System.Collections.Generic;` am Dateianfang.

> [!WARNING] `opposite_trait_mod` braucht `opposite_traits`
> `opposite_trait_mod` ändert, wie sehr sich zwei Einheiten mögen, wenn eine den Gegensatz des Merkmals der anderen hat. Der Sozialcode iteriert ohne Null-Prüfung über `opposite_traits`, den Mod zu setzen und das Set `null` zu lassen wirft also eine `NullReferenceException`, sobald sich zwei Einheiten das erste Mal einschätzen. Gib dem Set einen Wert, und sei es ein leeres.

## Seltenheit (Rarity)

`rarity` entscheidet über die Farbe des Namens und die Seltenheitszeile im Merkmals-Tooltip, und `Rarity.R3_Legendary` bekommt zusätzlich den besonderen legendären Rahmen. Die Werte sind `R0_Normal`, `R1_Rare`, `R2_Epic` und `R3_Legendary`.

Bei Vanilla-Merkmalen läuft das größtenteils automatisch: Während das Spiel lädt, zählt die Bibliothek, was jedes Merkmal tut (Aktionen, Entscheidungen, Zaubersprüche, Kampfaktionen, Tags), und hebt alles, was etwas tut, auf `R1_Rare` oder `R2_Epic` an. Dein Merkmal kommt nach diesem Durchgang an, es behält also, was du geschrieben hast, und hast du nichts geschrieben, ist das der Standard, `R1_Rare`, egal wie viel es tut. Setz es selbst:

```csharp
swift.rarity = Rarity.R2_Epic;
```

## Es aus Code freischalten

Mit `needs_to_be_explored = true` startet das Merkmal gesperrt im Wissensbuch. `unlock()` ist, wie das Spiel es entdeckt:

```csharp
AssetManager.traits.get(HelloTraits.SWIFT)?.unlock();
```

Es fügt die ID zum Fortschritt des Spielers hinzu, zeigt den "neues Wissen"-Hinweis und speichert die Fortschrittsdatei. `unlock(false)` überspringt das Speichern: nutze es, wenn du mehrere Dinge nacheinander freischaltest, und ruf am Ende einmal `GameProgress.saveData()` auf. Es gibt `false` zurück und tut nichts, wenn das Merkmal bereits verfügbar ist, und ein Merkmal mit `needs_to_be_explored = false` ist das immer. Ruf es aus dem Gameplay heraus auf, wenn der Spieler es sich verdient hat: Es ist seine echte Fortschrittsdatei, und es bleibt danach in jeder Welt freigeschaltet.

`unlocked_with_achievement` ist standardmäßig bereits `false`. `unlocked_with_achievement = false` zu schreiben ändert nichts.

## Das Trait einer Einheit verleihen

```csharp
actor.addTrait(HelloTraits.SWIFT);

if (actor.hasTrait(HelloTraits.SWIFT))
{
    // ...
}
```

> [!WARNING] `spawn_random_trait_allowed` wird nur einmal gelesen, beim Start
> Neue Einheiten würfeln ihre Startmerkmale aus einem Topf, den `BaseTraitLibrary.linkAssets()` beim Laden des Spiels baut, bevor deine Mod existiert. Den Schalter an deinem Merkmal zu setzen ändert allein nichts: Dein Merkmal ist nie in diesem Topf und taucht nie zufällig auf. Leg es selbst hinein, gewichtet wie in Vanilla:
>
> ```csharp
> swift.spawn_random_trait_allowed = true;
> AssetManager.traits._pot_allowed_to_be_given_randomly.AddTimes(swift.spawn_random_rate, swift);
> ```
>
> `_pot_allowed_to_be_given_randomly` ist `protected`, also kompiliert das gegen die publizierte Assembly, mit der NML deine Mod ohnehin baut. `spawn_random_rate` ist standardmäßig `5`: Erhöhe es, und das Merkmal taucht öfter auf.

## Überprüfen, ob es geklappt hat

Starte das Spiel, öffne eine Einheit, öffne den Merkmals-Editor, schaue in den Reiter `physique`. Nicht da? Das Log weiß warum, und die Antwort ist fast immer eines von drei Dingen: `can_be_given` ist falsch, `group_id` existiert nicht oder `path_icon` zeigt ins Leere :wbreally:.

## Die anderen sechs Trait-Arten

Actor-Merkmale sind nur eines von **sieben** Merkmalssystemen. Jedes hat seine eigene Bibliothek, seine eigenen Gruppen und seinen eigenen Besitzer, und jedes folgt exakt dem Muster auf dieser Seite. Nur der Klassenname, die Bibliothek und das Locale-Präfix ändern sich.

| System | Gehört zu | Seite |
| --- | --- | --- |
| Actor | einer Kreatur | diese Seite |
| Culture | einer Kultur (culture), geteilt von ihren Städten | **[Kulturmerkmale](#/nml/culture-traits)** |
| Religion | einer Religion und ihren Gläubigen | **[Religionsmerkmale](#/nml/religion-traits)** |
| Subspecies | einem Zweig einer Spezies | **[Subspezies-Merkmale](#/nml/subspecies-traits)** |
| Clan | einer Blutlinie | **[Clanmerkmale](#/nml/clan-traits)** |
| Language | einer Sprache und allen, die sie sprechen | **[Sprachmerkmale](#/nml/language-traits)** |
| Kingdom | der Politik eines Königreichs | **[Königreichsmerkmale](#/nml/kingdom-traits)** |

Wähle den Besitzer, bevor du das Merkmal schreibst. "Elfen schießen besser" ist ein Kulturmerkmal, wenn es sich mit ihren Städten verbreiten soll, ein Subspezies-Merkmal, wenn es sich durch Fortpflanzung vererben soll, und ein Actor-Merkmal, wenn es zu einer einzelnen Kreatur gehört. Das falsch zu wählen ist der Unterschied zwischen einer Mod, die sich über eine Stunde in einer Welt ausbreitet, und einer, die rein gar nichts tut :PES_ThinkAboutIt:.
