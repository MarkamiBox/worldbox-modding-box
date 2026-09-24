---
title: Oggetti personalizzati
group: Contenuto di gioco
subgroup: Oggetti ed equipaggiamento
icon: :wbcrystalsword:
order: 120
---

# Oggetti personalizzati :wbcrystalsword:

Armi, armature, anelli e amuleti risiedono tutti in `AssetManager.items` come `EquipmentAsset`.

La prima cosa fondamentale da comprendere è che **non esiste un oggetto "spada" generico con un campo materiale da scegliere a runtime**. Esistono `sword_wood`, `sword_stone`, `sword_copper`, `sword_bronze`, `sword_silver`, `sword_iron`, `sword_steel`, `sword_mythril`, `sword_adamantine`. Nove asset distinti, ciascuno con costi, statistiche (stats) e stringa `material` propri. Stessa identica cosa per ogni corazza, arco o amuleto.

Ecco perché clonare non è solo la via più comoda: è l'unica ragionevole.

## I template base

Gli ID che iniziano con `$` sono modelli e contengono l'ossatura logica per un'intera classe di armi:

`$equipment` · `$weapon` · `$melee` · `$range` · `$sword` · `$axe` · `$hammer` · `$spear` · `$bow` · `$helmet` · `$armor` · `$boots` · `$ring` · `$amulet` · `$accessory`

`$sword` imposta già `equipment_subtype`, `is_pool_weapon`, `pool_rate`, l'animazione di fendente, i modelli di denominazione e il `group_id`. Vuoi assolutamente tutto questo.

## Creare un'arma

> [!WARNING] Un'arma senza percorso sprite ammazza il loader
> Per ogni arma da pool il gioco imposta `path_gameplay_sprite` a `items/weapons/w_<id>` e `path_icon` a `ui/Icons/items/icon_<id>`. Lo fa in `post_init()`, durante il suo caricamento, quindi la tua arma non è ancora nella lista e i due campi restano `null`. Il preloader chiama `getSpriteList(null)` e il caricamento muore con `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:.
>
> Impostali tu. Punta ai tuoi file dentro `GameResources/`, oppure riusa una coppia vanilla finché stai testando il resto.

```csharp Mods/HelloBox/Code/HelloItems.cs
namespace HelloBox
{
    public static class HelloItems
    {
        public const string EMBER_BLADE = "hello_sword_ember";

