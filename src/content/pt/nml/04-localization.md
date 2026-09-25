---
title: Localização
group: NML Modding
subgroup: Fluxo de trabalho básico
icon: :wbscroll:
order: 26
---

# Localização :wbscroll:

Cada elemento que você adiciona ao jogo (traços (trait), itens (item), poderes, abas, tarefas (task)) é exibido como uma chave bruta do tipo `trait_hello_swift` até que você defina um texto para ele. É o capítulo mais sem graça do modding, e deixá-lo de lado é o motivo número um para um mod parecer inacabado. (Cof.. meus mods.. Cof Cof :pensiveanimated: )

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

O nome do arquivo **é** o idioma: `en.json`, `cz.json` (chinês simplificado), `ch.json` (chinês tradicional), `ja.json` (japonês), `ru.json` e assim por diante. Esses são os ids registrados pela `GameLanguageLibrary`, não códigos ISO adivinhados. Tcheco é `cs`, não `cz`. Mantenha a pasta do mod com o nome `Locales`, com L maiúsculo; os caminhos de recurso `locales/` do próprio jogo são uma coisa separada.

Se preferir implementar a `IMod` manualmente, adicione a interface `ILocalizable` e aponte para a pasta:

```csharp Code/Main.cs
public string GetLocaleFilesDirectory(ModDeclare pModDeclare)
{
    return System.IO.Path.Combine(pModDeclare.FolderPath, "Locales");
}
```

## Um arquivo para todos os idiomas: o CSV


Se o seu programa de planilhas exportar com ponto e vírgula ou tabulações em vez de vírgulas, implemente `ICsvSepCustomized` na sua classe principal e retorne `';'` de `GetCsvSeparator()` para que o NML não transforme seus textos em sopa :PES2_Shrug:.
Um arquivo `.csv` na mesma pasta atende a todos os idiomas simultaneamente, o que é muito mais fácil de manter do que quinze arquivos JSON espalhados. Aqui, o nome do arquivo não importa:

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## Fazendo direto pelo código

`NeoModLoader.General.LM` é o ajudante de localização. Útil quando o seu texto é gerado, ou quando você simplesmente quer tudo num único arquivo `.cs` em vez de uma pilha de JSON.

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // read in the current language
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // add to whatever language is loaded now
LM.Add("en", "trait_hello_swift", "Swift");          // add to a specific language
LM.LoadLocale("en", "path/to/Locales/en.json");       // load a json manually (language + path)
LM.LoadLocales("path/to/Locales/lang.csv");          // load a csv manually
LM.ApplyLocale(false);                               // apply. false = don't refresh every text on screen
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

Adicione `HelloLocale.Initialize();` no `Main.cs` **primeiro**, antes de tudo, para que nada seja registrado enquanto o texto ainda estiver faltando.

Registre **tudo de uma vez, no carregamento**, e chame `ApplyLocale` uma única vez no final. Pedir ao jogo uma chave que ele não tem devolve a própria chave como texto, mais um erro `missing text` no log para cada chave, então uma tooltip feita de chaves faltando não é só feia, ela enche o seu log de ruído :PES_UghPing:.

## Os nomes de chaves que você realmente vai usar

O próprio jogo monta essas chaves, então elas precisam bater exatamente ou nada aparece. Duas delas **não** seguem a regra "igual ao id", e são justamente as que fazem as pessoas perderem uma hora:

| O quê | Chave do nome | Chave da descrição |
| --- | --- | --- |
| Traço | `trait_<id>` | `trait_<id>_info` |
| Item | `translation_key` se você definir uma, senão `item_<equipment_subtype or id>` | `<id>_description` (sem o prefixo `item_`) |
| Poder divino (GodPower) | `<power_id>` | `<power_id>_description` |
| Aba de poderes | o `locale_key` que você passou | a chave de descrição que você passou |
| Tarefa de ator | `task_unit_<task_id>` | - |
| Efeito de status | o **campo** `locale_id` que você definir | o **campo** `locale_description` que você definir |
| Lei do mundo (world law) | `<law_id>_title` (repare no sufixo) | `<law_id>_description` |

> [!WARNING] Ids não são nomes
> Seu id é `hello_swift` para sempre, em todos os idiomas, e é a ele que o resto do seu código (e os mods dos outros) se referem. O **texto de localização** é a parte que muda. Nunca renomeie um id só para corrigir um erro de digitação no nome exibido :PESgn_Stop:.

## A API do jogo sem o LM

Para um valor necessário apenas no idioma carregado no momento:

```csharp
LocalizedTextManager.add("hello_notice", "Hello from HelloBox", pReplace: true);
string notice = LocalizedTextManager.getText("hello_notice");
```

`add(string pKey, string pTranslation, bool pReplace = false, string pFileName = "", bool pCheckForCharacters = true)` escreve no dicionário de texto atual. Chaves existentes permanecem inalteradas a menos que `pReplace` seja true. Ele normaliza a chave através de `Underscore()`, então use chaves com underscore desde o início. `getText(string pKey, Text text = null, bool pForceEnglish = false)` lê esse dicionário; a fonte verificada não usa `pForceEnglish` para selecionar inglês.

> [!NOTE] Texto atual não é um arquivo de tradução
> Trocar de idioma reconstrói os dicionários de texto do jogo. Use `Locales` ou `LM.Add` para traduções que precisam sobreviver a uma troca de idioma. O `add` direto também não atualiza os componentes de texto existentes para você.

Próximo: **[Sprites e recursos](#/nml/sprites-and-resources)** ou coloque texto na tela com **[Mensagens e registro do mundo](#/nml/messages-and-world-log)**.
