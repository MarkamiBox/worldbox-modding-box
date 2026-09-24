---
title: Weltzeitalter & Weltverhalten
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbsunblessed:
order: 174
---

# Weltzeitalter & Weltverhalten :wbsunblessed:

Zwei Dinge gehören der Welt selbst und nicht den Lebewesen auf ihr. Ein **Weltzeitalter** (World Age) ist eine Epoche auf dem Zeitalter-Rad: das Zeitalter (world age) der Hoffnung, das Zeitalter der Asche, samt Wetter, Licht und Gesetzen. Ein **Weltverhalten** (World Behaviour) ist ein Stück Code, das die Welt dauerhaft in festen Intervallen ausführt: So plant das Spiel Katastrophen (disaster), Zuwanderung und Straßenverfall.

```csharp Mods/HelloBox/Code/HelloAges.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAges
    {
        public const string EMBERS = "age_hello_embers";
        public const string SPARKS = "hello_sparks";

        public static void Initialize()
        {
            RegisterAge();
            RegisterBehaviour();
        }

        private static void RegisterAge()
        {
            if (AssetManager.era_library.has(EMBERS)) return;

            WorldAgeAsset age = new WorldAgeAsset
            {
                id = EMBERS,
                path_icon = "ui/Icons/iconHelloAge",
                rate = 2,
                particles_ash = true,
                overlay_ash = true,
                era_effect_overlay_alpha = 0.2f,
                title_color = Toolbox.makeColor("#D14219"),
                bonus_loyalty = 5,
                fire_spread_rate_bonus = 2f,
                cloud_interval = 20f,
                special_effect_interval = 8f
            };
            age.clouds = new List<string> { HelloClouds.EMBER };
            age.biomes = new HashSet<string> { "biome_savanna" };
            age.default_slots = new List<int> { 4 };
            age.special_effect_action = RainEmbers;

            AssetManager.era_library.add(age);

            // post_init() builds this path from the id, at startup. Borrow a vanilla background.
            age.path_background = "ui/AgeWheel/backgrounds/age_sun_background";

            // linkAssets() built both pools at startup: the random pick, and the wheel's default slots
            AssetManager.era_library.list_only_normal.Add(age);
            foreach (int slot in age.default_slots)
            {
                if (AssetManager.era_library.pool_by_slots.TryGetValue(slot, out List<WorldAgeAsset> pool)) pool.Add(age);
            }
        }

        /** Every special_effect_interval seconds while the age lasts. */
        private static void RainEmbers()
        {
            WorldTile[] tiles = World.world.tiles_list;
            if (tiles == null || tiles.Length == 0) return;

            for (int i = 0; i < 5; i++)
            {
                WorldTile tile = tiles[Randy.randomInt(0, tiles.Length)];
                if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
            }
        }

        private static void RegisterBehaviour()
        {
            if (AssetManager.world_behaviours.has(SPARKS)) return;

            WorldBehaviourAsset sparks = new WorldBehaviourAsset
            {
                id = SPARKS,
                interval = 30f,          // seconds between runs
                interval_random = 15f,   // plus up to this much, so it does not tick like a metronome
                action = CurseSomebody
            };

            AssetManager.world_behaviours.add(sparks);

            // MapBox creates one manager per behaviour when it wakes up, before your mod.
            // Without this the world loop calls update() on null, every frame.
            sparks.manager = new WorldBehaviour(sparks);
        }

        /** While the chaos law is on, a random creature catches the curse. */
        private static void CurseSomebody()
        {
            WorldLawAsset chaos = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
            if (chaos == null || !chaos.isEnabled()) return;

            List<Actor> units = World.world.units.getSimpleList();
            if (units.Count == 0) return;

            Actor victim = units[Randy.randomInt(0, units.Count)];
            if (victim != null && victim.isAlive()) victim.addStatusEffect(HelloStatus.CURSED);
        }
    }
}
```

## Weltzeitalter

Das Zeitalter der Glut lässt alle acht Sekunden Glut regnen, verdunkelt den Bildschirm mit Aschepartikeln, breitet Feuer doppelt so schnell aus und hält Städte etwas loyaler. Eine neue Welt kann es auf Slot 4 ihres Rades platzieren, und der Zufallswürfel des Rades kann es überall hin ausrollen. Zurückhaltung war nie der Sinn von HelloBox :wbfireskull:.

