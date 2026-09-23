---
title: Seu primeiro mod
group: NML Modding
subgroup: Fluxo de trabalho básico
icon: :wbchosen:
order: 22
---

# Seu primeiro mod :wbchosen:

Tudo neste guia é construído em torno de **um único mod**. Nós o começamos aqui, e cada página posterior adicionará um novo arquivo a ele.

Ao final, o HelloBox terá cerca de vinte arquivos e você terá escrito cada linha por conta própria: um traço de unidade e um traço cultural com aba própria, uma arma e um encantamento para ela, um efeito de status, drops, uma nuvem, um ladrilho de terreno, uma receita de comida, um projétil, uma lei do mundo, um poder divino com seu próprio botão, uma janela, um painel de opções, uma construção, uma facção, uma criatura, um desastre, uma IA própria e um patch Harmony para dobrar uma regra que o jogo achava que estava consolidada.

Isso é muito mais do que qualquer mod real precisa, e esse é exatamente o objetivo. Você pega as duas ou três partes que realmente quer e descarta o restante :PES4_DeleteThis:.

O mod se chama **HelloBox**. Vamos trazê-lo à vida.

> [!NOTE] Nunca escreveu código antes?
> Não tem problema. Leia as explicações de "o que cada linha faz" abaixo de cada bloco e copie o código exatamente como está. Programar é 90% copiar algo que funciona e alterar uma única coisa por vez :PES2_Legit:.

> [!TIP] Ou comece pelo template
> Se você preferir não criar os arquivos na mão, pegue o esqueleto vazio e pule para o passo 4. Ler os três próximos passos ainda vale a pena: eles explicam o que tem dentro.
>
> <a class="dl" href="hellobox-template.zip" download>
>   <span class="dl-icon">📄</span>
>   <span class="dl-text">
>     <span class="dl-title">Baixar o template vazio</span>
>     <span class="dl-sub"><code>mod.json</code>, <code>Code/Main.cs</code> e as pastas que o NML procura. Só isso.</span>
>   </span>
> </a>

## 1. Crie a pasta

Vá para a sua pasta do WorldBox (aquela com o `worldbox.exe`), abra `Mods/` e crie uma pasta chamada `HelloBox`. Dentro dela, crie uma pasta chamada `Code`.

```text Where it goes
worldbox/
└── Mods/
    └── HelloBox/          <- seu mod
        ├── mod.json       <- a certidão de nascimento (próximo passo)
        └── Code/          <- seus arquivos .cs moram aqui
```

## 2. A certidão de nascimento: mod.json

Crie um arquivo chamado `mod.json` dentro de `HelloBox/` e cole o seguinte. Altere `author` para o seu nome:

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My first WorldBox mod, built while following the guide.",
  "GUID": "com.yourName.hellobox"
}
```

- **`name`** é o que os jogadores verão na lista de mods.
- **`GUID`** é um ID exclusivo. Use `com.seunome.hellobox` e nunca mais o altere.

Sem esse arquivo, o NML se comportará como se o seu mod nem existisse :pepeno:.

> [!WARNING] O Bloco de Notas tentará chamá-lo de `mod.json.txt`
> Na janela de Salvar, altere o **Tipo** para **Todos os arquivos (*.*)** antes de digitar o nome. Depois confira no Explorador: se você não conseguir ver o final `.json`, ative **Exibir → Extensões de nomes de arquivos** para que o Windows pare de ocultá-las. Um arquivo chamado `mod.json.txt` é invisível para o NML, e quase todo mundo cai nessa pegadinha uma vez :PESgn_Oops:.

## 3. O código: Main.cs

Crie o arquivo `Code/Main.cs` e cole o código abaixo:

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");
        }
    }
}
```

### O que cada linha faz

- **`using NeoModLoader.api;`**: "Quero usar as ferramentas do NML neste arquivo". Sem isso, o computador não sabe o que é `BasicMod`.
- **`namespace HelloBox`**: um sobrenome para o seu código, garantindo que sua classe `Main` nunca colida com a `Main` de outra pessoa.
- **`public class Main : BasicMod<Main>`**: o seu mod. A parte `: BasicMod<Main>` significa "sou um mod do NML, me dê os recursos prontos" (logs, opções, traduções).
- **`protected override void OnModLoad()`**: a porta em que o NML bate quando o jogo inicializa. Tudo o que o seu mod inicializa deve ficar dentro destas chaves `{ }`.
- **`LogInfo(...)`**: imprime uma linha no log com o nome do seu mod já anexado. É assim que você confirma se o código realmente rodou.

## 4. Execute o jogo

Inicie o WorldBox e abra a janela **Mods** no menu principal. O **HelloBox** deve aparecer na lista, já ativado. Um mod colocado na pasta `Mods/` manualmente é ativado na primeira vez que o NML o encontra.

Essa janela também é onde você pode **desativar** um mod mais tarde. Clicar no ícone altera o estado, e a maioria dos mods exige reiniciar o jogo para surtir efeito.

> [!TIP] Não aparece de jeito nenhum na lista?
> O NML simplesmente não encontrou o mod. Em nove de cada dez vezes, o arquivo foi salvo como `mod.json.txt` em vez de `mod.json`, ou a pasta foi colocada fora de `worldbox\Mods/`.

## 5. Confira se rodou com sucesso

Sua mensagem deve estar registrada no arquivo de log:

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
```

Para encontrar esse arquivo, cole o seguinte endereço na barra de navegação do Explorador do Windows:

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox
```

Abra o arquivo `Player.log` no Bloco de Notas e pressione **Ctrl+F** para pesquisar por `HelloBox`.

Se você vir essa linha, parabéns: você agora é oficialmente um modder :PESgn_Congrats:. Se não vir, consulte **[Logs e depuração](#/nml/logs-and-debugging)**, pois essa página foi criada exatamente para esse momento.

## 6. Como as páginas seguintes se encaixam

A partir de agora, cada página fornecerá **um novo arquivo** em `Code/` e **uma nova linha** dentro de `OnModLoad`. O padrão será rigorosamente o mesmo:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");

    HelloTraits.Initialize();   // adicionado pela página Traços customizados
    HelloItems.Initialize();    // adicionado pela página Itens customizados
    // ...e assim por diante
}
```

Cada novo arquivo terá sempre este esqueleto:

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public static void Initialize()
        {
            // o código da respectiva página vai aqui
        }
    }
}
```

> [!TIP] Uma coisa de cada vez
> Adicione um arquivo, inicie o jogo, verifique o log e só então avance. Se você adicionar cinco recursos de uma vez e o jogo quebrar, você terá cinco suspeitos. Se adicionar um só, o culpado é imediato :aPES_Detect:.
