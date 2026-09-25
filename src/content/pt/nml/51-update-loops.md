---
title: Todo frame
group: NML Modding
subgroup: Avançado e publicação
icon: :wbyawn:
order: 43
---

# Todo frame :wbyawn:

Sua classe principal é um componente Unity. `BasicMod<T>` deriva de `MonoBehaviour`, então se você escrever um método `Update()` nela, a Unity o chama uma vez por frame. Do primeiro segundo após o lançamento até o jogo fechar, sessenta vezes por segundo, exista um mundo ou não.

Esse é o lugar para qualquer coisa que não seja reação a algo: uma checagem a cada mês do jogo, uma fila vinda de um patch do Harmony, uma tecla pressionada. Também é a forma mais fácil, no modding, de transformar o jogo de alguém num slideshow :wbfacepalm:.

## A proteção

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    // game_loaded: passou da inicialização. worldLoading: nenhum mundo pela metade, limpando ou construindo
    if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

    HelloTicker.Tick();
}
```

| Checagem | O que ela evita |
| --- | --- |
| `World.world != null` | Ainda não existe nenhuma instância de mapa |
| `Config.game_loaded` | Os primeiros momentos após o lançamento, antes do jogo iniciar seu primeiro mundo |
| `Config.worldLoading` | A tela de carregamento. Um mundo está sendo limpo, gerado ou carregado, e as listas de unidades estão sendo esvaziadas e preenchidas de novo debaixo dos seus pés |

`Config.worldLoading` é `SmoothLoader.isLoading()`, a mesma checagem que o próprio `MapBox.Update()` do jogo faz antes de simular qualquer coisa. A proteção em **[Logs e depuração](#/nml/logs-and-debugging)** cobre a inicialização; adicione a checagem de carregamento e você também fica de fora de todo carregamento de mundo depois disso.

## Nem todo frame

A maioria das coisas não precisa de sessenta checagens por segundo. Escolha um relógio e rode nele.

| Relógio | O que faz |
| --- | --- |
| `Time.deltaTime` | Segundos reais desde o último frame. Continua rodando com o jogo pausado, ignora a configuração de velocidade. O jogo nunca mexe em `Time.timeScale` |
| `World.world.getCurWorldTime()` | Segundos do mundo, como `double`. Para enquanto o jogo está pausado ou uma janela está aberta, roda mais rápido em velocidades maiores. 5 é um mês, 60 é um ano |

Use o tempo do mundo para qualquer coisa que acontece *dentro* dele. Aqui, toda unidade com o traço de rancor de **[Lembrando coisas](#/nml/saving-data)** esquece um golpe por mês:

```csharp Mods/HelloBox/Code/HelloTicker.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloTicker
    {
        private const double INTERVAL = 5.0;   // segundos do mundo: um mês no jogo
        private static double _last;

        [HarmonyPostfix]
        public static void ResetClock(MapBox __instance)
        {
            _last = __instance == null ? 0.0 : __instance.getCurWorldTime();
        }

        public static void Tick()
        {
            if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

            double now = World.world.getCurWorldTime();

            // um relógio andando para trás reseta a base sem disparar um tick
            if (now < _last) _last = now;
            if (now - _last < INTERVAL) return;
            _last = now;

            foreach (Actor actor in World.world.units)
            {
                if (actor == null || !actor.isAlive()) continue;
                if (!actor.hasTrait(HelloMemory.GRUDGE)) continue;

                actor.data.change(HelloMemory.HITS, -1, 0, 100000);
            }
        }
    }
}
```

Mantenha a chamada `PatchAll` de **[Patches do Harmony](#/nml/harmony-patches)**: `ResetClock` roda depois de todo mundo gerado ou carregado, mesmo um com um timestamp igual ou posterior. O primeiro tick espera um intervalo completo naquele mundo. Uma checagem de relógio andando para trás sozinha não detecta todo carregamento.

Pausa, velocidade e janelas abertas já são tratadas, porque o relógio do mundo já obedece a elas. Use tempo real para coisas que não estão no mundo, como um rótulo que pisca:

```csharp
private static float _timer;

_timer += Time.deltaTime;
if (_timer < 2f) return;
_timer = 0f;
```

> [!NOTE] Verificando a pausa você mesmo
> `Config.paused` é só o botão de pausa e nada mais. A simulação também para enquanto uma janela está aberta; `World.world.isPaused()` cobre os dois casos, mas é `internal`, então precisa do assembly publicizado com o qual o NML compila você. Usar o tempo do mundo poupa você dessa pergunta.

## Coroutines

Uma coroutine é um método que pode esperar no meio do caminho. Sua classe principal é um `MonoBehaviour`, então ela pode iniciar uma:

```csharp Mods/HelloBox/Code/HelloShakes.cs
using System.Collections;
using UnityEngine;

namespace HelloBox
{
    public static class HelloShakes
    {
        public static void Begin(Actor pActor)
        {
            Main.Instance.StartCoroutine(ShakeThreeTimes(pActor));
        }

        private static IEnumerator ShakeThreeTimes(Actor pActor)
        {
            for (int i = 0; i < 3; i++)
            {
                // verificado depois de cada espera: a unidade teve um segundo inteiro para morrer
                if (World.world == null || Config.worldLoading || pActor == null || !pActor.isAlive()) yield break;

                pActor.startShake();
                yield return new WaitForSeconds(1f);
            }
        }
    }
}
```

`WaitForSeconds` espera em segundos reais, e como o jogo nunca muda `Time.timeScale`, ela não para para a pausa e não se importa com a velocidade do jogo. A coroutine também continua rodando se o jogador carregar outro mundo no meio do caminho. Por isso a checagem depois de cada `yield`, não só antes do primeiro :PES2_F:.

## Teclas

`Input.GetKeyDown(KeyCode.F7)` dentro de `Update()` funciona. Também dispara enquanto o jogador está digitando o nome de uma unidade num campo de texto, e o jogador não pode trocar a tecla. Os próprios atalhos do jogo ignoram teclas enquanto um campo de texto está com foco, então um `HotkeyAsset` ganha isso de graça. Veja **[Janelas personalizadas](#/nml/custom-windows)** para registrar um. Reserve `GetKeyDown` só para uma tecla de depuração que só você vai apertar.

## Trabalho pesado

- **Percorra as unidades num timer, nunca a cada frame.** Dez mil unidades vezes sessenta frames são seiscentas mil checagens por segundo, para um traço que talvez três unidades tenham.
- **A checagem barata primeiro.** Mesma regra de um patch do Harmony: a primeira linha é a que permite dar `return`.
- **Filas paralelas enchem, `Update()` esvazia.** Um Postfix num método paralelo como `Actor.updateStats` não pode tocar na Unity nem em estado compartilhado, veja **[Patches do Harmony](#/nml/harmony-patches)**. Ele enfileira a unidade, e a thread principal pega aqui:

```csharp
// pending é a ConcurrentQueue que seu patch preenche
while (pending.TryDequeue(out Actor actor))
{
    if (actor == null || !actor.isAlive()) continue;
    // agora é seguro tocar na Unity, no Randy e nas suas próprias listas
}
```

O que você faz depois que está no loop é **[O mundo em tempo de execução](#/nml/world-at-runtime)**. O que você quer que continue lá depois de salvar e carregar é **[Lembrando coisas](#/nml/saving-data)** :PES_OkHand:.
