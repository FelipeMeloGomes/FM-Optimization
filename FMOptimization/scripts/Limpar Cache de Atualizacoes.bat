@echo off
title Limpar Cache de Atualizacoes
color 0a
echo Parando servicos de Windows Update...
net stop wuauserv 2>nul
net stop UsoSvc 2>nul
echo Limpando cache de atualizacoes...
del /s /f /q C:\Windows\SoftwareDistribution\Download\* 2>nul
echo Reiniciando servicos...
net start wuauserv 2>nul
net start UsoSvc 2>nul
echo Cache de atualizacoes limpo com sucesso!
pause