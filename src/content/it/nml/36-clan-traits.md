---
title: Tratti dei clan
group: Contenuto di gioco
subgroup: Tratti e genetica
icon: :wbclanroses:
order: 110
---

# Tratti dei clan :wbclanroses:

Un **clan** è una discendenza: una famiglia cresciuta al punto da costituire un'entità propria, con un proprio stendardo, un colore identificativo e una reputazione. Un tratto (trait) di clan è ciò che quel sangue porta con sé.

I tratti di clan sono l'elemento che più si avvicina a un superpotere ereditario nel gioco, e costituiscono l'unico sistema di tratti con una **divisione maschio / femmina** nativa.

| | |
| --- | --- |
| Libreria (library) | `AssetManager.clan_traits` |
| Classe | `ClanTrait` |
| Gruppi | `AssetManager.clan_trait_groups`, classe `ClanTraitGroupAsset` |
| Proprietario a runtime | `Clan`, in `World.world.clans` |
| Prefisso di localizzazione | `clan_trait_` |
| Cartella icone predefinita | `ui/Icons/clan_traits/` |

## Registrarne uno

```csharp Mods/HelloBox/Code/HelloClan.cs
namespace HelloBox
{
    public static class HelloClan
    {
        public const string OLD_BLOOD = "hello_old_blood";

        public static void Initialize()
        {
            if (AssetManager.clan_traits.has(OLD_BLOOD)) return;

            ClanTrait trait = new ClanTrait
            {
                id = OLD_BLOOD,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloClan",
                rarity = Rarity.R1_Rare
            };

            AssetManager.clan_traits.add(trait);

            trait.base_stats["multiplier_health"] = 0.15f;
            trait.base_stats["armor"] = 4;
            trait.base_stats.addTag("immunity_cold");
        }
    }
}
```

I `base_stats` del clan confluiscono in ogni membro del clan, perciò questo rappresenta un vero e proprio sistema di statistiche (stats) a differenza della religione (religion). Consulta l'ordine di unione nel **[Riferimento statistiche](#/nml/stats)**.

## La divisione maschio / femmina

I due campi che nessun'altra classe di tratti possiede:

```csharp
trait.base_stats["health"] = 20;           // ogni membro
trait.base_stats_male["damage"] = 6;       // solo maschi
trait.base_stats_female["intelligence"] = 4;   // solo femmine
```

`Actor.updateStats()` fonde prima `clan.base_stats`, poi `clan.base_stats_male` **oppure** `clan.base_stats_female` in base al sesso dell'unità. Entrambi i blocchi addizionali esistono fin dal principio senza dover essere allocati in `add()`, consentendoti di scrivervi in qualsiasi momento.

## Decisioni: cosa un clan *fa*

I tratti di clan vanilla si basano su decisioni (decision) piuttosto che su azioni dirette, poiché un clan è prima di tutto un fenomeno sociale:

```csharp
trait.addDecision("banish_unruly_clan_members");
trait.addOpposite("hello_new_blood");
```

Una decisione è una scelta IA definita in `AssetManager.decisions_library`. Due tratti di clan vanilla, `blood_pact` e `deathbound`, sono il medesimo tratto con una decisione diversa e sono dichiarati opposti reciproci. È uno schema che vale la pena copiare: due tratti, un solo asse logico, reciprocamente esclusivi.

## Hook di combattimento ed effetti

```csharp
// per ogni colpo andato a segno da un membro del clan
trait.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null) return false;
    return true;
};

// a intervalli regolari, su ciascun membro del clan
trait.special_effect_interval = 2f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreHealth(1);
    return true;
};
```

Verifica sempre i puntatori nulli e restituisci `false` quando non hai fatto nulla. Questi hook vengono eseguiti per ogni membro di ogni clan provvisto del tratto.

## Bloccato dietro un obiettivo

Diversi tratti di clan vanilla sono ricompense anziché scelte predefinite:

```csharp
trait.setUnlockedWithAchievement("achievementSegregator");
```

Un tratto bloccato continua a esistere e a funzionare; il giocatore semplicemente non può sceglierlo nell'editor finché non ha sbloccato l'obiettivo (achievement) relativo. Nota che `BaseTraitLibrary` imposta automaticamente anche `rarity = R3_Legendary` su qualsiasi tratto vincolato in questo modo, così la tua ricompensa sembra all'altezza :gold_star:.

## I gruppi vanilla

`spirit` · `mind` · `body` · `chaos` · `harmony` · `fate` · `special`

Per creare la tua scheda: vedi **[Gruppi di tratti e schede](#/nml/trait-groups)**, con `AssetManager.clan_trait_groups` e `ClanTraitGroupAsset`.

## I testi

```json Mods/HelloBox/Locales/en.json
{
  "clan_trait_hello_old_blood": "Old Blood",
  "clan_trait_hello_old_blood_info": "Their great-grandparents were also difficult to kill."
}
```

## Assegnare il tratto

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addClanTrait(HelloClan.OLD_BLOOD);
```

```csharp
foreach (Clan clan in World.world.clans)
{
    if (clan == null || clan.isRekt()) continue;

    clan.addTrait(HelloClan.OLD_BLOOD, pRemoveOpposites: true);
}
```

Il clan di un'unità si trova su `actor.clan`, e `actor.hasClan()` ti dice se l'unità ne ha uno; moltissime unità non si uniscono mai ad alcun clan.

> [!TIP] I clan sono ristretti, quindi puoi essere generoso
> Una cultura (culture) copre un continente; un clan copre una famiglia, e `limit_clan_members` ne limita le dimensioni complessive. Un tratto di clan può essere molto più incisivo di un tratto culturale senza compromettere la stabilità del mondo, il che rende i clan la sede perfetta per le idee più spettacolari :PES5_Menace:.

## Nuovi clan che estraggono un tratto da soli

Oltre ad assegnarlo manualmente, un tratto di clan può impostare `spawn_random_trait_allowed` per essere estratto alla formazione di un nuovo clan, nello stesso modo in cui una cultura sceglie i suoi tratti iniziali. Stessa trappola di ogni altra pagina sui tratti:

> [!WARNING] `spawn_random_trait_allowed` viene letto una sola volta, all'avvio
> I nuovi clan pescano i loro tratti iniziali da un gruppo che `BaseTraitLibrary.linkAssets()` costruisce durante il caricamento del gioco, prima che la tua mod esista. Impostare il flag sul tuo tratto non cambia nulla da solo: il tuo tratto non è mai in quel gruppo e non apparirà mai per caso su un nuovo clan. Aggiungilo tu stesso, con il peso usato dal gioco vanilla:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.clan_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` è `protected`, quindi compila contro l'assembly pubblicizzata con cui NML compila già la tua mod. `spawn_random_rate` ha valore predefinito `5`: aumentalo e il tratto apparirà più spesso.
