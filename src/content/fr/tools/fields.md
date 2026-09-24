---
title: Explorateur de champs d'asset
group: Outils de modding
icon: :wbwise:
order: 430
---

# Explorateur de champs d'asset :wbwise:

Chaque asset possède une liste fixe de champs. Cette liste provient directement du jeu décompilé.

Choisissez le type d'asset, filtrez et cliquez pour copier.

::tool:fields::

## Guide de lecture

- **La colonne de gauche** est le type. `int` veut dire un nombre entier, donc `rate_birth = 0.5f` ne compile pas. `float` accepte une décimale et veut le suffixe `f`, comme `0.5f`. `string` accepte du texte entre guillemets.
- **Le `= value`** est la valeur par défaut que le jeu donne déjà à ce champ. Si elle vous convient, ne la définissez pas. Moins de code, moins de fautes de frappe.
- **"inherited from"** veut dire que le champ vient d'une classe parente. Il fonctionne exactement pareil ; il est juste déclaré plus haut. `id`, `base_stats` et `path_icon` sont généralement hérités.
- **La chaîne au-dessus du tableau** (par ex. `ActorTrait -> BaseTrait -> BaseAugmentationAsset -> Asset`) indique d'où viennent les champs, du plus spécifique au plus général.

> [!WARNING] Les champs ne disent pas tout
> Cet outil vous dit qu'un champ **existe** et quel est son type. Il ne vous dit pas si le jeu le lit vraiment dans votre cas : certains champs ne comptent que pour les unités civilisées, ou seulement quand une autre option est activée. Dans le doute, trouvez un asset vanilla qui fait ce que vous voulez et copiez ses valeurs, voir **[Lire le code du jeu](#/toolbox/reading-the-game-code)**.
