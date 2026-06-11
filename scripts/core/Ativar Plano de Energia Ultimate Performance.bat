@echo off
title Ativar Plano de Energia Ultimate Performance
color 17
cls

echo.
echo  Ativando plano de energia Ultimate Performance...
echo.

powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 >nul 2>&1

powercfg -setactive e9a42b02-d5df-448d-aa00-03f14749eb61

if %errorlevel% equ 0 (
    echo  Plano de energia Ultimate Performance ativado com sucesso!
) else (
    echo  Erro ao ativar o plano de energia.
    echo  Tente executar como Administrador.
)

echo.
pause
