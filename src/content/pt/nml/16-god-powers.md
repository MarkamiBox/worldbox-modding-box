---
title: Poderes divinos
group: Conteúdo do jogo
subgroup: Poderes divinos e interface
icon: :wbgodfinger:
order: 200
---

# Poderes divinos :wbgodfinger:

Um poder divino é o que acontece quando o jogador escolhe sua ferramenta e clica no mundo. Gerar algo, abençoar algo, explodir algo.

Duas coisas separadas estão envolvidas, e confundi-las é o clássico erro de principiante:

| | |
| --- | --- |
| O **poder** (`GodPower`) | Os dados: um id, um ícone e o código executado ao clicar |
| O **botão** (`PowerButton`) | O item na barra que o jogador realmente pode pressionar |

Esta página cria o poder. A página de **[Abas e botões de poder](#/nml/power-buttons)** coloca-o na tela.

## Criar o poder

```csharp Mods/HelloBox/Code/HelloPowers.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloPowers
    {
        public const string STRIKE = "hello_strike";

        public static void Initialize()
        {
            // Nunca registre o mesmo id duas vezes: o jogo mantém o primeiro.
            if (AssetManager.powers.get(STRIKE) != null) return;

            GodPower strike = new GodPower
            {
                id = STRIKE,
                name = STRIKE,
                rank = PowerRank.Rank0_free,        // nenhum desbloqueio necessário
                path_icon = "ui/Icons/iconFire",
                unselect_when_window = true,        // solta a ferramenta ao abrir uma janela
                show_tool_sizes = false,            // sem tamanhos de pincel pequeno/médio/grande

                // O que acontece quando o jogador clica em um ladrilho com esta ferramenta armada.
                click_action = (WorldTile pTile, string pPowerID) =>
                {
                    if (pTile == null) return false;

                    EffectsLibrary.spawnExplosionWave(pTile.posV3, 3f, 0.5f);
                    Earthquake.startQuake(pTile);
                    return true;   // true = o clique foi consumido
                }
            };

            AssetManager.powers.add(strike);
        }
    }
}
```

Adicione `HelloPowers.Initialize();` ao `Main.cs`.

### O que cada parte faz

- **`id`**: o nome ao qual todo o resto se refere. O botão, a tradução, outros mods.
- **`name`**: usado pelas buscas de interface interna do jogo. Mantê-lo igual ao id evita dores de cabeça.
- **`rank = PowerRank.Rank0_free`**: disponível desde o início, sem necessidade de desbloqueio.
- **`path_icon`**: o cursor da ferramenta e o ícone.
- **`unselect_when_window`**: quando o jogador abre uma janela, a ferramenta é desarmada para não golpear acidentalmente o mapa por trás do painel.
- **`click_action`**: seu código. Recebe o **ladrilho clicado** e o **id do poder**, retornando `true` caso tenha feito algo.

> [!WARNING] A assinatura do clique é (WorldTile, string)
> `click_action` é um `PowerActionWithID`, logo seu segundo argumento é o **id do poder como string**, não um `GodPower`. Há um segundo campo, `click_power_action`, que recebe `(WorldTile, GodPower)`. Usar a assinatura errada resulta em um erro de compilação sem pé nem cabeça :PES_DaFuq:.

## Coisas úteis para fazer ao clicar

```csharp
// a unidade em pé sobre (ou ao lado do) ladrilho, se houver
Actor actor = null;
foreach (Actor found in Finder.getUnitsFromChunk(pTile, 1, 2.5f))
{
    if (found != null && found.isAlive()) { actor = found; break; }
}

// gerar uma criatura
World.world.units.spawnNewUnit("wolf", pTile);

// um efeito visual no ladrilho
EffectsLibrary.spawnAt("fx_lightning_small", pTile.posV3, 0.25f);

// derrubar algo do céu (ver Gotas e coisas que caem)
World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

// exibir uma mensagem ao jogador
WorldTip.showNow("The gods are displeased.", false, "top", 3f);
```

## Segurar para pintar

Definir `hold_action = true` e um `click_interval` faz com que o poder se repita enquanto o mouse estiver pressionado, como os pincéis vanilla:

```csharp
strike.hold_action = true;
strike.click_interval = 0.15f;   // segundos entre repetições
```

## Seu próprio ícone

`path_icon` é o cursor da ferramenta e a face do botão. Carregado exatamente como escrito, de dentro de `GameResources/`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloStrike.png
```

```csharp
strike.path_icon = "ui/Icons/iconHelloStrike";
```

> [!WARNING] Um ícone ausente é um botão invisível
> Se o caminho estiver errado, o sprite retornado é `null`, e um sprite `null` não é um botão com desenho faltando: é um buraco na barra que o jogador jamais encontrará. Veja a função auxiliar de reserva em **[Abas e botões de poder](#/nml/power-buttons)** :aPES_Hide:.

## O texto

```json Locales/en.json
{
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess. Mostly a mess."
}
```

## Pincéis

Um poder divino pinta o mapa usando um **pincel**: o formato de blocos que um clique cobre. O jogo gera a lista de pixels e a imagem de pré-visualização de cada pincel via código, portanto um novo formato não necessita de nenhuma textura.

```csharp Mods/HelloBox/Code/HelloBrushes.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloBrushes
    {
        public const string TARGET = "hello_target";

        public static void Initialize()
        {
            if (AssetManager.brush_library.has(TARGET)) return;

            BrushData target = new BrushData
            {
                id = TARGET,
                size = 6,
                group = BrushGroup.Special,
                show_in_brush_window = true,
                localized_key = "brush_hello_target",
                continuous = true,
                fast_spawn = true
            };

            // post_init() runs generate_action and measures every brush, at startup.
            // Do both yourself: a centre dot and a ring around it.
            List<BrushPixelData> pixels = new List<BrushPixelData>();
            for (int x = -6; x <= 6; x++)
            {
                for (int y = -6; y <= 6; y++)
                {
                    int dist = x * x + y * y;
                    if (dist == 0 || (dist >= 16 && dist <= 36)) pixels.Add(new BrushPixelData(x, y, dist));
                }
            }
            target.pos = pixels.ToArray();
            target.width = 13;
            target.height = 13;
            target.sqr_size = target.width * target.height;

            AssetManager.brush_library.add(target);

            // linkAssets() shuffled every brush, and post_init() listed the ones the
            // brush hotkeys cycle through. Both at startup.
            BrushLibrary.shuffleBrush(target);
            BrushLibrary._available_brushes.Add(TARGET);
        }
    }
}
```

Um poder pode travar seu uso em um pincel com `force_brush = "hello_target"`, do mesmo modo que os poderes de bloco único padrão se fixam em `sqr_0`. Os atalhos de pincel alternam entre os itens de `_available_brushes`, portanto o seu estará nessa rotação. A janela de pincéis é outro caso: ela cria seus botões ao abrir; caso seu pincel não apareça nela, o `force_brush` e as teclas de atalho continuarão funcionando.

> [!WARNING] Os pincéis são medidos na inicialização
> `BrushLibrary.post_init()` executa a `generate_action` de cada pincel e calcula `width`, `height` e `sqr_size`, enquanto `linkAssets()` embaralha os pixels. Um pincel adicionado depois não recebe nada disso: defina `pos` e as dimensões manualmente como acima. A imagem de pré-visualização é desenhada a partir de `pos`, logo o pincel não precisa de ícone.

```json Mods/HelloBox/Locales/en.json
{
  "brush_hello_target": "Target"
}
```

## Ainda não está no jogo

Correto: você criou um poder, mas nada o exibe ainda. Vá para **[Abas e botões de poder](#/nml/power-buttons)**, essa é a outra metade, e são apenas dez linhas :pepeOK:.
