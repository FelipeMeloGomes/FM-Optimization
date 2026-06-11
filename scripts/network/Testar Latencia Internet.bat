@echo off
title Teste de Latencia
color 0a
echo Testando latencia da internet...
echo.
echo Cloudflare (1.1.1.1):
ping -n 4 1.1.1.1
echo.
echo Google (8.8.8.8):
ping -n 4 8.8.8.8
echo.
pause