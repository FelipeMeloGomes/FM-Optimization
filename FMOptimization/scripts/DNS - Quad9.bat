@echo off
title DNS - Quad9
color 0a
echo Configurando DNS da Quad9 (9.9.9.9 / 149.112.112.112)...
netsh interface ip set dns name="Ethernet" static 9.9.9.9 primary
netsh interface ip add dns name="Ethernet" 149.112.112.112 index=2
netsh interface ip set dns name="Wi-Fi" static 9.9.9.9 primary
netsh interface ip add dns name="Wi-Fi" 149.112.112.112 index=2
ipconfig /flushdns
echo DNS da Quad9 configurado com sucesso!
pause