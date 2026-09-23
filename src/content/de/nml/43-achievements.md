---
title: Erfolge
group: Spielinhalte
subgroup: Abschluss & Feinschliff
icon: :gold_star:
order: 220
---

# Erfolge :gold_star:

Ja, eine Mod kann eigene Erfolge (Achievements) hinzufügen. Sie erscheinen im Erfolge-Fenster des Spiels, ploppen wie echte Erfolge auf und werden mit dem Spielfortschritt des Spielers gespeichert. Lies die Warnung am Ende dieser Seite, bevor du Erfolge veröffentlichst.

```csharp Mods/HelloBox/Code/HelloAchievements.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAchievements
    {
        public const string SWARM = "achievement_hello_wisp_swarm";
        private const string WATCH = "hello_achievement_watch";

        public static void Initialize()
        {
            if (AssetManager.achievements.has(SWARM)) return;

            Achievement swarm = new Achievement
            {
                id = SWARM,
                group = "creatures",
                icon = "ui/Icons/iconHelloWisp",
                locale_key = SWARM,      // post_init() derives it at startup; yours stays null without this
                action = (object pData) => CountWisps() >= 10
            };

            AssetManager.achievements.add(swarm);

            // the achievements window reads each group's list, filled by linkAssets() at startup
            AssetManager.achievement_groups.get(swarm.group).achievements_list.Add(swarm);

            // nothing in the game knows when to check yours: look every 30 seconds
            WorldBehaviourAsset watch = new WorldBehaviourAsset
            {
                id = WATCH,
                interval = 30f,
                interval_random = 0f,
                action = () =>
                {
                    if (!swarm.isUnlocked()) swarm.check();
                }
            };
            AssetManager.world_behaviours.add(watch);
            watch.manager = new WorldBehaviour(watch);
        }

        private static int CountWisps()
        {
            int count = 0;
            List<Actor> units = World.world.units.getSimpleList();
            for (int i = 0; i < units.Count; i++)
            {
                Actor unit = units[i];
                if (unit != null && unit.isAlive() && unit.asset.id == "hello_wisp") count++;
            }
            return count;
        }
    }
}
```

Zehn Irrlichter gleichzeitig am Leben, und der Erfolg wird freigeschaltet.

## Was das Spiel nicht automatisch für dich tut

- **Der Textschlüssel.** `post_init()` generiert `locale_key` beim Start automatisch aus der ID für alle Vanilla-Erfolge. Bei deinem bleibt das Feld `null` und das Fenster zeigt nichts an – setze es also selbst.
- **Das Fenster.** Das Erfolge-Fenster listet die `achievements_list` jeder Gruppe auf, die von `linkAssets()` beim Spielstart gefüllt wurde. Füge deinen Erfolg der Gruppe hinzu, sonst schaltet er sich frei, ohne dass ihn jemand sehen kann.
- **Die Überprüfung.** Nichts im Spiel weiß, *wann* dein Erfolg überprüft werden soll: Vanilla ruft `check()` an genau den Stellen auf, an denen sich Bedingungen ändern können. HelloBox nutzt ein **[Weltverhalten](#/nml/world-ages)**, das alle 30 Sekunden nachschaut, was für "zehn Exemplare existieren gleichzeitig" völlig ausreicht. Bei einem Einmal-Ereignis rufst du `check()` direkt dort auf, wo es passiert.

| Feld | Funktion |
| --- | --- |
| `group` | Der Bereich im Fenster: `creation`, `worlds`, `civilizations`, `creatures`, `destruction`, `nature`, `experiments`, `collection`, `exploration`, `forbidden`, `miscellaneous` |
| `icon` | Das Bild, als vollständiger Sprite-Pfad |
| `action` | Deine Bedingung. `check()` schaltet frei, wenn dies `true` zurückgibt; `check()` ohne `action` schaltet sofort frei |
| `hidden` | Zeigt bis zur Freischaltung eine "Versteckt"-Zeile statt der Beschreibung |
| `locale_key` | Der Textschlüssel. Die Beschreibung lautet `<locale_key>_description` |

```json Mods/HelloBox/Locales/en.json
{
  "achievement_hello_wisp_swarm": "Wisp Swarm",
  "achievement_hello_wisp_swarm_description": "Have ten wisps alive at the same time."
}
```

> [!WARNING] Erfolge landen im echten Spieler-Profil
> Das Freischalten führt den Originalcode des Spiels aus: Es schreibt die ID in die Fortschrittsdatei des Spielers und fordert Steam auf, ein Achievement mit dieser ID freizuschalten. Steam kennt deine Mod-ID natürlich nicht, auf Steam-Seite passiert also nichts, aber der Aufruf erfolgt und das Protokoll meldet `Unlocking in Steam: <id>`. Die ID wird außerdem mit dem Analytics-Event des Spiels übermittelt. Und solange das Weltgesetz "Verfluchte Welt" aktiv ist, schaltet sich überhaupt nichts frei, deine Erfolge eingeschlossen.

Nichts davon macht etwas kaputt. Es ist jedoch die echte Fortschrittsdatei des Spielers – beschränke dich also auf wenige sinnvolle Erfolge und schalte niemals Dinge frei, die der Spieler nicht tatsächlich vollbracht hat :PESgn_ReadRules:.
