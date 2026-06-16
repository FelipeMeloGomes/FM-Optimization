@echo off
title DNS - AdGuard
color 0a
echo Configurando DNS do AdGuard (94.140.14.14 / 94.140.15.15)...
netsh interface ip set dns name="Ethernet" static 94.140.14.14 primary
netsh interface ip add dns name="Ethernet" 94.140.15.15 index=2
netsh interface ip set dns name="Wi-Fi" static 94.140.14.14 primary
netsh interface ip add dns name="Wi-Fi" 94.140.15.15 index=2
ipconfig /flushdns
echo DNS do AdGuard configurado com sucesso!
pause