---
title: NMLのインストール
group: NML Modding
icon: :wbhammer:
order: 1
---

# NMLのインストール :wbhammer:

**NML**（NeoModLoader）は、WorldBoxのmodを動かすプログラムです。ゲームは自力でmodを読み込めないので、NMLが代わりにやります。NMLのインストールは一度だけ。そのあとmodを入れるのは、フォルダをコピーするだけです。

このページは、こういう作業を一度もしたことがない人向けです。`.dll` が何か分かるなら **[短縮版](#短縮版)** へどうぞ :PES_OkHand:。

> [!NOTE] Windows、Mac、Linux (Steam Deck)
> Mod は **Steam版の Windows、Mac、Linux** (Steam Deck / SteamOS 含む) で動作します。スマホ、タブレット、ゲーム機版では動作しません。

## 短縮版

1. ゲーム内で：**設定 → Experimental Mode → オン**。
2. [公式のリリースページ](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest) から `NeoModLoader.dll` をダウンロード。
3. WorldBoxフォルダの中の `worldbox_Data/StreamingAssets/Mods/` に入れる。
4. 同じフォルダから、名前に `NCMS` が付くものをすべて削除。
5. ゲームを起動。以後、modは `worldbox.exe` の隣の `Mods` フォルダに入れます。

これで全部です。ここから下は同じ5つの手順を、クリックひとつずつ書いたものです。

---

## Windows

### 手順1. Experimental Modeをオンにする

1. いつも通りSteamからWorldBoxを起動します。
2. ゲームの **設定** ウィンドウを開きます。
3. 一覧から **Experimental Mode**（日本語版では **実験モード**）を探してオンにします。
4. ゲームを閉じます。

このスイッチがないと、ゲームはmodを探しもしません。エラーもメッセージもなく、ただ何も起きません :PES5_Hmmmm:。

> [!WARNING] Mods という名前のフォルダが2つあります
> ここ `worldbox_Data\StreamingAssets\Mods/` の中は **NML本体（NeoModLoader.dll）専用** です。作成した **mod** を入れるのは別のフォルダで、ゲームのルートディレクトリ（`worldbox.exe` の隣にある `worldbox\Mods/`）になります。まだ存在しませんが、初回起動時にNMLが自動作成します。modを `StreamingAssets\Mods/` に入れたり、NMLを `worldbox\Mods/` に置くのが、最も多い間違いです。

### 手順2. NMLをダウンロードする

1. このリンクを開きます：**[github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest)**。常に最新のNMLを指しているので、ブックマークしておけます。
2. **Assets** という項目までスクロールします。閉じていたらクリックして開きます。
3. **NeoModLoader.dll** をクリックします。普通のファイルと同じように、たいてい **ダウンロード** フォルダに保存されます。

必要なのはこのファイルだけです。`.pdb`、`.xml`、「Source code」のファイルも並んでいますが、無視してください。

> [!WARNING] このリンクからだけ
> `.dll` はプログラムです。NMLは上のGitHubページ **からだけ** ダウンロードしてください。適当なサイトや、チャットで誰かに送られたファイルは使わないこと。ブラウザが「このファイルを保存しますか？」と聞いてくるのは `.dll` だからで、このページからなら答えは「保存」です。

### 手順3. WorldBoxフォルダを開く

Steamがゲームをインストールしたフォルダです。探す必要はありません：

1. **Steam** を開いて **ライブラリ** に行きます。
2. 左の一覧で WorldBox を **右クリック** します。
3. **管理** をクリックし、次に **ローカルファイルを閲覧** をクリックします。

ゲームのファイルが入ったウィンドウが開きます。`worldbox`（または `worldbox.exe`）というファイルと `worldbox_Data` というフォルダが見えれば正解です。たいていのPCでは：

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

このウィンドウは開いたままにしておきます。以後「WorldBoxフォルダ」と言ったらここのことです。

> [!TIP] Windowsに拡張子を表示させる
> Windowsは初期設定でファイル名の末尾を隠すので、`NeoModLoader.dll` がただの `NeoModLoader` に見えます。これだとどんな手順書も分かりにくくなります。フォルダのウィンドウ上部の **表示** をクリックし、**ファイル名拡張子** にチェックを入れてください（Windows 11では **表示 → 表示 → ファイル名拡張子**）。何も壊れません。ファイル名が全部見えるようになるだけです。

### 手順4. NMLを正しい場所に置く

1. WorldBoxフォルダで **worldbox_Data** をダブルクリック。
2. **StreamingAssets** をダブルクリック。
3. **Mods** をダブルクリック。
4. 別のウィンドウで **ダウンロード** フォルダを開き、**NeoModLoader.dll** をこの `Mods` ウィンドウにドラッグします。

最終的にこうなります：

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            ├── test_asset_load/     ゲームのもの、触らない
            └── NeoModLoader.dll     <- 今入れたもの
```

そこに `test_asset_load` が見えなければ、フォルダを間違えています。WorldBoxフォルダに戻ってやり直してください。

**ついでに：** 名前に **NCMS** が付くもの（たとえば `NCMS_memload.dll` や `NCMS` というフォルダ）があれば削除します。NCMSは昔のmodローダーで、もう死んでいます。古いNCMSのmodはNMLがそのまま動かせます :PES2_Shrug:。

> [!WARNING] Modsという名前のフォルダは2つある
> ここ、`worldbox_Data\StreamingAssets/` の中にあるのは **NML本体専用** です。**mod** を入れるのは別のフォルダで、`worldbox.exe` の隣にあります。まだ存在せず、次の手順でNMLが作ります。modをここに入れる、またはNMLをあちらに入れるのが、このページでいちばん多いミスです。

### 手順5. ゲームを起動して確認する

SteamからWorldBoxを起動します。初回はいつもより少し長めに待ってください。

うまくいっていれば：

- ワールドの読み込み中に **Experimental mode is enabled** というメッセージが出ます。
- 画面下のタブボタンの中に、**NMLのロゴ** の付いた新しいボタンがあります。クリックすると、modの一覧がそこにあります。
- WorldBoxフォルダに戻ると、`worldbox.exe` のすぐ隣に **Mods** という空のフォルダができています。
- `worldbox_Data\StreamingAssets\Mods/` の中に、NMLが自分用の **NML** フォルダを作っています。触らないでください。

どれも起きなかったら **[うまくいかなかった](#うまくいかなかった)** へ。

---

## Mac

同じ5つの手順です。Macではゲーム全体がひとつのアプリアイコンにまとまっているので、フォルダの隠れ場所だけが違います。

1. **Experimental Mode**：Windowsとまったく同じ、**[手順1](#手順1-experimental-modeをオンにする)**。アップデートの注意もあなたに当てはまります。
2. [同じリリースページ](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest) から `NeoModLoader.dll` を **ダウンロード**。WindowsとMacで同じファイルです。
3. **WorldBoxフォルダを開く**：Steam → ライブラリ → WorldBoxを右クリック → **管理 → ローカルファイルを閲覧**。Finderのウィンドウが開きます。
4. **アプリの中に入る**：**worldbox** アプリのアイコンを右クリックして **パッケージの内容を表示** を選びます。続けて **Contents → Resources → Data → StreamingAssets → Mods** を開き、`NeoModLoader.dll` をドラッグします。ついでに名前に `NCMS` が付くものを削除します。
5. **ゲームを起動** して、**[手順5](#手順5-ゲームを起動して確認する)** と同じことを確認します。modを入れる新しい `Mods` フォルダは、アプリの中ではなく、WorldBoxフォルダのアプリの隣にできます。

```text
worldbox/
├── worldbox.app/
│   └── Contents/Resources/Data/StreamingAssets/Mods/
│       └── NeoModLoader.dll     <- NMLはここ
└── Mods/                        <- modはここ
```

---

## modを入れる

ここからは簡単な、何度も繰り返す部分です。

1. modをダウンロードします。先に説明文を読んでください。別の何かが必要なmodもあり、たいてい作者が書いています。
2. **.zip** ファイルなら展開します。Windows：右クリック → **すべて展開**。Mac：ダブルクリック。
3. できたフォルダを **`worldbox\Mods/`**、つまり `worldbox.exe` の隣のフォルダにドラッグします。
4. ゲームを起動します。

modのフォルダには、中のどこかに必ず `mod.json` というファイルがあります。NMLはそれでmodを見分けます。zipからフォルダの中にフォルダが出てきても大丈夫、NMLは中まで探します。

```text
worldbox/
├── worldbox.exe
└── Mods/
    ├── SomeMod/
    │   └── mod.json
    └── AnotherMod/
        └── mod.json
```

> [!TIP] HelloBoxで試す
> ちゃんと動いているか不安なら、このガイドで作るmodがそのままテストになります。**[完成したMOD](#/nml/all-together)** からダウンロードし、`Mods` に展開してゲームを起動。くだらないボタンだらけの新しいパワータブが出れば、インストールは完璧です :wbpeak:。

**modを外すには**、ゲームを閉じて `Mods` からそのフォルダを削除します。**削除せずにオフにするには**、ゲーム内のNMLのmod一覧を使います。

**Workshopのmod** も使えます。Steam Workshopでサブスクライブすれば、コピーしなくてもNMLが見つけます。

---

## うまくいかなかった

上から順に確認してください。ほとんどの人は最初の項目で直ります。

| 見えるもの | やること |
| --- | --- |
| NMLのボタンがない、`worldbox.exe` の隣に `Mods` フォルダがない | Experimental Mode がオフです。オンにして再起動。ゲームを更新するたびにも |
| それでも何もない、Experimental Mode はオン | `NeoModLoader.dll` の置き場所が違います。`worldbox_Data\StreamingAssets\Mods/` の、`test_asset_load` の隣に置きます |
| ファイル名が `NeoModLoader.dll.dll` や `NeoModLoader (1).dll` になっている | 正確に `NeoModLoader.dll` に名前を変えます |
| NMLはあるのに、modが出てこない | modが違う `Mods` に入っています。`worldbox.exe` の隣のほうに、中に `mod.json` があるフォルダとして入れます。`.zip` のままではだめです |
| NMLが「has been disabled due to an error」と言う | modが壊れているか、ゲームのバージョンに対して古すぎます。そのmodの更新を探すか、作者に聞いてください |
| WorldBoxのアップデート直後に全部壊れた | Experimental Mode をオンに戻します。そのあとmodの更新を待ちます。ゲームのアップデートで古いmodが数日壊れるのはよくあることです |

まだだめなら、**[トラブルシューティング](#/troubleshooting)** に長い一覧があり、**[ログとデバッグ](#/nml/logs-and-debugging)** にゲームが問題を書き残す場所が載っています。助けを求めるときは、使っているmod、壊れる直前にしたこと、エラーの文章を伝えてください。「動かない」だけでは誰も直せません。私もです :PESgn_ReadRules:。

---

## みんなが必ず聞くこと

**NMLとBepInExは一緒に使える？**
使えます。お互いの邪魔はしません。個々の *mod* 同士がぶつかることはありますが、それはmodの問題で、ローダーの問題ではありません。

**modに「NMLではなくBepInExが必要」と書いてある。**
それなら `Mods` には入れません。**[ライブコンソール (BepInEx)](#/toolbox/bepinex-console)** の手順でBepInExを入れ（Windows）、ゲームを一度起動してから、そのmodを `BepInEx\plugins/` に入れます。どのローダーが必要かはmodの説明に書いてあります。

**NMLとNCMS、どっち？**
NMLです。NCMSは更新が止まっていて、今のバージョンのゲームでは動きません。古いNCMSのmodもNMLで動くので、失うものはありません。

**modごとにNMLを入れ直す必要がある？**
ありません。一度で十分です。あとはどのmodも `Mods` の中のフォルダひとつです。

**NMLは更新が必要？**
普段は不要です。NMLはゲームを起動するたびに新しいバージョンを確認し、自分で入れ替わります（隣に現れる `NeoModLoader.AutoUpdate_memload.dll` がそのためのものです）。もしそれが失敗したら、同じリンクから新しい `NeoModLoader.dll` をダウンロードして、古いものと手で入れ替えてください。

**modでセーブデータが壊れる？**
壊れることはあります。modを入れて作ったセーブは、そのmodを外すとうまく読み込めないことがあります。新しいことを試す前に、大事なワールドはコピーしておきましょう :PES_MonkaSweat:。

modを使うだけでなく作りたいなら、**[はじめに](#/getting-started)** から始まります。
