---
title: Eigene Akteure
group: Spielinhalte
subgroup: Akteure, Gebäude & KI
icon: :wbhuman:
order: 140
---

# Eigene Akteure :wbhuman:

> [!NOTE] Sie heißen Akteure, nicht Rassen
> Das Spiel nennt jedes lebende Wesen einen **Akteur** (Actor): einen Menschen, einen Wolf, einen Drachen, einen Zombie, eine Krabbe. Sie alle stammen von derselben Klasse ab, `ActorAsset`, und leben alle in `AssetManager.actor_library`. "Rasse" ist die veraltete Bezeichnung. Der einzige Ort, an dem sie überlebt hat, ist eine `race`-Eigenschaft mit dem Vermerk `[Obsolete("use .original_actor_asset instead")]`, die nur noch existiert, um uralte Spielstände zu laden. Schreibe überall `actor`.

Eine neue Kreatur ist die Mod, die jeder machen will und fast niemand fertigstellt, denn ein `ActorAsset` schleppt Animationen, Texturen, Sounds, Taxonomie, Ernährung, KI-Flags, Genom, Kultur und Statuswerte mit sich herum. Wenn du auch nur eines davon falsch machst, hast du eine unsichtbare Einheit, die regungslos im Ozean steht :PES4_Invisible:.

Die gute Nachricht: Auch das Spiel baut Kreaturen nicht von Grund auf neu. Das hier ist wortwörtlich, wie Vanilla einen Elfen erschafft:

```csharp
clone("elf", "$civ_advanced_unit$");
```

Also machen wir genau dasselbe.

## Die Vorlagen

IDs in `$` sind **Vorlagen** (Templates): halbfertige Akteure, die das Spiel nur aufbewahrt, damit andere Akteure davon geklont werden können. Sie sind der richtige Ausgangspunkt für eine brandneue Kreatur, weil sie die gesamte interne Verkabelung mitbringen, ohne jedoch die Sprites eines Menschen aufzuzwingen.

| Vorlage | Klonen für |
| --- | --- |
| `$basic_unit$` | Das absolute Minimum eines Lebewesens |
| `$animal$` | Ein wildes Tier |
| `$mob$` | Ein feindseliges Monster |
| `$civ_unit$` | Ein zivilisiertes Wesen |
| `$civ_advanced_unit$` | Ein vollwertiges Zivilisationswesen: Städte, Reiche, Kultur, Religion. Was Mensch, Elf, Ork und Zwerg nutzen |

Du kannst auch einen fertigen Akteur klonen - `human`, `wolf`, `zombie` - und das ist der einfachere Weg für deine erste Kreatur, weil die Sprites des Spenders direkt mitkommen und deine Kreatur sofort sichtbar ist.

## Ein einzelner Akteur

```csharp Mods/HelloBox/Code/HelloActors.cs
namespace HelloBox
{
    public static class HelloActors
    {
        public const string SPRITE = "hello_sprite";

        public static void Initialize()
        {
            if (AssetManager.actor_library.has(SPRITE)) return;

            // clone() copies every field, gives the copy the new id, and registers it.
            // Do NOT call add() afterwards: that registers it a second time and the
            // library logs "duplicate asset - overwriting...".
            ActorAsset sprite = AssetManager.actor_library.clone(SPRITE, "human");

            sprite.name_locale = "Sprite";
            sprite.civ = true;                       // founds cities, joins kingdoms, goes to war
            sprite.can_have_subspecies = true;
            sprite.actor_size = ActorSize.S13_Human;
            sprite.color_hex = "#7FE7C4";
            sprite.icon = "iconHelloSprite";

            // visible immediately: no need to discover them first
            sprite.needs_to_be_explored = false;

            // Taxonomy: what the knowledge window shows.
            sprite.name_taxonomic_genus = "spiritus";
            sprite.name_taxonomic_species = "minor";

            // Stats. clone() already ran add(), so base_stats exists here.
            sprite.base_stats["health"] = 80;
            sprite.base_stats["damage"] = 12;
            sprite.base_stats["speed"] = 32f;

            // see the warning below: the shadow is not loaded for you
            sprite.texture_asset.loadShadow();
        }
    }
}
```
> [!WARNING] Lade den Schatten selbst, sonst beschwert sich das Spiel über jeden Akteur
> `ActorAssetLibrary` geht beim Start seine Liste durch und ruft bei jedem Akteur `loadShadow()` auf, das das Sprite unter `shadows/<shadow_texture>` liest und vermisst. Das passierte, bevor deine Mod irgendetwas registriert hat, also bleibt der Schatten deines Akteurs `(0.00, 0.00)`, und das Spiel loggt dafür einen Asset-Fehler, dreimal, je einmal für den Erwachsenen, das Ei und das Baby :wbfacepalm:.
>
> `loadShadow()` ist `internal`, das braucht also eine **publizierte** `Assembly-CSharp.dll` wie der Rest des Leitfadens. Hast du keine, setz stattdessen `asset.shadow = false;`: kein Schatten, aber auch kein Fehler.

