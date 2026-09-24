---
title: Modding con BepInEx
group: Panoramica
subgroup: Strumenti esterni e setup
icon: :csharp:
order: 9
---

# Modding con BepInEx :csharp:

La maggior parte di questa guida ti insegna a creare mod per **NeoModLoader**. NML ti permette di scrivere semplici file `.cs` con il Blocco note, avviare il gioco e guardare il codice compilarsi all'istante.

A BepInEx non importa nulla dei tuoi sentimenti :PES2_Shrug:. È il framework di modding universale e veterano di Unity. Scrivere una mod BepInEx significa configurare un vero progetto C#, compilare la propria `.dll` e infilarla dentro `BepInEx/plugins/`. Perdi l'hot-reload immediato e le comode scorciatoie per gli asset di WorldBox, ma ottieni il controllo totale sul processo Unity prima ancora che il gioco realizzi di essere sveglio.

## BepInEx vs NeoModLoader

Prima di buttare un pomeriggio a configurare una pipeline di build, scegli lo strumento giusto per quello che vuoi fare:

| Vuoi... | Scegli | Perché |
| --- | --- | --- |
| Aggiungere tratti, oggetti, poteri divini, creature o biomi | **NML** | NML ti offre `AssetManager`, testi autolocalizzati, sprite e salvataggio dati integrati |
| Creare strumenti per sviluppatori, overlay o hook di basso livello | **BepInEx** | BepInEx parte a livello di runtime Mono prima ancora che WorldBox si inizializzi |
| Modificare il codice col Blocco note e premere Salva | **NML** | NML compila i sorgenti C# a runtime |
| Distribuire un plugin binario precompilato con componenti Unity puri | **BepInEx** | Gestisci direttamente compilatore, dipendenze e target di build |

Se vuoi aggiungere contenuti al gioco, fai una mod NML. Se invece vuoi creare tool come UnityExplorer, o ti rilassa guardare i log di MSBuild nel terminale, BepInEx è casa tua.

## 1. Prerequisiti

