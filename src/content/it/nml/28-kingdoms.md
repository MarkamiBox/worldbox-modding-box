---
title: Regni e fazioni
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbkingdoms:
order: 178
---

# Regni e fazioni :wbkingdoms:

Ogni unità in WorldBox appartiene a un regno. Non solo quelle civilizzate: i lupi appartengono a un regno di lupi, i banditi a una fazione di banditi, e un pacifico pollo appartiene a un regno neutrale. Un `KingdomAsset` è il **tipo** di fazione, non un singolo regno posizionato sulla mappa.

Questa è la distinzione essenziale:

| | |
| --- | --- |
| `KingdomAsset` in `AssetManager.kingdoms` | Il modello base. "Cosa definisce un regno di orchi" |
| `Kingdom` in `World.world.kingdoms` | Un regno effettivo nel mondo di gioco, con nome, colore e città |

Tu registri il primo. Il gioco crea il secondo.

## Clonare un modello

Come gli attori, i regni possiedono identificatori `$TEMPLATE$` creati appositamente per questo:

| Modello | Scopo |
| --- | --- |
| `$TEMPLATE_CIV$` | Una fazione civilizzata |
| `$TEMPLATE_CIV_NEW$` | Lo stile più moderno delle civiltà animali |
| `$TEMPLATE_NOMAD$` | La fase nomade prima dello stanziamento |
| `$TEMPLATE_MOB$` | Una fazione di mostri ostili |
| `$TEMPLATE_MOB_GOOD$` / `$TEMPLATE_MOB_VERY_GOOD$` | Ostile ad alcune entità, amichevole verso le civiltà |
| `$TEMPLATE_ANIMAL$` | Fauna selvatica |
| `$TEMPLATE_ANIMAL_NEUTRAL$` / `$TEMPLATE_ANIMAL_PEACEFUL$` | Fauna pacifica che non attacca mai per prima |

```csharp Mods/HelloBox/Code/HelloKingdoms.cs
namespace HelloBox
{
    public static class HelloKingdoms
    {
        public const string CIV = "hello_sprites";
        public const string WILD = "hello_nomads_sprites";

        public static void Initialize()
        {
            if (AssetManager.kingdoms.has(CIV)) return;

            // La fazione civilizzata stanziale.
            KingdomAsset civ = AssetManager.kingdoms.clone(CIV, "$TEMPLATE_CIV$");
            civ.addTag("civ");
            civ.addFriendlyTag("civ");
            civ.addEnemyTag("orc");
            civ.setIcon("ui/Icons/iconHelloCiv");

            // La fase nomade, prima di fondare una città.
            KingdomAsset wild = AssetManager.kingdoms.clone(WILD, "$TEMPLATE_NOMAD$");
            wild.addTag("hello_sprite");
            wild.addFriendlyTag("hello_sprite");
            wild.setIcon("ui/Icons/iconHelloWild");
        }
    }
}
```

`$TEMPLATE_NOMAD$` ha già impostato `nomads = true`, `civ = false` e `mobs = true` per te. Vale la pena ripeterlo forte e chiaro: **`civ`, `nomads`, `mobs` e simili sono campi `bool`, non tag.** `wild.nomads = true` è un campo effettivo. `wild.addTag("nomads")` è un tag che nessun pezzo di codice del gioco controlla, e fallisce senza dare alcun errore :aPES_Liar:.

