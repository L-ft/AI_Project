# 构建前端并重新部署 Docker 容器
# 解决 Windows PowerShell 中文乱码：强制 UTF-8 输出
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"
$env:LANG = "en_US.UTF-8"
chcp 65001 | Out-Null

Write-Host "==> 构建前端..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "构建失败!" -ForegroundColor Red; exit 1 }

Write-Host "==> 重启前端容器..." -ForegroundColor Cyan
Set-Location $PSScriptRoot
docker compose stop frontend_final
docker compose rm -f frontend_final
docker compose up -d --build frontend_final

Write-Host "==> 完成!" -ForegroundColor Green
docker ps --filter name=ai_platform_fe_v1 --format "table {{.Names}}`t{{.Status}}"
