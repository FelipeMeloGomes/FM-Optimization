@echo off
title DISM /RestoreHealth
color 0a
echo Executando DISM /RestoreHealth...
DISM /Online /Cleanup-Image /RestoreHealth
echo Reparo da imagem concluido!
pause