Poi fai puntare il tuo attore verso di essi, passaggio che collega effettivamente le due entità:

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.kingdom_id_wild = HelloKingdoms.WILD;
asset.kingdom_id_civilization = HelloKingdoms.CIV;
```

Senza questa riga, la tua creatura nascerà nel regno usato dal modello donatore del suo clone (solitamente gli umani), creando una gran confusione :PES5_Hmmmm:.

## I campi

### Che tipo di fazione rappresenta

| Campo | Cosa fa |
| --- | --- |
| `civ` | Fonda città, combatte guerre, ha un sovrano |
| `nomads` | Fase errante prima della fondazione di città |
| `nature` | Fauna selvatica |
| `mobs` | Mostri ostili |
| `neutral` | Non attacca nessuno senza provocazione |
| `abandoned`, `concept` | Fazioni tecniche di gestione interna, non popoli reali |
| `brain` | La meta-fazione guidata dall'IA |
| `group_main`, `group_miniciv`, `group_minicivs_cool`, `group_creeps` | In quale gruppo le liste del gioco la inseriscono |

### Come si comporta

| Campo | Cosa fa |
| --- | --- |
| `always_attack_each_other` | Due regni di questo tipo sono perennemente nemici |
| `units_always_looking_for_enemies` | Le unità continuano a pattugliare a caccia di nemici |
| `count_as_danger` | Se le altre fazioni la considerano una minaccia. `true` per impostazione predefinita |
| `friendship_for_everyone` | Amichevole con chiunque |
| `force_look_all_chunks` | Le unità scansionano l'intera mappa e non solo i dintorni. Molto pesante |
| `building_attractor_id` | Un tipo di edificio che le attira |

### Tag: chi combatte contro chi

Questa è la parte cruciale, e non si tratta di un valore numerico ma di tre set di stringhe:

```csharp
kingdom.addTag("civ");             // chi sono io
kingdom.addFriendlyTag("neutral"); // chi considero amico
kingdom.addEnemyTag("orc");        // chi considero nemico
```

Due regni confrontano i loro tag per stabilire la loro relazione iniziale. Una fazione senza tag non ama nessuno, non odia nessuno e non fa nulla di interessante.

### Aspetto visivo

| Campo | Cosa fa |
| --- | --- |
| `path_icon`, `show_icon` | Icona della fazione. `setIcon(path)` imposta entrambi |
| `default_kingdom_color`, `default_civ_color_index` | Il colore iniziale |
| `color_building` | Tonalità applicata agli edifici |

## Il resto dei collegamenti della fazione

Un asset di regno isolato è soltanto un'etichetta. Un'etichetta molto ufficiale, ma pur sempre un'etichetta. Ecco le altre librerie che una fazione completa coinvolge:

| Elemento | Libreria | Scopo |
| --- | --- | --- |
| Stendardi | `AssetManager.kingdom_banners_library` | La bandiera generata |
| Colori | `AssetManager.kingdom_colors_library` | La tavolozza di colori assegnata ai regni |
| Tratti del regno | `AssetManager.kingdoms_traits` | Politiche, per lo più tasse. Vedi **[Tratti del regno](#/nml/kingdom-traits)** |
| Lavori del regno | `AssetManager.job_kingdom` | L'obiettivo strategico dell'IA della fazione |
| Compiti del regno | `AssetManager.tasks_kingdom` | L'albero di comportamento dietro tali lavori |
| Tipi di guerra | `AssetManager.war_types_library` | I tipi di guerra dichiarabili |
| Architettura | `AssetManager.architecture_library` | L'aspetto estetico degli edifici |
| Ordini di costruzione | `AssetManager.city_build_orders` | Cosa edifica una nuova città e con quale priorità |
| Generatori di nomi | `AssetManager.name_generator`, `AssetManager.name_sets` | Come vengono chiamati regni, città e cittadini |

Riutilizza le risorse vanilla finché non hai un valido motivo per cambiarle. Impostare `banner_id = "human"` sul tuo attore ti dà gratis un generatore di bandiere funzionante.

## Interagire con i regni a runtime

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    // kingdom.name, kingdom.cities, kingdom.king, kingdom.getPopulationTotal()
}
```

`isRekt()` è un extension method che significa "questo oggetto è stato distrutto ma qualcosa ne conserva ancora il riferimento". Controllalo sempre in ogni ciclo su regni, città, eserciti o unità. È la differenza tra una mod che funziona e una che va in crash ogni ora :aPES2_Sweat:.

## Personalità

