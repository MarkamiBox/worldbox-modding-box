---
title: Types de guerre
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbmartialwarfare:
order: 179
---

# Types de guerre :wbmartialwarfare:

Chaque guerre du jeu a un type : une conquête normale, une guerre de rancune contre tout le monde, une rébellion. Le type décide comment la guerre reçoit son nom, quelle icône elle affiche, si les alliés s'en mêlent, et quelques règles sur la façon dont elle peut finir. Il n'y en a que cinq en vanilla, donc un nouveau se remarque.

Cette page crée la **Querelle de Braise** : une guerre qui entraîne les alliés des deux camps, reçoit des noms comme "Cinder Feud of Karvia", et peut se terminer par un complot de paix comme une guerre normale.

## Le code

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

`HelloWars.Initialize()` va dans `OnModLoad`. Mais rien ne lance votre guerre tout seul : les guerres vanilla viennent du code de diplomatie du jeu, qui ne connaît que ses cinq types. Appelez `HelloWars.Start` là où ça a du sens : un **[pouvoir divin](#/nml/god-powers)**, un **[complot](#/nml/plots)** qu'un roi peut tenter, ou une **[décision](#/nml/custom-ai)**.

## Les champs

| Champ | Ce qu'il fait |
| --- | --- |
| `name_template` | Le générateur de noms pour le nom de cette guerre. Vanilla : `war_conquest`, `war_spite`, `war_rebellion`, `war_inspire`, `war_whisper` |
| `localized_war_name` | La clé de texte que l'interface affiche comme type de guerre, dans l'info-bulle et la fenêtre de guerre |
| `localized_type` | Une deuxième clé de texte que le jeu garde pour le type. Je n'ai pas trouvé où elle s'affiche, alors remplissez les deux |
| `path_icon` | L'icône de la guerre, chargée exactement comme écrite |
| `kingdom_for_name_attacker` | Quel nom remplit `$kingdom$` : l'attaquant (`true`) ou le défenseur (`false`) |
| `alliance_join` | Les alliances des deux camps rejoignent la guerre quand elle commence |
| `total_war` | L'attaquant est en guerre avec **tous** les royaumes, comme les guerres de rancune. Lancez-la sans défenseur |
| `rebellion` | La marque comme rébellion, ce qui change qui peut rejoindre qui |
| `can_end_with_plot` | Un roi peut la finir avec le complot de paix, une fois qu'elle est assez vieille |
| `forced_war` | Lu seulement par une fonction utilitaire que rien n'appelle pour l'instant. Laissez-le désactivé |

> [!WARNING] Les guerres totales n'ont pas de défenseur
> Avec `total_war`, le défenseur vaut `null`, donc un modèle de nom avec `$kingdom$` et `kingdom_for_name_attacker = false` demande le nom de personne. Nommez les guerres totales d'après l'attaquant :PES2_Shrug:.

## Le texte

```json Mods/HelloBox/Locales/en.json
{
  "war_type_hello_ember_feud": "Ember Feud",
  "war_name_hello_ember_feud": "Ember Feud"
}
```

Les noms eux-mêmes ("Cinder Grudge of Karvia") sont générés, donc ils n'ont pas de clés. Les mots viennent du dictionnaire de `Names()`. Pour les avoir traduits, il faudrait un générateur par langue, et aucune guerre vanilla ne le fait non plus.

## Votre propre icône

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── wars/
        └── war_hello_ember_feud.png
```

Pendant les tests, empruntez-en une vanilla : `wars/war_conquest`, `wars/war_spite`, `wars/war_rebellion` ou `wars/war_whisper`.

> [!NOTE] Les sauvegardes retiennent le type par son id
> Une guerre enregistre l'id de son type dans la sauvegarde. Chargez ce monde sans votre mod, et la guerre demande un type qui n'existe plus, ne reçoit rien, et je ne parierais pas sur une fin heureuse. Un joueur qui retire un mod en pleine guerre, c'est un risque que vous ne pouvez pas complètement régler, mais ça vaut une ligne dans la description de votre mod.
