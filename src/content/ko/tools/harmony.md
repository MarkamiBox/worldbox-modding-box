---
title: Harmony 패치 생성기
group: 모딩 도구
icon: :wbstrongright:
order: 420
---

# Harmony 패치 생성기 :wbstrongright:

게임의 실제 메서드를 고르면 올바른 클래스, 메서드, 매개변수 이름이 들어간 패치 뼈대를 얻을 수 있습니다. 이제 `__instance` 오타 하나로 저녁 시간을 날리지 않아도 됩니다.

> [!NOTE] 라이브러리의 `has`, `get`, `add`, `clone`, `post_init`을 패치해도 소용없습니다
> 영향을 주는 건 모드가 로드된 이후에 발생하는 호출뿐이며, 그 시점에 이미 끝나버린 바닐라 등록에는 전혀 영향을 주지 못합니다. **[에셋 라이브러리](#/nml/asset-libraries)** 참고.

::tool:harmony::
