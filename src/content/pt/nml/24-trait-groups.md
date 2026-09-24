---
title: Grupos de traços e abas
group: Conteúdo do jogo
subgroup: Traços e genética
icon: :wbfamilies:
order: 102
---

# Grupos de traços e abas :wbfamilies:

Todo traço pertence a um **grupo**, e o grupo é o que desenha uma aba no livro de traços. Se você criar seis traços e jogar todos em `miscellaneous`, eles somem numa lista que ninguém rola :PES4_Invisible:.

Ter sua própria aba custa apenas quatro linhas.

## O que é um grupo

Um grupo é um `BaseCategoryAsset`, que é o menor asset de todo o jogo:

| Campo | O que faz |
| --- | --- |
| `id` | Para onde aponta o `group_id` de um traço |
| `name` | A **chave de localização** para o rótulo da aba. Não o texto literal |
| `color` | String hexadecimal. Colore a aba e os traços dentro dela |
| `show_counter` | Se a aba exibe "3 / 12". `true` por padrão |

## Sua própria aba

```csharp Mods/HelloBox/Code/HelloGroups.cs
namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";

        public static void Initialize()
        {
            if (AssetManager.trait_groups.has(TRAITS)) return;

            AssetManager.trait_groups.add(new ActorTraitGroupAsset
            {
                id = TRAITS,
                name = "trait_group_" + TRAITS,   // a chave de localização, não o texto literal
                color = "#7FE7C4"
            });
        }
    }
}
```

Aponte seus traços para ele:

```csharp
ActorTrait swift = new ActorTrait
{
    id = HelloTraits.SWIFT,
    group_id = HelloGroups.TRAITS,
    path_icon = "ui/Icons/iconSpeed"
};
AssetManager.traits.add(swift);
```

E dê um nome à aba:

```json Mods/HelloBox/Locales/en.json
{
  "trait_group_hello_traits": "HelloBox"
}
```

> [!WARNING] Grupos antes dos traços contidos neles
> Um traço cujo `group_id` aponta para um grupo que ainda não existe não tem onde ser renderizado. No `OnModLoad`, `HelloGroups.Initialize()` deve ficar acima de `HelloTraits.Initialize()`.

## Os grupos de traços de atores vanilla

Use um destes quando não quiser uma aba exclusiva:

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

## Onde sua aba aparece

Os grupos são renderizados na ordem de `list`, e o `add()` coloca o seu no final. Para posicioná-lo ao lado de um grupo afim, mova-o logo após:

```csharp
ActorTraitGroupAsset group = AssetManager.trait_groups.get(HelloGroups.TRAITS);
int index = AssetManager.trait_groups.list.FindIndex(g => g.id == "physique");

if (group != null && index != -1)
{
    AssetManager.trait_groups.list.Remove(group);
    AssetManager.trait_groups.list.Insert(index + 1, group);
}
```

`list` é uma simples `List<T>` em qualquer biblioteca, então este truque funciona para todas elas. Veja **[Bibliotecas de assets](#/nml/asset-libraries)**.

## Renomear ou recolorir um grupo vanilla

Você não precisa criar um grupo novo para alterar um existente. O método `get()` entrega o objeto ativo:

```csharp
ActorTraitGroupAsset fun = AssetManager.trait_groups.get("fun");
if (fun != null)
{
    fun.name = "trait_group_hello_fun";   // sua própria chave de localização
    fun.color = "#FFB35E";
}
```

Modificar um grupo vanilla no local mantém funcionando cada traço vanilla que aponta para ele e preserva os saves antigos. Substituí-lo quebra ambos :PES_NoSign:.

## As outras seis bibliotecas de grupos

Os traços de ator são apenas um de sete sistemas de traços, e cada um tem sua própria biblioteca de grupos contendo sua própria classe de grupo. O código desta página é idêntico para todos eles, mudando apenas dois nomes. Aprenda uma vez, copie seis vezes:

| Sistema de traços | Biblioteca de grupos | Classe de grupo | Página |
| --- | --- | --- | --- |
| Ator | `AssetManager.trait_groups` | `ActorTraitGroupAsset` | esta página |
| Cultura | `AssetManager.culture_trait_groups` | `CultureTraitGroupAsset` | **[Traços culturais](#/nml/culture-traits)** |
| Religião | `AssetManager.religion_trait_groups` | `ReligionTraitGroupAsset` | **[Traços religiosos](#/nml/religion-traits)** |
| Subespécie | `AssetManager.subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | **[Traços de subespécies](#/nml/subspecies-traits)** |
| Clã | `AssetManager.clan_trait_groups` | `ClanTraitGroupAsset` | **[Traços de clã](#/nml/clan-traits)** |
| Idioma | `AssetManager.language_trait_groups` | `LanguageTraitGroupAsset` | **[Traços de idioma](#/nml/language-traits)** |
| Reino | `AssetManager.kingdoms_traits_groups` | `KingdomTraitGroupAsset` | **[Traços de reino](#/nml/kingdom-traits)** |

Equipamentos compartilham o mesmo conceito com outro nome. Veja **[Grupos de itens e abas](#/nml/item-groups)**.

> [!TIP] Uma aba só, não seis
> A tentação num mod grande é criar um grupo para cada recurso. Resista. O livro de traços já vive lotado: o jogador vai encontrar facilmente uma aba com o nome do seu mod, mas nunca vai procurar seis abas batizadas com seus sistemas internos.
