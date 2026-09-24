---
title: Sprites e recursos
group: NML Modding
subgroup: Fluxo de trabalho básico
icon: :wbfanartist:
order: 28
---

# Sprites e recursos :wbfanartist:

Seu traço tem nome, atributos e uma descrição primorosa. Mas ele também tem um ponto de interrogação enorme e feio como ícone. Hora de consertar isso.

## Usando um ícone que o jogo já possui

A opção mais rápida, e a que você mais vai utilizar: apontar para o caminho de um sprite padrão do jogo.

```csharp
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
Sprite[] frames = SpriteTextureLoader.getSpriteList("effects/projectiles/arrow");
```

`getSprite` equivale ao `Resources.Load` com cache, e `getSpriteList` equivale ao `Resources.LoadAll` com cache. Caminhos não levam extensão de arquivo: é sempre `ui/Icons/iconFly`, nunca `ui/Icons/iconFly.png`.

A maioria dos campos de assets espera o **caminho em formato de texto (string)** em vez de um objeto Sprite já instanciado:

```csharp
trait.path_icon = "ui/Icons/iconHelloSwift";
power.path_icon = "ui/Icons/iconHelloStrike";
```

> [!TIP] Como descubro quais caminhos existem?
> Utilize a ferramenta de **[Pesquisa de ícones](#/tools/icons)** neste site. Ela lista todos os caminhos de sprites do jogo e aceita buscas em linguagem natural: digitar "death king" ou "lightning bolt" lhe dará o caminho exato para copiar. Caso contrário, abra o **[UnityExplorer](#/toolbox/unity-explorer)** dentro do jogo e leia o `path_icon` no asset vanilla que mais se aproxima do que você quer :aPES_Magnifying:.

## Adicionando sua própria arte

Crie uma pasta chamada **`GameResources/`** no seu mod. O NML a trata exatamente como a pasta interna `Resources` da Unity. Sendo assim, um arquivo colocado em:

```text
HelloBox/GameResources/ui/Icons/iconHelloSwift.png
```

será carregado sob o identificador `ui/Icons/iconHelloSwift` e funcionará em qualquer lugar onde um caminho vanilla funcione. As extensões `.png`, `.jpg` e `.jpeg` são reconhecidas automaticamente.

### sprites.json

Ao lado de suas imagens, um arquivo `sprites.json` explica ao NML como fatiar e ajustar as texturas. Sem ele, aplicam-se os padrões da Unity, que para pixel art costumam ficar totalmente errados. (Nem sempre é estritamente obrigatório :PESgn_Maybe: )

```json GameResources/ui/Icons/sprites.json
{
  "Default": {
    "PixelsPerUnit": 1,
    "PivotX": 0.5,
    "PivotY": 0.5
  },
  "Specific": [
    {
      "Path": "iconHelloSwift.png",
      "PivotX": 0.5,
      "PivotY": 0.0
    }
  ]
}
```

| Campo | O que faz |
| --- | --- |
| `PixelsPerUnit` | Mantenha em `1`, a menos que você tenha uma razão clara para alterar |
| `PivotX` / `PivotY` | O ponto de ancoragem. `0.5 / 0.0` significa centro-inferior, exigido para unidades e construções |
| `BorderL/R/T/B` | Bordas de 9-slice para molduras de janelas e botões redimensionáveis |
| `Path` | O arquivo específico ao qual esta regra se aplica |

`Default` é aplicado a qualquer arquivo da pasta que não possua uma regra personalizada em `Specific`.

## Onde cada tipo de arte deve ficar

Esta é a tabela para a qual todo mundo volta. Cada asset aponta para a sua arte com um campo diferente, e alguns colocam uma pasta na frente em silêncio antes de carregar, então o valor que você escreve **nem** sempre é o caminho onde o arquivo está.

| Asset | Campo | O arquivo vai em |
| --- | --- | --- |
| Traço, poder divino, reino, grupo | `path_icon` | `GameResources/` + exatamente o que você escreveu |
| Item, na mão de uma unidade | `path_gameplay_sprite` | `GameResources/` + exatamente o que você escreveu |
| Construção | `sprite_path` | Uma **pasta**: `GameResources/` + `sprite_path` + `/`, com `main_0.png`, `construction_0.png`, `ruin_0.png`. Com `sprite_path` vazio é `main_path` + id, e `main_path` por padrão é `buildings/` |
| Drop | `path_texture` | Uma **pasta**: `GameResources/` + exatamente o que você escreveu, um PNG por frame |
| Nuvem | `path_sprites` | `GameResources/` + cada caminho da lista |
| Efeito de status | `texture` | Uma **pasta**: `GameResources/effects/` + o que você escreveu, um PNG por frame |
| Projétil | `texture` | Uma **pasta**: `GameResources/effects/projectiles/` + o que você escreveu, um PNG por frame |
| Recurso, carregado na mão | `path_gameplay_sprite` | Uma **pasta**: `GameResources/items/resources/` + o que você escreveu, um PNG por frame |
| Recurso, ícone do inventário | `path_icon` | `GameResources/` + o que você escreveu. O vanilla usa um nome simples como `iconResBread`, então o arquivo fica na raiz |
| Ladrilho e ladrilho superior | *(nenhum campo)* | `GameResources/tiles/<the tile's id>/` |

> [!WARNING] "Uma pasta" não é questão de estilo
> Todo asset marcado como **pasta** acima é lido com `getSpriteList()`, que devolve os frames *dentro* de uma pasta. Aponte para um único PNG e ele volta vazio: um drop cai invisível, um projétil lança `ArgumentOutOfRangeException` em `QuantumSpriteLibrary.drawProjectiles()`, um status dá erro a cada frame. Um frame só está ótimo, ele só precisa ficar numa pasta própria: `drops/hello_ember/hello_ember_0.png` :wbfacepalm:.

Três deles mordem:

- **Status e projétil colocam uma pasta na frente.** Escrever `texture = "effects/status/myThing"` num status faz o jogo procurar `effects/effects/status/myThing`, que não existe. Os status vanilla usam um nome simples: `fx_status_burning_t`.
- **Ladrilhos ignoram os campos por completo.** A arte de um ladrilho é encontrada pelo seu **id**, numa pasta própria, porque um ladrilho tem várias variações. `hello_moss` significa `GameResources/tiles/hello_moss/` com seus PNGs dentro.
- **Construções não colam nada, mas têm um plano B.** `sprite_path` é usado exatamente como escrito: `"buildings/hello_shrine"` significa `GameResources/buildings/hello_shrine/`. Deixe vazio e o jogo usa `main_path` + id, então uma pasta escrita em `main_path` vira `buildings/hello_shrine/hello_shrine` :PESgn_Bruh:.

> [!TIP] Copie o caminho de um asset vanilla
> Pegue a coisa vanilla mais parecida, leia o campo dela no **[UnityExplorer](#/toolbox/unity-explorer)** ou na **[Busca de caminhos de sprite](#/tools/icons)**, e copie o formato exato. É mais rápido do que raciocinar, e acerta de primeira :PESgn_Noice:.

## Lendo um arquivo diretamente do disco

Às vezes você precisará da imagem em seu estado bruto: uma moldura de janela para 9-slice manual, um arquivo de dados, etc. O `ModDeclare` sabe em que pasta seu mod está instalado; nunca use caminhos absolutos fixos.

```csharp
string path = System.IO.Path.Combine(GetDeclaration().FolderPath, "GameResources", "ui", "frame.png");

Texture2D texture = new Texture2D(2, 2, TextureFormat.RGBA32, false);
texture.filterMode = FilterMode.Point;      // pixel art, sem filtro borrado
texture.LoadImage(System.IO.File.ReadAllBytes(path));
```

O utilitário `NeoModLoader.utils.SpriteLoadUtils` também oferece `LoadSingleSprite(path)` e `LoadSprites(path)` caso prefira não fazer o processo manual.

## Sons

Cada som no WorldBox é um evento FMOD, reproduzido por caminho. Você pode reproduzir qualquer um deles livremente:

```csharp
MusicBox.playSound("event:/SFX/WEAPONS/WeaponFireballStart", pTile);   // at a place in the world
MusicBox.playSoundUI("event:/SFX/UI/WindowWhoosh");                     // on the interface
```

O primeiro é reproduzido a partir daquele bloco do mundo. O HelloBox reproduz o som da bola de fogo quando sua ação de combate lança uma brasa, veja **[Projéteis, feitiços e efeitos](#/nml/projectiles-spells)**. Para encontrar caminhos, pesquise `event:/SFX/` no código do jogo: existem centenas, organizados em pastas pelo tipo de som. Abaixe o volume antes de começar a testá-los.

### Ajouter vos propres sons

O NML na verdade faz patch no FMOD por baixo dos panos, então arquivos `.wav` próprios funcionam sem você precisar montar um segundo motor de som numa garagem :PESgn_Noice:.

Coloque seu arquivo `.wav` direto em `GameResources/`, por exemplo:

```text
GameResources/sounds/hello_boom.wav
```

O NML intercepta `MusicBox.playSound` e `playDrawingSound`, então você toca o som com exatamente o mesmo método de um som vanilla (sem a extensão do arquivo):

```csharp
MusicBox.playSound("sounds/hello_boom", pTile);
```

Ao lado do arquivo, um `hello_boom.json` opcional permite configurar como ele se comporta:

```json GameResources/sounds/hello_boom.json
{
  "Volume": 60,
  "Mode": "Stereo3D",
  "Type": "Sound"
}
```

| Campo | Valores |
| --- | --- |
| `Mode` | `Basic` (2D plano, o volume fica constante), `Stereo3D` (atenuação vanilla com a distância), `Mono3D` (direcional) |
| `Type` | `Sound` (controle de efeitos), `Music` (controle de música), `UI` (controle de interface) |
| `Volume` | Volume padrão de 0 a 100 |
| `LoopCount` | Quantas vezes repetir (0 = uma vez) |

O melhor de tudo: como o NML conecta os sons aos grupos de canais do jogo, eles respeitam de verdade as configurações de volume do jogador em vez de ensurdecê-lo à meia-noite.

## Nunca entregue um sprite nulo para o jogo

Um botão sem sprite não é um botão sem ícone: ele vira um **buraco invisível** na interface que o jogador jamais conseguirá clicar. Tenha sempre um fallback pronto:

```csharp
private static Sprite Icon(string pName)
{
    Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
    if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
    return sprite;
}
```

Um ícone de aviso deixa evidente que "o caminho está incorreto". Já um buraco invisível faz você passar duas horas tentando adivinhar onde seu botão foi parar :PES4_Invisible:.
