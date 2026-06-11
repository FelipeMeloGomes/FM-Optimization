@echo off
title Encerrar Processos
color 0a
echo Encerrando processos desnecessarios...
taskkill /f /im OneDrive.exe 2>nul
taskkill /f /im YourPhone.exe 2>nul
taskkill /f /im XboxGameBar.exe 2>nul
taskkill /f /im XboxApp.exe 2>nul
taskkill /f /im GamingServices.exe 2>nul
echo Processos encerrados!
pause