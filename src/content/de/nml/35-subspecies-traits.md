---
title: Unterarten-Eigenschaften
group: Spielinhalte
subgroup: Eigenschaften & Genetik
icon: :wbelf:
order: 104
---

# Unterarten-Eigenschaften :wbelf:

Eine **Unterart** ist ein evolutionär abgedrifteter Zweig einer Spezies: langlebiger, geschuppt, eierlegend, im Dunkeln leuchtend. Sie verbreitet sich über **Fortpflanzung**, nicht über Erziehung oder Bildung, und sie ist das einzige Eigenschaftssystem, das eigene Sprites mitbringt. Aus diesem Grund kann eine Unterart visuell völlig anders aussehen als ihre Ursprungsspezies, ohne ein eigenständiger Actor sein zu müssen.

| | |
| --- | --- |
| Bibliothek | `AssetManager.subspecies_traits` |
| Klasse | `SubspeciesTrait` |
| Gruppen | `AssetManager.subspecies_trait_groups`, Klasse `SubspeciesTraitGroupAsset` |
| Besitzer zur Laufzeit | `Subspecies`, in `World.world.subspecies` |
| Lokalisierungs-Präfix | `subspecies_trait_` |
| Standard-Icon-Ordner | `ui/Icons/subspecies_traits/` |

> [!WARNING] Eine Unterart **ersetzt** die Stats des Actor-Assets
> In `Actor.updateStats()` verschmilzt eine Einheit mit Unterart die Werte von `subspecies.base_stats` und *überspringt* `asset.base_stats` vollständig. Es ist ein Entweder-oder, kein additiver Stapel.
>
> Jeder Wert, den du auf `human` konfigurierst, ist für jeden Menschen mit einer Unterart völlig unsichtbar – und in einer Welt, die eine Weile läuft, sind das die allermeisten :PES4_IDunnoMan:.

