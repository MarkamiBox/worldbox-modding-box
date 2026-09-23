---
title: Ere del mondo e comportamenti
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbsunblessed:
order: 174
---

# Ere del mondo e comportamenti :wbsunblessed:

Due elementi appartengono al mondo stesso anziché a chiunque lo abiti. Un'**era del mondo** (world age) è l'epoca sulla ruota delle ere: l'Era della Speranza, l'Era delle Ceneri, con il loro meteo, la loro illuminazione e le loro regole. Un **comportamento del mondo** (world behaviour) è un frammento di codice che il mondo esegue a intervalli regolari, all'infinito: è così che il gioco programma disastri, migranti e usura delle strade.

```csharp Mods/HelloBox/Code/HelloAges.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAges
    {
        public const string EMBERS = "age_hello_embers";
        public const string SPARKS = "hello_sparks";

        public static void Initialize()
        {
            RegisterAge();
            RegisterBehaviour();
        }

        private static void RegisterAge()
        {
            if (AssetManager.era_library.has(EMBERS)) return;

            WorldAgeAsset age = new WorldAgeAsset
            {
                id = EMBERS,
                path_icon = "ui/Icons/iconHelloAge",
                rate = 2,
                particles_ash = true,
                overlay_ash = true,
                era_effect_overlay_alpha = 0.2f,
                title_color = Toolbox.makeColor("#D14219"),
                bonus_loyalty = 5,
                fire_spread_rate_bonus = 2f,
                cloud_interval = 20f,
                special_effect_interval = 8f
            };
            age.clouds = new List<string> { HelloClouds.EMBER };
            age.biomes = new HashSet<string> { "biome_savanna" };
            age.default_slots = new List<int> { 4 };
            age.special_effect_action = RainEmbers;

            AssetManager.era_library.add(age);

            // post_init() builds this path from the id, at startup. Borrow a vanilla background.
            age.path_background = "ui/AgeWheel/backgrounds/age_sun_background";

            // linkAssets() built both pools at startup: the random pick, and the wheel's default slots
            AssetManager.era_library.list_only_normal.Add(age);
            foreach (int slot in age.default_slots)
            {
                if (AssetManager.era_library.pool_by_slots.TryGetValue(slot, out List<WorldAgeAsset> pool)) pool.Add(age);
            }
        }

        /** Every special_effect_interval seconds while the age lasts. */
        private static void RainEmbers()
        {
            WorldTile[] tiles = World.world.tiles_list;
            if (tiles == null || tiles.Length == 0) return;

            for (int i = 0; i < 5; i++)
            {
                WorldTile tile = tiles[Randy.randomInt(0, tiles.Length)];
                if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
            }
        }

        private static void RegisterBehaviour()
        {
            if (AssetManager.world_behaviours.has(SPARKS)) return;

            WorldBehaviourAsset sparks = new WorldBehaviourAsset
            {
                id = SPARKS,
                interval = 30f,          // seconds between runs
                interval_random = 15f,   // plus up to this much, so it does not tick like a metronome
                action = CurseSomebody
            };

            AssetManager.world_behaviours.add(sparks);

            // MapBox creates one manager per behaviour when it wakes up, before your mod.
            // Without this the world loop calls update() on null, every frame.
            sparks.manager = new WorldBehaviour(sparks);
        }

        /** While the chaos law is on, a random creature catches the curse. */
        private static void CurseSomebody()
        {
            WorldLawAsset chaos = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
            if (chaos == null || !chaos.isEnabled()) return;

            List<Actor> units = World.world.units.getSimpleList();
            if (units.Count == 0) return;

            Actor victim = units[Randy.randomInt(0, units.Count)];
            if (victim != null && victim.isAlive()) victim.addStatusEffect(HelloStatus.CURSED);
        }
    }
}
```

## Ere del mondo

