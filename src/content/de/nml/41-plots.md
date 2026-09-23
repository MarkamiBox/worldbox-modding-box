---
title: Pläne & Intrigen
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbrebellion:
order: 180
---

# Pläne & Intrigen :wbrebellion:

Ein **Plan** (Plot) ist ein Vorhaben, das ein Herrscher beginnt, finanziert und über einige Zeit hinweg vorantreibt: eine Rebellion, ein neuer Krieg, eine Allianz. Sobald der Fortschrittsbalken voll ist, wird dein Code ausgeführt. Alles zwischen „jemand könnte“ und „jemand hat es getan“ übernimmt die spielinterne Mechanik – und genau das ist der Grund, sie zu nutzen: Der Spieler sieht dein Vorhaben in der Liste der Pläne samt Urheber, Fortschritt und Banner, völlig kostenlos.

## Einen Plan hinzufügen

```csharp Mods/HelloBox/Code/HelloPlots.cs
namespace HelloBox
{
    public static class HelloPlots
    {
        public const string FESTIVAL = "hello_ember_festival";

        public static void Initialize()
        {
            if (AssetManager.plots_library.has(FESTIVAL)) return;

            PlotAsset festival = new PlotAsset
            {
                id = FESTIVAL,
                path_icon = "ui/Icons/iconHelloDrop",
                group_id = "culture",
                is_basic_plot = true,            // any leader may try it, no religion needed
                pot_rate = 2,                    // weight against the other plots
                min_level = 1,
                money_cost = 10,
                progress_needed = 40f,
                can_be_done_by_king = true,
                can_be_done_by_leader = true,
                needs_to_be_explored = false,

                // called with no null check: a plot without it crashes the first time anyone looks at it
                check_is_possible = (Actor pActor) => pActor.hasCity() && !pActor.city.isInDanger(),
                check_should_continue = (Actor pActor) => pActor.hasCity(),

                // runs once, when the progress bar is full
                action = (Actor pActor) =>
                {
                    City city = pActor.city;
                    if (city == null) return false;

                    foreach (Actor unit in city.units)
                    {
                        if (unit != null && unit.isAlive()) unit.changeHappiness(HelloPolitics.WARM);
                    }

                    WorldTile tile = pActor.current_tile;
                    if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                    return true;
                }
            };

            AssetManager.plots_library.add(festival);

            // linkAssets() sorted the basic plots into their own list at startup,
            // and that list is the only one leaders pick from
            AssetManager.plots_library.basic_plots.Add(festival);
        }
    }
}
```

Ein Anführer mit zehn Goldmünzen, einer Stadt und etwas Freizeit kann nun ein Glut-Festival veranstalten. Nach Abschluss heitert sich die Stimmung aller Bürger mit dem Zufriedenheits-Event aus **[Königreiche & Fraktionen](#/nml/kingdoms)** auf, und auf den Organisator regnet es Glut – denn das hier ist immer noch HelloBox.

> [!WARNING] `check_is_possible` ist nicht optional
> `PlotAsset.checkIsPossible()` ruft dieses Delegat ohne Null-Prüfung auf, jedes Mal wenn ein Herrscher deinen Plan in Erwägung zieht. Lässt du es weg, wirft der erste Herrscher, der ihn prüft, eine `NullReferenceException`. Wenn du keine Bedingung hast, gib einfach `true` zurück.

> [!WARNING] Die Standardliste wird beim Start erstellt
> Herrscher wählen ausschließlich aus `plots_library.basic_plots` (plus den Riten ihrer Religion). `linkAssets()` füllt diese Liste beim Spielstart mit allen Plänen, die als `is_basic_plot` markiert sind – noch bevor deine Mod lädt. Das Flag allein reicht daher nicht: Füge den Plan selbst zur Liste hinzu.

## Die Felder

### Wer den Plan starten darf

| Feld | Funktion |
| --- | --- |
| `can_be_done_by_king` / `can_be_done_by_leader` / `can_be_done_by_clan_member` | Erlaubte Rollen. Ist keines gesetzt, kann niemand den Plan starten |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | Schwellenwerte für den Initiator |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | Stat-Schwellenwerte. Standardwert ist 2 |
| `money_cost` | Kosten beim Start, sofern der Plan nicht vom Spieler erzwungen wurde |
| `requires_diplomacy` / `requires_rebellion` | Nur aktiv, solange dieses Weltgesetz eingeschaltet ist |
| `check_is_possible` | Deine Startbedingung. Zwingend erforderlich |

### Wie der Plan abläuft

| Feld | Funktion |
| --- | --- |
| `progress_needed` | Benötigter Arbeitsaufwand bis zur Ausführung |
| `check_should_continue` | Wird während des Fortschritts geprüft. `false` bricht den Plan ab |
| `action` | Wird ausgeführt, wenn der Balken voll ist. Gibt `true` zurück, falls erfolgreich |
| `post_action` | Läuft nach einer erfolgreichen `action` |
| `try_to_start_advanced` | Ersetzt den Standardstart für Pläne mit Ziel: Vanilla-Rebellionen setzen hier `target_kingdom` |
| `check_target_actor`, `check_target_city`, `check_target_kingdom`... | Prüft, ob das Ziel des Plans noch am Leben ist |

### Wie der Plan aussieht

| Feld | Funktion |
| --- | --- |
| `path_icon` | Das Icon in der Planliste und auf dem Banner |
| `group_id` | Die Kategorie: `diplomacy`, `culture`, `rites_wrathful`, `rites_summoning`, `rites_merciful` |
| `pot_rate` | Gewichtung gegenüber anderen möglichen Plänen |
| `is_basic_plot` | Jeder Anführer darf ihn versuchen. Andernfalls tritt er nur als Religionsritus auf, siehe **[Religionsmerkmale](#/nml/religion-traits)** |

## Die Texte

Ein Plan besitzt drei Textschlüssel: seinen Namen, die Beschreibung während des Laufs und die allgemeine Beschreibung. In der zweiten Zeile werden `$initiator_actor$`, `$initiator_city$`, `$initiator_kingdom$` und `$target_kingdom$` automatisch eingesetzt.

```json Mods/HelloBox/Locales/en.json
{
  "plot_hello_ember_festival": "Ember Festival",
  "plot_hello_ember_festival_info": "$initiator_actor$ is organising an ember festival in $initiator_city$.",
  "plot_hello_ember_festival_info_base": "A city celebrates, and something falls from the sky."
}
```

> [!TIP] Testen durch Erzwingen
> Darauf zu warten, dass ein Herrscher von selbst deinen Plan wählt, kann dauern. Wähle eine Einheit aus und starte den Plan manuell über das Pläne-Menü in ihrem Fenster: Die Einheit benötigt zwar weiterhin eine der erlaubten Rollen und `check_can_be_forced` (optional) entscheidet, ob der Button aktiv ist, aber ein erzwungener Plan kostet kein Geld. Das ist der schnellste Weg, deine `action` in Aktion zu sehen :PES2_EvilPlan:.
