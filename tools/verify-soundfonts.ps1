$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$manifestPath = Join-Path $root "docs\technical\soundfont-checksums.sha256"
$errors = @()

Get-Content -LiteralPath $manifestPath | ForEach-Object {
    $line = $_.Trim()

    if ($line.Length -eq 0 -or $line.StartsWith("#")) {
        return
    }

    if ($line -notmatch "^([a-f0-9]{64})\s+(.+)$") {
        $errors += "Línea inválida en manifest: $line"
        return
    }

    $expectedHash = $Matches[1]
    $relativePath = $Matches[2] -replace "/", "\"
    $filePath = Join-Path $root $relativePath

    if (-not (Test-Path -LiteralPath $filePath)) {
        $errors += "No existe: $relativePath"
        return
    }

    $actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $filePath).Hash.ToLowerInvariant()

    if ($actualHash -ne $expectedHash) {
        $errors += "Hash distinto: $relativePath"
    }
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Host "Soundfonts verificados correctamente."
