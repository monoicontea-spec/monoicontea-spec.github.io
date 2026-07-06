param(
    [Parameter(Mandatory = $true)]
    [string]$Username
)

$ErrorActionPreference = "Stop"

$gitPaths = @(
    "C:\Program Files\Git\bin",
    "C:\Program Files\Git\cmd",
    "C:\Program Files\GitHub CLI"
)
$env:Path = ($gitPaths -join ";") + ";" + $env:Path

$repoRoot = $PSScriptRoot
Set-Location $repoRoot

Write-Host "Checking GitHub authentication..." -ForegroundColor Cyan
gh auth status | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub CLI is not logged in. Run: gh auth login" -ForegroundColor Red
    exit 1
}

$readmePath = Join-Path $repoRoot "README.md"
$content = Get-Content $readmePath -Raw -Encoding UTF8
if ($content -match "GITHUB_USERNAME") {
    $content = $content -replace "GITHUB_USERNAME", $Username
    Set-Content -Path $readmePath -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Updated profile image URL with username: $Username" -ForegroundColor Green
}

Write-Host "Creating repository $Username/$Username (if not exists)..." -ForegroundColor Cyan
gh repo view "$Username/$Username" 2>$null
if ($LASTEXITCODE -ne 0) {
    gh repo create $Username --public --description "GitHub Profile README - Yook Ho Joon"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create repository. Ensure the name matches your GitHub username." -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path ".git")) {
    git init
    git branch -M main
}

git remote remove origin 2>$null
git remote add origin "https://github.com/$Username/$Username.git"

git add README.md EXHIBITIONS.md UPLOAD.md
git commit -m "Add bilingual GitHub profile README for Yook Ho Joon" 2>$null
if ($LASTEXITCODE -ne 0) {
    git add -A
    git commit -m "Update GitHub profile README"
}

git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Success! View your profile at:" -ForegroundColor Green
    Write-Host "  https://github.com/$Username" -ForegroundColor Yellow
} else {
    Write-Host "Push failed. Check credentials and repository name." -ForegroundColor Red
    exit 1
}
