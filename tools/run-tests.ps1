param()

$ErrorActionPreference = "Stop"

$currentPath = (Get-Location).Path
if ((Test-Path (Join-Path $currentPath "AGENTS.md")) -and (Test-Path (Join-Path $currentPath "tests\domain-tests.js"))) {
    $repoRoot = $currentPath
} else {
    $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}
Set-Location $repoRoot

function Assert-LastCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Description
    )

    if ($LASTEXITCODE -ne 0) {
        throw "Error al ejecutar: $Description"
    }
}

Write-Host "Ejecutando pruebas de dominio..."
node tests\domain-tests.js
Assert-LastCommand "node tests\domain-tests.js"

Write-Host "Ejecutando pruebas de capa de aplicación..."
node tests\app-layer-tests.js
Assert-LastCommand "node tests\app-layer-tests.js"

Write-Host "Ejecutando pruebas de renderizado..."
node tests\renderers-tests.js
Assert-LastCommand "node tests\renderers-tests.js"

Write-Host "Ejecutando pruebas de estado de progresiones..."
node tests\progression-state-tests.js
Assert-LastCommand "node tests\progression-state-tests.js"

Write-Host "Ejecutando pruebas de exportación MIDI de progresiones..."
node tests\progression-midi-tests.js
Assert-LastCommand "node tests\progression-midi-tests.js"

Write-Host "Ejecutando pruebas de playback de progresiones..."
node tests\progression-playback-tests.js
Assert-LastCommand "node tests\progression-playback-tests.js"

Write-Host "Ejecutando pruebas del transporte de progresiones..."
node tests\progression-transport-tests.js
Assert-LastCommand "node tests\progression-transport-tests.js"

Write-Host "Ejecutando pruebas de comportamiento UI de progresiones..."
node tests\progression-ui-behavior-tests.js
Assert-LastCommand "node tests\progression-ui-behavior-tests.js"

Write-Host "Ejecutando pruebas de arquitectura..."
node tests\architecture-tests.js
Assert-LastCommand "node tests\architecture-tests.js"

Write-Host "Pruebas completadas correctamente."
