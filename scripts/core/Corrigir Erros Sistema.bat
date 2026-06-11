@echo off
title Corrigir Erros do Sistema
color 0a
echo Verificando integridade do sistema...
sfc /scannow
echo.
echo Verificando imagem do sistema...
DISM /Online /Cleanup-Image /RestoreHealth
echo Verificacao concluida!
pause