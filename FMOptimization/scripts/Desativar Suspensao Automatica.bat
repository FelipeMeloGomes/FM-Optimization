@echo off
title Desativar Suspensao Automatica
color 0a
echo Desativando suspensao automatica...
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0
powercfg /change hibernate-timeout-ac 0
powercfg /change hibernate-timeout-dc 0
echo Suspensao automatica desativada!
pause