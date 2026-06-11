@echo off
title Otimizar SSD
color 0a
echo Otimizando SSD...
defrag C: /O
winsat formal -ve
echo SSD otimizado com sucesso!
pause