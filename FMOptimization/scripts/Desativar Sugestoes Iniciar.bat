@echo off
title Desativar Sugestoes no Iniciar
color 0a
echo Removendo sugestoes do menu Iniciar...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v SubscribedContent-338388Enabled /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v SystemPaneSuggestionsEnabled /t REG_DWORD /d 0 /f
echo Sugestoes do Iniciar desativadas!
pause