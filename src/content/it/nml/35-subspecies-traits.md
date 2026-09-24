---
title: Tratti delle sottospecie
group: Contenuto di gioco
subgroup: Tratti e genetica
icon: :wbelf:
order: 104
---

# Tratti delle sottospecie :wbelf:

Una **sottospecie** è un ramo di una specie che si è differenziato: più longevo, provvisto di squame, oviparo o bioluminescente. Si diffonde tramite la **riproduzione**, non per insegnamento, ed è l'unico sistema di tratti dotato di sprite propri; ecco perché una sottospecie può apparire totalmente diversa dalla specie madre senza dover essere un actor separato.

| | |
| --- | --- |
| Libreria | `AssetManager.subspecies_traits` |
| Classe | `SubspeciesTrait` |
| Gruppi | `AssetManager.subspecies_trait_groups`, classe `SubspeciesTraitGroupAsset` |
| Proprietario a runtime | `Subspecies`, in `World.world.subspecies` |
| Prefisso di localizzazione | `subspecies_trait_` |
| Cartella icone predefinita | `ui/Icons/subspecies_traits/` |

> [!WARNING] Una sottospecie **sostituisce** le statistiche dell'asset dell'actor
> In `Actor.updateStats()`, un'unità dotata di sottospecie unisce `subspecies.base_stats` e *salta* interamente `asset.base_stats`. È un'alternativa secca, non una somma cumulata.
>
> Di conseguenza, qualsiasi valore impostato su `human` risulterà invisibile a qualunque umano appartenente a una sottospecie, il che in un mondo attivo da un po' corrisponde alla stragrande maggioranza :PES4_IDunnoMan:.

