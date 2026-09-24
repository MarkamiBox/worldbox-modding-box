---
title: Votre premier mod
group: Modding NML
subgroup: Flux de travail de base
icon: :wbchosen:
order: 22
---

# Votre premier mod :wbchosen:

Tout dans ce guide est construit autour d'**un seul et unique mod**. Nous le démarrons ici, et chaque tutoriel suivant lui ajoutera un fichier.

À la fin, HelloBox contiendra une quarantaine de fichiers et vous aurez écrit chaque ligne vous-même : un trait d'acteur et un trait culturel avec leur propre onglet, une arme et son enchantement (modifier), un effet de statut (status), des drops, un nuage (cloud), une case de terrain, une recette de nourriture, un projectile, une loi du monde (world law), un pouvoir divin (GodPower) avec son bouton dédié, une fenêtre, un panneau de configuration, un bâtiment (building), une faction, une créature, une catastrophe, sa propre IA et un patch Harmony pour contourner une règle que le jeu croyait gravée dans le marbre.

C'est bien plus que ce dont n'importe quel vrai mod aura jamais besoin, et c'est précisément le but. Vous prendrez les deux ou trois morceaux qui vous intéressent et supprimerez le reste :PES4_DeleteThis:.

Le mod s'appelle **HelloBox**. Faisons-le naître.

> [!NOTE] Vous n'avez jamais codé de votre vie ?
> Ce n'est pas grave. Lisez les explications "ce que fait chaque ligne" sous chaque bloc et copiez le code à l'identique. Programmer consiste à 90 % à copier un truc qui fonctionne et à changer un seul détail à la fois :PES2_Legit:.

> [!TIP] Ou pars du modèle
> Si tu préfères ne pas créer les fichiers à la main, prends le squelette vide et saute à l'étape 4. Lire les trois étapes suivantes reste utile : elles expliquent ce qu'il y a dedans.
>
> <a class="dl" href="hellobox-template.zip" download>
>   <span class="dl-icon">📄</span>
>   <span class="dl-text">
>     <span class="dl-title">Télécharger le modèle vide</span>
>     <span class="dl-sub"><code>mod.json</code>, <code>Code/Main.cs</code> et les dossiers que NML cherche. Rien d'autre.</span>
>   </span>
> </a>

## 1. Créez le dossier

Rendez-vous dans votre dossier WorldBox (celui qui contient `worldbox.exe`), ouvrez `Mods/` et créez un dossier nommé `HelloBox`. À l'intérieur, créez un sous-dossier nommé `Code`.

```text Where it goes
worldbox/
└── Mods/
    └── HelloBox/          <- votre mod
        ├── mod.json       <- la carte d'identité (étape suivante)
        └── Code/          <- vos fichiers .cs iront ici
```

## 2. La carte d'identité : mod.json

Créez un fichier nommé `mod.json` dans `HelloBox/` et collez ceci. Remplacez `author` par votre nom ou pseudo :

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My first WorldBox mod, built while following the guide.",
  "GUID": "com.yourName.hellobox"
}
```

- **`name`** est le nom affiché dans la liste des mods en jeu.
- **`GUID`** est un identifiant unique. Utilisez `com.votrenom.hellobox` et ne le modifiez plus jamais.

Sans ce fichier, NML agira comme si votre mod n'existait pas :pepeno:.

> [!WARNING] Le Bloc-notes va tenter de l'appeler `mod.json.txt`
> Dans la boîte de dialogue Enregistrer, choisissez **Tous les fichiers (*.*)** avant d'écrire le nom. Vérifiez ensuite dans l'Explorateur : si l'extension `.json` n'est pas visible, activez **Affichage → Extensions de noms de fichiers** pour que Windows cesse de les masquer. Un fichier `mod.json.txt` est invisible pour NML, et ce piège attrape presque tout le monde une fois :PESgn_Oops:.

## 3. Le code : Main.cs

Créez `Code/Main.cs` et collez ce code :

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");
        }
    }
}
```

