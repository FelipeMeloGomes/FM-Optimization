@echo off
title Restaurar Menu Contexto Classico
color 0a
echo Restaurando menu de contexto classico do Windows 10...
reg add "HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32" /f
echo Menu classico restaurado! Reinicie o explorador ou faca logoff.
pause