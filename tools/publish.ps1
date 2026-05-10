param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateNotNullOrEmpty()]
    [string]$Message,

    [string]$Remote = "origin",

    [string]$Branch = "",

    [switch]$SkipTests,

    [switch]$NoPush,

    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$currentPath = (Get-Location).Path
if ((Test-Path (Join-Path $currentPath "AGENTS.md")) -and (Test-Path (Join-Path $currentPath "tools\publish.ps1"))) {
    $repoRoot = $currentPath
} else {
    $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}
Set-Location $repoRoot

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Error al ejecutar: $Command $($Arguments -join ' ')"
    }
}

if ([string]::IsNullOrWhiteSpace($Branch)) {
    $Branch = (git branch --show-current).Trim()
    if ($LASTEXITCODE -ne 0) {
        throw "No se ha podido detectar la rama actual."
    }
}

if ([string]::IsNullOrWhiteSpace($Branch)) {
    throw "No se ha podido detectar la rama actual. Indica una rama con -Branch."
}

Write-Host "Repositorio: $repoRoot"
Write-Host "Rama: $Branch"
Write-Host ""

Write-Host "Estado inicial:"
Invoke-Checked "git" @("status", "--short")
Write-Host ""

if ($DryRun) {
    Write-Host "Simulación completada. No se han ejecutado pruebas ni se ha modificado Git."
    exit 0
}

if (-not $SkipTests) {
    & "$PSScriptRoot\run-tests.ps1"
    Write-Host ""
}

Invoke-Checked "git" @("add", "--all")
git diff --cached --quiet
$diffExitCode = $LASTEXITCODE

if ($diffExitCode -eq 0) {
    Write-Host "No hay cambios preparados para commit."
    exit 0
}

if ($diffExitCode -ne 1) {
    throw "No se ha podido comprobar el diff preparado para commit."
}

Write-Host "Cambios preparados:"
Invoke-Checked "git" @("diff", "--cached", "--name-status")
Write-Host ""

Invoke-Checked "git" @("commit", "-m", $Message)

if ($NoPush) {
    Write-Host "Commit creado. Push omitido por -NoPush."
    exit 0
}

$upstream = ""
try {
    $upstream = (git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null).Trim()
    if ($LASTEXITCODE -ne 0) {
        $upstream = ""
    }
} catch {
    $upstream = ""
}

if ([string]::IsNullOrWhiteSpace($upstream)) {
    Invoke-Checked "git" @("push", "--set-upstream", $Remote, $Branch)
} else {
    Invoke-Checked "git" @("push")
}

Write-Host "Publicación completada correctamente."
