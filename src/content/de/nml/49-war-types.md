---
title: Kriegsarten
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbmartialwarfare:
order: 179
---

# Kriegsarten :wbmartialwarfare:

Jeder Krieg (war) im Spiel hat eine Art: ein normaler Eroberungskrieg, ein Trotzkrieg gegen alle, eine Rebellion. Die Art entscheidet, wie der Krieg zu seinem Namen kommt, welches Icon er zeigt, ob Verbündete mitmachen und ein paar Regeln dazu, wie er enden kann. Vanilla hat nur fünf, also fällt eine neue auf.

Diese Seite baut die **Glutfehde**: einen Krieg, der die Verbündeten beider Seiten mit hineinzieht, Namen wie "Cinder Feud of Karvia" bekommt und wie ein normaler Krieg durch einen Friedensplan beendet werden kann.

## Der Code

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

`HelloWars.Initialize()` kommt in `OnModLoad`. Von selbst startet aber nichts deinen Krieg: Vanilla-Kriege kommen aus dem Diplomatie-Code des Spiels, und der kennt nur seine fünf Arten. Ruf `HelloWars.Start` da auf, wo es passt: aus einer **[Macht](#/nml/god-powers)**, einem **[Plan](#/nml/plots)**, den ein König versuchen kann, oder einer **[Entscheidung](#/nml/custom-ai)**.

## Die Felder

| Feld | Was es macht |
| --- | --- |
| `name_template` | Der Namensgenerator für den Namen dieses Kriegs. Vanilla: `war_conquest`, `war_spite`, `war_rebellion`, `war_inspire`, `war_whisper` |
| `localized_war_name` | Der Textschlüssel, den die Oberfläche als Art des Kriegs zeigt, im Tooltip und im Kriegsfenster |
| `localized_type` | Ein zweiter Textschlüssel, den das Spiel für die Art führt. Ich habe nicht gefunden, wo er angezeigt wird, also füll beide |
| `path_icon` | Das Icon des Kriegs, genau so geladen, wie es dasteht |
| `kingdom_for_name_attacker` | Wessen Name `$kingdom$` füllt: der Angreifer (`true`) oder der Verteidiger (`false`) |
| `alliance_join` | Die Bündnisse beider Seiten treten bei, wenn er beginnt |
| `total_war` | Der Angreifer ist mit **jedem** Königreich (kingdom) im Krieg, wie bei Trotzkriegen. Ohne Verteidiger starten |
| `rebellion` | Markiert ihn als Rebellion, was ändert, wer wem beitreten kann |
| `can_end_with_plot` | Ein König kann ihn mit dem Friedensplan beenden, sobald er alt genug ist |
| `forced_war` | Wird nur von einer Hilfsmethode gelesen, die gerade nichts aufruft. Aus lassen |

> [!WARNING] Totale Kriege haben keinen Verteidiger
> Bei `total_war` ist der Verteidiger `null`, also fragt eine Namensvorlage mit `$kingdom$` und `kingdom_for_name_attacker = false` nach dem Namen von niemandem. Benenn totale Kriege nach dem Angreifer :PES2_Shrug:.

## Der Text

```json Mods/HelloBox/Locales/en.json
{
  "war_type_hello_ember_feud": "Ember Feud",
  "war_name_hello_ember_feud": "Ember Feud"
}
```

Die Namen selbst ("Cinder Grudge of Karvia") werden generiert, also haben sie keine Schlüssel. Die Wörter kommen aus dem Wörterbuch in `Names()`. Wenn du sie übersetzt haben willst, bräuchtest du einen Generator pro Sprache, und das macht auch kein Vanilla-Krieg.

## Dein eigenes Icon

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── wars/
        └── war_hello_ember_feud.png
```

Zum Testen borg dir ein Vanilla-Icon: `wars/war_conquest`, `wars/war_spite`, `wars/war_rebellion` oder `wars/war_whisper`.

> [!NOTE] Spielstände merken sich die Art über die ID
> Ein Krieg speichert seine Art-ID im Spielstand. Lad diese Welt ohne deine Mod, und der Krieg fragt nach einer Art, die es nicht mehr gibt, bekommt nichts zurück, und ich würde nicht darauf wetten, dass das gut ausgeht. Spieler, die eine Mod mitten im Krieg entfernen, sind ein Risiko, das du nicht ganz beheben kannst, aber eine Zeile in der Beschreibung deiner Mod ist es wert.
