@echo off
title DNS - Automatico (DHCP)
color 0a
echo Restaurando DNS automatico via DHCP...
netsh interface ip set dns name="Ethernet" dhcp
netsh interface ip set dns name="Wi-Fi" dhcp
ipconfig /flushdns
echo DNS automatico restaurado com sucesso!
pause