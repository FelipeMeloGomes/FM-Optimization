@echo off
title Benchmark de DNS
color 0a
echo ========================================
echo   BENCHMARK DE DNS - TESTE DE LATENCIA
echo ========================================
echo.
echo Google (8.8.8.8):
ping -n 4 8.8.8.8 | find "media"
echo.
echo Cloudflare (1.1.1.1):
ping -n 4 1.1.1.1 | find "media"
echo.
echo OpenDNS (208.67.222.222):
ping -n 4 208.67.222.222 | find "media"
echo.
echo Quad9 (9.9.9.9):
ping -n 4 9.9.9.9 | find "media"
echo.
echo AdGuard (94.140.14.14):
ping -n 4 94.140.14.14 | find "media"
echo.
echo ========================================
echo   Quanto menor o tempo, melhor.
pause