# Deploy เว็บ Who Am I ไป Vercel (รันหลัง npx vercel login แล้ว)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$env:NEXT_PUBLIC_PARTYKIT_HOST = "who-am-i-party.stargog.partykit.dev"

Write-Host "PartyKit host: $env:NEXT_PUBLIC_PARTYKIT_HOST" -ForegroundColor Cyan
Write-Host "กำลัง deploy ไป Vercel..." -ForegroundColor Yellow

npx vercel deploy --prod --yes `
  --env "NEXT_PUBLIC_PARTYKIT_HOST=$env:NEXT_PUBLIC_PARTYKIT_HOST"

Write-Host ""
Write-Host "เสร็จแล้ว! เปิด URL ด้านบน แล้วแชร์ลิงก์ห้องให้เพื่อนได้เลย" -ForegroundColor Green
