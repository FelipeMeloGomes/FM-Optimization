@echo off
title Limpar Cache DirectX Shader
color 0a
echo Limpando cache de shaders DirectX...
del /s /f /q "%appdata%\..\Local\D3DSCache\*" 2>nul
echo Cache de shaders DirectX limpo com sucesso!
pause