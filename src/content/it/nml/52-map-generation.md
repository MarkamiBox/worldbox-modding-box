---
title: Generazione della mappa
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbworld:
order: 169
---

# Generazione della mappa :wbworld:

La finestra del nuovo mondo legge tre librerie. `map_sizes` è il selettore di dimensione, `map_gen_templates` è la fila di carte per la forma (`continent`, `islands`, `donut`...), e `map_gen_settings` sono gli slider e gli interruttori che ottieni dopo aver scelto una carta. Tutte e tre sono normali librerie di asset. Solo una di loro è plug and play, e ti dirò quali parti richiedono lavoro sull'UI prima che tu lo scopra a tue spese.

## Una mappa più grande

Una dimensione è un `MapSizeAsset`, e sono quattro campi:

| Campo | Cosa fa |
| --- | --- |
| `id` | Anche la chiave di traduzione, con un prefisso: `map_size_<id>` |
| `size` | Il lato della mappa in blocchi da 64 tile. `iceberg` è `9`, quindi 576 x 576 |
| `path_icon` | L'icona accanto al nome della dimensione, relativa a `ui/Icons/` |
| `show_warning` | Sostituisce il saluto della finestra con l'avviso "questa mappa è grande" |

Le dimensioni vanilla: `tiny` 2 · `small` 3 · `standard` 4 · `large` 5 · `huge` 6 · `gigantic` 7 · `titanic` 8 · `iceberg` 9.

```csharp Mods/HelloBox/Code/HelloMapGen.cs
namespace HelloBox
{
    public static class HelloMapGen
    {
        public const string COLOSSAL = "hello_colossal";

        public static void Initialize()
        {
            AddColossal();
            AddRing();
        }

        public const string RING = "hello_ring";

        private static void AddRing()
        {
            if (AssetManager.map_gen_templates.has(RING)) return;

            MapGenTemplate ring = AssetManager.map_gen_templates.clone(RING, "donut");

            // values è un oggetto semplice, quindi il clone condivide quello di donut. dagliene uno tutto suo prima di toccarlo
            ring.values = new MapGenValues
            {
                gradient_round_edges = true,
                add_center_gradient_land = true,
                add_center_lake = true,
                ring_effect = true,
                perlin_noise_stage_2 = true,
                random_shapes_amount = 3
            };

            // il reset copia da una tabella di backup riempita all'avvio, e il tuo id non c'è
            ring.show_reset_button = false;
        }

        public static void OpenRing()
        {
            if (!AssetManager.map_gen_templates.has(RING)) return;

            Config.current_map_template = RING;
            ScrollWindow.showWindow("new_world_templates_2");
        }

        private static void AddColossal()
        {
            if (AssetManager.map_sizes.has(COLOSSAL)) return;

            AssetManager.map_sizes.add(new MapSizeAsset
            {
                id = COLOSSAL,
                size = 10,                   // 10 x 64 = 640 tile per lato
                path_icon = "iconIceberg",   // ui/Icons/ viene aggiunto per te
                show_warning = true
            });

            // il selettore di dimensione legge un array costruito in linkAssets(), eseguito prima della tua mod
            AssetManager.map_sizes.linkAssets();
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "map_size_hello_colossal": "Colossal"
}
```

> [!WARNING] Senza `linkAssets()` la dimensione è irraggiungibile
> Le frecce nella finestra non scorrono la libreria. Scorrono un semplice `string[]` che `MapSizeLibrary.linkAssets()` costruisce una volta all'avvio, prima che NML carichi la tua mod. La tua dimensione è registrata, e le frecce ci passano dritte accanto per sempre. Richiamare `linkAssets()` di nuovo ricostruisce solo quell'array, quindi è sicuro.

Le frecce seguono l'ordine di `list`, quindi una dimensione aggiunta finisce dopo `iceberg`, che è dove appartiene una mappa più grande. Una più piccola vuole `list.Remove` e `list.Insert(0, ...)` prima della chiamata a `linkAssets()`.

Quello che posso dirti sui limiti, dal codice:

