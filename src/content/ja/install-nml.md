---
title: NMLのインストール
group: NML Modding
icon: :wbhammer:
order: 1
---

# NMLのインストール :wbhammer:

**NML**（NeoModLoader）は、WorldBoxのmodを動かすプログラムです。NMLのインストールは一度だけ。そのあとmodを入れるのは、フォルダをコピーするだけです。

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

必要なのはこのファイルだけです。`nml-setup-win.exe` や、`.pdb`、`.xml`、「Source code」のファイルも並んでいますが、すべて無視してください。

> [!WARNING] このリンクからだけ
> `.dll` はプログラムです。NMLは上のGitHubページ **からだけ** ダウンロードしてください。CurseForgeや他のサイト、チャットで誰かに送られたファイルは絶対に使わないこと。他所の古いコピーは、ゲーム初回起動時に自分自身を削除し、`NML` フォルダと `NeoModLoader.AutoUpdate_memload.dll` だけを残します。もしそうなったら、ここに戻って本物のファイルをダウンロードしてください。GameBanana の「1-click install」ボタンもNMLをインストールしません。`.dll` は手動でダウンロードしてください。
>
> ブラウザが「このファイルを保存しますか？」と聞いてくる場合や、Chromeが **確認されていません** と表示する場合、それは `.dll` がプログラムで、ダウンロードする人が少ないためです。上のGitHubページからなら答えは「保存」です（Chromeでは：ダウンロード一覧を開き **保持** を選択）。

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

> [!WARNING] `NeoModLoader (1).dll` は `NeoModLoader.dll` ではありません
> NMLを2回ダウンロードした、または古いコピーがすでにそのフォルダにあった場合、Windowsは新しいファイルを `NeoModLoader (1).dll` という名前にします。するとNMLは起動を拒否し、画面が赤い文字で埋め尽くされて「ゲームを再起動してください」と表示され、ログには `Missing className: NeoModLoader (1).WorldBoxMod` と出ます。ゲームを閉じ、古いファイルを削除し、新しいファイルの名前を正確に `NeoModLoader.dll`（空白も数字もなし）に変更して、もう一度起動してください。これが「NMLが動かない」の最も多い原因です :PESgn_SMH:。
>
> Windowsが「使用中」で古いファイルを削除できない場合、ゲームがまだ起動しています。先に閉じてください。

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

## Linux & Steam Deck

ロジックはまったく同じです。Linux版Steamはゲームをユーザーディレクトリにインストールし、Steam Deckでは最初にデスクトップモードに切り替えるだけです。

