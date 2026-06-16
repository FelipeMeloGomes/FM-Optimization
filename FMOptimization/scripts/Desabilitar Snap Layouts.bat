@echo off
title Desabilitar Snap Layouts
color 0a
echo Desabilitando popup de Snap Layouts...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v SnapAssist /t REG_DWORD /d 0 /f
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v EnableSnapBar /t REG_DWORD /d 0 /f
echo Snap Layouts desabilitado! Reinicie o explorador.
pause