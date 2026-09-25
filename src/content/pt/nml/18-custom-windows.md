---
title: Janelas personalizadas
group: Conteúdo do jogo
subgroup: Poderes divinos e interface
icon: :wbmonolith:
order: 204
---

# Janelas personalizadas :wbmonolith:

Em algum momento um botão não é suficiente e você quer um painel de verdade: uma lista, alguns números, alguns controles. Há duas formas de conseguir um, e escolher o caminho errado vai lhe custar um fim de semana inteiro.

| Caminho | Quando usar |
| --- | --- |
| `ScrollWindow` | Você quer uma janela que se pareça e se comporte exatamente como uma vanilla, no espaço oficial |
| Seu próprio `Canvas` | Você quer um painel flutuante, redimensionável e com suporte a múltiplas instâncias para o qual o jogo base não tem equivalente |

## Comunicando-se com as janelas vanilla

O jogo mantém cada janela em um registro indexado por id, e você pode controlá-las de qualquer lugar:

```csharp
ScrollWindow.showWindow("worldlaws");        // abrir uma
ScrollWindow.get("worldlaws");               // obter a instância
ScrollWindow.checkWindowExist("worldlaws");  // verificar se ela existe
ScrollWindow.isWindowActive();               // verificar se *alguma* janela está aberta agora
```

Essa última verificação importa mais do que parece: se o seu poder divino (GodPower) faz algo ao clicar, normalmente você quer que ele não faça nada enquanto uma janela estiver cobrindo o mapa. Definir `unselect_when_window = true` no seu `GodPower` passa essa dor de cabeça para o jogo.


## A rota nativa com ScrollWindow

Se você quer que o seu painel pareça feito pelo WorldBox, não monte um canvas do zero como eu fiz na primeira tentativa :PES2_Shrug:. O NeoModLoader traz `WindowCreator` e `AbstractWindow<T>` justamente para você não ter que montar barras de rolagem, barras de título e botões de fechar com primitivas cruas do Unity.

Herde de `AbstractWindow<T>` e deixe o NML cuidar do encanamento:

```csharp Mods/HelloBox/Code/HelloNativeWindow.cs
using NeoModLoader.api;
using UnityEngine;
using UnityEngine.UI;

namespace HelloBox
{
    public class HelloNativeWindow : AbstractWindow<HelloNativeWindow>
    {
        protected override void Init()
        {
            GameObject labelObj = new GameObject("Text", typeof(Text));
            labelObj.transform.SetParent(ContentTransform, false);

            Text label = labelObj.GetComponent<Text>();
            label.font = LocalizedTextManager.current_font;
            label.fontSize = 12;
            label.text = "Hello from a native window!";
        }

        public override void OnFirstEnable() {}
        public override void OnNormalEnable() {}
        public override void OnNormalDisable() {}
    }
}
```

Crie-a uma vez durante a inicialização do mod:

```csharp
HelloNativeWindow.CreateAndInit("hello_native_window");
```

`CreateAndInit()` clona o prefab `"windows/empty"` do jogo, pendura-o em `CanvasMain.instance.transformWindows`, define a chave do título como `"<windowId> Title"`, anexa o seu componente e registra a janela tanto em `ScrollWindow._all_windows` quanto em `AssetManager.window_library`. Abrir é a mesma linha única que você usa para as janelas vanilla:

```csharp
ScrollWindow.showWindow(HelloNativeWindow.WindowId);
```

Se você precisa de mais espaço na tela para uma tabela enorme ou um gerenciador com várias colunas, herde de `AbstractWideWindow<T>`. Ela se comporta igual, mas começa em `600x280`, aplica automaticamente a moldura larga e oferece `SetSize(new Vector2(width, height))` se o seu layout precisar de ainda mais espaço.

Se você não quer a classe base `AbstractWindow<T>` de jeito nenhum, chame `WindowCreator.CreateEmptyWindow(id, titleKey, icon)` diretamente e configure você mesmo o `ScrollWindow` retornado. Esqueça o passo de registro fazendo à mão e o jogo nem vai saber que a sua janela existe quando alguém apertar ESC :wbfacepalm:.