1. Installa **BepInEx 5 (Mono x64)** e attiva la console come spiegato nella guida **[La console dal vivo (BepInEx)](#/toolbox/bepinex-console)**.
2. Installa il **[.NET SDK](https://dotnet.microsoft.com/)** (oppure Visual Studio con il carico di lavoro per sviluppo desktop .NET). Per i plugin BepInEx serve un compilatore C# vero e proprio.

## 2. Configurare il progetto

Apri un terminale nella cartella in cui tieni i tuoi progetti e genera una nuova libreria di classi:

```bash
dotnet new classlib -n HelloBepInEx -f net472
cd HelloBepInEx
```

Apri `HelloBepInEx.csproj` nel tuo editor e aggiungi i riferimenti agli assembly del gioco e di BepInEx:

```xml HelloBepInEx.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>HelloBepInEx</AssemblyName>
    <Version>1.0.0</Version>
    <LangVersion>latest</LangVersion>
  </PropertyGroup>

  <ItemGroup>
    <!-- Assembly del gioco da worldbox_Data/Managed -->
    <Reference Include="Assembly-CSharp">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\Assembly-CSharp.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="UnityEngine">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\UnityEngine.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="UnityEngine.CoreModule">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\UnityEngine.CoreModule.dll</HintPath>
      <Private>false</Private>
    </Reference>

    <!-- BepInEx e Harmony da BepInEx/core -->
    <Reference Include="BepInEx">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\core\BepInEx.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="0Harmony">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\core\0Harmony.dll</HintPath>
      <Private>false</Private>
    </Reference>
  </ItemGroup>
</Project>
```

Aggiusta i percorsi se la tua libreria di Steam si trova su un altro disco. Impostare `<Private>false</Private>` sui riferimenti evita che l'intera cartella Managed del gioco venga copiata dentro la cartella di output del tuo plugin :PESgn_SMH:.

## 3. Lo scheletro del plugin

Un plugin BepInEx è una classe che eredita da `BaseUnityPlugin` decorata con l'attributo `[BepInPlugin]`:

```csharp Plugin.cs
using BepInEx;
using BepInEx.Configuration;
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [BepInPlugin(PLUGIN_GUID, PLUGIN_NAME, PLUGIN_VERSION)]
    public class HelloPlugin : BaseUnityPlugin
    {
        public const string PLUGIN_GUID = "com.markami.hellobepinex";
        public const string PLUGIN_NAME = "HelloBepInEx";
        public const string PLUGIN_VERSION = "1.0.0";

        // BepInEx gestisce i file di configurazione in modo automatico
        private ConfigEntry<bool> configEnableLogs;
        private ConfigEntry<KeyCode> configHotkey;

        private void Awake()
        {
            // Binding della configurazione: sezione, chiave, valore predefinito, descrizione
            configEnableLogs = Config.Bind(
                "General",
                "EnableLogs",
                true,
                "Stampa messaggi di debug nella console di BepInEx."
            );

            configHotkey = Config.Bind(
                "Controls",
                "ToggleKey",
                KeyCode.F7,
                "Tasto da premere per attivare l'azione del plugin."
            );

            if (configEnableLogs.Value)
            {
                Logger.LogInfo($"{PLUGIN_NAME} caricato con successo!");
            }

            // Applica tutte le patch Harmony presenti in questo assembly
            Harmony harmony = new Harmony(PLUGIN_GUID);
            harmony.PatchAll();
        }

        private void Update()
        {
            // Ciclo standard Update di Unity
            if (Input.GetKeyDown(configHotkey.Value))
            {
                Logger.LogInfo("Tasto premuto da BepInEx!");
            }
        }
    }
}
```

### Anatomia delle parti principali

- **`BaseUnityPlugin`**: eredita direttamente da `MonoBehaviour` di Unity. Il tuo plugin diventa un componente vivo agganciato a un `GameObject` persistente che non viene distrutto tra i cambi di scena.
- **`[BepInPlugin(guid, name, version)]`**: comunica a BepInEx come si chiama la tua mod e il suo identificatore univoco. Usa la convenzione a dominio inverso (`com.autore.nomemod`).
- **`Logger.LogInfo()`**: scrive direttamente sia nella console live di BepInEx sia nel file `BepInEx/LogOutput.log`.
- **`Config.Bind()`**: registra un'impostazione tipizzata. Al primo avvio, BepInEx genera un file `BepInEx/config/com.markami.hellobepinex.cfg` modificabile dai giocatori.

## 4. Agganciarsi al gioco con Harmony

In BepInEx, Harmony è già incluso direttamente dentro `BepInEx/core/0Harmony.dll`. Aggiungi una classe di patch nel tuo progetto:

```csharp Patches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [HarmonyPatch(typeof(World), nameof(World.init))]
    public static class WorldInitPatch
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            Debug.Log("[HelloBepInEx] Mondo inizializzato dalla patch di BepInEx!");
        }
    }
}
```

Avendo chiamato `harmony.PatchAll()` nel file `Plugin.cs`, BepInEx analizza l'assembly compilato e applica tutte le classi contrassegnate dagli attributi Harmony all'avvio.

## 5. Compilare e installare

Compila il tuo progetto dal terminale:

```bash
dotnet build -c Release
```

Troverai la `.dll` pronta dentro `bin/Release/net472/HelloBepInEx.dll`.

1. Raggiungi la cartella di WorldBox: `C:\Program Files (x86)\Steam\steamapps\common\worldbox\`.
2. Dentro `BepInEx/plugins/`, crea una sottocartella chiamata `HelloBepInEx`.
3. Copia `HelloBepInEx.dll` dentro `BepInEx/plugins/HelloBepInEx/`.

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

Avvia il gioco con la console abilitata. Vedrai BepInEx rilevare e caricare il tuo plugin:

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx caricato con successo!
```

## Verità scomode sul modding BepInEx

- **Niente hot-reload**: ogni volta che cambi una riga di codice devi chiudere WorldBox, ricompilare con `dotnet build` e riavviare il gioco. Se stai bilanciando statistiche o combattimenti, stanca in fretta.
- **`HideManagerGameObject`**: dentro `BepInEx/config/BepInEx.cfg`, accertati che `HideManagerGameObject = true` sia impostato. Altrimenti la pulizia di Unity potrebbe distruggere l'oggetto principale di BepInEx e spegnere la mod in silenzio :PES5_Hmmmm:.
- **Convivenza con NML**: NML e BepInEx convivono felicemente nella stessa cartella di gioco. Puoi usare NML per i contenuti e BepInEx per gli strumenti di sviluppo come UnityExplorer senza alcun conflitto.
- **Accesso agli asset di gioco**: BepInEx lavora al livello nudo e crudo di Unity. Se vuoi generare creature, registrare oggetti o creare tratti da un plugin BepInEx, devi attendere che WorldBox abbia terminato l'inizializzazione del proprio `AssetManager`, oppure fare riferimento a `NeoModLoader.dll` e lasciare fare a lui il lavoro sporco.