        public static void Initialize()
        {
            if (AssetManager.items.has(EMBER_BLADE)) return;

            // clone() copies every field, renames it, and registers it. No add() afterwards.
            EquipmentAsset blade = AssetManager.items.clone(EMBER_BLADE, "$sword");

            blade.material = "ember";              // the material name used in its display name
            blade.metallic = true;                 // decides hit and clash sounds
            blade.equipment_value = 45;            // "how good is this" score the AI compares
            blade.rigidity_rating = 5;
            blade.quality = Rarity.R2_Epic;        // minimum quality it can roll at

            // What a city needs to forge it.
            blade.setCost(0, "common_metals", 4);
            blade.minimum_city_storage_resource_1 = 10;

            // Stats. clone() already ran add(), so base_stats exists.
            blade.base_stats["damage"] = 9f;
            blade.base_stats["critical_chance"] = 0.08f;
            blade.base_stats["attack_speed"] = 2f;

            blade.path_slash_animation = "effects/slashes/slash_fire";

            // The game derives these two in post_init(), which ran before your mod existed.
            // Set them yourself or the sprite preloader throws on a null path.
            blade.path_gameplay_sprite = "items/weapons/w_hello_sword";   // in-hand sprite in GameResources/
            blade.path_icon = "ui/Icons/items/icon_hello_sword";

            // visible immediately: no need to discover them first
            blade.needs_to_be_explored = false;

            // linkAssets() sorted every item into these lists at startup. Cities forge from
            // the subtype list, and new weapons roll from the pools: skip this and nobody
            // ever makes yours.
            AssetManager.items.equipment_by_subtypes[blade.equipment_subtype].Add(blade);
            if (blade.is_pool_weapon)
            {
                AssetManager.items.pot_weapon_assets_all.Add(blade);
                AssetManager.items.pot_weapon_assets_unlocked.Add(blade);
            }

            // Optional: code that runs on every hit landed with it.
            blade.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                if (pTile == null) return false;

                World.world.drop_manager.spawn(pTile, "fire", 10f, -1f, -1L);
                return true;
            };
        }
    }
}
```

> [!WARNING] Registrato non significa forgiato
> Una città sceglie cosa forgiare da `equipment_by_subtypes` (un elenco per tipo di arma), e le nuove armi generate casualmente pescano da `pot_weapon_assets_all` e `pot_weapon_assets_unlocked`. `ItemLibrary.linkAssets()` compila questi elenchi all'avvio prima del tuo mod. Senza le quattro righe verso la fine, la tua arma esiste e può essere data alle unità, ma nessun fabbro nel mondo la forgerà mai :PES5_Hmmmm:. Armature e accessori utilizzano `pot_equipment_by_groups_all` e `pot_equipment_by_groups_unlocked` (indicizzati per `group_id`) al posto dei due elenchi di armi.


## I campi dell'asset

### Identity

| Campo | Cosa fa |
| --- | --- |
| `material` | Nome del materiale. Parte del nome a schermo e termine di paragone per i potenziamenti dell'IA |
| `equipment_type` | `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet`. Quale slot occupa |
| `equipment_subtype` | `sword`, `axe`, `bow`, … La classe dell'arma. Le culture (culture) hanno preferenze di sottotipo |
| `group_id` | La scheda dell'equipaggiamento. Vedi **[Gruppi di tratti e schede](#/nml/trait-groups)** |
| `attack_type` | Comportamento (behaviour) da mischia o a distanza |
| `quality` | La rarità minima con cui può apparire |
| `rarity`, `pool_rate` | Frequenza di estrazione da parte del generatore |
| `is_pool_weapon` | Se entra nel pool generale delle armi del mondo |

### Costo e valore

Tieni i prezzi sensati. Una spada di ferro da 43 milioni di monete non è bilanciamento, è una truffa :trollface:.

| Campo | Cosa fa |
| --- | --- |
| `setCost(gold, res1, amount1, res2, amount2)` | La chiamata unica che configura tutti i costi. Usala invece di impostarli singolarmente |
| `minimum_city_storage_resource_1` | La città non la forgerà al di sotto di questa scorta |
| `equipment_value` | Quanto l'IA la considera forte. Guida la scelta "questo soldato deve cambiare arma" |
| `durability`, `rigidity_rating` | Durabilità e resistenza |

### Aspetto visivo e resa grafica

| Campo | Cosa fa |
| --- | --- |
| `path_gameplay_sprite` | Lo sprite tenuto in mano dall'unità |
| `colored`, `animated` | Se è colorato dinamicamente, se è animato |
| `path_slash_animation` | L'effetto grafico del fendente |
| `projectile` | Per le armi a distanza, quale proiettile (projectile) scaglia. Vedi **[Proiettili, incantesimi ed effetti](#/nml/projectiles-spells)** |
| `name_class`, `name_templates` | Come vengono denominate le versioni leggendarie |

### Behaviour

Qui un oggetto smette di essere un mucchio di numeri.

| Campo | Cosa fa |
| --- | --- |
| `action_attack_target` | Viene eseguito a ogni colpo andato a segno |
| `action_special_effect` + `special_effect_interval` | Viene eseguito a tempo finché è equipaggiato |
| `item_modifier_ids` | Gli incantesimi (spell) che può ottenere. Vedi **[Incantesimi delle armi](#/nml/item-modifiers)** |
| `addSpell(id)` + `linkSpells()` | Un incantesimo che chi lo porta può lanciare. Il collegamento lo devi chiamare tu, vedi sotto |
| `addCombatAction(id)` | Compila, e su un oggetto non fa niente: un'unità raccoglie le azioni di combattimento dai suoi tratti (trait) (e sottospecie (subspecies), clan, religione (religion)), mai dall'equipaggiamento. Mettilo su un tratto, vedi **[Proiettili, incantesimi ed effetti](#/nml/projectiles-spells)** |

Il gioco trasforma quegli id in oggetti una sola volta, all'avvio, prima che la tua mod venga caricata. Su un oggetto che hai registrato tu, chiudi con `linkSpells()` e imposta `decisions_assets` a mano (non esiste un metodo di collegamento per quello), altrimenti la concessione non fa nulla. Vedi **[IA personalizzata](#/nml/custom-ai)**.

## Un effetto finché viene impugnato

"Chiunque impugni la Lama di Brace diventa Rapido" sembra un tratto su un oggetto. Gli oggetti non hanno tratti, ma eseguono codice con un timer mentre sono equipaggiati (`action_special_effect` dalla tabella sopra), e uno **stato** scade da solo. Quindi l'oggetto continua a riapplicare un breve stato, e quando l'oggetto scompare, lo stato semplicemente si estingue:

```csharp Mods/HelloBox/Code/HelloItems.cs
blade.special_effect_interval = 1f;
blade.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    StatusAsset status = AssetManager.status.get(HelloStatus.CURSED);
    if (status == null) return false;

    // 3 secondi, rinnovato ogni secondo mentre impugnato. Lascia la lama e svanisce
    World.world.statuses.newStatus(actor, status, 3f);
    return true;
};
```

Lo stato richiede `allow_timer_reset = true` (il valore predefinito per un nuovo `StatusAsset`, ma non per tutti quelli vanilla da cui potresti clonare), altrimenti riapplicarlo in anticipo non fa nulla e scadrà nel bel mezzo del combattimento. In HelloBox la lama maledice il suo stesso portatore, che è esattamente ciò che farebbe una lama di brace :wbfacepalm:.

Perché non un tratto: un tratto rimane finché qualcosa non lo rimuove, quindi ti servirebbe un secondo timer per notare che la lama non c'è più e toglierlo. Uno stato si pulisce da solo.

## Il tuo sprite personalizzato

Un oggetto possiede due elementi grafici distinti, ed essi sono campi separati:

```text
HelloBox/
└── GameResources/
    ├── items/
    │   └── weapons/
    │       ├── sprites.json                 <- bottom-center pivot
    │       └── w_hello_sword/
    │           └── w_hello_sword.png        <- what the unit holds
    └── effects/slashes/
        └── slash_fire.png                   <- the swing
