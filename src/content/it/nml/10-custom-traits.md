---
title: Tratti personalizzati
group: Contenuto di gioco
subgroup: Tratti e genetica
icon: :wbstrongminded:
order: 100
---

# Tratti personalizzati :wbstrongminded:

Un tratto (trait) è un'etichetta permanente su un'unità: *coraggioso*, *veloce*, *immortale*. Compare nell'inspector, può modificare le statistiche (stats) dell'unità, può eseguire codice quando l'unità attacca, viene colpita o muore, e i figli possono ereditarlo.

È anche la cosa più semplice e immediata da aggiungere nell'intero gioco, motivo per cui è il primo mod di chiunque. Il mio no: la mia prima mod era un wrapper attorno alla mod di qualcun altro, che è un modo tutto suo di barare :trollface:.

## Metti sempre un prefisso ai tuoi ID

Ogni asset in WorldBox vive in un'unica lista piatta indicizzata per `id`. Se registri `fast` e un altro mod registra `fast`, il secondo **sovrascrive** il primo e il log registra una riga che nessuno leggerà mai.

Quindi: `hello_swift`, non `swift`. Nome breve del mod, trattino basso, il tuo nome per l'oggetto. Fallo per tratti, oggetti, edifici (building), poteri, status, qualunque cosa :aPES4_Noted:.

## Il tratto

```csharp Mods/HelloBox/Code/HelloTraits.cs
namespace HelloBox
{
    public static class HelloTraits
    {
        // L'id scritto una volta sola. Ogni altro file farà riferimento a HelloTraits.SWIFT,
        // trasformando un refuso in un errore di compilazione invece di un tratto che non fa nulla.
        public const string SWIFT = "hello_swift";

        public static void Initialize()
        {
            // Non registrare mai lo stesso id due volte. La libreria registra un errore e sovrascrive.
            if (AssetManager.traits.has(SWIFT)) return;

            ActorTrait swift = new ActorTrait
            {
                id = SWIFT,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                path_icon = "ui/Icons/iconSpeed",   // un'icona vanilla, rimpiazzala con la tua in seguito
                group_id = "physique",              // in quale scheda del libro dei tratti va a posizionarsi
                rate_birth = 0,                     // 0 = non appare mai spontaneamente alla nascita
                can_be_given = true,                // il giocatore può assegnarlo nell'editor dei tratti
                can_be_removed = true,
                can_be_cured = false
            };

            // add() registra il tratto E alloca il suo blocco statistiche. Entrambi, in questo ordine.
            AssetManager.traits.add(swift);

            swift.base_stats["speed"] = 20f;
            swift.base_stats["attack_speed"] = 10f;
            swift.base_stats["damage"] = 5;
        }
    }
}
```

