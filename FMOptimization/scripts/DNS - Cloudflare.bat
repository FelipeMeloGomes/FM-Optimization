@echo off
title DNS - Cloudflare
color 0a
echo Configurando DNS da Cloudflare (1.1.1.1 / 1.0.0.1)...
netsh interface ip set dns name="Ethernet" static 1.1.1.1 primary
netsh interface ip add dns name="Ethernet" 1.0.0.1 index=2
netsh interface ip set dns name="Wi-Fi" static 1.1.1.1 primary
netsh interface ip add dns name="Wi-Fi" 1.0.0.1 index=2
ipconfig /flushdns
echo DNS da Cloudflare configurado com sucesso!
pause