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

Esta é a tabela de consulta que todo mundo sempre revisita. Cada asset aponta para sua arte por meio de um campo diferente, e alguns deles prefixam pastas silenciosamente antes do carregamento. O valor informado **nem sempre** é o caminho direto no disco.

| Asset | Campo | Onde colocar o arquivo |
| --- | --- | --- |
| Traço, poder divino, reino, grupo | `path_icon` | `GameResources/` + exatamente o que você escreveu |
| Item, empunhado na mão da unidade | `path_gameplay_sprite` | `GameResources/` + exatamente o que você escreveu |
| Construção | `sprite_path` | Uma **pasta**: `GameResources/` + `sprite_path` + `/`, com `main_0.png`, `construction_0.png`, `ruin_0.png`. Com `sprite_path` vazio é `main_path` + id, e `main_path` vale `buildings/` por padrão |
| Drop (recompensa) | `path_texture` | Uma **pasta**: `GameResources/` + exatamente o que você escreveu |
| Nuvem | `path_sprites` | `GameResources/` + cada caminho presente na lista |
| Efeito de status | `texture` | Uma **pasta**: `GameResources/effects/` + o que você escreveu |
| Projétil | `texture` | Uma **pasta**: `GameResources/effects/projectiles/` + o que você escreveu |
| Recurso, carregado na mão | `path_gameplay_sprite` | Uma **pasta**: `GameResources/items/resources/` + o que você escreveu |
| Recurso, ícone de inventário | `path_icon` | `GameResources/` + o que escreveu (o jogo usa nomes curtos como `iconResBread`) |
| Ladrilho (Tile) & Top Tile | *(sem campo)* | `GameResources/tiles/<id_do_ladrilho>/` |

> [!WARNING] "Uma pasta" não é questão de estilo
> Todo asset marcado como **pasta** acima é lido com `getSpriteList()`, que devolve os frames *dentro* de uma pasta. Aponte para um PNG solto e volta vazio: um drop cai invisível, um projétil lança `ArgumentOutOfRangeException` em `QuantumSpriteLibrary.drawProjectiles()`, um status lança em todo frame. Um frame só serve, ele só precisa estar na própria pasta: `drops/hello_ember/hello_ember_0.png` :wbfacepalm:.

Três armadilhas comuns:

- **Efeitos de status e projéteis prefixam uma pasta.** Escrever `texture = "effects/status/myThing"` fará o jogo buscar em `effects/effects/status/myThing`, que não existe. Os status originais usam nomes simples: `fx_status_burning_t`.
- **Ladrilhos ignoram esses campos por completo.** A arte de um ladrilho é localizada pelo seu próprio **ID** em uma pasta dedicada, pois cada ladrilho tem várias variantes. `hello_moss` exige a pasta `GameResources/tiles/hello_moss/` contendo seus PNGs.
- **Construções não juntam campos, mas têm um plano B.** `sprite_path` é usado exatamente como está: `"buildings/hello_shrine"` significa `GameResources/buildings/hello_shrine/`. Deixe vazio e o jogo usa `main_path` + id, então uma pasta escrita em `main_path` vira `buildings/hello_shrine/hello_shrine` :PESgn_Bruh:.

> [!TIP] Copie o caminho de um asset nativo
> Encontre o item vanilla mais próximo, leia o valor do campo no **[UnityExplorer](#/toolbox/unity-explorer)** ou na **[Pesquisa de ícones](#/tools/icons)** e espelhe o formato. É o jeito mais rápido e assertivo :PESgn_Noice:.

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

> [!NOTE] Novos sons personalizados são um projeto separado
> Os eventos FMOD vivem nos bancos de som do jogo e um mod não pode adicioná-los diretamente. Tocar seus próprios arquivos `.wav` significa carregá-los em um `AudioSource` do Unity por conta própria, fora dos controles de volume do jogo. Este guia não cobre isso, porque eu nunca o modifiquei e não vou fingir que fiz isso.

### Ajouter vos propres sons

NeoModLoader soporta archivos de sonido nativos `.wav` a través de `CustomAudioManager` :PESgn_Noice:.

```text
MyMod/
└── Audio/
    ├── custom_explosion.wav
    └── custom_explosion.json
```

NML parchea `MusicBox.playSound` y reproduce tus archivos .

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
