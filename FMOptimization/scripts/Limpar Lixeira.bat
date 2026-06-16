@echo off
title Limpar Lixeira
color 0a
echo Esvaziando lixeira...
rd /s /q C:\$Recycle.Bin 2>nul
echo Lixeira esvaziada com sucesso!
pause