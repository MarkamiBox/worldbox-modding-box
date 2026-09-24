---
title: Tipi di guerra
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbmartialwarfare:
order: 179
---

# Tipi di guerra :wbmartialwarfare:

Ogni guerra (war) del gioco ha un tipo: una normale conquista, una guerra di rancore contro tutti, una ribellione. Il tipo decide come la guerra prende il nome, quale icona mostra, se gli alleati si uniscono e qualche regola su come può finire. In vanilla ce ne sono solo cinque, quindi uno nuovo si nota.

Questa pagina crea la **Faida di Brace**: una guerra che trascina dentro gli alleati di entrambe le parti, riceve nomi come "Cinder Feud of Karvia" e si può chiudere con un complotto (plot) di pace come una guerra normale.

## Il codice

```csharp Mods/HelloBox/Code/HelloWars.cs
namespace HelloBox
{
    public static class HelloWars
    {
        public const string FEUD = "hello_ember_feud";
        public const string NAMES = "hello_war_feud";

        public static void Initialize()
        {
            Names();

            if (AssetManager.war_types_library.has(FEUD)) return;

            AssetManager.war_types_library.add(new WarTypeAsset
            {
                id = FEUD,
                name_template = NAMES,                      // the generator for war names, below
                localized_type = "war_type_hello_ember_feud",
                localized_war_name = "war_name_hello_ember_feud",
                path_icon = "wars/war_hello_ember_feud",    // GameResources/wars/war_hello_ember_feud.png
                kingdom_for_name_attacker = true,           // $kingdom$ in the name = the attacker
                alliance_join = true,                       // both sides' allies join
                can_end_with_plot = true                    // a king can plot to end it
            });
        }

        /** War names in the dictionary style: whole words picked from lists. */
        private static void Names()
        {
            if (AssetManager.name_generator.has(NAMES)) return;

            NameGeneratorAsset names = new NameGeneratorAsset
            {
                id = NAMES,
                use_dictionary = true,
                replacer_kingdom = NameGeneratorReplacers.replaceKingdom   // fills $kingdom$
            };
            names.addDictPart("kingdom_name", "$kingdom$");
            names.addDictPart(" ", " ");
            names.addDictPart("of", "of");
            names.addDictPart("ember", "Ember,Cinder,Ash,Smoke,Soot");
            names.addDictPart("feud", "Feud,Quarrel,Grudge,Blaze");
            names.addTemplate("ember, ,feud");
            names.addTemplate("ember, ,feud, ,of, ,kingdom_name");

            AssetManager.name_generator.add(names);
        }

        /** Start one. The game's own wars go through this same method. */
        public static War Start(Kingdom pAttacker, Kingdom pDefender)
        {
            WarTypeAsset feud = AssetManager.war_types_library.get(FEUD);
            if (feud == null || pAttacker == null || pDefender == null) return null;

            // internal: compiles inside NML. It checks there is no war between them already,
            // logs it in the world history, and pulls in the allies when alliance_join is on.
            return World.world.diplomacy.startWar(pAttacker, pDefender, feud);
        }
    }
}
```

`HelloWars.Initialize()` va in `OnModLoad`. Però niente fa partire la tua guerra da solo: le guerre vanilla vengono dal codice di diplomazia del gioco, che conosce solo i suoi cinque tipi. Chiama `HelloWars.Start` dove ha senso: un **[potere divino](#/nml/god-powers)**, un **[complotto](#/nml/plots)** che un re può tentare, o una **[decisione](#/nml/custom-ai)**.

## I campi

| Campo | Cosa fa |
| --- | --- |
| `name_template` | Il generatore di nomi per il nome di questa guerra. Vanilla: `war_conquest`, `war_spite`, `war_rebellion`, `war_inspire`, `war_whisper` |
| `localized_war_name` | La chiave di testo che l'interfaccia mostra come tipo di guerra, nel tooltip e nella finestra della guerra |
| `localized_type` | Una seconda chiave di testo che il gioco tiene per il tipo. Non ho trovato dove viene mostrata, quindi riempile tutte e due |
| `path_icon` | L'icona della guerra, caricata esattamente come scritta |
| `kingdom_for_name_attacker` | Il nome di chi riempie `$kingdom$`: l'attaccante (`true`) o il difensore (`false`) |
| `alliance_join` | Le alleanze di entrambe le parti entrano in guerra quando comincia |
| `total_war` | L'attaccante è in guerra con **tutti** i regni (kingdom), come nelle guerre di rancore. Avviala senza difensore |
| `rebellion` | La segna come ribellione, il che cambia chi può unirsi a chi |
| `can_end_with_plot` | Un re può chiuderla con il complotto di pace, quando è abbastanza vecchia |
| `forced_war` | Letto solo da una funzione di supporto che al momento nessuno chiama. Lascialo spento |

> [!WARNING] Le guerre totali non hanno difensore
> Con `total_war` il difensore è `null`, quindi un modello di nome con `$kingdom$` e `kingdom_for_name_attacker = false` chiede il nome di nessuno. Dai alle guerre totali il nome dell'attaccante :PES2_Shrug:.

## Il testo

```json Mods/HelloBox/Locales/en.json
{
  "war_type_hello_ember_feud": "Ember Feud",
  "war_name_hello_ember_feud": "Ember Feud"
}
```

I nomi veri e propri ("Cinder Grudge of Karvia") vengono generati, quindi non hanno chiavi. Le parole vengono dal dizionario in `Names()`. Se li vuoi tradotti ti servirebbe un generatore per lingua, e nessuna guerra vanilla lo fa.

## La tua icona

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── wars/
        └── war_hello_ember_feud.png
```

Mentre provi, prendine in prestito una vanilla: `wars/war_conquest`, `wars/war_spite`, `wars/war_rebellion` o `wars/war_whisper`.

> [!NOTE] I salvataggi ricordano il tipo per id
> Una guerra salva l'id del suo tipo nel salvataggio. Carica quel mondo senza la tua mod e la guerra chiede un tipo che non esiste più, non riceve niente, e non scommetterei che finisca bene. Un giocatore che toglie una mod a metà guerra è un rischio che non puoi risolvere del tutto, ma vale una riga nella descrizione della tua mod.
