@echo off
title Desativar Localizacao
color 0a
echo Desativando servico de localizacao...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\Location" /v Value /t REG_SZ /d Deny /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\Location" /v Value /t REG_SZ /d Deny /f
sc stop Locationsvc 2>nul
sc config Locationsvc start=disabled
echo Localizacao desativada com sucesso!
pause