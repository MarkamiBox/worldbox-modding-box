---
title: Tratti del regno
group: Contenuto di gioco
subgroup: Tratti e genetica
icon: :wbcrown:
order: 114
---

# Tratti del regno :wbcrown:

Un **tratto del regno** è una politica statale. Non una credenza, né una stirpe: una decisione sancita dalla corona che si applica all'intero reame.

Il gioco vanilla se ne serve per una sola meccanica: le aliquote fiscali. Questo lo rende il più minuto e spoglio dei sette sistemi di tratti, nonché il punto più invitante per introdurre nuove idee. Non c'è alcuna competizione per questo spazio :wbsmirk:.

| | |
| --- | --- |
| Libreria | `AssetManager.kingdoms_traits` |
| Classe | `KingdomTrait` |
| Gruppi | `AssetManager.kingdoms_traits_groups`, classe `KingdomTraitGroupAsset` |
| Proprietario a runtime | `Kingdom`, in `World.world.kingdoms` |
| Prefisso di localizzazione | `kingdom_trait_` |
| Cartella icone predefinita | `ui/Icons/kingdom_traits/` |

> [!WARNING] Le statistiche del regno non raggiungono le unità
> Come per la religione, `kingdom.base_stats` non confluisce mai in un `Actor`. I valori a livello di regno visibili in partita derivano dalle **statistiche personali del sovrano** (`king.stats["cities"]` e simili), non dal blocco tratti del regno.
>
> Di conseguenza, un tratto del regno trasforma la nazione tramite i propri campi dedicati e tramite codice, non mediante `base_stats`.

## I campi delle imposte

I tre campi che appartengono unicamente ai tratti del regno, e l'interezza di ciò che il vanilla compie con questo sistema:

```csharp
KingdomTrait trait = new KingdomTrait
{
    id = "hello_tax_rate_local_brutal",
    group_id = "local_tax",
    is_local_tax_trait = true,
    tax_rate = 0.9f
};
AssetManager.kingdoms_traits.add(trait);
trait.addOpposite("tax_rate_local_low");
```

| Campo | Cosa fa |
| --- | --- |
| `is_local_tax_trait` | Questo tratto definisce l'aliquota fiscale **locale** del regno |
| `is_tribute_tax_trait` | Questo tratto definisce l'aliquota del **tributo** del regno |
| `tax_rate` | L'aliquota vera e propria, espressa come frazione |

Il regno ricalcola entrambe le aliquote da zero non appena i suoi tratti cambiano: parte dal valore predefinito globale in `SimGlobals`, scorre i suoi tratti e permette a ciascun tratto corrispondente di **sovrascrivere** il valore.

> [!WARNING] L'ultimo prevale: dichiara sempre gli opposti
> I tratti fiscali non si sommano. Se un regno detiene due tratti `is_local_tax_trait`, quello che si trova più avanti nell'ordine di iterazione prevarrà tacitamente sull'altro.
>
> Tutti i tratti fiscali vanilla dichiarano l'altro come opposto reciproco per questa precisa ragione. Fai altrettanto su entrambi i lati, altrimenti la tua aliquota rischierà di applicarsi solo a intermittenza :PES5_HmmmmNo:.

## Registrarne uno come si deve

```csharp Mods/HelloBox/Code/HelloKingdomTraits.cs
namespace HelloBox
{
    public static class HelloKingdomTraits
    {
        public const string LEVY = "hello_levy";

        public static void Initialize()
        {
            if (AssetManager.kingdoms_traits.has(LEVY)) return;

            KingdomTrait trait = new KingdomTrait
            {
                id = LEVY,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "miscellaneous",
                path_icon = "ui/Icons/iconHelloKingdom",
                spawn_random_trait_allowed = false,
                can_be_given = true,
                can_be_removed = true
            };

            AssetManager.kingdoms_traits.add(trait);
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed` viene letto una sola volta, all'avvio
> I nuovi regni estraggono i tratti iniziali da una riserva che `BaseTraitLibrary.linkAssets()` costruisce mentre il gioco carica, prima che la tua mod esista. Impostare il flag sul tuo tratto da solo non cambia nulla: il tuo tratto non è mai in quella riserva e non compare mai per caso. Aggiungilo tu, con lo stesso peso che usa vanilla:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.kingdoms_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` è `protected`, quindi questo compila con l'assembly pubblicizzato con cui NML compila già la tua mod. `spawn_random_rate` vale `5` di default: alzalo e il tratto compare più spesso.

## Creare una politica che faccia realmente qualcosa

Poiché `base_stats` non ha effetto, un tratto del regno conquista la sua utilità in due modi alternativi. Entrambi richiedono più lavoro di un numero, ed entrambi ne valgono la pena.

**Una decisione**, la scelta più pulita ed elegante:

```csharp
trait.addDecision("some_decision_id");
// ids are resolved at startup, before your mod: resolve yours
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("some_decision_id") };
```

**Una patch di Harmony che interroga il tratto**, ovvero come strutturare un vero e proprio sistema di leggi di stato. Applica una patch al metodo che regola il comportamento del sovrano e verifica lì i tratti del regno:

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;
        if (!__instance.kingdom.hasTrait(HelloKingdomTraits.LEVY)) return;

        __result *= 1.35f;
    }
}
```

Questo è il modello standard per ogni decreto del regno non fiscale: il tratto funge da interruttore, e la patch provvede al comportamento. Vedi **[Patch di Harmony](#/nml/harmony-patches)**.

## I gruppi vanilla

`tribute` · `local_tax` · `miscellaneous` · `fate`

Quattro gruppi in totale, due dei quali costituiscono la coppia delle imposte. Se stai progettando più di uno o due decreti, crea una scheda dedicata, vedi **[Gruppi di tratti e schede](#/nml/trait-groups)**, con `AssetManager.kingdoms_traits_groups` e `KingdomTraitGroupAsset`.

## I testi

```json Mods/HelloBox/Locales/en.json
{
  "kingdom_trait_hello_levy": "Levy",
  "kingdom_trait_hello_levy_info": "Everyone who can carry a spear, carries a spear."
}
```

## Assegnare il tratto

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addKingdomTrait(HelloKingdomTraits.LEVY);
```

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    kingdom.addTrait(HelloKingdomTraits.LEVY, pRemoveOpposites: true);
}
```

L'asset del regno da cui è stata originata una fazione rappresenta un'entità a parte, vedi **[Regni e fazioni](#/nml/kingdoms)**.

> [!TIP] La stanza vuota
> Sei dei sette sistemi di tratti sono saturi di contenuti vanilla attorno a cui devi districarti. Questo ne conta appena cinque. Se desideri un mod che sembri nativo del gioco senza entrare in attrito con nulla, un set di decreti del regno è la soluzione più agevole :PES2_Cash:.
