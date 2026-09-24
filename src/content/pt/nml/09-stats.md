---
title: Referência de atributos
group: Conteúdo do jogo
subgroup: Arquitetura e atributos
icon: :wbstonks:
order: 92
---

# Referência de atributos :wbstonks:

Quase todo asset que você registrar possui um bloco `base_stats`, e quase todas as páginas depois desta escrevem nele. Esta é a lista de tudo o que você tem permissão para colocar lá dentro. Todo o resto é um crash esperando a sua hora :PES5_Hmmmm:.

## Como o base_stats funciona

`base_stats` é um dicionário de `string` para `float`. A chave deve ser um dos ids de atributos listados abaixo. Escrever uma chave desconhecida **não** é inofensivo: o setter procura o id na `base_stats_library`, recebe `null` e lança uma `NullReferenceException` bem no meio do seu `Initialize()`.

Portanto, um erro de digitação em um atributo não falha silenciosamente: ele derruba toda a sua fase de registro e nada depois dessa linha executa. Mantenha os nomes de seus atributos em campos `const string` se for usá-los em mais de um lugar.

```csharp
trait.base_stats["damage"] = 15;
trait.base_stats["multiplier_health"] = 0.25f;   // +25%, não x0.25
```

## De onde vêm os valores de uma unidade

`Actor.updateStats()` limpa o bloco de atributos da unidade e o reconstrói do zero, exatamente nesta ordem. Eu ainda consulto esta tabela toda vez:

| # | Fonte | Nota |
| --- | --- | --- |
| 1 | **Subespécie**, mais o bloco masculino ou feminino | Se a unidade tiver uma |
| 1b | **Actor asset** | Apenas quando **não** há subespécie. A subespécie o *substitui*, não se acumula por cima |
| 2 | **Clã**, mais o bloco masculino ou feminino | |
| 3 | **Idioma** | |
| 4 | **Cultura** | |
| 5 | Atributos de liderança dos dados próprios da unidade | `diplomacy`, `stewardship`, `intelligence`, `warfare` |
| 6 | Cada **efeito de status** ativo nela | |
| 7 | O item de **ataque padrão** | Apenas quando desarmada |
| 8 | Cada **traço de criatura** | Traços presos a uma era são ignorados quando a era não está ativa |
| 9 | Sua **personalidade** | |
| 10 | Cada **item equipado**, com seus modificadores | |

Dois erros frequentes aqui:

