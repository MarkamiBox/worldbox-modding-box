---
title: Fenêtres personnalisées
group: Contenu du jeu
subgroup: Pouvoirs divins et interface
icon: :wbmonolith:
order: 204
---

# Fenêtres personnalisées :wbmonolith:

À un certain stade, un simple bouton ne suffit plus et vous avez besoin d'un véritable panneau : une liste, quelques chiffres, deux ou trois contrôles. Il existe deux manières d'y parvenir, et choisir la mauvaise vous coûtera votre week-end.

| Approche | Quand l'utiliser |
| --- | --- |
| `ScrollWindow` | Vous voulez une fenêtre à l'aspect et au comportement strictement identiques à ceux du jeu de base, dans l'emplacement vanilla |
| Votre propre `Canvas` | Vous voulez un panneau flottant, redimensionnable et ouvrable en plusieurs exemplaires sans équivalent dans le jeu de base |

## Communiquer avec les fenêtres vanilla

Le jeu conserve chaque fenêtre dans un registre indexé par identifiant, et vous pouvez les piloter depuis n'importe où :

```csharp
ScrollWindow.showWindow("worldlaws");        // en ouvrir une
ScrollWindow.get("worldlaws");               // récupérer l'instance
ScrollWindow.checkWindowExist("worldlaws");  // vérifier si elle existe
ScrollWindow.isWindowActive();               // vérifier si *une* fenêtre quelconque est ouverte
```

Cette dernière fonction est plus cruciale qu'il n'y paraît : si votre pouvoir divin effectue une action au clic, vous souhaitez généralement qu'il ne fasse rien lorsqu'une fenêtre recouvre la carte. Définir `unselect_when_window = true` sur votre `GodPower` délègue ce souci au moteur du jeu.

## Votre propre fenêtre flottante

Une fenêtre est un `GameObject` rattaché au canvas de l'interface du jeu. En voici le squelette complet :

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

### Décortiquer le code

- **`CanvasMain.instance.canvas_ui`** : le canvas sur lequel vit l'interface du jeu. Raccrochez votre fenêtre à autre chose et elle se cachera derrière la carte ou ignorera l'échelle de l'UI.
- **`overrideSorting` + `sortingOrder`** : votre fenêtre bénéficie de son propre calque. Un grand nombre signifie "au-dessus de tout", ce qui est parfait pour un panneau ouvert délibérément par le joueur.
- **`GraphicRaycaster`** : le composant qui permet aux clics d'intercepter votre fenêtre. Oubliez-le et chaque clic traversera le panneau pour frapper la carte, faisant apparaître des unités derrière votre propre interface :pepeclown:.
- **`IDragHandler` sur la fenêtre** : `OnDrag` fait `rect.anchoredPosition += eventData.delta`, donc tu peux cliquer et déplacer le panneau n'importe où à l'écran.
- **`HelloWindowResize` sur la poignée d'angle** : tirer le coin en bas à droite calcule une nouvelle largeur et hauteur, bornées à `160f`, pour que le joueur redimensionne proprement.
- **`sizeDelta`** : la taille en unités d'interface. Commencez modeste. Un panneau qui masque toute la carte est un panneau que le joueur ferme immédiatement.

## Lui donner l'aspect de WorldBox

Un rectangle plat respire l'amateurisme. Les fenêtres officielles utilisent du 9-slice afin de s'étirer sans flou. Déposez votre PNG dans votre dossier `GameResources/ui/`, chargez-le et découpez-le :

```csharp
Sprite frame = Sprite.Create(
    texture,
    new Rect(0f, 0f, texture.width, texture.height),
    new Vector2(0.5f, 0.5f),
    1f,                          // pixels par unité
    0,
    SpriteMeshType.FullRect,
    new Vector4(12, 12, 12, 12)  // bordure gauche, bas, droite, haut
);

background.sprite = frame;
background.type = Image.Type.Sliced;
background.color = Color.white;
```

Et pour le texte, utilisez la police déjà employée par le jeu afin que votre panneau s'adapte à n'importe quelle langue :

