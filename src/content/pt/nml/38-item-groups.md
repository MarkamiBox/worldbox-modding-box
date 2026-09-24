---
title: Grupos de itens e abas
group: Conteúdo do jogo
subgroup: Itens e equipamentos
icon: :wbgold:
order: 124
---

# Grupos de itens e abas :wbgold:

Um grupo de itens (item) é uma categoria na janela de equipamentos: elmos, espadas, amuletos. Trata-se do mesmíssimo e diminuto `BaseCategoryAsset` que renderiza as abas de traços (trait) (veja **[Grupos de traços e abas](#/nml/trait-groups)**), residindo desta vez em `AssetManager.item_groups`.

A diferença essencial é que um grupo de itens gerencia um **pool**, e esquecer esse pool é o que faz seu mod quebrar :PESgn_Yikes:.

## Os grupos vanilla

`helmet` · `armor` · `boots` · `ring` · `amulet` · `sword` · `axe` · `hammer` · `spear` · `bow` · `staff` · `firearm`

## Sua própria categoria

```csharp Mods/HelloBox/Code/HelloGroups.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";
        public const string RELICS = "hello_relics";

        public static void Initialize()
        {
            // the trait tab, from the Trait groups page
            if (!AssetManager.trait_groups.has(TRAITS))
            {
                AssetManager.trait_groups.add(new ActorTraitGroupAsset
                {
                    id = TRAITS,
                    name = "trait_group_" + TRAITS,   // the locale key, not the text
                    color = "#7FE7C4"
                });
            }

            // the equipment category
            if (!AssetManager.item_groups.has(RELICS))
            {
                AssetManager.item_groups.add(new ItemGroupAsset
                {
                    id = RELICS,
                    name = "equipment_group_hello_relics",
                    color = "#BAFFDF"
                });
            }

            EnsurePools(RELICS);
            PlaceAfter(RELICS, "amulet");
        }

        /** The game filled its buckets before your mod existed. A new group has none. */
        private static void EnsurePools(string pGroupId)
        {
            if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
                AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

            if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
                AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
        }

        /** add() puts a group last. This moves it next to a relative instead. */
        private static void PlaceAfter(string pId, string pAfterId)
        {
            ItemGroupAsset group = AssetManager.item_groups.get(pId);
            int index = AssetManager.item_groups.list.FindIndex(g => g.id == pAfterId);

            if (group == null || index == -1) return;

            AssetManager.item_groups.list.Remove(group);
            AssetManager.item_groups.list.Insert(index + 1, group);
        }
    }
}
```

| Campo | O que faz |
| --- | --- |
| `id` | Para onde o `group_id` de um item aponta |
| `name` | Chave de localização para o rótulo da aba |
| `color` | String hexadecimal que colore a categoria |
| `show_counter` | Se a aba exibe contador de itens. Padrão `true` |

```json Mods/HelloBox/Locales/en.json
{
  "equipment_group_hello_relics": "Relics"
}
```

## Os pools

O jogo mantém um reservatório de equipamentos por grupo e preenche esses reservatórios enquanto suas próprias bibliotecas (library) carregam – o que acontece **antes do seu mod sequer existir**. Um grupo recém-criado não tem reservatório algum, e a primeira rotina que requisitar um disparará uma exceção:

```text
KeyNotFoundException: The given key was not present in the dictionary.
```

Crie-os você mesmo, uma única vez por grupo, antes de registrar qualquer item nele:

```csharp
private static void EnsurePools(string pGroupId)
{
    if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

    if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
}
```

`_all` é tudo o que existe no grupo. `_unlocked` é o que o gerador pode sortear no momento. Ambos precisam existir.

## Adicionando um item ao grupo

```csharp
EquipmentAsset relic = AssetManager.items.clone("hello_relic_ember", "$amulet");
relic.group_id = HelloGroups.RELICS;
relic.equipment_type = EquipmentType.Amulet;   // qual slot corporal ocupa
relic.equipment_subtype = "hello_relic";       // preferência adotada pelas culturas
```

Três configurações separadas fáceis de confundir:

| | |
| --- | --- |
| `group_id` | Sob qual **aba** ele aparece na janela |
| `equipment_type` | Qual **slot** ocupa: `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet` |
| `equipment_subtype` | Qual **classe de arma** ele é: `sword`, `axe`, `bow`… o que traços culturais preferem |

Um novo grupo **não** lhe dá um novo slot de equipamento. `EquipmentType` é um enum imutável no assembly do jogo, portanto suas relíquias continuam ocupando o slot de amuleto, apenas ganhando uma prateleira própria na interface.

## Onde a categoria aparece

Os grupos são desenhados na ordem da `list`, e `add()` coloca o seu por último. Mova-o para perto de um parente:

```csharp
private static void PlaceAfter(string pId, string pAfterId)
{
    ItemGroupAsset group = AssetManager.item_groups.get(pId);
    int index = AssetManager.item_groups.list.FindIndex(g => g.id == pAfterId);

    if (group == null || index == -1) return;

    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## Renomeando uma categoria vanilla

`get()` retorna a instância ativa em memória, permitindo que você adapte uma categoria vanilla existente em vez de criar uma nova:

```csharp
ItemGroupAsset helmet = AssetManager.item_groups.get("helmet");
if (helmet != null)
{
    helmet.name = "equipment_group_headwear";   // sua própria chave de idioma
    helmet.color = "#BAD0FF";
}
```

Todos os elmos vanilla continuarão apontando para `helmet`, garantindo que nada quebre e que saves antigos carreguem sem sobressaltos. Substituir o grupo deixaria todos eles órfãos :aPES2_HmmmmApprove:.

> [!TIP] Reutilize o slot, renomeie a prateleira
> A grande maioria dos mods de "novo tipo de equipamento" são na verdade "slot existente, prateleira diferente e nome novo". Essa versão leva quatro linhas e não corrompe saves. Um slot genuinamente novo exigiria alterar o enum `EquipmentType` do jogo, o que não é viável.
