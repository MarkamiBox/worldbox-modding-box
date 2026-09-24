---
title: Le mod terminé
group: Contenu du jeu
subgroup: Finitions et accomplissement
icon: :wbpeak:
order: 222
---

# Le mod terminé :wbpeak:

Si vous avez suivi ces pages dans l'ordre, vous avez ajouté un fichier après l'autre au même mod depuis **[Votre premier mod](#/nml/your-first-mod)**. Cette page constitue l'assemblage final : voici à quoi ressemble HelloBox une fois chaque composant en place, et comment ils s'articulent entre eux.

## Ce que tu as construit

Une vingtaine de fichiers, et voilà ce que ça donne en jeu. Chaque ligne est une page de ce guide  :wbpeak:.

| Quoi | Où tu le vois |
| --- | --- |
| Un trait d'acteur, et un onglet à toi pour le ranger | L'inspecteur d'unité, liste des traits |
| Traits de culture, religion, sous-espèce, clan, langue et royaume | Leurs propres fenêtres, une par système |
| Une arme, son enchantement et une catégorie pour les deux | Les mains d'une unité, les onglets d'équipement |
| Un effet de statut | Au-dessus de la tête de la créature, avec son icône |
| Des drops, un nuage qui les fait pleuvoir et un projectile | La carte, en plein vol, en pleine bagarre |
| Un tile | Le terrain, sous tout le reste |
| Une recette de nourriture | Les réserves d'une ville |
| Une loi du monde | La fenêtre Lois du Monde |
| Un pouvoir divin, son onglet et son bouton | La barre de pouvoirs en bas |
| Une fenêtre | Où tu décides de la mettre |
| Un bâtiment | Une ville, dès que quelqu'un le construit |
| Un royaume et une créature qui lui appartient | La carte, en apparaissant et en se battant |
| Une catastrophe | Le menu des catastrophes |
| Son propre job IA | La créature, qui marche quelque part exprès |
| Une décision, un métier municipal et un outil en main | Feux follets errant avec une torche, un gardien par ville |
| Une action de combat | Les unités véloces projetant des braises avant d'attaquer |
| Un gène, une personnalité, un type de livre, une pièce de bannière | Le génome, souverains, bibliothèques, drapeaux |
| Opinion, loyauté et un événement de bonheur | Les bilans diplomatiques et municipaux |
| Un complot | La liste des complots, lorsqu'un chef planifie un festival de braises |
| Un âge du monde et un comportement du monde | La roue des âges et le minuteur mondial |
| Un succès | La fenêtre des succès, à dix feux follets |
| Un pinceau, une info-bulle et un raccourci clavier | Rotation des pinceaux, info-bulle au survol, F6 |
| Un patch Harmony | Nulle part, et c'est le but : il change une règle en silence |

## Emporte-la

<a class="dl" href="hellobox.zip" download>
  <span class="dl-icon">📦</span>
  <span class="dl-text">
    <span class="dl-title">Télécharger HelloBox</span>
    <span class="dl-sub">Le mod fini, tous les fichiers de cette page. Décompresse dans <code>worldbox\Mods\</code> et lance le jeu.</span>
  </span>
</a>

Il est généré à partir des blocs de code de ce guide, donc c'est le même code que tu as copié, pas une copie séparée qui finit par diverger. Lis-le, casse-le, supprime les deux tiers dont tu ne veux pas.

> [!WARNING] C'est une démo, pas un produit
> Publier HelloBox tel quel n'aide personne : ce sont vingt fonctionnalités qui font chacune une petite chose mal, exprès. Change les ids, change le nom, garde les parties que tu voulais vraiment  :wbbru:.

## Le dossier

```text Mods/HelloBox/
HelloBox/
├── mod.json                         the ID card
├── icon.png                         what players see in the mod list
├── default_config.json              the settings window
├── Locales/
│   └── en.json                      every piece of text
├── GameResources/
│   ├── iconHelloCake.png            the food inventory icon
│   ├── actors/species/other/
│   │   ├── hello_wisp/              main/ and child/: walk_0..3, swim_0..3, sprites.json
│   │   └── hello_golem/             the same shape
│   ├── buildings/hello_shrine/      main_0, construction_0, ruin_0, mini_0, sprites.json
│   ├── cultures/
│   │   └── hello_culture_element.png    a culture banner part
│   ├── drops/hello_ember/           hello_ember_0..1, the falling drop
│   ├── effects/
│   │   ├── clouds/hello_cloud.png   the cloud sprite
│   │   ├── fx_hello_status/         fx_hello_status_0..2, the status overhead
│   │   └── projectiles/hello_bolt/  hello_bolt_0..1, the flying ember
│   ├── items/
│   │   ├── resources/hello_cake/    hello_cake_0..1, cake in hand
│   │   ├── tools/tool_hello_torch/  tool_hello_torch_0, the torch in hand
│   │   └── weapons/
│   │       ├── sprites.json         pivot for held weapons
│   │       ├── w_hello_sword.png    weapon sprite
│   │       └── w_hello_sword/       the in-hand sprite list, with its own sprites.json
│   ├── tiles/hello_moss/            moss_1, a tile variation
│   └── ui/Icons/
│       ├── sprites.json             default icon slicing
│       ├── iconHello*.png           traits, powers, tabs, the age, the gene, the grudge...
│       ├── items/icon_hello_sword.png       weapon inventory icon
│       └── worldrules/icon_hello_law.png    world law switch
└── Code/
    ├── Main.cs                      the door NML knocks on
    ├── HelloSettings.cs             what the settings window writes to
    ├── HelloGroups.cs               your own trait tab and item category
    ├── HelloTraits.cs               an actor trait
    ├── HelloMemory.cs               a trait that remembers, in the save file
    ├── HelloCulture.cs              a culture trait
    ├── HelloReligion.cs             a religion trait
    ├── HelloSubspecies.cs           a subspecies trait
    ├── HelloClan.cs                 a clan trait
    ├── HelloLanguage.cs             a language trait
    ├── HelloGenes.cs                a gene
    ├── HelloKingdomTraits.cs        a kingdom trait
    ├── HelloItems.cs                a weapon cities actually forge
    ├── HelloModifiers.cs            an enchantment
    ├── HelloStatus.cs               a status effect
    ├── HelloDrops.cs                falling embers
    ├── HelloClouds.cs               an ember cloud
    ├── HelloTiles.cs                a top tile
    ├── HelloResources.cs            a food recipe
    ├── HelloProjectiles.cs          a flying ember
    ├── HelloLaws.cs                 a world law switch
    ├── HelloBuildings.cs            a building
    ├── HelloKingdoms.cs             their faction
    ├── HelloActors.cs               your creatures
    ├── HelloAI.cs                   its own behaviour
    ├── HelloDecisions.cs            the wisps choosing it on their own
    ├── HelloCityJobs.cs             a job cities hand out
    ├── HelloTools.cs                a torch in hand
    ├── HelloCombat.cs               a combat move
    ├── HelloPolitics.cs             opinion, loyalty, a happiness event
    ├── HelloPlots.cs                a festival leaders can plot
    ├── HelloAges.cs                 a world age and a world behaviour
    ├── HelloAchievements.cs         an achievement
    ├── HelloPersonality.cs          a ruler personality
    ├── HelloBooks.cs                a kind of book
    ├── HelloBanners.cs              a culture banner part
    ├── HelloBrushes.cs              a brush shape
    ├── HelloTooltips.cs             the panel's tooltip
    ├── HelloHotkeys.cs              F6 opens the panel
    ├── HelloDisasters.cs            an ember storm, with its log line
    ├── HelloPowers.cs               a god power + its tab and buttons
    ├── HelloWindow.cs               a panel
    └── HelloPatches.cs              your Harmony patches
```

## Main.cs, dans son intégralité

```csharp Mods/HelloBox/Code/Main.cs
using System;
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>, IReloadable
    {
        // Development only: turns on NML's reload button. Never ship it on. See Logs & debugging.
        private static bool DevReload = false;

        protected override void OnModLoad()
        {
            if (DevReload) Config.isEditor = true;

            // Order matters: things that are referenced must exist first.
            Stage("groups", HelloGroups.Initialize);        // tabs before the things that sit in them
            Stage("traits", HelloTraits.Initialize);
            Stage("memory", HelloMemory.Initialize);
            Stage("culture", HelloCulture.Initialize);
            Stage("religion", HelloReligion.Initialize);
            Stage("subspecies", HelloSubspecies.Initialize);
            Stage("clan", HelloClan.Initialize);
            Stage("language", HelloLanguage.Initialize);
            Stage("genes", HelloGenes.Initialize);
            Stage("status", HelloStatus.Initialize);
            Stage("drops", HelloDrops.Initialize);          // clouds rain drops, so drops go first
            Stage("clouds", HelloClouds.Initialize);
            Stage("tiles", HelloTiles.Initialize);
            Stage("biomes", HelloBiomes.Initialize);       // after the tiles, before anything spawns in it
            Stage("resources", HelloResources.Initialize);  // items and buildings cost resources
            Stage("projectiles", HelloProjectiles.Initialize);
            Stage("modifiers", HelloModifiers.Initialize);
            Stage("items", HelloItems.Initialize);          // items can roll the modifiers above
            Stage("buildings", HelloBuildings.Initialize);
            Stage("kingdoms", HelloKingdoms.Initialize);    // actors point at kingdoms
            Stage("kingdom_traits", HelloKingdomTraits.Initialize);
            Stage("names", HelloNames.Initialize);         // before the actors, so they can use its name set
            Stage("actors", HelloActors.Initialize);
            Stage("laws", HelloLaws.Initialize);
            Stage("ai", HelloAI.Initialize);
            Stage("decisions", HelloDecisions.Initialize);  // after the actors and the task they use
            Stage("city_jobs", HelloCityJobs.Initialize);
            Stage("tools", HelloTools.Initialize);
            Stage("combat", HelloCombat.Initialize);        // after the trait that carries it
            Stage("politics", HelloPolitics.Initialize);
            Stage("wars", HelloWars.Initialize);
            Stage("plots", HelloPlots.Initialize);
            Stage("ages", HelloAges.Initialize);            // after the cloud, the law and the status it uses
            Stage("achievements", HelloAchievements.Initialize);
            Stage("personality", HelloPersonality.Initialize);
            Stage("books", HelloBooks.Initialize);
            Stage("banners", HelloBanners.Initialize);
            Stage("brushes", HelloBrushes.Initialize);
            Stage("tooltips", HelloTooltips.Initialize);
            Stage("hotkeys", HelloHotkeys.Initialize);
            Stage("disasters", HelloDisasters.Initialize);
            Stage("powers", HelloPowers.Initialize);        // last: the buttons need the powers

            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
            LogInfo("HelloBox ready");
        }

        private static void Stage(string pName, Action pAction)
        {
            try { pAction(); }
            catch (Exception e) { LogError($"stage '{pName}' failed: {e}"); }
        }

        // NML calls this after it recompiled your code, when you press the reload button
        public void Reload()
        {
            LogInfo("HelloBox reloaded");
        }

        public void Update()
        {
            if (!Config.game_loaded) return;
            if (World.world == null || World.world.units == null || MapBox.instance == null) return;

            // the power tab can only be laid out once its own Start() has run
            HelloPowers.LayoutWhenReady();
        }
    }
}
```

### Pourquoi cet ordre

Trois fichiers de ce dossier n'apparaissent jamais dans la liste ci-dessus, et c'est parfaitement normal :

| Fichier | Qui l'appelle |
| --- | --- |
| `HelloPatches.cs` | `PatchAll()` le détecte grâce à ses attributs. Vous n'appelez jamais un patch manuellement |
| `HelloSettings.cs` | Le chargeur de configuration y écrit lorsque le joueur déplace un curseur |
| `HelloWindow.cs` | Son propre bouton l'instancie la première fois que quelqu'un l'ouvre |

Vos textes n'ont pas besoin d'étape non plus : NML charge `Locales/en.json` avant même d'invoquer `OnModLoad`, chaque clé est donc déjà présente. Tout le reste relève de dépendances strictes :

1. **Les groupes avant leur contenu**, car un asset dont le `group_id` pointe vers le vide n'a aucun onglet où s'afficher.
2. **Les gouttes avant les nuages**, car un nuage référence la goutte qu'il fait pleuvoir.
3. **Les ressources avant les objets et les bâtiments**, car tous deux coûtent des ressources.
4. **Les modificateurs avant les objets**, car une arme énumère les modificateurs qu'elle peut obtenir.
5. **Les royaumes avant les acteurs**, car un acteur mentionne ses royaumes sauvage et civilisé.
6. **Les pouvoirs avant leurs boutons** : `PowerButtonCreator` recherche le pouvoir par son identifiant, et un bouton rattaché à un pouvoir manquant est un bouton inerte.
7. **Tout ce qu'utilise l'IA avant l'IA elle-même**, puisqu'une tâche cite des traits et des statuts par identifiant.
8. **Les acteurs et l'IA avant les décisions, métiers municipaux et outils**, car ceux-ci pointent vers une créature et une tâche qui doivent déjà exister.
9. **L'âge du monde après le nuage, la loi et le statut** que ses effets utilisent. Les complots, la politique et les succès ne font des recherches que pendant l'exécution du jeu et peuvent donc se placer n'importe où après leurs propres dépendances.

Quand un élément n'apparaît pas en jeu, la question "l'ai-je enregistré après ce qui en avait besoin ?" est la deuxième à se poser, juste après "est-ce mentionné dans le log ?" :PES2_HmmmmNoted:.

## La liste de vérification avant de considérer le travail fini

| | |
| --- | --- |
| Logs | Lancez le jeu, cherchez `HelloBox`. Vous voulez voir "ready" et **aucune** `Exception` |
| Textes | Aucun élément en jeu ne doit afficher une clé brute comme `trait_hello_x` |
| Icônes | Aucun trou invisible dans la barre des pouvoirs |
| Paramètres | Supprimez `mods_config/<GUID>.config`, redémarrez et vérifiez les valeurs par défaut |
| Monde vierge | Chargez une nouvelle carte, laissez-la tourner à fond cinq minutes, puis relisez les logs |
| Autres mods | Activez-en quelques-uns. Si vous patchez un élément, quelqu'un d'autre le patche aussi |

Rendez-vous ensuite sur **[Publier votre mod](#/nml/publishing)** et laissez les joueurs le mettre à l'épreuve :aPES3_VictoryPog:.

## Et après ?

- Supprimez les parties d'HelloBox dont vous n'avez pas l'utilité. C'était une démo, pas un vrai mod.
- Choisissez **un** seul domaine et peaufinez-le. Un mod qui fait une chose à la perfection surpasse un mod qui en fait douze de travers.
- Lisez le code de base pour la mécanique choisie (**[Lire le code du jeu](#/toolbox/reading-the-game-code)**). Tout ce que vous ignorez encore s'y trouve consigné :PESgn_ReadRules:.
