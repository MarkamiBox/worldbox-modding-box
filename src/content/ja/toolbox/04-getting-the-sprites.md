---
title: ゲームのグラフィックを抽出する (AssetRipper)
group: 概要
subgroup: 外部ツールとセットアップ
icon: :wbgeneralartist:
order: 8
---

# ゲームのグラフィックを抽出する :wbgeneralartist:

コードは*何を*書けばいいかを教えてくれます。**AssetRipper** はグラフィックがどんな見た目なのか、そして何より**そのアセットの正確なパスが何なのか**を教えてくれます。

WorldBox のすべてのアイコン、ユニット、建物（building）、エフェクトは、`ui/Icons/iconFly` のような文字列パスによって読み込まれます。このパスを一文字でも間違えると、ボタンはUI上に透明な穴として虚しく佇むことになります。AssetRipper を使えば、当てずっぽうの推測に終止符を打てます。

> [!TIP] パスだけが必要なら、この作業は一切不要です
> このサイトの **[アイコン検索](#/tools/icons)** はまさにこのエクスポートデータから作られており、ゲーム内の全パスを検索できます。実際にグラフィックを*目で見たい*時や、適切なサイズを確認したり、パレットの色味を合わせたい時に自分でエクスポートしてください。このページの続きはそのためのものです :PES4_HappyAwesome:.

## ゲームをエクスポートする

1. [**AssetRipper**](https://github.com/AssetRipper/AssetRipper/releases) をダウンロードします。
2. WorldBox のフォルダ（`worldbox_Data` が入っているフォルダ）を指定します。
3. 任意のフォルダにエクスポートします。数分の時間と数ギガの容量を消費します :pepehang:。

エクスポートすると Unity プロジェクトが出力されます。実際に必要なのは、出力された `Resources` フォルダだけです。これはゲーム本体が実行時にファイルを要求する階層ツリーとまったく同じ構造になっています。

## ファイルをパスに変換する

ルールは単純明快です：**`Resources` 以下の相対パスから、ファイルの拡張子を取り除いたものがパスになります。**

```text
ExportedProject/Assets/Resources/ui/Icons/iconFly.png
                                 └───────┬────────┘
                                         │
                      SpriteTextureLoader.getSprite("ui/Icons/iconFly")
```

最も頻繁にお世話になるフォルダ一覧：

| フォルダ | 格納されているもの |
| --- | --- |
| `ui/Icons/` | 各種小型UIアイコン：特性（trait）、神の力、各種ボタン |
| `ui/Icons/worldrules/` | 世界の法則（world law）のアイコン |
| `actors/` | ユニットおよびその各コマのアニメーション |
| `buildings/` | 家、樹木、鉱物 |
| `effects/` | 爆発、弾道、ステータス効果（status）スプライト |

## 自作Modの中で活用する

エクスポートの中から気に入ったアイコンを見つけたら、パスをメモして直接コードに書き込みましょう。ファイルをコピーする必要はありません。すでにゲーム本体に含まれているからです：

```csharp Mods/HelloBox/Code/HelloPowers.cs
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
```

あるいはアセット定義の文字列に直接指定します：

```csharp
trait.path_icon = "ui/Icons/iconFly";
```

## 自作イラストを公式の絵柄に馴染ませるコツ

自分でスプライトをドット打ちする場合は、まずバニラのファイルを1枚開いて次の3点を真似しましょう：

- **サイズ。** 特性や能力のアイコンは極めて小さく、通常は 16〜32 px 程度です。公式ファイルを開いてその規格に合わせましょう。
- **カラーパレット。** WorldBox は落ち着いた優しい色合いの限定的なパレットを採用しています。既存のスプライトからスポイトで色を取れば、作成したアイコンがゲーム内で浮いてしまうのを防げます :PES3_BobRoss:.
- **ピボット（基準点）。** ユニットや建物は地面の上に立っているため、ピボットは「下部中央」になります。これが `sprites.json` の `PivotY: 0.0` です。詳しくは **[スプライトとリソース](#/nml/sprites-and-resources)** を参照してください。

あとは作成した PNG 画像を、同じフォルダ階層を再現して `GameResources/` の中に配置するだけで、バニラ素材とまったく同様に読み込まれます：

```text
Mods/HelloBox/GameResources/ui/Icons/iconHello.png   ->   "ui/Icons/iconHello"
```