```

```csharp
blade.path_gameplay_sprite = "items/weapons/w_hello_sword";
blade.path_slash_animation = "effects/slashes/slash_fire";
```

> [!NOTE] Le armi richiedono una cartella per LoadAll
> Il preloader delle armi invoca `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, che esegue `Resources.LoadAll<Sprite>`. In NeoModLoader, `LoadAll` cerca per nome di cartella. Se `path_gameplay_sprite` è `"items/weapons/w_hello_sword"`, NML cerca una cartella in `GameResources/items/weapons/w_hello_sword/`. Se inserisci un singolo file `w_hello_sword.png` senza la cartella, `LoadAll` non trova alcuna directory, restituisce 0 sprite e il gioco registra `Weapon Texture is Missing`. Inserire lo sprite dentro una cartella con quel nome risolve il problema.

> [!NOTE] Le armi richiedono una cartella per LoadAll
> Il preloader delle armi invoca `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, che esegue `Resources.LoadAll<Sprite>`. In NeoModLoader, `LoadAll` cerca per nome di cartella. Se `path_gameplay_sprite` è `"items/weapons/w_hello_sword"`, NML cerca una cartella in `GameResources/items/weapons/w_hello_sword/`. Se inserisci un singolo file `w_hello_sword.png` senza la cartella, `LoadAll` non trova alcuna directory, restituisce 0 sprite e il gioco registra `Weapon Texture is Missing`. Inserire lo sprite dentro una cartella con quel nome risolve il problema.

> [!NOTE] Le armi necessitano di una cartella per LoadAll
> Il preloader delle armi del gioco invoca `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, che esegue `Resources.LoadAll<Sprite>`. In NeoModLoader, `LoadAll` cerca per nome di cartella. Se `path_gameplay_sprite` è `"items/weapons/w_hello_sword"`, NML cerca una cartella in `GameResources/items/weapons/w_hello_sword/`. Se inserisci soltanto un file isolato `w_hello_sword.png` senza la cartella, `LoadAll` non trova alcuna cartella, restituisce 0 sprite e il gioco registra `Weapon Texture is Missing`. Inserire lo sprite dentro una cartella con quel nome soddisfa pienamente il caricatore.

