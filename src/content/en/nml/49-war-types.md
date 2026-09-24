---
title: War types
group: Game Content
subgroup: World & Civilizations
icon: :wbmartialwarfare:
order: 179
---

# War types :wbmartialwarfare:

Every war in the game has a type: a normal conquest, a spite war against everybody, a rebellion. The type decides how the war gets its name, which icon it shows, whether allies join in, and a few rules about how it can end. There are only five in vanilla, so a new one stands out.

This page makes the **Ember Feud**: a war that drags in the allies of both sides, gets names like "Cinder Feud of Karvia", and can be ended by a peace plot like a normal war.

## The code

```csharp Mods/HelloBox/Code/HelloWars.cs
namespace HelloBox
{
    public static class HelloWars
    {
        public const string FEUD = "hello_ember_feud";
        public const string NAMES = "hello_war_feud";

        public static void Initialize()
        {
            Names();

            if (AssetManager.war_types_library.has(FEUD)) return;

            AssetManager.war_types_library.add(new WarTypeAsset
            {
                id = FEUD,
                name_template = NAMES,                      // the generator for war names, below
                localized_type = "war_type_hello_ember_feud",
                localized_war_name = "war_name_hello_ember_feud",
                path_icon = "wars/war_hello_ember_feud",    // GameResources/wars/war_hello_ember_feud.png
                kingdom_for_name_attacker = true,           // $kingdom$ in the name = the attacker
                alliance_join = true,                       // both sides' allies join
                can_end_with_plot = true                    // a king can plot to end it
            });
        }

        /** War names in the dictionary style: whole words picked from lists. */
        private static void Names()
        {
            if (AssetManager.name_generator.has(NAMES)) return;

            NameGeneratorAsset names = new NameGeneratorAsset
            {
                id = NAMES,
                use_dictionary = true,
                replacer_kingdom = NameGeneratorReplacers.replaceKingdom   // fills $kingdom$
            };
            names.addDictPart("kingdom_name", "$kingdom$");
            names.addDictPart(" ", " ");
            names.addDictPart("of", "of");
            names.addDictPart("ember", "Ember,Cinder,Ash,Smoke,Soot");
            names.addDictPart("feud", "Feud,Quarrel,Grudge,Blaze");
            names.addTemplate("ember, ,feud");
            names.addTemplate("ember, ,feud, ,of, ,kingdom_name");

            AssetManager.name_generator.add(names);
        }

        /** Start one. The game's own wars go through this same method. */
        public static War Start(Kingdom pAttacker, Kingdom pDefender)
        {
            WarTypeAsset feud = AssetManager.war_types_library.get(FEUD);
            if (feud == null || pAttacker == null || pDefender == null) return null;

            // internal: compiles inside NML. It checks there is no war between them already,
            // logs it in the world history, and pulls in the allies when alliance_join is on.
            return World.world.diplomacy.startWar(pAttacker, pDefender, feud);
        }
    }
}
```

`HelloWars.Initialize()` goes in `OnModLoad`. Nothing starts your war on its own, though: vanilla wars come from the game's own diplomacy code, which only knows its five types. Call `HelloWars.Start` from wherever it makes sense: a **[god power](#/nml/god-powers)**, a **[plot](#/nml/plots)** a king can attempt, or a **[decision](#/nml/custom-ai)**.

## The fields

| Field | What it does |
| --- | --- |
| `name_template` | The name generator for this war's name. Vanilla: `war_conquest`, `war_spite`, `war_rebellion`, `war_inspire`, `war_whisper` |
| `localized_war_name` | The text key the UI shows as the war's type, in the tooltip and the war window |
| `localized_type` | A second text key the game lists for the type. I have not found where it is shown, so fill both |
| `path_icon` | The war's icon, loaded exactly as written |
| `kingdom_for_name_attacker` | Whose name fills `$kingdom$`: the attacker (`true`) or the defender (`false`) |
| `alliance_join` | Both sides' alliances join the war when it starts |
| `total_war` | The attacker is at war with **every** kingdom, like spite wars. Start it with no defender |
| `rebellion` | Marks it as a rebellion, which changes who can join whom |
| `can_end_with_plot` | A king can end it with the peace plot, once it is old enough |
| `forced_war` | Only read by one helper that nothing calls at the moment. Leave it off |

> [!WARNING] Total wars have no defender
> With `total_war` the defender is `null`, so a name template with `$kingdom$` and `kingdom_for_name_attacker = false` asks for the name of nobody. Keep total wars named after the attacker :PES2_Shrug:.

## The text

```json Mods/HelloBox/Locales/en.json
{
  "war_type_hello_ember_feud": "Ember Feud",
  "war_name_hello_ember_feud": "Ember Feud"
}
```

The names themselves ("Cinder Grudge of Karvia") are generated, so they have no keys. The words come from the dictionary in `Names()`. If you want them translated, you would need one generator per language, and no vanilla war does that either.

## Your own icon

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── wars/
        └── war_hello_ember_feud.png
```

While testing, borrow a vanilla one: `wars/war_conquest`, `wars/war_spite`, `wars/war_rebellion` or `wars/war_whisper`.

> [!NOTE] Saves remember the type by id
> A war stores its type id in the save. Load that world without your mod and the war asks for a type that no longer exists, gets nothing back, and I would not bet on it ending well. Players removing a mod mid-war is a risk you cannot fully fix, but it is worth a line in your mod's description.
