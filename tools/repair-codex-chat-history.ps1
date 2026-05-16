param(
    [string]$CodexHome = "",

    [switch]$Fix
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($CodexHome)) {
    $CodexHome = Join-Path $env:USERPROFILE ".codex"
}

$sessionsRoot = Join-Path $CodexHome "sessions"
if (-not (Test-Path -LiteralPath $sessionsRoot)) {
    throw "No se ha encontrado la carpeta de sesiones de Codex: $sessionsRoot"
}

$badPathPattern = 'C:\\Users\\Usuario\\Documents\\GitHub\\Coda'
$safePathPattern = 'C:/Users/Usuario/Documents/GitHub/Coda'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$rawBrokenDirectivePattern = '::git-(stage|commit|push|create-branch|create-pr)\{[^\r\n]*cwd=\\"C:\\\\Users\\\\Usuario\\\\Documents\\\\GitHub\\\\Coda'
$decodedBrokenDirectivePattern = '^::git-(stage|commit|push|create-branch|create-pr)\{.*cwd="C:\\Users\\Usuario\\Documents\\GitHub\\Coda'

function Read-SharedUtf8Text {
    param(
        [string]$Path
    )

    $stream = [IO.File]::Open($Path, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::ReadWrite)
    try {
        $reader = New-Object IO.StreamReader($stream, [Text.Encoding]::UTF8, $true)
        try {
            return $reader.ReadToEnd()
        } finally {
            $reader.Dispose()
        }
    } finally {
        $stream.Dispose()
    }
}

function Write-SharedUtf8Text {
    param(
        [string]$Path,
        [string]$Text
    )

    $stream = [IO.File]::Open($Path, [IO.FileMode]::Open, [IO.FileAccess]::ReadWrite, [IO.FileShare]::ReadWrite)
    try {
        $stream.SetLength(0)
        $writer = New-Object IO.StreamWriter($stream, $utf8NoBom)
        try {
            $writer.Write($Text)
        } finally {
            $writer.Dispose()
        }
    } finally {
        $stream.Dispose()
    }
}

function Get-JsonStrings {
    param(
        [object]$Value
    )

    if ($null -eq $Value) {
        return
    }

    if ($Value -is [string]) {
        $Value
        return
    }

    if ($Value -is [System.Collections.IEnumerable] -and -not ($Value -is [string])) {
        foreach ($item in $Value) {
            Get-JsonStrings -Value $item
        }
        return
    }

    if ($Value.PSObject -and $Value.PSObject.Properties) {
        foreach ($property in $Value.PSObject.Properties) {
            Get-JsonStrings -Value $property.Value
        }
    }
}

function Measure-BrokenGitDirective {
    param(
        [string]$Text
    )

    $insideFence = $false
    $count = 0
    foreach ($line in ($Text -split "`r?`n")) {
        $trimmedLine = $line.TrimStart()
        if ($trimmedLine.StartsWith('```')) {
            $insideFence = -not $insideFence
            continue
        }

        if (-not $insideFence -and $trimmedLine -match $decodedBrokenDirectivePattern) {
            $count++
        }
    }

    return $count
}

$affectedFiles = @()
$sessionFiles = Get-ChildItem -LiteralPath $sessionsRoot -Recurse -Filter "*.jsonl" -File

foreach ($file in $sessionFiles) {
    $text = Read-SharedUtf8Text -Path $file.FullName
    $lines = $text -split "`r?`n"
    $changedLines = New-Object System.Collections.Generic.HashSet[int]
    $brokenDirectiveCount = 0

    for ($lineIndex = 0; $lineIndex -lt $lines.Length; $lineIndex++) {
        if ($lines[$lineIndex] -notmatch $rawBrokenDirectivePattern) {
            continue
        }

        try {
            $json = $lines[$lineIndex] | ConvertFrom-Json
        } catch {
            throw "No se ha podido leer JSONL en $($file.FullName):$($lineIndex + 1): $($_.Exception.Message)"
        }

        $lineBrokenDirectiveCount = 0
        foreach ($jsonString in (Get-JsonStrings -Value $json)) {
            $lineBrokenDirectiveCount += Measure-BrokenGitDirective -Text $jsonString
        }

        if ($lineBrokenDirectiveCount -gt 0) {
            [void]$changedLines.Add($lineIndex)
            $brokenDirectiveCount += $lineBrokenDirectiveCount
        }
    }

    if ($brokenDirectiveCount -le 0) {
        continue
    }

    $affectedFiles += [pscustomobject]@{
        Path = $file.FullName
        Count = $brokenDirectiveCount
    }

    if ($Fix) {
        $backupPath = "$($file.FullName).bak-codex-render-fix"
        if (-not (Test-Path -LiteralPath $backupPath)) {
            Copy-Item -LiteralPath $file.FullName -Destination $backupPath
        }

        foreach ($lineIndex in $changedLines) {
            $lines[$lineIndex] = $lines[$lineIndex].Replace($badPathPattern, $safePathPattern)
        }

        $fixedText = $lines -join "`n"
        Write-SharedUtf8Text -Path $file.FullName -Text $fixedText
    }
}

if ($affectedFiles.Count -eq 0) {
    Write-Host "No se han encontrado historiales de Codex con directivas Git afectadas."
    exit 0
}

if ($Fix) {
    Write-Host "Historiales de Codex reparados:"
} else {
    Write-Host "Historiales de Codex afectados. Vuelve a ejecutar con -Fix para repararlos:"
}

foreach ($item in $affectedFiles) {
    Write-Host "- $($item.Path) ($($item.Count) coincidencias)"
}
