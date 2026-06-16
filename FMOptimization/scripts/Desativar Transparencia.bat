@echo off
title Desativar Transparencia
color 0a
echo Desativando efeitos de transparencia...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v EnableTransparency /t REG_DWORD /d 0 /f
echo Transparencia desativada! Reinicie o explorer ou faca logoff.
pause