> [!WARNING] `clone()` registriert bereits
> `AssetManager.<library>.clone(newId, sourceId)` ruft intern `add()` auf. Jede Bibliothek funktioniert so. Rufst du danach selbst `add()` auf, ist das eine doppelte Registrierung: Die Bibliothek entfernt die erste Kopie, loggt einen Fehler und fügt sie neu hinzu. Harmlos, aber Rauschen in deinem Log, das echte Fehler schwerer auffindbar macht, und das Erste, was ein Prüfer sieht.
>
> Die Kehrseite ist die gute Nachricht: **Nach einem Klon existiert `base_stats` bereits**, also ist die Regel "Werte nach add" aus **[Eigene Merkmale](#/nml/custom-traits)** schon erfüllt.

## Mehrere Akteure auf einmal

Die meisten Kreaturen-Mods begnügen sich nicht mit einer einzigen Kreatur. Drei Geister bedeuten drei Assets, und sobald du den obigen Block dreimal kopierst, hast du drei Stellen, an denen du jeden Bug beheben musst.

Packe die Unterschiede in eine Tabelle und den Code in eine Schleife:

```csharp Mods/HelloBox/Code/HelloActors.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloActors
    {
        // Everything that actually differs between the three, in one place.
        private struct Def
        {
            public string Id;
            public string From;      // which actor or template to clone
            public string Color;
            public string Icon;
            public float Health;
            public float Damage;
            public float Speed;
            public bool OwnArt;      // true: sprites come from GameResources/actors/species/other/<id>/
        }

        private static readonly Def[] Defs = new Def[]
        {
            new Def { Id = "hello_sprite", From = "human", Color = "#7FE7C4", Icon = "iconHelloSprite", Health = 80,  Damage = 12, Speed = 32f },
            new Def { Id = "hello_wisp",   From = "wolf",  Color = "#C49BFF", Icon = "iconHelloWisp",   Health = 60,  Damage = 20, Speed = 40f, OwnArt = true },
            new Def { Id = "hello_golem",  From = "wolf",  Color = "#8C8C8C", Icon = "iconHelloGolem",  Health = 240, Damage = 30, Speed = 18f, OwnArt = true },
        };

        public static void Initialize()
        {
            for (int i = 0; i < Defs.Length; i++)
            {
                Register(Defs[i]);
            }
        }

        private static void Register(Def pDef)
        {
            if (AssetManager.actor_library.has(pDef.Id)) return;
            if (!AssetManager.actor_library.has(pDef.From)) return;   // donor missing, skip quietly

            ActorAsset asset = AssetManager.actor_library.clone(pDef.Id, pDef.From);

            asset.civ = !pDef.OwnArt;                // a civ needs heads, male and female sheets
            asset.can_have_subspecies = true;
            asset.actor_size = ActorSize.S13_Human;
            asset.color_hex = pDef.Color;
            asset.icon = pDef.Icon;

            if (pDef.OwnArt)
            {
                // clone() copied the donor's texture paths, so point this one at its own folder.
                // The folder holds main/ and child/, one PNG per frame: walk_0..3, swim_0..3.
                asset.texture_asset = new ActorTextureSubAsset("actors/species/other/" + pDef.Id + "/", false);
                asset.has_advanced_textures = false;
                asset.animation_walk = ActorAnimationSequences.walk_0_3;
                asset.animation_swim = ActorAnimationSequences.swim_0_3;
                asset.animation_idle = ActorAnimationSequences.walk_0;
            }

            // visible immediately: no need to discover them first
            asset.needs_to_be_explored = false;

            asset.base_stats["health"] = pDef.Health;
            asset.base_stats["damage"] = pDef.Damage;
            asset.base_stats["speed"] = pDef.Speed;

            // The library loads every actor's shadow during its own startup, which was before
            // your mod existed. Without this the game logs "Shadow size is too small (0.00, 0.00)".
            asset.texture_asset.loadShadow();
        }
    }
}
```

Eine vierte Kreatur hinzuzufügen ist jetzt nur noch eine einzige Zeile in der Tabelle. So sehen fast alle echten Kreaturen-Mods aus, und es lohnt sich, ab der zweiten Kreatur genau so vorzugehen :PESgn_ThisTBH:.

## Die Felder, die bestimmen, was deine Kreatur *ist*

Am ersten Tag zählen nur drei davon: `civ`, `actor_size` und `name_locale`. Der Rest kann warten, bis deine Kreatur sichtbar ist und läuft.

| Feld | Was es bewirkt |
| --- | --- |
| `civ` | Zivilisationswesen: Städte, Reiche, Berufe, Krieg. `false` = Tier |
| `auto_civ` | Ob das Spiel sie von alleine zivilisiert |
| `default_animal` | Markiert sie für spielinterne Prüfungen als Wildtier |
| `unit_other` | Weder Zivilisation noch Tier: Mob, Konstrukt, Spezialwesen |
| `actor_size` | `S0_Bug` … `S13_Human` … `S17_Dragon`. Steuert Rendering und manche Kampfberechnungen |
| `name_locale` | Schlüssel für den Anzeigenamen |
| `icon` | Das Icon in Listen und Spawn-Buttons |
| `color_hex` | Die Färbung für einfärbbare Einheiten |
| `can_have_subspecies` | Ob sie über Generationen hinweg zu Unterarten mutieren |
| `has_ai_system` | Ob sie überhaupt das Verhaltenssystem ausführen |
| `flying` / `hovering` | Ob sie den Boden verlassen und wie hoch |
| `force_ocean_creature` / `force_land_creature` | Legt das bewohnbare Terrain strikt fest |
| `can_attack_buildings` | Ob sie Gebäude angreifen und zerstören |
| `has_soul`, `can_receive_traits`, `can_be_cloned` | Was göttliche Kräfte mit ihnen tun dürfen |
| `kingdom_id_wild` / `kingdom_id_civilization` | Welchem Reich sie beitreten (wild oder sesshaft) |
| `texture_atlas` | `UnitTextureAtlasID.Units`, `Boats`, `Zombies` … aus welchem Atlas die Sprites stammen |
| `animation_walk` / `animation_idle` / `animation_swim` | Frame-Sequenzen mit eigenem `_speed`-Feld |
| `sound_idle`, `sound_spawn`, `sound_death`, `sound_attack`, `sound_hit` | FMOD-Event-Pfade |
| `name_taxonomic_*` | Reich, Stamm, Klasse, Ordnung, Familie, Gattung, Art für das Wissensfenster |
| `collective_term` | Kollektivbezeichnung (z. B. "ein **Rudel** Wölfe") |
| `allowed_status_tiers` | Welche Statuseffekt-Stufen auf sie angewendet werden können |
| `production` | Was ihre Städte herstellen |
| `zombie_id_internal`, `skeleton_id`, `mush_id`, `tumor_id` | In was sie sich verwandeln |

## Eine Zivilisations-Kreatur in die Welt einbinden

Ein `civ`-Akteur ist noch lange nicht fertig, wenn nur seine Statuswerte gesetzt sind. Das sind die Teile, die Vanilla für jede spielbare Kreatur ausfüllt. Lässt du sie weg, "tut eine Zivilisation einfach gar nichts":

```csharp
asset.kingdom_id_wild = "nomads_human";          // bevor sie sesshaft werden
asset.kingdom_id_civilization = "human";         // ihr Reichstyp
asset.banner_id = "human";                       // Flaggen-Generator
asset.architecture_id = "human";                 // wie ihre Gebäude aussehen
asset.build_order_template_id = "build_order_advanced";
asset.name_template_sets = new string[] { "human_default_set" };   // wie Namen generiert werden
asset.civ_base_cities = 3;
asset.family_limit = 20;

asset.addPreferredColors("teal", "lime");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// Genom: die vererbbare Werteverteilung für Fortpflanzung und Mutationen.
asset.addGenome(
    ("health", 70f), ("stamina", 200f), ("lifespan", 500f),
    ("damage", 10f), ("speed", 20f), ("offspring", 2f),
    ("intelligence", 6f), ("diplomacy", 5f), ("warfare", 2f), ("stewardship", 2f));

// Start-Merkmale nach Merkmalssystem.
asset.addCultureTrait("bow_lovers");
asset.addReligionTrait("rite_of_change");
asset.addSubspeciesTrait("long_lifespan");
asset.addClanTrait("blood_pact");
asset.addLanguageTrait("melodic");
asset.addKingdomTrait("tax_rate_local_low");
```

Verwende `banner_id` und `architecture_id` aus Vanilla wieder, bis du eigene Grafiken hast. Eine Kreatur ohne Architektur baut absolut gar nichts.

## Einen Akteur spawnen

```csharp
Actor actor = World.world.units.spawnNewUnit("hello_sprite", tile, pSpawnSound: true, pAdultAge: true);
```

`spawnNewUnit` ist öffentlich und akzeptiert optionale Argumente für Spawn-Sound, Wunder-Spawn, Spawn-Höhe, eine bestimmte Unterart und ob die Einheit Startgegenstände erhält.

Gib dem Spieler einen Gotteskraft-Button dafür und du hast einen fertigen Spawner. Siehe **[Power-Tabs & Buttons](#/nml/power-buttons)**.

## Unterarten

Unterarten (Subspecies) sind die Varianten, in die ein Akteur über Generationen hinweg abdriftet. Sie haben ihre eigene Merkmalsbibliothek, getrennt von Akteursmerkmalen, und ihre eigene Gruppenliste:

```csharp
SubspeciesTrait scales = new SubspeciesTrait
{
    id = "hello_scales",
    group_id = "body",
    spawn_random_trait_allowed = true
};
AssetManager.subspecies_traits.add(scales);
scales.base_stats["armor"] = 5;

// lass deinen Akteur damit starten
asset.addSubspeciesTrait("hello_scales");
```

Unterarten-Merkmale können auch **Grafiken** tragen: `sprite_path`, `animation_walk`, `skin_citizen_male`, `skin_warrior` und Ähnliches. So unterscheidet sich eine Unterart optisch von ihrer Stammart, ohne ein separater Akteur sein zu müssen. Siehe **[Unterarten-Merkmale](#/nml/subspecies-traits)**.

## Dein eigenes Icon

Vor der Animationsarbeit unten kommt der günstige Teil: das Icon in Listen und Spawn-Buttons.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSprites.png
```

```csharp
sprite.icon = "iconHelloSprites";
```

Die **Körpergrafik** der Kreatur ist ein völlig anderes Thema und füllt den Rest dieses Abschnitts.

## Sprites sind der harte Teil

Alles oben Beschriebene ist nur eine Seite Code. Die eigentliche Arbeit ist die Kunst, und hier sterben die meisten Kreaturen-Mods still und leise: Eine Kreatur braucht ein komplettes Animationsset, im richtigen Atlas, in der richtigen Größe und mit den richtigen Drehpunkten. Es gibt zwei ehrliche Wege:

1. **Behalte die Sprites des Spenders.** Eine Kreatur, die menschliche Animationen mit anderen Stats und einer anderen Färbung wiederverwendet, ist eine vollkommen solide erste Mod, und sie *funktioniert*.
2. **Exportiere mit AssetRipper**, suche den Atlas der geklonten Kreatur und passe dein Layout exakt daran an, bevor du überhaupt mit dem Zeichnen beginnst. Siehe **[Die Spielgrafiken beschaffen](#/toolbox/getting-the-sprites)**.

> [!WARNING] In einer echten Welt testen, nicht auf einer leeren Karte
> Eine Zivilisationskreatur, die keine Pfade findet, nichts bauen kann oder beim Spawnen ertrinkt, sieht in den ersten dreißig Sekunden völlig normal aus. Spawne zwanzig davon, lass die Welt fünf Minuten lang bei voller Geschwindigkeit laufen und lies dann das Log :PES_MonkaSweat:.