E una riga in `Main.cs`:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");
    HelloTraits.Initialize();
}
```

### Cosa fa ciascuna parte

- **`AssetManager.traits`**: La libreria (library) che raccoglie ogni tratto delle unità nel gioco, vanilla e moddato. `has`, `get`, `add` e `clone` sono i quattro metodi che utilizzerai su ogni libreria in ogni pagina a seguire.
- **`path_icon`**: La piccola icona nell'inspector. Un *percorso*, non un file con estensione. Vedi **[Sprite e risorse](#/nml/sprites-and-resources)**. Il gioco la imposta automaticamente solo durante la costruzione delle librerie interne (che avviene prima del caricamento dei mod), quindi per il tuo tratto risulterà vuota se non la imposti.
- **`needs_to_be_explored`**: `true` di default, cioè il tratto resta bloccato nel libro (book) della conoscenza finché il giocatore non lo trova in un mondo. `false` lo rende disponibile dal primo secondo. HelloBox lo mette su tutto, così vedi quello che hai costruito senza doverlo cercare.
- **`group_id`**: La scheda del libro dei tratti in cui compare. L'elenco completo è riportato sotto.
- **`rate_birth`**: La probabilità che un neonato lo riceva naturalmente. `0` significa "solo se conferito esplicitamente da qualcosa".
- **`can_be_given` / `can_be_removed`**: Se il giocatore può aggiungerlo o toglierlo nell'editor dei tratti. Entrambi sono `true` per impostazione predefinita; impostane uno su `false` per un tratto permanente o riservato al tuo codice.
- **`base_stats[...]`**: I bonus alle statistiche. L'elenco completo dei nomi delle statistiche è disponibile nella pagina **[Riferimento statistiche](#/nml/stats)**.

> [!WARNING] Le statistiche vanno **dopo** `add()`, sempre
> Un `ActorTrait` appena istanziato non ha alcun blocco statistiche. La libreria lo alloca dentro `add()`. Se tocchi `base_stats` prima di quella riga otterrai il crash più comune nel modding di WorldBox:
> `NullReferenceException: Object reference not set to an instance of an object`
>
> Stessa identica regola per status, oggetti, edifici e creature. L'unica eccezione è `clone()`, che chiama `add()` per te.

> [!TIP] Lo stesso interruttore c'è su quasi tutto quello che crei
> `needs_to_be_explored` sta nella classe base che tutti gli asset sbloccabili condividono, quindi funziona su attori, tutti e sette i tipi di tratto, oggetti, modificatori (modifier) e leggi del mondo (world law). Poteri divini (GodPower), status, edifici, drop, nuvole (cloud), tile e proiettili (projectile) non hanno proprio una fase di scoperta :wbsmirk:.

### I gruppi di tratti vanilla

`group_id` deve essere un gruppo esistente, altrimenti il tuo tratto non finirà da nessuna parte:

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

Vuoi una scheda tutta tua? Vedi **[Gruppi di tratti e schede](#/nml/trait-groups)**.

## I testi di localizzazione

Senza traduzioni il tuo tratto mostrerà in gioco la chiave grezza `trait_hello_swift`, che ha esattamente l'aria professionale che immagini :pepeclown:. Crea `Locales/it.json`:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money."
}
```

La chiave **non** è l'id nudo. Ogni tipo di tratto lo fa precedere dal proprio prefisso di categoria:

| Tipo di tratto | Chiave del nome | Chiave della descrizione |
| --- | --- | --- |
| Actor trait | `trait_<id>` | `trait_<id>_info` |
| Culture trait | `culture_trait_<id>` | `culture_trait_<id>_info` |
| Religion trait | `religion_trait_<id>` | `religion_trait_<id>_info` |
| Subspecies trait | `subspecies_trait_<id>` | `subspecies_trait_<id>_info` |
| Clan trait | `clan_trait_<id>` | `clan_trait_<id>_info` |
| Language trait | `language_trait_<id>` | `language_trait_<id>_info` |
| Kingdom trait | `kingdom_trait_<id>` | `kingdom_trait_<id>_info` |

Esiste anche una seconda riga descrittiva, `<prefix>_<id>_info_2`, per i tratti che ne necessitano una.

## La tua icona personalizzata

`path_icon` è un percorso, e il file va posizionato esattamente a quel percorso dentro la cartella `GameResources/` del tuo mod. Nessuna estensione nella stringa.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSwift.png
```

```csharp
swift.path_icon = "ui/Icons/iconHelloSwift";
```

Le icone dei tratti sono piccole e vengono disegnate a circa 32x32. Metti il tuo PNG in una cartella a tuo piacimento: `ui/Icons/hellobox/iconSwift` funziona altrettanto bene, l'importante è che coincida con la stringa.

Gli altri sei sistemi di tratti hanno ciascuno la propria cartella vanilla (`ui/Icons/culture_traits/`, `religion_traits/`, `clan_traits/` ecc.). Non sei obbligato a usarle, ma affiancarti ai tratti che stai clonando rende le tue risorse (resource) molto più facili da ritrovare. Tabella completa su **[Sprite e risorse](#/nml/sprites-and-resources)**.

## Far *fare* qualcosa a un tratto

Le statistiche sono statiche. Un tratto può anche eseguire il tuo codice in quattro momenti precisi:

```csharp
// ogni pochi secondi, mentre l'unità è in vita
swift.special_effect_interval = 3f;
swift.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreStamina(5);
    return true;
};

// quando l'unità muore
swift.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };

// quando l'unità subisce un colpo
swift.action_get_hit = (BaseSimObject pSelf, BaseSimObject pAttacker, WorldTile pTile) => { return true; };

