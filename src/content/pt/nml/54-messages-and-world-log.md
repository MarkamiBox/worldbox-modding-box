---
title: Mensagens e registro do mundo
group: Conteúdo do jogo
subgroup: Poderes divinos e interface
icon: :wbscroll:
order: 207
---

# Mensagens e registro do mundo :wbscroll:

Imprimir no console com `Main.Log()` é ótimo enquanto você está escrevendo código. Mas quando seu poder divino derruba um meteoro, uma unidade chefe personalizada desperta, ou um reino assina um tratado, o jogador não está lendo seu log de depuração.

Ele precisa de retorno visual na tela: dicas em popup flutuando pela tela e entradas no registro de história do mundo.

## Faixas na tela com WorldTip

A forma mais rápida de colocar palavras na frente do jogador é `WorldTip.showNow`:

```csharp
WorldTip.showNow(string pText, bool pTranslate = true, string pPosition = "center", float pTime = 3f, string pColor = "#F3961F");
```

| Parâmetro | O que faz | Padrão |
| --- | --- | --- |
| `pText` | Uma string crua ou uma chave de localização | Obrigatório |
| `pTranslate` | Se deve passar `pText` por `LocalizedTextManager.getText()` | `true` |
| `pPosition` | Âncora na tela: `"center"`, `"top"`, `"bottom"` | `"center"` |
| `pTime` | Duração em segundos antes de desaparecer | `3f` |
| `pColor` | Código de cor hexadecimal para o texto | `"#F3961F"` (laranja) |

> [!WARNING] WorldTip traduz por padrão
> Como `pTranslate` é `true` por padrão, escrever `WorldTip.showNow("Something happened!")` faz o jogo procurar uma chave de localização chamada `"Something happened!"`. Ele não encontra nenhuma, registra um erro de tradução ausente, e mostra o texto cru como placeholder :PESgn_Oops:.
>
> Se você está passando texto literal em inglês, **sempre** defina `pTranslate: false`:
> ```csharp
> WorldTip.showNow("The Ancient Titan has awakened!", pTranslate: false, pColor: "#FF5555");
> ```
> Para texto localizado, passe sua chave de tradução e deixe `pTranslate: true`:
> ```csharp
> WorldTip.showNow("hello_titan_awakened", pTranslate: true);
> ```

### Texto na barra inferior

Se você quer uma mensagem mais discreta logo acima da barra de poderes divinos - como o texto de tooltip mostrado ao selecionar um pincel - use `showToolbarText`:

```csharp
if (WorldTip.instance != null)
{
    WorldTip.instance.showToolbarText("Right-click to cancel");
}
```

Isso desenha uma pequena dica flutuante diretamente acima da barra de poder ativa.

## Registrando eventos do mundo no WorldLog

O registro do mundo é o histórico persistente que os jogadores abrem na janela de História. As entradas sobrevivem a salvar e carregar e estão presas à cronologia do mundo.

O jogo oferece vários ajudantes estáticos prontos para uso em `WorldLog`:

```csharp
// Registra uma sucessão imperial:
WorldLog.logNewKing(kingdom);

// Registra a fundação de um novo reino:
WorldLog.logNewKingdom(kingdom);

// Registra um evento de desastre num tile específico:
DisasterAsset earthquake = AssetManager.disasters.get("earthquake");
WorldTile centerTile = World.world.GetTile(100, 100);
WorldLog.logDisaster(earthquake, centerTile);
```

### Entradas de história personalizadas

Para adicionar seu próprio evento de história personalizado, construa um `WorldLogMessage` com um `WorldLogAsset` de `AssetManager.world_log`:

```csharp Mods/HelloBox/Code/HelloHistory.cs
namespace HelloBox
{
    public static class HelloHistory
    {
        public static void RecordTitanEvent(Kingdom pKingdom)
        {
            if (pKingdom == null || World.world == null) return;

            WorldLogAsset logAsset = AssetManager.world_log.get("king_new");
            if (logAsset == null) return;

            WorldLogMessage entry = new WorldLogMessage(logAsset, pKingdom.name, "Awakened the Titan")
            {
                timestamp = (int)World.world.getCurWorldTime()
            };

            // add() registra a entrada no HistoryHud e a escreve no banco de dados do registro do mundo:
            entry.add();
        }
    }
}
```

`entry.add()` adiciona a entrada ao HUD de história da partida atual e a persiste no banco de dados SQLite do mundo via `DBInserter.insertLog`.

## Etiquetas no mapa (nameplates_library)

Quando as camadas do mapa são ligadas, faixas aparecem sobre cidades, reinos e religiões. Elas são controladas por `AssetManager.nameplates_library` (`NameplateAsset`).

| Campo | O que faz |
| --- | --- |
| `id` | Identificador que corresponde a um `MetaType` |
| `path_sprite` | Caminho do sprite para a moldura da faixa |
| `padding_left` / `padding_right` / `padding_top` | Limites de deslocamento do texto |
| `map_mode` | Sobre qual `MetaType` esta etiqueta é desenhada |

> [!WARNING] Não chame add() para modos de mapa vanilla
> A biblioteca permite apenas **uma** etiqueta por `MetaType`. Se você chamar `AssetManager.nameplates_library.add(...)` para um `MetaType` que já existe (como reinos ou cidades), isso lança uma exceção :wbfacepalm:.
>
> Se você quer reestilizar etiquetas vanilla, procure a existente com `get()` e edite os campos dela:
> ```csharp
> NameplateAsset kingdomPlate = AssetManager.nameplates_library.get("kingdom");
> if (kingdomPlate != null)
> {
>     kingdomPlate.padding_left = 16;
> }
> ```

Próximo: **[Opções de jogo e escalas de tempo](#/nml/game-options)** para opções do jogador, ou **[Todo frame](#/nml/update-loops)** para rodar lógica num relógio.