## Sua própria janela flutuante

Uma janela é um `GameObject` cujo pai é o canvas de interface do jogo. Este é o esqueleto completo:

```csharp Mods/HelloBox/Code/HelloWindow.cs
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

namespace HelloBox
{
    public class HelloWindow : MonoBehaviour, IDragHandler
    {
        private static HelloWindow instance;
        private RectTransform rect;

        public static void Toggle()
        {
            if (instance == null) Build();
            else instance.gameObject.SetActive(!instance.gameObject.activeSelf);
        }

        private static void Build()
        {
            Transform parent = CanvasMain.instance.canvas_ui.transform;

            GameObject root = new GameObject("HelloBox_Window");
            root.transform.SetParent(parent, false);

            Canvas layer = root.AddComponent<Canvas>();
            layer.overrideSorting = true;
            layer.sortingOrder = 30240;
            root.AddComponent<GraphicRaycaster>();   // clicks land on the window, not the map

            instance = root.AddComponent<HelloWindow>();
            instance.rect = root.GetComponent<RectTransform>();
            instance.rect.anchorMin = new Vector2(0f, 1f);
            instance.rect.anchorMax = new Vector2(0f, 1f);
            instance.rect.pivot = new Vector2(0f, 1f);
            instance.rect.anchoredPosition = new Vector2(100f, -80f);
            instance.rect.sizeDelta = new Vector2(240f, 300f);

            Image background = root.AddComponent<Image>();
            background.color = new Color(0.16f, 0.18f, 0.15f, 0.98f);

            // Resize grip at the bottom-right corner
            GameObject handle = new GameObject("ResizeHandle");
            handle.transform.SetParent(root.transform, false);

            RectTransform handleRect = handle.AddComponent<RectTransform>();
            handleRect.anchorMin = new Vector2(1f, 0f);
            handleRect.anchorMax = new Vector2(1f, 0f);
            handleRect.pivot = new Vector2(1f, 0f);
            handleRect.anchoredPosition = Vector2.zero;
            handleRect.sizeDelta = new Vector2(20f, 20f);

            Image handleImg = handle.AddComponent<Image>();
            handleImg.color = new Color(0.5f, 0.5f, 0.5f, 0.6f);

            handle.AddComponent<HelloWindowResize>().target = instance.rect;

            // hover the panel for live numbers: see Tooltips below
            root.AddComponent<HelloTooltipTarget>();
        }

        // Drag anywhere on the window background to move it around
        public void OnDrag(PointerEventData eventData)
        {
            if (rect != null)
            {
                rect.anchoredPosition += eventData.delta;
            }
        }
    }

    public class HelloWindowResize : MonoBehaviour, IDragHandler
    {
        public RectTransform target;

        // Drag the bottom-right corner to resize the window
        public void OnDrag(PointerEventData eventData)
        {
            if (target != null)
            {
                float newWidth = Mathf.Max(160f, target.sizeDelta.x + eventData.delta.x);
                float newHeight = Mathf.Max(160f, target.sizeDelta.y - eventData.delta.y);
                target.sizeDelta = new Vector2(newWidth, newHeight);
            }
        }
    }
}
```

### Destinchando o código

- **`CanvasMain.instance.canvas_ui`**: o canvas no qual a própria interface do jogo vive. Se associar a qualquer outra coisa, sua janela ficará escondida atrás do mapa ou ignorará o dimensionamento da interface.
- **`overrideSorting` + `sortingOrder`**: sua janela ganha uma camada própria. Um número alto significa "por cima de tudo", que é exatamente o que você deseja para um painel aberto intencionalmente pelo jogador.
- **`GraphicRaycaster`**: o componente que faz os cliques serem capturados pela sua janela. Se esquecer dele, cada clique atravessará o painel e cairá no mapa, gerando unidades atrás da sua interface :pepeclown:.
- **`IDragHandler` na janela**: `OnDrag` faz `rect.anchoredPosition += eventData.delta`, então dá para clicar e arrastar o painel para qualquer lugar da tela.
- **`HelloWindowResize` no canto**: arrastar o canto inferior direito calcula nova largura e altura, com mínimo de `160f`, para o jogador redimensionar suave.
- **`sizeDelta`**: o tamanho em unidades de UI. Comece pequeno. Um painel que cobre o mapa inteiro é um painel que o jogador fecha imediatamente.

