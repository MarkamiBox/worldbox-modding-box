---
title: Tipos de guerra
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbmartialwarfare:
order: 179
---

# Tipos de guerra :wbmartialwarfare:

Cada guerra del juego tiene un tipo: una conquista normal, una guerra de rencor contra todos, una rebelión. El tipo decide cómo recibe su nombre la guerra, qué icono muestra, si se unen los aliados y algunas reglas sobre cómo puede terminar. En vanilla solo hay cinco, así que uno nuevo llama la atención.

Esta página crea la **Rencilla de Brasa**: una guerra que arrastra a los aliados de ambos bandos, recibe nombres como "Cinder Feud of Karvia" y se puede terminar con una trama de paz como una guerra normal.

## El código

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

`HelloWars.Initialize()` va en `OnModLoad`. Aun así, nada empieza tu guerra por sí solo: las guerras vanilla salen del código de diplomacia del juego, que solo conoce sus cinco tipos. Llama a `HelloWars.Start` donde tenga sentido: un **[poder divino](#/nml/god-powers)**, una **[trama](#/nml/plots)** que un rey pueda intentar, o una **[decisión](#/nml/custom-ai)**.

## Los campos

| Campo | Qué hace |
| --- | --- |
| `name_template` | El generador de nombres para el nombre de esta guerra. Vanilla: `war_conquest`, `war_spite`, `war_rebellion`, `war_inspire`, `war_whisper` |
| `localized_war_name` | La clave de texto que la interfaz muestra como tipo de guerra, en el tooltip y en la ventana de guerra |
| `localized_type` | Una segunda clave de texto que el juego guarda para el tipo. No he encontrado dónde se muestra, así que rellena las dos |
| `path_icon` | El icono de la guerra, cargado tal cual lo escribes |
| `kingdom_for_name_attacker` | Qué nombre rellena `$kingdom$`: el atacante (`true`) o el defensor (`false`) |
| `alliance_join` | Las alianzas de ambos bandos se unen cuando empieza |
| `total_war` | El atacante está en guerra con **todos** los reinos, como en las guerras de rencor. Empiézala sin defensor |
| `rebellion` | La marca como rebelión, lo que cambia quién puede unirse a quién |
| `can_end_with_plot` | Un rey puede terminarla con la trama de paz, cuando ya es lo bastante vieja |
| `forced_war` | Solo lo lee una función auxiliar que ahora mismo nadie llama. Déjalo desactivado |

> [!WARNING] Las guerras totales no tienen defensor
> Con `total_war` el defensor es `null`, así que una plantilla de nombre con `$kingdom$` y `kingdom_for_name_attacker = false` pide el nombre de nadie. Nombra las guerras totales por el atacante :PES2_Shrug:.

## El texto

```json Mods/HelloBox/Locales/en.json
{
  "war_type_hello_ember_feud": "Ember Feud",
  "war_name_hello_ember_feud": "Ember Feud"
}
```

Los nombres en sí ("Cinder Grudge of Karvia") se generan, así que no tienen claves. Las palabras salen del diccionario de `Names()`. Si los quieres traducidos, necesitarías un generador por idioma, y ninguna guerra vanilla lo hace tampoco.

## Tu propio icono

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── wars/
        └── war_hello_ember_feud.png
```

Mientras pruebas, toma prestado uno vanilla: `wars/war_conquest`, `wars/war_spite`, `wars/war_rebellion` o `wars/war_whisper`.

> [!NOTE] Las partidas recuerdan el tipo por su id
> Una guerra guarda el id de su tipo en la partida. Carga ese mundo sin tu mod y la guerra pide un tipo que ya no existe, no recibe nada, y yo no apostaría a que acabe bien. Que un jugador quite un mod a mitad de una guerra es un riesgo que no puedes arreglar del todo, pero vale una línea en la descripción de tu mod.
