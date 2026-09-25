---
title: Modding con BepInEx
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# Modding con BepInEx :PES5_BigBrain:

Quasi tutta questa guida ti insegna a scrivere mod per **NeoModLoader**. Con NML scrivi semplici file `.cs` nel Blocco note, avvii il gioco e guardi il tuo codice compilarsi da solo.

A BepInEx non importa niente dei tuoi sentimenti :PES2_Shrug:. È il framework di modding per Unity veterano e universale. Fare una mod BepInEx vuol dire mettere su un vero progetto C#, compilare la tua `.dll` e metterla in `BepInEx/plugins/`. Perdi il ricaricamento istantaneo e gli aiuti comodi per gli asset, ma guadagni il controllo totale del processo di Unity prima ancora che il gioco sappia di essere sveglio.

Questa parte della guida ha tre pagine: questa fa partire un plugin, **[Aggiungere contenuti con BepInEx](#/toolbox/bepinex-content)** gli fa aggiungere cose vere al gioco, e **[Debug e pubblicazione](#/toolbox/bepinex-publishing)** lo porta agli altri.

## BepInEx o NeoModLoader

Prima di passare un pomeriggio a preparare una pipeline di build, scegli lo strumento giusto:

| Vuoi... | Scegli | Perché |
| --- | --- | --- |
| Aggiungere tratti (trait), oggetti (item), poteri divini (GodPower), creature o biomi | **NML** | NML ti dà `AssetManager` al momento giusto, una cartella `Locales`, `GameResources/`, pulsanti e aiuti per i salvataggi gratis |
| Costruire strumenti per sviluppatori, overlay o hook del motore | **BepInEx** | BepInEx parte a livello di Mono, prima che WorldBox si inizializzi |
| Modificare il codice solo col Blocco note e salvare | **NML** | NML compila i file sorgente C# durante l'esecuzione |
| Distribuire un plugin già compilato con componenti Unity puri | **BepInEx** | Controlli tu opzioni del compilatore, dipendenze e target di build |

Se aggiungi contenuti al gioco, scrivi una mod NML. Se costruisci uno strumento come UnityExplorer, o ti piace davvero guardare l'output di MSBuild nel terminale, il tuo posto è BepInEx. *Puoi* aggiungere contenuti anche con BepInEx, la prossima pagina mostra come, ma rifai a mano quello che NML ti regala.

## 1. Prerequisiti

1. Installa **BepInEx 5 (Mono x64)** e attiva la console come spiegato in **[La console dal vivo (BepInEx)](#/toolbox/bepinex-console)**. Avvia il gioco una volta, così BepInEx crea le sue cartelle.
2. Installa il **[.NET SDK](https://dotnet.microsoft.com/)** (o Visual Studio con lo sviluppo desktop .NET). Per i plugin BepInEx serve un vero compilatore C#.

## 2. Preparare il progetto

Apri un terminale nella cartella dove tieni i tuoi progetti e crea una nuova libreria di classi:

```bash
dotnet new classlib -n HelloBepInEx
cd HelloBepInEx
```

Poi sostituisci tutto il contenuto di `HelloBepInEx.csproj` con questo. Punta alla stessa versione di .NET del gioco, indica la tua cartella di WorldBox una volta sola e a ogni build fa tre lavori per te:

```xml HelloBepInEx.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>HelloBepInEx</AssemblyName>
    <Version>1.0.0</Version>
    <LangVersion>latest</LangVersion>
    <!-- Your WorldBox folder. Change this one line if Steam lives on another drive. -->
    <GameDir>C:\Program Files (x86)\Steam\steamapps\common\worldbox</GameDir>
  </PropertyGroup>

  <ItemGroup>
    <!-- Lets you build for net472 without installing the old .NET Framework developer pack -->
    <PackageReference Include="Microsoft.NETFramework.ReferenceAssemblies" Version="1.0.3" PrivateAssets="all" />
    <!-- Makes internal and private game code visible to your compiler, like NML does -->
    <PackageReference Include="BepInEx.AssemblyPublicizer.MSBuild" Version="0.4.3" PrivateAssets="all" />
  </ItemGroup>

  <ItemGroup>
    <!-- The game, publicized -->
    <Reference Include="$(GameDir)\worldbox_Data\Managed\Assembly-CSharp.dll" Publicize="true" Private="false" />
    <!-- Every Unity module: UnityEngine.dll alone does not have Input, UI or ImageConversion -->
    <Reference Include="$(GameDir)\worldbox_Data\Managed\UnityEngine*.dll" Private="false" />
    <!-- BepInEx and Harmony -->
    <Reference Include="$(GameDir)\BepInEx\core\BepInEx.dll" Private="false" />
    <Reference Include="$(GameDir)\BepInEx\core\0Harmony.dll" Private="false" />
  </ItemGroup>

  <!-- After every build, copy the plugin straight into the game -->
  <Target Name="CopyToGame" AfterTargets="Build">
    <Copy SourceFiles="$(TargetPath)" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
  </Target>
</Project>
```

A cosa serve ogni parte:

- **`Private="false"`** su ogni riferimento al gioco: la tua cartella di build non si copia dentro l'intero motore del gioco :PESgn_SMH:.
- **`Publicize="true"`**: le pagine NML della guida usano di continuo membri `internal` del gioco, perché NML compila contro un gioco "publicizzato". Il tuo progetto BepInEx no, a meno che tu non lo chieda. Con questo, lo stesso codice compila anche qui. I numeri di versione in `PackageReference` erano gli stabili più recenti quando ho scritto questa pagina; se NuGet si lamenta, prendi il più recente che propone.
- **`UnityEngine*.dll`**: Unity è diviso in tanti moduli. `Input` sta in `UnityEngine.InputLegacyModule.dll`, l'interfaccia in `UnityEngine.UI.dll` e così via. Referenziarli tutti ti risparmia la caccia al "tipo non trovato".
- **`CopyToGame`**: basta copiare la `.dll` a mano. Compili, avvii il gioco, fatto.

## 3. Lo scheletro del plugin

Un plugin BepInEx è una classe che eredita da `BaseUnityPlugin` e porta l'attributo `[BepInPlugin]`:

```csharp Plugin.cs
using BepInEx;
using BepInEx.Configuration;
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [BepInPlugin(PLUGIN_GUID, PLUGIN_NAME, PLUGIN_VERSION)]
    [BepInProcess("worldbox.exe")]
    public class HelloPlugin : BaseUnityPlugin
    {
        public const string PLUGIN_GUID = "com.example.hellobepinex";
        public const string PLUGIN_NAME = "HelloBepInEx";
        public const string PLUGIN_VERSION = "1.0.0";

        // BepInEx manages configuration files automatically
        private ConfigEntry<bool> configEnableLogs;
        private ConfigEntry<KeyCode> configHotkey;

        private void Awake()
        {
            // Bind configuration: section, key, default value, description
            configEnableLogs = Config.Bind(
                "General",
                "EnableLogs",
                true,
                "Print debug messages to the BepInEx console."
            );

            configHotkey = Config.Bind(
                "Controls",
                "ToggleKey",
                KeyCode.F7,
                "Key to press to trigger the plugin action."
            );

            if (configEnableLogs.Value)
            {
                Logger.LogInfo($"{PLUGIN_NAME} loaded successfully!");
            }

            // Apply any Harmony patches in this assembly
            Harmony harmony = new Harmony(PLUGIN_GUID);
            harmony.PatchAll();
        }

        private void Update()
        {
            // Standard Unity Update cycle
            if (Input.GetKeyDown(configHotkey.Value))
            {
                Logger.LogInfo("Hotkey pressed from BepInEx!");
            }
        }
    }
}
```

### Le parti una per una

- **`BaseUnityPlugin`**: eredita direttamente dal `MonoBehaviour` di Unity. Il tuo plugin è un componente attivo su un `GameObject` persistente che sopravvive ai cambi di scena.
- **`[BepInPlugin(guid, name, version)]`**: dice a BepInEx come si chiama la tua mod e qual è il suo identificativo unico. Usa il formato a dominio invertito (`com.author.modname`) e non cambiare mai il GUID dopo l'uscita: il file di config e le dipendenze degli altri plugin sono legati a quello.
- **`[BepInProcess("worldbox.exe")]`**: carica solo dentro WorldBox. Qui non fa danni, e ti evita un crash confuso se qualcuno mette il tuo plugin nel BepInEx di un altro gioco.
- **`Logger.LogInfo()`**: scrive direttamente nella console dal vivo di BepInEx e in `BepInEx/LogOutput.log`.
- **`Config.Bind()`**: crea un'impostazione con tipo. Al primo avvio, BepInEx genera un file `BepInEx/config/com.example.hellobepinex.cfg` pulito che i giocatori possono modificare.

## 4. Agganciarsi al gioco con Harmony

In BepInEx, Harmony è già incluso in `BepInEx/core/0Harmony.dll`. Aggiungi una classe di patch dove vuoi nel progetto:

```csharp Patches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    // MapBox.startTheGame runs once the world exists: it is where the game sets Config.game_loaded
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.startTheGame))]
    public static class StartTheGamePatch
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            Debug.Log("[HelloBepInEx] The world is ready!");
        }
    }
}
```

Siccome `Plugin.cs` ha chiamato `harmony.PatchAll()`, Harmony scorre la tua assembly compilata e applica tutte le classi di patch che contiene. Tutto quello che sai da **[Patch di Harmony](#/nml/harmony-patches)** funziona uguale qui: i nomi dei parametri magici, Prefix e Postfix, le regole per non rompere le altre mod.

## 5. Compilare e installare

Compila il progetto dalla riga di comando:

```bash
dotnet build -c Release
```

La tua `.dll` viene creata in `bin/Release/net472/HelloBepInEx.dll`, e il passo `CopyToGame` la mette direttamente nel gioco:

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

Avvia il gioco con la console attiva. Vedrai BepInEx trovare e caricare la tua assembly:

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

> [!WARNING] Chiudi il gioco prima di compilare
> Finché WorldBox è aperto, tiene la tua `.dll` in uso, e la copia fallisce con "the process cannot access the file". Chiudi il gioco, compila, riavvialo. È tutto il ciclo di sviluppo con BepInEx :PES2_Weary:.

## Verità scomode sul modding con BepInEx

- **Niente ricaricamento a caldo**: cambiare una riga di codice vuol dire chiudere WorldBox, lanciare `dotnet build` e riaprire il gioco. Se stai bilanciando il combattimento o i numeri di un tratto, stanca in fretta. C'è una mezza soluzione in **[Debug e pubblicazione](#/toolbox/bepinex-publishing)**.
- **`HideManagerGameObject`**: in `BepInEx/config/BepInEx.cfg`, metti `HideManagerGameObject = true` sotto `[Chainloader]`. Senza, alcune routine di pulizia di Unity possono distruggere l'oggetto radice di BepInEx e spegnere il tuo plugin in silenzio :PES5_Hmmmm:.
- **Insieme a NML**: NML e BepInEx convivono tranquilli nella stessa cartella del gioco. Puoi usare NML per le mod di contenuto e BepInEx per strumenti come UnityExplorer senza che litighino.
- **Accesso agli asset del gioco**: il tuo plugin si sveglia prima che il gioco abbia costruito le sue librerie (library) di asset. Tocca `AssetManager` in `Awake()` e ottieni dei null. La prossima pagina, **[Aggiungere contenuti con BepInEx](#/toolbox/bepinex-content)**, mostra il momento esatto in cui agganciarti.
