@echo off
title Otimizacao TCP/IP Avancada
color 0a
echo Aplicando ajustes avancados de TCP/IP...
netsh int tcp set global rsc=disabled
netsh int tcp set global timestamps=disabled
netsh int tcp set global chimney=disabled
netsh int tcp set global rss=enabled
netsh int tcp set global ecn=enabled
netsh int tcp set global autotuninglevel=normal
netsh int tcp set global congestionprovider=ctcp
netsh int tcp set global dca=enabled
netsh int tcp set heuristics disabled
netsh interface ip delete arpcache
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v DefaultTTL /t REG_DWORD /d 64 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v MaxUserPort /t REG_DWORD /d 65534 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v TcpTimedWaitDelay /t REG_DWORD /d 30 /f
echo Ajustes TCP/IP avancados aplicados com sucesso!
pause