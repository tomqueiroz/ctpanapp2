param(
    [string]$SourceDirectory = "C:\CTPANAPP\incoming",
    [string]$GatewayDirectory = "C:\CTPANAPP\erede-gateway",
    [string]$CaddyDirectory = "C:\CTPANAPP\caddy"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$nodeVersion = "v24.19.0"
$nodeInstaller = Join-Path $env:TEMP "node-$nodeVersion-x64.msi"
$nodeExecutable = "C:\Program Files\nodejs\node.exe"

if (-not (Test-Path $nodeExecutable)) {
    Invoke-WebRequest `
        -Uri "https://nodejs.org/dist/$nodeVersion/node-$nodeVersion-x64.msi" `
        -OutFile $nodeInstaller `
        -UseBasicParsing
    $process = Start-Process msiexec.exe `
        -ArgumentList @("/i", "`"$nodeInstaller`"", "/qn", "/norestart") `
        -Wait `
        -PassThru
    if ($process.ExitCode -ne 0) {
        throw "Node.js installation failed with exit code $($process.ExitCode)"
    }
}

New-Item -ItemType Directory -Path $GatewayDirectory -Force | Out-Null
New-Item -ItemType Directory -Path $CaddyDirectory -Force | Out-Null
New-Item -ItemType Directory -Path "C:\ProgramData\CTPANAPP" -Force | Out-Null

Copy-Item `
    -Path (Join-Path $SourceDirectory "server.mjs") `
    -Destination (Join-Path $GatewayDirectory "server.mjs") `
    -Force
Copy-Item `
    -Path (Join-Path $SourceDirectory "Caddyfile") `
    -Destination (Join-Path $CaddyDirectory "Caddyfile") `
    -Force

$caddyExecutable = Join-Path $CaddyDirectory "caddy.exe"
if (-not (Test-Path $caddyExecutable)) {
    Invoke-WebRequest `
        -Uri "https://caddyserver.com/api/download?os=windows&arch=amd64" `
        -OutFile $caddyExecutable `
        -UseBasicParsing
}

& $caddyExecutable validate `
    --config (Join-Path $CaddyDirectory "Caddyfile") `
    --adapter caddyfile
if ($LASTEXITCODE -ne 0) {
    throw "Caddy configuration validation failed"
}

$principal = New-ScheduledTaskPrincipal `
    -UserId "SYSTEM" `
    -LogonType ServiceAccount `
    -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -RestartCount 999 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -StartWhenAvailable
$startupTrigger = New-ScheduledTaskTrigger -AtStartup

$gatewayAction = New-ScheduledTaskAction `
    -Execute $nodeExecutable `
    -Argument "`"$GatewayDirectory\server.mjs`"" `
    -WorkingDirectory $GatewayDirectory
Register-ScheduledTask `
    -TaskName "CTP-ANAPP-eRede-Gateway" `
    -Action $gatewayAction `
    -Trigger $startupTrigger `
    -Principal $principal `
    -Settings $settings `
    -Force | Out-Null

$caddyAction = New-ScheduledTaskAction `
    -Execute $caddyExecutable `
    -Argument "run --config `"$CaddyDirectory\Caddyfile`" --adapter caddyfile" `
    -WorkingDirectory $CaddyDirectory
Register-ScheduledTask `
    -TaskName "CTP-ANAPP-Caddy" `
    -Action $caddyAction `
    -Trigger $startupTrigger `
    -Principal $principal `
    -Settings $settings `
    -Force | Out-Null

if (-not (Get-NetFirewallRule -DisplayName "CTP ANAPP HTTPS Gateway" -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule `
        -DisplayName "CTP ANAPP HTTPS Gateway" `
        -Direction Inbound `
        -Action Allow `
        -Protocol TCP `
        -LocalPort 443 | Out-Null
}
if (-not (Get-NetFirewallRule -DisplayName "CTP ANAPP HTTP ACME" -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule `
        -DisplayName "CTP ANAPP HTTP ACME" `
        -Direction Inbound `
        -Action Allow `
        -Protocol TCP `
        -LocalPort 80 | Out-Null
}

Start-ScheduledTask -TaskName "CTP-ANAPP-eRede-Gateway"
Start-Sleep -Seconds 2
Start-ScheduledTask -TaskName "CTP-ANAPP-Caddy"

Write-Output "INSTALLATION_OK"
