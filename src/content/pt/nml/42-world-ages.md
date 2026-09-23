---
title: Eras do mundo e comportamentos
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbsunblessed:
order: 174
---

# Eras do mundo e comportamentos :wbsunblessed:

Dois conceitos pertencem ao mundo em si e não a qualquer criatura viva nele. Uma **era do mundo** (world age) é a época na roda das eras: a Era da Esperança, a Era das Cinzas, com seu clima, sua iluminação e suas regras. Um **comportamento do mundo** (world behaviour) é um trecho de código que o mundo executa periodicamente, para sempre: é assim que o jogo nativo agenda desastres, migrantes e deterioração de estradas.

```csharp Mods/HelloBox/Code/HelloAges.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAges
    {
        public const string EMBERS = "age_hello_embers";
        public const string SPARKS = "hello_sparks";

        public static void Initialize()
        {
            RegisterAge();
            RegisterBehaviour();
        }

        private static void RegisterAge()
        {
            if (AssetManager.era_library.has(EMBERS)) return;

            WorldAgeAsset age = new WorldAgeAsset
            {
                id = EMBERS,
                path_icon = "ui/Icons/iconHelloAge",
                rate = 2,
                particles_ash = true,
                overlay_ash = true,
                era_effect_overlay_alpha = 0.2f,
                title_color = Toolbox.makeColor("#D14219"),
                bonus_loyalty = 5,
                fire_spread_rate_bonus = 2f,
                cloud_interval = 20f,
                special_effect_interval = 8f
            };
            age.clouds = new List<string> { HelloClouds.EMBER };
            age.biomes = new HashSet<string> { "biome_savanna" };
            age.default_slots = new List<int> { 4 };
            age.special_effect_action = RainEmbers;

            AssetManager.era_library.add(age);

            // post_init() builds this path from the id, at startup. Borrow a vanilla background.
            age.path_background = "ui/AgeWheel/backgrounds/age_sun_background";

            // linkAssets() built both pools at startup: the random pick, and the wheel's default slots
            AssetManager.era_library.list_only_normal.Add(age);
            foreach (int slot in age.default_slots)
            {
                if (AssetManager.era_library.pool_by_slots.TryGetValue(slot, out List<WorldAgeAsset> pool)) pool.Add(age);
            }
        }

        /** Every special_effect_interval seconds while the age lasts. */
        private static void RainEmbers()
        {
            WorldTile[] tiles = World.world.tiles_list;
            if (tiles == null || tiles.Length == 0) return;

            for (int i = 0; i < 5; i++)
            {
                WorldTile tile = tiles[Randy.randomInt(0, tiles.Length)];
                if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
            }
        }

        private static void RegisterBehaviour()
        {
            if (AssetManager.world_behaviours.has(SPARKS)) return;

            WorldBehaviourAsset sparks = new WorldBehaviourAsset
            {
                id = SPARKS,
                interval = 30f,          // seconds between runs
                interval_random = 15f,   // plus up to this much, so it does not tick like a metronome
                action = CurseSomebody
            };

            AssetManager.world_behaviours.add(sparks);

            // MapBox creates one manager per behaviour when it wakes up, before your mod.
            // Without this the world loop calls update() on null, every frame.
            sparks.manager = new WorldBehaviour(sparks);
        }

        /** While the chaos law is on, a random creature catches the curse. */
        private static void CurseSomebody()
        {
            WorldLawAsset chaos = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
            if (chaos == null || !chaos.isEnabled()) return;

            List<Actor> units = World.world.units.getSimpleList();
            if (units.Count == 0) return;

            Actor victim = units[Randy.randomInt(0, units.Count)];
            if (victim != null && victim.isAlive()) victim.addStatusEffect(HelloStatus.CURSED);
        }
    }
}
```

## Eras do mundo

A Era das Brasas faz chover brasas a cada oito segundos, escurece a tela com partículas de cinza, propaga o fogo duas vezes mais rápido e mantém as cidades um pouco mais leais. Um novo mundo pode colocá-la no slot 4 de sua roda, e o botão de aleatorizar da roda pode sorteá-la em qualquer lugar.

> [!WARNING] Três operações que a biblioteca fez na inicialização
> `post_init()` define o fundo de cada era a partir de seu ID, e `linkAssets()` constrói `list_only_normal` (a reserva para a era aleatória desconhecida) e `pool_by_slots` (as reservas com as quais um novo mundo preenche a roda). Uma nova era não está em nenhuma delas. Se você omitir o fundo, a roda exibirá um pedaço vazio; se omitir as reservas, a era existirá, mas nenhum mundo jamais a sorteará.

> [!NOTE] A lista de eras selecionáveis
> A janela de eras cria um botão por era quando é inicializada, e o jogo pré-carrega essa janela. Não verifiquei se ela inicializa antes ou depois do carregamento dos mods, então verificar se a sua ganha um botão lá é algo para conferir no jogo, não uma garantia. A roda, as reservas aleatórias e os efeitos especiais não dependem disso.

| Campo | O que faz |
| --- | --- |
| `rate` | Peso quando uma era é sorteada aleatoriamente |
| `default_slots` | Quais slots da roda (1 a 8) um novo mundo pode usar para ela |
| `clouds` + `cloud_interval` | Nuvens geradas e sua frequência |
| `special_effect_action` + `special_effect_interval` | Seu código periódico enquanto a era estiver ativa |
| `overlay_*`, `particles_*`, `era_effect_overlay_alpha` | Aparência visual: escuridão, chuva, neve, cinza, sol |
| `title_color`, `light_color` | Cor do título e da iluminação ambiente |
| `bonus_loyalty`, `bonus_opinion`, `bonus_biomes_growth` | Bônus aplicados à política e ao crescimento vegetal |
| `fire_spread_rate_bonus`, `temperature_damage_bonus`, `range_weapons_multiplier` | Regras do jogo modificadas |
| `flag_night`, `flag_winter`, `flag_chaos`, `flag_light_age`, `flag_crops_grow` | Interruptores consultados por outros sistemas. Cultivos só crescem se `flag_crops_grow` for true |

As chaves de texto são `<id>_title` e `<id>_description`.

## Comportamentos do mundo

Um comportamento é definido por dois números e um delegado: execute `action` a cada `interval` segundos, mais até `interval_random` segundos de variação aleatória. Ele pausa junto com o mundo, a menos que você defina `stop_when_world_on_pause = false`, e `action_world_clear` é executado ao carregar um novo mundo.

> [!WARNING] O gerenciador é criado na inicialização
> O mundo mantém um temporizador `WorldBehaviour` por asset, criado por `createManagers()` quando o mapa acorda pela primeira vez, antes do seu mod. O seu tem `manager == null`, e o loop de atualização do mundo tenta chamá-lo mesmo assim: `NullReferenceException`, a cada frame, enquanto o jogo estiver aberto :wbfacepalm:. A linha logo após `add()` resolve isso.

O comportamento do HelloBox não faz nada enquanto sua lei mundial estiver desativada. Esse é o padrão recomendado: a verificação é levíssima, então deixe o temporizador rodar e decida dentro da ação.

```json Mods/HelloBox/Locales/en.json
{
  "age_hello_embers_title": "Age of Embers",
  "age_hello_embers_description": "The sky is on fire, a little. Cities like it."
}
```

Para código que deve rodar em seu próprio cronograma sem fazer parte do mundo (como interface de usuário), o método `Update()` do NML na sua classe principal continua sendo a opção mais simples: veja **[O mod finalizado](#/nml/all-together)** :PES_OkHand:.