```csharp
Font font = LocalizedTextManager.current_font ?? Resources.GetBuiltinResource<Font>("Arial.ttf");
```

## Ce dont vous aurez besoin plus tôt que vous ne le croyez

- **Déplacement (Dragging)** : un petit `MonoBehaviour` implémentant `IDragHandler` qui déplace `rect.anchoredPosition` selon `eventData.delta`. Vingt lignes qui font la différence entre un panneau ergonomique et une nuisance.
- **Une fenêtre par sujet** : si votre panneau affiche des informations sur *une unité*, créez une instance par unité plutôt qu'un panneau unique partagé qui commute. Tout l'intérêt de surveiller deux cibles est de pouvoir les observer simultanément.
- **Nettoyage** : appelez `Object.Destroy(root)` lorsque la fenêtre se ferme définitivement, et libérez vos références. Les textures créées dynamiquement doivent également être détruites avec `Destroy`, sous peine de provoquer une fuite de mémoire à chaque ouverture.

## Info-bulles

Les info-bulles du jeu sont également des assets dans `AssetManager.tooltips` : un ID et un callback qui alimente l'info-bulle à chaque ouverture. Enregistrez la vôtre et n'importe quel élément d'interface pourra l'afficher avec des valeurs dynamiques en direct. Les joueurs survolent tout avec la souris, c'est donc ici que votre mod a l'air fini sans faire de bruit.

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

`HelloWindow` attache un composant `HelloTooltipTarget` à son arrière-plan, donc survoler le panneau l'affiche automatiquement. `Tooltip.show()` reçoit l'objet UI concerné, l'ID de l'info-bulle et un objet `TooltipData` transmis à votre callback : le jeu de base y passe l'unité, la ville ou le trait concerné. L'info-bulle standard `"normal"` ne nécessite aucun asset dédié, elle utilise simplement `tip_name` et `tip_description` comme clés de texte.

| Champ de `TooltipAsset` | Ce qu'il fait |
| --- | --- |
| `callback` | Remplit l'info-bulle : `name.text`, `setDescription()`, `setBottomDescription()` |
| `prefab_id` | Quel préfabriqué d'info-bulle utiliser. Par défaut : `tooltips/tooltip_normal` |
| `callback_text_animated` | Rappelé toutes les 0,08 seconde tant qu'elle est ouverte, pour les textes animés |

## Un raccourci clavier dédié

Une touche qui ouvre votre panneau est un `HotkeyAsset`. Elle n'apparaît nulle part jusqu'à ce qu'elle soit pressée, déclenchant alors votre action.

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

> [!WARNING] Les raccourcis clavier sont reliés au démarrage
> `HotkeyLibrary.linkAssets()` copie chaque `default_key_*` vers le `overridden_key_*` correspondant (la touche réellement vérifiée par le jeu) et assemble `action_hotkeys`, la seule liste scrutée à chaque frame. Ces deux étapes ont lieu avant le chargement de votre mod. En oublier une rend la touche totalement inactive, sans le moindre avertissement :wbfacepalm:.

Les drapeaux `check_*` permettent d'éviter simplement les conflits : `check_controls_locked` bloque l'ouverture lorsque le joueur contrôle une créature, `check_window_not_active` lorsqu'une fenêtre vanilla est déjà ouverte. Choisissez une touche laissée libre par le jeu de base. F6 en est une ; d'autres mods peuvent en décider autrement :PES2_Shrug:.

```json Mods/HelloBox/Locales/en.json
{
  "hello_panel_tooltip_title": "HelloBox",
  "hello_panel_tooltip_description": "Creatures alive in this world: $count$"
}
```

> [!TIP] Inspirez-vous du jeu en premier
> Ouvrez **UnityExplorer**, trouvez une fenêtre standard dans la hiérarchie et inspectez ses composants et valeurs. Copier une structure déjà fonctionnelle vaut bien mieux que de deviner les ancres pendant trois heures :PES2_GaSmart:.
