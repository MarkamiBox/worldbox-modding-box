---
title: Gruppi di tratti e schede
group: Contenuto di gioco
subgroup: Tratti e genetica
icon: :wbfamilies:
order: 102
---

# Gruppi di tratti e schede :wbfamilies:

Ogni tratto (trait) appartiene a un **gruppo**, ed è il gruppo che disegna una scheda nel libro (book) dei tratti. Se aggiungi sei tratti e li scarichi tutti in `miscellaneous`, svaniscono in una lista che nessuno scorre mai :PES4_Invisible:.

Avere una tua scheda personale costa quattro righe.

## Cos'è un gruppo

Un gruppo è un `BaseCategoryAsset`, ovvero l'asset più minuscolo dell'intero gioco:

| Campo | Cosa fa |
| --- | --- |
| `id` | Ciò a cui punta il `group_id` di un tratto |
| `name` | La **chiave di localizzazione** per l'etichetta della scheda. Non il testo diretto |
| `color` | Stringa esadecimale. Tinge la scheda e i tratti al suo interno |
| `show_counter` | Se la scheda mostra "3 / 12". `true` per impostazione predefinita |

## La tua scheda personale

```csharp Mods/HelloBox/Code/HelloGroups.cs
namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";

        public static void Initialize()
        {
            if (AssetManager.trait_groups.has(TRAITS)) return;

            AssetManager.trait_groups.add(new ActorTraitGroupAsset
            {
                id = TRAITS,
                name = "trait_group_" + TRAITS,   // la chiave di lingua, non il testo diretto
                color = "#7FE7C4"
            });
        }
    }
}
```

Fai puntare i tuoi tratti verso di essa:

```csharp
ActorTrait swift = new ActorTrait
{
    id = HelloTraits.SWIFT,
    group_id = HelloGroups.TRAITS,
    path_icon = "ui/Icons/iconSpeed"
};
AssetManager.traits.add(swift);
```

E dai un nome alla scheda:

```json Mods/HelloBox/Locales/en.json
{
  "trait_group_hello_traits": "HelloBox"
}
```

> [!WARNING] Gruppi prima dei tratti contenuti in essi
> Un tratto il cui `group_id` punta a un gruppo che ancora non esiste non ha alcun posto dove essere disegnato. In `OnModLoad`, `HelloGroups.Initialize()` va assolutamente posizionato prima di `HelloTraits.Initialize()`.

## I gruppi vanilla dei tratti degli attori

Usa uno di questi quando non desideri una scheda tutta tua:

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

## Dove appare la tua scheda

I gruppi vengono disegnati nell'ordine di `list`, e `add()` inserisce il tuo in fondo. Per affiancarlo a uno affine, spostalo subito dopo:

```csharp
ActorTraitGroupAsset group = AssetManager.trait_groups.get(HelloGroups.TRAITS);
int index = AssetManager.trait_groups.list.FindIndex(g => g.id == "physique");

if (group != null && index != -1)
{
    AssetManager.trait_groups.list.Remove(group);
    AssetManager.trait_groups.list.Insert(index + 1, group);
}
```

`list` è una normale `List<T>` su qualsiasi libreria (library), quindi questo trucco funziona per ognuna di esse. Vedi **[Librerie di asset](#/nml/asset-libraries)**.

## Rinominare o ricolorare un gruppo vanilla

Non sei obbligato ad aggiungere un gruppo per modificarne uno. `get()` ti consegna l'oggetto attivo:

```csharp
ActorTraitGroupAsset fun = AssetManager.trait_groups.get("fun");
if (fun != null)
{
    fun.name = "trait_group_hello_fun";   // la tua chiave di localizzazione
    fun.color = "#FFB35E";
}
```

Modificare un gruppo vanilla sul posto mantiene funzionante ogni tratto vanilla che vi punta e consente di caricare i vecchi salvataggi. Sostituirlo non fa nessuna delle due cose :PES_NoSign:.

## Le altre sei librerie di gruppi

I tratti degli attori sono solo uno di sette sistemi di tratti, e ciascuno possiede la propria libreria di gruppi con la propria classe di gruppo. Il codice in questa pagina è identico per tutti quanti, cambiano solo due nomi. Impara una volta, copia sei volte:

| Sistema di tratti | Libreria di gruppi | Classe del gruppo | Pagina |
| --- | --- | --- | --- |
| Attore | `AssetManager.trait_groups` | `ActorTraitGroupAsset` | questa pagina |
| Cultura | `AssetManager.culture_trait_groups` | `CultureTraitGroupAsset` | **[Tratti culturali](#/nml/culture-traits)** |
| Religione | `AssetManager.religion_trait_groups` | `ReligionTraitGroupAsset` | **[Tratti religiosi](#/nml/religion-traits)** |
| Sottospecie (subspecies) | `AssetManager.subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | **[Tratti di sottospecie](#/nml/subspecies-traits)** |
| Clan | `AssetManager.clan_trait_groups` | `ClanTraitGroupAsset` | **[Tratti del clan](#/nml/clan-traits)** |
| Lingua | `AssetManager.language_trait_groups` | `LanguageTraitGroupAsset` | **[Tratti della lingua](#/nml/language-traits)** |
| Regno | `AssetManager.kingdoms_traits_groups` | `KingdomTraitGroupAsset` | **[Tratti del regno](#/nml/kingdom-traits)** |

L'equipaggiamento ha lo stesso concetto sotto un nome diverso. Vedi **[Gruppi di oggetti e schede](#/nml/item-groups)**.

> [!TIP] Una sola scheda, non sei
> La tentazione con una grande mod è creare un gruppo per ogni funzionalità. Resisti. Il libro dei tratti è già affollatissimo: un giocatore noterà al volo una singola scheda col nome della tua mod, ma non troverà mai sei schede battezzate con i tuoi sistemi interni.
