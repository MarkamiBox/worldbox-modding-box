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
HelloBox/
├── mod.json          <- A certidão de nascimento do seu mod (obrigatório)
├── icon.png          <- O ícone de pré-visualização do mod
├── Code/             <- A pasta onde fica todo o seu código
├── Locales/          <- Arquivos de texto e traduções (en.json, pt.json, etc.)
└── GameResources/    <- Texturas personalizadas, ícones, pixel art e sons
```

Todo mod precisa do `mod.json`. O HelloBox também precisa do seu ponto de entrada em C#. Crie as outras pastas somente quando realmente precisar delas. Um mod composto apenas por `mod.json` e `Code/` já é um mod real e perfeitamente funcional. Pastas vazias não impressionam ninguém.

#### O que cada pasta faz

- **`mod.json`**: O documento de identidade. Sem isso, o NML agirá como se seu mod nem existisse.
- **`icon.png`**: A imagem de prévia exibida no menu de mods dentro do jogo.
- **`Code/`**: A pasta onde ficam todos os seus arquivos de código `.cs` (como `Main.cs`). Na verdade o NML compila qualquer `.cs` que encontrar em qualquer lugar do seu mod, subpastas incluídas (pulando `bin/`, `obj/`, `Properties/`, `packages/` e qualquer pasta cujo nome comece com ponto). Então arquivos `.cs` soltos ao lado do `mod.json` também funcionam, e alguns mods fazem isso, mas colocá-los em `Code/` evita que o projeto vire um lixão. **O NML compila o código-fonte quando necessário e pode reaproveitar seu cache de compilação.** Você não precisa de uma etapa de build separada para este guia.
- **`Locales/`**: Onde moram seus arquivos de tradução (como `en.json`). Sem isso, todos os seus itens (item) e traços (trait) aparecerão no jogo como chaves brutas de texto.
- **`GameResources/`**: Todas as suas texturas customizadas, pixel art, ícones de traços, sprites de armas e sons. O nome precisa ser exatamente esse, pois é o que o NML procura. Consulte **[Sprites e recursos](#/nml/sprites-and-resources)**.

> [!WARNING] Nomes de pasta diferenciam maiúsculas de minúsculas, só não no seu PC
> O Windows não se importa se você escreveu `Locales` ou `locales`. O Linux se importa. O NML procura por `Locales` e `GameResources` escritos exatamente assim, então um mod que funciona para você pode não ter texto nem sprite nenhum para outra pessoa. Bata as maiúsculas de cima e o problema nunca existe.

#### Pastas que você vai encontrar em mods de outras pessoas

Você não precisa de nenhuma delas para começar. Você vai vê-las quando abrir o mod de outra pessoa, então aqui está o que são.

| Pasta | O que faz |
| --- | --- |
| `Assemblies/` | Bibliotecas gerenciadas de terceiros para mods de código-fonte. O NML coleta os arquivos `.dll` diretamente dentro dessa pasta como referências de compilador e tenta carregá-los. Não é lugar para DLLs do jogo ou do NML |
| `GameResourcesReplace/` | O NML carrega exatamente como `GameResources/`, logo depois dela. O NML classifica o nome sob compatibilidade com o NCMS. Num mod novo, use apenas `GameResources/` |
| `EmbededResources/` | Sim, escrito errado, e precisa ser assim mesmo. Arquivos ali dentro são empacotados no código compilado de um mod **no estilo NCMS**. O compilador de código-fonte verificado só lê isso no seu ramo de compatibilidade com o NCMS. Não é um empacotamento automático para o código `BasicMod` do HelloBox. `EmbeddedResources/` não é o nome de pasta usado por esse ramo |

#### Distribuindo uma `.dll` em vez de código-fonte

No loader verificado, um arquivo terminado em `.dll` **diretamente ao lado do `mod.json`** seleciona a rota pré-compilada. O NML pula a compilação do código-fonte e carrega as DLLs da raiz. Coloque sua DLL compilada do HelloBox ali e deixe `Code/` fora do lançamento. Veja **[Publicando seu mod](#/nml/publishing)** para as checagens de build e empacotamento.

> [!WARNING] Uma única .dll perdida desliga seu código
> É por isso também que uma biblioteca largada ao lado do `mod.json` "quebra" um mod de código-fonte: o NML vê a `.dll`, pula `Code/`, e nenhuma das suas mudanças chega a carregar. Bibliotecas vão em `Assemblies/`, nunca na raiz do mod.


### O manifesto

O arquivo `mod.json` é exigido pelo NeoModLoader para identificar seu mod :pepeOK:. Ele fica localizado diretamente na raiz da pasta do seu mod.

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.hellobox",
  "RepoUrl": "https://github.com/yourName/hellobox",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### O que esses campos significam?

| Campo | O que faz |
| --- | --- |
| `name` | Nome de exibição, aqui `HelloBox` |
| `author` | Seu nome |
| `version` | Versão do lançamento. Aumente ao publicar |
| `description` | Descrição curta |
| `iconPath` | Caminho do ícone relativo à pasta do mod |
| `GUID` | Identidade estável. O NML a normaliza para `UID`; neste exemplo, `COM_YOURNAME_HELLOBOX`. Mantenha sem mudanças depois do lançamento |
| `RepoUrl` | Metadado de URL do repositório ou suporte. Confira como ele aparece na versão do NML que você distribui |
| `Dependencies` | IDs de mods obrigatórios. O fluxo de código-fonte documentado exige que eles compilem com sucesso |
| `OptionalDependencies` | IDs de mods opcionais. O NML pode fornecer as referências deles e símbolos de compilação durante a compilação do código-fonte |
| `IncompatibleWith` | Declarações de conflito. Não presuma a mesma aplicação entre versões do loader |
| `UsePublicizedAssembly` | Padrão `true` no loader verificado. Adiciona a referência do assembly publicizado do jogo pelo NML durante a compilação do código-fonte |

> [!WARNING] Confira o tratamento de conflitos antes de preencher a lista
> A documentação embutida descreve `IncompatibleWith` como inacabado. O loader instalado tem uma etapa de remoção que remove um mod com lista não vazia antes de procurar os IDs listados. Deixe o exemplo vazio. Teste seu loader exato com o mod conflitante presente e ausente antes de publicar uma declaração.

#### ModType e targetGameBuild

O enum verificado contém `NEOMOD`, `COMPILED_NEOMOD`, `BEPINEX` e `RESOURCE_PACK`. O padrão é `NEOMOD`; a detecção de DLL na raiz seleciona `COMPILED_NEOMOD`.

O nome de um enum não é uma receita funcional. O método `LoadMod` verificado trata os dois tipos NeoMod e rejeita os outros valores nessa rota. Deixe `ModType` de fora do manifesto do HelloBox. Este guia não afirma que definir `RESOURCE_PACK` sozinho cria um pacote de texturas funcional.

`targetGameBuild` tem um mapeamento JSON no assembly, mas o construtor verificado baseado em arquivo não o copia para a declaração ativa. Não o use como barreira de compatibilidade. Informe a versão do jogo e do NML que você testou nas notas de lançamento.

#### As chaves do manifesto não são intercambiáveis

A declaração verificada mapeia `GUID` para seu `UID` em tempo de execução. Ela não tem mapeamentos para `id`, `mainClass`, `modLoader`, `gameVersion` ou `homepage`, e seu construtor baseado em arquivo não consome essas chaves. Elas não substituem os campos acima.

O NML encontra um tipo de ponto de entrada adequado no assembly. Uma string `mainClass` não o seleciona. Mantenha o manifesto enxuto em vez de importar o esquema de outro loader.

#### Símbolos de dependência

Para os **IDs ASCII usados aqui**, o NML transforma letras em maiúsculas e troca pontuação por underline: `com.yourname.hellobox-extra` vira `COM_YOURNAME_HELLOBOX_EXTRA`. Não estenda essa regra para todo caractere Unicode; o normalizador verificado preserva alguns deles.

Durante a compilação do código-fonte, o NML define o símbolo de uma dependência opcional quando esse ID tem uma entrada no mapa de referências do compilador. A instalação sozinha não é o teste. Ele também pode tentar recompilar sem as dependências opcionais se a primeira compilação falhar.

> [!WARNING] Um símbolo com erro de digitação remove código em silêncio
> Um símbolo `#if` desconhecido é falso. Verifique o ID da dependência, a lista `OptionalDependencies` e o símbolo normalizado. Uma compilação bem-sucedida não prova que sua integração foi incluída.

