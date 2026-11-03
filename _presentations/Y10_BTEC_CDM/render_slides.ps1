param([string]$Deck, [string]$OutDir)
# Export every slide of a deck to PNG with PowerPoint itself, so checks match what the teacher sees.
New-Item -ItemType Directory -Force $OutDir | Out-Null
$app = New-Object -ComObject PowerPoint.Application
try {
  $pres = $app.Presentations.Open($Deck, $true, $false, $false)
  $i = 0
  foreach ($s in $pres.Slides) {
    $i++
    $s.Export((Join-Path $OutDir ("s{0:D2}.png" -f $i)), 'PNG', 1000, 562)
  }
  $pres.Close()
  "exported $i slides"
} finally {
  # Leave PowerPoint running if the teacher has other decks open in it.
  if ($app.Presentations.Count -eq 0) { $app.Quit() }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null
}
