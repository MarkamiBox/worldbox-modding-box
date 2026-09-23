---
title: Nuvens e clima
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbtornado:
order: 172
---

# Nuvens e clima :wbtornado:

Uma nuvem é um sprite que flutua pelo mapa soltando objetos sobre o que estiver embaixo. Chuva, ácido, lava, neve, fogo: todos são o mesmo asset com uma cor diferente e um `drop_id` distinto.

As nuvens têm o melhor custo-benefício de todo o jogo para um modder. Um único asset, sem precisar desenhar nada, e ele se desloca, solta gotas, ilumina o chão e aparece sozinho na lista de desastres.

## Registrar uma nuvem

```csharp Mods/HelloBox/Code/HelloClouds.cs
using System.Collections.Generic;
using UnityEngine;

namespace HelloBox
{
    public static class HelloClouds
    {
        public const string EMBER = "hello_cloud_ember";

        // Your own art: GameResources/effects/clouds/hello_cloud.png
        private static readonly string[] Sprites = new string[]
        {
            "effects/clouds/hello_cloud"
        };

        public static void Initialize()
        {
            if (AssetManager.clouds.has(EMBER)) return;

            AssetManager.clouds.add(new CloudAsset
            {
                id = EMBER,
                color_hex = "#D14219",
                max_alpha = 0.8f,
                drop_id = "hello_ember",          // a drop id: see Drops & falling things
                cloud_action_1 = CloudLibrary.dropAction,
                interval_action_1 = 0.05f,
                speed_min = 1f,
                speed_max = 3f,
                considered_disaster = true,       // counts as a disaster in the game's own lists
                draw_light_area = true,
                draw_light_size = 4f,
                path_sprites = Sprites
            });

            // CloudLibrary turns path_sprites into sprites and color_hex into a colour during
            // the game's own startup, before your mod existed. Do both for yours.
            CloudAsset cloud = AssetManager.clouds.get(EMBER);
            List<Sprite> loaded = new List<Sprite>();
            foreach (string path in cloud.path_sprites)
            {
                Sprite sprite = SpriteTextureLoader.getSprite(path);
                if (sprite != null) loaded.Add(sprite);
            }
            cloud.cached_sprites = loaded.ToArray();
            cloud.color = Toolbox.makeColor(cloud.color_hex);
        }
    }
}
```

> [!WARNING] Uma nuvem registrada tarde não tem sprites
> `CloudLibrary` monta `cached_sprites` a partir de `path_sprites` e `color` a partir de `color_hex` numa passada só enquanto o jogo carrega. Sua nuvem ainda não estava na lista, então os dois ficam vazios, e na primeira vez que ela aparece o jogo lança `NullReferenceException` em `Cloud.prepare()` :wbfacepalm:. As últimas seis linhas de `Initialize` fazem essa passada para a sua.


### Os campos

| Campo | O que faz |
| --- | --- |
| `color_hex` | A tonalidade. Isso define a maior parte da personalidade da nuvem |
| `max_alpha` | O quanto ela é opaca. `0.8` por padrão |
| `drop_id` | O item que ela chove. Qualquer id em `AssetManager.drops`, vanilla ou seu |
| `cloud_action_1` / `cloud_action_2` | Duas ações independentes, cada uma no seu próprio temporizador |
| `interval_action_1` / `interval_action_2` | Segundos entre execuções de cada ação |
| `speed_min` / `speed_max` | Velocidade de deriva. Cada nuvem sorteia o seu valor dentro desse intervalo |
| `path_sprites` | A lista de sprites. O jogo escolhe um aleatoriamente por nuvem |
| `considered_disaster` | Se o jogo a trata como um desastre oficial |
| `normal_cloud` | Marca-a como clima comum em vez de evento extraordinário |
| `draw_light_area`, `draw_light_size`, `draw_light_area_offset_x/y` | O brilho no chão, para nuvens de fogo e lava |

## O que é uma ação de nuvem

Uma `CloudAction` recebe a nuvem em execução e não retorna nada:

```csharp
public delegate void CloudAction(Cloud pCloud);
```

`CloudLibrary.dropAction` é a ação padrão de vanilla: ela escolhe um ladrilho aleatório sob o sprite da nuvem e gera um `drop_id` lá. Em 90% das vezes essa é a única ação que você vai querer: configure-a em `cloud_action_1` e pronto.

