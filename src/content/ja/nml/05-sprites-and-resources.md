---
title: スプライト＆リソース
group: NML Modding
subgroup: 基本ワークフロー
icon: :wbfanartist:
order: 28
---

# スプライト＆リソース :wbfanartist:

特徴の名前、ステータス、そして素晴らしい説明文を用意できました。しかし、ゲーム内では巨大で不格好な「？」マークがアイコンとして表示されています。これを修正しましょう。

## ゲーム本体に既にあるアイコンを利用する

最も手軽で、最も頻繁に使う方法です：ゲーム本体のスプライトパスをそのまま指定します。

```csharp
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
Sprite[] frames = SpriteTextureLoader.getSpriteList("effects/projectiles/arrow");
```

`getSprite` はキャッシュ機能付きの `Resources.Load`、`getSpriteList` はキャッシュ機能付きの `Resources.LoadAll` です。パスに拡張子は含めません。常に `ui/Icons/iconFly` であり、`ui/Icons/iconFly.png` とは書きません。

大半のアセットフィールドは、読み込み済みのSpriteオブジェクトではなく、**パス文字列（string）** を要求します：

```csharp
trait.path_icon = "ui/Icons/iconHelloSwift";
power.path_icon = "ui/Icons/iconHelloStrike";
```

> [!TIP] どんなパスが存在するか調べるには？
> このサイトの **[アイコン検索](#/tools/icons)** ツールを使ってください。ゲーム内の全スプライトパスが登録されており、普段の言葉（「death king」や「lightning bolt」など）で検索してコピーできます。またはゲーム内で **[UnityExplorer](#/toolbox/unity-explorer)** を開き、イメージに近いバニラのアセットの `path_icon` を直接確認してください :aPES_Magnifying:。

## 独自のグラフィックを追加する

Modフォルダ内に **`GameResources/`** というフォルダを作成します。NMLはこのフォルダをUnityの `Resources` フォルダと全く同じように扱うため、以下の場所に置いた画像は：

```text
HelloBox/GameResources/ui/Icons/iconHelloSwift.png
```

`ui/Icons/iconHelloSwift` として読み込まれ、バニラのパスが使えるすべての場所で有効になります。`.png`、`.jpg`、`.jpeg` が自動認識されます。

### sprites.json

画像ファイルの横に `sprites.json` を配置すると、スプライトのスライス設定をNMLに指示できます。これがない場合はUnityのデフォルト設定が適用され、ドット絵には不適切になることがよくあります。（必須ではありません :PESgn_Maybe: ）

```json GameResources/ui/Icons/sprites.json
{
  "Default": {
    "PixelsPerUnit": 1,
    "PivotX": 0.5,
    "PivotY": 0.5
  },
  "Specific": [
    {
      "Path": "iconHelloSwift.png",
      "PivotX": 0.5,
      "PivotY": 0.0
    }
  ]
}
```

| フィールド | 内容 |
| --- | --- |
| `PixelsPerUnit` | 明確な理由がない限り `1` のままにしてください |
| `PivotX` / `PivotY` | アンカー位置。`0.5 / 0.0` は下部中央を意味し、ユニットや建物（building）で通常使われます |
| `BorderL/R/T/B` | 伸縮可能なウィンドウ枠やボタン用の9スライス境界線 |
| `Path` | この設定を適用する特定の画像ファイル名 |

`Default` は、`Specific` で指定されていない同じフォルダ内の全ファイルに適用されます。

## 各種アセットのアート配置先一覧

これは誰もが何度も見返しに来る表です。アセットごとに画像を指すフィールドが違い、いくつかは読み込む前にこっそりフォルダーを前に付けます。つまり、あなたが書く値が、ファイルの置き場所と同じとは**限りません**。

| アセット | フィールド | ファイルの置き場所 |
| --- | --- | --- |
| 特性（trait）、神の力、王国（kingdom）、グループ | `path_icon` | `GameResources/` + 書いたとおりのパス |
| アイテム（ユニットが手に持つもの） | `path_gameplay_sprite` | `GameResources/` + 書いたとおりのパス |
| 建物 | `sprite_path` | **フォルダー**：`GameResources/` + `sprite_path` + `/` の中に `main_0.png`、`construction_0.png`、`ruin_0.png`。`sprite_path` が空なら `main_path` + ID で、`main_path` のデフォルトは `buildings/` |
| ドロップ | `path_texture` | **フォルダー**：`GameResources/` + 書いたとおりのパス、1フレームにつきPNG 1枚 |
| 雲（cloud） | `path_sprites` | `GameResources/` + リスト内の各パス |
| ステータス効果（status） | `texture` | **フォルダー**：`GameResources/effects/` + 書いた値、1フレームにつきPNG 1枚 |
| 発射物 | `texture` | **フォルダー**：`GameResources/effects/projectiles/` + 書いた値、1フレームにつきPNG 1枚 |
| 資源（resource）（手に持つもの） | `path_gameplay_sprite` | **フォルダー**：`GameResources/items/resources/` + 書いた値、1フレームにつきPNG 1枚 |
| 資源（インベントリのアイコン） | `path_icon` | `GameResources/` + 書いた値。バニラは `iconResBread` のような名前だけを使うので、ファイルはルートに置かれます |
| タイルとトップタイル | *（フィールドなし）* | `GameResources/tiles/<the tile's id>/` |

> [!WARNING] 「フォルダー」は好みの問題ではない
> 上で**フォルダー**と書いたアセットはすべて `getSpriteList()` で読み込まれ、これはフォルダーの*中*のフレームを返します。PNG 1枚を指すと空で返ってきます：ドロップは透明なまま落ち、発射物は `QuantumSpriteLibrary.drawProjectiles()` で `ArgumentOutOfRangeException` を投げ、ステータスは毎フレームエラーになります。1フレームでも構いません、専用のフォルダーに入っていればいいのです：`drops/hello_ember/hello_ember_0.png` :wbfacepalm:。

このうち3つはハマりやすいです：

- **ステータスと発射物はフォルダーを前に付けます。** ステータスに `texture = "effects/status/myThing"` と書くと、ゲームは `effects/effects/status/myThing` を探し、何も見つかりません。バニラのステータスは名前だけを使います：`fx_status_burning_t`。
- **タイルはフィールドを完全に無視します。** タイルの画像は**ID**で、専用のフォルダーから探されます。タイルには複数のバリエーションがあるからです。`hello_moss` なら `GameResources/tiles/hello_moss/` の中にPNGを置きます。
- **建物は何もくっつけませんが、代わりの手があります。** `sprite_path` は書いたとおりに使われます：`"buildings/hello_shrine"` は `GameResources/buildings/hello_shrine/` です。空にするとゲームは代わりに `main_path` + ID を使うので、`main_path` にフォルダーを書くと `buildings/hello_shrine/hello_shrine` になってしまいます :PESgn_Bruh:。

> [!TIP] バニラのアセットからパスを写す
> いちばん近いバニラのものを選び、**[UnityExplorer](#/toolbox/unity-explorer)** か **[スプライトパス検索](#/tools/icons)** でそのフィールドを読み、形をそのまま真似しましょう。頭で考えるより速く、一発で正解します :PESgn_Noice:。

## ディスクから直接画像を読み込む

独自に9スライス処理したいウィンドウ枠や外部データなど、生のスプライトが直接欲しい場合があります。`ModDeclare` がModの配置場所を知っているため、パスをハードコードしてはいけません。

```csharp
string path = System.IO.Path.Combine(GetDeclaration().FolderPath, "GameResources", "ui", "frame.png");

Texture2D texture = new Texture2D(2, 2, TextureFormat.RGBA32, false);
texture.filterMode = FilterMode.Point;      // ドット絵がぼやけない設定
texture.LoadImage(System.IO.File.ReadAllBytes(path));
```

自分で一から書きたくない場合、`NeoModLoader.utils.SpriteLoadUtils` に `LoadSingleSprite(path)` や `LoadSprites(path)` も用意されています。

## サウンド

WorldBox のすべての効果音は FMOD イベントであり、パスを指定して再生されます。Mod からどれでも自由に鳴らすことができます：

```csharp
MusicBox.playSound("event:/SFX/WEAPONS/WeaponFireballStart", pTile);   // at a place in the world
MusicBox.playSoundUI("event:/SFX/UI/WindowWhoosh");                     // on the interface
```

1つ目はワールド内の該当タイルから音を鳴らします。HelloBox では戦闘アクションで火の粉を投げる際に火の玉の音を鳴らしています。詳細は **[弾、呪文、エフェクト](#/nml/projectiles-spells)** を参照してください。パスを探すには、ゲームコード内で `event:/SFX/` を検索してください。発音元ごとにフォルダ分けされた数百種類が見つかります。テストを始める前に音量を下げておきましょう。

### 独自のサウンドを追加する

NMLは実は内部でFMODにパッチを当てているので、ガレージで2つ目のサウンドエンジンを組み立てなくても自作の `.wav` ファイルが使えます :PESgn_Noice:。

`.wav` ファイルを `GameResources/` にそのまま置きます。例えば：

```text
GameResources/sounds/hello_boom.wav
```

NMLは `MusicBox.playSound` と `playDrawingSound` をフックしているので、バニラのサウンドとまったく同じメソッドで再生できます（拡張子は付けません）：

```csharp
MusicBox.playSound("sounds/hello_boom", pTile);
```

ファイルの隣にオプションの `hello_boom.json` を置くと、再生のされ方を設定できます：

```json GameResources/sounds/hello_boom.json
{
  "Volume": 60,
  "Mode": "Stereo3D",
  "Type": "Sound"
}
```

| フィールド | 値 |
| --- | --- |
| `Mode` | `Basic`（平面の2D、音量は一定）、`Stereo3D`（距離によるバニラの減衰）、`Mono3D`（指向性） |
| `Type` | `Sound`（効果音スライダー）、`Music`（音楽スライダー）、`UI`（UIスライダー） |
| `Volume` | デフォルト音量（0〜100） |
| `LoopCount` | 繰り返す回数（0 = 1回） |

何より嬉しいのは、NMLがゲームのチャンネルグループに接続してくれるので、あなたのサウンドが真夜中にプレイヤーの耳をつんざくことなく、ちゃんと音量設定に従うことです。

## ゲームに null のスプライトを絶対に渡さない

スプライトが見つからないボタンは、「アイコンが欠けたボタン」ではなく、UI上の**透明で見えない穴**となり、プレイヤーが押すことすらできなくなります。必ずフォールバックを用意してください：

```csharp
private static Sprite Icon(string pName)
{
    Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
    if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
    return sprite;
}
```

警告アイコンが出れば「パスが間違っている」と即座に気づけます。何も出ない透明な穴は、「ボタンがどこに消えたのか」と2時間悩む原因になります :PES4_Invisible:。
