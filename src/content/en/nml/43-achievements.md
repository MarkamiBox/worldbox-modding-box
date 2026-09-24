---
title: Achievements
group: Game Content
subgroup: Finishing Touches
icon: :gold_star:
order: 220
---

# Achievements :gold_star:

Yes, a mod can add achievements. They show up in the game's achievements window, pop up like the real ones, and they are stored with the player's progress. Read the warning at the bottom before you ship one.

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

Ten wisps alive at once, and the achievement unlocks. Top 10 achievements of all time :trollface:.

## What the game does not do for you

- **The text key.** `post_init()` fills `locale_key` from the id for every vanilla achievement. Yours stays `null` and the window prints nothing, so set it.
- **The window.** The achievements window lists each group's `achievements_list`, filled by `linkAssets()` at startup. Add yours to the group, or it unlocks and nobody can see it.
- **The checking.** Nothing tells the game *when* to look at your achievement: vanilla calls `check()` from the exact places its conditions can change. HelloBox uses a **[world behaviour](#/nml/world-ages)** that looks every thirty seconds, which is plenty for "ten of something exist". For an event, call `check()` right where it happens.

| Field | What it does |
| --- | --- |
| `group` | The window section: `creation`, `worlds`, `civilizations`, `creatures`, `destruction`, `nature`, `experiments`, `collection`, `exploration`, `forbidden`, `miscellaneous` |
| `icon` | Its picture, a full sprite path |
| `action` | Your condition. `check()` unlocks it when this returns `true`, and `check()` with no `action` unlocks it straight away |
| `hidden` | Shows a "hidden" line instead of the description until it is unlocked |
| `locale_key` | The text key. The description is `<locale_key>_description` |

```json Mods/HelloBox/Locales/en.json
{
  "achievement_hello_wisp_swarm": "Wisp Swarm",
  "achievement_hello_wisp_swarm_description": "Have ten wisps alive at the same time."
}
```

> [!WARNING] It goes where the real ones go
> Unlocking runs the game's own code: it writes the id into the player's progress file, and it asks Steam to unlock an achievement with that id. Steam has no achievement by your id, so on Steam's side nothing should happen, but the call is made and the log says `Unlocking in Steam: <id>`. The game also sends the id with its analytics event. And while the "cursed world" law is on, nothing unlocks at all, yours included.
>
> None of that breaks anything. It is still the player's real progress file, so keep it to a handful, and never unlock anything the player did not do :PESgn_ReadRules:.
