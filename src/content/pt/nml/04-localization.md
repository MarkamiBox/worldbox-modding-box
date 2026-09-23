---
title: Localização
group: NML Modding
subgroup: Fluxo de trabalho básico
icon: :wbscroll:
order: 26
---

# Localização :wbscroll:

Cada elemento que você adiciona ao jogo (traços, itens, poderes, abas, tarefas) é exibido como uma chave bruta do tipo `trait_hello_swift` até que você defina um texto para ele. É o capítulo mais sem graça do modding, e deixá-lo de lado é o motivo número um para um mod parecer inacabado. (Cof.. meus mods.. Cof Cof :pensiveanimated: )

## O jeito preguiçoso: a pasta Locales

Se sua classe principal herda de `BasicMod<T>`, crie uma pasta chamada `Locales/` no seu mod e coloque um arquivo JSON com o nome do idioma. O NML o carrega **antes** do `OnModLoad`, sem exigir que você escreva nenhuma linha de código.

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money.",
  "hello_sword_ember": "Ember Blade",
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess."
}
```

O nome do arquivo **é** o idioma: `en.json`, `cz.json` (chinês simplificado), `ru.json`, `pt.json` e assim por diante.

Se preferir implementar a `IMod` manualmente, adicione a interface `ILocalizable` e aponte para a pasta:

```csharp Code/Main.cs
public string GetLocaleFilesDirectory(ModDeclare pModDeclare)
{
    return System.IO.Path.Combine(pModDeclare.FolderPath, "Locales");
}
```

## Um arquivo para todos os idiomas: o CSV

Um arquivo `.csv` na mesma pasta atende a todos os idiomas simultaneamente, o que é muito mais fácil de manter do que quinze arquivos JSON espalhados. Aqui, o nome do arquivo não importa:

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## Fazendo direto pelo código

O `NeoModLoader.General.LM` é o utilitário de localização. É muito conveniente quando o texto é gerado dinamicamente ou quando você quer manter tudo concentrado em um único arquivo `.cs` em vez de lidar com JSONs.

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // lê no idioma ativo no jogo
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // adiciona ao idioma atualmente carregado
LM.Add("en", "trait_hello_swift", "Swift");          // adiciona a um idioma específico
LM.LoadLocale("path/to/Locales/en.json");            // carrega um json manualmente
LM.LoadLocales("path/to/Locales/lang.csv");          // carrega um csv manualmente
LM.ApplyLocale(false);                               // aplica. false = não redesenha todos os textos na tela
```

No HelloBox, esse arquivo fica assim:

```csharp Mods/HelloBox/Code/HelloLocale.cs
using System.Collections.Generic;
using NeoModLoader.General;

namespace HelloBox
{
    public static class HelloLocale
    {
        public static void Initialize()
        {
            Dictionary<string, string> texts = new Dictionary<string, string>
            {
                { "trait_hello_swift", "Swift" },
                { "trait_hello_swift_info", "Moves like the world owes it money." },
                { "hello_strike", "Hello Strike" },
                { "hello_strike_description", "Shakes the ground and makes a mess." }
            };

            foreach (KeyValuePair<string, string> pair in texts)
            {
                LM.AddToCurrentLocale(pair.Key, pair.Value);
                LM.Add("en", pair.Key, pair.Value);
            }

            LM.ApplyLocale(false);
        }
    }
}
```

Chame `HelloLocale.Initialize();` no `Main.cs` **antes de tudo**, para garantir que nenhum asset seja registrado enquanto seu texto correspondente ainda estiver ausente.

Registre **tudo de uma só vez, ao inicializar**, e execute `ApplyLocale` uma única vez no final. Solicitar ao jogo uma chave inexistente gera erro no log e grava arquivos no disco: uma dica de tela cheia de chaves em falta não é apenas feia, ela sobrecarrega o log :PES_UghPing:.

## Os nomes de chaves que você realmente vai usar

O próprio jogo constrói essas chaves, então elas devem bater com precisão:

| O que é | Chave do nome | Chave da descrição |
| --- | --- | --- |
| Traço | `trait_<id>` | `trait_<id>_info` |
| Item | `item_<id>` | `item_<id>_description` |
| Poder divino | `<power_id>` | `<power_id>_description` |
| Aba de poderes | a `locale_key` fornecida | a chave de descrição fornecida |
| Tarefa de unidade | `task_unit_<task_id>` | - |
| Efeito de status | `<status_id>` | `<status_id>_description` |
| Lei do mundo | `<law_id>_title` (note o sufixo) | `<law_id>_description` |

> [!WARNING] IDs não são nomes
> Seu ID será `hello_swift` para sempre, em qualquer idioma, e é a ele que o restante do seu código (e mods de terceiros) fará referência. O **texto de localização** é a única parte que se altera. Nunca renomeie um ID apenas para corrigir um erro de digitação no nome de exibição :PESgn_Stop:.
