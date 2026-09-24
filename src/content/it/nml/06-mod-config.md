---
title: Impostazioni del mod
group: NML Modding
subgroup: Funzionalità avanzate e rilascio
icon: :wbsettingsgear:
order: 40
---

# Impostazioni del mod :wbsettingsgear:

Prima o poi qualcuno ti dirà che il tuo mod è troppo forte, troppo lento o troppo rumoroso. Invece di discutere su Discord :PESgn_WhySoToxic:, dagli una finestra di impostazioni e lascia che se lo regolino da soli.

NML disegna l'intera finestra per te. Tu scrivi un singolo file JSON.

## default_config.json

Metti un file `default_config.json` nella radice del tuo mod, accanto a `mod.json`:

```json default_config.json
{
  "hellobox": [
    {
      "Id": "strike_radius",
      "Type": "INT_SLIDER",
      "IntVal": 25,
      "MinIntVal": 5,
      "MaxIntVal": 100,
      "Callback": "HelloBox.HelloSettings:SetStrikeRadius"
    },
    {
      "Id": "max_spawns",
      "Type": "INT_SLIDER",
      "IntVal": 40,
      "MinIntVal": 1,
      "MaxIntVal": 500
    },
    {
      "Id": "tint_by_mood",
      "Type": "SWITCH",
      "BoolVal": true
    }
  ]
}
```

`"hellobox"` è il **group id**: una scheda di impostazioni. Ogni elemento al suo interno è una riga nella finestra.

| Chiave | Significato |
| --- | --- |
| `Id` | Univoco nel gruppo. È così che leggi il valore nel codice |
| `Type` | `SWITCH` (on/off), `SLIDER` (decimale), `INT_SLIDER` (intero), `TEXT` (campo di testo) |
| `BoolVal` / `FloatVal` / `IntVal` / `TextVal` | Il valore predefinito, corrispondente al tipo |
| `MinFloatVal` / `MaxFloatVal`, `MinIntVal` / `MaxIntVal` | Limiti dello slider |
| `IconPath` | Icona opzionale per la riga |
| `Callback` | `Namespace.Type:MethodName` opzionale chiamato quando il valore cambia |

## Leggere i valori

Con `BasicMod<T>` hai `GetConfig()` gratis, indicizzato per gruppo e poi per id:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LoadSettings();
}

private void LoadSettings()
{
    try { HelloSettings.StrikeRadius = GetConfig()["hellobox"]["strike_radius"].IntVal / 100f; }
    catch (System.Exception) { }

    try { HelloSettings.TintByMood = GetConfig()["hellobox"]["tint_by_mood"].BoolVal; }
    catch (System.Exception) { }
}
```

Sì, il `try/catch` attorno a ciascuno sembra paranoico. Non lo è: se un giocatore aggiorna da una versione precedente del tuo mod, la sua configurazione salvata semplicemente non ha la chiave che hai appena aggiunto, e una singola chiave mancante altrimenti farebbe crashare l'intero caricamento.

## Callbacks

Un `Callback` è `Namespace.Type:MethodName`, e il metodo riceve il nuovo valore:

```csharp Mods/HelloBox/Code/HelloSettings.cs
namespace HelloBox
{
    public static class HelloSettings
    {
        public static float StrikeRadius = 0.25f;
        public static bool TintByMood = true;

        // chiamato da NML quando il giocatore sposta lo slider
        public static void SetStrikeRadius(int pValue)
        {
            StrikeRadius = pValue / 100f;
        }
    }
}
```

> [!WARNING] Le modifiche hanno effetto quando la finestra si chiude
> Non durante il trascinamento. Se il tuo callback fa qualcosa di costoso, questa è una buona notizia. Se ti aspettavi un'anteprima in tempo reale, ecco perché "non funziona" :huh:.

## Dove viene salvato

Il tuo `default_config.json` è solo il **modello**. Le scelte effettive del giocatore vengono scritte in:

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox\mods_config\<YOUR_GUID>.config
```

Che è anche la prima cosa da cancellare quando stai testando i valori predefiniti e ti chiedi perché il tuo nuovo valore non compare mai :PESgn_OOF:.

## Don't forget the text (again)

I group id e gli item id sono anche chiavi di localizzazione, quindi aggiungili ai tuoi file di lingua altrimenti appariranno grezzi:

Gli id dei gruppi e degli item sono anche chiavi di locale, quindi mettili in `Locales/en.json` o escono grezzi. Ogni riga vuole anche una seconda chiave, **`"<id> Description"`**, con lo spazio e la D maiuscola, per il tooltip:

```json Mods/HelloBox/Locales/en.json
{
  "hellobox": "HelloBox",

  "strike_radius": "Strike radius",
  "strike_radius Description": "How far the god power reaches.",

  "max_spawns": "Maximum spawns",
  "max_spawns Description": "Upper limit before the mod stops spawning.",

  "tint_by_mood": "Tint units by mood",
  "tint_by_mood Description": "Colour units by how happy they are."
}
```

> [!TIP] Il log ti dice quali hai dimenticato
> Un'etichetta mancante stampa `LocalizedTextManager: missing text: strike_radius Description`. Cerca `missing text:` dopo aver aperto una volta la finestra delle impostazioni e hai la lista esatta delle chiavi :wbsmirk:.


## Senza BasicMod

Se la tua classe principale implementa direttamente `IMod`, implementa `IConfigurable` sulla stessa classe e restituisci l'istanza tu stesso:

```csharp
public ModConfig GetConfig()
{
    return _config;   // creato o caricato da te
}
```

Quel singolo metodo è ciò che fa apparire il pulsante delle impostazioni accanto al tuo mod nella finestra dei mod. Un solo metodo, e nessuno litiga più con te su Discord. In teoria.
