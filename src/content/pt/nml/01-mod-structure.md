---
title: Estrutura de um mod
group: NML Modding
subgroup: Fluxo de trabalho básico
icon: :wbsavebuttonbox:
order: 20
---

# Estrutura de um mod :wbsavebuttonbox:

## Onde os mods ficam

Cada mod é **uma única pasta** dentro de `Mods/`, na pasta raiz do seu WorldBox:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\Mods\
```

Se a pasta `Mods` ainda não existir, crie-a você mesmo: botão direito → Novo → Pasta, com o nome exato de `Mods`. Você criará sua própria pasta de mod lá dentro, com o nome que desejar.

## Como um mod é organizado

```text
MyCoolMod/
├── mod.json          <- A certidão de nascimento do seu mod (obrigatório)
├── icon.png          <- O ícone de pré-visualização do mod
├── Code/             <- A pasta onde fica todo o seu código
├── Locales/          <- Arquivos de texto e traduções (en.json, pt.json, etc.)
└── GameResources/    <- Texturas personalizadas, ícones, pixel art e sons
```

Apenas o `mod.json` é estritamente obrigatório. Crie as outras pastas somente quando realmente precisar delas. Um mod composto apenas por `mod.json` e `Code/` já é um mod real e perfeitamente funcional. Pastas vazias não impressionam ninguém.

#### O que cada pasta faz

- **`mod.json`**: O documento de identidade. Sem isso, o NML agirá como se seu mod nem existisse.
- **`icon.png`**: A imagem de prévia exibida no menu de mods dentro do jogo.
- **`Code/`**: A pasta onde ficam todos os seus arquivos de código `.cs` (como `Main.cs`). Na verdade o NML compila qualquer `.cs` que encontrar no seu mod (pulando `bin/`, `obj/` e afins), mas colocá-los em `Code/` evita que o projeto vire um lixão. **O NML os compila toda vez que o jogo inicia**, então você nunca compila uma `.dll` e nunca precisa do Visual Studio.
- **`Locales/`**: Onde moram seus arquivos de tradução (como `en.json`). Sem isso, todos os seus itens (item) e traços (trait) aparecerão no jogo como chaves brutas de texto.
- **`GameResources/`**: Todas as suas texturas customizadas, pixel art, ícones de traços, sprites de armas e sons. O nome precisa ser exatamente esse, pois é o que o NML procura. Consulte **[Sprites e recursos](#/nml/sprites-and-resources)**.

### O manifesto

O arquivo `mod.json` é exigido pelo NeoModLoader para identificar seu mod :pepeOK:. Ele fica localizado diretamente na raiz da pasta do seu mod.

```json mod.json
{
  "name": "My-First-Mod",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.my-first-mod",
  "RepoUrl": "https://github.com/yourName/my-first-mod",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### O que esses campos significam?

- **`name`**: O nome amigável do mod exibido na lista dentro do jogo.
- **`author`**: Seu nome de usuário ou apelido. Leve os créditos pelo seu trabalho!
- **`version`**: O número da versão do mod (ex: `"0.1.0"`). Aumente esse número sempre que lançar uma atualização.
- **`description`**: Um resumo curto do que o mod faz. Aparece na janela de detalhes.
- **`iconPath`**: O caminho relativo para o ícone de visualização (geralmente `"icon.png"` na raiz do mod).
- **`GUID`**: Um id único para o seu mod, por convenção `com.seunome.nomemod`. O NML o converte internamente para maiúsculas com underscores (`COM_YOURNAME_MY_FIRST_MOD`), e essa é a identidade real dele. Se você omitir, o NML junta o autor e o nome mesmo assim. **Escolha uma vez e nunca mude**: o arquivo de configurações do jogador tem o nome dele.
- **`RepoUrl`**: Link opcional para o seu repositório no GitHub, Discord ou site. O NML coloca um botão direto no card do seu mod para os jogadores irem até lá com um clique.
- **`Dependencies`**: GUIDs de outros mods que PRECISAM estar instalados para o seu funcionar. Se for autônomo, deixe `[]`.
- **`OptionalDependencies`**: Mods que você suporta se existirem, mas dos quais não precisa de verdade. Quando um está ativo, o NML até dá ao seu código uma constante de compilação `#if OTHER_MOD_GUID` para envolver o código de integração.
- **`IncompatibleWith`**: Uma lista de GUIDs de mods que quebram o seu se ativados juntos. O NML verifica isso e impede que mods em conflito sejam carregados ao mesmo tempo.

Você também pode definir `"ModType": "RESOURCE_PACK"` se o seu mod não tem código e só quer substituir texturas, ou `"UsePublicizedAssembly": false` se você gosta de sofrer contra campos privados por esporte :PES5_Hmmmm:.


## Um pouco de nerdice técnica :elpepehacker:

Todo mod precisa de um arquivo C# que diga "olá, eu sou um mod". O código completo é simplesmente este:

```csharp Code/Main.cs
using NeoModLoader.api;

namespace MyCoolMod
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("Mod loaded successfully!");
        }
    }
}
```

Isso não é uma versão simplificada para o guia: é a base real de onde parte a maioria dos mods publicados.

#### Dissecando o código

- **`using NeoModLoader.api;`**: Pense nisso como abrir sua caixa de ferramentas antes de começar um conserto. Em vez de digitar `NeoModLoader.api.BasicMod` todas as vezes, o `using` diz ao computador: *"mantenha as ferramentas do NML prontas sobre a mesa"*.
- **`namespace MyCoolMod`**: Um sobrenome para o seu código. O mod de outra pessoa também pode ter uma classe `Main`, e o namespace impede que as duas entrem em conflito.
- **`public class Main`**: No C#, todo código vive dentro de "classes". Uma classe é apenas uma receita ou planta com um nome.
- **`: BasicMod<Main>`**: o distintivo oficial do seu mod. Ele diz ao NML *"sou um mod legítimo"*, e em troca o NML te dá de graça logs, configurações, carregamento em etapas e traduções. A parte `<Main>` só repete o nome da sua própria classe. Sim, parece estranho, e sim, sempre se escreve assim.
- **`protected override void OnModLoad()`**: O grande momento. Quando o WorldBox inicializa, o NML bate nessa porta uma única vez. Tudo o que seu mod configura (traços, itens, poderes) vai dentro destas chaves `{ }`.
- **`LogInfo(...)`**: Imprime uma linha no log com o nome do seu mod já anexado. É assim que você descobre se o código foi executado. Veja **[Logs e depuração](#/nml/logs-and-debugging)**.

> [!TIP] O jeito longo
> Você verá mods mais antigos estruturados assim. Sim, sou velho o bastante para lembrar quando isso era o normal:
> ```csharp
> public class MyMod : MonoBehaviour, IMod
> {
>     private ModDeclare _declare;
>
>     public void OnLoad(ModDeclare pModDecl, GameObject pGameObject)
>     {
>         _declare = pModDecl;
>     }
>
>     public ModDeclare GetDeclaration() => _declare;
>     public GameObject GetGameObject() => gameObject;
>     public string GetUrl() => _declare.RepoUrl;
> }
> ```
> `IMod` é a interface bruta, enquanto `BasicMod<T>` é uma classe pronta que a implementa trazendo utilidades prontas. Ambas funcionam. Use `BasicMod` a menos que tenha um motivo muito forte contra :PES5_Noted:.

## Próximo passo

Você já conhece a estrutura básica. Agora vamos construir um de verdade: **[Seu primeiro mod](#/nml/your-first-mod)**.
