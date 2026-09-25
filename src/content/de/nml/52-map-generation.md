---
title: Kartengenerierung
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbworld:
order: 169
---

# Kartengenerierung :wbworld:

Das Fenster für eine neue Welt liest drei Bibliotheken. `map_sizes` ist der Größenschalter, `map_gen_templates` ist die Reihe der Formkarten (`continent`, `islands`, `donut`...), und `map_gen_settings` sind die Schieberegler und Schalter, die du nach der Kartenauswahl bekommst. Alle drei sind gewöhnliche Asset-Bibliotheken. Nur eine davon ist Plug-and-Play, und ich sage dir, welche Teile UI-Arbeit brauchen, bevor du es auf die harte Tour lernst.

## Eine größere Karte

Eine Größe ist ein `MapSizeAsset`, und das sind vier Felder:

| Feld | Bedeutung |
| --- | --- |
| `id` | Auch der Übersetzungsschlüssel, mit einem Präfix: `map_size_<id>` |
| `size` | Die Seitenlänge der Karte in Blöcken zu 64 Tiles. `iceberg` ist `9`, also 576 x 576 |
| `path_icon` | Das Icon neben dem Größennamen, relativ zu `ui/Icons/` |
| `show_warning` | Tauscht die Begrüßung des Fensters gegen die Warnung "diese Karte ist groß" |

Die Vanilla-Größen: `tiny` 2 · `small` 3 · `standard` 4 · `large` 5 · `huge` 6 · `gigantic` 7 · `titanic` 8 · `iceberg` 9.

```csharp Mods/HelloBox/Code/HelloMapGen.cs
namespace HelloBox
{
    public static class HelloMapGen
    {
        public const string COLOSSAL = "hello_colossal";

        public static void Initialize()
        {
            AddColossal();
            AddRing();
        }

        public const string RING = "hello_ring";

        private static void AddRing()
        {
            if (AssetManager.map_gen_templates.has(RING)) return;

            MapGenTemplate ring = AssetManager.map_gen_templates.clone(RING, "donut");

            // values is a plain object, so the clone shares donut's. give it its own before touching it
            ring.values = new MapGenValues
            {
                gradient_round_edges = true,
                add_center_gradient_land = true,
                add_center_lake = true,
                ring_effect = true,
                perlin_noise_stage_2 = true,
                random_shapes_amount = 3
            };

            // reset copies from a backup table filled at startup, and your id is not in it
            ring.show_reset_button = false;
        }

        public static void OpenRing()
        {
            if (!AssetManager.map_gen_templates.has(RING)) return;

            Config.current_map_template = RING;
            ScrollWindow.showWindow("new_world_templates_2");
        }

        private static void AddColossal()
        {
            if (AssetManager.map_sizes.has(COLOSSAL)) return;

            AssetManager.map_sizes.add(new MapSizeAsset
            {
                id = COLOSSAL,
                size = 10,                   // 10 x 64 = 640 tiles a side
                path_icon = "iconIceberg",   // ui/Icons/ is added for you
                show_warning = true
            });

            // the size switcher reads an array built in linkAssets(), which ran before your mod
            AssetManager.map_sizes.linkAssets();
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "map_size_hello_colossal": "Colossal"
}
```

> [!WARNING] Ohne `linkAssets()` ist die Größe unerreichbar
> Die Pfeile im Fenster durchlaufen nicht die Bibliothek. Sie durchlaufen ein einfaches `string[]`, das `MapSizeLibrary.linkAssets()` einmal beim Start baut, bevor NML dich lädt. Deine Größe ist registriert, und die Pfeile gehen für immer daran vorbei. `linkAssets()` erneut aufzurufen baut nur dieses Array neu, ist also sicher.

Die Pfeile folgen der `list`-Reihenfolge, eine angehängte Größe landet also nach `iceberg`, wohin eine größere Karte auch gehört. Eine kleinere will `list.Remove` und `list.Insert(0, ...)` vor dem `linkAssets()`-Aufruf.

Was ich dir zu den Grenzen sagen kann, aus dem Code:

- **Der Workshop-Upload verweigert sie.** Der Upload prüft die Größe gegen `Config.maxMapSize`, was `iceberg` ist, und weist alles Größere mit "Not a valid world size!" zurück.
- **Ohne deine Mod zeigt die Speicherstandsliste rohe Zahlen.** Der Speicherstand-Browser schlägt die Größe anhand ihrer Zahl nach und weicht auf "Breite x Höhe" aus, wenn nichts passt. Ob so ein Speicherstand ohne deine Mod sauber lädt, habe ich nicht getestet.
- **Wie weit es geht, habe ich nicht getestet.** `10` sind 23 % mehr Tiles als `iceberg`, und jeder Schritt danach kostet mehr. Irgendwo da oben liegt eine Zahl, die die Rechner deiner Spieler nicht mögen werden :PES5_Hmmmm:.

