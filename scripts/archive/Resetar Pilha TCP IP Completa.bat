@echo off
title Resetar Pilha TCP/IP
color 0a
echo Resetando pilha TCP/IP...
netsh winsock reset
netsh int ip reset
ipconfig /flushdns
arp -d *
nbtstat -R
netsh int ip delete arpcache
echo Pilha TCP/IP resetada. Reinicie o computador.
pause