Eine Unterart wendet darüber hinaus zwar separate männliche und weibliche Werteblöcke an, diese stammen jedoch **nicht** aus ihren Eigenschaften. Sie stammen aus ihrem Genom in `AssetManager.gene_library`. Eine Unterarten-Eigenschaft besitzt ein einziges `base_stats` für alle. Wenn du eine Geschlechtertrennung aus einer Eigenschaft willst, ist das eine Clan-Eigenschaft, siehe **[Clan-Eigenschaften](#/nml/clan-traits)**.

## Eine registrieren

```csharp Mods/HelloBox/Code/HelloSubspecies.cs
namespace HelloBox
{
    public static class HelloSubspecies
    {
        public const string SCALES = "hello_scales";

        public static void Initialize()
        {
            if (AssetManager.subspecies_traits.has(SCALES)) return;

            SubspeciesTrait trait = new SubspeciesTrait
            {
                id = SCALES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloSubspecies",
                in_mutation_pot_add = true,       // Mutation kann es vergeben
                in_mutation_pot_remove = false,   // Mutation kann es nicht wieder entfernen
                spawn_random_trait_allowed = true,
                rarity = Rarity.R1_Rare
            };

            AssetManager.subspecies_traits.add(trait);

            trait.base_stats["armor"] = 5;
            trait.base_stats.addTag("immunity_fire");
        }
    }
}
```

## Mutation

Auf diesem Weg gelangt eine Unterarten-Eigenschaft in eine Welt, ohne dass du sie manuell verteilen musst, und das ist der spaßige Weg. Die Bibliothek verwaltet zwei Töpfe, und diese beiden Felder bestimmen, welchen Töpfen deine Eigenschaft beitritt:

| Feld | Funktion |
| --- | --- |
| `in_mutation_pot_add` | Ein Mutationsereignis kann diese Eigenschaft gewähren |
| `in_mutation_pot_remove` | Ein Mutationsereignis kann sie wieder entziehen |
| `spawn_random_trait_allowed` | Ob sie überhaupt zufällig ausgewürfelt werden darf |
| `rarity` | Wie hoch die Wahrscheinlichkeit bei der Auswahl ist |

Der `mutation`-Statuswert einer Einheit entscheidet über die Chance auf solche Ereignisse. Siehe **[Stats-Referenz](#/nml/stats)**.

## Grafik: Was kein anderes Eigenschaftssystem bietet

```csharp
trait.is_mutation_skin = true;
trait.sprite_path = "actors/species/mutations/hello_scales";
trait.animation_walk = ActorAnimationSequences.walk_0_3;
trait.animation_idle = ActorAnimationSequences.walk_0_3;
trait.animation_swim = ActorAnimationSequences.swim_0_3;
trait.skin_citizen_male = new List<string> { "male_1" };
trait.skin_citizen_female = new List<string> { "female_1" };
trait.skin_warrior = new List<string> { "warrior_1" };
trait.render_heads_for_children = true;

// Die Bibliothek baut dies für eigene Skins in einer privaten Hilfsmethode.
// Eine Mod erledigt dasselbe manuell:
trait.texture_asset = new ActorTextureSubAsset(trait.sprite_path + "/", pHasAdvancedTextures: true);
trait.texture_asset.prevent_unconscious_rotation = trait.prevent_unconscious_rotation;
trait.texture_asset.render_heads_for_children = trait.render_heads_for_children;
trait.texture_asset.shadow = trait.shadow;
```

| Feld | Funktion |
| --- | --- |
| `is_mutation_skin` | Kennzeichnet die Eigenschaft als Skin-Ersatz statt als bloße Eigenschaft |
| `sprite_path` | Ordner der Texturen. Beachte den abschließenden `/`, den das Textur-Asset benötigt |
| `texture_asset` | Das aufgebaute Textur-Set. Wie oben manuell setzen |
| `skin_citizen_male` / `_female` / `skin_warrior` | Skin-Varianten pro Rolle, zufällig pro Einheit gewählt |
| `animation_walk` / `animation_idle` / `animation_swim` | Überschreibt die Animationen der Elternspezies |
| `shadow`, `shadow_texture`, `shadow_texture_egg`, `shadow_texture_baby` | Schatten je nach Lebensphase |
| `render_heads_for_children` | Ob für Kinder Köpfe gezeichnet werden |
| `prevent_unconscious_rotation` | Bei Bewusstlosigkeit aufrecht halten. Für Kugeln und Blobs |
| `remove_for_zombies` | Den Skin entfernen, sobald die Einheit zum Zombie wird |
| `priority` | Welcher Skin Vorrang hat, wenn eine Einheit zwei besitzt |

Vanilla-Hautmutationen (Burger, Lebender Fels, Tentakelhorror, Lichtkugel, Fraktal) sind Klone von `$skin_mutation$`, und das Klonen dieser Vorlage ist mit Abstand der kürzeste Weg zu einer funktionierenden Mutation. Ja, Burger ist eine echte Mutation. Maxims Wege sind unergründlich :wbpray:.

## Phänotypen, Ernährung und Eier

Drei kleinere Systeme, an die Unterarten-Eigenschaften anknüpfen:

| Feld | Funktion |
| --- | --- |
| `phenotype_skin`, `id_phenotype` | Bindet die Eigenschaft an einen Phänotyp in `AssetManager.phenotype_library` |
| `is_diet_related` | Markiert sie als Teil des Ernährungssystems. Mit einem `diet_*`-Stat-Tag koppeln |
| `id_egg`, `phenotype_egg` | Die Eiform bei eierlegenden Unterarten |
| `after_hatch_from_egg_action`, `has_after_hatch_from_egg_action` | Code, der beim Schlüpfen ausgeführt wird |

## Gene

Ein Gen ist die Art und Weise, wie eine Unterarten-Eigenschaft zu einer anderen Eigenschaft mutiert. Das Spiel durchläuft bei der Fortpflanzung `AssetManager.genes`, um zu entscheiden, was weitergegeben wird: Biologie-Hausaufgaben, im Grunde.

```csharp Mods/HelloBox/Code/HelloGenes.cs
namespace HelloBox
{
    public static class HelloGenes
    {
        public static void Initialize()
        {
            GeneAsset gene = new GeneAsset
            {
                id = "hello_swift_gene",
                id_trait = HelloSubspecies.SWIFT,
                rate = 0.05f
            };
            AssetManager.genes.add(gene);
            AssetManager.genes._gene_assets_mutations.Add(gene);
        }
    }
}
```

Zwei Felder:

- `gene.id_trait` verknüpft es mit der von dir registrierten Unterarten-Eigenschaft.
- `gene.rate` ist die Mutationschance, 0.0 bis 1.0.

Ohne den Aufruf von `_gene_assets_mutations.Add(gene)` wird das Gen zwar registriert, gelangt aber nie in den Mutationswurf.

## Meta-Tags

Mehrere Unterarten-Eigenschaften von Vanilla tragen nichts außer einem Tag, weil das Spiel genau an diesem Tag seine Verzweigungen vornimmt:

```csharp
trait.base_stats_meta.addTag("can_build_in_biome_permafrost");   // Die Unterart kann dort siedeln
trait.base_stats.addTag("walk_adaptation_snow");                 // Ihre Einheiten bewegen sich gut auf Schnee
```

`base_stats_meta` verbleibt auf der Unterart. `base_stats` überträgt sich auf ihre Einheiten. Die vollständige Tag-Liste findest du in der **[Stats-Referenz](#/nml/stats)**.

## Die Vanilla-Gruppen

`harmony` · `advanced_brain` · `mind` · `body` · `diet` · `rebirth` · `growth` · `bioproducts` · `chaos` · `talents` · `sleep_cycles` · `hibernation` · `reproduction_strategy` · `reproductive_methods` · `gestation` · `eggs` · `mutations` · `adaptations` · `fate` · `phenotypes` · `special`

Dein eigener Tab: siehe **[Eigenschafts-Gruppen & Tabs](#/nml/trait-groups)** mit `AssetManager.subspecies_trait_groups` und `SubspeciesTraitGroupAsset`.

## Die Texte

```json Mods/HelloBox/Locales/en.json
{
  "subspecies_trait_hello_scales": "Scaled",
  "subspecies_trait_hello_scales_info": "Thick, overlapping, and quietly smug about it."
}
```

## Die Eigenschaft verteilen

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
if (asset != null) asset.addSubspeciesTrait(HelloSubspecies.SCALES);
```

Damit startet jede neu entstehende Unterart dieser Kreatur mit der Eigenschaft. Lässt man das weg und verlässt sich stattdessen auf `in_mutation_pot_add`, taucht sie irgendwann irgendwo von selbst auf – was meist die wesentlich spannendere Variante ist.

> [!TIP] Zauber fühlen sich hier zu Hause
> Die magischen Blutlinien von Vanilla sind Unterarten-Eigenschaften, die einen Zauber gewähren und sonst gar nichts: `trait.addSpell("summon_lightning")`. Eine einzige Zeile, an Kinder weitervererbt, und schon hast du eine sichtbare Abstammungslinie von Blitzrufern über einen ganzen Kontinent :PES5_CrazyPog:.
