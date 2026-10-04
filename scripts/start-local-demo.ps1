param([switch]$Build)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskOutput = Join-Path $taskRoot 'output\live-voice'
New-Item -ItemType Directory -Path $taskOutput -Force | Out-Null
$taskPython = Join-Path $taskRoot 'server\.venv\Scripts\python.exe'
if (!(Test-Path -LiteralPath $taskPython)) { throw 'Install the server dependencies in server/.venv first. See docs/live-demo-guide.md.' }

function Test-DemoHttp($url, $expected) {
    try { return (Invoke-WebRequest -Uri $url -TimeoutSec 3).Content.Contains($expected) }
    catch { return $false }
}

if ($Build) {
    Push-Location (Join-Path $taskRoot 'mobile')
    try { npm run web:build; if ($LASTEXITCODE -ne 0) { throw 'Web build failed.' } }
    finally { Pop-Location }
}

if (!(Test-DemoHttp 'http://127.0.0.1:8000/api/health' 'Agora Conversational AI')) {
    $taskBackend = Start-Process -FilePath $taskPython -ArgumentList 'src/server.py' -WorkingDirectory (Join-Path $taskRoot 'server') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskOutput 'backend.stdout.log') -RedirectStandardError (Join-Path $taskOutput 'backend.stderr.log') -PassThru
    $taskBackend.Id | Set-Content (Join-Path $taskOutput 'backend.pid')
}
if (!(Test-DemoHttp 'http://127.0.0.1:5173/' 'Agora Decision Rooms')) {
    $taskNode = (Get-Command node -ErrorAction Stop).Source
    $taskWeb = Start-Process -FilePath $taskNode -ArgumentList @('node_modules/vite/bin/vite.js', '--config', 'vite.config.mts', '--host', '127.0.0.1', '--port', '5173', '--strictPort') -WorkingDirectory (Join-Path $taskRoot 'mobile') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskOutput 'web.stdout.log') -RedirectStandardError (Join-Path $taskOutput 'web.stderr.log') -PassThru
    $taskWeb.Id | Set-Content (Join-Path $taskOutput 'web.pid')
}
for ($taskTry = 0; $taskTry -lt 20; $taskTry++) {
    if ((Test-DemoHttp 'http://127.0.0.1:8000/api/health' 'Agora Conversational AI') -and (Test-DemoHttp 'http://127.0.0.1:5173/' 'Agora Decision Rooms')) { break }
    Start-Sleep -Milliseconds 500
}
if (!(Test-DemoHttp 'http://127.0.0.1:8000/api/health' 'Agora Conversational AI')) { throw 'Backend unavailable. See output/live-voice/backend.stderr.log.' }
if (!(Test-DemoHttp 'http://127.0.0.1:5173/' 'Agora Decision Rooms')) { throw 'Web app unavailable. See output/live-voice/web.stderr.log. Port 5173 must be free.' }
$taskHealth = Invoke-RestMethod 'http://127.0.0.1:8000/api/health'
Write-Output 'Laptop: http://localhost:5173'
Write-Output ('Agora project configured: ' + $taskHealth.configured)
Write-Output 'Android: connect by USB, then run scripts/connect-android-demo.ps1'
Write-Output 'In the app choose Try live voice with your people. Start one room and join its code on the other device.'
