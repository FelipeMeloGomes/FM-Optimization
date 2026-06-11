@echo off
title Bloquear Telemetria Microsoft
color 0a
echo Adicionando dominios de telemetria ao arquivo Hosts...
(
echo # Bloqueio de Telemetria Microsoft
echo 0.0.0.0 telemetry.microsoft.com
echo 0.0.0.0 telemetry.appex.bing.net
echo 0.0.0.0 telemetry.urs.microsoft.com
echo 0.0.0.0 vortex.data.microsoft.com
echo 0.0.0.0 vortex-win.data.microsoft.com
echo 0.0.0.0 settings-win.data.microsoft.com
echo 0.0.0.0 watson.telemetry.microsoft.com
echo 0.0.0.0 sqm.telemetry.microsoft.com
echo 0.0.0.0 oca.telemetry.microsoft.com
echo 0.0.0.0 choice.microsoft.com
echo 0.0.0.0 diagnostics.support.microsoft.com
echo 0.0.0.0 feedback.windows.com
echo 0.0.0.0 a-msedge.net
echo 0.0.0.0 ads1.msads.net
echo 0.0.0.0 ads1.msn.com
echo 0.0.0.0 bingads.microsoft.com
) >> %WINDIR%\System32\drivers\etc\hosts
echo Bloqueio de telemetria ativado!
pause