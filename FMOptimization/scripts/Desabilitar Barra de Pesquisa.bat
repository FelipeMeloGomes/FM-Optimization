@echo off
title Desabilitar Barra de Pesquisa
color 0a
echo Alterando pesquisa para modo icone...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Search" /v SearchboxTaskbarMode /t REG_DWORD /d 1 /f
echo Barra de pesquisa alterada para modo icone! Reinicie o explorador.
pause