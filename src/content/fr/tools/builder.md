---
title: Générateur de contenu
group: Outils de modding
icon: :wbhammer:
order: 405
---

# Générateur de contenu :wbhammer:

Choisissez ce que vous voulez créer, remplissez les cases, et vous obtenez tout : le fichier de code, le texte pour votre fichier `Locales`, et l'endroit exact où mettre vos images. Il écrit le même code que les pages du guide enseignent, y compris les étapes que tout le monde oublie, comme les pools, les champs de post-init et les clés de texte qui ne correspondent pas à l'id.

::tool:builder::

## Comment utiliser ce qu'il vous donne

1. **Le code** va dans le dossier `Code/` de votre mod, dans un fichier au nom affiché au-dessus du bloc.
2. **Le texte** va dans `Locales/<langue>.json`. Si vous avez déjà ce fichier, copiez seulement les lignes à l'intérieur des `{ }`, et attention aux virgules.
3. **Les images** vont exactement là où la liste l'indique. Lisez le mot à côté de chacune : **dossier** veut dire un dossier de PNG, même si vous n'avez qu'une seule image. Un PNG seul là où il faut un dossier, c'est la raison numéro un pour laquelle une image n'apparaît pas :wbfacepalm:.
4. **La ligne de Main.cs** va dans `OnModLoad()`. L'ordre compte : un trait rangé dans votre propre onglet a besoin de l'onglet d'abord, un objet qui coûte votre propre ressource a besoin de la ressource d'abord.

Lancez le jeu et regardez le log. Si quelque chose cloche, le lien **Explication complète** sous le sélecteur mène à la page qui explique ce contenu en détail.

> [!TIP] Changez les valeurs par défaut
> Chaque id du générateur commence par `my_`. Remplacez-le par quelque chose à vous, comme `hello_` pour HelloBox. Deux mods qui ajoutent tous les deux un `my_trait` se le disputent, et un seul gagne :PESgn_Stop:.

## Modèles

Le dernier groupe du sélecteur, **Templates**, fonctionne autrement. Créatures, bâtiments, catastrophes, IA, complots et fenêtres, c'est surtout votre propre logique, donc aucun formulaire ne peut les écrire à votre place. À la place, vous recevez le fichier qui marche de la page du guide, renommé avec votre namespace et votre préfixe. Il compile et tourne tel quel, et la page derrière **Explication complète** passe chaque ligne en revue, pour que vous sachiez quoi changer.

## Ce qu'il ne fait pas

Le générateur vous donne du contenu qui **marche**. Ce qu'il ne peut pas faire, c'est inventer votre idée à votre place. Quand une fonction a besoin de votre propre logique, comme un trait qui fait quelque chose de spécial ou un pouvoir qui fait quelque chose de nouveau, il laisse un emplacement bien marqué `// your code here`. La page derrière le lien **Explication complète** montre ce que vous pouvez y mettre.