// ogni volta che uno degli attacchi dell'unità va a segno, subito dopo il danno
swift.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor self = pSelf as Actor;
    // pTarget può essere un edificio, e il colpo potrebbe averlo appena distrutto
    if (self == null || !self.isAlive() || pTarget == null) return false;

    self.restoreHealth(2);
    return true;
};
```

Due regole ferree per tutti e quattro: **controlla il null e controlla che l'unità sia viva come primissima cosa**, e restituisci `false` quando non hai fatto nulla. Questi delegati vengono eseguiti per ogni unità che ha il tratto, per sempre.

> [!NOTE] `action_birth` e `action_growth` esistono, e qui non scattano mai
> `ActorTrait` eredita entrambi i campi, quindi compilano. Il gioco li legge solo dai tratti di **sottospecie** (subspecies): unisce i tratti di una sottospecie in un unico callback di nascita e uno di crescita e chiama quelli. Su un tratto di creatura restano lì senza fare nulla, silenziosamente :wbreally:. Se vuoi "quando un'unità nasce", rendilo un tratto di sottospecie: **[Tratti di sottospecie](#/nml/subspecies-traits)**.

### Quando il tratto viene ottenuto, perso o caricato

Altri tre hook girano una volta sola invece che di continuo. Usano un delegato diverso, `WorldActionTrait`, che ti passa il possessore come `NanoObject` e il tratto stesso:

```csharp
// una volta sola, nel momento in cui addTrait() lo mette su un'unità
swift.action_on_augmentation_add = (NanoObject pTarget, BaseAugmentationAsset pTrait) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreHealth(actor.getMaxHealth());   // un regalo di benvenuto, una volta sola
    return true;
};
```

| Campo | Quando gira |
| --- | --- |
| `action_on_augmentation_add` | `addTrait()` è andato a buon fine |
| `action_on_augmentation_remove` | `removeTrait()` lo ha tolto, anche quando un altro tratto lo ha espulso come opposto o tramite `traits_to_remove` |
| `action_on_augmentation_load` | Un mondo salvato è stato caricato e l'unità è tornata con il tratto |

Un'unità caricata riottiene i suoi tratti **senza** passare da `addTrait()`, quindi `_add` non gira di nuovo. Se `_add` prepara qualcosa che il salvataggio non conserva, rifallo in `_load`.

## Opposti ed esclusioni reciproche

Il modo vanilla è `addOpposite("slow")` e `traits_to_remove_ids`. Entrambi scrivono solo **id**, e il gioco trasforma quegli id negli insiemi che legge davvero una volta sola, durante il caricamento, prima che la tua mod esista. Sul tuo tratto non fanno nulla :wbfacepalm:. Riempi tu stesso i campi risolti, dopo `add()`:

```csharp
ActorTrait slow = AssetManager.traits.get("slow");
if (slow != null)
{
    // addTrait() controlla solo l'insieme del NUOVO tratto, quindi riempi entrambi i lati:
    // altrimenti un'unità lenta rifiuta swift, ma un'unità swift diventa lenta senza problemi
    swift.opposite_traits = new HashSet<ActorTrait> { slow };
    if (slow.opposite_traits == null) slow.opposite_traits = new HashSet<ActorTrait>();
    slow.opposite_traits.Add(swift);
}

