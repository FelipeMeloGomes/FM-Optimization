@echo off
title Turbo Game Mode
color 0a
echo ========================================
echo   TURBO GAME MODE
echo ========================================
echo.
echo [1/10] Ativando plano Ultimate Performance...
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 2>nul
powercfg -setactive e9a42b02-d5df-448d-aa00-03f14749eb61 2>nul
echo.
echo [2/10] Desativando SysMain e Windows Search...
sc stop SysMain 2>nul
sc config SysMain start=disabled 2>nul
sc stop WSearch 2>nul
sc config WSearch start=disabled 2>nul
echo.
echo [3/10] Desativando animacoes e transparencia...
reg add "HKCU\Control Panel\Desktop" /v UserPreferencesMask /t REG_BINARY /d 9032078010000000 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v EnableTransparency /t REG_DWORD /d 0 /f
echo.
echo [4/10] Ativando Game Mode e GPU Scheduling...
reg add "HKCU\Software\Microsoft\GameBar" /v AllowAutoGameMode /t REG_DWORD /d 1 /f
reg add "HKCU\Software\Microsoft\GameBar" /v AutoGameModeEnabled /t REG_DWORD /d 1 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" /v HwSchMode /t REG_DWORD /d 2 /f
echo.
echo [5/10] Desativando GameDVR...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\GameDVR" /v AppCaptureEnabled /t REG_DWORD /d 0 /f
reg add "HKCU\System\GameConfigStore" /v GameDVR_Enabled /t REG_DWORD /d 0 /f
echo.
echo [6/10] Desativando Core Parking...
powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR CPMINCORES 100
powercfg -setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR CPMINCORES 100
echo.
echo [7/10] Otimizando timer do sistema...
bcdedit /set useplatformclock true 2>nul
bcdedit /set disabledynamictick yes 2>nul
echo.
echo [8/10] Desativando Nagle TCP...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces" /v TcpAckFrequency /t REG_DWORD /d 1 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces" /v TCPNoDelay /t REG_DWORD /d 1 /f
echo.
echo [9/10] Desativando suspensao USB e economia PCIe...
powercfg -setacvalueindex SCHEME_CURRENT SUB_USB USBSELECTIVESUSPEND 0
powercfg -setdcvalueindex SCHEME_CURRENT SUB_USB USBSELECTIVESUSPEND 0
powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR ASPMPOLICY 0
powercfg -setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR ASPMPOLICY 0
echo.
echo [10/10] Aplicando configuracoes de energia...
powercfg -setactive SCHEME_CURRENT
echo.
echo ========================================
echo   TURBO GAME MODE ATIVADO!
echo   Reinicie o computador para aplicar tudo.
echo ========================================
pause