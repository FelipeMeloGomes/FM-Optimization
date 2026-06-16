@echo off
title Relatorio de Bateria
color 0a
echo Gerando relatorio de bateria...
powercfg /batteryreport
echo Relatorio salvo na pasta atual. Abrindo...
for %%f in (battery-report.html) do start %%f
pause