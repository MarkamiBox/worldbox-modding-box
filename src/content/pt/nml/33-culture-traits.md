---
title: Traços culturais
group: Conteúdo do jogo
subgroup: Traços e genética
icon: :wbtiphat:
order: 106
---

# Traços culturais :wbtiphat:

Uma **cultura** representa os hábitos compartilhados por um conjunto de cidades. Ela decide o que constroem, o que forjam, como herdam bens, o que leem e quais valores prezam. Um traço cultural é um desses hábitos.

Dos sete sistemas de traços, a cultura é o que tem o alcance mais amplo. Uma cultura se espalha com as cidades, sobrevive ao seu fundador e mescla seus atributos em cada unidade que pertença a ela. Se você quer um mod cujo efeito se espalhe pelo mundo ao longo de uma hora de jogo, esta é a biblioteca ideal. Grande alcance, grande responsabilidade :PES5_Menace:.

| | |
| --- | --- |
| Biblioteca | `AssetManager.culture_traits` |
| Classe | `CultureTrait` |
| Grupos | `AssetManager.culture_trait_groups`, classe `CultureTraitGroupAsset` |
| Dono em tempo de execução | `Culture`, em `World.world.cultures` |
| Prefixo de localização | `culture_trait_` |
| Pasta de ícones padrão | `ui/Icons/culture_traits/` |

## Registrando um

```csharp Mods/HelloBox/Code/HelloCulture.cs
namespace HelloBox
{
    public static class HelloCulture
    {
        public const string DUELLISTS = "hello_duellists";

        public static void Initialize()
        {
            if (AssetManager.culture_traits.has(DUELLISTS)) return;

            CultureTrait trait = new CultureTrait
            {
                id = DUELLISTS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "warfare",
                path_icon = "ui/Icons/iconHelloCulture",
                priority = 10,                       // maior prioridade ordena no topo do grupo
                spawn_random_trait_allowed = false,  // nunca concedido ao acaso
                can_be_given = true,                 // o jogador pode adicionar no editor
                can_be_removed = true,
                rarity = Rarity.R2_Epic
            };

            AssetManager.culture_traits.add(trait);

            // Aviso abaixo: isso afeta fazendeiros tanto quanto soldados.
            trait.base_stats["critical_chance"] = 0.05f;
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed` é lido uma única vez, na inicialização
> Culturas novas sorteiam seus traços iniciais de uma urna que `BaseTraitLibrary.linkAssets()` monta enquanto o jogo carrega, antes de o seu mod existir. Ligar a opção no seu traço não muda nada sozinho: seu traço nunca está nessa urna e nunca aparece por acaso. Coloque-o você mesmo, com o peso que o vanilla usa:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.culture_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` é `protected`, então isso compila contra o assembly publicizado com que o NML já compila o seu mod. `spawn_random_rate` vale `5` por padrão: aumente e o traço aparece com mais frequência.

Tudo o que se aplica a **[Traços personalizados](#/nml/custom-traits)** vale aqui também: chamar `add()` antes dos atributos, `path_icon` não é preenchido sozinho, os identificadores levam prefixo. O que vem a seguir é o que torna os traços culturais únicos. E é a parte divertida.

> [!WARNING] `base_stats` em um traço cultural afeta todo mundo
> `Actor.updateStats()` mescla `culture.base_stats` em cada unidade daquela cultura. Cada unidade. Uma doutrina de "+5 de dano" armará também os padeiros.
>
> Se o bônus só deve se aplicar a alguns membros, não coloque nada em `base_stats` e filtre você mesmo em um Postfix do Harmony em `Actor.updateStats`, veja **[Patches do Harmony](#/nml/harmony-patches)**. Se deve se aplicar à cultura como um grupo em vez de aos seus indivíduos, use `base_stats_meta`, veja **[Referência de atributos](#/nml/stats)**.

## Direcionando o que uma cultura forja

Este é o campo exclusivo dos traços culturais, e é a maneira mais limpa de fazer uma cultura *parecer* diferente sem tocar em uma única arma:

```csharp
trait.value = 10f;                       // quanto a preferência pesa
trait.addWeaponSubtype("sword");         // preferir uma classe inteira de armas
trait.addWeaponSpecial("hello_relic");   // ou um id de item específico
```

Ambos os métodos auxiliares configuram `is_weapon_trait = true` para você. O código de criação lê as armas preferidas da cultura quando uma cidade decide o que forjar; isso troca a arma na mão do soldado em vez de apenas alterar um número. `bow_lovers` e `spear_lovers` no jogo base funcionam exatamente assim. Uma cultura inteira de fãs de lanças, com duas linhas :PESgn_Noice:.

| Campo | O que faz |
| --- | --- |
| `is_weapon_trait` | Marca o traço como uma preferência de arma |
| `related_weapon_subtype_ids` | Classes de armas preferidas. `addWeaponSubtype` adiciona aqui |
| `related_weapons_ids` | IDs de itens específicos preferidos. `addWeaponSpecial` adiciona aqui |
| `value` | O peso da preferência na escolha |

## Direcionando como uma cultura constrói

```csharp
trait.setTownLayoutPlan(pZoneCheckerDelegate);
```

Recebe um `PassableZoneChecker` e define `town_layout_plan = true`. É assim que funcionam os traços de layout de cidades do jogo base: vilas com pilares, cidades densas em estradas.

É o hook mais profundo desta página e o mais provável de disputar espaço com outro mod, já que uma cultura só pode seguir um plano de layout por vez. Verifique `town_layout_plan` nos traços que a cultura já possui antes de presumir que o seu seja o único ativo.

## Os grupos vanilla

`harmony` · `architecture` · `town_plan` · `kingdom` · `buildings` · `succession` · `knowledge` · `warfare` · `weapons` · `craft` · `happiness` · `worldview` · `miscellaneous` · `fate` · `special`

Para criar sua própria aba: veja **[Grupos de traços e abas](#/nml/trait-groups)**, com `AssetManager.culture_trait_groups` e `CultureTraitGroupAsset`.

## Os textos

```json Mods/HelloBox/Locales/en.json
{
  "culture_trait_hello_duellists": "Duellists",
  "culture_trait_hello_duellists_info": "They settle it one at a time, and they practise."
}
```

## Distribuindo o traço

```csharp
// toda criatura desta espécie começa com ele
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addCultureTrait(HelloCulture.DUELLISTS);
```

```csharp
// ou em tempo de execução, em culturas já existentes
foreach (Culture culture in World.world.cultures)
{
    if (culture == null || culture.isRekt()) continue;
    if (culture.hasTrait("hello_duellists")) continue;

    culture.addTrait("hello_duellists", pRemoveOpposites: true);
}
```

`hasTrait` e `addTrait` aceitam tanto a string do id quanto o próprio asset.

## Verificando um traço cultural a partir de uma unidade

`Actor` possui um atalho dedicado justamente para isso, já que é uma consulta muito frequente:

```csharp
if (actor.hasCultureTrait("hello_duellists")) { }
```

> [!TIP] Cultura ou subespécie?
> Ambas se espalham, mas não da mesma maneira. Um traço **cultural** se dissemina com as cidades e pode ser adotado por qualquer um que se junte a elas. Um traço de **subespécie** é transmitido pela reprodução biológica e não pode ser adquirido de outra forma. "Os elfos atiram melhor porque foram criados assim" é cultura; "os elfos atiram melhor por causa dos olhos" é subespécie. Veja **[Traços de subespécies](#/nml/subspecies-traits)** :catnoted:.
