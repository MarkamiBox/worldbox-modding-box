---
title: Harmony パッチビルダー
group: Mod開発ツール
icon: :wbstrongright:
order: 420
---

# Harmony パッチビルダー :wbstrongright:

ゲームの実在するメソッドを選ぶと、正しいクラス、メソッド、引数名が入ったパッチの骨組みが手に入ります。`__instance` のタイプミスで一晩を無駄にすることはもうありません。

> [!NOTE] ライブラリの `has`、`get`、`add`、`clone`、`post_init` へのパッチは意味がありません
> 影響するのは自分のModがロードされた後に行われる呼び出しだけで、その時点で既に完了しているバニラの登録処理には一切影響しません。**[アセットライブラリ](#/nml/asset-libraries)** を参照。

::tool:harmony::
