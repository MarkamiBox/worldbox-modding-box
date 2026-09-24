---
title: Riferimento statistiche
group: Contenuto di gioco
subgroup: Architettura e statistiche
icon: :wbstonks:
order: 92
---

# Riferimento statistiche :wbstonks:

Quasi ogni asset che registri possiede un blocco `base_stats`, e quasi ogni pagina successiva a questa ci scrive dentro. Questo è l'elenco di tutto ciò che ti è consentito inserire lì dentro. Tutto il resto è un crash che aspetta il suo momento :PES5_Hmmmm:.

## Come funziona base_stats

`base_stats` è un dizionario da `string` a `float`. La chiave deve essere uno degli id statistica riportati sotto. Scrivere una chiave sconosciuta **non** è innocuo: il setter cerca l'id in `base_stats_library`, riceve `null` e lancia immediatamente una `NullReferenceException` nel tuo `Initialize()`.

Quindi un refuso in una statistica non si limita a fallire silenziosamente. Fa crollare l'intera fase di registrazione, e tutto ciò che viene dopo quella riga non verrà mai eseguito. Tieni i nomi delle statistiche in campi `const string` se ne usi uno in più di un punto.

```csharp
trait.base_stats["damage"] = 15;
trait.base_stats["multiplier_health"] = 0.25f;   // +25%, non x0.25
```

## Da dove arrivano i numeri di un'unità

`Actor.updateStats()` azzera il blocco statistiche dell'unità e lo ricostruisce da zero, esattamente in questo ordine. Io questa tabella la ricontrollo ancora ogni volta:

| # | Fonte | Nota |
| --- | --- | --- |
| 1 | **Sottospecie**, più il relativo blocco maschile o femminile | Se l'unità ne ha una |
| 1b | **Actor asset** | Solo quando **non** c'è alcuna sottospecie. La sottospecie lo *sostituisce*, non si somma sopra |
| 2 | **Clan**, più il relativo blocco maschile o femminile | |
| 3 | **Lingua** | |
| 4 | **Cultura** | |
| 5 | Attributi da leader dai dati propri dell'unità | `diplomacy`, `stewardship`, `intelligence`, `warfare` |
| 6 | Ogni **effetto di stato** attivo | |
| 7 | L'oggetto di **attacco predefinito** | Solo quando disarmata |
| 8 | Ogni **tratto dell'attore** | I tratti legati a un'era vengono saltati se la rispettiva era non è attiva |
| 9 | La sua **personalità** | |
| 10 | Ogni **oggetto equipaggiato**, con i suoi modificatori | |

Due errori tipici:

- **Una sottospecie rimpiazza le statistiche dell'actor asset.** Assegna un valore a `human` e un'unità con sottospecie non lo vedrà mai.
- **La religione non è in questo elenco.** I `base_stats` di un tratto religioso non raggiungono mai l'unità. Vedi **[Tratti di religione](#/nml/religion-traits)**.

Altre due conseguenze:

- Una statistica fissa come `damage` è un **bonus**, non un valore finale. `damage = 15` su un tratto significa "+15 sopra a tutto il resto".
- Una statistica `multiplier_*` è una **frazione aggiunta a 1.0**. `multiplier_health = 0.5` è +50%. `multiplier_health = -0.5` è metà vita.

> [!WARNING] `base_stats` non esiste finché l'asset non viene registrato
> Su un asset creato manualmente il blocco statistiche viene allocato dentro `add()`. Scrivi su `base_stats` prima di quella riga e otterrai una `NullReferenceException`. `clone()` chiama `add()` per te, quindi dopo un clone sei già al sicuro. È il crash più comune nel modding di WorldBox.

## Combat

`damage` e `armor` fanno quasi tutto il lavoro. Il resto serve quando vuoi che un tratto sembri diverso, non solo più forte.

