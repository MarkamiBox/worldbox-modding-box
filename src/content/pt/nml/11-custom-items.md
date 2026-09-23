---
title: Itens personalizados
group: Conteúdo do jogo
subgroup: Itens e equipamentos
icon: :wbcrystalsword:
order: 120
---

# Itens personalizados :wbcrystalsword:

Armas, armaduras, anéis e amuletos residem todos em `AssetManager.items` como `EquipmentAsset`.

A primeira coisa a entender é que **não existe um item "espada" genérico com um campo de material escolhido em tempo de execução**. Existem `sword_wood`, `sword_stone`, `sword_copper`, `sword_bronze`, `sword_silver`, `sword_iron`, `sword_steel`, `sword_mythril`, `sword_adamantine`. Nove assets separados, cada um com seu custo, atributos e string de `material`. O mesmo vale para cada armadura, arco ou amuleto.

É por isso que clonar não é apenas o caminho fácil aqui: é o único caminho sensato.

## Os modelos (templates)

IDs que começam com `$` são modelos (templates) e contêm toda a fiação padrão para uma classe inteira de armas:

`$equipment` · `$weapon` · `$melee` · `$range` · `$sword` · `$axe` · `$hammer` · `$spear` · `$bow` · `$helmet` · `$armor` · `$boots` · `$ring` · `$amulet` · `$accessory`

`$sword` já define `equipment_subtype`, `is_pool_weapon`, `pool_rate`, a animação de golpe, os modelos de nomes e o `group_id`. Você vai querer tudo isso.

## Criando uma arma

> [!WARNING] Uma arma sem caminho de sprite mata o carregador
> Para cada arma de pool o jogo define `path_gameplay_sprite` como `items/weapons/w_<id>` e `path_icon` como `ui/Icons/items/icon_<id>`. Ele faz isso em `post_init()`, durante o próprio carregamento, então sua arma ainda não está na lista e os dois campos ficam `null`. O preloader chama `getSpriteList(null)` e o carregamento morre com `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:.
>
> Defina os dois você mesmo. Aponte para seus arquivos em `GameResources/`, ou reaproveite um par vanilla enquanto testa o resto.

```csharp Mods/HelloBox/Code/HelloItems.cs
namespace HelloBox
{
    public static class HelloItems
    {
        public const string EMBER_BLADE = "hello_sword_ember";

