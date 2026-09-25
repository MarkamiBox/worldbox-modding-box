---
title: Другие моды
group: NML Моддинг
subgroup: Продвинутые техники и публикация
icon: :wbmodders:
order: 45
---

# Другие моды :wbmodders:

Ваш мод живёт не в пустом мире. Игрок может поставить HelloBox рядом с двадцатью другими модами, половина из которых тоже пытается менять бой, крутить законы мира или добавлять новые черты.

Иногда вы хотите с ними договориться: включить дополнительные функции, если установлен мод-партнёр, безопасно пропатчить его методы, не падая, если его нет, или убедиться, что ваши ассеты регистрируются в правильном порядке.

Есть два способа поговорить с другими модами: на этапе компиляции через `mod.json` или во время выполнения через код.

## Объявление зависимостей в mod.json

Самая чистая интеграция - объявить связь прямо в `mod.json`:

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "Markami",
  "version": "1.0.0",
  "description": "My first mod",
  "iconPath": "icon.png",
  "GUID": "com.markami.hellobox",
  "Dependencies": [],
  "OptionalDependencies": [
    "com.friend.coolmod"
  ],
  "IncompatibleWith": []
}
```

| Ключ | Назначение |
| --- | --- |
| `Dependencies` | Жёсткое требование. NML гарантирует, что эти моды загрузятся **раньше** вашего. Если хоть один отсутствует или не скомпилировался, NML вообще откажется загружать ваш мод |
| `OptionalDependencies` | Мягкое требование. Если другой мод установлен, NML загрузит его перед вашим **и** определит для него символ компилятора. Если его нет, ваш мод всё равно загрузится нормально |
| `IncompatibleWith` | Чёрный список. Если присутствует любой мод из этого списка, NML сообщит о конфликте и не даст им работать вместе |

### Символ компилятора #if

Когда мод из `OptionalDependencies` установлен и компилируется, NML определяет для вас константу препроцессора.

Символ - это GUID другого мода, переведённый в верхний регистр, где все не-буквенно-цифровые символы заменены на подчёркивания:

| GUID в `mod.json` | Определённый символ компилятора |
| --- | --- |
| `com.friend.coolmod` | `COM_FRIEND_COOLMOD` |
| `com.author.magic-items` | `COM_AUTHOR_MAGIC_ITEMS` |

Оберните код интеграции в `#if`:

```csharp Mods/HelloBox/Code/HelloIntegration.cs
namespace HelloBox
{
    public static class HelloIntegration
    {
        public static void Initialize()
        {
#if COM_FRIEND_COOLMOD
            // Компилируется, только если этот мод присутствует и активен
            ApplyCoolModSynergy();
#endif
        }

#if COM_FRIEND_COOLMOD
        private static void ApplyCoolModSynergy()
        {
            // Здесь безопасно ссылаться напрямую на их типы
            Main.Log("CoolMod found! Enabling partner synergies.");
        }
#endif
    }
}
```

> [!WARNING] Опечатка в символе молча всё ломает
> Если вы напишете `#if COM_FRIEND_COOL_MOD` вместо `#if COM_FRIEND_COOLMOD`, компилятор увидит неопределённый символ и тихо выкинет ваш блок кода. Он никогда не выполнится, без единой ошибки или предупреждения в логе :PES4_1IQ:. Всегда перепроверяйте точное преобразование GUID.

## Проверка во время выполнения

Трюк с `#if` работает, только когда NML компилирует ваш мод из исходников, и только когда другой мод объявлен в `OptionalDependencies`.

Если вы поставляете скомпилированную `.dll` или хотите проверять наличие модов динамически без пересборки, проверяйте во время выполнения.

### Проверка загруженных сборок

Можно проверить, загружена ли сборка другого мода в текущий AppDomain:

```csharp
using System;
using System.Linq;

public static bool IsModLoaded(string pAssemblyName)
{
    return AppDomain.CurrentDomain.GetAssemblies()
        .Any(a => string.Equals(a.GetName().Name, pAssemblyName, StringComparison.OrdinalIgnoreCase));
}
```