Lo sprite di un'arma viene disegnato alla scala dell'unità e richiede un punto di perno (pivot) in basso al centro (`PivotX: 0.5, PivotY: 0.0` in `sprites.json`), altrimenti galleggerà a mezz'aria fuori dalla mano (vedi **[Sprite e risorse](#/nml/sprites-and-resources)**).

Lasciare uno dei campi con il valore vanilla (come `"items/weapons/w_sword_iron"`) utilizzerà la grafica originale del gioco, un ottimo modo per pubblicare la tua primissima arma senza disegnare nulla :PESgn_Neat:.

## Un'intera linea di materiali

Stesso problema delle creature: un solo oggetto è raramente ciò che ti serve. Nove materiali significano nove asset, e nove blocchi di codice copiaincollati significano nove posti in cui correggere un errore.

```csharp
private struct Mat
{
    public string Suffix;
    public int Value;
    public float Damage;
    public int Cost;
}

private static readonly Mat[] Mats = new Mat[]
{
    new Mat { Suffix = "copper", Value = 15, Damage = 4f, Cost = 2 },
    new Mat { Suffix = "iron",   Value = 30, Damage = 6f, Cost = 3 },
    new Mat { Suffix = "steel",  Value = 40, Damage = 7f, Cost = 4 },
};

private static void RegisterLine(string pPrefix, string pTemplate)
{
    for (int i = 0; i < Mats.Length; i++)
    {
        string id = pPrefix + "_" + Mats[i].Suffix;
        if (AssetManager.items.has(id)) continue;

        EquipmentAsset item = AssetManager.items.clone(id, pTemplate);
        item.material = Mats[i].Suffix;
        item.metallic = true;
        item.equipment_value = Mats[i].Value;
        item.setCost(0, "common_metals", Mats[i].Cost);
        item.base_stats["damage"] = Mats[i].Damage;
    }
}

// RegisterLine("hello_glaive", "$spear");
```

## I testi di localizzazione

Gli oggetti vengono nominati in modo diverso da qualunque altra cosa in questa guida, traendo tutti in inganno, me compreso :PESgn_Oops:. Il nome visualizzato di un oggetto si calcola così:

```text
translation_key   ?? "item_" + (equipment_subtype ?? id)
```

Quindi la lama sopra, clonata da `$sword`, eredita `equipment_subtype = "sword"` e appare come **Spada** (la chiave vanilla), non come il tuo id. Due vie d'uscita:

```csharp
blade.translation_key = "hello_sword_ember";   // il tuo nome personalizzato, mantenendo il sottotipo spada
```

Oppure lasciare invariato il nome del sottotipo e lasciare che sia il **materiale** a parlare (come fa il gioco vanilla): ogni spada si chiama "Spada", e `sword_iron` viene letta come "Spada di ferro" grazie alla sua chiave materiale.

```json Mods/HelloBox/Locales/en.json
{
  "hello_sword_ember": "Ember Blade",
  "hello_sword_ember_description": "Forged in something that is still angry about it.",

  "item_mat_ember": "Ember"
}
```

| Chiave | Da dove proviene |
| --- | --- |
| `item_<subtype>` o la tua `translation_key` | Il nome |
| `<id>_description` | La descrizione |
| `item_mat_<material>` | La parola del materiale nel nome |

