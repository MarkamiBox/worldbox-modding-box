---
title: Tratti religiosi
group: Contenuto di gioco
subgroup: Tratti e genetica
icon: :wbpray:
order: 108
---

# Tratti religiosi :wbpray:

Una **religione** appartiene a città e regni, si diffonde tramite conversione, scrive libri e può compiere **riti**: complotti che alterano il mondo che i suoi seguaci tentano di attuare di propria iniziativa. Un tratto religioso è una singola credenza.

| | |
| --- | --- |
| Libreria | `AssetManager.religion_traits` |
| Classe | `ReligionTrait` |
| Gruppi | `AssetManager.religion_trait_groups`, classe `ReligionTraitGroupAsset` |
| Proprietario a runtime | `Religion`, in `World.world.religions` |
| Prefisso di localizzazione | `religion_trait_` |
| Cartella icone predefinita | `ui/Icons/religion_traits/` |

> [!WARNING] Le statistiche della religione non raggiungono le unità
> Questo è l'unico sistema di tratti i cui `base_stats` non arrivano mai a un `Actor`. `Actor.updateStats()` fonde sottospecie, clan, lingue e culture. **La religione non è in quella lista.**
>
> Pertanto un tratto religioso trasforma il mondo attraverso ciò che *fa* (un rito, una trasformazione, un hook d'azione), non attraverso meri numeri. Scrivere `base_stats["damage"] = 10` su uno di essi non fa assolutamente nulla, ed è il pomeriggio sprecato più classico su questa pagina :PES4_BigSad:.

## Registrarne uno

```csharp Mods/HelloBox/Code/HelloReligion.cs
namespace HelloBox
{
    public static class HelloReligion
    {
        public const string ASHES = "hello_rite_of_ashes";

        public static void Initialize()
        {
            if (AssetManager.religion_traits.has(ASHES)) return;

            ReligionTrait trait = new ReligionTrait
            {
                id = ASHES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "destruction",
                path_icon = "ui/Icons/iconHelloReligion",
                plot_id = "summon_meteor_rain",      // il rito che i seguaci possono tentare
                priority = -1,
                spawn_random_trait_allowed = false,
                rarity = Rarity.R2_Epic
            };

            AssetManager.religion_traits.add(trait);
        }
    }
}
```

## Riti: il campo `plot_id`

Un tratto religioso provvisto di `plot_id` diventa un **rito**. La religione raccoglie i propri riti in `possible_rites`, e sovrani e sacerdoti provano a eseguirli autonomamente non appena le condizioni del complotto sono soddisfatte.

```csharp
trait.plot_id = "summon_meteor_rain";
```

L'id punta ad `AssetManager.plots_library`. I riti vanilla riutilizzano complotti esistenti - `summon_earthquake`, `summon_meteor_rain`, `summon_thunderstorm`, `summon_stormfront`, `summon_hellstorm`, `clan_ascension` - e tu puoi fare lo stesso, oppure registrare prima il tuo `PlotAsset` personalizzato.

Il complotto decide chi può avviarlo e quanto impegno richiede:

| Campo di PlotAsset | Cosa fa |
| --- | --- |
| `can_be_done_by_king`, `can_be_done_by_leader`, `can_be_done_by_clan_member` | Chi può avviarlo |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | Soglie di attributi |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | Soglie di livello e fama |
| `progress_needed`, `money_cost` | Durata e costo monetario |
| `pot_rate`, `rarity` | Quanto spesso l'IA lo sceglie |
| `check_is_possible`, `check_should_continue` | Le tue condizioni su misura |

## Trasformazioni: il campo `transformation_biome_id`

L'altro campo riservato ai tratti di religione. Contrassegna il tratto come trasformazione e specifica il bioma che il culto diffonde nel territorio circostante:

```csharp
trait.transformation_biome_id = "biome_desert";
```

Il gioco vanilla lo sfrutta per `sands_of_ruin` (deserto), `shadowroot` (corrotto), `echo_of_the_void` (singolarità), `infernal_rot` (infernale) e `cosmic_radiation` (landa desolata). Una religione dotata di uno di questi tratti riscrive gradualmente il terreno su cui abitano i fedeli, dando luogo al più grande impatto visivo che un singolo tratto possa generare nel gioco.

## Far *fare* qualcosa a un tratto

Dato che i valori statistici non funzionano, gli hook d'azione sono lo strumento principale con cui un tratto religioso conquista il suo posto. Sono gli stessi di cui dispone qualunque tratto:

```csharp
// ogni tot secondi, su ciascun fedele
trait.special_effect_interval = 5f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreMana(2);
    return true;
};

// quando un fedele muore
trait.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };
```

Un tratto religioso può anche conferire un incantesimo o una decisione, che di norma è una soluzione migliore rispetto a un mero timer:

```csharp
trait.addSpell("hello_bolt");           // vedi Proiettili, incantesimi ed effetti
trait.addDecision("burn_tumors");       // una decisione IA che i fedeli possono prendere
```

## I gruppi vanilla

`harmony` · `creation` · `destruction` · `restoration` · `necromancy` · `protection` · `the_void` · `transformation` · `fate` · `special`

Per creare la tua scheda: vedi **[Gruppi di tratti e schede](#/nml/trait-groups)**, con `AssetManager.religion_trait_groups` e `ReligionTraitGroupAsset`.

## I testi

```json Mods/HelloBox/Locales/en.json
{
  "religion_trait_hello_rite_of_ashes": "Rite of Ashes",
  "religion_trait_hello_rite_of_ashes_info": "Somebody always volunteers."
}
```

## Assegnare il tratto

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addReligionTrait(HelloReligion.ASHES);
```

```csharp
foreach (Religion religion in World.world.religions)
{
    if (religion == null || religion.isRekt()) continue;

    religion.addTrait(HelloReligion.ASHES, pRemoveOpposites: true);
}
```

Una `Religion` espone anche `cities`, `kingdoms`, `books` e `possible_rites`, che di solito è ciò che vorrai interrogare quando il tuo codice ha bisogno di sapere quali piani stia tramando una fede.

> [!TIP] I riti sono il vero cuore
> Una religione che modifica solo numeri è invisibile. Una religione i cui sacerdoti invocano periodicamente una pioggia di meteore è ciò di cui i giocatori catturano schermate. Impiega le tue energie su `plot_id` :aPES_Flames:.
