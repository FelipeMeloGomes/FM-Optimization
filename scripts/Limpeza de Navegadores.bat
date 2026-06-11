@echo off
title Limpeza de Navegadores
color 0a
echo ========================================
echo   LIMPEZA DE NAVEGADORES
echo ========================================
echo.
echo Fechando navegadores para limpeza...
taskkill /f /im chrome.exe >nul 2>&1
taskkill /f /im msedge.exe >nul 2>&1
taskkill /f /im firefox.exe >nul 2>&1
echo.
echo [1/3] Limpando Chrome...
del /s /f /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache\*" >nul 2>&1
del /s /f /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Code Cache\*" >nul 2>&1
echo   [OK] Chrome cache limpo
echo.
echo [2/3] Limpando Edge...
del /s /f /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache\*" >nul 2>&1
del /s /f /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Code Cache\*" >nul 2>&1
echo   [OK] Edge cache limpo
echo.
echo [3/3] Limpando Firefox...
del /s /f /q "%APPDATA%\Mozilla\Firefox\Profiles\*\cache2\*" >nul 2>&1
del /s /f /q "%APPDATA%\Mozilla\Firefox\Profiles\*\offlinecache\*" >nul 2>&1
echo   [OK] Firefox cache limpo
echo.
echo Cache dos navegadores limpo com sucesso!
pause