Un nuovo materiale ha **sempre** bisogno della sua chiave `item_mat_`, altrimenti la tua arma apparirà con una chiave grezza appiccicata davanti al nome.

## Mettere l'arma nelle mani di un'unità

Un **asset** è la ricetta. Un **oggetto** è l'effettiva istanza che una specifica creatura impugna, con la sua qualità casuale, i modificatori (modifier) e il nome. Due passaggi:

```csharp
EquipmentAsset asset = AssetManager.items.get(HelloItems.EMBER_BLADE);
if (asset == null || actor == null) return;

// 1. costruisci un oggetto reale dalla ricetta
Item item = World.world.items.generateItem(asset, actor.kingdom, actor.getName(), 1, actor);

// 2. consegnalo - setItem sceglie lo slot corretto in base a equipment_type
actor.equipment.setItem(item, actor);
```

`generateItem` determina qualità e modificatori casuali esattamente come avviene per il bottino generato nel mondo, per cui l'oggetto finale che riceve l'unità non è mai identico all'asset grezzo registrato.

## Strumenti in mano

Il martello che un costruttore impugna e il cesto portato da un raccoglitore non sono oggetti di inventario. Sono **strumenti manuali**: pura grafica visiva, mostrata quando un'attività (task) lo richiede e nascosta al termine.

```csharp Mods/HelloBox/Code/HelloTools.cs
using ai.behaviours;   // BehaviourTaskActor

namespace HelloBox
{
    public static class HelloTools
    {
        public const string TORCH = "hello_torch";

        public static void Initialize()
        {
            if (AssetManager.unit_hand_tools.has(TORCH)) return;

            UnitHandToolAsset torch = new UnitHandToolAsset
            {
                id = TORCH,
                path_gameplay_sprite = "items/tools/tool_hello_torch"   // a folder of frames
            };

            AssetManager.unit_hand_tools.add(torch);

            // loadSprites() ran at startup. An empty list here is a hand holding nothing.
            torch.gameplay_sprites = SpriteTextureLoader.getSpriteList(torch.path_gameplay_sprite);

            // A tool shows up while a task forces it. Give it to the task from the AI page.
            BehaviourTaskActor drive = AssetManager.tasks_actor.get(HelloAI.TASK);
            if (drive != null) drive.force_hand_tool = TORCH;
        }
    }
}
```

Un'attività mostra il proprio strumento tramite `force_hand_tool`, quindi la torcia apparirà ogni volta che una creatura eseguirà l'attività di girovagare descritta in **[IA e comportamenti personalizzati](#/nml/custom-ai)**.

> [!WARNING] Carica i fotogrammi manualmente
> `UnitHandToolLibrary.loadSprites()` compila `gameplay_sprites` per ogni strumento all'avvio del gioco. Uno strumento aggiunto successivamente non ne possiede nessuno e l'unità terrà in mano il vuoto. Il percorso viene letto con `getSpriteList()`, quindi deve trattarsi di una **cartella** di fotogrammi (`items/tools/tool_hello_torch/`), anche nel caso di una singola immagine. Senza un pivot in `sprites.json`, lo strumento si posizionerà al centro dello sprite: perfetto per una torcia, inadatto per un manico lungo.

| Campo | Cosa fa |
| --- | --- |
| `path_gameplay_sprite` | La cartella. Il gioco la ricava dall'ID: `items/tools/tool_<id>` |
| `animated` | Riproduce i fotogrammi in loop, come la tazzina di caffè |
| `colored` | Lo colora con il colore del regno (kingdom), come la bandiera |

> [!TIP] Prima incantamenti, poi armi
> Una nuova arma richiede sprite, una serie di materiali, costi e bilanciamento. Un nuovo **modificatore** richiede solo venti righe e si applica a tutte le armi del gioco, incluse quelle di altri mod. Se vuoi che il gioco offra novità fin da subito, leggi prima **[Incantamenti delle armi](#/nml/item-modifiers)** :PESgn_DoIt:.