| Statistica | Cosa fa |
| --- | --- |
| `damage` | Danno fisso per colpo |
| `damage_range` | Variazione casuale aggiunta a `damage` |
| `attack_speed` | Rapidità di sferrata degli attacchi |
| `accuracy` | Probabilità di mettere a segno il colpo |
| `critical_chance` | Probabilità di colpo critico |
| `critical_damage_multiplier` | Moltiplicatore di danno critico |
| `armor` | Riduzione fissa del danno subito |
| `range` | Gittata dell'attacco |
| `throwing_range` | Gittata delle armi da lancio |
| `targets` | Quanti bersagli può colpire un singolo attacco |
| `projectiles` | Quanti proiettili vengono scagliati contemporaneamente |
| `knockback` | Quanto un colpo spinge indietro il bersaglio |
| `recoil` | Quanto il colpo spinge indietro *te* |
| `skill_combat` | Abilità marziale |
| `skill_spell` | Abilità magica |
| `status_chance` | Probabilità di applicare uno status associato |
| `area_of_effect` | Raggio d'effetto ad area |

## Body

| Statistica | Cosa fa |
| --- | --- |
| `health` | Salute massima |
| `stamina` | Vigore massimo |
| `mana` | Mana massimo |
| `speed` | Velocità di movimento |
| `mass`, `mass_2` | Massa fisica, usata per respinta e fisica |
| `size` | Dimensione dell'hitbox |
| `scale` | Scala grafica di rendering |
| `max_nutrition` | Cibo massimo stoccabile dall'unità |
| `metabolic_rate` | Velocità di consumo del cibo |
| `construction_speed` | Velocità di costruzione |
| `experience` | Esperienza guadagnata |

## Ciclo di vita

| Statistica | Cosa fa |
| --- | --- |
| `lifespan` | Durata della vita |
| `maturation` | Rapidità di crescita |
| `age_adult` | Età a cui è considerata adulta |
| `age_breeding` | Età a cui può riprodursi |
| `birth_rate` | Frequenza delle nascite |
| `offspring` | Quanti figli per parto |
| `multiplier_offspring` | Variazione percentuale a tale conteggio |
| `mutation` | Probabilità di mutazione di sottospecie |
| `happiness` | Umore di base |

## Solo per civiltà

Non hanno alcun effetto sugli animali. Il gioco le contrassegna con `used_only_for_civs`. Dai `diplomacy` a un lupo e ottieni un lupo molto eloquente che nessuno ascolta :wbwolf:.

| Statistica | Cosa fa |
| --- | --- |
| `diplomacy` | Attributo da leader: negoziazione |
| `warfare` | Attributo da leader: guerra |
| `stewardship` | Attributo da leader: amministrazione |
| `intelligence` | Attributo da leader: apprendimento |
| `army` | Contributo alla dimensione dell'esercito |
| `cities` | Quante città mira ad avere il regno |
| `bonus_towers` | Torri extra che una città può erigere |
| `limit_population` | Tetto massimo di popolazione |
| `limit_clan_members` | Tetto massimo membri del clan |
| `loyalty_traits` | Lealtà derivante dai tratti |
| `loyalty_mood` | Lealtà derivante dall'umore |
| `opinion` | Opinione di base verso gli altri |
| `multiplier_diplomacy` | Variazione percentuale alla diplomazia |
| `multiplier_supply_timer` | Durata delle scorte dell'esercito |
| `personality_aggression` | Peso di aggressività dell'IA |
| `personality_administration` | Peso di amministrazione dell'IA |
| `personality_diplomatic` | Peso di diplomazia dell'IA |
| `personality_rationality` | Peso di razionalità dell'IA |

## Multipliers

Tutti questi sono frazioni aggiunte a 1.0, quindi `0.25` significa +25%.

`multiplier_health` · `multiplier_lifespan` · `multiplier_stamina` · `multiplier_mana` · `multiplier_damage` · `multiplier_crit` · `multiplier_speed` · `multiplier_attack_speed` · `multiplier_mass` · `multiplier_offspring` · `multiplier_diplomacy` · `multiplier_supply_timer`

## base_stats contro base_stats_meta

Ogni tratto contiene **due** blocchi statistiche, e scegliere quello sbagliato è il bug di bilanciamento più diffuso nei mod con meta-tratti:

| Blocco | Dove va a finire |
| --- | --- |
| `base_stats` | Fuso nel possessore, e da lì in **ogni unità** che gli appartiene |
| `base_stats_meta` | Rimane sul possessore. Letto da cultura, clan o sottospecie stessa, mai da un'unità |