- **Il caricamento su Workshop la rifiuta.** Il caricamento controlla la dimensione contro `Config.maxMapSize`, che è `iceberg`, e rifiuta qualsiasi cosa più grande con "Not a valid world size!".
- **Senza la tua mod, la lista dei salvataggi mostra numeri grezzi.** Il browser dei salvataggi cerca la dimensione per il suo numero e ripiega su "larghezza x altezza" quando nulla corrisponde. Se un salvataggio del genere si carica in modo pulito senza la tua mod, non l'ho testato.
- **Non ho testato fin dove si può arrivare.** `10` è il 23% in più di tile rispetto a `iceberg`, e ogni passo dopo quello costa di più. Da qualche parte lassù c'è un numero che ai computer dei tuoi giocatori non piacerà :PES5_Hmmmm:.

## Una nuova forma di mondo

Un template è un `MapGenTemplate`. La ricetta vera e propria vive nel suo `values`, il resto decide come viene presentato:

| Campo | Cosa fa |
| --- | --- |
| `values` | Un `MapGenValues`: i flag e i numeri che il generatore legge. Vedi sotto |
| `path_icon` | L'immagine di anteprima, percorso completo: `ui/new_world_templates_icons/template_donut` |
| `force_height_to` | Imposta ogni tile a questa altezza dopo il primo passaggio di rumore, prima che il resto lo modelli. `0` lo salta |
| `freeze_mountains` | Congela le cime delle montagne una volta che il terreno è finito |
| `perlin_replace` | Sostituzioni di tile in base all'altezza, tipo "sopra 170, `soil_high` diventa `soil_low`" |
| `special_anthill`, `special_checkerboard`, `special_cubicles` | Attivano uno dei tre generatori cablati |
| `allow_edit_*` | Quali righe di impostazioni vede il giocatore per questo template. Vedi la sezione successiva |
| `show_reset_button` | Se la finestra ha un pulsante "reset" |

Gli id vanilla, tutti sorgenti valide per `clone()`: `continent` · `box_world` · `islands` · `toast` · `pancake` · `boring_plains` · `checkerboard` · `cubicles` · `dormant_volcano` · `cheese` · `bad_apple` · `donut` · `lasagna` · `chaos_pearl` · `anthill` · `empty`.

E i campi di `MapGenValues` che vale la pena conoscere:

| Campo | Cosa fa |
| --- | --- |
| `main_perlin_noise_stage`, `perlin_noise_stage_2`, `perlin_noise_stage_3` | I tre passaggi di rumore che creano il terreno |
| `perlin_scale_stage_1` / `_2` / `_3` | Quanto è ingrandito ogni passaggio. `5` di default |
| `gradient_round_edges` / `square_edges` | Sfuma l'altezza verso il bordo della mappa, in cerchio o in quadrato |
| `add_center_gradient_land`, `add_center_lake`, `center_gradient_mountains` | Spinge terra, un lago o montagne verso il centro |
| `ring_effect` | Un passaggio di rumore extra a forma di anello |
| `add_mountain_edges` / `remove_mountains` | Un bordo di montagne attorno alla mappa / appiattisce le montagne a terreno normale |
| `low_ground` / `high_ground` | Abbassa o alza il terreno dopo i passaggi di rumore |
| `random_shapes_amount` | Quante forme casuali vengono stampate sopra |
| `random_biomes`, `add_vegetation`, `add_resources` | Gli ultimi tre sono `true` di default |

`AddRing()` sopra clona un template vanilla e gli dà una ricetta tutta sua. Tieni tutti e tre i metodi nella stessa classe `HelloMapGen`.

```json Mods/HelloBox/Locales/en.json
{
  "template_hello_ring": "Ember Ring",
  "template_hello_ring_info": "A lake in the middle, land around it, and nobody asked for it."
}
```

> [!WARNING] Nascondi il pulsante reset sui tuoi template
> "Reset" chiama `resetTemplateValues()`, che legge i valori predefiniti del template da un dizionario riempito una volta all'avvio con gli id vanilla. Il tuo non c'è, quindi il pulsante lancia `KeyNotFoundException`. `show_reset_button = false` e il problema non esiste.