## Fazendo parecer com WorldBox

Um retângulo plano grita "mod amador". A arte das janelas originais usa 9-slice para esticar sem perder a nitidez. Coloque o PNG na sua pasta `GameResources/ui/`, carregue-o e aplique o fatiamento:

```csharp
Sprite frame = Sprite.Create(
    texture,
    new Rect(0f, 0f, texture.width, texture.height),
    new Vector2(0.5f, 0.5f),
    1f,                          // pixels por unidade
    0,
    SpriteMeshType.FullRect,
    new Vector4(12, 12, 12, 12)  // borda esquerda, inferior, direita, superior
);

background.sprite = frame;
background.type = Image.Type.Sliced;
background.color = Color.white;
```

E para o texto, utilize a fonte que o jogo já usa, garantindo que seu painel combine com qualquer idioma carregado:

```csharp
Font font = LocalizedTextManager.current_font ?? Resources.GetBuiltinResource<Font>("Arial.ttf");
```

## Coisas que você vai querer antes do que imagina

- **Arrastar (Dragging)**: um pequeno `MonoBehaviour` implementando `IDragHandler` que move `rect.anchoredPosition` de acordo com `eventData.delta`. Vinte linhas que transformam um painel incômodo em algo agradável.
- **Uma janela por sujeito**: se o seu painel exibe detalhes sobre *uma criatura*, crie uma instância para cada criatura em vez de um painel compartilhado que fica alternando. A graça de monitorar duas coisas é poder observá-las simultaneamente.
- **Limpeza**: chame `Object.Destroy(root)` quando a janela for fechada definitivamente e descarte suas referências. Texturas criadas dinamicamente também precisam de `Destroy`, caso contrário você causará vazamentos de memória a cada abertura.

## Dicas de contexto (Tooltips)

As dicas de contexto do jogo também são assets em `AssetManager.tooltips`: um ID e um callback que preenche a dica sempre que ela é aberta. Registre o seu e qualquer elemento de interface poderá exibi-lo com dados em tempo real. Os jogadores passam o mouse em cima de tudo, então é aqui que o seu mod parece pronto sem fazer barulho.

```csharp Mods/HelloBox/Code/HelloTooltips.cs
using UnityEngine;
using UnityEngine.EventSystems;

namespace HelloBox
{
    public static class HelloTooltips
    {
        public const string PANEL = "hello_panel";

        public static void Initialize()
        {
            if (AssetManager.tooltips.has(PANEL)) return;

            // callback runs every time the tooltip opens, so it can show live numbers
            AssetManager.tooltips.add(new TooltipAsset
            {
                id = PANEL,
                callback = (Tooltip pTooltip, string pType, TooltipData pData) =>
                {
                    pTooltip.name.text = LocalizedTextManager.getText("hello_panel_tooltip_title");
                    pTooltip.setDescription(LocalizedTextManager.getText("hello_panel_tooltip_description")
                        .Replace("$count$", World.world.units.getSimpleList().Count.ToString()));
                }
            });
        }
    }

    /** Put it on any UI object that should show the tooltip on hover. */
    public class HelloTooltipTarget : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler
    {
        public void OnPointerEnter(PointerEventData pEventData)
        {
            Tooltip.show(gameObject, HelloTooltips.PANEL, new TooltipData());
        }

        public void OnPointerExit(PointerEventData pEventData)
        {
            Tooltip.hideTooltip();
        }
    }
}
```

