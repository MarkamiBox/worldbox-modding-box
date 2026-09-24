---
title: La mod completa
group: Contenuto di gioco
subgroup: Rifinitura e traguardi
icon: :wbpeak:
order: 222
---

# La mod completa :wbpeak:

Se hai seguito le pagine in sequenza, hai aggiunto un file alla volta alla medesima mod fin da **[La tua prima mod](#/nml/your-first-mod)**. Questa pagina è l'assemblaggio finale: come appare HelloBox quando ogni tassello è al proprio posto e come i diversi moduli interagiscono tra loro.

## Cosa hai costruito

Una ventina di file, ed ecco cosa diventano in gioco. Ogni riga è una pagina di questa guida  :wbpeak:.

| Cosa | Dove lo vedi |
| --- | --- |
| Un tratto (trait) attore, e una scheda tutta tua che lo contiene | L'ispettore dell'unità, lista dei tratti |
| Tratti di cultura (culture), religione (religion), sottospecie (subspecies), clan, lingua e regno (kingdom) | Le loro finestre, una per sistema |
| Un'arma, il suo incantamento (modifier) e una categoria per entrambi | Le mani di un'unità, le schede equipaggiamento |
| Un effetto di stato (status) | Sopra la testa della creatura, con la sua icona |
| Drop, una nuvola (cloud) che li fa piovere e un proiettile (projectile) | La mappa, a mezz'aria, in mezzo a una rissa |
| Un tile | Il terreno, sotto tutto il resto |
| Una ricetta di cibo | I magazzini di una città |
| Una legge del mondo (world law) | La finestra Leggi del Mondo |
| Un potere divino (GodPower), la sua scheda e il suo bottone | La barra dei poteri in basso |
| Una finestra | Dove decidi tu |
| Un edificio (building) | Una città, appena qualcuno lo costruisce |
| Un regno e una creatura che ci appartiene | La mappa, mentre spawna e combatte |
| Un disastro (disaster) | Il menu dei disastri |
| Un lavoro (job) AI tutto suo | La creatura, che cammina da qualche parte con uno scopo |
| Una decisione (decision), un lavoro cittadino e uno strumento in mano | Fuochi fatui che vagano con una torcia, un custode per città |
| Un'azione di combattimento | Unità rapide che lanciano tizzoni prima di ingaggiare il nemico |
| Un gene, una personalità, un tipo di libro (book), una parte di stendardo | Il genoma, sovrani, librerie (library), bandiere |
| Opinione, lealtà e un evento di felicità | Prospetti di diplomazia e città |
| Un complotto | L'elenco dei complotti, quando un leader organizza un festival |
| Un'era (world age) del mondo e un comportamento (behaviour) del mondo | La ruota delle ere e il timer del mondo |
| Un achievement | La finestra degli achievement, a dieci fuochi fatui |
| Un pennello, un tooltip e una scorciatoia | Rotazione dei pennelli, tooltip al passaggio del mouse, F6 |
| Una patch Harmony | Da nessuna parte, ed è il punto: cambia una regola in silenzio |

## Portatela con te

<a class="dl" href="hellobox.zip" download>
  <span class="dl-icon">📦</span>
  <span class="dl-text">
    <span class="dl-title">Scarica HelloBox</span>
    <span class="dl-sub">La mod finita, tutti i file di questa pagina. Scompattala in <code>worldbox\Mods\</code> e avvia il gioco.</span>
  </span>
</a>

È generata dai blocchi di codice di questa guida, quindi è lo stesso codice che hai copiato, non una copia separata che col tempo diverge. Leggila, rompila, cancella i due terzi che non ti servono.

> [!WARNING] È una demo, non un prodotto
> Pubblicare HelloBox così com'è non aiuta nessuno: sono venti funzioni che fanno ognuna una cosina male apposta. Cambia gli id, cambia il nome, tieni i pezzi che volevi davvero  :wbbru:.

## La cartella

```text Mods/HelloBox/
HelloBox/
├── mod.json                         the ID card
├── icon.png                         what players see in the mod list
├── default_config.json              the settings window
├── Locales/
│   └── en.json                      every piece of text
├── GameResources/
│   ├── iconHelloCake.png            the food inventory icon
│   ├── actors/species/other/
│   │   ├── hello_wisp/              main/ and child/: walk_0..3, swim_0..3, sprites.json
│   │   └── hello_golem/             the same shape
│   ├── buildings/hello_shrine/      main_0, construction_0, ruin_0, mini_0, sprites.json
│   ├── cultures/
│   │   └── hello_culture_element.png    a culture banner part
│   ├── drops/hello_ember/           hello_ember_0..1, the falling drop
│   ├── effects/
│   │   ├── clouds/hello_cloud.png   the cloud sprite
│   │   ├── fx_hello_status/         fx_hello_status_0..2, the status overhead
│   │   └── projectiles/hello_bolt/  hello_bolt_0..1, the flying ember
│   ├── items/
│   │   ├── resources/hello_cake/    hello_cake_0..1, cake in hand
│   │   ├── tools/tool_hello_torch/  tool_hello_torch_0, the torch in hand
│   │   └── weapons/
│   │       ├── sprites.json         pivot for held weapons
│   │       ├── w_hello_sword.png    weapon sprite
│   │       └── w_hello_sword/       the in-hand sprite list, with its own sprites.json
│   ├── tiles/hello_moss/            moss_1, a tile variation
│   └── ui/Icons/
│       ├── sprites.json             default icon slicing
│       ├── iconHello*.png           traits, powers, tabs, the age, the gene, the grudge...
│       ├── items/icon_hello_sword.png       weapon inventory icon
│       └── worldrules/icon_hello_law.png    world law switch
└── Code/
    ├── Main.cs                      the door NML knocks on
    ├── HelloSettings.cs             what the settings window writes to
    ├── HelloGroups.cs               your own trait tab and item category
    ├── HelloTraits.cs               an actor trait
    ├── HelloMemory.cs               a trait that remembers, in the save file
    ├── HelloCulture.cs              a culture trait
    ├── HelloReligion.cs             a religion trait
    ├── HelloSubspecies.cs           a subspecies trait
    ├── HelloClan.cs                 a clan trait
    ├── HelloLanguage.cs             a language trait
    ├── HelloGenes.cs                a gene
    ├── HelloKingdomTraits.cs        a kingdom trait
    ├── HelloItems.cs                a weapon cities actually forge
    ├── HelloModifiers.cs            an enchantment
    ├── HelloStatus.cs               a status effect
    ├── HelloDrops.cs                falling embers
    ├── HelloClouds.cs               an ember cloud
    ├── HelloTiles.cs                a top tile
    ├── HelloResources.cs            a food recipe
    ├── HelloProjectiles.cs          a flying ember
    ├── HelloLaws.cs                 a world law switch
    ├── HelloBuildings.cs            a building
    ├── HelloKingdoms.cs             their faction
    ├── HelloActors.cs               your creatures
    ├── HelloAI.cs                   its own behaviour
    ├── HelloDecisions.cs            the wisps choosing it on their own
    ├── HelloCityJobs.cs             a job cities hand out
    ├── HelloTools.cs                a torch in hand
    ├── HelloCombat.cs               a combat move
    ├── HelloPolitics.cs             opinion, loyalty, a happiness event
    ├── HelloPlots.cs                a festival leaders can plot
    ├── HelloAges.cs                 a world age and a world behaviour
    ├── HelloAchievements.cs         an achievement
    ├── HelloPersonality.cs          a ruler personality
    ├── HelloBooks.cs                a kind of book
    ├── HelloBanners.cs              a culture banner part
    ├── HelloBrushes.cs              a brush shape
    ├── HelloTooltips.cs             the panel's tooltip
    ├── HelloHotkeys.cs              F6 opens the panel
    ├── HelloDisasters.cs            an ember storm, with its log line
    ├── HelloPowers.cs               a god power + its tab and buttons
    ├── HelloWindow.cs               a panel
    └── HelloPatches.cs              your Harmony patches
```

## Main.cs, il codice completo

```csharp Mods/HelloBox/Code/Main.cs
using System;
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>, IReloadable
    {
        // Development only: turns on NML's reload button. Never ship it on. See Logs & debugging.
        private static bool DevReload = false;

        protected override void OnModLoad()
        {
            if (DevReload) Config.isEditor = true;

            // Order matters: things that are referenced must exist first.
            Stage("groups", HelloGroups.Initialize);        // tabs before the things that sit in them
            Stage("traits", HelloTraits.Initialize);
            Stage("memory", HelloMemory.Initialize);
            Stage("culture", HelloCulture.Initialize);
            Stage("religion", HelloReligion.Initialize);
            Stage("subspecies", HelloSubspecies.Initialize);
            Stage("clan", HelloClan.Initialize);
            Stage("language", HelloLanguage.Initialize);
            Stage("genes", HelloGenes.Initialize);
            Stage("status", HelloStatus.Initialize);
            Stage("drops", HelloDrops.Initialize);          // clouds rain drops, so drops go first
            Stage("clouds", HelloClouds.Initialize);
            Stage("tiles", HelloTiles.Initialize);
            Stage("biomes", HelloBiomes.Initialize);       // after the tiles, before anything spawns in it
            Stage("resources", HelloResources.Initialize);  // items and buildings cost resources
            Stage("projectiles", HelloProjectiles.Initialize);
            Stage("modifiers", HelloModifiers.Initialize);
            Stage("items", HelloItems.Initialize);          // items can roll the modifiers above
            Stage("buildings", HelloBuildings.Initialize);
            Stage("kingdoms", HelloKingdoms.Initialize);    // actors point at kingdoms
            Stage("kingdom_traits", HelloKingdomTraits.Initialize);
            Stage("names", HelloNames.Initialize);         // before the actors, so they can use its name set
            Stage("actors", HelloActors.Initialize);
            Stage("laws", HelloLaws.Initialize);
            Stage("ai", HelloAI.Initialize);
            Stage("decisions", HelloDecisions.Initialize);  // after the actors and the task they use
            Stage("city_jobs", HelloCityJobs.Initialize);
            Stage("tools", HelloTools.Initialize);
            Stage("combat", HelloCombat.Initialize);        // after the trait that carries it
            Stage("politics", HelloPolitics.Initialize);
            Stage("wars", HelloWars.Initialize);
            Stage("plots", HelloPlots.Initialize);
            Stage("ages", HelloAges.Initialize);            // after the cloud, the law and the status it uses
            Stage("achievements", HelloAchievements.Initialize);
            Stage("personality", HelloPersonality.Initialize);
            Stage("books", HelloBooks.Initialize);
            Stage("banners", HelloBanners.Initialize);
            Stage("brushes", HelloBrushes.Initialize);
            Stage("tooltips", HelloTooltips.Initialize);
            Stage("hotkeys", HelloHotkeys.Initialize);
            Stage("disasters", HelloDisasters.Initialize);
            Stage("powers", HelloPowers.Initialize);        // last: the buttons need the powers

            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
            LogInfo("HelloBox ready");
        }

        private static void Stage(string pName, Action pAction)
        {
            try { pAction(); }
            catch (Exception e) { LogError($"stage '{pName}' failed: {e}"); }
        }

        // NML calls this after it recompiled your code, when you press the reload button
        public void Reload()
        {
            LogInfo("HelloBox reloaded");
        }

        public void Update()
        {
            if (!Config.game_loaded) return;
            if (World.world == null || World.world.units == null || MapBox.instance == null) return;

            // the power tab can only be laid out once its own Start() has run
            HelloPowers.LayoutWhenReady();
        }
    }
}
```

### Perché questo ordine

Tre file in quella cartella non compaiono mai nell'elenco precedente, ed è giusto così:

| File | Chi lo chiama |
| --- | --- |
| `HelloPatches.cs` | `PatchAll()` lo individua mediante i suoi attributi. Non invochi mai un patch a mano |
| `HelloSettings.cs` | Il gestore della configurazione vi scrive quando il giocatore muove un cursore |
| `HelloWindow.cs` | Il relativo pulsante lo istanzia la prima volta che qualcuno lo apre |

Anche i tuoi testi non necessitano di una fase specifica: NML carica `Locales/en.json` prima di bussare a `OnModLoad`, quindi ogni chiave è già pronta. Tutto il resto è legato a dipendenze precise:

1. **Gruppi prima degli elementi contenuti**, perché un asset il cui `group_id` punta al vuoto non ha alcuna scheda in cui essere disegnato.
2. **Gocce prima delle nuvole**, perché una nuvola specifica per nome la goccia che fa piovere.
3. **Risorse (resource) prima di oggetti ed edifici**, poiché entrambi richiedono risorse per essere creati.
4. **Modificatori prima degli oggetti**, poiché un'arma elenca i modificatori che può estrarre.
5. **Regni prima degli attori**, poiché un attore specifica i suoi regni selvaggio e civilizzato.
6. **Poteri prima dei loro pulsanti**: `PowerButtonCreator` cerca il potere in base all'id, e un pulsante collegato a un potere assente è un pulsante morto.
7. **Tutto ciò che serve all'IA prima dell'IA**, poiché una task fa riferimento a tratti e stati tramite id.
8. **Gli attori e l'IA prima di decisioni, lavori cittadini e strumenti**, poiché questi puntano a una creatura e a un'attività (task) che devono già esistere.
9. **L'era del mondo dopo la nuvola, la legge e lo status** utilizzati dai suoi effetti. Complotti, politica e achievement effettuano ricerche solo mentre il gioco gira, quindi possono trovarsi ovunque dopo le proprie dipendenze.

Quando qualcosa non appare nel gioco, chiedersi "l'ho registrato dopo l'elemento che ne aveva bisogno?" è la seconda domanda d'obbligo, subito dopo "è presente nel log?" :PES2_HmmmmNoted:.

## La lista di controllo prima di considerarla finita

| | |
| --- | --- |
| Log | Avvia il gioco, cerca `HelloBox`. Vuoi vedere "ready" e **nessuna** `Exception` |
| Testi | Nessun elemento nel gioco deve mostrare una chiave grezza come `trait_hello_x` |
| Icone | Nessun buco invisibile nella barra dei poteri |
| Impostazioni | Elimina `mods_config/<GUID>.config`, riavvia e verifica i valori predefiniti |
| Mondo pulito | Carica una mappa nuova, falla girare alla massima velocità per cinque minuti e rileggi il log |
| Altre mod | Attivane qualcuna. Se applichi una patch a qualcosa, sicuramente lo sta facendo anche qualcun altro |

Vai poi a **[Pubblicare la tua mod](#/nml/publishing)** e lascia che siano gli altri a metterla alla prova :aPES3_VictoryPog:.

## Prossimi passi

- Elimina le parti di HelloBox che non ti servono. Era una demo, non una vera mod.
- Scegli **un solo** aspetto e fallo al meglio. Una mod che fa una sola cosa perfettamente supera di gran lunga una che ne fa dodici male.
- Studia il codice vanilla relativo a ciò che hai scelto (**[Leggere il codice di gioco](#/toolbox/reading-the-game-code)**). Tutto ciò che ancora non sai è scritto esattamente lì :PESgn_ReadRules:.