> [!WARNING] Un template clonato condivide il suo `values`
> `clone()` copia le liste in nuove liste, ma `values` è una classe semplice, quindi viene copiata per riferimento (vedi **[Librerie di asset](#/nml/asset-libraries)**). Modifica `ring.values.ring_effect` senza la riga `new MapGenValues` e ogni donut vanilla cambia con esso. Le voci dentro `perlin_replace` sono condivise allo stesso modo: costruiscine di nuove invece di modificarle.

### La trappola: non c'è nessuna carta

Il selettore dei template è un prefab. Ha un pulsante per ogni template vanilla, e ogni pulsante trova il proprio template dal nome del proprio GameObject. Un nuovo template non ottiene nessun pulsante, e nulla nella libreria lo cambia.

Quello che funziona è fare tu stesso il lavoro del pulsante: imposta il template, poi apri la seconda finestra, esattamente come fa una carta vanilla.

Chiama `HelloMapGen.OpenRing()` dal tuo pulsante.

Attaccalo a un pulsante semplice, vedi **[Schede e pulsanti di potere](#/nml/power-buttons)**, e il giocatore ottiene la tua anteprima, le tue righe di impostazioni, le frecce della dimensione e il pulsante di generazione, come qualsiasi template vanilla. Mettere una vera carta nel selettore significa clonare uno dei suoi pulsanti e rinominare il clone prima che il suo `Awake()` venga eseguito, perché è lì che legge il suo nome. Quella è chirurgia sull'UI che non ho verificato, quindi non è in questa pagina.

> [!NOTE] Modificare un template vanilla invece
> `AssetManager.map_gen_templates.get("islands").values.random_shapes_amount = 10;` funziona, e non serve nessun pulsante. Sappi solo che "reset" ripristina la copia dell'avvio, presa prima che la tua mod si caricasse. Un clic e la tua modifica sparisce fino al prossimo riavvio.

## Le righe sotto un template

Ogni slider e interruttore nella seconda finestra è un `MapGenSettingsAsset`:

| Campo | Cosa fa |
| --- | --- |
| `is_switch` | On/off invece di un numero |
| `min_value` / `max_value` | L'intervallo, per un numero |
| `allowed_check` | Dato il template corrente, se questa riga viene mostrata |
| `action_get` / `action_set` | Legge e scrive il valore, di solito sul `values` del template corrente |
| `increase` / `decrease` / `action_switch` | Cosa fanno le frecce e l'interruttore |

Le righe vanilla: `gen_perlin_scale_stage_1` · `gen_perlin_scale_stage_2` · `gen_perlin_scale_stage_3` · `gen_random_shapes` · `gen_cubicles_sizes` · `gen_random_biomes` · `gen_mountain_edges` · `gen_add_vegetation` · `gen_add_resources` · `gen_add_center_lake` · `gen_add_center_land` · `gen_round_edges` · `gen_square_edges` · `gen_ring_effect` · `gen_low_ground` · `gen_high_ground` · `gen_remove_mountains` · `gen_forbidden_knowledge`.

La parte che una mod usa davvero: l'`allowed_check` di ogni riga vanilla legge uno dei flag `allow_edit_*` del tuo template. Quindi non aggiungi righe, scegli quali di queste ottiene il giocatore:

```csharp
// in AddRing(), dopo il clone: nascondi tutto, poi restituisci le righe che hanno senso per un anello
AssetManager.map_gen_templates.disableNormalSettings(ring);
ring.allow_edit_random_biomes = true;
ring.allow_edit_random_vegetation = true;
```

Dettaglio divertente: tutti e tre gli slider perlin controllano `allow_edit_perlin_scale_stage_1`. I flag `_2` e `_3` esistono e nessuno li legge :PES2_Shrug:.

Un nuovo `MapGenSettingsAsset` da solo non mostra nulla. Le righe sono cablate nel prefab della finestra e trovano il loro asset dal nome del GameObject, lo stesso trucco delle carte dei template. Una riga tutta tua significa clonare una riga esistente dentro la finestra, e qualsiasi cosa registri deve avere `allowed_check` impostato, perché la finestra lo chiama su ogni riga senza controllo di nullità.

> [!TIP] Parti dalla forma, non dalle impostazioni
> Nove volte su dieci, quello che vuoi è un template con un `values` diverso e un pulsante che lo apre. Non serve nessuna modifica al prefab. Ricontrolla i campi dopo ogni aggiornamento di gioco. Una volta che il terreno ha l'aspetto giusto, **[Biomi](#/nml/biomes)** decide cosa ci cresce sopra :PES2_Wise:.