- **Uma subespécie substitui os atributos do actor asset.** Coloque um número em `human` e uma unidade com subespécie nunca o verá.
- **Religião não está nesta lista.** Os `base_stats` de um traço de religião nunca alcançam uma unidade. Veja **[Traços de religião](#/nml/religion-traits)**.

Mais duas consequências:

- Um atributo fixo como `damage` é um **bônus**, não um valor final. `damage = 15` em um traço significa "+15 em cima de tudo o mais".
- Um atributo `multiplier_*` é uma **fração adicionada a 1.0**. `multiplier_health = 0.5` é +50%. `multiplier_health = -0.5` é metade da vida.

> [!WARNING] `base_stats` não existe até que o asset seja registrado
> Em um asset criado manualmente, o bloco de atributos é alocado dentro de `add()`. Mexa em `base_stats` antes dessa linha e você terá uma `NullReferenceException`. O `clone()` chama `add()` para você, então após um clone você já está seguro. Este é o travamento mais comum em todo o modding de WorldBox.

## Combat

`damage` e `armor` fazem quase todo o trabalho. O resto é para quando você quer que um traço pareça diferente, não só mais forte.

| Atributo | O que faz |
| --- | --- |
| `damage` | Dano fixo por golpe |
| `damage_range` | Variação aleatória somada ao `damage` |
| `attack_speed` | Rapidez com que os ataques saem |
| `accuracy` | Chance de acertar o golpe |
| `critical_chance` | Chance de acerto crítico |
| `critical_damage_multiplier` | Multiplicador de dano crítico |
| `armor` | Redução fixa de dano |
| `range` | Alcance do ataque |
| `throwing_range` | Alcance para armas de arremesso |
| `targets` | Quantos alvos um único ataque pode atingir |
| `projectiles` | Quantos projéteis são disparados de uma vez |
| `knockback` | O quanto um golpe empurra o alvo |
| `recoil` | O quanto um golpe empurra *você* |
| `skill_combat` | Nível de habilidade em combate |
| `skill_spell` | Nível de habilidade mágica |
| `status_chance` | Chance de aplicar um efeito de status associado |
| `area_of_effect` | Raio de dano em área |

## Body

| Atributo | O que faz |
| --- | --- |
| `health` | Vida máxima |
| `stamina` | Estamina máxima |
| `mana` | Mana máximo |
| `speed` | Velocidade de movimento |
| `mass`, `mass_2` | Massa física, usada para empurrão e física |
| `size` | Tamanho da hitbox |
| `scale` | Escala de renderização visual |
| `max_nutrition` | Capacidade de alimento que a unidade aguenta |
| `metabolic_rate` | Velocidade com que queima esse alimento |
| `construction_speed` | Velocidade de construção |
| `experience` | Ganho de experiência |

## Ciclo de vida

| Atributo | O que faz |
| --- | --- |
| `lifespan` | Expectativa de vida |
| `maturation` | Velocidade de crescimento |
| `age_adult` | Idade em que é considerada adulta |
| `age_breeding` | Idade em que pode procriar |
| `birth_rate` | Frequência de nascimentos |
| `offspring` | Quantos filhos por ninhada |
| `multiplier_offspring` | Variação percentual nessa quantidade |
| `mutation` | Chance de mutação de subespécie |
| `happiness` | Felicidade básica |

## Apenas civilizações

Estes não fazem absolutamente nada em animais. O jogo os marca como `used_only_for_civs`. Dê `diplomacy` a um lobo e você terá um lobo muito eloquente que ninguém escuta :wbwolf:.

| Atributo | O que faz |
| --- | --- |
| `diplomacy` | Atributo de líder: diplomacia |
| `warfare` | Atributo de líder: guerra |
| `stewardship` | Atributo de líder: administração |
| `intelligence` | Atributo de líder: intelecto |
| `army` | Contribuição para o tamanho do exército |
| `cities` | Quantas cidades o reino almeja ter |
| `bonus_towers` | Torres extras que a cidade pode erguer |
| `limit_population` | Teto de população |
| `limit_clan_members` | Limite de membros do clã |
| `loyalty_traits` | Lealdade vinda de traços |
| `loyalty_mood` | Lealdade vinda do humor |
| `opinion` | Opinião básica em relação aos outros |
| `multiplier_diplomacy` | Variação percentual na diplomacia |
| `multiplier_supply_timer` | Tempo de duração dos suprimentos do exército |
| `personality_aggression` | Peso de personalidade de IA: agressividade |
| `personality_administration` | Peso de personalidade de IA: administração |
| `personality_diplomatic` | Peso de personalidade de IA: diplomacia |
| `personality_rationality` | Peso de personalidade de IA: racionalidade |

## Multipliers

Todos eles são frações somadas a 1.0, de modo que `0.25` significa +25%.

`multiplier_health` · `multiplier_lifespan` · `multiplier_stamina` · `multiplier_mana` · `multiplier_damage` · `multiplier_crit` · `multiplier_speed` · `multiplier_attack_speed` · `multiplier_mass` · `multiplier_offspring` · `multiplier_diplomacy` · `multiplier_supply_timer`

## base_stats vs base_stats_meta

Todo traço carrega **dois** blocos de atributos, e errar na escolha é o bug de balanceamento mais comum em mods de meta-traços:

| Bloco | Onde ele vai parar |
| --- | --- |
| `base_stats` | Fundido no dono, e de lá para **cada criatura** que pertença a ele |
| `base_stats_meta` | Fica no dono. Lido pela cultura, clã ou subespécie, nunca por uma criatura |

```csharp
trait.base_stats["damage"] = 5;             // todo membro dessa cultura bate mais forte. Agricultores inclusive
trait.base_stats_meta["construction_speed"] = 10;   // o grupo constrói mais rápido. O dano de ninguém muda
```

Se um bônus deve ser aplicado apenas a certos membros (apenas guerreiros, apenas adultos), nenhum dos dois blocos pode expressar isso. Use um Postfix do Harmony em `Actor.updateStats` e faça o filtro você mesmo. Veja **[Patches com Harmony](#/nml/harmony-patches)**.

## Tags: as estatísticas que não são números

Um bloco `base_stats` também contém um conjunto de **tags**, que são sinalizadores booleanos em vez de números. Eles se fundem da mesma maneira que os atributos, permitindo que um traço dê imunidade ao fogo a uma criatura exatamente como daria dano:

```csharp
trait.base_stats.addTag("immunity_fire");
trait.base_stats.addTag("fast_swimming");

if (actor.stats.hasTag("immunity_fire")) { }
```

As tags que o próprio jogo avalia:

| Grupo | Tags |
| --- | --- |
| Imunidade | `immunity_fire` · `immunity_cold` · `building_immunity_fire` · `damaged_by_water` |
| Movimento | `fast_swimming` · `water_creature` · `immovable` · `walk_adaptation_sand` · `walk_adaptation_snow` · `walk_adaptation_swamp` |
| Mente | `strong_mind` · `has_sapience` · `has_emotions` · `has_advanced_memory` · `has_advanced_communication` · `can_read_any_book` · `mad` · `moody` · `unconscious` · `frozen_ai` |
| Comportamento | `ignore_fights` · `love_peace` · `steal_items` · `needs_food` · `needs_mate` · `always_idle_animation` · `stop_idle_animation` · `generate_light` |
| Dieta | `diet_meat` · `diet_meat_insect` · `diet_fish` · `diet_blood` · `diet_grass` · `diet_crops` · `diet_fruits` · `diet_flowers` · `diet_nectar` · `diet_algae` · `diet_vegetation` · `diet_wood` · `diet_minerals` · `diet_tiles` · `diet_same_species` |
| Reprodução | `reproduction_sexual` · `reproduction_asexual` · `oviparity` · `viviparity` |
| Natureza | `civ` · `human` · `elf` · `orc` · `dwarf` · `demon` · `undead` · `magic` · `good` · `evil` · `neutral` · `nature_creature` · `neutral_animals` · `everyone` · `small` · `sliceable` |
| Construção | `can_build_in_biome_corruption` · `can_build_in_biome_desert` · `can_build_in_biome_infernal` · `can_build_in_biome_permafrost` · `can_build_in_biome_swamp` · `can_build_in_biome_wasteland` |

Diferente de um nome de atributo, uma tag desconhecida é inofensiva: ela simplesmente nunca corresponderá a nada. Isso também significa que um erro de digitação passará em silêncio, então copie-as fielmente. Escolha o seu veneno :wbbre:.

## Lendo os valores em tempo real de uma unidade

`base_stats` é a *receita*. `stats` em um `Actor` vivo é o *resultado*, depois que tudo foi somado:

```csharp
float finalDamage = actor.stats["damage"];
```

Isso é também o que você ajusta a partir de um Postfix do Harmony em `Actor.updateStats` (veja **[Patches com Harmony](#/nml/harmony-patches)**).

## Adicionando sua própria estatística

Você pode registrar um novo `BaseStatAsset` em `AssetManager.base_stats_library`, e ele aparecerá no inspetor e será somado como qualquer outro. O que ele **não** fará é ter qualquer efeito automático: nada no jogo lê um atributo que ele não conheça de fábrica. Um atributo personalizado só tem utilidade como um número que você mesmo lê depois, no seu próprio patch do Harmony ou comportamento.

Na maioria das vezes a resposta é "use um atributo existente", e a segunda é "mantenha seu próprio dicionário". Uma terceira eu ainda não encontrei.