Un re e il leader di una città ricevono una **personalità**: un'etichetta e una manciata di statistiche `personality_*` che influenzano quanto aggressivamente o diplomaticamente agirà il regno. Registrarne una richiede tre righe. Far sì che qualcuno la *abbia* davvero è il problema: `Actor.updateStats()` sceglie una delle quattro opzioni vanilla per nome a ogni ricalcolo delle statistiche.

```csharp Mods/HelloBox/Code/HelloPersonality.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPersonality
    {
        public const string RESTLESS = "hello_restless";

        public static void Initialize()
        {
            if (AssetManager.personalities.has(RESTLESS)) return;

            PersonalityAsset restless = new PersonalityAsset { id = RESTLESS, icon = "iconHelloSwift" };
            AssetManager.personalities.add(restless);
            restless.base_stats["personality_aggression"] = 0.4f;
            restless.base_stats["personality_diplomatic"] = 0.05f;
            restless.base_stats["personality_administration"] = 0.05f;
        }

        // updateStats() picks a ruler's personality by name, out of four, every time stats change.
        // A new one is never picked unless you swap it in afterwards.
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Personality
        {
            public static void Postfix(Actor __instance)
            {
                PersonalityAsset current = __instance.s_personality;
                if (current == null) return;                               // not a ruler
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                PersonalityAsset mine = AssetManager.personalities.get(RESTLESS);
                if (mine == null || current == mine) return;

                // take the vanilla one's numbers back out, put yours in
                __instance.stats.mergeStats(current.base_stats, -1f);
                __instance.stats.mergeStats(mine.base_stats);
                __instance.s_personality = mine;
            }
        }
    }
}
```

Il postfix viene eseguito dopo ogni aggiornamento delle statistiche, consolidando lo scambio. Sottrae i valori della personalità vanilla prima di applicare i tuoi, evitando che il sovrano le mantenga entrambe. `s_personality` e `mergeStats()` sono `internal`: compila contro l'assembly **publicized** di NML.

## Opinione, lealtà e felicità

Tre piccole librerie determinano il tessuto politico del mondo, e tutte e tre sono elenchi di funzioni di calcolo. Niente sentimenti, solo numeri:

| Libreria | Chiamata per | Restituisce |
| --- | --- | --- |
| `AssetManager.opinion_library` | Ciascuna coppia di regni | Punti di opinione reciproca |
| `AssetManager.loyalty_library` | Ciascuna città | Punti di lealtà verso il proprio regno |
| `AssetManager.happiness_library` | Eventi che accadono a un'unità | Una variazione fissa di felicità |

```csharp Mods/HelloBox/Code/HelloPolitics.cs
namespace HelloBox
{
    public static class HelloPolitics
    {
        public const string WARM = "hello_warm_embers";            // happiness event
        public const string DISTRUST = "hello_opinion_swift_king";  // kingdom to kingdom
        public const string EMBER_AGE = "hello_loyalty_ember_age";  // city to kingdom

        public static void Initialize()
        {
            if (!AssetManager.happiness_library.has(WARM))
            {
                HappinessAsset warm = new HappinessAsset
                {
                    id = WARM,
                    value = 10,
                    path_icon = "ui/Icons/iconHelloDrop",
                    dialogs_amount = 2     // happiness_dialog_hello_warm_embers_0 and _1
                };
                AssetManager.happiness_library.add(warm);

                // post_init() numbers every entry at startup, and the unit's happiness
                // history stores that number, not the id. Yours would show up as entry 0.
                warm.index = AssetManager.happiness_library.list.IndexOf(warm);
            }

            // Opinion and loyalty are summed from the whole list every time: add() is enough.
            if (!AssetManager.opinion_library.has(DISTRUST))
            {
                AssetManager.opinion_library.add(new OpinionAsset
                {
                    id = DISTRUST,
                    translation_key = DISTRUST,
                    calc = (Kingdom pMain, Kingdom pTarget) =>
                    {
                        if (pTarget == null || !pTarget.hasKing()) return 0;
                        return pTarget.king.hasTrait(HelloTraits.SWIFT) ? -10 : 0;
                    }
                });
            }

            if (!AssetManager.loyalty_library.has(EMBER_AGE))
            {
                AssetManager.loyalty_library.add(new LoyaltyAsset
                {
                    id = EMBER_AGE,
                    translation_key = EMBER_AGE,
                    calc = (City pCity) =>
                    {
                        WorldAgeAsset age = AssetManager.era_library.get(HelloAges.EMBERS);
                        if (age == null) return 0;
                        return World.world.era_manager.isCurrentAge(age) ? 5 : 0;
                    }
                });
            }
        }
    }
}
```