## Eine neue Weltform

Ein Template ist ein `MapGenTemplate`. Das eigentliche Rezept steckt in seinen `values`, der Rest entscheidet, wie es präsentiert wird:

| Feld | Bedeutung |
| --- | --- |
| `values` | Ein `MapGenValues`: die Schalter und Zahlen, die der Generator liest. Siehe unten |
| `path_icon` | Das Vorschaubild, voller Pfad: `ui/new_world_templates_icons/template_donut` |
| `force_height_to` | Setzt jedes Tile nach dem ersten Rauschdurchgang auf diese Höhe, bevor der Rest sie formt. `0` überspringt das |
| `freeze_mountains` | Friert die Berggipfel ein, sobald das Land fertig ist |
| `perlin_replace` | Höhenbasierte Tile-Austausche, wie "über 170 wird `soil_high` zu `soil_low`" |
| `special_anthill`, `special_checkerboard`, `special_cubicles` | Schaltet einen der drei fest codierten Generatoren ein |
| `allow_edit_*` | Welche Einstellungszeilen der Spieler für dieses Template sieht. Siehe nächster Abschnitt |
| `show_reset_button` | Ob das Fenster einen "Zurücksetzen"-Button hat |

Die Vanilla-IDs, allesamt gültige `clone()`-Quellen: `continent` · `box_world` · `islands` · `toast` · `pancake` · `boring_plains` · `checkerboard` · `cubicles` · `dormant_volcano` · `cheese` · `bad_apple` · `donut` · `lasagna` · `chaos_pearl` · `anthill` · `empty`.

Und die `MapGenValues`-Felder, die man kennen sollte:

| Feld | Bedeutung |
| --- | --- |
| `main_perlin_noise_stage`, `perlin_noise_stage_2`, `perlin_noise_stage_3` | Die drei Rauschdurchgänge, die das Land erzeugen |
| `perlin_scale_stage_1` / `_2` / `_3` | Wie gezoomt jeder Durchgang ist. Standardmäßig `5` |
| `gradient_round_edges` / `square_edges` | Blendet die Höhe zum Kartenrand hin aus, kreisförmig oder eckig |
| `add_center_gradient_land`, `add_center_lake`, `center_gradient_mountains` | Drückt Land, einen See oder Berge zur Mitte |
| `ring_effect` | Ein zusätzlicher ringförmiger Rauschdurchgang |
| `add_mountain_edges` / `remove_mountains` | Ein Bergrand um die Karte / flacht Berge zu normalem Boden ab |
| `low_ground` / `high_ground` | Senkt oder hebt den Boden nach den Rauschdurchgängen |
| `random_shapes_amount` | Wie viele zufällige Klumpen obendrauf gestempelt werden |
| `random_biomes`, `add_vegetation`, `add_resources` | Die letzten drei sind standardmäßig `true` |

Das `AddRing()` oben klont ein Vanilla-Template und gibt ihm sein eigenes Rezept. Halte alle drei Methoden in derselben `HelloMapGen`-Klasse.

```json Mods/HelloBox/Locales/en.json
{
  "template_hello_ring": "Ember Ring",
  "template_hello_ring_info": "A lake in the middle, land around it, and nobody asked for it."
}
```

> [!WARNING] Verstecke den Zurücksetzen-Button bei eigenen Templates
> "Zurücksetzen" ruft `resetTemplateValues()` auf, das die Standardwerte des Templates aus einem Dictionary liest, das einmal beim Start mit den Vanilla-IDs gefüllt wird. Deins steht nicht darin, der Button wirft also eine `KeyNotFoundException`. `show_reset_button = false` und das Problem existiert nicht.

