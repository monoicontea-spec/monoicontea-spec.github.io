# Validates profile README files before upload
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

foreach ($file in @("README.md", "EXHIBITIONS.md")) {
    if (-not (Test-Path (Join-Path $root $file))) {
        Write-Host "Missing: $file" -ForegroundColor Red
        exit 1
    }
}

$readme = Get-Content (Join-Path $root "README.md") -Raw -Encoding UTF8
$patterns = @(
    "Yook Ho Joon",
    "Gachon University",
    "Analog",
    "EXHIBITIONS.md",
    "yook@gachon.ac.kr",
    "Associate Professor"
)

$failed = 0
foreach ($pattern in $patterns) {
    if ($readme -match [regex]::Escape($pattern)) {
        Write-Host "[OK] $pattern" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $pattern" -ForegroundColor Red
        $failed++
    }
}

$exhibitions = Get-Content (Join-Path $root "EXHIBITIONS.md") -Raw -Encoding UTF8
if (($exhibitions -match "## 2026") -and ($exhibitions -match "## 2014")) {
    Write-Host "[OK] Exhibition years 2014-2026" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Exhibition years" -ForegroundColor Red
    $failed++
}

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "All checks passed. Ready to upload." -ForegroundColor Cyan
    exit 0
}

Write-Host ""
Write-Host "$failed check(s) failed." -ForegroundColor Red
exit 1
