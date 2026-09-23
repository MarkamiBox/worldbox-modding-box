---
title: Efeitos de status
group: Conteúdo do jogo
subgroup: Atores, construções e IA
icon: :wbcursed:
order: 146
---

# Efeitos de status :wbcursed:

Um traço define quem uma criatura **é**. Um efeito de status define o que está acontecendo com ela **neste exato momento**: pegando fogo, congelada, envenenada, abençoada. Eles expiram sozinhos com o tempo, sobrepõem seu próprio sprite sobre a criatura e podem executar código em um temporizador.

## Registrando um efeito

Status vivem em `AssetManager.status`. Mesmo padrão dos traços: construir o asset, preencher os campos, registrar.

```csharp Mods/HelloBox/Code/HelloStatus.cs
namespace HelloBox
{
    public static class HelloStatus
    {
        public const string CURSED = "hello_cursed";

        public static void Initialize()
        {
            if (AssetManager.status.has(CURSED)) return;

            StatusAsset cursed = new StatusAsset
            {
                id = CURSED,

                // Statuses do NOT derive their locale keys from the id.
                // Set both, or the unit shows a blank tooltip.
                locale_id = "status_title_hello_cursed",
                locale_description = "status_description_hello_cursed",

                texture = "fx_hello_status",          // a folder of frames in GameResources/effects/
                path_icon = "ui/Icons/iconHelloStatus",       // icon in GameResources/ui/Icons/
                duration = 20f,                           // seconds, then it removes itself
                tier = StatusTier.Advanced,               // None, Basic or Advanced
                can_be_cured = true,
                allow_timer_reset = true,                 // re-applying refreshes the timer
                animated = true,
                animation_speed = 0.15f,
                loop = true,
                scale = 1f,
                offset_y = 0.2f,
                affects_mind = false,
                removed_on_damage = false,
                opposite_status = new string[] { "blessed" },
                remove_status = new string[] { "shield" }
            };

            // StatusAsset allocates its own base_stats, so unlike traits you can set
            // these before add(). Doing it after works too, and is the safer habit.
            cursed.base_stats["damage"] = -5;
            cursed.base_stats["speed"] = -10f;

            AssetManager.status.add(cursed);

            // StatusLibrary turns texture into frames, and flags the status as drawable, in its
            // own post-init: before your mod existed. Without these two the first unit that gets
            // the status throws NullReferenceException every frame.
            cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
            cursed.need_visual_render = true;
        }
    }
}
```

> [!WARNING] Os frames só são carregados para status vanilla
> `StatusLibrary` preenche `sprite_list` a partir de `"effects/" + texture` e liga `need_visual_render`, uma vez, enquanto o jogo carrega. Um status adicionado depois tem `sprite_list = null`, e assim que uma criatura o recebe, `Status.updateAnimationFrame()` lança `NullReferenceException` todo frame enquanto durar :wbfacepalm:. As duas últimas linhas de `Initialize` fazem isso pelo seu.
>
> `texture` nomeia uma **pasta**: `GameResources/effects/fx_hello_status/` com um PNG por frame de animação.


### Os campos mais importantes

| Campo | O que faz |
| --- | --- |
| `duration` | Duração em segundos. O status se remove sozinho ao terminar |
| `allow_timer_reset` | Se reaplicar o status reinicia o contador em vez de não fazer nada |
| `tier` | `StatusTier.None`, `Basic` ou `Advanced`. O `allowed_status_tiers` da unidade decide |
| `can_be_cured` | Se um poder de cura ou efeito medicinal pode removê-lo |
| `removed_on_damage` | Cai no instante em que a criatura sofre dano |
| `cancel_actor_job` | Interrompe o que a unidade estiver fazendo ao ser aplicado |
| `affects_mind` | Marca o efeito como perturbação mental |
| `opposite_status` | Status que não podem coexistir com este |
| `remove_status` | Status removidos imediatamente quando este entra |
| `base_stats` | Modificadores de atributos durante o efeito |
| `locale_id` / `locale_description` | Chaves de nome e tooltip. **Obrigatórias** |
| `path_icon` | O ícone na lista de status |
| `texture`, `sprite_list`, `animated`, `loop`, `animation_speed` | O sprite desenhado sobre a unidade. `texture` é o nome direto sob `effects/` |
| `offset_x`, `offset_y`, `scale`, `rotation_z`, `render_priority` | Posição e renderização |
| `opposite_traits`, `opposite_tags` | Traços e tags que barram este status |
| `action_on_receive`, `action_get_hit` | Callbacks ao receber o status e ao ser atingido |
| `sound_idle` | Efeito sonoro FMOD em loop enquanto ativo |

## Seu próprio sprite

Aqui há uma armadilha clássica. `texture` **não** é um caminho completo: a biblioteca de status adiciona `effects/` automaticamente antes de carregar, então você escreve apenas o nome do arquivo.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/
        └── fx_hello_status/
            ├── fx_hello_status_0.png
            ├── fx_hello_status_1.png
            └── fx_hello_status_2.png
```

```csharp
cursed.texture = "fx_hello_status";   // NÃO "effects/fx_hello_status"
```

Se você colocar a pasta na string, o jogo tentará carregar `effects/effects/fx_hello_status`, não encontrará nada e não desenhará nenhum sprite.

Já o `path_icon` no mesmo asset é um campo diferente e ele *é* um caminho completo: é o pequeno ícone da interface, não o efeito colado no corpo da unidade.

## Fazendo o efeito *fazer* algo

`action` executa a cada `action_interval` segundos enquanto o status durar. `action_finish` executa ao expirar, e `action_death` se a unidade morrer com ele.

```csharp
cursed.action_interval = 1f;
cursed.action = (BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.changeHealth(-2);   // método público ideal para dano contínuo
    return true;
};
```

## Aplicando a uma unidade

O método mais óbvio, `actor.addStatusEffect("hello_cursed")`, é `internal` no assembly do jogo. Ele compila sem problemas contra uma `Assembly-CSharp.dll` **publicizada**, e um mod NML normal já tem uma: o NML compila seu `Code/*.cs` contra a própria cópia publicizada, por isso todo membro `internal` deste guia compila para você. Você só perde isso quando compila sua própria `.dll` no Visual Studio contra o assembly original. Nesse caso, a rota pública sempre funciona:

```csharp
StatusAsset asset = AssetManager.status.get(HelloStatus.CURSED);
World.world.statuses.newStatus(actor, asset, 20f);   // 20s, ou 0 para a duração original do asset
```

Dentro de árvores de comportamento há nós prontos: `new BehActorAddStatus("hello_cursed", 20f)` e `new BehActorRemoveStatus("hello_cursed")`.

## Não esqueça dos textos

```json Mods/HelloBox/Locales/en.json
{
  "status_title_hello_cursed": "Cursed",
  "status_description_hello_cursed": "Something very old is very annoyed at this creature."
}
```

As chaves são exatamente o que você colocar em `locale_id` e `locale_description`. Seguir o formato vanilla `status_title_<id>` / `status_description_<id>` mantém seus arquivos organizados.

> [!TIP] Status são ideais para efeitos temporários
> Qualquer efeito passageiro (um bônus do seu poder divino, uma penalidade da sua arma, uma marcação temporária) deve ser um status, não um traço. Traços são permanentes e são herdados pelos filhos, o que quase nunca é o que você pretendia :PES2_Uhm:.
