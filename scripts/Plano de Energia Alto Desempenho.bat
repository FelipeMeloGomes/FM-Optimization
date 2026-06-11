@echo off
title Plano de Energia - Alto Desempenho
color 0a
echo Ativando plano de energia Alto Desempenho...
for /f "tokens=2 delims=:(" %%a in ('powercfg /list ^| findstr /i "Alto desempenho High performance"') do set GUID=%%a
set GUID=%GUID: =%
if "%GUID%"=="" (
    echo Plano nao encontrado.
    pause
    exit /b
)
powercfg -setactive %GUID%
echo Plano de energia Alto Desempenho ativado!
pause