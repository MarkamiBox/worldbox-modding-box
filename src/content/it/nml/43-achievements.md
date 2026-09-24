---
title: Obiettivi
group: Contenuto di gioco
subgroup: Rifinitura e traguardi
icon: :gold_star:
order: 220
---

# Obiettivi :gold_star:

Sì, un mod può aggiungere obiettivi (achievement). Compaiono nella finestra degli obiettivi del gioco, si sbloccano con la notifica ufficiale e vengono salvati nei progressi del giocatore. Leggi l'avviso in fondo prima di pubblicarne uno.

```csharp Mods/HelloBox/Code/HelloAchievements.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAchievements
    {
        public const string SWARM = "achievement_hello_wisp_swarm";
        private const string WATCH = "hello_achievement_watch";

        public static void Initialize()
        {
            if (AssetManager.achievements.has(SWARM)) return;

            Achievement swarm = new Achievement
            {
                id = SWARM,
                group = "creatures",
                icon = "ui/Icons/iconHelloWisp",
                locale_key = SWARM,      // post_init() derives it at startup; yours stays null without this
                action = (object pData) => CountWisps() >= 10
            };

            AssetManager.achievements.add(swarm);

            // the achievements window reads each group's list, filled by linkAssets() at startup
            AssetManager.achievement_groups.get(swarm.group).achievements_list.Add(swarm);

            // nothing in the game knows when to check yours: look every 30 seconds
            WorldBehaviourAsset watch = new WorldBehaviourAsset
            {
                id = WATCH,
                interval = 30f,
                interval_random = 0f,
                action = () =>
                {
                    if (!swarm.isUnlocked()) swarm.check();
                }
            };
            AssetManager.world_behaviours.add(watch);
            watch.manager = new WorldBehaviour(watch);
        }

        private static int CountWisps()
        {
            int count = 0;
            List<Actor> units = World.world.units.getSimpleList();
            for (int i = 0; i < units.Count; i++)
            {
                Actor unit = units[i];
                if (unit != null && unit.isAlive() && unit.asset.id == "hello_wisp") count++;
            }
            return count;
        }
    }
}
```

Dieci fuochi fatui vivi nello stesso momento, e l'obiettivo si sblocca. Top 10 obiettivi di tutti i tempi :trollface:.

## Cosa il gioco non fa automaticamente per te

- **La chiave di testo.** `post_init()` ricava `locale_key` dall'ID per ogni obiettivo vanilla. Il tuo rimane a `null` e la finestra non mostra nulla: impostalo esplicitamente.
- **La finestra.** La finestra degli obiettivi legge la `achievements_list` di ciascun gruppo, popolata da `linkAssets()` all'avvio. Aggiungi il tuo al gruppo, altrimenti si sbloccherà senza che nessuno possa vederlo.
- **Il controllo.** Nulla nel gioco sa *quando* controllare il tuo obiettivo: il gioco vanilla chiama `check()` esattamente nei punti in cui le sue condizioni possono cambiare. HelloBox usa un **[comportamento del mondo](#/nml/world-ages)** che controlla ogni trenta secondi, che è perfetto per "esistono dieci creature di un certo tipo". Per un evento specifico, chiama `check()` direttamente nel punto in cui si verifica.

| Campo | Cosa fa |
| --- | --- |
| `group` | La sezione della finestra: `creation`, `worlds`, `civilizations`, `creatures`, `destruction`, `nature`, `experiments`, `collection`, `exploration`, `forbidden`, `miscellaneous` |
| `icon` | La sua immagine, come percorso sprite completo |
| `action` | La tua condizione. `check()` lo sblocca quando restituisce `true`, e `check()` senza `action` lo sblocca all'istante |
| `hidden` | Mostra una riga "nascosto" al posto della descrizione finché non viene sbloccato |
| `locale_key` | La chiave di testo. La descrizione usa `<locale_key>_description` |

```json Mods/HelloBox/Locales/en.json
{
  "achievement_hello_wisp_swarm": "Wisp Swarm",
  "achievement_hello_wisp_swarm_description": "Have ten wisps alive at the same time."
}
```

> [!WARNING] Vengono scritti nei veri progressi del giocatore
> Lo sblocco esegue il codice originale del gioco: scrive l'ID nel file dei progressi del giocatore e chiede a Steam di sbloccare un achievement con quell'ID. Steam non ha alcun obiettivo registrato con il tuo ID, quindi lato Steam non accadrà nulla, ma la chiamata viene effettuata e il log mostra `Unlocking in Steam: <id>`. Il gioco invia l'ID anche nei propri eventi di analisi. E finché la legge del "mondo maledetto" è attiva, nulla si sblocca, compresi i tuoi.

Nulla di tutto questo danneggia il gioco. Tuttavia si tratta del vero file di salvataggio dei progressi del giocatore: limitati a pochi obiettivi sensati e non sbloccare mai nulla che il giocatore non abbia effettivamente compiuto :PESgn_ReadRules:.