Para algo a mais, escreva seu próprio método e coloque-o em `cloud_action_2`:

```csharp
private static void SparkAction(Cloud pCloud)
{
    // Roda a cada interval_action_2 segundos para toda nuvem deste tipo no mapa.
    // Mantenha leve e coloque uma chance aleatória para não disparar sem parar.
    if (!Randy.randomChance(0.02f)) return;

    int x = (int)pCloud.transform.localPosition.x;
    int y = (int)pCloud.transform.localPosition.y;

    WorldTile tile = World.world.GetTile(x, y);
    if (tile == null) return;

    MapBox.spawnLightningSmall(tile, 0.15f);
}
```

Depois configure `cloud_action_2 = SparkAction; interval_action_2 = 0.1f;`.

## Seus próprios sprites

`path_sprites` é uma lista de caminhos carregados exatamente como escritos de dentro de `GameResources/`. O jogo escolhe uma textura por nuvem, e é por isso que o vanilla passa três variações.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/clouds/
        ├── cloud_hello_1.png
        ├── cloud_hello_2.png
        └── cloud_hello_3.png
```

```csharp
path_sprites = new string[]
{
    "effects/clouds/cloud_hello_1",
    "effects/clouds/cloud_hello_2",
    "effects/clouds/cloud_hello_3"
}
```

O sprite de uma nuvem é uma massa suave e cinzenta. O campo `color_hex` faz todo o trabalho visual: não pinte a textura na cor final desejada; deixe-a branca e deixe a coloração agir por conta própria :wbsmirk:.

## Colocando uma nuvem no céu

Nuvens são geradas através do sistema de efeitos, não através de um gerenciador de nuvens:

```csharp
EffectsLibrary.spawn("fx_cloud", tile, HelloClouds.EMBER);
```

Isso é exatamente o que todo poder divino de nuvem vanilla faz. Envolva isso num poder divino e o jogador terá uma ferramenta para invocá-la:

```csharp
GodPower power = new GodPower
{
    id = "hello_cloud_power",
    name = "hello_cloud_power",
    rank = PowerRank.Rank0_free,
    path_icon = "ui/Icons/iconFire",
    click_action = (WorldTile pTile, string pPowerID) =>
    {
        if (pTile == null) return false;

        EffectsLibrary.spawn("fx_cloud", pTile, HelloClouds.EMBER);
        MusicBox.playSound("event:/SFX/UNIQUE/SpawnCloud", pTile.pos.x, pTile.pos.y);
        return true;
    }
};
AssetManager.powers.add(power);
```

Veja **[Poderes divinos](#/nml/god-powers)** e **[Abas e botões de poderes](#/nml/power-buttons)** para a criação do botão.

## As nuvens vanilla

Úteis como base para clonagem e para lembrar o que já existe no jogo:

`cloud_rain` · `cloud_lightning` · `cloud_snow` · `cloud_fire` · `cloud_lava` · `cloud_acid` · `cloud_ash` · `cloud_rage`

```csharp
// Comece a partir de uma que já funciona e mude apenas a cor e o drop.
CloudAsset mine = AssetManager.clouds.clone("hello_cloud_blood", "cloud_rain");
mine.color_hex = "#8B1A1A";
mine.drop_id = "blood";
```

Lembre-se de que `clone()` já registra o asset para você: nunca chame `add()` em seguida.

## Sprites por conta própria

`path_sprites` é uma lista de caminhos sob sua pasta `GameResources/`, com as mesmas regras de qualquer outro recurso. Veja **[Sprites e recursos](#/nml/sprites-and-resources)**. O sprite de uma nuvem é apenas uma massa suave; `color_hex` faz toda a magia, então uma forma em tons de cinza é tudo de que você precisa.

> [!TIP] Nuvens antes de desastres complexos
> Um "desastre" nas listas internas do jogo frequentemente nada mais é do que uma nuvem com `considered_disaster = true`. Antes de escrever um desastre completo com condições de surgimento e contadores de tempo, verifique se uma nuvem chovendo o seu drop já não resolve perfeitamente o seu problema :PES2_HmmmmThumbsUp:.
