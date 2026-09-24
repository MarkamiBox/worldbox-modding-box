---
title: Attori personalizzati
group: Contenuto di gioco
subgroup: Attori, edifici e IA
icon: :wbhuman:
order: 140
---

# Attori personalizzati :wbhuman:

> [!NOTE] Si chiamano attori, non razze
> Il gioco definisce ogni creatura vivente come un **attore** (actor): un umano, un lupo, un drago, uno zombie, un granchio. Provengono tutti dalla stessa classe, `ActorAsset`, e risiedono in `AssetManager.actor_library`. "Razza" è il vecchio termine. L'unico posto in cui sopravvive è una proprietà `race` marcata con `[Obsolete("use .original_actor_asset instead")]`, che esiste solo per consentire il caricamento di salvataggi preistorici. Scrivi `actor` ovunque.

Una nuova creatura è la mod che tutti vogliono creare e che quasi nessuno porta a termine, poiché un `ActorAsset` porta con sé animazioni, texture, effetti sonori, tassonomia, dieta, flag di IA, genoma, cultura e statistiche. Sbagliare anche solo uno di questi aspetti ti consegnerà un'unità invisibile immobile in mezzo all'oceano :PES4_Invisible:.

La buona notizia: nemmeno il gioco originale crea le creature da zero. Ecco letteralmente come vanilla dà vita a un elfo:

```csharp
clone("elf", "$civ_advanced_unit$");
```

Faremo dunque esattamente lo stesso.

## I template

Gli identificatori racchiusi tra `$` sono **template**: attori parzialmente definiti che il gioco conserva al solo scopo di fungere da base per clonazioni. Rappresentano il punto di partenza ideale per una nuova creatura, poiché includono tutti i cablaggi interni senza trascinarsi dietro gli sprite di un umano.

| Template | Clona per |
| --- | --- |
| `$basic_unit$` | Il minimo indispensabile per un essere vivente |
| `$animal$` | Un animale selvatico |
| `$mob$` | Un mostro ostile |
| `$civ_unit$` | Una creatura civilizzata di base |
| `$civ_advanced_unit$` | Una creatura con civiltà completa: città, regni, cultura, religione. Ciò che usano umani, elfi, orchi e nani |

Puoi anche clonare un attore già finito - `human`, `wolf`, `zombie` - e questo è il percorso più semplice per la tua prima creatura, perché gli sprite dell'attore donatore sono inclusi e la tua creatura sarà visibile all'istante.

## Un singolo attore

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
> [!WARNING] Carica tu l'ombra, o il gioco si lamenterà di ogni attore
> `ActorAssetLibrary` scorre la sua lista all'avvio e chiama `loadShadow()` su ogni attore, che legge lo sprite in `shadows/<shadow_texture>` e lo misura. Questo è successo prima che la tua mod registrasse qualcosa, quindi l'ombra del tuo attore resta `(0.00, 0.00)` e il gioco registra un errore di asset, tre volte, una per l'adulto, l'uovo e il cucciolo :wbfacepalm:.
>
> `loadShadow()` è `internal`, quindi serve un `Assembly-CSharp.dll` **pubblicizzato** come nel resto della guida. Se non ce l'hai, imposta invece `asset.shadow = false;`: niente ombra, ma nemmeno errori.

