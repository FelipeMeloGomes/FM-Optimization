@echo off
title Pacote de Manutencao do Sistema
color 0a
echo ========================================
echo   PACOTE DE MANUTENCAO DO SISTEMA
echo ========================================
echo.
echo [1/8] Reparando imagem do Windows (DISM)...
DISM /Online /Cleanup-Image /RestoreHealth
echo.
echo [2/8] Verificando integridade (SFC)...
sfc /scannow
echo.
echo [3/8] Limpando WinSxS...
DISM /Online /Cleanup-Image /StartComponentCleanup /ResetBase
echo.
echo [4/8] Executando CleanMgr...
cleanmgr /sagerun:1
echo.
echo [5/8] Limpando pastas Temp...
del /s /f /q %temp%\* 2>nul
del /s /f /q C:\Windows\Temp\* 2>nul
echo.
echo [6/8] Limpando Prefetch...
del /s /f /q C:\Windows\Prefetch\* 2>nul
echo.
echo [7/8] Limpando logs do Windows...
wevtutil cl System 2>nul
wevtutil cl Application 2>nul
wevtutil cl Security 2>nul
echo.
echo [8/8] Executando TRIM no SSD...
defrag C: /O /L 2>nul
echo.
echo ========================================
echo   MANUTENCAO CONCLUIDA!
echo   Reinicie o computador para finalizar.
echo ========================================
pause