> [!WARNING] Ein geklontes Template teilt seine `values`
> `clone()` kopiert Listen in neue Listen, aber `values` ist eine einfache Klasse, wird also per Referenz kopiert (siehe **[Asset-Bibliotheken](#/nml/asset-libraries)**). Änderst du `ring.values.ring_effect` ohne die Zeile `new MapGenValues`, ändert sich jeder Vanilla-Donut mit. Die Einträge innerhalb von `perlin_replace` werden auf dieselbe Weise geteilt: baue neue statt sie zu bearbeiten.

### Der Haken: es gibt keine Karte

Der Template-Auswähler ist ein Prefab. Er hat einen Button pro Vanilla-Template, und jeder Button findet sein Template über den eigenen GameObject-Namen. Ein neues Template bekommt keinen Button, und nichts in der Bibliothek ändert das.

Was funktioniert, ist die Aufgabe des Buttons selbst zu übernehmen: das Template setzen, dann das zweite Fenster öffnen, genau wie es eine Vanilla-Karte tut.

Rufe `HelloMapGen.OpenRing()` von deinem Button aus auf.

Häng das an einen einfachen Button, siehe **[Power-Tabs & Buttons](#/nml/power-buttons)**, und der Spieler bekommt deine Vorschau, deine Einstellungszeilen, die Größenpfeile und den Generieren-Button, wie bei jedem Vanilla-Template. Eine echte Karte in den Auswähler einzubauen bedeutet, einen ihrer Buttons zu klonen und den Klon umzubenennen, bevor sein `Awake()` läuft, denn dann liest es seinen Namen. Das ist UI-Chirurgie, die ich nicht überprüft habe, sie steht also nicht auf dieser Seite.

> [!NOTE] Stattdessen ein Vanilla-Template bearbeiten
> `AssetManager.map_gen_templates.get("islands").values.random_shapes_amount = 10;` funktioniert und braucht überhaupt keinen Button. Wisse nur, dass "Zurücksetzen" die Startup-Kopie wiederherstellt, die genommen wurde, bevor deine Mod geladen hat. Ein Klick und deine Änderung ist bis zum nächsten Neustart weg.

## Die Zeilen unter einem Template

Jeder Schieberegler und Schalter im zweiten Fenster ist ein `MapGenSettingsAsset`:

| Feld | Bedeutung |
| --- | --- |
| `is_switch` | An/Aus statt einer Zahl |
| `min_value` / `max_value` | Der Bereich, für eine Zahl |
| `allowed_check` | Ob diese Zeile für das aktuelle Template angezeigt wird |
| `action_get` / `action_set` | Liest und schreibt den Wert, meist auf den `values` des aktuellen Templates |
| `increase` / `decrease` / `action_switch` | Was die Pfeile und der Schalter tun |

Die Vanilla-Zeilen: `gen_perlin_scale_stage_1` · `gen_perlin_scale_stage_2` · `gen_perlin_scale_stage_3` · `gen_random_shapes` · `gen_cubicles_sizes` · `gen_random_biomes` · `gen_mountain_edges` · `gen_add_vegetation` · `gen_add_resources` · `gen_add_center_lake` · `gen_add_center_land` · `gen_round_edges` · `gen_square_edges` · `gen_ring_effect` · `gen_low_ground` · `gen_high_ground` · `gen_remove_mountains` · `gen_forbidden_knowledge`.

Der Teil, den eine Mod tatsächlich nutzt: `allowed_check` jeder Vanilla-Zeile liest eines der `allow_edit_*`-Flags deines Templates. Du fügst also keine Zeilen hinzu, du wählst, welche davon der Spieler bekommt:

```csharp
// in AddRing(), after the clone: hide everything, then give back the rows that make sense for a ring
AssetManager.map_gen_templates.disableNormalSettings(ring);
ring.allow_edit_random_biomes = true;
ring.allow_edit_random_vegetation = true;
```

Kuriose Kleinigkeit: Alle drei Perlin-Schieberegler prüfen `allow_edit_perlin_scale_stage_1`. Die Flags `_2` und `_3` existieren und nichts liest sie :PES2_Shrug:.

Ein neues `MapGenSettingsAsset` für sich zeigt nichts. Die Zeilen sind ins Prefab des Fensters eingebacken und finden ihr Asset über den GameObject-Namen, derselbe Trick wie bei den Template-Karten. Eine eigene Zeile bedeutet, eine bestehende innerhalb des Fensters zu klonen, und was du registrierst, muss `allowed_check` gesetzt haben, weil das Fenster es bei jeder Zeile ohne Null-Prüfung aufruft.

> [!TIP] Bei der Form anfangen, nicht bei den Einstellungen
> Neun von zehn Mal willst du ein Template mit anderen `values` und einen Button, der es öffnet. Das braucht keine Prefab-Eingriffe. Prüf die Felder nach jedem Spiel-Update erneut. Sobald das Land richtig aussieht, entscheidet **[Biome](#/nml/biomes)**, was darauf wächst :PES2_Wise:.
