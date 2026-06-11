@echo off
title Desabilitar Telemetria e Rastreamento
color 0a
echo ========================================
echo   DESABILITAR TELEMETRIA E RASTREAMENTO
echo ========================================
echo.
echo [1/8] Desabilitando servicos de telemetria...
sc config DiagTrack start= disabled
sc stop DiagTrack >nul 2>&1
sc config dmwappushservice start= disabled
sc stop dmwappushservice >nul 2>&1
sc config WMPNetworkSvc start= disabled
sc stop WMPNetworkSvc >nul 2>&1
echo   [OK] Servicos de telemetria desabilitados
echo.
echo [2/8] Configurando nivel de telemetria...
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\DataCollection" /v MaxTelemetryAllowed /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Privacy" /v TailoredExperiencesWithDiagnosticDataEnabled /t REG_DWORD /d 0 /f >nul 2>&1
echo   [OK] Nivel de telemetria configurado para 0
echo.
echo [3/8] Desabilitando rastreamento de localizacao...
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors" /v DisableLocation /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location" /v Value /t REG_SZ /d Deny /f >nul 2>&1
echo   [OK] Localizacao desabilitada
echo.
echo [4/8] Desabilitando ID de publicidade...
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\AdvertisingInfo" /v Enabled /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\AdvertisingInfo" /v LockScreenAdInfo /t REG_DWORD /d 0 /f >nul 2>&1
echo   [OK] ID de publicidade desabilitado
echo.
echo [5/8] Desabilitando sugestoes e dicas...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v SystemPaneSuggestionsEnabled /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v SubscribedContent-310093Enabled /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v SubscribedContent-338388Enabled /t REG_DWORD /d 0 /f >nul 2>&1
echo   [OK] Sugestoes desabilitadas
echo.
echo [6/8] Desabilitando inventario de dispositivos...
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\Device Metadata" /v PreventDeviceMetadataFromNetwork /t REG_DWORD /d 1 /f >nul 2>&1
echo   [OK] Inventario de dispositivos desabilitado
echo.
echo [7/8] Desabilitando pesquisas de experiencia do usuario (CEIP)...
reg add "HKLM\SOFTWARE\Policies\Microsoft\SQMClient\Windows" /v CeipLevel /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\SOFTWARE\Microsoft\SQMClient" /v WindowsCeipLevel /t REG_DWORD /d 0 /f >nul 2>&1
echo   [OK] CEIP desabilitado
echo.
echo [8/8] Bloqueando hosts de telemetria...
echo 0.0.0.0 vortex.data.microsoft.com >> %WINDIR%\System32\drivers\etc\hosts
echo 0.0.0.0 vortex-win.data.microsoft.com >> %WINDIR%\System32\drivers\etc\hosts
echo 0.0.0.0 telecommand.telemetry.microsoft.com >> %WINDIR%\System32\drivers\etc\hosts
echo 0.0.0.0 telecommand.telemetry.microsoft.com.nsatc.net >> %WINDIR%\System32\drivers\etc\hosts
echo 0.0.0.0 oca.telemetry.microsoft.com >> %WINDIR%\System32\drivers\etc\hosts
echo 0.0.0.0 oca.telemetry.microsoft.com.nsatc.net >> %WINDIR%\System32\drivers\etc\hosts
echo 0.0.0.0 sqm.telemetry.microsoft.com >> %WINDIR%\System32\drivers\etc\hosts
echo 0.0.0.0 sqm.telemetry.microsoft.com.nsatc.net >> %WINDIR%\System32\drivers\etc\hosts
echo 0.0.0.0 watson.telemetry.microsoft.com >> %WINDIR%\System32\drivers\etc\hosts
echo 0.0.0.0 watson.telemetry.microsoft.com.nsatc.net >> %WINDIR%\System32\drivers\etc\hosts
echo   [OK] Hosts de telemetria bloqueados
echo.
echo Telemetria e rastreamento desabilitados!
echo Nota: Algumas alteracoes exigem reinicializacao.
pause
