param([string]$Serial = '', [switch]$DownloadTools)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskTools = Join-Path $taskRoot 'output\android-tools'
$taskAdb = Join-Path $taskTools 'platform-tools\adb.exe'
if (!(Test-Path -LiteralPath $taskAdb)) {
    $taskInstalledAdb = Get-Command adb -ErrorAction SilentlyContinue
    if ($taskInstalledAdb) { $taskAdb = $taskInstalledAdb.Source }
    elseif ($DownloadTools) {
        New-Item -ItemType Directory -Path $taskTools -Force | Out-Null
        Invoke-WebRequest 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip' -OutFile (Join-Path $taskTools 'platform-tools.zip') -TimeoutSec 120
        Expand-Archive -LiteralPath (Join-Path $taskTools 'platform-tools.zip') -DestinationPath $taskTools -Force
    }
    else { throw 'Android tools missing. Run again with -DownloadTools to download the official Google tools.' }
}
$taskOriginalAndroidHome = $env:ANDROID_SDK_HOME
$taskOriginalPrefsRoot = $env:ANDROID_PREFS_ROOT
try {
    # Keep any local ADB authentication files inside ignored project output.
    $env:ANDROID_SDK_HOME = Join-Path $taskTools 'user'
    $env:ANDROID_PREFS_ROOT = $env:ANDROID_SDK_HOME
    New-Item -ItemType Directory -Path $env:ANDROID_SDK_HOME -Force | Out-Null
    $taskLines = & $taskAdb devices
    if ($LASTEXITCODE -ne 0) { throw 'Could not inspect Android devices.' }
    $taskAuthorized = @($taskLines | Where-Object { $_ -match '\tdevice$' } | ForEach-Object { ($_ -split '\s+')[0] })
    if ($taskAuthorized.Count -eq 0) {
        if (@($taskLines | Where-Object { $_ -match '\tunauthorized$' }).Count) { throw 'Unlock your phone and accept its USB debugging prompt, then run this command again.' }
        throw 'No Android phone detected. Connect a data-capable USB cable and enable Developer options > USB debugging.'
    }
    if (!$Serial) {
        if ($taskAuthorized.Count -ne 1) { throw 'More than one device is connected. Pass -Serial with the intended device serial.' }
        $Serial = $taskAuthorized[0]
    }
    if ($Serial -notin $taskAuthorized) { throw 'The selected device is not connected and authorized.' }
    & $taskAdb -s $Serial reverse tcp:5173 tcp:5173 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'USB port forwarding failed.' }
    Write-Output 'Android USB connection is ready.'
    Write-Output 'Open Chrome on your phone: http://localhost:5173'
    Write-Output 'Choose Try live voice with your people > Join a room. Enter the laptop room code and allow the microphone.'
    Write-Output 'Keep the USB cable connected and internet enabled on both devices.'
}
finally {
    $env:ANDROID_SDK_HOME = $taskOriginalAndroidHome
    $env:ANDROID_PREFS_ROOT = $taskOriginalPrefsRoot
}
