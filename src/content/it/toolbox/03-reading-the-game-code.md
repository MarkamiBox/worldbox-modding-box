---
title: Leggere il codice del gioco (dnSpy)
group: Panoramica
subgroup: Strumenti esterni e setup
icon: :wbnerd:
order: 7
---

# Leggere il codice del gioco :wbnerd:

Tutte le risposte sul modding di WorldBox sono già scritte: si trovano dentro il gioco stesso :wbbru:. **dnSpy** (oppure **ILSpy**) trasforma il file compilato del gioco in C# perfettamente leggibile, così puoi scoprire all'istante come si chiama un metodo, quali parametri accetta e che cosa fa davvero.

È il salto più grande in assoluto tra il "copiare pezzi di codice a caso" e il "creare mod sul serio" :3074-woah:.

## Aprire il gioco

1. Scarica [**dnSpy**](https://github.com/dnSpyEx/dnSpy/releases) (oppure [**ILSpy**](https://github.com/icsharpcode/ILSpy/releases), stessa zuppa, pulsanti leggermente diversi).
2. Apri questo file:

```text
worldbox/worldbox_Data/Managed/Assembly-CSharp.dll
```

Quel singolo file contiene l'intero codice del gioco. A sinistra trovi l'albero con ogni classe: `Actor`, `AssetManager`, `GodPower`, `ScrollWindow`, letteralmente tutte.

## Le quattro cose che farai di continuo

### 1. Cercare una classe

Premi `Ctrl+Shift+K` per cercare i tipi. Digita `ActorTrait`, aprila e vedrai ogni singolo campo che puoi impostare, con il suo tipo e il valore predefinito:

```csharp Assembly-CSharp / ActorTrait
public string path_icon;
public string group_id;
public float rate_birth;
public bool can_be_cured;
```

Quell'elenco *è* la documentazione per la pagina dei **[Tratti personalizzati](#/nml/custom-traits)**. Lo stesso trucco vale per `ItemAsset`, `BuildingAsset`, `StatusAsset` e qualsiasi altra cosa.

### 2. Controllare la vera firma di un metodo

Tirare a indovinare i nomi dei metodi è il modo migliore per sprecare un'ora dietro a un errore di compilazione. Cercalo invece. Cercare `addTrait` dentro `Actor` mostra:

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool hasTrait(string pTraitID)
public void removeTrait(string pTraitID)
```

Ora sai per certo che accetta una stringa, restituisce un booleano e ha un secondo argomento opzionale.

### 3. Guardare come fa il gioco stesso

Questa è la parte migliore. Vuoi creare una legge del mondo che funzioni? Trova `WorldLawLibrary`, apri `init()` e leggi cosa hanno scritto gli sviluppatori:

```csharp Assembly-CSharp / WorldLawLibrary.init()
world_law_mutant_box = add(new WorldLawAsset
{
    id = "world_law_mutant_box",
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_mutant_box",
    default_state = false
});
```

Copia quella struttura, cambia l'id e l'icona, e la tua legge funzionerà. Ogni singolo `*Library.init()` nel gioco è un tutorial gratuito per quel tipo di asset.

### 4. Trovare tutti gli ID

Gli ID sono semplici stringhe, e se sbagli una stringa il gioco fallisce in silenzio. I metodi `init()` contengono la lista completa: `TileLibrary.init()` ha ogni ID dei terreni, `ItemLibrary.init()` ogni arma, `ActorAssetLibrary.init()` ogni creatura.

## public, internal e tu

Mentre leggi il codice noterai tre paroline davanti ai metodi:

| Parola | Che cosa significa per te |
| --- | --- |
| `public` | Puoi chiamarlo. Sempre. |
| `internal` | Chiamabile solo se compili contro una copia **publicized** di `Assembly-CSharp.dll` |
| `private` | Non puoi chiamarlo direttamente. Trova il metodo pubblico che lo usa, oppure modificalo con una patch (vedi **[Patch con Harmony](#/nml/harmony-patches)**) |

Una DLL "publicized" è una copia in cui ogni membro è reso pubblico. La maggior parte dei modder di WorldBox ne usa una, ed è il motivo per cui codice come `actor.getHit(...)` compila a loro e non a te. Se qualcosa si rifiuta di compilare e dnSpy dice `internal`, il mistero è svelato.

> [!TIP] Tienilo aperto mentre programmi
> Non serve "leggersi tutto il gioco", non lo fa nessuno. Aprilo accanto al tuo editor e cerca i nomi man mano che ti servono. Due secondi lì battono venti minuti persi dietro a un errore di compilazione incomprensibile :PES_ThumbsUp:.

Quando ti servono solo il nome di un metodo e la sua firma, la **[Ricerca metodi](#/tools/methods)** su questo sito è più veloce: ogni metodo del gioco cercabile all'istante, con tanto di avviso se è `internal`. Torna a dnSpy quando hai bisogno di leggere che cosa fa *effettivamente* quel metodo: quella è la parte che nessun indice potrà mai darti.
