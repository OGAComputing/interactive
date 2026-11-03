# Installs the kit's Google fonts (Oswald, Lato, Lora) for the current user, so PowerPoint draws the decks as Google
# Slides will, and render_slides.ps1 checks the real look. No admin rights needed. Run once per machine:
#   powershell -File install_fonts.ps1
$fonts = @{
  'Oswald[wght].ttf'       = @('ofl/oswald/Oswald%5Bwght%5D.ttf', 'Oswald (TrueType)')
  'Lato-Regular.ttf'       = @('ofl/lato/Lato-Regular.ttf', 'Lato Regular (TrueType)')
  'Lato-Bold.ttf'          = @('ofl/lato/Lato-Bold.ttf', 'Lato Bold (TrueType)')
  'Lato-Italic.ttf'        = @('ofl/lato/Lato-Italic.ttf', 'Lato Italic (TrueType)')
  'Lato-BoldItalic.ttf'    = @('ofl/lato/Lato-BoldItalic.ttf', 'Lato Bold Italic (TrueType)')
  'Lora[wght].ttf'         = @('ofl/lora/Lora%5Bwght%5D.ttf', 'Lora (TrueType)')
  'Lora-Italic[wght].ttf'  = @('ofl/lora/Lora-Italic%5Bwght%5D.ttf', 'Lora Italic (TrueType)')
}
$dst = "$env:LOCALAPPDATA\Microsoft\Windows\Fonts"
$reg = 'HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts'
New-Item -ItemType Directory -Force $dst | Out-Null
foreach ($name in $fonts.Keys) {
  $src, $label = $fonts[$name]
  Invoke-WebRequest "https://raw.githubusercontent.com/google/fonts/main/$src" -OutFile (Join-Path $dst $name) -UseBasicParsing
  New-ItemProperty -Path $reg -Name $label -Value (Join-Path $dst $name) -PropertyType String -Force | Out-Null
  Write-Output "installed $name"
}
Write-Output 'Done. Restart PowerPoint if it is open.'
