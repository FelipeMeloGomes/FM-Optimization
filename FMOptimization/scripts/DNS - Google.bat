@echo off
title DNS - Google
color 0a
echo Configurando DNS do Google (8.8.8.8 / 8.8.4.4)...
netsh interface ip set dns name="Ethernet" static 8.8.8.8 primary
netsh interface ip add dns name="Ethernet" 8.8.4.4 index=2
netsh interface ip set dns name="Wi-Fi" static 8.8.8.8 primary
netsh interface ip add dns name="Wi-Fi" 8.8.4.4 index=2
ipconfig /flushdns
echo DNS do Google configurado com sucesso!
pause