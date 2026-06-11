@echo off
title Relatorio do Sistema
color 0a
set OUTPUT=%USERPROFILE%\Desktop\Relatorio_Sistema_%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%.txt
echo ========================================
echo   RELATORIO DO SISTEMA
echo ========================================
echo.
echo Gerando relatorio, aguarde...
echo ===== RELATORIO DO SISTEMA ===== > "%OUTPUT%"
echo Data: %DATE% %TIME% >> "%OUTPUT%"
echo. >> "%OUTPUT%"
echo ----- INFORMACOES DO SISTEMA ----- >> "%OUTPUT%"
systeminfo >> "%OUTPUT%" 2>&1
echo. >> "%OUTPUT%"
echo ----- UNIDADES DE DISCO ----- >> "%OUTPUT%"
wmic logicaldisk get size,freespace,caption,volumename >> "%OUTPUT%" 2>&1
echo. >> "%OUTPUT%"
echo ----- PROCESSOS EM EXECUCAO ----- >> "%OUTPUT%"
tasklist >> "%OUTPUT%" 2>&1
echo. >> "%OUTPUT%"
echo ----- SERVICOS EM EXECUCAO ----- >> "%OUTPUT%"
sc query state= all >> "%OUTPUT%" 2>&1
echo. >> "%OUTPUT%"
echo ----- VARIAVEIS DE AMBIENTE ----- >> "%OUTPUT%"
set >> "%OUTPUT%" 2>&1
echo. >> "%OUTPUT%"
echo ----- RELATORIO DE BATERIA ----- >> "%OUTPUT%"
powercfg /batteryreport 2>&1
for %%f in (battery-report.html) do set BATREPORT=%%f
echo Relatorio de bateria salvo em: %cd%\battery-report.html >> "%OUTPUT%" 2>&1
echo. >> "%OUTPUT%"
echo Relatorio salvo em:
echo %OUTPUT%
echo.
echo Relatorio de bateria: battery-report.html
pause
