param()

$ErrorActionPreference = "Stop"

$currentPath = (Get-Location).Path
if ((Test-Path (Join-Path $currentPath "AGENTS.md")) -and (Test-Path (Join-Path $currentPath "tools\run-tests.ps1"))) {
    $repoRoot = $currentPath
} else {
    $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
}
Set-Location $repoRoot

Write-Host "Hook pre-push: ejecutando pruebas antes de publicar..."
& "$repoRoot\tools\run-tests.ps1"
