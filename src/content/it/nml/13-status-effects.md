---
title: Effetti di stato
group: Contenuto di gioco
subgroup: Attori, edifici e IA
icon: :wbcursed:
order: 146
---

# Effetti di stato :wbcursed:

Un tratto definisce chi una creatura **è**. Un effetto di stato definisce cosa le sta accadendo **in questo preciso momento**: brucia, congelata, avvelenata, benedetta. Scadono da soli col tempo, sovrappongono il proprio sprite all'unità e possono eseguire un'azione a intervalli regolari.

## Registrarne uno

Gli status risiedono in `AssetManager.status`. Stesso schema dei tratti: instanziare l'asset, popolarlo, aggiungerlo.

```csharp Mods/HelloBox/Code/HelloStatus.cs
namespace HelloBox
{
    public static class HelloStatus
    {
        public const string CURSED = "hello_cursed";

        public static void Initialize()
        {
            if (AssetManager.status.has(CURSED)) return;

            StatusAsset cursed = new StatusAsset
            {
                id = CURSED,

                // Statuses do NOT derive their locale keys from the id.
                // Set both, or the unit shows a blank tooltip.
                locale_id = "status_title_hello_cursed",
                locale_description = "status_description_hello_cursed",

                texture = "fx_hello_status",          // a folder of frames in GameResources/effects/
                path_icon = "ui/Icons/iconHelloStatus",       // icon in GameResources/ui/Icons/
                duration = 20f,                           // seconds, then it removes itself
                tier = StatusTier.Advanced,               // None, Basic or Advanced
                can_be_cured = true,
                allow_timer_reset = true,                 // re-applying refreshes the timer
                animated = true,
                animation_speed = 0.15f,
                loop = true,
                scale = 1f,
                offset_y = 0.2f,
                affects_mind = false,
                removed_on_damage = false,
                opposite_status = new string[] { "blessed" },
                remove_status = new string[] { "shield" }
            };

            // StatusAsset allocates its own base_stats, so unlike traits you can set
            // these before add(). Doing it after works too, and is the safer habit.
            cursed.base_stats["damage"] = -5;
            cursed.base_stats["speed"] = -10f;

            AssetManager.status.add(cursed);

            // StatusLibrary turns texture into frames, and flags the status as drawable, in its
            // own post-init: before your mod existed. Without these two the first unit that gets
            // the status throws NullReferenceException every frame.
            cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
            cursed.need_visual_render = true;
        }
    }
}
```

> [!WARNING] I frame vengono caricati solo per gli status vanilla
> `StatusLibrary` riempie `sprite_list` da `"effects/" + texture` e imposta `need_visual_render`, una volta, mentre il gioco carica. Uno status aggiunto dopo ha `sprite_list = null`, e appena una creatura lo prende `Status.updateAnimationFrame()` lancia `NullReferenceException` a ogni frame finché dura :wbfacepalm:. Le ultime due righe di `Initialize` fanno quel lavoro per il tuo.
>
> `texture` indica una **cartella**: `GameResources/effects/fx_hello_status/` con un PNG per frame di animazione.


### I campi che vale la pena conoscere

| Campo | Cosa fa |
| --- | --- |
| `duration` | Durata in secondi. Lo status si rimuove da solo alla scadenza |
| `allow_timer_reset` | Se riapplicarlo reimposta il timer invece di non fare nulla |
| `tier` | `StatusTier.None`, `Basic` o `Advanced`. Gli `allowed_status_tiers` dell'attore decidono se accettarlo |
| `can_be_cured` | Se un potere di guarigione può purificarlo |
| `removed_on_damage` | Cade nel momento stesso in cui l'unità subisce danni |
| `cancel_actor_job` | Interrompe qualunque cosa l'unità stesse facendo al momento dell'applicazione |
| `affects_mind` | Lo etichetta come effetto mentale |
| `opposite_status` | Status che non possono coesistere con questo |
| `remove_status` | Status che vengono rimossi quando questo si applica |
| `base_stats` | Modificatori alle statistiche attivi durante lo status |
| `locale_id` / `locale_description` | Chiavi del nome e del tooltip. **Obbligatorie** |
| `path_icon` | Icona nella lista degli status |
| `texture`, `sprite_list`, `animated`, `loop`, `animation_speed` | Lo sprite disegnato sull'unità. `texture` è il nome semplice dentro `effects/` |
| `offset_x`, `offset_y`, `scale`, `rotation_z`, `render_priority` | Posizionamento e rendering |
| `opposite_traits`, `opposite_tags` | Tratti e tag che bloccano questo status |
| `action_on_receive`, `action_get_hit` | Hook extra all'applicazione e quando si viene colpiti |
| `sound_idle` | Evento sonoro ciclico FMOD |

## Il tuo sprite personalizzato

C'è una trappola qui. `texture` **non** è un percorso completo: la libreria degli status prepende automaticamente `effects/` prima del caricamento, quindi inserisci solo il nome grezzo.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/
        └── fx_hello_status/
            ├── fx_hello_status_0.png
            ├── fx_hello_status_1.png
            └── fx_hello_status_2.png
```

```csharp
cursed.texture = "fx_hello_status";   // NON "effects/fx_hello_status"
```

Se scrivi la cartella nel testo, il gioco cercherà `effects/effects/fx_hello_status`, non troverà nulla e non disegnerà alcuno sprite.

`path_icon` sullo stesso asset è un campo differente e lui *è* un percorso completo: è la piccola icona dell'interfaccia, non lo sprite che si sovrappone alla creatura.

## Far *fare* qualcosa all'effetto

`action` viene eseguita ogni `action_interval` secondi mentre lo status è attivo. `action_finish` all'esaurimento, `action_death` se l'unità muore indossandolo.

```csharp
cursed.action_interval = 1f;
cursed.action = (BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.changeHealth(-2);   // pubblico e perfetto per danni periodici
    return true;
};
```

## Applicarlo a un'unità

Il metodo più intuitivo, `actor.addStatusEffect("hello_cursed")`, è contrassegnato come `internal` nell'assembly di gioco. Compila senza problemi contro una `Assembly-CSharp.dll` **publicizzata**, e una normale mod NML ce l'ha già: NML compila il tuo `Code/*.cs` contro la sua copia publicizzata, ed è per questo che ogni membro `internal` di questa guida ti compila. La perdi solo quando compili una tua `.dll` in Visual Studio contro l'assembly originale. Per quel caso, il percorso pubblico funziona sempre:

```csharp
StatusAsset asset = AssetManager.status.get(HelloStatus.CURSED);
World.world.statuses.newStatus(actor, asset, 20f);   // 20s, o 0 per la durata nativa dell'asset
```

Negli alberi di comportamento ci sono nodi già pronti: `new BehActorAddStatus("hello_cursed", 20f)` e `new BehActorRemoveStatus("hello_cursed")`.

## Non dimenticare i testi

```json Mods/HelloBox/Locales/en.json
{
  "status_title_hello_cursed": "Cursed",
  "status_description_hello_cursed": "Something very old is very annoyed at this creature."
}
```

Le chiavi sono quelle che hai associato a `locale_id` e `locale_description`. Rispettare lo schema vanilla `status_title_<id>` / `status_description_<id>` mantiene ordinati i file di lingua.

> [!TIP] Gli status sono la scelta migliore per gli effetti temporanei
> Qualunque cosa debba dissolversi (un potenziamento divino, un malus da arma, un indicatore temporaneo) è uno status, non un tratto. I tratti sono permanenti e vengono ereditati dai figli, il che non è quasi mai ciò che desideri :PES2_Uhm:.
