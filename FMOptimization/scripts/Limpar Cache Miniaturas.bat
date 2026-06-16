@echo off
title Limpar Cache de Miniaturas
color 0a
echo Limpando cache de miniaturas...
del /s /f /q "%localappdata%\Microsoft\Windows\Explorer\thumbcache_*.db" 2>nul
echo Cache de miniaturas limpo com sucesso!
pause