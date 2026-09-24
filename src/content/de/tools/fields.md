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

- **Linke Spalte**: Datentyp (`int`, `float`, `string`).
- **`= Wert`**: Standardwert des Spiels. Wenn er passt, setz ihn nicht. Weniger Code, weniger Tippfehler.
- **"inherited from"**: Geerbt von einer Elternklasse.
- **Kette über der Tabelle**: Vererbungshierarchie.

> [!WARNING] Felder allein reichen nicht
> Dieses Tool bestätigt die Existenz eines Feldes. Details zum Verhalten findest du unter **[Spielcode lesen](#/toolbox/reading-the-game-code)**.