> [!WARNING] Drei Dinge, die die Library beim Start erledigt hat
> `post_init()` setzt den Hintergrund jedes Zeitalters anhand seiner ID, und `linkAssets()` baut `list_only_normal` (den Pool für das zufällige "unbekannte" Zeitalter) sowie `pool_by_slots` (die Pools, aus denen eine neue Welt ihr Rad füllt). Ein neues Zeitalter ist in keinem davon enthalten. Lässt du den Hintergrund weg, zeigt das Rad ein leeres Segment; lässt du die Pools weg, existiert das Zeitalter zwar, wird aber von keiner Welt jemals gewürfelt.

> [!NOTE] Die Liste der auswählbaren Zeitalter
> Das Zeitalter-Fenster erstellt beim ersten Öffnen einen Button pro Zeitalter, und das Spiel lädt dieses Fenster vor. Ich habe nicht überprüft, ob es vor oder nach den Mods aufwacht; ob deines dort einen Button bekommt, solltest du im Spiel selbst ansehen und nicht als Versprechen nehmen. Das Rad, die Zufallspools und der Spezialeffekt hängen nicht davon ab.

| Feld | Funktion |
| --- | --- |
| `rate` | Gewichtung, wenn ein Zeitalter zufällig gewählt wird |
| `default_slots` | Welche Rad-Slots (1 bis 8) eine neue Welt damit belegen darf |
| `clouds` + `cloud_interval` | Welche Wolken (cloud) es erzeugt und wie oft |
| `special_effect_action` + `special_effect_interval` | Dein Timer-Code, solange das Zeitalter aktiv ist |
| `overlay_*`, `particles_*`, `era_effect_overlay_alpha` | Das Erscheinungsbild: Dunkelheit, Regen, Schnee, Asche, Sonne |
| `title_color`, `light_color` | Die Farbe des Namens und des Umgebungslichts |
| `bonus_loyalty`, `bonus_opinion`, `bonus_biomes_growth` | Boni auf Weltpolitik und Pflanzenwachstum |
| `fire_spread_rate_bonus`, `temperature_damage_bonus`, `range_weapons_multiplier` | Modifikatoren für Spielregeln |
| `flag_night`, `flag_winter`, `flag_chaos`, `flag_light_age`, `flag_crops_grow` | Schalter für andere Systeme. Getreide wächst nur, solange `flag_crops_grow` true ist |

Die Textschlüssel lauten `<id>_title` und `<id>_description`.

## Weltverhalten

Ein Weltverhalten besteht aus zwei Zahlen und einem Delegat: Führe `action` alle `interval` Sekunden aus, plus bis zu `interval_random` zusätzliche Sekunden Zufallspuffer. Es pausiert mit der Welt, es sei denn, du setzt `stop_when_world_on_pause = false`, und `action_world_clear` läuft beim Laden einer neuen Welt.

> [!WARNING] Der Manager wird beim Spielstart erstellt
> Die Welt verwaltet für jedes Verhalten einen `WorldBehaviour`-Timer, der von `createManagers()` beim ersten Erwachen der Karte vor deiner Mod erstellt wurde. Dein neues Verhalten hat `manager == null`, und die Update-Schleife der Welt ruft es trotzdem auf: `NullReferenceException`, in jedem einzelnen Frame, solange das Spiel läuft :wbfacepalm:. Die eine Zeile nach `add()` behebt das Problem.

Das Verhalten in HelloBox tut nichts, solange sein Weltgesetz (world law) ausgeschaltet ist. Das ist das nachahmenswerte Muster: Die Prüfung ist extrem billig, also lass den Timer einfach laufen und triff die Entscheidung innerhalb der Action.

```json Mods/HelloBox/Locales/en.json
{
  "age_hello_embers_title": "Age of Embers",
  "age_hello_embers_description": "The sky is on fire, a little. Cities like it."
}
```

Für Code, der nach eigenem Zeitplan unabhängig von der Welt laufen soll (wie etwa UI-Logik), ist NMLs `Update()` auf deiner Hauptklasse immer noch der einfachere Ort: siehe **[Die fertige Mod](#/nml/all-together)** :PES_OkHand:.
