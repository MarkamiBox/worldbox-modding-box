---
title: Statuseffekte
group: Spielinhalte
subgroup: Akteure, Gebäude & KI
icon: :wbcursed:
order: 146
---

# Statuseffekte :wbcursed:

Ein Merkmal definiert, wer eine Kreatur **ist**. Ein Statuseffekt definiert, was ihr **gerade jetzt** widerfährt: brennend, eingefroren, vergiftet, gesegnet. Sie laufen von selbst ab, legen ihr eigenes Sprite über die Einheit und können Aktionen auf einem Timer ausführen.

## Einen Statuseffekt registrieren

Statusse leben in `AssetManager.status`. Dasselbe Muster wie bei Merkmalen: Asset bauen, befüllen, registrieren.

```csharp Mods/HelloBox/Code/HelloStatus.cs
namespace HelloBox
{
    public static class HelloStatus
    {
        public const string CURSED = "hello_cursed";

        public static void Initialize()
        {
            if (AssetManager.status.has(CURSED)) return;

            StatusAsset cursed = new StatusAsset
            {
                id = CURSED,

                // Statuses do NOT derive their locale keys from the id.
                // Set both, or the unit shows a blank tooltip.
                locale_id = "status_title_hello_cursed",
                locale_description = "status_description_hello_cursed",

                texture = "fx_hello_status",          // a folder of frames in GameResources/effects/
                path_icon = "ui/Icons/iconHelloStatus",       // icon in GameResources/ui/Icons/
                duration = 20f,                           // seconds, then it removes itself
                tier = StatusTier.Advanced,               // None, Basic or Advanced
                can_be_cured = true,
                allow_timer_reset = true,                 // re-applying refreshes the timer
                animated = true,
                animation_speed = 0.15f,
                loop = true,
                scale = 1f,
                offset_y = 0.2f,
                affects_mind = false,
                removed_on_damage = false,
                opposite_status = new string[] { "blessed" },
                remove_status = new string[] { "shield" }
            };

            // StatusAsset allocates its own base_stats, so unlike traits you can set
            // these before add(). Doing it after works too, and is the safer habit.
            cursed.base_stats["damage"] = -5;
            cursed.base_stats["speed"] = -10f;

            AssetManager.status.add(cursed);

            // StatusLibrary turns texture into frames, and flags the status as drawable, in its
            // own post-init: before your mod existed. Without these two the first unit that gets
            // the status throws NullReferenceException every frame.
            cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
            cursed.need_visual_render = true;
        }
    }
}
```

> [!WARNING] Die Frames werden nur für Vanilla-Status geladen
> `StatusLibrary` füllt `sprite_list` aus `"effects/" + texture` und setzt `need_visual_render`, einmal, beim Laden. Ein Status, den du danach hinzufügst, hat `sprite_list = null`, und sobald eine Kreatur ihn bekommt, wirft `Status.updateAnimationFrame()` in jedem Frame `NullReferenceException`, solange der Status hält :wbfacepalm:. Die letzten zwei Zeilen von `Initialize` erledigen das für deinen.
>
> `texture` bezeichnet einen **Ordner**: `GameResources/effects/fx_hello_status/` mit einer PNG pro Animationsframe.


### Die wichtigsten Felder

Die kurze Liste. Die echte ist länger und größtenteils langweilig :wbyawn:.

| Feld | Was es bewirkt |
| --- | --- |
| `duration` | Lebensdauer in Sekunden. Der Status entfernt sich selbst nach Ablauf |
| `allow_timer_reset` | Ob erneutes Anwenden den Timer zurücksetzt, statt nichts zu tun |
| `tier` | `StatusTier.None`, `Basic` oder `Advanced`. Das `allowed_status_tiers` der Kreatur entscheidet |
| `can_be_cured` | Ob Heilkräfte oder Effekte den Status aufheben können |
| `removed_on_damage` | Fällt ab, sobald die Einheit Schaden erleidet |
| `cancel_actor_job` | Unterbricht die aktuelle Tätigkeit der Einheit beim Eintreffen |
| `affects_mind` | Markiert den Effekt als geistigen Einfluss |
| `opposite_status` | Statusse, die nicht gleichzeitig mit diesem existieren können |
| `remove_status` | Statusse, die beim Eintreffen dieses Status abgestreift werden |
| `base_stats` | Wertemodifikatoren während der Wirkungsdauer |
| `locale_id` / `locale_description` | Namens- und Tooltip-Schlüssel. **Erforderlich** |
| `path_icon` | Das Icon in der Statusliste |
| `texture`, `sprite_list`, `animated`, `loop`, `animation_speed` | Das auf die Einheit gezeichnete Sprite. `texture` ist ein reiner Name aus `effects/` |
| `offset_x`, `offset_y`, `scale`, `rotation_z`, `render_priority` | Position und Darstellung |
| `opposite_traits`, `opposite_tags` | Merkmale und Tags, die diesen Status abwehren |
| `action_on_receive`, `action_get_hit` | Zusätzliche Hooks beim Erhalt und bei Treffern |
| `sound_idle` | Ein FMOD-Sound-Loop während der Wirkungsdauer |

