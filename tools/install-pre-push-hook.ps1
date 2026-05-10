param()

$ErrorActionPreference = "Stop"

$currentPath = (Get-Location).Path
if ((Test-Path (Join-Path $currentPath "AGENTS.md")) -and (Test-Path (Join-Path $currentPath "tools\install-pre-push-hook.ps1"))) {
    $repoRoot = $currentPath
} else {
    $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}
Set-Location $repoRoot

$hooksDir = Join-Path $repoRoot ".git\hooks"
$hookPath = Join-Path $hooksDir "pre-push"
$hookContent = @'
#!/bin/sh

if command -v pwsh >/dev/null 2>&1; then
  pwsh -NoProfile -ExecutionPolicy Bypass -File "tools/git-hooks/pre-push.ps1"
else
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "tools/git-hooks/pre-push.ps1"
fi
'@

Set-Content -LiteralPath $hookPath -Value $hookContent -Encoding UTF8

Write-Host "Hook pre-push instalado en .git/hooks/pre-push."
Write-Host "A partir de ahora, git push ejecutará las pruebas antes de publicar."
