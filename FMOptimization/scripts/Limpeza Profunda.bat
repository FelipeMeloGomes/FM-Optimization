@echo off
title Limpeza Profunda do Sistema
color 0a
echo ========================================
echo   LIMPEZA PROFUNDA DO SISTEMA
echo ========================================
echo.
echo [1/9] Limpando pastas Temp...
del /s /f /q %temp%\* 2>nul
del /s /f /q C:\Windows\Temp\* 2>nul
echo.
echo [2/9] Limpando Prefetch...
del /s /f /q C:\Windows\Prefetch\* 2>nul
echo.
echo [3/9] Esvaziando Lixeira...
rd /s /q C:\$Recycle.Bin 2>nul
echo.
echo [4/9] Limpando cache da Windows Store...
wsreset.exe 2>nul
echo.
echo [5/9] Limpando cache de miniaturas...
del /s /f /q "%localappdata%\Microsoft\Windows\Explorer\thumbcache_*.db" 2>nul
echo.
echo [6/9] Limpando cache de atualizacoes...
net stop wuauserv 2>nul
net stop UsoSvc 2>nul
del /s /f /q C:\Windows\SoftwareDistribution\Download\* 2>nul
net start wuauserv 2>nul
net start UsoSvc 2>nul
echo.
echo [7/9] Limpando cache de navegadores...
taskkill /f /im chrome.exe 2>nul
taskkill /f /im msedge.exe 2>nul
taskkill /f /im firefox.exe 2>nul
del /s /f /q "%localappdata%\Google\Chrome\User Data\Default\Cache\*" 2>nul
del /s /f /q "%localappdata%\Microsoft\Edge\User Data\Default\Cache\*" 2>nul
del /s /f /q "%appdata%\Mozilla\Firefox\Profiles\*\cache2\*" 2>nul
echo.
echo [8/9] Limpando cache DirectX Shader...
del /s /f /q "%appdata%\..\Local\D3DSCache\*" 2>nul
echo.
echo [9/9] Limpando logs do Windows...
wevtutil cl System 2>nul
wevtutil cl Application 2>nul
wevtutil cl Security 2>nul
echo.
echo ========================================
echo   LIMPEZA PROFUNDA CONCLUIDA!
echo   Espaco em disco liberado.
echo ========================================
pause