L'Era delle Braci fa piovere braci ogni otto secondi, scurisce lo schermo con la cenere, diffonde il fuoco a velocità raddoppiata e mantiene le città leggermente più leali. Un nuovo mondo può posizionarla sullo slot 4 della propria ruota, e il pulsante di selezione casuale della ruota può sorteggiarla ovunque.

> [!WARNING] Tre operazioni che la libreria ha svolto all'avvio
> `post_init()` imposta lo sfondo di ogni era a partire dal suo ID, e `linkAssets()` costruisce `list_only_normal` (il pool per l'era casuale sconosciuta) e `pool_by_slots` (i pool da cui un nuovo mondo riempie la ruota). Una nuova era non è presente in nessuno di essi. Ometti lo sfondo e la ruota mostrerà un tassello vuoto; ometti i pool e l'era esisterà, ma nessun mondo la sorteggerà mai.

> [!NOTE] L'elenco delle ere tra cui scegliere
> La finestra delle ere costruisce un pulsante per ciascuna era quando viene inizializzata, e il gioco precarica quella finestra. Non ho verificato se si inizializzi prima o dopo il caricamento dei mod, quindi verificare se la tua ottenga un pulsante lì è qualcosa da constatare in gioco, non una promessa. La ruota, i pool casuali e l'effetto speciale non dipendono da questo.

| Campo | Cosa fa |
| --- | --- |
| `rate` | Peso quando un'era viene sorteggiata casualmente |
| `default_slots` | In quali slot della ruota (da 1 a 8) un nuovo mondo può inserirla |
| `clouds` + `cloud_interval` | Quali nuvole genera e con quale frequenza |
| `special_effect_action` + `special_effect_interval` | Il tuo codice a tempo finché l'era è attiva |
| `overlay_*`, `particles_*`, `era_effect_overlay_alpha` | Resa grafica: oscurità, pioggia, neve, cenere, sole |
| `title_color`, `light_color` | Il colore del titolo e della luce ambientale |
| `bonus_loyalty`, `bonus_opinion`, `bonus_biomes_growth` | Bonus aggiunti a politica e crescita della vegetazione |
| `fire_spread_rate_bonus`, `temperature_damage_bonus`, `range_weapons_multiplier` | Regole modificate dall'era |
| `flag_night`, `flag_winter`, `flag_chaos`, `flag_light_age`, `flag_crops_grow` | Switch controllati da altri sistemi. I raccolti crescono solo se `flag_crops_grow` è true |

Le chiavi di testo sono `<id>_title` e `<id>_description`.

## Comportamenti del mondo

Un comportamento consiste in due numeri e un delegato: esegui `action` ogni `interval` secondi, più fino a `interval_random` secondi casuali aggiuntivi. Va in pausa insieme al mondo a meno che tu non imposti `stop_when_world_on_pause = false`, e `action_world_clear` viene eseguito al caricamento di un nuovo mondo.

> [!WARNING] Il manager viene creato all'avvio
> Il mondo mantiene un timer `WorldBehaviour` per ciascun asset, creato da `createManagers()` quando la mappa si avvia per la prima volta, prima del tuo mod. Il tuo ha `manager == null`, e il ciclo di aggiornamento del mondo tenta di chiamarlo ugualmente: `NullReferenceException`, a ogni singolo frame, per tutta la durata del gioco :wbfacepalm:. Quella singola riga dopo `add()` risolve il problema.

Il comportamento di HelloBox non fa nulla finché la sua legge mondiale è disattivata. Questo è il modello vincente da adottare: il controllo è leggerissimo, quindi lascia scorrere il timer e prendi la decisione all'interno dell'azione.

```json Mods/HelloBox/Locales/en.json
{
  "age_hello_embers_title": "Age of Embers",
  "age_hello_embers_description": "The sky is on fire, a little. Cities like it."
}
```

Per codice che deve girare secondo una propria cadenza temporale senza far parte del mondo (come l'interfaccia grafica), l'`Update()` di NML sulla tua classe principale resta la sede più semplice: vedi **[Il mod finito](#/nml/all-together)** :PES_OkHand:.