        public static void Initialize()
        {
            if (AssetManager.items.has(EMBER_BLADE)) return;

            // clone() copies every field, renames it, and registers it. No add() afterwards.
            EquipmentAsset blade = AssetManager.items.clone(EMBER_BLADE, "$sword");

            blade.material = "ember";              // the material name used in its display name
            blade.metallic = true;                 // decides hit and clash sounds
            blade.equipment_value = 45;            // "how good is this" score the AI compares
            blade.rigidity_rating = 5;
            blade.quality = Rarity.R2_Epic;        // minimum quality it can roll at

            // What a city needs to forge it.
            blade.setCost(0, "common_metals", 4);
            blade.minimum_city_storage_resource_1 = 10;

            // Stats. clone() already ran add(), so base_stats exists.
            blade.base_stats["damage"] = 9f;
            blade.base_stats["critical_chance"] = 0.08f;
            blade.base_stats["attack_speed"] = 2f;

            blade.path_slash_animation = "effects/slashes/slash_fire";

            // The game derives these two in post_init(), which ran before your mod existed.
            // Set them yourself or the sprite preloader throws on a null path.
            blade.path_gameplay_sprite = "items/weapons/w_hello_sword";   // in-hand sprite in GameResources/
            blade.path_icon = "ui/Icons/items/icon_hello_sword";

            // visible immediately: no need to discover them first
            blade.needs_to_be_explored = false;

            // linkAssets() sorted every item into these lists at startup. Cities forge from
            // the subtype list, and new weapons roll from the pools: skip this and nobody
            // ever makes yours.
            AssetManager.items.equipment_by_subtypes[blade.equipment_subtype].Add(blade);
            if (blade.is_pool_weapon)
            {
                AssetManager.items.pot_weapon_assets_all.Add(blade);
                AssetManager.items.pot_weapon_assets_unlocked.Add(blade);
            }

            // Optional: code that runs on every hit landed with it.
            blade.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                if (pTile == null) return false;

                World.world.drop_manager.spawn(pTile, "fire", 10f, -1f, -1L);
                return true;
            };
        }
    }
}
```

> [!WARNING] Registrado não é o mesmo que forjado
> Uma cidade escolhe o que forjar a partir de `equipment_by_subtypes` (uma lista por subtipo de arma), e novas armas de saque são sorteadas de `pot_weapon_assets_all` e `pot_weapon_assets_unlocked`. `ItemLibrary.linkAssets()` preenche essas três listas na inicialização antes do seu mod. Sem as quatro linhas no final, sua arma existe e pode ser concedida via código, mas nenhum ferreiro no mundo jamais a forjará :PES5_Hmmmm:. Armaduras e acessórios usam `pot_equipment_by_groups_all` e `pot_equipment_by_groups_unlocked` (organizados por `group_id`) em vez das duas reservas de armas.


## Os campos do asset

### Identity

| Campo | O que faz |
| --- | --- |
| `material` | Nome do material. Compõe o nome exibido e o que o jogo compara em melhorias |
| `equipment_type` | `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet`. Qual espaço ocupa |
| `equipment_subtype` | `sword`, `axe`, `bow`, … A classe da arma. Culturas têm preferências de subtipo |
| `group_id` | Aba de categoria de equipamento. Veja **[Grupos de traços e abas](#/nml/trait-groups)** |
| `attack_type` | Comportamento corpo a corpo ou à distância |
| `quality` | A qualidade mínima com que pode surgir |
| `rarity`, `pool_rate` | Frequência com que o gerador a escolhe |
| `is_pool_weapon` | Se entra no conjunto geral de armas geradas no mapa |

### Custo e valor

| Campo | O que faz |
| --- | --- |
| `setCost(gold, res1, amount1, res2, amount2)` | A função recomendada para definir todos os custos juntos |
| `minimum_city_storage_resource_1` | A cidade não a forjará abaixo dessa quantidade em estoque |
| `equipment_value` | O quão boa a IA considera a arma. Guia a decisão do soldado de trocar de equipamento |
| `durability`, `rigidity_rating` | Durabilidade e rigidez |

### Aparência visual e estilo

| Campo | O que faz |
| --- | --- |
| `path_gameplay_sprite` | O sprite desenhado na mão da unidade |
| `colored`, `animated` | Se recebe tingimento, se é animado |
| `path_slash_animation` | O efeito visual do golpe |
| `projectile` | Para armas à distância, qual projétil é disparado. Veja **[Projéteis, feitiços e efeitos](#/nml/projectiles-spells)** |
| `name_class`, `name_templates` | Como as versões lendárias são nomeadas |

### Behaviour

| Campo | O que faz |
| --- | --- |
| `action_attack_target` | Executa a cada golpe bem-sucedido |
| `action_special_effect` + `special_effect_interval` | Executa em temporizador enquanto estiver equipada |
| `item_modifier_ids` | Encantamentos que podem aparecer nela. Veja **[Encantamentos de armas](#/nml/item-modifiers)** |
| `addSpell(id)` | Um feitiço que o portador pode conjurar |
| `addCombatAction(id)` | Uma manobra de combate concedida pela arma |


## Um efeito enquanto é empunhado

"Quem empunhar a Lâmina de Brasas fica Rápido" soa como um traço em um item. Itens não carregam traços, mas executam código em um temporizador enquanto estão equipados (`action_special_effect` da tabela acima), e um **status** expira por conta própria. Assim, o item fica reaplicando um status curto, e quando o item é retirado, o status simplesmente expira:

```csharp Mods/HelloBox/Code/HelloItems.cs
blade.special_effect_interval = 1f;
blade.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    StatusAsset status = AssetManager.status.get(HelloStatus.CURSED);
    if (status == null) return false;

    // 3 segundos, renovado a cada segundo enquanto empunhado. Ao soltar a lâmina, ele desaparece
    World.world.statuses.newStatus(actor, status, 3f);
    return true;
};
```

O status precisa de `allow_timer_reset = true` (o padrão para um novo `StatusAsset`, mas não para todos os vanilla dos quais você poderia clonar), senão reaplicá-lo antes do tempo não faz nada e ele expirará no meio do combate. No HelloBox, a lâmina amaldiçoa seu próprio portador, que é exatamente o que uma lâmina de brasas faria :wbfacepalm:.

Por que não um traço: um traço permanece até que algo o remova, então você precisaria de um segundo temporizador para notar que a lâmina se foi e removê-lo. Um status se limpa sozinho.

## Seu próprio sprite

Um item tem dois elementos visuais, e eles ficam em campos separados:

```text
HelloBox/
└── GameResources/
    ├── items/
    │   └── weapons/
    │       ├── sprites.json                 <- bottom-center pivot
    │       └── w_hello_sword/
    │           └── w_hello_sword.png        <- what the unit holds
    └── effects/slashes/
        └── slash_fire.png                   <- the swing
