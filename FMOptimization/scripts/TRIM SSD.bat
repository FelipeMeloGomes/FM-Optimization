@echo off
title Otimizar SSD (TRIM)
color 0a
echo Executando TRIM no SSD...
defrag C: /O /L
echo TRIM executado com sucesso!
pause