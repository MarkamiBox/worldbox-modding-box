---
title: Content-Builder
group: Modding-Tools
icon: :wbhammer:
order: 405
---

# Content-Builder :wbhammer:

Wähl aus, was du bauen willst, füll die Felder aus, und du bekommst alles auf einmal: die Code-Datei, den Text für deine `Locales`-Datei und genau, wohin deine Grafiken gehören. Er schreibt denselben Code, den die Seiten des Guides beibringen, inklusive der Schritte, die alle immer vergessen, wie die Pools, die Post-Init-Felder und die Locale-Schlüssel, die nicht zur ID passen.

::tool:builder::

## So benutzt du, was er dir gibt

1. **Der Code** kommt in den Ordner `Code/` deiner Mod, in eine Datei mit dem Namen, der über dem Block steht.
2. **Der Text** kommt in `Locales/<Sprache>.json`. Wenn du die Datei schon hast, kopier nur die Zeilen innerhalb der `{ }` hinein und achte auf die Kommas.
3. **Die Grafiken** kommen genau dahin, wo die Liste es sagt. Lies das Wort neben jedem Eintrag: **Ordner** heißt ein Ordner voller PNGs, auch wenn du nur ein Frame hast. Ein einzelnes PNG, wo ein Ordner hingehört, ist der Grund Nummer eins, warum Grafiken nicht auftauchen :wbfacepalm:.
4. **Die Main.cs-Zeile** kommt in `OnModLoad()`. Die Reihenfolge zählt: Ein Merkmal in deinem eigenen Tab braucht zuerst den Tab, ein Gegenstand, der deine eigene Ressource kostet, braucht zuerst die Ressource.

Starte das Spiel und schau ins Log. Wenn etwas nicht stimmt, bringt dich der Link **Ganze Erklärung** unter der Auswahl zu der Seite, die diesen Inhalt im Detail erklärt.

> [!TIP] Ändere die Standardwerte
> Jede ID im Builder fängt mit `my_` an. Ändere das in etwas, das dir gehört, wie `hello_` bei HelloBox. Zwei Mods, die beide ein `my_trait` hinzufügen, streiten sich darum, und nur eine gewinnt :PESgn_Stop:.

## Vorlagen

Die letzte Gruppe in der Auswahl, **Templates**, funktioniert anders. Kreaturen, Gebäude, Katastrophen, KI, Pläne und Fenster sind vor allem deine eigene Logik, also gibt es kein Formular, das sie für dich schreiben könnte. Stattdessen bekommst du die funktionierende Datei der Guide-Seite, umbenannt auf deinen Namespace und dein Präfix. Sie kompiliert und läuft so, wie sie ist, und die Seite hinter **Ganze Erklärung** geht jede Zeile durch, damit du weißt, was du ändern musst.

## Was er nicht kann

Der Builder gibt dir Inhalte, die **funktionieren**. Was er nicht kann, ist deine Idee für dich zu erfinden. Wo eine Funktion deine eigene Logik braucht, etwa ein Merkmal, das etwas Besonderes tut, oder eine Macht, die etwas Neues macht, lässt er eine deutlich markierte Stelle `// your code here` frei. Die Seite hinter dem Link **Ganze Erklärung** zeigt, was du dort einsetzen kannst.