> [!WARNING] `clone()` registra già
> `AssetManager.<library>.clone(newId, sourceId)` chiama `add()` al suo interno. Tutte le librerie funzionano così. Chiamare tu `add()` dopo è una registrazione doppia: la libreria rimuove la prima copia, scrive un errore e la riaggiunge. Innocuo, ma è rumore nel log che rende più difficile trovare gli errori veri, ed è la prima cosa che noterà chi rivede il codice.
>
> Il rovescio della medaglia è la buona notizia: **dopo un clone, `base_stats` esiste già**, quindi la regola "statistiche dopo add" di **[Tratti personalizzati](#/nml/custom-traits)** è già rispettata.

## Diversi attori contemporaneamente

La maggior parte delle mod di creature non si ferma a una sola entità. Tre folletti significano tre asset, e nel momento in cui duplichi il blocco precedente tre volte, avrai tre punti distinti in cui dover correggere ogni singolo bug.

Raccogli le differenze in una struttura e il codice in un ciclo:

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

Aggiungere una quarta creatura richiede ora una singola riga nella tabella. Questo è l'assetto con cui viene distribuita la quasi totalità delle mod di creature, e conviene impostarlo così fin dalla seconda creatura in poi :PESgn_ThisTBH:.

## I campi che definiscono cosa *è* la tua creatura

Il primo giorno ne contano solo tre: `civ`, `actor_size` e `name_locale`. Il resto può aspettare finché la tua creatura non è visibile e cammina.

| Campo | Cosa fa |
| --- | --- |
| `civ` | Creatura con civiltà: città, regni, mansioni, guerra. `false` = animale |
| `auto_civ` | Se il gioco avvia la loro civilizzazione autonomamente |
| `default_animal` | Lo contrassegna come fauna selvatica per i controlli interni del gioco |
| `unit_other` | Né civiltà né animale: mostro ostile, costrutto, entità speciale |
| `actor_size` | `S0_Bug` … `S13_Human` … `S17_Dragon`. Influenza resa grafica e calcoli di scontro |
| `name_locale` | Chiave per il nome a schermo |
| `icon` | Icona usata negli elenchi e nei pulsanti di generazione |
| `color_hex` | Tinta applicata alle unità colorabili |
| `can_have_subspecies` | Se mutano in sottospecie nel corso delle generazioni |
| `has_ai_system` | Se eseguono il sistema di comportamento generale |
| `flying` / `hovering` | Se si sollevano dal suolo e a quale altezza |
| `force_ocean_creature` / `force_land_creature` | Vincola rigidamente il tipo di terreno abitabile |
| `can_attack_buildings` | Se possono colpire e demolire strutture |
| `has_soul`, `can_receive_traits`, `can_be_cloned` | Azioni consentite ai poteri divini su di esse |
| `kingdom_id_wild` / `kingdom_id_civilization` | Regno di appartenenza (nomadi o insediati) |
| `texture_atlas` | `UnitTextureAtlasID.Units`, `Boats`, `Zombies` … foglio da cui derivano gli sprite |
| `animation_walk` / `animation_idle` / `animation_swim` | Sequenze di fotogrammi con relativo campo `_speed` |
| `sound_idle`, `sound_spawn`, `sound_death`, `sound_attack`, `sound_hit` | Percorsi di eventi sonori FMOD |
| `name_taxonomic_*` | Regno, phylum, classe, ordine, famiglia, genere, specie per l'enciclopedia |
| `collective_term` | Nome collettivo ("un **branco** di lupi") |
| `allowed_status_tiers` | Quali livelli di effetti di stato possono essere applicati |
| `production` | Cosa producono i loro insediamenti |
| `zombie_id_internal`, `skeleton_id`, `mush_id`, `tumor_id` | In cosa si trasformano alla morte |

## Integrare una creatura di civiltà nel mondo

Un attore `civ` non è finito solo perché hai definito le sue statistiche. Questi sono gli elementi che vanilla compila per ogni creatura giocabile, e tralasciarli è il motivo per cui una civiltà personalizzata "non fa assolutamente nulla":

```csharp
asset.kingdom_id_wild = "nomads_human";          // prima della sosta stanziale
asset.kingdom_id_civilization = "human";         // la loro tipologia di regno
asset.banner_id = "human";                       // generatore di stendardi
asset.architecture_id = "human";                 // stile dei loro edifici
asset.build_order_template_id = "build_order_advanced";
asset.name_template_sets = new string[] { "human_default_set" };   // generazione dei nomi
asset.civ_base_cities = 3;
asset.family_limit = 20;

asset.addPreferredColors("teal", "lime");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// Genoma: distribuzione di tratti ereditari per accoppiamento e mutazione.
asset.addGenome(
    ("health", 70f), ("stamina", 200f), ("lifespan", 500f),
    ("damage", 10f), ("speed", 20f), ("offspring", 2f),
    ("intelligence", 6f), ("diplomacy", 5f), ("warfare", 2f), ("stewardship", 2f));

// Tratti iniziali per ciascun sistema di tratti.
asset.addCultureTrait("bow_lovers");
asset.addReligionTrait("rite_of_change");
asset.addSubspeciesTrait("long_lifespan");
asset.addClanTrait("blood_pact");
asset.addLanguageTrait("melodic");
asset.addKingdomTrait("tax_rate_local_low");
```

Riutilizza i `banner_id` e `architecture_id` di vanilla finché non crei risorse grafiche proprietarie. Una creatura senza architettura non costruirà nulla.

## Generarne uno

```csharp
Actor actor = World.world.units.spawnNewUnit("hello_sprite", tile, pSpawnSound: true, pAdultAge: true);
```

`spawnNewUnit` è pubblico e accetta argomenti opzionali per audio di comparsa, miracolo, altitudine di generazione, una sottospecie mirata e se assegnare equipaggiamento iniziale.

Assegna al giocatore un pulsante di potere divino e otterrai un generatore a tutti gli effetti. Vedi **[Schede e pulsanti di potere](#/nml/power-buttons)**.

## Sottospecie

Le sottospecie sono le varianti in cui un attore evolve e si differenzia nel corso delle generazioni. Hanno una propria libreria di tratti, distinta dai tratti degli attori, e una propria gestione di categorie:

```csharp
SubspeciesTrait scales = new SubspeciesTrait
{
    id = "hello_scales",
    group_id = "body",
    spawn_random_trait_allowed = true
};
AssetManager.subspecies_traits.add(scales);
scales.base_stats["armor"] = 5;

// assegnalo in partenza al tuo attore
asset.addSubspeciesTrait("hello_scales");
```

I tratti di sottospecie possono anche veicolare **grafica**: `sprite_path`, `animation_walk`, `skin_citizen_male`, `skin_warrior` e affini, consentendo a una sottospecie di apparire visivamente diversa dalla specie d'origine senza dover configurare un attore separato. Vedi **[Tratti di sottospecie](#/nml/subspecies-traits)**.

## La tua icona personale

Prima di affrontare l'impegnativo lavoro di animazione sottostante, la parte semplice: l'icona negli elenchi e nei pulsanti di generazione.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSprites.png
```

```csharp
sprite.icon = "iconHelloSprites";
```

La resa grafica del **corpo** della creatura è un'altra questione e costituisce l'argomento della parte finale di questa guida.

## Gli sprite sono la parte difficile

Tutto quanto visto sopra si riduce a una pagina di codice. Il vero lavoro sta nell'arte grafica, ed è qui che la maggior parte delle mod di creature muore in silenzio: una creatura necessita di un ciclo completo di animazioni, nell'atlas corretto, alle dimensioni giuste e con i pivot appropriati. Ci sono due strade sincere:

1. **Mantieni gli sprite dell'attore originale.** Una creatura che riutilizza le animazioni umane con parametri modificati e una tinta diversa è un'ottima prima mod, e *funziona perfettamente*.
2. **Esporta tramite AssetRipper**, individua l'atlas della creatura clonata e riproducine esattamente l'impaginazione prima ancora di iniziare a disegnare. Vedi **[Ottenere la grafica del gioco](#/toolbox/getting-the-sprites)**.

> [!WARNING] Testa sempre in un mondo reale, non su una mappa vuota
> Una creatura di civiltà che non riesce a muoversi, non sa costruire o annega subito dopo la generazione sembrerà perfetta nei primi trenta secondi. Fanne comparire venti, lascia scorrere il mondo alla massima velocità per cinque minuti e poi analizza il log :PES_MonkaSweat:.
