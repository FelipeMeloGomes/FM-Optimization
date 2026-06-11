@echo off
title Network Reset Completo
color 0a
echo ========================================
echo   NETWORK RESET COMPLETO
echo ========================================
echo.
echo [1/8] Resetando Winsock...
netsh winsock reset >nul 2>&1
echo   [OK] Winsock resetado
echo.
echo [2/8] Resetando pilha TCP/IP...
netsh int ip reset >nul 2>&1
netsh int ipv6 reset >nul 2>&1
echo   [OK] Pilha TCP/IP resetada
echo.
echo [3/8] Resetando WinHTTP...
netsh winhttp reset proxy >nul 2>&1
echo   [OK] WinHTTP resetado
echo.
echo [4/8] Resetando Firewall...
netsh advfirewall reset >nul 2>&1
echo   [OK] Firewall resetado
echo.
echo [5/8] Resetando cache DNS...
ipconfig /flushdns >nul 2>&1
echo   [OK] Cache DNS limpo
echo.
echo [6/8] Renovando IP...
ipconfig /release >nul 2>&1
ipconfig /renew >nul 2>&1
echo   [OK] IP renovado
echo.
echo [7/8] Resetando configuracoes de rede...
netsh int ip set dns >nul 2>&1
netsh int ip set dns >nul 2>&1
echo   [OK] Configuracoes de rede resetadas
echo.
echo [8/8] Parando e reiniciando adaptadores...
wmic path Win32_NetworkAdapter where "NetEnabled=True" call Disable >nul 2>&1
timeout /t 3 /nobreak >nul
wmic path Win32_NetworkAdapter where "NetEnabled=False" call Enable >nul 2>&1
echo   [OK] Adaptadores reiniciados
echo.
echo ========================================
echo   NETWORK RESET CONCLUIDO!
echo ========================================
echo.
echo Nota: Talvez seja necessario reiniciar o computador.
pause