```

```csharp
blade.path_gameplay_sprite = "items/weapons/w_hello_sword";
blade.path_slash_animation = "effects/slashes/slash_fire";
```

> [!NOTE] Armas precisam de uma pasta para o LoadAll
> O pré-carregador de armas do jogo chama `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, que executa `Resources.LoadAll<Sprite>`. No NeoModLoader, o `LoadAll` pesquisa por nome de diretório. Se `path_gameplay_sprite` for `"items/weapons/w_hello_sword"`, o NML procurará uma pasta em `GameResources/items/weapons/w_hello_sword/`. Se você colocar apenas um arquivo solto `w_hello_sword.png` sem a pasta, o `LoadAll` não encontra nenhum diretório, retorna 0 sprites e o jogo registra `Weapon Texture is Missing`. Colocar o sprite dentro de uma pasta com esse nome resolve o problema.

> [!NOTE] Armas precisam de uma pasta para o LoadAll
> O pré-carregador de armas do jogo chama `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, que executa `Resources.LoadAll<Sprite>`. No NeoModLoader, o `LoadAll` pesquisa por nome de diretório. Se `path_gameplay_sprite` for `"items/weapons/w_hello_sword"`, o NML procurará uma pasta em `GameResources/items/weapons/w_hello_sword/`. Se você colocar apenas um arquivo solto `w_hello_sword.png` sem a pasta, o `LoadAll` não encontra nenhum diretório, retorna 0 sprites e o jogo registra `Weapon Texture is Missing`. Colocar o sprite dentro de uma pasta com esse nome resolve o problema.

> [!NOTE] Armas precisam de uma pasta para o LoadAll
> O pré-carregador de armas do jogo invoca `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, que executa `Resources.LoadAll<Sprite>`. No NeoModLoader, o `LoadAll` busca por nome de pasta. Se `path_gameplay_sprite` for `"items/weapons/w_hello_sword"`, o NML procurará um diretório em `GameResources/items/weapons/w_hello_sword/`. Se você colocar apenas um arquivo solto `w_hello_sword.png` sem a pasta, o `LoadAll` não encontra nada, retorna 0 sprites e o jogo registra `Weapon Texture is Missing`. Colocar o sprite dentro de uma pasta com esse nome resolve a pendência.

