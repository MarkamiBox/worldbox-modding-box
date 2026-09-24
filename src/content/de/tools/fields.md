---
title: Asset-Feld-Browser
group: Modding-Tools
icon: :wbwise:
order: 430
---

# Asset-Feld-Browser :wbwise:

Jedes Asset besitzt eine feste Menge an Feldern. Dies ist die reale Liste direkt aus dem dekompilierten Spiel.

Wähle den Asset-Typ, filtere und klicke auf einen Namen zum Kopieren.

::tool:fields::

## Erklärung

- **Linke Spalte** ist der Typ. `int` bedeutet eine ganze Zahl, also kompiliert `rate_birth = 0.5f` nicht. `float` nimmt eine Kommazahl und will das Suffix `f`, wie `0.5f`. `string` nimmt Text in Anführungszeichen.
- **Der `= value`** ist der Standardwert, den das Spiel dem Feld schon gibt. Wenn der Standard passt, setz ihn nicht. Weniger Code, weniger Tippfehler.
- **"inherited from"** heißt, dass das Feld aus einer Elternklasse kommt. Es funktioniert genauso; es ist nur weiter oben deklariert. `id`, `base_stats` und `path_icon` sind meistens geerbt.
- **Die Kette über der Tabelle** (z. B. `ActorTrait -> BaseTrait -> BaseAugmentationAsset -> Asset`) zeigt, woher die Felder kommen, das Spezifischste zuerst.

> [!WARNING] Felder sind nicht die ganze Geschichte
> Dieses Tool sagt dir, dass ein Feld **existiert** und welchen Typ es hat. Es sagt dir nicht, ob das Spiel es in deinem Fall wirklich liest: Manche Felder zählen nur für Zivilisationseinheiten oder nur, wenn ein anderer Schalter an ist. Im Zweifel such dir ein Vanilla-Asset, das tut, was du willst, und kopier seine Werte, siehe **[Den Spielcode lesen](#/toolbox/reading-the-game-code)**.