// ottenere swift rimuove questi; il gioco legge l'array, non gli id
ActorTrait fat = AssetManager.traits.get("fat");
if (fat != null) swift.traits_to_remove = new ActorTrait[] { fat };
```

`HashSet` richiede `using System.Collections.Generic;` in cima al file.

> [!WARNING] `opposite_trait_mod` richiede `opposite_traits`
> `opposite_trait_mod` cambia quanto due unità si piacciono quando una ha un opposto del tratto dell'altra. Il codice sociale scorre `opposite_traits` senza un controllo di nullità, quindi impostare il modificatore e lasciare l'insieme `null` lancia `NullReferenceException` la prima volta che due unità si valutano a vicenda. Dai un valore all'insieme, anche vuoto.

## Rarità

`rarity` decide il colore del nome e la riga di rarità nel tooltip del tratto, e `Rarity.R3_Legendary` ottiene anche la cornice speciale leggendaria. I valori sono `R0_Normal`, `R1_Rare`, `R2_Epic` e `R3_Legendary`.

Per i tratti vanilla è quasi automatico: mentre il gioco carica, la libreria conta cosa fa ciascun tratto (azioni, decisioni, incantesimi, azioni di combattimento, tag) e alza a `R1_Rare` o `R2_Epic` tutto ciò che fa qualcosa. Il tuo tratto arriva dopo quel passaggio, quindi mantiene ciò che hai scritto, e se non hai scritto nulla quello è il valore predefinito, `R1_Rare`, per quanto faccia. Impostalo tu stesso:

```csharp
swift.rarity = Rarity.R2_Epic;
```

## Sbloccarlo da codice

Con `needs_to_be_explored = true` il tratto parte bloccato nel libro della conoscenza. `unlock()` è il modo in cui il gioco lo scopre:

```csharp
AssetManager.traits.get(HelloTraits.SWIFT)?.unlock();
```

Aggiunge l'id ai progressi del giocatore, mostra il suggerimento "nuova conoscenza" e salva il file dei progressi. `unlock(false)` salta il salvataggio: usalo quando sblocchi più cose di fila, poi chiama `GameProgress.saveData()` una volta sola alla fine. Restituisce `false` e non fa nulla quando il tratto è già disponibile, e un tratto con `needs_to_be_explored = false` lo è sempre. Chiamalo dal gameplay, quando il giocatore se lo è guadagnato: è il suo vero file di progressi, e resta sbloccato in ogni mondo successivo.

`unlocked_with_achievement` è già `false` di default. Scrivere `unlocked_with_achievement = false` non cambia nulla.

## Assegnare il tratto a un'unità

```csharp
actor.addTrait(HelloTraits.SWIFT);

if (actor.hasTrait(HelloTraits.SWIFT))
{
    // ...
}
```

> [!WARNING] `spawn_random_trait_allowed` viene letto una sola volta, all'avvio
> Le nuove unità estraggono i tratti iniziali da una riserva che `BaseTraitLibrary.linkAssets()` costruisce mentre il gioco carica, prima che la tua mod esista. Impostare il flag sul tuo tratto da solo non cambia nulla: il tuo tratto non è mai in quella riserva e non compare mai per caso. Aggiungilo tu, con lo stesso peso che usa vanilla:
>
> ```csharp
> swift.spawn_random_trait_allowed = true;
> AssetManager.traits._pot_allowed_to_be_given_randomly.AddTimes(swift.spawn_random_rate, swift);
> ```
>
> `_pot_allowed_to_be_given_randomly` è `protected`, quindi questo compila con l'assembly pubblicizzato con cui NML compila già la tua mod. `spawn_random_rate` vale `5` di default: alzalo e il tratto compare più spesso.

## Verificare che funzioni

Avvia il gioco, apri un'unità, apri l'editor dei tratti e controlla nella scheda `physique`. Non c'è? Il log sa perché, e la risposta è quasi sempre una di tre cose: `can_be_given` è false, `group_id` non esiste, o `path_icon` punta nel vuoto :wbreally:.

## Gli altri sei tipi di tratti

I tratti di creatura sono solo uno di **sette** sistemi di tratti. Ognuno ha la propria libreria, i propri gruppi e la propria entità di appartenenza, e tutti seguono esattamente la struttura spiegata in questa pagina. Cambiano solo il nome della classe, la libreria e il prefisso di localizzazione.

| Sistema | Appartiene a | Pagina |
| --- | --- | --- |
| Actor | una singola creatura | questa pagina |
| Culture | una cultura, condivisa dalle sue città | **[Tratti di cultura](#/nml/culture-traits)** |
| Religion | una religione (religion) e i suoi fedeli | **[Tratti di religione](#/nml/religion-traits)** |
| Subspecies | un ramo di una specie | **[Tratti di sottospecie](#/nml/subspecies-traits)** |
| Clan | una dinastia di sangue | **[Tratti di clan](#/nml/clan-traits)** |
| Language | una lingua e tutti coloro che la parlano | **[Tratti di lingua](#/nml/language-traits)** |
| Kingdom | la politica di un regno (kingdom) | **[Tratti di regno](#/nml/kingdom-traits)** |

Scegli il possessore prima di scrivere il tratto. "Gli elfi tirano meglio con l'arco" è un tratto di cultura se deve diffondersi con le loro città, un tratto di sottospecie (subspecies) se deve trasmettersi geneticamente, e un tratto di creatura se appartiene a uno specifico individuo. Sbagliare questo è la differenza tra un mod che trasforma il mondo in un'ora e uno che non fa assolutamente nulla :PES_ThinkAboutIt:.