Или спросить у `AccessTools` из Harmony, существует ли один из их классов:

```csharp
using HarmonyLib;

bool hasPartner = AccessTools.TypeByName("PartnerNamespace.PartnerMain") != null;
```

Если `AccessTools.TypeByName` вернул не-null `Type`, их код загружен и готов к работе.

## Harmony-патч чужого мода

Патчить ванильный метод просто. У патча метода, живущего в другом моде, есть одна огромная ловушка :wbfacepalm:.

Если вы напишете обычный класс патча со ссылкой на их тип:

```csharp
// НИКОГДА не делайте так для опционального мода!
[HarmonyPatch(typeof(PartnerMod.SomeClass), "SomeMethod")]
public static class BadCrossModPatch
{
    public static void Postfix() { }
}
```

Среда Mono пытается разрешить `PartnerMod.SomeClass`, как только загружает ваш класс патча. Если у игрока нет этого мода, весь ваш мод падает с `TypeLoadException` или `FileNotFoundException` ещё до того, как отработает ваш `Initialize()`!

Вместо этого патчите его **вручную** через `AccessTools`:

```csharp Mods/HelloBox/Code/HelloCrossPatch.cs
using System;
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCrossPatch
    {
        public static void ApplyIfPresent(Harmony pPatchEngine)
        {
            Type targetType = AccessTools.TypeByName("PartnerMod.SomeClass");
            if (targetType == null)
            {
                // Другого мода нет. Спокойно пропускаем.
                return;
            }

            MethodInfo targetMethod = AccessTools.Method(targetType, "SomeMethod");
            if (targetMethod == null)
            {
                Main.LogWarning("PartnerMod found, but SomeMethod was not found. Outdated version?");
                return;
            }

            MethodInfo postfix = typeof(HelloCrossPatch).GetMethod(nameof(Postfix), BindingFlags.Static | BindingFlags.NonPublic);
            pPatchEngine.Patch(targetMethod, postfix: new HarmonyMethod(postfix));
            Main.Log("Successfully hooked PartnerMod.SomeMethod!");
        }

        private static void Postfix()
        {
            // Выполняется после их метода, только если их мод установлен
        }
    }
}
```

Ручной патчинг держит ссылку на тип строкой, поэтому среда выполнения никогда не пытается загрузить отсутствующую сборку.

## Ловушка порядка загрузки

Когда вы клонируете или ссылаетесь на контент другого мода, всё решает тайминг.

```csharp
// Если их мод ещё не выполнил Initialize(), это бросит NullReferenceException!
AssetManager.traits.clone("hello_super_trait", "partner_custom_trait");
```

NML грузит моды в порядке зависимостей. Если вы укажете другой мод в `Dependencies` или `OptionalDependencies`, NML гарантирует, что их `Initialize()` выполнится **раньше** вашего.

Если вы *не* объявили их как зависимость, порядок загрузки между модами не определён. Всегда:
1. Объявляйте другой мод в `OptionalDependencies`.
2. Проверяйте через `AssetManager.traits.has(...)` перед тем, как клонировать или читать их ассеты.

## Обмен данными без конфликтов

WorldBox даёт вам гибкие словари для хранения собственных данных на существах (`actor.data`) и на мирах (`World.world.map_stats.custom_data`).

Эти словари общие для всех модов. Если вы напишете:

```csharp
// Плохо: кто-то другой тоже может использовать "level"
actor.data.set("level", 5);
```

Другой мод может записать в `"level"` в том же кадре с совершенно другими ожиданиями.

Всегда добавляйте префикс мода к ключам своих данных:

```csharp
actor.data.set("hello_level", 5);
int myLevel = actor.data.get("hello_level", 0);
```

Далее: **[Публикация мода](#/nml/publishing)** или управление скоростью симуляции и настройками в **[Настройки игры и шкалы времени](#/nml/game-options)**.