### Ce que fait chaque ligne

- **`using NeoModLoader.api;`** : "Je veux utiliser les outils de NML dans ce fichier". Sans cela, l'ordinateur ne sait pas ce qu'est `BasicMod`.
- **`namespace HelloBox`** : un nom de famille pour votre code, évitant que votre classe `Main` n'entre en conflit avec celle d'un autre mod.
- **`public class Main : BasicMod<Main>`** : votre mod. La mention `: BasicMod<Main>` signifie "je suis un mod NML, donne-moi tous les outils gratuits" (logs, options, traductions).
- **`protected override void OnModLoad()`** : la porte à laquelle NML frappe au lancement du jeu. Tout ce que votre mod met en place va à l'intérieur de ces accolades `{ }`.
- **`LogInfo(...)`** : écrit une ligne dans les logs en y ajoutant automatiquement le nom de votre mod. C'est ainsi que vous saurez si votre code a tourné.

## 4. Lancez le jeu

Lancez WorldBox et ouvrez la fenêtre **Mods** depuis le menu principal. **HelloBox** devrait figurer dans la liste, déjà activé. Un mod que vous placez vous-même dans `Mods/` est activé la première fois que NML le trouve.

C'est aussi dans cette fenêtre que vous **désactiverez** un mod plus tard. Un clic sur l'icône le bascule, et la plupart des mods ne s'en rendent compte qu'après un redémarrage :PES4_AlrightThen:.

> [!WARNING] Pas de fenêtre Mods du tout ? Le mode expérimental est désactivé
> NML ne charge les mods que si **Paramètres -> Experimental Mode** est activé, et le jeu **le désactive tout seul après chaque mise à jour de WorldBox** : il compare la `last_used_version` enregistrée à la version que vous venez de lancer et, si elles diffèrent, remet l'option à `false`. Donc "mon mod marchait hier et je n'ai rien changé", c'est presque toujours ça. Réactivez-le et redémarrez.

> [!TIP] Absent de la liste ?
> Alors NML ne l'a jamais vu. Neuf fois sur dix, c'est `mod.json.txt` au lieu de `mod.json`, ou le dossier est ailleurs que dans `worldbox\Mods/`. La liste complète est dans **[Dépannage](#/troubleshooting)**.

## 5. Vérifiez qu'il a bien tourné

Votre ligne de log devrait maintenant figurer dans le fichier journal :

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
```

Pour trouver ce fichier, collez ce chemin dans la barre d'adresse de l'Explorateur Windows :

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox
```

Ouvrez `Player.log` dans le Bloc-notes et faites **Ctrl+F** pour chercher `HelloBox`.

Si vous voyez cette ligne, vous voilà officiellement moddeur :PESgn_Congrats:. Si vous ne la voyez pas, rendez-vous sur **[Logs et débogage](#/nml/logs-and-debugging)**, cette page a été écrite précisément pour ce cas de figure.

## 6. Comment s'articulent les pages suivantes

À partir de maintenant, chaque page vous apportera **un nouveau fichier** dans `Code/` et **une nouvelle ligne** dans `OnModLoad`. Le principe est systématiquement le même :

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");

    HelloTraits.Initialize();   // ajouté par la page Traits personnalisés
    HelloItems.Initialize();    // ajouté par la page Objets personnalisés
    // ...et ainsi de suite
}
```

Chaque nouveau fichier aura toujours cette allure :

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public static void Initialize()
        {
            // le code de la page concernée ira ici
        }
    }
}
```

> [!TIP] Une seule chose à la fois
> Ajoutez un fichier, lancez le jeu, vérifiez le log, puis passez à la suite. Si vous ajoutez cinq éléments d'un coup et que le jeu plante, vous avez cinq suspects. Si vous en ajoutez un seul, vous savez immédiatement qui est le coupable :aPES_Detect:.
