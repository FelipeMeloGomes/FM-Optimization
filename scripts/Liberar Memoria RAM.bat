@echo off
title Liberar Memoria RAM
color 0a
echo Liberando memoria RAM...
%windir%\system32\rundll32.exe advapi32.dll,ProcessIdleTasks
echo Memoria RAM liberada!
pause