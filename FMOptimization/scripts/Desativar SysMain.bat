@echo off
title Desativar SysMain (Superfetch)
color 0a
echo Desativando servico SysMain...
sc stop SysMain 2>nul
sc config SysMain start=disabled
echo SysMain desativado com sucesso!
pause