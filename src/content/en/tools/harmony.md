---
title: Harmony patch builder
group: Modding Tools
icon: :wbstrongright:
order: 420
---

# Harmony patch builder :wbstrongright:

Pick a real game method and get the patch skeleton with the right class, method and parameter names, so a typo in `__instance` stops costing you an evening.

> [!NOTE] Patching a library's `has`, `get`, `add`, `clone` or `post_init` is pointless
> It only affects calls made after your mod loads, never the vanilla registration that already happened by then. See **[Asset libraries](#/nml/asset-libraries)**.

::tool:harmony::
