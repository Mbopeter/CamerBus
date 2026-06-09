# ============================================================
#  CamerBus — One-Click Startup Script
#  Run this every time you turn on your PC or reconnect WiFi
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CamerBus — Starting All Services    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Get current local IP ─────────────────────────────────
$ip = (Get-NetIPAddress -AddressFamily IPv4 |
       Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" -and $_.PrefixOrigin -eq "Dhcp" } |
       Select-Object -First 1).IPAddress

if (-not $ip) {
    # Fallback: grab first non-loopback IPv4
    $ip = (Get-NetIPAddress -AddressFamily IPv4 |
           Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" } |
           Select-Object -First 1).IPAddress
}

Write-Host "✅ Detected IP: $ip" -ForegroundColor Green

# ── 2. Update app.json with current IP ──────────────────────
$appJsonPath = "$PSScriptRoot\mobile\app.json"
$appJson = Get-Content $appJsonPath -Raw
$appJson = $appJson -replace '"API_BASE_URL":\s*"http://[^"]*"', "`"API_BASE_URL`": `"http://${ip}:8000`""
Set-Content $appJsonPath $appJson
Write-Host "✅ Updated mobile/app.json → http://${ip}:8000" -ForegroundColor Green

# ── 3. Start XAMPP MySQL (if not already running) ───────────
$mysql = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue
if (-not $mysql) {
    Write-Host "▶  Starting MySQL..." -ForegroundColor Yellow
    Start-Process "C:\xampp\mysql\bin\mysqld.exe" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "✅ MySQL started" -ForegroundColor Green
} else {
    Write-Host "✅ MySQL already running" -ForegroundColor Green
}

# ── 4. Start PHP Backend (port 8000) ────────────────────────
Write-Host "▶  Starting PHP Backend on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PSScriptRoot\backend'; Write-Host 'PHP Backend running on http://${ip}:8000' -ForegroundColor Cyan; C:\xampp\php\php.exe -S 0.0.0.0:8000" `
    -WindowStyle Normal

Start-Sleep -Seconds 2

# ── 5. Start Admin Web (Vite, port 5173) ────────────────────
Write-Host "▶  Starting Admin Web on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PSScriptRoot\admin-web'; Write-Host 'Admin Web running at http://localhost:5173' -ForegroundColor Cyan; npm run dev" `
    -WindowStyle Normal

Start-Sleep -Seconds 2

# ── 6. Start Client Web (Vite, port 5174) ────────────────────
Write-Host "▶  Starting Client Web on http://localhost:5174..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PSScriptRoot\client-web'; Write-Host 'Client Web running at http://localhost:5174' -ForegroundColor Cyan; npm run dev" `
    -WindowStyle Normal

Start-Sleep -Seconds 2

# ── 7. Start Expo (Mobile App) ──────────────────────────────
Write-Host "▶  Starting Expo (Mobile App)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PSScriptRoot\mobile'; Write-Host 'Expo starting...' -ForegroundColor Cyan; npx expo start --offline" `
    -WindowStyle Normal

# ── Done ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   All services are starting!          " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend API  →  http://${ip}:8000" -ForegroundColor White
Write-Host "  Admin Panel  →  http://localhost:5173" -ForegroundColor White
Write-Host "  Client Web   →  http://localhost:5174" -ForegroundColor White
Write-Host "  Mobile App   →  Scan QR in Expo window" -ForegroundColor White
Write-Host ""
Write-Host "  Admin Login:" -ForegroundColor Gray
Write-Host "    Email:    admin@camerbus.cm" -ForegroundColor Gray
Write-Host "    Password: password123" -ForegroundColor Gray
Write-Host ""