1. **Experimental Mode**: Windowsと同様、**[手順1](#手順1-experimental-modeをオンにする)** を行います。
2. **ダウンロード**: [公式リリースページ](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest) から `NeoModLoader.dll` をダウンロードします。全プラットフォーム共通の同一ファイルです。
3. **WorldBoxフォルダを開く**:
   - **デスクトップLinux**: Steam → ライブラリ → WorldBoxを右クリック → **管理 → ローカルファイルを閲覧**。
   - **Steam Deck**: **STEAMボタン → 電源 → デスクトップに切り替え** を押します。デスクトップモードでSteamを開き、ライブラリ → WorldBoxを右クリック（または左トラックパッド / トリガー）→ **管理 → ローカルファイルを閲覧** を選択します。
   通常のフォルダパス:
   ```text
   ~/.local/share/Steam/steamapps/common/worldbox/
   ```
4. **NMLを配置する**: `worldbox_Data → StreamingAssets → Mods` を開き、そこに `NeoModLoader.dll` をドラッグします。名前に `NCMS` が含まれるファイルがあれば削除してください。
5. **ゲームを起動**:（Steam DeckではGaming Modeに戻して構いません）**[手順5](#手順5-ゲームを起動して確認する)** と同じ項目を確認します。Modを入れる新しい `Mods` フォルダが、実行ファイルの横のメインWorldBoxフォルダ内に表示されます。

```text
worldbox/
├── worldbox_Data/
│   └── StreamingAssets/
│       └── Mods/
│           └── NeoModLoader.dll     <- NML
└── Mods/                            <- mod
```

---

## modを入れる

ここからは簡単な、何度も繰り返す部分です。

1. modをダウンロードします。先に説明文を読んでください。別の何かが必要なmodもあり、たいてい作者が書いています。
2. **`.zip`** ファイルのまま **`worldbox\Mods/`**、つまり `worldbox.exe` の隣のフォルダに入れます。展開しないでください。次にゲームを起動したときにNMLが自分で展開します。
3. ゲームを起動します。

いつもの癖で展開してしまった場合も問題ありません。`mod.json` の入ったフォルダが `Mods/` の直下にあれば動きます。避けるべき失敗は、`Mods/` の中にさらにフォルダが入れ子になっているケースや、フォルダなしで中身のファイルだけが `Mods/` に散らばっているケースです。

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
| NMLはあるのに、modが出てこない | modが違う `Mods` に入っています。`worldbox.exe` の隣のほうに、`.zip` のまま、または中に `mod.json` があるフォルダとして入れます |
| 画面が赤文字で埋め尽くされ「YOU SHOULD RESTART THE GAME」と出る | NMLが `NeoModLoader (1).dll` などの名前になっています。**[手順4](#手順4-nmlを正しい場所に置く)** を参照 |
| NMLが「has been disabled due to an error」と言う | modが壊れているか、ゲームのバージョンに対して古すぎます。そのmodの更新を探すか、作者に聞いてください |
| メインメニュー隅のバージョン表示がいつまでも変わらない | ゲームがSteamのベータブランチになっています。**[トラブルシューティング](#/troubleshooting)** を参照 |
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

**NMLはウイルスですか？**
いいえ。ブラウザが警告するのは `.dll` がプログラムで、ダウンロードする人が少ないからです。上のGitHubリンクからだけ入手してください。GameBananaのmodはモデレーターが確認していますが、チャットで誰かに送られたファイルは誰も確認していません :PESgn_ReadRules:。

**modごとにNMLを入れ直す必要がある？**
ありません。一度で十分です。あとはどのmodも `Mods` の中のフォルダひとつです。

**NMLは更新が必要？**
普段は不要です。NMLはゲームを起動するたびに新しいバージョンを確認し、自分で入れ替わります（隣に現れる `NeoModLoader.AutoUpdate_memload.dll` がそのためのものです）。もしそれが失敗したら、同じリンクから新しい `NeoModLoader.dll` をダウンロードして、古いものと手で入れ替えてください。

**modでセーブデータが壊れる？**
壊れることはあります。modを入れて作ったセーブは、そのmodを外すとうまく読み込めないことがあります。新しいことを試す前に、大事なワールドはコピーしておきましょう :PES_MonkaSweat:。

**お気に入りのmodが古いままです。まだ遊べますか？**
作者の更新を待つか、そのmodが作られたバージョンでゲームを遊びます：Steamで WorldBox を右クリック → **プロパティ → ベータ** から、そのブランチを選びます。そのバージョン用のNMLビルドも必要で、WorldBox DiscordのModdingチャンネルのピン留めメッセージにリンクがあります。そのブランチにいる間、現在のバージョン用のmodはすべて動かなくなります。戻るには同じメニューで **なし** を選びます。

**modの更新方法は？**
Workshopのmodは自動で更新されます。それ以外は：ゲームを閉じ、`Mods` からそのmodの古いフォルダ（と古い `.zip`）を削除し、新しい `.zip` を入れます。

**modを削除したのにゲームにまだ残っています。**
それはSteam Workshopから来ています。一覧でチェックを外すだけでは不十分です。Workshopのページで購読解除してください。

**自分用にmodを改造できますか？**
`Code` フォルダに `.cs` ファイルが入っているなら可能です。それらはただのテキストで、NMLがゲーム起動のたびにコンパイルし直し、絵は `GameResources` にあります。まずオリジナルのコピーを取っておいてください。改造版を配布するのは別の話です。作者に確認してください。`.dll` だけのmodは編集できず、ソースから作り直すしかありません。

**手伝ってくれる人にログを送ってと言われました。**
エクスプローラーのアドレス欄に `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` を貼り付け、`Player.log` を送ってください。スクリーンショットではなく**ファイルそのもの**です。ゲームが直前にクラッシュした場合は `Player-prev.log` を使ってください。ゲームを再度起動すると `Player.log` は上書きされます。

modを使うだけでなく作りたいなら、**[はじめに](#/getting-started)** から始まります。
