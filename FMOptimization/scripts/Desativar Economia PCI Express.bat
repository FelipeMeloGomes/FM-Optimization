@echo off
title Desativar Economia PCI Express
color 0a
echo Desativando economia de energia PCI Express...
powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR ASPMPOLICY 0
powercfg -setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR ASPMPOLICY 0
powercfg -setactive SCHEME_CURRENT
echo Economia PCI Express desativada com sucesso!
pause