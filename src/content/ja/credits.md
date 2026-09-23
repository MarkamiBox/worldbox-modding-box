---
title: クレジット＆謝辞
group: 概要
subgroup: コミュニティとフィードバック
icon: :wblove:
order: 10
---

# クレジット＆謝辞 :wblove:

WorldBoxのmoddingは、こんなにすごいものを作り続けるコミュニティなしでは存在しませんでした。これを可能にしてくれた全員に、心からお礼を言わせてください。


## modderコミュニティ

ここが本当に大事な部分です。このページにあるツールはどれも誰かが維持しているし、このガイドのコツはどれも先に誰かが見つけて、そのまま「譲ってくれた」ものです :trollface:

- **modを作るすべての人へ。** このゲームについて知っていることの九割は、夜中の2時に他人の `Code/` フォルダを開いて「ああ、*そうやる*のか」と気づいて覚えました。ありがとう  :emoji_5:。

- **質問に答えるすべての人へ。** 誰かが「traitが表示されない」と聞けば、あなたは答えを一から書いてくれます。新しいmodderが上手くなるまで続けられるのは、それがあるからです  :catgoodjob: 。

- **バグをきちんと報告してくれる人へ。** ログ付きで。手順付きで。入れている他のmodの一覧付きで。あなたたちは貴重で、愛されています  :gold_star: 。

---

## ゲームと開発者

- **Maxim Karpenko と WorldBox開発チーム**
  - このゲームを作ってくれたこと、そしてアップデートを長く延ばしてくれたおかげで新しいmodを作り続けられたことに  :76060-pepesadlaugh:
  - [WorldBox Official Website](https://www.superworldbox.com/)
  - [WorldBox Discord](https://discord.gg/worldbox)

---

## Worldboxのアーティストたち

- **WorldBox公式Discordのアーティスト陣**
  - 公式Discordサーバーで作られた膨大なカスタム絵文字に感謝を。これらがなければ、このチュートリアルは本当にひどい見た目になっていたはずです :wblove:.

---

## moddingのプラットフォームと中核フレームワーク

- **[NeoModLoader (NML)](https://github.com/WorldBoxOpenMods/ModLoader)**
  - mod loaderを維持しているNMLのmaintainerとcore contributorに特別な感謝を。
- **[BepInEx](https://github.com/BepInEx/BepInEx)**
  - Unity/XNA向けのmoddingフレームワークとプラグイン構造。私はあまり使っていませんが。
- **[Harmony](https://github.com/pardeike/Harmony)**
  - **Andreas Pardeike** 作。ディスク上のゲームファイルを書き換えずに、実行中の.NETメソッドをpatch・hook・置き換えできる強力なライブラリ。

---

## 調査と解析のツール

- **[UnityExplorer](https://github.com/sinai-dev/UnityExplorer)**
  - **sinai-dev** 作。ゲーム内インスペクター。
- **[dnSpy](https://github.com/dnSpy/dnSpy) と [ILSpy](https://github.com/icsharpcode/ILSpy)**
  - コンパイル済みの `Assembly-CSharp.dll` を読んで仕組みを理解し、内部メソッドを見つけるためのデコンパイラとデバッガ。
- **[AssetRipper](https://github.com/AssetRipper/AssetRipper)**
  - Unityのasset bundleやシリアライズされたファイルから、スプライト、テクスチャ、フォント、効果音を覗いて取り出せるオープンソースのツール。

---

## ガイドの着想元とコミュニティの執筆者

GameBanana で公開されていたオリジナルの WorldBox Modding / NML 導入ガイドの執筆者に感謝いたします。分かりやすい構成が当サイトの NML インストール解説の大きな着想元となりました:

- **[Keymasterer ._.](https://gamebanana.com/members/2594582)**: NML 導入手順の着想元となったオリジナルガイドの著者・執筆者。
- **[ToonLunk](https://gamebanana.com/members/2712995)**: オリジナルガイドの校正者（Proofreader）および貢献者。

---

## ロボットたち

- **[Claude](https://claude.ai)** と **[Gemini](https://gemini.google.com)**
  - このガイドを実際に書くという力仕事。5年壊し続けてゲームの挙動は分かっていますが、それを他人が読める文章にするのは別の仕事で、その大半はこの2人がやりました  :computer_emotiguy: 。
  - デコンパイルしたゲームコードも読んでくれたので、フィールド名ひとつのために `Assembly-CSharp.dll` を四百回目にスクロールせずに済みました  :PES2_LookNewspaper: 。
  - ここにある内容は、公開前にすべて実際のゲームで確認しています。ロボットが自信満々に存在しないメソッドをでっち上げたとき、それを見逃したのは私の責任です  :PES2_Lies: 。