O `HelloWindow` adiciona um `HelloTooltipTarget` ao seu fundo, portanto passar o mouse sobre o painel o exibe. `Tooltip.show()` recebe o GameObject correspondente, o ID da dica e um objeto `TooltipData` recebido pelo seu callback: o jogo padrão passa a unidade, cidade ou traço (trait) em questão. A dica padrão `"normal"` não requer nenhum asset próprio, exibindo diretamente `tip_name` e `tip_description` como chaves de texto.

| Campo de `TooltipAsset` | O que faz |
| --- | --- |
| `callback` | Preenche a dica: `name.text`, `setDescription()`, `setBottomDescription()` |
| `prefab_id` | Qual layout de dica usar. O padrão é `tooltips/tooltip_normal` |
| `sound` / `color` | Campos de string públicos, mas a implementação de exibição de dica fornecida não os consome |
| `callback_text_animated` | Chamado novamente a cada 0,08 segundos enquanto aberto, para texto dinâmico |

> [!NOTE] Verifique quem consome, não só o campo
> Não prometa som ou cor automáticos vindos de `TooltipAsset.sound` ou `color`. Para uma cor de título, o método público `pTooltip.setTitle("HelloBox", "", "#43FF43")` a formata explicitamente. `setDescription` e `setBottomDescription` são internal no código-fonte do jogo fornecido, então o exemplo acima precisa de uma `Assembly-CSharp.dll` publicizada.

## Uma tecla de atalho para a janela

Uma tecla que abre seu painel é um `HotkeyAsset`. Ela não aparece em lugar nenhum até ser pressionada, momento em que chama sua ação.

```csharp Mods/HelloBox/Code/HelloHotkeys.cs
using System;
using UnityEngine;

namespace HelloBox
{
    public static class HelloHotkeys
    {
        public const string TOGGLE = "hello_toggle_window";

        public static void Initialize()
        {
            HotkeyLibrary library = AssetManager.hotkey_library;
            if (library.has(TOGGLE)) return;

            HotkeyAsset toggle = new HotkeyAsset
            {
                id = TOGGLE,
                default_key_1 = KeyCode.F6,          // no vanilla hotkey uses it
                check_controls_locked = true,        // not while the player steers a unit
                just_pressed_action = (HotkeyAsset pAsset) => HelloWindow.Toggle()
            };
            library.add(toggle);

            // linkAssets() copied every default key into the live one and listed the
            // hotkeys that have an action. Both at startup: without them the key is dead.
            toggle.overridden_key_1 = toggle.default_key_1;

            HotkeyAsset[] withActions = library.action_hotkeys;
            Array.Resize(ref withActions, withActions.Length + 1);
            withActions[withActions.Length - 1] = toggle;
            library.action_hotkeys = withActions;
        }
    }
}
```

> [!WARNING] Os atalhos são vinculados na inicialização
> `HotkeyLibrary.linkAssets()` copia cada `default_key_*` para o respectivo `overridden_key_*` (a tecla que o jogo realmente verifica) e monta `action_hotkeys`, a única lista verificada a cada quadro. Ambos ocorrem antes do seu mod carregar. Pular qualquer um deles faz com que a tecla não faça nada :wbfacepalm:.

As flags `check_*` são o jeito mais simples de evitar conflitos: `check_controls_locked` impede a ativação enquanto o jogador pilota uma unidade, e `check_window_not_active` enquanto uma janela padrão estiver aberta. Escolha uma tecla livre no jogo original (F6 é uma delas) :PES2_Shrug:.

```json Mods/HelloBox/Locales/en.json
{
  "hello_panel_tooltip_title": "HelloBox",
  "hello_panel_tooltip_description": "Creatures alive in this world: $count$"
}
```

> [!TIP] Copie do jogo primeiro
> Abra o **UnityExplorer**, localize uma janela padrão na hierarquia e copie seus componentes e valores. Copiar uma estrutura funcional poupa horas tentando adivinhar âncoras :PES2_GaSmart:.


Próximo: **[Mensagens e registro do mundo](#/nml/messages-and-world-log)** para dicas e etiquetas no mapa, ou **[Opções de jogo e escalas de tempo](#/nml/game-options)** para o estado de opções nativas.
