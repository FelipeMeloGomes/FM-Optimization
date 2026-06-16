@echo off
title Privacidade Maxima
color 0a
echo ========================================
echo   PRIVACIDADE MAXIMA
echo ========================================
echo.
echo [1/8] Desativando servicos de telemetria...
sc stop DiagTrack 2>nul
sc config DiagTrack start=disabled 2>nul
sc stop dmwappushservice 2>nul
sc config dmwappushservice start=disabled 2>nul
sc stop WMPNetworkSvc 2>nul
sc config WMPNetworkSvc start=disabled 2>nul
echo.
echo [2/8] Desativando localizacao...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\Location" /v Value /t REG_SZ /d Deny /f
sc stop Locationsvc 2>nul
sc config Locationsvc start=disabled 2>nul
echo.
echo [3/8] Desativando ID de anuncio...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" /v Enabled /t REG_DWORD /d 0 /f
echo.
echo [4/8] Bloqueando hosts de telemetria...
(
echo # Bloqueio de Telemetria Microsoft
echo 0.0.0.0 telemetry.microsoft.com
echo 0.0.0.0 telemetry.appex.bing.net
echo 0.0.0.0 telemetry.urs.microsoft.com
echo 0.0.0.0 vortex.data.microsoft.com
echo 0.0.0.0 vortex-win.data.microsoft.com
echo 0.0.0.0 settings-win.data.microsoft.com
echo 0.0.0.0 watson.telemetry.microsoft.com
echo 0.0.0.0 sqm.telemetry.microsoft.com
echo 0.0.0.0 oca.telemetry.microsoft.com
echo 0.0.0.0 choice.microsoft.com
echo 0.0.0.0 diagnostics.support.microsoft.com
echo 0.0.0.0 feedback.windows.com
echo 0.0.0.0 a-msedge.net
echo 0.0.0.0 ads1.msads.net
echo 0.0.0.0 ads1.msn.com
echo 0.0.0.0 bingads.microsoft.com
) >> %WINDIR%\System32\drivers\etc\hosts
echo.
echo [5/8] Desativando Cortana e Copilot...
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\Windows Search" /v AllowCortana /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v ShowCopilotButton /t REG_DWORD /d 0 /f
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsCopilot" /v TurnOffWindowsCopilot /t REG_DWORD /d 1 /f
echo.
echo [6/8] Desativando sugestoes no Iniciar...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v SubscribedContent-338388Enabled /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v SystemPaneSuggestionsEnabled /t REG_DWORD /d 0 /f
echo.
echo [7/8] Desativando Timeline...
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\System" /v EnableActivityFeed /t REG_DWORD /d 0 /f
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\System" /v PublishUserActivities /t REG_DWORD /d 0 /f
echo.
echo [8/8] Desativando reconhecimento de fala...
reg add "HKCU\Software\Microsoft\Speech_OneCore\Settings\OnlineSpeechPrivacy" /v HasAccepted /t REG_DWORD /d 0 /f
echo.
echo ========================================
echo   PRIVACIDADE MAXIMA ATIVADA!
echo   Reinicie para aplicar todas as alteracoes.
echo ========================================
pause