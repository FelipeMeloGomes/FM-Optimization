@echo off
title Desativar Windows Search
color 0a
echo Desativando servico Windows Search...
sc stop WSearch 2>nul
sc config WSearch start=disabled
echo Windows Search desativado com sucesso!
pause