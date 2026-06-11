@echo off
title Otimizar Efeitos Visuais
color 0a
echo ========================================
echo   OTIMIZAR EFEITOS VISUAIS
echo ========================================
echo.
echo Aplicando ajustes de desempenho visual...
echo.
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v EnableTransparency /t REG_DWORD /d 0 /f >nul 2>&1
echo   [OK] Desabilitar transparencia
reg add "HKCU\Software\Microsoft\Windows\DWM" /v EnableAeroPeek /t REG_DWORD /d 0 /f >nul 2>&1
echo   [OK] Desabilitar Aero Peek
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarAnimations /t REG_DWORD /d 0 /f >nul 2>&1
echo   [OK] Desabilitar animacoes da barra de tarefas
reg add "HKCU\Control Panel\Desktop" /v UserPreferencesMask /t REG_BINARY /d 9032078010000000 /f >nul 2>&1
echo   [OK] Ajustar efeitos visuais (melhor desempenho)
reg add "HKCU\Control Panel\Desktop" /v MenuShowDelay /t REG_SZ /d 0 /f >nul 2>&1
echo   [OK] Acelerar menus
reg add "HKCU\Control Panel\Desktop" /v AutoEndTasks /t REG_SZ /d 1 /f >nul 2>&1
echo   [OK] Finalizar tarefas automaticamente
reg add "HKCU\Control Panel\Desktop" /v WaitToKillAppTimeout /t REG_SZ /d 3000 /f >nul 2>&1
echo   [OK] Reduzir timeout de fechamento
reg add "HKCU\Control Panel\Desktop" /v HungAppTimeout /t REG_SZ /d 3000 /f >nul 2>&1
echo   [OK] Reduzir timeout de travamento
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer" /v ShowSyncProviderNotifications /t REG_DWORD /d 0 /f >nul 2>&1
echo   [OK] Remover notificacoes de sincronizacao
echo.
echo Efeitos visuais otimizados!
echo Nota: E necessario reiniciar para aplicar todas as alteracoes.
pause
