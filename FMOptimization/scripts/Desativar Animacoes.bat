@echo off
title Desativar Animacoes
color 0a
echo Desativando animacoes da interface...
reg add "HKCU\Control Panel\Desktop" /v UserPreferencesMask /t REG_BINARY /d 9032078010000000 /f
echo Animacoes desativadas! Faca logoff ou reinicie para aplicar.
pause