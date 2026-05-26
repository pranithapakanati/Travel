Add-Type -AssemblyName System.Drawing

function Remove-FlatBackground {
    param(
        [string]$Path,
        [int]$RTarget,
        [int]$GTarget,
        [int]$BTarget,
        [int]$Tolerance
    )

    $bmp = [System.Drawing.Bitmap]::FromFile($Path)
    $out = New-Object System.Drawing.Bitmap $bmp.Width, $bmp.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $c = $bmp.GetPixel($x, $y)
            $dr = [Math]::Abs($c.R - $RTarget)
            $dg = [Math]::Abs($c.G - $GTarget)
            $db = [Math]::Abs($c.B - $BTarget)

            if ($dr -le $Tolerance -and $dg -le $Tolerance -and $db -le $Tolerance) {
                $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $c.R, $c.G, $c.B))
            }
            else {
                $out.SetPixel($x, $y, $c)
            }
        }
    }

    $bmp.Dispose()
    $out.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $out.Dispose()
    Write-Host "Updated $Path"
}

$base = Join-Path $PSScriptRoot "..\assets\images"
Remove-FlatBackground -Path (Join-Path $base "thanks1.png") -RTarget 255 -GTarget 255 -BTarget 255 -Tolerance 18
Remove-FlatBackground -Path (Join-Path $base "thanks-icon.png") -RTarget 0 -GTarget 0 -BTarget 0 -Tolerance 28