Veja **[Trabalhando ao lado de outros mods](#/nml/other-mods)** para um exemplo completo e a checagem em tempo de execução separada.

#### Coisas que quebram uma pasta de mod

- **Distribuir DLLs do jogo ou do loader.** Não inclua `Assembly-CSharp.dll`, sua cópia publicizada, `NeoModLoader.dll`, DLLs da Unity ou outras DLLs copiadas da pasta `Managed/` do jogo. Referencie cópias locais ao compilar; mantenha-as fora do zip. O carregador de bibliotecas adicionais do NML tem casos especiais e deduplicação, então copiar uma DLL não é uma forma confiável de substituir a versão carregada.
- **Manifestos aninhados.** O NML primeiro verifica o próprio `mod.json` da pasta do mod. Só se estiver ausente ele procura abaixo dessa pasta. Com múltiplas correspondências aninhadas, o loader verificado avisa e usa o primeiro resultado. Não dependa dessa ordem. Distribua um único manifesto em `HelloBox/mod.json`.
- **Backups de código-fonte dentro do mod.** Uma pasta `dist/`, `backup/` ou `old/` pode contribuir com classes C# duplicadas para a compilação do código-fonte. Mantenha o preparo de lançamento e os backups fora do mod instalado.
- **Caminhos fixos no código.** Dentro da sua classe `BasicMod`, use `GetDeclaration().FolderPath` e `Path.Combine` para arquivos empacotados. A pasta `StreamingAssets/mods` do jogo é o local nativo do loader, não a pasta do HelloBox.
- **Caminhos que escapam do pacote.** Use caminhos relativos de ícone e recurso com a capitalização correspondente. Não distribua caminhos absolutos nem segmentos `..`. `Path.Combine` junta caminhos; ele não verifica se uma entrada fornecida pelo jogador permanece dentro da sua pasta.

> [!NOTE] O que foi verificado
> O comportamento de pastas e do compilador aqui foi rastreado através do assembly instalado do NML, versão de arquivo `1.2.0.1`, commit informativo `cd47a1a6c437718d38e8f29240bdb761d543e09a`, junto com a documentação embutida do NML. Isso não é uma promessa sobre todo lançamento.


## Um pouco de nerdice técnica :elpepehacker:

Todo mod precisa de um arquivo C# que diga "olá, eu sou um mod". O código completo é simplesmente este:

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
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
- **`namespace HelloBox`**: Um sobrenome para o seu código. O mod de outra pessoa também pode ter uma classe `Main`, e o namespace impede que as duas entrem em conflito.
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
