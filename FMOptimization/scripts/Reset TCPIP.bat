@echo off
title Reset TCP/IP
color 0a
echo Redefinindo pilha TCP/IP...
netsh int ip reset
echo Pilha TCP/IP redefinida. Reinicie o computador para aplicar.
pause