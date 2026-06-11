@echo off
title Limpeza Completa do Sistema
color 0a
echo ========================================
echo   LIMPEZA COMPLETA DO SISTEMA
echo ========================================
echo.
echo [1/9] Parando servicos...
net stop wuauserv >nul 2>&1
net stop UsoSvc >nul 2>&1
echo   [OK] Servicos pausados
echo.
echo [2/9] Limpando Prefetch...
del /s /f /q C:\Windows\Prefetch\* 2>nul
echo   [OK] Prefetch limpo
echo.
echo [3/9] Limpando SoftwareDistribution...
del /s /f /q C:\Windows\SoftwareDistribution\Download\* 2>nul
echo   [OK] Cache de atualizacao limpo
echo.
echo [4/9] Limpando Lixeira...
powershell -NoProfile -Command "Clear-RecycleBin -Confirm:$false" >nul 2>&1
echo   [OK] Lixeira esvaziada
echo.
echo [5/9] Executando CleanMgr...
cleanmgr /sagerun:1 >nul 2>&1
echo   [OK] CleanMgr executado
echo.
echo [6/9] Limpando logs do Windows...
wevtutil cl System >nul 2>&1
wevtutil cl Application >nul 2>&1
wevtutil cl Security >nul 2>&1
echo   [OK] Logs do Windows limpos
echo.
echo [7/9] Limpando cache DNS...
ipconfig /flushdns >nul 2>&1
echo   [OK] DNS cache limpo
echo.
echo [8/9] Limpando caches .NET...
powershell -NoProfile -Command "& {[System.Runtime.InteropServices.Marshal]::ReleaseComObject([System.IO.Directory]::CreateDirectory('C:\Windows\Microsoft.NET\Framework\v4.0.30319\Temporary ASP.NET Files\'))}" >nul 2>&1
del /s /f /q "%WINDIR%\Microsoft.NET\Framework\*\Temporary ASP.NET Files\*" 2>nul
del /s /f /q "%WINDIR%\Microsoft.NET\Framework64\*\Temporary ASP.NET Files\*" 2>nul
echo   [OK] Cache .NET limpo
echo.
echo [9/9] Executando DISM cleanup...
DISM /Online /Cleanup-Image /StartComponentCleanup >nul 2>&1
echo   [OK] DISM cleanup concluido
echo.
echo ========================================
echo   LIMPEZA COMPLETA FINALIZADA!
echo ========================================
pause
