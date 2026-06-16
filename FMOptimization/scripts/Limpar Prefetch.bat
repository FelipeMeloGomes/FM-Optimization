@echo off
title Limpar Prefetch
color 0a
echo Limpando pasta Prefetch...
del /s /f /q C:\Windows\Prefetch\* 2>nul
echo Prefetch limpo com sucesso!
pause