---
title: Publishing your mod
group: NML Modding
subgroup: Advanced & Publishing
icon: :wbfireworks:
order: 46
---

# Publishing your mod :wbfireworks:

Your mod works. Now let other people break it.

There are two places a WorldBox mod can live, and they are not equally used:

| | |
| --- | --- |
| **[GameBanana](https://gamebanana.com/games/11196)** | Where the WorldBox modding scene actually is. Anybody can download from it, including players who bought the game somewhere other than Steam |
| **Steam Workshop** | Built into the NML, but far fewer mods |

Publish on GameBanana. Mirror to the Workshop afterwards if you feel like it.

## Packaging the mod

A GameBanana upload is a **zip of your mod folder**, nothing more. The folder inside the zip must be the one with `mod.json` in it:

```text HelloBox.zip
HelloBox/
├── mod.json
├── icon.png
├── default_config.json
├── Locales/
├── GameResources/
└── Code/
```

Not a zip of the *contents*. A zip of the *folder*. Somebody unzipping into their `Mods/` directory should end up with `Mods/HelloBox/mod.json`, and if they end up with `Mods/mod.json` instead they will post that your mod does not load :PES_Facepalm:.

**Leave out** everything that is not needed to run: `.git/`, `bin/`, `obj/`, `.vs/`, your `.sln`, your notes. If you ship a prebuilt `.dll`, ship it *instead of* `Code/`, not alongside a stale copy of the source.

## Uploading to GameBanana

1. Make an account, then go to the **[WorldBox game page](https://gamebanana.com/games/11196)**.
2. **Add → Mod**.
3. Fill in name, description and category. Category matters more than you think: it is how people find you at all.
4. Upload the zip, upload at least one screenshot **of the mod doing something in game**. Not your icon, not the mod list.
5. In the description, say plainly: what it adds, that it needs **NeoModLoader**, and any mod it conflicts with.

Updating later is the same page with **Edit → Files**. Add the new zip, write a changelog line, bump `version` in `mod.json` to match. Keeping the GameBanana version and the `mod.json` version in sync costs nothing and saves every "which one do I have" question.

> [!TIP] A screenshot does more than a paragraph
> People decide from the thumbnail. One clear in-game shot of the thing your mod adds will do more for you than the best-written description on the site :PES_Camera:.

## The Steam Workshop route

Uploading to the Workshop happens **inside the game**, and the way you open the upload window is the single most cursed piece of UI in this hobby :kekw:.

1. Open the **Mods** window in game.
2. Click your mod's **icon** exactly **eight times**, less than a second between clicks.
3. Wait about three seconds.
4. The upload window appears.

If nothing happens you clicked too slowly, or you clicked the row instead of the icon.

The newer NML mod list window also puts quick-action buttons on selected mods - jumping straight into the mod's folder on disk, toggling it, or hot-reloading code - but the secret eight-click rite on the icon remains how you summon the Steam uploader :PES2_Shrug:.

| Field | What goes in it |
| --- | --- |
| Top field (`fileID`) | **Leave empty** the first time. For updates, paste the id from your workshop item URL |
| Bottom field | The changelog. Can be empty, editable on the workshop page later |

That is the whole difference between publish and update: an empty `fileID` creates a new item, a filled one replaces an existing one.

### Authentication, the first time

Uploading a new mod to the Workshop asks you to authenticate. Three ways:

- **Discord**: get the `Modder` role on the official WorldBox Discord by asking an admin.
- **GitHub**: join the `WorldBoxOpenMods` organization. Email them with the subject "WorldBoxOpenMods", your GitHub username and your mod, and wait up to a week.
- **Skip it**: your mod uploads with the `Unverified Mods` tag. It works, it is just less visible.

## Before you hit upload, on either site

- **`mod.json` is your shop window.** `name`, `author`, `version`, `description` are what people read. Bump `version` every release, and **never change your `GUID`** after the first upload: it is your mod's identity, the player's settings file is named after it, and other mods may depend on it.
- **`icon.png` exists and looks like something.** On the Workshop it is also the thing you have to click eight times, so at least make it pleasant.
- **Your mod must work in any folder.** Never hardcode `C:\Users\YourName\...`. Use `GetDeclaration().FolderPath`. This is the single most common reason a mod works for its author and nobody else :PES2_Bruh:.
- **Read your own log once, clean.** Start the game, load a world, play two minutes, search `Player.log` for your prefix and for `Exception`. Ship zero of those.
- **Test with your settings file deleted.** Delete `mods_config/<GUID>.config` so you are testing the defaults a new player actually gets.
- **Test with other mods on.** If you patch anything, somebody else is patching it too.
- **Test on a fresh save.** Assets you register have to exist before a save that references them loads.

## Dependencies

If your mod needs another one, declare it instead of crashing on a missing type:

```json mod.json
{
  "Dependencies": ["com.otherperson.coolmod"],
  "OptionalDependencies": ["com.someone.niceextra"],
  "IncompatibleWith": ["com.someone.rivalmod"]
}
```

NML handles load order and warns the player, which is much nicer than a null reference on line one.

## After release

Comments will contain exactly three kinds of message: "it doesn't work" with no log attached, a genuinely great idea you did not think of, and somebody asking for multiplayer :PESgn_DidIAsk:.

Answer the second one. For the first one, pin a line telling people where `Player.log` is (see **[Logs & debugging](#/nml/logs-and-debugging)**), because a bug report without it is a bug report you cannot act on.

And welcome. Every new mod makes this small community a little less of a graveyard, and five in one week is the golden age of modding :PES5_CrazyPog:.
