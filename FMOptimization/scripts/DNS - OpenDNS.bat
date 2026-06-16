@echo off
title DNS - OpenDNS
color 0a
echo Configurando DNS da OpenDNS (208.67.222.222 / 208.67.220.220)...
netsh interface ip set dns name="Ethernet" static 208.67.222.222 primary
netsh interface ip add dns name="Ethernet" 208.67.220.220 index=2
netsh interface ip set dns name="Wi-Fi" static 208.67.222.222 primary
netsh interface ip add dns name="Wi-Fi" 208.67.220.220 index=2
ipconfig /flushdns
echo DNS da OpenDNS configurado com sucesso!
pause