## Dein eigenes Sprite

Hier lauert eine Falle, und jeder tappt einmal hinein :wbbre:. `texture` ist **kein** vollständiger Pfad: Die Statusbibliothek hängt vor dem Laden automatisch `effects/` davor, du schreibst also nur den reinen Namen.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/
        └── fx_hello_status/
            ├── fx_hello_status_0.png
            ├── fx_hello_status_1.png
            └── fx_hello_status_2.png
```

```csharp
cursed.texture = "fx_hello_status";   // NICHT "effects/fx_hello_status"
```

Schreibst du den Ordner selbst davor, sucht das Spiel nach `effects/effects/fx_hello_status`, findet nichts und zeichnet überhaupt kein Sprite. Vanilla-Namen sehen aus wie `fx_status_burning_t` und `fx_status_drowning_t`.

`path_icon` auf demselben Asset ist etwas Eigenständiges und *ist* ein vollständiger Pfad - es ist das kleine Icon in der Statusliste, nicht das Sprite auf der Kreatur.

## Dem Effekt echte Wirkung verleihen

`action` läuft alle `action_interval` Sekunden, während der Status aktiv ist. `action_finish` läuft beim Auslaufen, `action_death` falls die Einheit daran stirbt.

```csharp
cursed.action_interval = 1f;
cursed.action = (BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.changeHealth(-2);   // öffentlich und ausreichend für Schaden über Zeit
    return true;
};
```

## Auf eine Einheit anwenden

Hier stolpern viele. Die offensichtliche Methode, `actor.addStatusEffect("hello_cursed")`, ist im Spiel-Assembly als `internal` markiert. Gegen eine **publicized** `Assembly-CSharp.dll` kompiliert sie sauber, und eine normale NML-Mod hat schon eine: NML kompiliert dein `Code/*.cs` gegen seine eigene publicized Kopie, deshalb kompiliert jedes `internal`-Mitglied in diesem Guide bei dir. Du verlierst das nur, wenn du in Visual Studio eine eigene `.dll` gegen das normale Assembly baust. Für diesen Fall funktioniert der öffentliche Weg immer:

```csharp
StatusAsset asset = AssetManager.status.get(HelloStatus.CURSED);
World.world.statuses.newStatus(actor, asset, 20f);   // 20s, oder 0 für die eigene Dauer des Assets
```

In einem Verhaltenselement gibt es vorgefertigte Knoten: `new BehActorAddStatus("hello_cursed", 20f)` und `new BehActorRemoveStatus("hello_cursed")`.

## Die Texte nicht vergessen

```json Mods/HelloBox/Locales/en.json
{
  "status_title_hello_cursed": "Cursed",
  "status_description_hello_cursed": "Something very old is very annoyed at this creature."
}
```

Die Schlüssel entsprechen dem, was du in `locale_id` und `locale_description` hinterlegt hast. Das Vanilla-Schema `status_title_<id>` / `status_description_<id>` hält deine Sprachdateien aufgeräumt.

> [!TIP] Statusse sind der günstige Weg für temporäre Effekte
> Alles, was abklingen soll (ein Segen deiner Gotteskraft, ein Debuff deiner Waffe, eine Markierung), ist ein Status, kein Merkmal. Merkmale sind permanent und vererben sich an Kinder, was fast nie das ist, was du wolltest :PES2_Uhm:.
