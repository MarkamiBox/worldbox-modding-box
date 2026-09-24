---
title: Tipos de guerra
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbmartialwarfare:
order: 179
---

# Tipos de guerra :wbmartialwarfare:

Toda guerra no jogo tem um tipo: uma conquista normal, uma guerra de rancor contra todo mundo, uma rebelião. O tipo decide como a guerra ganha o nome, qual ícone mostra, se os aliados entram e algumas regras sobre como ela pode acabar. O vanilla só tem cinco, então um novo chama atenção.

Esta página cria a **Rixa de Brasa**: uma guerra que puxa os aliados dos dois lados, ganha nomes como "Cinder Feud of Karvia" e pode ser encerrada com uma trama de paz como uma guerra normal.

## O código

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

`HelloWars.Initialize()` vai no `OnModLoad`. Mas nada começa a sua guerra sozinho: as guerras vanilla vêm do código de diplomacia do jogo, que só conhece os cinco tipos dele. Chame `HelloWars.Start` onde fizer sentido: um **[poder divino](#/nml/god-powers)**, uma **[trama](#/nml/plots)** que um rei pode tentar, ou uma **[decisão](#/nml/custom-ai)**.

## Os campos

| Campo | O que faz |
| --- | --- |
| `name_template` | O gerador de nomes para o nome dessa guerra. Vanilla: `war_conquest`, `war_spite`, `war_rebellion`, `war_inspire`, `war_whisper` |
| `localized_war_name` | A chave de texto que a interface mostra como tipo da guerra, no tooltip e na janela da guerra |
| `localized_type` | Uma segunda chave de texto que o jogo guarda para o tipo. Não encontrei onde ela aparece, então preencha as duas |
| `path_icon` | O ícone da guerra, carregado exatamente como escrito |
| `kingdom_for_name_attacker` | De quem é o nome que preenche `$kingdom$`: o atacante (`true`) ou o defensor (`false`) |
| `alliance_join` | As alianças dos dois lados entram na guerra quando ela começa |
| `total_war` | O atacante fica em guerra com **todos** os reinos, como nas guerras de rancor. Comece sem defensor |
| `rebellion` | Marca como rebelião, o que muda quem pode se juntar a quem |
| `can_end_with_plot` | Um rei pode encerrar com a trama de paz, quando ela já está velha o bastante |
| `forced_war` | Só é lido por uma função auxiliar que nada chama no momento. Deixe desligado |

> [!WARNING] Guerras totais não têm defensor
> Com `total_war` o defensor é `null`, então um modelo de nome com `$kingdom$` e `kingdom_for_name_attacker = false` pede o nome de ninguém. Dê às guerras totais o nome do atacante :PES2_Shrug:.

## O texto

```json Mods/HelloBox/Locales/en.json
{
  "war_type_hello_ember_feud": "Ember Feud",
  "war_name_hello_ember_feud": "Ember Feud"
}
```

Os nomes em si ("Cinder Grudge of Karvia") são gerados, então não têm chaves. As palavras vêm do dicionário em `Names()`. Se quiser eles traduzidos, precisaria de um gerador por idioma, e nenhuma guerra vanilla faz isso.

## O seu ícone

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── wars/
        └── war_hello_ember_feud.png
```

Enquanto testa, pegue um vanilla emprestado: `wars/war_conquest`, `wars/war_spite`, `wars/war_rebellion` ou `wars/war_whisper`.

> [!NOTE] Saves lembram o tipo pelo id
> Uma guerra guarda o id do tipo dela no save. Carregue esse mundo sem o seu mod e a guerra pede um tipo que não existe mais, não recebe nada, e eu não apostaria que termina bem. Jogador removendo mod no meio de uma guerra é um risco que você não resolve por completo, mas vale uma linha na descrição do seu mod.
