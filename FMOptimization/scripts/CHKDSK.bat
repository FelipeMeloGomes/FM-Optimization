@echo off
title CHKDSK
color 0a
echo Agendando verificacao de disco C: na proxima reinicializacao...
chkdsk C: /f /r
echo Verificacao agendada! Reinicie para executar.
pause