---
title: Complotti
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbrebellion:
order: 180
---

# Complotti :wbrebellion:

Un **complotto** (plot) è un piano che un regnante avvia, finanzia e porta avanti nel tempo: una ribellione, una nuova guerra, un'alleanza. Quando la barra di avanzamento si riempie, il tuo codice viene eseguito. Tutto ciò che accade tra "qualcuno potrebbe" e "qualcuno l'ha fatto" è gestito dal motore interno del gioco, ed è questo il motivo per cui conviene usarlo: il giocatore vede il tuo piano nell'elenco dei complotti, con il suo autore, il progresso e il suo stendardo, in modo del tutto gratuito.

## Aggiungerne uno

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

Un leader con dieci monete, una città e nulla di meglio da fare può ora organizzare un festival delle braci. Quando si conclude, tutti i cittadini migliorano il proprio umore grazie all'evento di felicità di **[Regni e fazioni](#/nml/kingdoms)**, e piovono braci sull'organizzatore, perché siamo pur sempre in HelloBox.

> [!WARNING] `check_is_possible` non è facoltativo
> `PlotAsset.checkIsPossible()` lo invoca senza alcun controllo sui nulli ogni volta che un leader valuta il tuo complotto. Se lo ometti, il primo governante che lo controlla lancerà una `NullReferenceException`. Se non hai condizioni particolari, restituisci semplicemente `true`.

> [!WARNING] L'elenco di base viene generato all'avvio
> I leader scelgono unicamente da `plots_library.basic_plots` (oltre ai riti della propria religione). `linkAssets()` riempie questa lista all'avvio con ogni complotto contrassegnato da `is_basic_plot`, prima del caricamento del tuo mod. Impostare il flag non basta: aggiungilo tu stesso alla lista.

## I campi

### Chi può avviarlo

| Campo | Cosa fa |
| --- | --- |
| `can_be_done_by_king` / `can_be_done_by_leader` / `can_be_done_by_clan_member` | I ruoli consentiti. Se nessuno è impostato, nessuno potrà avviarlo |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | Soglie minime richieste all'autore |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | Soglie statistiche. Valore predefinito: 2 |
| `money_cost` | Costo all'avvio, a meno che il complotto non sia forzato dal giocatore |
| `requires_diplomacy` / `requires_rebellion` | Attivo solo finché quella legge mondiale è abilitata |
| `check_is_possible` | La tua condizione di avvio. Obbligatoria |

### Come viene eseguito

| Campo | Cosa fa |
| --- | --- |
| `progress_needed` | Quanto lavoro serve prima che si attivi |
| `check_should_continue` | Controllato durante l'avanzamento. Se restituisce `false`, il complotto viene annullato |
| `action` | Viene eseguito al completamento della barra. Restituisce `true` se ha avuto successo |
| `post_action` | Viene eseguito dopo una `action` completata con successo |
| `try_to_start_advanced` | Sostituisce l'avvio standard per i complotti con un bersaglio: la ribellione vanilla imposta qui `target_kingdom` |
| `check_target_actor`, `check_target_city`, `check_target_kingdom`... | Controlla che il bersaglio del complotto sia ancora in vita |

### Aspetto grafico

| Campo | Cosa fa |
| --- | --- |
| `path_icon` | La sua icona nell'elenco dei complotti e sullo stendardo |
| `group_id` | La categoria: `diplomacy`, `culture`, `rites_wrathful`, `rites_summoning`, `rites_merciful` |
| `pot_rate` | Peso rispetto agli altri possibili complotti |
| `is_basic_plot` | Qualsiasi leader può tentarlo. Altrimenti si verifica solo come rito religioso, vedi **[Tratti religiosi](#/nml/religion-traits)** |

## I testi

Un complotto utilizza tre chiavi di testo: il suo nome, la riga che descrive il complotto in corso e la descrizione generale. `$initiator_actor$`, `$initiator_city$`, `$initiator_kingdom$` e `$target_kingdom$` vengono compilati automaticamente nella seconda riga.

```json Mods/HelloBox/Locales/en.json
{
  "plot_hello_ember_festival": "Ember Festival",
  "plot_hello_ember_festival_info": "$initiator_actor$ is organising an ember festival in $initiator_city$.",
  "plot_hello_ember_festival_info_base": "A city celebrates, and something falls from the sky."
}
```

> [!TIP] Testare forzando il complotto
> Aspettare che un leader scelga spontaneamente il tuo complotto può richiedere tempo. Seleziona un'unità e avvia il complotto manualmente dalla scheda complotti nella sua finestra: l'unità deve comunque avere uno dei ruoli consentiti e `check_can_be_forced` (facoltativo) decide se il pulsante si illumina, ma un complotto forzato non costa nulla. È il modo più rapido per vedere la tua `action` in azione :PES2_EvilPlan:.
