@echo off
title Limpeza WinSxS - Componentes do Windows
color 0a
echo ========================================
echo   LIMPEZA WinSxS E COMPONENTES
echo ========================================
echo.
echo [1/4] Analisando tamanho do WinSxS...
DISM /Online /Cleanup-Image /AnalyzeComponentStore
echo.
echo [2/4] Limpando componentes antigos...
DISM /Online /Cleanup-Image /StartComponentCleanup
echo.
echo [3/4] Removendo versoes anteriores...
DISM /Online /Cleanup-Image /StartComponentCleanup /ResetBase
echo.
echo [4/4] Compactando sistema...
Compact /CompactOS:always
echo.
echo Limpeza de componentes concluida!
pause
