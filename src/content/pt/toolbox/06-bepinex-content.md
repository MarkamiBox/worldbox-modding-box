---
title: Adicionando conteúdo com BepInEx
group: BepInEx Modding
icon: :wbhammer:
order: 2
---

# Adicionando conteúdo com BepInEx :wbhammer:

Um plugin de BepInEx pode adicionar traços (trait), itens (item) e poderes (GodPower) como qualquer mod de NML. Ele só precisa fazer na mão os três trabalhos que o NML faz por você sem falar nada: esperar o jogo, carregar o texto e carregar a arte. Esta página faz os três para o mesmo traço **Swift** que a página **[Traços personalizados](#/nml/custom-traits)** constrói, para você comparar os dois linha por linha.

Se você ainda não tem um projeto, comece em **[Modding com BepInEx](#/toolbox/bepinex-modding)**.

## O momento certo

O `Awake()` do seu plugin roda muito cedo, antes de o WorldBox montar uma única biblioteca (library) de assets. Ali o `AssetManager.traits` ainda é null, e mexer nele é uma `NullReferenceException` antes mesmo do menu principal aparecer.

O momento que você quer é o fim do `AssetManager.init()`. Esse único método público monta todas as bibliotecas e depois roda `post_init()` e `linkAssets()` de cada uma. Um Postfix do Harmony nele roda logo depois, que é exatamente onde vive também o `OnModLoad` de um mod de NML. Tudo que as páginas de NML dizem sobre "o jogo fez isso ao iniciar, antes do seu mod existir, então faça você mesmo" vale aqui palavra por palavra.

## O código

```csharp Plugin.cs
using System.IO;
using BepInEx;
using HarmonyLib;

namespace HelloBepInEx
{
    [BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
    [BepInProcess("worldbox.exe")]
    public class HelloPlugin : BaseUnityPlugin
    {
        public static HelloPlugin Instance;

        /** The folder your .dll sits in, for loading your own files. */
        public static string Folder => Path.GetDirectoryName(Instance.Info.Location);

        private void Awake()
        {
            Instance = this;
            new Harmony("com.example.hellobepinex").PatchAll();

            // Installed while the game was already running? The libraries exist, go now.
            if (InitLibraries.initiated) HelloContent.Register();
        }
    }

    [HarmonyPatch(typeof(AssetManager), nameof(AssetManager.init))]
    public static class AssetsReadyPatch
    {
        [HarmonyPostfix]
        public static void Postfix() => HelloContent.Register();
    }

    [HarmonyPatch(typeof(LocalizedTextManager), nameof(LocalizedTextManager.setLanguage))]
    public static class LanguagePatch
    {
        // setLanguage throws the whole text table away and reloads it from the game files,
        // so our lines have to go back in after every language change.
        [HarmonyPostfix]
        public static void Postfix() => HelloContent.AddText();
    }
}
```

```csharp HelloContent.cs
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace HelloBepInEx
{
    public static class HelloContent
    {
        public const string SWIFT = "hello_swift";
        private const string ICON = "ui/Icons/iconHelloSwift";
        private static bool done;

        /** Text per language. English is the fallback for everything else. */
        private static readonly Dictionary<string, Dictionary<string, string>> Text =
            new Dictionary<string, Dictionary<string, string>>
            {
                ["en"] = new Dictionary<string, string>
                {
                    ["trait_hello_swift"] = "Swift",
                    ["trait_hello_swift_info"] = "Moves like the world owes it money."
                },
                ["it"] = new Dictionary<string, string>
                {
                    ["trait_hello_swift"] = "Rapido",
                    ["trait_hello_swift_info"] = "Si muove come se il mondo gli dovesse dei soldi."
                }
            };

        public static void Register()
        {
            if (done) return;
            done = true;

            // 1. The art, before anything asks for it. See "Your own art" below.
            string png = Path.Combine(HelloPlugin.Folder, "iconHelloSwift.png");
            if (File.Exists(png)) SpriteTextureLoader.addSprite(ICON, File.ReadAllBytes(png));

            // 2. The trait: exactly the Custom traits page, nothing BepInEx-specific.
            if (!AssetManager.traits.has(SWIFT))
            {
                ActorTrait swift = new ActorTrait
                {
                    id = SWIFT,
                    needs_to_be_explored = false,
                    path_icon = ICON,
                    group_id = "physique",
                    rate_birth = 0,
                    can_be_given = true,
                    can_be_removed = true
                };
                AssetManager.traits.add(swift);
                swift.base_stats["speed"] = 20f;
            }

            // 3. The text for the language that is already loaded.
            AddText();
        }

        public static void AddText()
        {
            if (LocalizedTextManager.instance == null) return;

            string lang = LocalizedTextManager.instance.language;
            if (!Text.TryGetValue(lang, out Dictionary<string, string> lines)) lines = Text["en"];

            foreach (KeyValuePair<string, string> line in lines)
            {
                // pReplace: true, or a second call logs "Already exists" for every line
                LocalizedTextManager.add(line.Key, line.Value, pReplace: true);
            }
        }
    }
}
```

Compile, abra o jogo, abra uma unidade, e o Swift está na aba `physique` com nome, descrição e ícone.

> [!NOTE] `LocalizedTextManager.instance.language` é internal
> Compila porque o projeto de **[Modding com BepInEx](#/toolbox/bepinex-modding)** publiciza o jogo. Sem o publicizer, você teria que lembrar o idioma sozinho.

## Os três trabalhos, um por um

### Esperar o jogo

| NML | BepInEx |
| --- | --- |
| `OnModLoad()` roda quando as bibliotecas estão prontas | Um Postfix no `AssetManager.init()` |
| O NML garante que rode uma vez | É com você: a variável `done` impede uma segunda execução se o `Awake()` já chamou |

Se você registrar algo na hora errada, o log avisa: uma `NullReferenceException` apontando para `AssetManager.<alguma coisa>` quer dizer cedo demais.

### Texto

O NML lê a sua pasta `Locales/` e aplica de novo a cada troca de idioma. No BepInEx você faz as duas coisas, e o patch no `setLanguage` é a parte que todo mundo esquece: em inglês tudo funciona, o jogador troca para italiano, e o seu traço de repente se chama `trait_hello_swift` :wbfacepalm:.

Os nomes das chaves são os mesmos do resto do guia, então a tabela de **[Localização](#/nml/localization)** continua valendo. `LocalizedTextManager.add` transforma a chave em snake_case para você, como os arquivos do próprio jogo.

### A sua arte

No BepInEx não existe a pasta `GameResources/`. O que existe é `SpriteTextureLoader.addSprite(path, bytes)`: ele lê um PNG de qualquer lugar e registra com o caminho que você quiser, com o pivô no centro e filtro para pixel art. Depois disso, `path_icon = "ui/Icons/iconHelloSwift"` encontra ele como um sprite vanilla.

Duas regras:

- **Registre antes que qualquer coisa peça esse caminho.** O jogo lembra de cada caminho que já procurou, até dos que falharam, e o `addSprite` recusa um caminho que ele já lembra. Fazer isso no começo do `Register()` é seguro.
- **É uma imagem, não uma pasta de quadros.** Ícones, ícones de itens e botões de poderes são imagens únicas, então funcionam. Tudo que o guia marca como **pasta** (animações de drops, efeitos de status, projéteis, tiles, sprites de construções) é carregado com `getSpriteList()`, que o `addSprite` não preenche. Para esses, pegue emprestado um caminho vanilla, ou faça essa parte do mod com NML.

Coloque o PNG ao lado da sua `.dll`:

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

Para o build copiar ele também, adicione uma linha ao alvo `CopyToGame` do seu `.csproj`:

```xml HelloBepInEx.csproj
<Copy SourceFiles="iconHelloSwift.png" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
```

## O que não vem do NML

Algumas páginas dependem de ajudantes do NML que não existem no BepInEx. Veja o que fazer no lugar:

| A página de NML usa | No BepInEx |
| --- | --- |
| Pasta `Locales/` | O padrão `AddText()` acima |
| `GameResources/` | `SpriteTextureLoader.addSprite` para imagens únicas, caminhos vanilla para pastas |
| `TabManager`, `PowerButtonCreator` (botões de poderes) | Não tem equivalente. Monte a interface você mesmo com Unity, ou coloque os botões num mod de NML |
| Janela de configurações `ModConfig` | O `Config.Bind()` do BepInEx, editado no arquivo `.cfg` |
| Dados salvos próprios | Os `data.set` / `data.get` do próprio jogo nas unidades funcionam igual, veja **[Salvando dados](#/nml/saving-data)** |
| Botão de recarregar | Nenhum. Feche, compile, abra |

Tudo que é código normal do jogo, que é a maior parte de cada página, funciona sem mudar: assets, atributos, status, patches do Harmony, IA, leis do mundo.

Quando algo quebrar, **[Depuração e publicação](#/toolbox/bepinex-publishing)** tem os erros que você mais provavelmente vai encontrar.
