$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "MDRRMO PCR System.lnk"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetFile = Join-Path $ProjectDir "launch.vbs"
$IconFile   = Join-Path $ProjectDir "public\app_logo.png"

# Use wscript.exe as the actual target (runs .vbs files)
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath     = "wscript.exe"
$Shortcut.Arguments      = """$TargetFile"""
$Shortcut.WorkingDirectory = $ProjectDir
$Shortcut.Description    = "Launch the Mambusao MDRRMO PCR System"
$Shortcut.IconLocation   = "$IconFile,0"
$Shortcut.Save()

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Desktop shortcut created successfully!" -ForegroundColor Green
Write-Host "  Look for 'MDRRMO PCR System' on your Desktop." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
