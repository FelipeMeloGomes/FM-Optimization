@echo off
title Otimizar DNS e Internet
color 0a
echo Otimizando conexao de internet...
ipconfig /flushdns
ipconfig /release
ipconfig /renew
netsh int ip reset
netsh winsock reset
echo Otimizacao de DNS e Internet concluida!
pause