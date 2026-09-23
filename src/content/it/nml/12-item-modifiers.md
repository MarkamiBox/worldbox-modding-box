---
title: Incantamenti delle armi
group: Contenuto di gioco
subgroup: Oggetti ed equipaggiamento
icon: :wbmagehrm:
order: 122
---

# Incantamenti delle armi :wbmagehrm:

Conosci quelle piccole righe verdi su una buona spada: *"+3 danno"*, *"infuocata"*. Quelli sono i **modificatori di oggetto**, ed essi sono il modo più rapido per rendere il bottino entusiasmante, perché il gioco li estrae e li assegna automaticamente alle armi generate.

## La via semplice: il creator di NML

Un `ItemAsset` nel gioco base è una singola classe che svolge sette ruoli differenti, e i campi cambiano significato a seconda del contesto. NML racchiude le funzionalità principali in `ItemAssetCreator`, e per i modificatori si occupa anche della registrazione per te:

```csharp Mods/HelloBox/Code/HelloModifiers.cs
namespace HelloBox
{
    public static class HelloModifiers
    {
        public const string SHARP = "hello_sharp";

        public static void Initialize()
        {
            if (AssetManager.items_modifiers.has(SHARP)) return;

            ItemModAsset sharp = new ItemModAsset
            {
                id = SHARP,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                mod_type = "sharpness",          // same type: only the higher mod_rank shows up
                mod_rank = 2,
                translation_key = "mod_hello_sharp",
                rarity = 3,                      // bigger = rolled more often. Vanilla uses 1 and 3
                pool = ItemModifierLibrary.WEAPON
            };

            AssetManager.items_modifiers.add(sharp);   // add() first
            sharp.base_stats["damage"] = 8f;           // then the stats

            AddToPool(sharp);                          // and this is the part everybody forgets
        }

        /** The game built its pools while it loaded, which was before your mod existed. */
        private static void AddToPool(ItemModAsset pAsset)
        {
            foreach (string pool in new[] { "weapon", "armor", "accessory" })
            {
                if (!pAsset.pool.Contains(pool)) continue;
                if (!AssetManager.items_modifiers.pools.ContainsKey(pool)) continue;

                // vanilla adds each modifier `rarity` times over: that is the whole weighting system
                for (int i = 0; i < pAsset.rarity; i++)
                {
                    AssetManager.items_modifiers.pools[pool].Add(pAsset);
                }
            }
        }
    }
}
```
> [!WARNING] Registrarlo non basta
> `add()` mette il tuo modificatore nella `list` della libreria, e il generatore non legge `list`, legge `pools`. Quei pool vengono riempiti in `linkAssets()`, una volta sola, durante il caricamento. Un modificatore che sta solo nella `list` esiste, ha un nome, e non uscirà mai su niente :wbfacepalm:.



Aggiungi `HelloModifiers.Initialize();` in `Main.cs`, e da quel momento in poi il gioco potrà estrarre "hello_sharp" sulle armi generate.

### I parametri che contano

| Argomento | Cosa fa |
| --- | --- |
| `id` | Nome univoco |
| `mod_type` | La famiglia. Due modificatori dello stesso tipo non appaiono mai insieme: vince il `mod_rank` più alto |
| `mod_rank` | Livello nella famiglia. Aumenta anche il valore dell'arma |
| `translation_key` | Chiave di localizzazione per la riga verde |
| `rarity` | Frequenza di estrazione. Un numero maggiore indica maggiore probabilità |
| `base_stats` | Il bonus alle statistiche |
| `quality` | Qualità minima dell'arma richiesta per la comparsa |
| `equipment_value` | Punteggio extra di utilità per l'IA |

## Far fare effettivamente qualcosa all'enchant

Le statistiche vanno benissimo, ma un modificatore può anche eseguire codice. `action_attack_target` scatta ogni volta che l'arma mette a segno un colpo:

```csharp
ItemAssetCreator.CreateAndAddModifier(
    id: "hello_burning",
    mod_type: "elemental",
    mod_rank: 1,
    translation_key: "hello_burning",
    rarity: 1,
    action_attack_target: (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
    {
        if (pTarget == null || pTile == null) return false;
        World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
        return true;
    });
```

Ora qualsiasi arma che riceve "hello_burning" darà fuoco al terreno quando colpisce. Dieci righe, e funziona su ogni arma nel gioco, incluse quelle di altri mod :wbfireskull:.

## I testi di localizzazione

```json Locales/en.json
{
  "hello_sharp": "Sharpened",
  "hello_burning": "Burning"
}
```

La `translation_key` è ciò che compare nell'infobolla dell'arma: mantienila breve, si posiziona su una singola riga accanto alle statistiche.

> [!TIP] Modificatori prima delle armi
> Creare un'arma nuova richiede molto lavoro (sprite, animazioni, serie di materiali). Un nuovo modificatore richiede venti righe e si applica a **tutte** le armi generate nel mondo. Se vuoi novità immediate stasera, comincia da qui :PES_Stonks:.
