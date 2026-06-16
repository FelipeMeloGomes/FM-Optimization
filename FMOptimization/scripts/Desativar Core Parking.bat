@echo off
title Desativar Core Parking
color 0a
echo Desativando Core Parking...
powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR CPMINCORES 100
powercfg -setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR CPMINCORES 100
powercfg -setactive SCHEME_CURRENT
echo Core Parking desativado! Todos os nucleos permanecerao ativos.
pause