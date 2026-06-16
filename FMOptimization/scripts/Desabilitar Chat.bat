@echo off
title Desabilitar Chat (Teams)
color 0a
echo Removendo botao de Chat da barra de tarefas...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarMn /t REG_DWORD /d 0 /f
echo Chat removido da barra de tarefas! Reinicie o explorador.
pause