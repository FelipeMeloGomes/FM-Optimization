@echo off
title Otimizar Timer do Sistema
color 0a
echo Otimizando resolucao do timer do sistema...
bcdedit /set useplatformclock true
bcdedit /set disabledynamictick yes
echo Timer do sistema otimizado! Reinicie para aplicar.
pause