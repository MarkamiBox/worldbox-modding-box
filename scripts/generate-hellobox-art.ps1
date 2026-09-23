# Generates the complete set of HelloBox art from the base cube image.
# Uses System.Drawing (GDI+) with NearestNeighbor interpolation for crisp pixel art.

Add-Type -AssemblyName System.Drawing

$rootDir = Split-Path -Parent $PSScriptRoot
$srcPath = Join-Path $rootDir "src\custom-icons\hellobox_cube.png"
if (!(Test-Path $srcPath)) {
    Write-Error "Source cube image not found at $srcPath"
    exit 1
}

$artDir = Join-Path $rootDir "src\hellobox-art"
if (Test-Path $artDir) {
    Remove-Item $artDir -Recurse -Force
}
New-Item -ItemType Directory -Path $artDir | Out-Null

$src = [System.Drawing.Image]::FromFile($srcPath)

function Save-Resized($targetW, $targetH, $drawW, $drawH, $posX, $posY, $relPath) {
    $outPath = Join-Path $artDir $relPath
    $parent = Split-Path -Parent $outPath
    if (!(Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    $bmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $g.DrawImage($src, $posX, $posY, $drawW, $drawH)
    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

Write-Host "Generating HelloBox art assets..."

# 128x128 mod icon (112x112 centered, 4x integer scale)
Save-Resized 128 128 112 112 8 8 "icon.png"

# 64x64 building (56x56 2x integer scale, anchored at bottom-center)
# A building is a folder of frames named <kind>_<frame>. main = standing, construction =
# while a city builds it, ruin = after it falls. Anything else in the folder is ignored.
Save-Resized 64 64 56 56 4 8 "GameResources\buildings\hello_shrine\main_0.png"
Save-Resized 64 64 40 40 12 24 "GameResources\buildings\hello_shrine\construction_0.png"
Save-Resized 64 64 56 28 4 36 "GameResources\buildings\hello_shrine\ruin_0.png"
# mini = the building on the minimap, one pixel per tile it covers. The shrine is cloned from
# temple_human, which covers 5x4 tiles, so the minimap frame is 5x4 pixels.
Save-Resized 5 4 5 4 0 0 "GameResources\buildings\hello_shrine\mini_0.png"

# 64x48 cloud (weather effect)
Save-Resized 64 48 56 40 4 4 "GameResources\effects\clouds\hello_cloud.png"

# 32x32 power buttons, tabs, law icons, item icons (28x28 centered)
$buttons = @(
    "GameResources\ui\Icons\iconHelloStrike.png",
    "GameResources\ui\Icons\iconHelloDrop.png",
    "GameResources\ui\Icons\iconHelloCloud.png",
    "GameResources\ui\Icons\iconHelloBolt.png",
    "GameResources\ui\Icons\iconHelloBuilding.png",
    "GameResources\ui\Icons\iconHelloTile.png",
    "GameResources\ui\Icons\iconHelloSpawn.png",
    "GameResources\ui\Icons\iconHelloDisaster.png",
    "GameResources\ui\Icons\iconHelloTab.png",
    "GameResources\ui\Icons\iconHelloPanel.png",
    "GameResources\ui\Icons\items\icon_hello_sword.png",
    "GameResources\ui\Icons\worldrules\icon_hello_law.png"
)
foreach ($btn in $buttons) {
    Save-Resized 32 32 28 28 2 2 $btn
}

# 28x28 native trait & entity icons
$traits = @(
    "GameResources\iconHelloCake.png",
    "GameResources\ui\Icons\iconHelloSwift.png",
    "GameResources\ui\Icons\iconHelloCulture.png",
    "GameResources\ui\Icons\iconHelloReligion.png",
    "GameResources\ui\Icons\iconHelloSubspecies.png",
    "GameResources\ui\Icons\iconHelloClan.png",
    "GameResources\ui\Icons\iconHelloLanguage.png",
    "GameResources\ui\Icons\iconHelloKingdom.png",
    "GameResources\ui\Icons\iconHelloStatus.png",
    "GameResources\ui\Icons\iconHelloCiv.png",
    "GameResources\ui\Icons\iconHelloWild.png",
    "GameResources\ui\Icons\iconHelloDrive.png",
    "GameResources\ui\Icons\iconHelloSprite.png",
    "GameResources\ui\Icons\iconHelloWisp.png",
    "GameResources\ui\Icons\iconHelloGolem.png",
    "GameResources\ui\Icons\iconHelloGrudge.png",
    "GameResources\ui\Icons\iconHelloGene.png",
    "GameResources\ui\Icons\iconHelloAge.png"
)
foreach ($tr in $traits) {
    Save-Resized 28 28 28 28 0 0 $tr
}

# 16x16 in-world sprites: tiles, in-hand items, drops, projectiles, status effects
$smalls = @(
    "GameResources\tiles\hello_moss\moss_1.png",
    "GameResources\items\weapons\w_hello_sword.png",
    "GameResources\items\weapons\w_hello_sword\w_hello_sword.png"
)
foreach ($sm in $smalls) {
    Save-Resized 16 16 16 16 0 0 $sm
}

# A status animation is a folder of frames; the game plays them in order. Three sizes of the
# same cube make a pulse.
Save-Resized 16 16 10 10 3 3 "GameResources\effects\fx_hello_status\fx_hello_status_0.png"
Save-Resized 16 16 13 13 1 1 "GameResources\effects\fx_hello_status\fx_hello_status_1.png"
Save-Resized 16 16 16 16 0 0 "GameResources\effects\fx_hello_status\fx_hello_status_2.png"

# Anything the game reads with getSpriteList() must be a FOLDER of frames: a single PNG at
# that path comes back as an empty list. Drops and projectiles crash or turn invisible.
foreach ($f in @(
    @{ Dir = "drops\hello_ember"; Name = "hello_ember" },
    @{ Dir = "effects\projectiles\hello_bolt"; Name = "hello_bolt" },
    @{ Dir = "items\resources\hello_cake"; Name = "hello_cake" }
)) {
    Save-Resized 16 16 16 16 0 0 "GameResources\$($f.Dir)\$($f.Name)_0.png"
    Save-Resized 16 16 14 14 1 1 "GameResources\$($f.Dir)\$($f.Name)_1.png"
}

# A culture banner element: one sprite, loaded by path, so no folder here
Save-Resized 16 16 14 14 1 1 "GameResources\cultures\hello_culture_element.png"

# A hand tool is read with getSpriteList() like everything held: a folder of frames
Save-Resized 8 8 8 8 0 0 "GameResources\items\tools\tool_hello_torch\tool_hello_torch_0.png"

# sprites.json for proper slicing and pivots
$buildingJson = @'
{
  "Default": {
    "PixelsPerUnit": 1,
    "PivotX": 0.5,
    "PivotY": 0.0
  }
}
'@
Set-Content -Path (Join-Path $artDir "GameResources\buildings\hello_shrine\sprites.json") -Value $buildingJson -Encoding utf8

$weaponJson = @'
{
  "Default": {
    "PixelsPerUnit": 1,
    "PivotX": 0.5,
    "PivotY": 0.0
  }
}
'@
Set-Content -Path (Join-Path $artDir "GameResources\items\weapons\sprites.json") -Value $weaponJson -Encoding utf8
Set-Content -Path (Join-Path $artDir "GameResources\items\weapons\w_hello_sword\sprites.json") -Value $weaponJson -Encoding utf8

$uiJson = @'
{
  "Default": {
    "PixelsPerUnit": 1,
    "PivotX": 0.5,
    "PivotY": 0.5
  }
}
'@
Set-Content -Path (Join-Path $artDir "GameResources\ui\Icons\sprites.json") -Value $uiJson -Encoding utf8

# Creatures with their own art. A simple creature is a folder under actors/species/other/<id>/
# holding one folder per sheet (main = adult, child = baby), and each frame is its own PNG
# named the way the game asks for it: walk_0..walk_3 and swim_0..swim_3 (idle reuses walk_0).
# Frames 1 and 3 sit one pixel higher, which is the whole walk cycle of a cube.
$creatures = @(
    @{ Id = "hello_wisp";  Size = 12; Canvas = 16 },
    @{ Id = "hello_golem"; Size = 18; Canvas = 22 }
)
foreach ($c in $creatures) {
    foreach ($sheet in @("main", "child")) {
        $size = if ($sheet -eq "child") { [int]($c.Size * 0.7) } else { $c.Size }
        $x = [int](($c.Canvas - $size) / 2)
        foreach ($anim in @("walk", "swim")) {
            for ($i = 0; $i -lt 4; $i++) {
                $bob = if ($i % 2 -eq 1) { 1 } else { 0 }
                $y = $c.Canvas - $size - $bob
                Save-Resized $c.Canvas $c.Canvas $size $size $x $y "GameResources\actors\species\other\$($c.Id)\$sheet\$($anim)_$i.png"
            }
        }
        Set-Content -Path (Join-Path $artDir "GameResources\actors\species\other\$($c.Id)\$sheet\sprites.json") -Value $weaponJson -Encoding utf8
    }
}

$src.Dispose()
Write-Host "Generated all HelloBox art in $artDir successfully."
