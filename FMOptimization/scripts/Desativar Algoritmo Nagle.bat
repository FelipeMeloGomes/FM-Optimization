@echo off
title Desativar Algoritmo Nagle
color 0a
echo Desativando algoritmo Nagle do TCP...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces" /v TcpAckFrequency /t REG_DWORD /d 1 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces" /v TCPNoDelay /t REG_DWORD /d 1 /f
echo Algoritmo Nagle desativado! Reinicie para aplicar.
pause