---
title: Daten im Spielstand speichern
group: NML-Modding
subgroup: Erweitert & Veröffentlichung
icon: :wbfloppysavewink:
order: 44
---

# Daten im Spielstand speichern :wbfloppysavewink:

Früher oder später muss deine Mod sich etwas über eine bestimmte Einheit merken: wie oft sie getroffen wurde, ob sie ihre Belohnung schon erhalten hat oder an welchem Schrein sie betet. Ein statisches Dictionary mit der Einheit als Schlüssel vergisst im Moment des Speicherns und Neuladens einfach alles :wbfacepalm:.

Das Spiel hat dafür bereits einen festen Platz. Jede Einheit, jede Stadt, jedes Königreich (kingdom), jedes Gebäude (building), jeder Gegenstand (item) und jedes Buch (book) speichert seinen Zustand in einem Datenobjekt – und jedes dieser Objekte besitzt einen kleinen **benutzerdefinierten Datenspeicher** (Custom Data), der automatisch mit in die Speicherdatei wandert.

## Der Datenspeicher

| Aufruf | Funktion |
| --- | --- |
| `data.set(key, value)` | Speichert ein `int`, `long`, `float`, `string` oder `bool` unter einem Schlüssel |
| `data.get(key, out value, default)` | Liest den Wert aus. Fehlt der Schlüssel, erhältst du den Standardwert |
| `data.change(key, amount, min, max)` | Addiert einen Wert zu einem `int` und begrenzt ihn (Clamp) in einem einzigen Aufruf |
| `data.addFlag(key)` | Setzt ein Flag. Gibt `false` zurück, falls es bereits gesetzt war |
| `data.hasFlag(key)` / `data.removeFlag(key)` | Prüft oder löscht das Flag |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | Löscht einen bestimmten Wert |

Jeder Datentyp hat seine eigene Tabelle, daher kollidieren ein `int` und ein `string` unter demselben Schlüssel nicht. Aus Gründen deiner eigenen geistigen Gesundheit sollten sie sich dennoch keinen Schlüssel teilen. Dein zukünftiges Ich wird sich nicht mehr erinnern, welcher welcher war.




## Speichern komplexer Objekte mit NML

Wenn sich fünf Grundtypen wie 1995 anfühlen und du tatsächlich eine ganze Klasse oder Liste an einem Akteur speichern musst, bietet NML `DataExtension` in `NeoModLoader.General.Game.extensions`: zwei Erweiterungsmethoden, `Set` und `TryGet`, auf jedem der Datenobjekte oben.

Pack deine Datenklasse in `BasicCustomData<T>`:

```csharp
using System.Collections.Generic;
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}

```

Innerhalb einer Methode mit einem `Actor actor` erstellst du den Wert, bevor du ihn speicherst:

```csharp
if (actor == null || !actor.isAlive()) return;
QuestProgress quest = new QuestProgress { quest_id = "hello_first_steps", step = 1 };

// Speichern:
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// Auslesen:
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress loadedQuest = saved.Data;
}
```

Unter der Haube verwandelt `Set` dein Objekt in JSON und speichert es mit dem schlichten `data.set(key, string)` aus der Tabelle oben. Es ist also ein String pro Schlüssel pro Einheit, und die "klein halten"-Regel weiter unten gilt doppelt. Deine Klasse braucht einen parameterlosen Konstruktor, und ihre öffentlichen Felder und Eigenschaften sind das, was gespeichert wird.

Wenn du erwartest, dass sich dein Datenformat über Mod-Updates hinweg ändert, implementiere stattdessen `ICustomData` in deiner Klasse. Das sind zwei Methoden: `Serialize()` gibt ein `SerializedCustomData(modId, dataVersion, jObject)` zurück, und `Deserialize(SerializedCustomData)` bekommt es zurück. `ModId` und `DataVersion` dort zu prüfen ist deine Aufgabe, das macht niemand für dich. `BasicCustomData<T>` schreibt Platzhalterwerte in beide und wirft, wenn es irgendetwas anderes liest, misch die beiden also nicht auf demselben Schlüssel :PES5_Hmmmm:.

> [!NOTE] Geprüft gegen NML 1.2.0
> Diese Namen und Signaturen stammen aus der NML-Assembly selbst, nicht aus ihrer Dokumentation, die sie nicht erwähnt. Benennt ein neueres NML etwas um, sagt dir das der Compiler, bevor es deine Spieler tun.

## In HelloBox

Ein Merkmal (trait), das jeden Treffer seines Trägers mitzählt und beim fünfzigsten Treffer genau einmal eine Belohnung vergibt:

```csharp Mods/HelloBox/Code/HelloMemory.cs
namespace HelloBox
{
    public static class HelloMemory
    {
        public const string GRUDGE = "hello_grudge";      // the trait that remembers
        public const string HITS = "hello_hits";          // int: hits this unit has landed
        public const string VETERAN = "hello_veteran";    // flag: it already got its reward

        public static void Initialize()
        {
            if (AssetManager.traits.has(GRUDGE)) return;

            ActorTrait grudge = new ActorTrait
            {
                id = GRUDGE,
                path_icon = "ui/Icons/iconHelloGrudge",
                group_id = HelloGroups.TRAITS,
                needs_to_be_explored = false
            };

            grudge.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                Actor actor = pSelf as Actor;
                if (actor == null || !actor.isAlive()) return false;

                // lives in the unit's own save data, so it survives save and load
                actor.data.change(HITS, 1, 0, 100000);
                actor.data.get(HITS, out int hits);

                // addFlag() is false when the flag was already there: the reward happens once
                if (hits >= 50 && actor.data.addFlag(VETERAN))
                {
                    actor.addTrait("veteran");
                }
                return true;
            };

            AssetManager.traits.add(grudge);
            grudge.base_stats["damage"] = 2f;
        }

        /** Anyone can read it back, a window, a patch, another trait. */
        public static int GetHits(Actor pActor)
        {
            if (pActor == null) return 0;
            pActor.data.get(HITS, out int hits);
            return hits;
        }
    }
}
```

Speichere die Welt und lade sie neu: Der Zähler ist immer noch da, da er Teil der Speicherdaten der Einheit ist. Das Flag sorgt dafür, dass die Belohnung genau einmal ausgelöst wird und nicht bei jedem weiteren Schlag nach dem fünfzigsten. Großzügig, aber trotzdem ein Bug.

Die Lokalisierungstexte, wie bei jedem Merkmal:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_grudge": "Grudge",
  "trait_hello_grudge_info": "Remembers every blow it lands. Fifty, and it has seen enough to be a veteran."
}
```

> [!WARNING] `Actor.data` ist `internal`
> Das Datenfeld einer Einheit ist im Spiel-Assembly als `internal` markiert. NML kompiliert deine Mod gegen eine **publicized** Kopie, daher funktioniert es in normalen Quellcode-Mods problemlos. Es bricht nur, wenn du deine eigene `.dll` gegen das originale unveränderte Assembly baust: siehe **[Fehlerbehebung](#/troubleshooting)**. Das `data`-Feld von Städten und Königreichen ist ohnehin öffentlich.

## Wo die Daten liegen

| Objekt | Zugehörige Daten |
| --- | --- |
| Eine Einheit | `actor.data` |
| Eine Stadt | `city.data` |
| Ein Königreich | `kingdom.data` |
| Ein Gebäude | `building.data` |
| Kulturen (culture), Religionen, Clans, Sprachen, Familien, Armeen, Pläne (plot) | deren `data`, alles derselbe Speicher |

## Wissenswertes

- **Verwende Präfixe für deine Schlüssel.** Jede Mod schreibt in denselben Speicher. `hello_hits` kollidiert mit niemandem; `hits` irgendwann mit Sicherheit.
- **Das Entfernen der Mod ist sicher.** Die Schlüssel verbleiben im Spielstand, niemand liest sie aus, nichts geht kaputt. Das ist der große Vorteil gegenüber dem Patchen des spielinternen Speicherformats.
- **Leere Speicher kosten nichts.** Das Spiel verwirft leere Tabellen vor dem Schreiben der Speicherdatei, ein entfernter Schlüssel ist also wirklich weg.
- **Halte die Datenmenge klein.** Sie wird mit jeder einzelnen Einheit gespeichert. Ein Zähler oder ein Flag pro Einheit fällt nicht ins Gewicht; ein langer Text pro Einheit bei zehntausend Kreaturen auf der Karte vergrößert die Speicherdatei für alle.

## Die ganze Welt

Manch ein Zustand gehört zu gar keiner Einheit: wie viele Meteore deine Kraft schon auf diese Welt geworfen hat, ob der einmalige Segen schon stattgefunden hat. Die Welt hat denselben Speicher, in ihren Kartenstatistiken:

```csharp
// map_stats is internal: fine in an NML source mod, same deal as actor.data above
SaveCustomData world = World.world?.map_stats?.custom_data;
if (world == null) return;

