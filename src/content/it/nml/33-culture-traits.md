---
title: Tratti culturali
group: Contenuto di gioco
subgroup: Tratti e genetica
icon: :wbtiphat:
order: 106
---

# Tratti culturali :wbtiphat:

Una **cultura** rappresenta le abitudini condivise da un gruppo di città. Decide cosa costruiscono, cosa forgiano, come ereditano, cosa leggono e a cosa danno valore. Un tratto culturale è una di queste abitudini.

Dei sette sistemi di tratti, la cultura è quello con la portata più ampia. Una cultura si diffonde con le città, sopravvive al suo fondatore e fonde le sue statistiche in ogni singola unità che vi appartiene. Se vuoi una mod il cui effetto si propaghi nel mondo durante un'ora di gioco, questa è la libreria ideale. Grande portata, grande responsabilità :PES5_Menace:.

| | |
| --- | --- |
| Libreria | `AssetManager.culture_traits` |
| Classe | `CultureTrait` |
| Gruppi | `AssetManager.culture_trait_groups`, classe `CultureTraitGroupAsset` |
| Proprietario a runtime | `Culture`, in `World.world.cultures` |
| Prefisso di localizzazione | `culture_trait_` |
| Cartella icone predefinita | `ui/Icons/culture_traits/` |

## Registrarne uno

```csharp Mods/HelloBox/Code/HelloCulture.cs
namespace HelloBox
{
    public static class HelloCulture
    {
        public const string DUELLISTS = "hello_duellists";

        public static void Initialize()
        {
            if (AssetManager.culture_traits.has(DUELLISTS)) return;

            CultureTrait trait = new CultureTrait
            {
                id = DUELLISTS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "warfare",
                path_icon = "ui/Icons/iconHelloCulture",
                priority = 10,                       // un valore più alto ordina in cima al suo gruppo
                spawn_random_trait_allowed = false,  // mai assegnato a caso
                can_be_given = true,                 // il giocatore può aggiungerlo nell'editor
                can_be_removed = true,
                rarity = Rarity.R2_Epic
            };

            AssetManager.culture_traits.add(trait);

            // Attenzione sotto: questo raggiunge i contadini così come i soldati.
            trait.base_stats["critical_chance"] = 0.05f;
        }
    }
}
```

Tutto ciò che trovi su **[Tratti personalizzati](#/nml/custom-traits)** vale anche qui: `add()` prima delle statistiche, `path_icon` non viene generato automaticamente, i prefissi sugli ID sono d'obbligo. Ciò che segue illustra ciò che rende unici i tratti culturali. Ed è la parte divertente.

> [!WARNING] `base_stats` su un tratto culturale raggiunge chiunque
> `Actor.updateStats()` fonde `culture.base_stats` in ogni unità di quella cultura. Ogni singola unità. Una dottrina da "+5 danni" arma persino i fornai.
>
> Se il bonus deve applicarsi solo ad alcuni membri, non inserire nulla in `base_stats` e filtralo tu stesso in un Postfix di Harmony su `Actor.updateStats`, vedi **[Patch di Harmony](#/nml/harmony-patches)**. Se deve applicarsi alla cultura come collettività anziché alle sue persone, usa invece `base_stats_meta`, vedi **[Riferimento statistiche](#/nml/stats)**.

## Guidare cosa forgia una cultura

Questo è il campo che appartiene ai tratti culturali e a nessun altro, ed è il modo più pulito per dare a una cultura un'*identità* tangibile senza toccare una singola arma:

```csharp
trait.value = 10f;                       // quanto pesa la preferenza
trait.addWeaponSubtype("sword");         // preferisci un'intera classe di armi
trait.addWeaponSpecial("hello_relic");   // o uno specifico id oggetto
```

Entrambi gli helper impostano `is_weapon_trait = true` per te. Il codice di creazione legge le armi preferite della cultura quando una città decide cosa fabbricare; in questo modo si cambia l'arma nella mano del soldato piuttosto che un semplice valore numerico. Nel gioco vanilla, `bow_lovers` e `spear_lovers` sono esattamente questo. Un'intera cultura di appassionati di lance, con due righe :PESgn_Noice:.

| Campo | Cosa fa |
| --- | --- |
| `is_weapon_trait` | Contrassegna il tratto come preferenza d'arma |
| `related_weapon_subtype_ids` | Classi di armi preferite. `addWeaponSubtype` accoda qui |
| `related_weapons_ids` | ID di armi specifiche preferite. `addWeaponSpecial` accoda qui |
| `value` | Quanto pesa la preferenza nella scelta |

## Guidare come costruisce una cultura

```csharp
trait.setTownLayoutPlan(pZoneCheckerDelegate);
```

Accetta un `PassableZoneChecker` e imposta `town_layout_plan = true`. È così che funzionano i tratti di pianificazione urbana vanilla: città a pilastri, città dense di strade.

È l'hook più profondo di questa pagina e quello che più facilmente entra in conflitto con un'altra mod, poiché una cultura può seguire un solo piano di layout alla volta. Controlla `town_layout_plan` sui tratti che la cultura possiede già prima di dare per scontato che il tuo sia l'unico.

## I gruppi vanilla

`harmony` · `architecture` · `town_plan` · `kingdom` · `buildings` · `succession` · `knowledge` · `warfare` · `weapons` · `craft` · `happiness` · `worldview` · `miscellaneous` · `fate` · `special`

Per creare la tua scheda: vedi **[Gruppi di tratti e schede](#/nml/trait-groups)**, con `AssetManager.culture_trait_groups` e `CultureTraitGroupAsset`.

## I testi

```json Mods/HelloBox/Locales/en.json
{
  "culture_trait_hello_duellists": "Duellists",
  "culture_trait_hello_duellists_info": "They settle it one at a time, and they practise."
}
```

## Assegnare il tratto

```csharp
// ogni creatura di questa specie inizia con il tratto
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addCultureTrait(HelloCulture.DUELLISTS);
```

```csharp
// o a runtime, sulle culture già esistenti
foreach (Culture culture in World.world.cultures)
{
    if (culture == null || culture.isRekt()) continue;
    if (culture.hasTrait("hello_duellists")) continue;

    culture.addTrait("hello_duellists", pRemoveOpposites: true);
}
```

`hasTrait` e `addTrait` accettano indifferentemente la stringa dell'id o l'asset.

## Verificare un tratto culturale da un'unità

`Actor` fornisce una scorciatoia proprio per questo scopo, trattandosi di una domanda frequente:

```csharp
if (actor.hasCultureTrait("hello_duellists")) { }
```

> [!TIP] Cultura o sottospecie?
> Entrambi si propagano, ma non nello stesso modo. Un tratto **culturale** si diffonde con le città e può essere adottato da chiunque vi si unisca. Un tratto di **sottospecie** si trasmette biologicamente e non può essere acquisito altrimenti. "Gli elfi tirano meglio perché sono stati addestrati così" è cultura; "gli elfi tirano meglio per via dei loro occhi" è sottospecie. Vedi **[Tratti delle sottospecie](#/nml/subspecies-traits)** :catnoted:.