Una sottospecie applica comunque un blocco di statistiche differenziato per maschi e femmine, ma tali valori **non** provengono dai suoi tratti. Derivano dal suo genoma in `AssetManager.gene_library`. Un tratto di sottospecie possiede un unico `base_stats` per chiunque. Se cerchi una distinzione di sesso derivata da un tratto, quello è un tratto di clan, vedi **[Tratti dei clan](#/nml/clan-traits)**.

## Registrarne uno

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
                in_mutation_pot_add = true,       // la mutazione può concederlo
                in_mutation_pot_remove = false,   // la mutazione non può rimuoverlo
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

## Mutazione

È così che un tratto di sottospecie fa la sua comparsa nel mondo senza che tu debba assegnarlo manualmente, che è il modo divertente. La libreria gestisce due riserve, e questi due campi stabiliscono a quali riserve il tuo tratto partecipa:

| Campo | Cosa fa |
| --- | --- |
| `in_mutation_pot_add` | Un evento di mutazione può conferire questo tratto |
| `in_mutation_pot_remove` | Un evento di mutazione può rimuoverlo |
| `spawn_random_trait_allowed` | Se può essere estratto casualmente |
| `rarity` | Probabilità che venga selezionato |

La statistica `mutation` dell'unità governa le probabilità che tutto ciò si verifichi. Vedi **[Riferimento statistiche](#/nml/stats)**.

## Grafica: ciò che nessun altro sistema di tratti possiede

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

// La libreria genera questo asset per le proprie skin in un helper privato.
// Una mod esegue la stessa procedura manualmente:
trait.texture_asset = new ActorTextureSubAsset(trait.sprite_path + "/", pHasAdvancedTextures: true);
trait.texture_asset.prevent_unconscious_rotation = trait.prevent_unconscious_rotation;
trait.texture_asset.render_heads_for_children = trait.render_heads_for_children;
trait.texture_asset.shadow = trait.shadow;
```

| Campo | Cosa fa |
| --- | --- |
| `is_mutation_skin` | Lo contrassegna come sostituzione di skin anziché come tratto ordinario |
| `sprite_path` | La cartella delle sue texture. Nota lo slash finale `/` richiesto dal texture asset |
| `texture_asset` | Il set di texture compilato. Impostalo manualmente come sopra |
| `skin_citizen_male` / `_female` / `skin_warrior` | Varianti d'aspetto per ruolo, selezionate a caso per unità |
| `animation_walk` / `animation_idle` / `animation_swim` | Sostituiscono le animazioni della specie genitrice |
| `shadow`, `shadow_texture`, `shadow_texture_egg`, `shadow_texture_baby` | Ombre per ciascuna fase vitale |
| `render_heads_for_children` | Se per i bambini viene disegnata una testa autonoma |
| `prevent_unconscious_rotation` | Mantiene la postura eretta da privi di sensi (per sfere e masse gelatinose) |
| `remove_for_zombies` | Rimuove la skin se l'unità si trasforma in zombie |
| `priority` | Quale skin prevale se un'unità ne possiede due |

Le mutazioni d'aspetto vanilla (hamburger, roccia vivente, orrore tentacolare, sfera di luce, frattale) sono tutti cloni di `$skin_mutation$`, e clonare quel template è di gran lunga la via più rapida per ottenere una variante funzionante. Sì, burger è una vera mutazione. Maxim agisce in modi misteriosi :wbpray:.

## Fenotipi, dieta e uova

Tre sottosistemi a cui si collegano i tratti delle sottospecie:

| Campo | Cosa fa |
| --- | --- |
| `phenotype_skin`, `id_phenotype` | Collega il tratto a un fenotipo in `AssetManager.phenotype_library` |
| `is_diet_related` | Lo contrassegna come parte della dieta. Da abbinare a un tag stat `diet_*` |
| `id_egg`, `phenotype_egg` | La forma dell'uovo per le sottospecie ovipare |
| `after_hatch_from_egg_action`, `has_after_hatch_from_egg_action` | Codice che viene eseguito alla schiusa dell'uovo |

## Geni

Un gene è il modo in cui un tratto di sottospecie muta in un altro tratto. Il gioco esamina `AssetManager.genes` durante la riproduzione per decidere cosa tramandare: Compiti di biologia, in pratica.

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

Due campi:

- `gene.id_trait` lo collega al tratto di sottospecie che hai registrato.
- `gene.rate` è la probabilità di mutazione, da 0.0 a 1.0.

Senza la chiamata a `_gene_assets_mutations.Add(gene)`, il gene viene registrato ma non entra mai nel calcolo delle mutazioni.

## Tag meta

Diversi tratti di sottospecie vanilla non contengono altro che un tag meta, poiché è esattamente su quel tag che il gioco ramifica le proprie logiche:

```csharp
trait.base_stats_meta.addTag("can_build_in_biome_permafrost");   // la sottospecie può fondare insediamenti lì
trait.base_stats.addTag("walk_adaptation_snow");                 // le sue unità camminano bene sulla neve
```

`base_stats_meta` rimane assegnato alla sottospecie. `base_stats` si riflette sulle sue unità. L'elenco completo dei tag si trova nel **[Riferimento statistiche](#/nml/stats)**.

## I gruppi vanilla

`harmony` · `advanced_brain` · `mind` · `body` · `diet` · `rebirth` · `growth` · `bioproducts` · `chaos` · `talents` · `sleep_cycles` · `hibernation` · `reproduction_strategy` · `reproductive_methods` · `gestation` · `eggs` · `mutations` · `adaptations` · `fate` · `phenotypes` · `special`

Per creare la tua scheda: vedi **[Gruppi di tratti e schede](#/nml/trait-groups)**, con `AssetManager.subspecies_trait_groups` e `SubspeciesTraitGroupAsset`.

## I testi

```json Mods/HelloBox/Locales/en.json
{
  "subspecies_trait_hello_scales": "Scaled",
  "subspecies_trait_hello_scales_info": "Thick, overlapping, and quietly smug about it."
}
```

## Assegnare il tratto

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
if (asset != null) asset.addSubspeciesTrait(HelloSubspecies.SCALES);
```

In questo modo ogni nuova sottospecie originata da quella creatura comincerà con il tratto. Ometterlo e affidarsi a `in_mutation_pot_add` fa sì che compaia spontaneamente prima o poi, il che si rivela solitamente molto più interessante.

> [!TIP] Gli incantesimi trovano qui il loro posto ideale
> Le discendenze magiche vanilla sono tratti di sottospecie che concedono un incantesimo e null'altro: `trait.addSpell("summon_lightning")`. Una sola riga, ereditata dalla prole, e ottieni una vera e propria stirpe di evocatori di fulmini estesa per un intero continente :PES5_CrazyPog:.
