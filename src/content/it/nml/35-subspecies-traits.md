---
title: Tratti delle sottospecie
group: Contenuto di gioco
subgroup: Tratti e genetica
icon: :wbelf:
order: 104
---

# Tratti delle sottospecie :wbelf:

Una **sottospecie** (subspecies) è un ramo di una specie che si è differenziato: più longevo, provvisto di squame, oviparo o bioluminescente. Si diffonde tramite la **riproduzione**, non per insegnamento, ed è l'unico sistema di tratti (trait) dotato di sprite propri; ecco perché una sottospecie può apparire totalmente diversa dalla specie madre senza dover essere un actor separato.

| | |
| --- | --- |
| Libreria (library) | `AssetManager.subspecies_traits` |
| Classe | `SubspeciesTrait` |
| Gruppi | `AssetManager.subspecies_trait_groups`, classe `SubspeciesTraitGroupAsset` |
| Proprietario a runtime | `Subspecies`, in `World.world.subspecies` |
| Prefisso di localizzazione | `subspecies_trait_` |
| Cartella icone predefinita | `ui/Icons/subspecies_traits/` |

> [!WARNING] Una sottospecie **sostituisce** le statistiche (stats) dell'asset dell'actor
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

> [!WARNING] La riserva viene letta una sola volta, all'avvio
> Impostare `spawn_random_trait_allowed = true` da solo non basta. `BaseTraitLibrary.linkAssets()` costruisce la vera riserva, `_pot_allowed_to_be_given_randomly`, mentre il gioco carica, prima che la tua mod esista. Un tratto registrato dopo non ci finisce mai, e nessuna mutazione lo estrae mai. Aggiungilo tu, con lo stesso peso che usa vanilla:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.subspecies_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` è `protected`, quindi questo compila con l'assembly pubblicizzato con cui NML compila già la tua mod. `spawn_random_rate` vale `5` di default: alzalo e il tratto compare più spesso.

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

I blocchi di statistiche maschili e femminili citati all'inizio vengono dal **genoma** della sottospecie: cromosomi con degli slot, e un gene in ciascuno. Un gene è un `BaseTrait`, quindi si registra come ogni altro tratto di questo sito, con due compiti in più. Compiti di biologia, in pratica.

```csharp Mods/HelloBox/Code/HelloGenes.cs
namespace HelloBox
{
    public static class HelloGenes
    {
        public const string EMBER_BLOOD = "hello_ember_blood";

        public static void Initialize()
        {
            if (AssetManager.gene_library.has(EMBER_BLOOD)) return;

            GeneAsset gene = new GeneAsset
            {
                id = EMBER_BLOOD,
                path_icon = "ui/Icons/iconHelloGene",
                needs_to_be_explored = false
            };

            AssetManager.gene_library.add(gene);
            gene.base_stats["damage"] = 2f;

            // Each world rolls every gene's DNA letters from its life seed when it loads.
            // A world may already be open, so roll yours now the same way.
            if (World.world != null && World.world.map_stats != null)
            {
                gene.generateDNA(World.world.map_stats.life_dna + gene.getIndexID());
            }

            // linkAssets() filled the mutation pool at startup. Without this, only the
            // player's gene editor can ever place it.
            AssetManager.gene_library._gene_assets_mutations.Add(gene);
        }
    }
}
```

- **Le lettere del DNA.** Ogni gene mostra un breve codice `ACGT`, estratto per mondo dal suo seme vitale quando il mondo si carica. Il tuo gene non c'era per quell'estrazione, quindi estrae il suo allo stesso modo.
- **Il pool delle mutazioni.** Le mutazioni pescano da `_gene_assets_mutations`, una lista privata che `linkAssets()` ha riempito all'avvio. Un assembly **pubblicizzato** ti permette di aggiungerci qualcosa, e NML compila con uno di questi. Saltalo e il gene compare solo dove il giocatore lo mette a mano.

La chiave di testo di un gene è `gene_<id>`. I geni non hanno una riga di descrizione: `GeneLibrary.add()` la disattiva.

```json Mods/HelloBox/Locales/en.json
{
  "gene_hello_ember_blood": "Ember Blood"
}
```

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

Così ogni nuova sottospecie di quella creatura parte con il tratto. Se lo ometti e ti affidi invece a `in_mutation_pot_add`, compare da solo, da qualche parte, prima o poi, che di solito è la versione più interessante.

> [!TIP] Gli incantesimi (spell) stanno bene qui
> Le stirpi magiche vanilla sono tratti di sottospecie che concedono un incantesimo e nient'altro: `trait.addSpell("summon_lightning")`, poi `trait.linkSpells()` perché la libreria ha risolto gli id degli incantesimi all'avvio. Due righe, ereditate dai figli, e si ottiene una stirpe visibile di evocatori di tempeste attraverso un intero continente :PES5_CrazyPog:.
