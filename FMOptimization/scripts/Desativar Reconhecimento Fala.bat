@echo off
title Desativar Reconhecimento de Fala
color 0a
echo Desativando reconhecimento de fala online...
reg add "HKCU\Software\Microsoft\Speech_OneCore\Settings\OnlineSpeechPrivacy" /v HasAccepted /t REG_DWORD /d 0 /f
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\microphone" /v Value /t REG_SZ /d Deny /f
echo Reconhecimento de fala desativado com sucesso!
pause