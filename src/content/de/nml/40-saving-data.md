---
title: Daten im Spielstand speichern
group: NML-Modding
subgroup: Erweitert & Veröffentlichung
icon: :wbfloppysavewink:
order: 44
---

# Daten im Spielstand speichern :wbfloppysavewink:

Früher oder später muss deine Mod sich etwas über eine bestimmte Einheit merken: wie oft sie getroffen wurde, ob sie ihre Belohnung schon erhalten hat oder an welchem Schrein sie betet. Ein statisches Dictionary mit der Einheit als Schlüssel vergisst im Moment des Speicherns und Neuladens einfach alles :wbfacepalm:.

Das Spiel hat dafür bereits einen festen Platz. Jede Einheit, jede Stadt, jedes Königreich, jedes Gebäude, jeder Gegenstand und jedes Buch speichert seinen Zustand in einem Datenobjekt – und jedes dieser Objekte besitzt einen kleinen **benutzerdefinierten Datenspeicher** (Custom Data), der automatisch mit in die Speicherdatei wandert.

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


> [!NOTE] Mehr als fünf primitive Datentypen speichern
> NML bietet ein eigenes Hilfsmittel, um ein komplettes Objekt in den Daten einer Einheit zu speichern, nicht nur `int`/`long`/`float`/`string`/`bool`. Mehr als einen Zähler oder ein Flag habe ich nie gebraucht, daher kann ich dich hier nicht durchführen. Es existiert jedoch, falls du eine vollständige Struktur oder Liste sichern musst.

## In HelloBox

Ein Merkmal, das jeden Treffer seines Trägers mitzählt und beim fünfzigsten Treffer genau einmal eine Belohnung vergibt:

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
| Kulturen, Religionen, Clans, Sprachen, Familien, Armeen, Pläne | deren `data`, alles derselbe Speicher |

## Wissenswertes

- **Verwende Präfixe für deine Schlüssel.** Jede Mod schreibt in denselben Speicher. `hello_hits` kollidiert mit niemandem; `hits` irgendwann mit Sicherheit.
- **Das Entfernen der Mod ist sicher.** Die Schlüssel verbleiben im Spielstand, niemand liest sie aus, nichts geht kaputt. Das ist der große Vorteil gegenüber dem Patchen des spielinternen Speicherformats.
- **Leere Speicher kosten nichts.** Das Spiel verwirft leere Tabellen vor dem Schreiben der Speicherdatei, ein entfernter Schlüssel ist also wirklich weg.
- **Halte die Datenmenge klein.** Sie wird mit jeder einzelnen Einheit gespeichert. Ein Zähler oder ein Flag pro Einheit fällt nicht ins Gewicht; ein langer Text pro Einheit bei zehntausend Kreaturen auf der Karte vergrößert die Speicherdatei für alle.

Für alles, was nicht an ein einzelnes Objekt gebunden ist – etwa eine globale Einstellung für die gesamte Welt –, verwende stattdessen die Konfiguration deiner Mod: siehe **[Mod-Einstellungen](#/nml/mod-config)** :PES_OkHand:.