```csharp
trait.base_stats["damage"] = 5;             // ogni membro di questa cultura colpisce più forte. Contadini inclusi
trait.base_stats_meta["construction_speed"] = 10;   // il gruppo costruisce più in fretta. Il danno di nessuno cambia
```

Se un bonus deve applicarsi solo ad alcuni membri (solo guerrieri, solo adulti), nessuno dei due blocchi può esprimerlo. Usa un Postfix di Harmony su `Actor.updateStats` e filtralo tu stesso. Vedi **[Patch Harmony](#/nml/harmony-patches)**.

## Tag: le statistiche che non sono numeri

Un blocco `base_stats` trasporta anche un set di **tag**, che sono flag booleani piuttosto che valori. Si fondono come le statistiche, permettendo a un tratto di conferire immunità al fuoco nello stesso identico modo in cui assegna danno:

```csharp
trait.base_stats.addTag("immunity_fire");
trait.base_stats.addTag("fast_swimming");

if (actor.stats.hasTag("immunity_fire")) { }
```

Quelli che il gioco legge direttamente:

| Gruppo | Tag |
| --- | --- |
| Immunità | `immunity_fire` · `immunity_cold` · `building_immunity_fire` · `damaged_by_water` |
| Movimento | `fast_swimming` · `water_creature` · `immovable` · `walk_adaptation_sand` · `walk_adaptation_snow` · `walk_adaptation_swamp` |
| Mente | `strong_mind` · `has_sapience` · `has_emotions` · `has_advanced_memory` · `has_advanced_communication` · `can_read_any_book` · `mad` · `moody` · `unconscious` · `frozen_ai` |
| Comportamento | `ignore_fights` · `love_peace` · `steal_items` · `needs_food` · `needs_mate` · `always_idle_animation` · `stop_idle_animation` · `generate_light` |
| Dieta | `diet_meat` · `diet_meat_insect` · `diet_fish` · `diet_blood` · `diet_grass` · `diet_crops` · `diet_fruits` · `diet_flowers` · `diet_nectar` · `diet_algae` · `diet_vegetation` · `diet_wood` · `diet_minerals` · `diet_tiles` · `diet_same_species` |
| Riproduzione | `reproduction_sexual` · `reproduction_asexual` · `oviparity` · `viviparity` |
| Natura | `civ` · `human` · `elf` · `orc` · `dwarf` · `demon` · `undead` · `magic` · `good` · `evil` · `neutral` · `nature_creature` · `neutral_animals` · `everyone` · `small` · `sliceable` |
| Costruzione | `can_build_in_biome_corruption` · `can_build_in_biome_desert` · `can_build_in_biome_infernal` · `can_build_in_biome_permafrost` · `can_build_in_biome_swamp` · `can_build_in_biome_wasteland` |

A differenza di un nome di statistica, un tag sconosciuto è innocuo: semplicemente non corrisponderà a nulla. Ciò significa anche che un refuso fallirà silenziosamente, quindi copiali con esattezza. Scegli il tuo veleno :wbbre:.

## Leggere i valori dal vivo di un'unità

`base_stats` è la *ricetta*. `stats` su un `Actor` vivo è il *risultato*, dopo che tutto è stato sommato:

```csharp
float finalDamage = actor.stats["damage"];
```

È anche ciò che puoi ritoccare da un Postfix di Harmony su `Actor.updateStats` (vedi **[Patch Harmony](#/nml/harmony-patches)**).

## Aggiungere la tua statistica personale

Puoi registrare un nuovo `BaseStatAsset` in `AssetManager.base_stats_library`, e apparirà nell'inspector venendo calcolato come qualsiasi altro. Ciò che **non** farà è avere un qualsiasi effetto pratico: nulla nel gioco legge una statistica di cui non è a conoscenza. Una statistica personalizzata serve solo come numero che tu stesso leggerai dopo, dalla tua patch Harmony o comportamento.

La maggior parte delle volte la risposta è "usa una statistica esistente", e la seconda è "gestisci un dizionario tuo". Una terza non l'ho ancora trovata.