Opinione e lealtà vengono sommate dall'intero elenco a ogni valutazione, quindi `add()` è tutto ciò che serve, e ciascuna compare come riga dedicata nel dettaglio di gioco usando `translation_key` (o `translation_key_negative` se il valore è negativo). Gli eventi di felicità si attivano quando il codice chiama `actor.changeHappiness("hello_warm_embers")`, come fa il festival in **[Complotti](#/nml/plots)**.

> [!WARNING] Le voci di felicità vengono numerate all'avvio
> La cronologia di felicità di un'unità memorizza il *numero* dell'evento, non il suo ID, e `HappinessLibrary.post_init()` assegna tali numeri una volta sola. La tua rimarrebbe a 0 e comparirebbe come la prima voce vanilla. Imposta `index` manualmente.

## Stendardi per gli altri sistemi

I regni non sono gli unici ad avere uno stendardo: culture, religioni, clan, lingue, sottospecie e famiglie hanno ciascuno la propria libreria di componenti (`AssetManager.culture_banners_library` e simili). Ciascuna possiede un asset `main` con elenchi di percorsi grafici, e una nuova cultura ne sorteggia un indice.

```csharp Mods/HelloBox/Code/HelloBanners.cs
namespace HelloBox
{
    public static class HelloBanners
    {
        public const string CULTURE_ICON = "cultures/hello_culture_element";

        public static void Initialize()
        {
            BannerAsset culture = AssetManager.culture_banners_library.main;
            if (culture == null || culture.icons.Contains(CULTURE_ICON)) return;

            // A culture stores the index it rolled, not the path. Append, never insert,
            // or every existing culture's banner shifts by one.
            culture.icons.Add(CULTURE_ICON);
        }
    }
}
```

I percorsi vengono caricati singolarmente al momento del disegno dello stendardo, quindi non c'è nulla da aggiornare. Un indice oltre la fine della lista ripiega su 0, motivo per cui un salvataggio creato con il tuo mod si apre senza problemi anche senza di esso. Rispetta le dimensioni dei componenti vanilla: controllane uno in **[UnityExplorer](#/toolbox/unity-explorer)** prima di disegnare il tuo. Sbaglia la dimensione e ottieni una bandiera più grande della città che la issa :wbfacepalm:.

```json Mods/HelloBox/Locales/en.json
{
  "personality_hello_restless": "Restless",
  "happiness_hello_warm_embers": "Warmed by embers",
  "happiness_dialog_hello_warm_embers_0": "The embers are nice this time of year.",
  "happiness_dialog_hello_warm_embers_1": "Nothing like a little fire from the sky.",
  "hello_opinion_swift_king": "Their king is too fast to trust",
  "hello_loyalty_ember_age": "Loves the Age of Embers"
}
```

> [!TIP] Probabilmente non ti serve un nuovo asset di regno
> Una nuova creatura ne ha bisogno. Un nuovo *comportamento* no: la maggior parte dei mod sulle fazioni si realizza meglio tramite tratti del regno, una cultura o un patch Harmony sui controlli diplomatici. Aggiungi un asset di regno quando la tua creatura necessita di un proprio spazio nel mondo, non per alterare il comportamento dei regni esistenti.
