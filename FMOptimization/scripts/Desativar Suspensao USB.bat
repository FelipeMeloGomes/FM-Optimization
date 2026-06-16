@echo off
title Desativar Suspensao Seletiva USB
color 0a
echo Desativando suspensao seletiva de USB...
powercfg -setacvalueindex SCHEME_CURRENT SUB_USB USBSELECTIVESUSPEND 0
powercfg -setdcvalueindex SCHEME_CURRENT SUB_USB USBSELECTIVESUSPEND 0
powercfg -setactive SCHEME_CURRENT
echo Suspensao USB desativada com sucesso!
pause