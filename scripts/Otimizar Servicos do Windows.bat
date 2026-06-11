@echo off
title Otimizar Servicos do Windows
color 0a
echo ========================================
echo   OTIMIZAR SERVICOS DO WINDOWS
echo ========================================
echo.
echo Desabilitando servicos desnecessarios...
echo.
sc config SysMain start= disabled
sc stop SysMain >nul 2>&1
echo   [OK] SysMain (Superfetch)
sc config WSearch start= disabled
sc stop WSearch >nul 2>&1
echo   [OK] Windows Search
sc config wuauserv start= demand
echo   [OK] Windows Update (manual)
sc config DiagTrack start= disabled
sc stop DiagTrack >nul 2>&1
echo   [OK] Telemetria (DiagTrack)
sc config dmwappushservice start= disabled
sc stop dmwappushservice >nul 2>&1
echo   [OK] DMWAppPush
sc config RemoteRegistry start= disabled
sc stop RemoteRegistry >nul 2>&1
echo   [OK] Remote Registry
sc config TabletInputService start= disabled
sc stop TabletInputService >nul 2>&1
echo   [OK] Touch Keyboard
sc config WbioSrvc start= disabled
sc stop WbioSrvc >nul 2>&1
echo   [OK] Windows Biometric
sc config MapsBroker start= disabled
sc stop MapsBroker >nul 2>&1
echo   [OK] Downloaded Maps
sc config lfsvc start= disabled
sc stop lfsvc >nul 2>&1
echo   [OK] Geolocation
sc config wcncsvc start= disabled
sc stop wcncsvc >nul 2>&1
echo   [OK] Windows Connect Now
sc config PcaSvc start= disabled
sc stop PcaSvc >nul 2>&1
echo   [OK] Program Compatibility
sc config RetailDemo start= disabled
sc stop RetailDemo >nul 2>&1
echo   [OK] Retail Demo
echo.
echo Servicos otimizados com sucesso!
echo Nota: Para reverter, use modo seguro e sc config [nome] start= auto
pause
