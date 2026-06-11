@echo off
title Otimizacao para Jogos
color 0a
echo ========================================
echo   OTIMIZACAO PARA JOGOS
echo ========================================
echo.
echo Aplicando otimizacoes de jogos...
echo.
reg add "HKCU\Software\Microsoft\GameBar" /v AllowAutoGameMode /t REG_DWORD /d 1 /f >nul 2>&1
echo   [OK] Auto Game Mode
reg add "HKCU\Software\Microsoft\GameBar" /v AutoGameModeEnabled /t REG_DWORD /d 1 /f >nul 2>&1
echo   [OK] Game Mode habilitado
reg add "HKLM\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" /v HwSchMode /t REG_DWORD /d 2 /f >nul 2>&1
echo   [OK] Hardware GPU Scheduling
reg add "HKCU\System\GameConfigStore" /v GameDVR_FSEBehaviorMode /t REG_DWORD /d 2 /f >nul 2>&1
echo   [OK] GameDVR modo fullscreen
reg add "HKCU\System\GameConfigStore" /v GameDVR_HonorUserFSEBehaviorMode /t REG_DWORD /d 1 /f >nul 2>&1
echo   [OK] GameDVR respeitar fullscreen
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\GameDVR" /v AppCaptureEnabled /t REG_DWORD /d 0 /f >nul 2>&1
echo   [OK] Desabilitar captura de tela GameDVR
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\GameDVR" /v AudioCaptureEnabled /t REG_DWORD /d 0 /f >nul 2>&1
echo   [OK] Desabilitar captura de audio GameDVR
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v LargeSystemCache /t REG_DWORD /d 0 /f >nul 2>&1
echo   [OK] Desabilitar Large System Cache
reg add "HKLM\SYSTEM\CurrentControlSet\Services\LanmanServer\Parameters" /v IRPStackSize /t REG_DWORD /d 32 /f >nul 2>&1
echo   [OK] Aumentar IRPStackSize
bcdedit /set disabledynamictick yes >nul 2>&1
echo   [OK] HPET - Dynamic Tick desabilitado
bcdedit /set useplatformclock false >nul 2>&1
echo   [OK] HPET - Platform Clock desabilitado
bcdedit /set tscsyncpolicy enhanced >nul 2>&1
echo   [OK] TSC Sync Policy
powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c >nul 2>&1
echo   [OK] Plano de energia Alto Desempenho
echo.
echo Otimizacoes para jogos aplicadas!
echo Reinicie o computador para que todas as alteracoes entrem em vigor.
pause
