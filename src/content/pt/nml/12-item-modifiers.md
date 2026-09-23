---
title: Encantamentos de armas
group: Conteúdo do jogo
subgroup: Itens e equipamentos
icon: :wbmagehrm:
order: 122
---

# Encantamentos de armas :wbmagehrm:

Você conhece aquelas pequenas linhas verdes em uma boa espada: *"+3 de dano"*, *"ardente"*. Esses são os **modificadores de item**, e eles são a forma mais rápida de tornar o saque emocionante, porque o jogo os sorteia automaticamente nas armas criadas.

## O jeito fácil: o criador do NML

Um `ItemAsset` no vanilla é uma classe única cumprindo sete funções diferentes, e os campos mudam totalmente de significado conforme a ocasião. O NML reúne as partes funcionais no `ItemAssetCreator` e, para modificadores, também realiza o registro automaticamente para você:

```csharp Mods/HelloBox/Code/HelloModifiers.cs
namespace HelloBox
{
    public static class HelloModifiers
    {
        public const string SHARP = "hello_sharp";

        public static void Initialize()
        {
            if (AssetManager.items_modifiers.has(SHARP)) return;

            ItemModAsset sharp = new ItemModAsset
            {
                id = SHARP,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                mod_type = "sharpness",          // same type: only the higher mod_rank shows up
                mod_rank = 2,
                translation_key = "mod_hello_sharp",
                rarity = 3,                      // bigger = rolled more often. Vanilla uses 1 and 3
                pool = ItemModifierLibrary.WEAPON
            };

            AssetManager.items_modifiers.add(sharp);   // add() first
            sharp.base_stats["damage"] = 8f;           // then the stats

            AddToPool(sharp);                          // and this is the part everybody forgets
        }

        /** The game built its pools while it loaded, which was before your mod existed. */
        private static void AddToPool(ItemModAsset pAsset)
        {
            foreach (string pool in new[] { "weapon", "armor", "accessory" })
            {
                if (!pAsset.pool.Contains(pool)) continue;
                if (!AssetManager.items_modifiers.pools.ContainsKey(pool)) continue;

                // vanilla adds each modifier `rarity` times over: that is the whole weighting system
                for (int i = 0; i < pAsset.rarity; i++)
                {
                    AssetManager.items_modifiers.pools[pool].Add(pAsset);
                }
            }
        }
    }
}
```
> [!WARNING] Registrar não é suficiente
> `add()` coloca seu modificador na `list` da biblioteca, e o gerador não lê `list`, lê `pools`. Esses pools são preenchidos em `linkAssets()`, uma vez, durante o carregamento. Um modificador que só está na `list` existe, tem nome, e nunca vai cair em nada :wbfacepalm:.



Adicione `HelloModifiers.Initialize();` no seu `Main.cs`, e a partir daí o jogo poderá sortear "hello_sharp" nas armas geradas.

### Os argumentos mais importantes

| Argumento | O que faz |
| --- | --- |
| `id` | Nome exclusivo |
| `mod_type` | A família. Dois modificadores do mesmo tipo nunca aparecem juntos: o de maior `mod_rank` vence |
| `mod_rank` | Nível dentro da família. Também agrega valor à arma |
| `translation_key` | A chave de localização da linha verde lida pelo jogador |
| `rarity` | Frequência de sorteio. Números maiores são mais comuns |
| `base_stats` | O bônus de atributos |
| `quality` | Qualidade mínima da arma necessária para aparecer |
| `equipment_value` | Pontuação extra de utilidade avaliada pela IA |

## Fazendo o modificador realmente fazer algo

Atributos são ótimos, mas um modificador também pode executar código. `action_attack_target` dispara toda vez que a arma desfere um golpe:

```csharp
ItemAssetCreator.CreateAndAddModifier(
    id: "hello_burning",
    mod_type: "elemental",
    mod_rank: 1,
    translation_key: "hello_burning",
    rarity: 1,
    action_attack_target: (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
    {
        if (pTarget == null || pTile == null) return false;
        World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
        return true;
    });
```

Agora qualquer arma que sortear "hello_burning" incendiará o chão ao atingir o alvo. Dez linhas, e funciona em todas as armas do jogo, inclusive as de outros mods :wbfireskull:.

## Os textos de localização

```json Locales/en.json
{
  "hello_sharp": "Sharpened",
  "hello_burning": "Burning"
}
```

A `translation_key` é o que aparece no tooltip do item, portanto mantenha-a curta para caber em uma única linha ao lado dos atributos.

> [!TIP] Modificadores antes de armas
> Uma arma nova dá bastante trabalho (sprites, animações, materiais). Um novo modificador leva vinte linhas e se aplica a **todas** as armas que o mundo gera. Se você quer ver novidades rapidamente, comece por aqui :PES_Stonks:.