world.change("hello_meteors", 1, 0, 1000000);   // change() clamps to 1000 unless you say otherwise
if (world.addFlag("hello_blessed")) { /* first time on this world only */ }
```

`SaveCustomData` ist derselbe `BaseSystemData`-Speicher, jeder Aufruf aus der Tabelle oben funktioniert also, ebenso NMLs `Set` / `TryGet`. Er wird mit dem Rest der Kartenstatistiken gespeichert, jeder Speicherstand hat also seinen eigenen. Eine frisch generierte Welt startet leer. Das Spiel erstellt den Speicher immer, wenn es die Kartenstatistiken baut oder lädt, die Null-Prüfung sollte also nie auslösen; sie kostet nichts, behalte sie.

> [!TIP] Einstellungen oder Weltdaten?
> Frag dich, ob der Spieler erwarten würde, dass sich der Wert ändert, wenn er einen anderen Spielstand lädt. "Wie stark ist die Meteor-Kraft" nicht: Das sind **[Mod-Einstellungen](#/nml/mod-config)**, geteilt von jeder Welt. "Wurde diese Welt gesegnet" schon: das ist `custom_data`.

## Zeit, die ein Speichern übersteht

`Time.time` sind Sekunden seit dem Spielstart. Speicher es in den Daten einer Einheit, speichere, starte neu, lade, und jeder Zeitstempel, den du geschrieben hast, stammt aus einem früheren Leben :wbfacepalm:.

Die Welt führt ihre eigene Uhr, und die wird mit der Karte gespeichert:

```csharp
if (World.world == null || World.world.map_stats == null || Config.worldLoading) return;
if (actor == null || !actor.isAlive()) return;

// double, in world seconds: 5 is a month, 60 is a year
double now = World.world.getCurWorldTime();

// the store has no double, a float is plenty for a timestamp
actor.data.set("hello_blessed_at", (float)now);

actor.data.get("hello_blessed_at", out float at, -1f);
bool blessedThisYear = at >= 0f && now - at < 60.0;
```

Sie stoppt außerdem, wenn das Spiel pausiert ist, und läuft bei höheren Geschwindigkeiten schneller, was fast immer das ist, was du meintest. `Date.getYearsSince(at)` und `Date.getMonthsSince(at)` übernehmen die Division für dich.

## Code ausführen, nachdem eine Welt geladen hat

Alles oben wird bei Bedarf gelesen, meist musst du also nicht wissen, wann eine Welt geladen hat. Wenn doch, etwa um einen eigenen Cache neu aufzubauen, sind das die Methoden, in die sich Mods mit **[Harmony](#/nml/harmony-patches)** einklinken:

| Methode | Wann sie läuft |
| --- | --- |
| `MapBox.clearWorld` (public) | Bevor irgendeine Welt generiert oder geladen wird. Leer hier deine statischen Caches |
| `SaveManager.loadActors` (private) | Während ein Spielstand lädt, direkt nachdem die Einheiten neu aufgebaut wurden |
| `MapBox.finishMakingWorld` (public) | Gegen Ende sowohl des Generierens als auch des Ladens einer Welt |
| `SaveManager.saveWorldToDirectory` (public, static) | Beim Speichern, manuell oder automatisch. Ein Prefix ist deine letzte Chance, in den Speicher zu schreiben |
| `MapBox.addLastStep` (private) | Einmal, beim Spielstart. Nicht pro Welt |
| `MapBox.OnApplicationQuit` (private) | Das Spiel wird geschlossen |

```csharp Mods/HelloBox/Code/HelloWorldCache.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloWorldCache
    {
        // a cached copy for code that reads it every frame; the save keeps the real one
        public static int MeteorsThisWorld;

        // runs for a brand new world and for a loaded save alike
        public static void Postfix()
        {
            MeteorsThisWorld = 0;
            SaveCustomData world = World.world?.map_stats?.custom_data;
            if (world == null) return;

            world.get("hello_meteors", out int meteors);
            MeteorsThisWorld = meteors;
        }
    }
}
```

Private Methoden nehmen den Namen als String, `[HarmonyPatch(typeof(SaveManager), "loadActors")]`, wie die Harmony-Seite erklärt. Der Ladebildschirm steht noch, wenn `finishMakingWorld` läuft; ein paar Schritte folgen danach noch.

## Deine eigenen Dateien

Viele Mods überspringen das alles und schreiben eine JSON-Datei mit `File.WriteAllText`, meist unter `Application.persistentDataPath`, das ist der `LocalLow\mkarpenko\WorldBox`-Ordner neben `Player.log`. Das ist in Ordnung für Dinge, die dem **Spieler** gehören: eine Liste von Lieblings-Einheiten, die er exportiert hat, Statistiken über jede Partie, die er je gespielt hat.

Es ist falsch für Dinge, die zu einer **Welt** gehören. Die Datei weiß nicht, welcher Speicherplatz geladen ist. Der Spieler segnet ein Königreich in Slot 1, lädt Slot 2, und Slot 2 ist auch gesegnet. Dann löscht er Slot 1 und deine Datei behält ihren Zustand für immer :PES2_F:. Soll sich etwas mit dem Spielstand ändern, gehört es in den Spielstand, in einen der Speicher oben.

## Wie es weitergeht

Für Werte, die der Spieler einmal wählt und die sich jede Welt teilt, siehe **[Mod-Einstellungen](#/nml/mod-config)**. Für Code, der jeden Frame oder jeden Spielmonat etwas prüft, siehe **[Jeder Frame](#/nml/update-loops)** :PES_OkHand:.