O sprite de uma arma é renderizado na escala da unidade e exige um ponto pivô no centro inferior (`PivotX: 0.5, PivotY: 0.0` em `sprites.json`), caso contrário flutuará fora da mão (veja **[Sprites e recursos](#/nml/sprites-and-resources)**).

Deixar qualquer um dos campos apontando para o valor vanilla (como `"items/weapons/w_sword_iron"`) carregará a arte oficial do jogo, o que é ótimo para a sua primeira arma :PESgn_Neat:.

## Uma linha inteira de materiais

Mesmo dilema das criaturas: um único item raramente é o que você quer. Nove materiais exigem nove assets, e nove blocos duplicados significam nove lugares para consertar erros.

```csharp
private struct Mat
{
    public string Suffix;
    public int Value;
    public float Damage;
    public int Cost;
}

private static readonly Mat[] Mats = new Mat[]
{
    new Mat { Suffix = "copper", Value = 15, Damage = 4f, Cost = 2 },
    new Mat { Suffix = "iron",   Value = 30, Damage = 6f, Cost = 3 },
    new Mat { Suffix = "steel",  Value = 40, Damage = 7f, Cost = 4 },
};

private static void RegisterLine(string pPrefix, string pTemplate)
{
    for (int i = 0; i < Mats.Length; i++)
    {
        string id = pPrefix + "_" + Mats[i].Suffix;
        if (AssetManager.items.has(id)) continue;

        EquipmentAsset item = AssetManager.items.clone(id, pTemplate);
        item.material = Mats[i].Suffix;
        item.metallic = true;
        item.equipment_value = Mats[i].Value;
        item.setCost(0, "common_metals", Mats[i].Cost);
        item.base_stats["damage"] = Mats[i].Damage;
    }
}

// RegisterLine("hello_glaive", "$spear");
```

## Os textos de localização

Itens são nomeados de forma diferente de tudo nesta documentação, pegando muitos de surpresa. O nome visível de um item é resolvido da seguinte forma:

```text
translation_key   ?? "item_" + (equipment_subtype ?? id)
```

Portanto, a lâmina acima, clonada de `$sword`, herda `equipment_subtype = "sword"` e aparece como **Espada** (a chave vanilla), e não com o seu id. Duas saídas:

```csharp
blade.translation_key = "hello_sword_ember";   // seu nome exclusivo, mantendo o subtipo espada
```

Ou deixar o nome do subtipo intacto e deixar o **material** falar por si, como o vanilla faz: toda espada se chama "Espada", e `sword_iron` vira "Espada de Ferro" devido à chave do material.

```json Mods/HelloBox/Locales/en.json
{
  "hello_sword_ember": "Ember Blade",
  "hello_sword_ember_description": "Forged in something that is still angry about it.",

  "item_mat_ember": "Ember"
}
```

| Chave | De onde vem |
| --- | --- |
| `item_<subtype>` ou sua `translation_key` | O nome |
| `<id>_description` | O tooltip |
| `item_mat_<material>` | A palavra do material no nome |

Um material novo precisa **sempre** de sua chave `item_mat_`, senão sua arma aparecerá com o identificador técnico cru na frente do nome.

## Colocando o item nas mãos de uma unidade

Um **asset** é a receita. Um **item** é o objeto real que uma criatura específica empunha, com qualidade sorteada, modificadores e nome. Dois passos:

```csharp
EquipmentAsset asset = AssetManager.items.get(HelloItems.EMBER_BLADE);
if (asset == null || actor == null) return;

// 1. instanciar um item de verdade a partir da receita
Item item = World.world.items.generateItem(asset, actor.kingdom, actor.getName(), 1, actor);

// 2. entregar à unidade - setItem escolhe o slot certo a partir de equipment_type
actor.equipment.setItem(item, actor);
```

O `generateItem` sorteia qualidade e modificadores exatamente como o saque gerado no jogo, de modo que o item final que a unidade recebe nunca é rigorosamente idêntico ao asset que você registrou.

## Ferramentas nas mãos

O martelo que um construtor empunha e a cesta que um coletor carrega não são itens de inventário. São **ferramentas de mão**: gráficos puramente visuais, exibidos enquanto uma tarefa exigir e ocultados quando ela termina.

```csharp Mods/HelloBox/Code/HelloTools.cs
using ai.behaviours;   // BehaviourTaskActor

namespace HelloBox
{
    public static class HelloTools
    {
        public const string TORCH = "hello_torch";

        public static void Initialize()
        {
            if (AssetManager.unit_hand_tools.has(TORCH)) return;

            UnitHandToolAsset torch = new UnitHandToolAsset
            {
                id = TORCH,
                path_gameplay_sprite = "items/tools/tool_hello_torch"   // a folder of frames
            };

            AssetManager.unit_hand_tools.add(torch);

            // loadSprites() ran at startup. An empty list here is a hand holding nothing.
            torch.gameplay_sprites = SpriteTextureLoader.getSpriteList(torch.path_gameplay_sprite);

            // A tool shows up while a task forces it. Give it to the task from the AI page.
            BehaviourTaskActor drive = AssetManager.tasks_actor.get(HelloAI.TASK);
            if (drive != null) drive.force_hand_tool = TORCH;
        }
    }
}
```

Uma tarefa exibe sua ferramenta através de `force_hand_tool`, de modo que a tocha aparecerá sempre que uma criatura executar a tarefa de vaguear de **[IA e comportamentos personalizados](#/nml/custom-ai)**.

> [!WARNING] Carregue os quadros manualmente
> `UnitHandToolLibrary.loadSprites()` preenche `gameplay_sprites` para cada ferramenta na inicialização. Uma ferramenta adicionada depois não possui nenhum e a unidade segurará o vazio. O caminho é lido com `getSpriteList()`, portanto deve ser uma **pasta** de quadros (`items/tools/tool_hello_torch/`), mesmo para um único quadro. Sem um pivô no `sprites.json`, a ferramenta se posicionará no centro da imagem.

| Campo | O que faz |
| --- | --- |
| `path_gameplay_sprite` | A pasta. O jogo a preenche a partir do ID: `items/tools/tool_<id>` |
| `animated` | Reproduz os quadros em loop, como a xícara de café |
| `colored` | Colore a ferramenta com a cor do reino, como a bandeira |

> [!TIP] Primeiro encantamentos, depois armas
> Uma nova arma requer sprites, uma linha de materiais, custos e balanceamento. Um novo **modificador** exige vinte linhas e se aplica a todas as armas do jogo, incluindo as de outros mods. Se quiser novidades no jogo hoje mesmo, leia **[Encantamentos de armas](#/nml/item-modifiers)** primeiro :PESgn_DoIt:.
