@echo off
title Acelerar Inicializacao
color 0a
echo Desativando servicos desnecessarios...
sc stop "DiagTrack"
sc config "DiagTrack" start=disabled
sc stop "SysMain"
sc config "SysMain" start=disabled
echo Servicos desnecessarios desativados!
pause