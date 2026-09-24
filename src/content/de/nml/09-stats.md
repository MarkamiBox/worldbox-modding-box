---
title: Werte-Referenz
group: Spielinhalte
subgroup: Architektur & Statistiken
icon: :wbstonks:
order: 92
---

# Werte-Referenz :wbstonks:

Fast jedes Asset, das du registrierst, besitzt einen `base_stats`-Block, und fast jede Seite nach dieser hier schreibt etwas hinein. Dies ist die Liste all dessen, was du dort eintragen darfst. Alles andere ist ein Absturz, der auf seinen Moment wartet :PES5_Hmmmm:.

## Wie base_stats funktioniert

`base_stats` ist ein Wörterbuch von `string` auf `float`. Der Schlüssel muss eine der unten aufgeführten Werte-IDs sein. Einen unbekannten Schlüssel einzutragen ist **nicht** harmlos: Der Setter sucht die ID in der `base_stats_library`, erhält `null` zurück und wirft auf der Stelle eine `NullReferenceException` mitten in deiner `Initialize()`.

Ein Tippfehler bei einem Wert tut also nicht einfach stillschweigend nichts. Er reißt deine gesamte Registrierungsphase in den Abgrund, und alles nach dieser Zeile wird niemals ausgeführt. Halte deine Wertenamen in `const string`-Feldern, wenn du sie an mehr als einer Stelle verwendest.

```csharp
trait.base_stats["damage"] = 15;
trait.base_stats["multiplier_health"] = 0.25f;   // +25%, nicht x0.25
```

## Woher die Werte einer Einheit stammen

`Actor.updateStats()` leert den Werteblock der Einheit und baut ihn von Grund auf neu auf, in exakt dieser Reihenfolge. Ich schaue diese Tabelle immer noch jedes Mal nach:

| # | Quelle | Hinweis |
| --- | --- | --- |
| 1 | **Subspezies**, plus ihr männlicher oder weiblicher Block | Falls die Einheit eine besitzt |
| 1b | **Actor-Asset** | Nur wenn es **keine** Subspezies gibt. Die Subspezies *ersetzt* es, sie stapelt sich nicht darauf |
| 2 | **Clan**, plus sein männlicher oder weiblicher Block | |
| 3 | **Sprache** | |
| 4 | **Kultur** | |
| 5 | Anführer-Attribute aus den eigenen Daten der Einheit | `diplomacy`, `stewardship`, `intelligence`, `warfare` |
| 6 | Jeder **Statuseffekt** auf ihr | |
| 7 | Der **Standardangriffs-Gegenstand** | Nur unbewaffnet |
| 8 | Jedes **Actor-Merkmal** | Zeitalter-abhängige Merkmale werden übersprungen, wenn ihr Zeitalter nicht aktiv ist |
| 9 | Ihre **Persönlichkeit** | |
| 10 | Jeder **ausgerüstete Gegenstand**, samt seinen Modifikatoren | |

Zwei Dinge, die hier oft falsch verstanden werden:

- **Eine Subspezies ersetzt die Werte des Actor-Assets.** Wenn du `human` einen Wert gibst, wird eine Einheit mit Subspezies diesen niemals sehen.
- **Religion steht nicht auf dieser Liste.** Der `base_stats`-Block eines Religionsmerkmals erreicht eine Einheit nie direkt. Siehe **[Religionsmerkmale](#/nml/religion-traits)**.

Zwei weitere Konsequenzen:

- Ein flacher Wert wie `damage` ist ein **Bonus**, kein Endwert. `damage = 15` auf einem Merkmal bedeutet "+15 auf alles andere obendrauf".
- Ein `multiplier_*`-Wert ist ein **Bruch, der zu 1,0 addiert wird**. `multiplier_health = 0.5` bedeutet +50 %. `multiplier_health = -0.5` bedeutet halbe Gesundheit.

> [!WARNING] `base_stats` existiert erst nach der Registrierung des Assets
> Bei einem von Hand gebauten Asset wird der Werteblock innerhalb von `add()` alloziert. Greifst du davor auf `base_stats` zu, erhältst du eine `NullReferenceException`. `clone()` ruft `add()` für dich auf, nach einem Klon bist du also bereits sicher. Das ist der häufigste Absturz im gesamten WorldBox-Modding überhaupt.

## Combat

`damage` und `armor` erledigen den Großteil der Arbeit. Der Rest ist für den Fall, dass sich ein Merkmal anders anfühlen soll, nicht nur stärker.

| Wert | Was er bewirkt |
| --- | --- |
| `damage` | Fester Schaden pro Treffer |
| `damage_range` | Zufallsstreuung obendrauf auf `damage` |
| `attack_speed` | Wie schnell Angriffe ausgeführt werden |
| `accuracy` | Trefferchance |
| `critical_chance` | Chance auf einen kritischen Treffer |
| `critical_damage_multiplier` | Multiplikator für kritische Treffer |
| `armor` | Feste Schadensreduktion |
| `range` | Angriffsreichweite |
| `throwing_range` | Reichweite für Wurfwaffen |
| `targets` | Wie viele Ziele ein Angriff treffen kann |
| `projectiles` | Wie viele Projektile gleichzeitig abgefeuert werden |
| `knockback` | Wie weit ein Treffer das Ziel zurückwirft |
| `recoil` | Wie weit ein Treffer *dich* zurückwirft |
| `skill_combat` | Kampfgeschick-Stufe |
| `skill_spell` | Zaubergeschick-Stufe |
| `status_chance` | Chance, dass ein verknüpfter Statuseffekt ausgelöst wird |
| `area_of_effect` | Flächenschadensradius |

## Body

| Wert | Was er bewirkt |
| --- | --- |
| `health` | Maximale Gesundheit |
| `stamina` | Maximale Ausdauer |
| `mana` | Maximales Mana |
| `speed` | Bewegungsgeschwindigkeit |
| `mass`, `mass_2` | Physische Masse für Rückstoß und Physik |
| `size` | Trefferbox-Größe |
| `scale` | Gerenderte Darstellungsgröße |
| `max_nutrition` | Maximale Nahrungskapazität der Einheit |
| `metabolic_rate` | Wie schnell Nahrung verbrannt wird |
| `construction_speed` | Bautempo |
| `experience` | Erfahrungsgewinn |

## Lebenszyklus

| Wert | Was er bewirkt |
| --- | --- |
| `lifespan` | Lebenserwartung |
| `maturation` | Heranwachstempo |
| `age_adult` | Alter, ab dem sie als erwachsen gilt |
| `age_breeding` | Alter der Fortpflanzungsreife |
| `birth_rate` | Häufigkeit von Nachwuchs |
| `offspring` | Anzahl der Nachkommen pro Geburt |
| `multiplier_offspring` | Prozentuale Änderung an dieser Anzahl |
| `mutation` | Chance auf eine Subspezies-Mutation |
| `happiness` | Grundstimmung |

## Nur Zivilisationen

Diese bewirken bei Tieren überhaupt nichts. Das Spiel markiert sie mit `used_only_for_civs`. Gib einem Wolf `diplomacy` und du bekommst einen sehr redegewandten Wolf, dem niemand zuhört :wbwolf:.

| Wert | Was er bewirkt |
| --- | --- |
| `diplomacy` | Anführer-Attribut: Diplomatie |
| `warfare` | Anführer-Attribut: Kriegsführung |
| `stewardship` | Anführer-Attribut: Verwaltung |
| `intelligence` | Anführer-Attribut: Gelehrsamkeit |
| `army` | Beitrag zur Armeegröße |
| `cities` | Zielanzahl an Städten für das Königreich |
| `bonus_towers` | Zusätzliche Wachtürme, die eine Stadt bauen darf |
| `limit_population` | Bevölkerungsobergrenze |
| `limit_clan_members` | Clanmitglieder-Obergrenze |
| `loyalty_traits` | Loyalität durch Merkmale |
| `loyalty_mood` | Loyalität durch Stimmung |
| `opinion` | Grundlegende Meinung über andere |
| `multiplier_diplomacy` | Prozentuale Änderung der Diplomatie |
| `multiplier_supply_timer` | Wie lange Armeeverpflegung vorhält |
| `personality_aggression` | Versteckte KI-Persönlichkeitsgewichtung |
| `personality_administration` | Versteckte KI-Persönlichkeitsgewichtung |
| `personality_diplomatic` | Versteckte KI-Persönlichkeitsgewichtung |
| `personality_rationality` | Versteckte KI-Persönlichkeitsgewichtung |

## Multipliers

Alle diese Werte sind Brüche, die zu 1,0 addiert werden; `0.25` bedeutet also +25 %.

`multiplier_health` · `multiplier_lifespan` · `multiplier_stamina` · `multiplier_mana` · `multiplier_damage` · `multiplier_crit` · `multiplier_speed` · `multiplier_attack_speed` · `multiplier_mass` · `multiplier_offspring` · `multiplier_diplomacy` · `multiplier_supply_timer`

## base_stats vs. base_stats_meta

Jedes Merkmal trägt **zwei** Werteblöcke, und die falsche Wahl ist der häufigste Balance-Bug in Meta-Merkmal-Mods:

| Block | Wo er landet |
| --- | --- |
| `base_stats` | Wird in den Besitzer gemischt, und von dort in **jede Einheit**, die zu ihm gehört |
| `base_stats_meta` | Bleibt auf dem Besitzer. Wird von Kultur, Clan oder Subspezies selbst gelesen, nie von Einheiten |

```csharp
trait.base_stats["damage"] = 5;             // jedes Mitglied dieser Kultur trifft härter. Auch Bauern
trait.base_stats_meta["construction_speed"] = 10;   // die Gruppe baut schneller. Niemandes Schaden ändert sich
```

Soll ein Bonus nur für manche Mitglieder gelten (nur Krieger, nur Erwachsene), kann keiner der beiden Blöcke das ausdrücken. Verwende einen Harmony-Postfix auf `Actor.updateStats` und grenze es selbst ein. Siehe **[Harmony-Patches](#/nml/harmony-patches)**.

## Tags: Die Werte, die keine Zahlen sind

Ein `base_stats`-Block trägt auch ein Set von **Tags**, die Schalter statt Zahlenwerte darstellen. Sie vererben sich wie Werte, sodass ein Merkmal einer Einheit Feuerimmunität auf dieselbe Weise verleiht wie Extraschaden:

```csharp
trait.base_stats.addTag("immunity_fire");
trait.base_stats.addTag("fast_swimming");

if (actor.stats.hasTag("immunity_fire")) { }
```

Die Tags, die das Spiel selbst auswertet:

| Gruppe | Tags |
| --- | --- |
| Immunität | `immunity_fire` · `immunity_cold` · `building_immunity_fire` · `damaged_by_water` |
| Bewegung | `fast_swimming` · `water_creature` · `immovable` · `walk_adaptation_sand` · `walk_adaptation_snow` · `walk_adaptation_swamp` |
| Geist | `strong_mind` · `has_sapience` · `has_emotions` · `has_advanced_memory` · `has_advanced_communication` · `can_read_any_book` · `mad` · `moody` · `unconscious` · `frozen_ai` |
| Verhalten | `ignore_fights` · `love_peace` · `steal_items` · `needs_food` · `needs_mate` · `always_idle_animation` · `stop_idle_animation` · `generate_light` |
| Ernährung | `diet_meat` · `diet_meat_insect` · `diet_fish` · `diet_blood` · `diet_grass` · `diet_crops` · `diet_fruits` · `diet_flowers` · `diet_nectar` · `diet_algae` · `diet_vegetation` · `diet_wood` · `diet_minerals` · `diet_tiles` · `diet_same_species` |
| Fortpflanzung | `reproduction_sexual` · `reproduction_asexual` · `oviparity` · `viviparity` |
| Natur | `civ` · `human` · `elf` · `orc` · `dwarf` · `demon` · `undead` · `magic` · `good` · `evil` · `neutral` · `nature_creature` · `neutral_animals` · `everyone` · `small` · `sliceable` |
| Bauen | `can_build_in_biome_corruption` · `can_build_in_biome_desert` · `can_build_in_biome_infernal` · `can_build_in_biome_permafrost` · `can_build_in_biome_swamp` · `can_build_in_biome_wasteland` |

Anders als bei einem Wertenamen ist ein unbekanntes Tag harmlos - es passt einfach auf nichts. Das bedeutet aber auch, dass ein Tippfehler stillschweigend ignoriert wird, also kopiere sie exakt. Such dir dein Gift aus :wbbre:.

## Die Live-Werte einer Einheit auslesen

`base_stats` ist das *Rezept*. `stats` auf einem lebenden `Actor` ist das *Ergebnis*, nachdem alles aufsummiert wurde:

```csharp
float finalDamage = actor.stats["damage"];
```

Das ist auch das, was du in einem Harmony-Postfix auf `Actor.updateStats` verändern würdest (siehe **[Harmony-Patches](#/nml/harmony-patches)**).

## Einen eigenen Stat-Wert hinzufügen

Du kannst ein neues `BaseStatAsset` in `AssetManager.base_stats_library` registrieren; es wird im Inspektor angezeigt und aufsummiert wie jedes andere. Was es **nicht** tun wird: irgendeinen Effekt haben. Nichts im Spiel liest einen Wert, den es nicht kennt. Ein eigener Wert ist nur nützlich als Zahl, die du anschließend selbst in deinem eigenen Harmony-Patch oder deiner eigenen Logik auswertest.

Meistens lautet die Antwort "nutze einen bestehenden Wert", und die zweite Antwort lautet "führe dein eigenes Dictionary". Eine dritte habe ich noch nicht gefunden.
